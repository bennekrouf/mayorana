---
id: vec-drain-vs-truncate-clear
title: 'Vec::drain() Vs Vec::truncate() or Vec::clear()?'
slug: vec-drain-vs-truncate-clear
locale: "en"
author: mayo
excerpt: >-
  Understanding Vec::drain() functionality and comparing it with Vec::truncate()
  and Vec::clear() for different element removal scenarios

tags:
  - rust
  - drain
date: '2025-07-26'
---

# How does Vec::drain() work, and when is it useful compared to Vec::truncate() or Vec::clear()?

## What is Vec::drain()?

`drain()` removes a range of elements from a Vec while yielding ownership of them through an iterator. Unlike `truncate()` or `clear()`, it allows you to process the removed elements before they're dropped.

<div class="svg-container" style="margin:2rem 0;">
<svg class="ci7-fig" viewBox="0 0 800 260" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="A Vec can be shrunk with drain, which yields the removed elements through an iterator, or with truncate/clear, which drop them without yielding ownership">
<!-- style -->
<style>
.ci7-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .ci7-fig,[data-theme="dark"] .ci7-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.ci7-fig .bg{fill:var(--bg)}
.ci7-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.ci7-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.ci7-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.ci7-fig .title{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.ci7-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif}
.ci7-fig .ac{fill:var(--ac)}
.ci7-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="ci7-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ln)"/></marker>
</defs>
<!-- bg -->
<rect class="bg" x="0" y="0" width="800" height="260" rx="8"/>
<!-- title -->
<text x="400" y="26" text-anchor="middle" class="title">vec!['a','b','c','d'] — three ways to remove elements</text>
<!-- source box -->
<rect class="box" x="300" y="42" width="200" height="36" rx="6"/>
<text x="400" y="65" text-anchor="middle" class="tx">['a','b','c','d']</text>
<!-- Y merge then split to 3 -->
<path class="ln" d="M400 78V98"/>
<path class="ln" d="M140 98H660"/>
<path class="ln" d="M140 98V118" marker-end="url(#ci7-arrow)"/>
<path class="ln" d="M400 98V118" marker-end="url(#ci7-arrow)"/>
<path class="ln" d="M660 98V118" marker-end="url(#ci7-arrow)"/>
<!-- method boxes -->
<rect class="acbox" x="60" y="118" width="160" height="36" rx="6"/>
<text x="140" y="141" text-anchor="middle" class="tx ac">drain(1..3)</text>
<rect class="box" x="320" y="118" width="160" height="36" rx="6"/>
<text x="400" y="141" text-anchor="middle" class="tx">truncate(2)</text>
<rect class="box" x="580" y="118" width="160" height="36" rx="6"/>
<text x="660" y="141" text-anchor="middle" class="tx">clear()</text>
<!-- arrows to outputs -->
<path class="ln" d="M140 154V178" marker-end="url(#ci7-arrow)"/>
<path class="ln" d="M400 154V178" marker-end="url(#ci7-arrow)"/>
<path class="ln" d="M660 154V178" marker-end="url(#ci7-arrow)"/>
<!-- output boxes -->
<rect class="box" x="60" y="178" width="160" height="34" rx="6"/>
<text x="140" y="199" text-anchor="middle" class="tx">['a','d']</text>
<rect class="box" x="320" y="178" width="160" height="34" rx="6"/>
<text x="400" y="199" text-anchor="middle" class="tx">['a','b']</text>
<rect class="box" x="580" y="178" width="160" height="34" rx="6"/>
<text x="660" y="199" text-anchor="middle" class="tx">[]</text>
<!-- captions -->
<text x="140" y="230" text-anchor="middle" class="mut ac">yields 'b','c' via iterator</text>
<text x="400" y="230" text-anchor="middle" class="mut">drops tail, no iterator</text>
<text x="660" y="230" text-anchor="middle" class="mut">drops all, no iterator</text>
<text x="400" y="250" text-anchor="middle" class="mut">All three preserve the Vec's capacity — only drain() lets you use the removed values</text>
</svg>
</div>

### Signature
```rust
pub fn drain<R>(&mut self, range: R) -> Drain<'_, T>
where
    R: RangeBounds<usize>,
```

## Key Features

| Method | Removes Elements | Yields Ownership | Preserves Capacity | Time Complexity |
|--------|------------------|------------------|-------------------|-----------------|
| `drain(..)` | Yes | ✅ Yes (via iterator) | ✅ Yes | O(n) |
| `truncate()` | Yes (from index) | ❌ No | ✅ Yes | O(1) |
| `clear()` | All | ❌ No | ✅ Yes | O(1) |

## When to Use Each

### 1. Vec::drain()

**Use Case**: Process removed elements (e.g., filter, transform, or batch-delete).

**Example**:
```rust
let mut vec = vec!['a', 'b', 'c', 'd'];
for ch in vec.drain(1..3) {  // Removes 'b' and 'c'
    println!("Removed: {}", ch);  // Prints 'b', then 'c'
}
assert_eq!(vec, ['a', 'd']);  // Keeps remaining elements
```

**Performance**: Avoids extra allocations if reusing the iterator.

### 2. Vec::truncate()

**Use Case**: Quickly remove elements from the end without processing them.

**Example**:
```rust
let mut vec = vec![1, 2, 3, 4];
vec.truncate(2);  // Drops 3 and 4 (no iterator)
assert_eq!(vec, [1, 2]);
```

### 3. Vec::clear()

**Use Case**: Remove all elements (faster than `drain(..)` if you don't need them).

**Example**:
```rust
let mut vec = vec![1, 2, 3];
vec.clear();  // Drops all elements
assert!(vec.is_empty());
```

## Memory Behavior

- All three methods retain the Vec's capacity (no reallocation if elements are re-added).
- `drain()` is lazy: Elements are only dropped when the iterator is consumed.

## Advanced Use: Reuse Storage

`drain()` is ideal for replacing a subset of elements efficiently:

```rust
let mut vec = vec!["old", "old", "new", "old"];
vec.drain(0..2).for_each(drop);  // Remove first two
vec.insert(0, "fresh");
assert_eq!(vec, ["fresh", "new", "old"]);
```

## Key Takeaways

- ✅ **drain()**: Use when you need to process removed elements or batch-delete.
- ✅ **truncate()/clear()**: Use for fast bulk removal without processing.
- 🚀 **All preserve capacity**: No reallocation overhead for future ops.

## Real-World Example

In a game engine, `drain()` could efficiently remove expired entities while allowing cleanup logic (e.g., saving state).

**Try This**: What happens if you `drain()` but don't consume the iterator?

**Answer**: The elements are still removed when the Drain iterator is dropped (due to its Drop impl).
