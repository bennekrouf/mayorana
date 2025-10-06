# Rust Blog Post Formatter - Reusable Prompt

Transform technical Rust content into a JS/TS-to-Rust blog post using this exact structure:

---

## Instructions

Create a blog post with the following specifications:

### Frontmatter
```yaml
---
id: [kebab-case-topic]
title: "Understanding [Topic]: A Guide for JavaScript Developers"
slug: [topic]-rust-javascript-developers
locale: "en"
date: '[YYYY-MM-DD]'
author: mayo
excerpt: 'Learn how [Topic] works in Rust compared to JavaScript - [key concepts]'
category: rust
tags:
  - rust
  - javascript
  - typescript
  - [specific-topic]
---
```

### Structure

1. **H1 Title** (SEO-friendly, mentions JS developers)
2. **Opening Paragraph** (2-3 sentences)
   - Address JS developers directly
   - State the core concept difference between JS and Rust
   - Position as a bridge between the two paradigms

3. **The JavaScript Baseline** (H2)
   - Show how the concept works in JavaScript
   - Include working JS code example
   - Explain the implicit behavior/assumptions

4. **Rust's Explicit Choice** (H2)
   - Contrast with Rust's approach
   - Show Rust code examples
   - Explain mechanics for Copy vs non-Copy types where relevant

5. **When You Need [Concept]** (H3 under section 4)
   - **Subsection 1**: Threading/Async
     - JS code example showing the "easy" way
     - Rust code showing ownership requirements
   - **Subsection 2**: Common pattern (e.g., returning closures, factories)
     - JS code example
     - Rust equivalent with ownership transfer
   - **Subsection 3**: Another practical scenario
     - Side-by-side comparison

6. **[Core Difference]** (H3)
   - Direct comparison showing the mental model shift
   - JS code showing shared/reference behavior
   - Rust code showing borrow behavior
   - Rust code showing ownership transfer with `move` or relevant keyword

7. **The Paradigm Shift from JavaScript** (H2)
   - Summarize the JS implicit model
   - Show JS code demonstrating the pattern
   - Summarize the Rust explicit model
   - Show Rust code with ownership/lifetime semantics
   - Conclude with compile-time guarantees Rust provides

8. **Summary** (H2)
   - Table with scenarios and when to use the concept
   - Core principle in 1-2 sentences
   - Final statement about compile-time safety vs GC runtime

### Style Guidelines

- **Direct and technical** - No fluff, straight to mechanics
- **Code-heavy** - Every explanation needs a code example
- **JS-first comparison** - Always show JS code before Rust equivalent
- **Practical scenarios** - Real use cases (threading, async, factories, state management)
- **Explicit about trade-offs** - Mention compile-time checking, no GC overhead
- **Comment critical lines** - Use inline comments for ownership transfers, errors
- **Error examples** - Show what doesn't compile and why

### Code Example Format

```javascript
// JavaScript: implicit behavior
const example = () => {
  const data = [1, 2, 3];
  return () => console.log(data); // reference captured
};
```

```rust
// Rust: explicit ownership
fn example() -> impl Fn() {
    let data = vec![1, 2, 3];
    move || println!("{:?}", data) // `data` moved into closure
}
```

### SEO Requirements

- Title: "Understanding [Rust Concept]: A Guide for JavaScript Developers"
- Slug: Must include "javascript-developers"
- Excerpt: Must mention both JS and Rust, include key concepts
- Tags: Always include "rust", "javascript", "typescript"

---

## Usage

Paste this prompt + your Rust technical content, and format according to these specs.
