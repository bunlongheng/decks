import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { isLocal } from "@/lib/is-local";
import { renderDeck, type DeckInput } from "@/lib/deck-gen";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

type ThemeId = "minimal" | "dark" | "neon" | "corporate" | "playful" | "gradient";

const THEME_MAP: Record<ThemeId, { mode: "slides"; theme: "light"; accent: string }> = {
  minimal:   { mode: "slides", theme: "light", accent: "#111111" },
  dark:      { mode: "slides", theme: "light", accent: "#0a0a0a" },
  neon:      { mode: "slides", theme: "light", accent: "#00ffff" },
  corporate: { mode: "slides", theme: "light", accent: "#1e40af" },
  playful:   { mode: "slides", theme: "light", accent: "#f59e0b" },
  gradient:  { mode: "slides", theme: "light", accent: "#818cf8" },
};

const SYSTEM = `You are an expert slide deck author. Given a user topic, return ONLY a single JSON object (no markdown fences, no commentary) describing a slide deck.

Required shape:
{
  "title": "<deck title>",
  "subtitle": "<optional subtitle>",
  "mode": "slides",
  "sections": [ /* 6-9 sections */ ]
}

Each section must have a "type" from this allowed list ONLY:
- "cover"     { title, subtitle?, meta?, date? }
- "feature"   { title, subtitle?, description?, bullets?: string[], icon? }
- "stack"     { title?, groups: [{ label, items: string[] }] }
- "checklist" { title?, done?: string[], todo?: string[] }
- "roadmap"   { title?, items: [{ label, detail? }] }
- "summary"   { title?, points: string[] }
- "cards"     { title?, cards: [{ value, label, color? }] }
- "table"     { title?, columns: string[], rows: (string[] | { cells: string[], status? })[] }
- "kv"        { title?, pairs: [{ key, value, status? }] }
- "badges"    { title?, items: [{ label, status? }] }
- "text"      { title?, content: string, pre?: boolean }

DO NOT use type "diagram" or any other type not in this list.

Slide blueprint (in order):
1. cover
2. stack (tech / pillars / building blocks)
3-6. feature (3-4 deep-dive slides)
7. checklist (done vs todo, or pros vs cons recast)
8. roadmap (phases / milestones)
9. summary (key takeaways)

Aim for 6-9 sections total. Always include "mode": "slides". No markdown code fences. Return ONLY the JSON object.`;

export async function POST(req: NextRequest) {
  // Auth: bypass for localhost/LAN, require session in production
  if (!isLocal(req)) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { topic?: string; theme?: ThemeId };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const topic = body.topic?.trim();
  const themeId = body.theme;
  if (!topic) return NextResponse.json({ error: "topic is required" }, { status: 400 });
  if (!themeId || !THEME_MAP[themeId]) {
    return NextResponse.json({ error: "valid theme is required" }, { status: 400 });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const userMsg = `Topic: ${topic}\n\nGenerate a slide deck.`;

  async function callClaude(extraSystem = ""): Promise<string> {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: SYSTEM + extraSystem,
      messages: [{ role: "user", content: userMsg }],
    });
    return msg.content.find(b => b.type === "text")?.text ?? "";
  }

  let data: DeckInput;
  try {
    let text = await callClaude();
    let jsonMatch = text.match(/\{[\s\S]*\}/);
    let parsed: any;
    try {
      if (!jsonMatch) throw new Error("No JSON in response");
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      // Retry once with stronger instruction
      text = await callClaude("\n\nReturn ONLY the JSON object, no markdown fences.");
      jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return NextResponse.json({ error: "Model did not return JSON" }, { status: 502 });
      }
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        return NextResponse.json({ error: "Model returned invalid JSON" }, { status: 502 });
      }
    }
    if (!parsed || !Array.isArray(parsed.sections)) {
      return NextResponse.json({ error: "Model JSON missing sections array" }, { status: 502 });
    }
    // Strip any forbidden diagram sections defensively
    parsed.sections = parsed.sections.filter((s: any) => s && s.type !== "diagram");
    data = parsed as DeckInput;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // Overwrite mode/theme/accent from UI choice
  const themeCfg = THEME_MAP[themeId];
  data.mode = themeCfg.mode;
  data.theme = themeCfg.theme;
  data.accent = themeCfg.accent;

  let html: string;
  try {
    html = await renderDeck(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Render failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Deck-Title": encodeURIComponent(data.title || "Deck"),
    },
  });
}
