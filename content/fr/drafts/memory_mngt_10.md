---
id: cow-copy-on-write-rust-fr
title: "Comment fonctionne Cow<'a, B> (Copy-on-Write) en Rust ? Quand l'utiliser ?"
slug: cow-copy-on-write-rust-fr
locale: "fr"
date: '2025-07-07'
author: mayo
excerpt: >-
  Rust memory et string
content_focus: "rust memory et string"
technical_level: "Discussion technique expert"

tags:
  - rust
  - beginner
  - memory
  - cow
  - string
  - copy-on-write
scheduledFor: '2025-07-08'
scheduledAt: '2025-07-08T06:55:13.405Z'
---

# Comment fonctionne Cow<'a, B> (Copy-on-Write) en Rust ? Quand l'utiliserais-tu pour les strings ou autres données ?

`Cow<'a, B>` (Copy-on-Write) est un smart pointer dans le module `std::borrow` de Rust qui fournit une abstraction sans clone sur les données borrowed et owned. Il permet une gestion efficace des données qui peuvent ou non nécessiter une modification, minimisant les allocations tout en maintenant la flexibilité.

## Qu'est-ce que Cow ?

`Cow` (abréviation de Copy-on-Write) peut représenter :
- **Des données borrowed** (`&'a B`) : Une référence vers des données existantes, évitant les allocations.
- **Des données owned** (`<B as ToOwned>::Owned`) : Une copie complètement owned, allouée seulement quand la mutation est requise.

**Définition** (depuis `std::borrow`) :
```rust
pub enum Cow<'a, B>
where
    B: 'a + ToOwned + ?Sized,
{
    Borrowed(&'a B),  // Référence immutable (pas d'allocation)
    Owned(<B as ToOwned>::Owned),  // Données owned (allouées quand nécessaire)
}
```

**Comment ça Fonctionne** :
- Initialement enveloppe une référence (`Borrowed`), ce qui est zero-cost.
- Convertit vers des données owned (`Owned`) de façon lazy, seulement quand la modification est nécessaire.

## Exemple avec Cow<str> (Strings)

```rust
use std::borrow::Cow;

fn process(input: &str) -> Cow<str> {
    if input.contains("error") {
        Cow::Owned(input.replace("error", ""))  // Alloue nouvelle String
    } else {
        Cow::Borrowed(input)  // Pas d'allocation
    }
}

fn main() {
    let msg1 = "hello world";  // Pas d'allocation
    let msg2 = "error: foo";   // Va allouer quand traité

    println!("{}", process(msg1)); // "hello world" (borrowed)
    println!("{}", process(msg2)); // ": foo" (owned)
}
```

## Cas d'Usage Clés

### 1. Optimiser les Opérations String

Éviter les allocations quand on modifie des strings conditionnellement :

```rust
fn to_uppercase(input: &str) -> Cow<str> {
    if input.chars().any(|c| c.is_lowercase()) {
        Cow::Owned(input.to_uppercase())  // Alloue seulement si nécessaire
    } else {
        Cow::Borrowed(input)
    }
}
```

**Exemple Étendu** (vérification des chiffres) :
```rust
fn to_uppercase_no_digits(input: &str) -> Cow<str> {
    if input.chars().any(|c| c.is_lowercase() || c.is_digit(10)) {
        Cow::Owned(input.to_uppercase().replace(|c: char| c.is_digit(10), ""))
    } else {
        Cow::Borrowed(input)
    }
}
```

`Cow` assure qu'il n'y a pas d'allocation si l'input est déjà en uppercase et sans chiffres, optimisant les chemins read-only.

### 2. Flexibilité d'API

Accepter des données borrowed et owned sans forcer les clones :

```rust
fn print(data: Cow<str>) {
    println!("{}", data);
}

fn main() {
    let my_string = String::from("world");
    print(Cow::Borrowed("hello"));  // Pas d'allocation
    print(Cow::Owned(my_string));   // Fonctionne aussi
}
```

Ceci supporte `&str`, `String`, ou autres types implémentant `ToOwned`.

### 3. Parsing Zero-Copy

Courant dans les parsers (ex : `serde`), où les champs sont souvent non modifiés :

```rust
struct JsonValue<'a> {
    data: Cow<'a, str>,  // Emprunte depuis input sauf si modifié
}
```

## Quand Éviter Cow

- **Données toujours mutées** : Utilise `String` ou `Vec` directement pour éviter l'overhead de `Cow`.
- **Thread-safety** : `Cow` n'est pas thread-safe ; utilise `Arc` + `Mutex` pour accès concurrent.

## Implications de Performance

| **Scénario** | **Comportement** | **Coût d'Allocation** |
|--------------|------------------|-----------------------|
| Pas de modification | Reste comme `Borrowed` | Zéro |
| Modification | Convertit vers `Owned` | Une allocation |

## Points Clés

✅ **Utilise `Cow` quand** :
- Tu as besoin de modifier conditionnellement des données borrowed.
- Tu veux éviter les allocations pour les chemins read-only.
- Ton API devrait accepter `&str` et `String` efficacement.

🚀 **Usages réels** :
- `regex::Match` (emprunte les strings d'input).
- Désérialisation `serde`.
- Manipulation de path (`PathBuf` vs. `&Path`).

**Note** : `Cow` fonctionne avec tout type `ToOwned` (ex : `[u8]` → `Vec<u8>`, `Path` → `PathBuf`).

**Expérimente** : Modifier l'exemple `to_uppercase` pour gérer les chiffres (comme montré ci-dessus) démontre comment `Cow` évite les allocations sauf si des lettres minuscules *et* des chiffres sont présents, optimisant la performance.
