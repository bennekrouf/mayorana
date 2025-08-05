---
id: blockchain-fundamentals-signature-coverage
title: Blockchain Fundamentals Part 19 - Signature Coverage and Replay Protection
slug: blockchain-fundamentals-part19-signature-coverage
author: mayo
locale: en
excerpt: Understanding how Solana prevents transaction modification and replay attacks
category: blockchain
tags:
  - crypto
  - blockchain
  - beginner
  - solana
  - security
  - replay-attacks
date: '2025-07-31'
---
# Blockchain Fundamentals Part 19: Signature Coverage and Replay Protection

## How does Solana ensure that the signature covers the full contents of a transaction, and how does this prevent replay attacks or modification?

**Signature Coverage:**
* The signed `message` includes:
   * **Transaction details** (sender, receiver, amount, recent blockhash).
   * **Blockhash:** Acts as a nonce (expires after ~2 minutes).

**Prevents:**
1. **Replay Attacks:** Without a valid recent blockhash, old transactions can't be re-submitted.
2. **Modification:** Changing any field (e.g., recipient) invalidates `H(R || A || message)`, breaking the signature.

**Example:**
```json
// Transaction data  
{
  "sender": "Alice",
  "receiver": "Bob",
  "amount": 1,
  "blockhash": "abc123...",
  "signature": "(R, s)"
}
```

* Altering `"amount": 2` → New `message` → Invalid signature!

**Code Example:**
```javascript
function serializeTransaction(tx) {
    // All fields are included in the signed message
    return JSON.stringify({
        sender: tx.sender,
        receiver: tx.receiver,
        amount: tx.amount,
        blockhash: tx.blockhash,
        instructions: tx.instructions
    });
}

// Any change breaks the signature
const originalTx = { sender: "Alice", receiver: "Bob", amount: 1, blockhash: "abc123" };
const tamperedTx = { sender: "Alice", receiver: "Eve", amount: 1, blockhash: "abc123" };

const originalMessage = serializeTransaction(originalTx);
const tamperedMessage = serializeTransaction(tamperedTx);

// Different messages = different signatures required
console.log(originalMessage !== tamperedMessage); // true
```

## Key Takeaway
✅ **Complete coverage**: Signature includes all transaction data + recent blockhash, preventing modification and replay attacks.