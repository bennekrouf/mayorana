---
id: efficient-duplicate-removal-vec
title: 'How do you remove duplicates from a Vec<T> where T: Eq + Hash?'
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

# How do you remove duplicates from a Vec<T> where T: Eq + Hash?

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

The trick is that `HashSet::insert` returns `false` when the value was already present, which is exactly the answer `retain` wants:

<div class="svg-container" style="margin:2rem 0;">
<svg class="ci5b-fig" viewBox="0 0 800 250" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Trace of four elements through retain: HashSet insert returns true for new values which are kept and false for the repeated value which is dropped">
<!-- style -->
<style>
.ci5b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .ci5b-fig,[data-theme="dark"] .ci5b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.ci5b-fig .bg{fill:var(--bg)}
.ci5b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.ci5b-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.ci5b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.ci5b-fig .title{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.ci5b-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif}
.ci5b-fig .ac{fill:var(--ac)}
.ci5b-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="ci5b-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ln)"/></marker>
<marker id="ci5b-arrowac" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ac)"/></marker>
</defs>
<!-- bg -->
<rect class="bg" x="0" y="0" width="800" height="250" rx="8"/>
<!-- title -->
<text x="400" y="26" text-anchor="middle" class="title">retain(|x| seen.insert(x.clone())) over [1, 2, 2, 3]</text>
<!-- column 1 -->
<rect class="box" x="30" y="46" width="160" height="30" rx="5"/>
<text x="110" y="66" text-anchor="middle" class="tx">x = 1</text>
<path class="ln" d="M110 76V98" marker-end="url(#ci5b-arrow)"/>
<rect class="box" x="30" y="98" width="160" height="30" rx="5"/>
<text x="110" y="118" text-anchor="middle" class="tx">insert → true</text>
<path class="ln" d="M110 128V150" marker-end="url(#ci5b-arrow)"/>
<rect class="box" x="30" y="150" width="160" height="30" rx="5"/>
<text x="110" y="170" text-anchor="middle" class="tx">keep</text>
<text x="110" y="196" text-anchor="middle" class="mut">seen = {1}</text>
<!-- column 2 -->
<rect class="box" x="225" y="46" width="160" height="30" rx="5"/>
<text x="305" y="66" text-anchor="middle" class="tx">x = 2</text>
<path class="ln" d="M305 76V98" marker-end="url(#ci5b-arrow)"/>
<rect class="box" x="225" y="98" width="160" height="30" rx="5"/>
<text x="305" y="118" text-anchor="middle" class="tx">insert → true</text>
<path class="ln" d="M305 128V150" marker-end="url(#ci5b-arrow)"/>
<rect class="box" x="225" y="150" width="160" height="30" rx="5"/>
<text x="305" y="170" text-anchor="middle" class="tx">keep</text>
<text x="305" y="196" text-anchor="middle" class="mut">seen = {1, 2}</text>
<!-- column 3 -->
<rect class="box" x="420" y="46" width="160" height="30" rx="5"/>
<text x="500" y="66" text-anchor="middle" class="tx">x = 2 again</text>
<path class="ln" d="M500 76V98" marker-end="url(#ci5b-arrowac)"/>
<rect class="acbox" x="420" y="98" width="160" height="30" rx="5"/>
<text x="500" y="118" text-anchor="middle" class="tx ac">insert → false</text>
<path class="ln" d="M500 128V150" marker-end="url(#ci5b-arrowac)"/>
<rect class="acbox" x="420" y="150" width="160" height="30" rx="5"/>
<text x="500" y="170" text-anchor="middle" class="tx ac">drop</text>
<text x="500" y="196" text-anchor="middle" class="mut">seen = {1, 2}</text>
<!-- column 4 -->
<rect class="box" x="615" y="46" width="160" height="30" rx="5"/>
<text x="695" y="66" text-anchor="middle" class="tx">x = 3</text>
<path class="ln" d="M695 76V98" marker-end="url(#ci5b-arrow)"/>
<rect class="box" x="615" y="98" width="160" height="30" rx="5"/>
<text x="695" y="118" text-anchor="middle" class="tx">insert → true</text>
<path class="ln" d="M695 128V150" marker-end="url(#ci5b-arrow)"/>
<rect class="box" x="615" y="150" width="160" height="30" rx="5"/>
<text x="695" y="170" text-anchor="middle" class="tx">keep</text>
<text x="695" y="196" text-anchor="middle" class="mut">seen = {1, 2, 3}</text>
<!-- footer -->
<text x="400" y="228" text-anchor="middle" class="mut">One pass over the Vec, one hash lookup per element, and the first occurrence always wins — hence stable order.</text>
</svg>
</div>

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

## Picking a dedup strategy
**Use HashSet if**:
- Order must be preserved.
- You can tolerate O(n) space.

**Use Sort + Dedup if**:
- Order doesn't matter.
- Memory is tight (e.g., embedded systems).

## Alternatives:
- For no_std environments, use a BTreeSet (slower but avoids hashing).
- Use itertools::unique for iterator-based deduplication.

When `T` is `Clone` but not `Hash`, the `HashSet` route is closed. `Vec::dedup_by` with your
own equality check still works, at the cost of needing the input sorted first.
