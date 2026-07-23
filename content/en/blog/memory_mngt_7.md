---
id: box-pointer-rust
title: What is the purpose of Box<T> in Rust?
slug: box-pointer-rust
locale: en
date: '2025-08-05'
author: mayo
excerpt: Rust memory and string

tags:
  - rust
  - memory
  - box
  - heap
  - ownership
---

# What is the purpose of Box<T> in Rust?

`Box<T>` is a smart pointer in Rust that provides heap allocation for a value of type `T`. It is the simplest way to store data on the heap, offering ownership and memory safety guarantees without runtime overhead.

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm7-fig" viewBox="0 0 800 240" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="A Box pointer lives on the stack with a fixed size and uniquely owns a value allocated on the heap, compared against Rc and Arc which allow shared ownership">
<style>
.mm7-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .mm7-fig,[data-theme="dark"] .mm7-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.mm7-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm7-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm7-fig .title{font:700 13px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm7-fig .body{font:600 12px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm7-fig .cap{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
.mm7-fig .ac{fill:var(--ac)}
.mm7-fig path{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="mm7-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ac)"/></marker>
</defs>
<!-- stack box -->
<rect x="60" y="40" width="180" height="70" rx="8" class="acbox"/>
<text x="150" y="68" text-anchor="middle" class="title ac">Box&lt;T&gt;</text>
<text x="150" y="86" text-anchor="middle" class="cap">stack: one pointer (usize)</text>
<!-- heap box -->
<rect x="400" y="40" width="200" height="70" rx="8" class="box"/>
<text x="500" y="68" text-anchor="middle" class="title">T value</text>
<text x="500" y="86" text-anchor="middle" class="cap">heap: uniquely owned</text>
<path d="M240,75 L400,75" style="stroke:var(--ac)" marker-end="url(#mm7-arrow)"/>
<!-- comparison row -->
<rect x="60" y="150" width="220" height="60" rx="8" class="acbox"/>
<text x="170" y="175" text-anchor="middle" class="body ac">Box&lt;T&gt;</text>
<text x="170" y="193" text-anchor="middle" class="cap">unique owner</text>
<rect x="300" y="150" width="220" height="60" rx="8" class="box"/>
<text x="410" y="175" text-anchor="middle" class="body">Rc&lt;T&gt;</text>
<text x="410" y="193" text-anchor="middle" class="cap">shared, single-thread refcount</text>
<rect x="540" y="150" width="220" height="60" rx="8" class="box"/>
<text x="650" y="175" text-anchor="middle" class="body">Arc&lt;T&gt;</text>
<text x="650" y="193" text-anchor="middle" class="cap">shared, atomic refcount</text>
</svg>
</div>

## What is Box<T>?

- **Heap Allocation**: Moves data from the stack to the heap.
  ```rust
  let x = Box::new(42); // `42` is stored on the heap
  ```
- **Ownership**: `Box<T>` owns the data and ensures it is dropped when the `Box` goes out of scope.
- **Fixed Size**: The `Box` itself is a pointer (`usize`) with a known stack size, even if `T` is dynamically sized (e.g., `Box<dyn Trait>`).

## When to Use Box<T>

### 1. Recursive Types (e.g., Linked Lists)
Rust requires compile-time-known sizes, but recursive types (like trees or lists) would be infinitely sized without indirection.

```rust
enum List {
    Cons(i32, Box<List>), // Without `Box`, this would be invalid
    Nil,
}
```

### 2. Large Data (Avoid Stack Overflow)
Moving large structs (e.g., a 1MB buffer) to the heap prevents stack overflows.

```rust
let big_data = Box::new([0u8; 1_000_000]); // Heap-allocated array
```

### 3. Trait Objects (dyn Trait)
Storing heterogeneous types behind a trait interface for dynamic dispatch.

```rust
trait Animal { fn speak(&self); }
struct Cat;
impl Animal for Cat { fn speak(&self) { println!("Meow"); } }

let animals: Vec<Box<dyn Animal>> = vec![Box::new(Cat)]; // Dynamic dispatch
```

### 4. Transferring Ownership Across Threads
`Box` can be used with `std::thread::spawn` to move owned data to another thread.

```rust
let x = Box::new(42);
std::thread::spawn(move || {
    println!("{}", x); // `x` is moved into the thread
});
```

## How Box<T> Differs from Other Pointers

| **Type** | **Ownership** | **Use Case** |
|----------|---------------|--------------|
| `Box<T>` | Owned (unique) | Heap allocation, recursive types |
| `&T`/`&mut T` | Borrowed | Temporary references |
| `Rc<T>` | Shared (reference-counted) | Multiple owners in single-threaded code |
| `Arc<T>` | Shared (atomic refcount) | Thread-safe multiple owners |

## Memory Safety Guarantees

- **No manual `free()`**: Automatically deallocates when `Box` goes out of scope.
- **No null pointers**: `Box` cannot be null (unlike raw pointers).
- **No leaks**: Compiler enforces ownership rules.

## Example: Box vs Stack Allocation

```rust
// Stack (fails if too large)
// let arr = [0u8; 10_000_000]; // Likely stack overflow

// Heap (works)
let arr = Box::new([0u8; 10_000_000]); // Safe
```

## Key Takeaways

✅ **Use `Box<T>` when you need**:
- Heap allocation for large or recursive data.
- Trait objects (`dyn Trait`).
- Explicit ownership with a fixed-size pointer.

🚫 **Avoid if**:
- You only need a reference (`&T`).
- You need shared ownership (use `Rc` or `Arc` instead).

**Thought Experiment**: What happens if you try to `Box` a value already on the heap?  
**Answer**: It’s fine—just adds another pointer indirection, as the `Box` will point to the new heap allocation.
