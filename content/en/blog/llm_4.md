---
id: transfer-learning-reusing-knowledge
title: 'Episode 4: Transfer Learning — Strategies and Key Concepts'
slug: transfer-learning-reusing-knowledge
locale: en
date: '2026-09-27'
author: mayo
excerpt: >-
  Why nobody trains a model from zero: where transfer learning comes from,
  what it saves you, and its three strategies — feature extraction,
  fine-tuning and LoRA.
tags:
  - llm
  - ai
  - transfer-learning
  - fine-tuning
  - lora
seo_title: "Transfer Learning: Strategies and Key Concepts (Episode 4)"
meta_description: "Why nobody trains a model from zero: feature extraction, fine-tuning and LoRA, then the vocabulary: catastrophic forgetting, freezing, domain shift."
---

# Episode 4: Transfer Learning — Strategies and Key Concepts

## Where does it come from?

Someone who knows how to play tennis doesn't learn badminton from zero. They reuse their reflexes. In the same way, a model that has learned to recognize cats doesn't need to relearn what an edge or a texture is.

In AI, the idea took off with deep networks around 2012, then with LLMs in 2018. The key observation: **the first layers learn generic things**, the last ones learn specific things.

## Why do we do it?

1. **Saves time**: training from scratch costs millions. Fine-tuning takes a few hours.
2. **Saves data**: a model pre-trained on 10M images has already "understood" what an image is.
3. **Better performance**: a fine-tuned model often beats a model trained from scratch on the same data.

## The 3 strategies

### 1. Feature Extraction

You **freeze** all the layers and train only a **new final layer**. The model acts as a "feature detector".

### 2. Fine-Tuning

You **unfreeze** all or part of the model and retrain it with a **very low learning rate**.

### 3. LoRA (Low-Rank Adaptation)

You **add small matrices** next to the existing ones and train only those: often less than 1% of the model's parameters. Combined with a model loaded in 4-bit (**QLoRA**, 2023), you can even fine-tune a 70-billion-parameter model on a single high-end GPU.

## The link with attention

- You **keep** the first layers (spelling, grammar, relationships)
- You **retrain** the last ones (your specific task)

Like a building: you keep the structure (everything the model has already learned) and adjust only a small part of it. Either you redo the top floors (fine-tuning the last layers), or you add a few partitions on top (LoRA).

## The vocabulary around it

Transfer learning comes with a handful of terms people hear often without really understanding them. Here is each one in plain language.

### Pre-training

The phase where the model learns from **tons of raw data**. It learns grammar, facts, reasoning. **Long and expensive**, done once by the big players.

**Analogy**: 20 years of school. Long, but once it's done, everything else is quicker to learn.

### Fine-tuning

The phase where the model is **specialized** for a specific task. **Short and accessible**.

**Analogy**: a 3-month professional course after 20 years of study.

### Catastrophic forgetting

The trap: if you fine-tune too hard, the model **forgets** what it knew. Hence the very low learning rates, and the value of freezing (just below) or LoRA, which leave the original weights untouched.

**Analogy**: a pianist who forgets classical music from playing too much jazz.

### Freezing

Preventing a layer's weights from changing during training. Useful for preserving generic knowledge.

**Analogy**: laminating part of a document.

### Domain shift

If the model learned from general text and you apply it to highly technical legal text, there is a **shift**.

**Analogy**: a general practitioner becoming a heart surgeon.

### Learning rate

Controls **how fast** the model changes its weights. In transfer learning, a **very low** rate is used (e.g. 0.00001). With LoRA, it's usually higher, around 0.0001, because only the small added matrices move.

**Analogy**: the dose of a medication. Too strong, and it breaks everything.

## Key takeaways

- Reuse existing knowledge to learn faster and better
- Three strategies: feature extraction, fine-tuning, LoRA
- Without transfer learning, only the giants could train models
- **Pre-training** = long, expensive, generic
- **Fine-tuning** = short, accessible, specific
- **Catastrophic forgetting** = the trap to avoid
- **Freezing** = freeze to preserve
- **Domain shift** = the gap to anticipate
- **Learning rate** = how fast the weights change, very low when fine-tuning
