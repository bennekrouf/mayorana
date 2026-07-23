---
id: dispatch-performance-rust
title: 'fn process<T: MyTrait>(x: T)) VS using dyn MyTrait for dynamic dispatch.'
slug: dispatch-performance-rust
locale: en
date: '2025-08-12'
author: mayo
excerpt: Static vs. Dynamic Dispatch
content_focus: Static vs. Dynamic Dispatch
technical_level: Expert technical discussion

tags:
  - rust
  - dispatch
  - generics
  - performance
  - traits
---

# What’s the performance trade-off between using a generic function with a trait bound (e.g., fn process<T: MyTrait>(x: T)) versus using dyn MyTrait for dynamic dispatch, and in what scenarios would you prefer one over the other?

In Rust, **static dispatch** (via generics with trait bounds) and **dynamic dispatch** (via `dyn Trait`) offer distinct performance profiles, critical for systems like real-time data processors. Static dispatch leverages monomorphization for speed, while dynamic dispatch uses vtables for flexibility. Below, I compare the two with an example and outline when to choose each based on performance, flexibility, and maintainability.

<div class="svg-container" style="margin:2rem 0;">
<svg class="td3-fig" viewBox="0 0 800 320" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Per-event call sequence for process_static versus process_dynamic over 1 million events">
<style>
.td3-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .td3-fig,[data-theme="dark"] .td3-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.td3-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.td3-fig .boxAc{fill:var(--box);stroke:var(--ac);stroke-width:2}
.td3-fig .lane{stroke:var(--ln);stroke-width:1.5;stroke-dasharray:4 3}
.td3-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td3-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td3-fig .mut{fill:var(--mut);font:600 11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td3-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- markers -->
<defs>
<marker id="td3-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
</defs>
<!-- lane titles -->
<text x="200" y="26" class="ti">process_static::&lt;T&gt;()</text>
<text x="600" y="26" class="ti">process_dynamic(&amp;mut dyn T)</text>
<!-- static lane -->
<line class="lane" x1="200" y1="40" x2="200" y2="270"/>
<rect class="box" x="90" y="45" width="220" height="40" rx="6"/>
<text x="200" y="70" class="tx">event loop, per item</text>
<path class="ln" d="M200,85 L200,111" marker-end="url(#td3-arrow)"/>
<rect class="boxAc" x="90" y="112" width="220" height="40" rx="6"/>
<text x="200" y="137" class="tx">inlined add, no call</text>
<path class="ln" d="M200,152 L200,178" marker-end="url(#td3-arrow)"/>
<rect class="box" x="90" y="179" width="220" height="40" rx="6"/>
<text x="200" y="204" class="tx">loop unrolled / SIMD</text>
<text x="200" y="230" class="mut">1M events ≈ 1ms</text>
<!-- dynamic lane -->
<line class="lane" x1="600" y1="40" x2="600" y2="270"/>
<rect class="box" x="490" y="45" width="220" height="40" rx="6"/>
<text x="600" y="70" class="tx">event loop, per item</text>
<path class="ln" d="M600,85 L600,111" marker-end="url(#td3-arrow)"/>
<rect class="box" x="490" y="112" width="220" height="40" rx="6"/>
<text x="600" y="137" class="tx">load vtable ptr</text>
<path class="ln" d="M600,152 L600,178" marker-end="url(#td3-arrow)"/>
<rect class="box" x="490" y="179" width="220" height="40" rx="6"/>
<text x="600" y="204" class="tx">indirect call [rax]</text>
<text x="600" y="230" class="mut">1M events ≈ 1.2ms</text>
<!-- caption -->
<text x="400" y="300" class="mut">Same loop, two dispatch paths: inlined arithmetic vs vtable indirection each iteration</text>
</svg>
</div>

## Example: Event Processor

Consider a system processing events (e.g., sensor readings, network packets):

```rust
trait EventProcessor {
    fn process(&mut self, event: u32) -> u32;
}

struct FastProcessor { total: u32 }
struct LogProcessor { count: u32 }

impl EventProcessor for FastProcessor {
    fn process(&mut self, event: u32) -> u32 {
        self.total += event;
        self.total
    }
}

impl EventProcessor for LogProcessor {
    fn process(&mut self, event: u32) -> u32 {
        self.count += 1;
        self.count
    }
}
```

### Static Dispatch Version

```rust
fn process_static<T: EventProcessor>(processor: &mut T, events: &[u32]) -> u32 {
    let mut result = 0;
    for &event in events {
        result = processor.process(event);
    }
    result
}

// Usage
fn main() {
    let mut fast = FastProcessor { total: 0 };
    let events = vec![1, 2, 3];
    let total = process_static(&mut fast, &events); // 6
    println!("{}", total);
}
```

### Dynamic Dispatch Version

```rust
fn process_dynamic(processor: &mut dyn EventProcessor, events: &[u32]) -> u32 {
    let mut result = 0;
    for &event in events {
        result = processor.process(event);
    }
    result
}

// Usage
fn main() {
    let mut fast = FastProcessor { total: 0 };
    let events = vec![1, 2, 3];
    let total = process_dynamic(&mut fast, &events); // 6
    let mut log = LogProcessor { count: 0 };
    let count = process_dynamic(&mut log, &events); // 3
    println!("{} {}", total, count);
}
```

## Performance Trade-Offs

### Static Dispatch

- **Mechanism**: The compiler monomorphizes `process_static` for each type (e.g., `FastProcessor`, `LogProcessor`), creating separate functions like `process_static_fast` and `process_static_log`.
- **Speed**: No runtime overhead—calls to `process` are inlined, enabling optimizations (e.g., loop unrolling, constant folding). On x86_64, this might compile to a tight `add` loop with no jumps.
- **Cost**: Larger binary size (e.g., ~100 bytes per monomorphized function). For 10 processor types, that’s ~1KB extra in `.text`.
- **Assembly Example**:
  ```asm
  ; process_static<FastProcessor>
  xor eax, eax      ; result = 0
  loop:
    add eax, [rsi]  ; total += event
    add rsi, 4
    dec rcx
    jnz loop
  ```

### Dynamic Dispatch

- **Mechanism**: `dyn EventProcessor` uses a vtable—a pointer to the type’s method table—stored with the object (e.g., `Box<dyn EventProcessor>` is 16 bytes: 8 for data, 8 for vtable).
- **Speed**: Slower due to indirect calls through the vtable (1-2 cycles per call on x86_64) and no inlining across type boundaries. Cache misses on vtable access add latency.
- **Cost**: Smaller binary—one `process_dynamic` function (e.g., 50 bytes) works for all types. Total size stays constant regardless of processor count.
- **Assembly Example**:
  ```asm
  ; process_dynamic
  loop:
    mov rax, [rdi+8]   ; Load vtable ptr
    call [rax]         ; Indirect call to process
    add rsi, 4
    dec rcx
    jnz loop
  ```
- **Quantified**: For 1M events, static might take 1ms (pure arithmetic), while dynamic takes 1.2ms (vtable overhead + no fusion). A 20% difference matters in real-time.

## Scenarios and Preferences

### Choose Static Dispatch

- **Scenario**: Hot loops in a real-time data processor (e.g., audio filtering, packet routing) where every cycle counts.
- **Why**: Zero overhead, inlining, and optimization potential. In `process_static`, the compiler can unroll or SIMD-ify the loop for `f32` events.
- **Trade-Off**: Larger binary, but acceptable for a known, small set of processors (e.g., 2-5 types).
- **Maintainability**: Less flexible—adding a new processor requires recompilation.

### Choose Dynamic Dispatch

- **Scenario**: Plugin system or runtime-configurable processors (e.g., users load `EventProcessor` implementations dynamically).
- **Why**: Flexibility—`dyn EventProcessor` allows a single function to handle any type without recompiling. Binary size stays manageable with many processors.
- **Trade-Off**: Slower runtime, but acceptable if `process` is complex (call overhead is a smaller fraction) or invocation is infrequent.
- **Maintainability**: Easier to extend—new types just implement the trait.

## Verification

- **Benchmark**:
  ```rust
  use criterion::{black_box, Criterion};
  fn bench(c: &mut Criterion) {
      let events = vec![1; 1000];
      let mut fast = FastProcessor { total: 0 };
      c.bench_function("static", |b| b.iter(|| process_static(black_box(&mut fast), black_box(&events))));
      c.bench_function("dynamic", |b| b.iter(|| process_dynamic(black_box(&mut fast), black_box(&events))));
  }
  ```
  Expect static to be 10-20% faster.
- **Size**: `size target/release/app` shows static bloating `.text` per type.

## Conclusion

In a real-time data processor, prefer static dispatch (`process_static`) for hot paths, trading code size for speed and inlining. For flexibility (e.g., pluggable processors), use `dyn EventProcessor`, accepting vtable costs. Profile to ensure static’s gains justify its footprint, balancing performance with system design goals.
