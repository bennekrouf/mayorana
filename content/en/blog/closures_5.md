---
id: stateful-closures-rust
title: 'Rust''s Stateful Closures: Passing and Mutating Across Multiple Calls'
slug: stateful-closures-rust
locale: "en"
author: mayo
excerpt: Managing stateful closures in Rust for repeated function calls
tags:
  - rust
  - closures
  - fnmut
date: '2025-07-10'
---

# Rust's Stateful Closures: Passing and Mutating Across Multiple Calls

To pass a closure to a Rust function that needs to call it multiple times while maintaining state between calls, the closure must implement the `FnMut` trait to allow mutation of its captured environment. I’ll explain how to design this, using Rust’s ownership, traits, and lifetimes, and highlight when to use simple closures versus structured approaches.

<div class="svg-container" style="margin:2rem 0;">
<svg class="cl5-fig" viewBox="0 0 800 200" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Each FnMut call mutates the shared counter state across successive invocations">
<!-- style -->
<style>
.cl5-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .cl5-fig,[data-theme="dark"] .cl5-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cl5-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.cl5-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.cl5-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.cl5-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl5-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.cl5-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="cl5arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
</defs>
<!-- title -->
<text x="400" y="20" text-anchor="middle" class="ti">Each FnMut call mutates the shared counter across invocations</text>
<!-- box1 -->
<rect x="30" y="60" width="170" height="90" rx="6" class="box"/>
<text x="115" y="98" text-anchor="middle" class="tx">let mut counter = 0;</text>
<text x="115" y="116" text-anchor="middle" class="mut">closure captures &amp;mut counter</text>
<!-- arrow -->
<path d="M200,105 L220,105" class="ln" marker-end="url(#cl5arrow)"/>
<!-- box2 -->
<rect x="220" y="60" width="170" height="90" rx="6" class="box"/>
<text x="305" y="98" text-anchor="middle" class="tx">f() call 1</text>
<text x="305" y="116" text-anchor="middle" class="mut">counter += 1 → 1</text>
<!-- arrow -->
<path d="M390,105 L410,105" class="ln" marker-end="url(#cl5arrow)"/>
<!-- box3 -->
<rect x="410" y="60" width="170" height="90" rx="6" class="box"/>
<text x="495" y="98" text-anchor="middle" class="tx">f() call 2</text>
<text x="495" y="116" text-anchor="middle" class="mut">counter += 1 → 2</text>
<!-- arrow -->
<path d="M580,105 L600,105" class="ln" marker-end="url(#cl5arrow)"/>
<!-- box4 -->
<rect x="600" y="60" width="170" height="90" rx="6" class="boxac"/>
<text x="685" y="98" text-anchor="middle" class="tx">closure() call 3</text>
<text x="685" y="116" text-anchor="middle" class="mut">counter += 1 → 3</text>
</svg>
</div>

## Solution: Use FnMut and Mutable Closure

A closure that mutates state must implement `FnMut`, which allows multiple calls with mutable access to captured variables. The function receiving the closure takes it as `&mut impl FnMut` to retain ownership while enabling mutation.

**Example**:
```rust
fn call_repeatedly<F: FnMut() -> i32>(f: &mut F) {
    println!("First call: {}", f());  // 1
    println!("Second call: {}", f()); // 2
}

fn main() {
    let mut counter = 0; // State stored outside the closure
    let mut closure = || {
        counter += 1; // Mutates captured state → `FnMut`
        counter
    };
    
    // Pass as `&mut closure` to retain ownership
    call_repeatedly(&mut closure);
    // closure can still be used here
    println!("After: {}", closure()); // 3
}
```

### Key Mechanics
- **Mutable State**: The closure captures `counter` via a mutable borrow (`&mut i32`). The closure itself is declared `mut` to allow mutation.
- **Function Signature**: `fn call_repeatedly<F: FnMut() -> i32>(f: &mut F)` ensures the closure can be called multiple times with mutable access.
- **Lifetime Safety**: The closure borrows `counter`, so it cannot outlive `counter`, enforced by Rust’s borrow checker.

## Alternative: Encapsulate State in a Struct

For complex state, encapsulate it in a struct with an explicit `FnMut` implementation:

```rust
struct Counter {
    count: i32,
}

impl Counter {
    fn new() -> Self {
        Counter { count: 0 }
    }
    
    fn call(&mut self) -> i32 {
        self.count += 1;
        self.count
    }
}

fn main() {
    let mut counter = Counter::new();
    call_repeatedly(|| counter.call()); // Closure captures `counter`
    println!("After: {}", counter.call()); // Continues state
}
```

## Why Not FnOnce or Fn?

- **`FnOnce`**: Can only be called once, consuming the closure. Unsuitable for multiple calls.
- **`Fn`**: Uses immutable borrows, preventing state mutation, so it can’t modify captured variables.

The trait you get is not something you pick — the compiler derives it from how the body touches its captures, and that in turn decides how many times you may call it:

<div class="svg-container" style="margin:2rem 0;">
<svg class="cl5b-fig" viewBox="0 0 800 350" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Decision branch showing how the closure body's use of its captures selects Fn, FnMut or FnOnce and how many calls each allows">
<!-- style -->
<style>
.cl5b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .cl5b-fig,[data-theme="dark"] .cl5b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cl5b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.cl5b-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.cl5b-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.cl5b-fig .hd{fill:var(--tx);font:700 13px ui-sans-serif,system-ui,sans-serif}
.cl5b-fig .hdac{fill:var(--ac);font:700 13px ui-sans-serif,system-ui,sans-serif}
.cl5b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl5b-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.cl5b-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="cl5b-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
<marker id="cl5b-arrowac" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ac)"/></marker>
</defs>
<!-- title -->
<text x="400" y="20" text-anchor="middle" class="ti">The body decides the trait — the trait decides the call budget</text>
<!-- root box -->
<rect x="230" y="38" width="340" height="52" rx="6" class="box"/>
<text x="400" y="60" text-anchor="middle" class="tx">How does the body touch its captures?</text>
<text x="400" y="78" text-anchor="middle" class="mut">inferred, never declared</text>
<!-- trunk -->
<path d="M400,90 L400,116" class="ln"/>
<!-- bus -->
<path d="M145,116 L655,116" class="ln"/>
<!-- branch down 1 -->
<path d="M145,116 L145,150" class="ln" marker-end="url(#cl5b-arrow)"/>
<!-- branch down 2 -->
<path d="M400,116 L400,150" class="ln" marker-end="url(#cl5b-arrowac)"/>
<!-- branch down 3 -->
<path d="M655,116 L655,150" class="ln" marker-end="url(#cl5b-arrow)"/>
<!-- leaf 1 -->
<rect x="30" y="150" width="230" height="80" rx="6" class="box"/>
<text x="145" y="174" text-anchor="middle" class="hd">Fn</text>
<text x="145" y="194" text-anchor="middle" class="tx">reads them only</text>
<text x="145" y="212" text-anchor="middle" class="mut">many calls, state frozen</text>
<!-- leaf 2 -->
<rect x="285" y="150" width="230" height="80" rx="6" class="boxac"/>
<text x="400" y="174" text-anchor="middle" class="hdac">FnMut</text>
<text x="400" y="194" text-anchor="middle" class="tx">mutates them</text>
<text x="400" y="212" text-anchor="middle" class="mut">many calls, state carries over</text>
<!-- leaf 3 -->
<rect x="540" y="150" width="230" height="80" rx="6" class="box"/>
<text x="655" y="174" text-anchor="middle" class="hd">FnOnce</text>
<text x="655" y="194" text-anchor="middle" class="tx">consumes them</text>
<text x="655" y="212" text-anchor="middle" class="mut">exactly one call</text>
<!-- to verdict -->
<path d="M400,230 L400,262" class="ln" marker-end="url(#cl5b-arrowac)"/>
<!-- verdict -->
<rect x="180" y="262" width="440" height="52" rx="6" class="boxac"/>
<text x="400" y="284" text-anchor="middle" class="tx">fn call_repeatedly&lt;F: FnMut() -&gt; i32&gt;(f: &amp;mut F)</text>
<text x="400" y="302" text-anchor="middle" class="mut">both the binding and the parameter must be `mut`</text>
<!-- caption -->
<text x="400" y="338" text-anchor="middle" class="mut">Taking `&amp;mut F` rather than `F` is what lets the caller keep using the closure afterwards.</text>
</svg>
</div>

## Pitfalls

- **Forgetting `mut`**:
  ```rust
  let closure = || { /* ... */ }; // Not `mut` → compile error
  call_repeatedly(&mut closure);
  ```
  The closure and parameter must be `mut` to implement `FnMut`.
- **Dangling References**: Ensure captured variables live as long as the closure. For example:
  ```rust
  fn bad() -> impl FnMut() -> i32 {
      let counter = 0;
      || { counter += 1; counter } // ERROR: `counter` doesn’t live long enough
  }
  ```

**Use `FnMut`** for closures that mutate state across multiple calls.  
**Mark closures and parameters as `mut`** to enable mutation.  
**Prefer simple closures** for basic state; use structs for complex state management.

**Real-World Example**: Stateful closures are common in event loops or async tasks (e.g., `tokio`) where a closure maintains counters or buffers across iterations.

Try passing a non-`mut` closure to `call_repeatedly`. It won't compile — calling through
`FnMut` needs a mutable binding.
