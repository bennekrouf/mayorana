---
id: string-literals-memory-rust-fr
title: "Comment Rust gère-t-il les string literals (&str) en termes d'allocation mémoire ? Où vivent-elles ?"
slug: string-literals-memory-rust-fr
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
  - string
  - str
  - allocation
---

# Comment Rust gère-t-il les string literals (&str) en termes d'allocation mémoire ? Où vivent-elles ?

Les string literals (`&str`) en Rust sont gérées efficacement, avec des caractéristiques mémoire distinctes comparées aux types `String` heap-allocated. Comprendre leur allocation et lifetime est clé pour écrire du code Rust performant et sûr.

## String Literals (&str) en Mémoire

### Localisation de Stockage

- Les string literals (ex : `"hello"`) sont stockées dans le **segment de données read-only** (`.rodata`) du binaire compilé, pas sur le heap ou stack.
- Elles sont intégrées directement dans l'exécutable et chargées en mémoire au démarrage du programme.
- La mémoire est **static**, signifiant qu'elle vit pendant toute la durée du programme.

### Inférence de Type

- Le type de `"hello"` est `&'static str` :
  - `&str` : Une string slice immutable.
  - `'static` : Un lifetime durant tout le programme.

**Exemple : Layout Mémoire** :
```rust
let s: &'static str = "hello"; // Pointe vers mémoire static
```

- **Représentation Binaire** :
  - Mémoire Exécutable : `"hello"` stocké dans section `.rodata`, ex : à l'adresse `0x1000`.
  - Variable `s` : Un pointeur (`0x1000`) + length (`5`), stocké sur le stack.

## Propriétés Clés

| **Propriété** | **Explication** |
|---------------|-----------------|
| **Immutable** | Ne peut pas modifier le literal (ex : `"hello"[0] = 'H'` est interdit). |
| **Zero-Cost** | Pas d'allocation runtime (déjà en mémoire). |
| **Lifetime** | Toujours `'static` (valide pour tout le programme). |

## Comparaison avec `String`

| **Feature** | **&'static str (literal)** | **String** |
|-------------|----------------------------|------------|
| **Localisation Mémoire** | Segment données read-only | Heap |
| **Mutabilité** | Immutable | Mutable |
| **Lifetime** | `'static` | Scopé au propriétaire |
| **Coût d'Allocation** | Aucun (compile-time) | Allocation runtime |

## Cas d'Usage Courants

### Constantes
```rust
const GREETING: &str = "hello"; // Pas d'allocation
```

### Arguments de Function
Préfère `&str` à `&String` pour accepter les literals sans allocation :
```rust
fn print(s: &str) { /* ... */ }
print("world"); // Pas de conversion nécessaire
```

## Pourquoi Pas Toujours Utiliser &'static str ?

- Limité aux **strings connues au moment de la compilation**.
- Ne peut pas dynamiquement les créer ou modifier (contrairement à `String`).

**Exemple : Strings Dynamiques Nécessitent `String`** :
```rust
let name = "Alice".to_string(); // Copie heap-allocated
name.push_str(" and Bob");      // Mutabilité possible
```

## Le Problème : Risque de Dangling Pointer

Retourner une référence (`&str`) vers un `String` local crée un dangling pointer, car le `String` est droppé quand la fonction se termine.

**Exemple : Code qui Échoue à Compiler** :
```rust
fn return_str() -> &str {         // ERREUR: Missing lifetime specifier!
    let s = String::from("hello");
    &s                            // Retourne une référence vers `s`...
}                                 // `s` est droppé ici (dangling pointer!)
```

**Erreur du Compiler** :
```
error[E0106]: missing lifetime specifier
 --> src/main.rs:1:17
  |
1 | fn return_str() -> &str {
  |                   ^ expected named lifetime parameter
  |
  = help: this function's return type contains a borrowed value, but there is no value for it to be borrowed from
```

### Pourquoi Rust Rejette Ceci

- **Règles d'Ownership** : `String` (`s`) est possédé par la fonction et droppé quand le scope se termine. Retourner `&s` créerait une référence vers mémoire libérée.
- **Application de Lifetime** : Rust nécessite des lifetimes explicites pour assurer que les références sont toujours valides. Ici, la référence (`&str`) n'a pas de propriétaire d'où emprunter après que la fonction sort.

### Comment le Corriger

#### Option 1 : Retourner un `String` Owned (Pas de Référence)
```rust
fn return_owned() -> String {  // Transfère ownership à l'appelant
    String::from("hello")      // Pas de référence, pas de problème lifetime
}
```

#### Option 2 : Retourner un `&'static str` (String Literal)
```rust
fn return_static() -> &'static str {  // Vit pour toujours dans binaire
    "hello"                          // Mémoire static (pas heap)
}
```

#### Option 3 : Utiliser `Cow<str>` pour Flexibilité
```rust
use std::borrow::Cow;

fn return_cow(is_heap: bool) -> Cow<'static, str> {
    if is_heap {
        Cow::Owned(String::from("hello"))  // Heap-allocated
    } else {
        Cow::Borrowed("hello")             // Mémoire static
    }
}
```

## Points Clés

✅ **String literals** :
- Vivent en mémoire static (partie du binaire).
- Sont immutables et zero-cost.
- Ont un lifetime `'static`.

🚀 **Quand les utiliser** :
- Pour strings fixes, read-only (ex : messages, constantes).
- Pour éviter allocations dans APIs de fonction (`&str` plutôt que `&String`).

✅ **Ne retourne jamais `&str` emprunté d'un `String` local**—c'est impossible en Rust safe.

✅ **Solutions** :
- Retourner `String` (transfert d'ownership).
- Utiliser `&'static str` (literals seulement).
- Utiliser `Cow<str>` pour choix dynamiques.

**Note Avancée** : Rust optimise les références `&str` vers literals. Même si tu écris :
```rust
let s = String::from("hello");
let slice = &s[..]; // Pointe vers heap, pas mémoire static !
```
Le compilateur peut élider les copies si le contenu est connu statiquement.

**Expérimente** : Que se passe-t-il si tu essaies de retourner `&s[..]` au lieu de `&s` ?

**Réponse** : Non—c'est le même problème ! La slice pointe encore vers le `String` condamné.