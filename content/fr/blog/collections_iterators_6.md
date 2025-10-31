---
id: box-slice-vs-vec-differences
title: 'Quelle est la différence entre Box<[T]> et Vec<T> ?'
slug: box-slice-vs-vec-differences
locale: fr
author: mayo
excerpt: >-
  Comparaison des différences entre Box<[T]> et Vec<T> concernant la
  mutabilité,  la surcharge mémoire et les implications de performance pour
  différents cas d'usage
tags:
  - rust
  - collections
date: '2025-10-28'
---

# Quelle est la différence entre Box<[T]> et Vec<T> ?

## Différences principales

| Caractéristique | Vec<T> | Box<[T]> |
|-----------------|--------|----------|
| Mutabilité de taille | Redimensionnable (push, pop) | Taille fixe (immuable après création) |
| Stockage | Allocation sur le heap + champ capacité | Slice pur sur le heap (pas de métadonnées supplémentaires) |
| Surcharge mémoire | 3 usizes (ptr, len, capacity) | 2 usizes (ptr, len) |
| Coût de conversion | O(1) vers Box<[T]> (shrink-to-fit) | O(n) vers Vec (doit réallouer) |

## Quand utiliser chacun

### Préférez Vec<T> quand :

Vous avez besoin de redimensionnement dynamique :

```rust
let mut vec = vec![1, 2, 3];
vec.push(4);  // Fonctionne
```

Vous modifiez fréquemment la collection (par exemple, ajout/suppression d'éléments).

### Préférez Box<[T]> quand :

Vous voulez une collection de taille fixe et immuable :

```rust
let boxed_slice: Box<[i32]> = vec![1, 2, 3].into_boxed_slice();
// boxed_slice.push(4);  // ERREUR : Pas de méthode `push`
```

L'efficacité mémoire est importante (par exemple, systèmes embarqués) :
- Économise 1 usize (pas de capacité inutilisée).

Interface avec des APIs nécessitant des slices possédés :

```rust
fn process(data: Box<[i32]>) { /* ... */ }
```

## Conversion entre eux

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

## Implications de performance

- **Itération** : Identique (les deux sont des tableaux contigus sur le heap).
- **Mémoire** : Box<[T]> évite la surcharge de capacité inutilisée.
- **Flexibilité** : Vec supporte la croissance en place ; Box<[T]> ne le fait pas.

## Cas d'usage réels

- **Vec** : Tampons pour données dynamiques (par exemple, corps de requêtes HTTP).
- **Box<[T]>** :
  - Configurations chargées une fois et jamais modifiées.
  - Stockage de grands jeux de données immuables (par exemple, assets de jeu).

## Points clés à retenir

✅ Utilisez Vec pour des séquences mutables et redimensionnables.
✅ Utilisez Box<[T]> pour du stockage immuable et efficace en mémoire.
⚡ Convertissez facilement de Vec vers Box<[T]> quand vous avez fini de modifier.

**Essayez ceci** : Que se passe-t-il si vous convertissez un Vec avec de la capacité libre en Box<[T]> ?

**Réponse** : `into_boxed_slice()` réduit l'allocation à la taille exacte (pas de capacité inutilisée).
