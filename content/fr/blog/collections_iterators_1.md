---
id: vec-new-vs-with-capacity
title: 'Rust Vec::new() vs. with_capacity() : Quand utiliser chacune'
slug: vec-new-vs-with-capacity
locale: fr
date: '2025-10-24'
author: mayo
excerpt: >-
  Vec::new() alloue à la première insertion, with_capacity(n) alloue une fois pour n
  éléments. Quand la différence compte vraiment.
tags:
  - rust
  - collections
  - iterators
  - performance
  - vec
---

# Rust Vec::new() vs. with_capacity() : Quand utiliser chacune

Comprendre les stratégies d'allocation de Vec est crucial pour écrire du code Rust performant, particulièrement lorsqu'on travaille avec des collections et des itérateurs.

<div class="svg-container" style="margin:2rem 0;">
<svg class="ci1-fig" viewBox="0 0 800 240" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Vec::new() réalloue plusieurs fois en grandissant, tandis que Vec::with_capacity(n) alloue une seule fois au départ">
<!-- style -->
<style>
.ci1-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .ci1-fig,[data-theme="dark"] .ci1-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.ci1-fig .bg{fill:var(--bg)}
.ci1-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.ci1-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.ci1-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.ci1-fig .title{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.ci1-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif}
.ci1-fig .ac{fill:var(--ac)}
.ci1-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.ci1-fig .acln{stroke:var(--ac);stroke-width:2;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="ci1-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ln)"/></marker>
<marker id="ci1-arrowac-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ac)"/></marker>
</defs>
<!-- bg -->
<rect class="bg" x="0" y="0" width="800" height="240" rx="8"/>
<!-- title -->
<text x="400" y="28" text-anchor="middle" class="title">Vec::new() vs Vec::with_capacity(n)</text>
<!-- row1 -->
<text x="20" y="70" class="tx">Vec::new()</text>
<rect class="box" x="110" y="50" width="60" height="34" rx="6"/>
<text x="140" y="71" text-anchor="middle" class="tx">cap 0</text>
<rect class="box" x="240" y="50" width="60" height="34" rx="6"/>
<text x="270" y="71" text-anchor="middle" class="tx">cap 4</text>
<rect class="box" x="370" y="50" width="60" height="34" rx="6"/>
<text x="400" y="71" text-anchor="middle" class="tx">cap 8</text>
<rect class="box" x="500" y="50" width="70" height="34" rx="6"/>
<text x="535" y="71" text-anchor="middle" class="tx">cap 16</text>
<!-- row1 arrows -->
<path class="ln" d="M170 67H240" marker-end="url(#ci1-arrow-fr)"/>
<path class="ln" d="M300 67H370" marker-end="url(#ci1-arrow-fr)"/>
<path class="ln" d="M430 67H500" marker-end="url(#ci1-arrow-fr)"/>
<text x="205" y="60" text-anchor="middle" class="mut">copie</text>
<text x="335" y="60" text-anchor="middle" class="mut">copie</text>
<text x="465" y="60" text-anchor="middle" class="mut">copie</text>
<text x="650" y="71" text-anchor="middle" class="mut">4 réallocations</text>
<!-- row2 -->
<text x="20" y="150" class="tx">with_capacity(16)</text>
<rect class="acbox" x="240" y="130" width="180" height="34" rx="6"/>
<text x="330" y="151" text-anchor="middle" class="tx ac">cap 16 (1 alloc)</text>
<path class="acln" d="M420 147H540" marker-end="url(#ci1-arrowac-fr)"/>
<rect class="box" x="540" y="130" width="140" height="34" rx="6"/>
<text x="610" y="151" text-anchor="middle" class="tx">push × 16</text>
<text x="330" y="185" text-anchor="middle" class="mut">0 réallocation</text>
<!-- caption -->
<text x="400" y="222" text-anchor="middle" class="mut">Connaître la taille finale à l'avance évite les cycles répétés de copie et libération</text>
</svg>
</div>

## Différences principales

| `Vec::new()` | `Vec::with_capacity(n)` |
|--------------|-------------------------|
| Crée un Vec vide sans espace pré-alloué | Crée un Vec vide avec de l'espace pour n éléments |
| La capacité initiale est 0 (alloue au premier push) | La capacité initiale est exactement n (pas d'allocations précoces) |
| Croît dynamiquement (peut réallouer plusieurs fois) | Évite la réallocation jusqu'à ce que len() > n |

## Lequel déclarer
Utilise `Vec::new()` quand :
- Le nombre d'éléments est inconnu ou petit
- Tu veux de la simplicité (ex : vecteurs de courte durée)

```rust
let mut v = Vec::new(); // Bon pour un usage ad hoc
v.push(1);
```

Utilise `Vec::with_capacity(n)` quand :
- Tu connais le nombre exact ou maximum d'éléments à l'avance
- Tu optimises pour la performance (évite les réallocations)

```rust
let mut v = Vec::with_capacity(1000); // Pré-alloue pour 1000 éléments
for i in 0..1000 {
    v.push(i); // Aucune réallocation ne se produit
}
```

## Impact sur les performances

`Vec::new()` peut déclencher plusieurs réallocations lors de sa croissance (ex : commence à 0, puis 4, 8, 16, ...).
`Vec::with_capacity(n)` garantit une seule allocation initiale (si n est correct).

## Exemple de benchmark

```rust
use std::time::Instant;

fn main() {
    let start = Instant::now();
    let mut v1 = Vec::new();
    for i in 0..1_000_000 {
        v1.push(i); // Réalloue ~20 fois
    }
    println!("Vec::new(): {:?}", start.elapsed());

    let start = Instant::now();
    let mut v2 = Vec::with_capacity(1_000_000);
    for i in 0..1_000_000 {
        v2.push(i); // Aucune réallocation
    }
    println!("Vec::with_capacity(): {:?}", start.elapsed());
}
```

Sortie (typique) :
```
Vec::new(): 1.2ms
Vec::with_capacity(): 0.3ms  // 4x plus rapide
```

## Notes avancées

- `shrink_to_fit()` : Réduit la capacité excédentaire (ex : après suppression d'éléments)
- Macro `vec![]` : Utilise with_capacity implicitement pour les littéraux (ex : vec![1, 2, 3])

Pré-allouer est une indication, pas une limite stricte. `len` et `capacity` sont deux nombres indépendants, et dès que `len` dépasserait `capacity`, le doublement habituel reprend :

<div class="svg-container" style="margin:2rem 0;">
<svg class="ci1-fig2" viewBox="0 0 800 225" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Chronologie de len par rapport à capacity pour un Vec créé avec with_capacity(4) : pousser au-delà du quatrième élément double la capacité à 8, et shrink_to_fit la ramène à 5">
<!-- style -->
<style>
.ci1-fig2{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .ci1-fig2,[data-theme="dark"] .ci1-fig2{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.ci1-fig2 .bg{fill:var(--bg)}
.ci1-fig2 .used{fill:var(--ln);stroke:var(--ln);stroke-width:1}
.ci1-fig2 .free{fill:none;stroke:var(--ln);stroke-width:1;stroke-dasharray:3 3}
.ci1-fig2 .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.ci1-fig2 .title{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.ci1-fig2 .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif}
.ci1-fig2 .ac{fill:var(--ac)}
.ci1-fig2 .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.ci1-fig2 .acln{stroke:var(--ac);stroke-width:2;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="ci1b-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ln)"/></marker>
<marker id="ci1b-arrowac-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ac)"/></marker>
</defs>
<!-- bg -->
<rect class="bg" x="0" y="0" width="800" height="225" rx="8"/>
<!-- title -->
<text x="400" y="26" text-anchor="middle" class="title">Vie d'un Vec::with_capacity(4) : len vs capacity</text>
<!-- stage labels -->
<text x="79" y="70" text-anchor="middle" class="tx">len 2 / cap 4</text>
<text x="229" y="70" text-anchor="middle" class="tx">len 4 / cap 4</text>
<text x="419" y="70" text-anchor="middle" class="tx ac">len 5 / cap 8</text>
<text x="619" y="70" text-anchor="middle" class="tx">len 5 / cap 5</text>
<!-- stage 1 slots -->
<rect class="used" x="40" y="88" width="18" height="30" rx="3"/>
<rect class="used" x="60" y="88" width="18" height="30" rx="3"/>
<rect class="free" x="80" y="88" width="18" height="30" rx="3"/>
<rect class="free" x="100" y="88" width="18" height="30" rx="3"/>
<!-- stage 2 slots -->
<rect class="used" x="190" y="88" width="18" height="30" rx="3"/>
<rect class="used" x="210" y="88" width="18" height="30" rx="3"/>
<rect class="used" x="230" y="88" width="18" height="30" rx="3"/>
<rect class="used" x="250" y="88" width="18" height="30" rx="3"/>
<!-- stage 3 slots -->
<rect class="used" x="340" y="88" width="18" height="30" rx="3"/>
<rect class="used" x="360" y="88" width="18" height="30" rx="3"/>
<rect class="used" x="380" y="88" width="18" height="30" rx="3"/>
<rect class="used" x="400" y="88" width="18" height="30" rx="3"/>
<rect class="used" x="420" y="88" width="18" height="30" rx="3"/>
<rect class="free" x="440" y="88" width="18" height="30" rx="3"/>
<rect class="free" x="460" y="88" width="18" height="30" rx="3"/>
<rect class="free" x="480" y="88" width="18" height="30" rx="3"/>
<!-- stage 4 slots -->
<rect class="used" x="570" y="88" width="18" height="30" rx="3"/>
<rect class="used" x="590" y="88" width="18" height="30" rx="3"/>
<rect class="used" x="610" y="88" width="18" height="30" rx="3"/>
<rect class="used" x="630" y="88" width="18" height="30" rx="3"/>
<rect class="used" x="650" y="88" width="18" height="30" rx="3"/>
<!-- arrows -->
<path class="ln" d="M118 103H190" marker-end="url(#ci1b-arrow-fr)"/>
<path class="acln" d="M268 103H340" marker-end="url(#ci1b-arrowac-fr)"/>
<path class="ln" d="M498 103H570" marker-end="url(#ci1b-arrow-fr)"/>
<!-- arrow labels -->
<text x="154" y="136" text-anchor="middle" class="mut">push × 2</text>
<text x="304" y="136" text-anchor="middle" class="mut ac">5e push</text>
<text x="304" y="150" text-anchor="middle" class="mut ac">réalloc + copie</text>
<text x="534" y="136" text-anchor="middle" class="mut">shrink_to_fit()</text>
<!-- slot legend -->
<text x="79" y="136" text-anchor="middle" class="mut">2 libres</text>
<text x="229" y="136" text-anchor="middle" class="mut">0 libre</text>
<text x="419" y="136" text-anchor="middle" class="mut">3 libres</text>
<text x="619" y="136" text-anchor="middle" class="mut">0 libre</text>
<!-- notes -->
<text x="400" y="184" text-anchor="middle" class="mut">Plein = éléments vivants (len) · pointillé = réservé mais inutilisé (capacity − len)</text>
<text x="400" y="206" text-anchor="middle" class="mut">with_capacity(n) ne fait que retarder la croissance ; dépasser n relance le doublement</text>
</svg>
</div>


- Par défaut, utilise `Vec::new()` pour la simplicité.  
- Utilise `with_capacity(n)` quand :
- Tu connais la taille à l'avance
- La performance est critique (ex : boucles critiques)

Pousser au-delà de la capacité réservée n'est pas une erreur : le `Vec` croît comme `Vec::new()`
l'aurait fait depuis le début. Tu gagnes l'allocation unique jusqu'à `n`, et le doublement
habituel ensuite.
