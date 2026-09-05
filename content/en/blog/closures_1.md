---
id: function-vs-closure-rust
title: "Functions or Closures in Rust? Know the Difference!"
locale: "en"
slug: function-vs-closure-rust
date: '2025-06-30'
author: mayo
excerpt: >-
  Functions vs closures in Rust, covering
  ownership, traits, lifetimes, and performance implications.
tags:
  - rust
  - closures
---

# Functions or Closures in Rust? Know the Difference!

Understanding the distinction between functions and closures is fundamental to mastering Rust's ownership system and performance characteristics.

<div class="svg-container" style="margin:2rem 0;">
<svg class="cl1-fig" viewBox="0 0 800 300" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="A closure compiles into a struct capturing its environment, then either static or dynamic dispatch calls it">
<!-- style -->
<style>
.cl1-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .cl1-fig,[data-theme="dark"] .cl1-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cl1-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.cl1-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.cl1-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.cl1-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl1-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.cl1-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="cl1arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
</defs>
<!-- title -->
<text x="400" y="16" text-anchor="middle" class="ti">Closure compiles to a struct; dispatch choice sets the cost</text>
<!-- source -->
<rect x="300" y="26" width="200" height="50" rx="6" class="box"/>
<text x="400" y="47" text-anchor="middle" class="tx">let x = 42;</text>
<text x="400" y="63" text-anchor="middle" class="tx">|y| x + y</text>
<!-- arrow to struct -->
<path d="M400,76 L400,106" class="ln" marker-end="url(#cl1arrow)"/>
<!-- struct -->
<rect x="250" y="106" width="300" height="60" rx="6" class="box"/>
<text x="400" y="128" text-anchor="middle" class="tx">struct Closure { x: i32 }</text>
<text x="400" y="146" text-anchor="middle" class="mut">impl Fn(i32) -&gt; i32</text>
<!-- fork -->
<path d="M400,166 L400,186 L230,186 L230,206" class="ln" marker-end="url(#cl1arrow)"/>
<path d="M400,186 L570,186 L570,206" class="ln" marker-end="url(#cl1arrow)"/>
<!-- static dispatch -->
<rect x="80" y="206" width="300" height="74" rx="6" class="boxac"/>
<text x="230" y="230" text-anchor="middle" class="tx">impl Fn (static dispatch)</text>
<text x="230" y="248" text-anchor="middle" class="mut">inlined, zero-cost</text>
<text x="230" y="264" text-anchor="middle" class="mut">recommended default</text>
<!-- dynamic dispatch -->
<rect x="420" y="206" width="300" height="74" rx="6" class="box"/>
<text x="570" y="230" text-anchor="middle" class="tx">Box&lt;dyn Fn&gt; (dynamic dispatch)</text>
<text x="570" y="248" text-anchor="middle" class="mut">vtable lookup</text>
<text x="570" y="264" text-anchor="middle" class="mut">~2-3x slower</text>
</svg>
</div>

## Functions vs closures, side by side
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

It expands to something like:
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

## Picking one
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

<div class="svg-container" style="margin:2rem 0;">
<svg class="cl1-fig2" viewBox="0 0 800 380" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Decision tree: no environment capture means a plain fn, capture means a closure, then one type means impl Fn and many types mean Box dyn Fn">
<!-- style -->
<style>
.cl1-fig2{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .cl1-fig2,[data-theme="dark"] .cl1-fig2{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cl1-fig2 .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.cl1-fig2 .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.cl1-fig2 .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.cl1-fig2 .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl1-fig2 .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.cl1-fig2 .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="cl1b-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
</defs>
<!-- title -->
<text x="400" y="18" text-anchor="middle" class="ti">Which one do you actually need?</text>
<!-- q1 -->
<rect x="270" y="36" width="260" height="48" rx="6" class="box"/>
<text x="400" y="58" text-anchor="middle" class="tx">Does the logic read a variable</text>
<text x="400" y="75" text-anchor="middle" class="tx">from the enclosing scope?</text>
<!-- split -->
<path d="M400,84 L400,104 L170,104 L170,124" class="ln" marker-end="url(#cl1b-arrow)"/>
<path d="M400,104 L630,104 L630,124" class="ln" marker-end="url(#cl1b-arrow)"/>
<text x="290" y="99" text-anchor="middle" class="mut">no</text>
<text x="512" y="99" text-anchor="middle" class="mut">yes</text>
<!-- fn -->
<rect x="40" y="124" width="260" height="66" rx="6" class="box"/>
<text x="170" y="150" text-anchor="middle" class="tx">fn add(a: i32, b: i32)</text>
<text x="170" y="170" text-anchor="middle" class="mut">no captures, direct call, fixed type</text>
<!-- closure -->
<rect x="500" y="124" width="260" height="66" rx="6" class="box"/>
<text x="630" y="150" text-anchor="middle" class="tx">|x| x &gt; threshold</text>
<text x="630" y="170" text-anchor="middle" class="mut">closure: unique anonymous type</text>
<!-- to q2 -->
<path d="M630,190 L630,210" class="ln" marker-end="url(#cl1b-arrow)"/>
<!-- q2 -->
<rect x="390" y="210" width="420" height="44" rx="6" class="box"/>
<text x="600" y="238" text-anchor="middle" class="tx">Is it always the same one closure at this spot?</text>
<!-- split2 -->
<path d="M600,254 L600,272 L405,272 L405,292" class="ln" marker-end="url(#cl1b-arrow)"/>
<path d="M600,272 L680,272 L680,292" class="ln" marker-end="url(#cl1b-arrow)"/>
<text x="480" y="267" text-anchor="middle" class="mut">yes</text>
<text x="655" y="267" text-anchor="middle" class="mut">no</text>
<!-- impl Fn -->
<rect x="300" y="292" width="210" height="66" rx="6" class="boxac"/>
<text x="405" y="318" text-anchor="middle" class="tx">impl Fn</text>
<text x="405" y="338" text-anchor="middle" class="mut">inlined, zero-cost</text>
<!-- box dyn -->
<rect x="560" y="292" width="210" height="66" rx="6" class="box"/>
<text x="665" y="318" text-anchor="middle" class="tx">Box&lt;dyn Fn&gt;</text>
<text x="665" y="338" text-anchor="middle" class="mut">vtable, heterogeneous</text>
<!-- caption -->
<text x="170" y="318" text-anchor="middle" class="mut">Reach for a closure only when the</text>
<text x="170" y="336" text-anchor="middle" class="mut">answer to the first question is yes.</text>
</svg>
</div>

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

## The difference in one line
**Functions**: Predictable performance, no captures  
**Closures**: Flexible, capture environment, but may involve vtables  
Prefer static dispatch (`impl Fn`) unless you need trait objects

Capture a mutable reference and call the closure twice and you'll find the borrow checker
won't let you: the first call still holds exclusive access when the second one starts.
