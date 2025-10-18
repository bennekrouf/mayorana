---
id: vec-retain-vs-filter-collect
title: 'Vec::retain() vs filtrage avec iter().filter().collect() ?'
locale: fr
slug: vec-retain-vs-filter-collect
author: mayo
excerpt: >-
  Comparaison du filtrage en place avec Vec::retain() et iter().filter().collect()
  pour différents scénarios de filtrage et implications sur les performances
category: rust
tags:
  - rust
  - retain
date: '2025-07-28'
---

# Quel est l'objectif de Vec::retain() ? Comment se compare-t-il au filtrage avec iter().filter().collect() ?

## Vec::retain() : Filtrage en place

**Objectif** : Supprime les éléments d'un Vec en place selon un prédicat, en préservant l'ordre des éléments conservés.

**Signature** :
```rust
pub fn retain<F>(&mut self, f: F)
where
    F: FnMut(&T) -> bool,
```

## Caractéristiques principales

| Aspect | retain() | iter().filter().collect() |
|--------|----------|---------------------------|
| Modifie l'original | ✅ Oui (en place) | ❌ Non (alloue un nouveau Vec) |
| Préserve l'ordre | ✅ Oui | ✅ Oui |
| Efficacité mémoire | ✅ O(1) espace supplémentaire | ❌ O(n) espace supplémentaire |
| Performances | Plus rapide (pas de réallocation) | Plus lent (allocation/copie) |
| Cas d'usage | Filtrage sans allocation | Création d'une nouvelle collection filtrée |

## Exemple : Filtrer les nombres pairs

### Utilisation de retain() (en place)
```rust
let mut vec = vec![1, 2, 3, 4];
vec.retain(|x| x % 2 == 0);  // Garde les pairs
assert_eq!(vec, [2, 4]);      // Le `vec` original est modifié
```

### Utilisation de filter().collect() (nouvelle allocation)
```rust
let vec = vec![1, 2, 3, 4];
let filtered: Vec<_> = vec.iter().filter(|x| *x % 2 == 0).copied().collect();
assert_eq!(filtered, [2, 4]);  // Nouveau `Vec` créé
// `vec` reste inchangé : [1, 2, 3, 4]
```

## Comparaison des performances

### retain() :
- **Temps** : O(n) (passage unique, décale les éléments vers la gauche en place).
- **Espace** : O(1) (pas d'allocations supplémentaires).

### filter().collect() :
- **Temps** : O(n) (mais nécessite une copie vers une nouvelle allocation).
- **Espace** : O(n) (nouveau Vec alloué).

### Suggestion de benchmark :
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

**Résultat typique** : `retain()` est 2 à 3 fois plus rapide grâce à l'absence d'allocations.

## Quand utiliser chaque méthode

### Préférer retain() quand :
- Vous voulez modifier le Vec en place.
- L'efficacité mémoire est critique (ex : Vec de grande taille).
- L'ordre des éléments doit être préservé.

### Préférer filter().collect() quand :
- Vous avez besoin que le Vec original reste intact.
- Vous enchaînez plusieurs adaptateurs d'itérateur (ex : `.filter().map()`).
- Vous travaillez avec des itérateurs non-Vec (ex : ranges, slices).

## Notes avancées

### retain_mut() :
Rust fournit également `retain_mut()` pour les prédicats qui nécessitent un accès mutable aux éléments :

```rust
let mut vec = vec![1, 2, 3];
vec.retain_mut(|x| {
    *x += 1;           // Modification en place
    *x % 2 == 0        // Garde si pair après incrément
});
assert_eq!(vec, [2, 4]);
```

### Stabilité :
Les deux méthodes préservent l'ordre relatif des éléments conservés (filtrage stable).

## Points clés à retenir

✅ **retain()** : Plus rapide, efficace en mémoire et en place. Idéal pour les modifications en masse.
✅ **filter().collect()** : Flexible, non destructif. Idéal pour les pipelines d'itérateurs.

## Cas d'usage réel :
- **retain()** : Nettoyer les sessions expirées dans un pool de sessions serveur.
- **filter().collect()** : Transformer les données de réponse d'API en un sous-ensemble filtré.

**Essayez ceci** : Que se passe-t-il si vous utilisez `retain()` avec un prédicat qui conserve tous les éléments ?

**Réponse** : Aucune opération (aucun élément supprimé, pas de réallocations).