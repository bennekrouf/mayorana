---
id: iter-methods-rust-fr
title: 'Comment into_iter(), iter(), et iter_mut() diffèrent-elles ?'
slug: iter-methods-rust-fr
locale: "fr"
date: '2025-07-08'
author: mayo
excerpt: 'Collections (comme Vec), iterators (into_iter, collect), et concepts associés'
category: rust
tags:
  - rust
  - iterators
  - collections
  - ownership
---

# Comment into_iter(), iter(), et iter_mut() diffèrent-elles ?

Ces trois méthodes sont fondamentales pour travailler avec les collections en Rust, chacune servant des cas d'usage distincts d'ownership et de mutabilité.

## 1. `into_iter()` - Iterator qui Consomme l'Ownership

- **Prend ownership** de la collection (`self`).
- **Produit** des valeurs owned (`T`) lors de l'itération.
- **Détruit** la collection originale (ne peut pas être utilisée après).

```rust
let vec = vec!["a".to_string(), "b".to_string()];
for s in vec.into_iter() {  // `vec` est moved ici
    println!("{}", s);      // `s` est un String (owned)
}
// println!("{:?}", vec);  // ERREUR: `vec` a été consommé
```

**Quand l'utiliser** :
- Quand tu as besoin de transformer ou consommer la collection de façon permanente.
- Pour chaîner des adaptateurs d'iterator qui ont besoin d'ownership (ex : `.filter().collect()`).

## 2. `iter()` - Iterator d'Emprunt Immutable

- **Emprunte** la collection immutablement (`&self`).
- **Produit** des références (`&T`).
- **Laisse** la collection intacte.

```rust
let vec = vec!["a", "b", "c"];
for s in vec.iter() {       // Emprunte `vec`
    println!("{}", s);      // `s` est &&str (référence)
}
println!("{:?}", vec);      // OK: `vec` toujours valide
```

**Quand l'utiliser** :
- Quand tu n'as besoin que d'un accès read-only aux éléments.
- Pour des opérations comme la recherche (`.find()`) ou l'inspection.

## 3. `iter_mut()` - Iterator d'Emprunt Mutable

- **Emprunte** la collection mutablement (`&mut self`).
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
- Quand tu as besoin de modifier des éléments sans réallocation.
- Pour des mises à jour en masse (ex : appliquer des transformations).

## Résumé des Différences Clés

| Méthode       | Ownership     | Produit    | Modifie Original ? | Réutilise Original ? |
|---------------|---------------|------------|--------------------|---------------------|
| `into_iter()` | Consomme      | `T`        | ❌ (détruit)        | ❌                  |
| `iter()`      | Emprunte      | `&T`       | ❌                 | ✅                  |
| `iter_mut()`  | Emprunt mut   | `&mut T`   | ✅                 | ✅                  |

## Pièges Courants

- **Moves accidentels avec `into_iter()`** :
  ```rust
  let vec = vec![1, 2];
  let _ = vec.into_iter();  // `vec` moved ici
  // println!("{:?}", vec); // ERREUR!
  ```

- **Accès mutable simultané** :
  ```rust
  let mut vec = vec![1, 2];
  let iter = vec.iter_mut();
  // vec.push(3);           // ERREUR: Cannot borrow `vec` while iterator exists
  ```

## Exemples Réels

- **`iter()` pour traitement read-only** :
  ```rust
  let words = vec!["hello", "world"];
  let lengths: Vec<_> = words.iter().map(|s| s.len()).collect();  // [5, 5]
  ```

- **`iter_mut()` pour mises à jour en place** :
  ```rust
  let mut scores = vec![85, 92, 78];
  scores.iter_mut().for_each(|s| *s += 5);  // [90, 97, 83]
  ```

- **`into_iter()` pour transfert d'ownership** :
  ```rust
  let matrix = vec![vec![1, 2], vec![3, 4]];
  let flattened: Vec<_> = matrix.into_iter().flatten().collect();  // [1, 2, 3, 4]
  ```

## Notes de Performance

- `iter()` et `iter_mut()` sont zero-cost (juste des pointeurs).
- `into_iter()` peut impliquer des moves (mais optimisé pour les primitives comme `i32`).

**Essaie Ceci** : Que se passe-t-il si tu appelles `iter_mut()` sur un `Vec<T>` où `T` n'implémente pas `Copy`, puis essaies de modifier les éléments ?

**Réponse** : Ça marche ! L'iterator produit `&mut T`, permettant la mutation directe (ex : `*item = new_value`).