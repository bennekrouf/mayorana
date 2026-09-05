---
id: cache-line-awareness-optimization
title: Align data structures to cache lines
slug: cache-line-awareness-optimization
locale: en
author: mayo
excerpt: >-
  Designing cache-aligned data structures in multi-threaded Rust applications to
  prevent false sharing and optimize performance for large dataset processing
tags:
  - rust
  - optimization
  - advanced
date: '2025-11-04'
---

# Align data structures to cache lines

In a multi-threaded Rust application processing large datasets, cache line awareness is key to maximizing performance. CPU cache lines (typically 64 bytes on modern x86_64 and ARM) dictate how data is fetched, and false sharing—where threads modify adjacent data on the same cache line—can tank throughput due to constant cache invalidation. I'd align data structures to cache lines and use Rust's features to eliminate false sharing, optimizing a multi-threaded workload.

<div class="svg-container" style="margin:2rem 0;">
<svg class="lo9-fig" viewBox="0 0 800 240" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Four naive counters packed into one 64-byte cache line cause false sharing, while padding each counter to its own cache line isolates them">
<!-- style -->
<style>
.lo9-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .lo9-fig,[data-theme="dark"] .lo9-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.lo9-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.lo9-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.lo9-fig .bad{fill:var(--box);stroke:#e11d48;stroke-width:1.5}
.lo9-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.lo9-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.lo9-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
</style>
<!-- top: naive, one cache line -->
<text x="40" y="30" class="ti">Naive — 4 counters share one 64-byte cache line</text>
<rect x="40" y="42" width="720" height="46" rx="5" class="bad"/>
<line x1="220" y1="42" x2="220" y2="88" stroke="var(--ln)" stroke-width="1"/>
<line x1="400" y1="42" x2="400" y2="88" stroke="var(--ln)" stroke-width="1"/>
<line x1="580" y1="42" x2="580" y2="88" stroke="var(--ln)" stroke-width="1"/>
<text x="130" y="70" text-anchor="middle" class="tx">T0</text>
<text x="310" y="70" text-anchor="middle" class="tx">T1</text>
<text x="490" y="70" text-anchor="middle" class="tx">T2</text>
<text x="670" y="70" text-anchor="middle" class="tx">T3</text>
<text x="40" y="106" class="mut">any thread's write invalidates the whole line for the others</text>
<!-- bottom: aligned, 4 separate lines -->
<text x="40" y="150" class="ti">#[repr(align(64))] + padding — one cache line each</text>
<rect x="40" y="162" width="170" height="46" rx="5" class="boxac"/>
<text x="125" y="190" text-anchor="middle" class="tx">T0 + pad</text>
<rect x="223" y="162" width="170" height="46" rx="5" class="boxac"/>
<text x="308" y="190" text-anchor="middle" class="tx">T1 + pad</text>
<rect x="406" y="162" width="170" height="46" rx="5" class="boxac"/>
<text x="491" y="190" text-anchor="middle" class="tx">T2 + pad</text>
<rect x="589" y="162" width="170" height="46" rx="5" class="boxac"/>
<text x="674" y="190" text-anchor="middle" class="tx">T3 + pad</text>
<text x="40" y="226" class="mut">64 bytes apart — writes stay local, no invalidation</text>
</svg>
</div>

## Designing Cache-Aligned Structures

- **Alignment**: Ensure each thread's data starts on a new cache line using `#[repr(align(64))]`.
- **Padding**: Add dummy bytes to separate thread-local data, preventing overlap.
- **Separation**: Split shared data into per-thread chunks, accessed independently.

### Example: A multi-threaded counter where each thread increments its own tally:

```rust
use std::sync::atomic::{AtomicU64, Ordering};
use std::thread;

// Naive: False sharing likely
struct Counters {
    counts: [AtomicU64; 4], // 4 threads, 8 bytes each = 32 bytes
}

impl Counters {
    fn new() -> Self {
        Counters {
            counts: [AtomicU64::new(0), AtomicU64::new(0), AtomicU64::new(0), AtomicU64::new(0)],
        }
    }
}
```

**Problem**: `counts` is 32 bytes, fitting in one 64-byte cache line. If Thread 0 updates `counts[0]` and Thread 1 updates `counts[1]`, they thrash the same line, serializing access.

<div class="svg-container" style="margin:2rem 0;">
<svg class="lo9b-fig" viewBox="0 0 800 290" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Four-step timeline of one cache line ping-ponging between two cores: each fetch_add moves the line to Modified on one core and invalidates the other core's copy">
<style>
.lo9b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .lo9b-fig,[data-theme="dark"] .lo9b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.lo9b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.lo9b-fig .st{fill:var(--bg);stroke:var(--mut);stroke-width:1.5}
.lo9b-fig .m{fill:var(--box);stroke:var(--ac);stroke-width:2.5}
.lo9b-fig .inv{fill:none;stroke:var(--ln);stroke-width:1.5;stroke-dasharray:4 4}
.lo9b-fig .ti{fill:var(--tx);font:700 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo9b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo9b-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo9b-fig .ac{fill:var(--ac);font:700 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo9b-fig line{stroke:var(--ln);stroke-width:1.5}
</style>
<defs>
<marker id="lo9b-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"/>
</marker>
</defs>
<!-- step t1 -->
<rect x="20" y="40" width="175" height="150" rx="6" class="box"/>
<text x="107" y="62" class="ti">t1 · Core 0 fetch_add</text>
<rect x="32" y="72" width="151" height="34" rx="4" class="m"/>
<text x="107" y="93" class="ac">Core 0 — Modified</text>
<rect x="32" y="112" width="151" height="34" rx="4" class="inv"/>
<text x="107" y="133" class="mut">Core 1 — Invalid</text>
<text x="107" y="166" class="mut">line loaded for writing</text>
<text x="107" y="182" class="mut">all 4 counters inside it</text>
<line x1="195" y1="115" x2="213" y2="115" marker-end="url(#lo9b-arrow)"/>
<!-- step t2 -->
<rect x="215" y="40" width="175" height="150" rx="6" class="box"/>
<text x="302" y="62" class="ti">t2 · Core 1 fetch_add</text>
<rect x="227" y="72" width="151" height="34" rx="4" class="inv"/>
<text x="302" y="93" class="mut">Core 0 — Invalid</text>
<rect x="227" y="112" width="151" height="34" rx="4" class="m"/>
<text x="302" y="133" class="ac">Core 1 — Modified</text>
<text x="302" y="166" class="mut">read-for-ownership</text>
<text x="302" y="182" class="mut">steals the whole line</text>
<line x1="390" y1="115" x2="408" y2="115" marker-end="url(#lo9b-arrow)"/>
<!-- step t3 -->
<rect x="410" y="40" width="175" height="150" rx="6" class="box"/>
<text x="497" y="62" class="ti">t3 · Core 0 again</text>
<rect x="422" y="72" width="151" height="34" rx="4" class="m"/>
<text x="497" y="93" class="ac">Core 0 — Modified</text>
<rect x="422" y="112" width="151" height="34" rx="4" class="inv"/>
<text x="497" y="133" class="mut">Core 1 — Invalid</text>
<text x="497" y="166" class="mut">line travels back</text>
<text x="497" y="182" class="mut">Core 1 now stalls</text>
<line x1="585" y1="115" x2="603" y2="115" marker-end="url(#lo9b-arrow)"/>
<!-- step t4 -->
<rect x="605" y="40" width="175" height="150" rx="6" class="box"/>
<text x="692" y="62" class="ti">t4 · and again…</text>
<rect x="617" y="72" width="151" height="34" rx="4" class="st"/>
<text x="692" y="93" class="tx">1M iterations / thread</text>
<rect x="617" y="112" width="151" height="34" rx="4" class="st"/>
<text x="692" y="133" class="tx">millions of transfers</text>
<text x="692" y="166" class="mut">no data is shared —</text>
<text x="692" y="182" class="mut">only the line is</text>
<!-- footer -->
<rect x="120" y="210" width="560" height="60" rx="6" class="box"/>
<text x="400" y="234" class="tx">Relaxed ordering does not help: coherence works per line, not per variable</text>
<text x="400" y="254" class="mut">perf stat -e L1-dcache-load-misses is where this shows up</text>
</svg>
</div>

## Restructured Cache-Aligned Version

```rust
#[repr(align(64))] // Align to 64-byte cache line
struct CacheAlignedCounter {
    count: AtomicU64,      // 8 bytes
    _padding: [u8; 56],    // 56 bytes padding to reach 64
}

struct Counters {
    counts: [CacheAlignedCounter; 4], // 4 threads, 64 bytes each
}

impl Counters {
    fn new() -> Self {
        Counters {
            counts: [
                CacheAlignedCounter { count: AtomicU64::new(0), _padding: [0; 56] },
                CacheAlignedCounter { count: AtomicU64::new(0), _padding: [0; 56] },
                CacheAlignedCounter { count: AtomicU64::new(0), _padding: [0; 56] },
                CacheAlignedCounter { count: AtomicU64::new(0), _padding: [0; 56] },
            ],
        }
    }

    fn run(&self) {
        let mut handles = Vec::new();
        for i in 0..4 {
            let counter = &self.counts[i];
            handles.push(thread::spawn(move || {
                for _ in 0..1_000_000 {
                    counter.count.fetch_add(1, Ordering::Relaxed);
                }
            }));
        }
        for h in handles { h.join().unwrap(); }
    }
}
```

- **Alignment**: `#[repr(align(64))]` ensures each `CacheAlignedCounter` starts on a 64-byte boundary.
- **Padding**: `_padding` fills the struct to 64 bytes, so `counts[1]` is on a new cache line.
- **Result**: Each thread updates its own `count` without invalidating others' cache lines.

## Rust Features and Techniques

### #[repr(align(N))]
Forces struct alignment to a power of 2 (e.g., 64), aligning with cache lines.

### Manual Padding
Arrays or unused fields (e.g., `[u8; 56]`) ensure size matches the cache line, avoiding overlap.

### Per-Thread Data
Use `thread_local!` or an array indexed by thread ID for complete separation:

```rust
thread_local! {
    static MY_COUNTER: AtomicU64 = AtomicU64::new(0);
}
```

**Atomic Operations**: `fetch_add` with `Relaxed` ordering is safe here (no data dependency), minimizing synchronization overhead.

## Preventing False Sharing

- **Separation**: Each count is 64 bytes apart, so Thread 0's writes to `counts[0]` don't invalidate `counts[1]`.
- **Size Check**: `std::mem::size_of::<CacheAlignedCounter>()` returns 64, confirming alignment.
- **Layout**: Avoid packing (e.g., `#[repr(packed)]`) unless explicitly needed—padding is our friend here.

## Confirming it worked
### Profiling with perf
Run `perf stat -e cache-misses,L1-dcache-load-misses ./target/release/app` on both versions:
- **Naive**: High L1-dcache-load-misses (e.g., 10M) due to false sharing.
- **Optimized**: Drops significantly (e.g., 1M), as each thread's cache line stays local.

### Benchmarking

```rust
use criterion::{black_box, Criterion};
fn bench(c: &mut Criterion) {
    let counters = Counters::new();
    c.bench_function("cache_aligned", |b| b.iter(|| black_box(counters.run())));
}
```

Expect 2-5x speedup (e.g., 50ms to 10ms) on a 4-core CPU.

### Memory Layout
`std::mem::align_of::<CacheAlignedCounter>()` confirms 64-byte alignment.

## What to take back to your own code
I'd align data with `#[repr(align(64))]` and pad to 64 bytes, as in this counter example, ensuring each thread operates on its own cache line. Rust's type system and attributes make this precise and safe, while profiling with perf validates reduced cache misses. This eliminates false sharing, unlocking true parallelism in a multi-threaded dataset processor.
