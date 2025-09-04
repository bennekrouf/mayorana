---
id: efficient-duplicate-removal-vec-fr
title: Comment supprimer efficacement les doublons d\
un Vec<T> où T: Eq + Hash ?'
slug: efficient-duplicate-removal-vec-fr
locale: fr
author: mayo
excerpt: >-
  Approches efficaces pour supprimer les doublons d'un Vec<T> où T: Eq + Hash,
  comparant les méthodes basées sur HashSet et sort avec analyse de performance
category: rust
tags:
  - rust
  - vec
  - deduplication
  - hashset
  - performance
  - collections
date: '2025-08-24'
---

# Comment supprimer efficacement les doublons d'un Vec<T> où T: Eq + Hash ?

## Approches Efficaces

Quand T implémente Eq + Hash (pour les vérifications d'égalité et hashing), les méthodes optimales sont :

## 1. Utiliser HashSet (Préserve l'Ordre)

### Étapes :
1. Itérer à travers le Vec.
2. Tracker les éléments vus avec un HashSet.
3. Collecter seulement les éléments non vus.

### Code :
```rust
use std::collections::HashSet;

fn dedup_ordered<T: Eq + std::hash::Hash + Clone>(vec: &mut Vec<T>) {
    let mut seen = HashSet::new();
    vec.retain(|x| seen.insert(x.clone()));
}
```

### Exemple :
```rust
let mut vec = vec![1, 2, 2, 3, 3, 3];
dedup_ordered(&mut vec);
assert_eq!(vec, [1, 2, 3]); // Ordre préservé
```

### Performance :
- **Temps** : O(n) (cas moyen, en supposant une bonne distribution de hash).
- **Espace** : O(n) (pour le HashSet).

## 2. Sort + Dedup (Détruit l'Ordre)

### Étapes :
1. Trier le Vec (groupe les doublons ensemble).
2. Supprimer les doublons consécutifs avec dedup().

### Code :
```rust
fn dedup_unordered<T: Ord>(vec: &mut Vec<T>) {
    vec.sort();      // O(n log n)
    vec.dedup();     // O(n)
}
```

### Exemple :
```rust
let mut vec = vec![3, 2, 2, 1, 3];
dedup_unordered(&mut vec);
assert_eq!(vec, [1, 2, 3]); // Ordre changé
```

### Performance :
- **Temps** : O(n log n) (dominé par le tri).
- **Espace** : O(1) (en place, pas d'allocations supplémentaires).

## Comparaison

| Méthode | Complexité Temps | Complexité Espace | Préserve l'Ordre ? | Cas d'Usage |
|---------|------------------|-------------------|-------------------|-------------|
| HashSet | O(n) | O(n) | ✅ Oui | L'ordre compte, pas de tri autorisé. |
| Sort + Dedup | O(n log n) | O(1) | ❌ Non | Ordre pas important, contraintes mémoire. |

## Points Clés

✅ **Utilise HashSet si** :
- L'ordre doit être préservé.
- Tu peux tolérer O(n) d'espace.

✅ **Utilise Sort + Dedup si** :
- L'ordre n'a pas d'importance.
- La mémoire est limitée (ex : systèmes embarqués).

## Alternatives :
- Pour les environnements no_std, utilise un BTreeSet (plus lent mais évite le hashing).
- Utilise itertools::unique pour la déduplication basée sur iterator.

**Essaie Ceci** : Que se passe-t-il si T est Clone mais pas Hash ?

**Réponse** : Utilise Vec::dedup_by avec une vérification d'égalité personnalisée (pas de hashing).
