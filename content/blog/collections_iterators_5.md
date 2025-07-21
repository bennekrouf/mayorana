---
id: efficient-duplicate-removal-vec
title: 'How removing duplicates from a Vec<T> where T: Eq + Hash?'
slug: efficient-duplicate-removal-vec
author: mayo
excerpt: >-
  Efficient approaches to remove duplicates from Vec<T> where T: Eq + Hash,
  comparing HashSet-based and sort-based methods with performance analysis
category: rust
tags:
  - rust
  - vec
  - deduplication
  - hashset
  - performance
  - collections
date: '2025-07-21'
---

# How would you efficiently remove duplicates from a Vec<T> where T: Eq + Hash?

## Efficient Approaches

When T implements Eq + Hash (for equality checks and hashing), the optimal methods are:

## 1. Using HashSet (Preserves Order)

### Steps:
1. Iterate through the Vec.
2. Track seen elements with a HashSet.
3. Collect only unseen elements.

### Code:
```rust
use std::collections::HashSet;

fn dedup_ordered<T: Eq + std::hash::Hash + Clone>(vec: &mut Vec<T>) {
    let mut seen = HashSet::new();
    vec.retain(|x| seen.insert(x.clone()));
}
```

### Example:
```rust
let mut vec = vec![1, 2, 2, 3, 3, 3];
dedup_ordered(&mut vec);
assert_eq!(vec, [1, 2, 3]); // Order preserved
```

### Performance:
- **Time**: O(n) (average case, assuming good hash distribution).
- **Space**: O(n) (for the HashSet).

## 2. Sort + Dedup (Destroys Order)

### Steps:
1. Sort the Vec (groups duplicates together).
2. Remove consecutive duplicates with dedup().

### Code:
```rust
fn dedup_unordered<T: Ord>(vec: &mut Vec<T>) {
    vec.sort();      // O(n log n)
    vec.dedup();     // O(n)
}
```

### Example:
```rust
let mut vec = vec![3, 2, 2, 1, 3];
dedup_unordered(&mut vec);
assert_eq!(vec, [1, 2, 3]); // Order changed
```

### Performance:
- **Time**: O(n log n) (dominated by sorting).
- **Space**: O(1) (in-place, no extra allocations).

## Comparison

| Method | Time Complexity | Space Complexity | Preserves Order? | Use Case |
|--------|-----------------|------------------|------------------|----------|
| HashSet | O(n) | O(n) | ✅ Yes | Order matters, no sorting allowed. |
| Sort + Dedup | O(n log n) | O(1) | ❌ No | Order irrelevant, memory-constrained. |

## Key Takeaways

✅ **Use HashSet if**:
- Order must be preserved.
- You can tolerate O(n) space.

✅ **Use Sort + Dedup if**:
- Order doesn't matter.
- Memory is tight (e.g., embedded systems).

## Alternatives:
- For no_std environments, use a BTreeSet (slower but avoids hashing).
- Use itertools::unique for iterator-based deduplication.

**Try This**: What happens if T is Clone but not Hash?

**Answer**: Use Vec::dedup_by with a custom equality check (no hashing).
