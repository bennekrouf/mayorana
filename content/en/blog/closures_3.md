---
id: closure-parameter-rust
title: How do you specify a closure as a function parameter or return type?
locale: "en"
slug: closure-parameter-rust
date: '2025-07-07'
author: mayo
excerpt: 'Functions and closures in Rust, covering ownership, traits, lifetimes'
tags:
  - rust
  - closures
---

# How do you specify a closure as a function parameter or return type?

Closures in Rust are anonymous types, so you must use trait bounds (`Fn`, `FnMut`, `FnOnce`) to define their signatures. Here’s how to work with them as parameters and return types.

<div class="svg-container" style="margin:2rem 0;">
<svg class="cl3-fig" viewBox="0 0 800 290" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Returning a closure: impl Fn keeps it on the stack, Box of dyn Fn moves it to the heap">
<!-- style -->
<style>
.cl3-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .cl3-fig,[data-theme="dark"] .cl3-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cl3-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.cl3-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.cl3-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.cl3-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl3-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.cl3-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="cl3arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
</defs>
<!-- title -->
<text x="400" y="16" text-anchor="middle" class="ti">Returning a closure: impl Fn stays on the stack, Box&lt;dyn Fn&gt; moves to the heap</text>
<!-- source -->
<rect x="300" y="26" width="200" height="50" rx="6" class="box"/>
<text x="400" y="47" text-anchor="middle" class="tx">fn make_closure(...)</text>
<text x="400" y="63" text-anchor="middle" class="mut">-&gt; impl Fn or Box&lt;dyn Fn&gt;</text>
<!-- fork -->
<path d="M400,76 L400,96 L230,96 L230,116" class="ln" marker-end="url(#cl3arrow)"/>
<path d="M400,96 L570,96 L570,116" class="ln" marker-end="url(#cl3arrow)"/>
<!-- impl Fn -->
<rect x="80" y="116" width="300" height="70" rx="6" class="boxac"/>
<text x="230" y="140" text-anchor="middle" class="tx">impl Fn(i32) -&gt; i32</text>
<text x="230" y="158" text-anchor="middle" class="mut">stack, monomorphized</text>
<!-- Box dyn Fn -->
<rect x="420" y="116" width="300" height="70" rx="6" class="box"/>
<text x="570" y="140" text-anchor="middle" class="tx">Box&lt;dyn Fn(i32) -&gt; i32&gt;</text>
<text x="570" y="158" text-anchor="middle" class="mut">heap, vtable</text>
<!-- arrows down to notes -->
<path d="M230,186 L230,210" class="ln" marker-end="url(#cl3arrow)"/>
<path d="M570,186 L570,210" class="ln" marker-end="url(#cl3arrow)"/>
<!-- notes -->
<rect x="80" y="210" width="300" height="55" rx="6" class="box"/>
<text x="230" y="233" text-anchor="middle" class="tx">single closure type</text>
<text x="230" y="250" text-anchor="middle" class="mut">zero-cost, fixed</text>
<rect x="420" y="210" width="300" height="55" rx="6" class="box"/>
<text x="570" y="233" text-anchor="middle" class="tx">heterogeneous closures</text>
<text x="570" y="250" text-anchor="middle" class="mut">flexible, runtime cost</text>
</svg>
</div>

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

<div class="svg-container" style="margin:2rem 0;">
<svg class="cl3-fig2" viewBox="0 0 800 320" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Two call sites with different closures cause the compiler to stamp out two specialized copies of the generic apply function">
<!-- style -->
<style>
.cl3-fig2{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .cl3-fig2,[data-theme="dark"] .cl3-fig2{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cl3-fig2 .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.cl3-fig2 .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.cl3-fig2 .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.cl3-fig2 .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl3-fig2 .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.cl3-fig2 .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="cl3b-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
</defs>
<!-- title -->
<text x="400" y="18" text-anchor="middle" class="ti">One generic `apply`, one machine-code copy per closure type</text>
<!-- call site A -->
<rect x="40" y="44" width="250" height="54" rx="6" class="box"/>
<text x="165" y="68" text-anchor="middle" class="tx">apply(add_five, 10)</text>
<text x="165" y="87" text-anchor="middle" class="mut">closure type #1</text>
<!-- call site B -->
<rect x="40" y="118" width="250" height="54" rx="6" class="box"/>
<text x="165" y="142" text-anchor="middle" class="tx">apply(|x| x * 2, 10)</text>
<text x="165" y="161" text-anchor="middle" class="mut">closure type #2</text>
<!-- merge into generic -->
<path d="M290,71 L340,71 L340,108 L430,108" class="ln" marker-end="url(#cl3b-arrow)"/>
<path d="M290,145 L340,145 L340,108" class="ln"/>
<!-- generic -->
<rect x="430" y="76" width="330" height="64" rx="6" class="boxac"/>
<text x="595" y="102" text-anchor="middle" class="tx">fn apply&lt;F: Fn(i32) -&gt; i32&gt;(f: F, x: i32)</text>
<text x="595" y="122" text-anchor="middle" class="mut">one source, F is a type parameter — no vtable</text>
<!-- fan out -->
<path d="M595,140 L595,170 L245,170 L245,200" class="ln" marker-end="url(#cl3b-arrow)"/>
<path d="M595,170 L575,170 L575,200" class="ln" marker-end="url(#cl3b-arrow)"/>
<text x="400" y="164" text-anchor="middle" class="mut">monomorphization</text>
<!-- generated 1 -->
<rect x="100" y="200" width="290" height="70" rx="6" class="box"/>
<text x="245" y="226" text-anchor="middle" class="tx">apply::&lt;closure#1&gt;</text>
<text x="245" y="246" text-anchor="middle" class="mut">f(x) becomes x + 5, inlined</text>
<!-- generated 2 -->
<rect x="430" y="200" width="290" height="70" rx="6" class="box"/>
<text x="575" y="226" text-anchor="middle" class="tx">apply::&lt;closure#2&gt;</text>
<text x="575" y="246" text-anchor="middle" class="mut">f(x) becomes x * 2, inlined</text>
<!-- caption -->
<text x="400" y="300" text-anchor="middle" class="mut">Every closure has its own anonymous type — that is why generics cost nothing at runtime, and why binary size grows.</text>
</svg>
</div>

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
