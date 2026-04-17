import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type DocumentRow = Tables<"documents">;

export function useDocuments(caseId: string | undefined) {
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!caseId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: true });
    if (error) console.error("useDocuments error", error);
    setDocuments(data ?? []);
    setLoading(false);
  }, [caseId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Realtime — react to extraction status changes
  useEffect(() => {
    if (!caseId) return;
    const channel = supabase
      .channel(`documents-${caseId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "documents", filter: `case_id=eq.${caseId}` },
        () => refresh(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [caseId, refresh]);

  const removeDocument = async (doc: DocumentRow) => {
    if (doc.file_path) {
      await supabase.storage.from("policy-documents").remove([doc.file_path]);
    }
    await supabase.from("documents").delete().eq("id", doc.id);
    await refresh();
  };

  return { documents, loading, refresh, removeDocument };
}

export async function uploadDocumentFile({
  caseId,
  file,
}: {
  caseId: string;
  file: File;
}): Promise<DocumentRow | null> {
  const ext = file.name.split(".").pop() ?? "pdf";
  const path = `cases/${caseId}/${crypto.randomUUID()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("policy-documents")
    .upload(path, file, { contentType: file.type || "application/pdf", upsert: false });
  if (upErr) {
    console.error("upload error", upErr);
    throw upErr;
  }

  const { data, error } = await supabase
    .from("documents")
    .insert({
      case_id: caseId,
      file_name: file.name,
      file_path: path,
      document_type: "Policy Pack",
      status: "pending",
      extraction_status: "pending",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getSignedUrl(filePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from("policy-documents")
    .createSignedUrl(filePath, 60 * 60); // 1h
  if (error) {
    console.error("signed url error", error);
    return null;
  }
  return data?.signedUrl ?? null;
}
