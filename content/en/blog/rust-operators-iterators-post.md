---
id: rust-comparison-operators-iterators
title: 'Rust Operators & Iterators: Quick Reference'
locale: en
slug: rust-comparison-operators-iterators
date: '2025-08-10'
author: mayo
excerpt: >-
  Essential Rust operators, iterator differences, and Unicode handling you need
  to know.

tags:
  - rust
  - operators
  - iterators
---

# Rust Operators & Iterators: What You Need to Know

Quick reference for common Rust gotchas and patterns.

## Comparison Operators

Rust keeps it simple:
```rust
x == y    // Equal
x != y    // Not equal
x < y     // Less than
x > y     // Greater than
```

**No `<>`, `===`, or `!==`** like other languages. Just `==` and `!=`.

## Iterator vs Collection

Know what's iterable:
```rust
3..10                    // ✅ Iterator
["a", "b"]              // ❌ Array (use .iter())
vec!["x", "y"]          // ❌ Vec (use .iter() or .into_iter())
```

## iter() vs into_iter()

```rust
let arr = ["a", "b", "c"];

arr.iter()        // &&str (reference to reference)
arr.into_iter()   // &str (cleaner, preferred)
```

Use `into_iter()` for arrays - one less reference level.

## Unicode from Char

```rust
let c = '🦀';
let code = c as u32;           // 129408
println!("U+{:04X}", code);   // U+1F980
```

## What Has .sort()?

Only **mutable slices**:
```rust
let mut vec = vec![3, 1, 4];
vec.sort();  // ✅

let mut arr = [3, 1, 4];
arr.sort();  // ✅

// Iterators need .collect() first
let sorted: Vec<_> = iter.collect().sort();  // ❌
let mut sorted: Vec<_> = iter.collect();     // ✅
sorted.sort();
```

## into() vs into_iter()

Different purposes:
```rust
"hello".into()           // Type conversion (&str -> String)
vec![1,2,3].into_iter()  // Creates iterator
```

**Remember**: `into()` converts types, `into_iter()` makes iterators.
