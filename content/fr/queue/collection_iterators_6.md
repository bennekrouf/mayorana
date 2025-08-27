---
id: box-slice-vs-vec-differences-fr
title: 'Quelle est la différence entre Box<[T]> et Vec<T> ?'
slug: box-slice-vs-vec-differences-fr
locale: "fr"
author: mayo
excerpt: >-
  Comparer les différences entre Box<[T]> et Vec<T> en mutabilité, overhead mémoire, et
  implications de performance pour différents cas d'usage
category: rust
tags:
  - rust
  - box
  - vec
  - collections
  - memory
  - performance
date: '2025-07-24'
---

# Quelle est la différence entre Box<[T]> et Vec<T> ?

## Différences Clés

| Feature | Vec<T> | Box<[T]> |
|---------|--------|----------|
| Mutabilité de Taille | Extensible/réductible (push, pop) | Taille fixe (immutable après création) |
| Stockage | Heap-allocated + champ capacity | Pure heap slice (pas de metadata supplémentaire) |
| Overhead Mémoire | 3 usizes (ptr, len, capacity) | 2 usizes (ptr, len) |
| Coût de Conversion | O(1) vers Box<[T]> (shrink-to-fit) | O(n) vers Vec (doit réallouer) |

## Quand Utiliser Chacun

### Préfère Vec<T> Quand :

Tu as besoin de redimensionnement dynamique :
```rust
let mut vec = vec![1, 2, 3];
vec.push(4);  // Fonctionne
```

Tu modifies fréquemment la collection (ex : ajouter/supprimer des éléments).

### Préfère Box<[T]> Quand :

Tu veux une collection de taille fixe, immutable :
```rust
let boxed_slice: Box<[i32]> = vec![1, 2, 3].into_boxed_slice();
// boxed_slice.push(4);  // ERREUR: Pas de méthode `push`
```

L'efficacité mémoire compte (ex : systèmes embarqués) :
- Économise 1 usize (pas de capacité inutilisée).

Interface avec des APIs nécessitant des slices owned :
```rust
fn process(data: Box<[i32]>) { /* ... */ }
```

## Conversion Entre Eux

| Direction | Code | Coût |
|-----------|------|------|
| Vec → Box<[T]> | `vec.into_boxed_slice()` | O(1) |
| Box<[T]> → Vec | `Vec::from(boxed_slice)` | O(n) |

### Exemple :
```rust
let vec = vec![1, 2, 3];
let boxed: Box<[i32]> = vec.into_boxed_slice();  // Pas de réallocation
let vec_again = Vec::from(boxed);                // Copie les données
```

## Implications de Performance

- **Itération** : Identique (les deux sont des arrays heap contigus).
- **Mémoire** : Box<[T]> évite l'overhead de capacité inutilisée.
- **Flexibilité** : Vec supporte la croissance en place ; Box<[T]> non.

## Cas d'Usage Réels

- **Vec** : Buffers pour données dynamiques (ex : corps de requêtes HTTP).
- **Box<[T]>** :
  - Configurations chargées une fois et jamais modifiées.
  - Stocker de gros datasets immutables (ex : assets de jeu).

## Points Clés

✅ Utilise Vec pour des séquences mutables, extensibles.

✅ Utilise Box<[T]> pour du stockage immutable, efficace en mémoire.

⚡ Convertis à bas coût de Vec vers Box<[T]> quand tu as fini de modifier.

**Essaie Ceci** : Que se passe-t-il si tu convertis un Vec avec de la capacité de spare vers Box<[T]> ?

**Réponse** : `into_boxed_slice()` réduit l'allocation à la taille exacte (pas de capacité inutilisée).