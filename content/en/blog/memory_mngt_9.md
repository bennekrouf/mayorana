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

tags:
  - rust
  - memory
  - borrowing
  - ownership
---

# What are the rules for borrowing in Rust?

Rust’s borrowing rules, enforced by the borrow checker at compile time, ensure memory safety and prevent data races without runtime overhead. These rules govern how data can be accessed via references, distinguishing between mutable (`&mut T`) and immutable (`&T`) borrows.

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm9-fig" viewBox="0 0 800 240" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Allowed borrow states are many immutable references or exactly one mutable reference to the same data; mixing a mutable and immutable borrow is rejected">
<style>
.mm9-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00;--bad:#ef4444}
:root.dark .mm9-fig,[data-theme="dark"] .mm9-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569;--bad:#f87171}
.mm9-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm9-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm9-fig .badbox{fill:var(--box);stroke:var(--bad);stroke-width:2}
.mm9-fig .title{font:700 13px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm9-fig .body{font:600 12px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm9-fig .cap{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
.mm9-fig .ac{fill:var(--ac)}
.mm9-fig .bad{fill:var(--bad)}
</style>
<!-- allowed: many immutable -->
<text x="150" y="24" text-anchor="middle" class="title">OK: Many &amp;T</text>
<rect x="30" y="40" width="240" height="50" rx="8" class="acbox"/>
<text x="150" y="70" text-anchor="middle" class="body ac">&amp;x, &amp;x, &amp;x, ...</text>
<text x="150" y="110" text-anchor="middle" class="cap">read-only, unlimited count</text>
<!-- allowed: one mutable -->
<text x="400" y="24" text-anchor="middle" class="title">OK: One &amp;mut T</text>
<rect x="280" y="40" width="240" height="50" rx="8" class="acbox"/>
<text x="400" y="70" text-anchor="middle" class="body ac">&amp;mut x</text>
<text x="400" y="110" text-anchor="middle" class="cap">exclusive access, no others</text>
<!-- rejected: mixed -->
<text x="650" y="24" text-anchor="middle" class="title">Rejected: Mixed</text>
<rect x="530" y="40" width="240" height="50" rx="8" class="badbox"/>
<text x="650" y="70" text-anchor="middle" class="body bad">&amp;x + &amp;mut x</text>
<text x="650" y="110" text-anchor="middle" class="cap">compile error: data race risk</text>
<!-- summary box -->
<rect x="130" y="150" width="540" height="60" rx="8" class="box"/>
<text x="400" y="175" text-anchor="middle" class="body">Borrow checker enforces this at compile time</text>
<text x="400" y="193" text-anchor="middle" class="cap">no runtime cost, no data races possible in safe code</text>
</svg>
</div>

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
