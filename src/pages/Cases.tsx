import { cases } from "@/data/seedData";
import { StatusChip, SectionHeader } from "@/components/shared/StatusComponents";
import { Link } from "react-router-dom";
import { useState } from "react";
import { AlertTriangle, ArrowRight } from "lucide-react";

const statusOrder = ['loa_sent', 'loa_processed', 'waiting_pdf', 'pdf_received', 'ceding_in_progress', 'complete'] as const;

const Cases = () => {
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? cases : cases.filter(c => c.status === filter);

  return (
    <div className="animate-slide-in">
      <SectionHeader
        title="Cases"
        subtitle="LOA → Ceding Pipeline"
        action={
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            + New Case
          </button>
        }
      />

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-border'}`}
        >
          All ({cases.length})
        </button>
        {statusOrder.map(s => {
          const count = cases.filter(c => c.status === s).length;
          if (count === 0) return null;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${filter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-border'}`}
            >
              {s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} ({count})
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Client</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Provider</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plan Number</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Value</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Owner</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Confidence</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    {c.isOverdue && <AlertTriangle className="h-3.5 w-3.5 text-overdue" />}
                    {c.clientName}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{c.provider}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.planNumber}</td>
                <td className="px-4 py-3"><StatusChip status={c.status} /></td>
                <td className="px-4 py-3 text-muted-foreground">{c.currentValue || '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.owner}</td>
                <td className="px-4 py-3">
                  {c.confidenceScore > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${c.confidenceScore >= 80 ? 'bg-success' : c.confidenceScore >= 50 ? 'bg-warning' : 'bg-overdue'}`}
                          style={{ width: `${c.confidenceScore}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{c.confidenceScore}%</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link to={`/cases/${c.id}`} className="text-primary hover:text-primary/80 transition-colors">
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Cases;
