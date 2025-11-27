---
id: box-pointer-rust-fr
title: Quel est le but de Box<T> en Rust ?
slug: box-pointer-rust-fr
locale: fr
date: '2025-11-27'
author: mayo
excerpt: Rust memory et string
content_focus: rust memory et string
technical_level: Discussion technique expert
tags:
  - rust
  - memory
  - box
  - heap
  - ownership
---

# Quel est le but de Box<T> en Rust ? Quand l'utiliserais-tu ?

`Box<T>` est un smart pointer en Rust qui fournit l'allocation heap pour une valeur de type `T`. C'est la façon la plus simple de stocker des données sur le heap, offrant des garanties d'ownership et memory safety sans overhead runtime.

## Qu'est-ce que Box<T> ?

- **Allocation Heap** : Déplace les données du stack vers le heap.
  ```rust
  let x = Box::new(42); // `42` est stocké sur le heap
  ```
- **Ownership** : `Box<T>` possède les données et assure qu'elles sont droppées quand le `Box` sort du scope.
- **Taille Fixe** : Le `Box` lui-même est un pointeur (`usize`) avec une taille stack connue, même si `T` est dynamically sized (ex : `Box<dyn Trait>`).

## Quand Utiliser Box<T>

### 1. Types Récursifs (ex : Listes Chaînées)

Rust nécessite des tailles connues au moment de la compilation, mais les types récursifs (comme arbres ou listes) seraient infiniment grands sans indirection.

```rust
enum List {
    Cons(i32, Box<List>), // Sans `Box`, ce serait invalide
    Nil,
}
```

### 2. Grosses Données (Éviter Stack Overflow)

Déplacer de grosses structs (ex : buffer 1MB) vers le heap prévient les stack overflows.

```rust
let big_data = Box::new([0u8; 1_000_000]); // Array heap-allocated
```

### 3. Trait Objects (dyn Trait)

Stocker des types hétérogènes derrière une interface trait pour dynamic dispatch.

```rust
trait Animal { fn speak(&self); }

struct Cat;
impl Animal for Cat { 
    fn speak(&self) { println!("Meow"); } 
}

let animals: Vec<Box<dyn Animal>> = vec![Box::new(Cat)]; // Dynamic dispatch
```

### 4. Transférer Ownership Entre Threads

`Box` peut être utilisé avec `std::thread::spawn` pour move des données owned vers un autre thread.

```rust
let x = Box::new(42);
std::thread::spawn(move || {
    println!("{}", x); // `x` est moved dans le thread
});
```

## Comment Box<T> Diffère d'Autres Pointeurs

| **Type** | **Ownership** | **Cas d'Usage** |
|----------|---------------|-----------------|
| `Box<T>` | Owned (unique) | Allocation heap, types récursifs |
| `&T`/`&mut T` | Borrowed | Références temporaires |
| `Rc<T>` | Shared (reference-counted) | Propriétaires multiples en single-threaded |
| `Arc<T>` | Shared (atomic refcount) | Propriétaires multiples thread-safe |

## Garanties Memory Safety

- **Pas de `free()` manuel** : Désalloue automatiquement quand `Box` sort du scope.
- **Pas de null pointers** : `Box` ne peut pas être null (contrairement aux raw pointers).
- **Pas de leaks** : Le compilateur applique les règles d'ownership.

## Exemple : Box vs Stack Allocation

```rust
// Stack (échoue si trop gros)
// let arr = [0u8; 10_000_000]; // Probablement stack overflow

// Heap (fonctionne)
let arr = Box::new([0u8; 10_000_000]); // Sûr
```

## Points Clés

✅ **Utilise `Box<T>` quand tu as besoin** :
- D'allocation heap pour données larges ou récursives.
- De trait objects (`dyn Trait`).
- D'ownership explicite avec pointeur taille fixe.

🚫 **Évite si** :
- Tu as seulement besoin d'une référence (`&T`).
- Tu as besoin d'ownership partagé (utilise `Rc` ou `Arc` à la place).

**Expérience de Pensée** : Que se passe-t-il si tu essaies de `Box` une valeur déjà sur le heap ?

**Réponse** : C'est ok—ça ajoute juste une autre indirection de pointeur, car le `Box` pointera vers la nouvelle allocation heap.
