---
id: deadlocks-c-vs-rust
title: 'Deadlocks in C vs Rust: What Does Rust Really Prevent?'
locale: en
slug: deadlocks-c-vs-rust
date: '2025-08-15'
author: mayo
excerpt: >-
  Deadlocks aren't prevented by compilers—but Rust adds safety guarantees that
  make writing deadlock-prone code harder. Here's how it compares to C.

tags:
  - rust
  - c
  - concurrency
  - deadlock
---

# Deadlocks in C vs Rust: What Does Rust Really Prevent?

Deadlocks are **runtime concurrency bugs**, not compile-time errors. So how can Rust claim safer multithreading? Here's a breakdown of what Rust prevents—and what it doesn't.

## What is a Deadlock?

A deadlock occurs when threads hold resources and wait on each other in a cycle. All 4 Coffman conditions must hold:

1. **Mutual exclusion** — at least one resource is non-shareable  
2. **Hold and wait** — threads hold one resource and wait for others  
3. **No preemption** — resources can't be forcibly taken  
4. **Circular wait** — a cycle of threads each waiting for the next

Rust **does not eliminate** deadlocks, but gives you tools that make many of them easier to avoid.

## Runtime Deadlock in C vs Rust

### In C (Pthreads):

```c
pthread_mutex_lock(&a);
// work
pthread_mutex_lock(&b);  // may deadlock if other thread locked `b` then `a`
```

### In Rust:

```rust
let a = Arc::new(Mutex::new(()));
let b = Arc::new(Mutex::new(()));

let t1 = {
    let a = Arc::clone(&a);
    let b = Arc::clone(&b);
    std::thread::spawn(move || {
        let _a = a.lock().unwrap();
        let _b = b.lock().unwrap();  // same problem if lock order differs
    })
};
```

💥 Both can deadlock if threads acquire locks in different orders.

## Rust's Stronger Guarantees

| Feature                     | C (Pthreads) | Rust                     | Why It Matters                     |
|-----------------------------|--------------|--------------------------|-------------------------------------|
| Ownership tracking         | ❌           | ✅ (Compiler enforced)   | Prevents aliasing lock misuse       |
| Automatic unlocks          | ❌           | ✅ (`Drop` via RAII)     | Avoids forgetting to release locks |
| Safe sharing of locks      | ❌           | ✅ (`Arc<Mutex<T>>`)     | Clear thread-safe semantics         |
| Data race prevention       | ❌           | ✅ (No races in safe code) | Prevents many deadlock scenarios    |
| Deadlock prevention        | ❌           | ❌                      | Still requires logic from the dev   |

## Lock Lifecycle in Rust

Rust ensures that:
- Locks are released when their guard goes out of scope
- You can't access a mutex without locking it first
- Captured references follow borrowing rules

But: **Rust cannot reason about lock acquisition order.** If thread A locks `a` then `b`, and thread B locks `b` then `a`, you can still deadlock.

## Compile-Time vs Runtime Safety

| Issue                      | Detected in C? | Detected in Rust? | Compile-Time Safe? |
|----------------------------|----------------|-------------------|---------------------|
| Data races                | ❌              | ✅                | ✅                  |
| Use-after-free            | ❌              | ✅                | ✅                  |
| Dangling pointers         | ❌              | ✅                | ✅                  |
| Circular locking patterns | ❌              | ❌                | ❌                  |
| Deadlocks                 | ❌              | ❌                | ❌                  |

## Dynamic Tools for Deadlock Detection

Rust doesn't check for lock order at compile time, but you can use tools like:

- [`loom`](https://docs.rs/loom) – test all interleavings of concurrent code
- [`deadlock`](https://docs.rs/deadlock) – detect runtime deadlocks in debug mode
- Static analyzers (WIP in ecosystem)

## Takeaways

✅ **Rust** gives memory and thread safety, and ownership helps avoid accidental misuse  
❌ **Deadlocks** are still possible — Rust doesn’t enforce lock order  
🚀 Write predictable locking code and test interleavings using tools like `loom`

**Try This:** What happens if two threads try to `lock()` `Mutex<T>`s in different orders?  
**Answer:** If the acquisition order cycles, your program may hang due to a deadlock. Rust won't stop you—but it makes everything else much safer.
