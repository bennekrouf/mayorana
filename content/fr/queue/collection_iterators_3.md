---
id: collect-method-rust-fr
title: 'collect() : Transformer les Iterators en Vecs, HashMaps, et Strings !'
slug: collect-method-rust-fr
locale: "fr"
author: mayo
excerpt: 'Collections (comme Vec), iterators (into_iter, collect), et concepts associés'
category: rust
tags:
  - rust
  - iterators
  - collections
  - ownership
date: '2025-07-16'
---

# Comment fonctionne collect() en Rust ?

`collect()` est une méthode qui convertit un iterator en collection. Elle s'appuie sur le trait `FromIterator` de Rust, qui définit comment construire un type à partir d'un iterator.

## Mécaniques Clés

- **Lazy Evaluation** : Les iterators sont lazy — `collect()` déclenche la consommation.
- **Type Inference** : Le type de collection cible doit être spécifié (ou inférable).
- **Flexibilité** : Fonctionne avec tout type implémentant `FromIterator`.

## Conversion vers des Collections Communes

### 1. Iterator → `Vec<T>`

```rust
let numbers = 1..5;                 // Range (implémente Iterator)
let vec: Vec<_> = numbers.collect(); // Vec<i32> == [1, 2, 3, 4]
```

**Note** : `Vec<_>` laisse Rust inférer le type interne (`i32` ici).

### 2. Iterator → `HashMap<K, V>`

Nécessite des tuples de paires `(K, V)` :

```rust
use std::collections::HashMap;

let pairs = vec![("a", 1), ("b", 2)].into_iter();
let map: HashMap<_, _> = pairs.collect(); // HashMap<&str, i32>
```

**Syntaxe Alternative** (avec turbofish) :

```rust
let map = pairs.collect::<HashMap<&str, i32>>();
```

### 3. Iterator → `String`

Combine des caractères ou des strings :

```rust
let chars = ['R', 'u', 's', 't'].iter();
let s: String = chars.collect(); // "Rust"

// Ou concaténer des strings :
let words = vec!["Hello", " ", "World"].into_iter();
let s: String = words.collect(); // "Hello World"
```

## Comment `collect()` fonctionne

- **Trait `FromIterator`** :
  Les collections implémentent ceci pour définir leur logique de construction :
  ```rust
  pub trait FromIterator<A> {
      fn from_iter<T>(iter: T) -> Self
      where
          T: IntoIterator<Item = A>;
  }
  ```

- **Magie du Compilateur** : Rust infère le type cible basé sur le contexte ou les annotations.

## Utilisations Avancées

### Collection Conditionnelle

Convertir seulement les nombres pairs en `Vec` :

```rust
let evens: Vec<_> = (1..10).filter(|x| x % 2 == 0).collect(); // [2, 4, 6, 8]
```

### Types Personnalisés

Implémente `FromIterator` pour tes types :

```rust
struct MyCollection(Vec<i32>);

impl FromIterator<i32> for MyCollection {
    fn from_iter<I: IntoIterator<Item = i32>>(iter: I) -> Self {
        MyCollection(iter.into_iter().collect())
    }
}

let nums = MyCollection::from_iter(1..=3); // MyCollection([1, 2, 3])
```

## Notes de Performance

- **Collections Pré-allouées** : Utilise `with_capacity` + `extend()` si la taille est connue :
  ```rust
  let mut vec = Vec::with_capacity(100);
  vec.extend(1..=100);  // Plus rapide que collect() pour des grandes collections
  ```

- **Zero-Cost Abstractions** : `collect()` est optimisé (ex : `Vec` depuis ranges évite les bounds checks).

## Pièges Courants

- **Types Ambigus** :
  Échoue si Rust ne peut pas inférer la cible :
  ```rust
  let nums = vec![1, 2].into_iter().collect(); // ERREUR: type annotations needed
  ```

- **Problèmes d'Ownership** :
  Consomme l'iterator :
  ```rust
  let iter = vec![1, 2].into_iter();
  let _ = iter.collect::<Vec<_>>();
  // iter.next(); // ERREUR: iter consommé par collect()
  ```

## Points Clés

✅ Utilise `collect()` pour matérialiser les iterators en :
- `Vec`, `HashMap`, `String`, ou tout type `FromIterator`.

✅ Spécifie le type (ex : `let v: Vec<_> = ...`).

🚀 Optimise avec `with_capacity` pour de grandes collections.

**Exemple concret** :

`serde_json::from_str` s'enchaîne souvent avec `collect()` pour construire des structures complexes :

```rust
let data: Vec<u8> = "123".bytes().collect(); // [49, 50, 51] (valeurs ASCII)
```