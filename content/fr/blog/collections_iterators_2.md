---
id: iter-methods-rust
title: 'Quelles sont les différences entre into_iter(), iter() et iter_mut() ?'
slug: iter-methods-rust
locale: fr
date: '2025-10-25'
author: mayo
excerpt: 'Collections (comme Vec), itérateurs (into_iter, collect) et concepts associés'
tags:
  - rust
  - iterators
  - collections
---

# Quelles sont les différences entre into_iter(), iter() et iter_mut() ?

Ces trois méthodes sont fondamentales pour travailler avec des collections en Rust, chacune servant des cas d'utilisation distincts en matière d'ownership et de mutabilité.

<div class="svg-container" style="margin:2rem 0;">
<svg class="ci2-fig" viewBox="0 0 800 280" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Vec se ramifie en into_iter, iter et iter_mut, chacun produisant un type d'élément différent et affectant l'original différemment">
<!-- style -->
<style>
.ci2-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .ci2-fig,[data-theme="dark"] .ci2-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.ci2-fig .bg{fill:var(--bg)}
.ci2-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.ci2-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.ci2-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.ci2-fig .title{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.ci2-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif}
.ci2-fig .ac{fill:var(--ac)}
.ci2-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="ci2-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ln)"/></marker>
</defs>
<!-- bg -->
<rect class="bg" x="0" y="0" width="800" height="280" rx="8"/>
<!-- title -->
<text x="400" y="26" text-anchor="middle" class="title">Méthodes d'itération sur Vec&lt;T&gt;</text>
<!-- source box -->
<rect class="box" x="330" y="40" width="140" height="36" rx="6"/>
<text x="400" y="63" text-anchor="middle" class="tx">Vec&lt;T&gt;</text>
<!-- branch lines to Y merge point then split -->
<path class="ln" d="M400 76V100" marker-end="none"/>
<path class="ln" d="M140 100H660" marker-end="none"/>
<path class="ln" d="M140 100V120" marker-end="url(#ci2-arrow-fr)"/>
<path class="ln" d="M400 100V120" marker-end="url(#ci2-arrow-fr)"/>
<path class="ln" d="M660 100V120" marker-end="url(#ci2-arrow-fr)"/>
<!-- method boxes -->
<rect class="acbox" x="60" y="120" width="160" height="36" rx="6"/>
<text x="140" y="143" text-anchor="middle" class="tx ac">into_iter()</text>
<rect class="box" x="320" y="120" width="160" height="36" rx="6"/>
<text x="400" y="143" text-anchor="middle" class="tx">iter()</text>
<rect class="box" x="580" y="120" width="160" height="36" rx="6"/>
<text x="660" y="143" text-anchor="middle" class="tx">iter_mut()</text>
<!-- arrows to outputs -->
<path class="ln" d="M140 156V180" marker-end="url(#ci2-arrow-fr)"/>
<path class="ln" d="M400 156V180" marker-end="url(#ci2-arrow-fr)"/>
<path class="ln" d="M660 156V180" marker-end="url(#ci2-arrow-fr)"/>
<!-- output boxes -->
<rect class="box" x="60" y="180" width="160" height="34" rx="6"/>
<text x="140" y="201" text-anchor="middle" class="tx">produit T (owned)</text>
<rect class="box" x="320" y="180" width="160" height="34" rx="6"/>
<text x="400" y="201" text-anchor="middle" class="tx">produit &amp;T</text>
<rect class="box" x="580" y="180" width="160" height="34" rx="6"/>
<text x="660" y="201" text-anchor="middle" class="tx">produit &amp;mut T</text>
<!-- captions -->
<text x="140" y="232" text-anchor="middle" class="mut ac">original consommé</text>
<text x="400" y="232" text-anchor="middle" class="mut">original intact</text>
<text x="660" y="232" text-anchor="middle" class="mut">original modifié en place</text>
<text x="400" y="262" text-anchor="middle" class="mut">Choisir selon le besoin d'ownership, d'accès en lecture seule, ou de mutation en place</text>
</svg>
</div>

## 1. `into_iter()` - Itérateur qui consomme l'ownership

- **Prend l'ownership** de la collection (`self`).
- **Produit** des valeurs possédées (`T`) lors de l'itération.
- **Détruit** la collection originale (ne peut plus être utilisée ensuite).

```rust
let vec = vec!["a".to_string(), "b".to_string()];
for s in vec.into_iter() {  // `vec` est déplacé ici
    println!("{}", s);      // `s` est un String (possédé)
}
// println!("{:?}", vec);  // ERREUR : `vec` a été consommé
```

**Quand l'utiliser** :
- Quand vous avez besoin de transformer ou consommer la collection définitivement.
- Pour enchaîner des adaptateurs d'itérateurs qui nécessitent l'ownership (ex: `.filter().collect()`).

## 2. `iter()` - Itérateur d'emprunt immuable

- **Emprunte** la collection de manière immuable (`&self`).
- **Produit** des références (`&T`).
- **Laisse** la collection intacte.

```rust
let vec = vec!["a", "b", "c"];
for s in vec.iter() {       // Emprunte `vec`
    println!("{}", s);      // `s` est &&str (référence)
}
println!("{:?}", vec);      // OK : `vec` toujours valide
```

**Quand l'utiliser** :
- Quand vous avez seulement besoin d'un accès en lecture seule aux éléments.
- Pour des opérations comme la recherche (`.find()`) ou l'inspection.

## 3. `iter_mut()` - Itérateur d'emprunt mutable

- **Emprunte** la collection de manière mutable (`&mut self`).
- **Produit** des références mutables (`&mut T`).
- **Permet** la modification en place.

```rust
let mut vec = vec![1, 2, 3];
for num in vec.iter_mut() {  // Emprunt mutable
    *num *= 2;               // Modifie en place
}
println!("{:?}", vec);       // [2, 4, 6]
```

**Quand l'utiliser** :
- Quand vous avez besoin de modifier les éléments sans réallocation.
- Pour des mises à jour en masse (ex: appliquer des transformations).

## Résumé des différences clés

| Méthode       | Ownership     | Produit    | Modifie l'original ? | Réutilisable ? |
|---------------|---------------|------------|---------------------|----------------|
| `into_iter()` | Consomme      | `T`        | ❌ (détruit)         | ❌             |
| `iter()`      | Emprunte      | `&T`       | ❌                  | ✅             |
| `iter_mut()`  | Emprunt mut   | `&mut T`   | ✅                  | ✅             |

## Pièges courants

- **Déplacements accidentels avec `into_iter()`** :
  ```rust
  let vec = vec![1, 2];
  let _ = vec.into_iter();  // `vec` déplacé ici
  // println!("{:?}", vec); // ERREUR !
  ```

- **Accès mutable simultané** :
  ```rust
  let mut vec = vec![1, 2];
  let iter = vec.iter_mut();
  // vec.push(3);           // ERREUR : Impossible d'emprunter `vec` pendant que l'itérateur existe
  ```

## Exemples concrets

- **`iter()` pour un traitement en lecture seule** :
  ```rust
  let words = vec!["hello", "world"];
  let lengths: Vec<_> = words.iter().map(|s| s.len()).collect();  // [5, 5]
  ```

- **`iter_mut()` pour des mises à jour en place** :
  ```rust
  let mut scores = vec![85, 92, 78];
  scores.iter_mut().for_each(|s| *s += 5);  // [90, 97, 83]
  ```

- **`into_iter()` pour un transfert d'ownership** :
  ```rust
  let matrix = vec![vec![1, 2], vec![3, 4]];
  let flattened: Vec<_> = matrix.into_iter().flatten().collect();  // [1, 2, 3, 4]
  ```

## Notes de performance

- `iter()` et `iter_mut()` sont des zero-cost abstractions (juste des pointeurs).
- `into_iter()` peut impliquer des déplacements (mais optimisés pour les primitives comme `i32`).

**Essayez ceci** : Que se passe-t-il si vous appelez `iter_mut()` sur un `Vec<T>` où `T` n'implémente pas `Copy`, puis essayez de modifier les éléments ?  
**Réponse** : Cela fonctionne ! L'itérateur produit des `&mut T`, permettant une mutation directe (ex: `*item = new_value`).
