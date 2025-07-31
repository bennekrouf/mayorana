---
id: blockchain-fundamentals-modular-inverse
title: Fondamentaux Blockchain Partie 2 - Inverse modulaire en ECC
slug: blockchain-fundamentals-part2-modular-inverse
author: mayo
locale: fr
excerpt: Comprendre l'inverse modulaire et son rôle dans l'arithmétique des courbes elliptiques
category: blockchain
tags:
  - crypto
  - blockchain
  - beginner
  - solana
  - elliptic-curves
  - modular-arithmetic
date: '2025-07-31'
---
# Fondamentaux Blockchain Partie 2 : Inverse modulaire en ECC

## Avec un scalaire `a = 13` et un modulus `p = 17`, c'est quoi `a^{-1} mod p` ? Pourquoi on a besoin de cet inverse en arithmétique ECC ?

**Contexte** : L'**inverse modulaire** de `a` c'est un nombre `b` tel que `(a * b) % p = 1`.

**Calcul** : On cherche `13^{-1} mod 17` (un nombre `b` où `13 * b ≡ 1 mod 17`).

Test :
* `13 * 4 = 52` → `52 % 17 = 1` (puisque `17 * 3 = 51`, le reste est `1`). 

Donc, `13^{-1} mod 17 = 4`.

**Exemple de code** :
```javascript
function findModularInverse(a, p) {
    for (let b = 1; b < p; b++) {
        if ((a * b) % p === 1) {
            return b;
        }
    }
    return null; // Pas d'inverse trouvé
}

console.log(findModularInverse(13, 17)); // Résultat : 4
```

**Pourquoi on en a besoin en ECC ?**
* Utilisé dans les formules d'**addition/doublement de points** (la division en arithmétique modulaire se fait via multiplication par l'inverse).
* Exemple : Pour calculer la pente `(y2 - y1) / (x2 - x1)`, on multiplie plutôt par `(x2 - x1)^{-1}`.

**Exemple pratique** :
```javascript
// Au lieu de division : pente = (y2 - y1) / (x2 - x1)
// On utilise : pente = (y2 - y1) * inverse(x2 - x1, p)

function ellipticCurveSlope(x1, y1, x2, y2, p) {
    const deltaY = (y2 - y1 + p) % p;
    const deltaX = (x2 - x1 + p) % p;
    const deltaXInverse = findModularInverse(deltaX, p);
    
    return (deltaY * deltaXInverse) % p;
}
```

## Point clé
✅ **Inverse modulaire** : Essentiel pour la "division" dans les corps finis utilisés par les courbes elliptiques.