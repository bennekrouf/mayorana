---
id: vec-new-vs-with-capacity
title: >-
  Rust Vec::new() vs. with_capacity(): When to Use Each
slug: vec-new-vs-with-capacity
date: '2025-06-25'
author: mayo
excerpt: >-
  Vec allocation strategies in Rust, comparing
  Vec::new() and Vec::with_capacity() for optimal performance.
category: rust
tags:
  - rust
  - collections
  - performance
  - vec
  - iterators
scheduledFor: '2025-07-03'
scheduledAt: '2025-07-01T06:55:13.411Z'
---

# What is the difference between Vec::new() and Vec::with_capacity()? When would you use each?

Understanding Vec allocation strategies is crucial for writing performant Rust code, especially when dealing with collections and iterators.

## Key Differences

| `Vec::new()` | `Vec::with_capacity(n)` |
|--------------|-------------------------|
| Creates an empty Vec with no pre-allocated space | Creates an empty Vec with space for n elements |
| Initial capacity is 0 (allocates on first push) | Initial capacity is exactly n (no early allocations) |
| Grows dynamically (may reallocate multiple times) | Avoids reallocation until len() > n |

## When to Use Each

Use `Vec::new()` when:
- The number of elements is unknown or small
- You want simplicity (e.g., short-lived vectors)

```rust
let mut v = Vec::new(); // Good for ad-hoc usage
v.push(1);
```

Use `Vec::with_capacity(n)` when:
- You know the exact or maximum number of elements upfront
- Optimizing for performance (avoids reallocations)

```rust
let mut v = Vec::with_capacity(1000); // Pre-allocate for 1000 items
for i in 0..1000 {
    v.push(i); // No reallocation happens
}
```

## Performance Impact

`Vec::new()` may trigger multiple reallocations as it grows (e.g., starts at 0, then 4, 8, 16, ...).
`Vec::with_capacity(n)` guarantees one allocation upfront (if n is correct).

## Example Benchmark

```rust
use std::time::Instant;

fn main() {
    let start = Instant::now();
    let mut v1 = Vec::new();
    for i in 0..1_000_000 {
        v1.push(i); // Reallocates ~20 times
    }
    println!("Vec::new(): {:?}", start.elapsed());

    let start = Instant::now();
    let mut v2 = Vec::with_capacity(1_000_000);
    for i in 0..1_000_000 {
        v2.push(i); // No reallocations
    }
    println!("Vec::with_capacity(): {:?}", start.elapsed());
}
```

Output (typical):
```
Vec::new(): 1.2ms
Vec::with_capacity(): 0.3ms  // 4x faster
```

## Advanced Notes

- `shrink_to_fit()`: Reduces excess capacity (e.g., after removing elements)
- `vec![]` macro: Uses with_capacity implicitly for literals (e.g., vec![1, 2, 3])

## Key Takeaways

✅ Default to `Vec::new()` for simplicity.  
✅ Use `with_capacity(n)` when:
- You know the size upfront
- Performance is critical (e.g., hot loops)

**Try This:** What happens if you push beyond the pre-allocated capacity?  
**Answer:** The Vec grows automatically (like `Vec::new()`), but only after exceeding n.
