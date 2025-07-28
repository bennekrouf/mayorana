---
id: vec-drain-vs-truncate-clear-fr
title: 'Vec::drain() Vs Vec::truncate() ou Vec::clear() ?'
slug: vec-drain-vs-truncate-clear-fr
locale: "fr"
author: mayo
excerpt: >-
  Comprendre la fonctionnalité de Vec::drain() et la comparer avec Vec::truncate()
  et Vec::clear() pour différents scénarios de suppression d'éléments
category: rust
tags:
  - rust
  - vec
  - drain
  - truncate
  - clear
  - collections
date: '2025-07-26'
---

# Comment fonctionne Vec::drain(), et quand est-ce utile comparé à Vec::truncate() ou Vec::clear() ?

## Qu'est-ce que Vec::drain() ?

`drain()` supprime une plage d'éléments d'un Vec tout en cédant leur ownership via un iterator. Contrairement à `truncate()` ou `clear()`, cela te permet de traiter les éléments supprimés avant qu'ils soient dropped.

### Signature
```rust
pub fn drain<R>(&mut self, range: R) -> Drain<'_, T>
where
    R: RangeBounds<usize>,
```

## Features Clés

| Méthode | Supprime Éléments | Cède Ownership | Préserve Capacité | Complexité Temps |
|---------|-------------------|----------------|-------------------|------------------|
| `drain(..)` | Oui | ✅ Oui (via iterator) | ✅ Oui | O(n) |
| `truncate()` | Oui (depuis index) | ❌ Non | ✅ Oui | O(1) |
| `clear()` | Tous | ❌ Non | ✅ Oui | O(1) |

## Quand Utiliser Chacun

### 1. Vec::drain()

**Cas d'Usage** : Traiter les éléments supprimés (ex : filtrer, transformer, ou batch-delete).

**Exemple** :
```rust
let mut vec = vec!['a', 'b', 'c', 'd'];
for ch in vec.drain(1..3) {  // Supprime 'b' et 'c'
    println!("Removed: {}", ch);  // Affiche 'b', puis 'c'
}
assert_eq!(vec, ['a', 'd']);  // Garde les éléments restants
```

**Performance** : Évite les allocations supplémentaires si tu réutilises l'iterator.

### 2. Vec::truncate()

**Cas d'Usage** : Supprimer rapidement des éléments de la fin sans les traiter.

**Exemple** :
```rust
let mut vec = vec![1, 2, 3, 4];
vec.truncate(2);  // Drop 3 et 4 (pas d'iterator)
assert_eq!(vec, [1, 2]);
```

### 3. Vec::clear()

**Cas d'Usage** : Supprimer tous les éléments (plus rapide que `drain(..)` si tu n'en as pas besoin).

**Exemple** :
```rust
let mut vec = vec![1, 2, 3];
vec.clear();  // Drop tous les éléments
assert!(vec.is_empty());
```

## Comportement Mémoire

- Les trois méthodes conservent la capacité du Vec (pas de réallocation si des éléments sont re-ajoutés).
- `drain()` est lazy : Les éléments ne sont dropped que quand l'iterator est consommé.

## Usage Avancé : Réutiliser le Stockage

`drain()` est idéal pour remplacer un sous-ensemble d'éléments efficacement :

```rust
let mut vec = vec!["old", "old", "new", "old"];
vec.drain(0..2).for_each(drop);  // Supprime les deux premiers
vec.insert(0, "fresh");
assert_eq!(vec, ["fresh", "new", "old"]);
```

## Points Clés

- ✅ **drain()** : Utilise quand tu as besoin de traiter les éléments supprimés ou faire du batch-delete.
- ✅ **truncate()/clear()** : Utilise pour une suppression en masse rapide sans traitement.
- 🚀 **Tous préservent la capacité** : Pas d'overhead de réallocation pour les futures ops.

## Exemple Réel

Dans un moteur de jeu, `drain()` pourrait efficacement supprimer les entités expirées tout en autorisant la logique de cleanup (ex : sauvegarder l'état).

**Essaie Ceci** : Que se passe-t-il si tu fais `drain()` mais ne consommes pas l'iterator ?

**Réponse** : Les éléments sont quand même supprimés quand l'iterator Drain est dropped (à cause de son impl Drop).