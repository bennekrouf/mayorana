---
id: into-iter-vs-iter-ownership
title: "Implications of iterating over a Vec with .into_iter() instead of .iter()"
slug: into-iter-vs-iter-ownership
author: mayo
excerpt: >-
  Understanding the differences between .into_iter() and .iter() when iterating over Vec, covering ownership implications and performance considerations
content_focus: "collections (like Vec), iterators (into_iter, collect), and related concepts"
technical_level: "Expert technical discussion"
category: rust
tags:
  - rust
  - iterators
  - ownership
  - vec
  - into-iter
  - collections
---

# When iterating over a Vec, why might you use .into_iter() instead of .iter()? What ownership implications does this have?

## Key Differences

| .into_iter() | .iter() |
|--------------|---------|
| Consumes the Vec (takes ownership). | Borrows the Vec immutably. |
| Yields owned values (T). | Yields references (&T). |
| Original Vec is unusable afterward. | Original Vec remains intact. |

## When to Use .into_iter()

### Need Ownership of Elements

Useful when you want to move elements out of the Vec (e.g., transferring to another collection):

```rust
let vec = vec![String::from("a"), String::from("b")];
let new_vec: Vec<String> = vec.into_iter().collect();  // `vec` is consumed
// println!("{:?}", vec);  // ERROR: `vec` moved
```

### Destructive Operations

For operations that destroy the Vec (e.g., sorting and deduplicating in one pass):

```rust
let mut vec = vec![3, 1, 2, 1];
vec = vec.into_iter().unique().sorted().collect();  // Destructive but efficient
```

### Performance Optimization

Avoids cloning when working with owned data (e.g., Vec<String>):

```rust
let vec = vec![String::from("rust")];
for s in vec.into_iter() {  // No clone, moves `String`
    println!("{}", s);
}
```

## Ownership Implications

### After .into_iter(), the original Vec is moved and can't be used:

```rust
let vec = vec![1, 2, 3];
let iter = vec.into_iter();  // `vec` is moved here
// println!("{:?}", vec);    // ERROR: value borrowed after move
```

### Works with non-Copy types (e.g., String, Box<T>):

```rust
let vec = vec![String::from("hello")];
let s = vec.into_iter().next().unwrap();  // Moves the `String` out
```

## Comparison with .iter()

| Scenario | .into_iter() | .iter() |
|----------|--------------|---------|
| Need to reuse the Vec | ❌ No | ✅ Yes |
| Modify elements | ❌ No (consumed) | ✅ Yes (iter_mut()) |
| Avoid cloning owned data | ✅ Yes | ❌ No (requires clone()) |

## Real-World Examples

### Transferring Data

Moving a Vec into a function that takes ownership:

```rust
fn process(data: impl Iterator<Item = String>) { /* ... */ }
let vec = vec![String::from("a"), String::from("b")];
process(vec.into_iter());  // Efficient, no clones
```

### Destructive Filtering

Remove elements while iterating:

```rust
let vec = vec![1, 2, 3, 4];
let evens: Vec<_> = vec.into_iter().filter(|x| x % 2 == 0).collect();
```

## Performance Considerations

- **Zero-cost for primitives (i32, bool)**: `.into_iter()` and `.iter()` compile to the same assembly if `T: Copy`.
- **Avoids allocations** when chaining adapters (e.g., `.map().filter()`).

## Key Takeaways

✅ **Use .into_iter() to**:
- Move elements out of a Vec.
- Optimize performance with owned data.
- Destructively transform collections.

🚫 **Avoid if you need to**:
- Reuse the Vec after iteration.
- Share references across threads (`&T` is Sync; `T` might not be).

**Try This**: What happens if you call `.into_iter()` on a Vec and then try to use the original Vec in a parallel iterator (e.g., rayon::iter)?

**Answer**: Compile-time error! The Vec is already consumed. Use `.par_iter()` instead for parallel read-only access.
