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

<div class="svg-container" style="margin:2rem 0;">
<svg class="cl8-fig" viewBox="0 0 800 220" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Call overhead comparison: impl Fn is inlined at near zero cost, Box of dyn Fn pays a vtable lookup">
<!-- style -->
<style>
.cl8-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .cl8-fig,[data-theme="dark"] .cl8-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cl8-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl8-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.cl8-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.cl8-fig .axis{stroke:var(--ln);stroke-width:1.5}
.cl8-fig .bar1{fill:var(--ac)}
.cl8-fig .bar2{fill:var(--mut);opacity:0.55}
</style>
<!-- title -->
<text x="400" y="20" text-anchor="middle" class="ti">Call overhead: impl Fn is inlined; Box&lt;dyn Fn&gt; pays a vtable lookup</text>
<!-- axis -->
<path d="M250,68 L250,178" class="axis"/>
<!-- row1 -->
<text x="60" y="100" class="tx">impl Fn (static)</text>
<rect x="250" y="82" width="90" height="32" rx="4" class="bar1"/>
<text x="352" y="103" class="mut">~0 ns (inlined)</text>
<!-- row2 -->
<text x="60" y="162" class="tx">Box&lt;dyn Fn&gt; (dynamic)</text>
<rect x="250" y="144" width="260" height="32" rx="4" class="bar2"/>
<text x="522" y="165" class="mut">~2-3x slower (vtable + cache miss)</text>
<!-- caption -->
<text x="400" y="205" text-anchor="middle" class="mut">Large captures (e.g. a 1KB buffer) also grow closure size, regardless of dispatch</text>
</svg>
</div>

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
