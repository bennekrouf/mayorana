# Content Architecture & Page Structure (Step 2)

Status: **Locked** — documents the target information architecture and
page-by-page content outlines. This is a planning artifact; no site code
changes are made here. Builds on [`docs/positioning.md`](./positioning.md).
Date: 2026-08-28

## 0. Current state (for reference)

- Routes today: `/`, `/apps`, `/services`, `/blog` (+ `[slug]`, `/tag`), `/about`, `/contact`, `/privacy`, `/terms`. No `/solutions/*` routes exist.
- Nav (`src/components/layout/Navbar.tsx`): flat `Home | Blog | Apps | Contact`. **Services is not currently in the nav** despite the page existing. Nav also fully empties on the `isSwissRust` host variant (`useHostContext`) — any nav change must account for that branch.
- Homepage (`src/app/[locale]/page.tsx` + `src/components/home/ClientHomeSection.tsx`): Hero → single API0.AI spotlight card → generic CTA band → blog teaser. No Azure-suite presence, no "why Rust" proof section, no multi-card layout.
- Apps page (`src/app/[locale]/apps/page.tsx`, 562 lines): all products hardcoded in one file (`desktopToolsConfig` / `Tool[]`), one flat filterable grid, tag chips already exist (azure, git, blog, api, mcp, ai, crypto, tools, services). No primary/secondary grouping yet.
- Services page (`src/app/[locale]/services/page.tsx`): exists, 4 offers (Rust Training, LLM Integration, Chatbot Development, api0.ai Solutions) — not yet aligned to the 3-offer structure below, and not linked from nav.
- No product/app data file exists separately from the page — restructuring the Apps page in Step 3 will likely mean extracting this into `src/data/`.

## 1. New Information Architecture

```
Home (/)
├── Apps (/apps)                        → existing catalog, restructured (grouped, not deleted)
├── Solutions
│   ├── Azure Integration Tools         → NEW: /solutions/azure
│   └── AI Agent Infrastructure         → NEW: /solutions/ai-agents
├── Services (/services)                → existing page, content upgraded + added to nav
├── Blog (/blog)                        → unchanged
└── Contact (/contact)                  → unchanged
```

Principle: Home + the two new Solutions pages carry the positioning message.
Apps remains a useful full catalog but stops being the primary entry point
for positioning — it becomes the "browse everything" page.

## 2. Page-by-Page Content Directives

### A. Homepage (`/`)

Goal: communicate the positioning in the first screen.

1. **Hero**
   - Headline: "The reliable Rust layer for production AI agents and Azure workflows"
   - Subhead: short version from positioning doc, paired with existing tagline as secondary line
   - CTAs: Primary "Explore Azure Tools" → `/solutions/azure` · Secondary "Try API0.AI" → api0.ai or `/solutions/ai-agents` · Tertiary "Book free consult" → `/contact`
2. **Featured Solutions** — 2 cards only:
   - Azure Integration Suite (AIS Runner + Monitor + Tracing) → `/solutions/azure`
   - API0.AI — MCP Gateway for AI Agents → `/solutions/ai-agents`
3. **Why Rust / Why Mayorana** — short proof section (new)
4. **Selected Tools** — 3–4 cards max from the portfolio, linked to `/apps`
5. **Services teaser** + CTA → `/services`
6. **Latest insights** — existing blog teaser, unchanged

Replaces the current single API0.AI spotlight + generic CTA band with the
2-card Featured Solutions block above; blog teaser stays as-is.

### B. New Page: Azure Integration Tools — `/solutions/azure`

- Hero on the pain of local Azure development & monitoring
- Four product cards: AIS Runner, AIS Monitor, AIS Tracing, AIS Analytics — with status badges (reuses existing Live/Beta/WIP/MVP badge convention from the Apps page)
- "Which tool do I need?" comparison section
- Download CTAs + GitHub links (reuse existing `DownloadLink`/github URL data already defined per-tool on the Apps page)
- Technical stack note: Rust + Dioxus
- CTA to custom Azure + AI work → `/services`

### C. New Page: AI Agent Infrastructure — `/solutions/ai-agents`

- Hero: "Bridge any API to AI agents in minutes"
- Deep dive on API0.AI (MCP-native, security, performance) — expands on the code-snippet mock currently embedded in the homepage hero section
- Code examples
- How it powers other Mayorana tools
- CTA: Try API0.AI (external, api0.ai) + Book consult for custom agent systems → `/services`

### D. Apps Page (`/apps`) — restructure, don't delete

- Keep current catalog and existing tag filters
- Add short intro tying the page to the primary positioning statement
- Group into two tiers:
  - **Primary tools** (top of page): AIS suite (Runner, Monitor, Tracing, Analytics), API0.AI, GitAgent
  - **"Also built with our stack"** (clearly labeled secondary section): CVENOM, SOLANIZE, AppScreens, Blog Toolkit — per the Step 1 decision to keep these as proof points, not primary messaging
- Existing filter chips (azure, git, blog, api, mcp, ai, crypto, tools, services) stay; grouping is a layout/ordering change, not a data-model change, though extracting `desktopToolsConfig` out of the page into `src/data/` is recommended groundwork for Step 3

### E. Services Page (`/services`) — upgrade existing, not new

Existing page is kept and reworked (not rebuilt from scratch) and **added to
the main nav**, since it's currently orphaned from navigation. New outline:

- Headline aligned with positioning
- Three service offers (consolidating the current four):
  1. Custom AI Agent & MCP development (absorbs current "LLM Integration" + "Chatbot Development" + "api0.ai Solutions")
  2. Azure Integration tooling & consulting (new offer, ties to Solutions/Azure page)
  3. High-performance Rust development & training (current "Rust Adoption & Training")
- Process: Discovery → Prototype → Production
- Free 30-min consult CTA, prominent
- Portfolio proof: links back to relevant tools/solutions pages

### F. Navigation Updates

**Decided: flat nav** (matches the current Navbar's flat-array pattern; a
dropdown can come later if the Solutions section grows):

```
Home | Azure Tools | AI Agents | Apps | Services | Blog | Contact
```

- Services is added to the nav (currently missing despite the page existing).
- **`isSwissRust` host variant: nav stays empty** (current behaviour). The new
  Solutions routes must respect the same `isSwissRust` check so the full nav is
  never accidentally surfaced on that variant.

## 3. Content Principles (all pages)

- Lead with customer outcome, not technology
- Rust is a reliability/performance advantage, not the main story
- Every major section ends with a clear next action
- Status badges (Live / Beta / WIP / MVP) stay visible
- Swiss/European reliability signal: subtle but present

## 4. Locked Decisions (Step 2 deliverables)

- [x] New IA: Home / Apps / Solutions (Azure, AI Agents) / Services / Blog / Contact
- [x] Homepage wireframe: Hero → 2 Featured Solutions cards → Why Rust → Selected Tools → Services teaser → Blog
- [x] Content outline for both new Solutions pages (Azure Integration Tools, AI Agent Infrastructure)
- [x] Apps page: restructure into Primary tools + "Also built with our stack", keep existing filters
- [x] Services: **upgrade the existing page** (not a new build), consolidate 4 offers → 3, add it to nav
- [x] Nav: **flat** — `Home | Azure Tools | AI Agents | Apps | Services | Blog | Contact`
- [x] `isSwissRust`: nav stays empty; new Solutions routes respect the same check

## Next

Step 3 — Detailed Content Creation Checklist & Migration Sequence: turn each
outline above into actual copy, component/route changes, and an ordered
implementation sequence (including extracting Apps page data and wiring the
new nav).
