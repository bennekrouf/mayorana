---
id: vec-retain-vs-filter-collect-fr
title: 'Vec::retain() Vs filtrer avec iter().filter().collect() ?'
locale: fr
slug: vec-retain-vs-filter-collect-fr
author: mayo
excerpt: >-
  Comparer Vec::retain() pour le filtrage en place avec iter().filter().collect() pour
  différents scénarios de filtrage et implications de performance
category: rust
tags:
  - rust
  - vec
  - retain
  - filter
  - iterators
  - performance
date: '2025-07-28'
---

# Quel est le but de Vec::retain() ? Comment se compare-t-il au filtrage avec iter().filter().collect() ?

## Vec::retain(): Filtrage En Place

**But** : Supprime des éléments d'un Vec en place basé sur un prédicat, préservant l'ordre des éléments conservés.

**Signature** :
```rust
pub fn retain<F>(&mut self, f: F)
where
    F: FnMut(&T) -> bool,
```

## Features Clés

| Aspect | retain() | iter().filter().collect() |
|--------|----------|---------------------------|
| Mute l'Original | ✅ Oui (en place) | ❌ Non (alloue nouveau Vec) |
| Préserve l'Ordre | ✅ Oui | ✅ Oui |
| Efficacité Mémoire | ✅ O(1) espace supplémentaire | ❌ O(n) espace supplémentaire |
| Performance | Plus rapide (pas de réallocation) | Plus lent (alloue/copie) |
| Cas d'Usage | Filtrage sans allocation | Créer une nouvelle collection filtrée |

## Exemple : Filtrer les Nombres Pairs

### Utiliser retain() (En Place)
```rust
let mut vec = vec![1, 2, 3, 4];
vec.retain(|x| x % 2 == 0);  // Garde les pairs
assert_eq!(vec, [2, 4]);      // `vec` original modifié
```

### Utiliser filter().collect() (Nouvelle Allocation)
```rust
let vec = vec![1, 2, 3, 4];
let filtered: Vec<_> = vec.iter().filter(|x| *x % 2 == 0).copied().collect();
assert_eq!(filtered, [2, 4]);  // Nouveau `Vec` créé
// `vec` reste inchangé : [1, 2, 3, 4]
```

## Comparaison de Performance

### retain() :
- **Temps** : O(n) (passe unique, décale les éléments à gauche en place).
- **Espace** : O(1) (pas d'allocations supplémentaires).

### filter().collect() :
- **Temps** : O(n) (mais nécessite copie vers une nouvelle allocation).
- **Espace** : O(n) (nouveau Vec alloué).

### Suggestion de Benchmark :
```rust
let mut big_vec = (0..1_000_000).collect::<Vec<_>>();

// Mesurer `retain`
let start = std::time::Instant::now();
big_vec.retain(|x| x % 2 == 0);
println!("retain: {:?}", start.elapsed());

// Mesurer `filter().collect()`
let big_vec = (0..1_000_000).collect::<Vec<_>>();
let start = std::time::Instant::now();
let filtered = big_vec.iter().filter(|x| *x % 2 == 0).collect::<Vec<_>>();
println!("filter.collect: {:?}", start.elapsed());
```

**Résultat Typique** : `retain()` est 2–3x plus rapide à cause de l'absence d'allocations.

## Quand Utiliser Chacun

### Préfère retain() Quand :
- Tu veux modifier le Vec en place.
- L'efficacité mémoire est critique (ex : gros Vecs).
- L'ordre des éléments doit être préservé.

### Préfère filter().collect() Quand :
- Tu as besoin que le Vec original reste intact.
- Tu chaînes plusieurs adaptateurs d'iterator (ex : `.filter().map()`).
- Tu travailles avec des iterators non-Vec (ex : ranges, slices).

## Notes Avancées

### retain_mut() :
Rust fournit aussi `retain_mut()` pour des prédicats qui ont besoin d'accès mutable aux éléments :

```rust
let mut vec = vec![1, 2, 3];
vec.retain_mut(|x| {
    *x += 1;           // Modifie en place
    *x % 2 == 0        // Garde si pair après incrément
});
assert_eq!(vec, [2, 4]);
```

### Stabilité :
Les deux méthodes préservent l'ordre relatif des éléments conservés (filtrage stable).

## Points Clés

✅ **retain()** : Plus rapide, efficace en mémoire, et en place. Idéal pour modifications en masse.

✅ **filter().collect()** : Flexible, non-destructif. Idéal pour pipelines d'iterator.

## Cas d'Usage Réel :
- **retain()** : Nettoyer les sessions expirées dans un pool de sessions de serveur.
- **filter().collect()** : Transformer les données de réponse API en sous-ensemble filtré.

**Essaie Ceci** : Que se passe-t-il si tu fais `retain()` avec un prédicat qui garde tous les éléments ?

**Réponse** : No-op (aucun élément supprimé, pas de réallocations).