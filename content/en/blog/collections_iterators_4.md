---
id: vec-push-vs-with-capacity-performance-duplicate
title: >-
  What is the performance impact of using Vec::push() in a loop vs.
  pre-allocating with Vec::with_capacity()?
slug: vec-push-vs-with-capacity-performance-duplicate
locale: "en"
author: mayo
excerpt: >-
  Analyzing performance differences between Vec::push() in loops versus
  pre-allocating with Vec::with_capacity(), covering memory reallocation costs
  and optimization strategies

tags:
  - rust
  - collections
date: '2025-07-19'
---

# What is the performance impact of using Vec::push() in a loop vs. pre-allocating with Vec::with_capacity()?

<div class="svg-container" style="margin:2rem 0;">
<svg class="ci4-fig" viewBox="0 0 800 230" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Vec::push() in a loop frees and re-allocates memory blocks repeatedly, fragmenting the heap, while with_capacity() allocates one contiguous block">
<!-- style -->
<style>
.ci4-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .ci4-fig,[data-theme="dark"] .ci4-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.ci4-fig .bg{fill:var(--bg)}
.ci4-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.ci4-fig .ghost{fill:none;stroke:var(--ln);stroke-width:1.5;stroke-dasharray:3 3}
.ci4-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.ci4-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.ci4-fig .title{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.ci4-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif}
.ci4-fig .ac{fill:var(--ac)}
.ci4-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.ci4-fig .acln{stroke:var(--ac);stroke-width:2;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="ci4-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ln)"/></marker>
<marker id="ci4-arrowac" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ac)"/></marker>
</defs>
<!-- bg -->
<rect class="bg" x="0" y="0" width="800" height="230" rx="8"/>
<!-- title -->
<text x="400" y="26" text-anchor="middle" class="title">Growth pattern: push() in a loop vs with_capacity()</text>
<!-- row1: freed ghost blocks -->
<text x="20" y="65" class="tx">push() loop</text>
<rect class="ghost" x="110" y="48" width="30" height="24" rx="4"/>
<text x="125" y="64" text-anchor="middle" class="mut" font-size="9">freed</text>
<rect class="ghost" x="170" y="48" width="60" height="24" rx="4"/>
<text x="200" y="64" text-anchor="middle" class="mut" font-size="9">freed</text>
<rect class="box" x="260" y="42" width="120" height="36" rx="4"/>
<text x="320" y="65" text-anchor="middle" class="tx">contiguous block</text>
<path class="ln" d="M140 60H170" marker-end="url(#ci4-arrow)"/>
<path class="ln" d="M230 60H260" marker-end="url(#ci4-arrow)"/>
<text x="500" y="65" class="mut">scattered allocations → possible fragmentation</text>
<!-- row2: single contiguous block -->
<text x="20" y="140" class="tx">with_capacity(n)</text>
<rect class="acbox" x="110" y="120" width="270" height="36" rx="4"/>
<text x="245" y="143" text-anchor="middle" class="tx ac">one block, sized for n, from the start</text>
<path class="acln" d="M380 138H460" marker-end="url(#ci4-arrowac)"/>
<rect class="box" x="460" y="120" width="130" height="36" rx="4"/>
<text x="525" y="143" text-anchor="middle" class="tx">push × n</text>
<text x="400" y="185" text-anchor="middle" class="mut">push() loop: amortized O(n log n) with repeated copy+free · with_capacity(): O(n), single allocation</text>
<text x="400" y="210" text-anchor="middle" class="mut">Pre-sizing avoids the copy-and-free churn that can fragment the heap</text>
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
<svg class="ci4b-fig" viewBox="0 0 800 210" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Capacity doubles from 0 to 4 to 8 to 16 while pushing ten elements, and each growth step copies the existing elements into the new block">
<!-- style -->
<style>
.ci4b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .ci4b-fig,[data-theme="dark"] .ci4b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.ci4b-fig .bg{fill:var(--bg)}
.ci4b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.ci4b-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.ci4b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.ci4b-fig .title{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.ci4b-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif}
.ci4b-fig .ac{fill:var(--ac)}
.ci4b-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="ci4b-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ln)"/></marker>
</defs>
<!-- bg -->
<rect class="bg" x="0" y="0" width="800" height="210" rx="8"/>
<!-- title -->
<text x="400" y="26" text-anchor="middle" class="title">Capacity timeline: pushing 10 elements onto Vec::new()</text>
<!-- stage 1 -->
<rect class="box" x="40" y="62" width="140" height="40" rx="6"/>
<text x="110" y="87" text-anchor="middle" class="tx">cap 0</text>
<text x="110" y="122" text-anchor="middle" class="mut">no heap block yet</text>
<!-- step 1 to 2 -->
<text x="205" y="76" text-anchor="middle" class="mut" font-size="10">alloc</text>
<path class="ln" d="M180 88H230" marker-end="url(#ci4b-arrow)"/>
<!-- stage 2 -->
<rect class="box" x="230" y="62" width="140" height="40" rx="6"/>
<text x="300" y="87" text-anchor="middle" class="tx">cap 4</text>
<text x="300" y="122" text-anchor="middle" class="mut">pushes 1–4 fit</text>
<!-- step 2 to 3 -->
<text x="395" y="76" text-anchor="middle" class="mut ac" font-size="10">copy 4</text>
<path class="ln" d="M370 88H420" marker-end="url(#ci4b-arrow)"/>
<!-- stage 3 -->
<rect class="box" x="420" y="62" width="140" height="40" rx="6"/>
<text x="490" y="87" text-anchor="middle" class="tx">cap 8</text>
<text x="490" y="122" text-anchor="middle" class="mut">pushes 5–8 fit</text>
<!-- step 3 to 4 -->
<text x="585" y="76" text-anchor="middle" class="mut ac" font-size="10">copy 8</text>
<path class="ln" d="M560 88H610" marker-end="url(#ci4b-arrow)"/>
<!-- stage 4 -->
<rect class="acbox" x="610" y="62" width="140" height="40" rx="6"/>
<text x="680" y="87" text-anchor="middle" class="tx ac">cap 16</text>
<text x="680" y="122" text-anchor="middle" class="mut">pushes 9–10, 6 idle</text>
<!-- footer -->
<text x="400" y="160" text-anchor="middle" class="mut">Every growth step allocates a bigger block, copies the elements already stored, then frees the old block.</text>
<text x="400" y="182" text-anchor="middle" class="mut">with_capacity(10) skips the whole row: one allocation, zero copies, exactly 10 slots.</text>
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
