---
id: vec-push-vs-with-capacity-performance-duplicate
title: >-
  What is the performance impact of using Vec::push() in a loop vs.
  pre-allocating with Vec::with_capacity()?
slug: vec-push-vs-with-capacity-performance-duplicate
locale: "en"
author: mayo
excerpt: >-
  Analyzing performance differences between Vec::push() in loops versus
  pre-allocating with Vec::with_capacity(), covering memory reallocation costs
  and optimization strategies

tags:
  - rust
  - collections
date: '2025-07-19'
---

# What is the performance impact of using Vec::push() in a loop vs. pre-allocating with Vec::with_capacity()?

## Key Performance Differences

| Vec::push() in a Loop | Vec::with_capacity() + push() |
|----------------------|-------------------------------|
| Reallocates memory multiple times (grows exponentially). | Allocates once upfront. |
| O(n log n) time complexity (amortized). | O(n) time complexity. |
| May fragment memory due to repeated allocations. | Single contiguous block of memory. |

## Why Reallocations Are Costly

### Growth Strategy
- A Vec starts with capacity 0 and doubles its capacity when full (e.g., 0 → 4 → 8 → 16...).
- Each reallocation involves:
  - Allocating new memory.
  - Copying all existing elements.
  - Freeing the old memory.

### Example for 10 Elements
- **push() with Vec::new()**: 4 reallocations (capacity 0 → 4 → 8 → 16).
- **push() with with_capacity(10)**: 0 reallocations.

## Benchmark Comparison

```rust
use std::time::Instant;

fn main() {
    // Test with 1 million elements
    let n = 1_000_000;
    
    // Method 1: No pre-allocation
    let start = Instant::now();
    let mut v1 = Vec::new();
    for i in 0..n {
        v1.push(i);
    }
    println!("Vec::new(): {:?}", start.elapsed());
    
    // Method 2: Pre-allocate
    let start = Instant::now();
    let mut v2 = Vec::with_capacity(n);
    for i in 0..n {
        v2.push(i);
    }
    println!("Vec::with_capacity(): {:?}", start.elapsed());
}
```

### Typical Results
```
Vec::new(): 1.8ms  
Vec::with_capacity(): 0.4ms  // 4.5x faster
```

## When to Pre-Allocate

- **Known Size**: Use with_capacity(n) if you know the exact/maximum number of elements.
- **Performance-Critical Code**: Avoid reallocations in hot loops.
- **Large Data**: Prevent stack overflow for huge collections.

## When Vec::new() is Acceptable

- **Small/Unknown Sizes**: For ad-hoc usage or short-lived vectors.
- **Code Simplicity**: When performance isn't critical.

## Advanced Optimization: extend()

If you have an iterator, extend() is often faster than a loop with push():

```rust
let mut v = Vec::with_capacity(n);
v.extend(0..n);  // Optimized for iterators (avoids bounds checks)
```

## Key Takeaways

✅ **Use with_capacity() for**:
- Predictable element counts.
- High-performance scenarios.

✅ **Use Vec::new() for**:
- Small/unknown sizes or prototyping.

🚀 **Avoid unnecessary reallocations**—they dominate runtime for large Vecs.

## Real-World Impact

In the regex crate, pre-allocation is used for capture groups to avoid reallocations during pattern matching.

**Try This**: What happens if you pre-allocate too much (e.g., with_capacity(1000) but only use 10 elements)?

**Answer**: Wasted memory. Use shrink_to_fit() to release unused capacity.
