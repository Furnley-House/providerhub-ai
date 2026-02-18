import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CHECKLIST_SECTIONS = {
  "Basic Details": [
    "Provider Name", "Plan Number", "Type of Pension", "Status", "Start Date",
    "Normal Retirement Age", "Provider Telephone & Email", "Inherited Pension"
  ],
  "Transaction History": [
    "Regular Contributions - Personal (Gross)", "Regular Contributions - Employer",
    "Withdrawals", "% Crystallised", "Contributions 2025/2026", "Contributions 2024/2025"
  ],
  "Valuation & Fund Details": [
    "Current Value", "Transfer Value", "Fund Details", "Lifestyling Active"
  ],
  "Charges": [
    "Annual Fund Charge", "Exit Charge / Penalty", "Bid/Offer Spread", "Policy Fee"
  ],
  "Guarantees": [
    "Guaranteed Annuity Rate (GAR)", "Guaranteed Minimum Pension (GMP)",
    "Protected Tax-Free Cash", "Waiver of Premiums"
  ],
  "Benefits & Options": [
    "Origo Transfer Available", "Partial Transfer Available", "Drawdown Available"
  ],
  "Death Benefits": [
    "Death Benefit Options", "Beneficiaries", "Life Cover"
  ],
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { documentId } = await req.json();
    if (!documentId) throw new Error("documentId is required");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get document record
    const { data: doc, error: docErr } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .single();
    if (docErr || !doc) throw new Error("Document not found");

    // Download file from storage
    const { data: fileData, error: dlErr } = await supabase.storage
      .from("policy-documents")
      .download(doc.file_path);
    if (dlErr || !fileData) throw new Error("Could not download file");

    // Convert to base64 for AI processing (chunked to avoid stack overflow)
    const arrayBuffer = await fileData.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    const base64 = btoa(binary);

    // Build the extraction prompt
    const fieldsList = Object.entries(CHECKLIST_SECTIONS)
      .flatMap(([section, fields]) => fields.map(f => `${section} > ${f}`))
      .join("\n");

    const systemPrompt = `You are a UK financial services document analyst. You extract pension policy information from documents and map it to a standard ceding checklist.

For each field, provide:
- value: the extracted value (null if not found)
- confidence: "high", "medium", or "low"
- evidence_ref: where in the document you found this (e.g. "Page 1, Plan value section")
- status: "complete" if value found with high/medium confidence, "needs_review" if low confidence, "missing" if not found

Return a JSON array of objects with: section, label, value, confidence, evidence_source ("pdf"), evidence_ref, status`;

    const userPrompt = `Extract the following fields from this pension policy PDF document. The document is base64 encoded.

Fields to extract:
${fieldsList}

Document content (base64 PDF): ${base64.substring(0, 50000)}

Return ONLY valid JSON array. No markdown, no code blocks.`;

    // Call Lovable AI Gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "AI rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please top up." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", status, errText);
      throw new Error(`AI gateway returned ${status}`);
    }

    const aiResult = await aiResponse.json();
    const content = aiResult.choices?.[0]?.message?.content;

    // Parse AI response
    let extractedFields: any[];
    try {
      // Strip any markdown code block wrapper
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      extractedFields = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("AI returned invalid JSON");
    }

    // Compute stats
    const completeFields = extractedFields.filter((f: any) => f.status === "complete").length;
    const totalFields = extractedFields.length;
    const avgConf = Math.round(
      extractedFields
        .filter((f: any) => f.confidence)
        .reduce((sum: number, f: any) => sum + (f.confidence === "high" ? 95 : f.confidence === "medium" ? 65 : 30), 0) / Math.max(totalFields, 1)
    );

    // Try to detect provider name and plan number from extracted fields
    const providerField = extractedFields.find((f: any) => f.label === "Provider Name");
    const planField = extractedFields.find((f: any) => f.label === "Plan Number");
    const pensionTypeField = extractedFields.find((f: any) => f.label === "Type of Pension");
    const detectedProvider = providerField?.value || doc.provider_name || "Unknown Provider";
    const detectedPlan = planField?.value || "Unknown";
    const detectedType = pensionTypeField?.value || "Personal Pension";

    // Auto-create case if document has no case_id
    let caseId = doc.case_id;
    if (!caseId) {
      const caseRef = `CASE-${Date.now().toString(36).toUpperCase()}`;
      const { data: newCase, error: caseErr } = await supabase.from("cases").insert({
        case_ref: caseRef,
        client_name: doc.file_name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " "),
        provider_name: detectedProvider,
        plan_number: detectedPlan,
        plan_type: detectedType,
        status: "ceding_in_progress",
        ai_extraction_date: new Date().toISOString().split("T")[0],
        confidence_score: avgConf,
        missing_fields_count: totalFields - completeFields,
      }).select().single();

      if (caseErr) {
        console.error("Case creation error:", caseErr);
      } else {
        caseId = newCase.id;
        // Link document to the new case
        await supabase.from("documents").update({ case_id: caseId }).eq("id", documentId);
      }
    } else {
      // Update existing case
      await supabase.from("cases").update({
        ai_extraction_date: new Date().toISOString().split("T")[0],
        confidence_score: avgConf,
        missing_fields_count: totalFields - completeFields,
        status: "ceding_in_progress",
      }).eq("id", caseId);
    }

    // Insert checklist fields
    if (caseId) {
      const checklistRows = extractedFields.map((f: any) => ({
        case_id: caseId,
        section: f.section || "Unknown",
        label: f.label || "Unknown",
        value: f.value || null,
        confidence: f.confidence || null,
        evidence_source: "pdf" as const,
        evidence_ref: f.evidence_ref || null,
        status: f.status || "missing",
      }));

      // Delete existing fields for this case (re-extraction)
      await supabase.from("checklist_fields").delete().eq("case_id", caseId);

      const { error: insertErr } = await supabase.from("checklist_fields").insert(checklistRows);
      if (insertErr) console.error("Checklist insert error:", insertErr);
    }

    // Always update document status
    await supabase.from("documents").update({
      status: "extracted",
      fields_extracted: completeFields,
      avg_confidence: avgConf,
      extracted_data: extractedFields,
      provider_name: detectedProvider,
    }).eq("id", documentId);

    return new Response(JSON.stringify({ 
      success: true, 
      fieldsExtracted: extractedFields.length,
      fields: extractedFields,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("extract-policy error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
