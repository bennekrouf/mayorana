---
id: attention-four-operations
title: 'Episode 1: Attention Is Just 4 Mathematical Operations'
slug: attention-four-operations
locale: en
date: '2026-09-27'
author: mayo
excerpt: >-
  Behind Transformers and the attention mechanism there are only four simple
  operations: matrix multiplication, transposition, scaling and softmax. Here
  they are, in Rust.
tags:
  - llm
  - ai
  - rust
  - attention
  - transformers
---

# Episode 1: Attention Is Just 4 Mathematical Operations

## Why this topic?

When people talk about LLMs, you often hear intimidating words: "Transformers", "attention mechanism", "Q/K/V". But at the heart of it all, there are really only **4 simple operations**.

## The core idea

Attention is the mechanism that lets a word **look at the other words** in the sentence to better understand itself.

Example: in "The bank closed its doors", the word "bank" doesn't mean the same thing as in "The blood bank is empty". Attention is what lets the model tell the difference.

## Quick reminder: scalar vs vector

- **A scalar**: a plain number. E.g. `3.14`, `42`.
- **A vector**: an ordered list of scalars. E.g. `[0.5, 0.1, 0.4, 0.0]`. It has a **direction** and a **length**.

**Why does it matter?** In an LLM, a word is represented by a **vector** (often 768 dimensions). That richness is what makes it possible to capture nuanced meanings.

## The 4 operations (in Rust)

```rust
fn mat_mul(a: &[Vec<f32>], b: &[Vec<f32>]) -> Vec<Vec<f32>> {
    let bt = transpose(b); // b's columns become rows
    a.iter()
        .map(|row| bt.iter()
            .map(|col| row.iter().zip(col).map(|(x, y)| x * y).sum()) // dot product
            .collect())
        .collect()
}
fn transpose(m: &[Vec<f32>]) -> Vec<Vec<f32>> {
    (0..m[0].len()).map(|j| m.iter().map(|r| r[j]).collect()).collect()
}
fn scale(matrix: &mut [Vec<f32>], dim: f32) {
    matrix.iter_mut().flatten().for_each(|x| *x /= dim.sqrt());
}
fn softmax(matrix: &mut [Vec<f32>]) {
    for row in matrix {
        let max = row.iter().cloned().fold(f32::NEG_INFINITY, f32::max);
        row.iter_mut().for_each(|x| *x = (*x - max).exp()); // - max: no overflow
        let sum: f32 = row.iter().sum();
        row.iter_mut().for_each(|x| *x /= sum);
    }
}
```

- **Matrix multiplication**: compare each word with every other word
- **Transposition**: swap rows and columns so the matrices line up
- **Scaling**: divide by the square root of the dimension
- **Softmax**: turn the scores into percentages

To start simple, we use the embeddings as they are for Q, K and V: we copy them 3 times.

## Why "stabilize" with scaling?

Scaling divides the scores by √d. Why? The bigger the vectors (768 dimensions!), the higher the scores climb. And Softmax hugely amplifies the gaps: with big scores, it gives almost 100% to a single word and 0% to all the others. The model only looks at one word, and during training, it barely learns anything anymore.

Dividing by √d brings the scores back to a normal size. The most important word stays the most important, but attention can spread across several words again.

## Key takeaways

- Attention is NOT magic, it's simple math
- A word = a vector (not a scalar)
- Scaling stops attention from locking onto a single word
- The best way to learn is to code it yourself
