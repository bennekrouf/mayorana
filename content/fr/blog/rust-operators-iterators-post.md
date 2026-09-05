---
id: rust-operateurs-iterateurs
title: 'Opérateurs & Itérateurs Rust'
locale: fr
slug: rust-operateurs-iterateurs
date: '2025-08-07'
author: mayo
excerpt: >-
  Opérateurs Rust essentiels, différences d'itérateurs et gestion Unicode à
  connaître.

tags:
  - rust
  - opérateurs
  - itérateurs
---

# Opérateurs & itérateurs Rust : ce Qu'il Faut Savoir

Voici quelques points d'attention autour de Rust, surtout qu'on vient avec des habitudes d'un autre language de programmation.

## Opérateurs de comparaison

Rust est en mode keep it simple pour les opérateurs :
```rust
x == y    // Égal
x != y    // Différent
x < y     // Inférieur
x > y     // Supérieur
```

**Pas de `<>`, `===`, ou `!==`** comme dans d'autres langages. Juste `==` et `!=`.

## Itérateur vs Collection

Au final qu'est-ce qui est itérable :
```rust
3..10                    // ✅ Itérateur
["a", "b"]              // ❌ Array (utiliser .iter())
vec!["x", "y"]          // ❌ Vec (utiliser .iter() ou .into_iter())
```

## iter() vs into_iter()

```rust
let arr = ["a", "b", "c"];

arr.iter()        // Renvoit des &&str (référence vers référence)
arr.into_iter()   // Renvoit des &str (plus propre, préféré)
```

Utilise `into_iter()` pour les arrays - un niveau de référence en moins.

<div class="svg-container" style="margin:2rem 0;">
<svg class="riter-fig" viewBox="0 0 800 260" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Un array itéré avec iter() donne des doubles références, alors que into_iter() donne un seul niveau de référence">
<style>
.riter-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .riter-fig,[data-theme="dark"] .riter-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.riter-fig text{font-family:ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.riter-fig .title{font-size:14px;font-weight:700}
.riter-fig .body{font-size:12px;font-weight:600}
.riter-fig .cap{font-size:11px;fill:var(--mut)}
.riter-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.riter-fig .acbox{fill:var(--ac);stroke:var(--ac)}
.riter-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="riter-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"></path>
</marker>
</defs>
<!-- source -->
<rect class="box" x="300" y="20" width="200" height="50" rx="8"></rect>
<text x="400" y="50" text-anchor="middle" class="body">arr = ["a","b","c"]</text>
<!-- fan out -->
<path class="ln" d="M400,70 L400,100"></path>
<path class="ln" d="M210,100 L590,100"></path>
<path class="ln" d="M210,100 L210,150" marker-end="url(#riter-arrow-fr)"></path>
<path class="ln" d="M590,100 L590,150" marker-end="url(#riter-arrow-fr)"></path>
<!-- left: iter() -->
<rect class="box" x="80" y="150" width="260" height="80" rx="8"></rect>
<text x="210" y="178" text-anchor="middle" class="title">.iter()</text>
<text x="210" y="198" text-anchor="middle" class="body">&amp;&amp;str</text>
<text x="210" y="216" text-anchor="middle" class="cap">référence vers référence</text>
<!-- right: into_iter() accent -->
<rect class="acbox" x="460" y="150" width="260" height="80" rx="8"></rect>
<text x="590" y="178" text-anchor="middle" class="title" fill="#ffffff">.into_iter()</text>
<text x="590" y="198" text-anchor="middle" class="body" fill="#ffffff">&amp;str</text>
<text x="590" y="216" text-anchor="middle" class="cap" fill="#ffffff">un niveau en moins — préféré</text>
</svg>
</div>

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

La raison tient à la forme des données, pas à la syntaxe. Un itérateur est une recette paresseuse, sans longueur ni indices ; trier suppose d'échanger des éléments sur place, donc il faut d'abord une slice possédée, contiguë et *mutable* :

<div class="svg-container" style="margin:2rem 0;">
<svg class="riterb-fig" viewBox="0 0 800 300" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Chaîne allant d'un itérateur paresseux vers un Vec mutable via collect avant que sort puisse trier sur place, la version chaînée en une ligne étant invalide">
<style>
.riterb-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .riterb-fig,[data-theme="dark"] .riterb-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.riterb-fig text{font-family:ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.riterb-fig .title{font-size:13px;font-weight:700}
.riterb-fig .body{font-size:12px;font-weight:600}
.riterb-fig .cap{font-size:11px;fill:var(--mut)}
.riterb-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.riterb-fig .bad{fill:var(--bg);stroke:var(--mut);stroke-width:1.5;stroke-dasharray:5 4}
.riterb-fig .acbox{fill:var(--ac);stroke:var(--ac)}
.riterb-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.riterb-fig .badln{stroke:var(--mut);stroke-width:1.5;fill:none;stroke-dasharray:5 4}
</style>
<!-- defs -->
<defs>
<marker id="riterb-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"></path>
</marker>
<marker id="riterb-arrowm-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--mut)"></path>
</marker>
</defs>
<!-- stage 1 -->
<rect class="box" x="20" y="50" width="160" height="86" rx="8"></rect>
<text x="100" y="78" text-anchor="middle" class="title">itérateur</text>
<text x="100" y="100" text-anchor="middle" class="body">3..10, v.iter()</text>
<text x="100" y="120" text-anchor="middle" class="cap">paresseux, sans longueur</text>
<path class="ln" d="M180,93 L210,93" marker-end="url(#riterb-arrow-fr)"></path>
<!-- stage 2 -->
<rect class="box" x="210" y="50" width="160" height="86" rx="8"></rect>
<text x="290" y="78" text-anchor="middle" class="title">.collect()</text>
<text x="290" y="100" text-anchor="middle" class="body">Vec&lt;_&gt;</text>
<text x="290" y="120" text-anchor="middle" class="cap">valeurs matérialisées</text>
<path class="ln" d="M370,93 L400,93" marker-end="url(#riterb-arrow-fr)"></path>
<!-- stage 3 -->
<rect class="box" x="400" y="50" width="160" height="86" rx="8"></rect>
<text x="480" y="78" text-anchor="middle" class="title">let mut v</text>
<text x="480" y="100" text-anchor="middle" class="body">&amp;mut [T]</text>
<text x="480" y="120" text-anchor="middle" class="cap">une slice mutable</text>
<path class="ln" d="M560,93 L590,93" marker-end="url(#riterb-arrow-fr)"></path>
<!-- stage 4 accent -->
<rect class="acbox" x="590" y="50" width="160" height="86" rx="8"></rect>
<text x="670" y="78" text-anchor="middle" class="title" fill="#ffffff">v.sort()</text>
<text x="670" y="100" text-anchor="middle" class="body" fill="#ffffff">échange sur place</text>
<text x="670" y="120" text-anchor="middle" class="cap" fill="#ffffff">renvoie ()</text>
<!-- the tempting one-liner -->
<path class="badln" d="M290,136 L290,180" marker-end="url(#riterb-arrowm-fr)"></path>
<rect class="bad" x="115" y="180" width="450" height="66" rx="8"></rect>
<text x="340" y="206" text-anchor="middle" class="body" fill="var(--mut)">iter.collect().sort()</text>
<text x="340" y="228" text-anchor="middle" class="cap">rien n'est lié en mut, et sort() renvoie () — pas le Vec</text>
<!-- caption -->
<text x="400" y="280" text-anchor="middle" class="cap">Seules les slices mutables ont .sort() — un itérateur doit d'abord en devenir une</text>
</svg>
</div>

## into() vs into_iter()

Objectifs différents :
```rust
"hello".into()           // Conversion de type (&str -> String)
vec![1,2,3].into_iter()  // Crée un itérateur
```

**Rappel** : `into()` convertit les types, `into_iter()` crée des itérateurs. Donc rien à voir les deux !!
