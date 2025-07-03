---
id: function-vs-closure-rust
title: "Functions or Closures in Rust? Know the Difference!"
slug: function-vs-closure-rust
date: '2025-06-30'
author: mayo
excerpt: >-
  Functions vs closures in Rust, covering
  ownership, traits, lifetimes, and performance implications.
category: rust
tags:
  - rust
  - functions
  - closures
  - traits
  - ownership
scheduledFor: '2025-07-02'
scheduledAt: '2025-07-01T06:55:13.405Z'
---

# What is the difference between a function and a closure in Rust?

Understanding the distinction between functions and closures is fundamental to mastering Rust's ownership system and performance characteristics.

## Key Differences

| Functions | Closures |
|-----------|----------|
| Defined at compile time with `fn` | Anonymous, created at runtime |
| Static dispatch (no runtime overhead) | May involve dynamic dispatch (trait objects) |
| Cannot capture environment variables | Can capture variables from enclosing scope |
| Always have a known type | Type is unique and inferred (each closure has its own type) |

## Underlying Mechanics

### Closures Are Structs + Traits

Rust models closures as structs that:
- Store captured variables (as fields)
- Implement one of the closure traits (`Fn`, `FnMut`, or `FnOnce`)

For example, this closure:
```rust
let x = 42;
let closure = |y| x + y;
```

Is desugared to something like:
```rust
struct AnonymousClosure {
    x: i32,  // Captured variable
}

impl FnOnce<(i32,)> for AnonymousClosure {
    type Output = i32;
    fn call_once(self, y: i32) -> i32 {
        self.x + y
    }
}
```

### Dynamic Dispatch (Vtables)

When closures are trait objects (e.g., `Box<dyn Fn(i32) -> i32>`), Rust uses vtables for dynamic dispatch:
- **Vtable**: A lookup table storing function pointers, enabling runtime polymorphism
- **Overhead**: Indirect function calls (~2–3x slower than static dispatch)

## When to Use Each

Use **Functions** when:
- You need zero-cost abstractions (e.g., mathematical operations)
- No environment capture is required

```rust
fn add(a: i32, b: i32) -> i32 { a + b }
```

Use **Closures** when:
- You need to capture state from the environment
- Writing short, ad-hoc logic (e.g., callbacks, iterators)

```rust
let threshold = 10;
let filter = |x: i32| x > threshold;  // Captures `threshold`
```

## Performance Considerations

| Scenario | Static Dispatch (Closures) | Dynamic Dispatch (dyn Fn) |
|----------|----------------------------|----------------------------|
| Speed | Fast (inlined) | Slower (vtable lookup) |
| Memory | No overhead | Vtable + fat pointer |
| Use Case | Hot loops, embedded | Heterogeneous callbacks |

## Example: Static vs. Dynamic Dispatch

```rust
// Static dispatch (compile-time)
fn static_call<F: Fn(i32) -> i32>(f: F, x: i32) -> i32 {
    f(x)  // Inlined
}

// Dynamic dispatch (runtime)
fn dynamic_call(f: &dyn Fn(i32) -> i32, x: i32) -> i32 {
    f(x)  // Vtable lookup
}
```

## Key Takeaways

✅ **Functions**: Predictable performance, no captures  
✅ **Closures**: Flexible, capture environment, but may involve vtables  
🚀 Prefer static dispatch (`impl Fn`) unless you need trait objects

**Try This:** What happens if a closure captures a mutable reference and is called twice?  
**Answer:** The borrow checker ensures exclusive access—it won't compile unless the first call completes!
