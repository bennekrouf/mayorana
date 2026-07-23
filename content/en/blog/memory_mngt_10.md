---
id: cow-copy-on-write-rust
title: 'How does Cow<''a, B> (Copy-on-Write) work in Rust?'
slug: cow-copy-on-write-rust
locale: en
date: '2025-07-30'
author: mayo
excerpt: Rust memory and string

tags:
  - rust
  - string
---

# How does Cow<'a, B> (Copy-on-Write) work in Rust? When would you use it for strings or other data?

`Cow<'a, B>` (Copy-on-Write) is a smart pointer in Rust’s `std::borrow` module that provides a clone-free abstraction over borrowed and owned data. It enables efficient handling of data that may or may not need modification, minimizing allocations while maintaining flexibility.

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm10-fig" viewBox="0 0 800 240" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="A Cow starts as a borrowed reference with zero allocation, and only converts to an owned allocation when the data actually needs modification">
<style>
.mm10-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .mm10-fig,[data-theme="dark"] .mm10-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.mm10-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm10-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm10-fig .title{font:700 13px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm10-fig .body{font:600 12px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm10-fig .cap{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
.mm10-fig .ac{fill:var(--ac)}
.mm10-fig path{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="mm10-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ln)"/></marker>
<marker id="mm10-arrow-ac" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ac)"/></marker>
</defs>
<!-- input box -->
<rect x="30" y="90" width="180" height="60" rx="8" class="box"/>
<text x="120" y="115" text-anchor="middle" class="body">Cow::Borrowed</text>
<text x="120" y="133" text-anchor="middle" class="cap">input, zero-cost</text>
<!-- decision box -->
<rect x="300" y="90" width="200" height="60" rx="8" class="box"/>
<text x="400" y="115" text-anchor="middle" class="body">needs mutation?</text>
<text x="400" y="133" text-anchor="middle" class="cap">checked at call site</text>
<path d="M210,120 L300,120" marker-end="url(#mm10-arrow)"/>
<!-- no path -->
<rect x="590" y="20" width="190" height="55" rx="8" class="box"/>
<text x="685" y="45" text-anchor="middle" class="body">stays Borrowed</text>
<text x="685" y="61" text-anchor="middle" class="cap">no: zero allocation</text>
<path d="M500,105 L590,55" marker-end="url(#mm10-arrow)"/>
<!-- yes path -->
<rect x="590" y="155" width="190" height="55" rx="8" class="acbox"/>
<text x="685" y="180" text-anchor="middle" class="body ac">becomes Owned</text>
<text x="685" y="196" text-anchor="middle" class="cap">yes: one allocation</text>
<path d="M500,135 L590,182" style="stroke:var(--ac)" marker-end="url(#mm10-arrow-ac)"/>
</svg>
</div>

## What is Cow?

`Cow` (short for Copy-on-Write) can represent:
- **Borrowed data** (`&'a B`): A reference to existing data, avoiding allocations.
- **Owned data** (`<B as ToOwned>::Owned`): A fully owned copy, allocated only when mutation is required.

**Definition** (from `std::borrow`):
```rust
pub enum Cow<'a, B>
where
    B: 'a + ToOwned + ?Sized,
{
    Borrowed(&'a B),  // Immutable reference (no allocation)
    Owned(<B as ToOwned>::Owned),  // Owned data (allocated when needed)
}
```

**How It Works**:
- Initially wraps a reference (`Borrowed`), which is zero-cost.
- Converts to owned data (`Owned`) lazily, only when modification is needed.

## Example with Cow<str> (Strings)

```rust
use std::borrow::Cow;

fn process(input: &str) -> Cow<str> {
    if input.contains("error") {
        Cow::Owned(input.replace("error", ""))  // Allocates new String
    } else {
        Cow::Borrowed(input)  // No allocation
    }
}

fn main() {
    let msg1 = "hello world";  // No allocation
    let msg2 = "error: foo";   // Will allocate when processed

    println!("{}", process(msg1)); // "hello world" (borrowed)
    println!("{}", process(msg2)); // ": foo" (owned)
}
```

## Key Use Cases

### 1. Optimizing String Operations
Avoid allocations when modifying strings conditionally:

```rust
fn to_uppercase(input: &str) -> Cow<str> {
    if input.chars().any(|c| c.is_lowercase()) {
        Cow::Owned(input.to_uppercase())  // Allocates only if needed
    } else {
        Cow::Borrowed(input)
    }
}
```

**Extended Example** (checking for digits):
```rust
fn to_uppercase_no_digits(input: &str) -> Cow<str> {
    if input.chars().any(|c| c.is_lowercase() || c.is_digit(10)) {
        Cow::Owned(input.to_uppercase().replace(|c: char| c.is_digit(10), ""))
    } else {
        Cow::Borrowed(input)
    }
}
```

`Cow` ensures no allocation if the input is already uppercase and digit-free, optimizing read-only paths.

### 2. API Flexibility
Accept both borrowed and owned data without forcing clones:

```rust
fn print(data: Cow<str>) {
    println!("{}", data);
}

fn main() {
    let my_string = String::from("world");
    print(Cow::Borrowed("hello"));  // No allocation
    print(Cow::Owned(my_string));   // Works too
}
```

This supports `&str`, `String`, or other types implementing `ToOwned`.

### 3. Zero-Copy Parsing
Common in parsers (e.g., `serde`), where fields are often unmodified:

```rust
struct JsonValue<'a> {
    data: Cow<'a, str>,  // Borrows from input unless modified
}
```

## When to Avoid Cow

- **Always-mutated data**: Use `String` or `Vec` directly to avoid `Cow` overhead.
- **Thread-safety**: `Cow` is not thread-safe; use `Arc` + `Mutex` for concurrent access.

## Performance Implications

| **Scenario** | **Behavior** | **Allocation Cost** |
|--------------|--------------|---------------------|
| No modification | Stays as `Borrowed` | Zero |
| Modification | Converts to `Owned` | One allocation |

## Key Takeaways

✅ **Use `Cow` when**:
- You need to conditionally modify borrowed data.
- You want to avoid allocations for read-only paths.
- Your API should accept both `&str` and `String` efficiently.

🚀 **Real-world uses**:
- `regex::Match` (borrows input strings).
- `serde` deserialization.
- Path manipulation (`PathBuf` vs. `&Path`).

**Note**: `Cow` works with any `ToOwned` type (e.g., `[u8]` → `Vec<u8]`, `Path` → `PathBuf`).

**Experiment**: Modifying the `to_uppercase` example to handle digits (as shown above) demonstrates how `Cow` avoids allocations unless both lowercase letters *and* digits are present, optimizing performance.
