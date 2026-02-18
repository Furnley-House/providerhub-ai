import { SectionHeader } from "@/components/shared/StatusComponents";
import { useState } from "react";
import { Upload, FileText, CheckCircle, Cpu } from "lucide-react";
import { ConfidenceBadge } from "@/components/shared/StatusComponents";

interface MockDocument {
  id: string;
  fileName: string;
  provider: string;
  type: string;
  uploadDate: string;
  status: 'processing' | 'extracted' | 'pending';
  fieldsExtracted: number;
  confidence: number;
}

const docs: MockDocument[] = [
  { id: 'd1', fileName: 'PolicyInformation_TK12097279.PDF', provider: 'Aviva', type: 'Policy Information', uploadDate: '2026-02-06', status: 'extracted', fieldsExtracted: 28, confidence: 87 },
  { id: 'd2', fileName: 'RL78234516_PolicyDetails.pdf', provider: 'Royal London', type: 'Policy Information', uploadDate: '2026-02-16', status: 'pending', fieldsExtracted: 0, confidence: 0 },
];

const DocumentInbox = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  const handleRunExtraction = (docId: string) => {
    setProcessing(docId);
    setTimeout(() => setProcessing(null), 3000);
  };

  return (
    <div className="animate-slide-in">
      <SectionHeader title="Document Inbox" subtitle="Upload and process policy documents" />

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={e => { e.preventDefault(); setIsDragOver(false); }}
        className={`mb-8 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors ${
          isDragOver ? 'border-primary bg-primary/5' : 'border-border bg-card'
        }`}
      >
        <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">Drag & drop policy PDFs here</p>
        <p className="mt-1 text-xs text-muted-foreground">or click to browse · PDF, DOC supported</p>
      </div>

      {/* Documents list */}
      <div className="space-y-4">
        {docs.map(doc => (
          <div key={doc.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <FileText className="mt-1 h-8 w-8 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{doc.fileName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {doc.provider} · {doc.type} · Uploaded {doc.uploadDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {doc.status === 'extracted' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                    <CheckCircle className="h-3.5 w-3.5" /> {doc.fieldsExtracted} fields extracted
                  </span>
                ) : processing === doc.id ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary animate-pulse-soft">
                    <Cpu className="h-3.5 w-3.5" /> AI extracting…
                  </span>
                ) : (
                  <button
                    onClick={() => handleRunExtraction(doc.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <Cpu className="h-3.5 w-3.5" /> Run AI Extraction
                  </button>
                )}
              </div>
            </div>

            {doc.status === 'extracted' && (
              <div className="mt-4 grid grid-cols-3 gap-4 rounded-lg bg-muted/30 p-4">
                <div>
                  <p className="text-xs text-muted-foreground">Fields Extracted</p>
                  <p className="text-lg font-bold text-foreground">{doc.fieldsExtracted}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Confidence</p>
                  <ConfidenceBadge level={doc.confidence >= 80 ? 'high' : doc.confidence >= 50 ? 'medium' : 'low'} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Provider Detected</p>
                  <p className="text-sm font-semibold text-foreground">{doc.provider}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentInbox;
