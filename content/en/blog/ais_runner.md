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
