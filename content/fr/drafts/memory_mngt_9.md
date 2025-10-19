---
id: borrowing-rules-rust-fr
title: "emprunts mutables vs. immutables."
slug: borrowing-rules-rust-fr
locale: "fr"
date: '2025-07-07'
author: mayo
excerpt: >-
  Rust memory et string
content_focus: "rust memory et string"
technical_level: "Discussion technique expert"

tags:
  - rust
  - memory
  - borrowing
  - ownership
  - safety
scheduledFor: '2025-07-08'
scheduledAt: '2025-07-08T06:55:13.405Z'
---

# Quelles sont les règles de borrowing en Rust ? Explique les emprunts mutables vs. immutables.

Les règles de borrowing de Rust, appliquées par le borrow checker au moment de la compilation, assurent la memory safety et préviennent les data races sans overhead runtime. Ces règles gouvernent comment les données peuvent être accédées via des références, distinguant entre emprunts mutables (`&mut T`) et immutables (`&T`).

## Les Règles de Borrowing (Appliquées par le Compiler)

1. **Soit Un Emprunt Mutable (`&mut T`) SOIT Plusieurs Emprunts Immutables (`&T`)** :
   - Tu peux avoir :
     - **Une référence mutable** (`&mut T`), OU
     - **N'importe quel nombre de références immutables** (`&T`).
   - Jamais les deux en même temps pour les mêmes données.

2. **Les Références Doivent Toujours Être Valides (Pas de Dangling Pointers)** :
   - Les références empruntées ne peuvent pas survivre aux données qu'elles pointent, appliqué par le système de lifetime de Rust.

## Emprunts Immutables (`&T`)

- **Accès read-only** : Ne peut pas modifier les données.
- **Plusieurs autorisés** : Sûr pour lectures concurrentes, car aucune modification ne peut survenir.

**Exemple** :
```rust
let x = 42;
let r1 = &x;  // OK: Borrowing immutable
let r2 = &x;  // OK: Autre borrow immutable
println!("{}, {}", r1, r2);  // Fonctionne bien
```

## Emprunts Mutables (`&mut T`)

- **Accès exclusif** : Permet modification des données.
- **Aucun autre emprunt autorisé** : Aucun `&T` ou `&mut T` additionnel ne peut coexister pour les mêmes données.

**Exemple** :
```rust
let mut x = 42;
let r1 = &mut x;  // OK: Emprunt mutable
*r1 += 1;         // Peut modifier
// let r2 = &x;   // ERREUR: Cannot borrow `x` as immutable while mutable borrow exists
```

## Le Compiler Rejette Ces Scénarios

1. **Chevauchement Mutable + Immutable** :
   ```rust
   let mut data = 10;
   let r1 = &data;      // Borrowing immutable
   let r2 = &mut data;  // ERREUR: Cannot borrow as mutable while borrowed as immutable
   ```

2. **Emprunts Mutables Multiples** :
   ```rust
   let mut s = String::new();
   let r1 = &mut s;
   let r2 = &mut s;  // ERREUR: Second mutable borrow
   ```

3. **Références Dangereuses** :
   ```rust
   fn dangling() -> &String {
       let s = String::from("oops");
       &s  // ERREUR: `s` meurt ici, référence pendrait
   }
   ```

## Pourquoi Ces Règles Comptent

- **Prévient les Data Races** : En interdisant l'accès mutable concurrent, Rust assure la thread safety par défaut.
- **Assure Memory Safety** : Pas de dangling pointers ou invalidation d'iterator, car le borrow checker applique les références valides.

## Points Clés

✅ **Emprunts immutables (`&T`)** :
- Plusieurs autorisés, mais pas de mutation.

✅ **Emprunts mutables (`&mut T`)** :
- Un seul autorisé, accès exclusif.

🚫 **Violations attrapées au moment de la compilation** : Pas d'overhead runtime.

**Impact Réel** : Ces règles permettent la concurrence sans peur, comme vu dans les crates comme `Rayon` pour l'itération parallèle.

**Expérimente** : Essaie de créer une fonction qui prend `&mut T` et appelle-la deux fois avec les mêmes données.

**Réponse** : Le borrow checker ne le permettra pas sauf si le scope du premier emprunt se termine, prévenant les emprunts mutables qui se chevauchent.