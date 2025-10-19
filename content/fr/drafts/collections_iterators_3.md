---
id: collect-method-rust
title: 'La magie de collect() en Rust : Transformer des itérateurs en Vecs, HashMaps et Strings !'
slug: collect-method-rust
locale: "fr"
author: mayo
excerpt: 'Collections (comme Vec), itérateurs (into_iter, collect), et concepts associés'
tags:
  - rust
  - iterators
  - collections
date: '2025-07-16'
---

# Comment fonctionne collect() en Rust ? Montre comment convertir un itérateur en Vec, HashMap ou String.

`collect()` est une méthode qui convertit un itérateur en collection. Elle s'appuie sur le trait `FromIterator` de Rust, qui définit comment construire un type à partir d'un itérateur.

## Mécanismes clés

- **Évaluation paresseuse** : Les itérateurs sont paresseux — `collect()` déclenche leur consommation.
- **Inférence de type** : Le type de collection cible doit être spécifié (ou inférable).
- **Flexibilité** : Fonctionne avec tout type implémentant `FromIterator`.

## Conversion vers des collections courantes

### 1. Itérateur → `Vec<T>`

```rust
let numbers = 1..5;                 // Range (implémente Iterator)
let vec: Vec<_> = numbers.collect(); // Vec<i32> == [1, 2, 3, 4]
```

**Note** : `Vec<_>` permet à Rust d'inférer le type interne (`i32` ici).

### 2. Itérateur → `HashMap<K, V>`

Nécessite des tuples de paires `(K, V)` :
```rust
use std::collections::HashMap;

let pairs = vec![("a", 1), ("b", 2)].into_iter();
let map: HashMap<_, _> = pairs.collect(); // HashMap<&str, i32>
```

**Syntaxe alternative** (avec turbofish) :
```rust
let map = pairs.collect::<HashMap<&str, i32>>();
```

### 3. Itérateur → `String`

Combiner des caractères ou des chaînes :
```rust
let chars = ['R', 'u', 's', 't'].iter();
let s: String = chars.collect(); // "Rust"

// Ou concaténer des chaînes :
let words = vec!["Hello", " ", "World"].into_iter();
let s: String = words.collect(); // "Hello World"
```

## Fonctionnement interne de `collect()`

- **Trait `FromIterator`** :
  Les collections implémentent ce trait pour définir leur logique de construction :
  ```rust
  pub trait FromIterator<A> {
      fn from_iter<T>(iter: T) -> Self
      where
          T: IntoIterator<Item = A>;
  }
  ```

- **Magie du compilateur** : Rust infère le type cible selon le contexte ou les annotations.

## Utilisations avancées

### Collection conditionnelle

Convertir uniquement les nombres pairs en `Vec` :
```rust
let evens: Vec<_> = (1..10).filter(|x| x % 2 == 0).collect(); // [2, 4, 6, 8]
```

### Types personnalisés

Implémenter `FromIterator` pour vos types :
```rust
struct MyCollection(Vec<i32>);

impl FromIterator<i32> for MyCollection {
    fn from_iter<I: IntoIterator<Item = i32>>(iter: I) -> Self {
        MyCollection(iter.into_iter().collect())
    }
}

let nums = MyCollection::from_iter(1..=3); // MyCollection([1, 2, 3])
```

## Notes de performance

- **Collections pré-allouées** : Utiliser `with_capacity` + `extend()` si la taille est connue :
  ```rust
  let mut vec = Vec::with_capacity(100);
  vec.extend(1..=100);  // Plus rapide que collect() pour les grands itérables
  ```

- **Abstractions à coût nul** : `collect()` est optimisé (par exemple, `Vec` à partir de ranges évite les vérifications de bornes).

## Pièges courants

- **Types ambigus** :
  Échoue si Rust ne peut pas inférer la cible :
  ```rust
  let nums = vec![1, 2].into_iter().collect(); // ERREUR : annotations de type nécessaires
  ```

- **Problèmes d'ownership** :
  Consomme l'itérateur :
  ```rust
  let iter = vec![1, 2].into_iter();
  let _ = iter.collect::<Vec<_>>();
  // iter.next(); // ERREUR : iter consommé par collect()
  ```

## Points clés à retenir

✅ Utiliser `collect()` pour matérialiser des itérateurs en :
- `Vec`, `HashMap`, `String`, ou tout type `FromIterator`.
✅ Spécifier le type (ex: `let v: Vec<_> = ...`).
🚀 Optimiser avec `with_capacity` pour les grandes collections.

**Exemple concret** :
`serde_json::from_str` est souvent chaîné avec `collect()` pour construire des structures complexes :
```rust
let data: Vec<u8> = "123".bytes().collect(); // [49, 50, 51] (valeurs ASCII)
```