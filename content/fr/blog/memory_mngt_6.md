---
id: string-str-mismatch-rust-fr
title: >-
  Pourquoi &str Ne Rentre Pas dans &String en Rust: Fixes Sympas pour les String
  Mismatches !
slug: string-str-mismatch-rust-fr
locale: fr
date: '2025-08-26'
author: mayo
excerpt: Rust memory et string
content_focus: rust memory et string
technical_level: Discussion technique expert
category: rust
tags:
  - rust
  - memory
  - string
  - str
  - ownership
---

# Pourquoi tu ne peux pas passer un &str directement à une fonction attendant un &String ? Comment gérerais-tu un tel scénario ?

En Rust, tu ne peux pas passer un `&str` directement à une fonction attendant un `&String` à cause de leurs types distincts, ce qui assure la type safety et prévient les assumptions sur l'ownership mémoire. Ci-dessous, j'explique pourquoi ce mismatch survient et comment le gérer efficacement.

## Le Problème Central : Type Mismatch

- **`&String`** : Une référence vers un `String` heap-allocated, extensible.
- **`&str`** : Une string slice qui peut pointer vers mémoire heap, stack, ou static.
- Ce sont des **types différents**, donc Rust rejette les conversions implicites pour la sécurité.

**Exemple : Le Problème** :
```rust
fn print_string(s: &String) {
    println!("{}", s);
}

fn main() {
    let my_str = "hello";  // Type: `&'static str`
    print_string(my_str);  // ERREUR: expected `&String`, found `&str`
}
```

## Solutions pour Relier &str et &String

### 1. Deref Coercion (Conversion Automatique)

Rust convertit automatiquement `&String` vers `&str` via le trait `Deref`, mais pas l'inverse. Le meilleur fix est de changer la fonction pour accepter `&str` pour plus de flexibilité.

```rust
fn print_str(s: &str) {  // Maintenant accepte `&str` et `&String`
    println!("{}", s);
}

fn main() {
    let my_string = String::from("hello");
    let my_str = "world";
    
    print_str(&my_string);  // Fonctionne: `&String` coerce vers `&str`
    print_str(my_str);      // Fonctionne directement
}
```

**Pourquoi ça marche** : `String` implémente `Deref<Target=str>`, permettant à `&String` de coercer vers `&str`.

### 2. Conversion Explicite (Quand Tu As Besoin de &String)

Si la fonction doit prendre `&String`, convertis `&str` vers `String` d'abord :

```rust
fn print_string(s: &String) {
    println!("{}", s);
}

fn main() {
    let my_str = "hello";
    print_string(&my_str.to_string());  // Alloue un nouveau `String`
}
```

**Inconvénient** : Ceci alloue un nouveau buffer heap, ce qui devrait être évité si possible à cause des coûts de performance.

### 3. Utilise `AsRef<str>` pour Flexibilité Maximum

Pour des fonctions qui devraient marcher avec tout type string-like :

```rust
fn print_as_str<S: AsRef<str>>(s: S) {
    println!("{}", s.as_ref());
}

fn main() {
    let my_string = String::from("hello");
    let my_str = "world";
    
    print_as_str(&my_string);  // Fonctionne
    print_as_str(my_str);      // Fonctionne
}
```

**Bonus** : Accepte aussi `Cow<str>`, `Box<str>`, etc.

## Points Clés

✅ **Préféré** : Utilise `&str` dans les arguments de fonction (flexible et zero-cost).  
✅ **Si coincé avec `&String`** : Convertis `&str` vers `String` (alloue).  
✅ **Pour les APIs** : Utilise `AsRef<str>` ou `impl Deref<Target=str>` pour compatibilité maximum.

**Pourquoi Rust Applique Ceci** :
- Prévient les allocations accidentelles ou assumptions sur l'ownership mémoire.
- Encourage des APIs efficaces, borrow-friendly.

**Essaie Ceci** : Que se passe-t-il si tu passes un `String` à `print_str` sans `&` ?

**Réponse** : Ça move l'ownership, causant une erreur de compilation puisque `print_str` attend une référence (`&str`), pas un `String` owned.
