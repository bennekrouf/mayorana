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
    a.iter().map(|r| bt.iter().map(|c| r.iter().zip(c).map(|(x, y)| x * y).sum()).collect()).collect()
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

Scaling divides the scores by √d. When you take the dot product of two high-dimensional vectors, the result grows with the dimension: with d = 768, scores easily reach several tens. And Softmax applies an exponential (e^x), which blows up the gaps: a score of 30 against 20 already gives a ratio of e^10 ≈ 22,000. Softmax **saturates**: nearly all the weight goes to a single word, the others drop to zero, and during training the model almost stops learning (the gradients become close to zero).

Dividing by √d brings the scores back to a reasonable scale, whatever the dimension. The ranking of the scores doesn't change (the most relevant word stays the most relevant), but the Softmax weights become less extreme: attention can spread across several words.

What about overflow? That risk (e^x exceeds what an `f32` can hold from x ≈ 88) is handled differently: subtract the row's maximum before the exponential, as the `softmax` above does. The result is identical, but the exponential never exceeds 1.

## Key takeaways

- Attention is NOT magic, it's simple math
- A word = a vector (not a scalar)
- Scaling keeps the ranking of the scores but stops Softmax from saturating
- The best way to learn is to code it yourself
