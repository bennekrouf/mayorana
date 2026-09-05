---
id: sized-unsized-bounds-flexibility
title: >-
  Write a function that accepts both sized types (e.g., [u8; 16]) and unsized
  types (e.g., [u8] or dyn Trait) with ?Sized bound
slug: sized-unsized-bounds-flexibility
locale: en
author: mayo
excerpt: >-
  Understanding the role of ?Sized bounds in Rust trait definitions and
  leveraging them to create flexible functions that work with both sized and
  unsized types efficiently

tags:
  - rust
  - sized
  - unsized
  - bounds
  - traits
  - generics
date: '2025-08-15'
---

# What's the significance of the ?Sized bound in trait definitions, and how would you use it to write a function that accepts both sized types (e.g., [u8; 16]) and unsized types (e.g., [u8] or dyn Trait)?

The `?Sized` bound in Rust trait definitions relaxes the default `Sized` constraint on generic types, allowing a function or trait to work with both sized types (known size at compile time, like `[u8; 16]`) and unsized types (e.g., `[u8]`, `str`, `dyn Trait`). In a data serialization library, I'd use `?Sized` to write a flexible function that processes both fixed arrays and dynamic slices efficiently, enhancing functionality without sacrificing performance.

<div class="svg-container" style="margin:2rem 0;">
<svg class="td6-fig" viewBox="0 0 800 260" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Sized and unsized inputs converging through a T: ?Sized + Checksum bound into one compute_checksum function">
<style>
.td6-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .td6-fig,[data-theme="dark"] .td6-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.td6-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.td6-fig .boxAc{fill:var(--box);stroke:var(--ac);stroke-width:2}
.td6-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td6-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td6-fig .mut{fill:var(--mut);font:600 11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td6-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.td6-fig .lnAc{stroke:var(--ac);stroke-width:2;fill:none}
</style>
<!-- markers -->
<defs>
<marker id="td6-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
<marker id="td6-arrowAc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ac)"/></marker>
</defs>
<!-- sized input -->
<rect class="box" x="40" y="30" width="260" height="50" rx="6"/>
<text x="170" y="52" class="tx">FixedBuffer([u8; 16])</text>
<text x="170" y="68" class="mut">Sized — known at compile time</text>
<!-- unsized input -->
<rect class="box" x="40" y="110" width="260" height="50" rx="6"/>
<text x="170" y="132" class="tx">&amp;[u8] slice</text>
<text x="170" y="148" class="mut">Unsized — fat pointer (data+len)</text>
<!-- Y-merge to shared point then single arrow -->
<path class="ln" d="M300,55 L340,55 L340,105" marker-end="none"/>
<path class="ln" d="M300,135 L340,135 L340,105" marker-end="none"/>
<path class="lnAc" d="M340,105 L390,105" marker-end="url(#td6-arrowAc)"/>
<!-- function box -->
<rect class="boxAc" x="392" y="75" width="330" height="60" rx="6"/>
<text x="557" y="98" class="tx">compute_checksum&lt;T: ?Sized + Checksum&gt;</text>
<text x="557" y="116" class="mut">data: &amp;T</text>
<!-- arrow to result -->
<path class="ln" d="M557,135 L557,161" marker-end="url(#td6-arrow)"/>
<rect class="box" x="437" y="162" width="240" height="42" rx="6"/>
<text x="557" y="188" class="tx">checksum() — inlined, no overhead</text>
<!-- caption -->
<text x="400" y="230" class="mut">?Sized relaxes the default Sized bound so one function accepts both shapes</text>
</svg>
</div>

## Role of ?Sized

- **Default Sized**: By default, generic parameters (`T`) imply `T: Sized`, meaning the type's size must be known at compile time. This excludes unsized types like slices (`[u8]`), strings (`str`), or trait objects (`dyn Trait`), which only exist behind pointers (e.g., `&[u8]`, `Box<dyn Trait>`).
- **?Sized Significance**: Adding `T: ?Sized` opts out of this requirement, allowing `T` to be either sized or unsized. This enables broader applicability, as the function can accept references to unsized types (`&T`) or sized types directly.

## Example: Serialization Function

In a serialization library, I'd define a function to compute a checksum over any contiguous byte-like data:

```rust
trait Checksum {
    fn checksum(&self) -> u32;
}

fn compute_checksum<T: ?Sized + Checksum>(data: &T) -> u32 {
    data.checksum()
}

// Implementations
struct FixedBuffer([u8; 16]);
struct DynamicBuffer([u8]);

impl Checksum for FixedBuffer {
    fn checksum(&self) -> u32 {
        self.0.iter().fold(0, |acc, &x| acc.wrapping_add(x as u32))
    }
}

impl Checksum for [u8] { // Unsized type
    fn checksum(&self) -> u32 {
        self.iter().fold(0, |acc, &x| acc.wrapping_add(x as u32))
    }
}

// Usage
let fixed = FixedBuffer([1; 16]);
let dynamic = vec![2; 32];
let fixed_sum = compute_checksum(&fixed);        // Sized: [u8; 16]
let dynamic_sum = compute_checksum(&dynamic[..]); // Unsized: [u8]
```

## How ?Sized Enhances Functionality

### Flexibility
Without `?Sized`, `compute_checksum` would reject `&[u8]`:

```rust
fn compute_checksum<T: Sized + Checksum>(data: &T) -> u32 { /* ... */ }
// Error: [u8] doesn't implement Sized
```

With `T: ?Sized`, it accepts:
- **Sized**: `FixedBuffer` (16 bytes known at compile time).
- **Unsized**: `[u8]` (size known only at runtime via length).

### Unified API
One function handles both fixed arrays (`[u8; 16]`) and slices (`[u8]`), plus trait objects (`dyn Checksum`) if needed. This reduces code duplication in a serialization library processing diverse inputs.

## Maintaining Efficiency

- **Reference-Based**: Using `&T` avoids owning `T` or requiring `Box<T>`. For unsized types, this leverages their inherent indirection (e.g., `&[u8]` is a fat pointer: data + length), adding no extra cost.
- **Static Dispatch**: `T: ?Sized + Checksum` ensures monomorphization for each `T`. `checksum` calls are inlined:
  - For `FixedBuffer`: Direct array access, unrolled if small.
  - For `[u8]`: Slice iteration, potentially vectorized by LLVM.
- **No Overhead**: The `?Sized` bound itself adds no runtime cost—it's a compile-time relaxation. The vtable (if `dyn Checksum`) is only used if explicitly chosen, not here.

<div class="svg-container" style="margin:2rem 0;">
<svg class="td6b-fig" viewBox="0 0 800 310" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Word layout of a reference for a sized buffer, a slice and a trait object, showing thin versus fat pointers">
<style>
.td6b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .td6b-fig,[data-theme="dark"] .td6b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.td6b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.td6b-fig .boxAc{fill:var(--box);stroke:var(--ac);stroke-width:2}
.td6b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td6b-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td6b-fig .mut{fill:var(--mut);font:600 11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td6b-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- title -->
<text x="400" y="26" class="ti">What &amp;T is made of, one row per T</text>
<!-- column headers -->
<text x="140" y="70" class="mut">the reference</text>
<text x="325" y="70" class="mut">word 0</text>
<text x="485" y="70" class="mut">word 1</text>
<text x="680" y="70" class="mut">width, and where the size lives</text>
<!-- row 1: sized -->
<rect class="box" x="40" y="84" width="200" height="52" rx="6"/>
<text x="140" y="106" class="tx">&amp;FixedBuffer</text>
<text x="140" y="124" class="mut">Sized</text>
<rect class="box" x="250" y="84" width="150" height="52" rx="6"/>
<text x="325" y="115" class="tx">data ptr</text>
<text x="485" y="115" class="mut">— no second word —</text>
<text x="680" y="106" class="tx">8 bytes</text>
<text x="680" y="124" class="mut">size baked into [u8; 16]</text>
<!-- row 2: slice -->
<rect class="box" x="40" y="146" width="200" height="52" rx="6"/>
<text x="140" y="168" class="tx">&amp;[u8]</text>
<text x="140" y="186" class="mut">unsized slice</text>
<rect class="box" x="250" y="146" width="150" height="52" rx="6"/>
<text x="325" y="177" class="tx">data ptr</text>
<rect class="box" x="410" y="146" width="150" height="52" rx="6"/>
<text x="485" y="177" class="tx">len: usize</text>
<text x="680" y="168" class="tx">16 bytes</text>
<text x="680" y="186" class="mut">length travels in the pointer</text>
<!-- row 3: trait object -->
<rect class="box" x="40" y="208" width="200" height="52" rx="6"/>
<text x="140" y="230" class="tx">&amp;dyn Checksum</text>
<text x="140" y="248" class="mut">trait object</text>
<rect class="box" x="250" y="208" width="150" height="52" rx="6"/>
<text x="325" y="239" class="tx">data ptr</text>
<rect class="boxAc" x="410" y="208" width="150" height="52" rx="6"/>
<text x="485" y="239" class="tx">vtable ptr</text>
<text x="680" y="230" class="tx">16 bytes</text>
<text x="680" y="248" class="mut">size and checksum() in the vtable</text>
<!-- caption -->
<text x="400" y="290" class="mut">?Sized admits any T whose size travels in the pointer instead of the type — &amp;T costs nothing extra</text>
</svg>
</div>

## Implementation Details

- **Trait Bound**: `Checksum` defines the behavior, implemented for both sized (`FixedBuffer`) and unsized (`[u8]`) types. `?Sized` lets `compute_checksum` bridge them.
- **Safety**: `&T` ensures borrow semantics, preventing ownership issues with unsized types (which can't be moved directly).

## Trade-Offs

- **Indirection**: Unsized types require a reference or smart pointer (`&T`, `Box<T>`), adding a layer vs. direct `T` for sized types. In a hot path, this might matter (e.g., pointer chasing).
- **Complexity**: Callers must understand `&T` vs. `T`. I'd document that `compute_checksum` takes references for universality.
- **Alternative**: If only slices are needed, `&[u8]` directly might suffice, but `?Sized` supports broader use (e.g., `dyn Trait`).

## Confirming both cases work
### Compile Test
Ensure both sized and unsized types work:

```rust
assert_eq!(compute_checksum(&FixedBuffer([1; 16])), 16);
assert_eq!(compute_checksum(&vec![2; 32][..]), 64);
```

### Benchmark
Use criterion to check overhead:

```rust
use criterion::{black_box, Criterion};
fn bench(c: &mut Criterion) {
    let fixed = FixedBuffer([1; 16]);
    let dynamic = vec![2; 32];
    c.bench_function("fixed", |b| b.iter(|| compute_checksum(black_box(&fixed))));
    c.bench_function("dynamic", |b| b.iter(|| compute_checksum(black_box(&dynamic[..]))));
}
```

Expect similar performance to direct calls, with inlining.

## `?Sized` in practice
`?Sized` lets `compute_checksum` handle both sized and unsized types by relaxing the `Sized` constraint, making it ideal for a serialization library. It maintains efficiency via static dispatch and references, offering flexibility without runtime cost. I'd use this to unify APIs across diverse data types, ensuring performance and scalability in a Rust system.
