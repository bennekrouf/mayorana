---
id: move-closures-rust
title: >-
  What are move closures (move || { ... })? When are they necessary, and how do
  they interact with ownership?
slug: move-closures-rust
locale: "en"
date: '2025-07-08'
author: mayo
excerpt: 'Functions and closures in Rust, covering ownership, traits, lifetimes'
tags:
  - rust
  - closures
---

# What are move closures (move || { ... })? When are they necessary, and how do they interact with ownership?

A `move` closure (defined with the `move` keyword) forces the closure to take ownership of variables it captures from the environment. Unlike regular closures, which capture variables by reference (immutable or mutable) when possible, `move` closures move or copy the variables into the closure itself.

<div class="svg-container" style="margin:2rem 0;">
<svg class="cl4-fig" viewBox="0 0 800 380" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="move transfers ownership of captured data into the closure so it can outlive its original scope">
<!-- style -->
<style>
.cl4-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .cl4-fig,[data-theme="dark"] .cl4-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cl4-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.cl4-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.cl4-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.cl4-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl4-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.cl4-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="cl4arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
</defs>
<!-- title -->
<text x="400" y="18" text-anchor="middle" class="ti">move transfers ownership into the closure so it can outlive its scope</text>
<!-- box1 -->
<rect x="250" y="40" width="300" height="60" rx="6" class="box"/>
<text x="400" y="65" text-anchor="middle" class="tx">let data = String::from("hi");</text>
<text x="400" y="83" text-anchor="middle" class="mut">owned in main's scope</text>
<!-- arrow -->
<path d="M400,100 L400,130" class="ln" marker-end="url(#cl4arrow)"/>
<!-- box2 -->
<rect x="250" y="130" width="300" height="70" rx="6" class="boxac"/>
<text x="400" y="155" text-anchor="middle" class="tx">move || println!("{}", data)</text>
<text x="400" y="173" text-anchor="middle" class="mut">closure now owns `data`</text>
<!-- arrow -->
<path d="M400,200 L400,230" class="ln" marker-end="url(#cl4arrow)"/>
<!-- box3 -->
<rect x="250" y="230" width="300" height="70" rx="6" class="box"/>
<text x="400" y="255" text-anchor="middle" class="tx">thread::spawn(closure)</text>
<text x="400" y="273" text-anchor="middle" class="mut">data lives inside the thread</text>
<!-- caption -->
<text x="400" y="335" text-anchor="middle" class="mut">Without move: closure borrows &amp;data —</text>
<text x="400" y="352" text-anchor="middle" class="mut">risk of a dangling reference if `data` drops first</text>
</svg>
</div>

## Key Mechanics

### 1. Ownership Transfer

- For **non-Copy** types (e.g., `String`, `Vec`), the closure takes ownership of the variable:
  ```rust
  let s = String::from("hello");
  let closure = move || println!("{}", s); // `s` is moved into the closure
  // println!("{}", s); // ERROR: `s` was moved
  ```

- For **Copy** types (e.g., `i32`, `bool`), the closure copies the value:
  ```rust
  let x = 42;
  let closure = move || println!("{}", x); // `x` is copied
  println!("{}", x); // OK: `x` is still valid
  ```

The same `move` keyword produces two completely different outcomes for the original binding, depending on whether the captured type is `Copy`:

<div class="svg-container" style="margin:2rem 0;">
<svg class="cl4b-fig" viewBox="0 0 800 350" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Side-by-side comparison of move capturing a non-Copy String versus a Copy i32 and what happens to the original binding">
<!-- style -->
<style>
.cl4b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .cl4b-fig,[data-theme="dark"] .cl4b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cl4b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.cl4b-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.cl4b-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.cl4b-fig .hd{fill:var(--ac);font:700 13px ui-sans-serif,system-ui,sans-serif}
.cl4b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl4b-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.cl4b-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.cl4b-fig .sep{stroke:var(--ln);stroke-width:1;stroke-dasharray:4 4}
</style>
<!-- defs -->
<defs>
<marker id="cl4b-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
</defs>
<!-- title -->
<text x="400" y="18" text-anchor="middle" class="ti">Same `move`, two outcomes for the original binding</text>
<!-- separator -->
<path d="M400,36 L400,300" class="sep"/>
<!-- headers -->
<text x="210" y="50" text-anchor="middle" class="hd">non-Copy type</text>
<text x="590" y="50" text-anchor="middle" class="hd">Copy type</text>
<!-- left box1 -->
<rect x="40" y="62" width="340" height="52" rx="6" class="box"/>
<text x="210" y="84" text-anchor="middle" class="tx">let s = String::from("hello");</text>
<text x="210" y="102" text-anchor="middle" class="mut">heap buffer, single owner</text>
<!-- right box1 -->
<rect x="420" y="62" width="340" height="52" rx="6" class="box"/>
<text x="590" y="84" text-anchor="middle" class="tx">let x = 42;</text>
<text x="590" y="102" text-anchor="middle" class="mut">4 bytes on the stack</text>
<!-- arrows down -->
<path d="M210,114 L210,144" class="ln" marker-end="url(#cl4b-arrow)"/>
<path d="M590,114 L590,144" class="ln" marker-end="url(#cl4b-arrow)"/>
<!-- left box2 -->
<rect x="40" y="144" width="340" height="58" rx="6" class="boxac"/>
<text x="210" y="168" text-anchor="middle" class="tx">move || println!("{}", s)</text>
<text x="210" y="186" text-anchor="middle" class="mut">buffer relocated into the closure</text>
<!-- right box2 -->
<rect x="420" y="144" width="340" height="58" rx="6" class="boxac"/>
<text x="590" y="168" text-anchor="middle" class="tx">move || println!("{}", x)</text>
<text x="590" y="186" text-anchor="middle" class="mut">bit-for-bit copy stored inside</text>
<!-- arrows down -->
<path d="M210,202 L210,232" class="ln" marker-end="url(#cl4b-arrow)"/>
<path d="M590,202 L590,232" class="ln" marker-end="url(#cl4b-arrow)"/>
<!-- left box3 -->
<rect x="40" y="232" width="340" height="58" rx="6" class="box"/>
<text x="210" y="256" text-anchor="middle" class="tx">println!("{}", s); // E0382</text>
<text x="210" y="274" text-anchor="middle" class="mut">original binding is dead</text>
<!-- right box3 -->
<rect x="420" y="232" width="340" height="58" rx="6" class="box"/>
<text x="590" y="256" text-anchor="middle" class="tx">println!("{}", x); // OK</text>
<text x="590" y="274" text-anchor="middle" class="mut">original still fully usable</text>
<!-- caption -->
<text x="400" y="322" text-anchor="middle" class="mut">This is why `let mut count = 0` mutated inside a move closure leaves the outer</text>
<text x="400" y="338" text-anchor="middle" class="mut">`count` at 0 — the closure has been incrementing its own private copy.</text>
</svg>
</div>

### 2. Interaction with Closure Traits

A `move` closure’s trait (`Fn`, `FnMut`, `FnOnce`) depends on how the captured variables are used:

- **`Fn`**: Read-only access to captured variables.
- **`FnMut`**: Mutates captured variables.
- **`FnOnce`**: Consumes captured variables (e.g., `drop`).

## When Are Move Closures Necessary?

### 1. Closures Outliving Their Environment

When a closure is used in a different scope (e.g., a thread or async task), it must own its data to avoid dangling references:
```rust
use std::thread;

let data = String::from("thread-safe");
thread::spawn(move || { // `move` forces ownership of `data`
    println!("{}", data); // Safe: `data` lives in the closure
}).join().unwrap();
```

### 2. Breaking Reference Cycles

If a closure needs to capture a value that’s also borrowed elsewhere, `move` ensures ownership is transferred:
```rust
let mut vec = vec![1, 2, 3];
let closure = move || { // Takes ownership of `vec`
    // vec.push(4); // ERROR: `vec` is moved (can’t mutate)
};
// vec.push(4); // ERROR: `vec` is moved into closure
```

### 3. Explicit Ownership Control

When you want to avoid accidental borrows or force a copy:
```rust
let x = 42;
let closure = || println!("{}", x); // Borrows `x`
let move_closure = move || println!("{}", x); // Copies `x` (since `i32` is `Copy`)
```

## Examples

### 1. Non-Copy Type (Ownership Moved)
```rust
let s = String::from("hello");
let closure = move || println!("{}", s);
closure(); // Works: closure owns `s`
// closure(); // ERROR if `s` is consumed (e.g., `FnOnce`)
```

### 2. Copy Type (Value Copied)
```rust
let x = 42;
let closure = move || x + 1; // Copies `x`
println!("{}", x); // OK: `x` is `Copy`
```

### 3. Mixing `move` and Mutation
```rust
let mut count = 0;
let mut closure = move || { // `count` is copied (since `i32` is `Copy`)
    count += 1; // Operates on the copied `count`
    count
};
println!("{}", closure()); // 1
println!("{}", closure()); // 2
println!("{}", count); // 0 (original unchanged)
```

## Pitfalls

- **Unintended Moves**:
  ```rust
  let s = String::from("hello");
  let _ = move || println!("{}", s); // `s` moved here
  // println!("{}", s); // ERROR: `s` is gone
  ```

- **Overusing `move`**:
  Unnecessary copies/moves can hurt performance or cause compile errors.

## Key Takeaways

**Use `move` closures when**:
- The closure outlives its environment (e.g., threads).
- You need explicit ownership to avoid borrow checker issues.

**Avoid `move` for**:
- Local, short-lived closures that don’t escape their scope.
- `Copy` types where borrowing is sufficient.

`move` on a closure capturing `&mut T` moves the *reference*, not the data behind it. That's
almost never what you wanted, and it usually surfaces later as a lifetime error rather than
an error at the closure itself.
