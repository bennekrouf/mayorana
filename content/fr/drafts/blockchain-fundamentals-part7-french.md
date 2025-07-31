---
id: blockchain-fundamentals-point-operations
title: Fondamentaux Blockchain Partie 7 - Addition vs doublement de points
slug: blockchain-fundamentals-part7-point-operations
author: mayo
locale: fr
excerpt: Comprendre la différence entre addition et doublement de points dans l'arithmétique des courbes elliptiques
category: blockchain
tags:
  - crypto
  - blockchain
  - beginner
  - solana
  - elliptic-curves
  - point-operations
date: '2025-07-31'
---
# Fondamentaux Blockchain Partie 7 : Addition vs doublement de points

## Explique la différence entre addition et doublement de points dans l'arithmétique des courbes elliptiques, et décris quand chacun est utilisé pendant la multiplication scalaire.

**Addition de points (`P + Q`)**
* **Ce que ça fait :** Additionne deux points **différents** `P` et `Q` pour obtenir un troisième point `R`.
* **Comment ça marche géométriquement :**
   1. Trace une ligne à travers `P` et `Q`.
   2. Trouve où elle intersecte la courbe à nouveau.
   3. Réfléchis ce point par rapport à l'axe des x pour obtenir `R`.

**Doublement de point (`2P` ou `P + P`)**
* **Ce que ça fait :** Additionne un point **à lui-même**.
* **Comment ça marche géométriquement :**
   1. Trace une ligne tangente en `P`.
   2. Trouve où elle intersecte la courbe à nouveau.
   3. Réfléchis ce point pour obtenir `2P`.

**Quand sont-ils utilisés ?**
* **Multiplication scalaire** (ex: `13 * P`) se décompose en une série d'additions et de doublements :
   * Exemple : `13 * P = 8P + 4P + P` (calculé via double-and-add, expliqué plus tard).
   * **Doublement** est utilisé quand la représentation binaire du scalaire a un `1`.
   * **Addition** est utilisée pour combiner les résultats intermédiaires.

**Exemple de code :**
```javascript
function scalarMultiply(scalar, point) {
    let result = Point.infinity(); // Commence avec le point "zéro"
    for (let bit of scalar.toBinary()) {
        result = double(result); // Toujours doubler
        if (bit === 1) {
            result = add(result, point); // Additionner conditionnellement
        }
    }
    return result;
}
```

## Point clé
✅ **Addition de points** : Pour des points différents. **Doublement de point** : Pour le même point. Les deux essentiels pour la multiplication scalaire.