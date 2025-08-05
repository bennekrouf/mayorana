---
id: blockchain-fundamentals-ed25519-keys
title: Fondamentaux Blockchain Partie 13 - Génération de clés Ed25519
slug: blockchain-fundamentals-part13-ed25519-keys
author: mayo
locale: fr
excerpt: Comprendre comment les clés privées et publiques Ed25519 sont générées et pourquoi c'est sécurisé
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
# Fondamentaux Blockchain Partie 13 : Génération de clés Ed25519

## Dans Ed25519, si la clé privée est un scalaire a, comment la clé publique A est calculée, et pourquoi ce calcul est sécurisé ?

**Génération de clés dans Ed25519 :**

1. **Clé privée (a) :** Un scalaire aléatoire 256-bit (avec quelques bits ajustés pour la sécurité).
2. **Clé publique (A) :** Calculée comme `A = a ⋅ B`, où B est le point de base.

**Pourquoi c'est sécurisé ?**
* Le **Problème du Logarithme Discret de Courbe Elliptique (ECDLP)** rend impossible d'inverser `A = a ⋅ B` pour trouver a.
* Même si tu connais A et B, calculer a nécessite de résoudre `a = log_B(A)`, ce qui est impossible computationnellement pour les grandes courbes.

**Exemple de code :**
```javascript
// Génération de paire de clés Ed25519 simplifiée
function generateKeyPair() {
    // Étape 1 : Générer une clé privée aléatoire (256 bits)
    const privateKey = generateRandomScalar(256);
    
    // Étape 2 : Appliquer le bridage Ed25519 pour la sécurité
    const clampedPrivateKey = clampPrivateKey(privateKey);
    
    // Étape 3 : Calculer la clé publique A = a * B
    const publicKey = scalarMultiply(clampedPrivateKey, ED25519_BASEPOINT);
    
    return {
        privateKey: clampedPrivateKey,
        publicKey: publicKey
    };
}

function clampPrivateKey(key) {
    // Bridage spécifique à Ed25519
    key[0] &= 248;  // Efface les 3 bits du bas
    key[31] &= 127; // Efface le bit du haut  
    key[31] |= 64;  // Met le deuxième bit le plus haut
    return key;
}
```

**Propriétés sécuritaires :**
* **Fonction à sens unique :** Facile de calculer A à partir de a, difficile de trouver a à partir de A
* **Sécurité 256-bit :** Prendrait 2^128 opérations pour casser (impossible en pratique)
* **Le bridage assure :** La clé privée est toujours dans le bon sous-groupe

**Usage dans le monde réel :**
```javascript
// Dans Solana (simplifié)
const keypair = {
    privateKey: new Uint8Array(32), // Scalaire 256-bit a
    publicKey: scalarMultiply(privateKey, basePoint) // A = a * B
};

// La clé publique peut être partagée en sécurité
console.log("Clé publique :", keypair.publicKey);
// La clé privée ne doit jamais être partagée
```

## Point clé
✅ **Sécurité Ed25519** : Basée sur la difficulté d'ECDLP. La clé publique A = a ⋅ B peut être partagée, la clé privée a doit rester secrète.