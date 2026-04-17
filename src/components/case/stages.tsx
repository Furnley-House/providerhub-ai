import type { CaseRow } from "@/lib/caseHelpers";
import {
  FileText,
  Upload,
  Cpu,
  ListChecks,
  Phone,
  FileAudio,
  History,
  UserCheck,
  CheckCircle2,
  Download,
  Sparkles,
} from "lucide-react";
import { ChecklistPanel } from "./ChecklistPanel";
import { DocumentUploader } from "./DocumentUploader";
import { DocumentList } from "./DocumentList";
import { ExtractionWorkspace } from "./ExtractionWorkspace";
import { CallWorkspace } from "./CallWorkspace";
import { useDocuments } from "@/hooks/useDocuments";

interface StageProps {
  caseItem: CaseRow;
}

function StagePanel({
  num,
  icon: Icon,
  title,
  description,
  children,
  comingSoon,
}: {
  num: number;
  icon: React.ElementType;
  title: string;
  description: string;
  children?: React.ReactNode;
  comingSoon?: string;
}) {
  return (
    <div className="theme-card theme-card-accent border border-border bg-card">
      <div className="flex items-start gap-3 mb-4 pb-4 border-b border-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-teal/15 text-teal shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-widest text-teal font-semibold">Step {num} of 10</p>
          <h2 className="text-lg font-bold theme-heading text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      {children}
      {comingSoon && (
        <div className="mt-4 rounded-md border border-dashed border-border bg-muted/30 p-4 text-center">
          <Sparkles className="h-5 w-5 mx-auto text-teal mb-2" />
          <p className="text-xs font-semibold text-foreground">{comingSoon}</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            This stage will be fully built out in the next phase. Use the buttons below to navigate.
          </p>
        </div>
      )}
    </div>
  );
}

export function StageCaseDetails({ caseItem }: StageProps) {
  return (
    <StagePanel
      num={1}
      icon={FileText}
      title="Case Details"
      description="Confirm the case metadata captured from Zoho CRM or entered manually."
    >
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <Detail label="Client name" value={caseItem.client_name} />
        <Detail label="Provider" value={caseItem.provider_name} />
        <Detail label="Plan type" value={caseItem.plan_type} />
        <Detail label="Policy reference" value={caseItem.plan_number} mono />
        <Detail label="Zoho CRM task" value={(caseItem as any).zoho_task_id ?? "—"} mono />
        <Detail label="Assigned CA" value={caseItem.owner_name ?? "—"} />
        <Detail
          label="LOA status"
          value={
            caseItem.loa_sent_date
              ? `Sent ${new Date(caseItem.loa_sent_date).toLocaleDateString("en-GB")}`
              : "Not sent"
          }
        />
        <Detail
          label="Send method"
          value="Email"
          hint="Will pull from Provider Directory in Phase 8"
        />
      </dl>
      {caseItem.case_notes && (
        <div className="mt-4 rounded-md bg-muted/40 border border-border p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Case notes</p>
          <p className="text-sm text-foreground whitespace-pre-wrap">{caseItem.case_notes}</p>
        </div>
      )}
    </StagePanel>
  );
}

export function StageDocumentUpload({ caseItem }: StageProps) {
  const { documents, removeDocument } = useDocuments(caseItem.id);
  return (
    <StagePanel
      num={2}
      icon={Upload}
      title="Document Upload"
      description="Upload the policy pack(s) received from the provider — PDFs, multi-file supported."
    >
      <div className="space-y-4">
        <DocumentUploader caseId={caseItem.id} />
        <div className="rounded-md border border-border bg-card p-3">
          <h4 className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground mb-2">
            Uploaded documents ({documents.length})
          </h4>
          <DocumentList
            documents={documents}
            caseId={caseItem.id}
            planType={caseItem.plan_type}
            selectedId={null}
            onSelect={() => {}}
            onRemove={removeDocument}
          />
        </div>
      </div>
    </StagePanel>
  );
}

export function StageAIExtraction({ caseItem }: StageProps) {
  return (
    <StagePanel
      num={3}
      icon={Cpu}
      title="Extract Using AI"
      description="Side-by-side viewer — Gemini reads each PDF, populates the checklist, and links every value to its source page."
    >
      <ExtractionWorkspace caseId={caseItem.id} planType={caseItem.plan_type} />
    </StagePanel>
  );
}

export function StageMissingData({ caseItem }: StageProps) {
  return (
    <StagePanel
      num={4}
      icon={ListChecks}
      title="Fill the Gaps — Checklist"
      description={`Plan-type-specific checklist for ${caseItem.plan_type}. Edit any field, every change is audit-logged.`}
    >
      <ChecklistPanel planType={caseItem.plan_type} caseId={caseItem.id} />
    </StagePanel>
  );
}

export function StageCallAssist({ caseItem }: StageProps) {
  return (
    <StagePanel
      num={5}
      icon={Phone}
      title="Call Assist with AI Script"
      description="AI generates a tailored script targeting your remaining missing fields. Start the call (RingCentral in production), capture the transcript, then merge the agent's answers straight into the checklist."
    >
      <CallWorkspace
        caseId={caseItem.id}
        planType={caseItem.plan_type}
        clientName={caseItem.client_name}
        providerName={caseItem.provider_name}
        planNumber={caseItem.plan_number}
      />
    </StagePanel>
  );
}

export function StageTranscript({ caseItem }: StageProps) {
  return (
    <StagePanel
      num={6}
      icon={FileAudio}
      title="Call Transcript with AI Assist"
      description="Same workspace as Step 5 — paste the Palindrome transcript at any time and click Analyse. The merge engine preserves manual edits and approvals."
    >
      <CallWorkspace
        caseId={caseItem.id}
        planType={caseItem.plan_type}
        clientName={caseItem.client_name}
        providerName={caseItem.provider_name}
        planNumber={caseItem.plan_number}
      />
    </StagePanel>
  );
}

export function StageAuditTrail({ caseItem }: StageProps) {
  return (
    <StagePanel
      num={7}
      icon={History}
      title="Audit Trail"
      description="Every action on this case — uploads, extractions, edits, approvals, comments — captured immutably."
      comingSoon="Phase 5: filterable timeline with user, role, action type, old/new values"
    />
  );
}

export function StageAssign({ caseItem }: StageProps) {
  return (
    <StagePanel
      num={8}
      icon={UserCheck}
      title="Assign to Paraplanner"
      description="When the checklist is complete, hand off to the paraplanner for review."
      comingSoon="Phase 6: assign modal + Zoho CRM task stub + in-app notification"
    />
  );
}

export function StageApproval({ caseItem }: StageProps) {
  return (
    <StagePanel
      num={9}
      icon={CheckCircle2}
      title="Paraplanner / Adviser Approval"
      description="Per-field approve / request review / comment workspace for the UK reviewer."
      comingSoon="Phase 6: full approval workspace with bulk-approve and request-review-with-comment"
    />
  );
}

export function StageExport({ caseItem }: StageProps) {
  return (
    <StagePanel
      num={10}
      icon={Download}
      title="Export & Upload to WorkDrive"
      description="Generate the completed checklist as Excel and push to Zoho WorkDrive."
      comingSoon="Phase 7: .xlsx export (Checklist + Audit Trail tabs) + WorkDrive stub + Suitability Report handoff"
    />
  );
}

function Detail({ label, value, mono, hint }: { label: string; value: string; mono?: boolean; hint?: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</dt>
      <dd className={`text-foreground ${mono ? "font-mono text-xs" : "text-sm"}`}>{value}</dd>
      {hint && <p className="text-[10px] text-muted-foreground italic mt-0.5">{hint}</p>}
    </div>
  );
}
