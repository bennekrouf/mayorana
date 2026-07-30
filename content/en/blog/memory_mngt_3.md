---
id: stack-heap-allocation-rust
title: 'Stack vs. Heap in Rust: Where Does Your Data Live?'
slug: stack-heap-allocation-rust
locale: en
date: '2025-08-01'
author: mayo
excerpt: Rust memory and string

tags:
  - rust
  - memory
  - stack
  - heap
  - allocation
---

# What is the difference between stack and heap allocation in Rust?

Rust uses stack and heap allocation to manage memory, with distinct characteristics for each. Understanding their differences and how Rust decides where to allocate data is key to writing efficient and safe code.

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm3-fig" viewBox="0 0 800 300" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Stack frames holding fixed-size values and a pointer, with the pointer indirecting to a heap-allocated buffer">
<style>
.mm3-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .mm3-fig,[data-theme="dark"] .mm3-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.mm3-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm3-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm3-fig .title{font:700 14px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm3-fig .body{font:600 12px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm3-fig .cap{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
.mm3-fig .ac{fill:var(--ac)}
.mm3-fig path{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="mm3-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ac)"/></marker>
</defs>
<!-- column titles -->
<text x="180" y="26" text-anchor="middle" class="title">Stack (LIFO, fixed size)</text>
<text x="600" y="26" text-anchor="middle" class="title">Heap (dynamic size)</text>
<!-- stack frames -->
<rect x="60" y="46" width="240" height="50" rx="6" class="box"/>
<text x="180" y="76" text-anchor="middle" class="body">let x = 5;  (i32)</text>
<rect x="60" y="106" width="240" height="50" rx="6" class="box"/>
<text x="180" y="136" text-anchor="middle" class="body">let s = String::from(..)</text>
<rect x="60" y="166" width="240" height="50" rx="6" class="acbox"/>
<text x="180" y="196" text-anchor="middle" class="body ac">boxed: ptr ●</text>
<!-- heap blocks -->
<rect x="480" y="106" width="240" height="50" rx="6" class="box"/>
<text x="600" y="136" text-anchor="middle" class="cap">"heap" (String bytes)</text>
<rect x="480" y="180" width="240" height="60" rx="6" class="acbox"/>
<text x="600" y="205" text-anchor="middle" class="body ac">42</text>
<text x="600" y="223" text-anchor="middle" class="cap">Box::new(42)</text>
<!-- arrows: pointers indirect into heap -->
<path d="M300,131 L480,131" marker-end="url(#mm3-arrow)"/>
<path d="M300,191 L480,210" style="stroke:var(--ac)" marker-end="url(#mm3-arrow)"/>
</svg>
</div>

## Stack vs. Heap in Rust

| **Stack** | **Heap** |
|-----------|----------|
| Fast allocation/deallocation (LIFO). | Slower allocation (dynamic). |
| Fixed, known size at compile time. | Size can grow (e.g., `String`, `Vec`). |
| Automatic cleanup (no `free()` needed). | Manual management (via `Drop` trait). |
| Used for primitive types (`i32`, `bool`), small structs. | Used for large, dynamic data (`String`, `Box<T>`). |

## How Rust Decides Where to Allocate

### By Default → Stack

If a type has a **fixed size** (e.g., `i32`, arrays, structs with no `String`/`Vec`), it is allocated on the **stack**.

**Example**:
```rust
let x = 5; // Stack (i32 is fixed-size)
```

### Explicit Heap Allocation

Use types like `Box<T>`, `String`, `Vec`, etc., to allocate on the **heap**.

**Example**:
```rust
let s = String::from("heap"); // Heap (growable UTF-8 string)
let boxed = Box::new(42);     // Heap (Box<T>)
```

## Move Semantics

When a value is **moved**, its heap data is transferred, not copied, ensuring efficient memory management.

**Example**:
```rust
let s1 = String::from("hello"); // Heap-allocated
let s2 = s1; // Moves ownership (heap data not copied)
// println!("{}", s1); // ERROR: s1 is invalidated
```

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm3-fig2" viewBox="0 0 800 300" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Before and after a move: only the stack header is copied from s1 to s2 while the heap buffer stays in place and s1 becomes unusable">
<style>
.mm3-fig2{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .mm3-fig2,[data-theme="dark"] .mm3-fig2{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.mm3-fig2 .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm3-fig2 .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm3-fig2 .dead{fill:var(--box);stroke:var(--ln);stroke-width:1.5;stroke-dasharray:5 4}
.mm3-fig2 .title{font:700 14px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm3-fig2 .body{font:600 12px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm3-fig2 .cap{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
.mm3-fig2 .ac{fill:var(--ac)}
.mm3-fig2 path{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="mm3b-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ln);stroke:none"/></marker>
<marker id="mm3b-arrow-ac" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ac);stroke:none"/></marker>
</defs>
<!-- panel titles -->
<text x="200" y="26" text-anchor="middle" class="title">Before</text>
<text x="600" y="26" text-anchor="middle" class="title">After</text>
<text x="200" y="44" text-anchor="middle" class="cap">let s1 = String::from("hello");</text>
<text x="600" y="44" text-anchor="middle" class="cap">let s2 = s1;</text>
<!-- stack label -->
<text x="60" y="74" class="cap">stack</text>
<!-- before: s1 header -->
<rect x="60" y="84" width="280" height="48" rx="6" class="box"/>
<text x="200" y="105" text-anchor="middle" class="body">s1 : ptr | len 5 | cap 5</text>
<text x="200" y="122" text-anchor="middle" class="cap">3-word header</text>
<!-- after: s1 invalid -->
<rect x="460" y="76" width="280" height="40" rx="6" class="dead"/>
<text x="600" y="101" text-anchor="middle" class="cap">s1 — moved out, cannot be used</text>
<!-- after: s2 header -->
<rect x="460" y="126" width="280" height="46" rx="6" class="acbox"/>
<text x="600" y="146" text-anchor="middle" class="body ac">s2 : ptr | len 5 | cap 5</text>
<text x="600" y="163" text-anchor="middle" class="cap">same ptr value, bitwise copy</text>
<!-- transition arrow -->
<text x="400" y="102" text-anchor="middle" class="cap ac">move</text>
<path d="M340,114 L460,114" style="stroke:var(--ac)" marker-end="url(#mm3b-arrow-ac)"/>
<!-- heap label -->
<text x="60" y="200" class="cap">heap</text>
<rect x="60" y="210" width="280" height="46" rx="6" class="box"/>
<text x="200" y="238" text-anchor="middle" class="body">"hello"</text>
<rect x="460" y="210" width="280" height="46" rx="6" class="box"/>
<text x="600" y="232" text-anchor="middle" class="body">"hello"</text>
<text x="600" y="249" text-anchor="middle" class="cap">untouched — zero bytes copied</text>
<!-- pointers -->
<path d="M200,132 L200,210" marker-end="url(#mm3b-arrow)"/>
<path d="M600,172 L600,210" style="stroke:var(--ac)" marker-end="url(#mm3b-arrow-ac)"/>
<!-- caption -->
<text x="400" y="284" text-anchor="middle" class="cap">One owner per buffer: s1 must be invalidated so the heap block is freed exactly once.</text>
</svg>
</div>

## Key Takeaways

✅ **Stack**: Fast, fixed-size, automatic.  
✅ **Heap**: Flexible, dynamic, manual (via smart pointers).  
✅ Rust defaults to stack but uses heap for growable/unknown-size data.

**Follow-Up**: When would you force heap allocation?  
- For large structs (avoid stack overflow).  
- When you need dynamic dispatch (e.g., `Box<dyn Trait>`).  
- To share ownership across threads (`Arc<T>`).
