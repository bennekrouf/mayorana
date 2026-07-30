---
id: collect-method-rust
title: 'Rust''s collect() Magic: Turning Iterators into Vecs, HashMaps, and Strings!'
slug: collect-method-rust
locale: "en"
author: mayo
excerpt: 'Collections (like Vec), iterators (into_iter, collect), and related concepts'
tags:
  - rust
  - iterators
  - collections
date: '2025-07-16'
---

# How does collect() work in Rust? Show how to convert an iterator into a Vec, HashMap, or String.

`collect()` is a method that converts an iterator into a collection. It relies on Rust’s `FromIterator` trait, which defines how to build a type from an iterator.

<div class="svg-container" style="margin:2rem 0;">
<svg class="ci3-fig" viewBox="0 0 800 260" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="An iterator flows into collect(), which fans out into a Vec, HashMap, or String depending on the target type">
<!-- style -->
<style>
.ci3-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .ci3-fig,[data-theme="dark"] .ci3-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.ci3-fig .bg{fill:var(--bg)}
.ci3-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.ci3-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.ci3-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.ci3-fig .title{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.ci3-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif}
.ci3-fig .ac{fill:var(--ac)}
.ci3-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="ci3-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ln)"/></marker>
</defs>
<!-- bg -->
<rect class="bg" x="0" y="0" width="800" height="260" rx="8"/>
<!-- title -->
<text x="400" y="26" text-anchor="middle" class="title">collect() via FromIterator</text>
<!-- source box -->
<rect class="box" x="300" y="42" width="200" height="36" rx="6"/>
<text x="400" y="65" text-anchor="middle" class="tx">Iterator&lt;Item=T&gt;</text>
<!-- arrow to collect -->
<path class="ln" d="M400 78V102" marker-end="url(#ci3-arrow)"/>
<rect class="acbox" x="320" y="102" width="160" height="36" rx="6"/>
<text x="400" y="125" text-anchor="middle" class="tx ac">collect()</text>
<!-- Y merge then split to 3 targets -->
<path class="ln" d="M400 138V158"/>
<path class="ln" d="M140 158H660"/>
<path class="ln" d="M140 158V178" marker-end="url(#ci3-arrow)"/>
<path class="ln" d="M400 158V178" marker-end="url(#ci3-arrow)"/>
<path class="ln" d="M660 158V178" marker-end="url(#ci3-arrow)"/>
<!-- target boxes -->
<rect class="box" x="60" y="178" width="160" height="36" rx="6"/>
<text x="140" y="201" text-anchor="middle" class="tx">Vec&lt;T&gt;</text>
<rect class="box" x="320" y="178" width="160" height="36" rx="6"/>
<text x="400" y="201" text-anchor="middle" class="tx">HashMap&lt;K,V&gt;</text>
<rect class="box" x="580" y="178" width="160" height="36" rx="6"/>
<text x="660" y="201" text-anchor="middle" class="tx">String</text>
<!-- captions -->
<text x="140" y="230" text-anchor="middle" class="mut">from a plain iterator</text>
<text x="400" y="230" text-anchor="middle" class="mut">from (K, V) tuples</text>
<text x="660" y="230" text-anchor="middle" class="mut">from chars or &amp;str</text>
<text x="400" y="252" text-anchor="middle" class="mut">The target type must implement FromIterator; the compiler infers which impl to call</text>
</svg>
</div>

## Key Mechanics

- **Lazy Evaluation**: Iterators are lazy—`collect()` triggers consumption.
- **Type Inference**: The target collection type must be specified (or inferable).
- **Flexibility**: Works with any type implementing `FromIterator`.

## Converting to Common Collections

### 1. Iterator → `Vec<T>`

```rust
let numbers = 1..5;                 // Range (implements Iterator)
let vec: Vec<_> = numbers.collect(); // Vec<i32> == [1, 2, 3, 4]
```

**Note**: `Vec<_>` lets Rust infer the inner type (`i32` here).

### 2. Iterator → `HashMap<K, V>`

Requires tuples of `(K, V)` pairs:
```rust
use std::collections::HashMap;

let pairs = vec![("a", 1), ("b", 2)].into_iter();
let map: HashMap<_, _> = pairs.collect(); // HashMap<&str, i32>
```

**Alternate Syntax** (with turbofish):
```rust
let map = pairs.collect::<HashMap<&str, i32>>();
```

### 3. Iterator → `String`

Combine characters or strings:
```rust
let chars = ['R', 'u', 's', 't'].iter();
let s: String = chars.collect(); // "Rust"

// Or concatenate strings:
let words = vec!["Hello", " ", "World"].into_iter();
let s: String = words.collect(); // "Hello World"
```

## How `collect()` Works Internally

- **`FromIterator` Trait**:
  Collections implement this to define their construction logic:
  ```rust
  pub trait FromIterator<A> {
      fn from_iter<T>(iter: T) -> Self
      where
          T: IntoIterator<Item = A>;
  }
  ```

- **Compiler Magic**: Rust infers the target type based on context or annotations.

<div class="svg-container" style="margin:2rem 0;">
<svg class="ci3b-fig" viewBox="0 0 800 300" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Three kinds of type annotation converge on type inference, which selects the FromIterator impl; with no annotation at all the compile fails">
<!-- style -->
<style>
.ci3b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .ci3b-fig,[data-theme="dark"] .ci3b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.ci3b-fig .bg{fill:var(--bg)}
.ci3b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.ci3b-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.ci3b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.ci3b-fig .title{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.ci3b-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif}
.ci3b-fig .ac{fill:var(--ac)}
.ci3b-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="ci3b-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ln)"/></marker>
</defs>
<!-- bg -->
<rect class="bg" x="0" y="0" width="800" height="300" rx="8"/>
<!-- title -->
<text x="400" y="26" text-anchor="middle" class="title">Where collect() gets its target type</text>
<!-- three annotation sources -->
<rect class="box" x="30" y="48" width="220" height="36" rx="6"/>
<text x="140" y="71" text-anchor="middle" class="tx">let v: Vec&lt;_&gt; = …</text>
<rect class="box" x="290" y="48" width="220" height="36" rx="6"/>
<text x="400" y="71" text-anchor="middle" class="tx">collect::&lt;HashMap&lt;_,_&gt;&gt;()</text>
<rect class="box" x="550" y="48" width="220" height="36" rx="6"/>
<text x="660" y="71" text-anchor="middle" class="tx">fn f() -&gt; String { … }</text>
<!-- Y merge into inference -->
<path class="ln" d="M140 84V104"/>
<path class="ln" d="M400 84V104"/>
<path class="ln" d="M660 84V104"/>
<path class="ln" d="M140 104H660"/>
<path class="ln" d="M400 104V124" marker-end="url(#ci3b-arrow)"/>
<rect class="acbox" x="280" y="124" width="240" height="36" rx="6"/>
<text x="400" y="147" text-anchor="middle" class="tx ac">type inference picks the impl</text>
<!-- to construction -->
<path class="ln" d="M400 160V184" marker-end="url(#ci3b-arrow)"/>
<rect class="box" x="230" y="184" width="340" height="34" rx="6"/>
<text x="400" y="205" text-anchor="middle" class="tx">FromIterator::from_iter builds it</text>
<!-- failure branch -->
<text x="60" y="240" class="mut">with no annotation anywhere:</text>
<rect class="box" x="60" y="250" width="250" height="34" rx="6"/>
<text x="185" y="271" text-anchor="middle" class="tx">let n = it.collect();</text>
<path class="ln" d="M310 267H420" marker-end="url(#ci3b-arrow)"/>
<rect class="box" x="420" y="250" width="320" height="34" rx="6"/>
<text x="580" y="271" text-anchor="middle" class="tx">error: type annotations needed</text>
</svg>
</div>

## Advanced Uses

### Conditional Collection

Convert only even numbers to a `Vec`:
```rust
let evens: Vec<_> = (1..10).filter(|x| x % 2 == 0).collect(); // [2, 4, 6, 8]
```

### Custom Types

Implement `FromIterator` for your types:
```rust
struct MyCollection(Vec<i32>);

impl FromIterator<i32> for MyCollection {
    fn from_iter<I: IntoIterator<Item = i32>>(iter: I) -> Self {
        MyCollection(iter.into_iter().collect())
    }
}

let nums = MyCollection::from_iter(1..=3); // MyCollection([1, 2, 3])
```

## Performance Notes

- **Pre-allocated Collections**: Use `with_capacity` + `extend()` if size is known:
  ```rust
  let mut vec = Vec::with_capacity(100);
  vec.extend(1..=100);  // Faster than collect() for large iterables
  ```

- **Zero-Cost Abstractions**: `collect()` is optimized (e.g., `Vec` from ranges avoids bounds checks).

## Common Pitfalls

- **Ambiguous Types**:
  Fails if Rust can’t infer the target:
  ```rust
  let nums = vec![1, 2].into_iter().collect(); // ERROR: type annotations needed
  ```

- **Ownership Issues**:
  Consumes the iterator:
  ```rust
  let iter = vec![1, 2].into_iter();
  let _ = iter.collect::<Vec<_>>();
  // iter.next(); // ERROR: iter consumed by collect()
  ```

## Key Takeaways

✅ Use `collect()` to materialize iterators into:
- `Vec`, `HashMap`, `String`, or any `FromIterator` type.
✅ Specify the type (e.g., `let v: Vec<_> = ...`).
🚀 Optimize with `with_capacity` for large collections.

**Real-World Example**:
`serde_json::from_str` often chains with `collect()` to build complex structures:
```rust
let data: Vec<u8> = "123".bytes().collect(); // [49, 50, 51] (ASCII values)
```
