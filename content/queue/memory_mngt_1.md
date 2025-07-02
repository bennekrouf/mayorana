---
id: string-vs-str-rust
title: >-
  What is the difference between String and str in Rust? When would you use
  each?
slug: string-vs-str-rust
date: '2025-06-27'
author: mayo
excerpt: >-
  Expert technical discussion on String vs str in Rust, covering memory
  management, ownership, and when to use each type.
category: rust
tags:
  - rust
  - string
  - memory
  - ownership
  - types
scheduledFor: '2025-07-09'
scheduledAt: '2025-07-01T06:55:13.413Z'
---

# What is the difference between String and str in Rust? When would you use each?

Understanding the distinction between `String` and `str` is fundamental to effective memory management and ownership in Rust.

## Key Differences

| `String` | `str` (usually `&str`) |
|----------|------------------------|
| Growable, heap-allocated UTF-8 string | Immutable, fixed-size view into UTF-8 string |
| Owned type (manages its memory) | Borrowed type (does not own memory) |
| Mutable (can modify content) | Immutable view |
| Created using `String::from("...")` or `"...".to_string()` | From string literals (`"hello"`) or borrowed from `String` (`&my_string`) |

## Memory Layout

**`String`**: Stores data on the heap with three components:
- Pointer to heap buffer
- Length (current size)
- Capacity (allocated size)

**`&str`**: A "fat pointer" containing:
- Pointer to string data (heap, stack, or static memory)
- Length of the slice

## When to Use Each

Use **`String`** when:
- You need to modify or grow the string
- You need ownership (e.g., returning from a function)
- Building strings dynamically

```rust
let mut owned = String::from("hello");
owned.push_str(" world");  // Mutation requires String
```

Use **`&str`** when:
- You only need a read-only view of a string
- Working with function parameters (avoids unnecessary allocations)
- Handling string literals (stored in read-only memory)

```rust
fn process_str(s: &str) -> usize {
    s.len()  // Read-only access
}
```

## Example: Ownership vs Borrowing

```rust
fn process_string(s: String) { /* takes ownership */ }
fn process_str(s: &str)      { /* borrows */ }

fn main() {
    let heap_str = String::from("hello");
    let static_str = "world";
    
    process_string(heap_str);  // Ownership moved
    process_str(static_str);   // Borrowed
    
    // heap_str no longer accessible here
    // static_str still accessible
}
```

## Performance Considerations

**Function Parameters**:
```rust
// Inefficient - forces allocation
fn bad(s: String) -> usize { s.len() }

// Efficient - accepts both String and &str
fn good(s: &str) -> usize { s.len() }

// Usage
let owned = String::from("test");
good(&owned);  // Deref coercion: String -> &str
good("literal");  // Direct &str
```

**Memory Allocation**:
- `String` allocates on heap, requires deallocation
- `&str` to literals points to program binary (zero allocation)
- `&str` from `String` shares existing allocation

## Common Patterns

**Return Owned Data**:
```rust
fn build_message(name: &str) -> String {
    format!("Hello, {}!", name)  // Returns owned String
}
```

**Accept Flexible Input**:
```rust
fn analyze(text: &str) -> Analysis {
    // Works with both String and &str inputs
    text.chars().count()
}
```

**Avoid Unnecessary Clones**:
```rust
// Bad - unnecessary allocation
fn process_bad(s: &str) -> String {
    s.to_string()  // Only if you actually need owned data
}

// Good - work with borrowed data when possible
fn process_good(s: &str) -> &str {
    s.trim()  // Returns slice of original
}
```

## Key Takeaways

✅ **`String`**: Owned, mutable, heap-allocated  
✅ **`str`**: Borrowed, immutable, flexible (heap/stack/static)  
🚀 Prefer `&str` for function parameters unless you need ownership or mutation

**Try This:** What happens when you call `.to_string()` on a string literal vs a `String`?  
**Answer:** Literal creates new heap allocation; `String` creates a clone of existing heap data—both allocate, but the source differs!
