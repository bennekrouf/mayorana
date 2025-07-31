---
id: memory-safety-rust
title: How does Rust ensure memory safety without a garbage collector?
slug: memory-safety-rust
author: mayo
locale: en
excerpt: Rust memory and string
category: rust
tags:
  - rust
  - memory
  - ownership
  - borrowing
  - lifetimes
date: '2025-07-31'
---
# How does Rust ensure memory safety without a garbage collector?
Rust guarantees memory safety at compile time using three key mechanisms: ownership, borrowing, and lifetimes. These ensure no memory leaks, data races, or dangling pointers without the need for a garbage collector.

## The C/C++ Problem
C and C++ give developers complete control over memory, but this leads to critical safety issues:

**Dangling Pointers**:
```c
char* get_string() {
    char buffer[100] = "hello"; // Stack allocated
    return buffer;              // Returns pointer to freed memory
} // ERROR: buffer is destroyed here

int* ptr = malloc(sizeof(int));
free(ptr);
*ptr = 42; // ERROR: Use after free
```

**Memory Leaks**:
```cpp
void leak_memory() {
    int* data = new int[1000]; // Heap allocation
    if (some_condition) {
        return; // ERROR: Memory never freed
    }
    delete[] data; // Only freed on normal path
}
```

**Double Free**:
```c
int* ptr = malloc(sizeof(int));
free(ptr);
free(ptr); // ERROR: Double free causes undefined behavior
```

## Java's Garbage Collection Approach
Java solves these issues with automatic memory management:

**✅ Pros**:
- No dangling pointers (references become null when objects are collected)
- No memory leaks for reachable objects
- No double free errors

**❌ Cons**:
- **Runtime overhead**: GC pauses can cause unpredictable latency
- **Memory overhead**: Additional metadata for tracking objects
- **No deterministic cleanup**: Objects freed at GC's discretion, not immediately

```java
// Java - memory managed automatically
String createString() {
    String s = new String("hello"); // Heap allocated
    return s; // Safe: GC will clean up when no longer referenced
} // No explicit cleanup needed
```

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

Rust's model ensures memory safety without runtime checks, making it both safe and fast.