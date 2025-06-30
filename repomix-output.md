This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded

## Additional Info

# Directory Structure
```
.github/
  workflows/
    build.yml
config/
  site.yaml
content/
  blog/
    closures_1.md
    collections_iterators_1.md
    getting-started-with-rust.md
    low_level_optim_1.md
    memory_mngt_1.md
    trait_dyn_1.md
public/
  file.svg
  globe.svg
  robots.txt
  site.webmanifest
  sitemap.xml
  window.svg
scripts/
  generate-blog-data.js
  generate-sitemap.js
src/
  app/
    about/
      layout.tsx
      page.tsx
    blog/
      [slug]/
        layout.tsx
        page.tsx
      category/
        [slug]/
          layout.tsx
          page.tsx
      layout.tsx
      page.tsx
    contact/
      layout.tsx
      page.tsx
    services/
      layout.tsx
      page.tsx
    globals.css
    layout.tsx
    not-found.tsx
    page.tsx
    providers.tsx
  components/
    blog/
      BlogList.tsx
      BlogPost.tsx
      CategoryFilter.tsx
    home/
      ClientHomeSection.tsx
    layout/
      Footer.tsx
      Layout.tsx
      LayoutTemplate.tsx
      Navbar.tsx
    ui/
      Motion.tsx
      WhatsAppButton.tsx
    ThemeProvider.tsx
  data/
    blog-categories.json
    blog-posts.json
  lib/
    blog.ts
    config.ts
    route-types.ts
  types/
    globals.d.ts
.eslintrc.js
.gitignore
config.yaml
eslint.config.mjs
middleware.ts
next.config.ts
package.json
postcss.config.mjs
README.md
tailwind.config.ts
tsconfig.json
```

# Files

## File: .github/workflows/build.yml
````yaml
# File: .github/workflows/build.yml
name: Build
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: yarn
      - run: yarn install --frozen-lockfile
      - run: yarn build
````

## File: config/site.yaml
````yaml
# Site Configuration
site:
  name: "Mayorana"
  domain: "mayorana.ch"
  description: "Empowering Innovation with Rust, AI, and API Solutions"
  locale: "en"
  logoText: "mayorana"
  
# Color theme based on your provided color palette
colors:
  primary: "#FF6B00"  # Orange from the color palette
  background: 
    light: "#FFFFFF"
    dark: "#0F172A"
  foreground:
    light: "#1E293B"
    dark: "#F8FAFC"
  secondary:
    light: "#F1F5F9"
    dark: "#334155"
  border:
    light: "#E2E8F0"
    dark: "#334155"
  muted:
    light: "#F1F5F9"
    dark: "#334155"
  mutedForeground:
    light: "#6B7280"
    dark: "#94A3B8"

# Navigation
navigation:
  main:
    - label: "Home"
      path: "/"
    - label: "Services"
      path: "/services"
    - label: "About"
      path: "/about"
    - label: "api0.ai"
      path: "https://api0.ai"
      external: true
    - label: "Contact"
      path: "/contact"

# Services from your content plan
services:
  - title: "Rust Training"
    description: "Expert-led Rust training for professionals and teams, covering memory safety, concurrency, and performance optimization."
    cta: "Schedule a Training Session"
    ctaLink: "/contact?service=rust-training"
    icon: "Code"
  
  - title: "LLM Integration"
    description: "Seamlessly connect large language models (LLMs) to your applications for enhanced automation, chatbots, and data processing."
    cta: "Get a Free Consultation"
    ctaLink: "/contact?service=llm-integration"
    icon: "Brain"
  
  - title: "AI Agent Development"
    description: "Build intelligent AI agents for automation, decision-making, and process optimization."
    cta: "Start Your Agent Project"
    ctaLink: "/contact?service=ai-agent"
    icon: "Robot"
  
  - title: "api0.ai Solutions"
    description: "Cutting-edge platform that uses advanced NLP to match user inputs to API endpoints, simplifying integrations."
    cta: "Try api0.ai Now"
    ctaLink: "https://api0.ai"
    icon: "Network"

# Portfolio items
portfolio:
  - title: "Rust Training for Java Developers"
    description: "Delivering hands-on Rust training programs tailored for Java developers, enabling them to master Rust with the same fluency as Java."
    category: "Training"
  
  - title: "LLM-Powered Chatbot"
    description: "Integrated an LLM into a client's customer service platform, reducing response times by 40%."
    category: "Integration"
  
  - title: "api0.ai Implementation"
    description: "Helped an e-commerce client map user queries to product APIs, cutting integration time by 50%."
    category: "Development"

# Settings for logging as per your preference
logging:
  level: "trace"
  format: "json"
  output: "console"
````

## File: content/blog/closures_1.md
````markdown
---
id: "function-vs-closure-rust"
title: "What is the difference between a function and a closure in Rust?"
slug: "function-vs-closure-rust"
date: "2025-06-30"
author: "mayo"
excerpt: "Expert technical discussion on functions vs closures in Rust, covering ownership, traits, lifetimes, and performance implications."
category: "rust"
categoryName: "Rust"
categoryDescription: "Articles about Rust programming language, best practices, and performance tips."
tags:
  - "rust"
  - "functions"
  - "closures"
  - "traits"
  - "ownership"
---

# What is the difference between a function and a closure in Rust?

Understanding the distinction between functions and closures is fundamental to mastering Rust's ownership system and performance characteristics.

## Key Differences

| Functions | Closures |
|-----------|----------|
| Defined at compile time with `fn` | Anonymous, created at runtime |
| Static dispatch (no runtime overhead) | May involve dynamic dispatch (trait objects) |
| Cannot capture environment variables | Can capture variables from enclosing scope |
| Always have a known type | Type is unique and inferred (each closure has its own type) |

## Underlying Mechanics

### Closures Are Structs + Traits

Rust models closures as structs that:
- Store captured variables (as fields)
- Implement one of the closure traits (`Fn`, `FnMut`, or `FnOnce`)

For example, this closure:
```rust
let x = 42;
let closure = |y| x + y;
```

Is desugared to something like:
```rust
struct AnonymousClosure {
    x: i32,  // Captured variable
}

impl FnOnce<(i32,)> for AnonymousClosure {
    type Output = i32;
    fn call_once(self, y: i32) -> i32 {
        self.x + y
    }
}
```

### Dynamic Dispatch (Vtables)

When closures are trait objects (e.g., `Box<dyn Fn(i32) -> i32>`), Rust uses vtables for dynamic dispatch:
- **Vtable**: A lookup table storing function pointers, enabling runtime polymorphism
- **Overhead**: Indirect function calls (~2–3x slower than static dispatch)

## When to Use Each

Use **Functions** when:
- You need zero-cost abstractions (e.g., mathematical operations)
- No environment capture is required

```rust
fn add(a: i32, b: i32) -> i32 { a + b }
```

Use **Closures** when:
- You need to capture state from the environment
- Writing short, ad-hoc logic (e.g., callbacks, iterators)

```rust
let threshold = 10;
let filter = |x: i32| x > threshold;  // Captures `threshold`
```

## Performance Considerations

| Scenario | Static Dispatch (Closures) | Dynamic Dispatch (dyn Fn) |
|----------|----------------------------|----------------------------|
| Speed | Fast (inlined) | Slower (vtable lookup) |
| Memory | No overhead | Vtable + fat pointer |
| Use Case | Hot loops, embedded | Heterogeneous callbacks |

## Example: Static vs. Dynamic Dispatch

```rust
// Static dispatch (compile-time)
fn static_call<F: Fn(i32) -> i32>(f: F, x: i32) -> i32 {
    f(x)  // Inlined
}

// Dynamic dispatch (runtime)
fn dynamic_call(f: &dyn Fn(i32) -> i32, x: i32) -> i32 {
    f(x)  // Vtable lookup
}
```

## Key Takeaways

✅ **Functions**: Predictable performance, no captures  
✅ **Closures**: Flexible, capture environment, but may involve vtables  
🚀 Prefer static dispatch (`impl Fn`) unless you need trait objects

**Try This:** What happens if a closure captures a mutable reference and is called twice?  
**Answer:** The borrow checker ensures exclusive access—it won't compile unless the first call completes!
````

## File: content/blog/collections_iterators_1.md
````markdown
---
id: "vec-new-vs-with-capacity"
title: "What is the difference between Vec::new() and Vec::with_capacity()? When would you use each?"
slug: "vec-new-vs-with-capacity"
date: "2025-06-30"
author: "mayo"
excerpt: "An expert technical discussion on Vec allocation strategies in Rust, comparing Vec::new() and Vec::with_capacity() for optimal performance."
category: "rust"
categoryName: "Rust"
categoryDescription: "Articles about Rust programming language, best practices, and performance tips."
tags:
  - "rust"
  - "collections"
  - "performance"
  - "vec"
  - "iterators"
---

# What is the difference between Vec::new() and Vec::with_capacity()? When would you use each?

Understanding Vec allocation strategies is crucial for writing performant Rust code, especially when dealing with collections and iterators.

## Key Differences

| `Vec::new()` | `Vec::with_capacity(n)` |
|--------------|-------------------------|
| Creates an empty Vec with no pre-allocated space | Creates an empty Vec with space for n elements |
| Initial capacity is 0 (allocates on first push) | Initial capacity is exactly n (no early allocations) |
| Grows dynamically (may reallocate multiple times) | Avoids reallocation until len() > n |

## When to Use Each

Use `Vec::new()` when:
- The number of elements is unknown or small
- You want simplicity (e.g., short-lived vectors)

```rust
let mut v = Vec::new(); // Good for ad-hoc usage
v.push(1);
```

Use `Vec::with_capacity(n)` when:
- You know the exact or maximum number of elements upfront
- Optimizing for performance (avoids reallocations)

```rust
let mut v = Vec::with_capacity(1000); // Pre-allocate for 1000 items
for i in 0..1000 {
    v.push(i); // No reallocation happens
}
```

## Performance Impact

`Vec::new()` may trigger multiple reallocations as it grows (e.g., starts at 0, then 4, 8, 16, ...).
`Vec::with_capacity(n)` guarantees one allocation upfront (if n is correct).

## Example Benchmark

```rust
use std::time::Instant;

fn main() {
    let start = Instant::now();
    let mut v1 = Vec::new();
    for i in 0..1_000_000 {
        v1.push(i); // Reallocates ~20 times
    }
    println!("Vec::new(): {:?}", start.elapsed());

    let start = Instant::now();
    let mut v2 = Vec::with_capacity(1_000_000);
    for i in 0..1_000_000 {
        v2.push(i); // No reallocations
    }
    println!("Vec::with_capacity(): {:?}", start.elapsed());
}
```

Output (typical):
```
Vec::new(): 1.2ms
Vec::with_capacity(): 0.3ms  // 4x faster
```

## Advanced Notes

- `shrink_to_fit()`: Reduces excess capacity (e.g., after removing elements)
- `vec![]` macro: Uses with_capacity implicitly for literals (e.g., vec![1, 2, 3])

## Key Takeaways

✅ Default to `Vec::new()` for simplicity.  
✅ Use `with_capacity(n)` when:
- You know the size upfront
- Performance is critical (e.g., hot loops)

**Try This:** What happens if you push beyond the pre-allocated capacity?  
**Answer:** The Vec grows automatically (like `Vec::new()`), but only after exceeding n.
````

## File: content/blog/getting-started-with-rust.md
````markdown
---
id: "getting-started-with-rust"
title: "Getting Started with Rust: A Guide for Beginners"
slug: "getting-started-with-rust"
date: "2025-04-15"
author: "Mayorana"
excerpt: "An introduction to Rust for beginners, covering installation, basic syntax, and your first project."
category: "rust"
categoryName: "Rust"
categoryDescription: "Articles about Rust programming language, best practices, and performance tips."
tags:
  - "rust"
  - "programming"
  - "beginners"
  - "tutorial"
---

# Getting Started with Rust: A Guide for Beginners

Rust has been gaining significant traction among developers for its focus on performance, memory safety, and concurrency. If you're new to Rust, this guide will help you get started with the basics.

## Setting Up Your Environment

First, you'll need to install Rust on your system. The easiest way is to use rustup, the Rust toolchain installer:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

This command will download a script and start the installation process. Follow the instructions on screen to complete the installation.

## Your First Rust Program

Let's create a simple "Hello, World!" program. Create a new file called `hello.rs` with the following content:

```rust
fn main() {
    println!("Hello, World!");
}
```

To compile and run this program, use the following commands:

```bash
rustc hello.rs
./hello
```

## Understanding Cargo

Cargo is Rust's build system and package manager. It handles many tasks such as building your code, downloading libraries, and building those libraries.

To create a new project with Cargo:

```bash
cargo new hello_cargo
cd hello_cargo
```

This creates a new directory called `hello_cargo` with the following structure:

```
hello_cargo/
├── Cargo.toml
└── src/
    └── main.rs
```

The `Cargo.toml` file contains metadata about your project and its dependencies. The `src/main.rs` file contains your application code.

To build and run your project:

```bash
cargo build   # Compile the project
cargo run     # Compile and run the project
```

## Key Concepts in Rust

### Variables and Mutability

By default, variables in Rust are immutable:

```rust
let x = 5;
// x = 6; // This would cause an error
```

To make a variable mutable, use the `mut` keyword:

```rust
let mut y = 5;
y = 6; // This works fine
```

### Ownership

Ownership is Rust's most unique feature and enables memory safety without garbage collection. The main rules are:

1. Each value in Rust has a variable that's its owner.
2. There can only be one owner at a time.
3. When the owner goes out of scope, the value will be dropped.

```rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1; // s1 is moved to s2, s1 is no longer valid
    
    // println!("{}", s1); // This would cause an error
    println!("{}", s2); // This works fine
}
```

## Next Steps

Now that you have the basics, try building a small project to practice your skills. The Rust documentation is an excellent resource for learning more:

- [The Rust Book](https://doc.rust-lang.org/book/)
- [Rust by Example](https://doc.rust-lang.org/rust-by-example/)

Happy coding with Rust!
````

## File: content/blog/low_level_optim_1.md
````markdown
---
id: "memory-layout-optimization-rust"
title: "Memory Layout Optimization: How would you use Rust's repr attribute to optimize the memory layout of a struct for cache efficiency, and what trade-offs might you consider when choosing between repr(C) and repr(packed)?"
slug: "memory-layout-optimization-rust"
date: "2025-06-30"
author: "mayo"
excerpt: "Expert technical discussion on low-level memory optimization in Rust, covering repr attributes, cache efficiency, and performance trade-offs for lead developers."
category: "rust"
categoryName: "Rust"
categoryDescription: "Articles about Rust programming language, best practices, and performance tips."
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
````

## File: content/blog/memory_mngt_1.md
````markdown
---
id: "string-vs-str-rust"
title: "What is the difference between String and str in Rust? When would you use each?"
slug: "string-vs-str-rust"
date: "2025-06-30"
author: "mayo"
excerpt: "Expert technical discussion on String vs str in Rust, covering memory management, ownership, and when to use each type."
category: "rust"
categoryName: "Rust"
categoryDescription: "Articles about Rust programming language, best practices, and performance tips."
tags:
  - "rust"
  - "string"
  - "memory"
  - "ownership"
  - "types"
---

# What is the difference between String and str in Rust? When would you use each?

Understanding the distinction between `String` and `str` is fundamental to effective memory management and ownership in Rust.

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

✅ **`String`**: Owned, mutable, heap-allocated  
✅ **`str`**: Borrowed, immutable, flexible (heap/stack/static)  
🚀 Prefer `&str` for function parameters unless you need ownership or mutation

**Try This:** What happens when you call `.to_string()` on a string literal vs a `String`?  
**Answer:** Literal creates new heap allocation; `String` creates a clone of existing heap data—both allocate, but the source differs!
````

## File: content/blog/trait_dyn_1.md
````markdown
---
id: "rust-traits-vs-interfaces"
title: "How do Rust traits differ from interfaces in languages like Java or C#, and how would you use them to define a shared behavior for types in a performance-critical library?"
slug: "rust-traits-vs-interfaces"
date: "2025-06-30"
author: "mayo"
excerpt: "Expert technical discussion on Rust traits vs Java/C# interfaces, covering dispatch mechanisms, compile-time behavior, and performance optimizations in critical systems."
category: "rust"
categoryName: "Rust"
categoryDescription: "Articles about Rust programming language, best practices, and performance tips."
tags:
  - "rust"
  - "traits"
  - "performance"
  - "interfaces"
  - "dispatch"
---

# How do Rust traits differ from interfaces in languages like Java or C#, and how would you use them to define a shared behavior for types in a performance-critical library?

Rust traits and interfaces both define shared behavior, but differ fundamentally in design and execution, especially in performance-critical contexts.

## Key Differences

| Aspect | Rust Traits | Java/C# Interfaces |
|--------|-------------|-------------------|
| **Dispatch** | Static dispatch (generics) by default, opt-in dynamic (`dyn`) | Runtime polymorphism via vtables |
| **Implementation** | Explicit via `impl Trait for Type` | Implicit (C#) or explicit (Java) |
| **Compile-time** | Resolved at compile time via monomorphization | Runtime constructs with JIT optimization |
| **Inheritance** | No inheritance; composition via supertraits | Interface inheritance with runtime checks |
| **Performance** | Zero-cost abstraction, inlining enabled | 1-2 cycle dispatch cost, limited inlining |

## Implementation and Dispatch

**Rust Traits**: Support static dispatch via generics where the compiler monomorphizes code for each type, inlining calls for zero runtime overhead. Dynamic dispatch (`dyn Trait`) uses vtables but is opt-in.

**Java/C# Interfaces**: Rely on runtime polymorphism via vtables, incurring dispatch costs and preventing inlining across type boundaries.

## Example: Performance-Critical Networking Stack

Define a `PacketHandler` trait for efficient packet processing across different protocols:

```rust
trait PacketHandler {
    fn process(&mut self, data: &[u8]) -> usize; // Bytes processed
    fn reset(&mut self); // Reset state
}

struct TcpHandler { state: u32 }
struct UdpHandler { count: u16 }

impl PacketHandler for TcpHandler {
    fn process(&mut self, data: &[u8]) -> usize {
        self.state = data.iter().fold(self.state, |acc, &x| acc.wrapping_add(x as u32));
        data.len()
    }
    fn reset(&mut self) { self.state = 0; }
}

impl PacketHandler for UdpHandler {
    fn process(&mut self, data: &[u8]) -> usize {
        self.count = self.count.wrapping_add(1);
        data.len()
    }
    fn reset(&mut self) { self.count = 0; }
}

fn process_packets<H: PacketHandler>(handler: &mut H, packets: &[&[u8]]) -> usize {
    let mut total = 0;
    for packet in packets {
        total += handler.process(packet);
    }
    total
}
```

Usage:
```rust
let mut tcp = TcpHandler { state: 0 };
let packets = vec![&[1, 2, 3], &[4, 5, 6]];
let bytes = process_packets(&mut tcp, &packets); // Static dispatch
```

## How It Enhances Performance and Safety

### Performance

- **Static Dispatch**: `process_packets` monomorphizes for `TcpHandler` and `UdpHandler`, generating separate, inlined code paths. No vtable lookups, saving cycles in hot loops
- **Inlining**: Compiler can inline `process` calls, fusing them with the loop, reducing branches and enabling SIMD optimizations
- **Zero-Cost**: Trait abstraction adds no runtime overhead—equivalent to hand-writing `process_tcp` and `process_udp`

### Safety

- **Type Safety**: Trait bound `H: PacketHandler` ensures only compatible types are passed, checked at compile time—no runtime casts like Java's `instanceof`
- **Encapsulation**: Each handler manages its state (`state` or `count`), with Rust's ownership enforcing mutation rules

## Contrast with Java/C#

Java equivalent:
```java
interface PacketHandler {
    int process(byte[] data);
    void reset();
}

class TcpHandler implements PacketHandler {
    // vtable-based dispatch, no inlining across types
}
```

Every `process` call goes through a vtable, preventing loop fusion and adding indirection. Rust's static dispatch avoids this—critical for networking stacks handling millions of packets per second.

## Advanced Considerations

- **Associated Types**: Enable type-level constraints without runtime overhead
- **Default Implementations**: Reduce boilerplate while maintaining zero-cost
- **Supertraits**: Compose behavior without inheritance complexity
- **Dynamic Dispatch**: Use `Box<dyn PacketHandler>` when type erasure is needed

## Key Takeaways

✅ **Rust traits**: Compile-time resolution, zero-cost abstraction, static dispatch by default  
✅ **Java/C# interfaces**: Runtime polymorphism, vtable overhead, dynamic by nature  
🚀 Use traits for performance-critical code where static dispatch eliminates overhead

**Try This:** What happens if you use `&dyn PacketHandler` instead of generics?  
**Answer:** You get dynamic dispatch with vtable overhead—measure the performance difference in your hot paths!
````

## File: public/file.svg
````
<svg fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 13.5V5.41a1 1 0 0 0-.3-.7L9.8.29A1 1 0 0 0 9.08 0H1.5v13.5A2.5 2.5 0 0 0 4 16h8a2.5 2.5 0 0 0 2.5-2.5m-1.5 0v-7H8v-5H3v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1M9.5 5V2.12L12.38 5zM5.13 5h-.62v1.25h2.12V5zm-.62 3h7.12v1.25H4.5zm.62 3h-.62v1.25h7.12V11z" clip-rule="evenodd" fill="#666" fill-rule="evenodd"/></svg>
````

## File: public/globe.svg
````
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><g clip-path="url(#a)"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.27 14.1a6.5 6.5 0 0 0 3.67-3.45q-1.24.21-2.7.34-.31 1.83-.97 3.1M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.48-1.52a7 7 0 0 1-.96 0H7.5a4 4 0 0 1-.84-1.32q-.38-.89-.63-2.08a40 40 0 0 0 3.92 0q-.25 1.2-.63 2.08a4 4 0 0 1-.84 1.31zm2.94-4.76q1.66-.15 2.95-.43a7 7 0 0 0 0-2.58q-1.3-.27-2.95-.43a18 18 0 0 1 0 3.44m-1.27-3.54a17 17 0 0 1 0 3.64 39 39 0 0 1-4.3 0 17 17 0 0 1 0-3.64 39 39 0 0 1 4.3 0m1.1-1.17q1.45.13 2.69.34a6.5 6.5 0 0 0-3.67-3.44q.65 1.26.98 3.1M8.48 1.5l.01.02q.41.37.84 1.31.38.89.63 2.08a40 40 0 0 0-3.92 0q.25-1.2.63-2.08a4 4 0 0 1 .85-1.32 7 7 0 0 1 .96 0m-2.75.4a6.5 6.5 0 0 0-3.67 3.44 29 29 0 0 1 2.7-.34q.31-1.83.97-3.1M4.58 6.28q-1.66.16-2.95.43a7 7 0 0 0 0 2.58q1.3.27 2.95.43a18 18 0 0 1 0-3.44m.17 4.71q-1.45-.12-2.69-.34a6.5 6.5 0 0 0 3.67 3.44q-.65-1.27-.98-3.1" fill="#666"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h16v16H0z"/></clipPath></defs></svg>
````

## File: public/robots.txt
````
# robots.txt for api0.ai
User-agent: *
Allow: /

# Allow all bots to access the site
# Specify sitemap location
Sitemap: https://mayorana.ch/sitemap.xml

# Prevent bots from crawling dev/staging areas if they exist
User-agent: *
Disallow: /admin/
Disallow: /dev/
Disallow: /staging/
````

## File: public/site.webmanifest
````
{"name":"","short_name":"","icons":[{"src":"/android-chrome-192x192.png","sizes":"192x192","type":"image/png"},{"src":"/android-chrome-512x512.png","sizes":"512x512","type":"image/png"}],"theme_color":"#ffffff","background_color":"#ffffff","display":"standalone"}
````

## File: public/sitemap.xml
````xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static pages -->
  <url>
    <loc>https://mayorana.ch</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://mayorana.ch/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://mayorana.ch/blog/function-vs-closure-rust</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://mayorana.ch/blog/vec-new-vs-with-capacity</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://mayorana.ch/blog/memory-layout-optimization-rust</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://mayorana.ch/blog/string-vs-str-rust</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://mayorana.ch/blog/rust-traits-vs-interfaces</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://mayorana.ch/blog/getting-started-with-rust</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
````

## File: public/window.svg
````
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.5 2.5h13v10a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1zM0 1h16v11.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 0 12.5zm3.75 4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5M7 4.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0m1.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5" fill="#666"/></svg>
````

## File: scripts/generate-blog-data.js
````javascript
// scripts/generate-blog-data.js
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');
const slugify = require('slugify');
const readingTime = require('reading-time');

// Path to your blog content
const postsDirectory = path.join(process.cwd(), './content/blog/');
const outputPath = path.join(process.cwd(), 'src/data/blog-posts.json');
const categoriesOutputPath = path.join(process.cwd(), 'src/data/blog-categories.json');

// Function to generate slug from title if not explicitly provided
function generateSlug(title) {
  return slugify(title, {
    lower: true,
    strict: true
  });
}

// Function to extract headings from markdown content
function extractHeadings(content) {
  const headings = [];
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  let match;
  
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = slugify(text, { lower: true, strict: true });
    
    headings.push({ id, text, level });
  }
  
  return headings;
}

// Read all posts
async function generateBlogData() {
  console.log(`Reading posts from ${postsDirectory}`);
  
  // Ensure the data directory exists
  const dataDir = path.join(process.cwd(), 'src/data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Create content directory if it doesn't exist
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
    console.log(`Created directory: ${postsDirectory}`);
  }
  
  // Read all markdown files in the posts directory
  const fileNames = fs.readdirSync(postsDirectory);
  
  // Track categories for the categories file
  const categoriesMap = new Map();
  
  const postsData = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      // Read file content
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      
      // Parse frontmatter
      const { data, content } = matter(fileContents);
      
      // Generate slug from title if not provided
      const slug = data.slug || generateSlug(data.title);
      
      // Convert markdown to HTML for rendering
      const contentHtml = marked(content);
      
      // Extract headings for table of contents
      const headings = extractHeadings(content);
      
      // Calculate reading time
      const timeStats = readingTime(content);
      const readingTimeText = `${Math.ceil(timeStats.minutes)} min`;
      
      // Track category for categories file
      if (data.category) {
        if (!categoriesMap.has(data.category)) {
          categoriesMap.set(data.category, {
            slug: data.category,
            name: data.categoryName || data.category.charAt(0).toUpperCase() + data.category.slice(1),
            description: data.categoryDescription || `Articles about ${data.category}`
          });
        }
      }
      
      // Return structured data
      return {
        id: data.id || slug,
        slug,
        title: data.title,
        date: data.date,
        excerpt: data.excerpt,
        content,
        contentHtml,
        author: data.author,
        category: data.category,
        tags: data.tags || [],
        image: data.image,
        readingTime: readingTimeText,
        seo: {
          title: data.seo_title || data.title,
          description: data.meta_description || data.excerpt,
          keywords: data.keywords || data.tags,
          ogImage: data.og_image || data.image
        },
        headings
      };
    })
    // Sort by date (newest first)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Write the posts data to a JSON file
  fs.writeFileSync(
    outputPath,
    JSON.stringify(postsData, null, 2)
  );
  
  // Convert categories map to array and write to file
  const categories = Array.from(categoriesMap.values());
  fs.writeFileSync(
    categoriesOutputPath,
    JSON.stringify(categories, null, 2)
  );
  
  console.log(`✅ Generated blog data with ${postsData.length} posts and ${categories.length} categories`);
}

// Run the function
generateBlogData().catch(console.error);
````

## File: scripts/generate-sitemap.js
````javascript
// scripts/generate-sitemap.js
const fs = require('fs');
const path = require('path');

// Base URL of your website
const BASE_URL = 'https://mayorana.ch';

/**
 * Generate sitemap.xml content with URLs from the site
 */
async function generateSitemap() {
  // Path to the blog posts JSON file
  const postsPath = path.join(process.cwd(), 'src/data/blog-posts.json');
  
  // Check if posts file exists
  let blogSlugs = [];
  if (fs.existsSync(postsPath)) {
    try {
      const postsContent = fs.readFileSync(postsPath, 'utf8');
      const posts = JSON.parse(postsContent);
      // Extract just the slugs from the posts
      blogSlugs = posts.map(post => post.slug);
      console.log(`Found ${blogSlugs.length} blog posts for sitemap`);
    } catch (error) {
      console.warn('Error reading blog posts:', error.message);
      console.log('Proceeding with empty blog posts list');
    }
  } else {
    console.log('Blog posts file not found, proceeding with empty list');
  }
  
  // Start XML content
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static pages -->
  <url>
    <loc>${BASE_URL}</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;

  // Add all blog posts using the slugs
  for (const slug of blogSlugs) {
    const postUrl = `${BASE_URL}/blog/${slug}`;
    sitemap += `
  <url>
    <loc>${postUrl}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }

  // Close XML
  sitemap += `
</urlset>`;

  return sitemap;
}

/**
 * Write the sitemap to the public directory
 */
async function writeSitemap() {
  try {
    const sitemap = await generateSitemap();
    const publicDir = path.join(process.cwd(), 'public');
    
    // Ensure the public directory exists
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
    console.log('✅ Sitemap generated successfully!');
    return true;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return false;
  }
}

// Run the sitemap generation
writeSitemap().catch(console.error);
````

## File: src/app/about/layout.tsx
````typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about Mayorana and specialized services in Rust, AI agents, and API solutions.',
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
````

## File: src/app/about/page.tsx
````typescript
'use client';

import React from 'react';
import Link from 'next/link';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { FiExternalLink } from 'react-icons/fi';
import { motion } from '@/components/ui/Motion';

export default function AboutPage() {
  const skills = [
    { category: "Programming", items: ["Rust", "TypeScript", "Python", "WebAssembly"] },
    { category: "AI & ML", items: ["LLM Integration", "NLP", "AI Agent Development", "Prompt Engineering"] },
    { category: "Infrastructure", items: ["AWS", "Docker", "Kubernetes", "gRPC"] },
    { category: "Frontend", items: ["React", "Next.js", "Tailwind CSS", "WebSockets"] }
  ];

  const values = [
    {
      title: "Technical Excellence",
      description: "Building robust, performant, and maintainable systems that stand the test of time."
    },
    {
      title: "Continuous Learning",
      description: "Staying at the forefront of technology to deliver cutting-edge solutions."
    },
    {
      title: "Client Success",
      description: "Focusing on outcomes that drive real business value and innovation."
    },
    {
      title: "Simplicity",
      description: "Creating elegant solutions that reduce complexity and are easy to understand."
    }
  ];

  return (
    <LayoutTemplate>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-secondary to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1 
              className="text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              About Me
            </motion.h1>
            <motion.p 
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Bringing expertise in Rust, AI agents, and API solutions to clients worldwide
            </motion.p>
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <motion.div
              className="relative h-96 rounded-xl overflow-hidden border border-border"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Placeholder for profile image */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center">
                <span className="text-4xl font-bold text-foreground">Mayorana</span>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold mb-6">Who I Am</h2>
              <div className="space-y-4 text-lg">
                <p>
                  As a solopreneur based in Switzerland, I specialize in delivering cutting-edge solutions in Rust programming, AI agent development, and seamless LLM integrations.
                </p>
                <p>
                  With a passion for simplifying complex systems, I empower businesses through tailored Rust training and innovative tools like api0.ai, my NLP-driven API-matching solution.
                </p>
                <p>
                  My work blends technical expertise with a commitment to driving efficiency and innovation for enterprises worldwide.
                </p>
                <p className="font-medium text-foreground">
                  Proudly operating from the heart of Switzerland, I bring precision and reliability to every project.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Skills Section */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-3xl font-bold mb-10 text-center">Skills & Expertise</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {skills.map((skillGroup) => (
                <div 
                  key={skillGroup.category}
                  className="p-6 bg-secondary rounded-xl border border-border"
                >
                  <h3 className="font-semibold mb-4 text-primary">{skillGroup.category}</h3>
                  <ul className="space-y-2">
                    {skillGroup.items.map((skill) => (
                      <li key={skill} className="flex items-center">
                        <span className="mr-2">•</span>
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Values Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold mb-10 text-center">Core Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value) => (
                <div 
                  key={value.title}
                  className="p-6 rounded-xl bg-secondary/50 border border-border"
                >
                  <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* api0.ai Section */}
      <section className="py-20 bg-secondary">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Featured Project: api0.ai</h2>
              <p className="text-lg text-muted-foreground">
                My flagship innovation, streamlining API integrations through advanced NLP
              </p>
            </div>
            
            <div className="bg-background p-8 rounded-xl border border-border mb-10">
              <p className="mb-6">
                api0.ai represents the culmination of my work in AI and API integration, providing a solution that intelligently matches natural language inputs to the right API endpoints.
              </p>
              <p className="mb-6">
                Using advanced natural language processing, api0.ai simplifies the integration process for businesses, reducing development time and complexity while providing robust security features.
              </p>
              <div className="flex justify-center">
                <Link
                  href="https://api0.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                >
                  Visit api0.ai <FiExternalLink className="ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Work Together?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Let&apos;s discuss how my expertise can help your business achieve its goals with innovative technology solutions.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 rounded-lg bg-primary text-white text-lg font-semibold hover:bg-primary/90 transform transition duration-200 hover:-translate-y-1 shadow-xl shadow-primary/20"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </LayoutTemplate>
  );
}
````

## File: src/app/blog/[slug]/layout.tsx
````typescript
import { getPostBySlug } from '@/lib/blog';
import type { Metadata, ResolvingMetadata } from 'next'

// Next.js 15: params is now a Promise
type Props = {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Await the params since they're now a Promise in Next.js 15
  const { slug } = await params;
  
  // Get post
  const post = getPostBySlug(slug);
  
  // Use parent metadata
  const previousImages = (await parent).openGraph?.images || [];
  
  if (!post) {
    return {
      title: 'Post Not Found | Mayorana',
    };
  }
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      images: post.seo?.ogImage 
        ? [{ url: post.seo.ogImage }, ...previousImages]
        : previousImages,
    },
  };
}

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
````

## File: src/app/blog/[slug]/page.tsx
````typescript
import { notFound } from 'next/navigation';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import BlogPost from '@/components/blog/BlogPost';
import { getPostBySlug, getAllPosts } from '@/lib/blog';

// Next.js 15: params is now a Promise
type Props = {
  params: Promise<{ slug: string }>;
}

// Generate static params for better performance
export async function generateStaticParams() {
  try {
    const posts = getAllPosts();
    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function PostPage({ params }: Props) {
  try {
    // Await the params since they're now a Promise in Next.js 15
    const { slug } = await params;

    // Validate slug
    if (!slug || typeof slug !== 'string') {
      notFound();
    }

    const post = getPostBySlug(slug);

    if (!post) {
      notFound();
    }

    return (
      <LayoutTemplate>
        <section className="py-20 bg-background">
          <div className="container">
            <BlogPost post={post} />
          </div>
        </section>
      </LayoutTemplate>
    );
  } catch (error) {
    console.error('Error in PostPage:', error);
    notFound();
  }
}
````

## File: src/app/blog/category/[slug]/layout.tsx
````typescript
import { Metadata } from 'next';
import { getCategoryBySlug } from '@/lib/blog';

// Next.js 15: params is now a Promise
type Props = {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Await the params since they're now a Promise in Next.js 15
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  
  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }
  
  return {
    title: `${category.name} - Blog`,
    description: category.description,
  };
}

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
````

## File: src/app/blog/category/[slug]/page.tsx
````typescript
import { notFound } from 'next/navigation';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import BlogList from '@/components/blog/BlogList';
import CategoryFilter from '@/components/blog/CategoryFilter';
import {
  getAllCategories,
  getPostsByCategory,
  getCategoryBySlug,
} from '@/lib/blog';

// Next.js 15: params is now a Promise
type Props = {
  params: Promise<{ slug: string }>;
}

// Generate static parameters for categories
export async function generateStaticParams() {
  try {
    const categories = getAllCategories();
    return categories.map((category) => ({
      slug: category.slug,
    }));
  } catch (error) {
    console.error('Error generating static params for categories:', error);
    return [];
  }
}

export default async function CategoryPage({ params }: Props) {
  try {
    // Await the params since they're now a Promise in Next.js 15
    const { slug } = await params;

    // Validate slug
    if (!slug || typeof slug !== 'string') {
      notFound();
    }

    const currentCategory = getCategoryBySlug(slug);

    if (!currentCategory) {
      notFound();
    }

    const posts = getPostsByCategory(slug);
    const categories = getAllCategories();

    return (
      <LayoutTemplate>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-secondary to-background">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-6">
                {currentCategory.name}
              </h1>
              <p className="text-xl text-muted-foreground">
                {currentCategory.description}
              </p>
            </div>
          </div>
        </section>

        {/* Blog Content */}
        <section className="py-16 bg-background">
          <div className="container">
            <div className="grid md:grid-cols-12 gap-12">
              {/* Sidebar */}
              <div className="md:col-span-3">
                <CategoryFilter
                  categories={categories}
                  currentCategory={currentCategory.slug}
                />
              </div>

              {/* Main Content */}
              <div className="md:col-span-9">
                <BlogList posts={posts} title="" description="" />
              </div>
            </div>
          </div>
        </section>
      </LayoutTemplate>
    );
  } catch (error) {
    console.error('Error in CategoryPage:', error);
    notFound();
  }
}
````

## File: src/app/blog/layout.tsx
````typescript
import { Metadata } from 'next';

// Static metadata for the blog section - no params needed
export const metadata: Metadata = {
  title: 'Blog - Mayorana',
  description: 'Insights and articles about Rust, AI, and modern software development.',
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
````

## File: src/app/blog/page.tsx
````typescript
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import BlogList from '@/components/blog/BlogList';
import CategoryFilter from '@/components/blog/CategoryFilter';
import { 
  getAllCategories, 
  getAllPosts,
} from '@/lib/blog';

// Next.js 15: searchParams is now a Promise
type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BlogPage({ }: Props) {
  // Get all posts and categories
  const posts = getAllPosts();
  const categories = getAllCategories();

  // Await searchParams if you need to use them for filtering
  // const queryParams = await searchParams;
  // const category = queryParams.category as string;

  return (
    <LayoutTemplate>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-secondary to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">Blog</h1>
            <p className="text-xl text-muted-foreground">
              Insights and articles about Rust, AI, and modern software development.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="grid md:grid-cols-12 gap-12">
            {/* Sidebar */}
            <div className="md:col-span-3">
              <CategoryFilter 
                categories={categories} 
                currentCategory={undefined}
              />
            </div>
            
            {/* Main Content */}
            <div className="md:col-span-9">
              <BlogList posts={posts} title="" description="" />
            </div>
          </div>
        </div>
      </section>
    </LayoutTemplate>
  );
}
````

## File: src/app/contact/layout.tsx
````typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch for Rust training, LLM integration, AI agent development, and api0.ai solutions.',
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
````

## File: src/app/contact/page.tsx
````typescript
// File: src/app/contact/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { useForm } from 'react-hook-form';
import { FiMail, FiMapPin, FiLinkedin } from 'react-icons/fi';
import { motion } from '@/components/ui/Motion';
import { FaWhatsapp } from 'react-icons/fa';

interface FormData {
  name: string;
  email: string;
  company?: string;
  service?: string;
  message: string;
}

// Separate component that uses useSearchParams
function ContactFormWithParams() {
  const searchParams = useSearchParams();
  const service = searchParams.get('service');

  const whatsappNumber = "+41764837540";
  const whatsappMessage = "Hello, I'd like to learn more about your services.";
  const encodedMessage = encodeURIComponent(whatsappMessage);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  const handleWhatsAppClick = () => {
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('WhatsApp Contact', {
        props: {
          source: 'contact_page'
        }
      });
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<FormData>();

  const [formSubmitted, setFormSubmitted] = useState(false);

  // Set the service field if it's provided in the query params
  useEffect(() => {
    if (service) {
      setValue('service', service as string);
    }
  }, [service, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch('http://0.0.0.0:5009/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit form');
      }

      setFormSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to send message. Please try again later.');
    }
  };

  const services = [
    { value: "rust-training", label: "Rust Training" },
    { value: "llm-integration", label: "LLM Integration" },
    { value: "ai-agent", label: "AI Agent Development" },
    { value: "api0", label: "api0.ai Solutions" },
    { value: "other", label: "Other" }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-secondary to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              className="text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Get in Touch
            </motion.h1>
            <motion.p
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Ready to elevate your tech stack with Rust, AI, or api0.ai? Let&apos;s discuss how I can help your business succeed.
            </motion.p>
          </div>
        </div>
      </section>

      <div className="md:hidden mt-8 mb-4">
        <p className="text-center text-muted-foreground text-sm mb-3">
          For a faster response on mobile:
        </p>
        <Link 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWhatsAppClick}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition-colors"
        >
          <FaWhatsapp className="h-5 w-5" />
          Contact via WhatsApp
        </Link>
      </div>

      {/* Contact Form Section */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div>
                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                <p className="text-muted-foreground mb-8">
                  Based in Switzerland, I&apos;m here to help global and local clients succeed with cutting-edge solutions.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="mr-4 p-3 bg-primary/10 rounded-full text-primary">
                      <FiMail className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p className="text-muted-foreground">
                        <a href="mailto:contact@mayorana.ch" className="hover:text-primary">
                          contact@mayorana.ch
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="mr-4 p-3 bg-primary/10 rounded-full text-primary">
                      <FiMapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">Location</h3>
                      <p className="text-muted-foreground">Switzerland</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="mr-4 p-3 bg-primary/10 rounded-full text-primary">
                      <FiLinkedin className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">LinkedIn</h3>
                      <p className="text-muted-foreground">
                        <a
                          href="https://linkedin.com/in/bennekrouf"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary"
                        >
                          linkedin.com/in/bennekrouf
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-secondary rounded-xl border border-border">
                <h3 className="font-medium mb-2">Response Time</h3>
                <p className="text-sm text-muted-foreground">
                  I typically respond to inquiries within 24 hours during business days.
                </p>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {formSubmitted ? (
                <div className="bg-secondary p-8 rounded-xl border border-border text-center">
                  <div className="text-primary text-6xl mb-4">✓</div>
                  <h3 className="text-2xl font-bold mb-4">Message Sent Successfully!</h3>
                  <p className="text-muted-foreground mb-6">
                    Thank you for reaching out. I&apos;ll get back to you as soon as possible.
                  </p>
                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="bg-secondary p-8 rounded-xl border border-border"
                >
                  <h2 className="text-2xl font-bold mb-6">Send a Message</h2>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {/* Name Field */}
                    <div className="space-y-2">
                      <label htmlFor="name" className="font-medium">
                        Name <span className="text-primary">*</span>
                      </label>
                      <input
                        id="name"
                        className="w-full p-3 rounded-lg border border-border bg-background text-foreground"
                        placeholder="Your name"
                        {...register('name', { required: 'Name is required' })}
                      />
                      {errors.name && (
                        <p className="text-sm text-primary">{errors.name.message}</p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="font-medium">
                        Email <span className="text-primary">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        className="w-full p-3 rounded-lg border border-border bg-background text-foreground"
                        placeholder="Your email"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address',
                          },
                        })}
                      />
                      {errors.email && (
                        <p className="text-sm text-primary">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Company Field */}
                  <div className="space-y-2 mb-4">
                    <label htmlFor="company" className="font-medium">
                      Company (Optional)
                    </label>
                    <input
                      id="company"
                      className="w-full p-3 rounded-lg border border-border bg-background text-foreground"
                      placeholder="Your company"
                      {...register('company')}
                    />
                  </div>

                  {/* Service Field */}
                  <div className="space-y-2 mb-4">
                    <label htmlFor="service" className="font-medium">
                      Service of Interest <span className="text-primary">*</span>
                    </label>
                    <select
                      id="service"
                      className="w-full p-3 rounded-lg border border-border bg-background text-foreground"
                      {...register('service', { required: 'Please select a service' })}
                    >
                      <option value="">Select a service</option>
                      {services.map((service) => (
                        <option key={service.value} value={service.value}>
                          {service.label}
                        </option>
                      ))}
                    </select>
                    {errors.service && (
                      <p className="text-sm text-primary">{errors.service.message}</p>
                    )}
                  </div>

                  {/* Message Field */}
                  <div className="space-y-2 mb-6">
                    <label htmlFor="message" className="font-medium">
                      Message <span className="text-primary">*</span>
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className="w-full p-3 rounded-lg border border-border bg-background text-foreground"
                      placeholder="How can I help you?"
                      {...register('message', { required: 'Message is required' })}
                    />
                    {errors.message && (
                      <p className="text-sm text-primary">{errors.message.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full p-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-70"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}

// Fallback component to show while Suspense is loading
function ContactFormFallback() {
  return (
    <div className="py-20 bg-gradient-to-b from-secondary to-background">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">Get in Touch</h1>
          <p className="text-xl text-muted-foreground">Loading contact form...</p>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function ContactPage() {
  return (
    <LayoutTemplate>
      <Suspense fallback={<ContactFormFallback />}>
        <ContactFormWithParams />
      </Suspense>
    </LayoutTemplate>
  );
}
````

## File: src/app/services/layout.tsx
````typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Expert services in Rust training, LLM integration, AI agent development, and api0.ai solutions.',
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
````

## File: src/app/services/page.tsx
````typescript
'use client';

import React from 'react';
import Link from 'next/link';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { FaCode, FaBrain, FaRobot, FaArrowRight } from 'react-icons/fa';
import { FaNetworkWired } from "react-icons/fa";
import { motion } from '@/components/ui/Motion';

export default function ServicesPage() {
  const services = [
    {
      id: "rust-training",
      icon: <FaCode className="h-8 w-8 text-primary" />,
      title: "Rust Training",
      description: "Expert-led Rust training for professionals and teams, covering memory safety, concurrency, and performance optimization. Tailored courses for beginners to advanced developers, with real-world applications in fintech, systems programming, and more.",
      benefits: [
        "Master Rust's ownership system and memory safety features",
        "Learn concurrent programming patterns with Rust's guarantees",
        "Understand performance optimization techniques",
        "Apply Rust to real-world problems in your domain"
      ],
      cta: "Schedule a Training Session",
      link: "/contact?service=rust-training"
    },
    {
      id: "llm-integration",
      icon: <FaBrain className="h-8 w-8 text-primary" />,
      title: "LLM Integration",
      description: "Seamlessly connect large language models (LLMs) to your applications for enhanced automation, chatbots, and data processing. Custom solutions designed to integrate with your existing systems, ensuring scalability and performance.",
      benefits: [
        "Integrate leading LLMs into your existing products",
        "Build custom knowledge bases for domain-specific applications",
        "Implement scalable prompt engineering frameworks",
        "Create robust evaluation systems for LLM outputs"
      ],
      cta: "Get a Free Consultation",
      link: "/contact?service=llm-integration"
    },
    {
      id: "ai-agent",
      icon: <FaRobot className="h-8 w-8 text-primary" />,
      title: "AI Agent Development",
      description: "Build intelligent AI agents for automation, decision-making, and process optimization. From concept to deployment, I create agents that leverage NLP and gRPC for enterprise-grade performance.",
      benefits: [
        "Automate complex workflows with intelligent agents",
        "Create agents that can reason about your domain",
        "Connect to multiple data sources and APIs",
        "Build self-improving systems with feedback loops"
      ],
      cta: "Start Your Agent Project",
      link: "/contact?service=ai-agent"
    },
    {
      id: "api0",
      icon: <FaNetworkWired className="h-8 w-8 text-primary" />,
      title: "api0.ai Solutions",
      description: "Promote api0.ai, my cutting-edge platform that uses advanced NLP to match user inputs to API endpoints, simplifying integrations for enterprises. Easy-to-use, secure, and designed for minimal setup.",
      benefits: [
        "Match natural language inputs to the right API endpoints",
        "Reduce integration time and complexity",
        "Secure API key management with domain restrictions",
        "Scale seamlessly for enterprise-level traffic"
      ],
      cta: "Try api0.ai Now",
      link: "https://api0.ai"
    }
  ];

  return (
    <LayoutTemplate>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-secondary to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1 
              className="text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              What I Offer
            </motion.h1>
            <motion.p 
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Specialized services that help businesses innovate and transform through modern technology solutions.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="space-y-24">
            {services.map((service, index) => (
              <div 
                key={service.id}
                id={service.id}
                className="scroll-mt-20"
              >
                <motion.div 
                  className="grid md:grid-cols-2 gap-12 items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className={index % 2 === 0 ? "order-1" : "order-1 md:order-2"}>
                    <div className="mb-6 p-4 inline-flex bg-primary/10 rounded-full">
                      {service.icon}
                    </div>
                    <h2 className="text-3xl font-bold mb-6">{service.title}</h2>
                    <p className="text-lg text-muted-foreground mb-8">
                      {service.description}
                    </p>
                    <Link
                      href={service.link}
                      className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                    >
                      {service.cta} <FaArrowRight className="ml-2" />
                    </Link>
                  </div>
                  
                  <div className={index % 2 === 0 ? "order-2" : "order-2 md:order-1"}>
                    <div className="bg-secondary p-8 rounded-xl border border-border">
                      <h3 className="font-semibold mb-4">Key Benefits</h3>
                      <ul className="space-y-4">
                        {service.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start">
                            <span className="mr-3 text-primary font-bold">✓</span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Contact me to discuss your specific needs and how my services can help your business innovate and grow.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 rounded-lg bg-primary text-white text-lg font-semibold hover:bg-primary/90 transform transition duration-200 hover:-translate-y-1 shadow-xl shadow-primary/20"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </LayoutTemplate>
  );
}
````

## File: src/app/globals.css
````css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Blog styles from blog.css */
.prose {
  max-width: 65ch;
  color: hsl(var(--foreground));
}

.prose a {
  color: hsl(var(--primary));
  text-decoration: underline;
  font-weight: 500;
}

.prose strong {
  color: hsl(var(--foreground));
  font-weight: 600;
}

.prose ol > li::before {
  color: hsl(var(--muted-foreground));
}

.prose ul > li::before {
  background-color: hsl(var(--muted-foreground));
}

.prose hr {
  border-color: hsl(var(--border));
}

.prose blockquote {
  color: hsl(var(--muted-foreground));
  border-left-color: hsl(var(--border));
}

.prose blockquote p:first-of-type::before,
.prose blockquote p:last-of-type::after {
  content: "";
}

.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
  color: hsl(var(--foreground));
  font-weight: 600;
  margin-top: 2em;
  margin-bottom: 1em;
}

.prose h1 {
  font-size: 2.25em;
  line-height: 1.1111111;
}

.prose h2 {
  font-size: 1.5em;
  line-height: 1.3333333;
}

.prose h3 {
  font-size: 1.25em;
  line-height: 1.6;
}

.prose h4 {
  font-size: 1.125em;
  line-height: 1.5;
}

.prose figure figcaption {
  color: hsl(var(--muted-foreground));
}

.prose code {
  color: hsl(var(--foreground));
  font-weight: 600;
  background-color: hsl(var(--muted));
  padding: 0.2em 0.4em;
  border-radius: 0.25rem;
}

.prose pre {
  color: hsl(var(--foreground));
  background-color: hsl(var(--muted));
  border-radius: 0.5rem;
  padding: 1em;
  overflow-x: auto;
}

.prose pre code {
  background-color: transparent;
  padding: 0;
  font-weight: inherit;
}

.prose img {
  border-radius: 0.5rem;
}

.prose table {
  width: 100%;
  table-layout: auto;
  text-align: left;
  margin-top: 2em;
  margin-bottom: 2em;
  border-collapse: collapse;
}

.prose table thead {
  color: hsl(var(--foreground));
  font-weight: 600;
  border-bottom-width: 1px;
  border-bottom-color: hsl(var(--border));
}

.prose table thead th {
  vertical-align: bottom;
  padding: 0.5em;
  padding-left: 0;
}

.prose table tbody tr {
  border-bottom-width: 1px;
  border-bottom-color: hsl(var(--border));
}

.prose table tbody td {
  vertical-align: top;
  padding: 0.5em;
  padding-left: 0;
}

/* Code highlighting with Prism */
.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
  color: #6a8494;
}

.token.punctuation {
  color: #a39e9b;
}

.token.property,
.token.tag,
.token.constant,
.token.symbol,
.token.deleted {
  color: #f92672;
}

.token.boolean,
.token.number {
  color: #ae81ff;
}

.token.selector,
.token.attr-name,
.token.string,
.token.char,
.token.builtin,
.token.inserted {
  color: #a6e22e;
}

.token.operator,
.token.entity,
.token.url,
.language-css .token.string,
.style .token.string,
.token.variable {
  color: #f8f8f2;
}

.token.atrule,
.token.attr-value,
.token.function,
.token.class-name {
  color: #e6db74;
}

.token.keyword {
  color: #66d9ef;
}

.token.regex,
.token.important {
  color: #fd971f;
}

.token.important,
.token.bold {
  font-weight: bold;
}

.token.italic {
  font-style: italic;
}

.token.entity {
  cursor: help;
}

/* Dark mode adjustments */
.dark .prose {
  color: hsl(var(--foreground));
}

.dark .prose code {
  background-color: hsl(var(--secondary));
}

.dark .prose pre {
  background-color: hsl(var(--secondary));
}

/* Base styles from both globals.css files */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 47.4% 11.2%;
    
    --card: 0 0% 100%;
    --card-foreground: 222.2 47.4% 11.2%;
 
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 47.4% 11.2%;
 
    --primary: 25 100% 50%; /* #FF6B00 */
    --primary-foreground: 0 0% 100%;
 
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
 
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
 
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
 
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
 
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
 
    --radius: 0.5rem;
  }
 
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
 
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
 
    --primary: 25 100% 50%; /* #FF6B00 */
    --primary-foreground: 222.2 47.4% 11.2%;
 
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
 
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
 
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
 
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
 
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    transition-property: color, background-color, border-color;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
  
  /* Custom logo styling */
  .logo-zero {
    @apply font-black text-primary inline-block transition-transform duration-300;
    transform: rotate(-12deg);
  }
  
  .logo-zero-line {
    @apply absolute top-1/2 left-1/2 w-full h-0.5 -translate-x-1/2 -translate-y-1/2 rotate-45;
  }
  
  .dark .logo-zero-line {
    @apply bg-foreground;
  }
  
  .light .logo-zero-line {
    @apply bg-background;
  }
  
  *:hover > .logo-zero {
    transform: rotate(0deg);
  }
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .prose {
    font-size: 0.95rem;
  }
  
  .prose h1 {
    font-size: 1.875em;
  }
  
  .prose h2 {
    font-size: 1.375em;
  }
  
  .prose h3 {
    font-size: 1.125em;
  }
  
  .prose h4 {
    font-size: 1em;
  }
}


* {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Allow text selection for input fields, textareas, and other form elements */
input,
textarea,
select,
button,
[contenteditable="true"],
[contenteditable=""] {
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}

/* Allow text selection specifically for blog content */
.blog-content,
.blog-content *,
.prose,
.prose * {
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}

/* Allow text selection for code blocks */
pre,
code,
pre *,
code * {
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}

/* Allow text selection for any element with selectable class */
.selectable,
.selectable * {
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}

/* Ensure links are still clickable but text isn't selectable unless specifically allowed */
a {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Allow selection on links within blog content */
.blog-content a,
.prose a {
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}
````

## File: src/app/layout.tsx
````typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { ThemeProvider } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Mayorana',
    default: 'Mayorana - Rust, AI, and API Solutions',
  },
  description: "Empowering Innovation with Rust, AI, and API Solutions",
  // No need to configure icons here if using App Router convention
  // Next.js will automatically detect icon.ico, icon.png, apple-icon.png, etc.
  // in the app directory and generate the appropriate meta tags
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          src="https://plausible.io/js/script.outbound-links.js"
          data-domain="mayorana.ch"
          strategy="afterInteractive"
        />
        <Script id="plausible-setup" strategy="afterInteractive">
          {`
            window.plausible = window.plausible || function() { 
              (window.plausible.q = window.plausible.q || []).push(arguments) 
            }
          `}
        </Script>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
````

## File: src/app/not-found.tsx
````typescript
import Link from 'next/link';
import LayoutTemplate from '@/components/layout/LayoutTemplate';

export default function NotFound() {
  return (
    <LayoutTemplate>
      <div className="min-h-[50vh] flex flex-col items-center justify-center py-20">
        <div className="container text-center">
          <h1 className="text-6xl font-bold mb-6">404</h1>
          <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </LayoutTemplate>
  );
}
````

## File: src/app/page.tsx
````typescript
import Link from 'next/link';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import BlogList from '@/components/blog/BlogList';
// Import icons on the client side components where needed
import { getRecentPosts } from '@/lib/blog';
import ClientHomeSection from '@/components/home/ClientHomeSection';

export default function HomePage() {
  // Fetch data directly in the server component
  const recentPosts = getRecentPosts(3);

  return (
    <LayoutTemplate>
      {/* Hero Section */}
      <ClientHomeSection />

      {/* Blog Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Latest Insights</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Thoughts and tutorials on Rust, LLM integration, and AI agent development.
            </p>
          </div>
          <BlogList posts={recentPosts} />
          <div className="text-center mt-12">
            <Link
              href="/blog"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-colors"
            >
              View All Articles
            </Link>
          </div>
        </div>
      </section>
    </LayoutTemplate>
  );
}
````

## File: src/app/providers.tsx
````typescript
'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';

/**
 * Theme provider component to handle light/dark mode for App Router
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  );
}
````

## File: src/components/blog/BlogList.tsx
````typescript
'use client';

import React from 'react';
import Link from 'next/link';
import { BlogPost, formatDate } from '../../lib/blog';
import { motion } from '@/components/ui/Motion';

interface BlogListProps {
  posts: BlogPost[];
  title?: string;
  description?: string;
}

const BlogList: React.FC<BlogListProps> = ({
  posts,
  title = "Blog",
  description = "Latest insights and articles"
}) => {
  return (
    <div className="w-full">
      {(title || description) && (
        <div className="mb-12 text-center">
          {title && <h2 className="text-3xl font-bold mb-4">{title}</h2>}
          {description && <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>}
        </div>
      )}

      {posts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <motion.div
              key={post.slug}
              className="flex flex-col h-full rounded-xl border border-border overflow-hidden bg-secondary/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="p-6 flex flex-col h-full">
                <div className="mb-2">
                  <span className="text-sm font-medium text-primary">
                    {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {formatDate(post.date)}
                  </span>
                </div>

                <h3 className="text-xl font-semibold mb-3">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="hover:text-primary transition-colors"
                    prefetch={false} // Disable prefetching to prevent unnecessary loads
                  >
                    {post.title}
                  </Link>
                </h3>

                <p className="text-muted-foreground mb-6 flex-grow">
                  {post.excerpt}
                </p>

                <div className="mt-auto">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-primary font-medium hover:underline inline-flex items-center"
                    prefetch={false} // Disable prefetching to prevent unnecessary loads
                  >
                    Read More
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-border rounded-xl bg-secondary/50">
          <p className="text-lg text-muted-foreground">No posts found</p>
        </div>
      )}
    </div>
  );
};

export default BlogList;
````

## File: src/components/blog/BlogPost.tsx
````typescript
// Update your src/components/blog/BlogPost.tsx file
'use client';

import React from 'react';
import Link from 'next/link';
import { BlogPost as BlogPostType, formatDate, getCategoryBySlug } from '../../lib/blog';
import { motion } from '@/components/ui/Motion';

interface BlogPostProps {
  post: BlogPostType;
}

const BlogPost: React.FC<BlogPostProps> = ({ post }) => {
  const category = getCategoryBySlug(post.category);
  
  return (
    <article className="w-full max-w-3xl mx-auto blog-content"> {/* Added blog-content class */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-4">
          <Link 
            href={`/blog/category/${post.category}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            {category?.name || post.category}
          </Link>
          <span className="text-sm text-muted-foreground mx-2">•</span>
          <span className="text-sm text-muted-foreground">
            {formatDate(post.date)}
          </span>
          {post.readingTime && (
            <>
              <span className="text-sm text-muted-foreground mx-2">•</span>
              <span className="text-sm text-muted-foreground">
                {post.readingTime}
              </span>
            </>
          )}
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
        
        <div className="flex items-center mb-8">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
            <span className="text-primary font-medium">{post.author.charAt(0)}</span>
          </div>
          <span className="font-medium">{post.author}</span>
        </div>
      </motion.div>
      
      {post.headings && post.headings.length > 0 && (
        <motion.div
          className="mb-8 p-4 bg-secondary rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-lg font-medium mb-3">Table of Contents</h2>
          <nav>
            <ul className="space-y-2">
              {post.headings.map(heading => (
                <li 
                  key={heading.id}
                  className="ml-[calc(1rem*var(--level))]"
                  style={{ '--level': heading.level - 1 } as React.CSSProperties}
                >
                  <a 
                    href={`#${heading.id}`}
                    className="text-primary hover:underline"
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </motion.div>
      )}
      
      <motion.div
        className="prose prose-lg dark:prose-invert max-w-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
      
      {post.tags && post.tags.length > 0 && (
        <motion.div
          className="mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span 
                key={tag}
                className="bg-secondary px-3 py-1 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      )}
      
      <motion.div
        className="mt-12 pt-8 border-t border-border"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between items-center">
          <Link
            href="/blog"
            className="mb-4 sm:mb-0 inline-flex items-center text-primary font-medium hover:underline"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
            Back to Blog
          </Link>
          
          <div className="flex space-x-4">
            <button
              className="p-2 rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
              aria-label="Share on Twitter"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" 
                />
              </svg>
            </button>
            
            <button
              className="p-2 rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
              aria-label="Copy link"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                // You could add a toast notification here
              }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" 
                />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    </article>
  );
};

export default BlogPost;
````

## File: src/components/blog/CategoryFilter.tsx
````typescript
'use client';

import React from 'react';
import Link from 'next/link';
import { BlogCategory } from '../../lib/blog';

interface CategoryFilterProps {
  categories: BlogCategory[];
  currentCategory?: string;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, currentCategory }) => {
  return (
    <div className="mb-10">
      <h3 className="text-lg font-medium mb-4">Categories</h3>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/blog"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !currentCategory
              ? 'bg-primary text-white'
              : 'bg-secondary hover:bg-secondary/80 text-foreground'
          }`}
        >
          All
        </Link>
        
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/blog/category/${category.slug}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentCategory === category.slug
                ? 'bg-primary text-white'
                : 'bg-secondary hover:bg-secondary/80 text-foreground'
            }`}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
````

## File: src/components/home/ClientHomeSection.tsx
````typescript
'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from '@/components/ui/Motion';
import { FaBrain, FaCode, FaNetworkWired, FaRobot } from 'react-icons/fa';

export default function ClientHomeSection() {
  const services = [
    {
      icon: <FaCode className="h-8 w-8 text-primary" />,
      title: "Rust Training",
      description: "Expert-led Rust training for professionals and teams, covering memory safety, concurrency, and performance optimization.",
      cta: "Schedule a Training Session",
      link: "/contact?service=rust-training"
    },
    {
      icon: <FaBrain className="h-8 w-8 text-primary" />,
      title: "LLM Integration",
      description: "Seamlessly connect large language models (LLMs) to your applications for enhanced automation, chatbots, and data processing.",
      cta: "Get a Free Consultation",
      link: "/contact?service=llm-integration"
    },
    {
      icon: <FaRobot className="h-8 w-8 text-primary" />,
      title: "AI Agent Development",
      description: "Build intelligent AI agents for automation, decision-making, and process optimization.",
      cta: "Start Your Agent Project",
      link: "/contact?service=ai-agent"
    },
    {
      icon: <FaNetworkWired className="h-8 w-8 text-primary" />,
      title: "api0.ai Solutions",
      description: "Cutting-edge platform that uses advanced NLP to match user inputs to API endpoints, simplifying integrations.",
      cta: "Try api0.ai Now",
      link: "https://api0.ai"
    }
  ];

  const testimonials = [
    {
      quote: "The Rust training was transformative for our team. Clear, practical, and perfectly tailored to our needs.",
      author: "Fintech Lead, Zurich"
    },
    {
      quote: "api0.ai made our API integrations effortless. It's a game-changer for our platform.",
      author: "E-commerce CTO"
    }
  ];

  const portfolio = [
    {
      title: "Rust Training for Java Developers",
      description: "Delivering hands-on Rust training programs tailored for Java developers, enabling them to master Rust with the same fluency as Java.",
      category: "Training"
    },
    {
      title: "LLM-Powered Chatbot",
      description: "Integrated an LLM into a client's customer service platform, reducing response times by 40%.",
      category: "Integration"
    },
    {
      title: "api0.ai Implementation",
      description: "Helped an e-commerce client map user queries to product APIs, cutting integration time by 50%.",
      category: "Development"
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-secondary to-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Building Smarter Solutions with Rust, AI, and APIs
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-muted-foreground mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Specialized in Rust training, LLM integration, and AI agent development for businesses across Switzerland and beyond.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link
                href="https://api0.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 rounded-lg bg-primary text-white text-lg font-semibold hover:bg-primary/90 transform transition duration-200 hover:-translate-y-1 shadow-xl shadow-primary/20"
              >
                Discover api0.ai
              </Link>
              <Link
                href="/contact?service=rust-training"
                className="inline-flex items-center px-8 py-4 rounded-lg bg-foreground text-background text-lg font-semibold hover:bg-foreground/90 transform transition duration-200 hover:-translate-y-1"
              >
                Book a Rust Training
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What I Offer</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Specialized services that help businesses innovate and transform through modern technology solutions.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                className="flex flex-col items-center text-center p-6 rounded-xl bg-secondary/50 border border-border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="mb-6 p-4 bg-primary/10 rounded-full">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4">{service.title}</h3>
                <p className="text-muted-foreground mb-6">{service.description}</p>
                <Link
                  href={service.link}
                  className="text-primary font-medium hover:underline mt-auto"
                >
                  {service.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* api0.ai Spotlight */}
      <section className="py-20 bg-secondary">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-6">Discover api0.ai</h2>
              <p className="text-lg text-muted-foreground mb-6">
                api0.ai is my flagship solution for enterprises looking to streamline API integrations. Using advanced NLP, it intelligently matches user sentences to the right API endpoints, reducing development time and complexity.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="mr-3 text-primary">✓</div>
                  <span>Minimal setup with JavaScript SDK</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-3 text-primary">✓</div>
                  <span>Secure API key management</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-3 text-primary">✓</div>
                  <span>Scalable for enterprise needs</span>
                </li>
              </ul>
              <Link
                href="https://api0.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transform transition duration-200 hover:-translate-y-1 shadow-lg shadow-primary/20"
              >
                Explore api0.ai
              </Link>
            </motion.div>
            <motion.div
              className="relative h-80 w-full rounded-xl overflow-hidden shadow-xl"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-background/80 backdrop-blur-sm p-6 rounded-xl border border-border max-w-md">
                  <code className="text-sm block font-mono">
                    <span className="text-blue-600">const</span> <span className="text-green-600">api0</span> = <span className="text-blue-600">await</span> Api0.<span className="text-purple-600">initialize</span>({"{"}
                    <br />
                    &nbsp;&nbsp;apiKey: <span className="text-orange-600">&ldquo;your-api-key&rdquo;</span>,
                    <br />
                    &nbsp;&nbsp;domainRestriction: <span className="text-orange-600">&ldquo;yourcompany.com&rdquo;</span>
                    <br />
                    {"}"});
                    <br /><br />
                    <span className="text-blue-600">const</span> <span className="text-green-600">result</span> = <span className="text-blue-600">await</span> api0.<span className="text-purple-600">match</span>({"{"}
                    <br />
                    &nbsp;&nbsp;input: <span className="text-orange-600">&ldquo;Find products under $50&rdquo;</span>,
                    <br />
                    &nbsp;&nbsp;context: {"{"}...{"}"};
                    <br />
                    {"}"});
                  </code>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">My Work</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Showcasing successful projects and collaborations across Switzerland and beyond.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {portfolio.map((item, index) => (
              <motion.div
                key={item.title}
                className="p-6 rounded-xl bg-secondary/50 border border-border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="mb-2 text-sm font-medium text-primary">
                  {item.category}
                </div>
                <h3 className="text-xl font-semibold mb-4">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-colors"
            >
              Contact Me for Custom Solutions
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-secondary">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What Clients Say</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The experiences of those who have benefited from my services.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="p-6 rounded-xl bg-background border border-border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <div className="text-primary text-4xl mb-4">&ldquo;</div>
                <p className="text-foreground mb-6 italic">
                  {testimonial.quote}
                </p>
                <p className="text-sm font-medium text-muted-foreground">
                  — {testimonial.author}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Elevate Your Tech Stack?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Contact me for Rust training, LLM integration, or custom solutions that drive innovation and efficiency.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 rounded-lg bg-primary text-white text-lg font-semibold hover:bg-primary/90 transform transition duration-200 hover:-translate-y-1 shadow-xl shadow-primary/20"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
````

## File: src/components/layout/Footer.tsx
````typescript
import React from 'react';
import Link from 'next/link';
import { FiLinkedin, FiGithub, FiMail } from 'react-icons/fi';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerNav = [
    { label: "Home", path: "/" },
    { label: "Services", path: "/services" },
    { label: "About", path: "/about" },
    { label: "api0.ai", path: "https://api0.ai", external: true },
    { label: "Contact", path: "/contact" },
    { label: "Privacy Policy", path: "/privacy" },
    { label: "Terms of Service", path: "/terms" }
  ];

  return (
    <footer className="border-t border-border bg-background">
      <div className="container py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Column 1: Logo & Company Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl text-foreground">mayorana</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Specialized in Rust training, LLM integration, and AI agent development.
              Based in Switzerland, serving clients worldwide.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-medium text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {footerNav.slice(0, 5).map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.path}
                    target={item.external ? "_blank" : "_self"}
                    rel={item.external ? "noopener noreferrer" : ""}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Services */}
          <div>
            <h3 className="font-medium text-foreground mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/services#rust-training"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Rust Training
                </Link>
              </li>
              <li>
                <Link
                  href="/services#llm-integration"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  LLM Integration
                </Link>
              </li>
              <li>
                <Link
                  href="/services#ai-agent"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  AI Agent Development
                </Link>
              </li>
              <li>
                <Link
                  href="https://api0.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  api0.ai Solutions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Connect */}
          <div>
            <h3 className="font-medium text-foreground mb-4">Connect</h3>
            <div className="flex space-x-4 mb-4">
              <a
                href="https://linkedin.com/in/bennekrouf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <FiLinkedin className="h-5 w-5" />
              </a>
              <a
                href="https://github.com/bennekrouf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <FiGithub className="h-5 w-5" />
              </a>
              <a
                href="mailto:cont /act@mayorana.ch"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Email"
              >
                <FiMail className="h-5 w-5" />
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              Email: contact@mayorana.ch
            </p>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row md:justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} Mayorana.ch. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground mt-2 md:mt-0">
            Based in Switzerland, Serving the World
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
````

## File: src/components/layout/Layout.tsx
````typescript
import React from 'react';
import Head from 'next/head';
import Script from 'next/script';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppButton from '../ui/WhatsAppButton';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = "Mayorana | Rust, AI, and API Solutions",
  description = "Empowering Innovation with Rust, AI, and API Solutions"
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {/* Remove any script tags from Head */}
      </Head>

      {/* Use Script component for Plausible */}
      <Script
        src="https://plausible.io/js/script.hash.outbound-links.js"
        data-domain="mayorana.ch"
        strategy="afterInteractive"
      />

      {/* Use Script component for setup code */}
      <Script id="plausible-setup" strategy="afterInteractive">
        {`
          window.plausible = window.plausible || function() { 
            (window.plausible.q = window.plausible.q || []).push(arguments);
          };
        `}
      </Script>

      <Navbar />

      <main className="flex-grow">
        {children}
      </main>

      <Footer />

      {/* WhatsApp Button - only visible on mobile */}
      <WhatsAppButton />
    </div>
  );
};

export default Layout;
````

## File: src/components/layout/LayoutTemplate.tsx
````typescript
'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';

interface LayoutTemplateProps {
  children: React.ReactNode;
}

const LayoutTemplate: React.FC<LayoutTemplateProps> = ({
  children
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow">
        {children}
      </main>

      <Footer />

      {/* WhatsApp Button - only visible on mobile */}
      <WhatsAppButton />
    </div>
  );
};

export default LayoutTemplate;
````

## File: src/components/layout/Navbar.tsx
````typescript
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX, FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from 'next-themes';

const Navbar: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  // Navigation items from config
  const navItems = [
    { label: "Home", path: "/" },
    { label: "Services", path: "/services" },
    { label: "Blog", path: "/blog" },
    { label: "About", path: "/about" },
    { label: "api0.ai", path: "https://api0.ai", external: true },
    { label: "Contact", path: "/contact" }
  ];

  // After mounting, we can safely access the theme
  useEffect(() => setMounted(true), []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Helper function to check if a link is active
  const isLinkActive = (path: string) => {
    // Remove trailing slash from pathname for comparison
    const currentPath = pathname.replace(/\/$/, '');
    const normalizedPath = path.replace(/\/$/, '');
    return currentPath === normalizedPath;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            {/* Simple text logo instead of image */}
            <span className="font-bold text-xl text-foreground">mayorana</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.path}
              target={item.external ? "_blank" : "_self"}
              rel={item.external ? "noopener noreferrer" : ""}
              className={`text-sm font-medium transition-colors hover:text-primary ${isLinkActive(item.path) ? "text-primary" : "text-foreground"
                }`}
            >
              {item.label}
            </Link>
          ))}

          <button
            onClick={toggleTheme}
            className="rounded-full p-2 bg-secondary hover:bg-secondary/80 transition-colors"
            aria-label="Toggle Theme"
          >
            {mounted && theme === 'dark' ? (
              <FiSun className="h-5 w-5" />
            ) : (
              <FiMoon className="h-5 w-5" />
            )}
          </button>

          <Link
            href="/contact"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition duration-200 hover:-translate-y-1 shadow-lg shadow-primary/20"
          >
            Get Started
          </Link>
        </nav>

        {/* Mobile Navigation Toggle */}
        <div className="flex md:hidden">
          <button
            onClick={toggleTheme}
            className="mr-4 rounded-full p-2 bg-secondary hover:bg-secondary/80 transition-colors"
            aria-label="Toggle Theme"
          >
            {mounted && theme === 'dark' ? (
              <FiSun className="h-5 w-5" />
            ) : (
              <FiMoon className="h-5 w-5" />
            )}
          </button>

          <button
            onClick={toggleMenu}
            className="p-2 rounded-md text-foreground"
            aria-label="Toggle Menu"
          >
            {isOpen ? (
              <FiX className="h-6 w-6" />
            ) : (
              <FiMenu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="container py-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.path}
                target={item.external ? "_blank" : "_self"}
                rel={item.external ? "noopener noreferrer" : ""}
                className={`block px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${isLinkActive(item.path) ? "text-primary" : "text-foreground"
                  }`}
                onClick={toggleMenu}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="block px-4 py-2 mt-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90"
              onClick={toggleMenu}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
````

## File: src/components/ui/Motion.tsx
````typescript
'use client';

import { motion } from 'framer-motion';

// Re-export motion for client-side use
export { motion };
````

## File: src/components/ui/WhatsAppButton.tsx
````typescript
import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppButton: React.FC = () => {
  const whatsappNumber = "+41764837540";
  const whatsappMessage = "Hello, I'd like to learn more about your services.";
  const encodedMessage = encodeURIComponent(whatsappMessage);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  const handleClick = () => {
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('WhatsApp Contact', {
        props: {
          source: 'floating_button'
        }
      });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 md:hidden z-50">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-colors"
        aria-label="Contact via WhatsApp"
      >
        <FaWhatsapp className="h-7 w-7" />
      </a>
    </div>
  );
};

export default WhatsAppButton;
````

## File: src/components/ThemeProvider.tsx
````typescript
'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';

/**
 * Theme provider component to handle light/dark mode
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  );
}
````

## File: src/data/blog-categories.json
````json
[
  {
    "slug": "rust",
    "name": "Rust",
    "description": "Articles about Rust programming language, best practices, and performance tips."
  }
]
````

## File: src/data/blog-posts.json
````json
[
  {
    "id": "function-vs-closure-rust",
    "slug": "function-vs-closure-rust",
    "title": "What is the difference between a function and a closure in Rust?",
    "date": "2025-06-30",
    "excerpt": "Expert technical discussion on functions vs closures in Rust, covering ownership, traits, lifetimes, and performance implications.",
    "content": "\n# What is the difference between a function and a closure in Rust?\n\nUnderstanding the distinction between functions and closures is fundamental to mastering Rust's ownership system and performance characteristics.\n\n## Key Differences\n\n| Functions | Closures |\n|-----------|----------|\n| Defined at compile time with `fn` | Anonymous, created at runtime |\n| Static dispatch (no runtime overhead) | May involve dynamic dispatch (trait objects) |\n| Cannot capture environment variables | Can capture variables from enclosing scope |\n| Always have a known type | Type is unique and inferred (each closure has its own type) |\n\n## Underlying Mechanics\n\n### Closures Are Structs + Traits\n\nRust models closures as structs that:\n- Store captured variables (as fields)\n- Implement one of the closure traits (`Fn`, `FnMut`, or `FnOnce`)\n\nFor example, this closure:\n```rust\nlet x = 42;\nlet closure = |y| x + y;\n```\n\nIs desugared to something like:\n```rust\nstruct AnonymousClosure {\n    x: i32,  // Captured variable\n}\n\nimpl FnOnce<(i32,)> for AnonymousClosure {\n    type Output = i32;\n    fn call_once(self, y: i32) -> i32 {\n        self.x + y\n    }\n}\n```\n\n### Dynamic Dispatch (Vtables)\n\nWhen closures are trait objects (e.g., `Box<dyn Fn(i32) -> i32>`), Rust uses vtables for dynamic dispatch:\n- **Vtable**: A lookup table storing function pointers, enabling runtime polymorphism\n- **Overhead**: Indirect function calls (~2–3x slower than static dispatch)\n\n## When to Use Each\n\nUse **Functions** when:\n- You need zero-cost abstractions (e.g., mathematical operations)\n- No environment capture is required\n\n```rust\nfn add(a: i32, b: i32) -> i32 { a + b }\n```\n\nUse **Closures** when:\n- You need to capture state from the environment\n- Writing short, ad-hoc logic (e.g., callbacks, iterators)\n\n```rust\nlet threshold = 10;\nlet filter = |x: i32| x > threshold;  // Captures `threshold`\n```\n\n## Performance Considerations\n\n| Scenario | Static Dispatch (Closures) | Dynamic Dispatch (dyn Fn) |\n|----------|----------------------------|----------------------------|\n| Speed | Fast (inlined) | Slower (vtable lookup) |\n| Memory | No overhead | Vtable + fat pointer |\n| Use Case | Hot loops, embedded | Heterogeneous callbacks |\n\n## Example: Static vs. Dynamic Dispatch\n\n```rust\n// Static dispatch (compile-time)\nfn static_call<F: Fn(i32) -> i32>(f: F, x: i32) -> i32 {\n    f(x)  // Inlined\n}\n\n// Dynamic dispatch (runtime)\nfn dynamic_call(f: &dyn Fn(i32) -> i32, x: i32) -> i32 {\n    f(x)  // Vtable lookup\n}\n```\n\n## Key Takeaways\n\n✅ **Functions**: Predictable performance, no captures  \n✅ **Closures**: Flexible, capture environment, but may involve vtables  \n🚀 Prefer static dispatch (`impl Fn`) unless you need trait objects\n\n**Try This:** What happens if a closure captures a mutable reference and is called twice?  \n**Answer:** The borrow checker ensures exclusive access—it won't compile unless the first call completes!\n",
    "contentHtml": "<h1>What is the difference between a function and a closure in Rust?</h1>\n<p>Understanding the distinction between functions and closures is fundamental to mastering Rust&#39;s ownership system and performance characteristics.</p>\n<h2>Key Differences</h2>\n<table>\n<thead>\n<tr>\n<th>Functions</th>\n<th>Closures</th>\n</tr>\n</thead>\n<tbody><tr>\n<td>Defined at compile time with <code>fn</code></td>\n<td>Anonymous, created at runtime</td>\n</tr>\n<tr>\n<td>Static dispatch (no runtime overhead)</td>\n<td>May involve dynamic dispatch (trait objects)</td>\n</tr>\n<tr>\n<td>Cannot capture environment variables</td>\n<td>Can capture variables from enclosing scope</td>\n</tr>\n<tr>\n<td>Always have a known type</td>\n<td>Type is unique and inferred (each closure has its own type)</td>\n</tr>\n</tbody></table>\n<h2>Underlying Mechanics</h2>\n<h3>Closures Are Structs + Traits</h3>\n<p>Rust models closures as structs that:</p>\n<ul>\n<li>Store captured variables (as fields)</li>\n<li>Implement one of the closure traits (<code>Fn</code>, <code>FnMut</code>, or <code>FnOnce</code>)</li>\n</ul>\n<p>For example, this closure:</p>\n<pre><code class=\"language-rust\">let x = 42;\nlet closure = |y| x + y;\n</code></pre>\n<p>Is desugared to something like:</p>\n<pre><code class=\"language-rust\">struct AnonymousClosure {\n    x: i32,  // Captured variable\n}\n\nimpl FnOnce&lt;(i32,)&gt; for AnonymousClosure {\n    type Output = i32;\n    fn call_once(self, y: i32) -&gt; i32 {\n        self.x + y\n    }\n}\n</code></pre>\n<h3>Dynamic Dispatch (Vtables)</h3>\n<p>When closures are trait objects (e.g., <code>Box&lt;dyn Fn(i32) -&gt; i32&gt;</code>), Rust uses vtables for dynamic dispatch:</p>\n<ul>\n<li><strong>Vtable</strong>: A lookup table storing function pointers, enabling runtime polymorphism</li>\n<li><strong>Overhead</strong>: Indirect function calls (~2–3x slower than static dispatch)</li>\n</ul>\n<h2>When to Use Each</h2>\n<p>Use <strong>Functions</strong> when:</p>\n<ul>\n<li>You need zero-cost abstractions (e.g., mathematical operations)</li>\n<li>No environment capture is required</li>\n</ul>\n<pre><code class=\"language-rust\">fn add(a: i32, b: i32) -&gt; i32 { a + b }\n</code></pre>\n<p>Use <strong>Closures</strong> when:</p>\n<ul>\n<li>You need to capture state from the environment</li>\n<li>Writing short, ad-hoc logic (e.g., callbacks, iterators)</li>\n</ul>\n<pre><code class=\"language-rust\">let threshold = 10;\nlet filter = |x: i32| x &gt; threshold;  // Captures `threshold`\n</code></pre>\n<h2>Performance Considerations</h2>\n<table>\n<thead>\n<tr>\n<th>Scenario</th>\n<th>Static Dispatch (Closures)</th>\n<th>Dynamic Dispatch (dyn Fn)</th>\n</tr>\n</thead>\n<tbody><tr>\n<td>Speed</td>\n<td>Fast (inlined)</td>\n<td>Slower (vtable lookup)</td>\n</tr>\n<tr>\n<td>Memory</td>\n<td>No overhead</td>\n<td>Vtable + fat pointer</td>\n</tr>\n<tr>\n<td>Use Case</td>\n<td>Hot loops, embedded</td>\n<td>Heterogeneous callbacks</td>\n</tr>\n</tbody></table>\n<h2>Example: Static vs. Dynamic Dispatch</h2>\n<pre><code class=\"language-rust\">// Static dispatch (compile-time)\nfn static_call&lt;F: Fn(i32) -&gt; i32&gt;(f: F, x: i32) -&gt; i32 {\n    f(x)  // Inlined\n}\n\n// Dynamic dispatch (runtime)\nfn dynamic_call(f: &amp;dyn Fn(i32) -&gt; i32, x: i32) -&gt; i32 {\n    f(x)  // Vtable lookup\n}\n</code></pre>\n<h2>Key Takeaways</h2>\n<p>✅ <strong>Functions</strong>: Predictable performance, no captures<br>✅ <strong>Closures</strong>: Flexible, capture environment, but may involve vtables<br>🚀 Prefer static dispatch (<code>impl Fn</code>) unless you need trait objects</p>\n<p><strong>Try This:</strong> What happens if a closure captures a mutable reference and is called twice?<br><strong>Answer:</strong> The borrow checker ensures exclusive access—it won&#39;t compile unless the first call completes!</p>\n",
    "author": "mayo",
    "category": "rust",
    "tags": [
      "rust",
      "functions",
      "closures",
      "traits",
      "ownership"
    ],
    "readingTime": "3 min",
    "seo": {
      "title": "What is the difference between a function and a closure in Rust?",
      "description": "Expert technical discussion on functions vs closures in Rust, covering ownership, traits, lifetimes, and performance implications.",
      "keywords": [
        "rust",
        "functions",
        "closures",
        "traits",
        "ownership"
      ]
    },
    "headings": [
      {
        "id": "what-is-the-difference-between-a-function-and-a-closure-in-rust",
        "text": "What is the difference between a function and a closure in Rust?",
        "level": 1
      },
      {
        "id": "key-differences",
        "text": "Key Differences",
        "level": 2
      },
      {
        "id": "underlying-mechanics",
        "text": "Underlying Mechanics",
        "level": 2
      },
      {
        "id": "closures-are-structs-traits",
        "text": "Closures Are Structs + Traits",
        "level": 3
      },
      {
        "id": "dynamic-dispatch-vtables",
        "text": "Dynamic Dispatch (Vtables)",
        "level": 3
      },
      {
        "id": "when-to-use-each",
        "text": "When to Use Each",
        "level": 2
      },
      {
        "id": "performance-considerations",
        "text": "Performance Considerations",
        "level": 2
      },
      {
        "id": "example-static-vs-dynamic-dispatch",
        "text": "Example: Static vs. Dynamic Dispatch",
        "level": 2
      },
      {
        "id": "key-takeaways",
        "text": "Key Takeaways",
        "level": 2
      }
    ]
  },
  {
    "id": "vec-new-vs-with-capacity",
    "slug": "vec-new-vs-with-capacity",
    "title": "What is the difference between Vec::new() and Vec::with_capacity()? When would you use each?",
    "date": "2025-06-30",
    "excerpt": "An expert technical discussion on Vec allocation strategies in Rust, comparing Vec::new() and Vec::with_capacity() for optimal performance.",
    "content": "\n# What is the difference between Vec::new() and Vec::with_capacity()? When would you use each?\n\nUnderstanding Vec allocation strategies is crucial for writing performant Rust code, especially when dealing with collections and iterators.\n\n## Key Differences\n\n| `Vec::new()` | `Vec::with_capacity(n)` |\n|--------------|-------------------------|\n| Creates an empty Vec with no pre-allocated space | Creates an empty Vec with space for n elements |\n| Initial capacity is 0 (allocates on first push) | Initial capacity is exactly n (no early allocations) |\n| Grows dynamically (may reallocate multiple times) | Avoids reallocation until len() > n |\n\n## When to Use Each\n\nUse `Vec::new()` when:\n- The number of elements is unknown or small\n- You want simplicity (e.g., short-lived vectors)\n\n```rust\nlet mut v = Vec::new(); // Good for ad-hoc usage\nv.push(1);\n```\n\nUse `Vec::with_capacity(n)` when:\n- You know the exact or maximum number of elements upfront\n- Optimizing for performance (avoids reallocations)\n\n```rust\nlet mut v = Vec::with_capacity(1000); // Pre-allocate for 1000 items\nfor i in 0..1000 {\n    v.push(i); // No reallocation happens\n}\n```\n\n## Performance Impact\n\n`Vec::new()` may trigger multiple reallocations as it grows (e.g., starts at 0, then 4, 8, 16, ...).\n`Vec::with_capacity(n)` guarantees one allocation upfront (if n is correct).\n\n## Example Benchmark\n\n```rust\nuse std::time::Instant;\n\nfn main() {\n    let start = Instant::now();\n    let mut v1 = Vec::new();\n    for i in 0..1_000_000 {\n        v1.push(i); // Reallocates ~20 times\n    }\n    println!(\"Vec::new(): {:?}\", start.elapsed());\n\n    let start = Instant::now();\n    let mut v2 = Vec::with_capacity(1_000_000);\n    for i in 0..1_000_000 {\n        v2.push(i); // No reallocations\n    }\n    println!(\"Vec::with_capacity(): {:?}\", start.elapsed());\n}\n```\n\nOutput (typical):\n```\nVec::new(): 1.2ms\nVec::with_capacity(): 0.3ms  // 4x faster\n```\n\n## Advanced Notes\n\n- `shrink_to_fit()`: Reduces excess capacity (e.g., after removing elements)\n- `vec![]` macro: Uses with_capacity implicitly for literals (e.g., vec![1, 2, 3])\n\n## Key Takeaways\n\n✅ Default to `Vec::new()` for simplicity.  \n✅ Use `with_capacity(n)` when:\n- You know the size upfront\n- Performance is critical (e.g., hot loops)\n\n**Try This:** What happens if you push beyond the pre-allocated capacity?  \n**Answer:** The Vec grows automatically (like `Vec::new()`), but only after exceeding n.\n",
    "contentHtml": "<h1>What is the difference between Vec::new() and Vec::with_capacity()? When would you use each?</h1>\n<p>Understanding Vec allocation strategies is crucial for writing performant Rust code, especially when dealing with collections and iterators.</p>\n<h2>Key Differences</h2>\n<table>\n<thead>\n<tr>\n<th><code>Vec::new()</code></th>\n<th><code>Vec::with_capacity(n)</code></th>\n</tr>\n</thead>\n<tbody><tr>\n<td>Creates an empty Vec with no pre-allocated space</td>\n<td>Creates an empty Vec with space for n elements</td>\n</tr>\n<tr>\n<td>Initial capacity is 0 (allocates on first push)</td>\n<td>Initial capacity is exactly n (no early allocations)</td>\n</tr>\n<tr>\n<td>Grows dynamically (may reallocate multiple times)</td>\n<td>Avoids reallocation until len() &gt; n</td>\n</tr>\n</tbody></table>\n<h2>When to Use Each</h2>\n<p>Use <code>Vec::new()</code> when:</p>\n<ul>\n<li>The number of elements is unknown or small</li>\n<li>You want simplicity (e.g., short-lived vectors)</li>\n</ul>\n<pre><code class=\"language-rust\">let mut v = Vec::new(); // Good for ad-hoc usage\nv.push(1);\n</code></pre>\n<p>Use <code>Vec::with_capacity(n)</code> when:</p>\n<ul>\n<li>You know the exact or maximum number of elements upfront</li>\n<li>Optimizing for performance (avoids reallocations)</li>\n</ul>\n<pre><code class=\"language-rust\">let mut v = Vec::with_capacity(1000); // Pre-allocate for 1000 items\nfor i in 0..1000 {\n    v.push(i); // No reallocation happens\n}\n</code></pre>\n<h2>Performance Impact</h2>\n<p><code>Vec::new()</code> may trigger multiple reallocations as it grows (e.g., starts at 0, then 4, 8, 16, ...).\n<code>Vec::with_capacity(n)</code> guarantees one allocation upfront (if n is correct).</p>\n<h2>Example Benchmark</h2>\n<pre><code class=\"language-rust\">use std::time::Instant;\n\nfn main() {\n    let start = Instant::now();\n    let mut v1 = Vec::new();\n    for i in 0..1_000_000 {\n        v1.push(i); // Reallocates ~20 times\n    }\n    println!(&quot;Vec::new(): {:?}&quot;, start.elapsed());\n\n    let start = Instant::now();\n    let mut v2 = Vec::with_capacity(1_000_000);\n    for i in 0..1_000_000 {\n        v2.push(i); // No reallocations\n    }\n    println!(&quot;Vec::with_capacity(): {:?}&quot;, start.elapsed());\n}\n</code></pre>\n<p>Output (typical):</p>\n<pre><code>Vec::new(): 1.2ms\nVec::with_capacity(): 0.3ms  // 4x faster\n</code></pre>\n<h2>Advanced Notes</h2>\n<ul>\n<li><code>shrink_to_fit()</code>: Reduces excess capacity (e.g., after removing elements)</li>\n<li><code>vec![]</code> macro: Uses with_capacity implicitly for literals (e.g., vec![1, 2, 3])</li>\n</ul>\n<h2>Key Takeaways</h2>\n<p>✅ Default to <code>Vec::new()</code> for simplicity.<br>✅ Use <code>with_capacity(n)</code> when:</p>\n<ul>\n<li>You know the size upfront</li>\n<li>Performance is critical (e.g., hot loops)</li>\n</ul>\n<p><strong>Try This:</strong> What happens if you push beyond the pre-allocated capacity?<br><strong>Answer:</strong> The Vec grows automatically (like <code>Vec::new()</code>), but only after exceeding n.</p>\n",
    "author": "mayo",
    "category": "rust",
    "tags": [
      "rust",
      "collections",
      "performance",
      "vec",
      "iterators"
    ],
    "readingTime": "2 min",
    "seo": {
      "title": "What is the difference between Vec::new() and Vec::with_capacity()? When would you use each?",
      "description": "An expert technical discussion on Vec allocation strategies in Rust, comparing Vec::new() and Vec::with_capacity() for optimal performance.",
      "keywords": [
        "rust",
        "collections",
        "performance",
        "vec",
        "iterators"
      ]
    },
    "headings": [
      {
        "id": "what-is-the-difference-between-vecnew-and-vecwithcapacity-when-would-you-use-each",
        "text": "What is the difference between Vec::new() and Vec::with_capacity()? When would you use each?",
        "level": 1
      },
      {
        "id": "key-differences",
        "text": "Key Differences",
        "level": 2
      },
      {
        "id": "when-to-use-each",
        "text": "When to Use Each",
        "level": 2
      },
      {
        "id": "performance-impact",
        "text": "Performance Impact",
        "level": 2
      },
      {
        "id": "example-benchmark",
        "text": "Example Benchmark",
        "level": 2
      },
      {
        "id": "advanced-notes",
        "text": "Advanced Notes",
        "level": 2
      },
      {
        "id": "key-takeaways",
        "text": "Key Takeaways",
        "level": 2
      }
    ]
  },
  {
    "id": "memory-layout-optimization-rust",
    "slug": "memory-layout-optimization-rust",
    "title": "Memory Layout Optimization: How would you use Rust's repr attribute to optimize the memory layout of a struct for cache efficiency, and what trade-offs might you consider when choosing between repr(C) and repr(packed)?",
    "date": "2025-06-30",
    "excerpt": "Expert technical discussion on low-level memory optimization in Rust, covering repr attributes, cache efficiency, and performance trade-offs for lead developers.",
    "content": "\n# Memory Layout Optimization: How would you use Rust's repr attribute to optimize the memory layout of a struct for cache efficiency?\n\nThe `repr` attribute controls struct memory layout, which is critical for low-level optimization in high-throughput systems where cache locality drives performance.\n\n## How They Work\n\n**`repr(C)`**: Enforces C-compatible layout with fields ordered sequentially as declared, adding padding to align each field to its natural alignment (e.g., `u32` aligns to 4 bytes). Ensures predictable interoperability and typically aligns well with CPU cache lines (often 64 bytes).\n\n**`repr(packed)`**: Removes all padding, packing fields tightly together regardless of alignment. Minimizes memory usage but can lead to unaligned memory accesses, which are slower on most architectures.\n\n## Optimization for Cache Locality\n\nWith `repr(C)`, the compiler adds padding to align fields, increasing struct size but ensuring efficient, aligned access:\n\n```rust\n#[repr(C)]\nstruct Data {\n    flag: bool,   // 1 byte + 3 bytes padding (on 32-bit alignment)\n    value: u32,   // 4 bytes\n    counter: u64, // 8 bytes\n}\n// Size: 16 bytes (due to padding for alignment)\n```\n\nHere, `repr(C)` ensures `value` and `counter` are aligned—great for loops accessing `value` repeatedly. Aligned reads are fast and cache-friendly, but padding after `flag` wastes space.\n\nWith `repr(packed)`:\n\n```rust\n#[repr(packed)]\nstruct PackedData {\n    flag: bool,   // 1 byte\n    value: u32,   // 4 bytes, unaligned\n    counter: u64, // 8 bytes, unaligned\n}\n// Size: 13 bytes (no padding)\n```\n\nThis shrinks size to 13 bytes, ideal for tight memory constraints, but unaligned accesses to `value` and `counter` incur significant performance penalties.\n\n## Trade-Offs\n\n| Aspect | `repr(C)` | `repr(packed)` |\n|--------|-----------|----------------|\n| **Performance** | Fast aligned access, cache-efficient | Slower unaligned access penalties |\n| **Memory Usage** | Larger due to padding | Minimal footprint |\n| **Portability** | Safe across platforms | Risk of UB or panics on strict architectures |\n\n- **Performance**: `repr(C)` wins for speed—aligned access is faster and cache-efficient\n- **Memory Usage**: `repr(packed)` reduces footprint, critical for large arrays or tight constraints\n- **Portability**: `repr(C)` is safer; `repr(packed)` risks undefined behavior with unsafe dereferencing\n\n## Example Scenario\n\nReal-time packet parser in a network server processing millions of packets per second:\n\n```rust\n#[repr(C)]\nstruct Packet {\n    header: u8,   // 1 byte + 3 padding\n    id: u32,      // 4 bytes\n    payload: u64, // 8 bytes\n}\n```\n\nWith `repr(C)`, size is 16 bytes, and `id`/`payload` are aligned, speeding up field access in tight loops checking `id`. Cache locality is decent since the struct fits in a 64-byte cache line.\n\nIf using `repr(packed)` (13 bytes), I'd save 3 bytes per packet, but unaligned `id` and `payload` accesses could halve throughput due to penalties—unacceptable for this workload.\n\n**Choice**: `repr(C)` for performance-critical code. Consider reordering fields (`payload`, `id`, `header`) to group hot fields together.\n\n**Alternative scenario**: Serializing thousands of tiny structs to disk with infrequent access—`repr(packed)` might make sense to minimize storage, accepting slower deserialization.\n\n## Advanced Considerations\n\n- Use profiling tools like `perf` to confirm cache miss reductions\n- Consider `#[repr(C, packed)]` for C-compatible but packed layout\n- Field reordering can optimize cache line usage without changing `repr`\n- Test trade-offs on target hardware, especially ARM vs x86_64\n\n## Key Takeaways\n\n✅ **`repr(C)`**: Choose for performance-critical code where cache efficiency matters  \n✅ **`repr(packed)`**: Use for memory-constrained scenarios with infrequent access  \n🚀 Profile cache performance before and after to validate optimizations\n\n**Try This:** What happens if you access a field in a `repr(packed)` struct through a raw pointer?  \n**Answer:** Unaligned access through raw pointers can cause panics on strict architectures or performance penalties—always measure on your target platform!\n",
    "contentHtml": "<h1>Memory Layout Optimization: How would you use Rust&#39;s repr attribute to optimize the memory layout of a struct for cache efficiency?</h1>\n<p>The <code>repr</code> attribute controls struct memory layout, which is critical for low-level optimization in high-throughput systems where cache locality drives performance.</p>\n<h2>How They Work</h2>\n<p><strong><code>repr(C)</code></strong>: Enforces C-compatible layout with fields ordered sequentially as declared, adding padding to align each field to its natural alignment (e.g., <code>u32</code> aligns to 4 bytes). Ensures predictable interoperability and typically aligns well with CPU cache lines (often 64 bytes).</p>\n<p><strong><code>repr(packed)</code></strong>: Removes all padding, packing fields tightly together regardless of alignment. Minimizes memory usage but can lead to unaligned memory accesses, which are slower on most architectures.</p>\n<h2>Optimization for Cache Locality</h2>\n<p>With <code>repr(C)</code>, the compiler adds padding to align fields, increasing struct size but ensuring efficient, aligned access:</p>\n<pre><code class=\"language-rust\">#[repr(C)]\nstruct Data {\n    flag: bool,   // 1 byte + 3 bytes padding (on 32-bit alignment)\n    value: u32,   // 4 bytes\n    counter: u64, // 8 bytes\n}\n// Size: 16 bytes (due to padding for alignment)\n</code></pre>\n<p>Here, <code>repr(C)</code> ensures <code>value</code> and <code>counter</code> are aligned—great for loops accessing <code>value</code> repeatedly. Aligned reads are fast and cache-friendly, but padding after <code>flag</code> wastes space.</p>\n<p>With <code>repr(packed)</code>:</p>\n<pre><code class=\"language-rust\">#[repr(packed)]\nstruct PackedData {\n    flag: bool,   // 1 byte\n    value: u32,   // 4 bytes, unaligned\n    counter: u64, // 8 bytes, unaligned\n}\n// Size: 13 bytes (no padding)\n</code></pre>\n<p>This shrinks size to 13 bytes, ideal for tight memory constraints, but unaligned accesses to <code>value</code> and <code>counter</code> incur significant performance penalties.</p>\n<h2>Trade-Offs</h2>\n<table>\n<thead>\n<tr>\n<th>Aspect</th>\n<th><code>repr(C)</code></th>\n<th><code>repr(packed)</code></th>\n</tr>\n</thead>\n<tbody><tr>\n<td><strong>Performance</strong></td>\n<td>Fast aligned access, cache-efficient</td>\n<td>Slower unaligned access penalties</td>\n</tr>\n<tr>\n<td><strong>Memory Usage</strong></td>\n<td>Larger due to padding</td>\n<td>Minimal footprint</td>\n</tr>\n<tr>\n<td><strong>Portability</strong></td>\n<td>Safe across platforms</td>\n<td>Risk of UB or panics on strict architectures</td>\n</tr>\n</tbody></table>\n<ul>\n<li><strong>Performance</strong>: <code>repr(C)</code> wins for speed—aligned access is faster and cache-efficient</li>\n<li><strong>Memory Usage</strong>: <code>repr(packed)</code> reduces footprint, critical for large arrays or tight constraints</li>\n<li><strong>Portability</strong>: <code>repr(C)</code> is safer; <code>repr(packed)</code> risks undefined behavior with unsafe dereferencing</li>\n</ul>\n<h2>Example Scenario</h2>\n<p>Real-time packet parser in a network server processing millions of packets per second:</p>\n<pre><code class=\"language-rust\">#[repr(C)]\nstruct Packet {\n    header: u8,   // 1 byte + 3 padding\n    id: u32,      // 4 bytes\n    payload: u64, // 8 bytes\n}\n</code></pre>\n<p>With <code>repr(C)</code>, size is 16 bytes, and <code>id</code>/<code>payload</code> are aligned, speeding up field access in tight loops checking <code>id</code>. Cache locality is decent since the struct fits in a 64-byte cache line.</p>\n<p>If using <code>repr(packed)</code> (13 bytes), I&#39;d save 3 bytes per packet, but unaligned <code>id</code> and <code>payload</code> accesses could halve throughput due to penalties—unacceptable for this workload.</p>\n<p><strong>Choice</strong>: <code>repr(C)</code> for performance-critical code. Consider reordering fields (<code>payload</code>, <code>id</code>, <code>header</code>) to group hot fields together.</p>\n<p><strong>Alternative scenario</strong>: Serializing thousands of tiny structs to disk with infrequent access—<code>repr(packed)</code> might make sense to minimize storage, accepting slower deserialization.</p>\n<h2>Advanced Considerations</h2>\n<ul>\n<li>Use profiling tools like <code>perf</code> to confirm cache miss reductions</li>\n<li>Consider <code>#[repr(C, packed)]</code> for C-compatible but packed layout</li>\n<li>Field reordering can optimize cache line usage without changing <code>repr</code></li>\n<li>Test trade-offs on target hardware, especially ARM vs x86_64</li>\n</ul>\n<h2>Key Takeaways</h2>\n<p>✅ <strong><code>repr(C)</code></strong>: Choose for performance-critical code where cache efficiency matters<br>✅ <strong><code>repr(packed)</code></strong>: Use for memory-constrained scenarios with infrequent access<br>🚀 Profile cache performance before and after to validate optimizations</p>\n<p><strong>Try This:</strong> What happens if you access a field in a <code>repr(packed)</code> struct through a raw pointer?<br><strong>Answer:</strong> Unaligned access through raw pointers can cause panics on strict architectures or performance penalties—always measure on your target platform!</p>\n",
    "author": "mayo",
    "category": "rust",
    "tags": [
      "rust",
      "optimization",
      "memory",
      "performance",
      "cache"
    ],
    "readingTime": "3 min",
    "seo": {
      "title": "Memory Layout Optimization: How would you use Rust's repr attribute to optimize the memory layout of a struct for cache efficiency, and what trade-offs might you consider when choosing between repr(C) and repr(packed)?",
      "description": "Expert technical discussion on low-level memory optimization in Rust, covering repr attributes, cache efficiency, and performance trade-offs for lead developers.",
      "keywords": [
        "rust",
        "optimization",
        "memory",
        "performance",
        "cache"
      ]
    },
    "headings": [
      {
        "id": "memory-layout-optimization-how-would-you-use-rusts-repr-attribute-to-optimize-the-memory-layout-of-a-struct-for-cache-efficiency",
        "text": "Memory Layout Optimization: How would you use Rust's repr attribute to optimize the memory layout of a struct for cache efficiency?",
        "level": 1
      },
      {
        "id": "how-they-work",
        "text": "How They Work",
        "level": 2
      },
      {
        "id": "optimization-for-cache-locality",
        "text": "Optimization for Cache Locality",
        "level": 2
      },
      {
        "id": "trade-offs",
        "text": "Trade-Offs",
        "level": 2
      },
      {
        "id": "example-scenario",
        "text": "Example Scenario",
        "level": 2
      },
      {
        "id": "advanced-considerations",
        "text": "Advanced Considerations",
        "level": 2
      },
      {
        "id": "key-takeaways",
        "text": "Key Takeaways",
        "level": 2
      }
    ]
  },
  {
    "id": "string-vs-str-rust",
    "slug": "string-vs-str-rust",
    "title": "What is the difference between String and str in Rust? When would you use each?",
    "date": "2025-06-30",
    "excerpt": "Expert technical discussion on String vs str in Rust, covering memory management, ownership, and when to use each type.",
    "content": "\n# What is the difference between String and str in Rust? When would you use each?\n\nUnderstanding the distinction between `String` and `str` is fundamental to effective memory management and ownership in Rust.\n\n## Key Differences\n\n| `String` | `str` (usually `&str`) |\n|----------|------------------------|\n| Growable, heap-allocated UTF-8 string | Immutable, fixed-size view into UTF-8 string |\n| Owned type (manages its memory) | Borrowed type (does not own memory) |\n| Mutable (can modify content) | Immutable view |\n| Created using `String::from(\"...\")` or `\"...\".to_string()` | From string literals (`\"hello\"`) or borrowed from `String` (`&my_string`) |\n\n## Memory Layout\n\n**`String`**: Stores data on the heap with three components:\n- Pointer to heap buffer\n- Length (current size)\n- Capacity (allocated size)\n\n**`&str`**: A \"fat pointer\" containing:\n- Pointer to string data (heap, stack, or static memory)\n- Length of the slice\n\n## When to Use Each\n\nUse **`String`** when:\n- You need to modify or grow the string\n- You need ownership (e.g., returning from a function)\n- Building strings dynamically\n\n```rust\nlet mut owned = String::from(\"hello\");\nowned.push_str(\" world\");  // Mutation requires String\n```\n\nUse **`&str`** when:\n- You only need a read-only view of a string\n- Working with function parameters (avoids unnecessary allocations)\n- Handling string literals (stored in read-only memory)\n\n```rust\nfn process_str(s: &str) -> usize {\n    s.len()  // Read-only access\n}\n```\n\n## Example: Ownership vs Borrowing\n\n```rust\nfn process_string(s: String) { /* takes ownership */ }\nfn process_str(s: &str)      { /* borrows */ }\n\nfn main() {\n    let heap_str = String::from(\"hello\");\n    let static_str = \"world\";\n    \n    process_string(heap_str);  // Ownership moved\n    process_str(static_str);   // Borrowed\n    \n    // heap_str no longer accessible here\n    // static_str still accessible\n}\n```\n\n## Performance Considerations\n\n**Function Parameters**:\n```rust\n// Inefficient - forces allocation\nfn bad(s: String) -> usize { s.len() }\n\n// Efficient - accepts both String and &str\nfn good(s: &str) -> usize { s.len() }\n\n// Usage\nlet owned = String::from(\"test\");\ngood(&owned);  // Deref coercion: String -> &str\ngood(\"literal\");  // Direct &str\n```\n\n**Memory Allocation**:\n- `String` allocates on heap, requires deallocation\n- `&str` to literals points to program binary (zero allocation)\n- `&str` from `String` shares existing allocation\n\n## Common Patterns\n\n**Return Owned Data**:\n```rust\nfn build_message(name: &str) -> String {\n    format!(\"Hello, {}!\", name)  // Returns owned String\n}\n```\n\n**Accept Flexible Input**:\n```rust\nfn analyze(text: &str) -> Analysis {\n    // Works with both String and &str inputs\n    text.chars().count()\n}\n```\n\n**Avoid Unnecessary Clones**:\n```rust\n// Bad - unnecessary allocation\nfn process_bad(s: &str) -> String {\n    s.to_string()  // Only if you actually need owned data\n}\n\n// Good - work with borrowed data when possible\nfn process_good(s: &str) -> &str {\n    s.trim()  // Returns slice of original\n}\n```\n\n## Key Takeaways\n\n✅ **`String`**: Owned, mutable, heap-allocated  \n✅ **`str`**: Borrowed, immutable, flexible (heap/stack/static)  \n🚀 Prefer `&str` for function parameters unless you need ownership or mutation\n\n**Try This:** What happens when you call `.to_string()` on a string literal vs a `String`?  \n**Answer:** Literal creates new heap allocation; `String` creates a clone of existing heap data—both allocate, but the source differs!\n",
    "contentHtml": "<h1>What is the difference between String and str in Rust? When would you use each?</h1>\n<p>Understanding the distinction between <code>String</code> and <code>str</code> is fundamental to effective memory management and ownership in Rust.</p>\n<h2>Key Differences</h2>\n<table>\n<thead>\n<tr>\n<th><code>String</code></th>\n<th><code>str</code> (usually <code>&amp;str</code>)</th>\n</tr>\n</thead>\n<tbody><tr>\n<td>Growable, heap-allocated UTF-8 string</td>\n<td>Immutable, fixed-size view into UTF-8 string</td>\n</tr>\n<tr>\n<td>Owned type (manages its memory)</td>\n<td>Borrowed type (does not own memory)</td>\n</tr>\n<tr>\n<td>Mutable (can modify content)</td>\n<td>Immutable view</td>\n</tr>\n<tr>\n<td>Created using <code>String::from(&quot;...&quot;)</code> or <code>&quot;...&quot;.to_string()</code></td>\n<td>From string literals (<code>&quot;hello&quot;</code>) or borrowed from <code>String</code> (<code>&amp;my_string</code>)</td>\n</tr>\n</tbody></table>\n<h2>Memory Layout</h2>\n<p><strong><code>String</code></strong>: Stores data on the heap with three components:</p>\n<ul>\n<li>Pointer to heap buffer</li>\n<li>Length (current size)</li>\n<li>Capacity (allocated size)</li>\n</ul>\n<p><strong><code>&amp;str</code></strong>: A &quot;fat pointer&quot; containing:</p>\n<ul>\n<li>Pointer to string data (heap, stack, or static memory)</li>\n<li>Length of the slice</li>\n</ul>\n<h2>When to Use Each</h2>\n<p>Use <strong><code>String</code></strong> when:</p>\n<ul>\n<li>You need to modify or grow the string</li>\n<li>You need ownership (e.g., returning from a function)</li>\n<li>Building strings dynamically</li>\n</ul>\n<pre><code class=\"language-rust\">let mut owned = String::from(&quot;hello&quot;);\nowned.push_str(&quot; world&quot;);  // Mutation requires String\n</code></pre>\n<p>Use <strong><code>&amp;str</code></strong> when:</p>\n<ul>\n<li>You only need a read-only view of a string</li>\n<li>Working with function parameters (avoids unnecessary allocations)</li>\n<li>Handling string literals (stored in read-only memory)</li>\n</ul>\n<pre><code class=\"language-rust\">fn process_str(s: &amp;str) -&gt; usize {\n    s.len()  // Read-only access\n}\n</code></pre>\n<h2>Example: Ownership vs Borrowing</h2>\n<pre><code class=\"language-rust\">fn process_string(s: String) { /* takes ownership */ }\nfn process_str(s: &amp;str)      { /* borrows */ }\n\nfn main() {\n    let heap_str = String::from(&quot;hello&quot;);\n    let static_str = &quot;world&quot;;\n    \n    process_string(heap_str);  // Ownership moved\n    process_str(static_str);   // Borrowed\n    \n    // heap_str no longer accessible here\n    // static_str still accessible\n}\n</code></pre>\n<h2>Performance Considerations</h2>\n<p><strong>Function Parameters</strong>:</p>\n<pre><code class=\"language-rust\">// Inefficient - forces allocation\nfn bad(s: String) -&gt; usize { s.len() }\n\n// Efficient - accepts both String and &amp;str\nfn good(s: &amp;str) -&gt; usize { s.len() }\n\n// Usage\nlet owned = String::from(&quot;test&quot;);\ngood(&amp;owned);  // Deref coercion: String -&gt; &amp;str\ngood(&quot;literal&quot;);  // Direct &amp;str\n</code></pre>\n<p><strong>Memory Allocation</strong>:</p>\n<ul>\n<li><code>String</code> allocates on heap, requires deallocation</li>\n<li><code>&amp;str</code> to literals points to program binary (zero allocation)</li>\n<li><code>&amp;str</code> from <code>String</code> shares existing allocation</li>\n</ul>\n<h2>Common Patterns</h2>\n<p><strong>Return Owned Data</strong>:</p>\n<pre><code class=\"language-rust\">fn build_message(name: &amp;str) -&gt; String {\n    format!(&quot;Hello, {}!&quot;, name)  // Returns owned String\n}\n</code></pre>\n<p><strong>Accept Flexible Input</strong>:</p>\n<pre><code class=\"language-rust\">fn analyze(text: &amp;str) -&gt; Analysis {\n    // Works with both String and &amp;str inputs\n    text.chars().count()\n}\n</code></pre>\n<p><strong>Avoid Unnecessary Clones</strong>:</p>\n<pre><code class=\"language-rust\">// Bad - unnecessary allocation\nfn process_bad(s: &amp;str) -&gt; String {\n    s.to_string()  // Only if you actually need owned data\n}\n\n// Good - work with borrowed data when possible\nfn process_good(s: &amp;str) -&gt; &amp;str {\n    s.trim()  // Returns slice of original\n}\n</code></pre>\n<h2>Key Takeaways</h2>\n<p>✅ <strong><code>String</code></strong>: Owned, mutable, heap-allocated<br>✅ <strong><code>str</code></strong>: Borrowed, immutable, flexible (heap/stack/static)<br>🚀 Prefer <code>&amp;str</code> for function parameters unless you need ownership or mutation</p>\n<p><strong>Try This:</strong> What happens when you call <code>.to_string()</code> on a string literal vs a <code>String</code>?<br><strong>Answer:</strong> Literal creates new heap allocation; <code>String</code> creates a clone of existing heap data—both allocate, but the source differs!</p>\n",
    "author": "mayo",
    "category": "rust",
    "tags": [
      "rust",
      "string",
      "memory",
      "ownership",
      "types"
    ],
    "readingTime": "3 min",
    "seo": {
      "title": "What is the difference between String and str in Rust? When would you use each?",
      "description": "Expert technical discussion on String vs str in Rust, covering memory management, ownership, and when to use each type.",
      "keywords": [
        "rust",
        "string",
        "memory",
        "ownership",
        "types"
      ]
    },
    "headings": [
      {
        "id": "what-is-the-difference-between-string-and-str-in-rust-when-would-you-use-each",
        "text": "What is the difference between String and str in Rust? When would you use each?",
        "level": 1
      },
      {
        "id": "key-differences",
        "text": "Key Differences",
        "level": 2
      },
      {
        "id": "memory-layout",
        "text": "Memory Layout",
        "level": 2
      },
      {
        "id": "when-to-use-each",
        "text": "When to Use Each",
        "level": 2
      },
      {
        "id": "example-ownership-vs-borrowing",
        "text": "Example: Ownership vs Borrowing",
        "level": 2
      },
      {
        "id": "performance-considerations",
        "text": "Performance Considerations",
        "level": 2
      },
      {
        "id": "common-patterns",
        "text": "Common Patterns",
        "level": 2
      },
      {
        "id": "key-takeaways",
        "text": "Key Takeaways",
        "level": 2
      }
    ]
  },
  {
    "id": "rust-traits-vs-interfaces",
    "slug": "rust-traits-vs-interfaces",
    "title": "How do Rust traits differ from interfaces in languages like Java or C#, and how would you use them to define a shared behavior for types in a performance-critical library?",
    "date": "2025-06-30",
    "excerpt": "Expert technical discussion on Rust traits vs Java/C# interfaces, covering dispatch mechanisms, compile-time behavior, and performance optimizations in critical systems.",
    "content": "\n# How do Rust traits differ from interfaces in languages like Java or C#, and how would you use them to define a shared behavior for types in a performance-critical library?\n\nRust traits and interfaces both define shared behavior, but differ fundamentally in design and execution, especially in performance-critical contexts.\n\n## Key Differences\n\n| Aspect | Rust Traits | Java/C# Interfaces |\n|--------|-------------|-------------------|\n| **Dispatch** | Static dispatch (generics) by default, opt-in dynamic (`dyn`) | Runtime polymorphism via vtables |\n| **Implementation** | Explicit via `impl Trait for Type` | Implicit (C#) or explicit (Java) |\n| **Compile-time** | Resolved at compile time via monomorphization | Runtime constructs with JIT optimization |\n| **Inheritance** | No inheritance; composition via supertraits | Interface inheritance with runtime checks |\n| **Performance** | Zero-cost abstraction, inlining enabled | 1-2 cycle dispatch cost, limited inlining |\n\n## Implementation and Dispatch\n\n**Rust Traits**: Support static dispatch via generics where the compiler monomorphizes code for each type, inlining calls for zero runtime overhead. Dynamic dispatch (`dyn Trait`) uses vtables but is opt-in.\n\n**Java/C# Interfaces**: Rely on runtime polymorphism via vtables, incurring dispatch costs and preventing inlining across type boundaries.\n\n## Example: Performance-Critical Networking Stack\n\nDefine a `PacketHandler` trait for efficient packet processing across different protocols:\n\n```rust\ntrait PacketHandler {\n    fn process(&mut self, data: &[u8]) -> usize; // Bytes processed\n    fn reset(&mut self); // Reset state\n}\n\nstruct TcpHandler { state: u32 }\nstruct UdpHandler { count: u16 }\n\nimpl PacketHandler for TcpHandler {\n    fn process(&mut self, data: &[u8]) -> usize {\n        self.state = data.iter().fold(self.state, |acc, &x| acc.wrapping_add(x as u32));\n        data.len()\n    }\n    fn reset(&mut self) { self.state = 0; }\n}\n\nimpl PacketHandler for UdpHandler {\n    fn process(&mut self, data: &[u8]) -> usize {\n        self.count = self.count.wrapping_add(1);\n        data.len()\n    }\n    fn reset(&mut self) { self.count = 0; }\n}\n\nfn process_packets<H: PacketHandler>(handler: &mut H, packets: &[&[u8]]) -> usize {\n    let mut total = 0;\n    for packet in packets {\n        total += handler.process(packet);\n    }\n    total\n}\n```\n\nUsage:\n```rust\nlet mut tcp = TcpHandler { state: 0 };\nlet packets = vec![&[1, 2, 3], &[4, 5, 6]];\nlet bytes = process_packets(&mut tcp, &packets); // Static dispatch\n```\n\n## How It Enhances Performance and Safety\n\n### Performance\n\n- **Static Dispatch**: `process_packets` monomorphizes for `TcpHandler` and `UdpHandler`, generating separate, inlined code paths. No vtable lookups, saving cycles in hot loops\n- **Inlining**: Compiler can inline `process` calls, fusing them with the loop, reducing branches and enabling SIMD optimizations\n- **Zero-Cost**: Trait abstraction adds no runtime overhead—equivalent to hand-writing `process_tcp` and `process_udp`\n\n### Safety\n\n- **Type Safety**: Trait bound `H: PacketHandler` ensures only compatible types are passed, checked at compile time—no runtime casts like Java's `instanceof`\n- **Encapsulation**: Each handler manages its state (`state` or `count`), with Rust's ownership enforcing mutation rules\n\n## Contrast with Java/C#\n\nJava equivalent:\n```java\ninterface PacketHandler {\n    int process(byte[] data);\n    void reset();\n}\n\nclass TcpHandler implements PacketHandler {\n    // vtable-based dispatch, no inlining across types\n}\n```\n\nEvery `process` call goes through a vtable, preventing loop fusion and adding indirection. Rust's static dispatch avoids this—critical for networking stacks handling millions of packets per second.\n\n## Advanced Considerations\n\n- **Associated Types**: Enable type-level constraints without runtime overhead\n- **Default Implementations**: Reduce boilerplate while maintaining zero-cost\n- **Supertraits**: Compose behavior without inheritance complexity\n- **Dynamic Dispatch**: Use `Box<dyn PacketHandler>` when type erasure is needed\n\n## Key Takeaways\n\n✅ **Rust traits**: Compile-time resolution, zero-cost abstraction, static dispatch by default  \n✅ **Java/C# interfaces**: Runtime polymorphism, vtable overhead, dynamic by nature  \n🚀 Use traits for performance-critical code where static dispatch eliminates overhead\n\n**Try This:** What happens if you use `&dyn PacketHandler` instead of generics?  \n**Answer:** You get dynamic dispatch with vtable overhead—measure the performance difference in your hot paths!\n",
    "contentHtml": "<h1>How do Rust traits differ from interfaces in languages like Java or C#, and how would you use them to define a shared behavior for types in a performance-critical library?</h1>\n<p>Rust traits and interfaces both define shared behavior, but differ fundamentally in design and execution, especially in performance-critical contexts.</p>\n<h2>Key Differences</h2>\n<table>\n<thead>\n<tr>\n<th>Aspect</th>\n<th>Rust Traits</th>\n<th>Java/C# Interfaces</th>\n</tr>\n</thead>\n<tbody><tr>\n<td><strong>Dispatch</strong></td>\n<td>Static dispatch (generics) by default, opt-in dynamic (<code>dyn</code>)</td>\n<td>Runtime polymorphism via vtables</td>\n</tr>\n<tr>\n<td><strong>Implementation</strong></td>\n<td>Explicit via <code>impl Trait for Type</code></td>\n<td>Implicit (C#) or explicit (Java)</td>\n</tr>\n<tr>\n<td><strong>Compile-time</strong></td>\n<td>Resolved at compile time via monomorphization</td>\n<td>Runtime constructs with JIT optimization</td>\n</tr>\n<tr>\n<td><strong>Inheritance</strong></td>\n<td>No inheritance; composition via supertraits</td>\n<td>Interface inheritance with runtime checks</td>\n</tr>\n<tr>\n<td><strong>Performance</strong></td>\n<td>Zero-cost abstraction, inlining enabled</td>\n<td>1-2 cycle dispatch cost, limited inlining</td>\n</tr>\n</tbody></table>\n<h2>Implementation and Dispatch</h2>\n<p><strong>Rust Traits</strong>: Support static dispatch via generics where the compiler monomorphizes code for each type, inlining calls for zero runtime overhead. Dynamic dispatch (<code>dyn Trait</code>) uses vtables but is opt-in.</p>\n<p><strong>Java/C# Interfaces</strong>: Rely on runtime polymorphism via vtables, incurring dispatch costs and preventing inlining across type boundaries.</p>\n<h2>Example: Performance-Critical Networking Stack</h2>\n<p>Define a <code>PacketHandler</code> trait for efficient packet processing across different protocols:</p>\n<pre><code class=\"language-rust\">trait PacketHandler {\n    fn process(&amp;mut self, data: &amp;[u8]) -&gt; usize; // Bytes processed\n    fn reset(&amp;mut self); // Reset state\n}\n\nstruct TcpHandler { state: u32 }\nstruct UdpHandler { count: u16 }\n\nimpl PacketHandler for TcpHandler {\n    fn process(&amp;mut self, data: &amp;[u8]) -&gt; usize {\n        self.state = data.iter().fold(self.state, |acc, &amp;x| acc.wrapping_add(x as u32));\n        data.len()\n    }\n    fn reset(&amp;mut self) { self.state = 0; }\n}\n\nimpl PacketHandler for UdpHandler {\n    fn process(&amp;mut self, data: &amp;[u8]) -&gt; usize {\n        self.count = self.count.wrapping_add(1);\n        data.len()\n    }\n    fn reset(&amp;mut self) { self.count = 0; }\n}\n\nfn process_packets&lt;H: PacketHandler&gt;(handler: &amp;mut H, packets: &amp;[&amp;[u8]]) -&gt; usize {\n    let mut total = 0;\n    for packet in packets {\n        total += handler.process(packet);\n    }\n    total\n}\n</code></pre>\n<p>Usage:</p>\n<pre><code class=\"language-rust\">let mut tcp = TcpHandler { state: 0 };\nlet packets = vec![&amp;[1, 2, 3], &amp;[4, 5, 6]];\nlet bytes = process_packets(&amp;mut tcp, &amp;packets); // Static dispatch\n</code></pre>\n<h2>How It Enhances Performance and Safety</h2>\n<h3>Performance</h3>\n<ul>\n<li><strong>Static Dispatch</strong>: <code>process_packets</code> monomorphizes for <code>TcpHandler</code> and <code>UdpHandler</code>, generating separate, inlined code paths. No vtable lookups, saving cycles in hot loops</li>\n<li><strong>Inlining</strong>: Compiler can inline <code>process</code> calls, fusing them with the loop, reducing branches and enabling SIMD optimizations</li>\n<li><strong>Zero-Cost</strong>: Trait abstraction adds no runtime overhead—equivalent to hand-writing <code>process_tcp</code> and <code>process_udp</code></li>\n</ul>\n<h3>Safety</h3>\n<ul>\n<li><strong>Type Safety</strong>: Trait bound <code>H: PacketHandler</code> ensures only compatible types are passed, checked at compile time—no runtime casts like Java&#39;s <code>instanceof</code></li>\n<li><strong>Encapsulation</strong>: Each handler manages its state (<code>state</code> or <code>count</code>), with Rust&#39;s ownership enforcing mutation rules</li>\n</ul>\n<h2>Contrast with Java/C#</h2>\n<p>Java equivalent:</p>\n<pre><code class=\"language-java\">interface PacketHandler {\n    int process(byte[] data);\n    void reset();\n}\n\nclass TcpHandler implements PacketHandler {\n    // vtable-based dispatch, no inlining across types\n}\n</code></pre>\n<p>Every <code>process</code> call goes through a vtable, preventing loop fusion and adding indirection. Rust&#39;s static dispatch avoids this—critical for networking stacks handling millions of packets per second.</p>\n<h2>Advanced Considerations</h2>\n<ul>\n<li><strong>Associated Types</strong>: Enable type-level constraints without runtime overhead</li>\n<li><strong>Default Implementations</strong>: Reduce boilerplate while maintaining zero-cost</li>\n<li><strong>Supertraits</strong>: Compose behavior without inheritance complexity</li>\n<li><strong>Dynamic Dispatch</strong>: Use <code>Box&lt;dyn PacketHandler&gt;</code> when type erasure is needed</li>\n</ul>\n<h2>Key Takeaways</h2>\n<p>✅ <strong>Rust traits</strong>: Compile-time resolution, zero-cost abstraction, static dispatch by default<br>✅ <strong>Java/C# interfaces</strong>: Runtime polymorphism, vtable overhead, dynamic by nature<br>🚀 Use traits for performance-critical code where static dispatch eliminates overhead</p>\n<p><strong>Try This:</strong> What happens if you use <code>&amp;dyn PacketHandler</code> instead of generics?<br><strong>Answer:</strong> You get dynamic dispatch with vtable overhead—measure the performance difference in your hot paths!</p>\n",
    "author": "mayo",
    "category": "rust",
    "tags": [
      "rust",
      "traits",
      "performance",
      "interfaces",
      "dispatch"
    ],
    "readingTime": "4 min",
    "seo": {
      "title": "How do Rust traits differ from interfaces in languages like Java or C#, and how would you use them to define a shared behavior for types in a performance-critical library?",
      "description": "Expert technical discussion on Rust traits vs Java/C# interfaces, covering dispatch mechanisms, compile-time behavior, and performance optimizations in critical systems.",
      "keywords": [
        "rust",
        "traits",
        "performance",
        "interfaces",
        "dispatch"
      ]
    },
    "headings": [
      {
        "id": "how-do-rust-traits-differ-from-interfaces-in-languages-like-java-or-c-and-how-would-you-use-them-to-define-a-shared-behavior-for-types-in-a-performance-critical-library",
        "text": "How do Rust traits differ from interfaces in languages like Java or C#, and how would you use them to define a shared behavior for types in a performance-critical library?",
        "level": 1
      },
      {
        "id": "key-differences",
        "text": "Key Differences",
        "level": 2
      },
      {
        "id": "implementation-and-dispatch",
        "text": "Implementation and Dispatch",
        "level": 2
      },
      {
        "id": "example-performance-critical-networking-stack",
        "text": "Example: Performance-Critical Networking Stack",
        "level": 2
      },
      {
        "id": "how-it-enhances-performance-and-safety",
        "text": "How It Enhances Performance and Safety",
        "level": 2
      },
      {
        "id": "performance",
        "text": "Performance",
        "level": 3
      },
      {
        "id": "safety",
        "text": "Safety",
        "level": 3
      },
      {
        "id": "contrast-with-javac",
        "text": "Contrast with Java/C#",
        "level": 2
      },
      {
        "id": "advanced-considerations",
        "text": "Advanced Considerations",
        "level": 2
      },
      {
        "id": "key-takeaways",
        "text": "Key Takeaways",
        "level": 2
      }
    ]
  },
  {
    "id": "getting-started-with-rust",
    "slug": "getting-started-with-rust",
    "title": "Getting Started with Rust: A Guide for Beginners",
    "date": "2025-04-15",
    "excerpt": "An introduction to Rust for beginners, covering installation, basic syntax, and your first project.",
    "content": "\n# Getting Started with Rust: A Guide for Beginners\n\nRust has been gaining significant traction among developers for its focus on performance, memory safety, and concurrency. If you're new to Rust, this guide will help you get started with the basics.\n\n## Setting Up Your Environment\n\nFirst, you'll need to install Rust on your system. The easiest way is to use rustup, the Rust toolchain installer:\n\n```bash\ncurl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh\n```\n\nThis command will download a script and start the installation process. Follow the instructions on screen to complete the installation.\n\n## Your First Rust Program\n\nLet's create a simple \"Hello, World!\" program. Create a new file called `hello.rs` with the following content:\n\n```rust\nfn main() {\n    println!(\"Hello, World!\");\n}\n```\n\nTo compile and run this program, use the following commands:\n\n```bash\nrustc hello.rs\n./hello\n```\n\n## Understanding Cargo\n\nCargo is Rust's build system and package manager. It handles many tasks such as building your code, downloading libraries, and building those libraries.\n\nTo create a new project with Cargo:\n\n```bash\ncargo new hello_cargo\ncd hello_cargo\n```\n\nThis creates a new directory called `hello_cargo` with the following structure:\n\n```\nhello_cargo/\n├── Cargo.toml\n└── src/\n    └── main.rs\n```\n\nThe `Cargo.toml` file contains metadata about your project and its dependencies. The `src/main.rs` file contains your application code.\n\nTo build and run your project:\n\n```bash\ncargo build   # Compile the project\ncargo run     # Compile and run the project\n```\n\n## Key Concepts in Rust\n\n### Variables and Mutability\n\nBy default, variables in Rust are immutable:\n\n```rust\nlet x = 5;\n// x = 6; // This would cause an error\n```\n\nTo make a variable mutable, use the `mut` keyword:\n\n```rust\nlet mut y = 5;\ny = 6; // This works fine\n```\n\n### Ownership\n\nOwnership is Rust's most unique feature and enables memory safety without garbage collection. The main rules are:\n\n1. Each value in Rust has a variable that's its owner.\n2. There can only be one owner at a time.\n3. When the owner goes out of scope, the value will be dropped.\n\n```rust\nfn main() {\n    let s1 = String::from(\"hello\");\n    let s2 = s1; // s1 is moved to s2, s1 is no longer valid\n    \n    // println!(\"{}\", s1); // This would cause an error\n    println!(\"{}\", s2); // This works fine\n}\n```\n\n## Next Steps\n\nNow that you have the basics, try building a small project to practice your skills. The Rust documentation is an excellent resource for learning more:\n\n- [The Rust Book](https://doc.rust-lang.org/book/)\n- [Rust by Example](https://doc.rust-lang.org/rust-by-example/)\n\nHappy coding with Rust!\n",
    "contentHtml": "<h1>Getting Started with Rust: A Guide for Beginners</h1>\n<p>Rust has been gaining significant traction among developers for its focus on performance, memory safety, and concurrency. If you&#39;re new to Rust, this guide will help you get started with the basics.</p>\n<h2>Setting Up Your Environment</h2>\n<p>First, you&#39;ll need to install Rust on your system. The easiest way is to use rustup, the Rust toolchain installer:</p>\n<pre><code class=\"language-bash\">curl --proto &#39;=https&#39; --tlsv1.2 -sSf https://sh.rustup.rs | sh\n</code></pre>\n<p>This command will download a script and start the installation process. Follow the instructions on screen to complete the installation.</p>\n<h2>Your First Rust Program</h2>\n<p>Let&#39;s create a simple &quot;Hello, World!&quot; program. Create a new file called <code>hello.rs</code> with the following content:</p>\n<pre><code class=\"language-rust\">fn main() {\n    println!(&quot;Hello, World!&quot;);\n}\n</code></pre>\n<p>To compile and run this program, use the following commands:</p>\n<pre><code class=\"language-bash\">rustc hello.rs\n./hello\n</code></pre>\n<h2>Understanding Cargo</h2>\n<p>Cargo is Rust&#39;s build system and package manager. It handles many tasks such as building your code, downloading libraries, and building those libraries.</p>\n<p>To create a new project with Cargo:</p>\n<pre><code class=\"language-bash\">cargo new hello_cargo\ncd hello_cargo\n</code></pre>\n<p>This creates a new directory called <code>hello_cargo</code> with the following structure:</p>\n<pre><code>hello_cargo/\n├── Cargo.toml\n└── src/\n    └── main.rs\n</code></pre>\n<p>The <code>Cargo.toml</code> file contains metadata about your project and its dependencies. The <code>src/main.rs</code> file contains your application code.</p>\n<p>To build and run your project:</p>\n<pre><code class=\"language-bash\">cargo build   # Compile the project\ncargo run     # Compile and run the project\n</code></pre>\n<h2>Key Concepts in Rust</h2>\n<h3>Variables and Mutability</h3>\n<p>By default, variables in Rust are immutable:</p>\n<pre><code class=\"language-rust\">let x = 5;\n// x = 6; // This would cause an error\n</code></pre>\n<p>To make a variable mutable, use the <code>mut</code> keyword:</p>\n<pre><code class=\"language-rust\">let mut y = 5;\ny = 6; // This works fine\n</code></pre>\n<h3>Ownership</h3>\n<p>Ownership is Rust&#39;s most unique feature and enables memory safety without garbage collection. The main rules are:</p>\n<ol>\n<li>Each value in Rust has a variable that&#39;s its owner.</li>\n<li>There can only be one owner at a time.</li>\n<li>When the owner goes out of scope, the value will be dropped.</li>\n</ol>\n<pre><code class=\"language-rust\">fn main() {\n    let s1 = String::from(&quot;hello&quot;);\n    let s2 = s1; // s1 is moved to s2, s1 is no longer valid\n    \n    // println!(&quot;{}&quot;, s1); // This would cause an error\n    println!(&quot;{}&quot;, s2); // This works fine\n}\n</code></pre>\n<h2>Next Steps</h2>\n<p>Now that you have the basics, try building a small project to practice your skills. The Rust documentation is an excellent resource for learning more:</p>\n<ul>\n<li><a href=\"https://doc.rust-lang.org/book/\">The Rust Book</a></li>\n<li><a href=\"https://doc.rust-lang.org/rust-by-example/\">Rust by Example</a></li>\n</ul>\n<p>Happy coding with Rust!</p>\n",
    "author": "Mayorana",
    "category": "rust",
    "tags": [
      "rust",
      "programming",
      "beginners",
      "tutorial"
    ],
    "readingTime": "3 min",
    "seo": {
      "title": "Getting Started with Rust: A Guide for Beginners",
      "description": "An introduction to Rust for beginners, covering installation, basic syntax, and your first project.",
      "keywords": [
        "rust",
        "programming",
        "beginners",
        "tutorial"
      ]
    },
    "headings": [
      {
        "id": "getting-started-with-rust-a-guide-for-beginners",
        "text": "Getting Started with Rust: A Guide for Beginners",
        "level": 1
      },
      {
        "id": "setting-up-your-environment",
        "text": "Setting Up Your Environment",
        "level": 2
      },
      {
        "id": "your-first-rust-program",
        "text": "Your First Rust Program",
        "level": 2
      },
      {
        "id": "understanding-cargo",
        "text": "Understanding Cargo",
        "level": 2
      },
      {
        "id": "key-concepts-in-rust",
        "text": "Key Concepts in Rust",
        "level": 2
      },
      {
        "id": "variables-and-mutability",
        "text": "Variables and Mutability",
        "level": 3
      },
      {
        "id": "ownership",
        "text": "Ownership",
        "level": 3
      },
      {
        "id": "next-steps",
        "text": "Next Steps",
        "level": 2
      }
    ]
  }
]
````

## File: src/lib/blog.ts
````typescript
// src/lib/blog.ts - Server-side data fetching
import blogPostsData from '../data/blog-posts.json';
import blogCategoriesData from '../data/blog-categories.json';

// Import the JSON data types
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  date: string;
  author: string;
  excerpt: string;
  content: string;
  contentHtml: string;
  category: string;
  tags: string[];
  image?: string;
  readingTime: string;
  seo: {
    title: string;
    description: string;
    keywords: string[] | string;
    ogImage?: string;
  };
  headings: {
    id: string;
    text: string;
    level: number;
  }[];
}

// Blog category type definition
export interface BlogCategory {
  slug: string;
  name: string;
  description: string;
}

// Get all blog posts - since this is a synchronous operation, no need for async
export function getAllPosts(): BlogPost[] {
  return blogPostsData; 
}

// Get all blog categories
export function getAllCategories(): BlogCategory[] {
  return blogCategoriesData;
}

// Get posts by category
export function getPostsByCategory(categorySlug: string): BlogPost[] {
  const posts = getAllPosts();
  return posts.filter(post => post.category === categorySlug);
}

// Get a single post by slug
export function getPostBySlug(slug: string): BlogPost | null {
  const posts = getAllPosts();
  return posts.find(post => post.slug === slug) || null;
}

// Get recent posts
export function getRecentPosts(count: number = 3): BlogPost[] {
  const posts = getAllPosts();
  // Already sorted by date in the generator script
  return posts.slice(0, count);
}

// Get category by slug
export function getCategoryBySlug(slug: string): BlogCategory | null {
  const categories = getAllCategories();
  return categories.find(category => category.slug === slug) || null;
}

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
````

## File: src/lib/config.ts
````typescript
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

/**
 * Load configuration from YAML files
 * Based on your preference for using YAML configuration files
 */
// Define a more specific return type instead of any
export function loadConfig(fileName: string): Record<string, unknown> {
  try {
    // Get the absolute path to the config file
    const configPath = path.resolve(process.cwd(), 'config', fileName);
    
    // Read the file synchronously
    const fileContents = fs.readFileSync(configPath, 'utf8');
    
    // Parse the YAML content
    const config = yaml.load(fileContents) as Record<string, unknown>;
    
    // Log the config loading at trace level
    console.trace(`Loaded config from ${fileName}`);
    
    return config;
  } catch (error) {
    console.error(`Error loading config file ${fileName}:`, error);
    return {};
  }
}

// Load site config
export const siteConfig = loadConfig('site.yaml');

// Export specific config sections for easy access
export const colors = siteConfig.colors || {};
export const navigation = siteConfig.navigation || {};
export const services = siteConfig.services || [];
export const portfolio = siteConfig.portfolio || [];
````

## File: src/lib/route-types.ts
````typescript
// Define params types for dynamic routes (Next.js 15)
export type PageParams = Promise<{ slug: string }>;
export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// Define props interfaces for components
export interface PageProps {
  params: PageParams;
  searchParams?: SearchParams;
}

export interface MetadataProps {
  params: PageParams;
  searchParams?: SearchParams;
}

// More specific types for different route patterns
export type BlogPostParams = Promise<{ slug: string }>;
export type CategoryParams = Promise<{ slug: string }>;

export interface BlogPostProps {
  params: BlogPostParams;
  searchParams?: SearchParams;
}

export interface CategoryProps {
  params: CategoryParams;
  searchParams?: SearchParams;
}
````

## File: src/types/globals.d.ts
````typescript
export {};

declare global {
  interface Window {
    plausible?: {
      (event: string, options?: { props?: Record<string, string> }): void;
      q?: Array<unknown>;
    };
  }
}
````

## File: .eslintrc.js
````javascript
module.exports = {
  extends: [
    'next/core-web-vitals',
    'next/typescript'
  ],
  rules: {
    // Disable the rule for unescaped entities
    'react/no-unescaped-entities': 'off',
  }
};
````

## File: .gitignore
````
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (can opt-in for committing if needed)
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
````

## File: config.yaml
````yaml
# Default configuration for mayorana
service:
  name: mayorana
  version: 1.0.0
````

## File: eslint.config.mjs
````
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
````

## File: middleware.ts
````typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip processing for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') || // Skip files with extensions
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Handle trailing slashes (except for the root path)
  if (pathname !== '/' && pathname.endsWith('/')) {
    return NextResponse.redirect(
      new URL(pathname.slice(0, -1), request.url),
      { status: 301 }
    );
  }

  return NextResponse.next();
}

// Updated matcher to be more specific and avoid conflicts
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Any file with an extension
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.).*)',
  ],
};
````

## File: next.config.ts
````typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Common configuration
  trailingSlash: false,
  reactStrictMode: true,

  // Fixed image configuration - use remotePatterns instead of domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mayorana.ch',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Remove problematic headers that might cause conflicts
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },

  // Simplified redirects
  async redirects() {
    return [];
  },

  // Simplified rewrites
  async rewrites() {
    return [];
  },

  // Additional production optimizations
  poweredByHeader: false,
  compress: true,
};

module.exports = nextConfig;
````

## File: package.json
````json
{
  "name": "mayorana",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "node scripts/generate-blog-data.js && next dev -p 3006",
    "build": "node scripts/generate-blog-data.js && node scripts/generate-sitemap.js && next build",
    "start": "next start -p 3006",
    "lint": "next lint"
  },
  "dependencies": {
    "@types/js-yaml": "^4.0.9",
    "framer-motion": "^12.10.1",
    "gray-matter": "^4.0.3",
    "js-yaml": "^4.1.0",
    "marked": "^15.0.11",
    "next": "15.3.1",
    "next-themes": "^0.4.6",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.56.2",
    "react-icons": "^5.5.0",
    "reading-time": "^1.5.0",
    "remark": "^15.0.1",
    "remark-html": "^16.0.1",
    "remark-prism": "^1.3.6",
    "slugify": "^1.6.6",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/typography": "^0.5.16",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.4.21",
    "eslint": "^9",
    "eslint-config-next": "15.3.1",
    "postcss": "^8.5.3",
    "tailwindcss": "3.4.1",
    "typescript": "^5"
  }
}
````

## File: postcss.config.mjs
````
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
````

## File: README.md
````markdown
# Mayorana.ch Website

A modern, responsive website for mayorana.ch built with Next.js and Tailwind CSS.

## Features

- Clean, modern interface with responsive design
- Light and dark mode support
- Configurable via YAML files
- Pages for Services, About, and Contact
- Blog with category filtering and markdown support
- api0.ai solution showcase

## Tech Stack

- **Framework**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Forms**: React Hook Form
- **Icons**: React Icons
- **Configuration**: js-yaml

## Getting Started

```bash
# Clone the repository
git clone https://github.com/bennekrouf/mayorana.git

# Navigate to project directory
cd mayorana

# Install dependencies
yarn install

# Start development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the website.

## Folder Structure

```
mayorana-website/
├── config/           # YAML configuration files
├── public/           # Static assets
│   └── images/       # Image files
├── src/
│   ├── components/   # Reusable components
│   │   ├── layout/   # Layout components
│   │   └── ui/       # UI components
│   ├── lib/          # Utility functions
│   ├── pages/        # Page components
│   └── styles/       # Global styles
├── .gitignore
├── next.config.js
├── package.json
├── README.md
├── tailwind.config.js
└── tsconfig.json
```

## Configuration

The website uses YAML files for configuration located in the `config/` directory. The main configuration file is `site.yaml`.

## Deployment

The website can be deployed to Vercel:

```bash
# Install Vercel CLI
yarn global add vercel

# Deploy to Vercel
vercel
```

## License

MIT
````

## File: tailwind.config.ts
````typescript
// tailwind.config.ts
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'hsl(var(--foreground))',
            a: {
              color: 'hsl(var(--primary))',
              '&:hover': {
                color: 'hsl(var(--primary) / 0.8)',
              },
            },
            h1: {
              color: 'hsl(var(--foreground))',
            },
            h2: {
              color: 'hsl(var(--foreground))',
            },
            h3: {
              color: 'hsl(var(--foreground))',
            },
            h4: {
              color: 'hsl(var(--foreground))',
            },
            blockquote: {
              color: 'hsl(var(--muted-foreground))',
              borderLeftColor: 'hsl(var(--primary))',
            },
            code: {
              color: 'hsl(var(--foreground))',
              backgroundColor: 'hsl(var(--muted))',
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontWeight: '400',
              '&::before': {
                content: '""',
              },
              '&::after': {
                content: '""',
              },
            },
            'pre code': {
              backgroundColor: 'transparent',
              padding: '0',
            },
            pre: {
              color: 'hsl(var(--foreground))',
              backgroundColor: 'hsl(var(--muted))',
              borderRadius: '0.5rem',
              padding: '1rem',
              overflowX: 'auto',
            },
            strong: {
              color: 'hsl(var(--foreground))',
            },
            hr: {
              borderColor: 'hsl(var(--border))',
            },
            ul: {
              listStyleType: 'disc',
            },
            li: {
              color: 'hsl(var(--muted-foreground))',
              marginTop: '0.5em',
              marginBottom: '0.5em',
            },
            p: {
              color: 'hsl(var(--muted-foreground))',
            },
            img: {
              borderRadius: '0.5rem',
            },
            figure: {
              margin: '2rem 0',
            },
            figcaption: {
              color: 'hsl(var(--muted-foreground))',
              fontSize: '0.875rem',
              textAlign: 'center',
              marginTop: '0.5rem',
            },
            table: {
              fontSize: '0.875rem',
            },
            thead: {
              borderBottomColor: 'hsl(var(--border))',
            },
            'thead th': {
              color: 'hsl(var(--foreground))',
            },
            'tbody tr': {
              borderBottomColor: 'hsl(var(--border))',
            },
            'tbody td': {
              padding: '0.75rem',
            },
          },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/typography'), // This plugin is essential for Markdown styling
  ],
}

export default config
````

## File: tsconfig.json
````json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    // Add type roots but keep paths simple
    "typeRoots": [
      "./node_modules/@types",
      "./src/types"
    ],
    // Simplified paths to avoid Turbopack error
    "paths": {
      "@/*": [
        "./src/*"
      ]
    },
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    "src/types/**/*.d.ts" // Explicitly include your type declaration files
  ],
  "exclude": [
    "node_modules"
  ]
}
````
