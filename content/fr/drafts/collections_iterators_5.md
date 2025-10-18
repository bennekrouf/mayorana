---
id: efficient-duplicate-removal-vec
title: 'Comment supprimer efficacement les doublons d''un Vec<T> où T: Eq + Hash ?'
slug: efficient-duplicate-removal-vec
locale: "fr"
author: mayo
excerpt: >-
  Approches efficaces pour supprimer les doublons d'un Vec<T> où T: Eq + Hash,
  comparant les méthodes basées sur HashSet et le tri avec analyse de performance
category: rust
tags:
  - rust
  - collections
date: '2025-07-21'
---

# Comment supprimer efficacement les doublons d'un Vec<T> où T: Eq + Hash ?

## Approches efficaces

Lorsque T implémente Eq + Hash (pour les vérifications d'égalité et le hachage), les méthodes optimales sont :

## 1. Utilisation de HashSet (préserve l'ordre)

### Étapes :
1. Parcourir le Vec.
2. Suivre les éléments déjà vus avec un HashSet.
3. Collecter uniquement les éléments non vus.

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
- **Temps** : O(n) (cas moyen, en supposant une bonne distribution de hachage).
- **Espace** : O(n) (pour le HashSet).

## 2. Tri + Dedup (détruit l'ordre)

### Étapes :
1. Trier le Vec (regroupe les doublons).
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
assert_eq!(vec, [1, 2, 3]); // Ordre modifié
```

### Performance :
- **Temps** : O(n log n) (dominé par le tri).
- **Espace** : O(1) (en place, pas d'allocations supplémentaires).

## Comparaison

| Méthode | Complexité temporelle | Complexité spatiale | Préserve l'ordre ? | Cas d'usage |
|--------|-----------------|------------------|------------------|----------|
| HashSet | O(n) | O(n) | ✅ Oui | L'ordre est important, tri non autorisé. |
| Tri + Dedup | O(n log n) | O(1) | ❌ Non | L'ordre est sans importance, mémoire limitée. |

## Points clés

✅ **Utilisez HashSet si** :
- L'ordre doit être préservé.
- Vous pouvez tolérer un espace O(n).

✅ **Utilisez Tri + Dedup si** :
- L'ordre n'a pas d'importance.
- La mémoire est limitée (ex : systèmes embarqués).

## Alternatives :
- Pour les environnements no_std, utilisez un BTreeSet (plus lent mais évite le hachage).
- Utilisez itertools::unique pour la déduplication basée sur les iterators.

**Essayez ceci** : Que se passe-t-il si T est Clone mais pas Hash ?

**Réponse** : Utilisez Vec::dedup_by avec une vérification d'égalité personnalisée (sans hachage).