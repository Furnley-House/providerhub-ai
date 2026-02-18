import { StatusChip, SectionHeader } from "@/components/shared/StatusComponents";
import { Link } from "react-router-dom";
import { useState } from "react";
import { AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCases, createCase } from "@/services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const statusOrder = ['loa_sent', 'loa_processed', 'waiting_pdf', 'pdf_received', 'ceding_in_progress', 'complete'] as const;

function generateCaseRef() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "CASE-";
  for (let i = 0; i < 8; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

const Cases = () => {
  const [filter, setFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: cases = [], isLoading } = useQuery({
    queryKey: ["cases"],
    queryFn: getCases,
  });

  const [form, setForm] = useState({
    client_name: "",
    provider_name: "",
    plan_number: "",
    plan_type: "Personal Pension",
  });

  const createMutation = useMutation({
    mutationFn: createCase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      setDialogOpen(false);
      setForm({ client_name: "", provider_name: "", plan_number: "", plan_type: "Personal Pension" });
      toast({ title: "Case created", description: "New case has been added." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_name || !form.provider_name || !form.plan_number) return;
    createMutation.mutate({
      case_ref: generateCaseRef(),
      client_name: form.client_name,
      provider_name: form.provider_name,
      plan_number: form.plan_number,
      plan_type: form.plan_type,
    });
  };

  const filtered = filter === 'all' ? cases : cases.filter(c => c.status === filter);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="animate-slide-in">
      <SectionHeader
        title="Cases"
        subtitle="LOA → Ceding Pipeline"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                + New Case
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Case</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="client_name">Client Name</Label>
                  <Input id="client_name" value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} placeholder="e.g. John Smith" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider_name">Provider</Label>
                  <Input id="provider_name" value={form.provider_name} onChange={e => setForm(f => ({ ...f, provider_name: e.target.value }))} placeholder="e.g. Aviva" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan_number">Plan Number</Label>
                  <Input id="plan_number" value={form.plan_number} onChange={e => setForm(f => ({ ...f, plan_number: e.target.value }))} placeholder="e.g. TK12097279" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan_type">Plan Type</Label>
                  <Select value={form.plan_type} onValueChange={v => setForm(f => ({ ...f, plan_type: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Personal Pension">Personal Pension</SelectItem>
                      <SelectItem value="Stakeholder Pension">Stakeholder Pension</SelectItem>
                      <SelectItem value="SIPP">SIPP</SelectItem>
                      <SelectItem value="With-Profits Pension">With-Profits Pension</SelectItem>
                      <SelectItem value="Group Pension">Group Pension</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending ? "Creating…" : "Create Case"}
                </button>
              </form>
            </DialogContent>
          </Dialog>
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  No cases found. Create one to get started.
                </td>
              </tr>
            ) : (
              filtered.map(c => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      {c.is_overdue && <AlertTriangle className="h-3.5 w-3.5 text-overdue" />}
                      {c.client_name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.provider_name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.plan_number}</td>
                  <td className="px-4 py-3"><StatusChip status={c.status as any} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{c.current_value || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.owner_name || '—'}</td>
                  <td className="px-4 py-3">
                    {(c.confidence_score ?? 0) > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${(c.confidence_score ?? 0) >= 80 ? 'bg-success' : (c.confidence_score ?? 0) >= 50 ? 'bg-warning' : 'bg-overdue'}`}
                            style={{ width: `${c.confidence_score}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{c.confidence_score}%</span>
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Cases;
