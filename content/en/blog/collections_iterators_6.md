---
id: box-slice-vs-vec-differences
title: 'What is the difference between Box<[T]> and Vec<T>?'
slug: box-slice-vs-vec-differences
locale: "en"
author: mayo
excerpt: >-
  Comparing Box<[T]> and Vec<T> differences in mutability, memory overhead, and
  performance implications for different use cases
category: rust
tags:
  - rust
  - box
  - vec
  - collections
  - memory
  - performance
date: '2025-07-24'
---

# What is the difference between Box<[T]> and Vec<T>?

## Key Differences

| Feature | Vec<T> | Box<[T]> |
|---------|--------|----------|
| Size Mutability | Growable/shrinkable (push, pop) | Fixed-size (immutable after creation) |
| Storage | Heap-allocated + capacity field | Pure heap slice (no extra metadata) |
| Memory Overhead | 3 usizes (ptr, len, capacity) | 2 usizes (ptr, len) |
| Conversion Cost | O(1) to Box<[T]> (shrink-to-fit) | O(n) to Vec (must reallocate) |

## When to Use Each

### Prefer Vec<T> When:

You need dynamic resizing:

```rust
let mut vec = vec![1, 2, 3];
vec.push(4);  // Works
```

You frequently modify the collection (e.g., appending/removing elements).

### Prefer Box<[T]> When:

You want a fixed-size, immutable collection:

```rust
let boxed_slice: Box<[i32]> = vec![1, 2, 3].into_boxed_slice();
// boxed_slice.push(4);  // ERROR: No `push` method
```

Memory efficiency matters (e.g., embedded systems):
- Saves 1 usize (no unused capacity).

Interfacing with APIs requiring owned slices:

```rust
fn process(data: Box<[i32]>) { /* ... */ }
```

## Conversion Between Them

| Direction | Code | Cost |
|-----------|------|------|
| Vec → Box<[T]> | `vec.into_boxed_slice()` | O(1) |
| Box<[T]> → Vec | `Vec::from(boxed_slice)` | O(n) |

### Example:

```rust
let vec = vec![1, 2, 3];
let boxed: Box<[i32]> = vec.into_boxed_slice();  // No reallocation
let vec_again = Vec::from(boxed);                // Copies data
```

## Performance Implications

- **Iteration**: Identical (both are contiguous heap arrays).
- **Memory**: Box<[T]> avoids unused capacity overhead.
- **Flexibility**: Vec supports in-place growth; Box<[T]> does not.

## Real-World Use Cases

- **Vec**: Buffers for dynamic data (e.g., HTTP request bodies).
- **Box<[T]>**:
  - Configurations loaded once and never modified.
  - Storing large immutable datasets (e.g., game assets).

## Key Takeaways

✅ Use Vec for mutable, growable sequences.
✅ Use Box<[T]> for immutable, memory-efficient storage.
⚡ Convert cheaply from Vec to Box<[T]> when done modifying.

**Try This**: What happens if you convert a Vec with spare capacity to Box<[T]>?

**Answer**: `into_boxed_slice()` shrinks the allocation to exact size (no unused capacity).
