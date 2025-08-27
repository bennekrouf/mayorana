---
id: flatten-vec-iterators-performance-fr
title: Aplatir un Vec<Vec<T>> en Vec<T> en utilisant les iterators
locale: "fr"
slug: flatten-vec-iterators-performance-fr
author: mayo
excerpt: >-
  Aplatir Vec<Vec<T>> en utilisant les iterators comparé à la concaténation manuelle,
  analysant les implications de performance et stratégies d'optimisation
category: rust
tags:
  - rust
  - vec
  - flatten
  - iterators
  - performance
  - collections
date: '2025-07-23'
---

# Comment aplatirais-tu un Vec<Vec<T>> en Vec<T> en utilisant les iterators ? Compare la performance avec la concaténation manuelle.

## Aplatir avec les Iterators

La façon la plus idiomatique est d'utiliser `.flatten()` ou `.flat_map()` :

```rust
let nested = vec![vec![1, 2], vec![3], vec![4, 5, 6]];

// Méthode 1: flatten() (pour Vec<Iterables>)
let flat: Vec<_> = nested.iter().flatten().copied().collect();

// Méthode 2: flat_map() (pour transformations personnalisées)
let flat: Vec<_> = nested.into_iter().flat_map(|v| v).collect();
```

**Sortie** : `[1, 2, 3, 4, 5, 6]`

## Concaténation Manuelle

Pour comparaison, voici comment tu pourrais le faire manuellement :

```rust
let mut flat = Vec::new();
for subvec in nested {
    flat.extend(subvec);  // ou append() si subvec n'est plus nécessaire
}
```

## Comparaison de Performance

| Méthode | Complexité Temps | Complexité Espace | Allocations | Optimisations |
|---------|------------------|-------------------|-------------|---------------|
| Iterator (flatten) | O(n) | O(1) iterator | 1 (résultat) | Peut fuser les iterators |
| Manuel (extend) | O(n) | O(1) espace temp | 1 (résultat) | Pré-allocation possible |

## Insights Clés

### Avantage de Pré-allocation (Manuel)

Tu peux pré-allouer le Vec cible si la taille totale est connue :

```rust
let total_len: usize = nested.iter().map(|v| v.len()).sum();
let mut flat = Vec::with_capacity(total_len);  // Critique pour gros datasets
flat.extend(nested.into_iter().flatten());
```

### Laziness des Iterators

- `.flatten()` est lazy, mais `.collect()` doit quand même allouer le résultat.
- Les iterators chaînés (ex : `.filter().flatten()`) peuvent mieux optimiser que les boucles manuelles.

## Exemple de Benchmark

```rust
let nested: Vec<Vec<i32>> = (0..1_000).map(|i| vec![i; 100]).collect();

// Approche iterator
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

**Résultat Typique** :
- Manuel avec pré-allocation est ~10–20% plus rapide pour gros Vecs.
- Version iterator est plus concise et également rapide pour petites données.

## Quand Utiliser Chacune

| Approche | Meilleure Pour | Pièges |
|----------|----------------|--------|
| Iterator | Lisibilité, chaîner les opérations | Légèrement plus lent sans pré-allocation |
| Manuel | Performance maximum, grosses données | Verbeux ; nécessite calcul de longueur |

## Avancé : Aplatissement Zero-Copy

Si tu as `Vec<&[T]>` au lieu de `Vec<Vec<T>>`, utilise `.flatten().copied()` pour éviter le cloning :

```rust
let slices: Vec<&[i32]> = vec![&[1, 2], &[3, 4]];
let flat: Vec<i32> = slices.iter().flatten().copied().collect();
```

## Points Clés

✅ **Utilise .flatten() pour** :
- Code propre, idiomatique.
- Chaîner avec autres adaptateurs d'iterator (ex : `.filter()`).

✅ **Utilise extend manuel pour** :
- Gros datasets où la pré-allocation compte.
- Cas où tu connais déjà la longueur totale.

🚀 **Pré-alloue toujours pour concaténation manuelle de grosses collections !**

**Essaie Ceci** : Comment aplatirais-tu un `Vec<Vec<T>>` tout en supprimant les doublons ?

**Réponse** : Combine `.flatten()` avec `.collect::<HashSet<_>>()`.

## Exemples Supplémentaires

### Aplatissement avec Transformation

```rust
let nested = vec![vec![1, 2], vec![3, 4, 5]];

// Aplatir et doubler chaque élément
let doubled: Vec<_> = nested
    .iter()
    .flatten()
    .map(|&x| x * 2)
    .collect();
// Résultat: [2, 4, 6, 8, 10]
```

### Aplatissement Conditionnel

```rust
let nested = vec![vec![1, 2, 3], vec![4, 5], vec![6, 7, 8, 9]];

// Aplatir seulement les vecs avec plus de 2 éléments
let filtered_flat: Vec<_> = nested
    .iter()
    .filter(|v| v.len() > 2)
    .flatten()
    .copied()
    .collect();
// Résultat: [1, 2, 3, 6, 7, 8, 9]
```

### Performance avec Different Tailles

```rust
fn benchmark_different_sizes() {
    // Nombreux petits vecs
    let many_small: Vec<Vec<i32>> = (0..10_000).map(|i| vec![i, i+1]).collect();
    
    // Peu de gros vecs
    let few_large: Vec<Vec<i32>> = (0..10).map(|i| (0..10_000).collect()).collect();
    
    // Test des deux approches
    // many_small favorise généralement les iterators
    // few_large favorise la pré-allocation manuelle
}
```

### Zero-Allocation avec Références

```rust
fn process_nested_data(data: &[Vec<i32>]) -> i32 {
    // Traite sans allouer un nouveau Vec
    data.iter()
        .flatten()
        .filter(|&&x| x > 0)
        .sum()
}
```

La clé est de choisir l'approche basée sur tes besoins : iterators pour la lisibilité et le chaînage, manuel pour la performance pure avec de grosses données.