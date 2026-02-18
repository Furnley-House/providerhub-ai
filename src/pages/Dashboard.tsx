import { KPICard, SectionHeader } from "@/components/shared/StatusComponents";
import { cases, tasks, providerPainData } from "@/data/seedData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Link } from "react-router-dom";
import { Clock, FileText, Phone, AlertTriangle, CheckCircle } from "lucide-react";

const Dashboard = () => {
  const loaWaiting = cases.filter(c => ['loa_sent', 'loa_processed'].includes(c.status)).length;
  const chaseToday = tasks.filter(t => t.type === 'chase' && !t.completed).length;
  const pdfsToday = cases.filter(c => c.pdfReceivedDate === '2026-02-06').length;
  const cedingReady = cases.filter(c => c.status === 'ceding_in_progress').length;
  const pendingTasks = tasks.filter(t => !t.completed).length;

  const chartColors = [
    'hsl(0, 72%, 51%)',
    'hsl(38, 92%, 50%)',
    'hsl(38, 82%, 55%)',
    'hsl(187, 50%, 50%)',
    'hsl(187, 70%, 38%)',
    'hsl(152, 60%, 40%)',
  ];

  return (
    <div className="space-y-8 animate-slide-in">
      <SectionHeader title="Dashboard" subtitle="Tuesday, 18 February 2026 — Good morning, Sarah" />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KPICard title="LOA Waiting" value={loaWaiting} subtitle="Cases in pipeline" />
        <KPICard title="Due for Chase" value={chaseToday} subtitle="Overdue today" accent="overdue" />
        <KPICard title="PDFs Received" value={pdfsToday} subtitle="Today" accent="success" />
        <KPICard title="Ceding Ready" value={cedingReady} subtitle="In progress" accent="warning" />
        <KPICard title="Tasks Pending" value={pendingTasks} subtitle="Across all cases" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Provider Pain Leaderboard */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Provider Pain Leaderboard</h2>
          <p className="mb-4 text-xs text-muted-foreground">Missing fields & avg turnaround days</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={providerPainData} layout="vertical" margin={{ left: 0 }}>
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="provider" tick={{ fontSize: 12 }} width={100} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(214, 20%, 90%)', fontSize: '12px' }}
                formatter={(value: number, name: string) => [value, name === 'missingFields' ? 'Missing Fields' : 'Avg Days']}
              />
              <Bar dataKey="missingFields" radius={[0, 4, 4, 0]} barSize={18}>
                {providerPainData.map((_, i) => (
                  <Cell key={i} fill={chartColors[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Today's Work Queue */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Today's Work Queue</h2>
          <div className="space-y-3">
            {tasks.filter(t => !t.completed).map(task => {
              const Icon = task.type === 'chase' ? AlertTriangle : task.type === 'call' ? Phone : task.type === 'upload' ? FileText : CheckCircle;
              const iconColor = task.type === 'chase' ? 'text-overdue' : task.type === 'call' ? 'text-primary' : task.type === 'upload' ? 'text-info' : 'text-success';
              return (
                <Link
                  key={task.id}
                  to={`/cases/${task.caseId}`}
                  className="flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconColor}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{task.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{task.clientName} · {task.provider}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {task.dueDate}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
