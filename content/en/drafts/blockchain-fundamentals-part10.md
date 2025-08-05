---
id: blockchain-fundamentals-one-way-function
title: Blockchain Fundamentals Part 10 - Scalar Multiplication as One-Way Function
slug: blockchain-fundamentals-part10-one-way-function
author: mayo
locale: en
excerpt: Understanding why scalar multiplication is a one-way function and the discrete logarithm problem
category: blockchain
tags:
  - crypto
  - blockchain
  - beginner
  - solana
  - elliptic-curves
  - cryptography
date: '2025-07-31'
---
# Blockchain Fundamentals Part 10: Scalar Multiplication as One-Way Function

## Why is scalar multiplication considered a one-way function, and how does this relate to the hardness of the discrete logarithm problem (DLP)?

**One-Way Function:**
* Easy to compute `Q = a * P` given `a` and `P`.
* **Hard** to find `a` given `Q` and `P` (this is the **discrete logarithm problem (DLP)**).

**Example:**
* If `P = (2, 3)` and `Q = 13 * P = (6, 3)`, figuring out `13` requires checking all possible multiples (brute-force).

**Why It's Hard:**
* No known efficient algorithm to solve DLP for elliptic curves (unlike factoring in RSA).
* Security relies on this asymmetry:
   * **Easy:** Compute `a * P` (fast with double-and-add).
   * **Hard:** Reverse it (infeasible for large keys).

**Code Example:**
```javascript
// Easy direction: Given private key, compute public key
function computePublicKey(privateKey, basePoint) {
    return scalarMultiply(privateKey, basePoint); // Fast O(log n)
}

// Hard direction: Given public key, find private key
function findPrivateKey(publicKey, basePoint) {
    // Brute force - computationally infeasible for large keys
    for (let i = 1; i < LARGE_NUMBER; i++) {
        if (scalarMultiply(i, basePoint).equals(publicKey)) {
            return i; // Found private key!
        }
    }
    return null; // Takes too long for cryptographic key sizes
}
```

**Relation to Cryptography:**
* ECC keys are secure because deriving the private key `a` from `Q = a * P` is computationally infeasible.

**Real-World Impact:**
* 256-bit keys: ~2²⁵⁶ possible values to check
* Even with fastest computers, would take longer than age of universe

## Key Takeaway
✅ **One-way function**: Easy forward (`a * P`), hard backward (find `a` from `Q = a * P`). This asymmetry secures ECC.