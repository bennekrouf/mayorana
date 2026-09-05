---
id: closure-dispatch-rust
title: 'impl Fn() vs. Box<dyn Fn()>: Rust''s Closure Dispatch Showdown'
locale: "en"
slug: closure-dispatch-rust
author: mayo
excerpt: >-
  Comparing static and dynamic dispatch for closures in Rust, focusing on
  performance and use cases
tags:
  - rust
  - closures
date: '2025-07-09'
---

# impl Fn() vs. Box<dyn Fn()>: Rust's Closure Dispatch Showdown

Rust’s closure system offers two ways to handle function-like behavior: `impl Fn()` for static dispatch and `Box<dyn Fn()>` for dynamic dispatch. Each has distinct performance and flexibility characteristics, driven by Rust’s ownership, traits, and lifetimes. I’ll compare them and explain when to choose one over the other.

<div class="svg-container" style="margin:2rem 0;">
<svg class="cl10-fig" viewBox="0 0 800 260" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Call path comparison: impl Fn is inlined directly at the call site, while Box dyn Fn goes through a fat pointer and vtable lookup before reaching heap-allocated code">
<!-- style -->
<style>
.cl10-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .cl10-fig,[data-theme="dark"] .cl10-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cl10-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.cl10-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.cl10-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.cl10-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl10-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.cl10-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.cl10-fig .lnac{stroke:var(--ac);stroke-width:2;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="cl10arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
<marker id="cl10arrowac" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ac)"/></marker>
</defs>
<!-- top lane: static -->
<text x="40" y="34" class="ti">impl Fn() — static dispatch</text>
<rect x="40" y="46" width="150" height="46" rx="6" class="box"/>
<text x="115" y="74" text-anchor="middle" class="tx">call site</text>
<path d="M190,69 L330,69" class="lnac" marker-end="url(#cl10arrowac)"/>
<rect x="330" y="46" width="200" height="46" rx="6" class="boxac"/>
<text x="430" y="69" text-anchor="middle" class="tx">inlined code</text>
<text x="430" y="83" text-anchor="middle" class="mut">monomorphized</text>
<text x="620" y="74" class="mut">~1–2 ns, no indirection</text>
<!-- bottom lane: dynamic -->
<text x="40" y="146" class="ti">Box&lt;dyn Fn()&gt; — dynamic dispatch</text>
<rect x="40" y="158" width="150" height="46" rx="6" class="box"/>
<text x="115" y="186" text-anchor="middle" class="tx">call site</text>
<path d="M190,181 L270,181" class="ln" marker-end="url(#cl10arrow)"/>
<rect x="270" y="158" width="140" height="46" rx="6" class="box"/>
<text x="340" y="181" text-anchor="middle" class="tx">fat pointer</text>
<text x="340" y="195" text-anchor="middle" class="mut">data + vtable</text>
<path d="M410,181 L490,181" class="ln" marker-end="url(#cl10arrow)"/>
<rect x="490" y="158" width="140" height="46" rx="6" class="box"/>
<text x="560" y="181" text-anchor="middle" class="tx">vtable lookup</text>
<path d="M630,181 L690,181 L690,220" class="ln" marker-end="url(#cl10arrow)"/>
<rect x="600" y="220" width="180" height="34" rx="6" class="box"/>
<text x="690" y="242" text-anchor="middle" class="tx">heap closure code</text>
<text x="40" y="242" class="mut">~5–10 ns, two indirections</text>
</svg>
</div>

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

Notice that `create_op` is not merely *slower* with `impl Fn` — it is impossible. Every closure literal gets its own anonymous type, so the two branches return two unrelated types, and `impl Trait` promises exactly one:

<div class="svg-container" style="margin:2rem 0;">
<svg class="cl10b-fig" viewBox="0 0 800 320" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Two closure literals with distinct anonymous types are rejected by impl Fn but unify behind a single boxed dyn Fn type">
<!-- style -->
<style>
.cl10b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .cl10b-fig,[data-theme="dark"] .cl10b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cl10b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.cl10b-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.cl10b-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.cl10b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl10b-fig .acb{fill:var(--ac);font:700 12px ui-sans-serif,system-ui,sans-serif}
.cl10b-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.cl10b-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="cl10b-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
<marker id="cl10b-arrowac" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ac)"/></marker>
</defs>
<!-- title -->
<text x="400" y="20" text-anchor="middle" class="ti">Two branches, two anonymous types — only one return form accepts both</text>
<!-- literal A -->
<rect x="250" y="36" width="140" height="44" rx="6" class="box"/>
<text x="320" y="58" text-anchor="middle" class="tx">|x, y| x + y</text>
<text x="320" y="74" text-anchor="middle" class="mut">type #1</text>
<!-- literal B -->
<rect x="410" y="36" width="140" height="44" rx="6" class="box"/>
<text x="480" y="58" text-anchor="middle" class="tx">|x, y| x * y</text>
<text x="480" y="74" text-anchor="middle" class="mut">type #2</text>
<!-- merge stems -->
<path d="M320,80 L320,104" class="ln"/>
<path d="M480,80 L480,104" class="ln"/>
<!-- shared bus -->
<path d="M170,104 L630,104" class="ln"/>
<!-- branch to impl Fn -->
<path d="M170,104 L170,140" class="ln" marker-end="url(#cl10b-arrow)"/>
<!-- branch to Box dyn -->
<path d="M630,104 L630,140" class="ln" marker-end="url(#cl10b-arrowac)"/>
<!-- impl Fn outcome -->
<rect x="40" y="140" width="260" height="110" rx="6" class="box"/>
<text x="170" y="166" text-anchor="middle" class="tx">-&gt; impl Fn(i32, i32) -&gt; i32</text>
<text x="170" y="186" text-anchor="middle" class="mut">stands for one concrete type</text>
<text x="170" y="205" text-anchor="middle" class="mut">chosen once, at compile time</text>
<text x="170" y="230" text-anchor="middle" class="acb">E0308: mismatched types</text>
<!-- Box dyn outcome -->
<rect x="500" y="140" width="260" height="110" rx="6" class="boxac"/>
<text x="630" y="166" text-anchor="middle" class="tx">-&gt; Box&lt;dyn Fn(i32, i32) -&gt; i32&gt;</text>
<text x="630" y="186" text-anchor="middle" class="mut">both types erased behind a vtable</text>
<text x="630" y="205" text-anchor="middle" class="mut">the arms now agree</text>
<text x="630" y="230" text-anchor="middle" class="acb">compiles — one alloc per Box</text>
<!-- caption -->
<text x="400" y="284" text-anchor="middle" class="mut">The same wall blocks `Vec&lt;impl Fn&gt;`: a vector needs one element type.</text>
<text x="400" y="301" text-anchor="middle" class="mut">Dynamic dispatch is not the slow option here — it is the only option.</text>
</svg>
</div>

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

**Choose `impl Fn()` for**:
- Performance-sensitive code (e.g., iterator chains).
- Single closure type (e.g., factory functions).

**Choose `Box<dyn Fn()>` for**:
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
