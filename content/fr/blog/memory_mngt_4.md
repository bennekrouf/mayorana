---
id: ownership-safety-rust-fr
title: Comment l'ownership prévient-il les memory leaks et data races ?
slug: ownership-safety-rust-fr
locale: fr
date: '2025-11-26'
author: mayo
excerpt: Rust memory et string
content_focus: rust memory et string
technical_level: Discussion technique expert
tags:
  - rust
  - memory
  - ownership
  - borrowing
  - data-races
---

# Comment l'ownership prévient-il les memory leaks et data races ?

L'ownership est le système central de gestion mémoire de Rust, appliquant des règles strictes au moment de la compilation pour assurer la sécurité sans garbage collector. Il prévient les memory leaks et data races à travers une combinaison de règles d'ownership, move semantics, et borrowing.

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm4-fig" viewBox="0 0 800 240" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Déplacer un String de s1 vers s2 transfère l'ownership des données heap et invalide s1">
<style>
.mm4-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .mm4-fig,[data-theme="dark"] .mm4-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.mm4-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm4-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm4-fig .deadbox{fill:none;stroke:var(--mut);stroke-width:1.5;stroke-dasharray:4 3}
.mm4-fig .title{font:700 14px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm4-fig .body{font:600 12px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm4-fig .cap{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
.mm4-fig .ac{fill:var(--ac)}
.mm4-fig .mut{fill:var(--mut)}
.mm4-fig path{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="mm4-arrow-fr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ac)"/></marker>
</defs>
<!-- s1 box, now invalid -->
<rect x="40" y="40" width="200" height="70" rx="8" class="deadbox"/>
<text x="140" y="66" text-anchor="middle" class="body mut">s1 (moved)</text>
<text x="140" y="84" text-anchor="middle" class="cap">invalide : use after move</text>
<!-- s2 box, valid owner -->
<rect x="330" y="40" width="200" height="70" rx="8" class="acbox"/>
<text x="430" y="66" text-anchor="middle" class="title ac">s2</text>
<text x="430" y="84" text-anchor="middle" class="cap">nouveau propriétaire du String</text>
<!-- heap box -->
<rect x="590" y="40" width="180" height="70" rx="8" class="box"/>
<text x="680" y="66" text-anchor="middle" class="body">"hello"</text>
<text x="680" y="84" text-anchor="middle" class="cap">buffer heap (inchangé)</text>
<!-- arrows -->
<path d="M240,75 L330,75" marker-end="url(#mm4-arrow-fr)"/>
<text x="285" y="65" text-anchor="middle" class="cap">move</text>
<path d="M530,75 L590,75" style="stroke:var(--ac)" marker-end="url(#mm4-arrow-fr)"/>
<!-- scope note -->
<rect x="40" y="150" width="730" height="60" rx="8" class="box"/>
<text x="405" y="175" text-anchor="middle" class="body">take_ownership(s)  →  s droppé en fin de scope de la fonction</text>
<text x="405" y="193" text-anchor="middle" class="cap">un seul propriétaire à la fois : pas de double free, pas de fuite</text>
</svg>
</div>

## Ownership en Rust

- Chaque valeur a un **propriétaire unique** (variable).
- Quand le propriétaire sort du scope, la valeur est **droppée** (trait `Drop` appelé).
- L'ownership peut être **transféré** (moved), rendant la variable originale invalide.

## Règles Clés

### Move Semantics

Assigner une valeur heap-allocated (ex : `String`) à une autre variable transfère l'ownership, invalidant l'originale.

**Exemple** :
```rust
let s1 = String::from("hello");
let s2 = s1; // Ownership moved vers s2
// println!("{}", s1); // Erreur de compilation: value borrowed after move
```

### Copy vs. Move

- Les types avec **taille connue** (`i32`, `bool`) implémentent `Copy` et sont clonés automatiquement.
- Les types heap-allocated (`String`, `Vec`) n'implémentent pas `Copy` et sont moved.

### Appels de Function

Passer une valeur à une fonction la move ou la copie, suivant les mêmes règles.

**Exemple** :
```rust
fn take_ownership(s: String) { /* ... */ }

let s = String::from("hello");
take_ownership(s); // Ownership moved dans la fonction
// println!("{}", s); // Erreur: s est invalide
```

## Comment l'Ownership Prévient les Memory Leaks

- **Cleanup Automatique** : Quand le propriétaire sort du scope, Rust appelle `drop` pour libérer la mémoire (pas de `free()` manuel nécessaire).
- **Pas de Double Frees** : Puisque seul un propriétaire existe, la valeur est droppée exactement une fois.

## Comment l'Ownership Prévient les Data Races

- **Règles de Borrowing** :
  - **Emprunts immutables** (`&T`) : Plusieurs autorisés, mais aucun emprunt mutable ne peut coexister.
  - **Emprunts mutables** (`&mut T`) : Un seul autorisé, et aucun autre emprunt ne peut exister.
- **Application au Compile-Time** : Le compilateur rejette le code qui pourrait mener à des data races.

**Exemple : Prévention de Data Race** :
```rust
let mut data = vec![1, 2, 3];
let r1 = &data; // Borrowing immutable OK
let r2 = &data; // Autre borrow immutable OK
// let r3 = &mut data; // ERREUR: Cannot borrow as mutable while immutable borrows exist
println!("{:?}, {:?}", r1, r2);
```

## Points Clés

✅ **L'ownership assure** :
- Pas de dangling pointers (via lifetimes).
- Pas de memory leaks (via `Drop`).
- Pas de data races (via règles de borrowing).

Le modèle d'ownership de Rust garantit la memory safety et concurrency safety au moment de la compilation, délivrant performance et fiabilité.
