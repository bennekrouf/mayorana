---
id: collect-method-rust
title: 'Rust''s collect() Magic: Turning Iterators into Vecs, HashMaps, and Strings!'
slug: collect-method-rust
locale: "en"
author: mayo
excerpt: 'Collections (like Vec), iterators (into_iter, collect), and related concepts'
category: rust
tags:
  - rust
  - iterators
  - collections
  - ownership
date: '2025-07-16'
---

# How does collect() work in Rust? Show how to convert an iterator into a Vec, HashMap, or String.

`collect()` is a method that converts an iterator into a collection. It relies on Rust’s `FromIterator` trait, which defines how to build a type from an iterator.

## Key Mechanics

- **Lazy Evaluation**: Iterators are lazy—`collect()` triggers consumption.
- **Type Inference**: The target collection type must be specified (or inferable).
- **Flexibility**: Works with any type implementing `FromIterator`.

## Converting to Common Collections

### 1. Iterator → `Vec<T>`

```rust
let numbers = 1..5;                 // Range (implements Iterator)
let vec: Vec<_> = numbers.collect(); // Vec<i32> == [1, 2, 3, 4]
```

**Note**: `Vec<_>` lets Rust infer the inner type (`i32` here).

### 2. Iterator → `HashMap<K, V>`

Requires tuples of `(K, V)` pairs:
```rust
use std::collections::HashMap;

let pairs = vec![("a", 1), ("b", 2)].into_iter();
let map: HashMap<_, _> = pairs.collect(); // HashMap<&str, i32>
```

**Alternate Syntax** (with turbofish):
```rust
let map = pairs.collect::<HashMap<&str, i32>>();
```

### 3. Iterator → `String`

Combine characters or strings:
```rust
let chars = ['R', 'u', 's', 't'].iter();
let s: String = chars.collect(); // "Rust"

// Or concatenate strings:
let words = vec!["Hello", " ", "World"].into_iter();
let s: String = words.collect(); // "Hello World"
```

## How `collect()` Works Internally

- **`FromIterator` Trait**:
  Collections implement this to define their construction logic:
  ```rust
  pub trait FromIterator<A> {
      fn from_iter<T>(iter: T) -> Self
      where
          T: IntoIterator<Item = A>;
  }
  ```

- **Compiler Magic**: Rust infers the target type based on context or annotations.

## Advanced Uses

### Conditional Collection

Convert only even numbers to a `Vec`:
```rust
let evens: Vec<_> = (1..10).filter(|x| x % 2 == 0).collect(); // [2, 4, 6, 8]
```

### Custom Types

Implement `FromIterator` for your types:
```rust
struct MyCollection(Vec<i32>);

impl FromIterator<i32> for MyCollection {
    fn from_iter<I: IntoIterator<Item = i32>>(iter: I) -> Self {
        MyCollection(iter.into_iter().collect())
    }
}

let nums = MyCollection::from_iter(1..=3); // MyCollection([1, 2, 3])
```

## Performance Notes

- **Pre-allocated Collections**: Use `with_capacity` + `extend()` if size is known:
  ```rust
  let mut vec = Vec::with_capacity(100);
  vec.extend(1..=100);  // Faster than collect() for large iterables
  ```

- **Zero-Cost Abstractions**: `collect()` is optimized (e.g., `Vec` from ranges avoids bounds checks).

## Common Pitfalls

- **Ambiguous Types**:
  Fails if Rust can’t infer the target:
  ```rust
  let nums = vec![1, 2].into_iter().collect(); // ERROR: type annotations needed
  ```

- **Ownership Issues**:
  Consumes the iterator:
  ```rust
  let iter = vec![1, 2].into_iter();
  let _ = iter.collect::<Vec<_>>();
  // iter.next(); // ERROR: iter consumed by collect()
  ```

## Key Takeaways

✅ Use `collect()` to materialize iterators into:
- `Vec`, `HashMap`, `String`, or any `FromIterator` type.
✅ Specify the type (e.g., `let v: Vec<_> = ...`).
🚀 Optimize with `with_capacity` for large collections.

**Real-World Example**:
`serde_json::from_str` often chains with `collect()` to build complex structures:
```rust
let data: Vec<u8> = "123".bytes().collect(); // [49, 50, 51] (ASCII values)
```
