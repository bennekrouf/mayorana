---
id: memory-layout-optimization-rust
title: >-
  Rust's repr: Optimize Struct Memory for Cache Efficiency
slug: memory-layout-optimization-rust
locale: "en"
date: '2025-06-26'
author: mayo
excerpt: >-
  Low-level memory optimization in Rust, covering
  repr attributes, cache efficiency, and performance trade-offs

tags:
  - rust
  - cache
---

# Memory Layout Optimization: How would you use Rust's repr attribute to optimize the memory layout of a struct for cache efficiency?

The `repr` attribute controls struct memory layout, which is critical for low-level optimization in high-throughput systems where cache locality drives performance.

<div class="svg-container" style="margin:2rem 0;">
<svg class="lo1-fig" viewBox="0 0 800 240" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Comparison of repr(C) padded layout versus repr(packed) tightly packed layout for the same struct">
<style>
.lo1-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .lo1-fig,[data-theme="dark"] .lo1-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.lo1-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.lo1-fig .pad{fill:var(--bg);stroke:var(--ln);stroke-width:1.5;stroke-dasharray:4,3}
.lo1-fig .warn{fill:var(--box);stroke:var(--ac);stroke-width:2}
.lo1-fig .cap{fill:var(--box);stroke:var(--ac);stroke-width:2}
.lo1-fig .cap2{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.lo1-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.lo1-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo1-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo1-fig .ac{fill:var(--ac);font:700 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo1-fig line{stroke:var(--ln);stroke-width:1.5}
</style>
<defs>
<marker id="lo1-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"/>
</marker>
</defs>
<!-- left group repr(C) -->
<text x="210" y="30" class="ti">repr(C): struct Data</text>
<rect x="40" y="45" width="60" height="55" class="box"/>
<text x="70" y="68" text-anchor="middle" class="tx">flag</text>
<text x="70" y="84" text-anchor="middle" class="mut">1B</text>
<rect x="100" y="45" width="60" height="55" class="pad"/>
<text x="130" y="68" text-anchor="middle" class="mut">pad</text>
<text x="130" y="84" text-anchor="middle" class="mut">3B</text>
<rect x="160" y="45" width="90" height="55" class="box"/>
<text x="205" y="68" text-anchor="middle" class="tx">value</text>
<text x="205" y="84" text-anchor="middle" class="mut">u32, 4B</text>
<rect x="250" y="45" width="130" height="55" class="box"/>
<text x="315" y="68" text-anchor="middle" class="tx">counter</text>
<text x="315" y="84" text-anchor="middle" class="mut">u64, 8B</text>
<!-- arrow down to caption -->
<line x1="210" y1="100" x2="210" y2="140" marker-end="url(#lo1-arrow)"/>
<rect x="60" y="150" width="300" height="55" rx="6" class="cap"/>
<text x="210" y="172" class="ac">16 bytes total</text>
<text x="210" y="190" class="mut">aligned reads, cache-friendly</text>
<!-- right group repr(packed) -->
<text x="590" y="30" class="ti">repr(packed): struct PackedData</text>
<rect x="420" y="45" width="60" height="55" class="box"/>
<text x="450" y="68" text-anchor="middle" class="tx">flag</text>
<text x="450" y="84" text-anchor="middle" class="mut">1B</text>
<rect x="480" y="45" width="90" height="55" class="warn"/>
<text x="525" y="68" text-anchor="middle" class="tx">value</text>
<text x="525" y="84" text-anchor="middle" class="mut">u32, 4B</text>
<rect x="570" y="45" width="130" height="55" class="warn"/>
<text x="635" y="68" text-anchor="middle" class="tx">counter</text>
<text x="635" y="84" text-anchor="middle" class="mut">u64, 8B</text>
<!-- arrow down to caption -->
<line x1="560" y1="100" x2="560" y2="140" marker-end="url(#lo1-arrow)"/>
<rect x="440" y="150" width="260" height="55" rx="6" class="cap2"/>
<text x="570" y="172" class="tx">13 bytes total</text>
<text x="570" y="190" class="mut">unaligned access, slower</text>
</svg>
</div>

## How They Work

**`repr(C)`**: Enforces C-compatible layout with fields ordered sequentially as declared, adding padding to align each field to its natural alignment (e.g., `u32` aligns to 4 bytes). Ensures predictable interoperability and typically aligns well with CPU cache lines (often 64 bytes).

**`repr(packed)`**: Removes all padding, packing fields tightly together regardless of alignment. Minimizes memory usage but can lead to unaligned memory accesses, which are slower on most architectures.

## Optimization for Cache Locality

With `repr(C)`, the compiler adds padding to align fields, increasing struct size but ensuring efficient, aligned access:

```rust
#[repr(C)]
struct Data {
    flag: bool,   // 1 byte + 3 bytes padding (on 32-bit alignment)
    value: u32,   // 4 bytes
    counter: u64, // 8 bytes
}
// Size: 16 bytes (due to padding for alignment)
```

Here, `repr(C)` ensures `value` and `counter` are aligned—great for loops accessing `value` repeatedly. Aligned reads are fast and cache-friendly, but padding after `flag` wastes space.

With `repr(packed)`:

```rust
#[repr(packed)]
struct PackedData {
    flag: bool,   // 1 byte
    value: u32,   // 4 bytes, unaligned
    counter: u64, // 8 bytes, unaligned
}
// Size: 13 bytes (no padding)
```

This shrinks size to 13 bytes, ideal for tight memory constraints, but unaligned accesses to `value` and `counter` incur significant performance penalties.

## Trade-Offs

| Aspect | `repr(C)` | `repr(packed)` |
|--------|-----------|----------------|
| **Performance** | Fast aligned access, cache-efficient | Slower unaligned access penalties |
| **Memory Usage** | Larger due to padding | Minimal footprint |
| **Portability** | Safe across platforms | Risk of UB or panics on strict architectures |

- **Performance**: `repr(C)` wins for speed—aligned access is faster and cache-efficient
- **Memory Usage**: `repr(packed)` reduces footprint, critical for large arrays or tight constraints
- **Portability**: `repr(C)` is safer; `repr(packed)` risks undefined behavior with unsafe dereferencing

## Example Scenario

Real-time packet parser in a network server processing millions of packets per second:

```rust
#[repr(C)]
struct Packet {
    header: u8,   // 1 byte + 3 padding
    id: u32,      // 4 bytes
    payload: u64, // 8 bytes
}
```

With `repr(C)`, size is 16 bytes, and `id`/`payload` are aligned, speeding up field access in tight loops checking `id`. Cache locality is decent since the struct fits in a 64-byte cache line.

If using `repr(packed)` (13 bytes), I'd save 3 bytes per packet, but unaligned `id` and `payload` accesses could halve throughput due to penalties—unacceptable for this workload.

**Choice**: `repr(C)` for performance-critical code. Consider reordering fields (`payload`, `id`, `header`) to group hot fields together.

**Alternative scenario**: Serializing thousands of tiny structs to disk with infrequent access—`repr(packed)` might make sense to minimize storage, accepting slower deserialization.

<div class="svg-container" style="margin:2rem 0;">
<svg class="lo1-fig2" viewBox="0 0 800 380" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Decision tree for choosing between repr(C), repr(packed), and the default Rust layout based on access pattern and memory pressure">
<style>
.lo1-fig2{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .lo1-fig2,[data-theme="dark"] .lo1-fig2{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.lo1-fig2 .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.lo1-fig2 .dia{fill:var(--bg);stroke:var(--ln);stroke-width:1.5}
.lo1-fig2 .fin{fill:var(--box);stroke:var(--ac);stroke-width:2.5}
.lo1-fig2 .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo1-fig2 .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo1-fig2 .ac{fill:var(--ac);font:700 13px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo1-fig2 .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo1-fig2 line{stroke:var(--ln);stroke-width:1.5}
</style>
<defs>
<marker id="lo1b-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"/>
</marker>
</defs>
<!-- root -->
<rect x="300" y="14" width="200" height="44" rx="6" class="box"/>
<text x="400" y="41" class="ti">Choosing a repr</text>
<line x1="400" y1="58" x2="400" y2="74" marker-end="url(#lo1b-arrow)"/>
<!-- first decision -->
<polygon points="400,76 520,136 400,196 280,136" class="dia"/>
<text x="400" y="141" class="tx">Hot loop or C FFI?</text>
<line x1="520" y1="136" x2="548" y2="136" marker-end="url(#lo1b-arrow)"/>
<text x="534" y="127" class="mut">yes</text>
<rect x="550" y="106" width="230" height="60" rx="6" class="fin"/>
<text x="665" y="132" class="ac">repr(C)</text>
<text x="665" y="152" class="mut">padding buys aligned reads</text>
<!-- second decision -->
<line x1="400" y1="196" x2="400" y2="212" marker-end="url(#lo1b-arrow)"/>
<text x="418" y="209" class="mut">no</text>
<polygon points="400,214 520,274 400,334 280,274" class="dia"/>
<text x="400" y="270" class="tx">Memory-bound or</text>
<text x="400" y="286" class="tx">written to disk?</text>
<line x1="520" y1="274" x2="548" y2="274" marker-end="url(#lo1b-arrow)"/>
<text x="534" y="265" class="mut">yes</text>
<rect x="550" y="244" width="230" height="60" rx="6" class="box"/>
<text x="665" y="270" class="tx">repr(packed)</text>
<text x="665" y="290" class="mut">13 B, unaligned reads</text>
<line x1="280" y1="274" x2="252" y2="274" marker-end="url(#lo1b-arrow)"/>
<text x="266" y="265" class="mut">no</text>
<rect x="20" y="244" width="230" height="60" rx="6" class="box"/>
<text x="135" y="270" class="tx">Default Rust layout</text>
<text x="135" y="290" class="mut">compiler reorders freely</text>
<!-- caption -->
<text x="400" y="362" class="mut">On ARM and other strict-alignment targets, packed field access can panic — measure on the target</text>
</svg>
</div>

## Advanced Considerations

- Use profiling tools like `perf` to confirm cache miss reductions
- Consider `#[repr(C, packed)]` for C-compatible but packed layout
- Field reordering can optimize cache line usage without changing `repr`
- Test trade-offs on target hardware, especially ARM vs x86_64

## Key Takeaways

✅ **`repr(C)`**: Choose for performance-critical code where cache efficiency matters  
✅ **`repr(packed)`**: Use for memory-constrained scenarios with infrequent access  
🚀 Profile cache performance before and after to validate optimizations

**Try This:** What happens if you access a field in a `repr(packed)` struct through a raw pointer?  
**Answer:** Unaligned access through raw pointers can cause panics on strict architectures or performance penalties—always measure on your target platform!
