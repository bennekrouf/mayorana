---
id: blockchain-fundamentals-point-validation
title: Fondamentaux Blockchain Partie 6 - Validation de points sur les courbes elliptiques
slug: blockchain-fundamentals-part6-point-validation
author: mayo
locale: fr
excerpt: Apprendre à vérifier si un point se trouve sur une courbe elliptique
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
# Fondamentaux Blockchain Partie 2 : Points et opérations sur courbes

## Avec la courbe elliptique `y² = x³ + 2x + 3 mod 17`, détermine si `(3, 6)` se trouve sur la courbe.

**C'est quoi le but ?** On doit vérifier si en mettant `x = 3` et `y = 6` dans l'équation de la courbe, ça marche.

**Étape par étape :**

1. **Calcule le côté droit (RHS)** : `x³ + 2x + 3 mod 17`
   - `= 3³ + 2*3 + 3 = 27 + 6 + 3 = 36`
   - `36 mod 17 = 2` (puisque `17 * 2 = 34`, le reste est `2`).

2. **Calcule le côté gauche (LHS)** : `y² mod 17`
   - `= 6² = 36 mod 17 = 2` (pareil qu'au-dessus).

3. **Compare LHS et RHS** : Puisque `2 == 2`, le point `(3, 6)` **est** sur la courbe !

**Exemple de code** :
```javascript
function isPointOnCurve(x, y, a, b, p) {
    // Calcule y² mod p
    const leftSide = (y * y) % p;
    
    // Calcule x³ + ax + b mod p
    const rightSide = (x ** 3 + a * x + b) % p;
    
    return leftSide === rightSide;
}

// Test du point (3, 6) sur la courbe y² = x³ + 2x + 3 mod 17
const x = 3, y = 6, a = 2, b = 3, p = 17;
const result = isPointOnCurve(x, y, a, b, p);
console.log(`Le point (${x}, ${y}) est sur la courbe : ${result}`); // true
```

**Fonction de validation** :
```javascript
function validateEllipticCurvePoint(point, curve) {
    const { x, y } = point;
    const { a, b, p } = curve;
    
    // Gère le point à l'infini (cas spécial)
    if (x === null && y === null) {
        return true; // Le point à l'infini est toujours valide
    }
    
    // Vérifie si les coordonnées sont dans la plage valide
    if (x < 0 || x >= p || y < 0 || y >= p) {
        return false;
    }
    
    // Vérifie l'équation de la courbe
    return isPointOnCurve(x, y, a, b, p);
}

// Exemple d'utilisation
const curve = { a: 2, b: 3, p: 17 };
const testPoints = [
    { x: 3, y: 6 },   // Devrait être valide
    { x: 5, y: 8 },   // À vérifier
    { x: 1, y: 1 }    // À vérifier
];

testPoints.forEach(point => {
    const isValid = validateEllipticCurvePoint(point, curve);
    console.log(`Point (${point.x}, ${point.y}) : ${isValid ? 'Valide' : 'Invalide'}`);
});
```

**Pourquoi c'est important ?** En ECC, seuls les points qui satisfont l'équation de la courbe sont valides pour les opérations cryptographiques (comme la génération de clés).

**Implications sécuritaires** :
- Les points invalides peuvent créer des vulnérabilités dans les protocoles crypto
- La validation de points prévient les attaques utilisant des clés publiques malformées
- Essentiel pour une implémentation sécurisée des signatures numériques

## Point clé
✅ **Validation de points** : Étape essentielle avant toute opération cryptographique sur courbe elliptique.