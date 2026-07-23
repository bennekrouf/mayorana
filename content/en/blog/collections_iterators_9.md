---
id: flatten-vec-iterators-performance
title: Flatten a Vec<Vec<T>> into a Vec<T> using iterators
locale: en
slug: flatten-vec-iterators-performance
author: mayo
excerpt: >-
  Flattening Vec<Vec<T>> using iterators compared to manual concatenation,
  analyzing performance implications

tags:
  - rust
  - vec
date: '2025-07-29'
---

# How would you flatten a Vec<Vec<T>> into a Vec<T> using iterators? Compare performance with manual concatenation.

## Flattening with Iterators

The most idiomatic way is to use `.flatten()` or `.flat_map()`:

<div class="svg-container" style="margin:2rem 0;">
<svg class="ci9-fig" viewBox="0 0 800 220" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Three inner vectors merge through flatten into one flat Vec of six elements">
<!-- style -->
<style>
.ci9-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .ci9-fig,[data-theme="dark"] .ci9-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.ci9-fig .bg{fill:var(--bg)}
.ci9-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.ci9-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.ci9-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.ci9-fig .title{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.ci9-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif}
.ci9-fig .ac{fill:var(--ac)}
.ci9-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="ci9-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ln)"/></marker>
<marker id="ci9-arrowac" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ac)"/></marker>
</defs>
<!-- bg -->
<rect class="bg" x="0" y="0" width="800" height="220" rx="8"/>
<!-- title -->
<text x="400" y="24" text-anchor="middle" class="title">Vec&lt;Vec&lt;T&gt;&gt; → flatten() → Vec&lt;T&gt;</text>
<!-- three inner vecs -->
<rect class="box" x="60" y="46" width="150" height="34" rx="6"/>
<text x="135" y="67" text-anchor="middle" class="tx">[1, 2]</text>
<rect class="box" x="325" y="46" width="150" height="34" rx="6"/>
<text x="400" y="67" text-anchor="middle" class="tx">[3]</text>
<rect class="box" x="590" y="46" width="150" height="34" rx="6"/>
<text x="665" y="67" text-anchor="middle" class="tx">[4, 5, 6]</text>
<!-- merge lines to Y point -->
<path class="ln" d="M135 80V100"/>
<path class="ln" d="M400 80V100"/>
<path class="ln" d="M665 80V100"/>
<path class="ln" d="M135 100H665"/>
<path class="ln" d="M400 100V120" marker-end="url(#ci9-arrow)"/>
<!-- flatten box -->
<rect class="acbox" x="320" y="120" width="160" height="36" rx="6"/>
<text x="400" y="143" text-anchor="middle" class="tx ac">.flatten().collect()</text>
<!-- arrow to result -->
<path class="ln" d="M400 156V178" marker-end="url(#ci9-arrow)"/>
<rect class="box" x="270" y="178" width="260" height="30" rx="6"/>
<text x="400" y="198" text-anchor="middle" class="tx">[1, 2, 3, 4, 5, 6]</text>
</svg>
</div>

```rust
let nested = vec![vec![1, 2], vec![3], vec![4, 5, 6]];

// Method 1: flatten() (for Vec<Iterables>)
let flat: Vec<_> = nested.iter().flatten().copied().collect();

// Method 2: flat_map() (for custom transformations)
let flat: Vec<_> = nested.into_iter().flat_map(|v| v).collect();
```

**Output**: `[1, 2, 3, 4, 5, 6]`

## Manual Concatenation

For comparison, here's how you might do it manually:

```rust
let mut flat = Vec::new();
for subvec in nested {
    flat.extend(subvec);  // or append() if subvec is no longer needed
}
```

## Performance Comparison

| Method | Time Complexity | Space Complexity | Allocations | Optimizations |
|--------|-----------------|------------------|-------------|---------------|
| Iterator (flatten) | O(n) | O(1) iterator | 1 (result) | May fuse iterators |
| Manual (extend) | O(n) | O(1) temp space | 1 (result) | Pre-allocation possible |

## Key Insights

### Pre-allocation Advantage (Manual)

You can pre-allocate the target Vec if total size is known:

```rust
let total_len: usize = nested.iter().map(|v| v.len()).sum();
let mut flat = Vec::with_capacity(total_len);  // Critical for large datasets
flat.extend(nested.into_iter().flatten());
```

### Iterator Laziness

- `.flatten()` is lazy, but `.collect()` still needs to allocate the result.
- Chained iterators (e.g., `.filter().flatten()`) may optimize better than manual loops.

## Benchmark Example

```rust
let nested: Vec<Vec<i32>> = (0..1_000).map(|i| vec![i; 100]).collect();

// Iterator approach
let start = std::time::Instant::now();
let flat = nested.iter().flatten().copied().collect::<Vec<_>>();
println!("flatten: {:?}", start.elapsed());

// Manual approach with pre-allocation
let start = std::time::Instant::now();
let total_len = nested.iter().map(|v| v.len()).sum();
let mut flat = Vec::with_capacity(total_len);
flat.extend(nested.into_iter().flatten());
println!("manual: {:?}", start.elapsed());
```

**Typical Result**:
- Manual with pre-allocation is ~10–20% faster for large Vecs.
- Iterator version is more concise and equally fast for small data.

## When to Use Each

| Approach | Best For | Pitfalls |
|----------|----------|----------|
| Iterator | Readability, chaining operations | Slightly slower without pre-allocation |
| Manual | Maximum performance, large data | Verbose; requires length calculation |

## Advanced: Zero-Copy Flattening

If you have `Vec<&[T]>` instead of `Vec<Vec<T>>`, use `.flatten().copied()` to avoid cloning:

```rust
let slices: Vec<&[i32]> = vec![&[1, 2], &[3, 4]];
let flat: Vec<i32> = slices.iter().flatten().copied().collect();
```

## Key Takeaways

✅ **Use .flatten() for**:
- Clean, idiomatic code.
- Chaining with other iterator adapters (e.g., `.filter()`).

✅ **Use manual extend for**:
- Large datasets where pre-allocation matters.
- Cases where you already know the total length.

🚀 **Always pre-allocate for manual concatenation of large collections!**

**Try This**: How would you flatten a `Vec<Vec<T>>` while removing duplicates?

**Answer**: Combine `.flatten()` with `.collect::<HashSet<_>>()`.
