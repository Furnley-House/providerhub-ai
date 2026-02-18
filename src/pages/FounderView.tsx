import { SectionHeader, KPICard } from "@/components/shared/StatusComponents";
import { founderMetrics } from "@/data/seedData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingDown, Clock, Phone, Shield } from "lucide-react";

const comparisonData = [
  { metric: 'Call Time (min)', before: founderMetrics.avgCallTimeBefore, after: founderMetrics.avgCallTimeAfter },
  { metric: 'Checklist (min)', before: founderMetrics.checklistTimeBefore, after: founderMetrics.checklistTimeAfter },
  { metric: 'Repeat Calls', before: founderMetrics.repeatCallsBefore, after: founderMetrics.repeatCallsAfter },
];

const FounderView = () => {
  const callSaving = Math.round((1 - founderMetrics.avgCallTimeAfter / founderMetrics.avgCallTimeBefore) * 100);
  const checklistSaving = Math.round((1 - founderMetrics.checklistTimeAfter / founderMetrics.checklistTimeBefore) * 100);
  const repeatSaving = Math.round((1 - founderMetrics.repeatCallsAfter / founderMetrics.repeatCallsBefore) * 100);

  return (
    <div className="animate-slide-in">
      <SectionHeader title="Founder View" subtitle="Measurable impact projections from ProviderHub AI" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        <KPICard title="Call Time Reduction" value={`${callSaving}%`} subtitle={`${founderMetrics.avgCallTimeBefore}min → ${founderMetrics.avgCallTimeAfter}min`} accent="success" />
        <KPICard title="Checklist Speed" value={`${checklistSaving}%`} subtitle={`${founderMetrics.checklistTimeBefore}min → ${founderMetrics.checklistTimeAfter}min`} accent="success" />
        <KPICard title="Fewer Repeat Calls" value={`${repeatSaving}%`} subtitle={`${founderMetrics.repeatCallsBefore} → ${founderMetrics.repeatCallsAfter} per case`} accent="success" />
        <KPICard title="Audit Completeness" value={`${founderMetrics.auditCompleteness}%`} subtitle="Evidence-backed fields" accent="success" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Before vs After ProviderHub</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={comparisonData}>
              <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(214, 20%, 90%)', fontSize: '12px' }} />
              <Legend />
              <Bar dataKey="before" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} name="Before" barSize={32} />
              <Bar dataKey="after" fill="hsl(152, 60%, 40%)" radius={[4, 4, 0, 0]} name="After" barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Key Benefits</h2>
          <div className="space-y-4">
            {[
              { icon: Clock, title: 'Time Savings', desc: `Save ~${founderMetrics.avgCallTimeBefore - founderMetrics.avgCallTimeAfter} mins per call and ~${founderMetrics.checklistTimeBefore - founderMetrics.checklistTimeAfter} mins per checklist with AI auto-fill.` },
              { icon: TrendingDown, title: 'Reduced Chase Volume', desc: 'AI-generated scripts and structured contact routing cut repeat calls by 66%.' },
              { icon: Phone, title: 'Call Intelligence', desc: 'RingCentral integration captures transcript, auto-maps answers to checklist fields.' },
              { icon: Shield, title: 'Audit Trail', desc: `${founderMetrics.auditCompleteness}% of fields have evidence-linked sources (PDF, Call, Email).` },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FounderView;
