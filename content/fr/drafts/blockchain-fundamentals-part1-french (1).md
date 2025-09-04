---
id: blockchain-fundamentals-scalars-modular-arithmetic
title: Fondamentaux Blockchain Partie 1 - Scalaires et arithmétique modulaire
slug: blockchain-fundamentals-part1-scalars-modular-arithmetic
author: mayo
locale: fr
excerpt: Comprendre les scalaires et l'arithmétique modulaire dans la cryptographie à courbes elliptiques
category: blockchain
tags:
  - blockchain
  - cryptography
---
# Fondamentaux Blockchain Partie 1 : Foundation — Scalaires et arithmétique modulaire

Comprendre la cryptographie à courbes elliptiques, c'est crucial pour développer sur blockchain. Cette série couvre les bases mathématiques qui font tourner les cryptomonnaies comme Bitcoin, Ethereum et Solana.

## 1. C'est quoi un scalaire en cryptographie à courbes elliptiques, et en quoi ça diffère d'un point sur la courbe ?

**Contexte** : En cryptographie à courbes elliptiques (ECC), un **scalaire** c'est juste un entier normal (comme 5, 12, ou 1000), alors qu'un **point** c'est une paire de coordonnées `(x, y)` qui se trouve sur la courbe.

**Différence** :
* Un **scalaire** sert  à multiplier un point (ex: `3 * P` veut dire "additionner le point P à lui-même 3 fois").
* Un **point** c'est un endroit géométrique sur la courbe, qui représente une clé publique ou un résultat intermédiaire.

**Exemple** :
* Scalaire : `a = 5`
* Point : `P = (2, 5)` (s'il satisfait l'équation de la courbe).

**Exemple de code** :
```javascript
// Scalaire (juste un nombre)
const scalar = 5;

// Point (objet avec coordonnées x et y)
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
const point = new Point(2, 5);
```

## 2. C'est quoi l'arithmétique modulaire et pourquoi c'est essentiel pour les opérations cryptographiques ?

**Contexte** : L'arithmétique modulaire c'est "l'arithmétique d'horloge" - quand tu arrives à un certain nombre (le modulus), tu repartes à zéro.

**Pourquoi c'est essentiel** :
* **Garde les nombres gérables** : Sans arithmétique modulaire, les calculs crypto produiraient des nombres impossiblement grands.
* **Crée des groupes mathématiques** : Permet les structures algébriques qui rendent la crypto sécurisée.
* **Assure des résultats déterministes** : Les mêmes inputs donnent toujours les mêmes outputs dans le champ fini.

**Exemple** :
```
17 mod 12 = 5    (comme 17h = 5h de l'après-midi)
25 mod 7 = 4     (25 ÷ 7 = 3 reste 4)
```

**Exemple de code** :
```javascript
// Arithmétique modulaire en pratique
function modularAdd(a, b, mod) {
    return (a + b) % mod;
}

function modularMultiply(a, b, mod) {
    return (a * b) % mod;
}

// Exemple avec un petit nombre premier
const p = 17;
console.log(modularAdd(15, 8, p));      // (15 + 8) % 17 = 6
console.log(modularMultiply(5, 7, p));  // (5 * 7) % 17 = 1
```

## 3. Comment fonctionnent les corps finis dans le contexte des courbes elliptiques ?

**Contexte** : Un corps fini c'est un ensemble de nombres avec une taille limitée où tu peux additionner, soustraire, multiplier et diviser (sauf par zéro) et toujours obtenir un résultat dans le même ensemble.

**Dans les courbes elliptiques** :
* Toutes les coordonnées `(x, y)` sont des éléments d'un corps fini.
* Les opérations se font modulo un grand nombre premier `p`.
* Ça crée un ensemble fini de points valides sur la courbe.

**Propriétés** :
* **Fermeture** : Les opérations produisent toujours des résultats dans le corps.
* **Inversibilité** : Chaque élément non-nul a un inverse multiplicatif.
* **Sécurité** : Les grands corps premiers rendent les attaques par force brute impossible en pratique.

**Exemple** :
Pour le corps fini F₁₇ (entiers modulo 17) :
* Éléments : {0, 1, 2, 3, ..., 16}
* Inverse additif de 5 : 12 (parce que 5 + 12 = 17 ≡ 0 mod 17)
* Inverse multiplicatif de 3 : 6 (parce que 3 × 6 = 18 ≡ 1 mod 17)

**Exemple de code** :
```javascript
class FiniteField {
    constructor(prime) {
        this.p = prime;
    }
    
    add(a, b) {
        return (a + b) % this.p;
    }
    
    multiply(a, b) {
        return (a * b) % this.p;
    }
    
    // Algorithme d'Euclide étendu pour l'inverse multiplicatif
    inverse(a) {
        if (a === 0) throw new Error("Pas d'inverse pour 0");
        return this.extendedGCD(a, this.p)[1];
    }
    
    extendedGCD(a, b) {
        if (a === 0) return [b, 0, 1];
        const [gcd, x1, y1] = this.extendedGCD(b % a, a);
        const x = y1 - Math.floor(b / a) * x1;
        const y = x1;
        return [gcd, x, y];
    }
}

// Exemple d'utilisation
const field = new FiniteField(17);
console.log(field.inverse(3)); // 6, parce que 3 * 6 ≡ 1 (mod 17)
```

## Points clés

✅ **Scalaires** : Entiers normaux utilisés pour la multiplication de points.  
✅ **Points** : Paires de coordonnées `(x, y)` sur la courbe elliptique.  
✅ **Arithmétique modulaire** : Essentielle pour garder les opérations crypto gérables et sécurisées.  
✅ **Corps finis** : Fournissent la structure mathématique qui rend possible la cryptographie à courbes elliptiques.

Comprendre ces bases est crucial pour bosser avec des protocoles blockchain comme Solana, qui s'appuient énormément sur les opérations de courbes elliptiques pour les signatures numériques et la génération de clés.
