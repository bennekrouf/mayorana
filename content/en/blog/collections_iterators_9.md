---
id: flatten-vec-iterators-performance
title: Flatten a Vec<Vec<T>> into a Vec<T> using iterators
locale: en
slug: flatten-vec-iterators-performance
author: mayo
excerpt: >-
  Flattening Vec<Vec<T>> using iterators compared to manual concatenation,
  analyzing performance implications and optimization strategies
category: rust
tags:
  - rust
  - vec
date: '2025-07-29'
---

# How would you flatten a Vec<Vec<T>> into a Vec<T> using iterators? Compare performance with manual concatenation.

## Flattening with Iterators

The most idiomatic way is to use `.flatten()` or `.flat_map()`:

```rust
let nested = vec![vec![1, 2], vec![3], vec![4, 5, 6]];

// Method 1: flatten() (for Vec<Iterables>)
let flat: Vec<_> = nested.iter().flatten().copied().collect();

// Method 2: flat_map() (for custom transformations)
let flat: Vec<_> = nested.into_iter().flat_map(|v| v).collect();
```

**Output**: `[1, 2, 3, 4, 5, 6]`

## Manual Concatenation

For comparison, here's how you might do it manually:

```rust
let mut flat = Vec::new();
for subvec in nested {
    flat.extend(subvec);  // or append() if subvec is no longer needed
}
```

## Performance Comparison

| Method | Time Complexity | Space Complexity | Allocations | Optimizations |
|--------|-----------------|------------------|-------------|---------------|
| Iterator (flatten) | O(n) | O(1) iterator | 1 (result) | May fuse iterators |
| Manual (extend) | O(n) | O(1) temp space | 1 (result) | Pre-allocation possible |

## Key Insights

### Pre-allocation Advantage (Manual)

You can pre-allocate the target Vec if total size is known:

```rust
let total_len: usize = nested.iter().map(|v| v.len()).sum();
let mut flat = Vec::with_capacity(total_len);  // Critical for large datasets
flat.extend(nested.into_iter().flatten());
```

### Iterator Laziness

- `.flatten()` is lazy, but `.collect()` still needs to allocate the result.
- Chained iterators (e.g., `.filter().flatten()`) may optimize better than manual loops.

## Benchmark Example

```rust
let nested: Vec<Vec<i32>> = (0..1_000).map(|i| vec![i; 100]).collect();

// Iterator approach
let start = std::time::Instant::now();
let flat = nested.iter().flatten().copied().collect::<Vec<_>>();
println!("flatten: {:?}", start.elapsed());

// Manual approach with pre-allocation
let start = std::time::Instant::now();
let total_len = nested.iter().map(|v| v.len()).sum();
let mut flat = Vec::with_capacity(total_len);
flat.extend(nested.into_iter().flatten());
println!("manual: {:?}", start.elapsed());
```

**Typical Result**:
- Manual with pre-allocation is ~10–20% faster for large Vecs.
- Iterator version is more concise and equally fast for small data.

## When to Use Each

| Approach | Best For | Pitfalls |
|----------|----------|----------|
| Iterator | Readability, chaining operations | Slightly slower without pre-allocation |
| Manual | Maximum performance, large data | Verbose; requires length calculation |

## Advanced: Zero-Copy Flattening

If you have `Vec<&[T]>` instead of `Vec<Vec<T>>`, use `.flatten().copied()` to avoid cloning:

```rust
let slices: Vec<&[i32]> = vec![&[1, 2], &[3, 4]];
let flat: Vec<i32> = slices.iter().flatten().copied().collect();
```

## Key Takeaways

✅ **Use .flatten() for**:
- Clean, idiomatic code.
- Chaining with other iterator adapters (e.g., `.filter()`).

✅ **Use manual extend for**:
- Large datasets where pre-allocation matters.
- Cases where you already know the total length.

🚀 **Always pre-allocate for manual concatenation of large collections!**

**Try This**: How would you flatten a `Vec<Vec<T>>` while removing duplicates?

**Answer**: Combine `.flatten()` with `.collect::<HashSet<_>>()`.
