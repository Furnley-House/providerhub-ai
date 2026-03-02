import { SectionHeader } from "@/components/shared/StatusComponents";
import { Link } from "react-router-dom";
import {
  Clock, FileText, Phone, AlertTriangle, CheckCircle, Loader2,
  ArrowRight, Briefcase, BarChart3, Zap, FolderOpen, Users
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCases, getTasks } from "@/services/api";

const Dashboard = () => {
  const { data: cases = [], isLoading: casesLoading } = useQuery({ queryKey: ["cases"], queryFn: getCases });
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({ queryKey: ["tasks"], queryFn: () => getTasks() });

  const isLoading = casesLoading || tasksLoading;

  const totalCases = cases.length;
  const activeCases = cases.filter(c => c.status !== 'complete').length;
  const completedCases = cases.filter(c => c.status === 'complete').length;
  const overdueCount = cases.filter(c => c.is_overdue).length;
  const pendingTasks = tasks.filter(t => !t.completed).length;

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

  const recentCases = cases.slice(0, 5);

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
      <div className="theme-card theme-card-accent border border-border bg-card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h2 className="text-sm theme-heading text-foreground">Pipeline Overview</h2>
        </div>
        <div className="flex gap-1">
          {stageCounts.map((stage, i) => {
            const width = totalCases > 0 ? Math.max((stage.count / totalCases) * 100, stage.count > 0 ? 8 : 2) : 100 / stageCounts.length;
            return (
              <div key={stage.key} className="flex-1 min-w-0" style={{ flex: `${width} 1 0%` }}>
                <div className={`pipeline-bar h-2 ${stage.color} ${i === 0 ? 'rounded-l-full' : ''} ${i === stageCounts.length - 1 ? 'rounded-r-full' : ''}`} />
                <p className="mt-2 text-xs font-medium text-foreground text-center">{stage.count}</p>
                <p className="text-[10px] text-muted-foreground text-center truncate">{stage.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Cases */}
        <div className="lg:col-span-2 theme-card theme-card-accent border border-border bg-card overflow-hidden p-0">
          <div className="border-b border-border bg-muted/30 px-5 py-3 flex items-center justify-between">
            <h2 className="text-sm theme-heading text-foreground flex items-center gap-2">
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
          <div className="theme-card theme-card-accent border border-border bg-card overflow-hidden p-0">
            <div className="border-b border-border bg-muted/30 px-5 py-3">
              <h2 className="text-sm theme-heading text-foreground flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" /> Quick Actions
              </h2>
            </div>
            <div className="p-3 space-y-1">
              {quickActions.map(a => (
                <Link
                  key={a.to}
                  to={a.to}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors theme-sidebar-item"
                >
                  <div className="flex h-8 w-8 items-center justify-center bg-primary/10 theme-btn" style={{ borderRadius: 'var(--btn-radius)' }}>
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
    <div className="kpi-card theme-card border border-border bg-card">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center ${iconBg}`} style={{ borderRadius: 'var(--btn-radius)' }}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground theme-heading">{value}</p>
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
    <span
      className={`theme-badge inline-flex items-center px-2 py-0.5 text-[10px] font-semibold ${styles[status] || 'bg-muted text-muted-foreground'}`}
      style={{ borderRadius: 'var(--badge-radius)' }}
    >
      {labels[status] || status}
    </span>
  );
}

export default Dashboard;
