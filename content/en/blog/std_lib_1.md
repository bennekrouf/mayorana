---
id: clamp-rust
title: "What is `clamp` in Rust, and when should you use it?"
slug: clamp-rust
locale: en
date: '2026-04-14'
author: mayo
excerpt: Rust standard library

tags:
  - rust
  - standard-library
  - basics
---

# What is `clamp` in Rust, and when should you use it?

`clamp` is a function that "sandwiches" a value between a minimum and a maximum:

```
If value < min → returns min
If value > max → returns max
Otherwise      → returns value
```

Think of it like a vice: the value cannot escape the bounds you give it.

## In Practice

```rust
let x0 = cx.floor().clamp(0.0, (src_w - 1) as f32) as usize;
```

This single line does three things:

1. `cx.floor()` — rounds down (e.g. `5.7 → 5.0`)
2. `.clamp(0.0, src_w - 1)` — clamps between `0` and the maximum valid index
3. `as usize` — converts to an unsigned integer for use as an array index

Concrete examples with `src_w = 100`:

| `cx` | `cx.floor()` | After `.clamp(0.0, 99.0)` | `as usize` |
|---|---|---|---|
| `-0.3` | `-1.0` | `0.0` — below min, clamped | `0` |
| `99.8` | `99.0` | `99.0` — within bounds | `99` |
| `150.0` | `150.0` | `99.0` — above max, clamped | `99` |

## Is It a Standard Function?

### Rust

Yes — `clamp` has been in the standard library since **Rust 1.50** (February 2021). It works for both integers and floats:

```rust
assert_eq!(5.clamp(0, 10), 5);      // within bounds → unchanged
assert_eq!((-3).clamp(0, 10), 0);   // too small → returns min
assert_eq!(15.clamp(0, 10), 10);    // too large → returns max

// With floats
assert_eq!((-3.0_f32).clamp(0.0, 10.0), 0.0);
```

### C++

Yes — `std::clamp` has been available since **C++17**, in `<algorithm>`:

```cpp
#include <algorithm>

int x = std::clamp(15, 0, 10);  // x = 10
```

### JavaScript (Node.js)

No — there is no native `clamp` in JavaScript. You must write it yourself:

```javascript
// Classic version
function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

// Arrow function
const clamp = (v, min, max) => Math.max(min, Math.min(v, max));

clamp(-3, 0, 10);  // 0
clamp(15, 0, 10);  // 10
clamp(5,  0, 10);  // 5
```

Third-party libraries (Lodash, etc.) provide it, but nothing ships in the language itself.

### C

No — there is no standard `clamp` in C. You write it manually:

```c
int clamp(int value, int min, int max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}

float clampf(float value, float min, float max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}
```

## Summary

| **Language** | **Native `clamp`?** | **How** |
|---|---|---|
| Rust | ✅ Yes (std, since 1.50) | `value.clamp(min, max)` |
| C++ | ✅ Yes (C++17, `<algorithm>`) | `std::clamp(value, min, max)` |
| JavaScript | ❌ No | `Math.max(min, Math.min(value, max))` |
| C | ❌ No | Manual `if` logic |

## Why It Matters

`clamp` prevents boundary errors. In image resizing, pixel coordinates computed from floating-point interpolation can land outside the valid index range:

```
Without clamp: cx = -0.3 → floor → -1 → cast to usize → wraps to usize::MAX or panics
With clamp:    cx = -0.3 → floor → -1.0 → clamped to 0.0 → 0 → always valid
```

It is more readable and safer than scattering `if` checks throughout your code.

## Key Takeaways

✅ `value.clamp(min, max)` bounds a value in one call — no manual `if` logic needed.

✅ Available in Rust's standard library since version 1.50 for both integers and floats.

✅ C++ gained the equivalent in C++17; JavaScript and C still require manual implementations.

🚫 Do not confuse `clamp` with `saturating_add` / `saturating_sub` — those prevent integer overflow at type boundaries, not arbitrary custom bounds.

**Thought Experiment**: What happens if you call `value.clamp(max, min)` — with `min` and `max` swapped?
**Answer**: Rust panics in debug mode (`min > max` is explicitly checked). Always ensure `min ≤ max`.
