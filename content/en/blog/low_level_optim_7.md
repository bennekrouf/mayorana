---
id: allocation-avoidance-real-time-rust
title: 'Avoiding heap allocation on a real-time path'
slug: allocation-avoidance-real-time-rust
locale: en
author: mayo
excerpt: >-
  Leveraging Rust's stack-based features like fixed-size arrays and Option to
  eliminate heap allocations in real-time systems for predictable, low-latency
  execution

tags:
  - rust
  - performance
date: '2025-08-27'
---

# Avoiding heap allocation on a real-time path

In a real-time system, heap allocations via Box, Vec, or other dynamic structures introduce latency due to memory management overhead and potential garbage collection pauses (though Rust avoids GC, allocation/deallocation still varies). I'd use Rust's stack-based features like fixed-size arrays, Option, and custom structs to eliminate these in a performance-critical path, ensuring predictable, low-latency execution.

<div class="svg-container" style="margin:2rem 0;">
<svg class="lo7-fig" viewBox="0 0 800 230" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="A fixed-size stack array with a wrapping write index replaces a heap Vec that risks reallocation and shifting">
<!-- style -->
<style>
.lo7-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .lo7-fig,[data-theme="dark"] .lo7-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.lo7-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.lo7-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.lo7-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.lo7-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.lo7-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.lo7-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="lo7arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
</defs>
<!-- top: heap vec -->
<text x="40" y="30" class="ti">Vec&lt;f32&gt; on the heap</text>
<rect x="40" y="42" width="720" height="40" rx="5" class="box"/>
<text x="400" y="66" text-anchor="middle" class="tx">heap buffer — push() may reallocate + shift on overflow</text>
<!-- bottom: fixed array ring -->
<text x="40" y="128" class="ti">[f32; 64] on the stack — circular write via index % 64</text>
<rect x="40" y="140" width="720" height="46" rx="5" class="boxac"/>
<text x="140" y="167" text-anchor="middle" class="tx">…</text>
<circle cx="240" cy="163" r="4" fill="var(--mut)"/>
<circle cx="400" cy="163" r="4" fill="var(--mut)"/>
<rect x="470" y="146" width="46" height="34" rx="4" class="box" stroke="var(--ac)"/>
<text x="493" y="167" text-anchor="middle" class="tx">idx</text>
<path d="M493,180 L493,200 L120,200 L120,186" class="ln" marker-end="url(#lo7arrow)"/>
<text x="120" y="216" text-anchor="middle" class="mut">wraps to 0 — no allocation, ever</text>
</svg>
</div>

## Example Scenario: Replacing a Dynamic Buffer

Suppose I'm building a real-time audio processor that handles 64-sample chunks. A naive implementation might use a Vec:

```rust
struct AudioProcessor {
    buffer: Vec<f32>, // Heap-allocated, resizable
}

impl AudioProcessor {
    fn new() -> Self {
        AudioProcessor { buffer: vec![0.0; 64] } // Allocates on heap
    }

    fn process(&mut self, input: f32) {
        self.buffer.push(input); // Reallocates if full
        if self.buffer.len() > 64 { self.buffer.remove(0); }
    }
}
```

This works but risks latency spikes from reallocation or shifting elements.

## Stack-Based Alternative

I'd replace Vec with a fixed-size array and a circular buffer approach, all on the stack:

```rust
struct AudioProcessor {
    buffer: [f32; 64], // Stack-allocated, fixed size
    index: usize,      // Current write position
}

impl AudioProcessor {
    fn new() -> Self {
        AudioProcessor {
            buffer: [0.0; 64], // Zero-initialized on stack
            index: 0,
        }
    }

    fn process(&mut self, input: f32) {
        self.buffer[self.index] = input;         // No allocation
        self.index = (self.index + 1) % 64;      // Wrap around
    }

    fn get_sample(&self, offset: usize) -> Option<f32> {
        let read_idx = (self.index.wrapping_sub(offset + 1)) % 64;
        Some(self.buffer[read_idx]) // Stack access, no heap
    }
}
```

- **Fixed-Size Array**: `[f32; 64]` allocates 64 floats (256 bytes) on the stack at compile time—no runtime allocation.
- **Circular Indexing**: `index` tracks the write position, wrapping with modulo—no shifting or resizing.
- **Option**: `get_sample` returns `Option<f32>` to safely handle access without heap-based error types.

## How It Eliminates Allocations

- **No Heap**: The array is stack-allocated, fixed at compile time. No calls to malloc or free.
- **Determinism**: Writes and reads are O(1) with predictable cycles—no reallocation or deallocation delays.
- **Size Known**: 64 elements fit the real-time constraint (e.g., a 1ms audio frame at 64kHz), avoiding dynamic resizing.

<div class="svg-container" style="margin:2rem 0;">
<svg class="lo7b-fig" viewBox="0 0 800 300" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Per-call latency over twelve process calls: the Vec version spikes past the one millisecond deadline on each reallocation, the fixed array version stays flat">
<style>
.lo7b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .lo7b-fig,[data-theme="dark"] .lo7b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.lo7b-fig .bar{fill:var(--bg);stroke:var(--mut);stroke-width:1.5}
.lo7b-fig .barac{fill:var(--box);stroke:var(--ac);stroke-width:2.5}
.lo7b-fig .ax{stroke:var(--mut);stroke-width:1.5}
.lo7b-fig .dl{stroke:var(--ac);stroke-width:1.5;stroke-dasharray:5 4}
.lo7b-fig .ti{fill:var(--tx);font:700 13px ui-sans-serif,system-ui,sans-serif}
.lo7b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.lo7b-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif}
.lo7b-fig .ac{fill:var(--ac);font:700 12px ui-sans-serif,system-ui,sans-serif}
</style>
<!-- chart 1: Vec -->
<text x="40" y="26" class="ti">Vec&lt;f32&gt; — latency of 12 consecutive process() calls</text>
<line x1="50" y1="75" x2="560" y2="75" class="dl"/>
<text x="52" y="70" class="ac">1 ms frame deadline</text>
<rect x="60" y="116" width="24" height="14" class="bar"/>
<rect x="100" y="118" width="24" height="12" class="bar"/>
<rect x="140" y="117" width="24" height="13" class="bar"/>
<rect x="180" y="60" width="24" height="70" class="barac"/>
<rect x="220" y="118" width="24" height="12" class="bar"/>
<rect x="260" y="116" width="24" height="14" class="bar"/>
<rect x="300" y="118" width="24" height="12" class="bar"/>
<rect x="340" y="117" width="24" height="13" class="bar"/>
<rect x="380" y="118" width="24" height="12" class="bar"/>
<rect x="420" y="45" width="24" height="85" class="barac"/>
<rect x="460" y="117" width="24" height="13" class="bar"/>
<rect x="500" y="118" width="24" height="12" class="bar"/>
<line x1="50" y1="130" x2="560" y2="130" class="ax"/>
<text x="50" y="147" class="mut">call 1 → 12</text>
<text x="600" y="60" class="ac">2 reallocations</text>
<text x="600" y="80" class="mut">malloc + memcpy + free</text>
<text x="600" y="100" class="mut">deadline missed twice</text>
<text x="600" y="120" class="mut">audible glitch</text>
<!-- chart 2: fixed array -->
<text x="40" y="172" class="ti">[f32; 64] on the stack — same 12 calls</text>
<line x1="50" y1="215" x2="560" y2="215" class="dl"/>
<text x="52" y="210" class="ac">1 ms frame deadline</text>
<rect x="60" y="258" width="24" height="12" class="bar"/>
<rect x="100" y="257" width="24" height="13" class="bar"/>
<rect x="140" y="258" width="24" height="12" class="bar"/>
<rect x="180" y="258" width="24" height="12" class="bar"/>
<rect x="220" y="257" width="24" height="13" class="bar"/>
<rect x="260" y="258" width="24" height="12" class="bar"/>
<rect x="300" y="258" width="24" height="12" class="bar"/>
<rect x="340" y="257" width="24" height="13" class="bar"/>
<rect x="380" y="258" width="24" height="12" class="bar"/>
<rect x="420" y="258" width="24" height="12" class="bar"/>
<rect x="460" y="257" width="24" height="13" class="bar"/>
<rect x="500" y="258" width="24" height="12" class="bar"/>
<line x1="50" y1="270" x2="560" y2="270" class="ax"/>
<text x="50" y="287" class="mut">call 1 → 12</text>
<text x="600" y="240" class="tx">0 allocations</text>
<text x="600" y="260" class="mut">one store + one modulo</text>
<text x="600" y="280" class="mut">worst case = average case</text>
</svg>
</div>

## Ensuring Safety

- **Bounds Safety**: The modulo operation (`% 64`) ensures index stays within [0, 63]. Rust's array indexing panics on out-of-bounds in debug mode, catching errors early.
- **Lifetime Control**: Stack allocation ties the buffer's lifetime to AudioProcessor, avoiding dangling references.
- **No Overflow**: For small arrays (256 bytes here), stack overflow is unlikely on typical 1MB thread stacks. For larger sizes, I'd verify against the target's stack limit (e.g., `ulimit -s`).

## Maintaining Performance

- **Cache Locality**: The contiguous `[f32; 64]` fits in L1 cache (typically 32KB), faster than a heap-allocated Vec with potential fragmentation.
- **No Overhead**: No pointer indirection or allocation bookkeeping—just direct memory access.
- **Inlining**: Small methods like `process` are easily inlined by the compiler, minimizing function call cost.

## Trade-Offs and Enhancements

- **Fixed Capacity**: If 64 samples isn't enough, I'd adjust the size (e.g., `[f32; 128]`) at the cost of more stack space, or use a hybrid approach with a pre-allocated `Box<[f32]>` if stack limits are a concern.
- **Flexibility Loss**: No resizing, but real-time systems often prioritize predictability over adaptability.
- **Custom Stack Structures**: For complex needs (e.g., a stack-allocated queue), I'd use a struct with arrays and indices, avoiding VecDeque's heap use.

## Confirming there are no allocations
### Benchmarking

Use criterion to measure latency:

```rust
use criterion::{black_box, Criterion};
fn bench(c: &mut Criterion) {
    let mut proc = AudioProcessor::new();
    c.bench_function("stack_process", |b| b.iter(|| proc.process(black_box(1.0))));
}
```

Expect consistent, sub-microsecond times vs. Vec's occasional spikes.

### Profiling

- **perf stat -e cycles** confirms no allocation-related stalls.
- **Stack Usage**: Check binary size or use `#[inline(never)]` on a wrapper to inspect stack frame with gdb.

I'd replace heap allocations with stack-based arrays and indices, as in this audio processor, ensuring zero-latency overhead in a real-time path. Rust's type system and compile-time sizing guarantee safety, while tight loops and cache-friendly access maintain performance. This approach delivers deterministic behavior critical for real-time applications, with profiling validating the win.
