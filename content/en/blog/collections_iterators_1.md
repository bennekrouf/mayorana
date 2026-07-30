---
id: vec-new-vs-with-capacity
title: >-
  Rust Vec::new() vs. with_capacity(): When to Use Each
slug: vec-new-vs-with-capacity
locale: "en"
date: '2025-06-25'
author: mayo
excerpt: >-
  Vec allocation strategies in Rust, comparing
  Vec::new() and Vec::with_capacity() for optimal performance.

tags:
  - rust
  - collections
  - iterators
---

# What is the difference between Vec::new() and Vec::with_capacity()? When would you use each?

Understanding Vec allocation strategies is crucial for writing performant Rust code, especially when dealing with collections and iterators.

<div class="svg-container" style="margin:2rem 0;">
<svg class="ci1-fig" viewBox="0 0 800 240" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Vec::new() reallocates repeatedly while growing, but Vec::with_capacity(n) allocates once upfront">
<!-- style -->
<style>
.ci1-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .ci1-fig,[data-theme="dark"] .ci1-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.ci1-fig .bg{fill:var(--bg)}
.ci1-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.ci1-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.ci1-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.ci1-fig .title{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.ci1-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif}
.ci1-fig .ac{fill:var(--ac)}
.ci1-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.ci1-fig .acln{stroke:var(--ac);stroke-width:2;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="ci1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ln)"/></marker>
<marker id="ci1-arrowac" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ac)"/></marker>
</defs>
<!-- bg -->
<rect class="bg" x="0" y="0" width="800" height="240" rx="8"/>
<!-- title -->
<text x="400" y="28" text-anchor="middle" class="title">Vec::new() vs Vec::with_capacity(n)</text>
<!-- row1 -->
<text x="20" y="70" class="tx">Vec::new()</text>
<rect class="box" x="110" y="50" width="60" height="34" rx="6"/>
<text x="140" y="71" text-anchor="middle" class="tx">cap 0</text>
<rect class="box" x="240" y="50" width="60" height="34" rx="6"/>
<text x="270" y="71" text-anchor="middle" class="tx">cap 4</text>
<rect class="box" x="370" y="50" width="60" height="34" rx="6"/>
<text x="400" y="71" text-anchor="middle" class="tx">cap 8</text>
<rect class="box" x="500" y="50" width="70" height="34" rx="6"/>
<text x="535" y="71" text-anchor="middle" class="tx">cap 16</text>
<!-- row1 arrows -->
<path class="ln" d="M170 67H240" marker-end="url(#ci1-arrow)"/>
<path class="ln" d="M300 67H370" marker-end="url(#ci1-arrow)"/>
<path class="ln" d="M430 67H500" marker-end="url(#ci1-arrow)"/>
<text x="205" y="60" text-anchor="middle" class="mut">copy</text>
<text x="335" y="60" text-anchor="middle" class="mut">copy</text>
<text x="465" y="60" text-anchor="middle" class="mut">copy</text>
<text x="650" y="71" text-anchor="middle" class="mut">4 reallocations</text>
<!-- row2 -->
<text x="20" y="150" class="tx">with_capacity(16)</text>
<rect class="acbox" x="240" y="130" width="180" height="34" rx="6"/>
<text x="330" y="151" text-anchor="middle" class="tx ac">cap 16 (1 alloc)</text>
<path class="acln" d="M420 147H540" marker-end="url(#ci1-arrowac)"/>
<rect class="box" x="540" y="130" width="140" height="34" rx="6"/>
<text x="610" y="151" text-anchor="middle" class="tx">push × 16</text>
<text x="330" y="185" text-anchor="middle" class="mut">0 reallocations</text>
<!-- caption -->
<text x="400" y="222" text-anchor="middle" class="mut">Knowing the final size upfront avoids repeated copy-and-free cycles</text>
</svg>
</div>

## Key Differences

| `Vec::new()` | `Vec::with_capacity(n)` |
|--------------|-------------------------|
| Creates an empty Vec with no pre-allocated space | Creates an empty Vec with space for n elements |
| Initial capacity is 0 (allocates on first push) | Initial capacity is exactly n (no early allocations) |
| Grows dynamically (may reallocate multiple times) | Avoids reallocation until len() > n |

## When to Use Each

Use `Vec::new()` when:
- The number of elements is unknown or small
- You want simplicity (e.g., short-lived vectors)

```rust
let mut v = Vec::new(); // Good for ad-hoc usage
v.push(1);
```

Use `Vec::with_capacity(n)` when:
- You know the exact or maximum number of elements upfront
- Optimizing for performance (avoids reallocations)

```rust
let mut v = Vec::with_capacity(1000); // Pre-allocate for 1000 items
for i in 0..1000 {
    v.push(i); // No reallocation happens
}
```

## Performance Impact

`Vec::new()` may trigger multiple reallocations as it grows (e.g., starts at 0, then 4, 8, 16, ...).
`Vec::with_capacity(n)` guarantees one allocation upfront (if n is correct).

## Example Benchmark

```rust
use std::time::Instant;

fn main() {
    let start = Instant::now();
    let mut v1 = Vec::new();
    for i in 0..1_000_000 {
        v1.push(i); // Reallocates ~20 times
    }
    println!("Vec::new(): {:?}", start.elapsed());

    let start = Instant::now();
    let mut v2 = Vec::with_capacity(1_000_000);
    for i in 0..1_000_000 {
        v2.push(i); // No reallocations
    }
    println!("Vec::with_capacity(): {:?}", start.elapsed());
}
```

Output (typical):
```
Vec::new(): 1.2ms
Vec::with_capacity(): 0.3ms  // 4x faster
```

## Advanced Notes

- `shrink_to_fit()`: Reduces excess capacity (e.g., after removing elements)
- `vec![]` macro: Uses with_capacity implicitly for literals (e.g., vec![1, 2, 3])

Pre-allocating is a hint, not a hard limit. `len` and `capacity` are two independent numbers, and the moment `len` would exceed `capacity` the usual doubling kicks back in:

<div class="svg-container" style="margin:2rem 0;">
<svg class="ci1-fig2" viewBox="0 0 800 225" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Timeline of len versus capacity for a Vec created with with_capacity(4): pushing past the fourth element doubles capacity to 8, and shrink_to_fit trims it back to 5">
<!-- style -->
<style>
.ci1-fig2{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .ci1-fig2,[data-theme="dark"] .ci1-fig2{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.ci1-fig2 .bg{fill:var(--bg)}
.ci1-fig2 .used{fill:var(--ln);stroke:var(--ln);stroke-width:1}
.ci1-fig2 .free{fill:none;stroke:var(--ln);stroke-width:1;stroke-dasharray:3 3}
.ci1-fig2 .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.ci1-fig2 .title{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.ci1-fig2 .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif}
.ci1-fig2 .ac{fill:var(--ac)}
.ci1-fig2 .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.ci1-fig2 .acln{stroke:var(--ac);stroke-width:2;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="ci1b-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ln)"/></marker>
<marker id="ci1b-arrowac" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ac)"/></marker>
</defs>
<!-- bg -->
<rect class="bg" x="0" y="0" width="800" height="225" rx="8"/>
<!-- title -->
<text x="400" y="26" text-anchor="middle" class="title">Life of a Vec::with_capacity(4): len vs capacity</text>
<!-- stage labels -->
<text x="79" y="70" text-anchor="middle" class="tx">len 2 / cap 4</text>
<text x="229" y="70" text-anchor="middle" class="tx">len 4 / cap 4</text>
<text x="419" y="70" text-anchor="middle" class="tx ac">len 5 / cap 8</text>
<text x="619" y="70" text-anchor="middle" class="tx">len 5 / cap 5</text>
<!-- stage 1 slots -->
<rect class="used" x="40" y="88" width="18" height="30" rx="3"/>
<rect class="used" x="60" y="88" width="18" height="30" rx="3"/>
<rect class="free" x="80" y="88" width="18" height="30" rx="3"/>
<rect class="free" x="100" y="88" width="18" height="30" rx="3"/>
<!-- stage 2 slots -->
<rect class="used" x="190" y="88" width="18" height="30" rx="3"/>
<rect class="used" x="210" y="88" width="18" height="30" rx="3"/>
<rect class="used" x="230" y="88" width="18" height="30" rx="3"/>
<rect class="used" x="250" y="88" width="18" height="30" rx="3"/>
<!-- stage 3 slots -->
<rect class="used" x="340" y="88" width="18" height="30" rx="3"/>
<rect class="used" x="360" y="88" width="18" height="30" rx="3"/>
<rect class="used" x="380" y="88" width="18" height="30" rx="3"/>
<rect class="used" x="400" y="88" width="18" height="30" rx="3"/>
<rect class="used" x="420" y="88" width="18" height="30" rx="3"/>
<rect class="free" x="440" y="88" width="18" height="30" rx="3"/>
<rect class="free" x="460" y="88" width="18" height="30" rx="3"/>
<rect class="free" x="480" y="88" width="18" height="30" rx="3"/>
<!-- stage 4 slots -->
<rect class="used" x="570" y="88" width="18" height="30" rx="3"/>
<rect class="used" x="590" y="88" width="18" height="30" rx="3"/>
<rect class="used" x="610" y="88" width="18" height="30" rx="3"/>
<rect class="used" x="630" y="88" width="18" height="30" rx="3"/>
<rect class="used" x="650" y="88" width="18" height="30" rx="3"/>
<!-- arrows -->
<path class="ln" d="M118 103H190" marker-end="url(#ci1b-arrow)"/>
<path class="acln" d="M268 103H340" marker-end="url(#ci1b-arrowac)"/>
<path class="ln" d="M498 103H570" marker-end="url(#ci1b-arrow)"/>
<!-- arrow labels -->
<text x="154" y="136" text-anchor="middle" class="mut">push × 2</text>
<text x="304" y="136" text-anchor="middle" class="mut ac">5th push</text>
<text x="304" y="150" text-anchor="middle" class="mut ac">realloc + copy</text>
<text x="534" y="136" text-anchor="middle" class="mut">shrink_to_fit()</text>
<!-- slot legend -->
<text x="79" y="136" text-anchor="middle" class="mut">2 free</text>
<text x="229" y="136" text-anchor="middle" class="mut">0 free</text>
<text x="419" y="136" text-anchor="middle" class="mut">3 free</text>
<text x="619" y="136" text-anchor="middle" class="mut">0 free</text>
<!-- notes -->
<text x="400" y="184" text-anchor="middle" class="mut">Solid = live elements (len) · dashed = reserved but unused (capacity − len)</text>
<text x="400" y="206" text-anchor="middle" class="mut">with_capacity(n) only postpones growth; pushing past n resumes the doubling schedule</text>
</svg>
</div>

## Key Takeaways

- ✅ Default to `Vec::new()` for simplicity.  
- ✅ Use `with_capacity(n)` when:
- You know the size upfront
- Performance is critical (e.g., hot loops)

**Try This:** What happens if you push beyond the pre-allocated capacity?  
**Answer:** The Vec grows automatically (like `Vec::new()`), but only after exceeding n.
