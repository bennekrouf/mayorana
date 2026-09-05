---
id: concurrency-rust
title: How Rust's Ownership and Borrowing Ensure Safe Concurrency
slug: concurrency-rust
locale: en
date: '2025-07-30'
author: mayo
excerpt: Rust memory and string

tags:
  - rust
  - concurrency
---

# How do ownership and borrowing prevent data races?

Rust’s concurrency model leverages its ownership and borrowing rules to guarantee thread safety at compile time, eliminating data races without requiring a garbage collector. This approach ensures safe, high-performance parallelism with minimal runtime overhead.

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm12-fig" viewBox="0 0 800 250" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Multiple threads each hold a cloned Arc pointing to the same Mutex-protected data, but the Mutex allows only one thread exclusive access at a time">
<!-- style -->
<style>
.mm12-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .mm12-fig,[data-theme="dark"] .mm12-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.mm12-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm12-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm12-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.mm12-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.mm12-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.mm12-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="mm12arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
</defs>
<!-- threads -->
<rect x="40" y="30" width="160" height="46" rx="6" class="box"/>
<text x="120" y="58" text-anchor="middle" class="tx">Thread A: Arc clone</text>
<rect x="40" y="94" width="160" height="46" rx="6" class="box"/>
<text x="120" y="122" text-anchor="middle" class="tx">Thread B: Arc clone</text>
<rect x="40" y="158" width="160" height="46" rx="6" class="box"/>
<text x="120" y="186" text-anchor="middle" class="tx">Thread C: Arc clone</text>
<!-- Y-merge to mutex -->
<path d="M200,53 L340,53 L340,125" class="ln" marker-end="url(#mm12arrow)"/>
<path d="M200,117 L340,117 L340,125" class="ln"/>
<path d="M200,181 L340,181 L340,125" class="ln" marker-end="url(#mm12arrow)"/>
<!-- mutex -->
<rect x="340" y="103" width="160" height="46" rx="6" class="boxac"/>
<text x="420" y="122" text-anchor="middle" class="tx">Mutex&lt;T&gt;</text>
<text x="420" y="138" text-anchor="middle" class="mut">one lock() at a time</text>
<!-- to data -->
<path d="M500,126 L560,126" class="ln" marker-end="url(#mm12arrow)"/>
<rect x="560" y="103" width="180" height="46" rx="6" class="box"/>
<text x="650" y="126" text-anchor="middle" class="tx">shared data</text>
<text x="650" y="142" text-anchor="middle" class="mut">exclusive access, no race</text>
<text x="40" y="222" class="mut">Arc: shared ownership across threads · Mutex: exclusive access at a time</text>
</svg>
</div>

## Rust’s Concurrency Model

Rust uses the following mechanisms to manage concurrency:
- **Ownership**: Ensures exclusive mutable access to data.
- **Borrowing**: Governs how data is accessed via references.
- **Lifetimes**: Prevent dangling references across threads.
- **Send/Sync Traits**: Define which types are safe for threading.

## How Ownership and Borrowing Prevent Data Races

A **data race** occurs when:
- Two threads access the same data concurrently.
- At least one access is a write.
- There’s no synchronization.

Rust’s rules make data races impossible in safe code:

### 1. Exclusive Mutability (`&mut T`)
- Only one mutable reference (`&mut T`) can exist at a time, enforced by the borrow checker.
- This prevents multiple threads from writing to the same data simultaneously.

**Example**:
```rust
let mut data = 0;
let r1 = &mut data;  // OK: Mutable borrow
// let r2 = &mut data;  // ERROR: Cannot borrow `data` as mutable more than once
```

### 2. No Shared Mutability Without Synchronization
- Shared references (`&T`) are read-only, safe for concurrent access.
- To mutate shared data, synchronization primitives like `Mutex` are required:

**Example**:
```rust
use std::sync::Mutex;

let shared = Mutex::new(42);
let guard = shared.lock().unwrap();  // Exclusive access
*guard += 1;  // Safe mutation
```

## Thread-Safe Types: Send and Sync

- **Send**: A type can be safely transferred across threads (e.g., `String`, `Mutex<T>`).
- **Sync**: A type can be safely shared between threads via references (e.g., `&i32`, `Arc<T>`).

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm12b-fig" viewBox="0 0 800 250" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Send moves a value across the thread boundary, Sync lets two threads use one reference at the same time, and Rc is neither so it is rejected at compile time">
<!-- style -->
<style>
.mm12b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00;--bad:#e11d48}
:root.dark .mm12b-fig,[data-theme="dark"] .mm12b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.mm12b-fig .panel{fill:none;stroke:var(--ln);stroke-width:1.5}
.mm12b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm12b-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm12b-fig .boxbad{fill:var(--box);stroke:var(--bad);stroke-width:2;stroke-dasharray:4 3}
.mm12b-fig .ti{fill:var(--tx);font:700 13px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.mm12b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.mm12b-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.mm12b-fig .bad{fill:var(--bad);font:600 11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.mm12b-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.mm12b-fig .lnac{stroke:var(--ac);stroke-width:2;fill:none}
.mm12b-fig .lnbad{stroke:var(--bad);stroke-width:1.5;fill:none;stroke-dasharray:4 3}
</style>
<!-- defs -->
<defs>
<marker id="mm12b-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
<marker id="mm12b-arrowac" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ac)"/></marker>
<marker id="mm12b-arrowbad" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--bad)"/></marker>
</defs>
<!-- panel 1: Send -->
<rect x="20" y="44" width="242" height="170" rx="8" class="panel"/>
<text x="141" y="68" class="ti">Send — value crosses</text>
<rect x="36" y="84" width="90" height="32" rx="5" class="box"/>
<text x="81" y="105" class="tx">Thread A</text>
<path d="M126,100 L156,100" class="lnac" marker-end="url(#mm12b-arrowac)"/>
<rect x="156" y="84" width="90" height="32" rx="5" class="boxac"/>
<text x="201" y="105" class="tx">Thread B</text>
<text x="141" y="150" class="mut">ownership moves once</text>
<text x="141" y="168" class="mut">A can no longer touch it</text>
<text x="141" y="198" class="mut">String · Box&lt;T&gt; · Mutex&lt;T&gt;</text>
<!-- panel 2: Sync -->
<rect x="278" y="44" width="242" height="170" rx="8" class="panel"/>
<text x="399" y="68" class="ti">Sync — reference shared</text>
<rect x="294" y="84" width="90" height="32" rx="5" class="box"/>
<text x="339" y="105" class="tx">Thread A</text>
<rect x="414" y="84" width="90" height="32" rx="5" class="box"/>
<text x="459" y="105" class="tx">Thread B</text>
<path d="M339,116 L339,132 L399,132" class="ln"/>
<path d="M459,116 L459,132 L399,132" class="ln"/>
<path d="M399,132 L399,146" class="ln" marker-end="url(#mm12b-arrow)"/>
<rect x="339" y="146" width="120" height="34" rx="5" class="boxac"/>
<text x="399" y="168" class="tx">&amp;T — one value</text>
<text x="399" y="198" class="mut">&amp;i32 · Arc&lt;T&gt; · Mutex&lt;T&gt;</text>
<!-- panel 3: neither -->
<rect x="536" y="44" width="242" height="170" rx="8" class="panel"/>
<text x="657" y="68" class="ti">Rc&lt;T&gt; — neither</text>
<rect x="552" y="84" width="90" height="32" rx="5" class="box"/>
<text x="597" y="105" class="tx">Thread A</text>
<rect x="672" y="84" width="90" height="32" rx="5" class="box"/>
<text x="717" y="105" class="tx">Thread B</text>
<path d="M597,116 L597,132 L657,132" class="lnbad"/>
<path d="M717,116 L717,132 L657,132" class="lnbad"/>
<path d="M657,132 L657,146" class="lnbad" marker-end="url(#mm12b-arrowbad)"/>
<rect x="597" y="146" width="120" height="34" rx="5" class="boxbad"/>
<text x="657" y="168" class="tx">Rc&lt;T&gt;</text>
<text x="657" y="198" class="bad">rejected at compile time</text>
<!-- footer -->
<text x="400" y="238" class="mut">Send asks "can it move here?" · Sync asks "can both sides hold a reference at once?"</text>
</svg>
</div>

**Example: Spawning Threads**:
```rust
use std::thread;

let value = String::from("hello");  // `String` is `Send`
thread::spawn(move || {             // `move` transfers ownership
    println!("{}", value);          // Safe: no other thread can access `value`
}).join().unwrap();
```

## Common Concurrency Tools

| **Tool** | **Purpose** | **Thread Safety Mechanism** |
|----------|-------------|-----------------------------|
| `Mutex<T>` | Mutual exclusion | Locks for exclusive access |
| `Arc<T>` | Atomic reference counting | Shared ownership across threads |
| `RwLock<T>` | Read-write lock | Multiple readers or one writer |
| `mpsc channels` | Message passing | Transfers ownership between threads |

**Example: Shared State with Arc + Mutex**:
```rust
use std::sync::{Arc, Mutex};
use std::thread;

let counter = Arc::new(Mutex::new(0));
let mut handles = vec![];

for _ in 0..10 {
    let counter = Arc::clone(&counter);
    handles.push(thread::spawn(move || {
        let mut num = counter.lock().unwrap();
        *num += 1;  // Mutex ensures exclusive access
    }));
}

for handle in handles {
    handle.join().unwrap();
}
println!("Result: {}", *counter.lock().unwrap());  // Outputs 10
```

## Why This Matters

- **No runtime overhead**: Safety checks occur at compile time.
- **No garbage collector**: Safe concurrency without GC pauses.
- **Fearless parallelism**: The compiler rejects unsafe patterns, enabling confident concurrent programming.

## Key Takeaways

**Ownership rules prevent**:
- Concurrent mutable access (no data races).
- Dangling references (via lifetimes).

**Send/Sync enforce** thread safety at compile time.

**Use `Mutex`, `Arc`, or channels** for safe shared state.

**Real-World Impact**: Crates like `rayon` (parallel iterators) and `tokio` (async runtime) rely on these guarantees for robust concurrency.

Try to send an `Rc<T>` to another thread and the compiler stops you: `Rc` isn't `Send`,
because its refcount isn't atomic. `Arc<T>` is the same shape with the atomic counter, and
you pay for that on every clone.
