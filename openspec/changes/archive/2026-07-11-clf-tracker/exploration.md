# Exploration: AWS CLF-C02 Certification Tracker

## Current State

**Greenfield project.** The repo is empty — no source code, no dependencies, no build tooling. SDD init completed in hybrid mode (Engram + OpenSpec files). The only existing structure is:

- `.atl/` — skill registry
- `openspec/` — SDD config, specs, changes directories (all empty)

No stack, no architecture, no conventions established yet.

## Exam Context

AWS CLF-C02 exam structure (from the official AWS exam guide, updated weights):

| Domain | Weight | Task Focus |
|--------|--------|------------|
| 1. Cloud Concepts | 24% | Cloud value, global infrastructure, Well-Architected Framework, migration, cloud economics |
| 2. Security and Compliance | 30% | Shared Responsibility Model, IAM, security services, compliance programs, encryption |
| 3. Cloud Technology and Services | 34% | Compute, storage, databases, networking, serverless, ML, management tools |
| 4. Billing, Pricing, and Support | 12% | Pricing models, cost tools, support plans, AWS Marketplace, partner resources |

65 questions, 90 minutes, passing score 700/1000. Conceptual exam — no hands-on configuration tested.

## Approaches

### Approach A: Local-First Web SPA (Next.js 16 + WASM SQLite)

**Description**: A modern single-page application using Next.js 16 with React 19, TypeScript strict mode, Tailwind CSS v4, and shadcn/ui primitives. Data persists via SQLite compiled to WASM running in the browser with Origin Private File System (OPFS) — zero backend required. The app is a fully offline-capable PWA.

- **Pros**:
  - Latest AI-adjacent stack: Next.js App Router, React 19, TypeScript, Tailwind v4
  - Zero server cost — SQLite WASM + OPFS means the database lives entirely in the browser
  - True offline capability — works without network
  - Total privacy — study data never leaves the device
  - shadcn/ui provides ready-made checklist, progress bar, card, and dialog components
  - PWA deployable to any static host (Vercel, Cloudflare Pages, GitHub Pages)
  - WASM SQLite gives full SQL query capability for progress analytics
  - Gentle AI can assist throughout development via SDD workflow
  - Export/backup via JSON or encrypted archive

- **Cons**:
  - SQLite WASM + OPFS requires `SharedArrayBuffer` and COOP/COEP headers (solved via coi-serviceworker.js, but adds complexity)
  - Next.js for a purely client-side SPA is heavier than needed (can use Vite instead)
  - First-time setup requires Node.js, npm/pnpm
  - If sync/backup to cloud is desired later, needs additional architecture

- **Effort**: Medium

### Approach B: Lightweight SPA (React + Vite + TypeScript + IndexedDB)

**Description**: A pure client-side React SPA built with Vite, using IndexedDB via Dexie.js for persistence. No framework overhead beyond React. Deployable as static files on any host. Uses localStorage or IndexedDB for simpler storage without WASM complexity.

- **Pros**:
  - Simplest setup — Vite scaffold, one `npm install`
  - IndexedDB via Dexie is well-documented and battle-tested
  - No `SharedArrayBuffer` or special HTTP headers required
  - True offline — everything is client-side
  - Lighter bundle than Next.js for a pure SPA use case
  - Easy deployment: `npm run build` → any static host

- **Cons**:
  - IndexedDB is slower than WASM SQLite for complex queries
  - No SQL query capability (need to filter/map in JS)
  - Less "latest tech" appeal compared to WASM SQLite + OPFS
  - Still requires Node.js for development
  - Progress analytics require more manual coding without SQL
  - Less impressive as a portfolio piece / learning exercise

- **Effort**: Low-Medium

## Data Model Sketch

### Core Entities

```
Exam
  ├── id: string (uuid)
  ├── code: string ("CLF-C02")
  ├── name: string ("AWS Certified Cloud Practitioner")
  ├── total_questions: number (65)
  ├── passing_score: number (700)
  ├── time_limit_minutes: number (90)
  └── target_date: date (user's planned exam date)

Domain
  ├── id: string (uuid)
  ├── exam_id: string (FK → Exam)
  ├── name: string ("Cloud Concepts", etc.)
  ├── weight_percent: number (24, 30, 34, 12)
  ├── order: number (1-4)
  └── description: string

Topic
  ├── id: string (uuid)
  ├── domain_id: string (FK → Domain)
  ├── parent_topic_id: string? (FK → Topic, for subtopics)
  ├── name: string ("Shared Responsibility Model", etc.)
  ├── description: string
  ├── aws_services: string[] (related AWS services)
  ├── order: number
  └── status: enum (not_started | in_progress | completed)

Resource
  ├── id: string (uuid)
  ├── topic_id: string (FK → Topic)
  ├── type: enum (video | article | practice_exam | aws_doc | note | flashcard)
  ├── title: string
  ├── url: string?
  ├── notes: text?
  └── completed: boolean

StudySession
  ├── id: string (uuid)
  ├── date: date
  ├── duration_minutes: number
  ├── topics_covered: string[] (FK → Topic.id[])
  ├── notes: text?
  ├── quiz_score: number?
  └── energy_level: enum (low | medium | high)

ProgressSnapshot
  ├── id: string (uuid)
  ├── date: date
  ├── domain_progress: { domain_id: percent_complete }
  ├── topics_completed: number
  ├── topics_total: number
  ├── study_hours_total: number
  ├── practice_exams_taken: number
  └── avg_quiz_score: number?
```

### Status Flow

```
not_started → in_progress → completed
     ↑              │
     └── (reset) ───┘
```

## Gentle AI Integration Possibilities

The following can be done **during development** (via SDD workflow):

| Capability | How Gentle AI Delivers |
|------------|----------------------|
| AI-generated study plans | Sub-agent reads exam structure, creates week-by-week plan |
| Quiz question generator | Sub-agent generates CLF-C02-style questions per domain |
| Progress analysis | Engram tracks study sessions across time; smart gap analysis |
| Smart topic suggestions | Analyzes completed vs. weak domains and suggests next focus |
| Automated test generation | SDD workflow generates tests alongside implementation |

The app itself does NOT need to embed an LLM. Gentle AI already provides agent capabilities that the user invokes during study sessions via OpenCode.

## MVP Scope vs. Full Feature Set

### MVP (Phase 1 — ~2 weeks)

What the first implementation should cover:

- [x] Exam domains and topics displayed as a hierarchical checklist
- [x] Status tracking: not_started / in_progress / completed per topic
- [x] Progress bar per domain and overall
- [x] Local persistence (IndexedDB or SQLite WASM)
- [x] Simple, clean UI with Tailwind CSS
- [x] Basic resource tracking (URLs + notes per topic)
- [x] Deployable as static site / PWA

### Phase 2 (Post-MVP)

- [ ] Study session logging with duration and notes
- [ ] Quiz score tracking per domain
- [ ] Progress snapshots and charts over time
- [ ] Exam target date with countdown
- [ ] Export/backup functionality
- [ ] Dark mode / theme support

### Phase 3 (Future)

- [ ] Spaced repetition / smart review suggestions
- [ ] Gentle AI sub-agent integration for quiz generation
- [ ] Study plan generation
- [ ] Practice exam mode with timer
- [ ] Sync to cloud (optional, opt-in)

## Recommendation

**Approach A (Local-First SPA with WASM SQLite)** is recommended for this project, but with a pragmatic simplification: start with **Approach B's IndexedDB** for the MVP, and migrate to WASM SQLite in Phase 2 if needed.

**Why**: For a checklist/tracker app with simple CRUD queries, IndexedDB via Dexie.js is more than sufficient and avoids the `SharedArrayBuffer`/COOP/COEP complexity. The developer experience is smoother, and there's zero deployment friction. WASM SQLite would be over-engineering for the MVP.

**Tech stack for MVP**:
- **Framework**: React 19 + Vite 6 (pure SPA, no Next.js server needed)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **UI primitives**: Radix UI + class-variance-authority (lightweight, composable)
- **State + persistence**: Dexie.js (IndexedDB wrapper) for data; Zustand for UI state
- **Icons**: Lucide React
- **Build output**: Static files → deployable to any host (including GitHub Pages for free)
- **Development**: SDD workflow via Gentle AI, Engram for persistent context

This gives "latest AI tech" through the development workflow (SDD, Gentle AI, Engram, sub-agents) rather than through exotic runtime dependencies. The result is a maintainable, portable, zero-cost app.

## Key Decisions Needed

1. **React vs. no framework** — Vanilla JS with Web Components vs. React/Svelte? Given TypeScript + component model, React is the pragmatic choice for maintainability.

2. **SPA-only vs. SSR** — For a purely personal offline tracker, SPA is correct. No SSR needed.

3. **Persistence layer** — IndexedDB (Dexie) for MVP vs. go straight to WASM SQLite? Recommendation: Dexie for MVP.

4. **PWA vs. plain web app** — PWA adds manifest + service worker for offline install. Worth including from the start.

5. **Preset topic data** — Should the app ship with the full CLF-C02 topic tree pre-seeded, or require manual entry? Recommendation: ship seeded data with the option to customize.

6. **Quiz/Flashcard features** — In MVP or later? Recommendation: later — keep MVP focused on core tracking.

7. **Git strategy** — Direct commits to main vs. feature branches? Given this is a personal project, direct commits are fine, but SDD convention suggests branch-per-change.

## Risks

- Over-engineering the data layer for what is essentially a checklist app
- Scope creep from AI integration ideas (quiz generation, spaced repetition, etc.) — guard by SDD phase gates
- WASM SQLite complexity if we go that route (COOP/COEP headers, service worker, cross-origin isolation)
- No testing infrastructure yet — tests must be bootstrapped before or alongside implementation
