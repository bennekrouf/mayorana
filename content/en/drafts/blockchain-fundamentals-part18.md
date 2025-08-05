---
id: blockchain-fundamentals-nonce-reuse
title: Blockchain Fundamentals Part 18 - Dangers of Nonce Reuse in Signatures
slug: blockchain-fundamentals-part18-nonce-reuse
author: mayo
locale: en
excerpt: Understanding why nonce reuse in digital signatures can lead to private key compromise
category: blockchain
tags:
  - crypto
  - blockchain
  - beginner
  - solana
  - security
  - nonce-reuse
date: '2025-07-31'
---
# Blockchain Fundamentals Part 18: Dangers of Nonce Reuse in Signatures

## What would happen if two Solana transactions used the same nonce r when signing different messages — and why is this dangerous?

**What is a Nonce?**
* A **number used once** (`r`) in signatures to ensure uniqueness. In EdDSA, it's derived deterministically from the private key and message.

**Danger of Reuse:**

1. **Private Key Leak:**
   * If two messages `m1` and `m2` share `(R, s1)` and `(R, s2)`:
      * Attacker can compute: `s1 - s2 ≡ (H(R||A||m1) - H(R||A||m2))⋅a mod n`
      * Solve for `a` (private key)!

2. **Forgery:** New signatures can be fabricated for arbitrary messages.

**Attack Example:**
```javascript
// Dangerous scenario: Same nonce for different messages
function demonstrateNonceReuseAttack() {
    const privateKey = 12345; // Example private key
    const nonce = 678; // SAME nonce used for both signatures
    
    // Two different messages
    const message1 = "Send 10 SOL to Alice";
    const message2 = "Send 100 SOL to Bob";
    
    // Both signatures use same R = nonce * B
    const R = scalarMultiply(nonce, ED25519_BASEPOINT);
    
    // Compute challenges
    const h1 = sha512(R + publicKey + message1) % CURVE_ORDER;
    const h2 = sha512(R + publicKey + message2) % CURVE_ORDER;
    
    // Create signatures
    const s1 = (nonce + h1 * privateKey) % CURVE_ORDER;
    const s2 = (nonce + h2 * privateKey) % CURVE_ORDER;
    
    // ATTACK: Recover private key
    const sDiff = (s1 - s2 + CURVE_ORDER) % CURVE_ORDER;
    const hDiff = (h1 - h2 + CURVE_ORDER) % CURVE_ORDER;
    const recoveredPrivateKey = (sDiff * modInverse(hDiff, CURVE_ORDER)) % CURVE_ORDER;
    
    console.log("Original private key:", privateKey);
    console.log("Recovered private key:", recoveredPrivateKey);
    // They match! Private key compromised!
}
```

**Historical Examples:**
```javascript
// Famous nonce reuse incidents
const incidents = [
    {
        system: "PlayStation 3",
        year: 2010,
        cause: "Sony used same nonce for all ECDSA signatures",
        result: "Console security completely broken"
    },
    {
        system: "Android Bitcoin wallets",
        year: 2013,
        cause: "Weak random number generation",
        result: "Multiple wallets compromised"
    }
];
```

**Solana's Protection:**
```javascript
// Solana uses deterministic nonces to prevent reuse
function generateSolanaNonce(privateKey, message) {
    // Hash private key to get deterministic randomness
    const privateKeyHash = sha512(privateKey);
    
    // Combine with message for unique nonce per message
    const nonce = sha512(privateKeyHash + message) % CURVE_ORDER;
    
    // Same message + same key = same nonce (deterministic)
    // Different message = different nonce (secure)
    return nonce;
}
```

**Why Deterministic Nonces Work:**
* **Prevents reuse:** Different messages always produce different nonces
* **No random number dependency:** Eliminates weak RNG vulnerabilities
* **Reproducible:** Same inputs always produce same signature

**Security Comparison:**
```javascript
// ❌ Dangerous: Random nonce generation
const randomNonce = Math.random() * CURVE_ORDER; // Could repeat!

// ✅ Safe: Deterministic nonce generation
const safeNonce = sha512(privateKeyHash + message) % CURVE_ORDER;
```

## Key Takeaway
✅ **Nonce reuse catastrophic**: Instantly compromises private keys. Solana uses deterministic nonces to prevent this.