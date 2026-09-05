---
id: borrowing-rules-rust
title: mutable vs. immutable borrows.
slug: borrowing-rules-rust
locale: en
date: '2025-08-10'
author: mayo
excerpt: Rust memory and string

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

What the checker actually compares is not *whether* both borrows exist, but whether their live spans touch. A borrow's span ends at its **last use**, not at the end of the block:

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm9b-fig" viewBox="0 0 800 316" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Two timelines of borrow live spans: in the rejected order the shared borrow is still live when the mutable borrow starts, in the accepted order the shared borrow ends at its last use before the mutable borrow begins">
<style>
.mm9b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .mm9b-fig,[data-theme="dark"] .mm9b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.mm9b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm9b-fig .bar{fill:var(--bg);stroke:var(--ln);stroke-width:1.5}
.mm9b-fig .acbar{fill:var(--bg);stroke:var(--ac);stroke-width:2}
.mm9b-fig .zone{fill:none;stroke:var(--ac);stroke-width:2;stroke-dasharray:5 4}
.mm9b-fig .title{font:700 13px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm9b-fig .body{font:600 12px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm9b-fig .cap{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
.mm9b-fig .ac{fill:var(--ac)}
.mm9b-fig path{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="mm9b-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--mut);stroke:none"/></marker>
</defs>
<!-- rejected timeline -->
<text x="30" y="26" class="title">Rejected: the shared borrow is still live later</text>
<text x="286" y="46" text-anchor="middle" class="cap">1. let r1 = &amp;data;</text>
<text x="480" y="46" text-anchor="middle" class="cap">2. let r2 = &amp;mut data;</text>
<text x="673" y="46" text-anchor="middle" class="cap">3. println!("{}", r1);</text>
<text x="30" y="74" class="body">&amp;data</text>
<rect x="200" y="58" width="500" height="24" rx="6" class="bar"/>
<text x="450" y="75" text-anchor="middle" class="cap">live until its last use on line 3</text>
<text x="30" y="106" class="body">&amp;mut data</text>
<rect x="400" y="90" width="360" height="24" rx="6" class="bar"/>
<text x="580" y="107" text-anchor="middle" class="cap">live from line 2 onward</text>
<rect x="400" y="52" width="300" height="66" rx="8" class="zone"/>
<text x="550" y="136" text-anchor="middle" class="cap ac">both live at once, so rustc refuses</text>
<!-- accepted timeline -->
<text x="30" y="176" class="title">Accepted: same two borrows, reordered</text>
<text x="286" y="196" text-anchor="middle" class="cap">1. let r1 = &amp;data;</text>
<text x="480" y="196" text-anchor="middle" class="cap">2. println!("{}", r1);</text>
<text x="673" y="196" text-anchor="middle" class="cap">3. let r2 = &amp;mut data;</text>
<text x="30" y="224" class="body">&amp;data</text>
<rect x="200" y="208" width="290" height="24" rx="6" class="bar"/>
<text x="345" y="225" text-anchor="middle" class="cap">span closes at last use</text>
<text x="30" y="256" class="body">&amp;mut data</text>
<rect x="560" y="240" width="200" height="24" rx="6" class="acbar"/>
<text x="660" y="257" text-anchor="middle" class="cap ac">now exclusive</text>
<text x="400" y="284" text-anchor="middle" class="cap">No instant has both spans live, so the same statements now compile.</text>
<!-- time axis -->
<text x="170" y="304" text-anchor="end" class="cap">time</text>
<path d="M200,300 L770,300" style="stroke:var(--mut)" marker-end="url(#mm9b-arrow)"/>
</svg>
</div>

## Why These Rules Matter

- **Prevents Data Races**: By disallowing concurrent mutable access, Rust ensures thread safety by default.
- **Ensures Memory Safety**: No dangling pointers or iterator invalidation, as the borrow checker enforces valid references.

## The two rules
✅ **Immutable borrows (`&T`)**:
- Many allowed, but no mutation.
✅ **Mutable borrows (`&mut T`)**:
- Only one allowed, exclusive access.
🚫 **Violations caught at compile time**: No runtime overhead.

**Real-World Impact**: These rules enable fearless concurrency, as seen in crates like `Rayon` for parallel iteration.

Write a function taking `&mut T` and call it twice on the same value. It compiles — but only
because the first borrow ends at the end of the call. Hold that borrow in a variable across
both calls and you'll see the real error.
