---
id: blockchain-fundamentals-hashing-signatures
title: Fondamentaux Blockchain Partie 15 - Pourquoi les fonctions de hachage dans les signatures
slug: blockchain-fundamentals-part15-hashing-signatures
author: mayo
locale: fr
excerpt: Comprendre pourquoi les fonctions de hachage sont essentielles dans les schémas de signature numérique
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
# Fondamentaux Blockchain Partie 15 : Pourquoi les fonctions de hachage dans les signatures

## Explique pourquoi un schéma de signature nécessite une fonction de hachage (ex: SHA-512) dans le processus de signature. Qu'est-ce qui pourrait mal se passer si le hachage était omis ?

**Rôle du hachage :**

1. **Compression de message :** Les hachages réduisent les messages de longueur arbitraire en résumés de taille fixe (ex: SHA-512 → 512 bits).
2. **Randomisation :** Assure que les signatures sont uniques même pour des messages similaires.
3. **Propriétés sécuritaires :**
   * Empêche la **contrefaçon** en liant la signature au message exact.
   * Déjoue les **attaques d'extension de longueur** (si on utilise SHA-512/256).

**Dangers d'omettre le hachage :**
* **Malléabilité :** Un attaquant pourrait modifier le message sans invalider la signature.
* **Attaques de collision :** Deux messages différents pourraient produire la même signature.
* **Signatures bidons :** Sans hachage, des astuces algébriques pourraient forger des signatures valides en apparence.

**Exemple de code - Avec hachage (Sécurisé) :**
```javascript
function signWithHash(message, privateKey) {
    // Étape 1 : Hacher le message d'abord
    const messageHash = sha512(message);
    
    // Étape 2 : Générer le nonce à partir du hash
    const r = sha512(privateKey + messageHash) % CURVE_ORDER;
    
    // Étape 3 : Créer les composants de signature
    const R = scalarMultiply(r, ED25519_BASEPOINT);
    const challenge = sha512(R + publicKey + messageHash) % CURVE_ORDER;
    const s = (r + challenge * privateKey) % CURVE_ORDER;
    
    return { R, s };
}
```

**Exemple de code - Sans hachage (Vulnérable) :**
```javascript
function signWithoutHash(message, privateKey) {
    // DANGEREUX : Utiliser le message brut
    const r = sha512(privateKey + message) % CURVE_ORDER; // Problème si le message est énorme
    
    const R = scalarMultiply(r, ED25519_BASEPOINT);
    const challenge = sha512(R + publicKey + message) % CURVE_ORDER; // Vulnérable à la manipulation
    const s = (r + challenge * privateKey) % CURVE_ORDER;
    
    return { R, s };
}
```

**Exemples d'attaques :**
```javascript
// Exemple d'attaque de malléabilité
const originalMessage = "Envoyer 100 SOL à Alice";
const tamperedMessage = "Envoyer 100 SOL à Bob  "; // Espaces ajoutés

// Sans hachage, ces messages pourraient produire des signatures liées
// qui pourraient être manipulées par des attaquants

// Avec un hachage approprié, tout changement invalide la signature
const hash1 = sha512(originalMessage); // Différent
const hash2 = sha512(tamperedMessage); // Différent
```

**Exemple :**
* Dans Ed25519, SHA-512 hache à la fois le message et le nonce pour assurer des signatures déterministes mais imprévisibles.

**Conséquences dans le monde réel :**
* **Vulnérabilité précoce de Bitcoin :** Certaines implémentations permettaient la malléabilité des signatures
* **Exploits de smart contracts :** Les signatures non hachées peuvent mener à des attaques de rejeu
* **Perte d'intégrité des données :** Les messages pourraient être altérés sans détection

## Point clé
✅ **Fonctions de hachage essentielles** : Fournissent compression de message, préviennent la malléabilité, et assurent la sécurité des signatures.