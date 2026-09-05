---
id: fn-traits-rust
title: 'What are the differences between Fn, FnMut, and FnOnce?'
locale: "en"
slug: fn-traits-rust
date: '2025-07-07'
author: mayo
excerpt: 'Functions and closures in Rust, covering ownership, traits, lifetimes'
tags:
  - rust
  - closures
---

# What are the differences between Fn, FnMut, and FnOnce?

Understanding the distinction between `Fn`, `FnMut`, and `FnOnce` traits is crucial for mastering Rust's closure system, ownership, and performance characteristics.

<div class="svg-container" style="margin:2rem 0;">
<svg class="cl2-fig" viewBox="0 0 800 340" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Fn is a subset of FnMut, which is a subset of FnOnce, based on how each captures variables">
<!-- style -->
<style>
.cl2-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .cl2-fig,[data-theme="dark"] .cl2-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cl2-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.cl2-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.cl2-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.cl2-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl2-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
</style>
<!-- title -->
<text x="400" y="20" text-anchor="middle" class="ti">Fn is a subset of FnMut, which is a subset of FnOnce</text>
<!-- outer: FnOnce -->
<rect x="40" y="60" width="720" height="250" rx="10" class="box"/>
<text x="60" y="85" class="tx">FnOnce — ownership (T), callable once</text>
<!-- middle: FnMut -->
<rect x="110" y="105" width="580" height="170" rx="10" class="box"/>
<text x="130" y="130" class="tx">FnMut — mutable borrow (&amp;mut T), multiple calls</text>
<!-- inner: Fn -->
<rect x="190" y="150" width="420" height="90" rx="10" class="boxac"/>
<text x="400" y="180" text-anchor="middle" class="tx">Fn — immutable borrow (&amp;T), multiple calls</text>
<text x="400" y="198" text-anchor="middle" class="mut">recommended default when no mutation is needed</text>
</svg>
</div>

## Closure Capturing

Closures in Rust capture variables from their environment in one of three ways, depending on how the variables are used:

- **Immutable Borrow (`&T`)**: If the closure only reads a variable.
- **Mutable Borrow (`&mut T`)**: If the closure modifies a variable.
- **Ownership (`T`)**: If the closure takes ownership (e.g., via `move` or by consuming the variable).

The compiler automatically infers the least restrictive capture mode needed. The `move` keyword forces ownership capture, but the closure’s trait (`Fn`, `FnMut`, or `FnOnce`) depends on how the captured variables are used.

## Closure Traits

Rust closures implement one or more of these traits:

| Trait   | Captures Variables Via | Call Semantics | Call Count |
|---------|------------------------|----------------|------------|
| `Fn`    | Immutable borrow (`&T`) | `&self`        | Multiple   |
| `FnMut` | Mutable borrow (`&mut T`) | `&mut self` | Multiple   |
| `FnOnce`| Ownership (`T`)        | `self` (consumes closure) | Once |

### Key Differences

- **`Fn`**:
  - Can be called repeatedly.
  - Captures variables immutably.
  - Example:
    ```rust
    let x = 42;
    let closure = || println!("{}", x); // Fn (captures `x` by &T)
    ```

- **`FnMut`**:
  - Can mutate captured variables.
  - Requires `mut` keyword if stored.
  - Example:
    ```rust
    let mut x = 42;
    let mut closure = || { x += 1; }; // FnMut (captures `x` by &mut T)
    ```

- **`FnOnce`**:
  - Takes ownership of captured variables.
  - Can only be called once.
  - Example:
    ```rust
    let x = String::from("hello");
    let closure = || { drop(x); }; // FnOnce (moves `x` into closure)
    ```

## Trait Hierarchy

- **`Fn`**: Also implements `FnMut` and `FnOnce`.
- **`FnMut`**: Also implements `FnOnce`.
- A closure that implements `Fn` can be used where `FnMut` or `FnOnce` is required.
- A closure that implements `FnMut` can be used as `FnOnce`.

## `move` Keyword

Forces the closure to take ownership of captured variables, even if they’re only read:
```rust
let s = String::from("hello");
let closure = move || println!("{}", s); // `s` is moved into the closure
```

- **Trait Impact**:
  - If the closure doesn’t mutate or consume `s`, it still implements `Fn` (since `s` is owned but not modified).
  - If the closure consumes `s` (e.g., `drop(s)`), it becomes `FnOnce`.

<div class="svg-container" style="margin:2rem 0;">
<svg class="cl2-fig2" viewBox="0 0 800 300" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="All three closures use move, yet reading gives Fn, mutating gives FnMut and consuming gives FnOnce">
<!-- style -->
<style>
.cl2-fig2{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .cl2-fig2,[data-theme="dark"] .cl2-fig2{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cl2-fig2 .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.cl2-fig2 .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.cl2-fig2 .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.cl2-fig2 .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl2-fig2 .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.cl2-fig2 .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="cl2b-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
</defs>
<!-- title -->
<text x="400" y="18" text-anchor="middle" class="ti">Same `move`, same `s` — the body picks the trait</text>
<text x="400" y="38" text-anchor="middle" class="mut">`move` decides ownership. What you do with `s` decides Fn / FnMut / FnOnce.</text>
<!-- row1 -->
<rect x="40" y="56" width="330" height="56" rx="6" class="box"/>
<text x="205" y="80" text-anchor="middle" class="tx">move || println!("{}", s)</text>
<text x="205" y="99" text-anchor="middle" class="mut">reads s only</text>
<path d="M370,84 L470,84" class="ln" marker-end="url(#cl2b-arrow)"/>
<rect x="470" y="56" width="290" height="56" rx="6" class="box"/>
<text x="615" y="80" text-anchor="middle" class="tx">Fn</text>
<text x="615" y="99" text-anchor="middle" class="mut">call it as often as you like</text>
<!-- row2 -->
<rect x="40" y="126" width="330" height="56" rx="6" class="box"/>
<text x="205" y="150" text-anchor="middle" class="tx">move || s.push_str("!")</text>
<text x="205" y="169" text-anchor="middle" class="mut">mutates s (needs `let mut`)</text>
<path d="M370,154 L470,154" class="ln" marker-end="url(#cl2b-arrow)"/>
<rect x="470" y="126" width="290" height="56" rx="6" class="box"/>
<text x="615" y="150" text-anchor="middle" class="tx">FnMut</text>
<text x="615" y="169" text-anchor="middle" class="mut">many calls, exclusive access</text>
<!-- row3 -->
<rect x="40" y="196" width="330" height="56" rx="6" class="box"/>
<text x="205" y="220" text-anchor="middle" class="tx">move || drop(s)</text>
<text x="205" y="239" text-anchor="middle" class="mut">consumes s</text>
<path d="M370,224 L470,224" class="ln" marker-end="url(#cl2b-arrow)"/>
<rect x="470" y="196" width="290" height="56" rx="6" class="boxac"/>
<text x="615" y="220" text-anchor="middle" class="tx">FnOnce</text>
<text x="615" y="239" text-anchor="middle" class="mut">second call is a compile error</text>
<!-- caption -->
<text x="400" y="282" text-anchor="middle" class="mut">Drop `move` from row 1 and the trait is still Fn — only the capture mode changes.</text>
</svg>
</div>

## Examples

1. **Immutable Capture (`Fn`)**:
   ```rust
   let x = 5;
   let print_x = || println!("{}", x); // Fn
   print_x(); // OK
   print_x(); // Still valid
   ```

2. **Mutable Capture (`FnMut`)**:
   ```rust
   let mut x = 5;
   let mut add_one = || x += 1; // FnMut
   add_one(); // x = 6
   add_one(); // x = 7
   ```

3. **Ownership Capture (`FnOnce`)**:
   ```rust
   let x = String::from("hello");
   let consume_x = || { drop(x); }; // FnOnce
   consume_x(); // OK
   // consume_x(); // ERROR: closure called after being moved
   ```

## Performance & Use Cases

| Trait   | Overhead      | Use Case                        |
|---------|---------------|---------------------------------|
| `Fn`    | Zero-cost     | Read-only callbacks, iterators  |
| `FnMut` | Zero-cost     | Stateful transformations       |
| `FnOnce`| May allocate  | One-time operations (e.g., spawning threads) |

## Which trait you actually get
**`Fn`**: Read-only, reusable.  
**`FnMut`**: Mutable, reusable.  
**`FnOnce`**: Owned, single-use.  
`move` forces ownership but doesn’t change the trait—usage determines the trait.

A closure that captures `&mut` but never mutates still only implements `FnMut`. The trait
follows what the capture *permits*, not what the body happens to do with it.
