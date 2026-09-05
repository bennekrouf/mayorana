---
id: string-literals-memory-rust
title: Where do string literals (&str) live?
slug: string-literals-memory-rust
locale: en
date: '2025-08-06'
author: mayo
excerpt: Rust memory and string

tags:
  - rust
  - memory
  - string
---

# How does Rust handle string literals (&str) in terms of memory allocation? Where do they live?

String literals (`&str`) in Rust are handled efficiently, with distinct memory characteristics compared to heap-allocated `String` types. Understanding their allocation and lifetime is key to writing performant and safe Rust code.

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm8-fig" viewBox="0 0 800 260" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="A static str variable on the stack points into the binary's read-only rodata segment, while a String variable points to a mutable heap allocation">
<style>
.mm8-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .mm8-fig,[data-theme="dark"] .mm8-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.mm8-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm8-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm8-fig .title{font:700 13px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm8-fig .body{font:600 12px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm8-fig .cap{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
.mm8-fig .ac{fill:var(--ac)}
.mm8-fig path{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="mm8-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ln)"/></marker>
<marker id="mm8-arrow-ac" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ac)"/></marker>
</defs>
<!-- stack variables -->
<rect x="40" y="30" width="220" height="60" rx="8" class="box"/>
<text x="150" y="55" text-anchor="middle" class="body">s: &amp;'static str</text>
<text x="150" y="72" text-anchor="middle" class="cap">ptr + len (stack)</text>
<rect x="40" y="120" width="220" height="60" rx="8" class="box"/>
<text x="150" y="145" text-anchor="middle" class="body">name: String</text>
<text x="150" y="162" text-anchor="middle" class="cap">ptr + len + cap (stack)</text>
<!-- memory segments -->
<rect x="480" y="30" width="280" height="60" rx="8" class="acbox"/>
<text x="620" y="55" text-anchor="middle" class="title ac">.rodata segment</text>
<text x="620" y="72" text-anchor="middle" class="cap">"hello" — immutable, 'static</text>
<rect x="480" y="120" width="280" height="60" rx="8" class="box"/>
<text x="620" y="145" text-anchor="middle" class="title">Heap</text>
<text x="620" y="162" text-anchor="middle" class="cap">"Alice and Bob" — mutable, scoped</text>
<!-- arrows -->
<path d="M260,60 L480,60" style="stroke:var(--ac)" marker-end="url(#mm8-arrow-ac)"/>
<path d="M260,150 L480,150" marker-end="url(#mm8-arrow)"/>
<!-- caption -->
<rect x="150" y="210" width="500" height="40" rx="8" class="box"/>
<text x="400" y="235" text-anchor="middle" class="cap">Returning &amp;str borrowed from a local String dangles when the function returns</text>
</svg>
</div>

## String Literals (&str) in Memory

### Storage Location

- String literals (e.g., `"hello"`) are stored in the **read-only data segment** (`.rodata`) of the compiled binary, not on the heap or stack.
- They are embedded directly in the executable and loaded into memory at program startup.
- Memory is **static**, meaning it lives for the entire program duration.

### Type Inference

- The type of `"hello"` is `&'static str`:
  - `&str`: An immutable string slice.
  - `'static`: A lifetime lasting the entire program.

**Example: Memory Layout**:
```rust
let s: &'static str = "hello"; // Points to static memory
```

- **Binary Representation**:
  - Executable Memory: `"hello"` stored in `.rodata` section, e.g., at address `0x1000`.
  - Variable `s`: A pointer (`0x1000`) + length (`5`), stored on the stack.

## Key Properties

| **Property** | **Explanation** |
|--------------|-----------------|
| **Immutable** | Cannot modify the literal (e.g., `"hello"[0] = 'H'` is forbidden). |
| **Zero-Cost** | No runtime allocation (already in memory). |
| **Lifetime** | Always `'static` (valid for the whole program). |

## Comparison with `String`

| **Feature** | **&'static str (literal)** | **String** |
|-------------|----------------------------|------------|
| **Memory Location** | Read-only data segment | Heap |
| **Mutability** | Immutable | Mutable |
| **Lifetime** | `'static` | Scoped to owner |
| **Allocation Cost** | None (compile-time) | Runtime allocation |

## Common Use Cases

### Constants
```rust
const GREETING: &str = "hello"; // No allocation
```

### Function Arguments
Prefer `&str` over `&String` to accept literals without allocation:
```rust
fn print(s: &str) { /* ... */ }
print("world"); // No conversion needed
```

## Why Not Always Use &'static str?

- Limited to **compile-time-known strings**.
- Cannot dynamically create or modify them (unlike `String`).

**Example: Dynamic Strings Require `String`**:
```rust
let name = "Alice".to_string(); // Heap-allocated copy
name.push_str(" and Bob");      // Mutability possible
```

## The Problem: Dangling Pointer Risk

Returning a reference (`&str`) to a local `String` creates a dangling pointer, as the `String` is dropped when the function ends.

**Example: Code That Fails to Compile**:
```rust
fn return_str() -> &str {         // ERROR: Missing lifetime specifier!
    let s = String::from("hello");
    &s                            // Returns a reference to `s`...
}                                 // `s` is dropped here (dangling pointer!)
```

**Compiler Error**:
```
error[E0106]: missing lifetime specifier
 --> src/main.rs:1:17
  |
1 | fn return_str() -> &str {
  |                   ^ expected named lifetime parameter
  |
  = help: this function's return type contains a borrowed value, but there is no value for it to be borrowed from
```

### Why Rust Rejects This

- **Ownership Rules**: `String` (`s`) is owned by the function and dropped when the scope ends. Returning `&s` would create a reference to freed memory.
- **Lifetime Enforcement**: Rust requires explicit lifetimes to ensure references are always valid. Here, the reference (`&str`) has no owner to borrow from after the function exits.

### How to Fix It

There are exactly three shapes the fix can take, and they differ in who owns the bytes:

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm8b-fig" viewBox="0 0 800 290" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="A rejected function returning a reference to a local String branches into three valid designs: return an owned String, return a static str literal, or return a Cow that is borrowed or owned">
<style>
.mm8b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .mm8b-fig,[data-theme="dark"] .mm8b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.mm8b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm8b-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm8b-fig .deadbox{fill:none;stroke:var(--mut);stroke-width:1.5;stroke-dasharray:4 3}
.mm8b-fig .title{font:700 13px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm8b-fig .body{font:600 12px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm8b-fig .cap{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
.mm8b-fig .ac{fill:var(--ac)}
.mm8b-fig .mut{fill:var(--mut)}
.mm8b-fig path{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="mm8b-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ln);stroke:none"/></marker>
<marker id="mm8b-arrowac" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ac);stroke:none"/></marker>
</defs>
<!-- rejected root -->
<rect x="280" y="26" width="240" height="58" rx="8" class="deadbox"/>
<text x="400" y="50" text-anchor="middle" class="body mut">fn return_str() -&gt; &amp;str</text>
<text x="400" y="68" text-anchor="middle" class="cap">nothing for the &amp;str to borrow from</text>
<!-- fan out -->
<path d="M400,84 L400,112"/>
<path d="M135,112 L665,112"/>
<path d="M135,112 L135,140" marker-end="url(#mm8b-arrow)"/>
<path d="M400,112 L400,140" style="stroke:var(--ac)" marker-end="url(#mm8b-arrowac)"/>
<path d="M665,112 L665,140" marker-end="url(#mm8b-arrow)"/>
<!-- option 1 -->
<rect x="30" y="140" width="210" height="80" rx="8" class="box"/>
<text x="135" y="164" text-anchor="middle" class="body">-&gt; String</text>
<text x="135" y="184" text-anchor="middle" class="cap">ownership moves to caller</text>
<text x="135" y="202" text-anchor="middle" class="cap">costs one heap allocation</text>
<!-- option 2 -->
<rect x="295" y="140" width="210" height="80" rx="8" class="acbox"/>
<text x="400" y="164" text-anchor="middle" class="body ac">-&gt; &amp;'static str</text>
<text x="400" y="184" text-anchor="middle" class="cap">bytes already sit in .rodata</text>
<text x="400" y="202" text-anchor="middle" class="cap">no allocation, literals only</text>
<!-- option 3 -->
<rect x="560" y="140" width="210" height="80" rx="8" class="box"/>
<text x="665" y="164" text-anchor="middle" class="body">-&gt; Cow&lt;'static, str&gt;</text>
<text x="665" y="184" text-anchor="middle" class="cap">borrowed or owned per call</text>
<text x="665" y="202" text-anchor="middle" class="cap">allocates only when it must</text>
<!-- caption -->
<text x="400" y="252" text-anchor="middle" class="cap">The local String is never an option: it dies at the closing brace.</text>
<text x="400" y="272" text-anchor="middle" class="cap">Every fix either hands over ownership or points at memory that outlives the call.</text>
</svg>
</div>

#### Option 1: Return an Owned `String` (No Reference)
```rust
fn return_owned() -> String {  // Transfer ownership to caller
    String::from("hello")      // No reference, no lifetime issue
}
```

#### Option 2: Return a `&'static str` (String Literal)
```rust
fn return_static() -> &'static str {  // Lives forever in binary
    "hello"                          // Static memory (not heap)
}
```

#### Option 3: Use `Cow<str>` for Flexibility
```rust
use std::borrow::Cow;

fn return_cow(is_heap: bool) -> Cow<'static, str> {
    if is_heap {
        Cow::Owned(String::from("hello"))  // Heap-allocated
    } else {
        Cow::Borrowed("hello")             // Static memory
    }
}
```

**String literals**:
- Live in static memory (part of the binary).
- Are immutable and zero-cost.
- Have `'static` lifetime.

**When to use them**:
- For fixed, read-only strings (e.g., messages, constants).
- To avoid allocations in function APIs (`&str` over `&String`).

**Never return `&str` borrowed from a local `String`**—it’s impossible in safe Rust.

**Solutions**:
- Return `String` (ownership transfer).
- Use `&'static str` (literals only).
- Use `Cow<str>` for dynamic choices.

**Advanced Note**: Rust optimizes `&str` references to literals. Even if you write:
```rust
let s = String::from("hello");
let slice = &s[..]; // Points to heap, not static memory!
```
The compiler may elide copies if the content is known statically.

Swapping `&s` for `&s[..]` doesn't help. The slice still points into the same `String` that's
about to be dropped; you've changed the type, not the lifetime.
