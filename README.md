# Sourdough Bread Site

An online shop for handmade sourdough breads, with an AI bread advisor that helps customers choose the right loaf.

> Status: early development (Phase 1: project setup). Built as a learning and portfolio project.

## Goals

- Sell many kinds of sourdough bread online (Hebrew/RTL support, ILS pricing).
- Let customers chat with an AI advisor that answers questions about breads, ingredients, allergens and storage, using the real product catalog.
- Practice production-quality engineering: testing, security, CI, deployment.

## Planned stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL (Prisma or Drizzle) |
| Validation | Zod |
| AI advisor | Claude API, called from the server only |
| Testing | Vitest (unit), Playwright (end-to-end) |
| CI | GitHub Actions |
| Hosting | Vercel + managed Postgres (Neon, Supabase or Railway) |

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md) for the full phase-by-phase plan, [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the system design, and [docs/DATA_MODEL.md](docs/DATA_MODEL.md) for the first database draft.

## Getting started

Requirements: Node.js 20+ and Git.

```bash
git clone https://github.com/eliyaosadon/Sourdough_bread_site.git
cd Sourdough_bread_site
npm install      # after the app is scaffolded
npm run dev      # http://localhost:3000
```

Copy `.env.example` to `.env.local` and fill in your own values. Never commit real secrets.

## Decisions log

Short notes on why things were chosen live in [docs/DECISIONS.md](docs/DECISIONS.md).
