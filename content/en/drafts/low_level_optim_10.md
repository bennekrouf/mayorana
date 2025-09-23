---
id: profiling-optimization-rust
title: "Profiling Rust: Tackling L1 Cache Misses with perf, Flamegraph, and Criterion"
slug: profiling-optimization-rust
locale: "en"
author: mayo
excerpt: >-
  Low-level optimization in Rust, focusing on profiling tools to identify and fix performance bottlenecks like L1 cache misses
content_focus: "low-level optimization in Rust"
technical_level: "Expert technical discussion"
category: rust
tags:
  - rust
  - advanced
  - optimization
  - cache
---

# Profiling Rust: Tackling L1 Cache Misses with perf, Flamegraph, and Criterion

Profiling and optimizing low-level performance bottlenecks in a Rust codebase, such as excessive L1 cache misses, requires a systematic approach using specialized tools. I’ll detail how to use `perf`, `cargo flamegraph`, and `criterion` to diagnose and optimize a performance-critical section, ensuring measurable improvements.

## Tools and Their Roles

- **`perf` (Linux)**: A system-level profiler for hardware events like cache misses, cycles, and instructions. Ideal for pinpointing L1 cache issues across the application.
- **`cargo flamegraph`**: Generates visual flame graphs to identify where time is spent, correlating cache misses to specific functions.
- **`criterion`**: A microbenchmarking tool for precise, repeatable measurements of small code sections, perfect for before-and-after optimization comparisons.

## Example Scenario

Consider a Rust application processing a large array of structs, where `perf` reveals high L1 cache miss rates causing slowdowns:

```rust
struct Point { x: f32, y: f32, z: f32 } // 12 bytes
fn process_points(points: &mut [Point]) {
    for p in points {
        p.x += 1.0; // Scattered access
        p.y += 1.0;
        p.z += 1.0;
    }
}
```

**Problem**: The Array-of-Structs (AoS) layout causes poor locality, as accessing only `x` pulls unnecessary `y` and `z` into the 64-byte L1 cache line, leading to excessive misses.

## Workflow to Optimize L1 Cache Misses

### 1. Setup and Reproduce
- Compile with `--release` for realistic performance (`cargo build --release`).
- Run the app with a representative workload (e.g., 1M `Point`s).

### 2. Diagnose with `perf`
- **Command**: `perf stat -e cycles,instructions,L1-dcache-loads,L1-dcache-load-misses ./target/release/app`
- **Sample Output**:
  ```
  10,000,000,000 cycles
  15,000,000,000 instructions
  5,000,000,000 L1-dcache-loads
  500,000,000 L1-dcache-load-misses (10.00%)
  ```
- **Insight**: A 10% miss rate is high (ideal: <1-2%). L1 misses (50-100 cycles each) dominate runtime.

### 3. Locate with `cargo flamegraph`
- **Install**: `cargo install flamegraph`
- **Run**: `cargo flamegraph --bin app`
- **Output**: An SVG flame graph shows `process_points` taking 80% of time, with flat peaks indicating memory stalls.
- **Hypothesis**: Strided access across `x`, `y`, `z` fetches unnecessary data per cache line.

### 4. Microbenchmark with `criterion`
- **Setup**:
  ```rust
  use criterion::{black_box, Criterion};
  fn bench(c: &mut Criterion) {
      let mut points = vec![Point { x: 0.0, y: 0.0, z: 0.0 }; 1_000_000];
      c.bench_function("process_points", |b| b.iter(|| process_points(black_box(&mut points))));
  }
  ```
- **Baseline**: 50ms per iteration, high variance due to cache misses.

### 5. Optimize
- **Switch to Struct-of-Arrays (SoA)**:
  ```rust
  struct Points { xs: Vec<f32>, ys: Vec<f32>, zs: Vec<f32> }
  impl Points {
      fn new(n: usize) -> Self {
          Points { xs: vec![0.0; n], ys: vec![0.0; n], zs: vec![0.0; n] }
      }
      fn process(&mut self) {
          for x in &mut self.xs { *x += 1.0; } // Contiguous access
      }
  }
  ```
- **Why**: Contiguous `xs` fits 16 `f32`s per 64-byte cache line (vs. 5 `Point`s with padding), reducing loads and misses.
- **Alternative**: If AoS is required, align `Point` with `#[repr(align(16))]` and pad to 16 bytes to reduce partial line fetches.

### 6. Verify
- **perf**: Re-run `perf stat`:
  ```
  8,000,000,000 cycles
  12,000,000,000 instructions
  3,000,000,000 L1-dcache-loads
  30,000,000 L1-dcache-load-misses (1.00%)
  ```
  Misses drop to 1%, cycles decrease by 20%.
- **Flamegraph**: New graph shows `process` as a narrower peak, less memory-bound.
- **criterion**: Time drops to 40ms, with tighter variance, confirming cache efficiency.

## Optimization Steps

- **Hypothesis**: Poor locality from AoS layout.
- **Fix**: Refactor to SoA for contiguous access.
- **Iterate**: If misses persist, check alignment (`std::mem::align_of`), stride, or false sharing (e.g., in multi-threaded cases).

## Conclusion

To tackle L1 cache misses in a Rust codebase, I’d use `perf` to detect high miss rates, `cargo flamegraph` to pinpoint the culprit, and `criterion` to measure improvements.

The workflow—reproduce, diagnose, hypothesize, optimize, verify—ensures data-driven results.

In this case, switching to an SoA layout slashed cache misses, boosting throughput, as confirmed by profiling tools. This approach helps developers to solve bottlenecks efficiently.