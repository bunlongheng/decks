"use client";
import { useState, ReactNode, CSSProperties } from "react";
import { showToast } from "@/app/CuteToast";

const THEMES = [
  { id: "minimal",   name: "Minimal",   desc: "Sharp + clean",     accent: "#111111" },
  { id: "dark",      name: "Dark",      desc: "Deep blacks",       accent: "#0a0a0a" },
  { id: "neon",      name: "Neon",      desc: "Electric energy",   accent: "#06b6d4" },
  { id: "corporate", name: "Corporate", desc: "Trust + scale",     accent: "#1e40af" },
  { id: "playful",   name: "Playful",   desc: "Warm + rounded",    accent: "#f59e0b" },
  { id: "gradient",  name: "Gradient",  desc: "Flowing colors",    accent: "#a855f7" },
] as const;

type ThemeId = (typeof THEMES)[number]["id"];

const ARCHIVO = "'Archivo Black', system-ui, sans-serif";
const DM = "'DM Sans', system-ui, sans-serif";

type StickerProps = {
  color: string;
  rot: number;
  size?: number;
  style: CSSProperties;
  children: ReactNode;
};

function Sticker({ color, rot, size = 90, style, children }: StickerProps) {
  return (
    <div
      className="absolute pointer-events-none z-0 select-none"
      style={{
        ...style,
        width: size,
        height: size,
        transform: `rotate(${rot}deg)`,
        filter: "drop-shadow(4px 4px 0 #000)",
      }}
      aria-hidden
    >
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        fill={color}
        stroke="#000"
        strokeWidth={6}
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {children}
      </svg>
    </div>
  );
}

const BoltPath = <path d="M62 6 L18 56 L42 56 L34 94 L82 40 L54 40 L66 6 Z" />;
const StarPath = <path d="M50 8 L61 38 L92 38 L67 56 L77 86 L50 68 L23 86 L33 56 L8 38 L39 38 Z" />;
const HeartPath = <path d="M50 88 C20 66 8 42 24 22 C36 10 46 14 50 26 C54 14 64 10 76 22 C92 42 80 66 50 88 Z" />;
const BurstPath = (
  <path d="M50 6 L57 36 L87 28 L66 52 L94 64 L62 64 L70 92 L50 72 L30 92 L38 64 L6 64 L34 52 L13 28 L43 36 Z" />
);
const SmilePath = (
  <>
    <circle cx="50" cy="50" r="40" />
    <circle cx="36" cy="42" r="4" fill="#000" stroke="none" />
    <circle cx="64" cy="42" r="4" fill="#000" stroke="none" />
    <path d="M32 60 Q50 78 68 60" fill="none" />
  </>
);
const EyePath = (
  <>
    <ellipse cx="50" cy="50" rx="42" ry="28" />
    <circle cx="50" cy="50" r="14" fill="#000" stroke="none" />
    <circle cx="56" cy="44" r="4" fill="#fff" stroke="none" />
  </>
);
const PlanetPath = (
  <>
    <circle cx="50" cy="50" r="22" />
    <ellipse cx="50" cy="50" rx="44" ry="10" fill="none" transform="rotate(-18 50 50)" />
  </>
);
const SpeechPath = <path d="M12 22 H88 V64 H56 L40 92 L42 64 H12 Z" />;

export default function DecksHome() {
  const [topic, setTopic] = useState("");
  const [theme, setTheme] = useState<ThemeId>("playful");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim() || generating) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-deck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, theme }),
      });
      if (!res.ok) {
        let errMsg = `Failed (${res.status})`;
        try {
          const j = await res.json();
          if (j?.error) errMsg = j.error;
        } catch {}
        showToast(errMsg, { color: "#ef4444" });
        return;
      }
      const html = await res.text();
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Network error";
      showToast(msg, { color: "#ef4444" });
    } finally {
      setGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleGenerate();
    }
  };

  const cardRot = [-1.5, 1.2, -2, 1.8, -1, 2];

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden"
      style={{ background: "#fde047", fontFamily: DM }}
    >
      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.08] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Sticker bomb decoration */}
      <Sticker color="#ff3d8b" rot={-14} size={100} style={{ top: "3%", left: "4%" }}>{BoltPath}</Sticker>
      <Sticker color="#4d6dff" rot={10}  size={86}  style={{ top: "8%", right: "5%" }}>{StarPath}</Sticker>
      <Sticker color="#10b981" rot={-6}  size={78}  style={{ top: "26%", left: "2%" }}>{SmilePath}</Sticker>
      <Sticker color="#a855f7" rot={14}  size={92}  style={{ top: "30%", right: "3%" }}>{BurstPath}</Sticker>
      <Sticker color="#ef4444" rot={-10} size={82}  style={{ bottom: "26%", left: "3%" }}>{PlanetPath}</Sticker>
      <Sticker color="#ffffff" rot={8}   size={78}  style={{ bottom: "30%", right: "4%" }}>{EyePath}</Sticker>
      <Sticker color="#fb923c" rot={-12} size={96}  style={{ bottom: "5%", left: "8%" }}>{HeartPath}</Sticker>
      <Sticker color="#06b6d4" rot={9}   size={88}  style={{ bottom: "6%", right: "7%" }}>{SpeechPath}</Sticker>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-10 py-6">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 bg-black flex items-center justify-center"
            style={{ boxShadow: "4px 4px 0 #000", border: "3px solid #000" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fde047" strokeWidth="2" strokeLinejoin="round">
              <circle cx="11" cy="15" r="6" fill="#fde047" />
              <path d="M16 7 L18 4 L21 5 L20 8" strokeLinecap="round" />
              <circle cx="22" cy="3" r="1" fill="#fde047" stroke="none" />
              <circle cx="20" cy="2" r="0.7" fill="#fde047" stroke="none" />
            </svg>
          </div>
          <span
            className="text-2xl uppercase text-black"
            style={{ fontFamily: ARCHIVO, letterSpacing: "-0.02em" }}
          >
            DECKS
          </span>
        </div>
        <div
          className="hidden sm:block px-3 py-1.5 bg-white text-black text-[10px] uppercase tracking-widest"
          style={{
            fontFamily: ARCHIVO,
            border: "3px solid #000",
            boxShadow: "3px 3px 0 #000",
            transform: "rotate(-2deg)",
          }}
        >
          AI Slide Bomb
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 max-w-2xl mx-auto px-5 sm:px-6 pt-6 pb-24">
        {/* Hero */}
        <div className="text-center mb-10 mt-4">
          <h1
            className="leading-[0.88] mb-6 uppercase text-black text-[64px] sm:text-[88px]"
            style={{ fontFamily: ARCHIVO, letterSpacing: "-0.04em" }}
          >
            MAKE A
            <br />
            <span
              className="inline-block px-3 sm:px-5 py-1 bg-[#ff3d8b] text-white align-baseline"
              style={{
                border: "5px solid #000",
                boxShadow: "8px 8px 0 #000",
                transform: "rotate(-2deg)",
                margin: "0.15em 0 0.1em",
              }}
            >
              BANGER
            </span>
            <br />
            DECK.
          </h1>
          <p
            className="text-base sm:text-lg text-black/75 max-w-md mx-auto leading-snug font-semibold"
            style={{ fontFamily: DM }}
          >
            Type a topic. Pick a vibe. Get a slide deck that doesn{"'"}t suck.
          </p>
        </div>

        {/* Form panel */}
        <div
          className="bg-[#fffbe8] p-5 sm:p-7 relative"
          style={{ border: "5px solid #000", boxShadow: "10px 10px 0 #000" }}
        >
          {/* TOPIC */}
          <div className="mb-7">
            <label
              htmlFor="topic"
              className="inline-block px-3 py-1 mb-3 bg-[#c1ff3d] text-black text-xs uppercase"
              style={{
                fontFamily: ARCHIVO,
                border: "3px solid #000",
                boxShadow: "3px 3px 0 #000",
                transform: "rotate(-1.5deg)",
                letterSpacing: "0.04em",
              }}
            >
              YOUR TOPIC
            </label>
            <textarea
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Why TypeScript wins in big codebases"
              rows={3}
              maxLength={1000}
              className="w-full bg-white px-4 py-3 text-[15px] text-black placeholder:text-black/30 resize-none focus:outline-none"
              style={{
                fontFamily: DM,
                border: "3px solid #000",
                boxShadow: "4px 4px 0 #000",
                fontWeight: 500,
              }}
            />
          </div>

          {/* THEMES */}
          <div className="mb-7">
            <label
              className="inline-block px-3 py-1 mb-4 bg-[#4d6dff] text-white text-xs uppercase"
              style={{
                fontFamily: ARCHIVO,
                border: "3px solid #000",
                boxShadow: "3px 3px 0 #000",
                transform: "rotate(1.2deg)",
                letterSpacing: "0.04em",
              }}
            >
              PICK A VIBE
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {THEMES.map((t, idx) => {
                const selected = theme === t.id;
                const baseRot = cardRot[idx];
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className="relative bg-white p-3 text-left transition-transform duration-150 hover:-translate-y-0.5"
                    style={{
                      border: "3px solid #000",
                      boxShadow: selected ? "6px 6px 0 #000" : "3px 3px 0 #000",
                      transform: `rotate(${baseRot}deg)${selected ? " translate(-2px, -2px)" : ""}`,
                    }}
                  >
                    <div
                      className="h-2 w-14 mb-2"
                      style={{ background: t.accent, border: "2px solid #000" }}
                    />
                    <div
                      className="text-sm uppercase text-black"
                      style={{ fontFamily: ARCHIVO, letterSpacing: "0.01em" }}
                    >
                      {t.name}
                    </div>
                    <div
                      className="text-[11px] text-black/60 mt-0.5 font-medium"
                      style={{ fontFamily: DM }}
                    >
                      {t.desc}
                    </div>
                    {selected && (
                      <div
                        className="absolute -top-3 -right-3 bg-[#ff3d8b] text-white text-[10px] px-2 py-0.5 uppercase"
                        style={{
                          fontFamily: ARCHIVO,
                          border: "3px solid #000",
                          boxShadow: "2px 2px 0 #000",
                          transform: "rotate(8deg)",
                          letterSpacing: "0.04em",
                        }}
                      >
                        PICKED
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* GENERATE */}
          <button
            onClick={handleGenerate}
            disabled={!topic.trim() || generating}
            className="w-full py-5 bg-[#ff3d8b] text-white uppercase text-2xl flex items-center justify-center gap-3 transition-all duration-150 enabled:hover:-translate-x-[3px] enabled:hover:-translate-y-[3px] enabled:active:translate-x-[6px] enabled:active:translate-y-[6px] enabled:active:!shadow-none disabled:bg-black/20 disabled:text-black/40 disabled:cursor-not-allowed"
            style={{
              fontFamily: ARCHIVO,
              border: "5px solid #000",
              boxShadow: "8px 8px 0 #000",
              letterSpacing: "0.02em",
            }}
          >
            {generating ? (
              <>
                <svg className="animate-spin w-7 h-7" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray="32"
                    strokeLinecap="round"
                  />
                </svg>
                COOKING...
              </>
            ) : (
              <>
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="#000"
                  strokeWidth="2"
                  strokeLinejoin="round"
                >
                  <path d="M14 2 L4 14 L11 14 L9 22 L20 10 L13 10 L15 2 Z" />
                </svg>
                GENERATE
              </>
            )}
          </button>

          <p
            className="text-center text-[12px] text-black/60 mt-4 font-semibold"
            style={{ fontFamily: DM }}
          >
            or smash{" "}
            <kbd
              className="inline-block px-2 py-0.5 bg-white text-black text-[10px] uppercase mx-0.5"
              style={{
                fontFamily: ARCHIVO,
                border: "2px solid #000",
                boxShadow: "2px 2px 0 #000",
                letterSpacing: "0.05em",
              }}
            >
              CMD + ENTER
            </kbd>
          </p>
        </div>

        {/* Footer caption */}
        <div className="text-center mt-10">
          <span
            className="inline-block px-3 py-1 bg-black text-white text-[11px] uppercase"
            style={{
              fontFamily: ARCHIVO,
              letterSpacing: "0.15em",
              transform: "rotate(-1deg)",
              boxShadow: "3px 3px 0 #000",
              border: "3px solid #000",
            }}
          >
            Powered by Claude
          </span>
        </div>
      </main>
    </div>
  );
}
