---
id: supertraits-bounds-optimization
title: "Use supertraits to enforce a hierarchy of behaviors"
slug: supertraits-bounds-optimization
author: mayo
excerpt: >-
  Leveraging supertraits to establish behavior hierarchies and combining them with where clauses to optimize complex generic algorithms for performance and type safety
content_focus: "Supertraits and Bounds"
technical_level: "Expert technical discussion"
category: rust
tags:
  - rust
  - supertraits
  - bounds
  - generics
  - optimization
  - traits
---

# How would you use supertraits (e.g., trait Advanced: Basic) to enforce a hierarchy of behaviors in a system, and how would you combine them with where clauses to optimize a complex generic algorithm?

In a Rust numerical computation library, I'd use supertraits to create a hierarchy of behaviors, ensuring that advanced operations build on basic ones, and combine them with where clauses to write a complex generic algorithm that's type-safe and performant. This approach organizes code logically, enforces correctness at compile time, and optimizes for efficiency through static dispatch.

## Designing the Trait Hierarchy

For numerical types, I'd define a hierarchy of traits:

```rust
use std::ops::{Add, Mul};

// Basic operations every numeric type must support
trait Numeric: Add<Self, Output = Self> + Copy {
    fn zero() -> Self;
}

// Advanced operations for types supporting multiplication
trait AdvancedNumeric: Numeric + Mul<Self, Output = Self> {
    fn one() -> Self;
}
```

**Supertrait**: `AdvancedNumeric: Numeric` means any type implementing `AdvancedNumeric` must also implement `Numeric`. This enforces that advanced types (with `*` and `one`) have basic operations (`+` and `zero`).

**Why**: Organizes behaviors hierarchically—basic ops are foundational, advanced ops build on them, mirroring mathematical structure.

## Example: Generic Matrix Multiplication

I'd write a generic matrix multiplication algorithm using these traits:

```rust
fn matrix_multiply<T>(a: &[T], b: &[T], rows_a: usize, cols_a: usize, cols_b: usize) -> Vec<T>
where
    T: AdvancedNumeric,
    T::Output: Into<f64>, // For potential debugging or scaling
{
    let mut result = vec![T::zero(); rows_a * cols_b];
    for i in 0..rows_a {
        for j in 0..cols_b {
            let mut sum = T::zero();
            for k in 0..cols_a {
                sum = sum + a[i * cols_a + k] * b[k * cols_b + j];
            }
            result[i * cols_b + j] = sum;
        }
    }
    result
}

// Implementations
impl Numeric for f32 {
    fn zero() -> Self { 0.0 }
}
impl AdvancedNumeric for f32 {
    fn one() -> Self { 1.0 }
}
impl Numeric for i32 {
    fn zero() -> Self { 0 }
}
impl AdvancedNumeric for i32 {
    fn one() -> Self { 1 }
}

// Usage
let a = vec![1.0_f32, 2.0, 3.0, 4.0]; // 2x2 matrix
let b = vec![5.0_f32, 6.0, 7.0, 8.0]; // 2x2 matrix
let result = matrix_multiply(&a, &b, 2, 2, 2); // [[19, 22], [43, 50]]
```

## How Supertraits and where Clauses Improve the Design

### Code Organization
- **Supertraits**: `AdvancedNumeric: Numeric` creates a clear hierarchy. Basic ops (`+`, `zero`) are universal; advanced ops (`*`, `one`) are for specialized types. This mirrors math: all numbers add, but not all multiply (e.g., quaternions vs. matrices).
- **Modularity**: New traits (e.g., `ComplexNumeric`) can extend `AdvancedNumeric`, reusing existing behavior.

### Type Safety
- **Supertraits**: Ensure `matrix_multiply` only accepts types with both `Add` and `Mul` via `AdvancedNumeric`. Without `Numeric`, a type might implement `Mul` but not `Add`, breaking the algorithm.
- **Where Clauses**: `T: AdvancedNumeric` is concise, bundling multiple constraints. `T::Output: Into<f64>` adds flexibility for debugging without cluttering the signature.
- **Compile-Time Checks**: Invalid types (e.g., `String`) fail early:

```rust
let strings = vec!["a", "b"];
matrix_multiply(&strings, &strings, 1, 1, 1); // Error: String lacks Numeric
```

### Efficiency
- **Static Dispatch**: `T: AdvancedNumeric` triggers monomorphization, generating specialized code for `f32`, `i32`, etc. Operations like `+` and `*` inline to native instructions (e.g., `fadd` for `f32`).
- **Minimal Bounds**: `Copy` avoids cloning, `Output = Self` ensures no type conversions in the hot path. `Into<f64>` is only used if needed, often optimized out.
- **No Overhead**: The hierarchy adds no runtime cost—supertraits are compile-time constraints.

## Role of where Clauses

- **Clarity**: Move complex bounds (`T: AdvancedNumeric`, `T::Output: Into<f64>`) out of the function signature, improving readability.
- **Flexibility**: Allow additional constraints without altering the trait hierarchy (e.g., adding `T: Debug` for logging).
- **Optimization**: Enable the compiler to see all constraints upfront, aiding inlining and loop optimizations (e.g., SIMD for `f32` arrays).

## Example Optimization

For `f32`, the inner loop might compile to:

```asm
; Pseudocode
xorps xmm0, xmm0   ; sum = 0.0
loop:
  movss xmm1, [rsi] ; a[i * cols_a + k]
  mulss xmm1, [rdi] ; * b[k * cols_b + j]
  addss xmm0, xmm1  ; sum += ...
  add rsi, 4
  dec rcx
  jnz loop
```

**Why**: `AdvancedNumeric` ensures `Add` and `Mul`, inlined as `addss` and `mulss`. Monomorphization tailors this to `f32`.

## Trade-Offs

- **Code Size**: Monomorphization creates a version per `T` (e.g., `f32`, `i32`), increasing binary size. Mitigated by limiting supported types or using `dyn AdvancedNumeric` for cold paths.
- **Complexity**: Supertraits add design overhead but clarify intent vs. flat bounds (e.g., `T: Add + Mul + Copy`).

## Verification

### Tests
Validate correctness:

```rust
let a = vec![1.0_f32, 2.0, 3.0, 4.0];
let b = vec![5.0_f32, 6.0, 7.0, 8.0];
let result = matrix_multiply(&a, &b, 2, 2, 2);
assert_eq!(result, vec![19.0, 22.0, 43.0, 50.0]);
```

### Benchmark
Use criterion:

```rust
use criterion::{black_box, Criterion};
fn bench(c: &mut Criterion) {
    let a = vec![1.0_f32; 16];
    let b = vec![2.0_f32; 16];
    c.bench_function("matrix_multiply", |b| b.iter(|| matrix_multiply(black_box(&a), black_box(&b), 4, 4, 4)));
}
```

Expect tight performance due to inlining.

### Assembly
`cargo rustc --release -- --emit asm` confirms native ops.

## Conclusion

I'd use supertraits (`AdvancedNumeric: Numeric`) to structure a numerical library, ensuring `matrix_multiply` gets both basic and advanced ops, with where clauses adding flexibility and clarity. This enforces safety, organizes code, and optimizes via static dispatch, ideal for performance.
