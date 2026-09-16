# Automation Digital Brain

An operational source of truth software: project execution, controlled engineering knowledge, and an AI assistant (**Agent**, a placeholder name pending final branding) in one governed home, built against an internal build specification (not included in this repo).

**Live:** [project-management-software-ruby.vercel.app](https://project-management-software-ruby.vercel.app)

## Status

Frontend prototype — Phase 1 of the spec's delivery sequence. There is **no backend yet**: project creation and deletion persist to `localStorage` in your own browser as a stopgap (see [`src/lib/project-store.ts`](src/lib/project-store.ts)), not to a shared database. Nothing here is multi-user, permission-enforced, or durable across devices yet.

## Screens

| Route | What's there |
| --- | --- |
| `/` | Home dashboard — your projects, at-risk items, the agent's overnight findings, overdue actions |
| `/portfolio` | Searchable project list (the nav calls it **Projects**) with building/type/stage filters, table / cards / timeline views |
| `/projects/new` | Create-project form with live ID and name previews, duplicate detection, and full field validation |
| `/projects/[id]` | Project workspace, seven tabs — Overview (eight KPIs: status, progress, budget, ROI, open issues, risks, vendor, AI usage), Timeline, Risks & issues, Vendor, Benefits, Experience, File — plus delete with confirmation |
| `/knowledge` | Knowledge hub with category facets and approval-state filtering |
| `/analytics` | Portfolio-level trends: stage mix, schedule variance, knowledge health |
| `/admin` | Role matrix (System Admin, Project Lead, Engineer, Visitor) and audit log — both display-only; see *Not yet built* |

The agent ships as a persistent right-side panel on every screen: cited sources on every knowledge-grounded answer, and a confirmation gate on every state-changing action it proposes.

## Project file taxonomy

Every project carries the same two-layer folder tree, keyed to the project lifecycle: project initial, project designing, project implement & release production, project close, project CIP & improvement, after sales services, commercial documents, project status update. Second-layer subfolders hang off each phase — requirement, FAC, UAT & SAC, handover document, NDA, and so on.

The tree is data rather than markup, so deepening it is a change to one file: [`src/lib/project-files.ts`](src/lib/project-files.ts). Folders are keyed, not named, there — the label comes from the translation dictionaries so the tree reads in the viewer's language while the key stays stable as a storage path segment. Keys are unique among siblings rather than globally, so recurring folders (`meetingMinutes`, `others`) share one label and still resolve to distinct paths.

## Design system

Visual direction is derived from [servo7.com](https://servo7.com): a hairline grid, Inter Tight at weight 500, mono micro-labels, flat surfaces (no shadows, ~2px radius), and a sparing accent color. Tokens live in [`src/app/globals.css`](src/app/globals.css) — the accent (`#e05a00`) is a placeholder from the visual reference, not Micron's approved brand color; swap the token once that's confirmed internally (spec §7).

The Micron wordmark in the sidebar is sourced from a third-party asset, not Micron's official logo gallery — see the provenance note in [`src/components/shell/MicronLogo.tsx`](src/components/shell/MicronLogo.tsx).

Below the `lg` breakpoint the left sidebar becomes an off-canvas drawer behind a hamburger in the header — dismissible by backdrop, Escape, or navigating. It and the agent panel are mutually exclusive, so two overlays never stack on a narrow screen.

## Spec rules encoded, not faked

- Project IDs (`{prefix}{YYYY}{MM}{sequence}`) increment per prefix/year/month and are immutable — see [`src/lib/project-id.ts`](src/lib/project-id.ts)
- Project names are composed, not free text: `{building}_{name}_{lead}` (e.g. `B5_AMHS Upgrade_Jackie Shao`)
- Metrics with no data render **"Data unavailable"**, never a fabricated zero — see the `Measure<T>` type in [`src/lib/types.ts`](src/lib/types.ts)
- Status is conveyed by text and glyph alongside color, never color alone
- Light / system theme and language both persist across sessions. Simplified Chinese is the default and English is opt-in — the server renders the default too (`<html lang="zh-CN">`), so a first-time visitor never sees a flash of English. The default follows a fixed setting, not the browser's `Accept-Language`

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
    shell/               app chrome — nav, header, agent panel, theme toggle
    ui/                  design-system primitives (buttons, badges, charts, dialogs)
  lib/
    types.ts              domain model
    mock-data.ts           seed data for projects, users, knowledge
    project-store.ts        localStorage-backed project store (create/delete)
    project-id.ts            ID generation, name composition + form validation
    project-files.ts         the fixed two-layer per-project folder taxonomy
    metrics.ts               derived metrics (progress, health, variance, formatting)
    i18n/                    UI dictionaries (zh default, en opt-in) + provider
```

## Not yet built

Everything in the spec's Phase 2–4: knowledge revision/approval workflows, a real agent backend (currently mocked conversation + UI), the transactional backend and database, and the security/audit requirements in spec §10.

Two places look more finished than they are, and say so in the UI rather than pretending otherwise:

- **File storage.** The File tab renders the folder taxonomy but stores nothing — no upload, versioning, or retention until there is a backend behind it.
- **Roles and audit.** The admin screen shows the role matrix and audit events, but nothing is enforced: there is no auth, no SSO/RBAC, and the audit log is seed data. Every viewer is the same hard-coded user.
