---
id: blockchain-fundamentals-eddsa-signature
title: Fondamentaux Blockchain Partie 14 - Composants de signature EdDSA
slug: blockchain-fundamentals-part14-eddsa-signature
author: mayo
locale: fr
excerpt: Comprendre les composants d'une signature EdDSA et comment ils sont dérivés
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
# Fondamentaux Blockchain Partie 14 : Composants de signature EdDSA

## Quels sont les composants d'une signature EdDSA (R, s), et comment chacune de ces valeurs est dérivée du message et de la clé privée ?

**Étapes de signature EdDSA :**

1. **Génération de nonce :**
   * Calculer `r = H(hash || message)`, où hash fait partie de la clé privée.
   * Assure l'aléatoire par signature (déterministe mais imprévisible).

2. **Calculer R :** `R = r ⋅ B` (un point de courbe).

3. **Calculer s :** `s = (r + H(R || A || message) ⋅ a) mod n`
   * n = ordre de la courbe.
   * A = clé publique.

**Composants :**
* **R :** Un point de courbe, agit comme un "engagement" à l'aléatoire.
* **s :** Un scalaire, lie la signature au message et à la clé privée.

**Exemple de code :**
```javascript
function signMessage(message, privateKey, publicKey) {
    // Étape 1 : Générer un nonce déterministe
    const hash = sha512(privateKey); // Hash de la clé privée
    const r = sha512(hash + message) % CURVE_ORDER; // Déterministe mais imprévisible
    
    // Étape 2 : Calculer R = r * B
    const R = scalarMultiply(r, ED25519_BASEPOINT);
    
    // Étape 3 : Calculer le défi
    const challenge = sha512(R + publicKey + message) % CURVE_ORDER;
    
    // Étape 4 : Calculer s = (r + challenge * privateKey) mod n
    const s = (r + challenge * privateKey) % CURVE_ORDER;
    
    return {
        R: R,      // Point de courbe (32 octets)
        s: s       // Scalaire (32 octets)
    };
}
```

**Processus de vérification :**
```javascript
function verifySignature(message, signature, publicKey) {
    const { R, s } = signature;
    
    // Recalculer le défi
    const challenge = sha512(R + publicKey + message) % CURVE_ORDER;
    
    // Vérifier : s * B == R + challenge * A
    const leftSide = scalarMultiply(s, ED25519_BASEPOINT);
    const rightSide = pointAdd(R, scalarMultiply(challenge, publicKey));
    
    return leftSide.equals(rightSide);
}
```

**Pourquoi c'est sécurisé ?**
* Sans a, tu ne peux pas calculer s correctement.
* R assure qu'il n'y a pas de réutilisation du nonce r.
* Le nonce déterministe prévient les attaques dues au mauvais aléatoire.

**Propriétés sécuritaires :**
* **Infalsifiabilité :** Impossible de créer des signatures valides sans la clé privée
* **Non-répudiation :** La signature prouve que le message vient du détenteur de la clé
* **Déterministe :** Même message + clé produit toujours la même signature

## Point clé
✅ **Signature EdDSA (R, s)** : R s'engage à l'aléatoire, s lie la signature au message et à la clé privée.