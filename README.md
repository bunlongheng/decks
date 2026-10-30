<div align="center">

# Decks

**AI slide-deck generator - topic in, polished HTML deck out.**

[![Live](https://img.shields.io/badge/live-decks--bheng.vercel.app-000000?logo=vercel&logoColor=white)](https://decks-bheng.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tests](https://img.shields.io/badge/tests-2%20passing-1a7f37?logo=vitest&logoColor=white)](tests/api/generate-deck.test.ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

Type a topic, pick one of 6 visual themes, and get back a self-contained HTML slide deck - no login, no database, runs entirely locally.

## Features

- **One-prompt AI generation** - describe a topic and Claude (`claude-sonnet-4-6` via `@anthropic-ai/sdk`) returns a strict JSON deck (cover, stack, 3-4 feature slides, checklist, roadmap, summary). The route auto-retries once with a stronger instruction if the model's first reply isn't parseable JSON.
- **6 built-in themes** - Minimal, Dark, Neon, Corporate, Playful, Gradient - each is an accent color layered onto one shared light "slides" renderer, picked in the UI before generating.
- **Self-contained HTML output** - `renderDeck()` returns one HTML string with inlined CSS and a small vanilla-JS navigator (arrow keys, space, swipe, `Cmd/Ctrl+Enter` to generate). The client wraps the response in a `Blob` and opens it in a new tab - the deck never touches a database.
- **11+ slide section types** - `cover`, `feature`, `stack`, `checklist`, `roadmap`, `summary`, `cards`, `table`, `kv`, `badges`, `text` are exposed to the AI schema; `html`, `diagram`, `versus`, `timeline`, and `stackcards` exist in the renderer for hand-authored decks outside the generation flow.
- **A second render mode** - besides `"slides"`, the same renderer has a dark, GitHub-style `"report"` mode for scrollable documents, shared with other bunlongheng tools.
- **No login, no database** - runs open; the deck is generated and streamed back as HTML, never persisted.
- **Optional embedded diagrams** - a `diagram` section posts Mermaid source to a companion service at `diagrams-bheng.vercel.app` (bearer-token authenticated) and embeds the result.

## How it works

1. User types a topic and picks a theme in the sticker-bomb UI (`app/page.tsx`), then hits **Generate** (or `Cmd/Ctrl+Enter`).
2. `POST /api/generate-deck` (`app/api/generate-deck/route.ts`) receives the request - no auth, runs open.
3. The route calls `claude-sonnet-4-6` with a system prompt that forces a strict JSON deck schema, pulls the JSON block out of the reply, and retries once if the first attempt doesn't parse.
4. The user's theme choice overwrites `mode`/`theme`/`accent` on the parsed deck, then `renderDeck()` (`lib/deck-gen.ts`) turns the JSON into one self-contained HTML string.
5. The HTML comes back as the response body; the browser blobs it and opens it in a new tab.

```mermaid
sequenceDiagram
    participant U as User
    participant UI as app/page.tsx
    participant API as /api/generate-deck
    participant C as Claude API
    U->>UI: topic + theme, click Generate
    UI->>API: POST { topic, theme }
    API->>C: system prompt (forced JSON schema) + topic
    C-->>API: JSON deck (retry once if unparsable)
    API->>API: renderDeck() -> self-contained HTML string
    API-->>UI: text/html response
    UI->>U: Blob URL opened in new tab
```

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS |
| AI | Claude API (`@anthropic-ai/sdk`), model `claude-sonnet-4-6` |
| Diagrams | `diagrams-bheng.vercel.app` companion service (bearer-token, optional) |
| Hosting | Vercel (installs with Bun, builds with `next build`) |
| Testing | Vitest (unit) + Playwright (E2E) |

## Getting started

```bash
git clone https://github.com/bunlongheng/decks.git
cd decks
npm install
cp .env.local.example .env.local   # fill in the values below
npm run dev
```

Open http://localhost:3010. Generation works with just `ANTHROPIC_API_KEY` set.

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3010 |
| `npm run build` | Production build |
| `npm run start` | Start production server on port 3010 |
| `npm run prod` | Build + start, bound to `0.0.0.0` |
| `npm run lint` | Next.js lint |
| `npm run test` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright E2E tests |

### Environment variables

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | Claude API key for deck generation |
| `AI_API_SECRET` | Bearer token for the `diagrams-bheng` service |

---

<div align="center">

<a href="https://bunlongheng.com"><img src="https://img.shields.io/badge/-bunlongheng.com-3A3A3C?style=for-the-badge&amp;labelColor=2A2A2C&amp;logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y%2BmAAADAFBMVEXx8vLq6v%2F19fX09PT8%2Ff309PT5%2BfnAwMBMaXHx8vL19fX5%2Bfny8vL09PT39%2Ff6%2Bfn6%2Bvr09PTx8fH4%2BPn%2F8vLy8%2FP09PTz8%2FPy8vL%2F%2F%2F%2Fz9PTz9PP19fby8vP19PXz8%2FT19%2Fb08%2FTx8vLy8vL09vby8%2FL29vf19fTv8PDz9vb7%2Bvn%2F%2Ff%2F9%2Ff3w8vH29fb%2F%2FP339%2Ff5%2Bfn59%2Ff19PT09PR7rao3VF3%2F%2Fv8AKDR6sqsBV1vv8fL4%2BPiux8b8%2Bvq90NDy8%2FR%2BlpppnZyZqrACLTxclZJSkI9en5ssZ2luqaUAeWgqbW4BX1gCfG0%2Fa3QaVG0MN0UKNUKUpKsGpYMAKjoRQ1UDf3AQRloJqIgEm32d0cUBg3ElbnQIln8eVWgrmIdP0KzF5d5s2acdfHwppJCP5MMXl4Tz8%2FLv8%2FP39%2FiewL5%2BqahYf4IrTFZkk5KlxsREiIYAHiqDnKFmnJowc3IdVllvpKK7zc3D2tnk5%2BmuycdwpKKuub2yv8Ly%2B%2FkAMT7z%2Bvjq7e09gH93q6kGdWpGgoJZmJSlw8M7c3WwyceTw76w1M8mYmpFfX8lW2AFOEpGiYhxqqRrqaRb2rdIsZ8AVE91jpU7d3t3saqBoKhako4AWVEcUlg3aWwDupAHb2YwmIkPP1ERSVA7WmZ8tq8HT14oZW%2BYuLsMl3wQT10ROksENUc8Z3MJSGVLh4dqpJ%2BXr7U51awUgHM4v6ad1MkPuJZAiowVd3IEhnZH0aoYrI05p5sDtYwkzZ8EPViYxsRel5USbHAIgmwIM0gQamzU4uF2malQi4oWQFQ1zaYrp4UXlYwfiHoyxqFE1q4qeX4yn5JIxKkdrX1b1rAbWGvd5Oh91sRijpomsJEVc3Ukc34dqIcwuJVKwZIXkoQZcXlNv5g%2BqZUZvpNl2rPG9N0WkIoNqouW4sVPwp%2BM0b6h0ssfq4d%2F1r8hpo%2Fh9e4AamUjnI9avaBixqgklYWSwL4xtItUxplYl5qZ58mq78wMgnYXfnlOmJaR1L%2Bj78ny9fS%2FrXQPAAAAFXRSTlP7Brvx%2FsJhAgD87r4U72C4uGH8vhRDodYHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAC6UlEQVQokS2Sd3BUVRSHb0KS3QRCiZw5t%2By9j33zXjZkyUs2uekhEAi9dwRCL4JUEQRFAQUs9A4WOopKU0GpFoqCBZUivaqoFKkWLIS5GX7%2FfnPO78yZj%2Fj8UTViK6HggvNgSGuluEZRKbZqlN9H%2FFWiWUzIFQK5fhjOIRTDoqv4ia86S4q3KSByHdSqIhxofBKr5iNxLMm2bQqWVkorJ%2BAkO46nkQJhceSRmCTDvKJIJBLJzMxMLU6POJ4eBPF1KpNEbdt2Cms4LCcnZ%2FX6D3d%2BsKJJ7VSlNLoqgbjUtmkKKxlVmpf3bsFXW3d1b77gueJAQIPQBCilkMKemNi23Ts9T35%2FaMe2rsvmTypylGUFCSIYWJLXrm2nUwOPfNO5w%2B73Okxnjqe0JigQEL3JizoeONr%2F2u99vju4fd1rdZnyspQmnGvAUBprWNqz348%2FhXN%2F6P1%2By4Uvs%2FJkpRQRwpJBRVn7vf16Dfitz5XevQqWt3yalXtKaRIUQmglWfsu5y7%2BMrDs0TMftWo1ZVy64xioOVpcIdt8%2Fvqvf9%2F859KJsrLmrzA%2BOKC0IkFEtJza7JOfr%2FYd0P9G98tdOxe0Hp9qJrOIBgDuOeEtp%2F%2B4d%2FvWX%2F%2F9u%2B%2FtlaUTmOWZg7SQEEyuFe52%2BML9O3cZO%2F5xl06zn2VcadOJUqJTzt7a82XfP7sx9vmGNm1m1MstV4IHCVAAoTLqL1372ddn%2Fz%2B2v%2FWq12c1fSpsaeQWAZAANntxzuI3e3zbo8XGpm%2FMnNqiXrh%2BljaPd6UUabkjps19tdGnX2zKb9b4pTFDCzOMLmYtpW5h%2BpCRTeYtyV%2BT36zx808OL4xYGoFrkqDTbJpSXLdRgwbPZL%2BQnT129OOPFVEEsAMJpHKdeKMJgJSAiALdjJANQKnRJI4R6boAKEwLCiGoBBegQjBftQo1KQWOlplFKSV9qGaF1NpAE7QQESTlMSy6pp%2F4%2FFFVYxMNRBTaiM0tkImxNaL8vgfDR8gvoYRaxgAAAABJRU5ErkJggg%3D%3D" alt="bunlongheng.com"></a>
<a href="https://www.linkedin.com/in/bunlongheng/"><img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"></a>
<a href="https://www.instagram.com/ibunlong/"><img src="https://img.shields.io/badge/Instagram-C13584?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram"></a>
<a href="mailto:bheng.code@gmail.com"><img src="https://img.shields.io/badge/Email-2E7D32?style=for-the-badge&logo=gmail&logoColor=white" alt="Email"></a>

<br>

Built by **[Bunlong](https://bunlongheng.com)** &nbsp;&middot;&nbsp; [more apps](https://bunlongheng.com/projects)

</div>
