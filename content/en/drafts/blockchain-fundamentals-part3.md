---
id: blockchain-fundamentals-modular-multiplication
title: Blockchain Fundamentals Part 3 - Modular Multiplication in ECC
slug: blockchain-fundamentals-part3-modular-multiplication
author: mayo
locale: en
excerpt: Understanding why modular multiplication is essential in elliptic curve cryptography
category: blockchain
tags:
  - crypto
  - blockchain
  - beginner
  - solana
  - elliptic-curves
  - modular-arithmetic
date: '2025-07-31'
---
# Blockchain Fundamentals Part 3: Modular Multiplication in ECC

## If `x = 5` and `y = 8`, compute `x * y mod 17`, and explain why modular multiplication is used instead of regular multiplication in ECC.

**Calculation**: 
- `5 * 8 = 40` 
- `40 mod 17 = 6` (since `17 * 2 = 34`, remainder is `6`).

**Code Example**:
```javascript
function modularMultiply(x, y, p) {
    return (x * y) % p;
}

const x = 5;
const y = 8;
const p = 17;

console.log(modularMultiply(x, y, p)); // Output: 6
```

**Why Modular Arithmetic?**
* ECC works over a **finite field** (numbers wrap around after `p-1`).
* Prevents numbers from growing infinitely (important for cryptography).
* Ensures all operations stay within bounds (e.g., `x` and `y` coordinates must be `< p`).

**Practical Example**:
```javascript
// Without modular arithmetic - numbers grow uncontrollably
let regularResult = 5;
for (let i = 0; i < 10; i++) {
    regularResult *= 8;
    console.log(`Step ${i + 1}: ${regularResult}`);
}
// Output: 40, 320, 2560, 20480, 163840... (exponential growth!)

// With modular arithmetic - numbers stay bounded
let modularResult = 5;
const modulus = 17;
for (let i = 0; i < 10; i++) {
    modularResult = (modularResult * 8) % modulus;
    console.log(`Step ${i + 1}: ${modularResult}`);
}
// Output: 6, 14, 10, 12, 11, 3, 7, 5, 6... (cycles within [0, 16])
```

## Key Takeaway
✅ **Modular multiplication**: Keeps cryptographic operations bounded and manageable within finite fields.