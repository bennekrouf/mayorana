---
id: string-vs-str-rust
title: String vs. &str – Which to Use and When?
slug: string-vs-str-rust
locale: "en"
date: '2025-07-03'
author: mayo
excerpt: >-
  String vs str in Rust, covering memory management, ownership, and when to use
  each type.

tags:
  - rust
  - string
---

# What is the difference between String and str in Rust? When would you use each?

Understanding the distinction between `String` and `str` is fundamental to effective memory management and ownership in Rust.

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm1-fig" viewBox="0 0 800 300" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Comparison of String heap-owned layout versus str fat-pointer view into heap, stack, or static memory">
<style>
.mm1-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .mm1-fig,[data-theme="dark"] .mm1-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.mm1-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm1-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm1-fig .title{font:700 14px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm1-fig .body{font:600 12px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm1-fig .cap{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
.mm1-fig .ac{fill:var(--ac)}
.mm1-fig line,.mm1-fig path{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="mm1-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ln)"/></marker>
<marker id="mm1-arrow-ac" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ac)"/></marker>
</defs>
<!-- title -->
<text x="400" y="26" text-anchor="middle" class="title">Owned vs. Borrowed String Data</text>
<!-- String box -->
<rect x="60" y="50" width="230" height="110" rx="8" class="box"/>
<text x="175" y="72" text-anchor="middle" class="title">String</text>
<text x="175" y="92" text-anchor="middle" class="body">ptr | len | cap</text>
<text x="175" y="110" text-anchor="middle" class="cap">owned, mutable, growable</text>
<text x="175" y="126" text-anchor="middle" class="cap">3 words on the stack</text>
<!-- str box -->
<rect x="510" y="50" width="230" height="110" rx="8" class="acbox"/>
<text x="625" y="72" text-anchor="middle" class="title ac">&amp;str</text>
<text x="625" y="92" text-anchor="middle" class="body">ptr | len</text>
<text x="625" y="110" text-anchor="middle" class="cap">borrowed, immutable view</text>
<text x="625" y="126" text-anchor="middle" class="cap">fat pointer, 2 words</text>
<!-- data box -->
<rect x="230" y="220" width="340" height="60" rx="8" class="box"/>
<text x="400" y="245" text-anchor="middle" class="body">UTF-8 bytes</text>
<text x="400" y="262" text-anchor="middle" class="cap">heap buffer, stack array, or .rodata</text>
<!-- arrows: Y-merge into shared point, then single arrow to data box -->
<path d="M175,160 L175,200 L400,200"/>
<path d="M625,160 L625,200 L400,200" style="stroke:var(--ac)"/>
<path d="M400,200 L400,220" marker-end="url(#mm1-arrow)"/>
</svg>
</div>

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

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm1-fig2" viewBox="0 0 800 340" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="A &str parameter accepts both a String and a literal through deref coercion, while a String parameter forces the literal to allocate">
<style>
.mm1-fig2{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .mm1-fig2,[data-theme="dark"] .mm1-fig2{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.mm1-fig2 .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm1-fig2 .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm1-fig2 .title{font:700 14px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm1-fig2 .sub{font:700 13px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
.mm1-fig2 .body{font:600 12px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm1-fig2 .cap{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
.mm1-fig2 .ac{fill:var(--ac)}
.mm1-fig2 path{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="mm1b-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ln);stroke:none"/></marker>
<marker id="mm1b-arrow-ac" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ac);stroke:none"/></marker>
</defs>
<!-- title -->
<text x="400" y="24" text-anchor="middle" class="title">Which Callers Can Reach Your Function?</text>
<!-- row 1 label -->
<text x="40" y="56" class="sub">fn good(s: &amp;str)</text>
<!-- callers -->
<rect x="40" y="70" width="190" height="46" rx="8" class="box"/>
<text x="135" y="90" text-anchor="middle" class="body">String::from("test")</text>
<text x="135" y="106" text-anchor="middle" class="cap">passed as &amp;owned</text>
<rect x="40" y="140" width="190" height="46" rx="8" class="box"/>
<text x="135" y="160" text-anchor="middle" class="body">"literal"</text>
<text x="135" y="176" text-anchor="middle" class="cap">already a &amp;'static str</text>
<!-- coercion node -->
<rect x="310" y="93" width="170" height="70" rx="8" class="acbox"/>
<text x="395" y="117" text-anchor="middle" class="title ac">&amp;str</text>
<text x="395" y="136" text-anchor="middle" class="cap">deref coercion</text>
<text x="395" y="152" text-anchor="middle" class="cap">zero allocation</text>
<!-- callee -->
<rect x="560" y="105" width="200" height="46" rx="8" class="box"/>
<text x="660" y="133" text-anchor="middle" class="body">fn good(s: &amp;str)</text>
<!-- arrows row 1: Y-merge then single arrow -->
<path d="M230,93 L270,93 L270,128"/>
<path d="M230,163 L270,163 L270,128"/>
<path d="M270,128 L310,128" marker-end="url(#mm1b-arrow-ac)"/>
<path d="M480,128 L560,128" marker-end="url(#mm1b-arrow)"/>
<!-- divider -->
<path d="M40,215 L760,215" style="stroke-dasharray:4 4"/>
<!-- row 2 label -->
<text x="40" y="247" class="sub">fn bad(s: String)</text>
<rect x="40" y="262" width="190" height="46" rx="8" class="box"/>
<text x="135" y="290" text-anchor="middle" class="body">"literal"</text>
<rect x="310" y="262" width="170" height="46" rx="8" class="box"/>
<text x="395" y="282" text-anchor="middle" class="body">.to_string()</text>
<text x="395" y="299" text-anchor="middle" class="cap">forced heap alloc</text>
<rect x="560" y="262" width="200" height="46" rx="8" class="box"/>
<text x="660" y="290" text-anchor="middle" class="body">fn bad(s: String)</text>
<path d="M230,285 L310,285" marker-end="url(#mm1b-arrow)"/>
<path d="M480,285 L560,285" marker-end="url(#mm1b-arrow)"/>
</svg>
</div>

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

**`String`**: Owned, mutable, heap-allocated  
**`str`**: Borrowed, immutable, flexible (heap/stack/static)  
Prefer `&str` for function parameters unless you need ownership or mutation

`.to_string()` allocates in both cases, but not for the same reason: on a literal it copies
out of the binary's read-only data, on a `String` it clones an existing heap buffer.
