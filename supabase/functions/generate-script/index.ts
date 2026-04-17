import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface MissingFieldInput {
  key: string;
  label: string;
  section: string;
  hint?: string | null;
}
interface ReviewFieldInput {
  key: string;
  label: string;
  section: string;
  value: string | null;
  confidence: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const fields: MissingFieldInput[] = body.fields ?? [];
    const reviewFields: ReviewFieldInput[] = body.reviewFields ?? [];
    const clientName: string = body.clientName ?? "the client";
    const providerName: string = body.providerName ?? "the provider";
    const planNumber: string = body.planNumber ?? "N/A";
    const planType: string = body.planType ?? "policy";

    if (fields.length === 0 && reviewFields.length === 0) {
      return new Response(
        JSON.stringify({ error: "No missing or review fields provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) throw new Error("LOVABLE_API_KEY not configured");

    const missingList = fields
      .map((f) => `- [${f.key}] ${f.label} (${f.section})${f.hint ? ` — hint: ${f.hint}` : ""}`)
      .join("\n");
    const reviewList = reviewFields
      .map(
        (f) =>
          `- [${f.key}] ${f.label} (${f.section}) — current value "${f.value ?? "—"}" with ${f.confidence} confidence (verify)`,
      )
      .join("\n");

    const systemPrompt = `You are a UK financial services call-script generator. You produce concise, professional telephone scripts for a Client Administrator (CA) calling a pension/investment provider to obtain or verify policy data on behalf of a client.

Rules:
- Polite, professional, UK English. No filler.
- Open by referencing the client name, provider, and plan/policy number; confirm an LOA is on file.
- Group related questions (Plan Details / Valuation / Charges / Benefits / etc.) and order them logically.
- For MISSING fields: ask a direct question that will yield the value.
- For REVIEW fields: read the current value back and ask the agent to confirm or correct.
- Include 2-3 likely objection handlers (e.g. "we can only send by post", "the data protection team needs to verify").
- End with a polite sign-off and a request for an email/Origo confirmation if appropriate.
- Return your response via the provided tool only.`;

    const userPrompt = `Plan type: ${planType}
Client: ${clientName}
Provider: ${providerName}
Plan number: ${planNumber}

${missingList ? `MISSING FIELDS (need to obtain):\n${missingList}\n\n` : ""}${reviewList ? `REVIEW FIELDS (verify with the agent):\n${reviewList}\n\n` : ""}Generate a structured call script.`;

    const tool = {
      type: "function",
      function: {
        name: "build_call_script",
        description: "Return a structured call script for the CA to read.",
        parameters: {
          type: "object",
          properties: {
            opener: {
              type: "string",
              description: "1-2 sentence introduction the CA reads first.",
            },
            sections: {
              type: "array",
              description: "Grouped question blocks, ordered logically.",
              items: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Section name (e.g. 'Plan Details')" },
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        field_key: {
                          type: "string",
                          description: "Matching field key from the input (or 'general').",
                        },
                        question: {
                          type: "string",
                          description: "The exact question the CA should ask.",
                        },
                        purpose: {
                          type: "string",
                          enum: ["obtain", "verify"],
                        },
                      },
                      required: ["field_key", "question", "purpose"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["title", "questions"],
                additionalProperties: false,
              },
            },
            objection_handlers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  objection: { type: "string" },
                  response: { type: "string" },
                },
                required: ["objection", "response"],
                additionalProperties: false,
              },
            },
            closing: { type: "string", description: "Sign-off line(s)." },
          },
          required: ["opener", "sections", "objection_handlers", "closing"],
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
        tool_choice: { type: "function", function: { name: "build_call_script" } },
      }),
    });

    if (!aiResponse.ok) {
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
      throw new Error(`AI gateway returned ${status}: ${errorBody}`);
    }

    const result = await aiResponse.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI did not return a tool call");
    const args = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ script: args }), {
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
