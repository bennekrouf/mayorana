---
id: transfer-learning-key-concepts
title: 'Episode 5: The Key Concepts Around Transfer Learning'
slug: transfer-learning-key-concepts
locale: en
date: '2026-09-27'
author: mayo
excerpt: >-
  Pre-training, fine-tuning, catastrophic forgetting, freezing, domain shift
  and learning rate: the transfer learning terms you hear all the time,
  explained simply with an analogy for each.
tags:
  - llm
  - ai
  - transfer-learning
  - fine-tuning
---

# Episode 5: The Key Concepts Around Transfer Learning

## Introduction

Transfer learning relies on a handful of terms that people hear often without really understanding them. Here is a plain-language explanation of each one.

## Pre-training

The phase where the model learns from **tons of raw data**. It learns grammar, facts, reasoning. **Long and expensive**, done once by the big players.

**Analogy**: 20 years of school. Long, but once it's done, everything else is quicker to learn.

## Fine-tuning

The phase where the model is **specialized** for a specific task. **Short and accessible**.

**Analogy**: a 3-month professional course after 20 years of study.

## Catastrophic forgetting

The trap: if you fine-tune too hard, the model **forgets** what it knew. Hence the very low learning rates, and the value of freezing (just below) or LoRA, which leave the original weights untouched.

**Analogy**: a pianist who forgets classical music from playing too much jazz.

## Freezing

Preventing a layer's weights from changing during training. Useful for preserving generic knowledge.

**Analogy**: laminating part of a document.

## Domain shift

If the model learned from general text and you apply it to highly technical legal text, there is a **shift**.

**Analogy**: a general practitioner becoming a heart surgeon.

## Learning rate

Controls **how fast** the model changes its weights. In transfer learning, a **very low** rate is used (e.g. 0.00001). With LoRA, it's usually higher, around 0.0001, because only the small added matrices move.

**Analogy**: the dose of a medication. Too strong, and it breaks everything.

## Key takeaways

- **Pre-training** = long, expensive, generic
- **Fine-tuning** = short, accessible, specific
- **Catastrophic forgetting** = the trap to avoid
- **Freezing** = freeze to preserve
- **Domain shift** = the gap to anticipate
- **Learning rate** = how fast the weights change, very low when fine-tuning
