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

<div class="svg-container" style="margin:2rem 0;">
<svg class="cl6-fig" viewBox="0 0 800 230" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="A higher-order function returns a closure that owns its captured data, via either static or dynamic dispatch">
<!-- style -->
<style>
.cl6-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .cl6-fig,[data-theme="dark"] .cl6-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cl6-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.cl6-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.cl6-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.cl6-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl6-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.cl6-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="cl6arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
</defs>
<!-- title -->
<text x="400" y="20" text-anchor="middle" class="ti">A higher-order function returns a closure that owns its captured data</text>
<!-- row1: static -->
<rect x="40" y="50" width="190" height="60" rx="6" class="box"/>
<text x="135" y="86" text-anchor="middle" class="tx">make_adder(5)</text>
<path d="M230,80 L290,80" class="ln" marker-end="url(#cl6arrow)"/>
<rect x="290" y="50" width="230" height="60" rx="6" class="boxac"/>
<text x="405" y="75" text-anchor="middle" class="tx">move |y| x + y</text>
<text x="405" y="93" text-anchor="middle" class="mut">owns x = 5 (Copy)</text>
<path d="M520,80 L580,80" class="ln" marker-end="url(#cl6arrow)"/>
<rect x="580" y="50" width="180" height="60" rx="6" class="box"/>
<text x="670" y="86" text-anchor="middle" class="tx">add_five(3) → 8</text>
<!-- row2: dynamic -->
<rect x="40" y="150" width="190" height="60" rx="6" class="box"/>
<text x="135" y="186" text-anchor="middle" class="tx">math_op("add")</text>
<path d="M230,180 L290,180" class="ln" marker-end="url(#cl6arrow)"/>
<rect x="290" y="150" width="230" height="60" rx="6" class="box"/>
<text x="405" y="175" text-anchor="middle" class="tx">Box&lt;dyn Fn(i32,i32)-&gt;i32&gt;</text>
<text x="405" y="193" text-anchor="middle" class="mut">vtable dispatch</text>
<path d="M520,180 L580,180" class="ln" marker-end="url(#cl6arrow)"/>
<rect x="580" y="150" width="180" height="60" rx="6" class="box"/>
<text x="670" y="186" text-anchor="middle" class="tx">add(2,3) → 5</text>
</svg>
</div>

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

The decorator is the subtle one: `log_call` both *accepts* a closure and *returns* one, so the returned closure has to swallow `f` whole. Here is what one call through the wrapper actually does:

<div class="svg-container" style="margin:2rem 0;">
<svg class="cl6b-fig" viewBox="0 0 800 300" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="A call passing through the decorator closure returned by log_call, which owns the wrapped function and runs the log before delegating to it">
<!-- style -->
<style>
.cl6b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .cl6b-fig,[data-theme="dark"] .cl6b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cl6b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.cl6b-fig .shell{fill:none;stroke:var(--ac);stroke-width:2}
.cl6b-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.cl6b-fig .hdac{fill:var(--ac);font:700 13px ui-sans-serif,system-ui,sans-serif}
.cl6b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl6b-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.cl6b-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="cl6b-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
</defs>
<!-- title -->
<text x="400" y="20" text-anchor="middle" class="ti">A decorator closure wraps the function it was handed</text>
<!-- shell -->
<rect x="200" y="44" width="420" height="200" rx="8" class="shell"/>
<text x="410" y="66" text-anchor="middle" class="hdac">closure returned by log_call</text>
<text x="410" y="84" text-anchor="middle" class="mut">move |x| { … } — owns `f` outright</text>
<!-- caller -->
<rect x="30" y="112" width="150" height="54" rx="6" class="box"/>
<text x="105" y="136" text-anchor="middle" class="tx">decorated(7)</text>
<text x="105" y="154" text-anchor="middle" class="mut">caller</text>
<!-- arrow into log step -->
<path d="M180,139 L230,139" class="ln" marker-end="url(#cl6b-arrow)"/>
<!-- log step -->
<rect x="230" y="112" width="170" height="54" rx="6" class="box"/>
<text x="315" y="136" text-anchor="middle" class="tx">println!("{}", x)</text>
<text x="315" y="154" text-anchor="middle" class="mut">added behaviour</text>
<!-- arrow to inner f -->
<path d="M400,139 L440,139" class="ln" marker-end="url(#cl6b-arrow)"/>
<!-- inner f -->
<rect x="440" y="112" width="150" height="54" rx="6" class="box"/>
<text x="515" y="136" text-anchor="middle" class="tx">f(x)</text>
<text x="515" y="154" text-anchor="middle" class="mut">the captured original</text>
<!-- inner note -->
<text x="410" y="200" text-anchor="middle" class="mut">`f` was moved in, so the wrapper is valid long after log_call returned</text>
<text x="410" y="218" text-anchor="middle" class="mut">one fresh anonymous type per wrap — inlinable, no vtable</text>
<!-- arrow out -->
<path d="M590,139 L650,139" class="ln" marker-end="url(#cl6b-arrow)"/>
<!-- result -->
<rect x="650" y="112" width="120" height="54" rx="6" class="box"/>
<text x="710" y="143" text-anchor="middle" class="tx">14</text>
<!-- caption -->
<text x="400" y="276" text-anchor="middle" class="mut">Wrap the wrapper and it nests again — each layer just another `impl Fn` shell.</text>
</svg>
</div>

3. **Stateful Logic**:
   Use `FnMut` for closures that mutate captured state (see previous answers on stateful closures).

## Key Takeaways

**HOFs enable flexible, reusable patterns** by treating functions as first-class values.  
**Use `impl Fn`** for zero-cost static dispatch in performance-critical code.  
**Use `Box<dyn Fn>`** for dynamic behavior with multiple closure types.  
**Use `move`** to ensure closures own captured data when returned.

**Real-World Example**: HOFs are central to Rust’s iterator API (`map`, `filter`) and async frameworks like `tokio`, where closures define task behavior.

Change `make_adder` to multiply instead of add and nothing else has to change: both closures
are `Fn(i32) -> i32`, and that's the whole contract the caller sees.
