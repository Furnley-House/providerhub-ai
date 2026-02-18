import { SectionHeader } from "@/components/shared/StatusComponents";
import { Link } from "react-router-dom";
import {
  Clock, FileText, Phone, AlertTriangle, CheckCircle, Loader2,
  ArrowRight, Briefcase, BarChart3, Users, Zap, FolderOpen
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCases, getTasks, getProviders } from "@/services/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const Dashboard = () => {
  const { data: cases = [], isLoading: casesLoading } = useQuery({ queryKey: ["cases"], queryFn: getCases });
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({ queryKey: ["tasks"], queryFn: () => getTasks() });
  const { data: providers = [] } = useQuery({ queryKey: ["providers"], queryFn: getProviders });

  const isLoading = casesLoading || tasksLoading;

  // KPI calculations
  const totalCases = cases.length;
  const activeCases = cases.filter(c => c.status !== 'complete').length;
  const completedCases = cases.filter(c => c.status === 'complete').length;
  const overdueCount = cases.filter(c => c.is_overdue).length;
  const pendingTasks = tasks.filter(t => !t.completed).length;

  // Pipeline stages
  const pipelineStages = [
    { key: 'loa_sent', label: 'LOA Sent', color: 'bg-info' },
    { key: 'loa_processed', label: 'LOA Processed', color: 'bg-info' },
    { key: 'waiting_pdf', label: 'Waiting PDF', color: 'bg-warning' },
    { key: 'pdf_received', label: 'PDF Received', color: 'bg-primary' },
    { key: 'ceding_in_progress', label: 'Ceding', color: 'bg-primary' },
    { key: 'complete', label: 'Complete', color: 'bg-success' },
  ];

  const stageCounts = pipelineStages.map(s => ({
    ...s,
    count: cases.filter(c => c.status === s.key).length,
  }));

  // Provider pain data
  const providerCaseMap = new Map<string, number>();
  cases.forEach(c => {
    providerCaseMap.set(c.provider_name, (providerCaseMap.get(c.provider_name) || 0) + (c.missing_fields_count ?? 0));
  });
  const providerPainData = Array.from(providerCaseMap.entries())
    .map(([provider, missingFields]) => ({ provider, missingFields }))
    .sort((a, b) => b.missingFields - a.missingFields)
    .slice(0, 6);

  const chartColors = [
    'hsl(0, 72%, 51%)', 'hsl(38, 92%, 50%)', 'hsl(38, 82%, 55%)',
    'hsl(187, 50%, 50%)', 'hsl(187, 70%, 38%)', 'hsl(152, 60%, 40%)',
  ];

  // Recent cases (last 5)
  const recentCases = cases.slice(0, 5);
  const pendingTasksList = tasks.filter(t => !t.completed).slice(0, 6);

  // Quick actions
  const quickActions = [
    { label: 'New Case', icon: FolderOpen, to: '/cases', description: 'Start a new LOA case' },
    { label: 'Document Inbox', icon: FileText, to: '/documents', description: 'Process uploaded PDFs' },
    { label: 'Call Assist', icon: Phone, to: '/call-assist', description: 'Log & analyze calls' },
    { label: 'Provider Directory', icon: Users, to: '/providers', description: 'Manage provider info' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="animate-slide-in">
      <SectionHeader
        title="Dashboard"
        subtitle={new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <KPICard icon={Briefcase} label="Active Cases" value={activeCases} sub={`${totalCases} total`} accent="primary" />
        <KPICard icon={CheckCircle} label="Completed" value={completedCases} sub="Cases closed" accent="success" />
        <KPICard icon={AlertTriangle} label="Overdue" value={overdueCount} sub="Need attention" accent={overdueCount > 0 ? "overdue" : "muted"} />
        <KPICard icon={Clock} label="Pending Tasks" value={pendingTasks} sub="Across all cases" accent="warning" />
      </div>

      {/* Pipeline Overview */}
      <div className="rounded-xl border border-border bg-card p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Pipeline Overview</h2>
        </div>
        <div className="flex gap-1">
          {stageCounts.map((stage, i) => {
            const width = totalCases > 0 ? Math.max((stage.count / totalCases) * 100, stage.count > 0 ? 8 : 2) : 100 / stageCounts.length;
            return (
              <div key={stage.key} className="flex-1 min-w-0" style={{ flex: `${width} 1 0%` }}>
                <div className={`h-2 ${stage.color} ${i === 0 ? 'rounded-l-full' : ''} ${i === stageCounts.length - 1 ? 'rounded-r-full' : ''}`} />
                <p className="mt-2 text-xs font-medium text-foreground text-center">{stage.count}</p>
                <p className="text-[10px] text-muted-foreground text-center truncate">{stage.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Cases */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-5 py-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" /> Recent Cases
            </h2>
            <Link to="/cases" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentCases.length > 0 ? (
            <div className="divide-y divide-border">
              {recentCases.map(c => (
                <Link
                  key={c.id}
                  to={`/cases/${c.id}`}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {c.is_overdue && <AlertTriangle className="h-3.5 w-3.5 text-overdue shrink-0" />}
                      <p className="text-sm font-medium text-foreground truncate">{c.client_name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.provider_name} · {c.plan_number}</p>
                  </div>
                  <StatusPill status={c.status} />
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-5 py-12 text-center">
              <Briefcase className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No cases yet</p>
              <p className="text-xs text-muted-foreground mt-1">Create your first case from the Cases page</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border bg-muted/30 px-5 py-3">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" /> Quick Actions
              </h2>
            </div>
            <div className="p-3 space-y-1">
              {quickActions.map(a => (
                <Link
                  key={a.to}
                  to={a.to}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <a.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{a.label}</p>
                    <p className="text-[11px] text-muted-foreground">{a.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        {/* Work Queue */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-5 py-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Work Queue
            </h2>
            {pendingTasksList.length > 0 && (
              <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning">{pendingTasks} pending</span>
            )}
          </div>
          {pendingTasksList.length > 0 ? (
            <div className="divide-y divide-border">
              {pendingTasksList.map(task => {
                const Icon = task.type === 'chase' ? AlertTriangle : task.type === 'call' ? Phone : task.type === 'upload' ? FileText : CheckCircle;
                const iconColor = task.type === 'chase' ? 'text-overdue' : task.type === 'call' ? 'text-primary' : task.type === 'upload' ? 'text-info' : 'text-success';
                return (
                  <Link
                    key={task.id}
                    to={`/cases/${task.case_id}`}
                    className="flex items-start gap-3 px-5 py-3 hover:bg-muted/50 transition-colors"
                  >
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconColor}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{task.client_name} · {task.provider_name}</p>
                    </div>
                    {task.due_date && (
                      <span className="text-xs text-muted-foreground shrink-0">{task.due_date}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="px-5 py-12 text-center">
              <CheckCircle className="mx-auto mb-3 h-8 w-8 text-success/40" />
              <p className="text-sm text-muted-foreground">All caught up!</p>
              <p className="text-xs text-muted-foreground mt-1">No pending tasks right now</p>
            </div>
          )}
        </div>

        {/* Provider Insights */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Provider Insights
            </h2>
          </div>
          {providerPainData.length > 0 ? (
            <div className="p-5">
              <p className="text-xs text-muted-foreground mb-3">Missing fields by provider</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={providerPainData} layout="vertical" margin={{ left: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="provider" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(214, 20%, 90%)', fontSize: '12px' }}
                    formatter={(value: number) => [value, 'Missing Fields']}
                  />
                  <Bar dataKey="missingFields" radius={[0, 4, 4, 0]} barSize={16}>
                    {providerPainData.map((_, i) => (
                      <Cell key={i} fill={chartColors[i % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="px-5 py-12 text-center">
              <BarChart3 className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No provider data yet</p>
              <p className="text-xs text-muted-foreground mt-1">Insights appear as cases are processed</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Sub-components ────────────────────────────────

function KPICard({ icon: Icon, label, value, sub, accent }: {
  icon: React.ElementType; label: string; value: number; sub: string;
  accent: 'primary' | 'success' | 'warning' | 'overdue' | 'muted';
}) {
  const iconBg = accent === 'primary' ? 'bg-primary/10 text-primary'
    : accent === 'success' ? 'bg-success/10 text-success'
    : accent === 'warning' ? 'bg-warning/10 text-warning'
    : accent === 'overdue' ? 'bg-overdue/10 text-overdue'
    : 'bg-muted text-muted-foreground';

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    loa_sent: 'bg-info/15 text-info',
    loa_processed: 'bg-info/15 text-info',
    waiting_pdf: 'bg-warning/15 text-warning',
    pdf_received: 'bg-primary/15 text-primary',
    ceding_in_progress: 'bg-primary/15 text-primary',
    complete: 'bg-success/15 text-success',
  };
  const labels: Record<string, string> = {
    loa_sent: 'LOA Sent', loa_processed: 'LOA Processed', waiting_pdf: 'Waiting PDF',
    pdf_received: 'PDF Received', ceding_in_progress: 'Ceding', complete: 'Complete',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${styles[status] || 'bg-muted text-muted-foreground'}`}>
      {labels[status] || status}
    </span>
  );
}

export default Dashboard;
