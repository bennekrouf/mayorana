---
id: stateful-closures-rust
title: 'Rust''s Stateful Closures: Passing and Mutating Across Multiple Calls'
slug: stateful-closures-rust
author: mayo
excerpt: Managing stateful closures in Rust for repeated function calls
category: rust
tags:
  - rust
  - closures
  - state
  - fnmut
  - lifetimes
date: '2025-07-10'
---

# Rust's Stateful Closures: Passing and Mutating Across Multiple Calls

To pass a closure to a Rust function that needs to call it multiple times while maintaining state between calls, the closure must implement the `FnMut` trait to allow mutation of its captured environment. I’ll explain how to design this, using Rust’s ownership, traits, and lifetimes, and highlight when to use simple closures versus structured approaches.

## Solution: Use FnMut and Mutable Closure

A closure that mutates state must implement `FnMut`, which allows multiple calls with mutable access to captured variables. The function receiving the closure takes it as `&mut impl FnMut` to retain ownership while enabling mutation.

**Example**:
```rust
fn call_repeatedly<F: FnMut() -> i32>(f: &mut F) {
    println!("First call: {}", f());  // 1
    println!("Second call: {}", f()); // 2
}

fn main() {
    let mut counter = 0; // State stored outside the closure
    let mut closure = || {
        counter += 1; // Mutates captured state → `FnMut`
        counter
    };
    
    // Pass as `&mut closure` to retain ownership
    call_repeatedly(&mut closure);
    // closure can still be used here
    println!("After: {}", closure()); // 3
}
```

### Key Mechanics
- **Mutable State**: The closure captures `counter` via a mutable borrow (`&mut i32`). The closure itself is declared `mut` to allow mutation.
- **Function Signature**: `fn call_repeatedly<F: FnMut() -> i32>(f: &mut F)` ensures the closure can be called multiple times with mutable access.
- **Lifetime Safety**: The closure borrows `counter`, so it cannot outlive `counter`, enforced by Rust’s borrow checker.

## Alternative: Encapsulate State in a Struct

For complex state, encapsulate it in a struct with an explicit `FnMut` implementation:

```rust
struct Counter {
    count: i32,
}

impl Counter {
    fn new() -> Self {
        Counter { count: 0 }
    }
    
    fn call(&mut self) -> i32 {
        self.count += 1;
        self.count
    }
}

fn main() {
    let mut counter = Counter::new();
    call_repeatedly(|| counter.call()); // Closure captures `counter`
    println!("After: {}", counter.call()); // Continues state
}
```

## Why Not FnOnce or Fn?

- **`FnOnce`**: Can only be called once, consuming the closure. Unsuitable for multiple calls.
- **`Fn`**: Uses immutable borrows, preventing state mutation, so it can’t modify captured variables.

## Pitfalls

- **Forgetting `mut`**:
  ```rust
  let closure = || { /* ... */ }; // Not `mut` → compile error
  call_repeatedly(&mut closure);
  ```
  The closure and parameter must be `mut` to implement `FnMut`.
- **Dangling References**: Ensure captured variables live as long as the closure. For example:
  ```rust
  fn bad() -> impl FnMut() -> i32 {
      let counter = 0;
      || { counter += 1; counter } // ERROR: `counter` doesn’t live long enough
  }
  ```

## Key Takeaways

✅ **Use `FnMut`** for closures that mutate state across multiple calls.  
✅ **Mark closures and parameters as `mut`** to enable mutation.  
✅ **Prefer simple closures** for basic state; use structs for complex state management.

**Real-World Example**: Stateful closures are common in event loops or async tasks (e.g., `tokio`) where a closure maintains counters or buffers across iterations.

**Experiment**: Try passing a non-`mut` closure to `call_repeatedly`.  
**Answer**: Compile error! The closure must be mutable to implement `FnMut`.
