---
id: supertraits-bounds-optimization
title: 'Supertraits: enforcing a hierarchy of behaviours'
slug: supertraits-bounds-optimization
locale: en
author: mayo
excerpt: >-
  Leveraging supertraits to establish behavior hierarchies and combining them
  with where clauses to optimize complex generic algorithms for performance and
  type safety

tags:
  - rust
  - supertraits
  - bounds
  - generics
  - optimization
  - traits
date: '2025-08-14'
---

# Supertraits: enforcing a hierarchy of behaviours

In a Rust numerical computation library, I'd use supertraits to create a hierarchy of behaviors, ensuring that advanced operations build on basic ones, and combine them with where clauses to write a complex generic algorithm that's type-safe and performant. This approach organizes code logically, enforces correctness at compile time, and optimizes for efficiency through static dispatch.

<div class="svg-container" style="margin:2rem 0;">
<svg class="td5-fig" viewBox="0 0 800 300" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Layered supertrait hierarchy from Numeric up to AdvancedNumeric consumed by matrix_multiply">
<style>
.td5-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .td5-fig,[data-theme="dark"] .td5-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.td5-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.td5-fig .boxAc{fill:var(--box);stroke:var(--ac);stroke-width:2}
.td5-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td5-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td5-fig .mut{fill:var(--mut);font:600 11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td5-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.td5-fig .lnAc{stroke:var(--ac);stroke-width:2;fill:none}
</style>
<!-- markers -->
<defs>
<marker id="td5-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
<marker id="td5-arrowAc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ac)"/></marker>
</defs>
<!-- base layer: Numeric -->
<rect class="box" x="220" y="200" width="360" height="56" rx="6"/>
<text x="400" y="222" class="tx">trait Numeric: Add + Copy</text>
<text x="400" y="240" class="mut">fn zero() -&gt; Self</text>
<!-- arrow up to AdvancedNumeric -->
<path class="lnAc" d="M400,200 L400,156" marker-end="url(#td5-arrowAc)"/>
<!-- advanced layer -->
<rect class="boxAc" x="220" y="100" width="360" height="56" rx="6"/>
<text x="400" y="122" class="tx">trait AdvancedNumeric: Numeric + Mul</text>
<text x="400" y="140" class="mut">fn one() -&gt; Self</text>
<!-- arrow up to matrix_multiply -->
<path class="ln" d="M400,100 L400,56" marker-end="url(#td5-arrow)"/>
<!-- consumer -->
<rect class="box" x="180" y="20" width="440" height="36" rx="6"/>
<text x="400" y="43" class="tx">matrix_multiply&lt;T: AdvancedNumeric&gt;(...)</text>
<!-- captions -->
<text x="400" y="278" class="mut">basic ops: + and zero()</text>
<text x="120" y="128" class="mut">supertrait</text>
<text x="400" y="295" class="mut">Advanced requires Numeric — no + means no *, enforced at compile time</text>
</svg>
</div>

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

<div class="svg-container" style="margin:2rem 0;">
<svg class="td5b-fig" viewBox="0 0 800 250" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Obligation table showing which requirements of the Numeric and AdvancedNumeric chain f32, i32 and str satisfy">
<style>
.td5b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .td5b-fig,[data-theme="dark"] .td5b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.td5b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.td5b-fig .boxAc{fill:var(--box);stroke:var(--ac);stroke-width:2}
.td5b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td5b-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td5b-fig .mut{fill:var(--mut);font:600 11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td5b-fig .ok{fill:var(--tx);font:700 13px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td5b-fig .no{fill:var(--ac);font:700 13px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td5b-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- title -->
<text x="400" y="26" class="ti">What one T: AdvancedNumeric bound actually demands</text>
<!-- group labels -->
<text x="317" y="46" class="mut">inherited from Numeric</text>
<text x="555" y="46" class="mut">added by AdvancedNumeric</text>
<!-- header row -->
<rect class="box" x="30" y="54" width="750" height="30" rx="4"/>
<text x="100" y="73" class="mut">type</text>
<text x="222" y="73" class="mut">Add&lt;Out=Self&gt;</text>
<text x="317" y="73" class="mut">Copy</text>
<text x="412" y="73" class="mut">zero()</text>
<text x="507" y="73" class="mut">Mul&lt;Out=Self&gt;</text>
<text x="602" y="73" class="mut">one()</text>
<text x="715" y="73" class="mut">verdict</text>
<!-- row f32 -->
<rect class="box" x="30" y="84" width="750" height="36" rx="4"/>
<text x="100" y="106" class="tx">f32</text>
<text x="222" y="107" class="ok">✓</text>
<text x="317" y="107" class="ok">✓</text>
<text x="412" y="107" class="ok">✓</text>
<text x="507" y="107" class="ok">✓</text>
<text x="602" y="107" class="ok">✓</text>
<text x="715" y="107" class="mut">monomorphized</text>
<!-- row i32 -->
<rect class="box" x="30" y="120" width="750" height="36" rx="4"/>
<text x="100" y="142" class="tx">i32</text>
<text x="222" y="143" class="ok">✓</text>
<text x="317" y="143" class="ok">✓</text>
<text x="412" y="143" class="ok">✓</text>
<text x="507" y="143" class="ok">✓</text>
<text x="602" y="143" class="ok">✓</text>
<text x="715" y="143" class="mut">monomorphized</text>
<!-- row &str -->
<rect class="boxAc" x="30" y="156" width="750" height="36" rx="4"/>
<text x="100" y="178" class="tx">&amp;str</text>
<text x="222" y="179" class="no">✗</text>
<text x="317" y="179" class="ok">✓</text>
<text x="412" y="179" class="no">✗</text>
<text x="507" y="179" class="no">✗</text>
<text x="602" y="179" class="no">✗</text>
<text x="715" y="179" class="mut">error[E0277]</text>
<!-- column separators -->
<path class="ln" d="M175,54 L175,192"/>
<path class="ln" d="M270,54 L270,192"/>
<path class="ln" d="M365,54 L365,192"/>
<path class="ln" d="M460,54 L460,192"/>
<path class="ln" d="M555,54 L555,192"/>
<path class="ln" d="M650,54 L650,192"/>
<!-- caption -->
<text x="400" y="222" class="mut">Copy alone is not enough: one missing row and matrix_multiply is never instantiated for that type</text>
</svg>
</div>

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

## Where supertraits earn their place
I'd use supertraits (`AdvancedNumeric: Numeric`) to structure a numerical library, ensuring `matrix_multiply` gets both basic and advanced ops, with where clauses adding flexibility and clarity. This enforces safety, organizes code, and optimizes via static dispatch, ideal for performance.
