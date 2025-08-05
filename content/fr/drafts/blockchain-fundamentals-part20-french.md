---
id: blockchain-fundamentals-signature-reuse
title: Fondamentaux Blockchain Partie 20 - Pourquoi les signatures ne peuvent pas être réutilisées
slug: blockchain-fundamentals-part20-signature-reuse
author: mayo
locale: fr
excerpt: Comprendre pourquoi les signatures Solana interceptées ne peuvent pas être forgées ou réutilisées pour différentes transactions
category: blockchain
tags:
  - crypto
  - blockchain
  - beginner
  - solana
  - security
  - signature-forgery
date: '2025-07-31'
---
# Fondamentaux Blockchain Partie 20 : Pourquoi les signatures ne peuvent pas être réutilisées

## Si tu interceptes une transaction Solana signée, qu'est-ce qui t'empêche de forger une autre transaction en utilisant la même signature et clé publique ?

**Mécanismes de sécurité :**

1. **Liaison au message :**
   * La signature `(R, s)` est liée à :
      * Données exactes de transaction (`message`).
      * Blockhash actuel (expire rapidement).
   * Changer quoi que ce soit → Signature invalide.

2. **Pas de composants réutilisables :**
   * `R` dépend de `r` (nonce), qui est unique par message.
   * `s` dépend de `H(R || A || message)`.

**Exemple de tentative d'attaque :**
* Intercepté : `Tx1 = (message1, R, s)`
* Forgé : `Tx2 = (message2, R, s)`
   * La vérification échoue parce que `H(R || A || message2)` ≠ hash de défi original.

**Exemple de code :**
```javascript
function attemptSignatureReuse() {
    // Transaction interceptée
    const originalTx = {
        sender: "Alice",
        receiver: "Bob", 
        amount: 10,
        blockhash: "recent123"
    };
    const originalSignature = { R: "...", s: "..." };
    
    // L'attaquant essaie de forger une nouvelle transaction
    const forgedTx = {
        sender: "Alice",
        receiver: "Eve", // Destinataire changé !
        amount: 10,
        blockhash: "recent123"
    };
    
    // Vérification avec la signature originale
    const originalMessage = serializeTransaction(originalTx);
    const forgedMessage = serializeTransaction(forgedTx);
    
    const originalChallenge = sha512(originalSignature.R + publicKey + originalMessage);
    const forgedChallenge = sha512(originalSignature.R + publicKey + forgedMessage);
    
    console.log("Les défis correspondent :", originalChallenge === forgedChallenge); // false
    console.log("Vérification signature :", verifySignature(forgedMessage, originalSignature, publicKey)); // false
}
```

**Pourquoi Ed25519 brille :**
* **Nonces déterministes** + **hachage de message** rendent la réutilisation de signature impossible.

**Couches de protection :**
```javascript
// Plusieurs couches de sécurité préviennent la contrefaçon
const protections = {
    messageBinding: "Signature liée au contenu exact de la transaction",
    nonceUniqueness: "Chaque message obtient un nonce r unique",
    blockhashExpiry: "Blockhash récent prévient le rejeu d'anciennes transactions",
    cryptographicHashing: "SHA-512 assure que tout changement casse la signature"
};
```

**🎯 Résumé de la série**

On a couvert le voyage complet des fondements mathématiques à l'implémentation pratique :

**Partie 1 - Fondements mathématiques :**
* **Scalaires & Points :** Blocs de construction des opérations de courbes elliptiques
* **Arithmétique modulaire :** Essentielle pour les calculs de corps finis
* **Résidus quadratiques :** Déterminer les points valides sur la courbe

**Partie 2 - Opérations sur courbes :**
* **Validation de points :** S'assurer que les points sont sur la courbe
* **Addition & doublement :** Opérations fondamentales de courbes elliptiques
* **Multiplication scalaire :** Optimisée avec l'algorithme double-and-add

**Partie 3 - Signatures numériques :**
* **Groupes cycliques :** Fondation pour la génération sécurisée de clés
* **Clés Ed25519 :** Des mnémotechniques aux paires de clés publiques/privées
* **Composants de signature :** Comment (R, s) lie les messages aux clés
* **Propriétés sécuritaires :** Pourquoi les signatures sont infalsifiables et non-réutilisables

## Point clé
✅ **Les signatures sont spécifiques au message** : La conception d'Ed25519 rend la réutilisation de signature cryptographiquement impossible grâce à la liaison au message et aux nonces uniques.