---
id: iter-methods-rust
title: 'How do into_iter(), iter(), and iter_mut() differ?'
slug: iter-methods-rust
locale: "en"
date: '2025-07-08'
author: mayo
excerpt: 'Collections (like Vec), iterators (into_iter, collect), and related concepts'

tags:
  - rust
  - iterators
  - collections
---

# How do into_iter(), iter(), and iter_mut() differ?

These three methods are fundamental for working with collections in Rust, each serving distinct ownership and mutability use cases.

<div class="svg-container" style="margin:2rem 0;">
<svg class="ci2-fig" viewBox="0 0 800 280" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Vec branches into into_iter, iter, and iter_mut, each yielding a different item type and affecting the original differently">
<!-- style -->
<style>
.ci2-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .ci2-fig,[data-theme="dark"] .ci2-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.ci2-fig .bg{fill:var(--bg)}
.ci2-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.ci2-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.ci2-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.ci2-fig .title{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.ci2-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif}
.ci2-fig .ac{fill:var(--ac)}
.ci2-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="ci2-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ln)"/></marker>
</defs>
<!-- bg -->
<rect class="bg" x="0" y="0" width="800" height="280" rx="8"/>
<!-- title -->
<text x="400" y="26" text-anchor="middle" class="title">Vec&lt;T&gt; iteration methods</text>
<!-- source box -->
<rect class="box" x="330" y="40" width="140" height="36" rx="6"/>
<text x="400" y="63" text-anchor="middle" class="tx">Vec&lt;T&gt;</text>
<!-- branch lines to Y merge point then split -->
<path class="ln" d="M400 76V100" marker-end="none"/>
<path class="ln" d="M140 100H660" marker-end="none"/>
<path class="ln" d="M140 100V120" marker-end="url(#ci2-arrow)"/>
<path class="ln" d="M400 100V120" marker-end="url(#ci2-arrow)"/>
<path class="ln" d="M660 100V120" marker-end="url(#ci2-arrow)"/>
<!-- method boxes -->
<rect class="acbox" x="60" y="120" width="160" height="36" rx="6"/>
<text x="140" y="143" text-anchor="middle" class="tx ac">into_iter()</text>
<rect class="box" x="320" y="120" width="160" height="36" rx="6"/>
<text x="400" y="143" text-anchor="middle" class="tx">iter()</text>
<rect class="box" x="580" y="120" width="160" height="36" rx="6"/>
<text x="660" y="143" text-anchor="middle" class="tx">iter_mut()</text>
<!-- arrows to outputs -->
<path class="ln" d="M140 156V180" marker-end="url(#ci2-arrow)"/>
<path class="ln" d="M400 156V180" marker-end="url(#ci2-arrow)"/>
<path class="ln" d="M660 156V180" marker-end="url(#ci2-arrow)"/>
<!-- output boxes -->
<rect class="box" x="60" y="180" width="160" height="34" rx="6"/>
<text x="140" y="201" text-anchor="middle" class="tx">yields T (owned)</text>
<rect class="box" x="320" y="180" width="160" height="34" rx="6"/>
<text x="400" y="201" text-anchor="middle" class="tx">yields &amp;T</text>
<rect class="box" x="580" y="180" width="160" height="34" rx="6"/>
<text x="660" y="201" text-anchor="middle" class="tx">yields &amp;mut T</text>
<!-- captions -->
<text x="140" y="232" text-anchor="middle" class="mut ac">original consumed</text>
<text x="400" y="232" text-anchor="middle" class="mut">original intact</text>
<text x="660" y="232" text-anchor="middle" class="mut">original mutated in place</text>
<text x="400" y="262" text-anchor="middle" class="mut">Choose based on whether you need ownership, read-only access, or in-place mutation</text>
</svg>
</div>

## 1. `into_iter()` - Ownership-Consuming Iterator

- **Takes ownership** of the collection (`self`).
- **Produces** owned values (`T`) when iterating.
- **Destroys** the original collection (can't be used afterward).

```rust
let vec = vec!["a".to_string(), "b".to_string()];
for s in vec.into_iter() {  // `vec` is moved here
    println!("{}", s);      // `s` is a String (owned)
}
// println!("{:?}", vec);  // ERROR: `vec` was consumed
```

**When to use**:
- When you need to transform or consume the collection permanently.
- For chaining iterator adapters that need ownership (e.g., `.filter().collect()`).

## 2. `iter()` - Immutable Borrow Iterator

- **Borrows** the collection immutably (`&self`).
- **Produces** references (`&T`).
- **Leaves** the collection intact.

```rust
let vec = vec!["a", "b", "c"];
for s in vec.iter() {       // Borrows `vec`
    println!("{}", s);      // `s` is &&str (reference)
}
println!("{:?}", vec);      // OK: `vec` still valid
```

**When to use**:
- When you only need read-only access to elements.
- For operations like searching (`.find()`) or inspection.

## 3. `iter_mut()` - Mutable Borrow Iterator

- **Borrows** the collection mutably (`&mut self`).
- **Produces** mutable references (`&mut T`).
- **Allows** in-place modification.

```rust
let mut vec = vec![1, 2, 3];
for num in vec.iter_mut() {  // Mutable borrow
    *num *= 2;               // Modify in place
}
println!("{:?}", vec);       // [2, 4, 6]
```

**When to use**:
- When you need to modify elements without reallocating.
- For bulk updates (e.g., applying transformations).

## Key Differences Summary

| Method        | Ownership     | Yields     | Modifies Original? | Reuse Original? |
|---------------|---------------|------------|--------------------|-----------------|
| `into_iter()` | Consumes      | `T`        | ❌ (destroyed)      | ❌              |
| `iter()`      | Borrows       | `&T`       | ❌                 | ✅              |
| `iter_mut()`  | Mut borrow    | `&mut T`   | ✅                 | ✅              |

## Common Pitfalls

- **Accidental moves with `into_iter()`**:
  ```rust
  let vec = vec![1, 2];
  let _ = vec.into_iter();  // `vec` moved here
  // println!("{:?}", vec); // ERROR!
  ```

- **Simultaneous mutable access**:
  ```rust
  let mut vec = vec![1, 2];
  let iter = vec.iter_mut();
  // vec.push(3);           // ERROR: Cannot borrow `vec` while iterator exists
  ```

## Real-World Examples

- **`iter()` for read-only processing**:
  ```rust
  let words = vec!["hello", "world"];
  let lengths: Vec<_> = words.iter().map(|s| s.len()).collect();  // [5, 5]
  ```

- **`iter_mut()` for in-place updates**:
  ```rust
  let mut scores = vec![85, 92, 78];
  scores.iter_mut().for_each(|s| *s += 5);  // [90, 97, 83]
  ```

- **`into_iter()` for ownership transfer**:
  ```rust
  let matrix = vec![vec![1, 2], vec![3, 4]];
  let flattened: Vec<_> = matrix.into_iter().flatten().collect();  // [1, 2, 3, 4]
  ```

## Performance Notes

- `iter()` and `iter_mut()` are zero-cost (just pointers).
- `into_iter()` may involve moves (but optimized for primitives like `i32`).

**Try This**: What happens if you call `iter_mut()` on a `Vec<T>` where `T` doesn’t implement `Copy`, then try to modify the elements?  
**Answer**: It works! The iterator yields `&mut T`, allowing direct mutation (e.g., `*item = new_value`).
