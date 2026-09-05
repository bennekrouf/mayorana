---
id: borrowing-rules-rust-fr
title: emprunts mutables vs. immutables.
slug: borrowing-rules-rust-fr
locale: fr
date: '2025-11-29'
author: mayo
excerpt: Rust memory et string
tags:
  - rust
  - memory
  - borrowing
  - ownership
  - safety
---

# Quelles sont les règles de borrowing en Rust ? Explique les emprunts mutables vs. immutables.

Les règles de borrowing de Rust, appliquées par le borrow checker au moment de la compilation, assurent la memory safety et préviennent les data races sans overhead runtime. Ces règles gouvernent comment les données peuvent être accédées via des références, distinguant entre emprunts mutables (`&mut T`) et immutables (`&T`).

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm9-fig" viewBox="0 0 800 240" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Les états d'emprunt autorisés sont plusieurs références immutables ou exactement une référence mutable vers les mêmes données ; mélanger un emprunt mutable et immutable est rejeté">
<style>
.mm9-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00;--bad:#ef4444}
:root.dark .mm9-fig,[data-theme="dark"] .mm9-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569;--bad:#f87171}
.mm9-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm9-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm9-fig .badbox{fill:var(--box);stroke:var(--bad);stroke-width:2}
.mm9-fig .title{font:700 13px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm9-fig .body{font:600 12px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm9-fig .cap{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
.mm9-fig .ac{fill:var(--ac)}
.mm9-fig .bad{fill:var(--bad)}
</style>
<!-- allowed: many immutable -->
<text x="150" y="24" text-anchor="middle" class="title">OK : Plusieurs &amp;T</text>
<rect x="30" y="40" width="240" height="50" rx="8" class="acbox"/>
<text x="150" y="70" text-anchor="middle" class="body ac">&amp;x, &amp;x, &amp;x, ...</text>
<text x="150" y="110" text-anchor="middle" class="cap">read-only, nombre illimité</text>
<!-- allowed: one mutable -->
<text x="400" y="24" text-anchor="middle" class="title">OK : Un seul &amp;mut T</text>
<rect x="280" y="40" width="240" height="50" rx="8" class="acbox"/>
<text x="400" y="70" text-anchor="middle" class="body ac">&amp;mut x</text>
<text x="400" y="110" text-anchor="middle" class="cap">accès exclusif, aucun autre</text>
<!-- rejected: mixed -->
<text x="650" y="24" text-anchor="middle" class="title">Rejeté : Mélange</text>
<rect x="530" y="40" width="240" height="50" rx="8" class="badbox"/>
<text x="650" y="70" text-anchor="middle" class="body bad">&amp;x + &amp;mut x</text>
<text x="650" y="110" text-anchor="middle" class="cap">erreur compile-time : risque de data race</text>
<!-- summary box -->
<rect x="130" y="150" width="540" height="60" rx="8" class="box"/>
<text x="400" y="175" text-anchor="middle" class="body">Le borrow checker applique ceci au moment de la compilation</text>
<text x="400" y="193" text-anchor="middle" class="cap">aucun coût runtime, data races impossibles en code safe</text>
</svg>
</div>

## Les règles de Borrowing (Appliquées par le Compiler)

1. **Soit Un Emprunt Mutable (`&mut T`) SOIT Plusieurs Emprunts Immutables (`&T`)** :
   - Tu peux avoir :
     - **Une référence mutable** (`&mut T`), OU
     - **N'importe quel nombre de références immutables** (`&T`).
   - Jamais les deux en même temps pour les mêmes données.

2. **Les Références Doivent Toujours Être Valides (Pas de Dangling Pointers)** :
   - Les références empruntées ne peuvent pas survivre aux données qu'elles pointent, appliqué par le système de lifetime de Rust.

## Emprunts immutables (`&T`)
- **Accès read-only** : Ne peut pas modifier les données.
- **Plusieurs autorisés** : Sûr pour lectures concurrentes, car aucune modification ne peut survenir.

**Exemple** :
```rust
let x = 42;
let r1 = &x;  // OK: Borrowing immutable
let r2 = &x;  // OK: Autre borrow immutable
println!("{}, {}", r1, r2);  // Fonctionne bien
```

## Emprunts mutables (`&mut T`)

- **Accès exclusif** : Permet modification des données.
- **Aucun autre emprunt autorisé** : Aucun `&T` ou `&mut T` additionnel ne peut coexister pour les mêmes données.

**Exemple** :
```rust
let mut x = 42;
let r1 = &mut x;  // OK: Emprunt mutable
*r1 += 1;         // Peut modifier
// let r2 = &x;   // ERREUR: Cannot borrow `x` as immutable while mutable borrow exists
```

## Ce que le compilateur rejette
1. **Chevauchement Mutable + Immutable** :
   ```rust
   let mut data = 10;
   let r1 = &data;      // Borrowing immutable
   let r2 = &mut data;  // ERREUR: Cannot borrow as mutable while borrowed as immutable
   ```

2. **Emprunts Mutables Multiples** :
   ```rust
   let mut s = String::new();
   let r1 = &mut s;
   let r2 = &mut s;  // ERREUR: Second mutable borrow
   ```

3. **Références Dangereuses** :
   ```rust
   fn dangling() -> &String {
       let s = String::from("oops");
       &s  // ERREUR: `s` meurt ici, référence pendrait
   }
   ```

Ce que le checker compare n'est pas *l'existence* des deux emprunts, mais le chevauchement de leurs durées de vie. La durée d'un emprunt se termine à sa **dernière utilisation**, pas à la fin du bloc :

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm9b-fig" viewBox="0 0 800 316" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Deux chronologies de durées de vie d'emprunts : dans l'ordre rejeté l'emprunt partagé est encore vivant quand l'emprunt mutable commence, dans l'ordre accepté l'emprunt partagé se termine à sa dernière utilisation avant que le mutable commence">
<style>
.mm9b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .mm9b-fig,[data-theme="dark"] .mm9b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.mm9b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm9b-fig .bar{fill:var(--bg);stroke:var(--ln);stroke-width:1.5}
.mm9b-fig .acbar{fill:var(--bg);stroke:var(--ac);stroke-width:2}
.mm9b-fig .zone{fill:none;stroke:var(--ac);stroke-width:2;stroke-dasharray:5 4}
.mm9b-fig .title{font:700 13px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm9b-fig .body{font:600 12px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm9b-fig .cap{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
.mm9b-fig .ac{fill:var(--ac)}
.mm9b-fig path{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="mm9b-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--mut);stroke:none"/></marker>
</defs>
<!-- rejected timeline -->
<text x="30" y="26" class="title">Rejeté : l'emprunt partagé est encore vivant plus loin</text>
<text x="286" y="46" text-anchor="middle" class="cap">1. let r1 = &amp;data;</text>
<text x="480" y="46" text-anchor="middle" class="cap">2. let r2 = &amp;mut data;</text>
<text x="673" y="46" text-anchor="middle" class="cap">3. println!("{}", r1);</text>
<text x="30" y="74" class="body">&amp;data</text>
<rect x="200" y="58" width="500" height="24" rx="6" class="bar"/>
<text x="450" y="75" text-anchor="middle" class="cap">vivant jusqu'à son dernier usage ligne 3</text>
<text x="30" y="106" class="body">&amp;mut data</text>
<rect x="400" y="90" width="360" height="24" rx="6" class="bar"/>
<text x="580" y="107" text-anchor="middle" class="cap">vivant à partir de la ligne 2</text>
<rect x="400" y="52" width="300" height="66" rx="8" class="zone"/>
<text x="550" y="136" text-anchor="middle" class="cap ac">les deux vivants en même temps, rustc refuse</text>
<!-- accepted timeline -->
<text x="30" y="176" class="title">Accepté : les mêmes deux emprunts, réordonnés</text>
<text x="286" y="196" text-anchor="middle" class="cap">1. let r1 = &amp;data;</text>
<text x="480" y="196" text-anchor="middle" class="cap">2. println!("{}", r1);</text>
<text x="673" y="196" text-anchor="middle" class="cap">3. let r2 = &amp;mut data;</text>
<text x="30" y="224" class="body">&amp;data</text>
<rect x="200" y="208" width="290" height="24" rx="6" class="bar"/>
<text x="345" y="225" text-anchor="middle" class="cap">la durée se clôt au dernier usage</text>
<text x="30" y="256" class="body">&amp;mut data</text>
<rect x="560" y="240" width="200" height="24" rx="6" class="acbar"/>
<text x="660" y="257" text-anchor="middle" class="cap ac">exclusif maintenant</text>
<text x="400" y="284" text-anchor="middle" class="cap">Aucun instant n'a les deux durées vivantes : les mêmes lignes compilent désormais.</text>
<!-- time axis -->
<text x="170" y="304" text-anchor="end" class="cap">temps</text>
<path d="M200,300 L770,300" style="stroke:var(--mut)" marker-end="url(#mm9b-arrow)"/>
</svg>
</div>

## Pourquoi ces règles Comptent

- **Prévient les Data Races** : En interdisant l'accès mutable concurrent, Rust assure la thread safety par défaut.
- **Assure Memory Safety** : Pas de dangling pointers ou invalidation d'iterator, car le borrow checker applique les références valides.

## Les deux règles
**Emprunts immutables (`&T`)** :
- Plusieurs autorisés, mais pas de mutation.

**Emprunts mutables (`&mut T`)** :
- Un seul autorisé, accès exclusif.

**Violations attrapées au moment de la compilation** : Pas d'overhead runtime.

**Impact Réel** : Ces règles permettent la concurrence sans peur, comme vu dans les crates comme `Rayon` pour l'itération parallèle.

Écris une fonction qui prend `&mut T` et appelle-la deux fois sur la même valeur. Ça compile —
mais seulement parce que le premier emprunt se termine à la fin de l'appel. Garde cet emprunt
dans une variable qui traverse les deux appels et tu verras la vraie erreur.
