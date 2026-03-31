---
id: reborrow-rust
title: "What is &mut *x (reborrow) in Rust, and why does it freeze the original reference?"
slug: reborrow-rust
locale: en
date: '2026-03-31'
author: mayo
excerpt: Rust memory and borrowing

tags:
  - rust
  - memory
  - borrowing
  - ownership
  - borrow-checker
---

# What is `&mut *x` (reborrow) in Rust, and why does it freeze the original reference?

In Rust, the expression `&mut *x` is called a **reborrow**. It lets you create a new mutable reference from an existing one without consuming it — something the borrow checker would normally block. Understanding reborrows is key to writing idiomatic Rust when dealing with mutable references across function boundaries.

## Breaking Down `&mut *x`

Given a variable `x` of type `&mut T`, the expression `&mut *x` does two things in sequence:

- `*x` — dereferences `x` to access the underlying value of type `T`.
- `&mut` — takes a new mutable reference to that value.

The result is a new mutable reference `y` pointing to the **same data** as `x`, but as a distinct reference with its own lifetime.

```rust
fn main() {
    let mut value = 42;
    let x: &mut i32 = &mut value;

    let y: &mut i32 = &mut *x; // reborrow: y points to the same data as x
    *y += 1;

    // y is no longer used past this point, so x is accessible again
    println!("{}", x); // prints 43
}
```

## The "Freeze" Mechanism

This is the crucial part: **while `y` is alive, `x` is frozen**.

The borrow checker enforces that you cannot have two active mutable references to the same data simultaneously. During a reborrow:

- `y` is the **active** mutable reference — you can use it to read or modify the value.
- `x` is **frozen** — it exists, but it cannot be used until `y` goes out of scope.
- Once `y`'s scope ends, the freeze is lifted and `x` becomes usable again.

```rust
fn main() {
    let mut value = String::from("hello");
    let x = &mut value;

    let y = &mut *x; // x is now frozen
    y.push_str(", world");

    // println!("{}", x); // ERROR: x is frozen while y is live

    drop(y); // y goes out of scope, freeze is lifted
    println!("{}", x); // OK: prints "hello, world"
}
```

This is not a workaround for Rust's safety rules — it is how those rules work. The borrow checker tracks the lifetimes of both `x` and `y` and guarantees they are never used simultaneously.

## Why Not Just Pass `x` Directly?

If you pass `x` directly to a function expecting `&mut T`, Rust moves the borrow into the function. Without reborrowing, you would lose access to `x` for the duration of the call.

```rust
fn add_one(n: &mut i32) {
    *n += 1;
}

fn main() {
    let mut value = 0;
    let x = &mut value;

    add_one(x);        // Rust implicitly reborrows x here as &mut *x
    add_one(x);        // x is still usable after the first call
    println!("{}", x); // prints 2
}
```

In modern Rust with **Non-Lexical Lifetimes (NLL)**, the compiler performs this reborrow implicitly when you pass a `&mut T` to a function. The explicit form `&mut *x` is what happens under the hood.

## Implicit vs Explicit Reborrow

| **Form** | **When Used** | **Example** |
|---|---|---|
| Implicit (`x`) | Passing `&mut T` to a function | `add_one(x)` → compiler inserts `&mut *x` |
| Explicit (`&mut *x`) | Complex scenarios requiring manual control | Method chaining, iterator adapters |

In most day-to-day Rust code, you never need to write `&mut *x` yourself. The NLL-aware borrow checker handles it. However, explicit reborrows are sometimes needed in:

- **Method chaining**: When calling a method that takes `&mut self` on a `&mut T`.
- **Iterator patterns**: When iterating over a mutable slice via a reference.
- **Older Rust code**: Where the borrow checker's inference is less sophisticated.
- **Trait implementations**: Where the compiler cannot infer the reborrow automatically.

## Reborrow vs Move

It is important not to confuse a reborrow with a move. A move would consume the original reference; a reborrow only temporarily suspends it.

```rust
fn consume(x: &mut i32) { *x += 1; }

fn main() {
    let mut v = 0;
    let x = &mut v;

    // This is a reborrow (x remains usable after the call):
    consume(&mut *x);
    println!("{}", x); // OK

    // This also works due to implicit reborrow:
    consume(x);
    println!("{}", x); // Also OK
}
```

## How it Compares to Raw Pointers and `unsafe`

| **Concept** | **Safety** | **How it Works** |
|---|---|---|
| `&mut *x` (reborrow) | Safe | Borrow checker enforces single-active-reference rule |
| `*mut T` (raw pointer) | Unsafe | No borrow checker guarantees; manual aliasing control |
| `UnsafeCell<T>` | Unsafe interior | Explicit opt-out from borrow rules |

Reborrows give you the flexibility of working with multiple reference-like handles at different stages of a computation, while staying entirely within Rust's safe memory model.

## Key Takeaways

✅ `&mut *x` creates a new mutable reference pointing to the same data as `x`, without consuming `x`.

✅ While the reborrow `y` is alive, `x` is frozen — the borrow checker prevents both from being used simultaneously.

✅ Once `y` goes out of scope, the freeze is lifted and `x` is usable again.

✅ Modern Rust performs reborrows implicitly when passing `&mut T` to functions — you rarely need to write `&mut *x` explicitly.

🚫 A reborrow is **not** a clone of the data — no memory is copied. Only the reference (a pointer) is duplicated, with its lifetime constrained by the borrow checker.

**Thought Experiment**: What happens if you reborrow `x` twice into `y` and `z` at the same time?
**Answer**: The compiler rejects it. You cannot have two live mutable reborrows of the same reference simultaneously — the same rule that prevents two `&mut` references to the same data in general.
