import { SectionHeader } from "@/components/shared/StatusComponents";
import { Phone, FileText, Cpu, CheckCircle, Clock, Mic } from "lucide-react";
import { useState } from "react";

const mockTranscript = [
  { time: '00:12', speaker: 'Agent', text: 'Hello, I\'m calling from ProviderHub regarding Rita Wright, plan number TK12097279.' },
  { time: '00:20', speaker: 'Provider', text: 'Yes, I can see that plan. How can I help?' },
  { time: '00:28', speaker: 'Agent', text: 'Could you confirm whether flexi-access drawdown is available on this plan?' },
  { time: '00:38', speaker: 'Provider', text: 'Let me check... Yes, flexi-access drawdown is available on this product. The client would need to be at least 55.' },
  { time: '00:52', speaker: 'Agent', text: 'Excellent. And can you confirm the percentage of the fund that is currently crystallised?' },
  { time: '01:05', speaker: 'Provider', text: 'The plan is fully uncrystallised. No benefits have been taken from this plan.' },
  { time: '01:15', speaker: 'Agent', text: 'Perfect, thank you. That\'s everything I needed.' },
];

const extractedAnswers = [
  { field: 'Drawdown Available', value: 'Yes — FAD available (age 55+)', confidence: 'high' as const, time: '00:38' },
  { field: '% Crystallised', value: '0% — Fully uncrystallised', confidence: 'high' as const, time: '01:05' },
];

const CallAssist = () => {
  const [callStatus, setCallStatus] = useState<'ready' | 'in_call' | 'complete'>('ready');
  const [applied, setApplied] = useState(false);

  return (
    <div className="animate-slide-in">
      <SectionHeader title="RingCentral Call Assist" subtitle="AI-powered call preparation and transcript analysis" />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Call Pack */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            <FileText className="h-5 w-5 text-primary" /> Call Pack
          </h2>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div><p className="text-xs text-muted-foreground">Client</p><p className="font-medium text-foreground">Rita Wright</p></div>
              <div><p className="text-xs text-muted-foreground">Plan Number</p><p className="font-mono font-medium text-foreground">TK12097279</p></div>
              <div><p className="text-xs text-muted-foreground">Provider</p><p className="font-medium text-foreground">Aviva</p></div>
              <div><p className="text-xs text-muted-foreground">Department</p><p className="font-medium text-foreground">Personal Pensions</p></div>
              <div><p className="text-xs text-muted-foreground">Contact</p><p className="font-medium text-foreground">0800 068 6800</p></div>
            </div>

            <div className="mt-4 border-t border-border pt-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Missing Fields to Obtain:</p>
              <ul className="space-y-1.5">
                <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-overdue" /><span className="text-foreground">Provider Telephone & Email</span></li>
                <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-overdue" /><span className="text-foreground">% Crystallised</span></li>
                <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-overdue" /><span className="text-foreground">Drawdown Available</span></li>
              </ul>
            </div>

            <div className="mt-4 rounded-lg bg-info/5 border border-info/20 p-3">
              <p className="text-xs font-semibold text-info mb-1">🤖 Suggested Script</p>
              <p className="text-xs text-foreground italic leading-relaxed">
                "Hello, I'm calling regarding Rita Wright, plan TK12097279. We hold an LOA. I have three quick queries:
                1) Is flexi-access drawdown available on this plan?
                2) Has any part of the fund been crystallised?
                3) Could you confirm your direct contact details for future correspondence?"
              </p>
            </div>
          </div>

          <button
            onClick={() => setCallStatus('in_call')}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Phone className="h-4 w-4" /> Start Call Log
          </button>
        </div>

        {/* Call Log & Transcript */}
        <div className="space-y-6">
          {/* Call Log */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <Mic className="h-5 w-5 text-primary" /> Call Log
            </h2>
            {callStatus === 'ready' ? (
              <p className="text-sm text-muted-foreground">Start a call to begin logging.</p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${callStatus === 'in_call' ? 'bg-success animate-pulse-soft' : 'bg-muted-foreground'}`} />
                  <span className="text-sm font-medium text-foreground">{callStatus === 'in_call' ? 'Connected' : 'Call Complete'}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{callStatus === 'in_call' ? '01:23' : '01:15'}</span>
                </div>
                {callStatus === 'in_call' && (
                  <button
                    onClick={() => setCallStatus('complete')}
                    className="w-full rounded-lg border border-border py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    End Call
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Transcript */}
          {callStatus !== 'ready' && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <Cpu className="h-5 w-5 text-primary" /> Transcript
              </h2>
              <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
                {mockTranscript.map((line, i) => {
                  const isHighlight = extractedAnswers.some(a => a.time === line.time);
                  return (
                    <div key={i} className={`rounded-lg p-2.5 text-sm ${isHighlight ? 'bg-success/10 border border-success/20' : ''}`}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs text-muted-foreground">{line.time}</span>
                        <span className={`text-xs font-semibold ${line.speaker === 'Provider' ? 'text-primary' : 'text-foreground'}`}>{line.speaker}</span>
                        {isHighlight && <span className="text-[10px] font-semibold text-success uppercase">Key Answer</span>}
                      </div>
                      <p className="text-foreground">{line.text}</p>
                    </div>
                  );
                })}
              </div>

              {/* Extracted */}
              {callStatus === 'complete' && (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">AI-Extracted Answers:</p>
                  {extractedAnswers.map((a, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 text-sm">
                      <span className="text-foreground">{a.field}</span>
                      <span className="font-medium text-success">{a.value}</span>
                    </div>
                  ))}
                  <button
                    onClick={() => setApplied(true)}
                    disabled={applied}
                    className={`mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      applied ? 'bg-success/15 text-success' : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                  >
                    {applied ? <><CheckCircle className="h-4 w-4" /> Applied to Checklist</> : <><Cpu className="h-4 w-4" /> Apply to Checklist</>}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallAssist;
