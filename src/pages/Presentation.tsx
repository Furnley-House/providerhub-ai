import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, Maximize, Minimize, X,
  FileText, Phone, Clock, Shield, Cpu, TrendingDown, ArrowDown, Users, BarChart3, AlertTriangle, CheckCircle, Zap
} from "lucide-react";

// Screenshots
import screenshotDashboard from "@/assets/screenshots/dashboard.png";
import screenshotCases from "@/assets/screenshots/cases.png";
import screenshotDocuments from "@/assets/screenshots/documents.png";
import screenshotCallAssist from "@/assets/screenshots/call-assist.png";
import screenshotMissingData from "@/assets/screenshots/missing-data.png";
import screenshotProviders from "@/assets/screenshots/providers.png";
import screenshotFounderView from "@/assets/screenshots/founder-view.png";

// Founder View metrics (same as FounderView.tsx)
const manualProcess = {
  callTimePerPlanAvg: 45,
  pdfExtractionPerDoc: 15,
  transcriptReviewTime: 7.5,
  contextSwitchingTime: 7.5,
  repeatCallsPerCase: 3,
};
const appProcess = {
  callTimePerPlanAvg: 45,
  pdfExtractionPerDoc: 2,
  transcriptReviewTime: 0,
  contextSwitchingTime: 0,
  repeatCallsPerCase: 1.2,
};
const manualTotalPerCase = manualProcess.callTimePerPlanAvg * manualProcess.repeatCallsPerCase + manualProcess.pdfExtractionPerDoc + manualProcess.transcriptReviewTime * manualProcess.repeatCallsPerCase + manualProcess.contextSwitchingTime * manualProcess.repeatCallsPerCase;
const appTotalPerCase = Math.round(appProcess.callTimePerPlanAvg * appProcess.repeatCallsPerCase + appProcess.pdfExtractionPerDoc + appProcess.transcriptReviewTime * appProcess.repeatCallsPerCase + appProcess.contextSwitchingTime * appProcess.repeatCallsPerCase);
const minsPerCaseSaved = manualTotalPerCase - appTotalPerCase;

// Slide components
const slides: React.FC[] = [
  // Slide 1: Title
  () => (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-[hsl(197,71%,20%)] to-[hsl(197,71%,10%)] text-white px-20">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
          <Shield className="w-8 h-8 text-[hsl(173,58%,39%)]" />
        </div>
        <h1 className="text-7xl font-bold tracking-tight">ProviderHub</h1>
      </div>
      <h2 className="text-3xl font-light text-white/80 mb-4">AI-powered LOA → Ceding Automation</h2>
      <div className="flex gap-6 mt-8 text-lg text-white/60">
        <span className="flex items-center gap-2"><Cpu className="w-5 h-5" /> AI PDF extraction</span>
        <span className="flex items-center gap-2"><Phone className="w-5 h-5" /> Fewer provider calls</span>
        <span className="flex items-center gap-2"><Shield className="w-5 h-5" /> Evidence & audit trail</span>
      </div>
      <p className="mt-16 text-sm text-white/40">Demo-ready prototype · February 2026</p>
    </div>
  ),

  // Slide 2: Current Pain
  () => (
    <div className="flex flex-col h-full bg-white px-20 py-16">
      <h2 className="text-4xl font-bold text-[hsl(197,71%,20%)] mb-2">Why change? Current pain</h2>
      <p className="text-lg text-gray-500 mb-10">Today's workflow is call-heavy, manual, and error-prone</p>
      <div className="grid grid-cols-3 gap-8 flex-1">
        <PainCard
          icon={Phone}
          title="Calling is expensive"
          items={[
            "30–60 min on-hold, department transfers, identity checks",
            "Calls happen 3× per case: missing details + confirm ambiguous data",
            "5–10 min reviewing transcript/notes after each call",
          ]}
          color="hsl(0, 72%, 51%)"
        />
        <PainCard
          icon={FileText}
          title="200+ PDF formats"
          items={[
            "Each provider uses different wording for the same concept",
            "15 mins to manually extract each PDF into checklist",
            "CA knowledge is tribal — new joiners struggle",
          ]}
          color="hsl(38, 92%, 50%)"
        />
        <PainCard
          icon={AlertTriangle}
          title="No evidence trail"
          items={[
            "Numbers copied into checklists without source links",
            "Adviser doubts → more confirmation calls",
            "5–10 min switching between documents and systems",
          ]}
          color="hsl(0, 72%, 51%)"
        />
      </div>
      <div className="mt-8 p-5 rounded-xl bg-red-50 border border-red-200">
        <p className="text-lg font-semibold text-red-800">Result: ~{Math.round(manualTotalPerCase)} mins per case ({Math.round(manualTotalPerCase/60*10)/10} hrs) · {manualProcess.repeatCallsPerCase} calls per case · 65–81 hrs/week for 20–25 cedings</p>
      </div>
    </div>
  ),

  // Slide 3: What we're building
  () => (
    <div className="flex flex-col h-full bg-white px-20 py-16">
      <h2 className="text-4xl font-bold text-[hsl(197,71%,20%)] mb-2">What we're building</h2>
      <p className="text-lg text-gray-500 mb-10">From "chase & copy" to "extract & verify"</p>
      <div className="grid grid-cols-2 gap-8 flex-1">
        {[
          { icon: CheckCircle, title: "Standard output schema", desc: "Different PDFs → one consistent internal data model. Every field stores: value, confidence, and evidence link." },
          { icon: Zap, title: "Digital rails first", desc: "Portal / secure email before phone calls. Calls become the last resort — and shorter with structured scripts." },
          { icon: Shield, title: "Evidence + audit trail", desc: "Click a value → see exact PDF snippet or call transcript timestamp. Fewer 'confirm again' calls." },
          { icon: Users, title: "Provider intelligence", desc: "Provider Directory stores correct numbers, departments, plan-prefix rules, and jargon mapping. Tribal knowledge captured once." },
        ].map(item => (
          <div key={item.title} className="rounded-xl border-2 border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[hsl(173,58%,39%)]/10 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-[hsl(173,58%,39%)]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  ),

  // Slide 4: End-to-end pipeline
  () => (
    <div className="flex flex-col h-full bg-white px-20 py-16">
      <h2 className="text-4xl font-bold text-[hsl(197,71%,20%)] mb-2">End-to-end pipeline</h2>
      <p className="text-lg text-gray-500 mb-10">One pipeline, six steps — each reduces manual work</p>
      <div className="flex gap-4 flex-1 items-center">
        {[
          { num: "1", title: "Create Case", sub: "Client + provider setup", color: "hsl(197,71%,20%)" },
          { num: "2", title: "Track LOA", sub: "SLA countdown + chase", color: "hsl(197,71%,28%)" },
          { num: "3", title: "Ingest PDF", sub: "Upload or email drop", color: "hsl(173,58%,39%)" },
          { num: "4", title: "AI Extract", sub: "Map jargon + confidence", color: "hsl(173,58%,32%)" },
          { num: "5", title: "Resolve Missing", sub: "Call assist + scripts", color: "hsl(38,92%,50%)" },
          { num: "6", title: "Ceding Ready", sub: "Review & submit", color: "hsl(152,60%,40%)" },
        ].map((step, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-4" style={{ backgroundColor: step.color }}>
              {step.num}
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center">{step.title}</h3>
            <p className="text-sm text-gray-500 text-center mt-1">{step.sub}</p>
            {i < 5 && <div className="absolute" />}
          </div>
        ))}
      </div>
      <div className="mt-8 grid grid-cols-4 gap-4">
        {[
          "Auto-filled ceding checklist with confidence + evidence links",
          "Fewer calls (only for true missing fields)",
          "Shorter calls (script + call pack + transcript → fields)",
          "Less adviser doubt (clickable proof of source)",
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-[hsl(173,58%,39%)]/5">
            <CheckCircle className="w-4 h-4 text-[hsl(173,58%,39%)] mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700">{item}</p>
          </div>
        ))}
      </div>
    </div>
  ),

  // Slide 5: Dashboard & Cases (screenshot)
  () => (
    <div className="flex flex-col h-full bg-white px-20 py-16">
      <h2 className="text-4xl font-bold text-[hsl(197,71%,20%)] mb-2">Dashboard & Case Pipeline</h2>
      <p className="text-lg text-gray-500 mb-8">Central view of all LOA cases, pipeline status, and quick actions</p>
      <div className="grid grid-cols-2 gap-6 flex-1">
        <div className="rounded-xl border-2 border-gray-100 overflow-hidden">
          <img src={screenshotDashboard} alt="Dashboard" className="w-full h-full object-cover object-top" />
        </div>
        <div className="rounded-xl border-2 border-gray-100 overflow-hidden">
          <img src={screenshotCases} alt="Cases" className="w-full h-full object-cover object-top" />
        </div>
      </div>
    </div>
  ),

  // Slide 6: Document AI (screenshot)
  () => (
    <div className="flex flex-col h-full bg-white px-20 py-16">
      <h2 className="text-4xl font-bold text-[hsl(197,71%,20%)] mb-2">AI Document Extraction</h2>
      <p className="text-lg text-gray-500 mb-8">Upload policy PDFs → AI extracts fields with confidence scoring</p>
      <div className="flex gap-8 flex-1">
        <div className="flex-1 rounded-xl border-2 border-gray-100 overflow-hidden">
          <img src={screenshotDocuments} alt="Document Inbox" className="w-full h-full object-cover object-top" />
        </div>
        <div className="w-80 space-y-4">
          <FeaturePoint icon={Cpu} title="AI PDF Extraction" desc={`15 min manual → ~2 min AI extraction per document (${Math.round((1-appProcess.pdfExtractionPerDoc/manualProcess.pdfExtractionPerDoc)*100)}% faster)`} />
          <FeaturePoint icon={Shield} title="Evidence Links" desc="Every extracted field links back to the source PDF page and snippet" />
          <FeaturePoint icon={BarChart3} title="Confidence Scoring" desc="High / Medium / Low confidence tags so CAs know what to verify" />
          <FeaturePoint icon={Users} title="Jargon Mapping" desc="Provider-specific terms automatically mapped to standard field names" />
        </div>
      </div>
    </div>
  ),

  // Slide 7: Missing Data & Call Assist (screenshot)
  () => (
    <div className="flex flex-col h-full bg-white px-20 py-16">
      <h2 className="text-4xl font-bold text-[hsl(197,71%,20%)] mb-2">Missing Data & Call Assist</h2>
      <p className="text-lg text-gray-500 mb-8">Only call when truly needed — AI prepares the shortest possible call</p>
      <div className="flex gap-8 flex-1">
        <div className="flex-1 rounded-xl border-2 border-gray-100 overflow-hidden">
          <img src={screenshotMissingData} alt="Missing Data" className="w-full h-full object-cover object-top" />
        </div>
        <div className="flex-1 rounded-xl border-2 border-gray-100 overflow-hidden">
          <img src={screenshotCallAssist} alt="Call Assist" className="w-full h-full object-cover object-top" />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-4 gap-4">
        <FeaturePoint icon={AlertTriangle} title="Missing Fields List" desc="Auto-generated from AI extraction gaps" />
        <FeaturePoint icon={Phone} title="AI Question Script" desc="Short, provider-friendly wording generated" />
        <FeaturePoint icon={Clock} title="Transcript Q&A" desc="AI answers questions from call recordings" />
        <FeaturePoint icon={TrendingDown} title="Fewer Repeat Calls" desc={`${manualProcess.repeatCallsPerCase} → ${appProcess.repeatCallsPerCase} calls per case`} />
      </div>
    </div>
  ),

  // Slide 8: Provider Directory (screenshot)
  () => (
    <div className="flex flex-col h-full bg-white px-20 py-16">
      <h2 className="text-4xl font-bold text-[hsl(197,71%,20%)] mb-2">Provider Intelligence</h2>
      <p className="text-lg text-gray-500 mb-8">Capture tribal knowledge once — reuse forever</p>
      <div className="flex gap-8 flex-1">
        <div className="flex-[2] rounded-xl border-2 border-gray-100 overflow-hidden">
          <img src={screenshotProviders} alt="Provider Directory" className="w-full h-full object-cover object-top" />
        </div>
        <div className="flex-1 space-y-4">
          <FeaturePoint icon={Phone} title="Correct Contact Routing" desc="Numbers differ by product, department, and plan prefix — all stored and auto-applied" />
          <FeaturePoint icon={FileText} title="Jargon Mapping" desc='Provider wording → standard field names. E.g., "Allocation rate" → Contribution allocation %' />
          <FeaturePoint icon={Users} title="6 Providers Configured" desc="Aviva, Standard Life, Royal London, Scottish Widows, Aegon, Prudential" />
          <FeaturePoint icon={Zap} title="Plan Prefix Rules" desc="TK* → Personal Pensions, AV* → Platform, FP* → Legacy Friends Provident" />
        </div>
      </div>
    </div>
  ),

  // Slide 9: ROI — Time Savings
  () => (
    <div className="flex flex-col h-full bg-gradient-to-br from-[hsl(197,71%,20%)] to-[hsl(197,71%,12%)] text-white px-20 py-16">
      <h2 className="text-4xl font-bold mb-2">Measurable Impact</h2>
      <p className="text-lg text-white/60 mb-10">ProviderHub vs manual workflow — real numbers</p>
      <div className="grid grid-cols-4 gap-6 mb-8">
        <ROICard label="PDF Extraction" value={`${Math.round((1-appProcess.pdfExtractionPerDoc/manualProcess.pdfExtractionPerDoc)*100)}%`} sub={`${manualProcess.pdfExtractionPerDoc} min → ${appProcess.pdfExtractionPerDoc} min`} />
        <ROICard label="Transcript Review" value="100%" sub={`${manualProcess.transcriptReviewTime} min → 0 min`} />
        <ROICard label="Context Switching" value="100%" sub={`${manualProcess.contextSwitchingTime} min → 0 min`} />
        <ROICard label="Repeat Calls" value={`${Math.round((1-appProcess.repeatCallsPerCase/manualProcess.repeatCallsPerCase)*100)}%`} sub={`${manualProcess.repeatCallsPerCase} → ${appProcess.repeatCallsPerCase} calls`} />
      </div>
      <div className="rounded-2xl bg-white/10 backdrop-blur p-8 flex items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-[hsl(152,60%,40%)]/20 flex items-center justify-center shrink-0">
          <ArrowDown className="w-8 h-8 text-[hsl(152,60%,40%)]" />
        </div>
        <div>
          <p className="text-3xl font-bold">~{minsPerCaseSaved} minutes saved per case</p>
          <p className="text-lg text-white/60 mt-1">
            {Math.round(manualTotalPerCase)} min → {appTotalPerCase} min ({Math.round(manualTotalPerCase/60*10)/10}h → {Math.round(appTotalPerCase/60*10)/10}h)
          </p>
        </div>
      </div>
      <div className="mt-auto rounded-xl overflow-hidden">
        <img src={screenshotFounderView} alt="Founder View" className="w-full h-48 object-cover object-top rounded-xl border border-white/10" />
      </div>
    </div>
  ),

  // Slide 10: Team Weekly Capacity
  () => {
    const weeklyLow = 20, weeklyHigh = 25, weeklyAvg = 22.5;
    const manualHoursLow = Math.round((weeklyLow * manualTotalPerCase) / 60);
    const manualHoursHigh = Math.round((weeklyHigh * manualTotalPerCase) / 60);
    const appHoursLow = Math.round((weeklyLow * appTotalPerCase) / 60);
    const appHoursHigh = Math.round((weeklyHigh * appTotalPerCase) / 60);
    const savedHoursLow = manualHoursLow - appHoursLow;
    const savedHoursHigh = manualHoursHigh - appHoursHigh;
    const newCapacity = Math.round((weeklyAvg * manualTotalPerCase) / appTotalPerCase);
    const capacityIncrease = Math.round(((newCapacity - weeklyAvg) / weeklyAvg) * 100);

    return (
      <div className="flex flex-col h-full bg-white px-20 py-16">
        <h2 className="text-4xl font-bold text-[hsl(197,71%,20%)] mb-2">Team Weekly Capacity</h2>
        <p className="text-lg text-gray-500 mb-10">Based on current workload of {weeklyLow}–{weeklyHigh} cedings per week (whole team)</p>
        <div className="grid grid-cols-3 gap-8 mb-10">
          <div className="rounded-2xl border-2 border-[hsl(152,60%,40%)]/30 bg-[hsl(152,60%,40%)]/5 p-8 text-center">
            <p className="text-sm text-gray-500 mb-2">Same workload, less time</p>
            <p className="text-5xl font-bold text-[hsl(152,60%,40%)]">{savedHoursLow}–{savedHoursHigh}</p>
            <p className="text-lg text-gray-500 mt-2">hours freed up per week</p>
          </div>
          <div className="rounded-2xl border-2 border-[hsl(197,71%,20%)]/30 bg-[hsl(197,71%,20%)]/5 p-8 text-center">
            <p className="text-sm text-gray-500 mb-2">Same hours, more output</p>
            <p className="text-5xl font-bold text-[hsl(197,71%,20%)]">~{newCapacity}</p>
            <p className="text-lg text-gray-500 mt-2">cedings per week (+{capacityIncrease}%)</p>
          </div>
          <div className="rounded-2xl border-2 border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-500 mb-2">Time per ceding</p>
            <p className="text-5xl font-bold text-gray-900">{Math.round(manualTotalPerCase/60*10)/10}h → {Math.round(appTotalPerCase/60*10)/10}h</p>
            <p className="text-lg text-gray-500 mt-2">per case reduction</p>
          </div>
        </div>
        <table className="w-full text-lg">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="py-3 text-left font-semibold text-gray-500">Scenario</th>
              <th className="py-3 text-right font-semibold text-red-500">Manual</th>
              <th className="py-3 text-right font-semibold text-[hsl(152,60%,40%)]">ProviderHub</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-4">Weekly hours for {weeklyLow}–{weeklyHigh} cedings</td>
              <td className="py-4 text-right text-red-500 font-bold">{manualHoursLow}–{manualHoursHigh} hrs</td>
              <td className="py-4 text-right text-[hsl(152,60%,40%)] font-bold">{appHoursLow}–{appHoursHigh} hrs</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-4">Cedings possible in {manualHoursLow}–{manualHoursHigh} hrs</td>
              <td className="py-4 text-right text-gray-500">{weeklyLow}–{weeklyHigh}</td>
              <td className="py-4 text-right text-[hsl(197,71%,20%)] font-bold">~{newCapacity}</td>
            </tr>
            <tr>
              <td className="py-4 font-bold">Hours saved per week</td>
              <td className="py-4 text-right text-gray-400">—</td>
              <td className="py-4 text-right text-[hsl(152,60%,40%)] font-bold text-xl">{savedHoursLow}–{savedHoursHigh} hrs ↓</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  },

  // Slide 11: Security & Compliance
  () => (
    <div className="flex flex-col h-full bg-white px-20 py-16">
      <h2 className="text-4xl font-bold text-[hsl(197,71%,20%)] mb-2">Designed for regulated ops</h2>
      <p className="text-lg text-gray-500 mb-10">Security, auditability, and human approvals</p>
      <div className="grid grid-cols-2 gap-8 flex-1">
        {[
          { icon: Shield, title: "Evidence-first data capture", desc: "Every value is traceable to: PDF page reference, call transcript timestamp, or manual entry with reviewer name." },
          { icon: Users, title: "Human-in-the-loop", desc: "AI suggests — humans approve. Confidence scoring flags items that need manual verification before submission." },
          { icon: CheckCircle, title: "Audit trail", desc: "Who changed what, when, and why. Supports internal QA and reduces rework. Full history per field." },
          { icon: FileText, title: "Security & privacy", desc: "Role-based access, encryption at rest and in transit. Suitable for UK financial client data handling." },
        ].map(item => (
          <div key={item.title} className="rounded-xl border-2 border-gray-100 p-8 flex items-start gap-5">
            <div className="w-12 h-12 rounded-xl bg-[hsl(197,71%,20%)]/10 flex items-center justify-center shrink-0">
              <item.icon className="w-6 h-6 text-[hsl(197,71%,20%)]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),

  // Slide 12: Next Steps
  () => (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-[hsl(197,71%,20%)] to-[hsl(197,71%,10%)] text-white px-20">
      <h2 className="text-5xl font-bold mb-4">Next Steps</h2>
      <p className="text-xl text-white/60 mb-12">Approve a phased pilot to prove impact on the top providers and scale</p>
      <div className="grid grid-cols-3 gap-8 w-full max-w-4xl mb-8">
        {[
          { phase: "Phase 1 (MVP)", items: ["Case pipeline + LOA tracking", "Document inbox + AI extraction", "Auto-fill checklist + evidence", "Top 10–20 providers"] },
          { phase: "Phase 2", items: ["Missing-fields workflow", "Provider Directory rules UI", "Chase automation templates", "Adviser review & comments"] },
          { phase: "Phase 3", items: ["RingCentral call assist", "Transcript → field auto-fill", "Analytics & Founder dashboard", "Origo integration (research phase)"] },
        ].map((p, i) => (
          <div key={i} className="rounded-xl bg-white/10 backdrop-blur p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[hsl(173,58%,39%)] flex items-center justify-center text-sm font-bold">{i + 1}</div>
              <h3 className="text-lg font-bold">{p.phase}</h3>
            </div>
            <ul className="space-y-2">
              {p.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-white/80">
                  <CheckCircle className="w-4 h-4 text-[hsl(173,58%,39%)] mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {/* Origo Research Insight */}
      <div className="rounded-xl bg-white/5 border border-white/10 px-8 py-4 w-full max-w-4xl mb-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-[hsl(38,92%,50%)]/20 flex items-center justify-center shrink-0 mt-0.5">
            <Zap className="w-5 h-5 text-[hsl(38,92%,50%)]" />
          </div>
          <div>
            <p className="text-sm font-bold text-white flex items-center gap-2">
              Origo — UK Fintech for LOA & Transfer Tracking
              <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded bg-[hsl(38,92%,50%)]/20 text-[hsl(38,92%,50%)]">Research</span>
            </p>
            <p className="text-xs text-white/50 mt-1 leading-relaxed max-w-3xl">
              Early research suggests Origo's digital transfer platform could automate LOA submission and transfer status tracking directly with providers — potentially eliminating manual LOA chasing entirely. More POC and analysis needed before committing. Phase 3 candidate if validated.
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-xl bg-white/10 backdrop-blur px-8 py-5 text-center max-w-2xl">
        <p className="text-lg font-semibold">ProviderHub turns LOA & Ceding into a repeatable, auditable pipeline.</p>
        <p className="text-sm text-white/60 mt-2">Demo-ready: Case tracking · PDF extraction · Checklist auto-fill · Missing-field resolution · Call assist · Provider directory</p>
      </div>
    </div>
  ),
];

// Sub-components
function PainCard({ icon: Icon, title, items, color }: { icon: React.ElementType; title: string; items: string[]; color: string }) {
  return (
    <div className="rounded-xl border-2 border-gray-100 p-8 flex flex-col">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      </div>
      <ul className="space-y-3 flex-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-gray-600">
            <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: color }} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeaturePoint({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-[hsl(173,58%,39%)]/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-[hsl(173,58%,39%)]" />
      </div>
      <div>
        <p className="text-sm font-bold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function ROICard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl bg-white/10 backdrop-blur p-6 text-center">
      <p className="text-4xl font-bold text-[hsl(152,60%,40%)]">{value}</p>
      <p className="text-sm font-semibold text-white mt-1">{label}</p>
      <p className="text-xs text-white/50 mt-1">{sub}</p>
    </div>
  );
}

// Main Presentation component
const Presentation = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const total = slides.length;

  const next = useCallback(() => setCurrent(c => Math.min(c + 1, total - 1)), [total]);
  const prev = useCallback(() => setCurrent(c => Math.max(c - 1, 0)), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      if (e.key === "Escape") {
        if (document.fullscreenElement) document.exitFullscreen();
        else navigate("/");
      }
      if (e.key === "f" || e.key === "F5") {
        e.preventDefault();
        document.documentElement.requestFullscreen?.();
      }
    };
    window.addEventListener("keydown", handler);

    const fsHandler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", fsHandler);

    return () => {
      window.removeEventListener("keydown", handler);
      document.removeEventListener("fullscreenchange", fsHandler);
    };
  }, [next, prev, navigate]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  };

  const SlideComponent = slides[current];

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Slide area */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        <div className="relative w-full h-full" style={{ maxWidth: "177.78vh", maxHeight: "56.25vw" }}>
          <div className="absolute inset-0">
            <SlideComponent />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="h-12 bg-black/90 flex items-center justify-between px-4 text-white/70 text-sm">
        <button onClick={() => navigate("/")} className="flex items-center gap-1 hover:text-white transition-colors">
          <X className="w-4 h-4" /> Exit
        </button>
        <div className="flex items-center gap-4">
          <button onClick={prev} disabled={current === 0} className="disabled:opacity-30 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-medium">{current + 1} / {total}</span>
          <button onClick={next} disabled={current === total - 1} className="disabled:opacity-30 hover:text-white transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <button onClick={toggleFullscreen} className="hover:text-white transition-colors">
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

export default Presentation;
