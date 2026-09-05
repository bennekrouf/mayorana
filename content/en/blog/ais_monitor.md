---
id: logic-apps-workflow-chains
title: "Your Logic Apps Are a Graph, and the Azure Portal Only Shows You a List"
locale: en
slug: logic-apps-workflow-chains
date: '2026-09-05'
author: mayo
excerpt: >-
  Past a dozen workflows, an Azure Logic Apps estate stops being a list and
  becomes a graph connected by Service Bus queues and Event Grid topics. Here
  is why the portal cannot show you that graph, and what to do about it.
tags:
  - azure
  - logic-apps
  - service-bus
  - event-grid
  - integration
---

# Your Logic Apps Are a Graph, and the Azure Portal Only Shows You a List

Ask anyone who has inherited an Azure Integration Services estate what the hardest part of the first week was. It is almost never the code. It is working out what calls what.

## The portal shows workflows, not connections

Open Logic Apps in the Azure portal and you get a list. Each workflow has a definition, a run history and a set of triggers. Every one of those views is scoped to a single workflow.

But the workflows are not independent. One receives an HTTP request and drops a message on a Service Bus queue. A second is triggered by that queue, transforms the payload, and publishes an Event Grid event. A third subscribes to the topic and writes to Cosmos DB. The business process is the chain. The portal only ever shows you one link at a time.

This produces a specific and very common failure mode: an order goes missing, and the first thirty minutes of the investigation are spent not debugging, but reconstructing which workflows were even supposed to be involved.

## Why the connection is hard to see

The link between two workflows is indirect by design. Workflow A does not call workflow B. Workflow A writes to a queue named `orders-inbound`, and workflow B happens to have a trigger bound to `orders-inbound`. Nothing in either definition names the other.

That indirection is the whole point of message-based integration — it is what lets you deploy the two independently. It also means the topology exists only as an emergent property of the definitions, which is exactly the kind of thing documentation gets wrong within a month of being written.

The usual answers are all partial:

- **A Visio diagram.** Correct on the day it was drawn. There is no mechanism that keeps it correct.
- **Naming conventions.** Helpful until the one workflow that predates the convention breaks the pattern, which is invariably the one you are debugging.
- **Application Insights maps.** These show what called what during a sampled window. Useful, but they show observed traffic, not the topology — a chain that has not run recently simply is not there.

## Deriving the graph instead of drawing it

The definitions contain everything needed. Each workflow declares the queues and topics it writes to in its actions, and the ones it listens to in its triggers. Match the outputs of one against the inputs of another and the graph falls out.

Once you have the graph, several questions that were previously archaeology become one lookup:

- Which workflows does this chain touch, in order?
- If I change the schema on this queue, what breaks downstream?
- This chain has three steps — which of them last ran successfully?
- Is anything writing to a queue that nothing reads?

That last one finds real bugs surprisingly often. A workflow was renamed, its consumer was pointed at the old queue name, and messages have been quietly accumulating for weeks.

## Walking a chain rather than a workflow

The second thing the graph buys you is a better unit for run history. The portal gives you run history per workflow, which means investigating a failed business process is a matter of opening four blades and comparing timestamps by eye.

Run history per *chain* — every run of every workflow in the chain, in the order they happened — is the view the investigation actually wants. The failure is usually visible immediately, because the chain simply stops.

This is what [AIS Monitor](/en/apps/ais-monitor) does: it builds the chain graph from your deployed workflow definitions, renders it, and lets you follow run history along a chain instead of a workflow. It also keeps the HTTP payloads you test with next to the workflow they belong to, so re-triggering an entry point does not mean rebuilding the request from memory each time.

Read-only use needs only the Reader role. The desktop console can also change Azure state — trigger workflows, reset app settings, purge and requeue Service Bus messages, assign RBAC roles — and every one of those sits behind a confirm dialog showing the exact `az` command before it runs.

## Where this sits

Monitoring a deployed estate is one problem. Developing against it locally is a different one — for that, [AIS Runner](/en/apps/ais-runner) runs Logic Apps Standard on your own machine without deploying to Azure.

And when the question is not "which workflows are involved" but "how far did this specific order get", that is a tracing problem: [AIS Tracing](/en/apps/ais-tracing) follows one correlation id across every container of a Cosmos DB account, and [AIS Analytics](/en/apps/ais-analytics) does the same against a Log Analytics workspace.

All of them are native desktop apps built in Rust, source-available on GitHub, and free for personal, educational and non-profit use — commercial use requires a licence.
