---
id: storing-closures-in-structs
title: >-
  How storing a closure in a struct?
slug: storing-closures-in-structs
locale: "en"
author: mayo
excerpt: >-
  Storing closures in structs using generic parameters, trait objects, and
  lifetime annotations with Fn, FnMut, and FnOnce bounds
category: rust
tags:
  - rust
  - closures
  - structs
  - trait-bounds
  - lifetimes
  - generic-types
date: '2025-07-14'
---

# How can you store a closure in a struct? What trait bounds and lifetime annotations are required?

Storing a closure in a struct requires specifying trait bounds (Fn, FnMut, FnOnce) and potentially lifetimes if the closure captures references. Here's how to do it:

## 1. Generic Struct (Static Dispatch)

Use a generic type parameter with Fn/FnMut/FnOnce bounds. Ideal for fixed closure types.

### Example: Fn Trait

```rust
struct Processor<F>
where
    F: Fn(i32) -> i32, // Trait bound for closure type
{
    operation: F,
    value: i32,
}

impl<F> Processor<F>
where
    F: Fn(i32) -> i32,
{
    fn run(&self) -> i32 {
        (self.operation)(self.value)
    }
}

fn main() {
    let adder = Processor {
        operation: |x| x + 5, // Closure captured by value
        value: 10,
    };
    println!("{}", adder.run()); // 15
}
```

### Key Points
- **Zero runtime overhead**: Monomorphized for each closure type.
- **Fixed closure type**: Can't store different closures in the same struct.

## 2. Trait Object (Dynamic Dispatch)

Use Box<dyn Fn...> to store heterogeneous closures. Requires heap allocation.

### Example: Box<dyn Fn>

```rust
struct DynamicProcessor<'a> {
    operation: Box<dyn Fn(i32) -> i32 + 'a>, // Trait object with optional lifetime
    value: i32,
}

impl<'a> DynamicProcessor<'a> {
    fn run(&self) -> i32 {
        (self.operation)(self.value)
    }
}

fn main() {
    let multiplier = 2;
    let processor = DynamicProcessor {
        operation: Box::new(|x| x * multiplier), // Captures `multiplier`
        value: 10,
    };
    println!("{}", processor.run()); // 20
}
```

### Key Points
- **Lifetime annotation**: Required if the closure captures references (e.g., Box<dyn Fn() -> &str + 'a>).
- **Flexibility**: Can store any closure matching the trait.
- **Overhead**: Vtable lookup (dynamic dispatch).

## 3. Capturing References (Lifetimes)

If the closure captures references, the struct must declare lifetimes to ensure validity:

```rust
struct RefProcessor<'a, F>
where
    F: Fn(&'a str) -> &'a str, // Lifetime tied to input/output
{
    process: F,
    data: &'a str,
}

fn main() {
    let data = "hello";
    let processor = RefProcessor {
        process: |s| &s[1..], // Captures nothing, but input/output tied to `data`
        data,
    };
    println!("{}", (processor.process)(processor.data)); // "ello"
}
```

## When to Use Each

| Approach | Use Case | Trade-Offs |
|----------|----------|------------|
| Generic (impl Fn) | High performance, fixed closure type | Less flexible, binary bloat |
| Trait Object | Dynamic behavior, multiple closures | Runtime overhead, heap allocation |
| Lifetime Annotated | Closures capturing references | Ensures safety, adds complexity |

## Key Takeaways

✅ Generic structs: Best for performance and static dispatch.
✅ Trait objects: Use when storing heterogeneous closures.
✅ Lifetimes: Required if the closure captures references.

**Try This**: What happens if a closure captures a &mut reference and is stored in a struct?

**Answer**: The struct must be mut, and the closure must implement FnMut!
