---
id: simd-matrix-mult-rust
title: 'SIMD in Rust: Optimizing Matrix Multiplication'
slug: simd-matrix-mult-rust
locale: en
author: mayo
excerpt: >-
  Leveraging Rust’s SIMD support for accelerating matrix multiplication with
  considerations for portability and correctness
content_focus: low-level optimization in Rust
technical_level: Expert technical discussion

tags:
  - rust
  - simd
  - advanced
date: '2025-10-01'
---

# SIMD in Rust: Optimizing Matrix Multiplication

Rust’s **SIMD (Single Instruction, Multiple Data)** capabilities enable parallel processing of multiple data elements in a single CPU instruction, ideal for computationally intensive tasks like matrix multiplication. I’ll explain how to leverage `std::arch` for maximum throughput, address portability across architectures (e.g., x86_64 with SSE/AVX vs. ARM with NEON), and highlight challenges and solutions for ensuring correctness and performance.

## Vectorizing Matrix Multiplication with SIMD

Matrix multiplication (e.g., \( C = A \times B \), where \( A \) is \( m \times n \), \( B \) is \( n \times p \), and \( C \) is \( m \times p \)) involves computing dot products of rows and columns. A naive scalar implementation for a 4x4 matrix is:

```rust
fn matrix_mult_scalar(a: &[[f32; 4]; 4], b: &[[f32; 4]; 4], c: &mut [[f32; 4]; 4]) {
    for i in 0..4 {
        for j in 0..4 {
            c[i][j] = 0.0;
            for k in 0..4 {
                c[i][j] += a[i][k] * b[k][j];
            }
        }
    }
}
```

This processes one `f32` at a time, which is slow. SIMD can compute multiple elements simultaneously (e.g., 8 `f32` with AVX on x86_64). Here’s how to vectorize it using `std::arch`:

### Selecting SIMD Instructions
On x86_64 with AVX (256-bit registers), use:
- `_mm256_loadu_ps`: Load 8 `f32` into a 256-bit register.
- `_mm256_mul_ps`: Multiply two 256-bit vectors.
- `_mm256_add_ps`: Add two 256-bit vectors.
- `_mm256_storeu_ps`: Store results back to memory.

### Vectorized Implementation
Assuming \( p \) is a multiple of 8 (padding if needed), vectorize the inner loop:

```rust
#[cfg(target_arch = "x86_64")]
use std::arch::x86_64::*;

unsafe fn matrix_mult_simd(a: &[[f32; 8]; 8], b: &[[f32; 8]; 8], c: &mut [[f32; 8]; 8]) {
    for i in 0..8 {
        for j in (0..8).step_by(8) { // Process 8 elements of C[i][j..j+8]
            let mut sum = _mm256_setzero_ps(); // Zeroed 256-bit register
            for k in 0..8 {
                let a_vec = _mm256_set1_ps(a[i][k]); // Broadcast a[i][k]
                let b_ptr = b[k][j..].as_ptr();
                let b_vec = _mm256_loadu_ps(b_ptr);  // Load 8 elements of B
                let prod = _mm256_mul_ps(a_vec, b_vec);
                sum = _mm256_add_ps(sum, prod);      // Accumulate
            }
            _mm256_storeu_ps(c[i][j..].as_mut_ptr(), sum); // Store 8 results
        }
    }
}
```

This computes 8 dot product terms per iteration, reducing loop iterations by 8x. Wrap this in outer loops, optionally unrolling or tiling (e.g., 8x8 blocks) for better cache usage.

## Using Rust’s SIMD Tools

- **`std::arch`**: Provides raw intrinsics, requiring `unsafe` and manual architecture targeting (e.g., `#[cfg(target_arch = "x86_64")]`). Enable AVX with `--features avx2` in `Cargo.toml`.
- **Crates like `packed_simd`**: Offers portable abstractions:
  ```rust
  use packed_simd::f32x8;

  fn matrix_mult_simd_portable(a: &[[f32; 8]; 8], b: &[[f32; 8]; 8], c: &mut [[f32; 8]; 8]) {
      for i in 0..8 {
          for j in (0..8).step_by(8) {
              let mut sum = f32x8::splat(0.0);
              for k in 0..8 {
                  let a_vec = f32x8::splat(a[i][k]);
                  let b_vec = f32x8::from_slice_unaligned(&b[k][j..]);
                  let prod = a_vec * b_vec;
                  sum = sum + prod;
              }
              sum.write_unaligned(&mut c[i][j..]);
          }
      }
  }
  ```
  This hides architecture specifics, falling back to scalar code if SIMD isn’t available.

## Challenges Across Architectures

- **Instruction Set Availability**: AVX is x86_64-specific; ARM uses NEON (128-bit, 4x `f32`). AVX code fails on ARM or older x86 CPUs without AVX.
  - **Solution**: Use `#[cfg]` for conditional compilation or runtime feature detection with `std::is_x86_feature_detected!("avx2")`. Fallback to scalar or narrower SIMD (e.g., SSE2).
- **Alignment**: AVX prefers 32-byte aligned memory. Unaligned loads (`_mm256_loadu_ps`) are slower.
  - **Solution**: Align data with `#[repr(align(32))]` or pad arrays, trading memory for speed.
- **Portability**: Hardcoding AVX locks you to x86_64. `packed_simd` helps, but performance varies (e.g., NEON’s 4-wide vs. AVX’s 8-wide).
  - **Solution**: Abstract with crates or write multiple implementations, selecting at runtime.
- **Correctness**: Floating-point associativity changes with SIMD summation order, risking numerical drift.
  - **Solution**: Test against scalar results with known inputs; use `fsum` or pairwise reduction for precision.

## Verification

- **Benchmarking**: Use `criterion` to compare SIMD vs. scalar:
  ```rust
  use criterion::{black_box, Criterion};
  fn bench(c: &mut Criterion) {
      let a = [[1.0_f32; 8]; 8];
      let b = [[2.0_f32; 8]; 8];
      let mut c = [[0.0_f32; 8]; 8];
      c.bench_function("simd", |b| b.iter(|| unsafe { matrix_mult_simd(black_box(&a), black_box(&b), black_box(&mut c)) }));
      c.bench_function("scalar", |b| b.iter(|| matrix_mult_scalar(black_box(&a), black_box(&b), black_box(&mut c))));
  }
  ```
  Expect SIMD to be 4-8x faster for large matrices.
- **Profiling**: Use `perf` on Linux (`perf stat -e cycles,instructions`) to confirm instruction reduction (e.g., 8x fewer multiplications).
- **Assembly Inspection**: Run `cargo rustc --release -- --emit asm` or use `godbolt.org` to verify tight loops with SIMD instructions (e.g., `vmulps`, `vaddps`).

## Practical Example Outcome

For a 1024x1024 matrix, AVX could reduce runtime from seconds to milliseconds on a modern CPU, assuming good data locality. Profiling should show an 8x instruction reduction in the inner loop, with benchmarks confirming significant speedups.

## Conclusion

For maximum throughput on a known architecture (e.g., x86_64 with AVX), use `std::arch` to vectorize matrix multiplication’s inner loop, tiling for cache efficiency. For portability, switch to `packed_simd`, accepting some overhead. Address challenges like alignment and feature detection with conditional compilation and runtime checks, ensuring both speed and correctness in a production system.
