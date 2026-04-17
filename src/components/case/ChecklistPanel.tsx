import { useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle, CircleDashed, ListChecks, ThumbsUp, RotateCcw } from "lucide-react";
import { ChecklistField, type ChecklistFieldState, type Confidence, type FieldStatus } from "./ChecklistField";
import { getTemplate, groupBySection, type ChecklistFieldDef } from "@/lib/checklistTemplates";
import { useRole } from "@/hooks/useRole";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  planType: string;
  caseId: string;
}

/**
 * Generates per-case demo state for the checklist. In Phase 3 this will be
 * replaced with values pulled from the `checklist_fields` Supabase table,
 * populated by the AI extraction edge function.
 */
function seedFieldStates(template: ChecklistFieldDef[], caseId: string): Record<string, ChecklistFieldState> {
  // Deterministic pseudo-random based on caseId char sum so each case looks consistent
  const seed = Array.from(caseId).reduce((a, c) => a + c.charCodeAt(0), 0);
  const out: Record<string, ChecklistFieldState> = {};
  template.forEach((f, i) => {
    const r = (seed + i * 17) % 10;
    let confidence: Confidence;
    let value: string | null;
    if (r < 5) {
      confidence = "HIGH";
      value = sampleValue(f);
    } else if (r < 7) {
      confidence = "MEDIUM";
      value = sampleValue(f);
    } else if (r < 8) {
      confidence = "LOW";
      value = sampleValue(f);
    } else {
      confidence = "MISSING";
      value = null;
    }
    out[f.key] = {
      key: f.key,
      value,
      confidence,
      status: confidence === "MISSING" ? "missing" : "pending",
      evidenceSource: value ? `PDF: provider-pack.pdf, Page ${1 + (r % 6)}, Section: ${f.section}` : null,
    };
  });
  return out;
}

function sampleValue(f: ChecklistFieldDef): string {
  switch (f.type) {
    case "currency":
      return `£${(Math.random() * 100000 + 5000).toFixed(2)}`;
    case "percent":
      return `${(Math.random() * 2).toFixed(2)}%`;
    case "yesno":
      return Math.random() > 0.5 ? "Yes" : "No";
    case "number":
      return String(Math.floor(Math.random() * 100));
    case "date":
      return "2030-04-06";
    case "select":
      return f.options?.[0] ?? "";
    default:
      return "Sample value";
  }
}

export function ChecklistPanel({ planType, caseId }: Props) {
  const template = useMemo(() => getTemplate(planType), [planType]);
  const { canEditChecklist, canApprove, isCA, isAdmin, isAdviser, isParaplanner } = useRole();

  const [states, setStates] = useState<Record<string, ChecklistFieldState>>(() =>
    seedFieldStates(template, caseId),
  );

  const visibleFields = useMemo(
    () =>
      template.filter((f) => {
        if (!f.showIf) return true;
        const dependent = states[f.showIf.key]?.value;
        return dependent ? f.showIf.in.includes(dependent) : false;
      }),
    [template, states],
  );

  const grouped = useMemo(() => groupBySection(visibleFields), [visibleFields]);

  const stats = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0, missing: 0, approved: 0, review: 0 };
    visibleFields.forEach((f) => {
      const s = states[f.key];
      if (!s) return;
      if (s.confidence === "HIGH") counts.high++;
      else if (s.confidence === "MEDIUM") counts.medium++;
      else if (s.confidence === "LOW") counts.low++;
      else counts.missing++;
      if (s.status === "approved") counts.approved++;
      if (s.status === "review_requested") counts.review++;
    });
    const total = visibleFields.length;
    const completion = total === 0 ? 0 : Math.round(((total - counts.missing) / total) * 100);
    return { ...counts, total, completion };
  }, [visibleFields, states]);

  const updateField = (key: string, patch: Partial<ChecklistFieldState>) => {
    setStates((s) => ({ ...s, [key]: { ...s[key], ...patch } }));
  };

  const approveAll = () => {
    setStates((s) => {
      const next = { ...s };
      visibleFields.forEach((f) => {
        if (next[f.key].confidence !== "MISSING") {
          next[f.key] = { ...next[f.key], status: "approved" };
        }
      });
      return next;
    });
    toast.success("All filled fields approved", {
      description: "Missing fields skipped — please send those back to CA Team if needed.",
    });
  };

  const markReadyForReview = () => {
    if (stats.missing > 0) {
      toast.error("Cannot mark Ready for Review", {
        description: `${stats.missing} field${stats.missing === 1 ? "" : "s"} still missing.`,
      });
      return;
    }
    toast.success("Case marked Ready for Review", {
      description: "Move to Step 8 to assign a paraplanner.",
    });
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="rounded-md border border-border bg-muted/30 p-4">
        <div className="flex items-center justify-between gap-4 mb-3">
          <h3 className="text-sm font-bold theme-heading text-foreground flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-teal" />
            {planType} checklist · {stats.total} fields
          </h3>
          <span className="text-xs font-semibold text-foreground">{stats.completion}% complete</span>
        </div>
        <div className="h-1.5 bg-background rounded overflow-hidden mb-3">
          <div
            className="h-full bg-teal transition-all"
            style={{ width: `${stats.completion}%` }}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <SummaryChip icon={CheckCircle2} count={stats.high} label="High confidence" colour="success" />
          <SummaryChip icon={AlertTriangle} count={stats.medium + stats.low} label="Needs review" colour="warning" />
          <SummaryChip icon={CircleDashed} count={stats.missing} label="Missing" colour="overdue" />
          <SummaryChip icon={ThumbsUp} count={stats.approved} label="Approved" colour="teal" />
        </div>
      </div>

      {/* Reviewer toolbar */}
      {canApprove && (
        <div className="flex items-center justify-between rounded-md border border-border bg-card p-3">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">{isAdviser ? "Adviser" : "Paraplanner"} review:</strong> approve each field, request review, or add comments.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={approveAll} className="gap-1">
              <ThumbsUp className="h-3.5 w-3.5" /> Approve all filled
            </Button>
          </div>
        </div>
      )}

      {/* CA toolbar */}
      {canEditChecklist && !canApprove && (
        <div className="flex items-center justify-between rounded-md border border-border bg-card p-3">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">CA Team:</strong> edit any field — changes auto-save and are audit-logged.
          </p>
          <Button size="sm" onClick={markReadyForReview} disabled={stats.missing > 0} className="gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Mark Ready for Review
          </Button>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-4">
        {grouped.map(({ section, fields }) => (
          <div key={section} className="rounded-md border border-border bg-card">
            <div className="px-4 py-2 border-b border-border bg-muted/30">
              <h4 className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">{section}</h4>
            </div>
            <div className="p-3 grid gap-2 md:grid-cols-2">
              {fields.map((f) => (
                <ChecklistField
                  key={f.key}
                  def={f}
                  state={states[f.key]}
                  onChange={(patch) => updateField(f.key, patch)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground text-center pt-2">
        Demo data shown. Phase 3 will populate this checklist from the AI extraction pipeline and persist to the database.
      </p>
    </div>
  );
}

function SummaryChip({
  icon: Icon,
  count,
  label,
  colour,
}: {
  icon: React.ElementType;
  count: number;
  label: string;
  colour: "success" | "warning" | "overdue" | "teal";
}) {
  const styles: Record<string, string> = {
    success: "bg-success/10 text-success border-success/30",
    warning: "bg-warning/10 text-warning border-warning/30",
    overdue: "bg-overdue/10 text-overdue border-overdue/30",
    teal: "bg-teal/10 text-teal border-teal/30",
  };
  return (
    <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded border ${styles[colour]}`}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <div className="leading-tight">
        <p className="font-bold text-sm text-foreground">{count}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
