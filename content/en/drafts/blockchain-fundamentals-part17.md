---
id: blockchain-fundamentals-solana-verification
title: Blockchain Fundamentals Part 17 - Solana Ed25519 Signature Verification
slug: blockchain-fundamentals-part17-solana-verification
author: mayo
locale: en
excerpt: Understanding how Solana validates transaction signatures using Ed25519
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
# Blockchain Fundamentals Part 17: Solana Ed25519 Signature Verification

## Solana uses Ed25519 for transaction signatures — how does Solana verify a transaction is valid using the signature (R, s)?

**Verification Steps:**

1. **Extract (R, s):** From the transaction metadata.
2. **Compute Challenge Hash:**
   * `H(R || A || message)`, where:
      * `A` = public key.
      * `message` = serialized transaction data.
3. **Check Curve Equation:**
   * Verify that `s⋅B == R + H(R || A || message)⋅A` (where `B` is the Ed25519 base point).

**Why This Works:**
* Only the true signer (knowing private key `a`) can produce `s = (r + H(...)⋅a) mod n`.

**Code Example:**
```javascript
function verifySolanaTransaction(transaction, signature, publicKey) {
    // Step 1: Extract signature components
    const { R, s } = signature;
    
    // Step 2: Serialize transaction data (Solana-specific format)
    const message = serializeTransaction(transaction);
    
    // Step 3: Compute challenge hash
    const challenge = sha512(R + publicKey + message) % CURVE_ORDER;
    
    // Step 4: Verify curve equation: s*B == R + challenge*A
    const leftSide = scalarMultiply(s, ED25519_BASEPOINT);
    const rightSide = pointAdd(R, scalarMultiply(challenge, publicKey));
    
    return leftSide.equals(rightSide);
}
```

**Solana Transaction Structure:**
```javascript
// Simplified Solana transaction
const transaction = {
    recentBlockhash: "...",
    instructions: [
        {
            programId: "11111111111111111111111111111112", // System program
            accounts: [/* account references */],
            data: Buffer.from([/* instruction data */])
        }
    ],
    signatures: [
        {
            publicKey: "...",
            signature: { R: "...", s: "..." }
        }
    ]
};
```

**Verification in Practice:**
```javascript
// How Solana validators verify transactions
function validateTransaction(tx) {
    for (const sig of tx.signatures) {
        const isValid = verifySolanaTransaction(
            tx,
            sig.signature,
            sig.publicKey
        );
        
        if (!isValid) {
            return false; // Transaction rejected
        }
    }
    
    return true; // All signatures valid
}
```

**Security Properties:**
* **Authentication:** Proves the transaction was signed by the private key holder
* **Integrity:** Any modification to transaction data invalidates the signature
* **Non-repudiation:** Signer cannot deny creating the signature

**Performance Benefits:**
* Ed25519 verification is fast (~100k verifications/second on modern hardware)
* Enables Solana's high throughput (65k+ transactions/second)

## Key Takeaway
✅ **Solana verification**: Uses Ed25519 equation `s⋅B == R + H(R || A || message)⋅A` to validate transaction authenticity.