# Baseline — 28 October 2026

Phase 0 of the experience roadmap: where the site stands before any of the
improvement work, so each later change can be measured against it.

## How it was measured

- Lighthouse 13.6.0, run locally in headless Chrome against the live
  https://mayorana.ch, mobile (default throttling) and desktop presets.
  The PageSpeed Insights API was not usable without an API key, so there is no
  real-user (CrUX) data here yet.
- `next build` (Next 16.1.6, Turbopack) for the route rendering table.
- Raw reports are not kept in the repo; re-run the same command to compare.

## Scores

| Page | Perf (m / d) | LCP mobile | CLS mobile | JS mobile | A11y | SEO |
|---|---|---|---|---|---|---|
| /en | 100 / 100 | 1.4 s | 0.000 | 398 KB | 96 | 92 |
| /fr | 100 / 100 | 1.4 s | 0.000 | 398 KB | 96 | 100 |
| /en/apps | 100 / 100 | 1.4 s | 0.000 | 403 KB | 96 | 100 |
| /en/apps/gitagent | 100 / 99 | 1.4 s | 0.000 | 356 KB | 93 | 100 |
| /fr/apps/gitagent | 100 / 100 | 1.4 s | 0.000 | 356 KB | 93 | 100 |
| /en/blog | 99 / 94 | 1.6 s | 0.000 | 399 KB | 94 | 92 |
| /en/blog/(latest post) | **78** / 97 | **6.1 s** | 0.000 | 398 KB | 96 | 100 |
| /fr/blog/(latest post) | **78** / 96 | **5.9 s** | 0.000 | 398 KB | 96 | 100 |
| /en/pricing | **79** / 90 | 1.2 s | **0.469** | 364 KB | 96 | 100 |
| /en/contact | **81** / 99 | **5.1 s** | 0.000 | 407 KB | 96 | 100 |

JS is transferred (compressed) size. Best practices scored 100 everywhere.

## Findings, worst first

1. **Every page under `/[locale]` is rendered on each request.** The build
   marks all of them `ƒ (Dynamic)`, so the `generateStaticParams` in the blog
   and locale layout does nothing. The cause is `headers()` in
   `src/app/[locale]/layout.tsx`, read only to detect the swissrust.ch host.
   Fixing it (e.g. let the middleware rewrite swissrust.ch to its own segment)
   makes the blog static again: less VPS load, faster first byte, and a
   prerequisite for Phase 4's caching work.

2. **The pricing page serves no plans in its HTML.** Plans are fetched in the
   browser (`fetchPlans` in `PlanPicker.tsx`) behind
   `<Suspense fallback={null}>`, so crawlers and AI agents see only
   "Loading the plans…", and the footer jumps when they arrive (CLS 0.47 on
   mobile, 0.21 on desktop — the whole shift is the footer). Render the plan
   list on the server, keep only the subscribe/checkout part in the browser.

3. **Blog posts and contact take 5–6 s to paint on mobile.** The largest
   element is ordinary text, but it starts at `opacity: 0` in a Framer Motion
   wrapper (`BlogPost.tsx`, `contact/page.tsx`) and only appears once the JS
   has loaded and hydrated. This is roadmap item 4.2; it is the single
   biggest performance win on the pages that carry the search traffic.

4. **Firebase sign-in loads on every page for every visitor.** About 135 KB
   (`/__/auth/iframe.js` 94 KB, Google's gapi 41 KB) plus two
   `getProjectConfig` calls, before anyone clicks Sign in. Roadmap item 4.1.

5. **"Read more" links.** The home and blog list use "Read more" as the full
   link text (3 links on /en, 12 on /en/blog), the only SEO audit that fails.
   Give each link the post title, visibly or via `aria-label`.

6. **Colour contrast** fails on primary-coloured text and buttons on the app
   pages (download button, table header, tab button, inline links), and links
   inside text are told apart by colour only.

7. **About 400 KB of JS on every page**, 135 KB of it unused on a blog post.
   Mostly items 3 and 4 above; re-measure after them before looking further.

Minor: the build warns that `middleware.ts` is deprecated in favour of
`proxy.ts`, the browserslist data is a year old, and the blog's
`generateStaticParams` prints one log line per post.

## Fixes applied — 28 October 2026 (findings 1–3)

- **Static pages.** Two causes, not one: `headers()` in the locale layout,
  and `i18n.ts` awaiting `requestLocale` (which reads the request) even when
  `getTranslations` was given a locale. swissrust.ch now has its own route
  segment, `src/app/[locale]/swissrust/blog/…`, that the middleware rewrites
  every swissrust.ch request into; its pages re-export the blog's, and the
  listing takes the site as a prop (`components/blog/BlogIndex.tsx`). The
  segment 404s on mayorana.ch. Home, apps, posts, tags, pricing, contact,
  founding and the legal pages now prerender; the blog listing stays dynamic
  because it reads `?page=` and `?view=`.
- **Pricing.** Plans are fetched on the server (revalidated hourly) and
  rendered into the HTML. `useSearchParams` cannot run during prerender, so
  pricing, contact and founding render their full content as the Suspense
  fallback with no query, and the browser swaps in the query-aware version.
  The sign-in note under the plans now keeps its space while auth resolves.
- **No more opacity-0 fade** on blog posts, contact and founding.

Lighthouse mobile, local production build (`prod-check` in
`.claude/launch.json`, `NEXT_DIST_DIR=.next-check`) — not directly comparable
with the live numbers above (no network hop), but the problem pages moved:

| Page | Before (live) | After (local) |
|---|---|---|
| /en/blog/(latest post) | 78, LCP 6.1 s | 100, LCP 1.1 s |
| /fr/blog/(latest post) | 78, LCP 5.9 s | 94, LCP 3.1 s |
| /en/pricing | 79, CLS 0.469 | 100, CLS 0 |
| /en/contact | 81, LCP 5.1 s | 100, LCP 0.9 s |
| /en/founding | — | 94 (was 79 locally before its fade was removed) |
| /en, /en/apps, /en/apps/gitagent | 100 | 100 |

Re-measure on the live site after the deploy.

## Phase A — 28 October 2026

- **Markdown twins (roadmap 1.1).** Every post and app page is also served as
  markdown at the same URL plus `.md`, prerendered by the `md` route handlers
  next to each page (the middleware rewrites the `.md` URL to them). They send
  `Link: <html page>; rel="canonical"`, and each page announces its twin with
  `<link rel="alternate" type="text/markdown">`. Builder:
  `src/lib/markdown-export.ts`.
- **llms.txt (1.2).** `/llms.txt` (English, = `/en/llms.txt`) and
  `/fr/llms.txt` list the apps, pricing and every post grouped by learning
  track; `/llms-full.txt` concatenates all of it (~770 KB in English).
- **Crawlers (1.3).** No change in behaviour: AI crawlers were already allowed
  by `User-agent: *`. robots.txt now says so and points agents at /llms.txt.
- **JSON-LD (1.4).** Posts now carry `BlogPosting` and `BreadcrumbList`. App
  pages already had `SoftwareApplication`, `BreadcrumbList` and `FAQPage`.
- **"Read more" links** carry the post title (visually hidden).
- **Firebase (4.1).** Auth is initialised with `initializeAuth` and no
  popup/redirect resolver, which is passed to the sign-in calls instead, and
  `getRedirectResult` runs only after a redirect sign-in. Google's sign-in
  iframe and gapi no longer load on page view. Not exercised end to end: a
  real Google/GitHub sign-in (popup and redirect) needs checking after deploy.
- **Framer Motion (4.2).** Replaced by CSS (`.rise`, `.rise-in-view` in
  `globals.css`, off under reduced motion) everywhere except the app side
  panel, whose close flow needs `AnimatePresence`'s exit callback; that code
  only loads with the panel.
- **Version pill (5.2).** App pages show "Version x · date" next to the status
  badge, linking to that release's notes.

Lighthouse mobile, local production build after Phase A:

| Page | Perf | SEO | A11y | JS |
|---|---|---|---|---|
| /en | 100 | 100 | 96 | 218 KB (was 398) |
| /en/apps | 100 | 100 | 96 | 236 KB (was 403) |
| /en/apps/gitagent | 100 | 100 | 93 | 251 KB (was 356) |
| /en/blog | 100 | 100* | 94 | 239 KB (was 399) |
| /en/blog/(post) | 100 | 100 | 96 | 238 KB (was 398) |
| /en/solutions/azure | 100 | 100 | 96 | 234 KB |
| /en/contact | 100 | 100 | 96 | 253 KB (was 407) |
| /en/pricing | 95 | 100 | 96 | 237 KB (was 364) |

\* 92 on the run itself, from robots.txt answering 429: the middleware's
per-IP limit, tripped by running Lighthouse back to back from one machine.

**Contrast (light mode).** Solid uses of the orange (text, buttons) now use
`--primary` = #B24A00 (5.4:1 on white); faint tints and borders, i.e. an
opacity modifier under 0.5, keep the brand #FF6B00 as `--brand` (the split is
a colour function in `tailwind.config.ts`). Also: `--muted-foreground`
darkened to 43% lightness (4.3 → 5.0:1 on grey chips), the Linux download
button and the WhatsApp buttons moved to orange-700 / green-700, links inside
sentences are underlined, and two heading-level skips fixed (blog tag
sidebar, release notes). Lighthouse accessibility is 100 on every page
audited (home, apps, an app, its release notes, blog, a post, pricing,
contact, founding, Azure; English and French).

Still open: in dark mode the buttons keep white text on #FF6B00 (2.9:1);
Lighthouse audits light mode only. And the client-component audit (4.3)
beyond removing Framer Motion: the legal, about and solutions pages are
still client components.

## Phase B, part 1 — 28 October 2026

- **Learning paths (3.1, 3.3).** `/learn` lists the tracks; `/learn/<track>`
  shows a track's sections in reading order with a read mark per step, a
  progress bar, and a Start / Continue button to the first unread step, or
  "Path complete". Public, prerendered, in the sitemap with hreflang, with
  `ItemList` and `BreadcrumbList` JSON-LD. Copy in the `learn` namespace of
  messages/*.json; sections from content/learning-path.json, which gained an
  `ai` track for the one post that was on none. Linked from the footer, the
  blog listing and each post's header ("Part of the learning path …").
- **Continue reading (3.2).** A dismissible card in the corner of the home,
  blog and /learn pages: the article the reader left halfway, or the next
  unread step of the track they last finished a post in. Fixed position, so
  it causes no layout shift; fetches nothing for a visitor with no history.
- **Search (3.4).** ⌘K / Ctrl+K / "/" or the navbar icon opens a palette over
  posts, apps, tracks and pages, from `/<locale>/search-index.json` (~32 KB,
  static, fetched on first open; also what the continue-reading card reads).
  Accent-insensitive; combobox/listbox semantics. Hidden on swissrust.ch. The
  separate /search results page in the roadmap was dropped: the palette
  covers it and Google no longer shows a sitelinks search box.
- **MCP install (5.4) and panel (5.5).** Already in place: every app that
  declares an MCP server shows the install lines, on its page and in the
  panel (same component). AIS Monitor, AIS Tracing, AIS Analytics and
  SurfaceWatch declare none; add `mcp` in src/data/tools.ts if they ship one.

Lighthouse mobile on the local build: /en/learn, /en/learn/rust,
/fr/learn/llm, /en, /en/blog/(post) all 100 performance, accessibility and
SEO.

## Phase B, part 2 — 28 October 2026

- **Runnable snippets (2.1).** Every Rust example in a post that is a whole
  program (has `fn main`) gets a Run button and an "Open in the Rust
  Playground" link; the code goes to play.rust-lang.org/execute (CORS open)
  only on click, and stdout and compiler output appear under the block.
  ```` ```rust,ignore ```` hides the button; ```` ```rust,compile_fail ````
  marks an example meant not to build (its Run shows the compiler error).
  Component: `src/components/blog/RunnableSnippets.tsx`. The privacy policy
  now names the Playground.
- **Snippet check.** `yarn check-snippets [en|fr|file.md]` builds every
  runnable example on the Playground, one per 1.5 s, and lists failures; not
  part of the build. First run: 132 examples, 22 failing. Fixed: a missing
  `use std::borrow::Cow;` (en, fr) and a missing closure type annotation
  (fr closures_1). Marked `compile_fail`: 4 deliberate borrow-checker
  examples. Marked `ignore`: 15 that need code from another block, a crate
  the Playground lacks (criterion), the rand 0.8 API (the Playground has
  0.9), or that do not compile as written — fr closures_6 (curried
  `impl Fn` returning `impl Fn`) and fr closures_7 (a lifetime error); those
  two are worth fixing in the article. All 132 now behave as marked.
- **Post body memoised.** BlogPost re-renders as reading progress is saved
  while scrolling, and React replaced the article's DOM on each of those
  re-renders; the body is now a memoised component (`PostBody`).
- **Dark-mode contrast.** Solid orange buttons used `text-white`; in dark mode
  the orange is the bright brand colour (2.9:1). They now use
  `text-primary-foreground` (white in light mode, dark navy in dark mode,
  6.2:1). Accessibility is 100 in both themes on home, an app page, a post,
  pricing, a track and contact.
- Removed per-post `console.log` debugging from BlogList.

## Phase B, part 3 — 28 October 2026

- **One-line install (5.1).** Every app page shows, under the download
  buttons, `curl -fsSL https://mayorana.ch/install/<id>.sh | sh` (macOS,
  Linux) and `irm https://mayorana.ch/install/<id>.ps1 | iex` (Windows), each
  with Copy and a "Read the script" link; the app's markdown twin lists them
  too. The scripts are generated at build time from src/data/tools.ts
  (`src/lib/install-scripts.ts`, served by `src/app/install/[file]`), so
  they always fetch the same builds as the buttons:
  - macOS: mounts the .dmg, copies the .app into /Applications (or
    ~/Applications), unmounts; refuses on Intel for -arm64-only builds.
  - Linux .tar.gz: extracts to ~/<id>-linux-x86_64 (where the MCP lines
    expect it), links ~/.local/bin/<id>, and prints — does not run — the
    archive's `sudo setup-linux.sh`. Linux .deb (ShipScreen): `sudo apt-get
    install`, after saying so.
  - Windows: downloads the installer and starts it; no silent flags.
  - Downloads send `User-Agent: mayorana-install/1 (<id>)` and
    `utm_source=install-script&utm_medium=cli`. Without the agent,
    scripts/downloads-stats.py would drop them as bots (it filters `curl/`).
- **Tested:** all scripts pass `sh -n`, ShellCheck and a PowerShell parse.
  Run for real against the live builds (with a bot user agent so the tests
  do not count): the macOS branch installed GitAgent.app with its Developer
  ID signature intact and unmounted the image; the Linux .tar.gz branch
  (forced on macOS) extracted and linked GitAgent; the Windows script
  downloaded the 7 MB installer and cleaned up (launch stubbed). Not run:
  the .deb branch and a real Linux or Windows machine — Docker was not
  running.

## Phase C — 28 October 2026

- **Public MCP server (1.5).** `https://mayorana.ch/mcp`, Streamable HTTP,
  read-only, stateless, no account. Tools: `search`, `list_apps`, `get_app`,
  `get_release_notes`, `get_post`, `get_learning_path`, `get_pricing` — all
  answering from the same data as the pages, in English or French.
  Hand-written JSON-RPC (`src/lib/mcp-server.ts`, `src/app/mcp/route.ts`);
  tested with the official MCP SDK client: initialize, tools/list and every
  tool, plus notifications (202), GET (405, or a pointer for a browser),
  CORS preflight, parse errors and unknown methods. Rate-limited apart from
  page traffic (120/min per IP), excluded from the locale redirect and the
  swissrust rewrite, disallowed in robots.txt. Announced in /llms.txt and in
  a block at the end of /apps with the Claude Code and Codex commands.
  Registering it with api0 and listing it in MCP registries are left to do
  by hand.
- **View Transitions (4.4).** `experimental.viewTransition` on; the page
  content cross-fades on navigation (navbar and footer stay), and a post's
  title morphs from its card into the article's heading. 0.25 s, off under
  reduced motion. Next's React exports `ViewTransition`, but @types/react
  only declares `unstable_ViewTransition` (undefined at runtime);
  `src/types/view-transition.d.ts` declares the real name.
- **Prefetching (4.5).** Speculation Rules not added: they prerender full
  documents, and navigation here is client-side through `<Link>`, so they
  would mostly add server load. Instead, post links prefetch again (they
  opted out when posts were rendered per request; now they are static), and
  the ~80 tag links in the blog sidebar stopped prefetching: they were
  generating over a hundred segment requests per listing view, enough to
  approach the middleware's 500/min per-IP limit for an active reader. A
  listing view now prefetches about 55 small static files.
- **Cache Components (4.6): not adopted.** A trial build with
  `cacheComponents: true` failed on 16 route files (`dynamic` and
  `dynamicParams` are not allowed with it), before reaching the deeper
  changes it needs (pricing's fetch, the listing's query string, the
  language redirects). Every page but the blog listing is already
  prerendered, so the gain does not justify the migration now.
- **Performance budget (4.8).** `yarn perf-budget [url]` runs Lighthouse
  on 9 key pages in light and dark mode and fails on: performance < 90,
  accessibility < 100, SEO < 100, best practices < 95, LCP > 2.5 s,
  CLS > 0.1, TBT > 200 ms, or more than 300 KB of JS. Default URL is
  production; meant for after each deploy. A Lighthouse crash is retried
  once. Against the local build: all 18 runs within budget, every score
  100, LCP 0.9–1.2 s, CLS 0, JS 221–256 KB.

- **Query strings without Suspense.** Pricing, contact and founding read
  their query (`?checkout=`, `?service=`, `?tool=`) with `useQuery`
  (`src/lib/use-query.ts`, `useSyncExternalStore` over `location.search`)
  instead of `useSearchParams` behind a Suspense fallback. The fallback
  approach from the Phase A fix had React discard and repaint the whole
  content on hydration, which put LCP back around 3 s on a throttled phone;
  now the prerendered DOM is kept and only re-renders when a query is
  present.

- **Ask Mayorana (1.6, 3.5).** In the ⌘K palette, the first row for anything
  typed is "Ask Mayorana: <question>". The server (`src/lib/ask.ts`,
  `POST /api/ask`) ranks the search index loosely against the question, puts
  the top 4 posts or app pages (their markdown twins) plus the app list and
  the plans into the prompt, and has the model answer from those alone,
  citing them [n]; the palette shows the answer and the cited pages. The
  answer is rendered to HTML on the server with raw HTML escaped, images
  dropped and only http(s) links kept.
  - **Model:** through api0's `/v1/chat/completions` with model `usa` and
    `X-Task: chat`, which runs Claude Haiku 5.5 in the default region
    config. No sampling parameters (Claude rejects them).
  - **Spending cap:** a licence of the site's own in `ASK_API0_LICENCE`; its
    monthly AI-credit allowance is the hard cap, enforced by api0 (402 when
    spent, shown as "resting until next month"). A question's prompt is
    ~11k tokens, so one question ≈ 1–2 credits (Haiku is ×1, 10k tokens a
    credit, ≈ $0.0015 a question): **~30,000 credits ≈ 50 CHF a month**,
    about 20,000 questions. On the site, as a second guard: 6 questions a
    minute per IP (middleware), 30 a day per IP and 1,000 a day in all (in
    memory), and a 6-hour cache of identical questions.
  - **Off until configured.** Without `ASK_API0_LICENCE` the palette does not
    offer Ask and the route answers 404. To turn it on: create the licence
    in api0 with the monthly allowance, put
    `ASK_API0_LICENCE=<licence>` in `/var/www/mayorana/.env.local` on the
    VPS (read by both the build — the search index carries the on/off flag —
    and the server), and deploy. `ASK_API0_REGION` overrides `usa`.
  - The privacy policy names Anthropic, through api0, for questions asked.
  - **Tested** against a mock of api0's endpoint (no real licence here): the
    request carries the licence, `model: usa`, `X-Task: chat` and no
    sampling parameters; retrieval picks the right pages in English and
    French; a repeated question is served from the cache; 402 becomes
    "exhausted"; HTML in an answer is escaped; sources keep the numbers the
    answer cites; the 7th question in a minute from one IP gets 429; with no
    licence the palette has no Ask row and the route answers 404. A real
    Haiku answer is untested until the licence exists.

## Live, after deploy — 28 October 2026

`yarn perf-budget https://mayorana.ch`: all 18 runs (9 pages × light and
dark) within budget, every score 100.

| Page (mobile) | Baseline this morning | Live now |
|---|---|---|
| /en | 100, LCP 1.4 s, JS 398 KB | 100, LCP 1.2 s, JS 224 KB |
| /en/apps/gitagent | 100, a11y 93, JS 356 KB | 100, a11y 100, JS 258 KB |
| /en/blog | 99, SEO 92, JS 399 KB | 100, SEO 100, JS 243 KB |
| /en/blog/(post) | 78, LCP 6.1 s | 100, LCP 1.2 s |
| /en/pricing | 79, CLS 0.469 | 100, CLS 0 |
| /en/contact | 81, LCP 5.1 s | 100, LCP 1.1 s |

## Search Console baseline — last 3 months, to 28 October 2026

Domain property `mayorana.ch`, verified by DNS TXT at OVH on 28 October
2026; sitemap submitted the same day.

| Clicks | Impressions | CTR | Average position |
|---|---|---|---|
| 55 | 8,800 | 0.6 % | 9.6 |

| Country | Clicks | Impressions | CTR | Position |
|---|---|---|---|---|
| United States | 7 | 2,290 | 0.3 % | 9.8 |
| France | 6 | 671 | 0.9 % | 7.7 |
| Poland | 5 | 178 | 2.8 % | 7.0 |
| Germany | 4 | 469 | 0.9 % | 7.5 |
| United Kingdom | 4 | 417 | 1 % | 7.8 |

| Top pages | Clicks | Impressions | CTR | Position |
|---|---|---|---|---|
| /en/blog/box-slice-vs-vec-differences | 14 | 1,288 | 1.1 % | 7.0 |
| /en/blog/vec-drain-vs-truncate-clear | 7 | 1,613 | 0.4 % | 9.0 |
| /en/blog/vec-new-vs-with-capacity | 5 | 941 | 0.5 % | 7.6 |
| /fr/blog/clamp-rust | 3 | 193 | 1.6 % | 8.1 |
| /en/blog/branch-prediction-rust | 3 | 139 | 2.2 % | 10.0 |

Reading: the site is found (8,800 impressions, almost all on the Rust
posts) and ranks on page 1 (average 9.6), but few people click: 0.6 %, where
positions 7–10 usually see 1–3 %. The titles and descriptions shown in the
results are the lever, starting with the posts that have the most
impressions. Re-read these numbers in a month to see the effect of the
fixes deployed today (prerendered pages, hreflang, JSON-LD, markdown twins).

Done the same day for the five posts above: `seo_title` and
`meta_description` front matter, written for the query (e.g. "Rust Vec:
drain() vs truncate() vs clear()"), now used for the page's `<title>`,
description and social cards; the visible heading is unchanged. Other posts
fall back to their title and excerpt. Compare each page's CTR in a month.

## Follow-ups — 28 October 2026

- **Server components.** Privacy, terms, about, Azure Tools and AI Agents
  render on the server (still prerendered); only their interactive pieces
  ship JS. Saving is small (3–5 KB a page): most JS is shared. The legal
  pages lost their fade-in, which held their LCP at 3 s.
- **Lint clean.** `useFromCvenom` (pricing) reads sessionStorage through
  `useSyncExternalStore`; `eslint src` reports no errors.
- **Firebase on demand.** `src/lib/firebase-kit.ts` is the only module that
  imports Firebase, a chunk of its own (32 KB gz) loaded by `loadFirebase()`
  in `src/lib/firebase.ts`:
  - at page start only for a browser that may hold a session — our
    `mayorana.auth.signedIn` flag, Firebase's own IndexedDB store (covers
    people signed in before this change), or a redirect sign-in coming back;
  - otherwise on an intent to sign in (`prepare()` from `useAuth()`):
    pointing at, focusing or pressing a Sign in button, or the download
    panel, plan sign-in dialog or learning-path chooser opening.
  First-time visitors download 31–33 KB less JS on every page (home 222 →
  189 KB). Tested on clean origins: nothing loads on a first visit; hover on
  Sign in and the download panel load it; a returning visitor gets it at
  page start and the session check completes. Hardening: if restoring the
  session hangs (IndexedDB), Sign in shows after 5 s; a failing redirect
  fallback reports `failed` instead of an unhandled rejection. Not tested
  end to end: a real sign-in (needs a person) — try Google and GitHub once
  after deploying, on desktop and on a phone.
- **4.7 closed (29 October).** Images: `formats: ['image/avif', 'image/webp']`
  in next.config.ts — the GitAgent screenshot is 26 KB as AVIF against 31 KB
  as WebP (324 KB original). Debug logging removed from the blog post page,
  the locale layout and the 404 page; the build log went from 728 lines to
  140.
- **GitHub sign-in** needs the GitHub OAuth app's Authorization callback URL
  set to `https://mayorana.ch/__/auth/handler`, as Google's client did (the
  custom auth domain, #116). GitHub allows a single callback URL.
  Done 29 October; GitHub sign-in confirmed working on the live site, with
  Firebase loading on demand.

## Analytics

Plausible was removed on 28 October 2026 (script, event calls, and the
privacy policy entries). What remains:

- **Server logs → nightly totals** (`scripts/downloads-stats.py`, `/stats`):
  downloads per tool, referrers, countries. Downloads carry the visitor's
  first-touch source through `src/lib/attribution.ts`.
- **The api0 gateway** records sign-ins, licences and checkouts.

So the funnel from download onwards is still measured. What is no longer
measured is anything that only happens in the browser: copying an install or
MCP command, social shares, WhatsApp clicks, page views by page. If those
matter later, the privacy-preserving option is a small first-party beacon
endpoint counted alongside the server logs, not a third-party script.

## Still to do for Phase 0

- Search Console baseline (clicks, impressions, indexed pages per locale) —
  needs the account owner.
- Real-user Core Web Vitals: add a PageSpeed Insights API key, or read the
  Core Web Vitals report in Search Console.
