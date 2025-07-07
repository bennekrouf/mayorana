---
id: string-str-mismatch-rust
title: "Why can’t you pass a &str directly to a function expecting a &String? How would you handle such a scenario?"
slug: string-str-mismatch-rust
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
  - string
  - str
  - ownership
scheduledFor: '2025-07-08'
scheduledAt: '2025-07-08T06:55:13.405Z'
---

# Why can’t you pass a &str directly to a function expecting a &String? How would you handle such a scenario?

In Rust, you cannot pass a `&str` directly to a function expecting a `&String` due to their distinct types, which ensures type safety and prevents assumptions about memory ownership. Below, I explain why this mismatch occurs and how to handle it effectively.

## The Core Issue: Type Mismatch

- **`&String`**: A reference to a heap-allocated, growable `String`.
- **`&str`**: A string slice that can point to heap, stack, or static memory.
- They are **different types**, so Rust rejects implicit conversions for safety.

**Example: The Problem**:
```rust
fn print_string(s: &String) {
    println!("{}", s);
}

fn main() {
    let my_str = "hello";  // Type: `&'static str`
    print_string(my_str);  // ERROR: expected `&String`, found `&str`
}
```

## Solutions to Bridge &str and &String

### 1. Deref Coercion (Automatic Conversion)

Rust automatically converts `&String` to `&str` via the `Deref` trait, but not the reverse. The best fix is to change the function to accept `&str` for greater flexibility.

```rust
fn print_str(s: &str) {  // Now accepts both `&str` and `&String`
    println!("{}", s);
}

fn main() {
    let my_string = String::from("hello");
    let my_str = "world";
    print_str(&my_string);  // Works: `&String` coerces to `&str`
    print_str(my_str);      // Works directly
}
```

**Why this works**: `String` implements `Deref<Target=str>`, allowing `&String` to coerce to `&str`.

### 2. Explicit Conversion (When You Need &String)

If the function must take `&String`, convert `&str` to a `String` first:

```rust
fn print_string(s: &String) {
    println!("{}", s);
}

fn main() {
    let my_str = "hello";
    print_string(&my_str.to_string());  // Allocates a new `String`
}
```

**Drawback**: This allocates a new heap buffer, which should be avoided if possible due to performance costs.

### 3. Use `AsRef<str>` for Maximum Flexibility

For functions that should work with any string-like type:

```rust
fn print_as_str<S: AsRef<str>>(s: S) {
    println!("{}", s.as_ref());
}

fn main() {
    let my_string = String::from("hello");
    let my_str = "world";
    print_as_str(&my_string);  // Works
    print_as_str(my_str);      // Works
}
```

**Bonus**: Also accepts `Cow<str>`, `Box<str>`, etc.

## Key Takeaways

✅ **Preferred**: Use `&str` in function arguments (flexible and zero-cost).  
✅ **If stuck with `&String`**: Convert `&str` to `String` (allocates).  
✅ **For APIs**: Use `AsRef<str>` or `impl Deref<Target=str>` for maximum compatibility.

**Why Rust Enforces This**:
- Prevents accidental allocations or assumptions about memory ownership.
- Encourages efficient, borrow-friendly APIs.

**Try This**: What happens if you pass a `String` to `print_str` without `&`?  
**Answer**: It moves ownership, causing a compile error since `print_str` expects a reference (`&str`), not an owned `String`.
