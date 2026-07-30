---
id: memory-safety-rust
title: How does Rust ensure memory safety without a garbage collector?
slug: memory-safety-rust
author: mayo
locale: en
excerpt: Rust memory and string

tags:
  - rust
  - memory
  - ownership
  - borrowing
  - lifetimes
date: '2025-07-31'
---
# How does Rust ensure memory safety without a garbage collector?
Rust guarantees memory safety at compile time using three key mechanisms: ownership, borrowing, and lifetimes. These ensure no memory leaks, data races, or dangling pointers without the need for a garbage collector.

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm2-fig" viewBox="0 0 800 260" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Ownership, borrowing, and lifetimes converge to guarantee compile-time memory safety without a garbage collector">
<style>
.mm2-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .mm2-fig,[data-theme="dark"] .mm2-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.mm2-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm2-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm2-fig .title{font:700 13px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm2-fig .body{font:600 12px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm2-fig .cap{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
.mm2-fig .ac{fill:var(--ac)}
.mm2-fig path{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="mm2-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ac)"/></marker>
</defs>
<!-- three mechanism boxes -->
<rect x="30" y="30" width="200" height="70" rx="8" class="box"/>
<text x="130" y="58" text-anchor="middle" class="title">Ownership</text>
<text x="130" y="76" text-anchor="middle" class="cap">single owner, dropped on scope exit</text>
<!-- box2 -->
<rect x="300" y="30" width="200" height="70" rx="8" class="box"/>
<text x="400" y="58" text-anchor="middle" class="title">Borrowing</text>
<text x="400" y="76" text-anchor="middle" class="cap">&amp;T or &amp;mut T, never both</text>
<!-- box3 -->
<rect x="570" y="30" width="200" height="70" rx="8" class="box"/>
<text x="670" y="58" text-anchor="middle" class="title">Lifetimes</text>
<text x="670" y="76" text-anchor="middle" class="cap">references never outlive data</text>
<!-- merge point -->
<path d="M130,100 L130,160 L400,160"/>
<path d="M400,100 L400,160"/>
<path d="M670,100 L670,160 L400,160"/>
<path d="M400,160 L400,180" marker-end="url(#mm2-arrow)"/>
<!-- result box -->
<rect x="230" y="180" width="340" height="60" rx="8" class="acbox"/>
<text x="400" y="205" text-anchor="middle" class="title ac">Memory Safety</text>
<text x="400" y="223" text-anchor="middle" class="cap">no GC, no runtime overhead</text>
</svg>
</div>

## The C/C++ Problem
C and C++ give developers complete control over memory, but this leads to critical safety issues:

**Dangling Pointers**:
```c
char* get_string() {
    char buffer[100] = "hello"; // Stack allocated
    return buffer;              // Returns pointer to freed memory
} // ERROR: buffer is destroyed here

int* ptr = malloc(sizeof(int));
free(ptr);
*ptr = 42; // ERROR: Use after free
```

**Memory Leaks**:
```cpp
void leak_memory() {
    int* data = new int[1000]; // Heap allocation
    if (some_condition) {
        return; // ERROR: Memory never freed
    }
    delete[] data; // Only freed on normal path
}
```

**Double Free**:
```c
int* ptr = malloc(sizeof(int));
free(ptr);
free(ptr); // ERROR: Double free causes undefined behavior
```

## Java's Garbage Collection Approach
Java solves these issues with automatic memory management:

**✅ Pros**:
- No dangling pointers (references become null when objects are collected)
- No memory leaks for reachable objects
- No double free errors

**❌ Cons**:
- **Runtime overhead**: GC pauses can cause unpredictable latency
- **Memory overhead**: Additional metadata for tracking objects
- **No deterministic cleanup**: Objects freed at GC's discretion, not immediately

```java
// Java - memory managed automatically
String createString() {
    String s = new String("hello"); // Heap allocated
    return s; // Safe: GC will clean up when no longer referenced
} // No explicit cleanup needed
```

## 1. Ownership Rules
- Each value in Rust has a **single owner**.
- When the owner goes out of scope, the value is **dropped** (memory freed).
- Prevents **double frees** and **memory leaks**.

**Example**:
```rust
fn main() {
    let s = String::from("hello"); // `s` owns the string
    takes_ownership(s);            // Ownership moved → `s` is invalid here
    // println!("{}", s); // ERROR: borrow of moved value
}

fn takes_ownership(s: String) { 
    println!("{}", s); 
} // `s` is dropped here
```

## 2. Borrowing & References
- Allows **immutable** (`&T`) or **mutable** (`&mut T`) borrows.
- Enforced rules:
  - Either **one mutable reference** or **multiple immutable references** (no data races).
  - References must always be **valid** (no dangling pointers).

**Example**:
```rust
fn main() {
    let mut s = String::from("hello");
    let r1 = &s;     // OK: Immutable borrow
    let r2 = &s;     // OK: Another immutable borrow
    // let r3 = &mut s; // ERROR: Cannot borrow as mutable while borrowed as immutable
    println!("{}, {}", r1, r2);
}
```

## 3. Lifetimes
- Ensures references **never outlive** the data they point to.
- Prevents **dangling references**.

**Example**:
```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

fn main() {
    let s1 = String::from("hello");
    let result;
    {
        let s2 = String::from("world");
        result = longest(&s1, &s2); // ERROR: `s2` doesn't live long enough
    }
    // println!("{}", result); // `result` would be invalid here
}
```

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm2-fig2" viewBox="0 0 800 310" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Timeline showing s1 and s2 lifetimes, with the borrow returned by longest outliving s2 and therefore rejected at compile time">
<style>
.mm2-fig2{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .mm2-fig2,[data-theme="dark"] .mm2-fig2{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.mm2-fig2 .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm2-fig2 .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm2-fig2 .title{font:700 14px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm2-fig2 .body{font:600 12px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm2-fig2 .cap{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
.mm2-fig2 .ac{fill:var(--ac)}
.mm2-fig2 path{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="mm2b-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ln);stroke:none"/></marker>
<marker id="mm2b-arrow-ac" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ac);stroke:none"/></marker>
</defs>
<!-- title -->
<text x="400" y="24" text-anchor="middle" class="title">Lifetime 'a: why this borrow is rejected</text>
<!-- s1 bar -->
<text x="172" y="103" text-anchor="end" class="body">s1</text>
<rect x="210" y="86" width="530" height="26" rx="6" class="box"/>
<text x="222" y="103" class="cap">String — lives to the end of main</text>
<!-- s2 bar -->
<text x="172" y="143" text-anchor="end" class="body">s2</text>
<rect x="340" y="126" width="260" height="26" rx="6" class="box"/>
<text x="352" y="143" class="cap">String — inner scope only</text>
<!-- result bar -->
<text x="172" y="183" text-anchor="end" class="body ac">result</text>
<rect x="470" y="166" width="240" height="26" rx="6" class="acbox"/>
<text x="482" y="183" class="cap">&amp;'a str — must stay valid</text>
<!-- drop marker -->
<path d="M600,78 L600,196" style="stroke:var(--ac);stroke-dasharray:5 4"/>
<text x="608" y="74" class="cap ac">s2 dropped here</text>
<!-- error callout -->
<rect x="430" y="204" width="330" height="46" rx="8" class="acbox"/>
<text x="595" y="223" text-anchor="middle" class="body ac">'a can't outlive s2</text>
<text x="595" y="240" text-anchor="middle" class="cap">result would dangle — compile error</text>
<path d="M595,192 L595,204" marker-end="url(#mm2b-arrow-ac)"/>
<!-- time axis -->
<path d="M180,270 L756,270" marker-end="url(#mm2b-arrow)"/>
<text x="210" y="288" text-anchor="middle" class="cap">let s1</text>
<text x="340" y="288" text-anchor="middle" class="cap">{ let s2</text>
<text x="470" y="288" text-anchor="middle" class="cap">longest(&amp;s1, &amp;s2)</text>
<text x="600" y="288" text-anchor="middle" class="cap">}</text>
<text x="710" y="288" text-anchor="middle" class="cap">use result</text>
</svg>
</div>

## Why No Garbage Collector (GC)?
- **Zero-cost abstractions**: No runtime overhead.
- **Predictable performance**: Memory is freed deterministically.
- **No runtime pauses**: Unlike GC-based languages (Java, Go).

## Key Takeaways
✅ **Ownership**: Prevents memory leaks.  
✅ **Borrowing**: Prevents data races.  
✅ **Lifetimes**: Prevents dangling pointers.

Rust's model ensures memory safety without runtime checks, making it both safe and fast.