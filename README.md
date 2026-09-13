# Personal Engineering Portfolio

A dynamic, API-driven personal portfolio built with Next.js, TypeScript, Tailwind CSS,
and Three.js. Every piece of portfolio content — profile, projects, experience,
technologies, learning progress, articles, achievements, and social links — is fetched
from a backend API rather than hardcoded, so adding a project or article in the future
backend/admin dashboard shows up here automatically.

## Tech stack

- Next.js (App Router, Server Components by default)
- TypeScript (strict, no `any` on API responses)
- Tailwind CSS v4
- Three.js + React Three Fiber + drei (hero background, technology constellation,
  3D system-design pipeline)
- GSAP + ScrollTrigger (scroll reveals, mobile menu animation)
- Zod (contact form + mock API validation)
- react-markdown + remark-gfm + rehype-highlight (article content)

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Visit `http://localhost:3000`.

### Development without a real backend yet

This repo ships with **mock API routes** under `src/app/api/*` that return realistic
sample data in the exact `{ success, data }` / `{ success, data, pagination }` shape
the real backend is expected to use. With `NEXT_PUBLIC_API_URL` pointing at
`http://localhost:3000` (the default), the app talks to these mock routes and renders
a fully populated site out of the box.

**Once the real backend exists**, just point `NEXT_PUBLIC_API_URL` at it in `.env.local`
(or your deployment's environment variables) and delete `src/app/api/*` and
`src/lib/mock-data.ts` — no component changes are needed, since every component reads
through the typed client in `src/lib/api/index.ts`.

## Environment variables

See `.env.example`:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API this frontend consumes |
| `NEXT_PUBLIC_SITE_URL` | Public URL of this site, used for metadata, Open Graph, and the sitemap |

## Scripts

```bash
npm run dev       # start the dev server
npm run build     # production build (also runs the TypeScript check)
npm run start     # run the production build
npm run lint      # ESLint
```

## Architecture

```
                 Backend API  (GET /api/profile, /api/projects, ...)
                     ^
              API Client Layer      src/lib/api/  (typed functions, one per resource)
                     ^
              Server Components     src/app/**/page.tsx  (fetch + pass data down)
                     v
              Portfolio Sections    src/components/**  (presentation only)
                     v
              Client Interactions   Three.js scenes, GSAP reveals, the contact form
```

- **`src/lib/api/fetcher.ts`** — the only place `fetch()` is called. Unwraps the
  `{ success, data }` / `{ success, data, pagination }` envelope and centralizes
  Next.js cache/revalidation options.
- **`src/lib/api/index.ts`** — typed functions (`getProfile`, `getProjects`,
  `getProjectBySlug`, ...). Every failure is caught here and turned into `null`/`[]`
  so pages can render graceful empty states instead of crashing.
- **`src/types/api.ts`** — the single source of truth for backend response shapes.
- Pages are Server Components that fetch data and pass it to presentational
  components; only components that need interactivity (the cursor, the mobile menu,
  the constellation, the contact form, etc.) are `"use client"`.
- Every list-driven section (technologies, projects, articles, learning topics,
  achievements, engineering activity) renders a real empty state — or nothing at all,
  per the brief — when the backend has no data, rather than showing an empty
  heading or fabricated numbers.

## Adapting to the real backend's response shape

If the real backend's JSON shape differs slightly from what's assumed here, make the
adjustment inside `src/lib/api/fetcher.ts` / `src/lib/api/index.ts` only — never inside
a component. That keeps every page and component insulated from backend changes.

## Performance & accessibility notes

- The hero scene and technology constellation both detect WebGL availability and
  `prefers-reduced-motion` on mount and fall back to a static/CSS treatment when
  either is unavailable — the page never blocks on a 3D scene loading, and 3D is
  lazy-loaded via `React.lazy` + `Suspense`.
- The custom cursor is disabled on touch/coarse-pointer devices and respects
  reduced motion.
- Keyboard focus is visible everywhere (`:focus-visible` in `globals.css`); the
  mobile menu is a proper `role="dialog"` and traps background scroll while open.

## Known limitation in restricted-network environments

`next/font/google` requires reaching `fonts.googleapis.com` at build time. If you're
building somewhere that blocks that host, either allow it or swap the three
`next/font/google` calls in `src/app/layout.tsx` for `next/font/local` with self-hosted
font files. On a normal machine, Vercel, or most CI, this is a non-issue — dev mode
even degrades gracefully to a fallback font if the fonts are briefly unreachable.

## Deployment

Any Next.js host works (Vercel is the path of least resistance). Set
`NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SITE_URL` in the platform's environment
variable settings before building.
