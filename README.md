# CLF-C02 Certification Tracker

Track your AWS Cloud Practitioner (CLF-C02) study progress. Offline-first SPA con checklist de dominios, progress bars, y gestión de recursos de estudio.

Construido con **Gentle AI + SDD** (Spec-Driven Development): ciclo completo desde exploración → specs → diseño → implementación → verify → archive.

## Quick path

```bash
# 1. Install
pnpm install

# 2. Dev server
pnpm dev

# 3. Build para deploy
pnpm build

# 4. Tests
pnpm test:run
```

Abrí **http://localhost:5173/** y empezá a trackear.

## Routes

| Route | Page | What it does |
|-------|------|-------------|
| `/` | Dashboard | Overall progress ring + per-domain progress bars |
| `/checklist` | Checklist | Hierarchical topic tree with status badges |
| `/topic/:id` | Topic Detail | View and manage resources per topic |

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | **React 19** + Vite 6 |
| Language | TypeScript (strict) |
| Persistence | **Dexie.js** (IndexedDB) — offline, zero backend |
| UI state | Zustand |
| Styling | Tailwind CSS v4 |
| Primitives | Radix UI (Collapsible, Select) + class-variance-authority |
| Icons | Lucide React |
| PWA | vite-plugin-pwa (generateSW) |
| Testing | Vitest + @testing-library/react |
| Dev workflow | **Gentle AI** via SDD (Spec-Driven Development) |

## Project Structure

```
roadtoclf/
├── src/
│   ├── components/
│   │   ├── checklist/    # DomainCard, TopicItem, StatusBadge
│   │   ├── layout/       # AppLayout, Sidebar
│   │   ├── progress/     # ProgressRing, ProgressBar
│   │   └── resources/    # ResourceForm, ResourceItem, ResourceList
│   ├── db/
│   │   ├── schema.ts     # Dexie DB (exam, domain, topic, resource)
│   │   ├── seed-data.ts  # CLF-C02 topic tree pre-loaded
│   │   └── hooks.ts      # React hooks via useLiveQuery
│   ├── lib/
│   │   ├── types.ts      # Shared types + constants
│   │   └── utils.ts      # cn(), URL validation, status helpers
│   ├── pages/            # DashboardPage, ChecklistPage, TopicDetailPage
│   ├── stores/           # Zustand UI store
│   ├── App.tsx, main.tsx, routes.tsx
│   └── index.css
├── tests/
│   ├── db/               # Schema + seed data tests
│   ├── components/       # Component tests (RTL)
│   └── stores/           # Zustand store tests
├── openspec/             # SDD artifacts (specs, design, archive)
│   ├── specs/            # Source of truth specs
│   └── changes/archive/  # Archived SDD cycle
└── dist/                 # Build output (PWA-ready)
```

## Seed Data

The app ships with the full **CLF-C02** topic tree pre-loaded:

| Domain | Weight | Topics |
|--------|:------:|--------|
| Cloud Concepts | 24% | 5 topics + 23 subtopics |
| Security and Compliance | 30% | 5 topics + 16 subtopics |
| Cloud Technology and Services | 34% | 5 topics + 20 subtopics |
| Billing, Pricing, and Support | 12% | 5 topics + 17 subtopics |

Data auto-loads on first visit. You can customize topics as you go.

## Status Flow

```
not_started → in_progress → completed
                                    ↘
                              not_started
```

Click the status badge on any topic to cycle forward. `completed` wraps back to `not_started` — podés resetear cualquier tema en cualquier momento.

## Commands

| Command | What it does |
|---------|-------------|
| `pnpm dev` | Start Vite dev server with HMR |
| `pnpm build` | Type-check + build to `dist/` (PWA) |
| `pnpm test:run` | Run all tests once |
| `pnpm test` | Watch mode |
| `pnpm preview` | Preview production build locally |

## Deploy

The app is a static SPA. Build with `pnpm build` and deploy `dist/`:

- **GitHub Pages**: push `dist/` to `gh-pages` branch
- **Vercel**: connect repo, it auto-detects Vite
- **Cloudflare Pages**: connect repo, build command `pnpm build`, output `dist/`
- **Any static host**: just serve the `dist/` folder

The PWA service worker is auto-generated at build time. Works fully offline after first visit.

## Development with SDD

Este proyecto se construyó usando **Spec-Driven Development** con Gentle AI. Cada fase del pipeline tiene artefactos en `openspec/`:

```
Preflight → Init → Explore → Proposal → Specs → Design
  → Tasks → Apply → Verify → Archive
```

Los specs son el source of truth del comportamiento: `openspec/specs/`.

## Checklist

- [x] `pnpm install` works
- [x] `pnpm dev` starts
- [x] `pnpm build` produces deployable `dist/`
- [x] `pnpm test:run` — 48 tests pass
- [x] PWA installable offline
- [x] Full CLF-C02 topic tree pre-seeded
- [x] Status tracking: not_started → in_progress → completed → not_started (full cycle)
- [x] Progress visualization (ring + bars)
- [x] Resource management (add/edit/delete URLs + notes)
- [x] Responsive layout

## Backlog / Phase 2

- [ ] **Refinar colores dark mode**: ajustar paleta de colores del dark mode (fondos, textos, acentos) — el actual no convence del todo
- [ ] **Toggle progress mode**: switch entre Overall Progress por dominios (weighted) o por topics (individual)
- [x] **Exam target date + countdown + pace tracker**: campo para fecha de examen, countdown de días restantes, y barra de pace (topics restantes vs días hasta el examen)
- [ ] **Study reminders**: notificaciones/alertas con fechas sugeridas de estudio
- [ ] Study session logging with timer
- [ ] Practice exam quiz mode
- [ ] Progress charts over time
- [x] **Dark mode toggle**: switch claro/oscuro con persistencia en localStorage, Tailwind v4 `dark:` class strategy
- [ ] Export/backup (JSON download)
- [ ] Spaced repetition / weak-domain suggestions
- [ ] Gentle AI sub-agent quiz generation
