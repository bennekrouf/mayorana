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
