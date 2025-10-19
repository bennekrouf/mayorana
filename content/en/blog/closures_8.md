---
id: closure-performance-overhead-rust
title: >-
  Using closures versus regular functions ?
slug: closure-performance-overhead-rust
locale: "en"
author: mayo
excerpt: >-
  Analyzing performance overhead of closures versus regular functions in Rust,
  covering static dispatch, heap allocation, and optimization scenarios

tags:
  - rust
  - closures
date: '2025-07-12'
---

# What is the performance overhead of using closures versus regular functions in Rust?

## Performance Overhead

Closures in Rust have zero runtime overhead in most cases due to static dispatch and compiler optimizations. However, specific scenarios can introduce costs:

| Aspect | Closures | Regular Functions |
|--------|----------|-------------------|
| Dispatch | Static (via monomorphization) | Always static (direct call) |
| Memory | May store captured data (size varies) | No captured data (fixed size) |
| Heap Allocation | Only if boxed (Box<dyn Fn>) | Never |
| Optimization | Inlined aggressively | Inlined aggressively |

## When Closures May Be Less Efficient

### Heap-Allocated Trait Objects (Box<dyn Fn>)

Using dynamic dispatch (e.g., Box<dyn Fn>) adds overhead:
- **Vtable Lookups**: Indirect calls via function pointers.
- **Cache Misses**: Fat pointers (data + vtable) reduce locality.

```rust
let closures: Vec<Box<dyn Fn(i32) -> i32>> = vec![
    Box::new(|x| x + 1),
    Box::new(|x| x * 2),
]; // Heap-allocated, slower to call
```

### Large Captured Environments

Closures storing large structs (e.g., 1KB buffer) increase memory usage and may inhibit inlining:

```rust
let data = [0u8; 1024]; // 1KB array
let closure = move || data.len(); // Closure size = 1KB + overhead
```

### Excessive Monomorphization

Generic closures with many instantiations (e.g., in a hot loop) can bloat binary size:

```rust
(0..1_000).for_each(|i| { /* Unique closure per iteration */ });
```

## Zero-Cost Abstractions in Practice

### Static Dispatch (impl Fn)

Closures are as fast as regular functions when:
- Captured data is small (e.g., primitives).
- Monomorphization doesn't cause code bloat.

```rust
let add = |x, y| x + y; // Same ASM as `fn add(x: i32, y: i32) -> i32`
```

### Example: Inlining

```rust
fn main() {
    let x = 5;
    let closure = || x * 2; // Inlined → no function call
    println!("{}", closure()); // ASM: `mov eax, 10`
}
```

## Key Takeaways

✅ Use impl Fn for zero-cost static dispatch.
🚫 Avoid Box<dyn Fn> in performance-critical code.
⚠️ Optimize large captures: Prefer borrowing or minimizing captured data.

## Real-World Impact

- **rayon** uses closures with static dispatch for parallel iterators (no overhead).
- **GUI frameworks** like iced leverage closures for event handlers efficiently.

**Try This**: Compare the assembly output of a closure and a function with `cargo rustc -- --emit asm`!
