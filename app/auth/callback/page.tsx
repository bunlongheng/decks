"use client";
import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function CallbackInner() {
  const params = useSearchParams();
  const returnTo = params.get("returnTo") || "/";
  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: unknown) => {
      if (event === "PASSWORD_RECOVERY") {
        window.location.replace("/auth/update-password");
      } else if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
        window.location.replace(returnTo);
      }
    });
    return () => subscription.unsubscribe();
  }, [returnTo]);

  return (
    <div style={{ minHeight: "100vh", background: "#0f1022", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div style={{ width: 40, height: 40, border: "3px solid #e5e7eb", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>Signing you in…</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackInner />
    </Suspense>
  );
}
