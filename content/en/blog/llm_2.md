---
id: query-key-value-three-matrices
title: 'Episode 2: Q, K, V — Why 3 Matrices Instead of One?'
slug: query-key-value-three-matrices
locale: en
date: '2026-09-27'
author: mayo
excerpt: >-
  Query, Key, Value: why real models project each word into three different
  spaces, and how that separation of roles makes attention smart.
tags:
  - llm
  - ai
  - rust
  - attention
  - transformers
---

# Episode 2: Q, K, V — Why 3 Matrices Instead of One?

## The million-dollar question

In the previous episode, we said that we "copy the embeddings 3 times". But is that **always** the case? And **why** 3 copies?

## The short answer

No. Real models use **3 different projection matrices** (Wq, Wk, Wv), learned during training.

## The 3 roles

### Q (Query) = The question

The model projects each word into a space where it phrases its "request". "Bank" produces a Q that means *"I'm looking for information about money"*.

### K (Key) = The label

The same word is projected into ANOTHER space to create its label. That label answers: *"I'm a word that's about money"*.

### V (Value) = The knowledge

This is what actually gets carried. A 3rd, independent projection where the network stores **what is worth passing on**.

## Why does this separation make learning possible?

If Q and K were identical, the word couldn't tell the difference between **searching** and **being searched for**. Concretely, the score matrix would become symmetric: "stole" would give "apple" exactly the same score as "apple" gives "stole". And each word would often get its best score with itself, since the dot product of a vector with itself is large: it would look at itself rather than at the others. By separating them, the model can fine-tune these spaces through backpropagation.

**Example**: "The banker stole an apple"

- "stole" (Q) queries "apple" (K) → high attention percentage
- In the V of "apple", the network has stored "fruit, red, edible"
- Result: "stole" understands that it stole something edible

## A bit of Rust

```rust
// Teaching version: Q = K = V
let q = embeddings.clone();
let k = embeddings.clone();
let v = embeddings.clone();

// Real version: 3 projections
// let q = mat_mul(&embeddings, &w_q);
// let k = mat_mul(&embeddings, &w_k);
// let v = mat_mul(&embeddings, &w_v);
```

## Key takeaways

- Q = searches, K = answers, V = carries
- The separation is what makes attention smart
- The vectors capture several nuances at the same time
