import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Circle, Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import { getCaseById, updateCase } from "@/services/api";
import { CEDING_STAGES, STATUS_LABELS, STATUS_STYLES, RAG_STYLES, calculateRag } from "@/lib/caseHelpers";
import { useRole } from "@/hooks/useRole";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  StageCaseDetails,
  StageDocumentUpload,
  StageAIExtraction,
  StageMissingData,
  StageCallAssist,
  StageTranscript,
  StageAuditTrail,
  StageAssign,
  StageApproval,
  StageExport,
  StageComplete,
} from "@/components/case/stages";

const CaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { isCA } = useRole();

  const { data: caseItem, isLoading } = useQuery({
    queryKey: ["case", id],
    queryFn: () => getCaseById(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: ({ updates }: { updates: any }) => updateCase(id!, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case", id] });
      qc.invalidateQueries({ queryKey: ["cases"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!caseItem) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground mb-4">Case not found.</p>
        <Link to="/cases" className="text-teal hover:underline text-sm">
          ← Back to cases
        </Link>
      </div>
    );
  }

  const currentStage: number = (caseItem as any).current_stage ?? 1;
  const stagesCompleted: number[] = (caseItem as any).stages_completed ?? [];
  const rag = calculateRag(caseItem as any);

  const goToStage = (n: number) => {
    if (n < 1 || n > 11) return;
    updateMutation.mutate({ updates: { current_stage: n, last_activity_at: new Date().toISOString() } });
  };

  const completeAndNext = () => {
    const newCompleted = Array.from(new Set([...stagesCompleted, currentStage])).sort((a, b) => a - b);
    const next = Math.min(currentStage + 1, 11);
    const updates: any = {
      current_stage: next,
      stages_completed: newCompleted,
      last_activity_at: new Date().toISOString(),
    };
    // Stamp completion when crossing into Stage 11
    if (currentStage === 10 && next === 11) {
      updates.status = "complete";
      updates.ceding_complete_date = new Date().toISOString().slice(0, 10);
    }
    updateMutation.mutate({ updates });
    toast.success(`Stage ${currentStage} complete`, {
      description: next === 11 ? "Ceding complete!" : `Moved to step ${next}.`,
    });
  };

  const StageComponent = [
    StageCaseDetails,
    StageDocumentUpload,
    StageAIExtraction,
    StageMissingData,
    StageCallAssist,
    StageTranscript,
    StageAuditTrail,
    StageAssign,
    StageApproval,
    StageExport,
    StageComplete,
  ][currentStage - 1];

  return (
    <div className="animate-slide-in">
      <Link to="/cases" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to cases
      </Link>

      {/* Header — consolidated case details */}
      <div className="mb-6 rounded-lg border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className={`inline-block h-3 w-3 rounded-full ${RAG_STYLES[rag].dot}`} />
              <h1 className="text-2xl font-bold theme-heading text-foreground truncate">{caseItem.client_name}</h1>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${STATUS_STYLES[caseItem.status] ?? ""}`}>
                {STATUS_LABELS[caseItem.status] ?? caseItem.status}
              </span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                {caseItem.case_ref}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 text-xs mt-3">
              <HeaderField label="Provider" value={caseItem.provider_name} />
              <HeaderField label="Plan type" value={caseItem.plan_type} />
              <HeaderField label="Policy ref" value={caseItem.plan_number} mono />
              <HeaderField label="Owner" value={caseItem.owner_name ?? "—"} />
              <HeaderField label="Zoho task" value={(caseItem as any).zoho_task_id ?? "—"} mono />
              <HeaderField
                label="Created"
                value={new Date(caseItem.created_at).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              />
              <HeaderField label="Stage" value={`${currentStage} of 11`} />
              <HeaderField label="RAG" value={RAG_STYLES[rag].label} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px,1fr]">
        {/* Sidebar — Progress sub-navigation under Cases */}
        <aside>
          <div className="theme-card border border-border bg-card sticky top-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Progress</h3>
              <span className="text-[10px] text-muted-foreground">
                {stagesCompleted.length}/11
              </span>
            </div>
            <ol className="space-y-0.5">
              {CEDING_STAGES.map((s) => {
                const isDone = stagesCompleted.includes(s.num);
                const isCurrent = currentStage === s.num;
                return (
                  <li key={s.num}>
                    <button
                      onClick={() => goToStage(s.num)}
                      className={`flex w-full items-center gap-2 text-left text-xs px-2 py-1.5 rounded-md transition-colors ${
                        isCurrent ? "bg-teal/10 text-foreground font-semibold" : "hover:bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 text-border shrink-0" />
                      )}
                      <span className="flex-1 truncate">
                        {s.num}. {s.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </aside>

        {/* Stage content */}
        <main className="space-y-4">
          <StageComponent caseItem={caseItem as any} />

          {/* Stage navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => goToStage(currentStage - 1)}
              disabled={currentStage <= 1}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" /> Previous step
            </Button>
            <p className="text-xs text-muted-foreground">
              Step {currentStage} of 11 · {CEDING_STAGES[currentStage - 1].label}
            </p>
            {isCA && currentStage < 11 ? (
              <Button onClick={completeAndNext} className="gap-2">
                {currentStage === 10 ? "Mark ceding complete" : "Mark complete & continue"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => goToStage(currentStage + 1)}
                disabled={currentStage >= 11}
                className="gap-2"
              >
                Next step <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-muted-foreground shrink-0">{label}</dt>
      <dd className={`text-foreground text-right truncate ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}

export default CaseDetail;
