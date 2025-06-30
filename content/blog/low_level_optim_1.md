---
id: "memory-layout-optimization-rust"
title: "Memory Layout Optimization: How would you use Rust's repr attribute to optimize the memory layout of a struct for cache efficiency, and what trade-offs might you consider when choosing between repr(C) and repr(packed)?"
slug: "memory-layout-optimization-rust"
date: "2025-06-30"
author: "mayo"
excerpt: "Expert technical discussion on low-level memory optimization in Rust, covering repr attributes, cache efficiency, and performance trade-offs for lead developers."
category: "rust"
tags:
  - "rust"
  - "optimization"
  - "memory"
  - "performance"
  - "cache"
---

# Memory Layout Optimization: How would you use Rust's repr attribute to optimize the memory layout of a struct for cache efficiency?

The `repr` attribute controls struct memory layout, which is critical for low-level optimization in high-throughput systems where cache locality drives performance.

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
