import { SectionHeader } from "@/components/shared/StatusComponents";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingDown, Clock, Phone, Shield, FileText, Cpu, ArrowDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCases } from "@/services/api";

// Real-world baseline metrics (manual process)
const manualProcess = {
  callTimePerPlanMin: 30,    // minimum mins per plan call
  callTimePerPlanMax: 60,    // maximum mins per plan call
  callTimePerPlanAvg: 45,    // average
  pdfExtractionPerDoc: 15,   // mins to manually extract each PDF into checklist
  repeatCallsPerCase: 3,     // avg repeat calls needed
  totalCallTimePerCase: 45 * 3, // 135 mins total calling per case
  totalExtractionPerCase: 15, // 15 mins manual extraction per PDF
};

// With ProviderHub AI
const appProcess = {
  callTimePerPlan: 12,       // structured script + live checklist = faster calls
  pdfExtractionPerDoc: 2,    // AI auto-extraction takes ~2 mins
  repeatCallsPerCase: 1.2,   // AI Q&A resolves most queries in first call
  totalCallTimePerCase: 12 * 1.2, // ~14.4 mins total
  totalExtractionPerCase: 2,
};

const comparisonData = [
  { metric: 'Call per Plan (min)', before: manualProcess.callTimePerPlanAvg, after: appProcess.callTimePerPlan },
  { metric: 'PDF → Checklist (min)', before: manualProcess.pdfExtractionPerDoc, after: appProcess.pdfExtractionPerDoc },
  { metric: 'Repeat Calls', before: manualProcess.repeatCallsPerCase, after: appProcess.repeatCallsPerCase },
  { metric: 'Total Call Time (min)', before: manualProcess.totalCallTimePerCase, after: Math.round(appProcess.totalCallTimePerCase) },
];

const FounderView = () => {
  const { data: cases = [] } = useQuery({ queryKey: ["cases"], queryFn: getCases });

  const callSaving = Math.round((1 - appProcess.callTimePerPlan / manualProcess.callTimePerPlanAvg) * 100);
  const extractionSaving = Math.round((1 - appProcess.pdfExtractionPerDoc / manualProcess.pdfExtractionPerDoc) * 100);
  const repeatSaving = Math.round((1 - appProcess.repeatCallsPerCase / manualProcess.repeatCallsPerCase) * 100);
  const totalTimeSaving = Math.round((1 - appProcess.totalCallTimePerCase / manualProcess.totalCallTimePerCase) * 100);

  // Per-case time savings
  const manualTimePerCase = manualProcess.totalCallTimePerCase + manualProcess.totalExtractionPerCase; // 150 mins
  const appTimePerCase = Math.round(appProcess.totalCallTimePerCase + appProcess.totalExtractionPerCase); // ~16 mins
  const minsPerCaseSaved = manualTimePerCase - appTimePerCase;
  const totalCases = cases.length;
  const projectedHoursSaved = Math.round((minsPerCaseSaved * Math.max(totalCases, 50)) / 60); // project for at least 50 cases

  return (
    <div className="animate-slide-in">
      <SectionHeader title="Founder View" subtitle="Measurable impact — ProviderHub vs manual workflow" />

      {/* Top KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <MetricCard
          icon={Phone} label="Call Time Reduction"
          value={`${callSaving}%`}
          detail={`${manualProcess.callTimePerPlanAvg} min → ${appProcess.callTimePerPlan} min per plan`}
          accent="success"
        />
        <MetricCard
          icon={FileText} label="PDF Extraction Speed"
          value={`${extractionSaving}%`}
          detail={`${manualProcess.pdfExtractionPerDoc} min → ${appProcess.pdfExtractionPerDoc} min per document`}
          accent="success"
        />
        <MetricCard
          icon={TrendingDown} label="Fewer Repeat Calls"
          value={`${repeatSaving}%`}
          detail={`${manualProcess.repeatCallsPerCase} → ${appProcess.repeatCallsPerCase} calls per case`}
          accent="success"
        />
        <MetricCard
          icon={Clock} label="Total Time Saved"
          value={`${totalTimeSaving}%`}
          detail={`${manualTimePerCase} min → ${appTimePerCase} min per case`}
          accent="success"
        />
      </div>

      {/* Projected savings banner */}
      <div className="rounded-xl border border-success/30 bg-success/5 p-5 mb-6 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/15 shrink-0">
          <ArrowDown className="h-6 w-6 text-success" />
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">
            ~{minsPerCaseSaved} minutes saved per case
          </p>
          <p className="text-sm text-muted-foreground">
            Projected <strong className="text-foreground">{projectedHoursSaved} hours</strong> saved across {Math.max(totalCases, 50)} cases — freeing the CA team to handle {Math.round(minsPerCaseSaved / appTimePerCase)}x more cases per day
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Before vs After Chart */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground">Before vs After ProviderHub</h2>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(214, 20%, 90%)', fontSize: '12px' }} />
                <Legend />
                <Bar dataKey="before" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} name="Manual Process" barSize={28} />
                <Bar dataKey="after" fill="hsl(152, 60%, 40%)" radius={[4, 4, 0, 0]} name="With ProviderHub" barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground">How ProviderHub Saves Time</h2>
          </div>
          <div className="p-5 space-y-4">
            {[
              {
                icon: Cpu,
                title: 'AI PDF Extraction',
                desc: `Manual extraction takes ${manualProcess.pdfExtractionPerDoc} mins per document — reading, locating fields, and typing values into the checklist. ProviderHub AI does this in ~${appProcess.pdfExtractionPerDoc} mins with confidence scoring.`,
              },
              {
                icon: Phone,
                title: 'Structured Call Workflow',
                desc: `Provider calls currently take ${manualProcess.callTimePerPlanMin}–${manualProcess.callTimePerPlanMax} mins per plan as agents navigate IVRs and hunt for info. With pre-built scripts and live checklist, calls drop to ~${appProcess.callTimePerPlan} mins.`,
              },
              {
                icon: TrendingDown,
                title: 'Fewer Follow-up Calls',
                desc: `Teams currently make ~${manualProcess.repeatCallsPerCase} calls per case due to missed data. AI transcript analysis and structured resolution cuts this to ~${appProcess.repeatCallsPerCase} calls.`,
              },
              {
                icon: Shield,
                title: 'Audit-Ready Evidence',
                desc: 'Every field links to its source — PDF page, call transcript, or manual entry — eliminating the need to re-verify data during compliance reviews.',
              },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Process Breakdown Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden mt-6">
        <div className="border-b border-border bg-muted/30 px-5 py-3">
          <h2 className="text-sm font-semibold text-foreground">Per-Case Time Breakdown</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-5 py-2.5 text-left font-medium text-muted-foreground">Activity</th>
              <th className="px-5 py-2.5 text-right font-medium text-muted-foreground">Manual</th>
              <th className="px-5 py-2.5 text-right font-medium text-muted-foreground">ProviderHub</th>
              <th className="px-5 py-2.5 text-right font-medium text-muted-foreground">Saved</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="px-5 py-3 text-foreground">Provider call (per plan)</td>
              <td className="px-5 py-3 text-right text-muted-foreground">{manualProcess.callTimePerPlanMin}–{manualProcess.callTimePerPlanMax} min</td>
              <td className="px-5 py-3 text-right text-foreground font-medium">~{appProcess.callTimePerPlan} min</td>
              <td className="px-5 py-3 text-right text-success font-semibold">{manualProcess.callTimePerPlanAvg - appProcess.callTimePerPlan} min</td>
            </tr>
            <tr className="border-b border-border">
              <td className="px-5 py-3 text-foreground">PDF extraction → checklist</td>
              <td className="px-5 py-3 text-right text-muted-foreground">{manualProcess.pdfExtractionPerDoc} min</td>
              <td className="px-5 py-3 text-right text-foreground font-medium">~{appProcess.pdfExtractionPerDoc} min</td>
              <td className="px-5 py-3 text-right text-success font-semibold">{manualProcess.pdfExtractionPerDoc - appProcess.pdfExtractionPerDoc} min</td>
            </tr>
            <tr className="border-b border-border">
              <td className="px-5 py-3 text-foreground">Repeat/follow-up calls</td>
              <td className="px-5 py-3 text-right text-muted-foreground">{manualProcess.repeatCallsPerCase} calls</td>
              <td className="px-5 py-3 text-right text-foreground font-medium">{appProcess.repeatCallsPerCase} calls</td>
              <td className="px-5 py-3 text-right text-success font-semibold">{(manualProcess.repeatCallsPerCase - appProcess.repeatCallsPerCase).toFixed(1)} calls</td>
            </tr>
            <tr className="bg-muted/20">
              <td className="px-5 py-3 text-foreground font-semibold">Total per case</td>
              <td className="px-5 py-3 text-right text-overdue font-bold">{manualTimePerCase} min</td>
              <td className="px-5 py-3 text-right text-success font-bold">{appTimePerCase} min</td>
              <td className="px-5 py-3 text-right text-success font-bold">{minsPerCaseSaved} min ↓</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Sub-component ──

function MetricCard({ icon: Icon, label, value, detail, accent }: {
  icon: React.ElementType; label: string; value: string; detail: string;
  accent: 'success' | 'primary' | 'warning';
}) {
  const iconBg = accent === 'success' ? 'bg-success/10 text-success'
    : accent === 'primary' ? 'bg-primary/10 text-primary'
    : 'bg-warning/10 text-warning';

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
      <p className="mt-2 text-[11px] text-muted-foreground">{detail}</p>
    </div>
  );
}

export default FounderView;
