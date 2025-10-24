---
id: vec-new-vs-with-capacity
title: 'Rust Vec::new() vs. with_capacity() : Quand utiliser chacune'
slug: vec-new-vs-with-capacity
locale: fr
date: '2025-10-24'
author: mayo
excerpt: >-
  Stratégies d'allocation de Vec en Rust, comparant Vec::new() et
  Vec::with_capacity() pour des performances optimales.
tags:
  - rust
  - collections
  - iterators
---

# Quelle est la différence entre Vec::new() et Vec::with_capacity() ? Quand utiliser chacune ?

Comprendre les stratégies d'allocation de Vec est crucial pour écrire du code Rust performant, particulièrement lorsqu'on travaille avec des collections et des itérateurs.

## Différences principales

| `Vec::new()` | `Vec::with_capacity(n)` |
|--------------|-------------------------|
| Crée un Vec vide sans espace pré-alloué | Crée un Vec vide avec de l'espace pour n éléments |
| La capacité initiale est 0 (alloue au premier push) | La capacité initiale est exactement n (pas d'allocations précoces) |
| Croît dynamiquement (peut réallouer plusieurs fois) | Évite la réallocation jusqu'à ce que len() > n |

## Quand utiliser chacune

Utilisez `Vec::new()` quand :
- Le nombre d'éléments est inconnu ou petit
- Vous voulez de la simplicité (ex : vecteurs de courte durée)

```rust
let mut v = Vec::new(); // Bon pour un usage ad hoc
v.push(1);
```

Utilisez `Vec::with_capacity(n)` quand :
- Vous connaissez le nombre exact ou maximum d'éléments à l'avance
- Vous optimisez pour la performance (évite les réallocations)

```rust
let mut v = Vec::with_capacity(1000); // Pré-alloue pour 1000 éléments
for i in 0..1000 {
    v.push(i); // Aucune réallocation ne se produit
}
```

## Impact sur les performances

`Vec::new()` peut déclencher plusieurs réallocations lors de sa croissance (ex : commence à 0, puis 4, 8, 16, ...).
`Vec::with_capacity(n)` garantit une seule allocation initiale (si n est correct).

## Exemple de benchmark

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

## Notes avancées

- `shrink_to_fit()` : Réduit la capacité excédentaire (ex : après suppression d'éléments)
- Macro `vec![]` : Utilise with_capacity implicitement pour les littéraux (ex : vec![1, 2, 3])

## Points clés à retenir

- ✅ Par défaut, utilisez `Vec::new()` pour la simplicité.  
- ✅ Utilisez `with_capacity(n)` quand :
- Vous connaissez la taille à l'avance
- La performance est critique (ex : boucles critiques)

**Essayez ceci :** Que se passe-t-il si vous poussez au-delà de la capacité pré-allouée ?  
**Réponse :** Le Vec croît automatiquement (comme `Vec::new()`), mais seulement après avoir dépassé n.
