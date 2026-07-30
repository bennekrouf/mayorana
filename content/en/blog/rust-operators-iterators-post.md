---
id: rust-comparison-operators-iterators
title: 'Rust Operators & Iterators: Quick Reference'
locale: en
slug: rust-comparison-operators-iterators
date: '2025-08-10'
author: mayo
excerpt: >-
  Essential Rust operators, iterator differences, and Unicode handling you need
  to know.

tags:
  - rust
  - operators
  - iterators
---

# Rust Operators & Iterators: What You Need to Know

Quick reference for common Rust gotchas and patterns.

## Comparison Operators

Rust keeps it simple:
```rust
x == y    // Equal
x != y    // Not equal
x < y     // Less than
x > y     // Greater than
```

**No `<>`, `===`, or `!==`** like other languages. Just `==` and `!=`.

## Iterator vs Collection

Know what's iterable:
```rust
3..10                    // ✅ Iterator
["a", "b"]              // ❌ Array (use .iter())
vec!["x", "y"]          // ❌ Vec (use .iter() or .into_iter())
```

## iter() vs into_iter()

```rust
let arr = ["a", "b", "c"];

arr.iter()        // &&str (reference to reference)
arr.into_iter()   // &str (cleaner, preferred)
```

Use `into_iter()` for arrays - one less reference level.

<div class="svg-container" style="margin:2rem 0;">
<svg class="riter-fig" viewBox="0 0 800 260" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="An array iterated with iter() yields double references, while into_iter() yields a single reference level" >
<style>
.riter-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .riter-fig,[data-theme="dark"] .riter-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.riter-fig text{font-family:ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.riter-fig .title{font-size:14px;font-weight:700}
.riter-fig .body{font-size:12px;font-weight:600}
.riter-fig .cap{font-size:11px;fill:var(--mut)}
.riter-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.riter-fig .acbox{fill:var(--ac);stroke:var(--ac)}
.riter-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="riter-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"></path>
</marker>
</defs>
<!-- source -->
<rect class="box" x="300" y="20" width="200" height="50" rx="8"></rect>
<text x="400" y="50" text-anchor="middle" class="body">arr = ["a","b","c"]</text>
<!-- fan out -->
<path class="ln" d="M400,70 L400,100"></path>
<path class="ln" d="M210,100 L590,100"></path>
<path class="ln" d="M210,100 L210,150" marker-end="url(#riter-arrow)"></path>
<path class="ln" d="M590,100 L590,150" marker-end="url(#riter-arrow)"></path>
<!-- left: iter() -->
<rect class="box" x="80" y="150" width="260" height="80" rx="8"></rect>
<text x="210" y="178" text-anchor="middle" class="title">.iter()</text>
<text x="210" y="198" text-anchor="middle" class="body">&amp;&amp;str</text>
<text x="210" y="216" text-anchor="middle" class="cap">reference to a reference</text>
<!-- right: into_iter() accent -->
<rect class="acbox" x="460" y="150" width="260" height="80" rx="8"></rect>
<text x="590" y="178" text-anchor="middle" class="title" fill="#ffffff">.into_iter()</text>
<text x="590" y="198" text-anchor="middle" class="body" fill="#ffffff">&amp;str</text>
<text x="590" y="216" text-anchor="middle" class="cap" fill="#ffffff">one less level — preferred</text>
</svg>
</div>

## Unicode from Char

```rust
let c = '🦀';
let code = c as u32;           // 129408
println!("U+{:04X}", code);   // U+1F980
```

## What Has .sort()?

Only **mutable slices**:
```rust
let mut vec = vec![3, 1, 4];
vec.sort();  // ✅

let mut arr = [3, 1, 4];
arr.sort();  // ✅

// Iterators need .collect() first
let sorted: Vec<_> = iter.collect().sort();  // ❌
let mut sorted: Vec<_> = iter.collect();     // ✅
sorted.sort();
```

The reason is the shape of the data, not the syntax. An iterator is a lazy recipe with no length and no indices; sorting needs to swap elements in place, so it needs an owned, contiguous, *mutable* slice first:

<div class="svg-container" style="margin:2rem 0;">
<svg class="riterb-fig" viewBox="0 0 800 300" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Pipeline from a lazy iterator through collect into a mutable Vec before sort can run in place, with the one-line chained version shown as invalid">
<style>
.riterb-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .riterb-fig,[data-theme="dark"] .riterb-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.riterb-fig text{font-family:ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.riterb-fig .title{font-size:13px;font-weight:700}
.riterb-fig .body{font-size:12px;font-weight:600}
.riterb-fig .cap{font-size:11px;fill:var(--mut)}
.riterb-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.riterb-fig .bad{fill:var(--bg);stroke:var(--mut);stroke-width:1.5;stroke-dasharray:5 4}
.riterb-fig .acbox{fill:var(--ac);stroke:var(--ac)}
.riterb-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.riterb-fig .badln{stroke:var(--mut);stroke-width:1.5;fill:none;stroke-dasharray:5 4}
</style>
<!-- defs -->
<defs>
<marker id="riterb-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"></path>
</marker>
<marker id="riterb-arrowm" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--mut)"></path>
</marker>
</defs>
<!-- stage 1 -->
<rect class="box" x="20" y="50" width="160" height="86" rx="8"></rect>
<text x="100" y="78" text-anchor="middle" class="title">iterator</text>
<text x="100" y="100" text-anchor="middle" class="body">3..10, v.iter()</text>
<text x="100" y="120" text-anchor="middle" class="cap">lazy, no length</text>
<path class="ln" d="M180,93 L210,93" marker-end="url(#riterb-arrow)"></path>
<!-- stage 2 -->
<rect class="box" x="210" y="50" width="160" height="86" rx="8"></rect>
<text x="290" y="78" text-anchor="middle" class="title">.collect()</text>
<text x="290" y="100" text-anchor="middle" class="body">Vec&lt;_&gt;</text>
<text x="290" y="120" text-anchor="middle" class="cap">values materialized</text>
<path class="ln" d="M370,93 L400,93" marker-end="url(#riterb-arrow)"></path>
<!-- stage 3 -->
<rect class="box" x="400" y="50" width="160" height="86" rx="8"></rect>
<text x="480" y="78" text-anchor="middle" class="title">let mut v</text>
<text x="480" y="100" text-anchor="middle" class="body">&amp;mut [T]</text>
<text x="480" y="120" text-anchor="middle" class="cap">a mutable slice</text>
<path class="ln" d="M560,93 L590,93" marker-end="url(#riterb-arrow)"></path>
<!-- stage 4 accent -->
<rect class="acbox" x="590" y="50" width="160" height="86" rx="8"></rect>
<text x="670" y="78" text-anchor="middle" class="title" fill="#ffffff">v.sort()</text>
<text x="670" y="100" text-anchor="middle" class="body" fill="#ffffff">swaps in place</text>
<text x="670" y="120" text-anchor="middle" class="cap" fill="#ffffff">evaluates to ()</text>
<!-- the tempting one-liner -->
<path class="badln" d="M290,136 L290,180" marker-end="url(#riterb-arrowm)"></path>
<rect class="bad" x="115" y="180" width="450" height="66" rx="8"></rect>
<text x="340" y="206" text-anchor="middle" class="body" fill="var(--mut)">iter.collect().sort()</text>
<text x="340" y="228" text-anchor="middle" class="cap">nothing is bound as mut, and sort() gives back () — not the Vec</text>
<!-- caption -->
<text x="400" y="280" text-anchor="middle" class="cap">Only mutable slices have .sort() — an iterator has to become one first</text>
</svg>
</div>

## into() vs into_iter()

Different purposes:
```rust
"hello".into()           // Type conversion (&str -> String)
vec![1,2,3].into_iter()  // Creates iterator
```

**Remember**: `into()` converts types, `into_iter()` makes iterators.
