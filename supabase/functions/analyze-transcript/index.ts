import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Two modes:
 *  - mode: "extract"  → structured field extraction from transcript (default if `targets` provided)
 *  - mode: "qa"       → free-text Q&A on the transcript (legacy CallAssist behaviour)
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const transcript: string = body.transcript ?? "";
    const mode: "extract" | "qa" = body.mode ?? (body.targets ? "extract" : "qa");
    if (!transcript) throw new Error("transcript is required");

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) throw new Error("LOVABLE_API_KEY not configured");

    if (mode === "qa") {
      const question: string = body.question ?? "";
      if (!question) throw new Error("question is required in qa mode");

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content:
                "You analyse UK financial-services call transcripts. Be precise; only state what is in the transcript. If the answer isn't there, say so.",
            },
            { role: "user", content: `Transcript:\n---\n${transcript}\n---\n\nQuestion: ${question}` },
          ],
        }),
      });
      if (!aiResponse.ok) return forwardError(aiResponse);
      const result = await aiResponse.json();
      return new Response(
        JSON.stringify({ answer: result.choices?.[0]?.message?.content ?? "" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ===== Extract mode =====
    const targets: Array<{ key: string; label: string; section: string; type?: string; hint?: string }> =
      body.targets ?? [];
    const clientName: string = body.clientName ?? "the client";
    const providerName: string = body.providerName ?? "the provider";
    const planNumber: string = body.planNumber ?? "N/A";

    if (targets.length === 0) throw new Error("targets array is required in extract mode");

    const targetsList = targets
      .map((t) => `- key: "${t.key}" — ${t.label} (${t.section}, type: ${t.type ?? "text"})${t.hint ? ` — ${t.hint}` : ""}`)
      .join("\n");

    const systemPrompt = `You extract structured policy/pension information from a transcript of a UK call between a Client Administrator and a provider's agent. You ONLY return values that are clearly stated in the transcript by the agent (or confirmed by them). For each requested field:
- Set value to the exact figure / answer the agent gave (normalise currency to £ form, percentages to "x.xx%", dates to YYYY-MM-DD when possible).
- Set confidence: HIGH if the agent stated it unambiguously, MEDIUM if implied or partially stated, LOW if uncertain, MISSING if not discussed.
- Always include a short evidence_quote (≤200 chars) directly from the transcript.
- Provide an overall summary (3-6 short sentences) covering what was confirmed, what's outstanding, and any next steps the agent mentioned.
- Return everything via the provided tool.`;

    const userPrompt = `Client: ${clientName}
Provider: ${providerName}
Plan number: ${planNumber}

Fields to extract from the transcript:
${targetsList}

Transcript:
"""
${transcript}
"""`;

    const tool = {
      type: "function",
      function: {
        name: "extract_from_transcript",
        description: "Return extracted field values + a summary.",
        parameters: {
          type: "object",
          properties: {
            summary: { type: "string", description: "AI summary of the call." },
            extracted: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  key: { type: "string" },
                  value: { type: ["string", "null"] },
                  confidence: { type: "string", enum: ["HIGH", "MEDIUM", "LOW", "MISSING"] },
                  evidence_quote: { type: "string" },
                  reasoning: { type: "string" },
                },
                required: ["key", "value", "confidence", "evidence_quote"],
                additionalProperties: false,
              },
            },
          },
          required: ["summary", "extracted"],
          additionalProperties: false,
        },
      },
    };

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "extract_from_transcript" } },
      }),
    });
    if (!aiResponse.ok) return forwardError(aiResponse);
    const result = await aiResponse.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI did not return a tool call");
    const args = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(args), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-transcript error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function forwardError(aiResponse: Response) {
  const status = aiResponse.status;
  const errorBody = await aiResponse.text();
  console.error("AI gateway error:", status, errorBody);
  if (status === 429) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (status === 402) {
    return new Response(
      JSON.stringify({ error: "AI credits exhausted. Please add funds to your Lovable AI workspace." }),
      { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  return new Response(JSON.stringify({ error: `AI gateway returned ${status}: ${errorBody}` }), {
    status: 500,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
