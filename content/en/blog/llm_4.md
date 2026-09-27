---
id: transfer-learning-reusing-knowledge
title: 'Episode 4: Transfer Learning — Reusing Existing Knowledge'
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
---

# Episode 4: Transfer Learning — Reusing Existing Knowledge

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

## Key takeaways

- Reuse existing knowledge to learn faster and better
- Three strategies: feature extraction, fine-tuning, LoRA
- Without transfer learning, only the giants could train models
