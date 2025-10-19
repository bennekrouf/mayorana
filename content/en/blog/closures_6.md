---
id: higher-order-functions-rust
title: 'Rust''s Higher-Order Functions: Powering Flexible Closures'
slug: higher-order-functions-rust
locale: "en"
author: mayo
excerpt: Exploring higher-order functions in Rust for functional programming patterns

tags:
  - rust
  - closures
  - higher-order-functions
date: '2025-07-12'
---

# Rust's Higher-Order Functions: Powering Flexible Closures

Higher-order functions (HOFs) in Rust—functions that accept or return other functions/closures—leverage Rust’s closure system, trait bounds (`Fn`, `FnMut`, `FnOnce`), and ownership model to enable powerful functional programming patterns like callbacks and decorators. I’ll explain how HOFs work in Rust, their mechanics, and practical use cases.

## What are Higher-Order Functions?

HOFs either:
- Accept one or more functions/closures as arguments, or
- Return a function/closure.

Rust’s support for HOFs is built on its closure system, which integrates seamlessly with ownership, traits, and lifetimes.

## Example: Function Returning a Closure

A function that returns a configurable "adder" closure:

```rust
fn make_adder(x: i32) -> impl Fn(i32) -> i32 {
    // `move` transfers ownership of `x` into the closure
    move |y| x + y
}

fn main() {
    let add_five = make_adder(5); // Returns a closure that adds 5
    println!("{}", add_five(3)); // 8
}
```

### Key Mechanics
- **Closure Capture**: The `move` keyword ensures the closure owns `x`, preventing lifetime issues after `make_adder` exits. Without `move`, borrowing `x` would cause a compile error due to `x`’s scope ending.
- **Return Type**: `impl Fn(i32) -> i32` specifies the closure implements the `Fn` trait. Each closure has a unique anonymous type, so `impl Trait` is used to abstract it.

## Advanced Example: Conditional Closure Return

For dynamic behavior, return a `Box<dyn Fn>` to support different closures at runtime:

```rust
fn math_op(op: &str) -> Box<dyn Fn(i32, i32) -> i32> {
    match op {
        "add" => Box::new(|x, y| x + y),
        "mul" => Box::new(|x, y| x * y),
        _ => panic!("Unsupported operation"),
    }
}

fn main() {
    let add = math_op("add");
    let mul = math_op("mul");
    println!("{} {}", add(2, 3), mul(2, 3)); // 5 6
}
```

This uses dynamic dispatch to handle varying closure types, ideal for plugin-like systems.

## Use Cases for HOFs

1. **Iterator Adaptors**:
   Closures power iterator methods like `map`, `filter`, and `fold`:
   ```rust
   let doubled: Vec<_> = vec![1, 2, 3].iter().map(|x| x * 2).collect(); // [2, 4, 6]
   ```

2. **Decorators**:
   Wrap functions with additional logic (e.g., logging, retries):
   ```rust
   fn log_call<F: Fn(i32) -> i32>(f: F) -> impl Fn(i32) -> i32 {
       move |x| {
           println!("Calling with {}", x);
           f(x)
       }
   }
   ```

3. **Stateful Logic**:
   Use `FnMut` for closures that mutate captured state (see previous answers on stateful closures).

## Key Takeaways

✅ **HOFs enable flexible, reusable patterns** by treating functions as first-class values.  
✅ **Use `impl Fn`** for zero-cost static dispatch in performance-critical code.  
✅ **Use `Box<dyn Fn>`** for dynamic behavior with multiple closure types.  
🚀 **Use `move`** to ensure closures own captured data when returned.

**Real-World Example**: HOFs are central to Rust’s iterator API (`map`, `filter`) and async frameworks like `tokio`, where closures define task behavior.

**Experiment**: Modify `make_adder` to return a closure that multiplies instead.  
**Answer**: The compiler accepts it seamlessly, as both closures implement `Fn(i32) -> i32`, maintaining type consistency.
