---
id: ownership-safety-rust-fr
title: "Comment l'ownership prévient-il les memory leaks et data races ?"
slug: ownership-safety-rust-fr
locale: "fr"
date: '2025-07-07'
author: mayo
excerpt: >-
  Rust memory et string
content_focus: "rust memory et string"
technical_level: "Discussion technique expert"
category: rust
tags:
  - rust
  - memory
  - ownership
  - borrowing
  - data-races
---

# Comment l'ownership prévient-il les memory leaks et data races ?

L'ownership est le système central de gestion mémoire de Rust, appliquant des règles strictes au moment de la compilation pour assurer la sécurité sans garbage collector. Il prévient les memory leaks et data races à travers une combinaison de règles d'ownership, move semantics, et borrowing.

## Ownership en Rust

- Chaque valeur a un **propriétaire unique** (variable).
- Quand le propriétaire sort du scope, la valeur est **droppée** (trait `Drop` appelé).
- L'ownership peut être **transféré** (moved), rendant la variable originale invalide.

## Règles Clés

### Move Semantics

Assigner une valeur heap-allocated (ex : `String`) à une autre variable transfère l'ownership, invalidant l'originale.

**Exemple** :
```rust
let s1 = String::from("hello");
let s2 = s1; // Ownership moved vers s2
// println!("{}", s1); // Erreur de compilation: value borrowed after move
```

### Copy vs. Move

- Les types avec **taille connue** (`i32`, `bool`) implémentent `Copy` et sont clonés automatiquement.
- Les types heap-allocated (`String`, `Vec`) n'implémentent pas `Copy` et sont moved.

### Appels de Function

Passer une valeur à une fonction la move ou la copie, suivant les mêmes règles.

**Exemple** :
```rust
fn take_ownership(s: String) { /* ... */ }

let s = String::from("hello");
take_ownership(s); // Ownership moved dans la fonction
// println!("{}", s); // Erreur: s est invalide
```

## Comment l'Ownership Prévient les Memory Leaks

- **Cleanup Automatique** : Quand le propriétaire sort du scope, Rust appelle `drop` pour libérer la mémoire (pas de `free()` manuel nécessaire).
- **Pas de Double Frees** : Puisque seul un propriétaire existe, la valeur est droppée exactement une fois.

## Comment l'Ownership Prévient les Data Races

- **Règles de Borrowing** :
  - **Emprunts immutables** (`&T`) : Plusieurs autorisés, mais aucun emprunt mutable ne peut coexister.
  - **Emprunts mutables** (`&mut T`) : Un seul autorisé, et aucun autre emprunt ne peut exister.
- **Application au Compile-Time** : Le compilateur rejette le code qui pourrait mener à des data races.

**Exemple : Prévention de Data Race** :
```rust
let mut data = vec![1, 2, 3];
let r1 = &data; // Borrowing immutable OK
let r2 = &data; // Autre borrow immutable OK
// let r3 = &mut data; // ERREUR: Cannot borrow as mutable while immutable borrows exist
println!("{:?}, {:?}", r1, r2);
```

## Points Clés

✅ **L'ownership assure** :
- Pas de dangling pointers (via lifetimes).
- Pas de memory leaks (via `Drop`).
- Pas de data races (via règles de borrowing).

Le modèle d'ownership de Rust garantit la memory safety et concurrency safety au moment de la compilation, délivrant performance et fiabilité.