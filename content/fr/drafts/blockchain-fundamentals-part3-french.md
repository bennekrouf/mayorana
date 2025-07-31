---
id: blockchain-fundamentals-modular-multiplication
title: Fondamentaux Blockchain Partie 3 - Multiplication modulaire en ECC
slug: blockchain-fundamentals-part3-modular-multiplication
author: mayo
locale: fr
excerpt: Comprendre pourquoi la multiplication modulaire est essentielle en cryptographie à courbes elliptiques
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
# Fondamentaux Blockchain Partie 3 : Multiplication modulaire en ECC

## Si `x = 5` et `y = 8`, calcule `x * y mod 17`, et explique pourquoi on utilise la multiplication modulaire au lieu de la multiplication normale en ECC.

**Calcul** : 
- `5 * 8 = 40` 
- `40 mod 17 = 6` (puisque `17 * 2 = 34`, le reste est `6`).

**Exemple de code** :
```javascript
function modularMultiply(x, y, p) {
    return (x * y) % p;
}

const x = 5;
const y = 8;
const p = 17;

console.log(modularMultiply(x, y, p)); // Résultat : 6
```

**Pourquoi l'arithmétique modulaire ?**
* ECC fonctionne sur un **corps fini** (les nombres rebouclent après `p-1`).
* Empêche les nombres de grandir à l'infini (important pour la crypto).
* Assure que toutes les opérations restent dans les limites (ex: les coordonnées `x` et `y` doivent être `< p`).

**Exemple pratique** :
```javascript
// Sans arithmétique modulaire - les nombres explosent
let resultatNormal = 5;
for (let i = 0; i < 10; i++) {
    resultatNormal *= 8;
    console.log(`Étape ${i + 1}: ${resultatNormal}`);
}
// Résultat : 40, 320, 2560, 20480, 163840... (croissance exponentielle !)

// Avec arithmétique modulaire - les nombres restent bornés
let resultatModulaire = 5;
const modulus = 17;
for (let i = 0; i < 10; i++) {
    resultatModulaire = (resultatModulaire * 8) % modulus;
    console.log(`Étape ${i + 1}: ${resultatModulaire}`);
}
// Résultat : 6, 14, 10, 12, 11, 3, 7, 5, 6... (cycle dans [0, 16])
```

## Point clé
✅ **Multiplication modulaire** : Garde les opérations cryptographiques bornées et gérables dans les corps finis.