---
id: move-closures-rust
title: 'Understanding Rust Move Closures: A Guide for JavaScript Developers'
slug: move-closures-rust-javascript-developers
locale: en
author: mayo
excerpt: >-
  Learn how Rust move closures work compared to JavaScript closures - ownership,
  threading, and when to use the move keyword
tags:
  - rust
  - closures
  - javascript
  - typescript
date: '2025-11-02'
---

# Understanding Rust Move Closures: A Guide for JavaScript Developers

Coming from JavaScript? Closures work differently in Rust. A `move` closure forces ownership transfer of captured variables—no shared references like JS. This is the bridge between JavaScript's automatic closures and Rust's ownership model.

## The JavaScript Baseline

In JavaScript, closures capture variables by reference automatically:

```javascript
const makeCounter = () => {
  let count = 0;
  return () => count++; // captures `count` by reference
};

const counter = makeCounter();
console.log(counter()); // 0
console.log(counter()); // 1
```

The closure shares the same `count` variable. No copying, no moving—just a reference that lives as long as the closure does.

## Rust's Explicit Choice

Rust makes you choose: borrow or own. Regular closures borrow:

```rust
let mut count = 0;
let increment = || count += 1; // borrows `count` mutably
```

`move` closures take ownership:

```rust
let count = 0;
let increment = move || count + 1; // `count` moved/copied into closure
```

### Ownership Transfer Mechanics

For **non-Copy** types like `String` or `Vec`, the closure takes ownership:

```rust
let s = String::from("hello");
let closure = move || println!("{}", s); // `s` moved into closure
// println!("{}", s); // ERROR: `s` no longer valid
```

For **Copy** types like `i32` or `bool`, the value is copied:

```rust
let x = 42;
let closure = move || println!("{}", x); // `x` copied
println!("{}", x); // OK: original `x` still valid
```

### When You Need `move`

#### Threading

In JavaScript, you'd share state across async operations without thinking:

```javascript
const data = [1, 2, 3];
setTimeout(() => {
  console.log(data); // just works
}, 100);
```

Rust threads must own their data:

```rust
use std::thread;

let data = vec![1, 2, 3];
let handle = thread::spawn(move || {
    println!("{:?}", data); // `data` owned by thread
});
// println!("{:?}", data); // ERROR: moved
handle.join().unwrap();
```

Without `move`, the compiler rejects this—the thread might outlive `data`.

#### Returning Closures

JavaScript factories work by reference:

```javascript
const makeAdder = (x) => (y) => x + y; // `x` captured by reference

const addFive = makeAdder(5);
console.log(addFive(3)); // 8
```

Rust closures must own what they outlive:

```rust
fn make_adder(x: i32) -> impl Fn(i32) -> i32 {
    move |y| x + y // `x` must be moved
}

let add_five = make_adder(5);
println!("{}", add_five(3)); // 8
```

The closure outlives the function scope, so it needs ownership of `x`.

#### Async Blocks

Similar to threads, async blocks often need `move` when sent across tasks:

```rust
let value = String::from("async");
let future = async move {
    println!("{}", value);
};
// tokio::spawn requires 'static lifetime
tokio::spawn(future);
```

### Borrow vs Own: The Core Difference

JavaScript closures always share:

```javascript
let count = 0;
const increment = () => count += 1;
increment();
console.log(count); // 1 - same `count`
```

Rust regular closures borrow:

```rust
let mut count = 0;
let mut increment = || count += 1; // mutable borrow
increment();
println!("{}", count); // 1 - same `count`
```

Rust `move` closures own:

```rust
let mut count = 0;
let mut increment = move || count += 1; // `count` moved
increment();
// println!("{}", count); // ERROR: `count` moved
```

The moved `count` is independent—changes inside don't affect the original.

## The Paradigm Shift from JavaScript

JavaScript: closures capture by reference implicitly. The GC manages lifetime. You never think about ownership:

```javascript
const createHandler = () => {
  const state = { count: 0 };
  return () => state.count++; // reference lives as long as needed
};
```

Rust: you choose explicitly. Borrow for local use. Move for ownership transfer:

```rust
fn create_handler() -> impl FnMut() -> i32 {
    let mut state = 0;
    move || {
        state += 1;
        state
    } // `state` owned by closure
}
```

This prevents data races and use-after-free at compile time—guarantees JavaScript can't make.

## Summary

| Scenario | Use `move` | Reason |
|----------|-----------|---------|
| Threading | Yes | Thread may outlive scope |
| Returning closures | Yes | Closure outlives function |
| Async tasks | Often | Task needs 'static lifetime |
| Local use | No | Borrowing is sufficient |

**Core principle:** If a closure outlives its environment or needs to be `Send`, use `move`. Otherwise, let the borrow checker choose the minimal capture mode.

The `move` keyword is Rust's way of saying: "This closure now owns these variables." It's not just syntax—it's a contract enforced at compile time, eliminating entire classes of runtime errors that plague languages with garbage collection.
