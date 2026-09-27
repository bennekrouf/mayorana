---
id: embeddings-absolute-vs-contextual
title: 'Episode 3: Embeddings — Absolute at the Start, Contextual at the End'
slug: embeddings-absolute-vs-contextual
locale: en
date: '2026-09-27'
author: mayo
excerpt: >-
  Is an embedding the word on its own or the word in context? Both, at
  different moments. Plus the three engineering details around attention:
  multi-head, masking and position encoding.
tags:
  - llm
  - ai
  - embeddings
  - attention
  - transformers
---

# Episode 3: Embeddings — Absolute at the Start, Contextual at the End

## The basic question

Is a word embedding the word **on its own** (as in the dictionary) or the word **in the context** of a sentence?

## The answer: BOTH, at different moments

### Step 1: The absolute embedding

Each word is turned into a fixed vector based on its dictionary entry. "Bank" gets the same vector in "blood bank" and "investment bank".

A clarification: models don't really work on words but on **tokens**, pieces of words. A common word like "bank" is often a single token, but a rare word can be split into several tokens, each with its own ID. To keep things simple, we'll keep talking about "words".

**How is it computed?**

- A giant matrix (e.g. 50,000 tokens × 768 dimensions)
- Each token has a unique ID (e.g. "bank" = ID 1248)
- We read row 1248 of the matrix
- **No complex computation**, just a memory lookup

### Step 2: The contextual embedding

This is where Q/K/V comes in! Attention takes the absolute vector of "bank", looks at the other words, and **blends** their V vectors according to the computed percentages.

Result: "bank" gets a **new contextual vector** that differs from one sentence to the next.

## Why vectors rather than scalars?

A scalar could only represent **a single dimension** of meaning. A 768-dimension vector captures gender, number, semantic domain and connotation all at once.

## The 3 engineering details

### 1. Multi-Head Attention

Instead of a single attention, several run in parallel (e.g. 12 heads). Each head has its own Wq, Wk and Wv matrices, which project into a smaller space (768 / 12 = 64 dimensions), so each head looks at the text from a different angle. At the end, the 12 results are stitched back together (12 × 64 = 768) and a final matrix, Wo, mixes them.

### 2. Masking

During generation, the model is not allowed to look at future words. We put `-infinity` in their scores so that Softmax gives them 0%.

### 3. Position Encoding

Attention on its own doesn't know the order of the words: to it, "the dog bites the man" and "the man bites the dog" contain exactly the same words. So it has to be given the position.

The original Transformer (2017) adds a position vector (sine/cosine) to each embedding, and GPT-2 learns these vectors during training. Most current LLMs (Llama, Mistral, Qwen…) use **RoPE** (Rotary Position Embedding) instead: rather than adding a vector to the embedding, Q and K are **rotated** by an angle that depends on the position. The score between two words then depends on their relative position.

## Key takeaways

- The raw embedding is an **absolute** starting point
- Attention turns it into a **contextual** coordinate
- The 3 details (multi-head, masking, position) are engineering additions around the engine
