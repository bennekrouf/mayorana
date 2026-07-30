---
id: "getting-started-with-rust"
title: "Getting Started with Rust: A Guide for Beginners"
slug: "getting-started-with-rust"
locale: "en"
date: "2025-04-15"
author: "Mayorana"
excerpt: "Introduction to Rust for beginners, covering installation, basic syntax, and your first project."
tags:
  - rust
  - beginners
---

# Getting Started with Rust: A Guide for Beginners

Rust has been gaining significant traction among developers for its focus on performance, memory safety, and concurrency. If you're new to Rust, this guide will help you get started with the basics.

<div class="svg-container" style="margin:2rem 0;">
<svg class="rstart-fig" viewBox="0 0 800 220" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Rust getting-started pipeline: install with rustup, compile a single file with rustc, then scaffold and build a real project with cargo">
<style>
.rstart-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .rstart-fig,[data-theme="dark"] .rstart-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.rstart-fig text{font-family:ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.rstart-fig .title{font-size:14px;font-weight:700}
.rstart-fig .body{font-size:12px;font-weight:600}
.rstart-fig .cap{font-size:11px;fill:var(--mut)}
.rstart-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.rstart-fig .acbox{fill:var(--ac);stroke:var(--ac)}
.rstart-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="rstart-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"></path>
</marker>
</defs>
<!-- step 1 -->
<rect class="box" x="20" y="60" width="170" height="90" rx="8"></rect>
<text x="105" y="90" text-anchor="middle" class="title">rustup</text>
<text x="105" y="110" text-anchor="middle" class="cap">install toolchain</text>
<text x="105" y="125" text-anchor="middle" class="cap">via sh.rustup.rs</text>
<!-- step 2 -->
<rect class="box" x="210" y="60" width="170" height="90" rx="8"></rect>
<text x="295" y="90" text-anchor="middle" class="title">rustc hello.rs</text>
<text x="295" y="110" text-anchor="middle" class="cap">compile a single file</text>
<text x="295" y="125" text-anchor="middle" class="cap">./hello to run</text>
<!-- step 3 -->
<rect class="box" x="400" y="60" width="170" height="90" rx="8"></rect>
<text x="485" y="90" text-anchor="middle" class="title">cargo new</text>
<text x="485" y="110" text-anchor="middle" class="cap">scaffolds project</text>
<text x="485" y="125" text-anchor="middle" class="cap">Cargo.toml + src/</text>
<!-- step 4 accent -->
<rect class="acbox" x="590" y="60" width="170" height="90" rx="8"></rect>
<text x="675" y="90" text-anchor="middle" class="title" fill="#ffffff">cargo build/run</text>
<text x="675" y="110" text-anchor="middle" class="cap" fill="#ffffff">manages deps</text>
<text x="675" y="125" text-anchor="middle" class="cap" fill="#ffffff">and builds for you</text>
<!-- arrows -->
<path class="ln" d="M190,105 L210,105" marker-end="url(#rstart-arrow)"></path>
<path class="ln" d="M380,105 L400,105" marker-end="url(#rstart-arrow)"></path>
<path class="ln" d="M570,105 L590,105" marker-end="url(#rstart-arrow)"></path>
<!-- caption -->
<text x="400" y="195" text-anchor="middle" class="cap">rustc works for one file — cargo is the everyday workflow for real projects</text>
</svg>
</div>

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

Nothing was copied here. `s1` and `s2` are two stack slots, but there is only ever one heap buffer and one owner of it — which is why the compiler retires `s1` the moment it hands the buffer to `s2`:

<div class="svg-container" style="margin:2rem 0;">
<svg class="rstartb-fig" viewBox="0 0 800 330" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Moving a String transfers the single heap buffer from s1 to s2, invalidating s1, and the buffer is freed exactly once when s2 leaves scope">
<style>
.rstartb-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .rstartb-fig,[data-theme="dark"] .rstartb-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.rstartb-fig text{font-family:ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.rstartb-fig .title{font-size:14px;font-weight:700}
.rstartb-fig .body{font-size:12px;font-weight:600}
.rstartb-fig .cap{font-size:11px;fill:var(--mut)}
.rstartb-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.rstartb-fig .gone{fill:var(--bg);stroke:var(--mut);stroke-width:1.5;stroke-dasharray:5 4}
.rstartb-fig .acbox{fill:var(--ac);stroke:var(--ac)}
.rstartb-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.rstartb-fig .acln{stroke:var(--ac);stroke-width:2;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="rstartb-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"></path>
</marker>
<marker id="rstartb-arrowac" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ac)"></path>
</marker>
</defs>
<!-- header -->
<text x="400" y="26" text-anchor="middle" class="title">let s1 = String::from("hello");   let s2 = s1;</text>
<text x="190" y="56" text-anchor="middle" class="cap">stack</text>
<text x="610" y="56" text-anchor="middle" class="cap">heap</text>
<!-- s1 slot, retired -->
<rect class="gone" x="60" y="68" width="260" height="52" rx="8"></rect>
<text x="190" y="90" text-anchor="middle" class="body" fill="var(--mut)">s1</text>
<text x="190" y="108" text-anchor="middle" class="cap">moved out — using it is a compile error</text>
<!-- s2 slot, the owner -->
<rect class="box" x="60" y="136" width="260" height="52" rx="8"></rect>
<text x="190" y="158" text-anchor="middle" class="body">s2</text>
<text x="190" y="176" text-anchor="middle" class="cap">ptr · len 5 · cap 5</text>
<!-- heap buffer -->
<rect class="box" x="480" y="90" width="260" height="76" rx="8"></rect>
<text x="610" y="116" text-anchor="middle" class="title">"hello"</text>
<text x="610" y="136" text-anchor="middle" class="cap">a single allocation</text>
<text x="610" y="152" text-anchor="middle" class="cap">the move never copies it</text>
<!-- ownership pointer -->
<path class="acln" d="M320,162 L480,140" marker-end="url(#rstartb-arrowac)"></path>
<text x="400" y="136" text-anchor="middle" class="body" fill="var(--ac)">owns</text>
<!-- scope end -->
<rect class="box" x="40" y="225" width="330" height="56" rx="8"></rect>
<text x="205" y="249" text-anchor="middle" class="body">} // end of main</text>
<text x="205" y="268" text-anchor="middle" class="cap">the one owner goes out of scope</text>
<path class="ln" d="M370,253 L430,253" marker-end="url(#rstartb-arrow)"></path>
<rect class="acbox" x="430" y="225" width="330" height="56" rx="8"></rect>
<text x="595" y="249" text-anchor="middle" class="body" fill="#ffffff">the buffer is freed — exactly once</text>
<text x="595" y="268" text-anchor="middle" class="cap" fill="#ffffff">no double free, no garbage collector</text>
<!-- caption -->
<text x="400" y="312" text-anchor="middle" class="cap">Rule 2 (one owner) and rule 3 (drop at end of scope) are what remove free() from your code</text>
</svg>
</div>

## Next Steps

Now that you have the basics, try building a small project to practice your skills. The Rust documentation is an excellent resource for learning more:

- [The Rust Book](https://doc.rust-lang.org/book/)
- [Rust by Example](https://doc.rust-lang.org/rust-by-example/)

Happy coding with Rust!
