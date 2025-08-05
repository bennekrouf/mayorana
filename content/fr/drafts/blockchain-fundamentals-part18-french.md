---
id: blockchain-fundamentals-nonce-reuse
title: Fondamentaux Blockchain Partie 18 - Dangers de la réutilisation de nonce dans les signatures
slug: blockchain-fundamentals-part18-nonce-reuse
author: mayo
locale: fr
excerpt: Comprendre pourquoi la réutilisation de nonce dans les signatures numériques peut compromettre la clé privée
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
# Fondamentaux Blockchain Partie 18 : Dangers de la réutilisation de nonce dans les signatures

## Qu'est-ce qui se passerait si deux transactions Solana utilisaient le même nonce r pour signer différents messages — et pourquoi c'est dangereux ?

**C'est quoi un nonce ?**
* Un **nombre utilisé une fois** (`r`) dans les signatures pour assurer l'unicité. Dans EdDSA, il est dérivé de façon déterministe de la clé privée et du message.

**Danger de la réutilisation :**

1. **Fuite de clé privée :**
   * Si deux messages `m1` et `m2` partagent `(R, s1)` et `(R, s2)` :
      * L'attaquant peut calculer : `s1 - s2 ≡ (H(R||A||m1) - H(R||A||m2))⋅a mod n`
      * Résoudre pour `a` (clé privée) !

2. **Contrefaçon :** De nouvelles signatures peuvent être fabriquées pour des messages arbitraires.

**Exemple d'attaque :**
```javascript
// Scénario dangereux : Même nonce pour différents messages
function demonstrateNonceReuseAttack() {
    const privateKey = 12345; // Exemple de clé privée
    const nonce = 678; // MÊME nonce utilisé pour les deux signatures
    
    // Deux messages différents
    const message1 = "Envoyer 10 SOL à Alice";
    const message2 = "Envoyer 100 SOL à Bob";
    
    // Les deux signatures utilisent le même R = nonce * B
    const R = scalarMultiply(nonce, ED25519_BASEPOINT);
    
    // Calculer les défis
    const h1 = sha512(R + publicKey + message1) % CURVE_ORDER;
    const h2 = sha512(R + publicKey + message2) % CURVE_ORDER;
    
    // Créer les signatures
    const s1 = (nonce + h1 * privateKey) % CURVE_ORDER;
    const s2 = (nonce + h2 * privateKey) % CURVE_ORDER;
    
    // ATTAQUE : Récupérer la clé privée
    const sDiff = (s1 - s2 + CURVE_ORDER) % CURVE_ORDER;
    const hDiff = (h1 - h2 + CURVE_ORDER) % CURVE_ORDER;
    const recoveredPrivateKey = (sDiff * modInverse(hDiff, CURVE_ORDER)) % CURVE_ORDER;
    
    console.log("Clé privée originale :", privateKey);
    console.log("Clé privée récupérée :", recoveredPrivateKey);
    // Elles correspondent ! Clé privée compromise !
}
```

**Exemples historiques :**
```javascript
// Incidents célèbres de réutilisation de nonce
const incidents = [
    {
        system: "PlayStation 3",
        year: 2010,
        cause: "Sony utilisait le même nonce pour toutes les signatures ECDSA",
        result: "Sécurité de la console complètement cassée"
    },
    {
        system: "Portefeuilles Bitcoin Android",
        year: 2013,
        cause: "Génération de nombres aléatoires faible",
        result: "Plusieurs portefeuilles compromis"
    }
];
```

**Protection de Solana :**
```javascript
// Solana utilise des nonces déterministes pour prévenir la réutilisation
function generateSolanaNonce(privateKey, message) {
    // Hacher la clé privée pour obtenir de l'aléatoire déterministe
    const privateKeyHash = sha512(privateKey);
    
    // Combiner avec le message pour un nonce unique par message
    const nonce = sha512(privateKeyHash + message) % CURVE_ORDER;
    
    // Même message + même clé = même nonce (déterministe)
    // Message différent = nonce différent (sécurisé)
    return nonce;
}
```

**Pourquoi les nonces déterministes marchent :**
* **Prévient la réutilisation :** Messages différents produisent toujours des nonces différents
* **Pas de dépendance aux nombres aléatoires :** Élimine les vulnérabilités de RNG faible
* **Reproductible :** Mêmes entrées produisent toujours la même signature

**Comparaison sécuritaire :**
```javascript
// ❌ Dangereux : Génération de nonce aléatoire
const randomNonce = Math.random() * CURVE_ORDER; // Pourrait se répéter !

// ✅ Sûr : Génération de nonce déterministe
const safeNonce = sha512(privateKeyHash + message) % CURVE_ORDER;
```

## Point clé
✅ **Réutilisation de nonce catastrophique** : Compromise instantanément les clés privées. Solana utilise des nonces déterministes pour prévenir ça.