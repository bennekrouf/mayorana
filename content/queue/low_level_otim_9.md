---
id: cache-line-awareness-optimization
title: "Align data structures to cache lines"
slug: cache-line-awareness-optimization
author: mayo
excerpt: >-
  Designing cache-aligned data structures in multi-threaded Rust applications to prevent false sharing and optimize performance for large dataset processing
content_focus: "low-level optimization in Rust"
technical_level: "Expert technical discussion"
category: rust
tags:
  - rust
  - optimization
  - cache-alignment
  - false-sharing
  - multi-threading
  - performance
---

# Cache Line Awareness: Suppose you're optimizing a multi-threaded Rust application that processes large datasets. How would you align data structures to cache lines, and what Rust features or techniques would you use to minimize false sharing?

In a multi-threaded Rust application processing large datasets, cache line awareness is key to maximizing performance. CPU cache lines (typically 64 bytes on modern x86_64 and ARM) dictate how data is fetched, and false sharing—where threads modify adjacent data on the same cache line—can tank throughput due to constant cache invalidation. I'd align data structures to cache lines and use Rust's features to eliminate false sharing, optimizing a multi-threaded workload.

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

## Verification

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

## Conclusion

I'd align data with `#[repr(align(64))]` and pad to 64 bytes, as in this counter example, ensuring each thread operates on its own cache line. Rust's type system and attributes make this precise and safe, while profiling with perf validates reduced cache misses. This eliminates false sharing, unlocking true parallelism in a multi-threaded dataset processor.
