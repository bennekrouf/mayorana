---
id: rust-operateurs-iterateurs
title: "Opérateurs & Itérateurs Rust : Référence Rapide"
locale: "fr"
slug: rust-operateurs-iterateurs
date: '2025-08-04'
author: mayo
excerpt: >-
  Opérateurs Rust essentiels, différences d'itérateurs et gestion Unicode à connaître.
category: rust
tags:
  - rust
  - opérateurs
  - itérateurs
---

# Opérateurs & Itérateurs Rust : Ce Qu'il Faut Savoir

Référence rapide pour les pièges courants et patterns Rust.

## Opérateurs de Comparaison

Rust reste simple :
```rust
x == y    // Égal
x != y    // Différent
x < y     // Inférieur
x > y     // Supérieur
```

**Pas de `<>`, `===`, ou `!==`** comme dans d'autres langages. Juste `==` et `!=`.

## Itérateur vs Collection

Savoir ce qui est itérable :
```rust
3..10                    // ✅ Itérateur
["a", "b"]              // ❌ Array (utiliser .iter())
vec!["x", "y"]          // ❌ Vec (utiliser .iter() ou .into_iter())
```

## iter() vs into_iter()

```rust
let arr = ["a", "b", "c"];

arr.iter()        // &&str (référence vers référence)
arr.into_iter()   // &str (plus propre, préféré)
```

Utiliser `into_iter()` pour les arrays - un niveau de référence en moins.

## Unicode depuis un Char

```rust
let c = '🦀';
let code = c as u32;           // 129408
println!("U+{:04X}", code);   // U+1F980
```

## Qu'est-ce qui a .sort() ?

Seulement les **slices mutables** :
```rust
let mut vec = vec![3, 1, 4];
vec.sort();  // ✅

let mut arr = [3, 1, 4];
arr.sort();  // ✅

// Les itérateurs nécessitent .collect() d'abord
let sorted: Vec<_> = iter.collect().sort();  // ❌
let mut sorted: Vec<_> = iter.collect();     // ✅
sorted.sort();
```

## into() vs into_iter()

Objectifs différents :
```rust
"hello".into()           // Conversion de type (&str -> String)
vec![1,2,3].into_iter()  // Crée un itérateur
```

**Rappel** : `into()` convertit les types, `into_iter()` crée des itérateurs.
