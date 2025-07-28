---
id: string-vs-str-rust-fr
title: String vs. &str – Lequel Utiliser et Quand ?
slug: string-vs-str-rust-fr
locale: "fr"
date: '2025-07-03'
author: mayo
excerpt: >-
  String vs str en Rust, couvrant gestion mémoire, ownership, et quand utiliser
  chaque type.
category: rust
tags:
  - rust
  - string
  - memory
  - ownership
  - types
---

# Quelle est la différence entre String et str en Rust ? Quand utiliserais-tu chacun ?

Comprendre la distinction entre `String` et `str` est fondamental pour une gestion efficace de la mémoire et de l'ownership en Rust.

## Différences Clés

| `String` | `str` (habituellement `&str`) |
|----------|-------------------------------|
| String UTF-8 extensible, heap-allocated | Vue immutable, taille fixe dans string UTF-8 |
| Type owned (gère sa mémoire) | Type borrowed (ne possède pas la mémoire) |
| Mutable (peut modifier le contenu) | Vue immutable |
| Créé avec `String::from("...")` ou `"...".to_string()` | Depuis string literals (`"hello"`) ou emprunté depuis `String` (`&my_string`) |

## Layout Mémoire

**`String`** : Stocke les données sur le heap avec trois composants :
- Pointeur vers buffer heap
- Length (taille actuelle)
- Capacity (taille allouée)

**`&str`** : Un "fat pointer" contenant :
- Pointeur vers données string (heap, stack, ou mémoire static)
- Length de la slice

## Quand Utiliser Chacun

Utilise **`String`** quand :
- Tu as besoin de modifier ou faire grandir la string
- Tu as besoin d'ownership (ex : retourner depuis une fonction)
- Construire des strings dynamiquement

```rust
let mut owned = String::from("hello");
owned.push_str(" world");  // Mutation nécessite String
```

Utilise **`&str`** quand :
- Tu n'as besoin que d'une vue read-only d'une string
- Travailler avec des paramètres de fonction (évite les allocations inutiles)
- Gérer des string literals (stockées en mémoire read-only)

```rust
fn process_str(s: &str) -> usize {
    s.len()  // Accès read-only
}
```

## Exemple : Ownership vs Borrowing

```rust
fn process_string(s: String) { /* prend ownership */ }
fn process_str(s: &str)      { /* emprunte */ }

fn main() {
    let heap_str = String::from("hello");
    let static_str = "world";
    
    process_string(heap_str);  // Ownership moved
    process_str(static_str);   // Borrowed
    
    // heap_str plus accessible ici
    // static_str encore accessible
}
```

## Considérations de Performance

**Paramètres de Fonction** :
```rust
// Inefficace - force allocation
fn bad(s: String) -> usize { s.len() }

// Efficace - accepte String et &str
fn good(s: &str) -> usize { s.len() }

// Usage
let owned = String::from("test");
good(&owned);     // Deref coercion: String -> &str
good("literal");  // &str direct
```

**Allocation Mémoire** :
- `String` alloue sur heap, nécessite désallocation
- `&str` vers literals pointe vers binaire programme (zero allocation)
- `&str` depuis `String` partage allocation existante

## Patterns Courants

**Retourner Données Owned** :
```rust
fn build_message(name: &str) -> String {
    format!("Hello, {}!", name)  // Retourne String owned
}
```

**Accepter Input Flexible** :
```rust
fn analyze(text: &str) -> usize {
    // Fonctionne avec inputs String et &str
    text.chars().count()
}
```

**Éviter les Clones Inutiles** :
```rust
// Mauvais - allocation inutile
fn process_bad(s: &str) -> String {
    s.to_string()  // Seulement si tu as vraiment besoin de données owned
}

// Bon - travaille avec données borrowed quand possible
fn process_good(s: &str) -> &str {
    s.trim()  // Retourne slice de l'original
}
```

## Points Clés

✅ **`String`** : Owned, mutable, heap-allocated  
✅ **`str`** : Borrowed, immutable, flexible (heap/stack/static)  
🚀 Préfère `&str` pour paramètres de fonction sauf si tu as besoin d'ownership ou mutation

**Essaie Ceci :** Que se passe-t-il quand tu appelles `.to_string()` sur un string literal vs un `String` ?

**Réponse :** Literal crée nouvelle allocation heap ; `String` crée un clone des données heap existantes—les deux allouent, mais la source diffère !