---
id: blockchain-fundamentals-scalar-multiplication
title: Blockchain Fundamentals Part 9 - Double-and-Add Algorithm
slug: blockchain-fundamentals-part9-scalar-multiplication
author: mayo
locale: en
excerpt: Understanding how scalar multiplication is optimized using the double-and-add algorithm
category: blockchain
tags:
  - crypto
  - blockchain
  - beginner
  - solana
  - elliptic-curves
  - algorithms
date: '2025-07-31'
---
# Blockchain Fundamentals Part 9: Double-and-Add Algorithm

## How is scalar multiplication (e.g., `a * P`) optimized using the double-and-add algorithm, and why is this important for performance?

**What is Scalar Multiplication?** It's calculating `a * P` (adding `P` to itself `a` times). A naive approach (e.g., `13*P = P + P + ... + P`) is too slow for large `a` (like 256-bit numbers in cryptography).

**Double-and-Add Algorithm**
* **Idea:** Break `a` into binary and process each bit.
* **Steps:**
   1. Start with `result = 0` (point at infinity).
   2. For each bit in `a` (from left to right):
      * **Double** the result.
      * If the bit is `1`, **add** `P`.

**Example:** Compute `13 * P` (`13` is `1101` in binary).

* Initialize: `result = 0`.
* Bit 1 (`1`):
   * Double: `0 → 0` (still `0`).
   * Add `P`: `0 + P = P`.
* Bit 2 (`1`):
   * Double: `P → 2P`.
   * Add `P`: `2P + P = 3P`.
* Bit 3 (`0`):
   * Double: `3P → 6P`.
   * No add (bit is `0`).
* Bit 4 (`1`):
   * Double: `6P → 12P`.
   * Add `P`: `12P + P = 13P`.

**Code Example:**
```javascript
function scalarMultiply(scalar, point) {
    let result = Point.infinity();
    const bits = scalar.toString(2); // Convert to binary
    
    for (let bit of bits) {
        result = pointDouble(result);
        if (bit === '1') {
            result = pointAdd(result, point);
        }
    }
    return result;
}
```

**Why It's Fast:**
* Instead of `13` additions, we do `3` doublings and `2` additions (`O(log n)` vs `O(n)`).
* Critical for ECC performance (real-world scalars are **huge**, e.g., `2²⁵⁶`).

## Key Takeaway
✅ **Double-and-add**: Reduces scalar multiplication from `O(n)` to `O(log n)` complexity.