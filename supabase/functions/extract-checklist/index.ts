// Stage 3 — AI extraction for the plan-type checklist.
// Reads a single document, asks Gemini 2.5 Pro to extract the field schema,
// and returns structured fields with source page numbers. The CLIENT does the
// merge into checklist_fields so we can apply the "never overwrite human edits"
// rule with the freshest UI state.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface FieldDef {
  key: string;
  label: string;
  type: string;
  section: string;
  options?: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { documentId, planType, fields } = body as {
      documentId: string;
      planType: string;
      fields: FieldDef[];
    };

    if (!documentId || !planType || !Array.isArray(fields) || fields.length === 0) {
      return json({ error: "documentId, planType and fields are required" }, 400);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY missing" }, 500);

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Mark the document as extracting
    await supabase
      .from("documents")
      .update({ extraction_status: "extracting", extraction_error: null })
      .eq("id", documentId);

    // Load the document row
    const { data: doc, error: docErr } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .single();
    if (docErr || !doc) return failDoc(supabase, documentId, "Document not found", 404);
    if (!doc.file_path) return failDoc(supabase, documentId, "Document has no file_path", 400);

    // Download the PDF from storage and base64-encode in chunks (avoids stack overflow)
    const { data: file, error: dlErr } = await supabase.storage
      .from("policy-documents")
      .download(doc.file_path);
    if (dlErr || !file) return failDoc(supabase, documentId, "Could not download PDF", 500);

    const buf = new Uint8Array(await file.arrayBuffer());
    let bin = "";
    const chunk = 8192;
    for (let i = 0; i < buf.length; i += chunk) {
      bin += String.fromCharCode(...buf.subarray(i, i + chunk));
    }
    const base64 = btoa(bin);

    // Build the strict field schema for the AI tool call
    const fieldSchema = {
      type: "object",
      properties: {
        extracted: {
          type: "array",
          items: {
            type: "object",
            properties: {
              key: { type: "string", description: "EXACT key from the provided field list" },
              value: { type: ["string", "null"] },
              confidence: { type: "string", enum: ["HIGH", "MEDIUM", "LOW", "MISSING"] },
              source_page: { type: ["integer", "null"], description: "1-indexed PDF page number where the value was found" },
              source_section: { type: ["string", "null"], description: "Heading or section title near the value" },
              reasoning: { type: ["string", "null"], description: "One short sentence on how you found it" },
            },
            required: ["key", "value", "confidence"],
            additionalProperties: false,
          },
        },
      },
      required: ["extracted"],
      additionalProperties: false,
    };

    const fieldList = fields
      .map(
        (f) =>
          `- ${f.key} (${f.type}${f.options ? `, options: ${f.options.join("|")}` : ""}) — ${f.label} [section: ${f.section}]`,
      )
      .join("\n");

    const systemPrompt = `You are a meticulous UK financial-services document analyst working on a ceding (transfer-out) checklist.
You will be given a PDF policy pack and a list of expected fields for a ${planType} plan.
Extract only what is explicitly stated. Never guess values.
- Use the EXACT key from the field list — do not invent new keys.
- Format numbers as the document does (e.g. "£12,345.67", "1.25%").
- For yes/no fields, return exactly "Yes" or "No".
- If a field is not present in the document, set value to null and confidence to "MISSING".
- HIGH confidence: explicit value, clearly labelled. MEDIUM: value present but slightly ambiguous. LOW: inferred from related text.
- Always provide source_page (1-indexed) when you find a value.`;

    const userPrompt = `Plan type: ${planType}

Fields to extract:
${fieldList}

Return one entry per field key. Do not omit any field.`;

    // Call Lovable AI Gateway with the PDF as a file_data part + tool calling for structured output
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              {
                type: "file",
                file: {
                  filename: doc.file_name ?? "document.pdf",
                  file_data: `data:application/pdf;base64,${base64}`,
                },
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_extracted_fields",
              description: "Return the extracted field values for the ceding checklist",
              parameters: fieldSchema,
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_extracted_fields" } },
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        await failDoc(supabase, documentId, "AI rate limit — please retry shortly", 429);
        return json({ error: "Rate limit, please retry shortly." }, 429);
      }
      if (aiResp.status === 402) {
        await failDoc(supabase, documentId, "AI credits exhausted", 402);
        return json({ error: "AI credits exhausted. Top up in Settings → Workspace → Usage." }, 402);
      }
      const errText = await aiResp.text();
      console.error("AI gateway error", aiResp.status, errText);
      await failDoc(supabase, documentId, `AI gateway ${aiResp.status}`, 500);
      return json({ error: `AI gateway ${aiResp.status}` }, 500);
    }

    const aiData = await aiResp.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      await failDoc(supabase, documentId, "AI returned no tool call", 500);
      return json({ error: "AI returned no structured output" }, 500);
    }

    let parsed: { extracted: any[] };
    try {
      parsed = JSON.parse(toolCall.function.arguments);
    } catch (e) {
      console.error("Failed to parse tool call args", toolCall.function.arguments);
      await failDoc(supabase, documentId, "AI returned malformed JSON", 500);
      return json({ error: "AI returned malformed JSON" }, 500);
    }

    const extracted = parsed.extracted ?? [];

    // Mark document as extracted, attach raw payload
    await supabase
      .from("documents")
      .update({
        extraction_status: "extracted",
        status: "extracted",
        extracted_data: extracted,
        fields_extracted: extracted.filter((f: any) => f.value).length,
        avg_confidence: avgConfidence(extracted),
      })
      .eq("id", documentId);

    return json({
      success: true,
      documentId,
      extracted,
    });
  } catch (e) {
    console.error("extract-checklist error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function avgConfidence(items: any[]): number {
  const map: Record<string, number> = { HIGH: 95, MEDIUM: 70, LOW: 35, MISSING: 0 };
  if (!items.length) return 0;
  const total = items.reduce((s, it) => s + (map[it.confidence] ?? 0), 0);
  return Math.round(total / items.length);
}

async function failDoc(supabase: any, id: string, message: string, _status: number) {
  await supabase
    .from("documents")
    .update({ extraction_status: "error", extraction_error: message, status: "error" })
    .eq("id", id);
  return new Response(JSON.stringify({ error: message }), {
    status: 500,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
