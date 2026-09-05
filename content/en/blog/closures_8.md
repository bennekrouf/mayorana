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

A closure is just an anonymous struct holding its captures, so "how expensive is it" is really a question about that struct's layout:

<div class="svg-container" style="margin:2rem 0;">
<svg class="cl8b-fig" viewBox="0 0 800 330" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Memory layout of three closure values: a small Copy capture, a one kilobyte array capture, and a boxed trait object with heap environment and vtable">
<!-- style -->
<style>
.cl8b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .cl8b-fig,[data-theme="dark"] .cl8b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cl8b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.cl8b-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.cl8b-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.cl8b-fig .hd{fill:var(--tx);font:700 13px ui-sans-serif,system-ui,sans-serif}
.cl8b-fig .hdac{fill:var(--ac);font:700 13px ui-sans-serif,system-ui,sans-serif}
.cl8b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl8b-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.cl8b-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="cl8b-arrowac" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ac)"/></marker>
</defs>
<!-- title -->
<text x="400" y="20" text-anchor="middle" class="ti">A closure is a struct of its captures — the layout is the cost</text>
<!-- col1 header -->
<text x="140" y="46" text-anchor="middle" class="hd">small Copy capture</text>
<text x="140" y="64" text-anchor="middle" class="mut">move || x * 2</text>
<!-- col1 box -->
<rect x="20" y="78" width="240" height="48" rx="6" class="box"/>
<text x="140" y="100" text-anchor="middle" class="tx">4 bytes on the stack</text>
<text x="140" y="118" text-anchor="middle" class="mut">just the captured i32</text>
<!-- col1 note -->
<text x="140" y="152" text-anchor="middle" class="mut">inlines away entirely —</text>
<text x="140" y="169" text-anchor="middle" class="mut">identical ASM to a plain fn</text>
<!-- col2 header -->
<text x="400" y="46" text-anchor="middle" class="hd">large capture</text>
<text x="400" y="64" text-anchor="middle" class="mut">move || data.len()</text>
<!-- col2 box -->
<rect x="280" y="78" width="240" height="132" rx="6" class="box"/>
<text x="400" y="130" text-anchor="middle" class="tx">1024 bytes on the stack</text>
<text x="400" y="150" text-anchor="middle" class="mut">the whole [0u8; 1024]</text>
<text x="400" y="167" text-anchor="middle" class="mut">copied byte for byte</text>
<!-- col2 note -->
<text x="400" y="236" text-anchor="middle" class="mut">still no heap, but too big to inline</text>
<!-- col3 header -->
<text x="660" y="46" text-anchor="middle" class="hdac">Box&lt;dyn Fn&gt;</text>
<text x="660" y="64" text-anchor="middle" class="mut">Box::new(|x| x + 1)</text>
<!-- col3 box1 -->
<rect x="540" y="78" width="240" height="44" rx="6" class="boxac"/>
<text x="660" y="98" text-anchor="middle" class="tx">16 bytes: fat pointer</text>
<text x="660" y="115" text-anchor="middle" class="mut">data ptr + vtable ptr</text>
<!-- arrow 1 -->
<path d="M660,122 L660,150" class="ln" marker-end="url(#cl8b-arrowac)"/>
<!-- col3 box2 -->
<rect x="540" y="150" width="240" height="44" rx="6" class="box"/>
<text x="660" y="170" text-anchor="middle" class="tx">captured env</text>
<text x="660" y="187" text-anchor="middle" class="mut">separate heap allocation</text>
<!-- arrow 2 -->
<path d="M660,194 L660,222" class="ln" marker-end="url(#cl8b-arrowac)"/>
<!-- col3 box3 -->
<rect x="540" y="222" width="240" height="44" rx="6" class="box"/>
<text x="660" y="242" text-anchor="middle" class="tx">vtable</text>
<text x="660" y="259" text-anchor="middle" class="mut">one indirect jump per call</text>
<!-- caption -->
<text x="400" y="300" text-anchor="middle" class="mut">Only the right-hand column touches the heap; only it can't be inlined.</text>
<text x="400" y="317" text-anchor="middle" class="mut">The middle one is free at call time but expensive to move around.</text>
</svg>
</div>

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

## What the overhead actually is
✅ Use impl Fn for zero-cost static dispatch.
🚫 Avoid Box<dyn Fn> in performance-critical code.
⚠️ Optimize large captures: Prefer borrowing or minimizing captured data.

## Real-World Impact

- **rayon** uses closures with static dispatch for parallel iterators (no overhead).
- **GUI frameworks** like iced leverage closures for event handlers efficiently.

If you want to see the zero-cost claim rather than take my word for it:
`cargo rustc -- --emit asm` and diff the closure against the equivalent function.
