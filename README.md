# Automation Digital Brain

An operational source of truth for Micron's Automation Department: project execution, controlled engineering knowledge, and an AI assistant (**Jason**) in one governed home, built against an internal build specification (not included in this repo).

**Live:** [project-management-software-ruby.vercel.app](https://project-management-software-ruby.vercel.app)

## Status

Frontend prototype — Phase 1 of the spec's delivery sequence. There is **no backend yet**: project creation and deletion persist to `localStorage` in your own browser as a stopgap (see [`src/lib/project-store.ts`](src/lib/project-store.ts)), not to a shared database. Nothing here is multi-user, permission-enforced, or durable across devices yet.

## Screens

| Route | What's there |
| --- | --- |
| `/` | Home dashboard — your projects, at-risk items, Jason's overnight findings, overdue actions |
| `/portfolio` | Searchable project list with building/type/stage filters, table / cards / timeline views |
| `/projects/new` | Create-project form with live ID preview, duplicate detection, and full field validation |
| `/projects/[id]` | Project workspace — the full KPI dashboard (status, progress, budget, ROI, vendor, risks, issues, benefits), plus delete with confirmation |
| `/knowledge` | Knowledge hub with category facets and approval-state filtering |
| `/analytics` | Portfolio-level trends: stage mix, schedule variance, knowledge health |
| `/admin` | Roles matrix and audit log |

Jason ships as a persistent right-side panel on every screen: cited sources on every knowledge-grounded answer, and a confirmation gate on every state-changing action it proposes.

## Design system

Visual direction is derived from [servo7.com](https://servo7.com): a hairline grid, Inter Tight at weight 500, mono micro-labels, flat surfaces (no shadows, ~2px radius), and a sparing accent color. Tokens live in [`src/app/globals.css`](src/app/globals.css) — the accent (`#e05a00`) is a placeholder from the visual reference, not Micron's approved brand color; swap the token once that's confirmed internally (spec §7).

The Micron wordmark in the sidebar is sourced from a third-party asset, not Micron's official logo gallery — see the provenance note in [`src/components/shell/MicronLogo.tsx`](src/components/shell/MicronLogo.tsx).

## Spec rules encoded, not faked

- Project IDs (`{prefix}{YYYY}{MM}{sequence}`) increment per prefix/year/month — see [`src/lib/project-id.ts`](src/lib/project-id.ts)
- Metrics with no data render **"Data unavailable"**, never a fabricated zero — see the `Measure<T>` type in [`src/lib/types.ts`](src/lib/types.ts)
- Status is conveyed by text and glyph alongside color, never color alone
- Light / dark / system themes persist across sessions

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run lint    # eslint
```

> **A note on this repo's location:** if you clone this into an iCloud Drive–synced folder, `npm install`, `next dev`, and `next build` will be dramatically slower (iCloud fights the filesystem over `node_modules`). Keep it on local, non-synced disk.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · deployed on Vercel

## Project structure

```
src/
  app/                  routes (App Router)
  components/
    shell/               app chrome — nav, header, Jason panel, theme toggle
    ui/                  design-system primitives (buttons, badges, charts, dialogs)
  lib/
    types.ts              domain model
    mock-data.ts           seed data for projects, users, knowledge
    project-store.ts        localStorage-backed project store (create/delete)
    project-id.ts            ID generation + form validation
    metrics.ts               derived metrics (progress, health, variance, formatting)
```

## Not yet built

Everything in the spec's Phase 2–4: knowledge revision/approval workflows, real Jason (currently mocked conversation + UI), SSO/RBAC enforcement, the transactional backend and database, file ingestion, and the security/audit requirements in spec §10.
