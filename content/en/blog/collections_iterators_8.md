---
id: vec-retain-vs-filter-collect
title: 'Vec::retain() Vs filtering with iter().filter().collect()?'
locale: en
slug: vec-retain-vs-filter-collect
author: mayo
excerpt: >-
  Comparing Vec::retain() in-place filtering with iter().filter().collect() for
  different filtering scenarios and performance implications

tags:
  - rust
  - retain
date: '2025-07-28'
---

# What is the purpose of Vec::retain()? How does it compare to filtering with iter().filter().collect()?

## Vec::retain(): In-Place Filtering

**Purpose**: Removes elements from a Vec in-place based on a predicate, preserving the order of retained elements.

<div class="svg-container" style="margin:2rem 0;">
<svg class="ci8-fig" viewBox="0 0 800 220" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="retain() shrinks the original Vec in place with no extra allocation, while filter().collect() leaves the original untouched and allocates a new Vec">
<!-- style -->
<style>
.ci8-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .ci8-fig,[data-theme="dark"] .ci8-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.ci8-fig .bg{fill:var(--bg)}
.ci8-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.ci8-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.ci8-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.ci8-fig .title{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.ci8-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif}
.ci8-fig .ac{fill:var(--ac)}
.ci8-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="ci8-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ln)"/></marker>
</defs>
<!-- bg -->
<rect class="bg" x="0" y="0" width="800" height="220" rx="8"/>
<!-- title -->
<text x="400" y="24" text-anchor="middle" class="title">[1, 2, 3, 4].retain(even) vs .filter(even).collect()</text>
<!-- row1: retain -->
<text x="20" y="65" class="tx">retain()</text>
<rect class="box" x="110" y="46" width="140" height="34" rx="6"/>
<text x="180" y="67" text-anchor="middle" class="tx">[1,2,3,4]</text>
<path class="acln" d="M250 63H320" marker-end="url(#ci8-arrow)"/>
<rect class="acbox" x="320" y="46" width="140" height="34" rx="6"/>
<text x="390" y="67" text-anchor="middle" class="tx ac">[2, 4] (same Vec)</text>
<text x="620" y="67" text-anchor="middle" class="mut">in-place, O(1) extra space</text>
<!-- row2: filter().collect() -->
<text x="20" y="150" class="tx">filter().collect()</text>
<rect class="box" x="110" y="131" width="140" height="34" rx="6"/>
<text x="180" y="152" text-anchor="middle" class="tx">[1,2,3,4]</text>
<path class="ln" d="M250 148H320" marker-end="url(#ci8-arrow)"/>
<rect class="box" x="320" y="131" width="140" height="34" rx="6"/>
<text x="390" y="152" text-anchor="middle" class="tx">[1,2,3,4] (unchanged)</text>
<path class="ln" d="M180 165V190" marker-end="url(#ci8-arrow)"/>
<rect class="box" x="110" y="190" width="140" height="26" rx="6"/>
<text x="180" y="207" text-anchor="middle" class="tx" font-size="11">new Vec [2, 4]</text>
<text x="620" y="152" text-anchor="middle" class="mut">new allocation, O(n) extra space</text>
</svg>
</div>

**Signature**:
```rust
pub fn retain<F>(&mut self, f: F)
where
    F: FnMut(&T) -> bool,
```

## Key Features

| Aspect | retain() | iter().filter().collect() |
|--------|----------|---------------------------|
| Mutates Original | ✅ Yes (in-place) | ❌ No (allocates new Vec) |
| Preserves Order | ✅ Yes | ✅ Yes |
| Memory Efficiency | ✅ O(1) extra space | ❌ O(n) extra space |
| Performance | Faster (no reallocation) | Slower (allocates/copies) |
| Use Case | Filtering without allocation | Creating a new filtered collection |

## Example: Filtering Even Numbers

### Using retain() (In-Place)
```rust
let mut vec = vec![1, 2, 3, 4];
vec.retain(|x| x % 2 == 0);  // Keeps evens
assert_eq!(vec, [2, 4]);      // Original `vec` modified
```

### Using filter().collect() (New Allocation)
```rust
let vec = vec![1, 2, 3, 4];
let filtered: Vec<_> = vec.iter().filter(|x| *x % 2 == 0).copied().collect();
assert_eq!(filtered, [2, 4]);  // New `Vec` created
// `vec` remains unchanged: [1, 2, 3, 4]
```

## Performance Comparison

### retain():
- **Time**: O(n) (single pass, shifts elements left in-place).
- **Space**: O(1) (no extra allocations).

Concretely, `retain()` walks the buffer with two cursors: a read cursor that visits every element, and a write cursor that only advances when an element is kept.

<div class="svg-container" style="margin:2rem 0;">
<svg class="ci8b-fig" viewBox="0 0 800 270" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Step by step buffer states as retain compacts kept elements to the left with a read cursor and a write cursor, then truncates the length">
<!-- style -->
<style>
.ci8b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .ci8b-fig,[data-theme="dark"] .ci8b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.ci8b-fig .bg{fill:var(--bg)}
.ci8b-fig .cell{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.ci8b-fig .accell{fill:var(--box);stroke:var(--ac);stroke-width:2}
.ci8b-fig .ghost{fill:none;stroke:var(--ln);stroke-width:1.5;stroke-dasharray:3 3}
.ci8b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.ci8b-fig .title{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.ci8b-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif}
.ci8b-fig .ac{fill:var(--ac)}
</style>
<!-- bg -->
<rect class="bg" x="0" y="0" width="800" height="270" rx="8"/>
<!-- title -->
<text x="400" y="26" text-anchor="middle" class="title">retain(|x| x % 2 == 0) on [1, 2, 3, 4]: one pass, two cursors</text>
<!-- row 1 -->
<text x="20" y="67" class="mut">read 0 → 1 is odd</text>
<rect class="cell" x="300" y="48" width="52" height="28" rx="4"/>
<text x="326" y="67" text-anchor="middle" class="tx">1</text>
<rect class="cell" x="358" y="48" width="52" height="28" rx="4"/>
<text x="384" y="67" text-anchor="middle" class="tx">2</text>
<rect class="cell" x="416" y="48" width="52" height="28" rx="4"/>
<text x="442" y="67" text-anchor="middle" class="tx">3</text>
<rect class="cell" x="474" y="48" width="52" height="28" rx="4"/>
<text x="500" y="67" text-anchor="middle" class="tx">4</text>
<text x="560" y="67" class="mut">skip · write stays 0</text>
<!-- row 2 -->
<text x="20" y="103" class="mut">read 1 → 2 is even</text>
<rect class="accell" x="300" y="84" width="52" height="28" rx="4"/>
<text x="326" y="103" text-anchor="middle" class="tx ac">2</text>
<rect class="cell" x="358" y="84" width="52" height="28" rx="4"/>
<text x="384" y="103" text-anchor="middle" class="tx">2</text>
<rect class="cell" x="416" y="84" width="52" height="28" rx="4"/>
<text x="442" y="103" text-anchor="middle" class="tx">3</text>
<rect class="cell" x="474" y="84" width="52" height="28" rx="4"/>
<text x="500" y="103" text-anchor="middle" class="tx">4</text>
<text x="560" y="103" class="mut ac">move into slot 0 · write 1</text>
<!-- row 3 -->
<text x="20" y="139" class="mut">read 2 → 3 is odd</text>
<rect class="cell" x="300" y="120" width="52" height="28" rx="4"/>
<text x="326" y="139" text-anchor="middle" class="tx">2</text>
<rect class="cell" x="358" y="120" width="52" height="28" rx="4"/>
<text x="384" y="139" text-anchor="middle" class="tx">2</text>
<rect class="cell" x="416" y="120" width="52" height="28" rx="4"/>
<text x="442" y="139" text-anchor="middle" class="tx">3</text>
<rect class="cell" x="474" y="120" width="52" height="28" rx="4"/>
<text x="500" y="139" text-anchor="middle" class="tx">4</text>
<text x="560" y="139" class="mut">skip · write stays 1</text>
<!-- row 4 -->
<text x="20" y="175" class="mut">read 3 → 4 is even</text>
<rect class="cell" x="300" y="156" width="52" height="28" rx="4"/>
<text x="326" y="175" text-anchor="middle" class="tx">2</text>
<rect class="accell" x="358" y="156" width="52" height="28" rx="4"/>
<text x="384" y="175" text-anchor="middle" class="tx ac">4</text>
<rect class="cell" x="416" y="156" width="52" height="28" rx="4"/>
<text x="442" y="175" text-anchor="middle" class="tx">3</text>
<rect class="cell" x="474" y="156" width="52" height="28" rx="4"/>
<text x="500" y="175" text-anchor="middle" class="tx">4</text>
<text x="560" y="175" class="mut ac">move into slot 1 · write 2</text>
<!-- row 5 -->
<text x="20" y="211" class="mut">set len = write</text>
<rect class="cell" x="300" y="192" width="52" height="28" rx="4"/>
<text x="326" y="211" text-anchor="middle" class="tx">2</text>
<rect class="cell" x="358" y="192" width="52" height="28" rx="4"/>
<text x="384" y="211" text-anchor="middle" class="tx">4</text>
<rect class="ghost" x="416" y="192" width="52" height="28" rx="4"/>
<rect class="ghost" x="474" y="192" width="52" height="28" rx="4"/>
<text x="560" y="211" class="mut">len 2, capacity still 4</text>
<!-- footer -->
<text x="400" y="248" text-anchor="middle" class="mut">The same allocation throughout — kept elements are moved left over the dropped ones, then len shrinks.</text>
</svg>
</div>

### filter().collect():
- **Time**: O(n) (but requires copying to a new allocation).
- **Space**: O(n) (new Vec allocated).

### Benchmark Suggestion:
```rust
let mut big_vec = (0..1_000_000).collect::<Vec<_>>();
// Measure `retain`
let start = std::time::Instant::now();
big_vec.retain(|x| x % 2 == 0);
println!("retain: {:?}", start.elapsed());

// Measure `filter().collect()`
let big_vec = (0..1_000_000).collect::<Vec<_>>();
let start = std::time::Instant::now();
let filtered = big_vec.iter().filter(|x| *x % 2 == 0).collect::<Vec<_>>();
println!("filter.collect: {:?}", start.elapsed());
```

**Typical Result**: `retain()` is 2–3x faster due to no allocations.

## When each is the right call
### Prefer retain() When:
- You want to modify the Vec in-place.
- Memory efficiency is critical (e.g., large Vecs).
- Order of elements must be preserved.

### Prefer filter().collect() When:
- You need the original Vec to remain intact.
- Chaining multiple iterator adapters (e.g., `.filter().map()`).
- Working with non-Vec iterators (e.g., ranges, slices).

## Advanced Notes

### retain_mut():
Rust also provides `retain_mut()` for predicates that need mutable access to elements:

```rust
let mut vec = vec![1, 2, 3];
vec.retain_mut(|x| {
    *x += 1;           // Modify in-place
    *x % 2 == 0        // Keep if even after increment
});
assert_eq!(vec, [2, 4]);
```

### Stability:
Both methods preserve the relative order of retained elements (stable filtering).

## When `retain()` wins
**retain()**: Faster, memory-efficient, and in-place. Ideal for bulk modifications.
**filter().collect()**: Flexible, non-destructive. Ideal for iterator pipelines.

## Real-World Use Case:
- **retain()**: Cleaning up expired sessions in a server's session pool.
- **filter().collect()**: Transforming API response data into a filtered subset.

A `retain()` whose predicate keeps everything costs one pass and nothing else — no removals,
no reallocation, capacity untouched.
