---
id: fn-traits-rust
title: "What are the differences between Fn, FnMut, and FnOnce?"
slug: fn-traits-rust
date: '2025-07-07'
author: mayo
excerpt: >-
  Functions and closures in Rust, covering ownership, traits, lifetimes
content_focus: "functions and closures in Rust, covering ownership, traits, lifetimes"
technical_level: "Expert technical discussion"
category: rust
tags:
  - rust
  - closures
  - traits
  - ownership
  - lifetimes
---

# What are the differences between Fn, FnMut, and FnOnce?

Understanding the distinction between `Fn`, `FnMut`, and `FnOnce` traits is crucial for mastering Rust's closure system, ownership, and performance characteristics.

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
