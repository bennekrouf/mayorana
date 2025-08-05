---
id: blockchain-fundamentals-ed25519-keys
title: Blockchain Fundamentals Part 13 - Ed25519 Key Generation
slug: blockchain-fundamentals-part13-ed25519-keys
author: mayo
locale: en
excerpt: Understanding how Ed25519 private and public keys are generated and why it's secure
category: blockchain
tags:
  - crypto
  - blockchain
  - beginner
  - solana
  - elliptic-curves
  - ed25519
date: '2025-07-31'
---
# Blockchain Fundamentals Part 13: Ed25519 Key Generation

## In Ed25519, if the private key is a scalar a, how is the public key A computed, and why is this computation secure?

**Key Generation in Ed25519:**

1. **Private Key (a):** A random 256-bit scalar (with some bits tweaked for security).
2. **Public Key (A):** Computed as `A = a ⋅ B`, where B is the base point.

**Why Secure?**
* The **Elliptic Curve Discrete Logarithm Problem (ECDLP)** makes it infeasible to reverse `A = a ⋅ B` to find a.
* Even if you know A and B, computing a requires solving `a = log_B(A)`, which is computationally intractable for large curves.

**Code Example:**
```javascript
// Simplified Ed25519 key generation
function generateKeyPair() {
    // Step 1: Generate random private key (256 bits)
    const privateKey = generateRandomScalar(256);
    
    // Step 2: Apply Ed25519 clamping for security
    const clampedPrivateKey = clampPrivateKey(privateKey);
    
    // Step 3: Compute public key A = a * B
    const publicKey = scalarMultiply(clampedPrivateKey, ED25519_BASEPOINT);
    
    return {
        privateKey: clampedPrivateKey,
        publicKey: publicKey
    };
}

function clampPrivateKey(key) {
    // Ed25519 specific clamping
    key[0] &= 248;  // Clear bottom 3 bits
    key[31] &= 127; // Clear top bit  
    key[31] |= 64;  // Set second-highest bit
    return key;
}
```

**Security Properties:**
* **One-way function:** Easy to compute A from a, hard to find a from A
* **256-bit security:** Would take 2^128 operations to break (infeasible)
* **Clamping ensures:** Private key always in correct subgroup

**Real-World Usage:**
```javascript
// In Solana (simplified)
const keypair = {
    privateKey: new Uint8Array(32), // 256-bit scalar a
    publicKey: scalarMultiply(privateKey, basePoint) // A = a * B
};

// Public key can be shared safely
console.log("Public key:", keypair.publicKey);
// Private key must never be shared
```

## Key Takeaway
✅ **Ed25519 security**: Based on ECDLP hardness. Public key A = a ⋅ B is safe to share, private key a must stay secret.