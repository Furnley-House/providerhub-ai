import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import type { ChecklistFieldDef } from "@/lib/checklistTemplates";
import { useRole } from "@/hooks/useRole";

export type ChecklistRow = Tables<"checklist_fields">;

interface UseChecklistArgs {
  caseId: string;
  template: ChecklistFieldDef[];
}

/**
 * Loads checklist_fields for a case, seeding the table from the template
 * on first open. Provides update / merge helpers and writes audit-log rows
 * for every change.
 */
export function useChecklistFields({ caseId, template }: UseChecklistArgs) {
  const { role, userName } = useRole();
  const [rows, setRows] = useState<ChecklistRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("checklist_fields")
      .select("*")
      .eq("case_id", caseId);
    if (error) console.error("useChecklistFields refresh error", error);
    setRows(data ?? []);
    setLoading(false);
  }, [caseId]);

  // Initial load + seed if empty
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("checklist_fields")
        .select("*")
        .eq("case_id", caseId);
      if (error) {
        console.error(error);
        if (!cancelled) setLoading(false);
        return;
      }

      const existingKeys = new Set((data ?? []).map((r) => r.field_key).filter(Boolean));
      const missingTemplateRows = template.filter((t) => !existingKeys.has(t.key));
      if (missingTemplateRows.length > 0) {
        const seed = missingTemplateRows.map((t) => ({
          case_id: caseId,
          field_key: t.key,
          label: t.label,
          section: t.section,
          value: null,
          confidence: "MISSING",
          status: "missing",
          manually_edited: false,
        }));
        const { error: seedErr } = await supabase.from("checklist_fields").insert(seed);
        if (seedErr) console.error("seed error", seedErr);
        const { data: refreshed } = await supabase
          .from("checklist_fields")
          .select("*")
          .eq("case_id", caseId);
        if (!cancelled) setRows(refreshed ?? []);
      } else {
        if (!cancelled) setRows(data ?? []);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [caseId, template]);

  // Realtime updates
  useEffect(() => {
    const channel = supabase
      .channel(`checklist-${caseId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "checklist_fields", filter: `case_id=eq.${caseId}` },
        () => refresh(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [caseId, refresh]);

  const byKey = useMemo(() => {
    const m = new Map<string, ChecklistRow>();
    rows.forEach((r) => {
      if (r.field_key) m.set(r.field_key, r);
    });
    return m;
  }, [rows]);

  const updateField = async (
    fieldKey: string,
    patch: Partial<ChecklistRow>,
    audit?: { action: string; notes?: string | null },
  ) => {
    const existing = byKey.get(fieldKey);
    if (!existing) return;
    const merged: Partial<ChecklistRow> = { ...patch };
    // Mark manually edited when the value changes via UI
    if (patch.value !== undefined && patch.value !== existing.value) {
      merged.manually_edited = true;
    }
    const { error } = await supabase
      .from("checklist_fields")
      .update(merged)
      .eq("id", existing.id);
    if (error) {
      console.error("updateField error", error);
      return;
    }
    if (audit) {
      await supabase.from("field_audit").insert({
        case_id: caseId,
        field_key: fieldKey,
        field_label: existing.label,
        action: audit.action,
        source: "manual",
        old_value: existing.value,
        new_value: patch.value !== undefined ? (patch.value as string | null) : existing.value,
        confidence: (patch.confidence as string | undefined) ?? existing.confidence,
        actor_role: role ?? null,
        actor_name: userName ?? null,
        notes: audit.notes ?? null,
      });
    }
    // Optimistically refresh
    refresh();
  };

  const approveAllFilled = async () => {
    const ids = rows
      .filter((r) => r.value && r.status !== "approved" && r.status !== "review_requested")
      .map((r) => r.id);
    if (ids.length === 0) return;
    const { error } = await supabase
      .from("checklist_fields")
      .update({ status: "approved", reviewed_by: null })
      .in("id", ids);
    if (error) console.error(error);
    await supabase.from("field_audit").insert(
      ids.map((id) => {
        const r = rows.find((x) => x.id === id)!;
        return {
          case_id: caseId,
          field_key: r.field_key,
          field_label: r.label,
          action: "approve",
          source: "manual",
          old_value: r.value,
          new_value: r.value,
          confidence: r.confidence,
          actor_role: role ?? null,
          actor_name: userName ?? null,
          notes: "Bulk approve",
        };
      }),
    );
    refresh();
  };

  return { rows, byKey, loading, refresh, updateField, approveAllFilled };
}
