import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { fields, reviewFields, clientName, providerName, planNumber } = await req.json();
    if ((!fields || fields.length === 0) && (!reviewFields || reviewFields.length === 0)) {
      throw new Error("fields or reviewFields array is required");
    }

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) throw new Error("LOVABLE_API_KEY not configured");

    const missingList = (fields || []).map((f: any) => `- ${f.label} (section: ${f.section}) — MISSING, no value extracted`).join("\n");
    const reviewList = (reviewFields || []).map((f: any) => `- ${f.label} (section: ${f.section}) — current value: "${f.value}", confidence: ${f.confidence} — NEEDS VERIFICATION`).join("\n");

    const systemPrompt = `You are a UK financial services call script generator. You create professional, concise telephone scripts for pension administrators to call providers and obtain or verify policy information.

Rules:
- Be polite and professional
- Reference the client name, provider, and plan number
- For MISSING fields: ask the provider to supply the information
- For NEEDS VERIFICATION fields: read back the current value and ask the provider to confirm or correct it
- Group related questions together logically
- Include a brief introduction and sign-off
- Keep it natural and conversational
- Return ONLY the script text, no markdown formatting`;

    const userPrompt = `Generate a telephone call script for the following case:

Client: ${clientName || "the client"}
Provider: ${providerName || "the provider"}
Plan Number: ${planNumber || "N/A"}

${missingList ? `Missing fields (need to obtain):\n${missingList}\n` : ""}
${reviewList ? `Fields to verify:\n${reviewList}\n` : ""}
Generate a professional call script covering all items above.`;

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
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please top up." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway returned ${status}`);
    }

    const result = await aiResponse.json();
    const script = result.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ script }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-script error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
