import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_PATHS = ["/auth/login", "/auth/callback", "/auth/update-password"];

function isLocalHost(host: string): boolean {
  return /^(localhost|127\.0\.0\.1|10\.|192\.168\.|.*\.localhost)(:\d+)?$/.test(host);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const host = req.headers.get("host") || "";
  if (isLocalHost(host)) {
    return NextResponse.next();
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (cookiesToSet) =>
        cookiesToSet.forEach(({ name, value, options }) =>
          res.cookies.set(name, value, options)
        ),
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  const isApi = pathname.startsWith("/api/");

  if (!user) {
    if (isApi) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const loginUrl = new URL("/auth/login", req.url);
    if (pathname !== "/") loginUrl.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const allowed = process.env.ALLOWED_EMAIL;
  if (allowed && user.email !== allowed) {
    if (isApi) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("error", "not_allowed");
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/data|favicon.ico|apple-icon|icon-192|icon-512|icon\\.png|opengraph-image|manifest\\.webmanifest|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
