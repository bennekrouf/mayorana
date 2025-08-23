---
id: vec-push-vs-with-capacity-performance-duplicate-fr
title: >-
  Quel est l'impact en terme de performance d'utiliser Vec::push() sans
  initialiser avec Vec::with_capacity() ?
slug: vec-push-vs-with-capacity-performance-duplicate-fr
locale: fr
author: mayo
excerpt: >-
  Analyser les différences de performance entre Vec::push() dans des boucles
  versus pré-allouer avec Vec::with_capacity(), couvrant les coûts de
  réallocation mémoire et stratégies d'optimisation
category: rust
tags:
  - rust
  - vec
  - performance
  - memory-allocation
  - optimization
  - collections
date: '2025-08-23'
---

# Quel est l'impact en terme de performance d'utiliser Vec::push() dans une boucle vs. pré-allouer avec Vec::with_capacity() ?

## Différences de Performance Clés

| Vec::push() dans une Boucle | Vec::with_capacity() + push() |
|------------------------------|-------------------------------|
| Réalloue la mémoire plusieurs fois (grandit exponentiellement). | Alloue une fois d'avance. |
| Complexité temporelle O(n log n) (amortie). | Complexité temporelle O(n). |
| Peut fragmenter la mémoire à cause des allocations répétées. | Bloc unique de mémoire contigu. |

## Pourquoi les Réallocations Sont Coûteuses

### Stratégie de Croissance

- Un Vec commence avec une capacité de 0 et double sa capacité quand il est plein (ex : 0 → 4 → 8 → 16...).
- Chaque réallocation implique :
  - Allouer nouvelle mémoire.
  - Copier tous les éléments existants.
  - Libérer l'ancienne mémoire.

### Exemple pour 10 Éléments

- **push() avec Vec::new()** : 4 réallocations (capacité 0 → 4 → 8 → 16).
- **push() avec with_capacity(10)** : 0 réallocation.

## Benchmark

```rust
use std::time::Instant;

fn main() {
    // Test avec 1 million d'éléments
    let n = 1_000_000;
    
    // Méthode 1: Pas de pré-allocation
    let start = Instant::now();
    let mut v1 = Vec::new();
    for i in 0..n {
        v1.push(i);
    }
    println!("Vec::new(): {:?}", start.elapsed());
    
    // Méthode 2: Pré-allouer
    let start = Instant::now();
    let mut v2 = Vec::with_capacity(n);
    for i in 0..n {
        v2.push(i);
    }
    println!("Vec::with_capacity(): {:?}", start.elapsed());
}
```

### Résultats Typiques

```
Vec::new(): 1.8ms  
Vec::with_capacity(): 0.4ms  // 4.5x plus rapide
```

## Quand Pré-Allouer

- **Taille Connue** : Utilise with_capacity(n) si tu connais le nombre exact/maximum d'éléments.
- **Si les performance sont critiques** : Évite les réallocations dans les hot loops.
- **Gros volumes de données** : Prévient le stack overflow pour d'énormes collections.

## Quand Vec::new() est Acceptable

- **Tailles Petites/Inconnues** : Pour usage ad-hoc ou vecteurs de courte durée.
- **Simplicité du Code** : Quand la performance n'est pas critique.

## Optimisation Avancée : extend()

Si tu as un iterateur, extend() est souvent plus rapide qu'une boucle avec push() :

```rust
let mut v = Vec::with_capacity(n);
v.extend(0..n);  // Optimisé pour les iterators (évite les bounds checks)
```

## Points Clés

✅ **Utilise with_capacity() pour** :
- Nombres d'éléments prévisibles.
- Scénarios haute performance.

✅ **Utilise Vec::new() pour** :
- Tailles petites/inconnues ou prototypage.

🚀 **Évite les réallocations inutiles**—elles dominent le runtime pour des Vecs.

## Impact Réel

Dans le crate regex, la pré-allocation est utilisée pour les capture groups pour éviter les réallocations pendant le pattern matching.

**Essaie Ceci** : Que se passe-t-il si tu pré-alloues trop (ex : with_capacity(1000) mais utilises seulement 10 éléments) ?

**Réponse** : Mémoire gaspillée. Utilise shrink_to_fit() pour libérer la capacité inutilisée.
