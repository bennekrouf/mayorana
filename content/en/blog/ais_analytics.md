---
id: trace-correlation-id-log-analytics
title: "Following a Correlation ID Through Log Analytics Without Writing KQL"
locale: en
slug: trace-correlation-id-log-analytics
date: '2026-09-05'
author: mayo
excerpt: >-
  A Log Analytics workspace holds the answer to where your integration flow
  stopped. Getting it out normally means a KQL query per table and knowing
  which column ties the steps together. It does not have to.
tags:
  - azure
  - log-analytics
  - kql
  - observability
  - debugging
---

# Following a Correlation ID Through Log Analytics Without Writing KQL

Most Azure integration telemetry ends up in a Log Analytics workspace. That is the right place for it. It is also a place where a simple question — where did this flow stop? — turns into a research project.

## The workspace nobody knows the shape of

A workspace that has been running for a year has tables from everywhere: `AzureDiagnostics` carrying Logic Apps run data, custom tables from whatever the application team decided to emit, Application Insights tables, Service Bus diagnostics, function traces.

Nobody has a complete mental model of it. The people who do have partial models each know a different third.

So tracing one correlation id means: work out which tables could be relevant, work out what the correlating column is called in each of them, write a query per table, and hold the results in your head while comparing timestamps.

## KQL is not the hard part

It is tempting to treat this as a skills gap — if everyone knew KQL, the problem would go away.

It would not. KQL is a good query language and the syntax is learnable in an afternoon. The hard part is not expressing the query, it is knowing what to express it against. `union *` across a large workspace is slow and expensive enough that nobody does it twice. Targeting specific tables requires knowing which ones matter, which is the knowledge you are missing.

The bottleneck is schema discovery, not syntax. Which is good news, because schema discovery is mechanical.

## Letting the data name its own key

The linking column can be derived rather than declared. Across the tables of a workspace, the column that ties the steps of a single flow together has a distinctive shape: it repeats across tables, its values are high-cardinality, and the same value shows up in several tables within a short time window. Columns that merely look similar — a timestamp, a resource id, a severity level — do not behave that way.

Determine that column from the workspace itself and the whole query-per-table problem collapses. You paste a value; the tool works out where to look and what to look for.

## Read the gaps

As with tracing through a document store, the useful output is not a list of matching rows. It is a timeline with lanes, including the lanes that are empty.

```
http-trigger        ✓  14:31:02
transform           ✓  14:31:03
publish-to-queue    ✓  14:31:04
queue-consumer      —
persist             —
```

The flow reached the publish step and nothing consumed the message. That is a Service Bus problem, not a transform problem, and the timeline told you in one glance rather than after four queries.

Presenting the empty lanes is a deliberate choice. A query that returns nothing looks like a mistake; a lane that is drawn and empty looks like a finding — which is what it is.

## The tool

[AIS Analytics](/en/apps/ais-analytics) is a native desktop app that does this against a Log Analytics workspace: paste a correlation id, it works out the linking column from the data, follows the value across the tables, and lays out the steps — present and absent — on a timeline. It runs read-only queries and nothing else.

It has a sibling, [AIS Tracing](/en/apps/ais-tracing), which is the same idea aimed at an Azure Cosmos DB account, for flows that persist state as documents rather than as logs. Teams running both usually use both.

If the gap you are looking at turns out to be a workflow that never fired at all, [AIS Monitor](/en/apps/ais-monitor) shows how your deployed Logic Apps chain together — and [AIS Runner](/en/apps/ais-runner) runs the whole thing locally when you want to reproduce it.
