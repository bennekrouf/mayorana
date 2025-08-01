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
category: rust
tags:
  - rust
  - closures
date: '2025-07-12'
---

# How do you handle lifetimes when returning a closure that captures variables from its environment?

When returning a closure that captures variables (especially references), you must ensure the captured data outlives the closure. Rust enforces this through lifetime annotations and ownership rules. Here's how to handle it:

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
