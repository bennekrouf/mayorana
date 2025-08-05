---
id: blockchain-fundamentals-eddsa-signature
title: Blockchain Fundamentals Part 14 - EdDSA Signature Components
slug: blockchain-fundamentals-part14-eddsa-signature
author: mayo
locale: en
excerpt: Understanding the components of an EdDSA signature and how they are derived
category: blockchain
tags:
  - crypto
  - blockchain
  - beginner
  - solana
  - elliptic-curves
  - digital-signatures
date: '2025-07-31'
---
# Blockchain Fundamentals Part 14: EdDSA Signature Components

## What are the components of an EdDSA signature (R, s), and how are each of these values derived from the message and private key?

**EdDSA Signature Steps:**

1. **Nonce Generation:**
   * Compute `r = H(hash || message)`, where hash is part of the private key.
   * Ensures randomness per signature (deterministic but unpredictable).

2. **Compute R:** `R = r ⋅ B` (a curve point).

3. **Compute s:** `s = (r + H(R || A || message) ⋅ a) mod n`
   * n = order of the curve.
   * A = public key.

**Components:**
* **R:** A curve point, acts as a "commitment" to randomness.
* **s:** A scalar, binds the signature to the message and private key.

**Code Example:**
```javascript
function signMessage(message, privateKey, publicKey) {
    // Step 1: Generate deterministic nonce
    const hash = sha512(privateKey); // Hash of private key
    const r = sha512(hash + message) % CURVE_ORDER; // Deterministic but unpredictable
    
    // Step 2: Compute R = r * B
    const R = scalarMultiply(r, ED25519_BASEPOINT);
    
    // Step 3: Compute challenge
    const challenge = sha512(R + publicKey + message) % CURVE_ORDER;
    
    // Step 4: Compute s = (r + challenge * privateKey) mod n
    const s = (r + challenge * privateKey) % CURVE_ORDER;
    
    return {
        R: R,      // Curve point (32 bytes)
        s: s       // Scalar (32 bytes)
    };
}
```

**Verification Process:**
```javascript
function verifySignature(message, signature, publicKey) {
    const { R, s } = signature;
    
    // Recompute challenge
    const challenge = sha512(R + publicKey + message) % CURVE_ORDER;
    
    // Check: s * B == R + challenge * A
    const leftSide = scalarMultiply(s, ED25519_BASEPOINT);
    const rightSide = pointAdd(R, scalarMultiply(challenge, publicKey));
    
    return leftSide.equals(rightSide);
}
```

**Why Secure?**
* Without a, you can't compute s correctly.
* R ensures no reuse of nonce r.
* Deterministic nonce prevents attacks from bad randomness.

**Security Properties:**
* **Unforgeability:** Can't create valid signatures without private key
* **Non-repudiation:** Signature proves message came from key holder
* **Deterministic:** Same message + key always produces same signature

## Key Takeaway
✅ **EdDSA signature (R, s)**: R commits to randomness, s binds signature to message and private key.