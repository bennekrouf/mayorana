---
id: blanket-implementations-coherence
title: >-
  Blanket implementation (e.g., impl<T: SomeTrait>
  AnotherTrait for T) to reduce code duplication ?
slug: blanket-implementations-coherence
author: mayo
locale: en
excerpt: >-
  Employing blanket implementations in Rust to minimize code duplication
  for maintainable libraries
content_focus: Blanket Implementations
technical_level: Expert technical discussion

tags:
  - rust
  - blanket-implementations
  - trait-coherence
  - code-duplication
  - traits
  - library-design
date: '2025-08-17'
---

# Blanket implementation (e.g., impl<T: SomeTrait> AnotherTrait for T) are used to reduce code duplication in a library.

In a Rust library providing utility functions, use a blanket implementation to automatically apply a trait to all types that satisfy a given constraint.

This streamlines the API but requires careful handling of trait coherence to avoid conflicts.

Here's how I'd do it with an example.

## Using Blanket Implementation

**Scenario**: A library offers data processing utilities, including a `Summable` trait for types that can be summed (e.g., numbers, vectors). I want to add a `Stats` trait for computing statistics (e.g., mean) on any `Summable` type without writing repetitive implementations.

### Traits and Blanket Implementation:

```rust
use std::ops::Add;

// Trait for types that can be summed
trait Summable {
    type Output;
    fn sum(&self) -> Self::Output;
}

// Trait for statistical operations
trait Stats {
    fn mean(&self) -> f64;
}

// Blanket implementation
impl<T> Stats for T
where
    T: Summable,
    T::Output: Into<f64>,
{
    fn mean(&self) -> f64 {
        let sum = self.sum().into();
        sum / (self.len() as f64)
    }
}

// Helper trait for length (simplified)
trait Len {
    fn len(&self) -> usize;
}
impl<T> Len for Vec<T> {
    fn len(&self) -> usize { self.len() }
}

// Example implementations
impl Summable for Vec<i32> {
    type Output = i32;
    fn sum(&self) -> i32 {
        self.iter().sum()
    }
}

impl Summable for Vec<f64> {
    type Output = f64;
    fn sum(&self) -> f64 {
        self.iter().sum()
    }
}

// Usage
let numbers = vec![1, 2, 3, 4, 5];
let mean = numbers.mean(); // 3.0
let floats = vec![1.5, 2.5, 3.5];
let mean_f = floats.mean(); // 2.5
```

## How It Reduces Code Duplication

- **Single Implementation**: The blanket `impl<T: Summable>` applies `Stats` to any type implementing `Summable` (e.g., `Vec<i32>`, `Vec<f64>`). Without it, I'd need separate `impl Stats for Vec<i32>`, `impl Stats for Vec<f64>`, etc., duplicating the mean logic.
- **Scalability**: Adding a new `Summable` type (e.g., `Vec<u64>`) automatically grants `Stats` without touching the library code.
- **Clarity**: Users get `mean` for free on any `Summable` type, simplifying the API.

## Trait Coherence and Pitfalls

Trait coherence ensures no two conflicting trait implementations exist for the same type.

Rust's orphan rules enforce this: you can only implement a trait for a type if either the trait or the type is defined in your crate.

Blanket implementations amplify coherence risks:

### 1. Accidental Overlap

**Problem**: If another crate defines `impl Stats for Vec<i32>`, it conflicts with the blanket `impl<T: Summable> Stats for T` if `Vec<i32>: Summable`.

**Mitigation**: Make `Stats` a sealed trait (non-public or with a private supertrait) to prevent external implementations:

```rust
mod private {
    pub trait Sealed {}
}
trait Stats: private::Sealed {
    fn mean(&self) -> f64;
}
impl<T: Summable + private::Sealed> Stats for T { /* ... */ }
impl<T> private::Sealed for Vec<T> {} // Only Vec<T> allowed
```

Only types I explicitly mark with `Sealed` get the blanket `Stats`.

### 2. Downstream Conflicts

**Problem**: A user's crate adds `impl Summable for Vec<String>`, expecting `Stats`, but `String` doesn't implement `Into<f64>`, causing a compile error.

**Mitigation**: Clearly document bounds (e.g., "T::Output must implement Into<f64>") and test with diverse types. Alternatively, split `Stats` into narrower traits (e.g., `NumericStats`) to constrain applicability.

### 3. Orphan Rule Violations

**Problem**: If `Stats` and `Summable` are in different crates, the blanket impl might violate orphan rules unless one is local.

**Mitigation**: Define both traits in the same crate, or use newtype wrappers for foreign types.

### 4. Performance Bloat

**Problem**: The blanket impl monomorphizes `mean` for each `T`, potentially increasing code size.

**Mitigation**: Profile with `size target/release/lib` and consider `dyn Stats` for dynamic dispatch if code size grows excessively, though this adds vtable overhead.

## Enhancing the Design

- **Flexibility**: Add associated types or methods to `Stats` for more stats (e.g., variance), reusing `Summable`'s sum.
- **Generality**: Extend `Len` to other collections (e.g., `[T]`, `VecDeque<T>`).
- **Safety**: Use where clauses to enforce invariants (e.g., non-empty collections).

## Verification

### Tests

Ensure blanket applies correctly:

```rust
let v = vec![1, 2, 3];
assert_eq!(v.mean(), 2.0);
let f = vec![1.0, 2.0, 3.0];
assert_eq!(f.mean(), 2.0);
```

### Size Check

`cargo build --release; size target/release/lib` to monitor binary growth.

### Compile Errors

Test invalid types (e.g., `Vec<String>`) to confirm coherence.

## Conclusion

I'd use a blanket `impl<T: Summable> Stats for T` to give `mean` to all `Summable` types, as shown to avoid duplications. This delivers a concise, safe API with minimal performance cost, leveraging Rust's type system.
