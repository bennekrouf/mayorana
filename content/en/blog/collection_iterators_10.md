---
id: into-iter-vs-iter-ownership
title: Implications of iterating over a Vec with .into_iter() instead of .iter()
slug: into-iter-vs-iter-ownership
locale: "en"
author: mayo
excerpt: >-
  Understanding the differences between .into_iter() and .iter() when iterating
  over Vec, covering ownership implications and performance considerations

tags:
  - rust
  - iterators
  - collections
date: '2025-07-14'
---

# When iterating over a Vec, why might you use .into_iter() instead of .iter()? What ownership implications does this have?

<div class="svg-container" style="margin:2rem 0;">
<svg class="ci10-fig" viewBox="0 0 800 240" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="into_iter consumes the Vec so it cannot be reused afterward, while iter borrows it and leaves it available for further use">
<!-- style -->
<style>
.ci10-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .ci10-fig,[data-theme="dark"] .ci10-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.ci10-fig .bg{fill:var(--bg)}
.ci10-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.ci10-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.ci10-fig .ghost{fill:none;stroke:var(--ln);stroke-width:1.5;stroke-dasharray:3 3}
.ci10-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.ci10-fig .title{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.ci10-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif}
.ci10-fig .ac{fill:var(--ac)}
.ci10-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="ci10-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ln)"/></marker>
</defs>
<!-- bg -->
<rect class="bg" x="0" y="0" width="800" height="240" rx="8"/>
<!-- title -->
<text x="400" y="24" text-anchor="middle" class="title">.into_iter() vs .iter() ownership</text>
<!-- row1: into_iter -->
<text x="20" y="70" class="tx">.into_iter()</text>
<rect class="box" x="130" y="50" width="140" height="36" rx="6"/>
<text x="200" y="73" text-anchor="middle" class="tx">vec (owner)</text>
<path class="acln" d="M270 68H340" marker-end="url(#ci10-arrow)"/>
<rect class="acbox" x="340" y="50" width="150" height="36" rx="6"/>
<text x="415" y="73" text-anchor="middle" class="tx ac">yields T (moved)</text>
<rect class="ghost" x="130" y="104" width="140" height="30" rx="6"/>
<text x="200" y="123" text-anchor="middle" class="mut" font-size="10">vec unusable after</text>
<!-- row2: iter -->
<text x="20" y="170" class="tx">.iter()</text>
<rect class="box" x="130" y="150" width="140" height="36" rx="6"/>
<text x="200" y="173" text-anchor="middle" class="tx">vec (owner)</text>
<path class="ln" d="M270 168H340" marker-end="url(#ci10-arrow)"/>
<rect class="box" x="340" y="150" width="150" height="36" rx="6"/>
<text x="415" y="173" text-anchor="middle" class="tx">yields &amp;T</text>
<path class="ln" d="M200 186V206" marker-end="url(#ci10-arrow)"/>
<rect class="box" x="130" y="206" width="140" height="26" rx="6"/>
<text x="200" y="223" text-anchor="middle" class="mut" font-size="10">vec still usable</text>
<text x="620" y="70" class="mut">no clone needed, but vec is gone</text>
<text x="620" y="170" class="mut">read-only, vec reusable after</text>
</svg>
</div>

## `.into_iter()` vs `.iter()`
| .into_iter() | .iter() |
|--------------|---------|
| Consumes the Vec (takes ownership). | Borrows the Vec immutably. |
| Yields owned values (T). | Yields references (&T). |
| Original Vec is unusable afterward. | Original Vec remains intact. |

## When to Use .into_iter()

### Need Ownership of Elements

Useful when you want to move elements out of the Vec (e.g., transferring to another collection):

```rust
let vec = vec![String::from("a"), String::from("b")];
let new_vec: Vec<String> = vec.into_iter().collect();  // `vec` is consumed
// println!("{:?}", vec);  // ERROR: `vec` moved
```

### Destructive Operations

For operations that destroy the Vec (e.g., sorting and deduplicating in one pass):

```rust
let mut vec = vec![3, 1, 2, 1];
vec = vec.into_iter().unique().sorted().collect();  // Destructive but efficient
```

### Performance Optimization

Avoids cloning when working with owned data (e.g., Vec<String>):

```rust
let vec = vec![String::from("rust")];
for s in vec.into_iter() {  // No clone, moves `String`
    println!("{}", s);
}
```

<div class="svg-container" style="margin:2rem 0;">
<svg class="ci10b-fig" viewBox="0 0 800 270" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Side by side: iter yields a reference so owning the String needs a clone and a second heap buffer, while into_iter hands over the original buffer with no allocation">
<!-- style -->
<style>
.ci10b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .ci10b-fig,[data-theme="dark"] .ci10b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.ci10b-fig .bg{fill:var(--bg)}
.ci10b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.ci10b-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.ci10b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.ci10b-fig .title{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.ci10b-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif}
.ci10b-fig .ac{fill:var(--ac)}
.ci10b-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.ci10b-fig .acln{stroke:var(--ac);stroke-width:2;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="ci10b-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ln)"/></marker>
<marker id="ci10b-arrowac" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ac)"/></marker>
</defs>
<!-- bg -->
<rect class="bg" x="0" y="0" width="800" height="270" rx="8"/>
<!-- title -->
<text x="400" y="26" text-anchor="middle" class="title">Getting an owned String out of Vec&lt;String&gt;</text>
<!-- left column: iter + clone -->
<rect class="box" x="80" y="52" width="260" height="36" rx="6"/>
<text x="210" y="75" text-anchor="middle" class="tx">.iter() yields &amp;String</text>
<path class="ln" d="M210 88V110" marker-end="url(#ci10b-arrow)"/>
<rect class="box" x="80" y="110" width="260" height="36" rx="6"/>
<text x="210" y="133" text-anchor="middle" class="tx">.clone() to own it</text>
<path class="ln" d="M210 146V168" marker-end="url(#ci10b-arrow)"/>
<rect class="box" x="80" y="168" width="260" height="36" rx="6"/>
<text x="210" y="191" text-anchor="middle" class="tx">second heap buffer + memcpy</text>
<text x="210" y="226" text-anchor="middle" class="mut">vec still owns the original</text>
<!-- right column: into_iter -->
<rect class="acbox" x="460" y="52" width="260" height="36" rx="6"/>
<text x="590" y="75" text-anchor="middle" class="tx ac">.into_iter() yields String</text>
<path class="acln" d="M590 88V110" marker-end="url(#ci10b-arrowac)"/>
<rect class="box" x="460" y="110" width="260" height="36" rx="6"/>
<text x="590" y="133" text-anchor="middle" class="tx">the buffer pointer moves out</text>
<path class="acln" d="M590 146V168" marker-end="url(#ci10b-arrowac)"/>
<rect class="acbox" x="460" y="168" width="260" height="36" rx="6"/>
<text x="590" y="191" text-anchor="middle" class="tx ac">zero new allocations</text>
<text x="590" y="226" text-anchor="middle" class="mut">vec is consumed and gone</text>
<!-- footer -->
<text x="400" y="252" text-anchor="middle" class="mut">For Copy types like i32 both paths compile to the same code; the saving only shows up on owned data.</text>
</svg>
</div>

## Ownership Implications

### After .into_iter(), the original Vec is moved and can't be used:

```rust
let vec = vec![1, 2, 3];
let iter = vec.into_iter();  // `vec` is moved here
// println!("{:?}", vec);    // ERROR: value borrowed after move
```

### Works with non-Copy types (e.g., String, Box<T>):

```rust
let vec = vec![String::from("hello")];
let s = vec.into_iter().next().unwrap();  // Moves the `String` out
```

## Comparison with .iter()

| Scenario | .into_iter() | .iter() |
|----------|--------------|---------|
| Need to reuse the Vec | ❌ No | ✅ Yes |
| Modify elements | ❌ No (consumed) | ✅ Yes (iter_mut()) |
| Avoid cloning owned data | ✅ Yes | ❌ No (requires clone()) |

## Real-World Examples

### Transferring Data

Moving a Vec into a function that takes ownership:

```rust
fn process(data: impl Iterator<Item = String>) { /* ... */ }
let vec = vec![String::from("a"), String::from("b")];
process(vec.into_iter());  // Efficient, no clones
```

### Destructive Filtering

Remove elements while iterating:

```rust
let vec = vec![1, 2, 3, 4];
let evens: Vec<_> = vec.into_iter().filter(|x| x % 2 == 0).collect();
```

## Performance Considerations

- **Zero-cost for primitives (i32, bool)**: `.into_iter()` and `.iter()` compile to the same assembly if `T: Copy`.
- **Avoids allocations** when chaining adapters (e.g., `.map().filter()`).

## Choosing between them
**Use .into_iter() to**:
- Move elements out of a Vec.
- Optimize performance with owned data.
- Destructively transform collections.

**Avoid if you need to**:
- Reuse the Vec after iteration.
- Share references across threads (`&T` is Sync; `T` might not be).

A trap worth knowing about: call `.into_iter()` on a `Vec` and then hand the same `Vec` to
`rayon` and you get a compile error, because the first call consumed it. For parallel
read-only work reach for `.par_iter()` and never give up ownership in the first place.
