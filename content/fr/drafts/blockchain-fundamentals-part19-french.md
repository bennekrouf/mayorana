---
id: blockchain-fundamentals-signature-coverage
title: Fondamentaux Blockchain Partie 19 - Couverture de signature et protection contre le rejeu
slug: blockchain-fundamentals-part19-signature-coverage
author: mayo
locale: fr
excerpt: Comprendre comment Solana prévient la modification de transaction et les attaques de rejeu
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
# Fondamentaux Blockchain Partie 19 : Couverture de signature et protection contre le rejeu

## Comment Solana s'assure que la signature couvre tout le contenu d'une transaction, et comment ça prévient les attaques de rejeu ou la modification ?

**Couverture de signature :**
* Le `message` signé inclut :
   * **Détails de transaction** (expéditeur, destinataire, montant, blockhash récent).
   * **Blockhash :** Agit comme un nonce (expire après ~2 minutes).

**Prévient :**
1. **Attaques de rejeu :** Sans un blockhash récent valide, les anciennes transactions ne peuvent pas être re-soumises.
2. **Modification :** Changer n'importe quel champ (ex: destinataire) invalide `H(R || A || message)`, cassant la signature.

**Exemple :**
```json
// Données de transaction  
{
  "sender": "Alice",
  "receiver": "Bob",
  "amount": 1,
  "blockhash": "abc123...",
  "signature": "(R, s)"
}
```

* Modifier `"amount": 2` → Nouveau `message` → Signature invalide !

**Exemple de code :**
```javascript
function serializeTransaction(tx) {
    // Tous les champs sont inclus dans le message signé
    return JSON.stringify({
        sender: tx.sender,
        receiver: tx.receiver,
        amount: tx.amount,
        blockhash: tx.blockhash,
        instructions: tx.instructions
    });
}

// Tout changement casse la signature
const originalTx = { sender: "Alice", receiver: "Bob", amount: 1, blockhash: "abc123" };
const tamperedTx = { sender: "Alice", receiver: "Eve", amount: 1, blockhash: "abc123" };

const originalMessage = serializeTransaction(originalTx);
const tamperedMessage = serializeTransaction(tamperedTx);

// Messages différents = signatures différentes requises
console.log(originalMessage !== tamperedMessage); // true
```

## Point clé
✅ **Couverture complète** : La signature inclut toutes les données de transaction + blockhash récent, prévenant modification et attaques de rejeu.