---
id: into-iter-vs-iter-ownership-fr
title: Implications d'itérer sur un Vec avec .into_iter() au lieu de .iter()
slug: into-iter-vs-iter-ownership-fr
locale: fr
author: mayo
excerpt: >-
  Comprendre les différences entre .into_iter() et .iter() lors de l'itération
  sur Vec, couvrant les implications d'ownership et considérations de
  performance

tags:
  - rust
  - iterators
  - ownership
  - vec
  - into-iter
  - collections
date: '2025-08-21'
---

# Lors de l'itération sur un Vec, pourquoi utiliser .into_iter() au lieu de .iter() ?

<div class="svg-container" style="margin:2rem 0;">
<svg class="ci10-fig" viewBox="0 0 800 240" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="into_iter consomme le Vec qui devient donc inutilisable ensuite, tandis que iter l'emprunte et le laisse disponible pour un usage ultérieur">
<!-- style -->
<style>
.ci10-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .ci10-fig,[data-theme="dark"] .ci10-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.ci10-fig .bg{fill:var(--bg)}
.ci10-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.ci10-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.ci10-fig .ghost{fill:none;stroke:var(--ln);stroke-width:1.5;stroke-dasharray:3 3}
.ci10-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.ci10-fig .title{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.ci10-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif}
.ci10-fig .ac{fill:var(--ac)}
.ci10-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="ci10-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ln)"/></marker>
</defs>
<!-- bg -->
<rect class="bg" x="0" y="0" width="800" height="240" rx="8"/>
<!-- title -->
<text x="400" y="24" text-anchor="middle" class="title">.into_iter() vs .iter() — ownership</text>
<!-- row1: into_iter -->
<text x="20" y="70" class="tx">.into_iter()</text>
<rect class="box" x="130" y="50" width="140" height="36" rx="6"/>
<text x="200" y="73" text-anchor="middle" class="tx">vec (owner)</text>
<path class="acln" d="M270 68H340" marker-end="url(#ci10-arrow-fr)"/>
<rect class="acbox" x="340" y="50" width="150" height="36" rx="6"/>
<text x="415" y="73" text-anchor="middle" class="tx ac">produit T (moved)</text>
<rect class="ghost" x="130" y="104" width="140" height="30" rx="6"/>
<text x="200" y="123" text-anchor="middle" class="mut" font-size="10">vec inutilisable après</text>
<!-- row2: iter -->
<text x="20" y="170" class="tx">.iter()</text>
<rect class="box" x="130" y="150" width="140" height="36" rx="6"/>
<text x="200" y="173" text-anchor="middle" class="tx">vec (owner)</text>
<path class="ln" d="M270 168H340" marker-end="url(#ci10-arrow-fr)"/>
<rect class="box" x="340" y="150" width="150" height="36" rx="6"/>
<text x="415" y="173" text-anchor="middle" class="tx">produit &amp;T</text>
<path class="ln" d="M200 186V206" marker-end="url(#ci10-arrow-fr)"/>
<rect class="box" x="130" y="206" width="140" height="26" rx="6"/>
<text x="200" y="223" text-anchor="middle" class="mut" font-size="10">vec toujours utilisable</text>
<text x="620" y="70" class="mut">pas de clone, mais vec disparaît</text>
<text x="620" y="170" class="mut">lecture seule, vec réutilisable après</text>
</svg>
</div>

## Différences Clés

| .into_iter() | .iter() |
|--------------|---------|
| Consomme le Vec (prend ownership). | Emprunte le Vec en écriture (mut) |
| Produit des valeurs owned (T). | Produit des références (&T). |
| Le Vec original est inutilisable après. | Le Vec original reste intact. |

## Quand Utiliser .into_iter()

### Besoin d'Ownership sur les éléments d'une liste

Utile quand tu veux sortir des éléments du Vec (ex : transférer vers une autre collection, comme un ctrl-x) :

```rust
let vec = vec![String::from("a"), String::from("b")];
let new_vec: Vec<String> = vec.into_iter().collect();  // `vec` est consommé
// println!("{:?}", vec);  // ERREUR: `vec` moved
```

### Opérations Destructives

Pour des opérations qui détruisent le Vec (ex : trier et dédupliquer en un passage) :

```rust
let mut vec = vec![3, 1, 2, 1];
vec = vec.into_iter().unique().sorted().collect();  // Destructif mais efficace
```

### Optimisation de Performance

Évite le cloning quand on travaille avec des données owned (ex : Vec<String>) :

```rust
let vec = vec![String::from("rust")];
for s in vec.into_iter() {  // Pas de clone, move le `String`
    println!("{}", s);
}
```

## Implications d'Ownership

### Après .into_iter(), le Vec original est "moved" et ne peut pas être utilisé :

```rust
let vec = vec![1, 2, 3];
let iter = vec.into_iter();  // `vec` est moved ici
// println!("{:?}", vec);    // ERREUR: value borrowed after move
```

### Fonctionne avec les types "non-Copy" (ex: String, Box<T>) :

```rust
let vec = vec![String::from("hello")];
let s = vec.into_iter().next().unwrap();  // Move le `String` dehors
```

## Comparaison avec .iter()

| Scénario | .into_iter() | .iter() |
|----------|--------------|---------|
| Besoin de réutiliser le Vec | ❌ Non | ✅ Oui |
| Modifier les éléments | ❌ Non (consommé) | ✅ Oui (iter_mut()) |
| Éviter le cloning de données owned | ✅ Oui | ❌ Non (nécessite clone()) |

## Exemples Réels

### Transfert de Données

Déplacer un Vec dans une fonction qui prend ownership :

```rust
fn process(data: impl Iterator<Item = String>) { /* ... */ }
let vec = vec![String::from("a"), String::from("b")];
process(vec.into_iter());  // Efficace, pas de clones
```

### Filtrage Destructif

Retirer des éléments pendant l'itération :

```rust
let vec = vec![1, 2, 3, 4];
let evens: Vec<_> = vec.into_iter().filter(|x| x % 2 == 0).collect();
```

## Considérations de Performance

- **Zero-cost pour les primitives (i32, bool)** : `.into_iter()` et `.iter()` compilent vers le même code assembleur si le type implémente le trait copy (`T: Copy`).
- **Évite les allocations** quand on chaîne des adaptateurs (ex : `.map().filter()`).

## Points Clés

✅ **Utilise .into_iter() pour** :
- Sortir des éléments d'un Vec.
- Optimiser la performance avec des données owned.
- Transformer destructivement des collections.

🚫 **Evite si tu dois** :
- Réutiliser le Vec après itération.
- Partager des références entre threads (`&T` est Sync; mais `T` pourrait ne pas l'être).

**Essaie Ceci** : Que se passe-t-il si tu appelles `.into_iter()` sur un Vec et ensuite Essaie d'utiliser le Vec original dans un iterateur parallèle (ex : rayon::iter) ?

**Réponse** : Erreur au moment de la compilation ! Le Vec est déjà consommé. Utilise `.par_iter()` à la place pour un accès parallèle read-only.
