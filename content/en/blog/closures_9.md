---
id: storing-closures-in-structs
title: 'How do you store a closure in a struct?'
slug: storing-closures-in-structs
locale: "en"
author: mayo
excerpt: >-
  Storing closures in structs using generic parameters, trait objects, and
  lifetime annotations with Fn, FnMut, and FnOnce bounds
tags:
  - rust
  - closures
date: '2025-07-14'
---

# How do you store a closure in a struct?

Storing a closure in a struct requires specifying trait bounds (Fn, FnMut, FnOnce) and potentially lifetimes if the closure captures references. Here's how to do it:

<div class="svg-container" style="margin:2rem 0;">
<svg class="cl9-fig" viewBox="0 0 800 280" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Three ways to store a closure in a struct: generic static dispatch, boxed dynamic dispatch, or lifetime-bound references">
<!-- style -->
<style>
.cl9-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .cl9-fig,[data-theme="dark"] .cl9-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cl9-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.cl9-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.cl9-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.cl9-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl9-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.cl9-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="cl9arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
</defs>
<!-- title -->
<text x="400" y="16" text-anchor="middle" class="ti">Three ways to store a closure in a struct</text>
<!-- box1 -->
<rect x="300" y="26" width="200" height="50" rx="6" class="box"/>
<text x="400" y="47" text-anchor="middle" class="tx">struct Processor { op: ? }</text>
<text x="400" y="63" text-anchor="middle" class="mut">how is `op` typed?</text>
<!-- fork -->
<path d="M400,76 L400,96 L150,96 L150,116" class="ln" marker-end="url(#cl9arrow)"/>
<path d="M400,96 L400,116" class="ln" marker-end="url(#cl9arrow)"/>
<path d="M400,96 L650,96 L650,116" class="ln" marker-end="url(#cl9arrow)"/>
<!-- generic -->
<rect x="40" y="116" width="220" height="94" rx="6" class="boxac"/>
<text x="150" y="140" text-anchor="middle" class="tx">Generic &lt;F: Fn&gt;</text>
<text x="150" y="158" text-anchor="middle" class="mut">static dispatch</text>
<text x="150" y="174" text-anchor="middle" class="mut">fixed type, zero-cost</text>
<!-- boxed -->
<rect x="290" y="116" width="220" height="94" rx="6" class="box"/>
<text x="400" y="140" text-anchor="middle" class="tx">Box&lt;dyn Fn&gt;</text>
<text x="400" y="158" text-anchor="middle" class="mut">dynamic dispatch</text>
<text x="400" y="174" text-anchor="middle" class="mut">heap, heterogeneous</text>
<!-- lifetime -->
<rect x="540" y="116" width="220" height="94" rx="6" class="box"/>
<text x="650" y="140" text-anchor="middle" class="tx">Box&lt;dyn Fn + 'a&gt;</text>
<text x="650" y="158" text-anchor="middle" class="mut">lifetime-bound</text>
<text x="650" y="174" text-anchor="middle" class="mut">captures references</text>
</svg>
</div>

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

### Bounds and lifetimes, summarised
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

## How the Bound Reshapes the Struct's Own API

Choosing `Fn`, `FnMut` or `FnOnce` for the stored field is not a local decision — it propagates outward into the receiver every method that calls the closure must take, and from there into how callers are allowed to use the struct:

<div class="svg-container" style="margin:2rem 0;">
<svg class="cl9b-fig" viewBox="0 0 800 310" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Mapping from the stored closure bound to the receiver run must take and the resulting limit on how callers use the struct">
<!-- style -->
<style>
.cl9b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .cl9b-fig,[data-theme="dark"] .cl9b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cl9b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.cl9b-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.cl9b-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.cl9b-fig .hd{fill:var(--mut);font:700 11px ui-sans-serif,system-ui,sans-serif}
.cl9b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl9b-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.cl9b-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="cl9b-arrow2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
<marker id="cl9b-arrow2ac" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ac)"/></marker>
</defs>
<!-- title -->
<text x="400" y="20" text-anchor="middle" class="ti">The stored bound dictates the receiver, and the receiver dictates the caller</text>
<!-- headers -->
<text x="133" y="48" text-anchor="middle" class="hd">FIELD BOUND</text>
<text x="400" y="48" text-anchor="middle" class="hd">run() MUST TAKE</text>
<text x="667" y="48" text-anchor="middle" class="hd">WHAT CALLERS GET</text>
<!-- row 1 -->
<rect x="20" y="64" width="225" height="54" rx="6" class="box"/>
<text x="133" y="88" text-anchor="middle" class="tx">F: Fn(i32) -&gt; i32</text>
<text x="133" y="106" text-anchor="middle" class="mut">reads captures only</text>
<path d="M245,91 L290,91" class="ln" marker-end="url(#cl9b-arrow2)"/>
<rect x="290" y="64" width="220" height="54" rx="6" class="box"/>
<text x="400" y="88" text-anchor="middle" class="tx">&amp;self</text>
<text x="400" y="106" text-anchor="middle" class="mut">shared borrow</text>
<path d="M510,91 L555,91" class="ln" marker-end="url(#cl9b-arrow2)"/>
<rect x="555" y="64" width="225" height="54" rx="6" class="box"/>
<text x="667" y="88" text-anchor="middle" class="tx">unlimited calls</text>
<text x="667" y="106" text-anchor="middle" class="mut">many readers at once</text>
<!-- row 2 -->
<rect x="20" y="130" width="225" height="54" rx="6" class="boxac"/>
<text x="133" y="154" text-anchor="middle" class="tx">F: FnMut(i32) -&gt; i32</text>
<text x="133" y="172" text-anchor="middle" class="mut">mutates captures</text>
<path d="M245,157 L290,157" class="ln" marker-end="url(#cl9b-arrow2ac)"/>
<rect x="290" y="130" width="220" height="54" rx="6" class="boxac"/>
<text x="400" y="154" text-anchor="middle" class="tx">&amp;mut self</text>
<text x="400" y="172" text-anchor="middle" class="mut">exclusive borrow</text>
<path d="M510,157 L555,157" class="ln" marker-end="url(#cl9b-arrow2ac)"/>
<rect x="555" y="130" width="225" height="54" rx="6" class="boxac"/>
<text x="667" y="154" text-anchor="middle" class="tx">unlimited calls</text>
<text x="667" y="172" text-anchor="middle" class="mut">but the binding must be `mut`</text>
<!-- row 3 -->
<rect x="20" y="196" width="225" height="54" rx="6" class="box"/>
<text x="133" y="220" text-anchor="middle" class="tx">F: FnOnce(i32) -&gt; i32</text>
<text x="133" y="238" text-anchor="middle" class="mut">consumes captures</text>
<path d="M245,223 L290,223" class="ln" marker-end="url(#cl9b-arrow2)"/>
<rect x="290" y="196" width="220" height="54" rx="6" class="box"/>
<text x="400" y="220" text-anchor="middle" class="tx">self</text>
<text x="400" y="238" text-anchor="middle" class="mut">takes ownership</text>
<path d="M510,223 L555,223" class="ln" marker-end="url(#cl9b-arrow2)"/>
<rect x="555" y="196" width="225" height="54" rx="6" class="box"/>
<text x="667" y="220" text-anchor="middle" class="tx">exactly one call</text>
<text x="667" y="238" text-anchor="middle" class="mut">the struct is gone after it</text>
<!-- caption -->
<text x="400" y="280" text-anchor="middle" class="mut">Boxing changes nothing here: `Box&lt;dyn FnMut&gt;` still forces `&amp;mut self` on the method.</text>
<text x="400" y="297" text-anchor="middle" class="mut">Also note the parens in `(self.operation)(x)` — without them Rust looks for a method.</text>
</svg>
</div>

## Trade-offs at a glance
| Approach | Use Case | Trade-Offs |
|----------|----------|------------|
| Generic (impl Fn) | High performance, fixed closure type | Less flexible, binary bloat |
| Trait Object | Dynamic behavior, multiple closures | Runtime overhead, heap allocation |
| Lifetime Annotated | Closures capturing references | Ensures safety, adds complexity |

## Key Takeaways

Generic structs: Best for performance and static dispatch.
Trait objects: Use when storing heterogeneous closures.
Lifetimes: Required if the closure captures references.

Store a closure that captured `&mut` in a struct and the mutability propagates outward: the
struct binding has to be `mut` too, and the field's bound has to be `FnMut`.
