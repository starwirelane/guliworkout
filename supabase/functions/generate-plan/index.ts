import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const token = authHeader.replace("Bearer ", "");

    const supa = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: userData, error: userErr } = await supa.auth.getUser(token);
    if (userErr || !userData.user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const userId = userData.user.id;

    const { data: profile, error: profErr } = await supa.from("profiles").select("*").eq("id", userId).single();
    if (profErr || !profile) throw new Error("profile not found");

    const goalLabels: Record<string, string> = {
      lose_weight: "fat loss with cardio circuits and metabolic conditioning",
      build_muscle: "progressive strength training and hypertrophy",
      endurance: "cardiovascular endurance and conditioning",
      flexibility: "mobility, flexibility and stretching",
    };

    const systemPrompt = `You are an expert personal trainer. Create a safe, progressive 14-day plan personalized to the user. Each day has THREE short sessions: one MAIN workout focused on the user's goal, plus TWO LIGHT MOVEMENT BREAKS (gentle 3-7 minute mobility, walks, stretching, posture resets) so they keep moving throughout the day. Tailor difficulty to fitness level and equipment. Include rest days where the main session is also light. Return ONLY via the create_plan tool.`;

    const userPrompt = `Create a 14-day plan.
Name: ${profile.name}
Age: ${profile.age ?? "unknown"}
Weight: ${profile.weight_kg ?? "?"} kg
Height: ${profile.height_cm ?? "?"} cm
Fitness level: ${profile.fitness_level ?? "beginner"}
Equipment: ${profile.equipment ?? "bodyweight only"}
Goal: ${goalLabels[profile.goal] ?? profile.goal}

Each day must have:
- title (story-like)
- focus (one of: strength, cardio, mobility, rest, hiit, full body)
- motivation (1 sentence)
- sessions: array of EXACTLY 3 items in this order:
  1) MAIN workout for the goal (4-6 exercises) — kind: "main"
  2) Morning movement break (2-3 light items, ~5 min) — kind: "movement"
  3) Afternoon/evening movement break (2-3 light items, ~5 min) — kind: "movement"

Each session: kind ("main" | "movement"), title, suggested_time (e.g. "Anytime", "Morning", "Afternoon", "Evening"), and exercises (each with name, sets number, reps string like "10-12" or "30 sec", and a one-line cue). The main session's suggested_time should be "Anytime — pick when it fits".`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "create_plan",
            description: "Return the 14-day workout plan",
            parameters: {
              type: "object",
              properties: {
                days: {
                  type: "array",
                  minItems: 14,
                  maxItems: 14,
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      focus: { type: "string" },
                      motivation: { type: "string" },
                      sessions: {
                        type: "array",
                        minItems: 3,
                        maxItems: 3,
                        items: {
                          type: "object",
                          properties: {
                            kind: { type: "string", enum: ["main", "movement"] },
                            title: { type: "string" },
                            suggested_time: { type: "string" },
                            exercises: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  name: { type: "string" },
                                  sets: { type: "number" },
                                  reps: { type: "string" },
                                  cue: { type: "string" },
                                },
                                required: ["name", "sets", "reps", "cue"],
                                additionalProperties: false,
                              },
                            },
                          },
                          required: ["kind", "title", "suggested_time", "exercises"],
                          additionalProperties: false,
                        },
                      },
                    },
                    required: ["title", "focus", "motivation", "sessions"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["days"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "create_plan" } },
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI error", aiResp.status, t);
      if (aiResp.status === 429) return new Response(JSON.stringify({ error: "Rate limit, try again in a minute." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiResp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI gateway error");
    }

    const aiJson = await aiResp.json();
    const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI did not return a plan");
    const planArgs = JSON.parse(toolCall.function.arguments);
    const days = planArgs.days;

    await supa.from("plans").delete().eq("user_id", userId);
    const { data: inserted, error: insErr } = await supa
      .from("plans")
      .insert({ user_id: userId, goal: profile.goal, days })
      .select()
      .single();
    if (insErr) throw insErr;

    return new Response(JSON.stringify({ plan: inserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
