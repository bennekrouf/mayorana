---
id: sized-unsized-bounds-flexibility
title: "Write a function that accepts both sized types (e.g., [u8; 16]) and unsized types (e.g., [u8] or dyn Trait) with ?Sized bound"
slug: sized-unsized-bounds-flexibility
locale: "en"
author: mayo
excerpt: >-
  Understanding the role of ?Sized bounds in Rust trait definitions and leveraging them to create flexible functions that work with both sized and unsized types efficiently
content_focus: "Sized and ?Sized"
technical_level: "Expert technical discussion"
category: rust
tags:
  - rust
  - sized
  - unsized
  - bounds
  - traits
  - generics
---

# What's the significance of the ?Sized bound in trait definitions, and how would you use it to write a function that accepts both sized types (e.g., [u8; 16]) and unsized types (e.g., [u8] or dyn Trait)?

The `?Sized` bound in Rust trait definitions relaxes the default `Sized` constraint on generic types, allowing a function or trait to work with both sized types (known size at compile time, like `[u8; 16]`) and unsized types (e.g., `[u8]`, `str`, `dyn Trait`). In a data serialization library, I'd use `?Sized` to write a flexible function that processes both fixed arrays and dynamic slices efficiently, enhancing functionality without sacrificing performance.

## Role of ?Sized

- **Default Sized**: By default, generic parameters (`T`) imply `T: Sized`, meaning the type's size must be known at compile time. This excludes unsized types like slices (`[u8]`), strings (`str`), or trait objects (`dyn Trait`), which only exist behind pointers (e.g., `&[u8]`, `Box<dyn Trait>`).
- **?Sized Significance**: Adding `T: ?Sized` opts out of this requirement, allowing `T` to be either sized or unsized. This enables broader applicability, as the function can accept references to unsized types (`&T`) or sized types directly.

## Example: Serialization Function

In a serialization library, I'd define a function to compute a checksum over any contiguous byte-like data:

```rust
trait Checksum {
    fn checksum(&self) -> u32;
}

fn compute_checksum<T: ?Sized + Checksum>(data: &T) -> u32 {
    data.checksum()
}

// Implementations
struct FixedBuffer([u8; 16]);
struct DynamicBuffer([u8]);

impl Checksum for FixedBuffer {
    fn checksum(&self) -> u32 {
        self.0.iter().fold(0, |acc, &x| acc.wrapping_add(x as u32))
    }
}

impl Checksum for [u8] { // Unsized type
    fn checksum(&self) -> u32 {
        self.iter().fold(0, |acc, &x| acc.wrapping_add(x as u32))
    }
}

// Usage
let fixed = FixedBuffer([1; 16]);
let dynamic = vec![2; 32];
let fixed_sum = compute_checksum(&fixed);        // Sized: [u8; 16]
let dynamic_sum = compute_checksum(&dynamic[..]); // Unsized: [u8]
```

## How ?Sized Enhances Functionality

### Flexibility
Without `?Sized`, `compute_checksum` would reject `&[u8]`:

```rust
fn compute_checksum<T: Sized + Checksum>(data: &T) -> u32 { /* ... */ }
// Error: [u8] doesn't implement Sized
```

With `T: ?Sized`, it accepts:
- **Sized**: `FixedBuffer` (16 bytes known at compile time).
- **Unsized**: `[u8]` (size known only at runtime via length).

### Unified API
One function handles both fixed arrays (`[u8; 16]`) and slices (`[u8]`), plus trait objects (`dyn Checksum`) if needed. This reduces code duplication in a serialization library processing diverse inputs.

## Maintaining Efficiency

- **Reference-Based**: Using `&T` avoids owning `T` or requiring `Box<T>`. For unsized types, this leverages their inherent indirection (e.g., `&[u8]` is a fat pointer: data + length), adding no extra cost.
- **Static Dispatch**: `T: ?Sized + Checksum` ensures monomorphization for each `T`. `checksum` calls are inlined:
  - For `FixedBuffer`: Direct array access, unrolled if small.
  - For `[u8]`: Slice iteration, potentially vectorized by LLVM.
- **No Overhead**: The `?Sized` bound itself adds no runtime cost—it's a compile-time relaxation. The vtable (if `dyn Checksum`) is only used if explicitly chosen, not here.

## Implementation Details

- **Trait Bound**: `Checksum` defines the behavior, implemented for both sized (`FixedBuffer`) and unsized (`[u8]`) types. `?Sized` lets `compute_checksum` bridge them.
- **Safety**: `&T` ensures borrow semantics, preventing ownership issues with unsized types (which can't be moved directly).

## Trade-Offs

- **Indirection**: Unsized types require a reference or smart pointer (`&T`, `Box<T>`), adding a layer vs. direct `T` for sized types. In a hot path, this might matter (e.g., pointer chasing).
- **Complexity**: Callers must understand `&T` vs. `T`. I'd document that `compute_checksum` takes references for universality.
- **Alternative**: If only slices are needed, `&[u8]` directly might suffice, but `?Sized` supports broader use (e.g., `dyn Trait`).

## Verification

### Compile Test
Ensure both sized and unsized types work:

```rust
assert_eq!(compute_checksum(&FixedBuffer([1; 16])), 16);
assert_eq!(compute_checksum(&vec![2; 32][..]), 64);
```

### Benchmark
Use criterion to check overhead:

```rust
use criterion::{black_box, Criterion};
fn bench(c: &mut Criterion) {
    let fixed = FixedBuffer([1; 16]);
    let dynamic = vec![2; 32];
    c.bench_function("fixed", |b| b.iter(|| compute_checksum(black_box(&fixed))));
    c.bench_function("dynamic", |b| b.iter(|| compute_checksum(black_box(&dynamic[..]))));
}
```

Expect similar performance to direct calls, with inlining.

## Conclusion

`?Sized` lets `compute_checksum` handle both sized and unsized types by relaxing the `Sized` constraint, making it ideal for a serialization library. It maintains efficiency via static dispatch and references, offering flexibility without runtime cost. I'd use this to unify APIs across diverse data types, ensuring performance and scalability in a Rust system.
