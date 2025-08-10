---
id: string-literals-memory-rust
title: Where do string literals (&str) live?
slug: string-literals-memory-rust
locale: en
date: '2025-08-06'
author: mayo
excerpt: Rust memory and string
content_focus: rust memory and string
technical_level: Expert technical discussion
category: rust
tags:
  - rust
  - memory
  - string
---

# How does Rust handle string literals (&str) in terms of memory allocation? Where do they live?

String literals (`&str`) in Rust are handled efficiently, with distinct memory characteristics compared to heap-allocated `String` types. Understanding their allocation and lifetime is key to writing performant and safe Rust code.

## String Literals (&str) in Memory

### Storage Location

- String literals (e.g., `"hello"`) are stored in the **read-only data segment** (`.rodata`) of the compiled binary, not on the heap or stack.
- They are embedded directly in the executable and loaded into memory at program startup.
- Memory is **static**, meaning it lives for the entire program duration.

### Type Inference

- The type of `"hello"` is `&'static str`:
  - `&str`: An immutable string slice.
  - `'static`: A lifetime lasting the entire program.

**Example: Memory Layout**:
```rust
let s: &'static str = "hello"; // Points to static memory
```

- **Binary Representation**:
  - Executable Memory: `"hello"` stored in `.rodata` section, e.g., at address `0x1000`.
  - Variable `s`: A pointer (`0x1000`) + length (`5`), stored on the stack.

## Key Properties

| **Property** | **Explanation** |
|--------------|-----------------|
| **Immutable** | Cannot modify the literal (e.g., `"hello"[0] = 'H'` is forbidden). |
| **Zero-Cost** | No runtime allocation (already in memory). |
| **Lifetime** | Always `'static` (valid for the whole program). |

## Comparison with `String`

| **Feature** | **&'static str (literal)** | **String** |
|-------------|----------------------------|------------|
| **Memory Location** | Read-only data segment | Heap |
| **Mutability** | Immutable | Mutable |
| **Lifetime** | `'static` | Scoped to owner |
| **Allocation Cost** | None (compile-time) | Runtime allocation |

## Common Use Cases

### Constants
```rust
const GREETING: &str = "hello"; // No allocation
```

### Function Arguments
Prefer `&str` over `&String` to accept literals without allocation:
```rust
fn print(s: &str) { /* ... */ }
print("world"); // No conversion needed
```

## Why Not Always Use &'static str?

- Limited to **compile-time-known strings**.
- Cannot dynamically create or modify them (unlike `String`).

**Example: Dynamic Strings Require `String`**:
```rust
let name = "Alice".to_string(); // Heap-allocated copy
name.push_str(" and Bob");      // Mutability possible
```

## The Problem: Dangling Pointer Risk

Returning a reference (`&str`) to a local `String` creates a dangling pointer, as the `String` is dropped when the function ends.

**Example: Code That Fails to Compile**:
```rust
fn return_str() -> &str {         // ERROR: Missing lifetime specifier!
    let s = String::from("hello");
    &s                            // Returns a reference to `s`...
}                                 // `s` is dropped here (dangling pointer!)
```

**Compiler Error**:
```
error[E0106]: missing lifetime specifier
 --> src/main.rs:1:17
  |
1 | fn return_str() -> &str {
  |                   ^ expected named lifetime parameter
  |
  = help: this function's return type contains a borrowed value, but there is no value for it to be borrowed from
```

### Why Rust Rejects This

- **Ownership Rules**: `String` (`s`) is owned by the function and dropped when the scope ends. Returning `&s` would create a reference to freed memory.
- **Lifetime Enforcement**: Rust requires explicit lifetimes to ensure references are always valid. Here, the reference (`&str`) has no owner to borrow from after the function exits.

### How to Fix It

#### Option 1: Return an Owned `String` (No Reference)
```rust
fn return_owned() -> String {  // Transfer ownership to caller
    String::from("hello")      // No reference, no lifetime issue
}
```

#### Option 2: Return a `&'static str` (String Literal)
```rust
fn return_static() -> &'static str {  // Lives forever in binary
    "hello"                          // Static memory (not heap)
}
```

#### Option 3: Use `Cow<str>` for Flexibility
```rust
use std::borrow::Cow;

fn return_cow(is_heap: bool) -> Cow<'static, str> {
    if is_heap {
        Cow::Owned(String::from("hello"))  // Heap-allocated
    } else {
        Cow::Borrowed("hello")             // Static memory
    }
}
```

## Key Takeaways

✅ **String literals**:
- Live in static memory (part of the binary).
- Are immutable and zero-cost.
- Have `'static` lifetime.

🚀 **When to use them**:
- For fixed, read-only strings (e.g., messages, constants).
- To avoid allocations in function APIs (`&str` over `&String`).

✅ **Never return `&str` borrowed from a local `String`**—it’s impossible in safe Rust.

✅ **Solutions**:
- Return `String` (ownership transfer).
- Use `&'static str` (literals only).
- Use `Cow<str>` for dynamic choices.

**Advanced Note**: Rust optimizes `&str` references to literals. Even if you write:
```rust
let s = String::from("hello");
let slice = &s[..]; // Points to heap, not static memory!
```
The compiler may elide copies if the content is known statically.

**Experiment**: What happens if you try returning `&s[..]` instead of `&s`?  
**Answer**: No—it’s the same issue! The slice still points to the doomed `String`.
