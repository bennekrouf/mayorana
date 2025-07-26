---
id: allocation-avoidance-real-time-rust
title: "Use fixed-size arrays or Option to avoid allocations in a performance-critical path"
slug: allocation-avoidance-real-time-rust
author: mayo
excerpt: >-
  Leveraging Rust's stack-based features like fixed-size arrays and Option to eliminate heap allocations in real-time systems for predictable, low-latency execution
content_focus: "low-level optimization in Rust"
technical_level: "Expert technical discussion"
category: rust
tags:
  - rust
  - real-time
  - performance
  - stack-allocation
  - heap-allocation
  - optimization
---

# Allocation Avoidance: In a real-time system, heap allocations can introduce latency. How would you use Rust's stack-based features (e.g., fixed-size arrays or Option) to avoid allocations in a performance-critical path?

In a real-time system, heap allocations via Box, Vec, or other dynamic structures introduce latency due to memory management overhead and potential garbage collection pauses (though Rust avoids GC, allocation/deallocation still varies). I'd use Rust's stack-based features like fixed-size arrays, Option, and custom structs to eliminate these in a performance-critical path, ensuring predictable, low-latency execution.

## Example Scenario: Replacing a Dynamic Buffer

Suppose I'm building a real-time audio processor that handles 64-sample chunks. A naive implementation might use a Vec:

```rust
struct AudioProcessor {
    buffer: Vec<f32>, // Heap-allocated, resizable
}

impl AudioProcessor {
    fn new() -> Self {
        AudioProcessor { buffer: vec![0.0; 64] } // Allocates on heap
    }

    fn process(&mut self, input: f32) {
        self.buffer.push(input); // Reallocates if full
        if self.buffer.len() > 64 { self.buffer.remove(0); }
    }
}
```

This works but risks latency spikes from reallocation or shifting elements.

## Stack-Based Alternative

I'd replace Vec with a fixed-size array and a circular buffer approach, all on the stack:

```rust
struct AudioProcessor {
    buffer: [f32; 64], // Stack-allocated, fixed size
    index: usize,      // Current write position
}

impl AudioProcessor {
    fn new() -> Self {
        AudioProcessor {
            buffer: [0.0; 64], // Zero-initialized on stack
            index: 0,
        }
    }

    fn process(&mut self, input: f32) {
        self.buffer[self.index] = input;         // No allocation
        self.index = (self.index + 1) % 64;      // Wrap around
    }

    fn get_sample(&self, offset: usize) -> Option<f32> {
        let read_idx = (self.index.wrapping_sub(offset + 1)) % 64;
        Some(self.buffer[read_idx]) // Stack access, no heap
    }
}
```

- **Fixed-Size Array**: `[f32; 64]` allocates 64 floats (256 bytes) on the stack at compile time—no runtime allocation.
- **Circular Indexing**: `index` tracks the write position, wrapping with modulo—no shifting or resizing.
- **Option**: `get_sample` returns `Option<f32>` to safely handle access without heap-based error types.

## How It Eliminates Allocations

- **No Heap**: The array is stack-allocated, fixed at compile time. No calls to malloc or free.
- **Determinism**: Writes and reads are O(1) with predictable cycles—no reallocation or deallocation delays.
- **Size Known**: 64 elements fit the real-time constraint (e.g., a 1ms audio frame at 64kHz), avoiding dynamic resizing.

## Ensuring Safety

- **Bounds Safety**: The modulo operation (`% 64`) ensures index stays within [0, 63]. Rust's array indexing panics on out-of-bounds in debug mode, catching errors early.
- **Lifetime Control**: Stack allocation ties the buffer's lifetime to AudioProcessor, avoiding dangling references.
- **No Overflow**: For small arrays (256 bytes here), stack overflow is unlikely on typical 1MB thread stacks. For larger sizes, I'd verify against the target's stack limit (e.g., `ulimit -s`).

## Maintaining Performance

- **Cache Locality**: The contiguous `[f32; 64]` fits in L1 cache (typically 32KB), faster than a heap-allocated Vec with potential fragmentation.
- **No Overhead**: No pointer indirection or allocation bookkeeping—just direct memory access.
- **Inlining**: Small methods like `process` are easily inlined by the compiler, minimizing function call cost.

## Trade-Offs and Enhancements

- **Fixed Capacity**: If 64 samples isn't enough, I'd adjust the size (e.g., `[f32; 128]`) at the cost of more stack space, or use a hybrid approach with a pre-allocated `Box<[f32]>` if stack limits are a concern.
- **Flexibility Loss**: No resizing, but real-time systems often prioritize predictability over adaptability.
- **Custom Stack Structures**: For complex needs (e.g., a stack-allocated queue), I'd use a struct with arrays and indices, avoiding VecDeque's heap use.

## Verification

### Benchmarking

Use criterion to measure latency:

```rust
use criterion::{black_box, Criterion};
fn bench(c: &mut Criterion) {
    let mut proc = AudioProcessor::new();
    c.bench_function("stack_process", |b| b.iter(|| proc.process(black_box(1.0))));
}
```

Expect consistent, sub-microsecond times vs. Vec's occasional spikes.

### Profiling

- **perf stat -e cycles** confirms no allocation-related stalls.
- **Stack Usage**: Check binary size or use `#[inline(never)]` on a wrapper to inspect stack frame with gdb.

## Conclusion

I'd replace heap allocations with stack-based arrays and indices, as in this audio processor, ensuring zero-latency overhead in a real-time path. Rust's type system and compile-time sizing guarantee safety, while tight loops and cache-friendly access maintain performance. This approach delivers deterministic behavior critical for real-time applications, with profiling validating the win.
