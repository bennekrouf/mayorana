---
id: string-str-mismatch-rust
title: 'Why &str Won''t Fit &String in Rust: Fun Fixes for String Mismatches!'
slug: string-str-mismatch-rust
locale: en
date: '2025-08-04'
author: mayo
excerpt: Rust memory and string

tags:
  - rust
  - memory
  - string
  - str
  - ownership
---

# Why can’t you pass a &str directly to a function expecting a &String?

In Rust, you cannot pass a `&str` directly to a function expecting a `&String` due to their distinct types, which ensures type safety and prevents assumptions about memory ownership. Below, I explain why this mismatch occurs and how to handle it effectively.

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm6-fig" viewBox="0 0 800 220" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Deref coercion allows a reference String to convert automatically into a str slice, but the reverse direction is rejected by the compiler">
<style>
.mm6-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00;--bad:#ef4444}
:root.dark .mm6-fig,[data-theme="dark"] .mm6-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569;--bad:#f87171}
.mm6-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm6-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm6-fig .title{font:700 14px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm6-fig .body{font:600 12px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm6-fig .cap{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
.mm6-fig .ac{fill:var(--ac)}
.mm6-fig .bad{fill:var(--bad)}
.mm6-fig path{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="mm6-arrow-ac" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ac)"/></marker>
<marker id="mm6-arrow-bad" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--bad)"/></marker>
</defs>
<!-- boxes -->
<rect x="60" y="60" width="220" height="70" rx="8" class="box"/>
<text x="170" y="90" text-anchor="middle" class="title">&amp;String</text>
<text x="170" y="108" text-anchor="middle" class="cap">owned, growable reference</text>
<rect x="520" y="60" width="220" height="70" rx="8" class="acbox"/>
<text x="630" y="90" text-anchor="middle" class="title ac">&amp;str</text>
<text x="630" y="108" text-anchor="middle" class="cap">flexible slice, preferred param</text>
<!-- coercion arrow, top -->
<path d="M280,80 L520,80" style="stroke:var(--ac)" marker-end="url(#mm6-arrow-ac)"/>
<text x="400" y="70" text-anchor="middle" class="cap ac">Deref coercion (automatic)</text>
<!-- blocked arrow, bottom -->
<path d="M520,115 L280,115" style="stroke:var(--bad)" marker-end="url(#mm6-arrow-bad)"/>
<text x="400" y="135" text-anchor="middle" class="cap bad">no implicit conversion (compile error)</text>
<!-- caption box -->
<rect x="140" y="160" width="520" height="50" rx="8" class="box"/>
<text x="400" y="190" text-anchor="middle" class="body">Fix: accept &amp;str in function params, or convert with .to_string()</text>
</svg>
</div>

## The Core Issue: Type Mismatch

- **`&String`**: A reference to a heap-allocated, growable `String`.
- **`&str`**: A string slice that can point to heap, stack, or static memory.
- They are **different types**, so Rust rejects implicit conversions for safety.

The type mismatch is not bureaucratic — the two references hold physically different things:

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm6b-fig" viewBox="0 0 800 310" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Side by side layout showing that a String reference points at an owning struct of pointer length and capacity before reaching the bytes, while a str reference is itself a pointer and length aimed straight at the bytes">
<style>
.mm6b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .mm6b-fig,[data-theme="dark"] .mm6b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.mm6b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm6b-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm6b-fig .bytes{fill:var(--bg);stroke:var(--ln);stroke-width:1.5}
.mm6b-fig .title{font:700 14px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm6b-fig .body{font:600 12px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm6b-fig .cap{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
.mm6b-fig .ac{fill:var(--ac)}
.mm6b-fig path{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="mm6b-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ln);stroke:none"/></marker>
<marker id="mm6b-arrowac" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ac);stroke:none"/></marker>
</defs>
<!-- headers -->
<text x="205" y="28" text-anchor="middle" class="title">&amp;String — two hops</text>
<text x="595" y="28" text-anchor="middle" class="title ac">&amp;str — one hop</text>
<!-- left column -->
<rect x="30" y="46" width="350" height="48" rx="8" class="box"/>
<text x="205" y="68" text-anchor="middle" class="body">&amp;String</text>
<text x="205" y="85" text-anchor="middle" class="cap">a thin pointer to an owner struct</text>
<rect x="30" y="132" width="350" height="48" rx="8" class="box"/>
<text x="205" y="154" text-anchor="middle" class="body">String { ptr, len, cap }</text>
<text x="205" y="171" text-anchor="middle" class="cap">carries capacity, can grow and reallocate</text>
<rect x="30" y="218" width="350" height="48" rx="8" class="bytes"/>
<text x="205" y="240" text-anchor="middle" class="body">h e l l o</text>
<text x="205" y="257" text-anchor="middle" class="cap">heap buffer, owned by that String</text>
<!-- left arrows -->
<path d="M205,94 L205,132" marker-end="url(#mm6b-arrow)"/>
<path d="M205,180 L205,218" marker-end="url(#mm6b-arrow)"/>
<!-- right column -->
<rect x="420" y="46" width="350" height="48" rx="8" class="acbox"/>
<text x="595" y="68" text-anchor="middle" class="body ac">&amp;str = { ptr, len }</text>
<text x="595" y="85" text-anchor="middle" class="cap">the fat pointer is the whole value</text>
<rect x="420" y="218" width="350" height="48" rx="8" class="bytes"/>
<text x="595" y="240" text-anchor="middle" class="body">h e l l o</text>
<text x="595" y="257" text-anchor="middle" class="cap">bytes anywhere: static, stack or heap</text>
<!-- right arrow, no owner struct in between -->
<path d="M470,94 L470,218" style="stroke:var(--ac)" marker-end="url(#mm6b-arrowac)"/>
<text x="500" y="150" class="cap">no owner struct in between,</text>
<text x="500" y="166" class="cap">so no capacity and no right to grow</text>
<!-- caption -->
<text x="400" y="296" text-anchor="middle" class="cap">A function asking for &amp;String demands the middle box exist; a &amp;str has no middle box to offer.</text>
</svg>
</div>

**Example: The Problem**:
```rust
fn print_string(s: &String) {
    println!("{}", s);
}

fn main() {
    let my_str = "hello";  // Type: `&'static str`
    print_string(my_str);  // ERROR: expected `&String`, found `&str`
}
```

## Solutions to Bridge &str and &String

### 1. Deref Coercion (Automatic Conversion)

Rust automatically converts `&String` to `&str` via the `Deref` trait, but not the reverse. The best fix is to change the function to accept `&str` for greater flexibility.

```rust
fn print_str(s: &str) {  // Now accepts both `&str` and `&String`
    println!("{}", s);
}

fn main() {
    let my_string = String::from("hello");
    let my_str = "world";
    print_str(&my_string);  // Works: `&String` coerces to `&str`
    print_str(my_str);      // Works directly
}
```

**Why this works**: `String` implements `Deref<Target=str>`, allowing `&String` to coerce to `&str`.

### 2. Explicit Conversion (When You Need &String)

If the function must take `&String`, convert `&str` to a `String` first:

```rust
fn print_string(s: &String) {
    println!("{}", s);
}

fn main() {
    let my_str = "hello";
    print_string(&my_str.to_string());  // Allocates a new `String`
}
```

**Drawback**: This allocates a new heap buffer, which should be avoided if possible due to performance costs.

### 3. Use `AsRef<str>` for Maximum Flexibility

For functions that should work with any string-like type:

```rust
fn print_as_str<S: AsRef<str>>(s: S) {
    println!("{}", s.as_ref());
}

fn main() {
    let my_string = String::from("hello");
    let my_str = "world";
    print_as_str(&my_string);  // Works
    print_as_str(my_str);      // Works
}
```

**Bonus**: Also accepts `Cow<str>`, `Box<str>`, etc.

## Key Takeaways

**Preferred**: Use `&str` in function arguments (flexible and zero-cost).  
**If stuck with `&String`**: Convert `&str` to `String` (allocates).  
**For APIs**: Use `AsRef<str>` or `impl Deref<Target=str>` for maximum compatibility.

**Why Rust Enforces This**:
- Prevents accidental allocations or assumptions about memory ownership.
- Encourages efficient, borrow-friendly APIs.

Passing a `String` to `print_str` without the `&` is a type error, not a move error — deref
coercion only fires through a reference, so there's nothing for the compiler to coerce.
