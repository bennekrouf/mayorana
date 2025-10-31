---
id: vec-push-vs-with-capacity-performance-duplicate
title: >-
  Quel est l'impact sur les performances de l'utilisation de Vec::push() dans
  une boucle vs. la pré-allocation avec Vec::with_capacity() ?
slug: vec-push-vs-with-capacity-performance-duplicate
locale: fr
author: mayo
excerpt: >-
  Analyse des différences de performance entre Vec::push() dans des boucles et
  la pré-allocation avec Vec::with_capacity(), couvrant les coûts de
  réallocation mémoire et les stratégies d'optimisation
tags:
  - rust
  - collections
date: '2025-10-27'
---

# Quel est l'impact sur les performances de l'utilisation de Vec::push() dans une boucle vs. la pré-allocation avec Vec::with_capacity() ?

## Différences clés de performance

| Vec::push() dans une boucle | Vec::with_capacity() + push() |
|-----------------------------|--------------------------------|
| Réalloue la mémoire plusieurs fois (croissance exponentielle). | Alloue une seule fois au début. |
| Complexité temporelle O(n log n) (amortie). | Complexité temporelle O(n). |
| Peut fragmenter la mémoire à cause des allocations répétées. | Bloc mémoire contigu unique. |

## Pourquoi les réallocations sont coûteuses

### Stratégie de croissance
- Un Vec commence avec une capacité de 0 et double sa capacité lorsqu'il est plein (ex: 0 → 4 → 8 → 16...).
- Chaque réallocation implique :
  - L'allocation d'une nouvelle mémoire.
  - La copie de tous les éléments existants.
  - La libération de l'ancienne mémoire.

### Exemple pour 10 éléments
- **push() avec Vec::new()** : 4 réallocations (capacité 0 → 4 → 8 → 16).
- **push() avec with_capacity(10)** : 0 réallocation.

## Comparaison de benchmark

```rust
use std::time::Instant;

fn main() {
    // Test avec 1 million d'éléments
    let n = 1_000_000;
    
    // Méthode 1 : Sans pré-allocation
    let start = Instant::now();
    let mut v1 = Vec::new();
    for i in 0..n {
        v1.push(i);
    }
    println!("Vec::new(): {:?}", start.elapsed());
    
    // Méthode 2 : Pré-allocation
    let start = Instant::now();
    let mut v2 = Vec::with_capacity(n);
    for i in 0..n {
        v2.push(i);
    }
    println!("Vec::with_capacity(): {:?}", start.elapsed());
}
```

### Résultats typiques
```
Vec::new(): 1.8ms  
Vec::with_capacity(): 0.4ms  // 4.5x plus rapide
```

## Quand pré-allouer

- **Taille connue** : Utilisez with_capacity(n) si vous connaissez le nombre exact/maximum d'éléments.
- **Code critique en performance** : Évitez les réallocations dans les boucles critiques.
- **Données volumineuses** : Empêchez le stack overflow pour les collections énormes.

## Quand Vec::new() est acceptable

- **Petites/tailles inconnues** : Pour une utilisation ad-hoc ou des vecteurs de courte durée.
- **Simplicité du code** : Quand la performance n'est pas critique.

## Optimisation avancée : extend()

Si vous avez un iterator, extend() est souvent plus rapide qu'une boucle avec push() :

```rust
let mut v = Vec::with_capacity(n);
v.extend(0..n);  // Optimisé pour les iterators (évite les vérifications de limites)
```

## Points clés à retenir

✅ **Utilisez with_capacity() pour** :
- Les nombres d'éléments prévisibles.
- Les scénarios haute performance.

✅ **Utilisez Vec::new() pour** :
- Les petites/tailles inconnues ou le prototypage.

🚀 **Évitez les réallocations inutiles**—elles dominent le temps d'exécution pour les Vec volumineux.

## Impact dans le monde réel

Dans la crate regex, la pré-allocation est utilisée pour les groupes de capture afin d'éviter les réallocations pendant le pattern matching.

**Essayez ceci** : Que se passe-t-il si vous pré-allouez trop (ex: with_capacity(1000) mais n'utilisez que 10 éléments) ?

**Réponse** : Mémoire gaspillée. Utilisez shrink_to_fit() pour libérer la capacité inutilisée.
