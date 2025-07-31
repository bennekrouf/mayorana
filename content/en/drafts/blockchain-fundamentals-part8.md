---
id: blockchain-fundamentals-point-doubling-calculation
title: Blockchain Fundamentals Part 8 - Point Doubling Calculation
slug: blockchain-fundamentals-part8-point-doubling-calculation
author: mayo
locale: en
excerpt: Step-by-step calculation of point doubling using the group law on elliptic curves
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
# Blockchain Fundamentals Part 8: Point Doubling Calculation

## Using `P = (5, 1)` on the curve `y² = x³ + 2x + 3 mod 17`, compute `2P` using the group law. What modular inverse do you compute, and why?

**Step 1: Recall the Doubling Formula**

For `P = (x₁, y₁)`, `2P = (x₃, y₃)` is computed as:

1. Slope: `s = (3x₁² + a) / (2y₁) mod p` (Here, `a = 2`)
2. `x₃ = s² - 2x₁ mod p`
3. `y₃ = s(x₁ - x₃) - y₁ mod p`

**Step 2: Plug in `P = (5, 1)`**

1. **Compute slope `s`:**
   * Numerator: `3×(5)² + 2 = 75 + 2 = 77`
   * `77 mod 17 = 9` (since `77 - 4×17 = 9`)
   * Denominator: `2×1 = 2`
   * Need: `s = (9 / 2) mod 17` → **modular inverse of 2**
   * Find `2⁻¹ mod 17`: `2×9 = 18 ≡ 1 mod 17` → `2⁻¹ = 9`
   * Thus: `s = 9×9 = 81 mod 17 = 13`

2. **Compute `x₃`:**
   * `x₃ = s² - 2x₁ = 13² - 2×5 = 169 - 10 = 159 mod 17`
   * `159 - 9×17 = 159 - 153 = 6`
   * So: `x₃ = 6`

3. **Compute `y₃`:**
   * `y₃ = s(x₁ - x₃) - y₁ = 13×(5 - 6) - 1 = 13×(-1) - 1 = -14 mod 17`
   * `-14 + 17 = 3`
   * So: `y₃ = 3`

**Final Answer:** `2P = (6, 3)`

**Code Example:**
```javascript
function pointDouble(point, a, p) {
    const { x, y } = point;
    
    // Calculate slope: s = (3x² + a) / (2y) mod p
    const numerator = (3 * x * x + a) % p;
    const denominator = (2 * y) % p;
    const slope = (numerator * modInverse(denominator, p)) % p;
    
    // Calculate new coordinates
    const x3 = (slope * slope - 2 * x) % p;
    const y3 = (slope * (x - x3) - y) % p;
    
    return { x: (x3 + p) % p, y: (y3 + p) % p };
}
```

**Why Did We Need the Modular Inverse?**
* To compute slope `s`, we had to divide by `2` (multiply by `2⁻¹ mod 17`)
* Modular inverses are **essential** for division in ECC arithmetic

## Key Takeaway
✅ **Point doubling**: Uses tangent slope and requires modular inverse for division operations.