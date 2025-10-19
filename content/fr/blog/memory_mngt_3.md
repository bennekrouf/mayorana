---
id: stack-heap-allocation-rust-fr
title: 'Stack vs. Heap en Rust: Où Vivent tes Données ?'
slug: stack-heap-allocation-rust-fr
locale: fr
date: '2025-10-01'
author: mayo
excerpt: Rust memory et string
content_focus: rust memory et string
technical_level: Discussion technique expert

tags:
  - rust
  - memory
  - stack
  - heap
  - allocation
---

# Quelle est la différence entre allocation stack et heap en Rust ? Comment Rust décide-t-il où allouer les données ?

Rust utilise l'allocation stack et heap pour gérer la mémoire, avec des caractéristiques distinctes pour chacune. Comprendre leurs différences et comment Rust décide où allouer les données est clé pour écrire du code efficace et sûr.

## Stack vs. Heap en Rust

| **Stack** | **Heap** |
|-----------|----------|
| Allocation/désallocation rapide (LIFO). | Allocation plus lente (dynamique). |
| Taille fixe, connue au moment de la compilation. | Taille peut grandir (ex : `String`, `Vec`). |
| Cleanup automatique (pas de `free()` nécessaire). | Gestion manuelle (via trait `Drop`). |
| Utilisé pour types primitifs (`i32`, `bool`), petites structs. | Utilisé pour données larges, dynamiques (`String`, `Box<T>`). |

## Comment Rust Décide Où Allouer

### Par Défaut → Stack

Si un type a une **taille fixe** (ex : `i32`, arrays, structs sans `String`/`Vec`), il est alloué sur le **stack**.

**Exemple** :
```rust
let x = 5; // Stack (i32 est taille fixe)
```

### Allocation Heap Explicite

Utilise des types comme `Box<T>`, `String`, `Vec`, etc., pour allouer sur le **heap**.

**Exemple** :
```rust
let s = String::from("heap"); // Heap (string UTF-8 extensible)
let boxed = Box::new(42);     // Heap (Box<T>)
```

## Move Semantics

Quand une valeur est **moved**, ses données heap sont transférées, pas copiées, assurant une gestion mémoire efficace.

**Exemple** :
```rust
let s1 = String::from("hello"); // Heap-allocated
let s2 = s1; // Move ownership (données heap pas copiées)
// println!("{}", s1); // ERREUR: s1 est invalidé
```

## Points Clés

✅ **Stack** : Rapide, taille fixe, automatique.  
✅ **Heap** : Flexible, dynamique, manuel (via smart pointers).  
✅ Rust privilégie le stack mais utilise le heap pour données extensibles/taille inconnue.

**Suivi** : Quand forcerais-tu l'allocation heap ?
- Pour de grosses structs (éviter stack overflow).
- Quand tu as besoin de dynamic dispatch (ex : `Box<dyn Trait>`).
- Pour partager ownership entre threads (`Arc<T>`).
