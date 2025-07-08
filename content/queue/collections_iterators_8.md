---
id: vec-retain-vs-filter-collect
title: "Vec::retain() Vs filtering with iter().filter().collect()?"
slug: vec-retain-vs-filter-collect
author: mayo
excerpt: >-
  Comparing Vec::retain() in-place filtering with iter().filter().collect() for different filtering scenarios and performance implications
content_focus: "collections (like Vec), iterators (into_iter, collect), and related concepts"
technical_level: "Expert technical discussion"
category: rust
tags:
  - rust
  - vec
  - retain
  - filter
  - iterators
  - performance
---

# What is the purpose of Vec::retain()? How does it compare to filtering with iter().filter().collect()?

## Vec::retain(): In-Place Filtering

**Purpose**: Removes elements from a Vec in-place based on a predicate, preserving the order of retained elements.

**Signature**:
```rust
pub fn retain<F>(&mut self, f: F)
where
    F: FnMut(&T) -> bool,
```

## Key Features

| Aspect | retain() | iter().filter().collect() |
|--------|----------|---------------------------|
| Mutates Original | ✅ Yes (in-place) | ❌ No (allocates new Vec) |
| Preserves Order | ✅ Yes | ✅ Yes |
| Memory Efficiency | ✅ O(1) extra space | ❌ O(n) extra space |
| Performance | Faster (no reallocation) | Slower (allocates/copies) |
| Use Case | Filtering without allocation | Creating a new filtered collection |

## Example: Filtering Even Numbers

### Using retain() (In-Place)
```rust
let mut vec = vec![1, 2, 3, 4];
vec.retain(|x| x % 2 == 0);  // Keeps evens
assert_eq!(vec, [2, 4]);      // Original `vec` modified
```

### Using filter().collect() (New Allocation)
```rust
let vec = vec![1, 2, 3, 4];
let filtered: Vec<_> = vec.iter().filter(|x| *x % 2 == 0).copied().collect();
assert_eq!(filtered, [2, 4]);  // New `Vec` created
// `vec` remains unchanged: [1, 2, 3, 4]
```

## Performance Comparison

### retain():
- **Time**: O(n) (single pass, shifts elements left in-place).
- **Space**: O(1) (no extra allocations).

### filter().collect():
- **Time**: O(n) (but requires copying to a new allocation).
- **Space**: O(n) (new Vec allocated).

### Benchmark Suggestion:
```rust
let mut big_vec = (0..1_000_000).collect::<Vec<_>>();
// Measure `retain`
let start = std::time::Instant::now();
big_vec.retain(|x| x % 2 == 0);
println!("retain: {:?}", start.elapsed());

// Measure `filter().collect()`
let big_vec = (0..1_000_000).collect::<Vec<_>>();
let start = std::time::Instant::now();
let filtered = big_vec.iter().filter(|x| *x % 2 == 0).collect::<Vec<_>>();
println!("filter.collect: {:?}", start.elapsed());
```

**Typical Result**: `retain()` is 2–3x faster due to no allocations.

## When to Use Each

### Prefer retain() When:
- You want to modify the Vec in-place.
- Memory efficiency is critical (e.g., large Vecs).
- Order of elements must be preserved.

### Prefer filter().collect() When:
- You need the original Vec to remain intact.
- Chaining multiple iterator adapters (e.g., `.filter().map()`).
- Working with non-Vec iterators (e.g., ranges, slices).

## Advanced Notes

### retain_mut():
Rust also provides `retain_mut()` for predicates that need mutable access to elements:

```rust
let mut vec = vec![1, 2, 3];
vec.retain_mut(|x| {
    *x += 1;           // Modify in-place
    *x % 2 == 0        // Keep if even after increment
});
assert_eq!(vec, [2, 4]);
```

### Stability:
Both methods preserve the relative order of retained elements (stable filtering).

## Key Takeaways

✅ **retain()**: Faster, memory-efficient, and in-place. Ideal for bulk modifications.
✅ **filter().collect()**: Flexible, non-destructive. Ideal for iterator pipelines.

## Real-World Use Case:
- **retain()**: Cleaning up expired sessions in a server's session pool.
- **filter().collect()**: Transforming API response data into a filtered subset.

**Try This**: What happens if you `retain()` with a predicate that keeps all elements?

**Answer**: No-op (no elements removed, no reallocations).
