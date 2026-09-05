---
id: clamp-rust
title: "What is `clamp` in Rust, and when should you use it?"
slug: clamp-rust
locale: en
date: '2026-04-14'
author: mayo
excerpt: >-
  What clamp does, why it panics on a swapped min and max, and how it differs
  from the saturating arithmetic it gets confused with.

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

<div class="svg-container" style="margin:2rem 0;">
<svg class="clamp-fig" viewBox="0 0 800 300" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="clamp evaluates a value against min and max, then merges all three outcomes into one bounded return value" >
<style>
.clamp-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .clamp-fig,[data-theme="dark"] .clamp-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.clamp-fig text{font-family:ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.clamp-fig .title{font-size:14px;font-weight:700}
.clamp-fig .body{font-size:12px;font-weight:600}
.clamp-fig .cap{font-size:11px;fill:var(--mut)}
.clamp-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.clamp-fig .acbox{fill:var(--ac);stroke:var(--ac)}
.clamp-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="clamp-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"></path>
</marker>
</defs>
<!-- input -->
<rect class="box" x="300" y="15" width="200" height="45" rx="8"></rect>
<text x="400" y="43" text-anchor="middle" class="body">value</text>
<!-- fan out to 3 branches -->
<path class="ln" d="M400,60 L400,85"></path>
<path class="ln" d="M160,85 L640,85"></path>
<path class="ln" d="M160,85 L160,110" marker-end="url(#clamp-arrow)"></path>
<path class="ln" d="M400,85 L400,110" marker-end="url(#clamp-arrow)"></path>
<path class="ln" d="M640,85 L640,110" marker-end="url(#clamp-arrow)"></path>
<!-- branch boxes -->
<rect class="box" x="60" y="110" width="200" height="55" rx="8"></rect>
<text x="160" y="133" text-anchor="middle" class="body">value &lt; min</text>
<text x="160" y="150" text-anchor="middle" class="cap">→ return min</text>
<rect class="box" x="300" y="110" width="200" height="55" rx="8"></rect>
<text x="400" y="133" text-anchor="middle" class="body">min ≤ value ≤ max</text>
<text x="400" y="150" text-anchor="middle" class="cap">→ return value</text>
<rect class="box" x="540" y="110" width="200" height="55" rx="8"></rect>
<text x="640" y="133" text-anchor="middle" class="body">value &gt; max</text>
<text x="640" y="150" text-anchor="middle" class="cap">→ return max</text>
<!-- merge into single call -->
<path class="ln" d="M160,165 L160,195"></path>
<path class="ln" d="M400,165 L400,195"></path>
<path class="ln" d="M640,165 L640,195"></path>
<path class="ln" d="M160,195 L640,195"></path>
<path class="ln" d="M400,195 L400,220" marker-end="url(#clamp-arrow)"></path>
<!-- output accent -->
<rect class="acbox" x="280" y="220" width="240" height="50" rx="8"></rect>
<text x="400" y="250" text-anchor="middle" class="body" fill="#ffffff">value.clamp(min, max)</text>
</svg>
</div>

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

<div class="svg-container" style="margin:2rem 0;">
<svg class="clampb-fig" viewBox="0 0 800 260" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="A negative interpolated coordinate cast to usize wraps around to a huge index and panics, whereas clamping before the cast keeps it inside the valid range">
<!-- style -->
<style>
.clampb-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00;--bad:#e11d48}
:root.dark .clampb-fig,[data-theme="dark"] .clampb-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.clampb-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.clampb-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.clampb-fig .boxbad{fill:var(--box);stroke:var(--bad);stroke-width:2}
.clampb-fig .ti{fill:var(--tx);font:700 13px ui-sans-serif,system-ui,sans-serif}
.clampb-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.clampb-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.clampb-fig .bad{fill:var(--bad);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.clampb-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.clampb-fig .lnbad{stroke:var(--bad);stroke-width:1.5;fill:none}
.clampb-fig .lnac{stroke:var(--ac);stroke-width:2;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="clampb-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
<marker id="clampb-arrowbad" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--bad)"/></marker>
<marker id="clampb-arrowac" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ac)"/></marker>
</defs>
<!-- top row: without clamp -->
<text x="20" y="30" class="ti">Without clamp — the cast is where it breaks</text>
<rect x="20" y="44" width="150" height="42" rx="5" class="box"/>
<text x="95" y="70" class="tx">cx = -0.3</text>
<path d="M170,65 L200,65" class="ln" marker-end="url(#clampb-arrow)"/>
<rect x="200" y="44" width="150" height="42" rx="5" class="box"/>
<text x="275" y="70" class="tx">floor → -1</text>
<path d="M350,65 L380,65" class="lnbad" marker-end="url(#clampb-arrowbad)"/>
<rect x="380" y="44" width="180" height="42" rx="5" class="boxbad"/>
<text x="470" y="63" class="tx">as usize</text>
<text x="470" y="79" class="mut">no negatives exist</text>
<path d="M560,65 L590,65" class="lnbad" marker-end="url(#clampb-arrowbad)"/>
<rect x="590" y="44" width="190" height="42" rx="5" class="boxbad"/>
<text x="685" y="63" class="bad">18446744073709551615</text>
<text x="685" y="79" class="mut">index out of bounds → panic</text>
<!-- bottom row: with clamp -->
<text x="20" y="150" class="ti">With clamp — bound it before the cast</text>
<rect x="20" y="164" width="150" height="42" rx="5" class="box"/>
<text x="95" y="190" class="tx">cx = -0.3</text>
<path d="M170,185 L200,185" class="ln" marker-end="url(#clampb-arrow)"/>
<rect x="200" y="164" width="150" height="42" rx="5" class="box"/>
<text x="275" y="190" class="tx">floor → -1.0</text>
<path d="M350,185 L380,185" class="lnac" marker-end="url(#clampb-arrowac)"/>
<rect x="380" y="164" width="180" height="42" rx="5" class="boxac"/>
<text x="470" y="183" class="tx">.clamp(0.0, w)</text>
<text x="470" y="199" class="mut">→ 0.0</text>
<path d="M560,185 L590,185" class="ln" marker-end="url(#clampb-arrow)"/>
<rect x="590" y="164" width="190" height="42" rx="5" class="box"/>
<text x="685" y="183" class="tx">as usize → 0</text>
<text x="685" y="199" class="mut">always a valid index</text>
<!-- footer -->
<text x="400" y="240" class="mut">The cast cannot represent a negative number — clamp has to happen while the value is still signed</text>
</svg>
</div>

## Key Takeaways

`value.clamp(min, max)` bounds a value in one call — no manual `if` logic needed.

Available in Rust's standard library since version 1.50 for both integers and floats.

C++ gained the equivalent in C++17; JavaScript and C still require manual implementations.

Do not confuse `clamp` with `saturating_add` / `saturating_sub` — those prevent integer overflow at type boundaries, not arbitrary custom bounds.

Getting the arguments backwards — `value.clamp(max, min)` — panics. `clamp` asserts
`min <= max` rather than quietly picking one, which is the right call but does mean a swapped
pair is a runtime failure, not a compile-time one.