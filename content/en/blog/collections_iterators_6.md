---
id: box-slice-vs-vec-differences
title: 'What is the difference between Box<[T]> and Vec<T>?'
slug: box-slice-vs-vec-differences
locale: "en"
author: mayo
excerpt: >-
  Comparing Box<[T]> and Vec<T> differences in mutability, memory overhead, and
  performance implications for different use cases

tags:
  - rust
  - collections
date: '2025-07-24'
---

# What is the difference between Box<[T]> and Vec<T>?

<div class="svg-container" style="margin:2rem 0;">
<svg class="ci6-fig" viewBox="0 0 800 240" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Vec's stack representation carries ptr, len, and capacity fields while Box of slice drops the capacity field, saving one usize">
<!-- style -->
<style>
.ci6-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .ci6-fig,[data-theme="dark"] .ci6-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.ci6-fig .bg{fill:var(--bg)}
.ci6-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.ci6-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.ci6-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.ci6-fig .title{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.ci6-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif}
.ci6-fig .ac{fill:var(--ac)}
.ci6-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="ci6-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ln)"/></marker>
</defs>
<!-- bg -->
<rect class="bg" x="0" y="0" width="800" height="240" rx="8"/>
<!-- title -->
<text x="400" y="24" text-anchor="middle" class="title">Vec&lt;T&gt; vs Box&lt;[T]&gt; memory layout</text>
<!-- Vec row -->
<text x="20" y="60" class="tx">Vec&lt;T&gt;</text>
<rect class="box" x="110" y="42" width="70" height="30" rx="4"/>
<text x="145" y="62" text-anchor="middle" class="tx" font-size="11">ptr</text>
<rect class="box" x="190" y="42" width="70" height="30" rx="4"/>
<text x="225" y="62" text-anchor="middle" class="tx" font-size="11">len</text>
<rect class="acbox" x="270" y="42" width="90" height="30" rx="4"/>
<text x="315" y="62" text-anchor="middle" class="tx ac" font-size="11">capacity</text>
<path class="ln" d="M145 72V96" marker-end="url(#ci6-arrow)"/>
<rect class="box" x="70" y="96" width="330" height="30" rx="4"/>
<text x="235" y="116" text-anchor="middle" class="tx" font-size="11">heap: contiguous elements</text>
<text x="600" y="60" class="mut">3 usizes on the stack (24 bytes on 64-bit)</text>
<!-- Box row -->
<text x="20" y="170" class="tx">Box&lt;[T]&gt;</text>
<rect class="box" x="110" y="152" width="70" height="30" rx="4"/>
<text x="145" y="172" text-anchor="middle" class="tx" font-size="11">ptr</text>
<rect class="box" x="190" y="152" width="70" height="30" rx="4"/>
<text x="225" y="172" text-anchor="middle" class="tx" font-size="11">len</text>
<path class="ln" d="M145 182V206" marker-end="url(#ci6-arrow)"/>
<rect class="box" x="70" y="206" width="190" height="30" rx="4"/>
<text x="165" y="226" text-anchor="middle" class="tx" font-size="11">heap: fixed-size elements</text>
<text x="600" y="170" class="mut ac">2 usizes on the stack — no capacity field</text>
</svg>
</div>

## Key Differences

| Feature | Vec<T> | Box<[T]> |
|---------|--------|----------|
| Size Mutability | Growable/shrinkable (push, pop) | Fixed-size (immutable after creation) |
| Storage | Heap-allocated + capacity field | Pure heap slice (no extra metadata) |
| Memory Overhead | 3 usizes (ptr, len, capacity) | 2 usizes (ptr, len) |
| Conversion Cost | O(1) to Box<[T]> (shrink-to-fit) | O(n) to Vec (must reallocate) |

## When to Use Each

### Prefer Vec<T> When:

You need dynamic resizing:

```rust
let mut vec = vec![1, 2, 3];
vec.push(4);  // Works
```

You frequently modify the collection (e.g., appending/removing elements).

### Prefer Box<[T]> When:

You want a fixed-size, immutable collection:

```rust
let boxed_slice: Box<[i32]> = vec![1, 2, 3].into_boxed_slice();
// boxed_slice.push(4);  // ERROR: No `push` method
```

Memory efficiency matters (e.g., embedded systems):
- Saves 1 usize (no unused capacity).

Interfacing with APIs requiring owned slices:

```rust
fn process(data: Box<[i32]>) { /* ... */ }
```

## Conversion Between Them

| Direction | Code | Cost |
|-----------|------|------|
| Vec → Box<[T]> | `vec.into_boxed_slice()` | O(1) |
| Box<[T]> → Vec | `Vec::from(boxed_slice)` | O(n) |

<div class="svg-container" style="margin:2rem 0;">
<svg class="ci6b-fig" viewBox="0 0 800 250" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="into_boxed_slice converts a Vec to a boxed slice in constant time when capacity equals length, while Vec::from copies the data back, and a Vec with spare capacity must shrink first">
<!-- style -->
<style>
.ci6b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .ci6b-fig,[data-theme="dark"] .ci6b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.ci6b-fig .bg{fill:var(--bg)}
.ci6b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.ci6b-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.ci6b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.ci6b-fig .title{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.ci6b-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif}
.ci6b-fig .ac{fill:var(--ac)}
.ci6b-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="ci6b-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ln)"/></marker>
</defs>
<!-- bg -->
<rect class="bg" x="0" y="0" width="800" height="250" rx="8"/>
<!-- title -->
<text x="400" y="26" text-anchor="middle" class="title">Cost of the round trip</text>
<!-- top label -->
<text x="400" y="58" text-anchor="middle" class="mut">into_boxed_slice() · O(1) when capacity == len</text>
<!-- left box: Vec -->
<rect class="box" x="70" y="70" width="230" height="52" rx="6"/>
<text x="185" y="92" text-anchor="middle" class="tx">Vec&lt;i32&gt;</text>
<text x="185" y="111" text-anchor="middle" class="mut">len 3 · cap 3</text>
<!-- right box: boxed slice -->
<rect class="acbox" x="500" y="70" width="230" height="52" rx="6"/>
<text x="615" y="92" text-anchor="middle" class="tx ac">Box&lt;[i32]&gt;</text>
<text x="615" y="111" text-anchor="middle" class="mut">len 3 · exact fit</text>
<!-- forward arrow -->
<path class="ln" d="M300 86H500" marker-end="url(#ci6b-arrow)"/>
<!-- backward arrow -->
<path class="ln" d="M500 106H300" marker-end="url(#ci6b-arrow)"/>
<!-- bottom label -->
<text x="400" y="146" text-anchor="middle" class="mut">Vec::from(boxed) · O(n), allocates and copies every element</text>
<!-- caveat -->
<rect class="acbox" x="150" y="166" width="500" height="48" rx="6"/>
<text x="400" y="187" text-anchor="middle" class="tx">If cap &gt; len, the O(1) claim breaks</text>
<text x="400" y="205" text-anchor="middle" class="mut">into_boxed_slice() must shrink first: allocate the exact size, copy, free the old block</text>
<!-- footer -->
<text x="400" y="238" text-anchor="middle" class="mut">Convert once, when you stop mutating — round-tripping pays a copy in each direction.</text>
</svg>
</div>

### Example:

```rust
let vec = vec![1, 2, 3];
let boxed: Box<[i32]> = vec.into_boxed_slice();  // No reallocation
let vec_again = Vec::from(boxed);                // Copies data
```

## Performance Implications

- **Iteration**: Identical (both are contiguous heap arrays).
- **Memory**: Box<[T]> avoids unused capacity overhead.
- **Flexibility**: Vec supports in-place growth; Box<[T]> does not.

## Real-World Use Cases

- **Vec**: Buffers for dynamic data (e.g., HTTP request bodies).
- **Box<[T]>**:
  - Configurations loaded once and never modified.
  - Storing large immutable datasets (e.g., game assets).

## Key Takeaways

✅ Use Vec for mutable, growable sequences.
✅ Use Box<[T]> for immutable, memory-efficient storage.
⚡ Convert cheaply from Vec to Box<[T]> when done modifying.

**Try This**: What happens if you convert a Vec with spare capacity to Box<[T]>?

**Answer**: `into_boxed_slice()` shrinks the allocation to exact size (no unused capacity).
