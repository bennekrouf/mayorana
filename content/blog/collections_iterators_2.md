---
id: iter-methods-rust
title: 'How do into_iter(), iter(), and iter_mut() differ?'
slug: iter-methods-rust
date: '2025-07-08'
author: mayo
excerpt: 'Collections (like Vec), iterators (into_iter, collect), and related concepts'
category: rust
tags:
  - rust
  - iterators
  - collections
  - ownership
---

# How do into_iter(), iter(), and iter_mut() differ?

These three methods are fundamental for working with collections in Rust, each serving distinct ownership and mutability use cases.

## 1. `into_iter()` - Ownership-Consuming Iterator

- **Takes ownership** of the collection (`self`).
- **Produces** owned values (`T`) when iterating.
- **Destroys** the original collection (can't be used afterward).

```rust
let vec = vec!["a".to_string(), "b".to_string()];
for s in vec.into_iter() {  // `vec` is moved here
    println!("{}", s);      // `s` is a String (owned)
}
// println!("{:?}", vec);  // ERROR: `vec` was consumed
```

**When to use**:
- When you need to transform or consume the collection permanently.
- For chaining iterator adapters that need ownership (e.g., `.filter().collect()`).

## 2. `iter()` - Immutable Borrow Iterator

- **Borrows** the collection immutably (`&self`).
- **Produces** references (`&T`).
- **Leaves** the collection intact.

```rust
let vec = vec!["a", "b", "c"];
for s in vec.iter() {       // Borrows `vec`
    println!("{}", s);      // `s` is &&str (reference)
}
println!("{:?}", vec);      // OK: `vec` still valid
```

**When to use**:
- When you only need read-only access to elements.
- For operations like searching (`.find()`) or inspection.

## 3. `iter_mut()` - Mutable Borrow Iterator

- **Borrows** the collection mutably (`&mut self`).
- **Produces** mutable references (`&mut T`).
- **Allows** in-place modification.

```rust
let mut vec = vec![1, 2, 3];
for num in vec.iter_mut() {  // Mutable borrow
    *num *= 2;               // Modify in place
}
println!("{:?}", vec);       // [2, 4, 6]
```

**When to use**:
- When you need to modify elements without reallocating.
- For bulk updates (e.g., applying transformations).

## Key Differences Summary

| Method        | Ownership     | Yields     | Modifies Original? | Reuse Original? |
|---------------|---------------|------------|--------------------|-----------------|
| `into_iter()` | Consumes      | `T`        | ❌ (destroyed)      | ❌              |
| `iter()`      | Borrows       | `&T`       | ❌                 | ✅              |
| `iter_mut()`  | Mut borrow    | `&mut T`   | ✅                 | ✅              |

## Common Pitfalls

- **Accidental moves with `into_iter()`**:
  ```rust
  let vec = vec![1, 2];
  let _ = vec.into_iter();  // `vec` moved here
  // println!("{:?}", vec); // ERROR!
  ```

- **Simultaneous mutable access**:
  ```rust
  let mut vec = vec![1, 2];
  let iter = vec.iter_mut();
  // vec.push(3);           // ERROR: Cannot borrow `vec` while iterator exists
  ```

## Real-World Examples

- **`iter()` for read-only processing**:
  ```rust
  let words = vec!["hello", "world"];
  let lengths: Vec<_> = words.iter().map(|s| s.len()).collect();  // [5, 5]
  ```

- **`iter_mut()` for in-place updates**:
  ```rust
  let mut scores = vec![85, 92, 78];
  scores.iter_mut().for_each(|s| *s += 5);  // [90, 97, 83]
  ```

- **`into_iter()` for ownership transfer**:
  ```rust
  let matrix = vec![vec![1, 2], vec![3, 4]];
  let flattened: Vec<_> = matrix.into_iter().flatten().collect();  // [1, 2, 3, 4]
  ```

## Performance Notes

- `iter()` and `iter_mut()` are zero-cost (just pointers).
- `into_iter()` may involve moves (but optimized for primitives like `i32`).

**Try This**: What happens if you call `iter_mut()` on a `Vec<T>` where `T` doesn’t implement `Copy`, then try to modify the elements?  
**Answer**: It works! The iterator yields `&mut T`, allowing direct mutation (e.g., `*item = new_value`).
