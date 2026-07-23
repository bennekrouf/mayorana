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

## Key Takeaways

✅ **Stack**: Fast, fixed-size, automatic.  
✅ **Heap**: Flexible, dynamic, manual (via smart pointers).  
✅ Rust defaults to stack but uses heap for growable/unknown-size data.

**Follow-Up**: When would you force heap allocation?  
- For large structs (avoid stack overflow).  
- When you need dynamic dispatch (e.g., `Box<dyn Trait>`).  
- To share ownership across threads (`Arc<T>`).
