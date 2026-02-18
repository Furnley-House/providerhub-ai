import { useParams, Link } from "react-router-dom";
import { cases, cedingChecklist } from "@/data/seedData";
import { StatusChip, ConfidenceBadge, SectionHeader } from "@/components/shared/StatusComponents";
import { CheckCircle, Circle, Clock, Upload, Cpu, Mail, Phone, FileText, ArrowLeft } from "lucide-react";
import { useState } from "react";

const timelineSteps = (c: typeof cases[0]) => [
  { key: 'loa', label: 'LOA Sent', date: c.loaSentDate, done: true, icon: FileText },
  { key: 'proc', label: 'Processing Expected', date: c.processingExpected, done: ['loa_processed', 'waiting_pdf', 'pdf_received', 'ceding_in_progress', 'complete'].includes(c.status), icon: Clock },
  { key: 'pdf_exp', label: 'Policy Info Expected', date: c.pdfExpectedDate, done: !!c.pdfReceivedDate, icon: Clock },
  { key: 'pdf_recv', label: 'PDF Received', date: c.pdfReceivedDate, done: !!c.pdfReceivedDate, icon: Upload },
  { key: 'ai', label: 'AI Extraction', date: c.aiExtractionDate, done: !!c.aiExtractionDate, icon: Cpu },
  { key: 'ceding', label: 'Ceding Review & Submit', date: c.cedingCompleteDate, done: !!c.cedingCompleteDate, icon: CheckCircle },
];

const CaseDetail = () => {
  const { id } = useParams();
  const caseItem = cases.find(c => c.id === id);
  const [showEmailModal, setShowEmailModal] = useState(false);

  if (!caseItem) return <div className="p-8 text-center text-muted-foreground">Case not found</div>;

  const steps = timelineSteps(caseItem);
  const checklist = caseItem.id === 'CASE-001' ? cedingChecklist : [];
  const sections = [...new Set(checklist.map(f => f.section))];

  return (
    <div className="animate-slide-in">
      <Link to="/cases" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Cases
      </Link>

      <SectionHeader
        title={`${caseItem.clientName} — ${caseItem.provider}`}
        subtitle={`${caseItem.planType} · ${caseItem.planNumber}`}
        action={<StatusChip status={caseItem.status} />}
      />

      {/* Actions bar */}
      <div className="mb-8 flex flex-wrap gap-2">
        {[
          { label: 'Upload Policy PDF', icon: Upload },
          { label: 'Run AI Extraction', icon: Cpu },
          { label: 'Generate Chase Email', icon: Mail, onClick: () => setShowEmailModal(true) },
          { label: 'Generate Call Pack', icon: Phone },
          { label: 'Mark Complete', icon: CheckCircle },
        ].map(btn => (
          <button
            key={btn.label}
            onClick={btn.onClick}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <btn.icon className="h-4 w-4 text-primary" />
            {btn.label}
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Timeline */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-6 text-lg font-semibold text-foreground">Case Timeline</h2>
          <div className="space-y-0">
            {steps.map((step, i) => (
              <div key={step.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  {step.done ? (
                    <CheckCircle className="h-5 w-5 text-success shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-border shrink-0" />
                  )}
                  {i < steps.length - 1 && (
                    <div className={`w-px flex-1 min-h-[32px] ${step.done ? 'bg-success' : 'bg-border'}`} />
                  )}
                </div>
                <div className="pb-6">
                  <p className={`text-sm font-medium ${step.done ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</p>
                  <p className="text-xs text-muted-foreground">{step.date || 'Pending'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Checklist Preview or Case Info */}
        <div className="lg:col-span-2">
          {checklist.length > 0 ? (
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Ceding Checklist</h2>
                <Link to="/ceding" className="text-sm text-primary hover:underline">View full checklist →</Link>
              </div>
              <div className="mb-4 flex gap-4 text-xs text-muted-foreground">
                <span className="text-success font-semibold">{checklist.filter(f => f.status === 'complete').length} Complete</span>
                <span className="text-warning font-semibold">{checklist.filter(f => f.status === 'needs_review').length} Needs Review</span>
                <span className="text-overdue font-semibold">{checklist.filter(f => f.status === 'missing').length} Missing</span>
              </div>
              <div className="space-y-6 max-h-[500px] overflow-y-auto scrollbar-thin pr-2">
                {sections.map(section => (
                  <div key={section}>
                    <h3 className="mb-2 text-sm font-semibold text-foreground border-b border-border pb-1">{section}</h3>
                    <div className="space-y-1.5">
                      {checklist.filter(f => f.section === section).map(field => (
                        <div key={field.id} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/30">
                          <span className={`h-2 w-2 rounded-full shrink-0 ${field.status === 'complete' ? 'bg-success' : field.status === 'missing' ? 'bg-overdue' : 'bg-warning'}`} />
                          <span className="text-sm text-muted-foreground w-48 shrink-0">{field.label}</span>
                          <span className="text-sm text-foreground flex-1 truncate">{field.value || '—'}</span>
                          {field.confidence && <ConfidenceBadge level={field.confidence} />}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Case Details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ['Client', caseItem.clientName],
                  ['Provider', caseItem.provider],
                  ['Plan Number', caseItem.planNumber],
                  ['Plan Type', caseItem.planType],
                  ['Owner', caseItem.owner],
                  ['LOA Sent', caseItem.loaSentDate],
                  ['Current Value', caseItem.currentValue || 'Pending'],
                  ['Transfer Value', caseItem.transferValue || 'Pending'],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-medium text-foreground">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chase Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Chase Email — {caseItem.provider}</h3>
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-foreground whitespace-pre-line mb-4">
{`Dear ${caseItem.provider} Pensions Team,

Re: ${caseItem.clientName} — Plan ${caseItem.planNumber}

We wrote to you on ${caseItem.loaSentDate} enclosing a Letter of Authority for the above client.

We have not yet received the policy information requested. Could you please provide this at your earliest convenience, or confirm when we can expect to receive it?

If you require any further information from us, please do not hesitate to get in touch.

Kind regards,
Sarah Chen
CA Team — ProviderHub`}
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowEmailModal(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
              <button onClick={() => setShowEmailModal(false)} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Copy & Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseDetail;
