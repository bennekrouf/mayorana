---
id: vec-push-vs-with-capacity-performance
title: 'Vec::push() in a loop vs. pre-allocating with Vec::with_capacity()?'
slug: vec-push-vs-with-capacity-performance
locale: en
author: mayo
excerpt: >-
  Comparing performance of Vec::push() in loops versus pre-allocating with
  Vec::with_capacity(), analyzing memory reallocation costs and optimization
  strategies
content_focus: 'collections (like Vec), iterators (into_iter, collect), and related concepts'
technical_level: Expert technical discussion

tags:
  - rust
  - performance
  - advanced
date: '2025-08-27'
---

# What is the performance impact of using Vec::push() in a loop vs. pre-allocating with Vec::with_capacity()?

<div class="svg-container" style="margin:2rem 0;">
<svg class="lo6-fig" viewBox="0 0 800 240" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Vec::new() grows by repeated doubling and copying, while Vec::with_capacity(n) allocates the final size once">
<!-- style -->
<style>
.lo6-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .lo6-fig,[data-theme="dark"] .lo6-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.lo6-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.lo6-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.lo6-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.lo6-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.lo6-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.lo6-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="lo6arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
</defs>
<!-- top lane -->
<text x="40" y="30" class="ti">Vec::new() — 4 reallocations for 10 elements</text>
<rect x="40" y="42" width="60" height="40" rx="5" class="box"/><text x="70" y="66" text-anchor="middle" class="tx">0</text>
<path d="M100,62 L128,62" class="ln" marker-end="url(#lo6arrow)"/>
<rect x="130" y="42" width="80" height="40" rx="5" class="box"/><text x="170" y="66" text-anchor="middle" class="tx">4</text>
<path d="M210,62 L238,62" class="ln" marker-end="url(#lo6arrow)"/>
<rect x="240" y="42" width="110" height="40" rx="5" class="box"/><text x="295" y="66" text-anchor="middle" class="tx">8</text>
<path d="M350,62 L378,62" class="ln" marker-end="url(#lo6arrow)"/>
<rect x="380" y="42" width="150" height="40" rx="5" class="box"/><text x="455" y="66" text-anchor="middle" class="tx">16</text>
<text x="600" y="66" class="mut">copy + free each time</text>
<!-- bottom lane -->
<text x="40" y="140" class="ti">Vec::with_capacity(10) — 1 allocation</text>
<rect x="40" y="152" width="490" height="40" rx="5" class="boxac"/>
<text x="285" y="176" text-anchor="middle" class="tx">10 (allocated upfront)</text>
<text x="600" y="176" class="mut">no copies, no frees</text>
<!-- caption -->
<text x="40" y="222" class="mut">Same 10 pushes — with_capacity() is ~4.5x faster in benchmarks</text>
</svg>
</div>

## Key Performance Differences

| Vec::push() in a Loop | Vec::with_capacity() + push() |
|----------------------|-------------------------------|
| Reallocates memory multiple times (grows exponentially). | Allocates once upfront. |
| O(n log n) time complexity (amortized). | O(n) time complexity. |
| May fragment memory due to repeated allocations. | Single contiguous block of memory. |

## Why Reallocations Are Costly

### Growth Strategy
- A Vec starts with capacity 0 and doubles its capacity when full (e.g., 0 → 4 → 8 → 16...).
- Each reallocation involves:
  - Allocating new memory.
  - Copying all existing elements.
  - Freeing the old memory.

### Example for 10 Elements
- **push() with Vec::new()**: 4 reallocations (capacity 0 → 4 → 8 → 16).
- **push() with with_capacity(10)**: 0 reallocations.

<div class="svg-container" style="margin:2rem 0;">
<svg class="lo6b-fig" viewBox="0 0 800 245" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Layout of a Vec after ten pushes: a stack struct of ptr, len and cap pointing at a heap buffer of sixteen slots, ten initialized and six reserved but unused">
<style>
.lo6b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .lo6b-fig,[data-theme="dark"] .lo6b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.lo6b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.lo6b-fig .fin{fill:var(--box);stroke:var(--ac);stroke-width:2.5}
.lo6b-fig .used{fill:var(--bg);stroke:var(--mut);stroke-width:1.5}
.lo6b-fig .spare{fill:none;stroke:var(--ln);stroke-width:1.5;stroke-dasharray:3 3}
.lo6b-fig .hd{fill:var(--mut);font:700 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo6b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo6b-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo6b-fig .ac{fill:var(--ac);font:700 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo6b-fig line,.lo6b-fig path.ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.lo6b-fig line.acln{stroke:var(--ac)}
</style>
<defs>
<marker id="lo6b-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"/>
</marker>
</defs>
<!-- stack side -->
<text x="120" y="32" class="hd">On the stack — 24 bytes</text>
<rect x="30" y="40" width="180" height="110" rx="6" class="box"/>
<rect x="42" y="52" width="156" height="26" rx="4" class="used"/>
<text x="120" y="70" class="tx">ptr</text>
<rect x="42" y="84" width="156" height="26" rx="4" class="used"/>
<text x="120" y="102" class="tx">len = 10</text>
<rect x="42" y="116" width="156" height="26" rx="4" class="used"/>
<text x="120" y="134" class="tx">cap = 16</text>
<!-- ptr into the heap buffer -->
<line x1="210" y1="65" x2="278" y2="65" marker-end="url(#lo6b-arrow)"/>
<!-- heap buffer: 16 slots, 10 initialized -->
<text x="519" y="32" class="hd">On the heap — one 64-byte block</text>
<rect x="280" y="52" width="28" height="40" rx="3" class="used"/>
<rect x="310" y="52" width="28" height="40" rx="3" class="used"/>
<rect x="340" y="52" width="28" height="40" rx="3" class="used"/>
<rect x="370" y="52" width="28" height="40" rx="3" class="used"/>
<rect x="400" y="52" width="28" height="40" rx="3" class="used"/>
<rect x="430" y="52" width="28" height="40" rx="3" class="used"/>
<rect x="460" y="52" width="28" height="40" rx="3" class="used"/>
<rect x="490" y="52" width="28" height="40" rx="3" class="used"/>
<rect x="520" y="52" width="28" height="40" rx="3" class="used"/>
<rect x="550" y="52" width="28" height="40" rx="3" class="used"/>
<rect x="580" y="52" width="28" height="40" rx="3" class="spare"/>
<rect x="610" y="52" width="28" height="40" rx="3" class="spare"/>
<rect x="640" y="52" width="28" height="40" rx="3" class="spare"/>
<rect x="670" y="52" width="28" height="40" rx="3" class="spare"/>
<rect x="700" y="52" width="28" height="40" rx="3" class="spare"/>
<rect x="730" y="52" width="28" height="40" rx="3" class="spare"/>
<!-- brackets -->
<line x1="281" y1="102" x2="577" y2="102"/>
<text x="429" y="118" class="tx">len = 10 — initialized</text>
<line x1="581" y1="102" x2="757" y2="102" class="acln"/>
<text x="669" y="118" class="ac">6 slots reserved, unused</text>
<!-- routes to the two outcomes -->
<path class="ln" d="M429,126 L429,146 L255,146"/>
<line x1="255" y1="146" x2="255" y2="163" marker-end="url(#lo6b-arrow)"/>
<path class="ln" d="M669,126 L669,146 L565,146"/>
<line x1="565" y1="146" x2="565" y2="163" marker-end="url(#lo6b-arrow)"/>
<rect x="110" y="165" width="290" height="66" rx="6" class="box"/>
<text x="255" y="188" class="tx">11th push() lands in spare capacity</text>
<text x="255" y="207" class="mut">no allocator call, no memcpy</text>
<text x="255" y="224" class="mut">this is the amortized-O(1) case</text>
<rect x="420" y="165" width="290" height="66" rx="6" class="fin"/>
<text x="565" y="188" class="ac">shrink_to_fit()</text>
<text x="565" y="207" class="mut">reallocates down to cap = 10</text>
<text x="565" y="224" class="mut">pays one copy to reclaim 24 bytes</text>
</svg>
</div>

## Benchmark Comparison

```rust
use std::time::Instant;

fn main() {
    // Test with 1 million elements
    let n = 1_000_000;
    
    // Method 1: No pre-allocation
    let start = Instant::now();
    let mut v1 = Vec::new();
    for i in 0..n {
        v1.push(i);
    }
    println!("Vec::new(): {:?}", start.elapsed());
    
    // Method 2: Pre-allocate
    let start = Instant::now();
    let mut v2 = Vec::with_capacity(n);
    for i in 0..n {
        v2.push(i);
    }
    println!("Vec::with_capacity(): {:?}", start.elapsed());
}
```

### Typical Results
```
Vec::new(): 1.8ms  
Vec::with_capacity(): 0.4ms  // 4.5x faster
```

## When to Pre-Allocate

- **Known Size**: Use with_capacity(n) if you know the exact/maximum number of elements.
- **Performance-Critical Code**: Avoid reallocations in hot loops.
- **Large Data**: Prevent stack overflow for huge collections.

## When Vec::new() is Acceptable

- **Small/Unknown Sizes**: For ad-hoc usage or short-lived vectors.
- **Code Simplicity**: When performance isn't critical.

## Advanced Optimization: extend()

If you have an iterator, extend() is often faster than a loop with push():

```rust
let mut v = Vec::with_capacity(n);
v.extend(0..n);  // Optimized for iterators (avoids bounds checks)
```

## Key Takeaways

✅ **Use with_capacity() for**:
- Predictable element counts.
- High-performance scenarios.

✅ **Use Vec::new() for**:
- Small/unknown sizes or prototyping.

🚀 **Avoid unnecessary reallocations**—they dominate runtime for large Vecs.

## Real-World Impact

In the regex crate, pre-allocation is used for capture groups to avoid reallocations during pattern matching.

**Try This**: What happens if you pre-allocate too much (e.g., with_capacity(1000) but only use 10 elements)?

**Answer**: Wasted memory. Use shrink_to_fit() to release unused capacity.
