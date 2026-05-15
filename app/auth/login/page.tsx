"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ARCHIVO = "'Archivo Black', system-ui, sans-serif";
const DM = "'DM Sans', system-ui, sans-serif";

function LoginInner() {
  const params = useSearchParams();
  const errorKind = params.get("error");
  const returnTo = params.get("returnTo") || "/";
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    setLoading(true);
    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return;
    }
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const redirectTo = `${origin}/auth/callback?returnTo=${encodeURIComponent(returnTo)}`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  }

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden flex items-center justify-center px-6"
      style={{ background: "#fde047", fontFamily: DM }}
    >
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.08] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating stickers */}
      <div
        className="absolute pointer-events-none z-0"
        style={{ top: "10%", left: "8%", transform: "rotate(-12deg)", filter: "drop-shadow(4px 4px 0 #000)" }}
      >
        <svg width="90" height="90" viewBox="0 0 100 100" fill="#ff3d8b" stroke="#000" strokeWidth={6} strokeLinejoin="round">
          <path d="M62 6 L18 56 L42 56 L34 94 L82 40 L54 40 L66 6 Z" />
        </svg>
      </div>
      <div
        className="absolute pointer-events-none z-0"
        style={{ bottom: "12%", right: "8%", transform: "rotate(15deg)", filter: "drop-shadow(4px 4px 0 #000)" }}
      >
        <svg width="100" height="100" viewBox="0 0 100 100" fill="#4d6dff" stroke="#000" strokeWidth={6} strokeLinejoin="round">
          <path d="M50 8 L61 38 L92 38 L67 56 L77 86 L50 68 L23 86 L33 56 L8 38 L39 38 Z" />
        </svg>
      </div>
      <div
        className="absolute pointer-events-none z-0"
        style={{ top: "18%", right: "10%", transform: "rotate(8deg)", filter: "drop-shadow(4px 4px 0 #000)" }}
      >
        <svg width="80" height="80" viewBox="0 0 100 100" fill="#10b981" stroke="#000" strokeWidth={6} strokeLinejoin="round">
          <circle cx="50" cy="50" r="40" />
          <circle cx="36" cy="42" r="4" fill="#000" stroke="none" />
          <circle cx="64" cy="42" r="4" fill="#000" stroke="none" />
          <path d="M32 60 Q50 78 68 60" fill="none" />
        </svg>
      </div>
      <div
        className="absolute pointer-events-none z-0"
        style={{ bottom: "14%", left: "10%", transform: "rotate(-8deg)", filter: "drop-shadow(4px 4px 0 #000)" }}
      >
        <svg width="84" height="84" viewBox="0 0 100 100" fill="#a855f7" stroke="#000" strokeWidth={6} strokeLinejoin="round">
          <path d="M50 6 L57 36 L87 28 L66 52 L94 64 L62 64 L70 92 L50 72 L30 92 L38 64 L6 64 L34 52 L13 28 L43 36 Z" />
        </svg>
      </div>

      <div
        className="relative z-10 bg-[#fffbe8] p-8 sm:p-10 max-w-md w-full text-center"
        style={{ border: "5px solid #000", boxShadow: "10px 10px 0 #000" }}
      >
        <div
          className="inline-block w-14 h-14 mb-5 bg-black flex items-center justify-center mx-auto"
          style={{ border: "3px solid #000", boxShadow: "4px 4px 0 #000" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fde047" strokeWidth="2" strokeLinejoin="round">
            <circle cx="11" cy="15" r="6" fill="#fde047" />
            <path d="M16 7 L18 4 L21 5 L20 8" strokeLinecap="round" />
            <circle cx="22" cy="3" r="1" fill="#fde047" stroke="none" />
          </svg>
        </div>

        <h1
          className="text-4xl sm:text-5xl uppercase text-black mb-3 leading-[0.9]"
          style={{ fontFamily: ARCHIVO, letterSpacing: "-0.03em" }}
        >
          PRIVATE
          <br />
          <span
            className="inline-block px-3 bg-[#ff3d8b] text-white mt-2"
            style={{ border: "4px solid #000", boxShadow: "5px 5px 0 #000", transform: "rotate(-2deg)" }}
          >
            CLUB
          </span>
        </h1>

        <p className="text-sm text-black/70 mb-7 mt-5 font-semibold leading-snug">
          This deck generator is locked down.
          <br />
          Sign in with Google to continue.
        </p>

        {errorKind === "not_allowed" && (
          <div
            className="bg-[#ef4444] text-white p-3 mb-5 text-sm font-bold uppercase"
            style={{ fontFamily: ARCHIVO, border: "3px solid #000", boxShadow: "4px 4px 0 #000", transform: "rotate(-1deg)", letterSpacing: "0.04em" }}
          >
            Email not on the list
          </div>
        )}

        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full py-4 bg-white text-black uppercase text-base flex items-center justify-center gap-3 transition-all duration-150 enabled:hover:-translate-x-[2px] enabled:hover:-translate-y-[2px] enabled:active:translate-x-[5px] enabled:active:translate-y-[5px] enabled:active:!shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            fontFamily: ARCHIVO,
            border: "4px solid #000",
            boxShadow: "6px 6px 0 #000",
            letterSpacing: "0.04em",
          }}
        >
          {loading ? (
            <>
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="32" strokeLinecap="round" />
              </svg>
              SIGNING IN...
            </>
          ) : (
            <>
              <svg width="22" height="22" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              CONTINUE WITH GOOGLE
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
