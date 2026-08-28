# Content Creation Checklist & Migration Sequence (Step 3)

Status: **Locked** — planning artifact, no site code changes made here.
Builds on [`docs/positioning.md`](./positioning.md) and
[`docs/content-architecture.md`](./content-architecture.md).
Date: 2026-08-28

## 1. Priority Order of Work

1. Foundation locked — Step 1 ✅, Step 2 ✅
2. Create the two new Solutions pages (`/solutions/azure`, `/solutions/ai-agents`) — highest impact
3. Rewrite Homepage to match new positioning
4. Restructure Apps page (intro + primary/secondary grouping)
5. Upgrade Services page (existing page, 4→3 offers) + add to nav
6. Update global navigation & footer
7. Update meta titles, descriptions, Open Graph
8. Soft-launch + internal review
9. Announce (blog post, LinkedIn, email if any list exists)

## 2. Content Pieces to Create / Rewrite

### Must-create

| Piece | Priority | Status | Notes |
|---|---|---|---|
| Homepage hero + structure | Critical | To write | New positioning statement; replaces current single API0.AI spotlight |
| `/solutions/azure` full page | Critical | ✅ Built | AIS suite (Runner, Monitor, Tracing, Analytics); EN + FR |
| `/solutions/ai-agents` page | Critical | ✅ Built | API0.AI deep dive; EN + FR |
| Services page | High | ✅ Built | 3 offers + process; EN + FR; contact dropdown realigned |
| Apps page intro paragraph | High | ✅ Built | Ties `/apps` to primary positioning |
| "Also built with our stack" section copy | Medium | ✅ Built | CVENOM, AppScreens, Blog Toolkit, SOLANIZE, + consulting CTA |
| Navigation labels | High | Update | `src/components/layout/Navbar.tsx` — add Services + Solutions |
| Meta titles & descriptions (all key pages) | High | Rewrite | Include primary keywords + positioning |

### Supporting content (soon after)

- Short case-study blurbs (internal/anonymized OK)
- Reusable "Why Rust for AI agents & Azure tools" section
- FAQ section on Azure Tools and AI Agents pages
- Comparison table: "Traditional approach vs Mayorana tools"
- Updated Contact / Book consult page copy

## 3. Content Writing Guidelines (every piece)

- 3-second test: can a visitor tell what we do and for whom?
- Structure: Outcome → Mechanism → Proof → CTA
- Concrete over vague: "local Azure development without pushing to the cloud", not "powerful tools"
- Technically credible but accessible
- Status transparency: Live / Beta / WIP always shown (reuse existing badge convention)
- Voice: confident, precise, slightly technical, Swiss reliability undertone
- Length: hero short and sharp; product descriptions 40–80 words; solution pages scannable (cards + short paragraphs)

## 4. Migration Checklist

**Phase A — Preparation**
- [x] Positioning statement approved (`docs/positioning.md`)
- [x] ICP confirmed
- [x] New URLs decided: `/solutions/azure`, `/solutions/ai-agents`, `/services` (existing, reused)
- [ ] Design/layout approach agreed — default: reuse existing components (cards, badges, `DownloadLink`) rather than new patterns

**Phase B — Content Production**
- [ ] Write full Homepage content
- [x] Write Azure Solutions page (EN + FR, `messages/*.json` → `solutions_azure`)
- [x] Write AI Agents / API0 page (EN + FR, `messages/*.json` → `solutions_ai_agents`)
- [x] Write Services page (EN + FR; page moved off hardcoded English onto i18n keys)
- [x] Write new Apps page intro + secondary section (EN + FR)
- [ ] Update all meta titles & descriptions
- [ ] Prepare any new images/icons if needed

**Phase C — Implementation**
- [x] Create route `src/app/[locale]/solutions/azure/` (+ localized metadata in its `layout.tsx`)
- [x] Create route `src/app/[locale]/solutions/ai-agents/` (+ localized metadata)
- [ ] Update Homepage (`src/app/[locale]/page.tsx`, `src/components/home/ClientHomeSection.tsx`)
- [x] Extract `desktopToolsConfig` into `src/data/tools.ts` + shared `src/components/ui/ToolVisuals.tsx`
      (status/data-source badges, download row) so Apps and Solutions share one
      source of truth for download URLs — done as groundwork for the Azure page
- [x] Restructure Apps page (`src/app/[locale]/apps/page.tsx`) into primary + "also built with our stack" tiers
- [x] Update global navigation (`src/components/layout/Navbar.tsx`): flat nav now
      `Home | Azure Tools | AI Agents | Apps | Services | Blog | Contact` (EN) /
      `Accueil | Outils Azure | Agents IA | Apps | Services | Blog | Contact` (FR).
      `isSwissRust` unchanged — nav stays empty there, as decided.
- [ ] Footer "company" column (`src/components/layout/Footer.tsx`) still lists only
      Home / About / Contact / Blog — Services and Azure Tools not yet added
- [ ] Update footer links if relevant
- [x] Add new routes to `scripts/generate-sitemap.js` (now a derived `STATIC_PAGES` list; also picked up `/apps`, which had been missing)
- [ ] Internal links between pages: Homepage → Solutions → Apps → Services

**Phase D — Quality & Launch**
- [ ] Mobile + desktop review of all key pages
- [ ] Check all CTAs and download links
- [ ] 5-second clarity test with 2–3 people outside the team
- [ ] Soft launch
- [ ] Publish short announcement post (Blog + LinkedIn)

## 5. Success Metrics (content perspective)

- Bounce rate on Homepage and new Solutions pages
- Click-through rate: Homepage → Azure Tools / API0 / Services
- Time on page for Solutions pages
- Number of consult bookings and tool downloads
- Qualitative: do visitors immediately understand what we do?

## 6. Quick Reference — Key Messages to Repeat

- **Primary:** Reliable Rust layer for production AI agents and Azure integration workflows
- **Azure angle:** Develop, monitor and trace Logic Apps & related services locally with confidence
- **AI Agents angle:** Bridge any API to Claude, GPT and other LLMs in minutes — MCP-native, secure, high-performance
- **Services angle:** Custom high-performance AI and Azure tooling built with the same proven Rust stack

---

Planning phase (Steps 1–3) is complete. `docs/positioning.md`,
`docs/content-architecture.md`, and this file form the full migration plan.
Next actual work is Phase B/C above — writing and implementing the content.
