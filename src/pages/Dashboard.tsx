import { KPICard, SectionHeader } from "@/components/shared/StatusComponents";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Link } from "react-router-dom";
import { Clock, FileText, Phone, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCases, getTasks, getProviders } from "@/services/api";

const Dashboard = () => {
  const { data: cases = [], isLoading: casesLoading } = useQuery({ queryKey: ["cases"], queryFn: getCases });
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({ queryKey: ["tasks"], queryFn: () => getTasks() });
  const { data: providers = [] } = useQuery({ queryKey: ["providers"], queryFn: getProviders });

  const isLoading = casesLoading || tasksLoading;

  // KPIs from live data
  const loaWaiting = cases.filter(c => ['loa_sent', 'loa_processed'].includes(c.status)).length;
  const pendingTasks = tasks.filter(t => !t.completed).length;
  const chaseTasks = tasks.filter(t => t.type === 'chase' && !t.completed).length;
  const today = new Date().toISOString().split('T')[0];
  const pdfsToday = cases.filter(c => c.pdf_received_date === today).length;
  const cedingReady = cases.filter(c => c.status === 'ceding_in_progress').length;
  const overdueCount = cases.filter(c => c.is_overdue).length;

  // Provider pain data from live cases
  const providerCaseMap = new Map<string, { missingFields: number; count: number }>();
  cases.forEach(c => {
    const entry = providerCaseMap.get(c.provider_name) || { missingFields: 0, count: 0 };
    entry.missingFields += c.missing_fields_count ?? 0;
    entry.count += 1;
    providerCaseMap.set(c.provider_name, entry);
  });

  // Enrich with avg turnaround from providers table
  const providerPainData = Array.from(providerCaseMap.entries())
    .map(([name, data]) => {
      const prov = providers.find(p => p.name === name);
      return { provider: name, missingFields: data.missingFields, avgDays: prov?.avg_turnaround ?? 0 };
    })
    .sort((a, b) => b.missingFields - a.missingFields)
    .slice(0, 6);

  const chartColors = [
    'hsl(0, 72%, 51%)',
    'hsl(38, 92%, 50%)',
    'hsl(38, 82%, 55%)',
    'hsl(187, 50%, 50%)',
    'hsl(187, 70%, 38%)',
    'hsl(152, 60%, 40%)',
  ];

  const pendingTasksList = tasks.filter(t => !t.completed).slice(0, 8);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-in">
      <SectionHeader title="Dashboard" subtitle={`${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} — ${cases.length} active cases`} />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KPICard title="LOA Waiting" value={loaWaiting} subtitle="In pipeline" />
        <KPICard title="Due for Chase" value={chaseTasks} subtitle="Pending chases" accent="overdue" />
        <KPICard title="Overdue Cases" value={overdueCount} subtitle="Need attention" accent={overdueCount > 0 ? "overdue" : undefined} />
        <KPICard title="Ceding Ready" value={cedingReady} subtitle="In progress" accent="warning" />
        <KPICard title="Tasks Pending" value={pendingTasks} subtitle="Across all cases" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Provider Pain Leaderboard */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Provider Pain Leaderboard</h2>
          <p className="mb-4 text-xs text-muted-foreground">Missing fields by provider (from live cases)</p>
          {providerPainData.length > 0 ? (
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
                    <Cell key={i} fill={chartColors[i % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">No case data yet — create cases to see provider insights</p>
          )}
        </div>

        {/* Today's Work Queue */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Today's Work Queue</h2>
          {pendingTasksList.length > 0 ? (
            <div className="space-y-3">
              {pendingTasksList.map(task => {
                const Icon = task.type === 'chase' ? AlertTriangle : task.type === 'call' ? Phone : task.type === 'upload' ? FileText : CheckCircle;
                const iconColor = task.type === 'chase' ? 'text-overdue' : task.type === 'call' ? 'text-primary' : task.type === 'upload' ? 'text-info' : 'text-success';
                return (
                  <Link
                    key={task.id}
                    to={`/cases/${task.case_id}`}
                    className="flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                  >
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconColor}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{task.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{task.client_name} · {task.provider_name}</p>
                    </div>
                    {task.due_date && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {task.due_date}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">No pending tasks — all caught up! 🎉</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
