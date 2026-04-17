import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Briefcase,
  Sparkles,
  Database,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { getCases } from "@/services/api";
import { useRole } from "@/hooks/useRole";
import { calculateRag, RAG_STYLES, STATUS_LABELS, STATUS_STYLES } from "@/lib/caseHelpers";
import { seedDemoData } from "@/lib/seedDemoData";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { userName, role } = useRole();

  const { data: cases = [], isLoading } = useQuery({ queryKey: ["cases"], queryFn: getCases });

  const seedMutation = useMutation({
    mutationFn: seedDemoData,
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["cases"] });
      toast.success(r.inserted > 0 ? `Loaded ${r.inserted} demo cases` : "Demo cases already loaded");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  const weeklyCompleted = cases.filter(
    (c) => c.status === "complete" && new Date(c.updated_at) >= monday,
  ).length;
  const inReview = cases.filter((c) => c.status === "in_review").length;
  const onHold = cases.filter((c) => c.status === "on_hold").length;
  const active = cases.filter((c) => !["complete", "approved"].includes(c.status)).length;

  const recent = [...cases]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 6);

  return (
    <div className="animate-slide-in">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-teal font-semibold mb-1">
            {today.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="text-2xl font-bold theme-heading text-foreground">Welcome back, {userName?.split(" ")[0]}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here's what's happening across your ceding cases today.
          </p>
        </div>
        {cases.length === 0 && (
          <Button onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending} className="gap-2">
            <Database className="h-4 w-4" />
            {seedMutation.isPending ? "Loading…" : "Load Demo Data"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <KPICard icon={Briefcase} label="Active cases" value={active} sub={`${cases.length} total`} accent="primary" />
        <KPICard icon={CheckCircle2} label="Completed this week" value={weeklyCompleted} sub="Primary KPI" accent="success" />
        <KPICard icon={Clock} label="In review" value={inReview} sub="Awaiting approval" accent="warning" />
        <KPICard icon={AlertTriangle} label="On hold" value={onHold} sub="Need attention" accent={onHold > 0 ? "overdue" : "muted"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 theme-card theme-card-accent border border-border bg-card overflow-hidden p-0">
          <div className="border-b border-border bg-muted/30 px-5 py-3 flex items-center justify-between">
            <h2 className="text-sm theme-heading text-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-teal" /> Recent Activity
            </h2>
            <button
              onClick={() => navigate("/cases")}
              className="text-xs text-teal hover:underline flex items-center gap-1 font-semibold"
            >
              View all cases <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-sm text-muted-foreground">Loading…</div>
          ) : recent.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <Briefcase className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground">No ceding cases yet</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Click "Load Demo Data" above to populate sample cases.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recent.map((c) => {
                const rag = calculateRag(c);
                const ragStyle = RAG_STYLES[rag];
                const statusStyle = STATUS_STYLES[c.status] ?? "bg-muted text-muted-foreground";
                return (
                  <button
                    key={c.id}
                    onClick={() => navigate(`/cases/${c.id}`)}
                    className="flex w-full items-center gap-4 px-5 py-3 hover:bg-muted/50 transition-colors text-left"
                  >
                    <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${ragStyle.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{c.client_name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {c.provider_name} · {c.plan_type} · {c.plan_number}
                      </p>
                    </div>
                    <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${statusStyle}`}>
                      {STATUS_LABELS[c.status] ?? c.status}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="theme-card theme-card-accent border border-border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-teal" />
              <h3 className="text-sm theme-heading">Your role</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-2">You're signed in as <strong className="text-foreground">{userName}</strong>.</p>
            <p className="text-xs text-muted-foreground">
              {role === "ca_team" && "You can upload documents, edit checklists, and run AI extraction across all cases."}
              {role === "adviser" && "You can review approved checklists and finalise case recommendations."}
              {role === "paraplanner" && "You can review extracted data and approve or request review on each field."}
              {role === "admin" && "You have full access to the Admin Panel, Provider Directory, and templates."}
            </p>
          </div>

          <div className="theme-card theme-card-accent border border-border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-teal" />
              <h3 className="text-sm theme-heading">Quick start</h3>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => navigate("/cases")}
                className="w-full text-left text-xs px-3 py-2 rounded-md border border-border hover:bg-muted transition-colors"
              >
                + Create a new case
              </button>
              <button
                onClick={() => navigate("/providers")}
                className="w-full text-left text-xs px-3 py-2 rounded-md border border-border hover:bg-muted transition-colors"
              >
                Browse Provider Directory
              </button>
              {cases.length === 0 && (
                <button
                  onClick={() => seedMutation.mutate()}
                  className="w-full text-left text-xs px-3 py-2 rounded-md border border-border hover:bg-muted transition-colors"
                >
                  Load 5 demo cases
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function KPICard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  sub: string;
  accent: "primary" | "success" | "warning" | "overdue" | "muted";
}) {
  const iconBg =
    accent === "primary"
      ? "bg-teal/15 text-teal"
      : accent === "success"
      ? "bg-success/15 text-success"
      : accent === "warning"
      ? "bg-warning/15 text-warning"
      : accent === "overdue"
      ? "bg-overdue/15 text-overdue"
      : "bg-muted text-muted-foreground";

  return (
    <div className="kpi-card theme-card border border-border bg-card">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-md ${iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground theme-heading leading-none">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{label}</p>
        </div>
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}

export default Dashboard;
