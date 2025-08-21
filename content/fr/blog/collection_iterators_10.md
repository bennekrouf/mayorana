---
id: into-iter-vs-iter-ownership-fr
title: Implications d'itérer sur un Vec avec .into_iter() au lieu de .iter()
slug: into-iter-vs-iter-ownership-fr
locale: fr
author: mayo
excerpt: >-
  Comprendre les différences entre .into_iter() et .iter() lors de l'itération
  sur Vec, couvrant les implications d'ownership et considérations de
  performance
category: rust
tags:
  - rust
  - iterators
  - ownership
  - vec
  - into-iter
  - collections
date: '2025-08-21'
---

# Lors de l'itération sur un Vec, pourquoi utiliser .into_iter() au lieu de .iter() ?

## Différences Clés

| .into_iter() | .iter() |
|--------------|---------|
| Consomme le Vec (prend ownership). | Emprunte le Vec en écriture (mut) |
| Produit des valeurs owned (T). | Produit des références (&T). |
| Le Vec original est inutilisable après. | Le Vec original reste intact. |

## Quand Utiliser .into_iter()

### Besoin d'Ownership sur les éléments d'une liste

Utile quand tu veux sortir des éléments du Vec (ex : transférer vers une autre collection, comme un ctrl-x) :

```rust
let vec = vec![String::from("a"), String::from("b")];
let new_vec: Vec<String> = vec.into_iter().collect();  // `vec` est consommé
// println!("{:?}", vec);  // ERREUR: `vec` moved
```

### Opérations Destructives

Pour des opérations qui détruisent le Vec (ex : trier et dédupliquer en un passage) :

```rust
let mut vec = vec![3, 1, 2, 1];
vec = vec.into_iter().unique().sorted().collect();  // Destructif mais efficace
```

### Optimisation de Performance

Évite le cloning quand on travaille avec des données owned (ex : Vec<String>) :

```rust
let vec = vec![String::from("rust")];
for s in vec.into_iter() {  // Pas de clone, move le `String`
    println!("{}", s);
}
```

## Implications d'Ownership

### Après .into_iter(), le Vec original est "moved" et ne peut pas être utilisé :

```rust
let vec = vec![1, 2, 3];
let iter = vec.into_iter();  // `vec` est moved ici
// println!("{:?}", vec);    // ERREUR: value borrowed after move
```

### Fonctionne avec les types "non-Copy" (ex: String, Box<T>) :

```rust
let vec = vec![String::from("hello")];
let s = vec.into_iter().next().unwrap();  // Move le `String` dehors
```

## Comparaison avec .iter()

| Scénario | .into_iter() | .iter() |
|----------|--------------|---------|
| Besoin de réutiliser le Vec | ❌ Non | ✅ Oui |
| Modifier les éléments | ❌ Non (consommé) | ✅ Oui (iter_mut()) |
| Éviter le cloning de données owned | ✅ Oui | ❌ Non (nécessite clone()) |

## Exemples Réels

### Transfert de Données

Déplacer un Vec dans une fonction qui prend ownership :

```rust
fn process(data: impl Iterator<Item = String>) { /* ... */ }
let vec = vec![String::from("a"), String::from("b")];
process(vec.into_iter());  // Efficace, pas de clones
```

### Filtrage Destructif

Retirer des éléments pendant l'itération :

```rust
let vec = vec![1, 2, 3, 4];
let evens: Vec<_> = vec.into_iter().filter(|x| x % 2 == 0).collect();
```

## Considérations de Performance

- **Zero-cost pour les primitives (i32, bool)** : `.into_iter()` et `.iter()` compilent vers le même code assembleur si le type implémente le trait copy (`T: Copy`).
- **Évite les allocations** quand on chaîne des adaptateurs (ex : `.map().filter()`).

## Points Clés

✅ **Utilise .into_iter() pour** :
- Sortir des éléments d'un Vec.
- Optimiser la performance avec des données owned.
- Transformer destructivement des collections.

🚫 **Evite si tu dois** :
- Réutiliser le Vec après itération.
- Partager des références entre threads (`&T` est Sync; mais `T` pourrait ne pas l'être).

**Essaie Ceci** : Que se passe-t-il si tu appelles `.into_iter()` sur un Vec et ensuite Essaie d'utiliser le Vec original dans un iterateur parallèle (ex : rayon::iter) ?

**Réponse** : Erreur au moment de la compilation ! Le Vec est déjà consommé. Utilise `.par_iter()` à la place pour un accès parallèle read-only.
