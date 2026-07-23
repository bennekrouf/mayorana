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

## Key Takeaways

✅ **`Fn`**: Read-only, reusable.  
✅ **`FnMut`**: Mutable, reusable.  
✅ **`FnOnce`**: Owned, single-use.  
🚀 `move` forces ownership but doesn’t change the trait—usage determines the trait.

**Try This:** What happens if a closure captures a mutable reference but doesn’t mutate it?  
**Answer:** It still implements `FnMut` (since it *could* mutate), but you can pass it to a function expecting `FnMut`.
