---
id: blockchain-fundamentals-solana-verification-simplified
title: Blockchain Fundamentals Part 17 - How Solana Verifies a Transaction Signature (Ed25519)
slug: blockchain-fundamentals-part17-solana-verification-simplified
author: mayo
locale: en
excerpt: A simplified explanation with real numbers showing how Solana validates Ed25519 signatures
category: blockchain
tags:
  - crypto
  - blockchain
  - beginner
  - solana
  - ed25519
  - transaction-verification
date: '2025-07-31'
---
# Blockchain Fundamentals Part 17: How Solana Verifies a Transaction Signature (Ed25519)

Let's break it down with **real numbers** (small-scale example) to make it crystal clear.

## Key Players in a Solana Transaction:

1. **Private Key (`a`)**: A secret number (e.g., `a = 5`).
2. **Public Key (`A`)**: Derived as `A = a * B` (where `B` is a standard base point).
   * Example: If `B = (2, 3)` on a toy curve, `A = 5 * (2, 3) = (some x, y)`.
3. **Signature (`R, s`)**: Generated when signing a transaction.

## Step-by-Step Verification

**Goal:** Verify that the signature `(R, s)` was created by the owner of `A` for the exact transaction data.

### 1. Signature Creation (Simplified)

When signing, the wallet:

1. Computes a **nonce** `r` (a random-looking number derived from the private key and message).
   * Example: `r = 7` (deterministic but unpredictable).

2. Computes `R = r * B` (a curve point).
   * Example: `R = 7 * (2, 3) = (some x, y)`.

3. Computes `s = r + (H(R || A || message) * a)`.
   * `H(...)` is a hash function (like SHA-512).
   * Example: If `H(R || A || message) = 10`, then `s = 7 + 10 * 5 = 57`.

**Final Signature:** `(R = (x, y), s = 57)`.

### 2. Verification (How Solana Checks It)

Solana receives `(R, s)`, the `message`, and the public key `A`. It checks:

**Equation to Verify:**
```
s * B == R + H(R || A || message) * A  
```

**Plugging in Our Example:**

1. **Left Side (`s * B`)**: `57 * B` (i.e., add `B` to itself 57 times).

2. **Right Side (`R + H(...) * A`)**:
   * `H(R || A || message) = 10` (same hash as before).
   * `10 * A = 10 * (a * B) = 10 * (5 * B) = 50 * B`.
   * Add `R` (which is `7 * B`): `50 * B + 7 * B = 57 * B`.

**Result:** Both sides equal `57 * B` → **Signature is valid!**

## Why Can't You Fake It?

To forge a signature, you'd need to solve for `s` in: `s * B = R + H(...) * A`

Without knowing `a` (private key), this is **impossible** for classical computers (thanks to the **elliptic curve discrete logarithm problem**).

## Real-World Analogy:

Imagine:
* Your **signature** = a wax seal stamped with a secret ring.
* **Verification** = checking if the seal matches the ring's public design.
* If you change even **one letter** in the message, the seal breaks.

Solana does this mathematically, ensuring no tampering.

## Code Example:

```javascript
function verifySignatureStepByStep(signature, message, publicKey) {
    const { R, s } = signature;
    
    // Step 1: Compute challenge hash
    const challenge = sha512(R + publicKey + message) % CURVE_ORDER;
    console.log(`Challenge: ${challenge}`);
    
    // Step 2: Compute left side (s * B)
    const leftSide = scalarMultiply(s, ED25519_BASEPOINT);
    console.log(`Left side: s * B = ${s} * B`);
    
    // Step 3: Compute right side (R + challenge * A)
    const challengeTimesA = scalarMultiply(challenge, publicKey);
    const rightSide = pointAdd(R, challengeTimesA);
    console.log(`Right side: R + ${challenge} * A`);
    
    // Step 4: Check if both sides are equal
    const isValid = leftSide.equals(rightSide);
    console.log(`Verification: ${isValid ? 'VALID' : 'INVALID'}`);
    
    return isValid;
}
```

## Key Takeaways:

1. Signatures bind to the **exact transaction data** (due to hashing).
2. Verification uses **public keys** (no secret needed).
3. **No forgeries** because you can't reverse the math without the private key.

## Summary
✅ **Ed25519 verification**: Mathematical proof that only the private key holder could have created the signature for that specific message.