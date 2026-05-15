# Decks - AI Slide Deck Generator

Turn ideas into beautiful slide decks instantly. Describe your topic, pick a theme, and get a polished HTML deck in seconds.

**Live -> [decks-bheng.vercel.app](https://decks-bheng.vercel.app)** _(placeholder)_

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS |
| Auth + DB | Supabase (PostgreSQL + Auth) |
| AI | Claude API (`@anthropic-ai/sdk`) using `claude-sonnet-4-6` |
| Hosting | Vercel |
| Testing | Vitest (unit) + Playwright (E2E) |

---

## Features

- AI-powered slide generation from a single prompt
- Six built-in themes: Minimal, Dark, Neon, Corporate, Playful, Gradient
- Self-contained HTML output (no runtime dependencies, opens in any browser)
- Keyboard shortcut (Cmd/Ctrl + Enter) to generate
- Supabase auth with single-email allowlist
- Optional embedded diagrams via diagrams-bheng service

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3010 |
| `npm run build` | Production build |
| `npm run start` | Start production server on port 3010 |
| `npm run test` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright E2E tests |

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | Claude API key for deck generation |
| `AI_API_SECRET` | Bearer token for the diagrams-bheng service |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (client-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `ALLOWED_EMAIL` | Email allowed to sign in |
| `NEXT_PUBLIC_SITE_URL` | Public site URL for OAuth redirects |

Copy `.env.local.example` to `.env.local` and fill in values.

---

## Project Structure

```
decks/
  app/
    page.tsx                  # Deck generator UI (client)
    layout.tsx                # Root layout
    manifest.ts               # PWA manifest
    opengraph-image.tsx       # OG image
    SignInButton.tsx          # Google OAuth button
    CuteToast.tsx             # Toast notifications
    providers.tsx             # Context providers
    auth/                     # Auth callback + password reset
    api/
      generate-deck/          # POST endpoint -> Claude -> HTML deck
  lib/
    deck-gen.ts               # Pure HTML deck renderer
    is-local.ts               # Localhost detection
    supabase/                 # Supabase server + client helpers
  tests/                      # Vitest + Playwright tests
  middleware.ts               # Auth middleware
  next.config.ts              # Next config
```

---

Built by [Bunlong Heng](https://www.bunlongheng.com) | [GitHub](https://github.com/bunlongheng)
