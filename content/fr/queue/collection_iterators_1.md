---
id: vec-new-vs-with-capacity-fr
title: >-
  Rust Vec::new() vs. with_capacity()
slug: vec-new-vs-with-capacity-fr
locale: "fr"
date: '2025-06-25'
author: mayo
excerpt: >-
  Stratégies d'allocation Vec en Rust, comparant
  Vec::new() et Vec::with_capacity() pour une performance optimale.
category: rust
tags:
  - rust
  - collections
  - performance
  - vec
  - iterators
---

# Quelle est la différence entre Vec::new() et Vec::with_capacity() ?

Comprendre les stratégies d'allocation Vec est crucial pour écrire du code Rust performant, surtout quand on manipule des collections et iterators.

## Différences Clés

| `Vec::new()` | `Vec::with_capacity(n)` |
|--------------|-------------------------|
| Crée un Vec vide sans espace pré-alloué | Crée un Vec vide avec espace pour n éléments |
| Capacité initiale est 0 (alloue au premier push) | Capacité initiale est exactement n (pas d'allocations précoces) |
| Grandit dynamiquement (peut réallouer plusieurs fois) | Évite la réallocation jusqu'à len() > n |

## Quand Utiliser Chacune

Utilise `Vec::new()` quand :
- Le nombre d'éléments est inconnu ou petit
- Tu veux la simplicité (ex : vecteurs courte durée)

```rust
let mut v = Vec::new(); // Bon pour usage ad-hoc
v.push(1);
```

Utilise `Vec::with_capacity(n)` quand :
- tu connais le nombre exact ou maximum d'éléments à l'avance
- Optimisation pour la performance (évite les réallocations)

```rust
let mut v = Vec::with_capacity(1000); // Pré-alloue pour 1000 items
for i in 0..1000 {
    v.push(i); // Aucune réallocation ne se produit
}
```

## Impact sur la Performance

`Vec::new()` peut déclencher de multiples réallocations en grandissant (ex : commence à 0, puis 4, 8, 16, ...).

`Vec::with_capacity(n)` garantit une allocation d'avance (si n est correct).

## Exemple de Benchmark

```rust
use std::time::Instant;

fn main() {
    let start = Instant::now();
    let mut v1 = Vec::new();
    for i in 0..1_000_000 {
        v1.push(i); // Réalloue ~20 fois
    }
    println!("Vec::new(): {:?}", start.elapsed());

    let start = Instant::now();
    let mut v2 = Vec::with_capacity(1_000_000);
    for i in 0..1_000_000 {
        v2.push(i); // Aucune réallocation
    }
    println!("Vec::with_capacity(): {:?}", start.elapsed());
}
```

Sortie (typique) :
```
Vec::new(): 1.2ms
Vec::with_capacity(): 0.3ms  // 4x plus rapide
```

## Notes Avancées

- `shrink_to_fit()` : Réduit le petit excédent de capacité (ex : après suppression d'éléments)
- Macro `vec![]` : Utilise with_capacity implicitement pour les littéraux (ex : vec![1, 2, 3])

## Points Clés

- ✅ Par défaut `Vec::new()` pour la simplicité.  
- ✅ Utilise `with_capacity(n)` quand :
  - tu connais la taille à l'avance
  - La performance est critique (ex : boucles chaudes)

**Essaie Ceci :** Que se passe-t-il si tu ajoutes des éléments au-delà de la capacité pré-allouée ?  
**Réponse :** Le Vec grandit automatiquement (comme `Vec::new()`), mais seulement après avoir dépassé n.