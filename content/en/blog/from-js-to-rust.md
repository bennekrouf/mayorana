---
id: move-closures-rust
title: 'Understanding Rust Move Closures: A Guide for JavaScript Developers'
slug: move-closures-rust-javascript-developers
locale: en
author: mayo
excerpt: >-
  Learn how Rust move closures work compared to JavaScript closures - ownership,
  threading, and when to use the move keyword
tags:
  - rust
  - closures
  - javascript
  - typescript
date: '2025-11-02'
---

# Understanding Rust Move Closures: A Guide for JavaScript Developers

Coming from JavaScript? Closures work differently in Rust. A `move` closure forces ownership transfer of captured variables—no shared references like JS. This is the bridge between JavaScript's automatic closures and Rust's ownership model.

<div class="svg-container" style="margin:2rem 0;">
<svg class="moveclo-fig" viewBox="0 0 800 300" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="JavaScript closures share a reference to the captured variable, while Rust move closures take ownership and the original becomes inaccessible">
<style>
.moveclo-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .moveclo-fig,[data-theme="dark"] .moveclo-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.moveclo-fig text{font-family:ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.moveclo-fig .title{font-size:14px;font-weight:700}
.moveclo-fig .body{font-size:12px;font-weight:600}
.moveclo-fig .cap{font-size:11px;fill:var(--mut)}
.moveclo-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.moveclo-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.moveclo-fig .acln{stroke:var(--ac);stroke-width:2;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="moveclo-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"></path>
</marker>
<marker id="moveclo-arrow-ac" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ac)"></path>
</marker>
</defs>
<!-- column titles -->
<text x="210" y="25" text-anchor="middle" class="title">JavaScript</text>
<text x="590" y="25" text-anchor="middle" class="title">Rust move closure</text>
<!-- js outer -->
<rect class="box" x="70" y="45" width="280" height="55" rx="8"></rect>
<text x="210" y="68" text-anchor="middle" class="body">outer scope: count</text>
<text x="210" y="86" text-anchor="middle" class="cap">stays valid after capture</text>
<!-- js closure -->
<rect class="box" x="70" y="190" width="280" height="55" rx="8"></rect>
<text x="210" y="213" text-anchor="middle" class="body">closure: count++</text>
<text x="210" y="231" text-anchor="middle" class="cap">captures by reference</text>
<!-- js bidirectional arrow -->
<path class="ln" d="M210,100 L210,190" marker-end="url(#moveclo-arrow)" marker-start="url(#moveclo-arrow)"></path>
<text x="255" y="150" text-anchor="middle" class="cap">shared</text>
<!-- rust outer -->
<rect class="box" x="450" y="45" width="280" height="55" rx="8"></rect>
<text x="590" y="68" text-anchor="middle" class="body">outer scope: count</text>
<text x="590" y="86" text-anchor="middle" class="cap">no longer accessible</text>
<!-- rust closure -->
<rect class="box" x="450" y="190" width="280" height="55" rx="8"></rect>
<text x="590" y="213" text-anchor="middle" class="body">move closure</text>
<text x="590" y="231" text-anchor="middle" class="cap">owns count exclusively</text>
<!-- rust one-way move arrow -->
<path class="acln" d="M590,100 L590,190" marker-end="url(#moveclo-arrow-ac)"></path>
<text x="630" y="150" text-anchor="middle" class="cap" fill="var(--ac)">move</text>
<!-- caption -->
<text x="400" y="285" text-anchor="middle" class="cap">JS: implicit shared reference — Rust: explicit, compiler-enforced ownership transfer</text>
</svg>
</div>

## The JavaScript Baseline

In JavaScript, closures capture variables by reference automatically:

```javascript
const makeCounter = () => {
  let count = 0;
  return () => count++; // captures `count` by reference
};

const counter = makeCounter();
console.log(counter()); // 0
console.log(counter()); // 1
```

The closure shares the same `count` variable. No copying, no moving—just a reference that lives as long as the closure does.

## Rust's Explicit Choice

Rust makes you choose: borrow or own. Regular closures borrow:

```rust
let mut count = 0;
let increment = || count += 1; // borrows `count` mutably
```

`move` closures take ownership:

```rust
let count = 0;
let increment = move || count + 1; // `count` moved/copied into closure
```

### Ownership Transfer Mechanics

For **non-Copy** types like `String` or `Vec`, the closure takes ownership:

```rust
let s = String::from("hello");
let closure = move || println!("{}", s); // `s` moved into closure
// println!("{}", s); // ERROR: `s` no longer valid
```

For **Copy** types like `i32` or `bool`, the value is copied:

```rust
let x = 42;
let closure = move || println!("{}", x); // `x` copied
println!("{}", x); // OK: original `x` still valid
```

### When You Need `move`

Three situations force the keyword, and they all reduce to the same question — one JavaScript never asks you:

<div class="svg-container" style="margin:2rem 0;">
<svg class="jsrsb-fig" viewBox="0 0 800 420" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Decision tree: if a closure outlives its scope or must be Send, use move, then Copy types are copied while non-Copy types invalidate the original; otherwise a plain borrowing closure is enough">
<style>
.jsrsb-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .jsrsb-fig,[data-theme="dark"] .jsrsb-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.jsrsb-fig text{font-family:ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.jsrsb-fig .title{font-size:13px;font-weight:700}
.jsrsb-fig .body{font-size:12px;font-weight:600}
.jsrsb-fig .cap{font-size:11px;fill:var(--mut)}
.jsrsb-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.jsrsb-fig .qbox{fill:var(--bg);stroke:var(--ln);stroke-width:1.5}
.jsrsb-fig .acbox{fill:var(--ac);stroke:var(--ac)}
.jsrsb-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.jsrsb-fig .acln{stroke:var(--ac);stroke-width:2;fill:none}
.jsrsb-fig .lbl{font-size:11px;font-weight:700;fill:var(--mut)}
</style>
<!-- defs -->
<defs>
<marker id="jsrsb-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"></path>
</marker>
<marker id="jsrsb-arrowac" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ac)"></path>
</marker>
</defs>
<!-- start -->
<rect class="box" x="280" y="20" width="240" height="50" rx="8"></rect>
<text x="400" y="42" text-anchor="middle" class="body">a closure captures a variable</text>
<text x="400" y="60" text-anchor="middle" class="cap">count, data, state …</text>
<path class="ln" d="M400,70 L400,94" marker-end="url(#jsrsb-arrow)"></path>
<!-- question -->
<rect class="qbox" x="180" y="94" width="440" height="58" rx="8"></rect>
<text x="400" y="118" text-anchor="middle" class="title">Does it outlive the scope, or must it be Send?</text>
<text x="400" y="138" text-anchor="middle" class="cap">thread::spawn · returned impl Fn · tokio::spawn</text>
<!-- split -->
<path class="ln" d="M400,152 L400,176"></path>
<path class="ln" d="M205,176 L595,176"></path>
<path class="ln" d="M205,176 L205,206" marker-end="url(#jsrsb-arrow)"></path>
<path class="acln" d="M595,176 L595,206" marker-end="url(#jsrsb-arrowac)"></path>
<text x="185" y="196" text-anchor="end" class="lbl">no</text>
<text x="615" y="196" class="lbl" fill="var(--ac)">yes</text>
<!-- borrow branch -->
<rect class="box" x="60" y="206" width="290" height="56" rx="8"></rect>
<text x="205" y="230" text-anchor="middle" class="title">plain closure — borrows</text>
<text x="205" y="250" text-anchor="middle" class="cap">borrow checker picks &amp;, &amp;mut, or by-value</text>
<path class="ln" d="M205,262 L205,300" marker-end="url(#jsrsb-arrow)"></path>
<rect class="box" x="60" y="300" width="290" height="64" rx="8"></rect>
<text x="205" y="324" text-anchor="middle" class="body">original stays usable</text>
<text x="205" y="343" text-anchor="middle" class="cap">iterator adapters, short-lived</text>
<text x="205" y="357" text-anchor="middle" class="cap">callbacks — the JS default</text>
<!-- move branch -->
<rect class="acbox" x="450" y="206" width="290" height="56" rx="8"></rect>
<text x="595" y="230" text-anchor="middle" class="title" fill="#ffffff">move closure — owns</text>
<text x="595" y="250" text-anchor="middle" class="body" fill="#ffffff">captures live as long as the closure</text>
<!-- move branch split by Copy-ness -->
<path class="ln" d="M595,262 L595,280"></path>
<path class="ln" d="M505,280 L690,280"></path>
<path class="ln" d="M505,280 L505,300" marker-end="url(#jsrsb-arrow)"></path>
<path class="ln" d="M690,280 L690,300" marker-end="url(#jsrsb-arrow)"></path>
<rect class="box" x="420" y="300" width="170" height="64" rx="8"></rect>
<text x="505" y="324" text-anchor="middle" class="body">Copy: i32, bool</text>
<text x="505" y="343" text-anchor="middle" class="cap">value copied —</text>
<text x="505" y="357" text-anchor="middle" class="cap">original still valid</text>
<rect class="box" x="610" y="300" width="170" height="64" rx="8"></rect>
<text x="695" y="324" text-anchor="middle" class="body">String, Vec</text>
<text x="695" y="343" text-anchor="middle" class="cap">moved —</text>
<text x="695" y="357" text-anchor="middle" class="cap">original invalidated</text>
<!-- caption -->
<text x="400" y="396" text-anchor="middle" class="cap">The same question JavaScript answers for you with a garbage collector, Rust makes you answer with a keyword</text>
</svg>
</div>

#### Threading

In JavaScript, you'd share state across async operations without thinking:

```javascript
const data = [1, 2, 3];
setTimeout(() => {
  console.log(data); // just works
}, 100);
```

Rust threads must own their data:

```rust
use std::thread;

let data = vec![1, 2, 3];
let handle = thread::spawn(move || {
    println!("{:?}", data); // `data` owned by thread
});
// println!("{:?}", data); // ERROR: moved
handle.join().unwrap();
```

Without `move`, the compiler rejects this—the thread might outlive `data`.

#### Returning Closures

JavaScript factories work by reference:

```javascript
const makeAdder = (x) => (y) => x + y; // `x` captured by reference

const addFive = makeAdder(5);
console.log(addFive(3)); // 8
```

Rust closures must own what they outlive:

```rust
fn make_adder(x: i32) -> impl Fn(i32) -> i32 {
    move |y| x + y // `x` must be moved
}

let add_five = make_adder(5);
println!("{}", add_five(3)); // 8
```

The closure outlives the function scope, so it needs ownership of `x`.

#### Async Blocks

Similar to threads, async blocks often need `move` when sent across tasks:

```rust
let value = String::from("async");
let future = async move {
    println!("{}", value);
};
// tokio::spawn requires 'static lifetime
tokio::spawn(future);
```

### Borrow vs Own: The Core Difference

JavaScript closures always share:

```javascript
let count = 0;
const increment = () => count += 1;
increment();
console.log(count); // 1 - same `count`
```

Rust regular closures borrow:

```rust
let mut count = 0;
let mut increment = || count += 1; // mutable borrow
increment();
println!("{}", count); // 1 - same `count`
```

Rust `move` closures own:

```rust
let mut count = 0;
let mut increment = move || count += 1; // `count` moved
increment();
// println!("{}", count); // ERROR: `count` moved
```

The moved `count` is independent—changes inside don't affect the original.

## The Paradigm Shift from JavaScript

JavaScript: closures capture by reference implicitly. The GC manages lifetime. You never think about ownership:

```javascript
const createHandler = () => {
  const state = { count: 0 };
  return () => state.count++; // reference lives as long as needed
};
```

Rust: you choose explicitly. Borrow for local use. Move for ownership transfer:

```rust
fn create_handler() -> impl FnMut() -> i32 {
    let mut state = 0;
    move || {
        state += 1;
        state
    } // `state` owned by closure
}
```

This prevents data races and use-after-free at compile time—guarantees JavaScript can't make.

## Summary

| Scenario | Use `move` | Reason |
|----------|-----------|---------|
| Threading | Yes | Thread may outlive scope |
| Returning closures | Yes | Closure outlives function |
| Async tasks | Often | Task needs 'static lifetime |
| Local use | No | Borrowing is sufficient |

**Core principle:** If a closure outlives its environment or needs to be `Send`, use `move`. Otherwise, let the borrow checker choose the minimal capture mode.

The `move` keyword is Rust's way of saying: "This closure now owns these variables." It's not just syntax—it's a contract enforced at compile time, eliminating entire classes of runtime errors that plague languages with garbage collection.
