---
name: Calling
description: Stage 5/6 CallWorkspace — auto-generated AI script (structured tool-call), simulated RingCentral call timer, transcript paste, AI extract via tool-call, review modal, merge into checklist with audit
type: feature
---
Phase 4 calling workflow lives in `src/components/case/CallWorkspace.tsx` and is mounted in both Stage 5 (StageCallAssist) and Stage 6 (StageTranscript) of the case detail page.

Edge functions:
- `generate-script` — Lovable AI (gemini-2.5-pro) tool-call returns structured CallScript { opener, sections[{title, questions[]}], objection_handlers[], closing }. Auto-runs on case open and on Regenerate.
- `analyze-transcript` — supports `mode: "extract"` (tool-call returns { summary, extracted: [{key, value, confidence, evidence_quote}] }) and legacy `mode: "qa"` for the standalone CallAssist page.

Merge flow on End Call → Analyse → Review modal:
- Reuses `mergeExtractedFields` from `src/lib/checklistMerge.ts` (same engine as PDF extraction) so manual edits + approved/review_requested fields are never overwritten.
- Writes `evidence_source = "Provider call · {provider}"`, `evidence_ref = transcript quote (≤240 chars)`.
- Inserts `field_audit` rows with `action: "call_extract"`, `source: "call"`.
- Inserts `call_logs` row with full transcript, ai_summary, fields_resolved[], duration_seconds.

Demo: "Insert sample transcript" button populates a realistic Aviva pension call covering current value, transfer value, AMC, funds, retirement age, safeguarded benefits, expression of wishes.

Production pipeline (per user): RingCentral dial → recording API → Palindrome STT → transcript drops into the textarea → Lovable AI extraction.
