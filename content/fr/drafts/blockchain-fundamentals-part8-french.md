---
id: blockchain-fundamentals-point-doubling-calculation
title: Fondamentaux Blockchain Partie 8 - Calcul du doublement de point
slug: blockchain-fundamentals-part8-point-doubling-calculation
author: mayo
locale: fr
excerpt: Calcul étape par étape du doublement de point en utilisant la loi de groupe sur les courbes elliptiques
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
# Fondamentaux Blockchain Partie 8 : Calcul du doublement de point

## En utilisant `P = (5, 1)` sur la courbe `y² = x³ + 2x + 3 mod 17`, calcule `2P` avec la loi de groupe. Quel inverse modulaire calcules-tu, et pourquoi ?

**Étape 1 : Rappel de la formule de doublement**

Pour `P = (x₁, y₁)`, `2P = (x₃, y₃)` se calcule comme :

1. Pente : `s = (3x₁² + a) / (2y₁) mod p` (Ici, `a = 2`)
2. `x₃ = s² - 2x₁ mod p`
3. `y₃ = s(x₁ - x₃) - y₁ mod p`

**Étape 2 : On met `P = (5, 1)`**

1. **Calcul de la pente `s` :**
   * Numérateur : `3×(5)² + 2 = 75 + 2 = 77`
   * `77 mod 17 = 9` (puisque `77 - 4×17 = 9`)
   * Dénominateur : `2×1 = 2`
   * On a besoin de : `s = (9 / 2) mod 17` → **inverse modulaire de 2**
   * Trouve `2⁻¹ mod 17` : `2×9 = 18 ≡ 1 mod 17` → `2⁻¹ = 9`
   * Donc : `s = 9×9 = 81 mod 17 = 13`

2. **Calcul de `x₃` :**
   * `x₃ = s² - 2x₁ = 13² - 2×5 = 169 - 10 = 159 mod 17`
   * `159 - 9×17 = 159 - 153 = 6`
   * Donc : `x₃ = 6`

3. **Calcul de `y₃` :**
   * `y₃ = s(x₁ - x₃) - y₁ = 13×(5 - 6) - 1 = 13×(-1) - 1 = -14 mod 17`
   * `-14 + 17 = 3`
   * Donc : `y₃ = 3`

**Réponse finale :** `2P = (6, 3)`

**Exemple de code :**
```javascript
function pointDouble(point, a, p) {
    const { x, y } = point;
    
    // Calcule la pente : s = (3x² + a) / (2y) mod p
    const numerator = (3 * x * x + a) % p;
    const denominator = (2 * y) % p;
    const slope = (numerator * modInverse(denominator, p)) % p;
    
    // Calcule les nouvelles coordonnées
    const x3 = (slope * slope - 2 * x) % p;
    const y3 = (slope * (x - x3) - y) % p;
    
    return { x: (x3 + p) % p, y: (y3 + p) % p };
}
```

**Pourquoi on a eu besoin de l'inverse modulaire ?**
* Pour calculer la pente `s`, on a dû diviser par `2` (multiplier par `2⁻¹ mod 17`)
* Les inverses modulaires sont **essentiels** pour la division en arithmétique ECC

## Point clé
✅ **Doublement de point** : Utilise la pente tangente et nécessite l'inverse modulaire pour les opérations de division.