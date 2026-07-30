---
id: collect-method-rust
title: >-
  La magie de collect() en Rust : Transformer des itérateurs en Vecs, HashMaps et Strings !
slug: collect-method-rust
locale: fr
author: mayo
excerpt: 'Collections (comme Vec), itérateurs (into_iter, collect), et concepts associés'
tags:
  - rust
  - iterators
  - collections
date: '2025-10-26'
---

# Comment fonctionne collect() en Rust ? Montre comment convertir un itérateur en Vec, HashMap ou String.

`collect()` est une méthode qui convertit un itérateur en collection. Elle s'appuie sur le trait `FromIterator` de Rust, qui définit comment construire un type à partir d'un itérateur.

<div class="svg-container" style="margin:2rem 0;">
<svg class="ci3-fig" viewBox="0 0 800 260" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Un itérateur s'écoule vers collect(), qui se ramifie vers un Vec, une HashMap ou une String selon le type cible">
<!-- style -->
<style>
.ci3-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .ci3-fig,[data-theme="dark"] .ci3-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.ci3-fig .bg{fill:var(--bg)}
.ci3-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.ci3-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.ci3-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.ci3-fig .title{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.ci3-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif}
.ci3-fig .ac{fill:var(--ac)}
.ci3-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="ci3-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ln)"/></marker>
</defs>
<!-- bg -->
<rect class="bg" x="0" y="0" width="800" height="260" rx="8"/>
<!-- title -->
<text x="400" y="26" text-anchor="middle" class="title">collect() via FromIterator</text>
<!-- source box -->
<rect class="box" x="300" y="42" width="200" height="36" rx="6"/>
<text x="400" y="65" text-anchor="middle" class="tx">Iterator&lt;Item=T&gt;</text>
<!-- arrow to collect -->
<path class="ln" d="M400 78V102" marker-end="url(#ci3-arrow-fr)"/>
<rect class="acbox" x="320" y="102" width="160" height="36" rx="6"/>
<text x="400" y="125" text-anchor="middle" class="tx ac">collect()</text>
<!-- Y merge then split to 3 targets -->
<path class="ln" d="M400 138V158"/>
<path class="ln" d="M140 158H660"/>
<path class="ln" d="M140 158V178" marker-end="url(#ci3-arrow-fr)"/>
<path class="ln" d="M400 158V178" marker-end="url(#ci3-arrow-fr)"/>
<path class="ln" d="M660 158V178" marker-end="url(#ci3-arrow-fr)"/>
<!-- target boxes -->
<rect class="box" x="60" y="178" width="160" height="36" rx="6"/>
<text x="140" y="201" text-anchor="middle" class="tx">Vec&lt;T&gt;</text>
<rect class="box" x="320" y="178" width="160" height="36" rx="6"/>
<text x="400" y="201" text-anchor="middle" class="tx">HashMap&lt;K,V&gt;</text>
<rect class="box" x="580" y="178" width="160" height="36" rx="6"/>
<text x="660" y="201" text-anchor="middle" class="tx">String</text>
<!-- captions -->
<text x="140" y="230" text-anchor="middle" class="mut">depuis un simple itérateur</text>
<text x="400" y="230" text-anchor="middle" class="mut">depuis des tuples (K, V)</text>
<text x="660" y="230" text-anchor="middle" class="mut">depuis des chars ou &amp;str</text>
<text x="400" y="252" text-anchor="middle" class="mut">Le type cible doit implémenter FromIterator ; le compilateur infère quelle impl appeler</text>
</svg>
</div>

## Mécanismes clés

- **Évaluation paresseuse** : Les itérateurs sont paresseux — `collect()` déclenche leur consommation.
- **Inférence de type** : Le type de collection cible doit être spécifié (ou inférable).
- **Flexibilité** : Fonctionne avec tout type implémentant `FromIterator`.

## Conversion vers des collections courantes

### 1. Itérateur → `Vec<T>`

```rust
let numbers = 1..5;                 // Range (implémente Iterator)
let vec: Vec<_> = numbers.collect(); // Vec<i32> == [1, 2, 3, 4]
```

**Note** : `Vec<_>` permet à Rust d'inférer le type interne (`i32` ici).

### 2. Itérateur → `HashMap<K, V>`

Nécessite des tuples de paires `(K, V)` :
```rust
use std::collections::HashMap;

let pairs = vec![("a", 1), ("b", 2)].into_iter();
let map: HashMap<_, _> = pairs.collect(); // HashMap<&str, i32>
```

**Syntaxe alternative** (avec turbofish) :
```rust
let map = pairs.collect::<HashMap<&str, i32>>();
```

### 3. Itérateur → `String`

Combiner des caractères ou des chaînes :
```rust
let chars = ['R', 'u', 's', 't'].iter();
let s: String = chars.collect(); // "Rust"

// Ou concaténer des chaînes :
let words = vec!["Hello", " ", "World"].into_iter();
let s: String = words.collect(); // "Hello World"
```

## Fonctionnement interne de `collect()`

- **Trait `FromIterator`** :
  Les collections implémentent ce trait pour définir leur logique de construction :
  ```rust
  pub trait FromIterator<A> {
      fn from_iter<T>(iter: T) -> Self
      where
          T: IntoIterator<Item = A>;
  }
  ```

- **Magie du compilateur** : Rust infère le type cible selon le contexte ou les annotations.

<div class="svg-container" style="margin:2rem 0;">
<svg class="ci3b-fig" viewBox="0 0 800 300" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Trois formes d'annotation de type convergent vers l'inférence, qui choisit l'implémentation FromIterator ; sans aucune annotation la compilation échoue">
<!-- style -->
<style>
.ci3b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .ci3b-fig,[data-theme="dark"] .ci3b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.ci3b-fig .bg{fill:var(--bg)}
.ci3b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.ci3b-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.ci3b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.ci3b-fig .title{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.ci3b-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif}
.ci3b-fig .ac{fill:var(--ac)}
.ci3b-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="ci3b-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ln)"/></marker>
</defs>
<!-- bg -->
<rect class="bg" x="0" y="0" width="800" height="300" rx="8"/>
<!-- titre -->
<text x="400" y="26" text-anchor="middle" class="title">D'où collect() tire son type cible</text>
<!-- trois sources d'annotation -->
<rect class="box" x="30" y="48" width="220" height="36" rx="6"/>
<text x="140" y="71" text-anchor="middle" class="tx">let v: Vec&lt;_&gt; = …</text>
<rect class="box" x="290" y="48" width="220" height="36" rx="6"/>
<text x="400" y="71" text-anchor="middle" class="tx">collect::&lt;HashMap&lt;_,_&gt;&gt;()</text>
<rect class="box" x="550" y="48" width="220" height="36" rx="6"/>
<text x="660" y="71" text-anchor="middle" class="tx">fn f() -&gt; String { … }</text>
<!-- fusion en Y vers l'inférence -->
<path class="ln" d="M140 84V104"/>
<path class="ln" d="M400 84V104"/>
<path class="ln" d="M660 84V104"/>
<path class="ln" d="M140 104H660"/>
<path class="ln" d="M400 104V124" marker-end="url(#ci3b-arrow)"/>
<rect class="acbox" x="280" y="124" width="240" height="36" rx="6"/>
<text x="400" y="147" text-anchor="middle" class="tx ac">l'inférence choisit l'impl</text>
<!-- vers la construction -->
<path class="ln" d="M400 160V184" marker-end="url(#ci3b-arrow)"/>
<rect class="box" x="230" y="184" width="340" height="34" rx="6"/>
<text x="400" y="205" text-anchor="middle" class="tx">FromIterator::from_iter construit</text>
<!-- branche d'échec -->
<text x="60" y="240" class="mut">sans aucune annotation :</text>
<rect class="box" x="60" y="250" width="250" height="34" rx="6"/>
<text x="185" y="271" text-anchor="middle" class="tx">let n = it.collect();</text>
<path class="ln" d="M310 267H420" marker-end="url(#ci3b-arrow)"/>
<rect class="box" x="420" y="250" width="320" height="34" rx="6"/>
<text x="580" y="271" text-anchor="middle" class="tx">erreur : annotations de type requises</text>
</svg>
</div>

## Utilisations avancées

### Collection conditionnelle

Convertir uniquement les nombres pairs en `Vec` :
```rust
let evens: Vec<_> = (1..10).filter(|x| x % 2 == 0).collect(); // [2, 4, 6, 8]
```

### Types personnalisés

Implémenter `FromIterator` pour vos types :
```rust
struct MyCollection(Vec<i32>);

impl FromIterator<i32> for MyCollection {
    fn from_iter<I: IntoIterator<Item = i32>>(iter: I) -> Self {
        MyCollection(iter.into_iter().collect())
    }
}

let nums = MyCollection::from_iter(1..=3); // MyCollection([1, 2, 3])
```

## Notes de performance

- **Collections pré-allouées** : Utiliser `with_capacity` + `extend()` si la taille est connue :
  ```rust
  let mut vec = Vec::with_capacity(100);
  vec.extend(1..=100);  // Plus rapide que collect() pour les grands itérables
  ```

- **Abstractions à coût nul** : `collect()` est optimisé (par exemple, `Vec` à partir de ranges évite les vérifications de bornes).

## Pièges courants

- **Types ambigus** :
  Échoue si Rust ne peut pas inférer la cible :
  ```rust
  let nums = vec![1, 2].into_iter().collect(); // ERREUR : annotations de type nécessaires
  ```

- **Problèmes d'ownership** :
  Consomme l'itérateur :
  ```rust
  let iter = vec![1, 2].into_iter();
  let _ = iter.collect::<Vec<_>>();
  // iter.next(); // ERREUR : iter consommé par collect()
  ```

## Points clés à retenir

✅ Utiliser `collect()` pour matérialiser des itérateurs en :
- `Vec`, `HashMap`, `String`, ou tout type `FromIterator`.
✅ Spécifier le type (ex: `let v: Vec<_> = ...`).
🚀 Optimiser avec `with_capacity` pour les grandes collections.

**Exemple concret** :
`serde_json::from_str` est souvent chaîné avec `collect()` pour construire des structures complexes :
```rust
let data: Vec<u8> = "123".bytes().collect(); // [49, 50, 51] (valeurs ASCII)
```
