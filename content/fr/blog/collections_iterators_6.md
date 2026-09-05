---
id: box-slice-vs-vec-differences
title: 'Quelle est la différence entre Box<[T]> et Vec<T> ?'
slug: box-slice-vs-vec-differences
locale: fr
author: mayo
excerpt: >-
  Comparaison des différences entre Box<[T]> et Vec<T> concernant la
  mutabilité,  la surcharge mémoire et les implications de performance pour
  différents cas d'usage
tags:
  - rust
  - collections
  - box
  - vec
  - memory
  - performance
date: '2025-10-28'
---

# Quelle est la différence entre Box<[T]> et Vec<T> ?

<div class="svg-container" style="margin:2rem 0;">
<svg class="ci6-fig" viewBox="0 0 800 240" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="La représentation de Vec sur la pile contient ptr, len et capacity, tandis que Box de slice supprime le champ capacity, économisant un usize">
<!-- style -->
<style>
.ci6-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .ci6-fig,[data-theme="dark"] .ci6-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.ci6-fig .bg{fill:var(--bg)}
.ci6-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.ci6-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.ci6-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.ci6-fig .title{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.ci6-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif}
.ci6-fig .ac{fill:var(--ac)}
.ci6-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="ci6-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ln)"/></marker>
</defs>
<!-- bg -->
<rect class="bg" x="0" y="0" width="800" height="240" rx="8"/>
<!-- title -->
<text x="400" y="24" text-anchor="middle" class="title">Disposition mémoire Vec&lt;T&gt; vs Box&lt;[T]&gt;</text>
<!-- Vec row -->
<text x="20" y="60" class="tx">Vec&lt;T&gt;</text>
<rect class="box" x="110" y="42" width="70" height="30" rx="4"/>
<text x="145" y="62" text-anchor="middle" class="tx" font-size="11">ptr</text>
<rect class="box" x="190" y="42" width="70" height="30" rx="4"/>
<text x="225" y="62" text-anchor="middle" class="tx" font-size="11">len</text>
<rect class="acbox" x="270" y="42" width="90" height="30" rx="4"/>
<text x="315" y="62" text-anchor="middle" class="tx ac" font-size="11">capacity</text>
<path class="ln" d="M145 72V96" marker-end="url(#ci6-arrow-fr)"/>
<rect class="box" x="70" y="96" width="330" height="30" rx="4"/>
<text x="235" y="116" text-anchor="middle" class="tx" font-size="11">heap : éléments contigus</text>
<text x="600" y="60" class="mut">3 usizes sur la pile (24 octets en 64 bits)</text>
<!-- Box row -->
<text x="20" y="170" class="tx">Box&lt;[T]&gt;</text>
<rect class="box" x="110" y="152" width="70" height="30" rx="4"/>
<text x="145" y="172" text-anchor="middle" class="tx" font-size="11">ptr</text>
<rect class="box" x="190" y="152" width="70" height="30" rx="4"/>
<text x="225" y="172" text-anchor="middle" class="tx" font-size="11">len</text>
<path class="ln" d="M145 182V206" marker-end="url(#ci6-arrow-fr)"/>
<rect class="box" x="70" y="206" width="190" height="30" rx="4"/>
<text x="165" y="226" text-anchor="middle" class="tx" font-size="11">heap : éléments taille fixe</text>
<text x="600" y="170" class="mut ac">2 usizes sur la pile — pas de champ capacity</text>
</svg>
</div>

## Différences principales

| Caractéristique | Vec<T> | Box<[T]> |
|-----------------|--------|----------|
| Mutabilité de taille | Redimensionnable (push, pop) | Taille fixe (immuable après création) |
| Stockage | Allocation sur le heap + champ capacité | Slice pur sur le heap (pas de métadonnées supplémentaires) |
| Surcharge mémoire | 3 usizes (ptr, len, capacity) | 2 usizes (ptr, len) |
| Coût de conversion | O(1) vers Box<[T]> (shrink-to-fit) | O(n) vers Vec (doit réallouer) |

## Quand utiliser chacun

### Préfère Vec<T> quand :

Tu as besoin de redimensionnement dynamique :

```rust
let mut vec = vec![1, 2, 3];
vec.push(4);  // Fonctionne
```

Tu modifies fréquemment la collection (par exemple, ajout/suppression d'éléments).

### Préfère Box<[T]> quand :

Tu veux une collection de taille fixe et immuable :

```rust
let boxed_slice: Box<[i32]> = vec![1, 2, 3].into_boxed_slice();
// boxed_slice.push(4);  // ERREUR : Pas de méthode `push`
```

L'efficacité mémoire est importante (par exemple, systèmes embarqués) :
- Économise 1 usize (pas de capacité inutilisée).

Interface avec des APIs nécessitant des slices possédés :

```rust
fn process(data: Box<[i32]>) { /* ... */ }
```

## Conversion entre eux

| Direction | Code | Coût |
|-----------|------|------|
| Vec → Box<[T]> | `vec.into_boxed_slice()` | O(1) |
| Box<[T]> → Vec | `Vec::from(boxed_slice)` | O(n) |

<div class="svg-container" style="margin:2rem 0;">
<svg class="ci6b-fig" viewBox="0 0 800 250" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="into_boxed_slice convertit un Vec en tranche boxée en temps constant quand la capacité égale la longueur, tandis que Vec::from recopie les données, et un Vec avec capacité excédentaire doit d'abord être rétréci">
<!-- style -->
<style>
.ci6b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .ci6b-fig,[data-theme="dark"] .ci6b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.ci6b-fig .bg{fill:var(--bg)}
.ci6b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.ci6b-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.ci6b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.ci6b-fig .title{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.ci6b-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif}
.ci6b-fig .ac{fill:var(--ac)}
.ci6b-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="ci6b-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ln)"/></marker>
</defs>
<!-- bg -->
<rect class="bg" x="0" y="0" width="800" height="250" rx="8"/>
<!-- titre -->
<text x="400" y="26" text-anchor="middle" class="title">Coût de l'aller-retour</text>
<!-- libellé haut -->
<text x="400" y="58" text-anchor="middle" class="mut">into_boxed_slice() · O(1) quand capacité == len</text>
<!-- boîte gauche : Vec -->
<rect class="box" x="70" y="70" width="230" height="52" rx="6"/>
<text x="185" y="92" text-anchor="middle" class="tx">Vec&lt;i32&gt;</text>
<text x="185" y="111" text-anchor="middle" class="mut">len 3 · cap 3</text>
<!-- boîte droite : tranche boxée -->
<rect class="acbox" x="500" y="70" width="230" height="52" rx="6"/>
<text x="615" y="92" text-anchor="middle" class="tx ac">Box&lt;[i32]&gt;</text>
<text x="615" y="111" text-anchor="middle" class="mut">len 3 · taille exacte</text>
<!-- flèche aller -->
<path class="ln" d="M300 86H500" marker-end="url(#ci6b-arrow)"/>
<!-- flèche retour -->
<path class="ln" d="M500 106H300" marker-end="url(#ci6b-arrow)"/>
<!-- libellé bas -->
<text x="400" y="146" text-anchor="middle" class="mut">Vec::from(boxed) · O(n), alloue et recopie chaque élément</text>
<!-- mise en garde -->
<rect class="acbox" x="150" y="166" width="500" height="48" rx="6"/>
<text x="400" y="187" text-anchor="middle" class="tx">Si cap &gt; len, le O(1) ne tient plus</text>
<text x="400" y="205" text-anchor="middle" class="mut">into_boxed_slice() doit d'abord rétrécir : allouer la taille exacte, copier, libérer l'ancien bloc</text>
<!-- pied -->
<text x="400" y="238" text-anchor="middle" class="mut">Convertis une seule fois, quand les modifications sont finies — l'aller-retour coûte une copie dans chaque sens.</text>
</svg>
</div>

### Exemple :

```rust
let vec = vec![1, 2, 3];
let boxed: Box<[i32]> = vec.into_boxed_slice();  // Pas de réallocation
let vec_again = Vec::from(boxed);                // Copie les données
```

## Implications de performance

- **Itération** : Identique (les deux sont des tableaux contigus sur le heap).
- **Mémoire** : Box<[T]> évite la surcharge de capacité inutilisée.
- **Flexibilité** : Vec supporte la croissance en place ; Box<[T]> ne le fait pas.

## Cas d'usage réels

- **Vec** : Tampons pour données dynamiques (par exemple, corps de requêtes HTTP).
- **Box<[T]>** :
  - Configurations chargées une fois et jamais modifiées.
  - Stockage de grands jeux de données immuables (par exemple, assets de jeu).

## Points clés
Utilise Vec pour des séquences mutables et redimensionnables.
Utilise Box<[T]> pour du stockage immuable et efficace en mémoire.
Convertis facilement de Vec vers Box<[T]> quand tu as fini de modifier.

C'est sur un `Vec` qui traîne de la capacité libre que la conversion paie vraiment :
`into_boxed_slice()` réalloue à la longueur exacte, et le rab retourne à l'allocateur au lieu
d'être transporté.
