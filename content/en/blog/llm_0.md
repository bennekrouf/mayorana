---
id: llm-from-scratch-introduction
title: 'Episode 0: Why Code LLMs From Scratch'
slug: llm-from-scratch-introduction
locale: en
date: '2026-09-27'
author: mayo
excerpt: >-
  Understanding how LLMs work without a PhD in mathematics: what this series
  promises, what you will learn, and the one idea that ties every episode
  together.
tags:
  - llm
  - ai
  - rust
  - machine-learning
---

# Episode 0: Why Code LLMs From Scratch

## What this series promises

Understand how LLMs (ChatGPT, Claude, etc.) work without needing a PhD in mathematics. Each episode starts from a simple question, explains the "why" before the "how", and uses Rust examples where they help.

## Why "from scratch"?

Because reading articles is not enough. It's like cooking: watching a recipe doesn't teach you how to cook. Coding the 4 operations of attention yourself will teach you more than hours of reading.

## What you will learn

- How a word "looks at" the other words (attention)
- Why Q, K and V are kept separate (specialization)
- How meaning is turned into geometry (embeddings)
- How to reuse an existing model (transfer learning)
- How it all comes together to build a RAG

## Who is this series for?

Anyone curious who can read simple code and wants to understand AI without getting lost in jargon. You don't need to be a mathematician, just patient.

## The common thread

A single idea runs through the whole series: **meaning can be represented by vectors, and those vectors can be compared by how close they are**. Everything else follows from that.
