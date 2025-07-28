---
id: dangling-pointer-rust-fr
title: "Qu'est-ce qu'un dangling pointer, et comment Rust le prévient-il au moment de la compilation ?"
slug: dangling-pointer-rust-fr
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
  - dangling-pointer
  - ownership
  - lifetimes
---

# Qu'est-ce qu'un dangling pointer, et comment Rust le prévient-il au moment de la compilation ?

Un **dangling pointer** survient quand un pointeur référence de la mémoire qui a déjà été libérée, menant à un comportement indéfini comme des crashes ou vulnérabilités de sécurité. Dans des langages comme C/C++, c'est un problème courant :

```c
int* create_int() {
    int x = 5;  // `x` vit sur le stack
    return &x;  // Retourne un pointeur vers `x`...
}  // `x` est détruit ici (dangling pointer retourné !)
```

Rust élimine les dangling pointers au moment de la compilation en utilisant son modèle d'ownership et système de lifetimes, assurant la memory safety sans overhead runtime.

## Comment Rust Prévient les Dangling Pointers

Rust utilise deux mécanismes clés pour prévenir les dangling pointers :

### 1. Règles d'Ownership + Borrowing

- **Règle** : Les références (`&T` ou `&mut T`) ne doivent pas survivre aux données qu'elles pointent.
- **Appliqué par** : Le borrow checker, qui track les scopes de variables et assure que les références restent valides.

**Exemple : Rejeté au Compile Time** :
```rust
fn dangling() -> &String {  // Spécificateur de lifetime manquant !
    let s = String::from("hello");
    &s  // ERREUR: `s` meurt à la fin de la fonction
}       // Compiler: "returns a reference to dropped data"
```

**Corrigé avec Lifetimes** (Garantie Explicite) :
```rust
fn valid_reference<'a>(s: &'a String) -> &'a String {
    s  // OK: Référence retournée liée au lifetime de l'input
}
```

### 2. Annotations de Lifetime

- Rust nécessite des **déclarations de lifetime explicites** (`'a`) quand les références traversent les frontières de scope.
- Le compilateur assure que toutes les références obéissent à leurs lifetimes assignés, prévenant les références vers mémoire libérée.

**Exemple : Struct avec Référence** :
```rust
struct Book<'a> {  // Doit déclarer lifetime
    title: &'a str  // Référence doit vivre aussi longtemps que `Book`
}

fn main() {
    let title = String::from("Rust");
    let book = Book { title: &title };
    // `book.title` ne peut pas survivre à `title`
}
```

## Pourquoi C'est Important

| **Langage** | **Risque Dangling Pointer** | **Mécanisme de Sécurité** |
|-------------|------------------------------|---------------------------|
| C/C++       | Élevé (gestion mémoire manuelle) | Aucun (responsabilité du programmeur) |
| Rust        | Zéro                         | Vérifications compile-time (ownership + lifetimes) |

## Points Clés

✅ Le compilateur de Rust garantit :
- Pas de références vers mémoire libérée.
- Pas de comportement indéfini depuis dangling pointers.
- Sécurité sans overhead runtime.

**Impact Réel** : Les crates comme `hyper` (HTTP) et `tokio` (async) s'appuient sur ces garanties pour du code sécurisé et performant.