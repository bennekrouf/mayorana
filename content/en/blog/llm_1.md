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

Attention is 4 small operations chained together. Let's go through them one by one, each with its code.

Here, a matrix is simply a table of numbers: a list of rows, where each row is one word's vector. To start simple, we use the embeddings as they are for Q, K and V: we copy them 3 times.

### 1. Matrix multiplication: compare each word with every other word

To find out whether two words are related, you multiply their numbers pair by pair, then add everything up. That's the dot product. The bigger the result, the more the two words "point the same way". Matrix multiplication does this for every pair of words in one go.

```rust
// Multiplies matrix `a` by matrix `b`.
// Each cell of the result compares one row of `a` with one column of `b`.
fn mat_mul(a: &[Vec<f32>], b: &[Vec<f32>]) -> Vec<Vec<f32>> {
    let mut result = vec![vec![0.0; b[0].len()]; a.len()]; // a table full of zeros
    for row in 0..a.len() {
        for col in 0..b[0].len() {
            // dot product: multiply the numbers pair by pair, then add them up
            for pos in 0..b.len() { // `pos` walks through the numbers of the vector
                result[row][col] += a[row][pos] * b[pos][col];
            }
        }
    }
    result
}
```

### 2. Transposition: swap rows and columns so the matrices line up

One snag: multiplication compares the rows of the first matrix with the **columns** of the second. But in K, each word is a **row**. Transposition fixes that: rows become columns. That's why we multiply Q by the transpose of K.

```rust
// Flips the table: the 1st row becomes the 1st column, and so on.
fn transpose(matrix: &[Vec<f32>]) -> Vec<Vec<f32>> {
    let mut result = vec![vec![0.0; matrix.len()]; matrix[0].len()];
    for row in 0..matrix.len() {
        for col in 0..matrix[0].len() {
            result[col][row] = matrix[row][col]; // swap row and column
        }
    }
    result
}

// Q compared with K: one score for each pair of words
let mut scores = mat_mul(&q, &transpose(&k));
```

### 3. Scaling: divide by the square root of the vector size

With vectors of 768 numbers, the scores quickly get very big. So we divide them all by the square root of the vector size: for 768, that's about 28. We'll see right after why this matters.

```rust
// Divides each score by the square root of the vector size.
// `vector_size` = how many numbers are in one word's vector (e.g. 768).
fn scale(scores: &mut [Vec<f32>], vector_size: f32) {
    let divider = vector_size.sqrt(); // for 768, about 28
    for row in scores.iter_mut() {
        for score in row.iter_mut() {
            *score /= divider;
        }
    }
}

scale(&mut scores, 768.0);
```

### 4. Softmax: turn the scores into percentages

Last step: each row of scores becomes a list of percentages that add up to 100%. Each word then knows how much attention to give each of the others.

```rust
// Turns each row of scores into percentages that add up to 100%.
fn softmax(scores: &mut [Vec<f32>]) {
    for row in scores.iter_mut() {
        // the biggest score in the row
        let biggest = row.iter().cloned().fold(f32::NEG_INFINITY, f32::max);
        for score in row.iter_mut() {
            // subtract the biggest score before the exponential:
            // same result, but the numbers stay small
            *score = (*score - biggest).exp();
        }
        let total: f32 = row.iter().sum();
        for score in row.iter_mut() {
            *score /= total; // each score becomes its share of the total
        }
    }
}

softmax(&mut scores); // each row now adds up to 100%
```

## Why "stabilize" with scaling?

Scaling divides the scores by the square root of the vector size. Why? The bigger the vectors (768 dimensions!), the higher the scores climb. And Softmax hugely amplifies the gaps: with big scores, it gives almost 100% to a single word and 0% to all the others. The model only looks at one word, and during training, it barely learns anything anymore.

Dividing this way brings the scores back to a normal size. The most important word stays the most important, but attention can spread across several words again.

## Key takeaways

- Attention is NOT magic, it's simple math
- A word = a vector (not a scalar)
- Scaling stops attention from locking onto a single word
- The best way to learn is to code it yourself
