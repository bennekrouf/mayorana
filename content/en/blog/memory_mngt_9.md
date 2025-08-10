---
id: borrowing-rules-rust
title: mutable vs. immutable borrows.
slug: borrowing-rules-rust
locale: en
date: '2025-08-10'
author: mayo
excerpt: Rust memory and string
content_focus: rust memory and string
technical_level: Expert technical discussion
category: rust
tags:
  - rust
  - memory
  - borrowing
  - ownership
---

# What are the rules for borrowing in Rust?

Rust’s borrowing rules, enforced by the borrow checker at compile time, ensure memory safety and prevent data races without runtime overhead. These rules govern how data can be accessed via references, distinguishing between mutable (`&mut T`) and immutable (`&T`) borrows.

## The Borrowing Rules (Compiler-Enforced)

1. **Either One Mutable Borrow (`&mut T`) OR Multiple Immutable Borrows (`&T`)**:
   - You can have:
     - **One mutable reference** (`&mut T`), OR
     - **Any number of immutable references** (`&T`).
   - Never both at the same time for the same data.
2. **References Must Always Be Valid (No Dangling Pointers)**:
   - Borrowed references cannot outlive the data they point to, enforced by Rust’s lifetime system.

## Immutable Borrows (`&T`)

- **Read-only access**: Cannot modify the data.
- **Multiple allowed**: Safe for concurrent reads, as no modifications can occur.

**Example**:
```rust
let x = 42;
let r1 = &x;  // OK: Immutable borrow
let r2 = &x;  // OK: Another immutable borrow
println!("{}, {}", r1, r2);  // Works fine
```

## Mutable Borrows (`&mut T`)

- **Exclusive access**: Allows modification of the data.
- **No other borrows allowed**: No `&T` or additional `&mut T` can coexist for the same data.

**Example**:
```rust
let mut x = 42;
let r1 = &mut x;  // OK: Mutable borrow
*r1 += 1;         // Can modify
// let r2 = &x;   // ERROR: Cannot borrow `x` as immutable while mutable borrow exists
```

## Compiler Rejects These Scenarios

1. **Mutable + Immutable Overlap**:
   ```rust
   let mut data = 10;
   let r1 = &data;      // Immutable borrow
   let r2 = &mut data;  // ERROR: Cannot borrow as mutable while borrowed as immutable
   ```

2. **Multiple Mutable Borrows**:
   ```rust
   let mut s = String::new();
   let r1 = &mut s;
   let r2 = &mut s;  // ERROR: Second mutable borrow
   ```

3. **Dangling References**:
   ```rust
   fn dangling() -> &String {
       let s = String::from("oops");
       &s  // ERROR: `s` dies here, reference would dangle
   }
   ```

## Why These Rules Matter

- **Prevents Data Races**: By disallowing concurrent mutable access, Rust ensures thread safety by default.
- **Ensures Memory Safety**: No dangling pointers or iterator invalidation, as the borrow checker enforces valid references.

## Key Takeaways

✅ **Immutable borrows (`&T`)**:
- Many allowed, but no mutation.
✅ **Mutable borrows (`&mut T`)**:
- Only one allowed, exclusive access.
🚫 **Violations caught at compile time**: No runtime overhead.

**Real-World Impact**: These rules enable fearless concurrency, as seen in crates like `Rayon` for parallel iteration.

**Experiment**: Try creating a function that takes `&mut T` and call it twice with the same data.  
**Answer**: The borrow checker won’t allow it unless the first borrow’s scope ends, preventing overlapping mutable borrows.
