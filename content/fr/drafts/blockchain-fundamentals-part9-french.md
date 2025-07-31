---
id: blockchain-fundamentals-scalar-multiplication
title: Fondamentaux Blockchain Partie 9 - Algorithme double-and-add
slug: blockchain-fundamentals-part9-scalar-multiplication
author: mayo
locale: fr
excerpt: Comprendre comment la multiplication scalaire est optimisée avec l'algorithme double-and-add
category: blockchain
tags:
  - crypto
  - blockchain
  - beginner
  - solana
  - elliptic-curves
  - algorithms
date: '2025-07-31'
---
# Fondamentaux Blockchain Partie 9 : Algorithme double-and-add

## Comment la multiplication scalaire (ex: `a * P`) est optimisée avec l'algorithme double-and-add, et pourquoi c'est important pour les performances ?

**C'est quoi la multiplication scalaire ?** C'est calculer `a * P` (additionner `P` à lui-même `a` fois). L'approche naïve (ex: `13*P = P + P + ... + P`) est trop lente pour de gros `a` (comme les nombres 256-bit en crypto).

**Algorithme Double-and-Add**
* **Idée :** Décomposer `a` en binaire et traiter chaque bit.
* **Étapes :**
   1. Commencer avec `result = 0` (point à l'infini).
   2. Pour chaque bit dans `a` (de gauche à droite) :
      * **Doubler** le résultat.
      * Si le bit est `1`, **ajouter** `P`.

**Exemple :** Calculer `13 * P` (`13` est `1101` en binaire).

* Initialisation : `result = 0`.
* Bit 1 (`1`) :
   * Doubler : `0 → 0` (toujours `0`).
   * Ajouter `P` : `0 + P = P`.
* Bit 2 (`1`) :
   * Doubler : `P → 2P`.
   * Ajouter `P` : `2P + P = 3P`.
* Bit 3 (`0`) :
   * Doubler : `3P → 6P`.
   * Pas d'ajout (bit est `0`).
* Bit 4 (`1`) :
   * Doubler : `6P → 12P`.
   * Ajouter `P` : `12P + P = 13P`.

**Exemple de code :**
```javascript
function scalarMultiply(scalar, point) {
    let result = Point.infinity();
    const bits = scalar.toString(2); // Convertir en binaire
    
    for (let bit of bits) {
        result = pointDouble(result);
        if (bit === '1') {
            result = pointAdd(result, point);
        }
    }
    return result;
}
```

**Pourquoi c'est rapide :**
* Au lieu de `13` additions, on fait `3` doublements et `2` additions (`O(log n)` vs `O(n)`).
* Critique pour les performances ECC (les scalaires réels sont **énormes**, ex: `2²⁵⁶`).

## Point clé
✅ **Double-and-add** : Réduit la multiplication scalaire de `O(n)` à `O(log n)` en complexité.