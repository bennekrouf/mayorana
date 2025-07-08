---
id: cow-copy-on-write-rust
title: "How does Cow<'a, B> (Copy-on-Write) work in Rust? When use it ?"
slug: cow-copy-on-write-rust
date: '2025-07-07'
author: mayo
excerpt: >-
  Rust memory and string
content_focus: "rust memory and string"
technical_level: "Expert technical discussion"
category: rust
tags:
  - rust
  - memory
  - cow
  - string
  - copy-on-write
scheduledFor: '2025-07-08'
scheduledAt: '2025-07-08T06:55:13.405Z'
---

# How does Cow<'a, B> (Copy-on-Write) work in Rust? When would you use it for strings or other data?

`Cow<'a, B>` (Copy-on-Write) is a smart pointer in Rust’s `std::borrow` module that provides a clone-free abstraction over borrowed and owned data. It enables efficient handling of data that may or may not need modification, minimizing allocations while maintaining flexibility.

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
