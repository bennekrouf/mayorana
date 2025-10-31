---
id: flatten-vec-iterators-performance
title: Aplatir un Vec<Vec<T>> en Vec<T> avec des itérateurs
locale: fr
slug: flatten-vec-iterators-performance
author: mayo
excerpt: >-
  Comparaison entre l'aplatissement de Vec<Vec<T>> avec des itérateurs et la
  concaténation manuelle, avec analyse des implications sur les performances
tags:
  - rust
  - vec
date: '2025-10-31'
---

# Comment aplatir un Vec<Vec<T>> en Vec<T> avec des itérateurs ? Comparaison des performances avec la concaténation manuelle.

## Aplatissement avec les itérateurs

La manière la plus idiomatique est d'utiliser `.flatten()` ou `.flat_map()` :

```rust
let nested = vec![vec![1, 2], vec![3], vec![4, 5, 6]];

// Méthode 1 : flatten() (pour Vec<Iterables>)
let flat: Vec<_> = nested.iter().flatten().copied().collect();

// Méthode 2 : flat_map() (pour des transformations personnalisées)
let flat: Vec<_> = nested.into_iter().flat_map(|v| v).collect();
```

**Résultat** : `[1, 2, 3, 4, 5, 6]`

## Concaténation manuelle

Pour comparaison, voici comment vous pourriez le faire manuellement :

```rust
let mut flat = Vec::new();
for subvec in nested {
    flat.extend(subvec);  // ou append() si subvec n'est plus nécessaire
}
```

## Comparaison des performances

| Méthode | Complexité temporelle | Complexité spatiale | Allocations | Optimisations |
|--------|-----------------|------------------|-------------|---------------|
| Itérateur (flatten) | O(n) | O(1) itérateur | 1 (résultat) | Peut fusionner les itérateurs |
| Manuel (extend) | O(n) | O(1) espace temporaire | 1 (résultat) | Pré-allocation possible |

## Principales observations

### Avantage de la pré-allocation (Manuel)

Vous pouvez pré-allouer le Vec cible si la taille totale est connue :

```rust
let total_len: usize = nested.iter().map(|v| v.len()).sum();
let mut flat = Vec::with_capacity(total_len);  // Critique pour les grands jeux de données
flat.extend(nested.into_iter().flatten());
```

### Évaluation paresseuse des itérateurs

- `.flatten()` est paresseux, mais `.collect()` doit quand même allouer le résultat.
- Les itérateurs chaînés (ex: `.filter().flatten()`) peuvent être mieux optimisés que les boucles manuelles.

## Exemple de benchmark

```rust
let nested: Vec<Vec<i32>> = (0..1_000).map(|i| vec![i; 100]).collect();

// Approche par itérateur
let start = std::time::Instant::now();
let flat = nested.iter().flatten().copied().collect::<Vec<_>>();
println!("flatten: {:?}", start.elapsed());

// Approche manuelle avec pré-allocation
let start = std::time::Instant::now();
let total_len = nested.iter().map(|v| v.len()).sum();
let mut flat = Vec::with_capacity(total_len);
flat.extend(nested.into_iter().flatten());
println!("manual: {:?}", start.elapsed());
```

**Résultat typique** :
- La méthode manuelle avec pré-allocation est ~10–20% plus rapide pour les grands Vec.
- La version avec itérateur est plus concise et aussi rapide pour les petites données.

## Quand utiliser chaque approche

| Approche | Convient le mieux pour | Pièges |
|----------|----------|----------|
| Itérateur | Lisibilité, chaînage d'opérations | Légèrement plus lent sans pré-allocation |
| Manuel | Performances maximales, grandes données | Verbeux ; nécessite le calcul de la longueur |

## Avancé : Aplatissement sans copie

Si vous avez `Vec<&[T]>` au lieu de `Vec<Vec<T>>`, utilisez `.flatten().copied()` pour éviter le clonage :

```rust
let slices: Vec<&[i32]> = vec![&[1, 2], &[3, 4]];
let flat: Vec<i32> = slices.iter().flatten().copied().collect();
```

## Points clés à retenir

✅ **Utilisez .flatten() pour** :
- Un code propre et idiomatique.
- Le chaînage avec d'autres adaptateurs d'itérateurs (ex: `.filter()`).

✅ **Utilisez extend manuel pour** :
- Les grands jeux de données où la pré-allocation est importante.
- Les cas où vous connaissez déjà la longueur totale.

🚀 **Toujours pré-allouer pour la concaténation manuelle de grandes collections !**

**Essayez ceci** : Comment aplatiriez-vous un `Vec<Vec<T>>` tout en supprimant les doublons ?

**Réponse** : Combinez `.flatten()` avec `.collect::<HashSet<_>>()`.
