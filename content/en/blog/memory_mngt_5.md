---
id: dangling-pointer-rust
title: How does Rust prevent dangling pointer at compile time?
slug: dangling-pointer-rust
locale: en
date: '2025-08-03'
author: mayo
excerpt: Rust memory and string

tags:
  - rust
  - memory
  - dangling-pointer
  - ownership
  - lifetimes
---

# What is a dangling pointer, and how does Rust prevent it at compile time?

A **dangling pointer** occurs when a pointer references memory that has already been freed, leading to undefined behavior like crashes or security vulnerabilities. In languages like C/C++, this is a common issue:

```c
int* create_int() {
    int x = 5;  // `x` lives on the stack
    return &x;  // Returns a pointer to `x`...
}  // `x` is destroyed here (dangling pointer returned!)
```

Rust eliminates dangling pointers at compile time using its ownership model and lifetime system, ensuring memory safety without runtime overhead.

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm5-fig" viewBox="0 0 800 260" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Returning a reference to a local variable is rejected by the borrow checker, while tying the return lifetime to the input parameter is accepted">
<style>
.mm5-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00;--bad:#ef4444}
:root.dark .mm5-fig,[data-theme="dark"] .mm5-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569;--bad:#f87171}
.mm5-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm5-fig .badbox{fill:var(--box);stroke:var(--bad);stroke-width:2}
.mm5-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm5-fig .title{font:700 13px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm5-fig .body{font:600 12px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm5-fig .cap{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
.mm5-fig .bad{fill:var(--bad)}
.mm5-fig .ac{fill:var(--ac)}
.mm5-fig path{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="mm5-arrow-bad" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--bad)"/></marker>
<marker id="mm5-arrow-ac" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ac)"/></marker>
</defs>
<!-- rejected path -->
<text x="200" y="24" text-anchor="middle" class="title">Rejected</text>
<rect x="60" y="40" width="280" height="60" rx="8" class="box"/>
<text x="200" y="65" text-anchor="middle" class="body">fn dangling() { let s = ..; }</text>
<text x="200" y="82" text-anchor="middle" class="cap">s dropped at end of scope</text>
<rect x="60" y="130" width="280" height="60" rx="8" class="badbox"/>
<text x="200" y="155" text-anchor="middle" class="body bad">return &amp;s</text>
<text x="200" y="172" text-anchor="middle" class="cap">compile error: dangling reference</text>
<path d="M200,100 L200,130" marker-end="url(#mm5-arrow-bad)"/>
<!-- accepted path -->
<text x="600" y="24" text-anchor="middle" class="title">Accepted</text>
<rect x="460" y="40" width="280" height="60" rx="8" class="box"/>
<text x="600" y="65" text-anchor="middle" class="body">fn valid&lt;'a&gt;(s: &amp;'a String)</text>
<text x="600" y="82" text-anchor="middle" class="cap">input lifetime 'a borrowed</text>
<rect x="460" y="130" width="280" height="60" rx="8" class="acbox"/>
<text x="600" y="155" text-anchor="middle" class="body ac">-&gt; &amp;'a String { s }</text>
<text x="600" y="172" text-anchor="middle" class="cap">output tied to caller's data</text>
<path d="M600,100 L600,130" style="stroke:var(--ac)" marker-end="url(#mm5-arrow-ac)"/>
<!-- caption -->
<text x="400" y="230" text-anchor="middle" class="cap">The borrow checker rejects references that outlive their data's scope</text>
</svg>
</div>

## How Rust Prevents Dangling Pointers

Rust uses two key mechanisms to prevent dangling pointers:

### 1. Ownership + Borrowing Rules

- **Rule**: References (`&T` or `&mut T`) must not outlive the data they point to.
- **Enforced by**: The borrow checker, which tracks variable scopes and ensures references remain valid.

**Example: Rejected at Compile Time**:
```rust
fn dangling() -> &String {  // Missing lifetime specifier!
    let s = String::from("hello");
    &s  // ERROR: `s` dies at end of function
}       // Compiler: "returns a reference to dropped data"
```

**Fixed with Lifetimes** (Explicit Guarantee):
```rust
fn valid_reference<'a>(s: &'a String) -> &'a String {
    s  // OK: Returned reference tied to input's lifetime
}
```

### 2. Lifetime Annotations

- Rust requires **explicit lifetime declarations** (`'a`) when references cross scope boundaries.
- The compiler ensures all references obey their assigned lifetimes, preventing references to freed memory.

**Example: Struct with Reference**:
```rust
struct Book<'a> {  // Must declare lifetime
    title: &'a str  // Reference must live as long as `Book`
}

fn main() {
    let title = String::from("Rust");
    let book = Book { title: &title };
    // `book.title` cannot outlive `title`
}
```

## Why This Matters

| **Language** | **Dangling Pointer Risk** | **Safety Mechanism** |
|--------------|---------------------------|----------------------|
| C/C++        | High (manual memory mgmt) | None (programmer's responsibility) |
| Rust         | Zero                      | Compile-time checks (ownership + lifetimes) |

## Key Takeaways

✅ Rust’s compiler guarantees:
- No references to freed memory.
- No undefined behavior from dangling pointers.
- Safety without runtime overhead.

**Real-World Impact**: Crates like `hyper` (HTTP) and `tokio` (async) rely on these guarantees for secure, performant code.
