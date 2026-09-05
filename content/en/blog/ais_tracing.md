---
id: trace-correlation-id-cosmos-db
title: "How Far Did That Order Get? Tracing a Correlation ID Across Cosmos DB"
locale: en
slug: trace-correlation-id-cosmos-db
date: '2026-09-05'
author: mayo
excerpt: >-
  A customer says their order never arrived. You have a correlation id and an
  Azure Cosmos DB account with more containers than anyone remembers. Here is
  why the empty results matter more than the full ones.
tags:
  - azure
  - cosmos-db
  - observability
  - integration
  - debugging
---

# How Far Did That Order Get? Tracing a Correlation ID Across Cosmos DB

The support ticket says order `SO-44192` never arrived. You have the reference, and you have a Cosmos DB account holding the state of every step of the integration flow. The question is a single sentence: how far did it get?

Answering it is rarely a single step.

## The shape of the problem

A typical integration flow persists state as it goes. The intake step writes a document. The validation step writes another. Enrichment, routing, delivery confirmation — each leaves a trace, often in its own container, sometimes in its own database.

To follow one value through that, you need to know three things:

1. Which containers might hold a document for this flow.
2. Which field in each container carries the correlating value.
3. What "not present" looks like, as distinct from "I queried it wrong".

The third is where most of the time goes.

## Why this is worse than it sounds

Each container was designed by whoever built that step, at the time they built it. The correlating value is `correlationId` in one, `orderRef` in another, nested under `metadata.trackingId` in a third, and in the container someone added last quarter it is the partition key.

So the honest version of the task is: open Data Explorer, write a query, get zero results, wonder whether that means the data is not there or the field name is wrong, check the schema, rewrite the query, repeat — once per container.

Twenty containers in, you have lost an hour and your confidence in the negatives. And the negatives are the answer you came for.

## Empty results are the finding

This is the part worth being explicit about, because it inverts how these queries are usually read.

When you trace a value across a flow, a container with **no** matching document is not a failed query to skip past. It is a data point. The pattern you are looking for is:

```
intake        ✓  10:02:11
validation    ✓  10:02:14
enrichment    ✓  10:02:19
routing       —
delivery      —
```

The break between enrichment and routing *is* the answer. The order got as far as enrichment and stopped. You now know which step to open logs for, and you got there without reading a single log.

A tool that hides its empty results throws away half of what the trace tells you.

## Inferring the link field

The one genuinely awkward part — the field name differing per container — turns out to be solvable without configuration.

Sample a container. Look at the values across its documents. Fields that correlate documents to each other have a recognisable signature: high cardinality, consistent format, appearing across most documents, and — critically — sharing values with fields in other containers. A `createdAt` timestamp does not look like that. A correlation id does.

Doing that inference from the data means you never have to describe your schema to the tool, and it keeps working when someone adds a container next quarter with yet another field name.

## Putting it together

[AIS Tracing](/en/apps/ais-tracing) does exactly this: it samples the containers of a Cosmos DB account, works out which field links documents of one flow, follows the value you give it across all of them, and draws each step on a timeline with the gaps left visible.

It is read-only against your account, and it is a native desktop app — no agent to deploy, nothing to install into your subscription.

If your flow state lives in a Log Analytics workspace rather than in Cosmos DB, [AIS Analytics](/en/apps/ais-analytics) is the same tracer aimed at that instead, inferring the linking column rather than the linking field.

And if the question you actually have is "which workflows were supposed to be involved" rather than "how far did this get", that is a topology problem — [AIS Monitor](/en/apps/ais-monitor) builds the chain graph from your deployed Logic Apps.
