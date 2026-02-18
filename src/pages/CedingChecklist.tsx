import { cedingChecklist } from "@/data/seedData";
import { ConfidenceBadge, EvidenceBadge, FieldStatusIcon, SectionHeader } from "@/components/shared/StatusComponents";
import { useState } from "react";
import { MessageSquare, Check, RotateCcw } from "lucide-react";

const CedingChecklist = () => {
  const [mode, setMode] = useState<'edit' | 'review'>('edit');
  const sections = [...new Set(cedingChecklist.map(f => f.section))];

  const complete = cedingChecklist.filter(f => f.status === 'complete').length;
  const total = cedingChecklist.length;
  const pct = Math.round((complete / total) * 100);

  return (
    <div className="animate-slide-in">
      <SectionHeader
        title="Ceding Checklist"
        subtitle="Rita Wright — Aviva TK12097279 · Personal Pension"
        action={
          <div className="flex gap-2">
            <button
              onClick={() => setMode('edit')}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${mode === 'edit' ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:bg-muted'}`}
            >
              Edit Mode
            </button>
            <button
              onClick={() => setMode('review')}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${mode === 'review' ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:bg-muted'}`}
            >
              Adviser Review
            </button>
          </div>
        }
      />

      {/* Progress */}
      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Completion: {complete}/{total} fields</span>
          <span className="text-sm font-semibold text-primary">{pct}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2 flex gap-6 text-xs text-muted-foreground">
          <span><span className="inline-block h-2 w-2 rounded-full bg-success mr-1" />{cedingChecklist.filter(f => f.status === 'complete').length} Complete</span>
          <span><span className="inline-block h-2 w-2 rounded-full bg-warning mr-1" />{cedingChecklist.filter(f => f.status === 'needs_review').length} Needs Review</span>
          <span><span className="inline-block h-2 w-2 rounded-full bg-overdue mr-1" />{cedingChecklist.filter(f => f.status === 'missing').length} Missing</span>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {sections.map(section => (
          <div key={section} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border bg-muted/30 px-5 py-3">
              <h2 className="text-sm font-semibold text-foreground">{section}</h2>
            </div>
            <div className="divide-y divide-border">
              {cedingChecklist.filter(f => f.section === section).map(field => (
                <div key={field.id} className="flex items-start gap-4 px-5 py-3 hover:bg-muted/20 transition-colors">
                  <FieldStatusIcon status={field.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{field.label}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{field.value || <span className="italic text-overdue">Missing — requires provider contact</span>}</p>
                    {field.evidenceRef && <p className="text-xs text-muted-foreground mt-1">📄 {field.evidenceRef}</p>}
                    {field.notes && <p className="text-xs text-warning mt-1">⚠ {field.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {field.confidence && <ConfidenceBadge level={field.confidence} />}
                    {field.evidenceSource && <EvidenceBadge source={field.evidenceSource} />}
                  </div>
                  {mode === 'review' && field.status !== 'missing' && (
                    <div className="flex gap-1 shrink-0">
                      <button className="rounded p-1 text-success hover:bg-success/10 transition-colors" title="Approve">
                        <Check className="h-4 w-4" />
                      </button>
                      <button className="rounded p-1 text-warning hover:bg-warning/10 transition-colors" title="Request follow-up">
                        <RotateCcw className="h-4 w-4" />
                      </button>
                      <button className="rounded p-1 text-muted-foreground hover:bg-muted transition-colors" title="Comment">
                        <MessageSquare className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CedingChecklist;
