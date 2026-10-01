---
title: "AI in Companies Isn't 50 Use Cases. It's 3 Things."
slug: three-categories-of-ai-in-companies
date: 2026-10-01
author: Mayorana
category: ai
tags: ["ai", "ai-agents", "mcp", "strategy"]
excerpt: "Most generative and agentic AI projects fit into three categories: agents for customers, integration layers for systems, and copilots for employees. Here is why that lens beats a list of fifty use cases."
seo_title: "AI in Companies: 3 Categories Behind 50 Use Cases"
meta_description: "Most generative AI and agent projects fit three categories: B2C agents, MCP-style integration layers, and employee copilots. A practical lens for prioritizing."
keywords: ["AI use cases", "AI agents", "MCP", "Model Context Protocol", "generative AI", "AI strategy", "enterprise AI"]
---

Open any "AI use cases" article and you get a list: 30 ideas, sometimes 100. Invoice processing. Meeting notes. Lead scoring. A chatbot. Code review. None of them is wrong, but a list that long isn't useful either. It can't tell you what to build first, because it never says what the items have in common.

Strip away the branding and most generative and agentic AI projects fall into three categories. That isn't because the technology is simple. It's because an AI system can only end up facing three kinds of party: your customers, your systems, or your employees.

## The lens: who is on the other end?

```text
 WHO IS ON THE OTHER END?        WHAT YOU END UP BUILDING

 Customers    ---------------->  1. AI agents (B2C)
 Your systems ---------------->  2. Integration layer (MCP-style)
 Your people  ---------------->  3. Productivity copilots
```

| Category | Faces | What it does | Main risk |
|---|---|---|---|
| 1. AI agents (B2C) | Customers | Answers, books, sells, refunds | Brand and legal exposure |
| 2. Integration layer | Systems | Lets AI read and act on real backends | Security and permissions |
| 3. Productivity copilots | Employees | Writes, summarizes, searches, codes | Value nobody measures |

The last column is the part most use-case lists leave out: each category fails in a different way.

## 1. AI agents for customers

An agent that talks directly to people outside your company and can do something about the request: answer, change, book, refund. Support, sales, booking, onboarding. The defining trait is that no employee reads the answer before the customer does.

```text
 Customer
    |   "Where is my order?"
    v
+-------------------+    tools    +------------------+
|   AI agent        | ----------> | Orders, billing, |
| (policy + LLM)    | <---------- | CRM, bookings    |
+---------+---------+    data     +------------------+
          |
          |  can't resolve it, or the stakes are high
          v
   Human agent, with the full conversation
```

**Real life: Klarna.** In early 2024 the company reported that its AI assistant handled about two-thirds of customer-service chats in its first month, with resolution times falling from roughly 11 minutes to under 2. In 2025 its CEO acknowledged that chasing cost had hurt quality, and Klarna began bringing human agents back for some conversations.

**Real life: Air Canada.** In 2024 a Canadian tribunal held the airline responsible after its website chatbot gave a customer wrong information about bereavement fares. Air Canada argued the bot was a separate entity. The tribunal didn't accept that.

The lesson is the same in both: the agent is your voice, and you own what it says. These projects rarely fail because the language is bad. They fail on policy, permissions and escalation.

## 2. Integration layers (MCP-style)

The plumbing that lets a model look things up and act on your real systems: tool calling, enterprise connectors, and open protocols such as the Model Context Protocol (MCP). Nobody uses it directly. It's what stops the other two categories from being talkers.

Without it, every AI app wires up every system on its own. With a shared layer, multiplication turns into addition: three apps and three systems is nine custom integrations, or six connections.

```text
                         +-----------------------+
   Support agent ------->|                       |-------> CRM
   Sales agent  -------->|  MCP-style layer      |-------> ERP
   Copilot  ------------>|  auth, permissions    |-------> Wiki, docs
                         |  logging, schemas     |
                         +-----------------------+
```

**Real life: MCP itself.** Anthropic released MCP as an open standard in late 2024. OpenAI and others adopted it within months, and vendors such as Stripe and Atlassian now publish their own MCP servers. Block was among the first companies to build on it.

This layer is where security belongs. Over-broad access tokens and prompt injection through the data an agent reads are the real risks. So the layer, not the prompt, has to enforce what an agent is allowed to do.

## 3. Generative AI for everyday productivity

Copilots and assistants for your own people: drafting, summarizing, searching internal knowledge, writing code, analyzing data. A human reviews the output, so the human is the safety net. That's why it's the lowest-risk place to start, and why it's so easy to fool yourself about the return.

```text
 Employee: "Summarize last quarter's incidents for the board"
     |
     v
+---------------------+        +-------------------------+
|  Copilot            | -----> | Company knowledge       |
|  (LLM + guardrails) | <----- | (docs, tickets, wiki)   |
+----------+----------+        +-------------------------+
           |
           v
 Draft / summary / code  -->  the employee reviews and owns it
```

**Real life: Morgan Stanley.** It gave its financial advisors a GPT-4-based assistant over the firm's own research library, a textbook case of "search and summarize internal knowledge."

**Real life: developer tools.** A controlled experiment run by GitHub found developers finished a task about 55% faster with Copilot. In 2025, METR ran a randomized trial with experienced open-source developers working on their own repositories: they took about 19% longer with AI tools, while believing they had been faster. Both results are real. The task, the codebase and the person all matter, so measure it instead of assuming.

## Real projects are combinations

```text
   Traveller                 Airline staff
        |                          |
        v                          v
 +-------------+            +-------------+
 | 1. Booking  |            | 3. Support  |
 |    agent    |            |   copilot   |
 +------+------+            +------+------+
        |                          |
        +-------------+------------+
                      v
          +-----------------------+
          |  2. Integration layer |
          |   (one set of tools)  |
          +---+-------+-------+---+
              |       |       |
           Fares   Bookings Policies
```

Take a travel-booking assistant (an illustrative composite, not a named company). Travellers talk to a booking agent (1). Support staff use a copilot that summarizes a trip's history (3). Both call the same fares, bookings and policy tools through one layer (2).

Category 2 is the multiplier. The work that lets a customer agent check a booking is the same work that lets an internal copilot do it. Build the tools once, with permissions, and every new use case gets cheaper.

## What sits outside

This lens covers generative and agentic AI. It is not a map of all AI. Predictive machine learning (fraud scoring, demand forecasting, churn models), computer vision (defect inspection on a production line), recommendation engines and optimization problems like routing all sit outside it. They need different data, different skills and different evaluation, and often they are the better answer.

## How to use this when prioritizing

Ask three questions of any AI proposal:

1. **Who is on the other end?** Customers, systems or employees?
2. **What does it touch?** If the answer is "several systems", you are building category 2 whether or not anyone called it that.
3. **What does a wrong answer cost, and who catches it?** Nobody catches it before a customer reads it. An employee catches it before it leaves the building.

Then a sequence that works for many companies: learn cheaply with category 3, and measure it. Build category 2 as the shared foundation, with permissions from day one. Put category 1 on top once the first two are solid.

It also helps against shiny-object syndrome. A new agent framework or model launch doesn't change which category your project is in. Ask which one it is, and whether it's the one you are ready for.
