---
id: blockchain-fundamentals-point-operations
title: Blockchain Fundamentals Part 7 - Point Addition vs Point Doubling
slug: blockchain-fundamentals-part7-point-operations
author: mayo
locale: en
excerpt: Understanding the difference between point addition and point doubling in elliptic curve arithmetic
category: blockchain
tags:
  - crypto
  - blockchain
  - beginner
  - solana
  - elliptic-curves
  - point-operations
date: '2025-07-31'
---
# Blockchain Fundamentals Part 7: Point Addition vs Point Doubling

## Explain the difference between point addition and point doubling in elliptic curve arithmetic, and describe when each is used during scalar multiplication.

**Point Addition (`P + Q`)**
* **What it does:** Adds two **different** points `P` and `Q` to get a third point `R`.
* **How it works geometrically:**
   1. Draw a line through `P` and `Q`.
   2. Find where it intersects the curve again.
   3. Reflect that point over the x-axis to get `R`.

**Point Doubling (`2P` or `P + P`)**
* **What it does:** Adds a point **to itself**.
* **How it works geometrically:**
   1. Draw a tangent line at `P`.
   2. Find where it intersects the curve again.
   3. Reflect that point to get `2P`.

**When Are They Used?**
* **Scalar multiplication** (e.g., `13 * P`) breaks down into a series of additions and doublings:
   * Example: `13 * P = 8P + 4P + P` (computed via double-and-add, explained later).
   * **Doubling** is used when the scalar's binary representation has a `1`.
   * **Addition** is used to combine intermediate results.

**Code Example:**
```javascript
function scalarMultiply(scalar, point) {
    let result = Point.infinity(); // Start with "zero" point
    for (let bit of scalar.toBinary()) {
        result = double(result); // Always double
        if (bit === 1) {
            result = add(result, point); // Conditionally add
        }
    }
    return result;
}
```

## Key Takeaway
✅ **Point addition**: For different points. **Point doubling**: For the same point. Both essential for scalar multiplication.