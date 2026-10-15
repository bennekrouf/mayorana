# Mayorana Positioning Foundation

Status: **Locked** — base for all future content/architecture work (Step 2+).
Owner: MB
Date: 2026-08-28
Amended: 2026-10-15 — api0's ICP and value proposition, for the Swiss go-to-market (see §6)

This document is the single source of truth for positioning. Every page, CTA, and
piece of content produced in later steps should trace back to it.

## 1. Positioning Statement

**Primary:**

> Mayorana builds the reliable Rust layer for production AI agents and Azure
> integration workflows. We turn complex systems into tools that actually
> work — secure, high-performance, and free of glue code.

**Short version** (hero, meta, LinkedIn):

> AI tools that actually work. Built with Rust.

**Tagline decision:** keep current tagline as secondary, always paired with the
short version above (not standalone).

> Rust builds what doesn't break. AI makes it human.

## 2. Ideal Customer Profile (ICP)

**Primary ICP — 70% of content & effort**
- Role: Azure Integration / Logic Apps developers, DevOps, Solution Architects, Platform Engineers
- Company: Mid-size to enterprise (Switzerland, DACH, EU) on Azure Integration Services, Service Bus, Event Grid, Cosmos DB, Logic Apps
- Pain: slow local dev loops, poor visibility into workflow chains, hard-to-debug correlation IDs, friction connecting internal APIs to AI agents
- Desired outcome: faster local testing, clear workflow visibility, secure agent-to-API bridges without custom glue code

**Secondary ICP — 30%**
- Swiss software vendors who want their product usable from their customers' Teams and WhatsApp, under their name (API0.AI). Microsoft partners and operations teams follow once vendor pilots prove it.
- Engineering teams / CTOs building agentic systems who need a production-grade MCP gateway (API0.AI, developer entry point)
- Companies wanting custom high-performance Rust + AI solutions

**Deprioritized — secondary proof only, not primary messaging**
- Job seekers / recruiters (CVENOM)
- Crypto users (SOLANIZE)
- General mobile app builders (ShipScreen)
- Content creators (PublishKit)

**Decision on secondary products:** treat as "also built with our stack" —
i.e. proof points of Rust/engineering capability, kept in a dedicated
secondary section rather than woven into primary messaging or nav-level
prominence.

## 3. Core Messaging Hierarchy

Apply this order on every major page:

1. **Outcome** — what the customer gains
   "Develop, monitor and connect Azure workflows + AI agents without the usual friction and risk."
2. **Mechanism** — how it's delivered
   "Native desktop tools + MCP gateway built in Rust for performance, safety and reliability."
3. **Proof** — why they should believe it
   "Real tools you can download today. Swiss-built. Open releases with checksums."
4. **Call to action**
   - Primary: Try / Download the relevant tool
   - Secondary: Book a free 30-min consult for custom work

## 4. Value Proposition Canvas

| Customer Job | Pain | Gain | Mayorana Solution |
|---|---|---|---|
| Develop & test Azure Logic Apps locally | Slow push-to-cloud cycles, limited visibility | Faster iteration, full local control | AIS Runner |
| Understand complex workflow chains | Hard to visualize Service Bus / Event Grid links | Clear visual map + live history | AIS Monitor |
| Trace a single correlation ID | Data scattered across containers / logs | Timeline view of where data went (and where it didn't) | AIS Tracing + AIS Analytics |
| Let staff and customers use our software from chat | Another app nobody opens, glue code, shared service accounts | Same software in Teams, WhatsApp, Telegram and Claude, each action as the real user | API0.AI |
| Build custom high-performance AI tooling | Need reliability + speed | Rust stack + proven portfolio | Custom Services |

## 5. Locked Decisions (Step 1 deliverables)

- [x] Positioning statement (primary + short version) — approved above
- [x] Primary + secondary ICP — confirmed above
- [x] Messaging hierarchy — confirmed above
- [x] Tagline: keep current tagline, use as secondary line under the new short version
- [x] Secondary products (CVENOM, SOLANIZE, ShipScreen, PublishKit): "also built with our stack" — proof section, not primary nav/messaging

## 6. Amendment — 2026-10-15

api0 moves from "MCP gateway for Claude", sold to developers, to **the conversational
front door to software a company already runs**, starting in Switzerland.

- First audience: **Swiss software vendors** (their product in their customers' Teams and
  WhatsApp, under their name). Microsoft partners and operations teams come later.
- One direct field-service pilot (WhatsApp) runs alongside, as a faster-closing backup.

- api0 one-liner: *Your software, in the chat your team already uses.*
- Channel order in Swiss-facing copy: Teams, WhatsApp, Telegram, Claude.
- "MCP" describes the mechanism (how-it-works, developer pages), never a hero or tagline.
- Mayorana's own positioning (§1), the primary ICP and the messaging hierarchy (§3) are unchanged.

Copy, claims that wait until they are true, and LinkedIn text:
`api0/positioning-update-2026-10.md`.

## Next

Step 2 — Content Architecture & New Pages: translate this foundation into
site structure, page-by-page copy, and navigation/CTA changes.
