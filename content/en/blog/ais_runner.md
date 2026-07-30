---
id: ais-runner-intro
title: "AIS Runner: A Desktop GUI for Local Azure Logic Apps Standard Development"
locale: en
slug: ais-runner-intro
date: '2026-05-29'
author: mayo
excerpt: >-
  AIS Runner is a Dioxus-based desktop app for local Azure Logic Apps Standard
  development — manage, run, debug, and compare workflows without leaving your
  dev environment.
tags:
  - azure
  - logic-apps
  - dioxus
  - rust
  - desktop
---

# AIS Runner: A Desktop GUI for Local Azure Logic Apps Standard Development

Developing Azure Logic Apps Standard locally usually means juggling the CLI, VS Code extensions, the Azure portal, DevOps pipelines, and a handful of terminals to inspect Service Bus queues or compare environment settings. **AIS Runner** brings all of that into a single Dioxus-based desktop app — a visual GUI to manage, run, debug, and compare workflows without leaving your dev environment.

It runs natively on macOS, Windows, and Linux via Dioxus desktop (WebView).

<div class="svg-container" style="margin:2rem 0;">
<svg class="aisr-fig" viewBox="0 0 800 300" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="AIS Runner acts as a single desktop hub connecting local development, Azure cloud, DevOps, and Service Bus">
<style>
.aisr-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .aisr-fig,[data-theme="dark"] .aisr-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.aisr-fig text{font-family:ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.aisr-fig .title{font-size:14px;font-weight:700}
.aisr-fig .body{font-size:12px;font-weight:600}
.aisr-fig .cap{font-size:11px;fill:var(--mut)}
.aisr-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.aisr-fig .acbox{fill:var(--ac);stroke:var(--ac)}
.aisr-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="aisr-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"></path>
</marker>
</defs>
<!-- center hub -->
<rect class="acbox" x="300" y="20" width="200" height="55" rx="8"></rect>
<text x="400" y="43" text-anchor="middle" class="title" fill="#ffffff">AIS Runner</text>
<text x="400" y="61" text-anchor="middle" class="body" fill="#ffffff">Desktop GUI (Dioxus)</text>
<!-- merge point -->
<path class="ln" d="M400,75 L400,110"></path>
<path class="ln" d="M115,110 L685,110"></path>
<path class="ln" d="M115,110 L115,160" marker-end="url(#aisr-arrow)"></path>
<path class="ln" d="M305,110 L305,160" marker-end="url(#aisr-arrow)"></path>
<path class="ln" d="M495,110 L495,160" marker-end="url(#aisr-arrow)"></path>
<path class="ln" d="M685,110 L685,160" marker-end="url(#aisr-arrow)"></path>
<!-- four targets -->
<rect class="box" x="30" y="160" width="170" height="100" rx="8"></rect>
<text x="115" y="185" text-anchor="middle" class="title">Local Dev Env</text>
<text x="115" y="205" text-anchor="middle" class="cap">rustup, prereqs,</text>
<text x="115" y="220" text-anchor="middle" class="cap">local.settings.json,</text>
<text x="115" y="235" text-anchor="middle" class="cap">Azurite emulator</text>
<!-- box 2 -->
<rect class="box" x="220" y="160" width="170" height="100" rx="8"></rect>
<text x="305" y="185" text-anchor="middle" class="title">Azure Cloud</text>
<text x="305" y="205" text-anchor="middle" class="cap">deployed workflows,</text>
<text x="305" y="220" text-anchor="middle" class="cap">az login,</text>
<text x="305" y="235" text-anchor="middle" class="cap">diff local vs cloud</text>
<!-- box 3 -->
<rect class="box" x="410" y="160" width="170" height="100" rx="8"></rect>
<text x="495" y="185" text-anchor="middle" class="title">Azure DevOps</text>
<text x="495" y="205" text-anchor="middle" class="cap">pipelines,</text>
<text x="495" y="220" text-anchor="middle" class="cap">variable groups</text>
<!-- box 4 -->
<rect class="box" x="600" y="160" width="170" height="100" rx="8"></rect>
<text x="685" y="185" text-anchor="middle" class="title">Service Bus / DB</text>
<text x="685" y="205" text-anchor="middle" class="cap">queues, DLQ,</text>
<text x="685" y="220" text-anchor="middle" class="cap">SQL, Cosmos DB,</text>
<text x="685" y="235" text-anchor="middle" class="cap">Blob / Azurite</text>
<!-- caption -->
<text x="400" y="285" text-anchor="middle" class="cap">One native app replaces the CLI + portal + terminals juggling act</text>
</svg>
</div>

## 🔧 Local Development Environment

- **Auto-detection of prerequisites** — checks for Node.js, Azure Functions Core Tools, .NET, and Java runtimes, and guides setup
- **Project workspace management** — link local Logic Apps projects to their Azure counterparts (subscription, resource group, app name, Service Bus namespace)
- **`local.settings.json` editor** — visual key/value editor with secret masking, grouped by category (Service Bus, connection strings, etc.)
- **System theme support** — auto-detects dark/light OS preference with manual toggle

## ▶️ Workflow Execution

- Run workflows locally with **trigger-aware execution** (HTTP, Service Bus, Blob triggers)
- **Payload editor** — compose and send JSON payloads to trigger workflows
- **Service Bus message injection** — send messages to queues via AMQP, auto-detecting local emulator vs cloud namespace
- **Blob trigger support** — pre-flight checks for Azurite container existence
- **Run history viewer** — inspect individual run details, inputs/outputs per action

## 📊 Workflow Visualization

- Workflow list with trigger type indicators and status
- **Visual graph panel** — DAG rendering of workflow action dependencies
- **Workflow analysis** — detects all referenced queues, connections, and actions per workflow
- **Connection diagnostics** — validates `connections.json` references and flags broken `@appsetting` bindings

## ☁️ Azure Cloud Integration

- **Azure panel** — list remote workflows, diff local vs deployed definitions
- **Sync & deploy** — compare local workflow JSON with Azure-deployed versions
- **Download remote configs** — pull `parameters.json` and `connections.json` from Azure
- **Run history from Azure** — fetch execution history for deployed workflows
- **`az login` integration** — detects expired tokens and prompts re-authentication

## 🔄 Azure DevOps Integration

- **Pipeline viewer** — list and browse DevOps pipelines for the linked project
- **Auto-detect DevOps URL** from the git remote
- **Variable group browser** — list all DevOps variable groups and inspect their contents

## ⊞ Compare Environments

- **Multi-column environment comparison** — compare `local.settings.json` against Azure cloud app settings and multiple DevOps variable groups side-by-side
- **Diff filtering** — toggle "Differences only" with per-column checkboxes to compare any subset of environments
- **Secret masking** — hides sensitive keys with a reveal toggle
- **Click-to-copy cells** with clipboard integration and detail popup

<div class="svg-container" style="margin:2rem 0;">
<svg class="aisenv-fig2" viewBox="0 0 800 250" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="The environment comparison grid puts local settings, Azure app settings and two DevOps variable groups side by side, flagging the cells that differ">
<style>
.aisenv-fig2{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .aisenv-fig2,[data-theme="dark"] .aisenv-fig2{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.aisenv-fig2 text{font-family:ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.aisenv-fig2 .title{font-size:13px;font-weight:700}
.aisenv-fig2 .body{font-size:12px;font-weight:600}
.aisenv-fig2 .cap{font-size:11px;fill:var(--mut)}
.aisenv-fig2 .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.aisenv-fig2 .hdr{fill:var(--bg);stroke:var(--ln);stroke-width:1.5}
.aisenv-fig2 .acbox{fill:var(--ac);stroke:var(--ac)}
.aisenv-fig2 .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="aisenv2-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ac)"></path>
</marker>
</defs>
<!-- header row -->
<text x="20" y="28" class="title">Compare Environments — one row per key, one column per environment</text>
<rect class="box" x="560" y="12" width="220" height="26" rx="13"></rect>
<text x="670" y="30" text-anchor="middle" class="body" fill="var(--ac)">Differences only ✓</text>
<!-- column headers -->
<rect class="hdr" x="20" y="52" width="140" height="32" rx="6"></rect>
<text x="90" y="73" text-anchor="middle" class="body">Key</text>
<rect class="hdr" x="170" y="52" width="145" height="32" rx="6"></rect>
<text x="243" y="73" text-anchor="middle" class="body">local.settings</text>
<rect class="hdr" x="325" y="52" width="145" height="32" rx="6"></rect>
<text x="398" y="73" text-anchor="middle" class="body">Azure settings</text>
<rect class="hdr" x="480" y="52" width="145" height="32" rx="6"></rect>
<text x="553" y="73" text-anchor="middle" class="body">DevOps VG · DEV</text>
<rect class="hdr" x="635" y="52" width="145" height="32" rx="6"></rect>
<text x="707" y="73" text-anchor="middle" class="body">DevOps VG · PROD</text>
<!-- row 1: identical secret -->
<rect class="box" x="20" y="92" width="140" height="34" rx="6"></rect>
<text x="90" y="114" text-anchor="middle" class="cap">Sql:ConnStr</text>
<rect class="box" x="170" y="92" width="145" height="34" rx="6"></rect>
<text x="243" y="114" text-anchor="middle" class="cap">•••• masked</text>
<rect class="box" x="325" y="92" width="145" height="34" rx="6"></rect>
<text x="398" y="114" text-anchor="middle" class="cap">•••• masked</text>
<rect class="box" x="480" y="92" width="145" height="34" rx="6"></rect>
<text x="553" y="114" text-anchor="middle" class="cap">•••• masked</text>
<rect class="box" x="635" y="92" width="145" height="34" rx="6"></rect>
<text x="707" y="114" text-anchor="middle" class="cap">•••• masked</text>
<!-- row 2: value drift in PROD -->
<rect class="box" x="20" y="130" width="140" height="34" rx="6"></rect>
<text x="90" y="152" text-anchor="middle" class="cap">ServiceBus:ns</text>
<rect class="box" x="170" y="130" width="145" height="34" rx="6"></rect>
<text x="243" y="152" text-anchor="middle" class="cap">sb-dev</text>
<rect class="box" x="325" y="130" width="145" height="34" rx="6"></rect>
<text x="398" y="152" text-anchor="middle" class="cap">sb-dev</text>
<rect class="box" x="480" y="130" width="145" height="34" rx="6"></rect>
<text x="553" y="152" text-anchor="middle" class="cap">sb-dev</text>
<rect class="acbox" x="635" y="130" width="145" height="34" rx="6"></rect>
<text x="707" y="152" text-anchor="middle" class="body" fill="#ffffff">sb-prod</text>
<!-- row 3: key missing in one variable group -->
<rect class="box" x="20" y="168" width="140" height="34" rx="6"></rect>
<text x="90" y="190" text-anchor="middle" class="cap">Feature:Retry</text>
<rect class="box" x="170" y="168" width="145" height="34" rx="6"></rect>
<text x="243" y="190" text-anchor="middle" class="cap">true</text>
<rect class="box" x="325" y="168" width="145" height="34" rx="6"></rect>
<text x="398" y="190" text-anchor="middle" class="cap">true</text>
<rect class="acbox" x="480" y="168" width="145" height="34" rx="6"></rect>
<text x="553" y="190" text-anchor="middle" class="body" fill="#ffffff">— missing</text>
<rect class="box" x="635" y="168" width="145" height="34" rx="6"></rect>
<text x="707" y="190" text-anchor="middle" class="cap">true</text>
<!-- filter points at the flagged cells -->
<path class="ln" d="M670,38 L670,72 L707,72 L707,130" marker-end="url(#aisenv2-arrow)" stroke="var(--ac)" stroke-width="2"></path>
<!-- caption -->
<text x="400" y="230" text-anchor="middle" class="cap">Only the drifted cells stay visible — a wrong namespace or a missing flag surfaces before deployment</text>
</svg>
</div>

## ⚡ Event Grid

- **Topic browser** — lists all custom and system Event Grid topics subscription-wide, with resource group badges
- **Subscription inspector** — expand any topic to see event subscriptions with endpoint type, filters, and event types
- **Topic comparison** — two-dropdown side-by-side compare of Event Grid topics between environments, highlighting differences in subscriptions and filters

## 🚌 Service Bus

- **Queue detection** — scans all workflow triggers and actions to discover referenced Service Bus queues
- **Emulator management** — Docker-based Service Bus emulator with auto-config generation
- **Queue browser (DB panel)** — inspect queue message counts, dead-letter queues, send test messages
- **Cross-environment queue comparison** — compare queues between DEV/STG/PROD namespaces with property diff (session, max delivery, lock duration, TTL, auto-delete)
- **DLQ and active message badges** in the comparison view

## 💾 Data Connectors (DB Panel)

- **SQL** — connection management for SQL Server databases referenced by workflows
- **Cosmos DB** — browse and manage Cosmos DB connections
- **Blob Storage / Azurite** — local Azurite emulator integration, container management, WebJobs storage config
- **SFTP** — SFTP connection viewer for file-based integrations
- **Maps** — Logic Apps maps (XSLT/Liquid transforms) management

## 🖥️ UX

- **Resizable split pane** — draggable divider between workflow list and detail panel
- **Persistent configuration** — workspace links, graph preferences, and settings saved across sessions
- **Keyboard shortcuts** — Escape to close overlays
- **Cross-platform** — runs on macOS, Windows, and Linux via Dioxus desktop (WebView)

## Why a Native Desktop App?

Building AIS Runner with Dioxus in Rust gives it the responsiveness of a native app with a modern UI layer. No Electron-sized memory footprint, no browser tab to lose. It sits next to your editor and your terminal, talks to your local emulators directly, and authenticates to Azure with the same `az` CLI session you already use.

If you work with Logic Apps Standard daily, AIS Runner is built to remove the friction between writing a workflow, running it locally, comparing it across environments, and shipping it.
