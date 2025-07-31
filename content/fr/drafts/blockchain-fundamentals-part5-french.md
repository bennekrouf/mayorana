---
id: blockchain-fundamentals-quadratic-residues
title: Fondamentaux Blockchain Partie 5 - Résidus quadratiques en ECC
slug: blockchain-fundamentals-part5-quadratic-residues
author: mayo
locale: fr
excerpt: Comprendre les résidus quadratiques et leur rôle pour trouver des points valides sur les courbes elliptiques
category: blockchain
tags:
  - crypto
  - blockchain
  - beginner
  - solana
  - elliptic-curves
  - quadratic-residues
date: '2025-07-31'
---
# Fondamentaux Blockchain Partie 5 : Résidus quadratiques en ECC

## Avec `x = 4`, teste si `x` est un résidu quadratique modulo `17`, et explique comment ça se rapporte à trouver des points valides sur une courbe.

**C'est quoi un résidu quadratique ?** Un nombre `y` tel que `y² ≡ x mod p` a une solution.

**Test pour `x = 4` :** On vérifie s'il existe un `y` où `y² ≡ 4 mod 17`.
* `5² = 25 ≡ 8 mod 17` → Pas 4.
* `6² = 36 ≡ 2 mod 17` → Pas 4.
* `2² = 4 ≡ 4 mod 17` → **Oui !** (Aussi, `15² = 225 ≡ 4 mod 17`).

**Exemple de code** :
```javascript
function isQuadraticResidue(x, p) {
    for (let y = 0; y < p; y++) {
        if ((y * y) % p === x % p) {
            return { isResidue: true, solutions: [] };
        }
    }
    return { isResidue: false, solutions: [] };
}

function findQuadraticResidues(x, p) {
    const solutions = [];
    for (let y = 0; y < p; y++) {
        if ((y * y) % p === x % p) {
            solutions.push(y);
        }
    }
    return solutions;
}

// Test x = 4 mod 17
const solutions = findQuadraticResidues(4, 17);
console.log(`Solutions pour y² ≡ 4 mod 17: ${solutions}`); // [2, 15]
```

**Relation avec ECC :**
* En ECC, un point `(x, y)` est valide seulement si `y² ≡ x³ + ax + b mod p`.
* Donc, `x³ + ax + b` doit être un résidu quadratique (sinon, `y` n'existe pas).

**Exemple pratique** :
```javascript
// Courbe exemple : y² = x³ + 2x + 3 mod 17
function findValidPoints(a, b, p) {
    const validPoints = [];
    
    for (let x = 0; x < p; x++) {
        const rightSide = (x ** 3 + a * x + b) % p;
        const ySolutions = findQuadraticResidues(rightSide, p);
        
        for (const y of ySolutions) {
            validPoints.push({ x, y });
            console.log(`Point valide : (${x}, ${y})`);
        }
    }
    
    return validPoints;
}

// Trouve tous les points sur y² = x³ + 2x + 3 mod 17
const points = findValidPoints(2, 3, 17);
console.log(`Total de points valides : ${points.length}`);
```

**Pourquoi c'est important :**
* Pas chaque coordonnée `x` a une coordonnée `y` correspondante sur la courbe.
* Le test de résidu quadratique détermine si un point existe pour un `x` donné.
* Ça affecte la génération de clés et la validation de points dans les protocoles crypto.

## Point clé
✅ **Résidus quadratiques** : Déterminent quelles coordonnées `x` ont des coordonnées `y` valides sur les courbes elliptiques.