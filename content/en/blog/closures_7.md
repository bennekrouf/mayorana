---
id: handling-lifetimes-returning-closures
title: >-
  How do you handle lifetimes when returning a closure that captures variables
  from its environment?
slug: handling-lifetimes-returning-closures
locale: "en"
author: mayo
excerpt: >-
  Managing lifetimes when returning closures that capture variables, covering
  ownership transfer, lifetime annotations, and avoiding dangling references in
  Rust

tags:
  - rust
  - closures
date: '2025-07-12'
---

# How do you handle lifetimes when returning a closure that captures variables from its environment?

When returning a closure that captures variables (especially references), you must ensure the captured data outlives the closure. Rust enforces this through lifetime annotations and ownership rules. Here's how to handle it:

<div class="svg-container" style="margin:2rem 0;">
<svg class="cl7-fig" viewBox="0 0 800 230" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Move owned data into a returned closure for safety; a captured reference to a local variable dangles">
<!-- style -->
<style>
.cl7-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .cl7-fig,[data-theme="dark"] .cl7-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cl7-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.cl7-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.cl7-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.cl7-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl7-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.cl7-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="cl7arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
</defs>
<!-- title -->
<text x="400" y="16" text-anchor="middle" class="ti">Move owned data in; never return a closure outliving a captured reference</text>
<!-- box1 -->
<rect x="300" y="26" width="200" height="50" rx="6" class="box"/>
<text x="400" y="47" text-anchor="middle" class="tx">fn f() -&gt; impl Fn() -&gt; ...</text>
<text x="400" y="63" text-anchor="middle" class="mut">captures a local variable</text>
<!-- fork -->
<path d="M400,76 L400,96 L230,96 L230,116" class="ln" marker-end="url(#cl7arrow)"/>
<path d="M400,96 L590,96 L590,116" class="ln" marker-end="url(#cl7arrow)"/>
<!-- safe -->
<rect x="60" y="116" width="340" height="84" rx="6" class="boxac"/>
<text x="230" y="140" text-anchor="middle" class="tx">move || s (owned String)</text>
<text x="230" y="158" text-anchor="middle" class="mut">safe: closure owns the data</text>
<text x="230" y="174" text-anchor="middle" class="mut">no dependency on caller's frame</text>
<!-- dangling -->
<rect x="420" y="116" width="340" height="84" rx="6" class="box"/>
<text x="590" y="140" text-anchor="middle" class="tx">move || &amp;local</text>
<text x="590" y="158" text-anchor="middle" class="mut">ERROR: `local` dropped at fn end</text>
<text x="590" y="174" text-anchor="middle" class="mut">compiler rejects the dangling ref</text>
</svg>
</div>

## Key Strategies

### Use move to Transfer Ownership

Force the closure to take ownership of captured variables, eliminating dependency on external lifetimes:

```rust
fn create_closure() -> impl Fn() -> String {
    let s = String::from("hello"); // Owned data
    move || s.clone() // `move` captures `s` by value
}
```

### Annotate Lifetimes for Captured References

If capturing references, explicitly tie the closure's lifetime to the input data:

```rust
fn capture_ref<'a>(s: &'a str) -> impl Fn() -> &'a str {
    move || s // Closure's output tied to `'a`
}
```

That single `'a` is doing three jobs at once: it names how long the input borrow is good for, it bounds how long the closure itself may live, and it stamps the reference the closure hands back. All three spans have to fit inside the caller's data:

<div class="svg-container" style="margin:2rem 0;">
<svg class="cl7b-fig" viewBox="0 0 800 300" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Nested lifetime spans showing the caller's data outliving the borrow, the returned closure and the reference it yields">
<!-- style -->
<style>
.cl7b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .cl7b-fig,[data-theme="dark"] .cl7b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cl7b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.cl7b-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.cl7b-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.cl7b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl7b-fig .lb{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl7b-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.cl7b-fig .acx{fill:var(--ac);font:700 11px ui-sans-serif,system-ui,sans-serif}
.cl7b-fig .lim{stroke:var(--ac);stroke-width:1.5;stroke-dasharray:5 4;fill:none}
</style>
<!-- title -->
<text x="400" y="18" text-anchor="middle" class="ti">One `'a`, three nested spans — all must close before the data dies</text>
<!-- signature -->
<rect x="190" y="30" width="420" height="34" rx="6" class="boxac"/>
<text x="400" y="52" text-anchor="middle" class="tx">fn capture_ref&lt;'a&gt;(s: &amp;'a str) -&gt; impl Fn() -&gt; &amp;'a str + 'a</text>
<!-- limit marker -->
<path d="M772,84 L772,252" class="lim"/>
<text x="772" y="78" text-anchor="end" class="acx">data dropped here</text>
<!-- lane 1 -->
<text x="265" y="110" text-anchor="end" class="lb">caller's String</text>
<rect x="280" y="90" width="492" height="30" rx="4" class="box"/>
<text x="526" y="110" text-anchor="middle" class="mut">the only thing that actually owns bytes</text>
<!-- lane 2 -->
<text x="265" y="152" text-anchor="end" class="lb">s: &amp;'a str</text>
<rect x="300" y="132" width="462" height="30" rx="4" class="box"/>
<text x="531" y="152" text-anchor="middle" class="mut">borrow handed to the function</text>
<!-- lane 3 -->
<text x="265" y="194" text-anchor="end" class="lb">closure + 'a</text>
<rect x="320" y="174" width="400" height="30" rx="4" class="boxac"/>
<text x="520" y="194" text-anchor="middle" class="mut">may not be called past this bar</text>
<!-- lane 4 -->
<text x="265" y="236" text-anchor="end" class="lb">value it returns</text>
<rect x="340" y="216" width="340" height="30" rx="4" class="box"/>
<text x="510" y="236" text-anchor="middle" class="mut">&amp;'a str, same borrow flowing out</text>
<!-- caption -->
<text x="400" y="280" text-anchor="middle" class="mut">Drop the `+ 'a` bound and the closure is free to escape past the bar — that is the error.</text>
</svg>
</div>

### Avoid Returning Closures Capturing Short-Lived References

Closures capturing references to local variables cannot escape their scope:

```rust
// ERROR: `s` does not live long enough!
fn invalid_closure() -> impl Fn() -> &str {
    let s = String::from("hello");
    move || &s // `s` dies at end of function
}
```

## Example: Safe Lifetime Management

```rust
// Correct: Closure owns the captured data
fn safe_closure() -> impl Fn() -> String {
    let s = String::from("hello");
    move || s // `s` is moved into the closure (owned)
}

// Correct: Closure tied to input reference's lifetime
fn capture_with_lifetime<'a>(s: &'a str) -> impl Fn() -> &'a str + 'a {
    move || s // Closure's lifetime matches `s`
}
```

## Lifetime Pitfalls

### Dangling References

Returning a closure that captures a reference to a local variable will fail:

```rust
fn dangling_closure() -> impl Fn() -> &str {
    let local = String::from("oops");
    move || &local // ERROR: `local` dies here
}
```

### Elision Ambiguity

Use explicit lifetimes when the compiler can't infer relationships:

```rust
// Explicitly annotate input and closure lifetimes
fn process<'a>(data: &'a [i32]) -> impl Fn(usize) -> &'a i32 + 'a {
    move |i| &data[i] // Closure tied to `data`'s lifetime
}
```

## Key Takeaways

✅ Use move to transfer ownership of captured variables.
✅ Annotate lifetimes when closures capture references.
🚫 Avoid returning closures that capture short-lived references.

## Real-World Use Case

In web frameworks like actix-web, handlers often return closures capturing request data with explicitly managed lifetimes.

**Try This**: What happens if you remove move from capture_with_lifetime?

**Answer**: Compiler error! The closure would try to borrow s, which doesn't live long enough.
