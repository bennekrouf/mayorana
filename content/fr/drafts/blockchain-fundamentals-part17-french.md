---
id: blockchain-fundamentals-solana-verification
title: Fondamentaux Blockchain Partie 17 - Vérification de signature Ed25519 Solana
slug: blockchain-fundamentals-part17-solana-verification
author: mayo
locale: fr
excerpt: Comprendre comment Solana valide les signatures de transaction avec Ed25519
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
# Fondamentaux Blockchain Partie 17 : Vérification de signature Ed25519 Solana

## Solana utilise Ed25519 pour les signatures de transaction — comment Solana vérifie qu'une transaction est valide en utilisant la signature (R, s) ?

**Étapes de vérification :**

1. **Extraire (R, s) :** Depuis les métadonnées de la transaction.
2. **Calculer le hash de défi :**
   * `H(R || A || message)`, où :
      * `A` = clé publique.
      * `message` = données de transaction sérialisées.
3. **Vérifier l'équation de courbe :**
   * Vérifier que `s⋅B == R + H(R || A || message)⋅A` (où `B` est le point de base Ed25519).

**Pourquoi ça marche :**
* Seul le vrai signataire (connaissant la clé privée `a`) peut produire `s = (r + H(...)⋅a) mod n`.

**Exemple de code :**
```javascript
function verifySolanaTransaction(transaction, signature, publicKey) {
    // Étape 1 : Extraire les composants de signature
    const { R, s } = signature;
    
    // Étape 2 : Sérialiser les données de transaction (format spécifique Solana)
    const message = serializeTransaction(transaction);
    
    // Étape 3 : Calculer le hash de défi
    const challenge = sha512(R + publicKey + message) % CURVE_ORDER;
    
    // Étape 4 : Vérifier l'équation de courbe : s*B == R + challenge*A
    const leftSide = scalarMultiply(s, ED25519_BASEPOINT);
    const rightSide = pointAdd(R, scalarMultiply(challenge, publicKey));
    
    return leftSide.equals(rightSide);
}
```

**Structure de transaction Solana :**
```javascript
// Transaction Solana simplifiée
const transaction = {
    recentBlockhash: "...",
    instructions: [
        {
            programId: "11111111111111111111111111111112", // Programme système
            accounts: [/* références de comptes */],
            data: Buffer.from([/* données d'instruction */])
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

**Vérification en pratique :**
```javascript
// Comment les validateurs Solana vérifient les transactions
function validateTransaction(tx) {
    for (const sig of tx.signatures) {
        const isValid = verifySolanaTransaction(
            tx,
            sig.signature,
            sig.publicKey
        );
        
        if (!isValid) {
            return false; // Transaction rejetée
        }
    }
    
    return true; // Toutes les signatures sont valides
}
```

**Propriétés sécuritaires :**
* **Authentification :** Prouve que la transaction a été signée par le détenteur de la clé privée
* **Intégrité :** Toute modification des données de transaction invalide la signature
* **Non-répudiation :** Le signataire ne peut pas nier avoir créé la signature

**Avantages de performance :**
* La vérification Ed25519 est rapide (~100k vérifications/seconde sur du matériel moderne)
* Permet le haut débit de Solana (65k+ transactions/seconde)

## Point clé
✅ **Vérification Solana** : Utilise l'équation Ed25519 `s⋅B == R + H(R || A || message)⋅A` pour valider l'authenticité des transactions.