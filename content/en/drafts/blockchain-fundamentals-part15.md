---
id: blockchain-fundamentals-hashing-signatures
title: Blockchain Fundamentals Part 15 - Why Hash Functions in Signatures
slug: blockchain-fundamentals-part15-hashing-signatures
author: mayo
locale: en
excerpt: Understanding why hash functions are essential in digital signature schemes
category: blockchain
tags:
  - crypto
  - blockchain
  - beginner
  - solana
  - digital-signatures
  - hash-functions
date: '2025-07-31'
---
# Blockchain Fundamentals Part 15: Why Hash Functions in Signatures

## Explain why a signature scheme requires a hash function (e.g., SHA-512) in the signing process. What could go wrong if the hash was omitted?

**Role of Hashing:**

1. **Message Compression:** Hashes reduce arbitrary-length messages to fixed-size digests (e.g., SHA-512 → 512 bits).
2. **Randomization:** Ensures signatures are unique even for similar messages.
3. **Security Properties:**
   * Prevents **forgery** by binding the signature to the exact message.
   * Thwarts **length-extension attacks** (if using SHA-512/256).

**Dangers of Omitting Hash:**
* **Malleability:** An attacker could tweak the message without invalidating the signature.
* **Collision Attacks:** Two different messages could produce the same signature.
* **Bogus Signatures:** Without hashing, algebraic tricks might forge valid-looking signatures.

**Code Example - With Hash (Secure):**
```javascript
function signWithHash(message, privateKey) {
    // Step 1: Hash the message first
    const messageHash = sha512(message);
    
    // Step 2: Generate nonce from hash
    const r = sha512(privateKey + messageHash) % CURVE_ORDER;
    
    // Step 3: Create signature components
    const R = scalarMultiply(r, ED25519_BASEPOINT);
    const challenge = sha512(R + publicKey + messageHash) % CURVE_ORDER;
    const s = (r + challenge * privateKey) % CURVE_ORDER;
    
    return { R, s };
}
```

**Code Example - Without Hash (Vulnerable):**
```javascript
function signWithoutHash(message, privateKey) {
    // DANGEROUS: Using raw message
    const r = sha512(privateKey + message) % CURVE_ORDER; // Problem if message is huge
    
    const R = scalarMultiply(r, ED25519_BASEPOINT);
    const challenge = sha512(R + publicKey + message) % CURVE_ORDER; // Vulnerable to manipulation
    const s = (r + challenge * privateKey) % CURVE_ORDER;
    
    return { R, s };
}
```

**Attack Examples:**
```javascript
// Malleability attack example
const originalMessage = "Send 100 SOL to Alice";
const tamperedMessage = "Send 100 SOL to Bob  "; // Added spaces

// Without hashing, these might produce related signatures
// that could be manipulated by attackers

// With proper hashing, any change invalidates the signature
const hash1 = sha512(originalMessage); // Different
const hash2 = sha512(tamperedMessage); // Different
```

**Example:**
* In Ed25519, SHA-512 hashes both the message and nonce to ensure deterministic but unpredictable signatures.

**Real-World Consequences:**
* **Bitcoin's early vulnerability:** Some implementations allowed signature malleability
* **Smart contract exploits:** Unhashed signatures can lead to replay attacks
* **Data integrity loss:** Messages could be altered without detection

## Key Takeaway
✅ **Hash functions essential**: Provide message compression, prevent malleability, and ensure signature security.