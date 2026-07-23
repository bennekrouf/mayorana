---
id: efficient-duplicate-removal-vec
title: 'How removing duplicates from a Vec<T> where T: Eq + Hash?'
slug: efficient-duplicate-removal-vec
locale: "en"
author: mayo
excerpt: >-
  Efficient approaches to remove duplicates from Vec<T> where T: Eq + Hash,
  comparing HashSet-based and sort-based methods with performance analysis
tags:
  - rust
  - collections
date: '2025-07-21'
---

# How would you efficiently remove duplicates from a Vec<T> where T: Eq + Hash?

## Efficient Approaches

When T implements Eq + Hash (for equality checks and hashing), the optimal methods are:

<div class="svg-container" style="margin:2rem 0;">
<svg class="ci5-fig" viewBox="0 0 800 260" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Side-by-side comparison of the HashSet dedup approach, which preserves order, against sort-plus-dedup, which is faster but reorders elements">
<!-- style -->
<style>
.ci5-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .ci5-fig,[data-theme="dark"] .ci5-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.ci5-fig .bg{fill:var(--bg)}
.ci5-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.ci5-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.ci5-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.ci5-fig .title{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.ci5-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif}
.ci5-fig .ac{fill:var(--ac)}
.ci5-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="ci5-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ln)"/></marker>
</defs>
<!-- bg -->
<rect class="bg" x="0" y="0" width="800" height="260" rx="8"/>
<!-- title -->
<text x="400" y="26" text-anchor="middle" class="title">Vec&lt;1,2,2,3,3,3&gt; deduplication</text>
<!-- input box -->
<rect class="box" x="300" y="40" width="200" height="34" rx="6"/>
<text x="400" y="61" text-anchor="middle" class="tx">[1, 2, 2, 3, 3, 3]</text>
<!-- split -->
<path class="ln" d="M400 74V94"/>
<path class="ln" d="M220 94H580"/>
<path class="ln" d="M220 94V114" marker-end="url(#ci5-arrow)"/>
<path class="ln" d="M580 94V114" marker-end="url(#ci5-arrow)"/>
<!-- left column: HashSet -->
<rect class="acbox" x="120" y="114" width="200" height="36" rx="6"/>
<text x="220" y="137" text-anchor="middle" class="tx ac">HashSet retain</text>
<path class="ln" d="M220 150V174" marker-end="url(#ci5-arrow)"/>
<rect class="box" x="120" y="174" width="200" height="34" rx="6"/>
<text x="220" y="195" text-anchor="middle" class="tx">[1, 2, 3]</text>
<text x="220" y="226" text-anchor="middle" class="mut" font-weight="700">order preserved</text>
<text x="220" y="244" text-anchor="middle" class="mut">O(n) time · O(n) space</text>
<!-- right column: sort+dedup -->
<rect class="box" x="480" y="114" width="200" height="36" rx="6"/>
<text x="580" y="137" text-anchor="middle" class="tx">sort() + dedup()</text>
<path class="ln" d="M580 150V174" marker-end="url(#ci5-arrow)"/>
<rect class="box" x="480" y="174" width="200" height="34" rx="6"/>
<text x="580" y="195" text-anchor="middle" class="tx">[1, 2, 3]</text>
<text x="580" y="226" text-anchor="middle" class="mut">order changed</text>
<text x="580" y="244" text-anchor="middle" class="mut">O(n log n) time · O(1) space</text>
</svg>
</div>

## 1. Using HashSet (Preserves Order)

### Steps:
1. Iterate through the Vec.
2. Track seen elements with a HashSet.
3. Collect only unseen elements.

### Code:
```rust
use std::collections::HashSet;

fn dedup_ordered<T: Eq + std::hash::Hash + Clone>(vec: &mut Vec<T>) {
    let mut seen = HashSet::new();
    vec.retain(|x| seen.insert(x.clone()));
}
```

### Example:
```rust
let mut vec = vec![1, 2, 2, 3, 3, 3];
dedup_ordered(&mut vec);
assert_eq!(vec, [1, 2, 3]); // Order preserved
```

### Performance:
- **Time**: O(n) (average case, assuming good hash distribution).
- **Space**: O(n) (for the HashSet).

## 2. Sort + Dedup (Destroys Order)

### Steps:
1. Sort the Vec (groups duplicates together).
2. Remove consecutive duplicates with dedup().

### Code:
```rust
fn dedup_unordered<T: Ord>(vec: &mut Vec<T>) {
    vec.sort();      // O(n log n)
    vec.dedup();     // O(n)
}
```

### Example:
```rust
let mut vec = vec![3, 2, 2, 1, 3];
dedup_unordered(&mut vec);
assert_eq!(vec, [1, 2, 3]); // Order changed
```

### Performance:
- **Time**: O(n log n) (dominated by sorting).
- **Space**: O(1) (in-place, no extra allocations).

## Comparison

| Method | Time Complexity | Space Complexity | Preserves Order? | Use Case |
|--------|-----------------|------------------|------------------|----------|
| HashSet | O(n) | O(n) | ✅ Yes | Order matters, no sorting allowed. |
| Sort + Dedup | O(n log n) | O(1) | ❌ No | Order irrelevant, memory-constrained. |

## Key Takeaways

✅ **Use HashSet if**:
- Order must be preserved.
- You can tolerate O(n) space.

✅ **Use Sort + Dedup if**:
- Order doesn't matter.
- Memory is tight (e.g., embedded systems).

## Alternatives:
- For no_std environments, use a BTreeSet (slower but avoids hashing).
- Use itertools::unique for iterator-based deduplication.

**Try This**: What happens if T is Clone but not Hash?

**Answer**: Use Vec::dedup_by with a custom equality check (no hashing).
