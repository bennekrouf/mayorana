---
id: object-safety-rust
title: Making Traits Object-Safe for Rust's dyn Trait in Plugin Systems
slug: object-safety-rust
locale: en
date: '2025-08-13'
author: mayo
excerpt: >-
  Understanding object safety in Rust and refactoring traits for dynamic
  dispatch
content_focus: Object Safety
technical_level: Expert technical discussion

tags:
  - rust
  - object-safety
  - dynamic-dispatch
  - traits
  - plugins
---

# Making Traits Object-Safe for Rust's dyn Trait in Plugin Systems

Rust requires traits to be **object-safe** to use with `dyn Trait` for dynamic dispatch, as this ensures a consistent vtable (virtual table) for runtime method calls. Non-object-safe traits, such as those with generic methods or static requirements, cannot be used with `dyn Trait`, but they can be refactored for plugin systems needing runtime polymorphism. I’ll explain why object safety is necessary and demonstrate how to refactor a non-object-safe trait for a plugin system.

<div class="svg-container" style="margin:2rem 0;">
<svg class="td4-fig" viewBox="0 0 800 320" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Refactoring a non-object-safe Transformer trait into an object-safe one that produces a Box dyn Transformer fat pointer">
<style>
.td4-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .td4-fig,[data-theme="dark"] .td4-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.td4-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.td4-fig .boxAc{fill:var(--box);stroke:var(--ac);stroke-width:2}
.td4-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td4-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td4-fig .mut{fill:var(--mut);font:600 11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td4-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.td4-fig .lnAc{stroke:var(--ac);stroke-width:2;fill:none}
</style>
<!-- markers -->
<defs>
<marker id="td4-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
<marker id="td4-arrowAc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ac)"/></marker>
</defs>
<!-- non object safe -->
<rect class="box" x="40" y="30" width="330" height="66" rx="6"/>
<text x="205" y="52" class="tx">transform&lt;T: Into&lt;f64&gt;&gt;(&amp;self, T)</text>
<text x="205" y="70" class="tx">fn new() -&gt; Self</text>
<text x="205" y="86" class="mut">generic method + static Self return</text>
<!-- X mark to failure -->
<path class="ln" d="M205,96 L205,122" marker-end="url(#td4-arrow)"/>
<rect class="box" x="80" y="123" width="250" height="36" rx="6"/>
<text x="205" y="146" class="tx">Box&lt;dyn Transformer&gt; — fails</text>
<!-- refactor arrow across -->
<path class="lnAc" d="M375,63 L425,63" marker-end="url(#td4-arrowAc)"/>
<text x="400" y="50" class="mut">refactor</text>
<!-- object safe -->
<rect class="boxAc" x="430" y="30" width="330" height="66" rx="6"/>
<text x="595" y="52" class="tx">transform(&amp;self, value: f64) -&gt; f64</text>
<text x="595" y="70" class="tx">no generics, no Self return</text>
<text x="595" y="86" class="mut">factory fn creates instances</text>
<path class="lnAc" d="M595,96 L595,122" marker-end="url(#td4-arrowAc)"/>
<rect class="boxAc" x="470" y="123" width="250" height="36" rx="6"/>
<text x="595" y="146" class="tx">Box&lt;dyn Transformer&gt; — works</text>
<!-- fat pointer layout -->
<path class="ln" d="M595,159 L595,185" marker-end="url(#td4-arrow)"/>
<rect class="box" x="440" y="186" width="140" height="50" rx="6"/>
<text x="510" y="207" class="tx">data ptr</text>
<text x="510" y="223" class="mut">SquareTransformer</text>
<rect class="box" x="590" y="186" width="140" height="50" rx="6"/>
<text x="660" y="207" class="tx">vtable ptr</text>
<text x="660" y="223" class="mut">transform fn</text>
<text x="595" y="260" class="mut">fat pointer: 16 bytes (data + vtable)</text>
<text x="205" y="220" class="mut">Vtable needs one fixed</text>
<text x="205" y="236" class="mut">signature per method — impossible here</text>
</svg>
</div>

## Why Object Safety Matters

A trait is **object-safe** if:
- All methods have a receiver (`&self`, `&mut self`) or no receiver, but not static.
- Methods do not use `Self` as a return type or generic parameter (except in `where` clauses).
- Methods are not generic (no `<T>` parameters).

`dyn Trait` uses a **fat pointer** (data pointer + vtable pointer) to call methods at runtime. Non-object-safe traits prevent vtable construction because:
- **Generic Methods**: Different type parameters create varying method signatures, making a single vtable impossible.
- **Self Returns**: The size and type of `Self` differ per implementor, breaking vtable uniformity.
- **Static Methods**: These lack an instance to dispatch on, so they don’t fit in a vtable.

## Example: Non-Object-Safe Trait

Consider a plugin system for data transformers:

```rust
trait Transformer {
    fn transform<T: Into<f64>>(&self, value: T) -> f64; // Generic method
    fn new() -> Self;                                   // Static, returns Self
}

struct SquareTransformer;
impl Transformer for SquareTransformer {
    fn transform<T: Into<f64>>(&self, value: T) -> f64 {
        let v = value.into();
        v * v
    }
    fn new() -> Self { SquareTransformer }
}

// Fails: Trait isn’t object-safe
// let transformer: Box<dyn Transformer> = Box::new(SquareTransformer);
```

**Problems**:
- `transform<T>`: Generic, requiring a unique vtable entry per `T`.
- `new()`: Static with `Self` return, varying by implementor and lacking a receiver.

## Refactored: Object-Safe Version

To enable `dyn Trait` for a plugin system:

```rust
trait Transformer {
    fn transform(&self, value: f64) -> f64; // No generics, fixed type
}

struct SquareTransformer;
impl Transformer for SquareTransformer {
    fn transform(&self, value: f64) -> f64 {
        value * value
    }
}

// Factory function for instantiation
fn create_square_transformer() -> Box<dyn Transformer> {
    Box::new(SquareTransformer)
}

// Usage in plugin system
fn main() {
    let transformer: Box<dyn Transformer> = create_square_transformer();
    let result = transformer.transform(3.0); // 9.0
}
```

### Changes Made
- **Removed Generics**: Changed `transform<T: Into<f64>>` to `transform(&self, value: f64)`. The vtable now has a single, fixed entry: `fn(&self, f64) -> f64`.  
  - **Trade-off**: Less flexible (only `f64`, not `i32` or `f32`), but plugins can convert inputs externally.
- **Dropped Static Method**: Removed `new() -> Self`. Static methods don’t belong in vtables.  
  - **Solution**: Added a factory function (`create_square_transformer`) for instantiation. A plugin loader could use a registry:
    ```rust
    use std::collections::HashMap;
    let mut plugins: HashMap<String, fn() -> Box<dyn Transformer>> = HashMap::new();
    plugins.insert("square".to_string(), create_square_transformer);
    ```

## How It Enables dyn Trait

- **Vtable Construction**: The refactored `Transformer` has one method with a fixed signature, enabling a vtable like:
  ```rust
  // Conceptual vtable
  struct TransformerVtable {
      transform: fn(*const (), f64) -> f64, // Pointer to SquareTransformer::transform
  }
  ```
  A `Box<dyn Transformer>` pairs this vtable with the instance for runtime calls.
- **Safety**: No generics or `Self` ensure the vtable is type-agnostic, safe for any implementor.
- **Efficiency**: Dynamic dispatch adds a vtable lookup (1-2 cycles), but enables
