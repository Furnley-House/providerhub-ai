/**
 * Service Layer — Backend-agnostic interfaces
 * 
 * PORTABILITY NOTE: When migrating to Node.js/Express/Azure:
 * 1. Replace the implementations in this file with API calls to your Node.js backend
 * 2. Keep the same interface signatures — all frontend code uses these functions
 * 3. The AI extraction endpoint just needs to be an OpenAI-compatible chat completions API
 */

import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

// ==================== CASES ====================

export async function getCases() {
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getCaseById(id: string) {
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function getCaseByRef(ref: string) {
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .eq("case_ref", ref)
    .single();
  if (error) throw error;
  return data;
}

export async function createCase(caseData: TablesInsert<"cases">) {
  const { data, error } = await supabase.from("cases").insert(caseData).select().single();
  if (error) throw error;
  return data;
}

export async function updateCase(id: string, updates: Partial<Tables<"cases">>) {
  const { data, error } = await supabase.from("cases").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// ==================== CHECKLIST ====================

export async function getChecklistFields(caseId: string) {
  const { data, error } = await supabase
    .from("checklist_fields")
    .select("*")
    .eq("case_id", caseId)
    .order("section", { ascending: true });
  if (error) throw error;
  return data;
}

export async function upsertChecklistFields(fields: TablesInsert<"checklist_fields">[]) {
  const { data, error } = await supabase.from("checklist_fields").upsert(fields).select();
  if (error) throw error;
  return data;
}

export async function updateChecklistField(id: string, updates: Partial<Tables<"checklist_fields">>) {
  const { data, error } = await supabase.from("checklist_fields").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// ==================== DOCUMENTS ====================

export async function getDocuments(caseId?: string) {
  let query = supabase.from("documents").select("*").order("created_at", { ascending: false });
  if (caseId) query = query.eq("case_id", caseId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function uploadPolicyDocument(file: File, caseId: string) {
  const filePath = `${caseId}/${Date.now()}_${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("policy-documents")
    .upload(filePath, file);
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from("documents")
    .insert({
      case_id: caseId,
      file_name: file.name,
      file_path: filePath,
      status: "pending",
      uploaded_by: (await supabase.auth.getUser()).data.user?.id,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ==================== AI EXTRACTION ====================

export async function runAIExtraction(documentId: string) {
  const { data, error } = await supabase.functions.invoke("extract-policy", {
    body: { documentId },
  });
  if (error) throw error;
  return data;
}

// ==================== PROVIDERS ====================

export async function getProviders() {
  const { data, error } = await supabase.from("providers").select("*").order("name");
  if (error) throw error;
  return data;
}

// ==================== TASKS ====================

export async function getTasks(completed?: boolean) {
  let query = supabase.from("tasks").select("*").order("due_date", { ascending: true });
  if (completed !== undefined) query = query.eq("completed", completed);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function updateTask(id: string, updates: Partial<Tables<"tasks">>) {
  const { data, error } = await supabase.from("tasks").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// ==================== AUTOMATION RULES ====================

export async function getAutomationRules() {
  const { data, error } = await supabase.from("automation_rules").select("*").order("created_at");
  if (error) throw error;
  return data;
}

export async function updateAutomationRule(id: string, updates: Partial<Tables<"automation_rules">>) {
  const { data, error } = await supabase.from("automation_rules").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}
