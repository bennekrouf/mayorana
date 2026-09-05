---
id: profiling-optimization-rust
title: 'Profiling Rust: Tackling L1 Cache Misses with perf, Flamegraph, and Criterion'
slug: profiling-optimization-rust
locale: en
author: mayo
excerpt: >-
  Low-level optimization in Rust, focusing on profiling tools to identify and
  fix performance bottlenecks like L1 cache misses
tags:
  - rust
  - advanced
  - optimization
  - cache
date: '2025-11-02'
---

# Profiling Rust: Tackling L1 Cache Misses with perf, Flamegraph, and Criterion

Profiling and optimizing low-level performance bottlenecks in a Rust codebase, such as excessive L1 cache misses, requires a systematic approach using specialized tools. I’ll detail how to use `perf`, `cargo flamegraph`, and `criterion` to diagnose and optimize a performance-critical section, ensuring measurable improvements.

<div class="svg-container" style="margin:2rem 0;">
<svg class="lo10-fig" viewBox="0 0 800 230" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Array-of-Structs wastes cache line space pulling in unused fields, while Struct-of-Arrays packs one field contiguously per cache line">
<!-- style -->
<style>
.lo10-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .lo10-fig,[data-theme="dark"] .lo10-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.lo10-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.lo10-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.lo10-fig .x{fill:#FF6B00;opacity:0.75}
.lo10-fig .yz{fill:var(--mut);opacity:0.35}
.lo10-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.lo10-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.lo10-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
</style>
<!-- top: AoS -->
<text x="40" y="30" class="ti">Array-of-Structs — one 64-byte L1 line</text>
<rect x="40" y="42" width="720" height="46" rx="5" class="box"/>
<rect x="40" y="42" width="120" height="46" class="x"/>
<rect x="160" y="42" width="120" height="46" class="yz"/>
<rect x="280" y="42" width="120" height="46" class="x"/>
<rect x="400" y="42" width="120" height="46" class="yz"/>
<rect x="520" y="42" width="120" height="46" class="x"/>
<rect x="640" y="42" width="120" height="46" class="yz"/>
<text x="400" y="106" text-anchor="middle" class="mut">reading x also loads y, z you don't need — line wasted fast</text>
<!-- bottom: SoA -->
<text x="40" y="150" class="ti">Struct-of-Arrays — xs packed contiguously</text>
<rect x="40" y="162" width="720" height="46" rx="5" class="boxac"/>
<text x="400" y="190" text-anchor="middle" class="tx">xs: [f32] … 16 values fit per 64-byte line</text>
<text x="40" y="226" class="mut">contiguous access, no wasted bytes — cache misses drop ~10x</text>
</svg>
</div>

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

<div class="svg-container" style="margin:2rem 0;">
<svg class="lo10b-fig" viewBox="0 0 800 250" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Six-step profiling loop from reproduce through perf, flamegraph, criterion, optimize and verify, feeding back into perf until the miss rate drops">
<!-- style -->
<style>
.lo10b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .lo10b-fig,[data-theme="dark"] .lo10b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.lo10b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.lo10b-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.lo10b-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo10b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo10b-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo10b-fig .ac{fill:var(--ac);font:700 11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo10b-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.lo10b-fig .lnac{stroke:var(--ac);stroke-width:2;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="lo10b-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
<marker id="lo10b-arrowac" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ac)"/></marker>
</defs>
<!-- title -->
<text x="400" y="24" class="ti">Reproduce → measure → fix → measure again</text>
<!-- step 1 -->
<rect x="25" y="50" width="115" height="60" rx="6" class="box"/>
<text x="82" y="75" class="tx">1 Reproduce</text>
<text x="82" y="93" class="mut">--release, 1M pts</text>
<path d="M140,80 L150,80" class="ln" marker-end="url(#lo10b-arrow)"/>
<!-- step 2 -->
<rect x="152" y="50" width="115" height="60" rx="6" class="boxac"/>
<text x="209" y="75" class="tx">2 perf stat</text>
<text x="209" y="93" class="mut">is it cache?</text>
<path d="M267,80 L277,80" class="ln" marker-end="url(#lo10b-arrow)"/>
<!-- step 3 -->
<rect x="279" y="50" width="115" height="60" rx="6" class="box"/>
<text x="336" y="75" class="tx">3 flamegraph</text>
<text x="336" y="93" class="mut">which function?</text>
<path d="M394,80 L404,80" class="ln" marker-end="url(#lo10b-arrow)"/>
<!-- step 4 -->
<rect x="406" y="50" width="115" height="60" rx="6" class="box"/>
<text x="463" y="75" class="tx">4 criterion</text>
<text x="463" y="93" class="mut">baseline 50ms</text>
<path d="M521,80 L531,80" class="ln" marker-end="url(#lo10b-arrow)"/>
<!-- step 5 -->
<rect x="533" y="50" width="115" height="60" rx="6" class="box"/>
<text x="590" y="75" class="tx">5 Optimize</text>
<text x="590" y="93" class="mut">AoS → SoA</text>
<path d="M648,80 L658,80" class="ln" marker-end="url(#lo10b-arrow)"/>
<!-- step 6 -->
<rect x="660" y="50" width="115" height="60" rx="6" class="box"/>
<text x="717" y="75" class="tx">6 Verify</text>
<text x="717" y="93" class="mut">1% misses, 40ms</text>
<!-- feedback loop -->
<path d="M717,110 L717,170 L209,170 L209,112" class="lnac" marker-end="url(#lo10b-arrowac)"/>
<text x="463" y="188" class="ac">still above 1–2%? go round again</text>
<!-- footer -->
<text x="400" y="222" class="mut">Each step answers a different question — never optimize before step 2 proves it is cache-bound</text>
</svg>
</div>

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
