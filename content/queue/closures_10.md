---
id: closure-dispatch-rust
title: "impl Fn() vs. Box<dyn Fn()>: Rust's Closure Dispatch Showdown"
slug: closure-dispatch-rust
author: mayo
excerpt: >-
  Comparing static and dynamic dispatch for closures in Rust, focusing on performance and use cases
content_focus: "functions and closures in Rust, covering ownership, traits, lifetimes"
technical_level: "Expert technical discussion"
category: rust
tags:
  - rust
  - closures
  - dispatch
  - performance
  - traits
---

# impl Fn() vs. Box<dyn Fn()>: Rust's Closure Dispatch Showdown

Rust’s closure system offers two ways to handle function-like behavior: `impl Fn()` for static dispatch and `Box<dyn Fn()>` for dynamic dispatch. Each has distinct performance and flexibility characteristics, driven by Rust’s ownership, traits, and lifetimes. I’ll compare them and explain when to choose one over the other.

## Key Differences

| **Aspect** | **impl Fn() (Static Dispatch)** | **Box<dyn Fn()> (Dynamic Dispatch)** |
|------------|--------------------------------|--------------------------------------|
| **Dispatch Mechanism** | Monomorphized at compile time (zero-cost) | Uses vtables (runtime lookup) |
| **Performance** | Faster (~1–2 ns, direct call) | Slower (~5–10 ns, vtable lookup) |
| **Flexibility** | Single concrete type per instance | Can store heterogeneous closures |
| **Memory** | Stack-allocated (unless moved) | Heap-allocated (fat pointer + heap data) |
| **Use Case** | Fixed closure type, performance-critical | Dynamic behavior, multiple closure types |

## When to Use Each

### 1. impl Fn() (Static Dispatch)
- **Use When**:
  - The closure type is fixed and known at compile time.
  - Performance is critical (e.g., hot loops, embedded systems).
  - Zero-cost abstractions are desired.
- **Why**: The compiler generates a unique function for each closure type via monomorphization, enabling inlining and no runtime overhead.

**Example**:
```rust
fn make_adder(x: i32) -> impl Fn(i32) -> i32 {
    move |y| x + y
}

fn main() {
    let add_five = make_adder(5); // Type: closure(5)
    println!("{}", add_five(3)); // 8
}
```

No heap allocation, direct function calls, and optimal performance.

### 2. Box<dyn Fn()> (Dynamic Dispatch)
- **Use When**:
  - You need to store different closures in the same collection (e.g., callbacks).
  - Closure types vary at runtime (e.g., plugin systems).
  - Flexibility outweighs performance costs.
- **Why**: `dyn Fn()` uses a vtable for runtime method resolution, allowing heterogeneous closures at the cost of heap allocation and lookup overhead.

**Example**:
```rust
fn create_op(is_add: bool) -> Box<dyn Fn(i32, i32) -> i32> {
    if is_add {
        Box::new(|x, y| x + y)
    } else {
        Box::new(|x, y| x * y)
    }
}

fn main() {
    let add = create_op(true);
    let mul = create_op(false);
    println!("{} {}", add(2, 3), mul(2, 3)); // 5 6
}
```

Supports dynamic behavior, ideal for event handlers or plugins.

## Lifetime Considerations

- **Box<dyn Fn()>**: Requires explicit lifetimes if the closure captures references:
  ```rust
  struct Handler<'a> {
      callback: Box<dyn Fn() -> &'a str + 'a>,
  }
  ```
- **impl Fn()**: Lifetimes are typically inferred unless references are captured, simplifying usage.

## Performance Trade-offs

| **Scenario** | **impl Fn()** | **Box<dyn Fn()>** |
|--------------|---------------|-------------------|
| **Call Speed** | ~1–2 ns (direct call) | ~5–10 ns (vtable lookup) |
| **Memory Overhead** | None (stack-allocated) | 16–24 bytes (fat pointer + heap data) |
| **Code Bloat** | Possible (monomorphization) | Minimal (single vtable) |

## Key Takeaways

✅ **Choose `impl Fn()` for**:
- Performance-sensitive code (e.g., iterator chains).
- Single closure type (e.g., factory functions).

✅ **Choose `Box<dyn Fn()>` for**:
- Dynamic behavior (e.g., event handlers, plugins).
- Storing mixed closure types (e.g., `Vec<Box<dyn Fn()>>`).

**Real-World Examples**:
- `impl Fn()`: Used in iterator adapters like `map` and `filter` for zero-cost performance.
- `Box<dyn Fn()>`: Common in GUI frameworks for event callbacks where flexibility is key.

## Verification

To quantify the performance difference, benchmark with `criterion`:

```rust
use criterion::{black_box, Criterion};
fn bench(c: &mut Criterion) {
    let impl_fn = |x: i32| x + 5;
    let dyn_fn: Box<dyn Fn(i32) -> i32> = Box::new(|x| x + 5);
    c.bench_function("impl_fn", |b| b.iter(|| impl_fn(black_box(3))));
    c.bench_function("dyn_fn", |b| b.iter(|| dyn_fn(black_box(3))));
}
```

Expect `impl Fn()` to be faster and use less memory, confirming its suitability for performance-critical code.

## Conclusion

Use `impl Fn()` for zero-cost, static dispatch in performance-critical scenarios with known closure types. Opt for `Box<dyn Fn()>` when flexibility is needed, such as in plugin systems or event-driven applications requiring runtime polymorphism. Rust’s ownership and trait system ensure both approaches are safe, with the choice depending on the balance of performance versus dynamic requirements.
