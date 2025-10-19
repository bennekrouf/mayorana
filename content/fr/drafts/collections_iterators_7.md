---
id: vec-drain-vs-truncate-clear
title: 'Vec::drain() vs Vec::truncate() ou Vec::clear() ?'
slug: vec-drain-vs-truncate-clear
locale: "fr"
author: mayo
excerpt: >-
  Comprendre le fonctionnement de Vec::drain() et le comparer avec Vec::truncate()
  et Vec::clear() pour différents scénarios de suppression d'éléments

tags:
  - rust
  - drain
date: '2025-07-26'
---

# Comment fonctionne Vec::drain(), et quand est-il utile comparé à Vec::truncate() ou Vec::clear() ?

## Qu'est-ce que Vec::drain() ?

`drain()` supprime une plage d'éléments d'un Vec tout en cédant leur ownership via un itérateur. Contrairement à `truncate()` ou `clear()`, il vous permet de traiter les éléments supprimés avant qu'ils ne soient libérés.

### Signature
```rust
pub fn drain<R>(&mut self, range: R) -> Drain<'_, T>
where
    R: RangeBounds<usize>,
```

## Caractéristiques principales

| Méthode | Supprime les éléments | Cède l'ownership | Préserve la capacité | Complexité temporelle |
|---------|----------------------|------------------|---------------------|----------------------|
| `drain(..)` | Oui | ✅ Oui (via itérateur) | ✅ Oui | O(n) |
| `truncate()` | Oui (à partir d'un index) | ❌ Non | ✅ Oui | O(1) |
| `clear()` | Tous | ❌ Non | ✅ Oui | O(1) |

## Quand utiliser chaque méthode

### 1. Vec::drain()

**Cas d'usage** : Traiter les éléments supprimés (par exemple, filtrer, transformer ou supprimer par lots).

**Exemple** :
```rust
let mut vec = vec!['a', 'b', 'c', 'd'];
for ch in vec.drain(1..3) {  // Supprime 'b' et 'c'
    println!("Supprimé : {}", ch);  // Affiche 'b', puis 'c'
}
assert_eq!(vec, ['a', 'd']);  // Garde les éléments restants
```

**Performance** : Évite les allocations supplémentaires si on réutilise l'itérateur.

### 2. Vec::truncate()

**Cas d'usage** : Supprimer rapidement des éléments depuis la fin sans les traiter.

**Exemple** :
```rust
let mut vec = vec![1, 2, 3, 4];
vec.truncate(2);  // Libère 3 et 4 (pas d'itérateur)
assert_eq!(vec, [1, 2]);
```

### 3. Vec::clear()

**Cas d'usage** : Supprimer tous les éléments (plus rapide que `drain(..)` si vous n'en avez pas besoin).

**Exemple** :
```rust
let mut vec = vec![1, 2, 3];
vec.clear();  // Libère tous les éléments
assert!(vec.is_empty());
```

## Comportement mémoire

- Les trois méthodes conservent la capacité du Vec (pas de réallocation si des éléments sont rajoutés).
- `drain()` est paresseux : les éléments ne sont libérés que lorsque l'itérateur est consommé.

## Utilisation avancée : Réutiliser le stockage

`drain()` est idéal pour remplacer efficacement un sous-ensemble d'éléments :

```rust
let mut vec = vec!["old", "old", "new", "old"];
vec.drain(0..2).for_each(drop);  // Supprime les deux premiers
vec.insert(0, "fresh");
assert_eq!(vec, ["fresh", "new", "old"]);
```

## Points clés à retenir

- ✅ **drain()** : À utiliser quand vous devez traiter les éléments supprimés ou supprimer par lots.
- ✅ **truncate()/clear()** : À utiliser pour une suppression en masse rapide sans traitement.
- 🚀 **Tous préservent la capacité** : Pas de surcoût de réallocation pour les opérations futures.

## Exemple concret

Dans un moteur de jeu, `drain()` pourrait efficacement supprimer les entités expirées tout en permettant une logique de nettoyage (par exemple, sauvegarder l'état).

**Essayez ceci** : Que se passe-t-il si vous utilisez `drain()` mais ne consommez pas l'itérateur ?

**Réponse** : Les éléments sont quand même supprimés lorsque l'itérateur Drain est libéré (grâce à son implémentation de Drop).