---
id: stack-heap-allocation-rust
title: "Stack vs. Heap in Rust: Where Does Your Data Live?"
slug: stack-heap-allocation-rust
locale: "en"
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
  - stack
  - heap
  - allocation
---

# What is the difference between stack and heap allocation in Rust? How does Rust decide where to allocate data?

Rust uses stack and heap allocation to manage memory, with distinct characteristics for each. Understanding their differences and how Rust decides where to allocate data is key to writing efficient and safe code.

## Stack vs. Heap in Rust

| **Stack** | **Heap** |
|-----------|----------|
| Fast allocation/deallocation (LIFO). | Slower allocation (dynamic). |
| Fixed, known size at compile time. | Size can grow (e.g., `String`, `Vec`). |
| Automatic cleanup (no `free()` needed). | Manual management (via `Drop` trait). |
| Used for primitive types (`i32`, `bool`), small structs. | Used for large, dynamic data (`String`, `Box<T>`). |

## How Rust Decides Where to Allocate

### By Default → Stack

If a type has a **fixed size** (e.g., `i32`, arrays, structs with no `String`/`Vec`), it is allocated on the **stack**.

**Example**:
```rust
let x = 5; // Stack (i32 is fixed-size)
```

### Explicit Heap Allocation

Use types like `Box<T>`, `String`, `Vec`, etc., to allocate on the **heap**.

**Example**:
```rust
let s = String::from("heap"); // Heap (growable UTF-8 string)
let boxed = Box::new(42);     // Heap (Box<T>)
```

## Move Semantics

When a value is **moved**, its heap data is transferred, not copied, ensuring efficient memory management.

**Example**:
```rust
let s1 = String::from("hello"); // Heap-allocated
let s2 = s1; // Moves ownership (heap data not copied)
// println!("{}", s1); // ERROR: s1 is invalidated
```

## Key Takeaways

- ✅ **Stack**: Fast, fixed-size, automatic.  
- ✅ **Heap**: Flexible, dynamic, manual (via smart pointers).  
- ✅ Rust defaults to stack but uses heap for growable/unknown-size data.

**Follow-Up**: When would you force heap allocation?  
- For large structs (avoid stack overflow).  
- When you need dynamic dispatch (e.g., `Box<dyn Trait>`).  
- To share ownership across threads (`Arc<T>`).
