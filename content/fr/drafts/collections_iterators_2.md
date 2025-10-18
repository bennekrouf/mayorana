---
id: iter-methods-rust
title: 'Quelles sont les différences entre into_iter(), iter() et iter_mut() ?'
slug: iter-methods-rust
locale: "fr"
date: '2025-07-08'
author: mayo
excerpt: 'Collections (comme Vec), itérateurs (into_iter, collect) et concepts associés'
category: rust
tags:
  - rust
  - iterators
  - collections
---

# Quelles sont les différences entre into_iter(), iter() et iter_mut() ?

Ces trois méthodes sont fondamentales pour travailler avec des collections en Rust, chacune servant des cas d'utilisation distincts en matière d'ownership et de mutabilité.

## 1. `into_iter()` - Itérateur qui consomme l'ownership

- **Prend l'ownership** de la collection (`self`).
- **Produit** des valeurs possédées (`T`) lors de l'itération.
- **Détruit** la collection originale (ne peut plus être utilisée ensuite).

```rust
let vec = vec!["a".to_string(), "b".to_string()];
for s in vec.into_iter() {  // `vec` est déplacé ici
    println!("{}", s);      // `s` est un String (possédé)
}
// println!("{:?}", vec);  // ERREUR : `vec` a été consommé
```

**Quand l'utiliser** :
- Quand vous avez besoin de transformer ou consommer la collection définitivement.
- Pour enchaîner des adaptateurs d'itérateurs qui nécessitent l'ownership (ex: `.filter().collect()`).

## 2. `iter()` - Itérateur d'emprunt immuable

- **Emprunte** la collection de manière immuable (`&self`).
- **Produit** des références (`&T`).
- **Laisse** la collection intacte.

```rust
let vec = vec!["a", "b", "c"];
for s in vec.iter() {       // Emprunte `vec`
    println!("{}", s);      // `s` est &&str (référence)
}
println!("{:?}", vec);      // OK : `vec` toujours valide
```

**Quand l'utiliser** :
- Quand vous avez seulement besoin d'un accès en lecture seule aux éléments.
- Pour des opérations comme la recherche (`.find()`) ou l'inspection.

## 3. `iter_mut()` - Itérateur d'emprunt mutable

- **Emprunte** la collection de manière mutable (`&mut self`).
- **Produit** des références mutables (`&mut T`).
- **Permet** la modification en place.

```rust
let mut vec = vec![1, 2, 3];
for num in vec.iter_mut() {  // Emprunt mutable
    *num *= 2;               // Modifie en place
}
println!("{:?}", vec);       // [2, 4, 6]
```

**Quand l'utiliser** :
- Quand vous avez besoin de modifier les éléments sans réallocation.
- Pour des mises à jour en masse (ex: appliquer des transformations).

## Résumé des différences clés

| Méthode       | Ownership     | Produit    | Modifie l'original ? | Réutilisable ? |
|---------------|---------------|------------|---------------------|----------------|
| `into_iter()` | Consomme      | `T`        | ❌ (détruit)         | ❌             |
| `iter()`      | Emprunte      | `&T`       | ❌                  | ✅             |
| `iter_mut()`  | Emprunt mut   | `&mut T`   | ✅                  | ✅             |

## Pièges courants

- **Déplacements accidentels avec `into_iter()`** :
  ```rust
  let vec = vec![1, 2];
  let _ = vec.into_iter();  // `vec` déplacé ici
  // println!("{:?}", vec); // ERREUR !
  ```

- **Accès mutable simultané** :
  ```rust
  let mut vec = vec![1, 2];
  let iter = vec.iter_mut();
  // vec.push(3);           // ERREUR : Impossible d'emprunter `vec` pendant que l'itérateur existe
  ```

## Exemples concrets

- **`iter()` pour un traitement en lecture seule** :
  ```rust
  let words = vec!["hello", "world"];
  let lengths: Vec<_> = words.iter().map(|s| s.len()).collect();  // [5, 5]
  ```

- **`iter_mut()` pour des mises à jour en place** :
  ```rust
  let mut scores = vec![85, 92, 78];
  scores.iter_mut().for_each(|s| *s += 5);  // [90, 97, 83]
  ```

- **`into_iter()` pour un transfert d'ownership** :
  ```rust
  let matrix = vec![vec![1, 2], vec![3, 4]];
  let flattened: Vec<_> = matrix.into_iter().flatten().collect();  // [1, 2, 3, 4]
  ```

## Notes de performance

- `iter()` et `iter_mut()` sont des zero-cost abstractions (juste des pointeurs).
- `into_iter()` peut impliquer des déplacements (mais optimisés pour les primitives comme `i32`).

**Essayez ceci** : Que se passe-t-il si vous appelez `iter_mut()` sur un `Vec<T>` où `T` n'implémente pas `Copy`, puis essayez de modifier les éléments ?  
**Réponse** : Cela fonctionne ! L'itérateur produit des `&mut T`, permettant une mutation directe (ex: `*item = new_value`).