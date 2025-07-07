---
id: closure-parameter-rust
title: How do you specify a closure as a function parameter or return type?
slug: closure-parameter-rust
date: '2025-07-07'
author: mayo
excerpt: 'Functions and closures in Rust, covering ownership, traits, lifetimes'
category: rust
tags:
  - rust
  - closures
  - traits
  - ownership
  - lifetimes
---

# How do you specify a closure as a function parameter or return type?

Closures in Rust are anonymous types, so you must use trait bounds (`Fn`, `FnMut`, `FnOnce`) to define their signatures. Here’s how to work with them as parameters and return types.

## Closure as a Function Parameter

Use generic type parameters with trait bounds to accept closures.

### Example: `Fn` (Immutable Borrow)

```rust
// Accepts a closure that takes `i32` and returns `i32` (read-only).
fn apply<F: Fn(i32) -> i32>(f: F, x: i32) -> i32 {
    f(x)
}

fn main() {
    let add_five = |x| x + 5; // Implements `Fn`
    println!("{}", apply(add_five, 10)); // 15
}
```

### Example: `FnMut` (Mutable Borrow)

```rust
// Accepts a closure that mutates its environment.
fn apply_mut<F: FnMut(i32) -> i32>(mut f: F, x: i32) -> i32 {
    f(x)
}

fn main() {
    let mut count = 0;
    let mut increment_and_add = |x| {
        count += 1; // Mutates `count` → `FnMut`
        x + count
    };
    println!("{}", apply_mut(increment_and_add, 10)); // 11
}
```

## Closure as a Return Type

Use `impl Trait` for static dispatch (zero-cost) or `Box<dyn Trait>` for dynamic dispatch (flexible).

### Example: Return `impl Fn` (Static Dispatch)

```rust
// Returns a closure that adds a fixed value (immutable capture).
fn make_adder(a: i32) -> impl Fn(i32) -> i32 {
    move |b| a + b // `move` forces ownership (still `Fn` since `a` is read-only)
}

fn main() {
    let add_ten = make_adder(10);
    println!("{}", add_ten(5)); // 15
}
```

### Example: Return `Box<dyn Fn>` (Dynamic Dispatch)

```rust
// Returns a trait object for heterogeneous closures.
fn create_closure(is_add: bool) -> Box<dyn Fn(i32) -> i32> {
    if is_add {
        Box::new(|x| x + 1) // Heap-allocated closure
    } else {
        Box::new(|x| x - 1)
    }
}

fn main() {
    let add = create_closure(true);
    let sub = create_closure(false);
    println!("{} {}", add(5), sub(5)); // 6 4
}
```

## Key Differences

| Approach            | `impl Fn` (Static)         | `Box<dyn Fn>` (Dynamic)    |
|---------------------|----------------------------|----------------------------|
| **Dispatch**        | Monomorphized (zero-cost)  | Vtable lookup (runtime cost) |
| **Use Case**        | Single closure type        | Multiple closure types     |
| **Memory**          | Stack-allocated            | Heap-allocated (trait object) |
| **Flexibility**     | Less (fixed type)          | More (any `dyn Fn` closure) |

## When to Use Each

- **`impl Fn`**:
  - When returning a single type of closure (e.g., from a factory function).
  - For performance-critical code (no heap allocation).

- **`Box<dyn Fn>`**:
  - When returning different closure types (e.g., conditionally).
  - For dynamic behavior (e.g., plugin systems, callbacks).

## Pitfalls

- **`FnMut` in Structs**: Store mutable closures with `FnMut` and annotate `mut`:
  ```rust
  struct Processor<F: FnMut(i32) -> i32> {
      op: F,
  }
  ```

- **Lifetimes**: Closures capturing references may require explicit lifetimes:
  ```rust
  fn capture_ref<'a>(s: &'a str) -> impl Fn() -> &'a str {
      move || s // Closure captures `s` with lifetime `'a`
  }
  ```

## Key Takeaways

✅ **Parameter**: Use generics (`F: Fn(...)`) for flexibility and performance.  
✅ **Return Type**:  
- `impl Fn` for static dispatch (fast, fixed type).  
- `Box<dyn Fn>` for dynamic dispatch (flexible, multiple types).  
🚀 Prefer `impl Fn` unless you need runtime polymorphism.

**Try This**: What happens if you return a `FnOnce` closure?  
**Answer**: It’s allowed, but the caller can only invoke it once!
