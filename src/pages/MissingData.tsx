import { cedingChecklist, providers } from "@/data/seedData";
import { SectionHeader } from "@/components/shared/StatusComponents";
import { AlertCircle, Phone, Mail, CheckCircle, Upload } from "lucide-react";

const MissingData = () => {
  const missingFields = cedingChecklist.filter(f => f.status === 'missing');
  const reviewFields = cedingChecklist.filter(f => f.status === 'needs_review');
  const provider = providers.find(p => p.name === 'Aviva')!;

  const scripts: Record<string, string> = {
    'Provider Telephone & Email': "Hello, I'm calling from [Company]. We hold an LOA for your client Rita Wright, plan TK12097279. Could you please confirm the best contact telephone number and email address for future correspondence regarding this plan?",
    '% Crystallised': "Could you confirm whether any benefits have been crystallised on plan TK12097279 for Rita Wright? If so, what percentage of the fund is currently crystallised?",
    'Drawdown Available': "Is flexi-access drawdown available on plan TK12097279 for Rita Wright? If not, is there an internal transfer route to a product that offers drawdown?",
  };

  return (
    <div className="animate-slide-in">
      <SectionHeader
        title="Missing Data Resolution"
        subtitle="Rita Wright — Aviva TK12097279 · 3 missing fields, 2 need review"
      />

      {/* Missing Fields */}
      <div className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-overdue">
          <AlertCircle className="h-4 w-4" /> Missing Fields ({missingFields.length})
        </h2>
        <div className="space-y-4">
          {missingFields.map(field => {
            const routing = provider.routingRules.find(r => 'TK12097279'.startsWith(r.planPrefix));
            return (
              <div key={field.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{field.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{field.section}</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-overdue/15 px-2.5 py-0.5 text-xs font-semibold text-overdue">Missing</span>
                </div>

                {routing && (
                  <div className="mb-3 rounded-lg bg-muted/30 p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Recommended Contact</p>
                    <p className="text-sm text-foreground">{provider.name} — {routing.department}</p>
                    <p className="text-xs text-muted-foreground">{routing.phone}{routing.email ? ` · ${routing.email}` : ''}</p>
                  </div>
                )}

                {scripts[field.label] && (
                  <div className="mb-3 rounded-lg border border-border bg-info/5 p-3">
                    <p className="text-xs font-semibold text-info mb-1">🤖 AI-Generated Question Script</p>
                    <p className="text-sm text-foreground italic">"{scripts[field.label]}"</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors">
                    <Mail className="h-3.5 w-3.5 text-primary" /> Create Chase Email
                  </button>
                  <button className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors">
                    <Phone className="h-3.5 w-3.5 text-primary" /> Create Call Task
                  </button>
                  <button className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors">
                    <Upload className="h-3.5 w-3.5 text-success" /> Mark Obtained
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Needs Review */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-warning">
          <AlertCircle className="h-4 w-4" /> Needs Review ({reviewFields.length})
        </h2>
        <div className="space-y-3">
          {reviewFields.map(field => (
            <div key={field.id} className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-3">
              <span className="h-2 w-2 rounded-full bg-warning shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{field.label}: <span className="text-muted-foreground">{field.value}</span></p>
                {field.notes && <p className="text-xs text-warning mt-0.5">{field.notes}</p>}
              </div>
              <button className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors">
                <CheckCircle className="h-3.5 w-3.5 text-success" /> Confirm
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MissingData;
