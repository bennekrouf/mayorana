---
id: vec-drain-vs-truncate-clear
title: 'Vec::drain() Vs Vec::truncate() or Vec::clear()?'
slug: vec-drain-vs-truncate-clear
author: mayo
excerpt: >-
  Understanding Vec::drain() functionality and comparing it with Vec::truncate()
  and Vec::clear() for different element removal scenarios
category: rust
tags:
  - rust
  - vec
  - drain
  - truncate
  - clear
  - collections
date: '2025-07-23'
---

# How does Vec::drain() work, and when is it useful compared to Vec::truncate() or Vec::clear()?

## What is Vec::drain()?

`drain()` removes a range of elements from a Vec while yielding ownership of them through an iterator. Unlike `truncate()` or `clear()`, it allows you to process the removed elements before they're dropped.

### Signature
```rust
pub fn drain<R>(&mut self, range: R) -> Drain<'_, T>
where
    R: RangeBounds<usize>,
```

## Key Features

| Method | Removes Elements | Yields Ownership | Preserves Capacity | Time Complexity |
|--------|------------------|------------------|-------------------|-----------------|
| `drain(..)` | Yes | ✅ Yes (via iterator) | ✅ Yes | O(n) |
| `truncate()` | Yes (from index) | ❌ No | ✅ Yes | O(1) |
| `clear()` | All | ❌ No | ✅ Yes | O(1) |

## When to Use Each

### 1. Vec::drain()

**Use Case**: Process removed elements (e.g., filter, transform, or batch-delete).

**Example**:
```rust
let mut vec = vec!['a', 'b', 'c', 'd'];
for ch in vec.drain(1..3) {  // Removes 'b' and 'c'
    println!("Removed: {}", ch);  // Prints 'b', then 'c'
}
assert_eq!(vec, ['a', 'd']);  // Keeps remaining elements
```

**Performance**: Avoids extra allocations if reusing the iterator.

### 2. Vec::truncate()

**Use Case**: Quickly remove elements from the end without processing them.

**Example**:
```rust
let mut vec = vec![1, 2, 3, 4];
vec.truncate(2);  // Drops 3 and 4 (no iterator)
assert_eq!(vec, [1, 2]);
```

### 3. Vec::clear()

**Use Case**: Remove all elements (faster than `drain(..)` if you don't need them).

**Example**:
```rust
let mut vec = vec![1, 2, 3];
vec.clear();  // Drops all elements
assert!(vec.is_empty());
```

## Memory Behavior

- All three methods retain the Vec's capacity (no reallocation if elements are re-added).
- `drain()` is lazy: Elements are only dropped when the iterator is consumed.

## Advanced Use: Reuse Storage

`drain()` is ideal for replacing a subset of elements efficiently:

```rust
let mut vec = vec!["old", "old", "new", "old"];
vec.drain(0..2).for_each(drop);  // Remove first two
vec.insert(0, "fresh");
assert_eq!(vec, ["fresh", "new", "old"]);
```

## Key Takeaways

✅ **drain()**: Use when you need to process removed elements or batch-delete.
✅ **truncate()/clear()**: Use for fast bulk removal without processing.
🚀 **All preserve capacity**: No reallocation overhead for future ops.

## Real-World Example

In a game engine, `drain()` could efficiently remove expired entities while allowing cleanup logic (e.g., saving state).

**Try This**: What happens if you `drain()` but don't consume the iterator?

**Answer**: The elements are still removed when the Drain iterator is dropped (due to its Drop impl).
