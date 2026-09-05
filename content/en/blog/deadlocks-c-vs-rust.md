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

<div class="svg-container" style="margin:2rem 0;">
<svg class="dlock-fig" viewBox="0 0 800 320" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Circular wait: Thread 1 holds Lock A and waits for Lock B, while Thread 2 holds Lock B and waits for Lock A">
<style>
.dlock-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .dlock-fig,[data-theme="dark"] .dlock-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.dlock-fig text{font-family:ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.dlock-fig .title{font-size:14px;font-weight:700}
.dlock-fig .body{font-size:12px;font-weight:600}
.dlock-fig .cap{font-size:11px;fill:var(--mut)}
.dlock-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.dlock-fig .ln{stroke:var(--ac);stroke-width:2;fill:none}
.dlock-fig .lbl{font-size:11px;font-weight:600;fill:var(--ac)}
</style>
<!-- defs -->
<defs>
<marker id="dlock-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ac)"></path>
</marker>
</defs>
<!-- four corner nodes -->
<rect class="box" x="60" y="30" width="180" height="60" rx="8"></rect>
<text x="150" y="55" text-anchor="middle" class="title">Thread 1</text>
<text x="150" y="75" text-anchor="middle" class="cap">holds Mutex A</text>
<!-- lock a -->
<rect class="box" x="560" y="30" width="180" height="60" rx="8"></rect>
<text x="650" y="55" text-anchor="middle" class="title">Mutex B</text>
<text x="650" y="75" text-anchor="middle" class="cap">locked, awaited</text>
<!-- thread 2 -->
<rect class="box" x="560" y="230" width="180" height="60" rx="8"></rect>
<text x="650" y="255" text-anchor="middle" class="title">Thread 2</text>
<text x="650" y="275" text-anchor="middle" class="cap">holds Mutex B</text>
<!-- lock b -->
<rect class="box" x="60" y="230" width="180" height="60" rx="8"></rect>
<text x="150" y="255" text-anchor="middle" class="title">Mutex A</text>
<text x="150" y="275" text-anchor="middle" class="cap">locked, awaited</text>
<!-- cycle arrows -->
<path class="ln" d="M240,60 L560,60" marker-end="url(#dlock-arrow)"></path>
<text x="400" y="50" text-anchor="middle" class="lbl">waits for</text>
<path class="ln" d="M650,90 L650,230" marker-end="url(#dlock-arrow)"></path>
<text x="710" y="165" text-anchor="middle" class="lbl">blocked by</text>
<path class="ln" d="M560,260 L240,260" marker-end="url(#dlock-arrow)"></path>
<text x="400" y="280" text-anchor="middle" class="lbl">waits for</text>
<path class="ln" d="M150,230 L150,90" marker-end="url(#dlock-arrow)"></path>
<text x="95" y="165" text-anchor="middle" class="lbl">blocked by</text>
<!-- center label -->
<text x="400" y="165" text-anchor="middle" class="body" fill="var(--ac)">Circular wait — no compiler check catches this</text>
</svg>
</div>

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

The difference from C shows up on the *unlock* side. In C the unlock is a statement you have to reach; in Rust it is a `Drop` impl that runs on every exit path out of the scope:

<div class="svg-container" style="margin:2rem 0;">
<svg class="dlockb-fig" viewBox="0 0 800 400" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Side-by-side scope walkthrough: an early return in C skips pthread_mutex_unlock and leaves the mutex locked, while in Rust dropping the MutexGuard unlocks on every exit path">
<style>
.dlockb-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .dlockb-fig,[data-theme="dark"] .dlockb-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.dlockb-fig text{font-family:ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.dlockb-fig .title{font-size:13px;font-weight:700}
.dlockb-fig .body{font-size:12px;font-weight:600}
.dlockb-fig .cap{font-size:11px;fill:var(--mut)}
.dlockb-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.dlockb-fig .dead{fill:var(--bg);stroke:var(--mut);stroke-width:1.5;stroke-dasharray:5 4}
.dlockb-fig .acbox{fill:var(--ac);stroke:var(--ac)}
.dlockb-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="dlockb-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"></path>
</marker>
</defs>
<!-- column titles -->
<text x="210" y="28" text-anchor="middle" class="title">C — unlock is a statement</text>
<text x="590" y="28" text-anchor="middle" class="title">Rust — unlock is a destructor</text>
<!-- C step 1 -->
<rect class="box" x="40" y="48" width="340" height="52" rx="8"></rect>
<text x="210" y="70" text-anchor="middle" class="body">pthread_mutex_lock(&amp;m)</text>
<text x="210" y="88" text-anchor="middle" class="cap">lock now held by this thread</text>
<path class="ln" d="M210,100 L210,124" marker-end="url(#dlockb-arrow)"></path>
<!-- C step 2 -->
<rect class="box" x="40" y="124" width="340" height="52" rx="8"></rect>
<text x="210" y="146" text-anchor="middle" class="body">if (err) return;</text>
<text x="210" y="164" text-anchor="middle" class="cap">early exit jumps past the rest</text>
<path class="ln" d="M210,176 L210,200" marker-end="url(#dlockb-arrow)"></path>
<!-- C step 3 -->
<rect class="dead" x="40" y="200" width="340" height="52" rx="8"></rect>
<text x="210" y="222" text-anchor="middle" class="body" fill="var(--mut)">pthread_mutex_unlock(&amp;m)</text>
<text x="210" y="240" text-anchor="middle" class="cap">never reached on the error path</text>
<path class="ln" d="M210,252 L210,276" marker-end="url(#dlockb-arrow)"></path>
<!-- C outcome -->
<rect class="dead" x="40" y="276" width="340" height="58" rx="8"></rect>
<text x="210" y="300" text-anchor="middle" class="title" fill="var(--mut)">Mutex stays locked</text>
<text x="210" y="320" text-anchor="middle" class="cap">the next thread to lock it blocks forever</text>
<!-- Rust step 1 -->
<rect class="box" x="420" y="48" width="340" height="52" rx="8"></rect>
<text x="590" y="70" text-anchor="middle" class="body">let g = m.lock().unwrap();</text>
<text x="590" y="88" text-anchor="middle" class="cap">MutexGuard owns the lock</text>
<path class="ln" d="M590,100 L590,124" marker-end="url(#dlockb-arrow)"></path>
<!-- Rust step 2 -->
<rect class="box" x="420" y="124" width="340" height="52" rx="8"></rect>
<text x="590" y="146" text-anchor="middle" class="body">if err { return; }</text>
<text x="590" y="164" text-anchor="middle" class="cap">early exit — or a panic — leaves the scope</text>
<path class="ln" d="M590,176 L590,200" marker-end="url(#dlockb-arrow)"></path>
<!-- Rust step 3 -->
<rect class="box" x="420" y="200" width="340" height="52" rx="8"></rect>
<text x="590" y="222" text-anchor="middle" class="body">drop(g) — inserted by the compiler</text>
<text x="590" y="240" text-anchor="middle" class="cap">runs on every path out, including unwind</text>
<path class="ln" d="M590,252 L590,276" marker-end="url(#dlockb-arrow)"></path>
<!-- Rust outcome -->
<rect class="acbox" x="420" y="276" width="340" height="58" rx="8"></rect>
<text x="590" y="300" text-anchor="middle" class="title" fill="#ffffff">Released, always</text>
<text x="590" y="320" text-anchor="middle" class="body" fill="#ffffff">one failure mode fewer to reason about</text>
<!-- caption -->
<text x="400" y="368" text-anchor="middle" class="cap">RAII removes the forgotten-unlock bug — it does not remove the lock-ordering bug</text>
</svg>
</div>

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
Write predictable locking code and test interleavings using tools like `loom`

Two threads locking the same pair of `Mutex<T>`s in opposite orders will eventually hang,
and Rust will compile it without complaint. That's the boundary of what the type system
buys you: it rules out data races, not deadlocks.
