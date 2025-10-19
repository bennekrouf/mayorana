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
