---
id: memory-safety-rust
title: "How does Rust ensure memory safety without a garbage collector?"
slug: memory-safety-rust
date: '2025-07-07'
author: mayo
excerpt: >-
  Rust memory and string
content_focus: "rust memory and string"
technical_level: "Expert technical discussion"
category: rust
tags:
  - rust
  - memory
  - ownership
  - borrowing
  - lifetimes
scheduledFor: '2025-07-08'
scheduledAt: '2025-07-08T06:55:13.405Z'
---

# How does Rust ensure memory safety without a garbage collector?

Rust guarantees memory safety at compile time using three key mechanisms: ownership, borrowing, and lifetimes. These ensure no memory leaks, data races, or dangling pointers without the need for a garbage collector.

## 1. Ownership Rules

- Each value in Rust has a **single owner**.
- When the owner goes out of scope, the value is **dropped** (memory freed).
- Prevents **double frees** and **memory leaks**.

**Example**:
```rust
fn main() {
    let s = String::from("hello"); // `s` owns the string
    takes_ownership(s);            // Ownership moved → `s` is invalid here
    // println!("{}", s); // ERROR: borrow of moved value
}

fn takes_ownership(s: String) { 
    println!("{}", s); 
} // `s` is dropped here
```

## 2. Borrowing & References

- Allows **immutable** (`&T`) or **mutable** (`&mut T`) borrows.
- Enforced rules:
  - Either **one mutable reference** or **multiple immutable references** (no data races).
  - References must always be **valid** (no dangling pointers).

**Example**:
```rust
fn main() {
    let mut s = String::from("hello");
    let r1 = &s;     // OK: Immutable borrow
    let r2 = &s;     // OK: Another immutable borrow
    // let r3 = &mut s; // ERROR: Cannot borrow as mutable while borrowed as immutable
    println!("{}, {}", r1, r2);
}
```

## 3. Lifetimes

- Ensures references **never outlive** the data they point to.
- Prevents **dangling references**.

**Example**:
```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

fn main() {
    let s1 = String::from("hello");
    let result;
    {
        let s2 = String::from("world");
        result = longest(&s1, &s2); // ERROR: `s2` doesn't live long enough
    }
    // println!("{}", result); // `result` would be invalid here
}
```

## Why No Garbage Collector (GC)?

- **Zero-cost abstractions**: No runtime overhead.
- **Predictable performance**: Memory is freed deterministically.
- **No runtime pauses**: Unlike GC-based languages (Java, Go).

## Key Takeaways

✅ **Ownership**: Prevents memory leaks.  
✅ **Borrowing**: Prevents data races.  
✅ **Lifetimes**: Prevents dangling pointers.

Rust’s model ensures memory safety without runtime checks, making it both safe and fast.
