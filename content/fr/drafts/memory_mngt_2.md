---
id: memory-safety-rust-fr
title: "Comment Rust assure-t-il la memory safety sans garbage collector ?"
slug: memory-safety-rust-fr
author: mayo
locale: "fr"
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
  - lifetimes
---

# Comment Rust assure-t-il la memory safety sans garbage collector ?

Rust garantit la memory safety au moment de la compilation en utilisant trois mécanismes clés : ownership, borrowing, et lifetimes. Ceux-ci assurent qu'il n'y ait pas de memory leaks, data races, ou dangling pointers sans avoir besoin d'un garbage collector.

## 1. Règles d'Ownership

- Chaque valeur en Rust a un **propriétaire unique**.
- Quand le propriétaire sort du scope, la valeur est **droppée** (mémoire libérée).
- Prévient les **double frees** et **memory leaks**.

**Exemple** :
```rust
fn main() {
    let s = String::from("hello"); // `s` possède la string
    takes_ownership(s);            // Ownership moved → `s` est invalide ici
    // println!("{}", s); // ERREUR: borrow of moved value
}

fn takes_ownership(s: String) { 
    println!("{}", s); 
} // `s` est droppé ici
```

## 2. Borrowing & Références

- Permet des emprunts **immutables** (`&T`) ou **mutables** (`&mut T`).
- Règles appliquées :
  - Soit **une référence mutable** soit **plusieurs références immutables** (pas de data races).
  - Les références doivent toujours être **valides** (pas de dangling pointers).

**Exemple** :
```rust
fn main() {
    let mut s = String::from("hello");
    let r1 = &s;     // OK: Borrowing immutable
    let r2 = &s;     // OK: Autre borrow immutable
    // let r3 = &mut s; // ERREUR: Cannot borrow as mutable while borrowed as immutable
    println!("{}, {}", r1, r2);
}
```

## 3. Lifetimes

- Assure que les références **ne survivent jamais** aux données qu'elles pointent.
- Prévient les **dangling references**.

**Exemple** :
```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

fn main() {
    let s1 = String::from("hello");
    let result;
    {
        let s2 = String::from("world");
        result = longest(&s1, &s2); // ERREUR: `s2` doesn't live long enough
    }
    // println!("{}", result); // `result` serait invalide ici
}
```

## Pourquoi Pas de Garbage Collector (GC) ?

- **Zero-cost abstractions** : Pas d'overhead runtime.
- **Performance prévisible** : La mémoire est libérée de façon déterministe.
- **Pas de pauses runtime** : Contrairement aux langages basés sur GC (Java, Go).

## Points Clés

✅ **Ownership** : Prévient les memory leaks.  
✅ **Borrowing** : Prévient les data races.  
✅ **Lifetimes** : Prévient les dangling pointers.

Le modèle de Rust assure la memory safety sans vérifications runtime, le rendant à la fois sûr et rapide.