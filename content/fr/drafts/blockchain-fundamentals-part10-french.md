---
id: blockchain-fundamentals-one-way-function
title: Fondamentaux Blockchain Partie 10 - Multiplication scalaire comme fonction à sens unique
slug: blockchain-fundamentals-part10-one-way-function
author: mayo
locale: fr
excerpt: Comprendre pourquoi la multiplication scalaire est une fonction à sens unique et le problème du logarithme discret
category: blockchain
tags:
  - crypto
  - blockchain
  - beginner
  - solana
  - elliptic-curves
  - cryptography
date: '2025-07-31'
---
# Fondamentaux Blockchain Partie 10 : Multiplication scalaire comme fonction à sens unique

## Pourquoi la multiplication scalaire est considérée comme une fonction à sens unique, et comment ça se rapporte à la difficulté du problème du logarithme discret (DLP) ?

**Fonction à sens unique :**
* Facile de calculer `Q = a * P` avec `a` et `P` donnés.
* **Difficile** de trouver `a` avec `Q` et `P` donnés (c'est le **problème du logarithme discret (DLP)**).

**Exemple :**
* Si `P = (2, 3)` et `Q = 13 * P = (6, 3)`, trouver `13` nécessite de vérifier tous les multiples possibles (force brute).

**Pourquoi c'est difficile :**
* Pas d'algorithme efficace connu pour résoudre le DLP sur les courbes elliptiques (contrairement à la factorisation en RSA).
* La sécurité repose sur cette asymétrie :
   * **Facile :** Calculer `a * P` (rapide avec double-and-add).
   * **Difficile :** L'inverser (impossible en pratique pour de grosses clés).

**Exemple de code :**
```javascript
// Direction facile : avec la clé privée, calculer la clé publique
function computePublicKey(privateKey, basePoint) {
    return scalarMultiply(privateKey, basePoint); // Rapide O(log n)
}

// Direction difficile : avec la clé publique, trouver la clé privée
function findPrivateKey(publicKey, basePoint) {
    // Force brute - impossible computationnellement pour de grosses clés
    for (let i = 1; i < LARGE_NUMBER; i++) {
        if (scalarMultiply(i, basePoint).equals(publicKey)) {
            return i; // Clé privée trouvée !
        }
    }
    return null; // Prend trop de temps pour les tailles de clés crypto
}
```

**Relation avec la cryptographie :**
* Les clés ECC sont sécurisées parce que dériver la clé privée `a` à partir de `Q = a * P` est impossible computationnellement.

**Impact dans le monde réel :**
* Clés 256-bit : ~2²⁵⁶ valeurs possibles à vérifier
* Même avec les ordinateurs les plus rapides, ça prendrait plus longtemps que l'âge de l'univers

## Point clé
✅ **Fonction à sens unique** : Facile dans un sens (`a * P`), difficile dans l'autre (trouver `a` à partir de `Q = a * P`). Cette asymétrie sécurise ECC.