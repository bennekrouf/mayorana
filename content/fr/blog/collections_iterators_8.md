---
id: vec-retain-vs-filter-collect
title: 'Vec::retain() vs filtrage avec iter().filter().collect() ?'
locale: fr
slug: vec-retain-vs-filter-collect
author: mayo
excerpt: >-
  Comparaison du filtrage en place avec Vec::retain() et
  iter().filter().collect() pour différents scénarios de filtrage et
  implications sur les performances
tags:
  - rust
  - retain
  - vec
  - filter
  - iterators
  - performance
date: '2025-10-30'
---

# Quel est l'objectif de Vec::retain() ? comment se compare-t-il au filtrage avec iter().filter().collect() ?

## Vec::retain() : Filtrage en place

**Objectif** : Supprime les éléments d'un Vec en place selon un prédicat, en préservant l'ordre des éléments conservés.

<div class="svg-container" style="margin:2rem 0;">
<svg class="ci8-fig" viewBox="0 0 800 220" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="retain() réduit le Vec original en place sans allocation supplémentaire, tandis que filter().collect() laisse l'original intact et alloue un nouveau Vec">
<!-- style -->
<style>
.ci8-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .ci8-fig,[data-theme="dark"] .ci8-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.ci8-fig .bg{fill:var(--bg)}
.ci8-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.ci8-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.ci8-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.ci8-fig .title{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.ci8-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif}
.ci8-fig .ac{fill:var(--ac)}
.ci8-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="ci8-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ln)"/></marker>
</defs>
<!-- bg -->
<rect class="bg" x="0" y="0" width="800" height="220" rx="8"/>
<!-- title -->
<text x="400" y="24" text-anchor="middle" class="title">[1, 2, 3, 4].retain(pair) vs .filter(pair).collect()</text>
<!-- row1: retain -->
<text x="20" y="65" class="tx">retain()</text>
<rect class="box" x="110" y="46" width="140" height="34" rx="6"/>
<text x="180" y="67" text-anchor="middle" class="tx">[1,2,3,4]</text>
<path class="acln" d="M250 63H320" marker-end="url(#ci8-arrow-fr)"/>
<rect class="acbox" x="320" y="46" width="140" height="34" rx="6"/>
<text x="390" y="67" text-anchor="middle" class="tx ac">[2, 4] (même Vec)</text>
<text x="620" y="67" text-anchor="middle" class="mut">en place, O(1) espace supp.</text>
<!-- row2: filter().collect() -->
<text x="20" y="150" class="tx">filter().collect()</text>
<rect class="box" x="110" y="131" width="140" height="34" rx="6"/>
<text x="180" y="152" text-anchor="middle" class="tx">[1,2,3,4]</text>
<path class="ln" d="M250 148H320" marker-end="url(#ci8-arrow-fr)"/>
<rect class="box" x="320" y="131" width="140" height="34" rx="6"/>
<text x="390" y="152" text-anchor="middle" class="tx">[1,2,3,4] (inchangé)</text>
<path class="ln" d="M180 165V190" marker-end="url(#ci8-arrow-fr)"/>
<rect class="box" x="110" y="190" width="140" height="26" rx="6"/>
<text x="180" y="207" text-anchor="middle" class="tx" font-size="11">nouveau Vec [2, 4]</text>
<text x="620" y="152" text-anchor="middle" class="mut">nouvelle allocation, O(n) espace supp.</text>
</svg>
</div>

**Signature** :
```rust
pub fn retain<F>(&mut self, f: F)
where
    F: FnMut(&T) -> bool,
```

## Caractéristiques principales

| Aspect | retain() | iter().filter().collect() |
|--------|----------|---------------------------|
| Modifie l'original | ✅ Oui (en place) | ❌ Non (alloue un nouveau Vec) |
| Préserve l'ordre | ✅ Oui | ✅ Oui |
| Efficacité mémoire | ✅ O(1) espace supplémentaire | ❌ O(n) espace supplémentaire |
| Performances | Plus rapide (pas de réallocation) | Plus lent (allocation/copie) |
| Cas d'usage | Filtrage sans allocation | Création d'une nouvelle collection filtrée |

## Exemple : Filtrer les nombres pairs

### Utilisation de retain() (en place)
```rust
let mut vec = vec![1, 2, 3, 4];
vec.retain(|x| x % 2 == 0);  // Garde les pairs
assert_eq!(vec, [2, 4]);      // Le `vec` original est modifié
```

### Utilisation de filter().collect() (nouvelle allocation)
```rust
let vec = vec![1, 2, 3, 4];
let filtered: Vec<_> = vec.iter().filter(|x| *x % 2 == 0).copied().collect();
assert_eq!(filtered, [2, 4]);  // Nouveau `Vec` créé
// `vec` reste inchangé : [1, 2, 3, 4]
```

## Comparaison des performances

### retain() :
- **Temps** : O(n) (passage unique, décale les éléments vers la gauche en place).
- **Espace** : O(1) (pas d'allocations supplémentaires).

Concrètement, `retain()` parcourt le tampon avec deux curseurs : un curseur de lecture qui visite chaque élément, et un curseur d'écriture qui n'avance que lorsqu'un élément est conservé.

<div class="svg-container" style="margin:2rem 0;">
<svg class="ci8b-fig" viewBox="0 0 800 270" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="États successifs du tampon pendant que retain compacte vers la gauche les éléments conservés avec un curseur de lecture et un curseur d'écriture, puis réduit la longueur">
<!-- style -->
<style>
.ci8b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .ci8b-fig,[data-theme="dark"] .ci8b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.ci8b-fig .bg{fill:var(--bg)}
.ci8b-fig .cell{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.ci8b-fig .accell{fill:var(--box);stroke:var(--ac);stroke-width:2}
.ci8b-fig .ghost{fill:none;stroke:var(--ln);stroke-width:1.5;stroke-dasharray:3 3}
.ci8b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.ci8b-fig .title{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.ci8b-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif}
.ci8b-fig .ac{fill:var(--ac)}
</style>
<!-- bg -->
<rect class="bg" x="0" y="0" width="800" height="270" rx="8"/>
<!-- titre -->
<text x="400" y="26" text-anchor="middle" class="title">retain(|x| x % 2 == 0) sur [1, 2, 3, 4] : un passage, deux curseurs</text>
<!-- ligne 1 -->
<text x="20" y="67" class="mut">lecture 0 → 1 impair</text>
<rect class="cell" x="300" y="48" width="52" height="28" rx="4"/>
<text x="326" y="67" text-anchor="middle" class="tx">1</text>
<rect class="cell" x="358" y="48" width="52" height="28" rx="4"/>
<text x="384" y="67" text-anchor="middle" class="tx">2</text>
<rect class="cell" x="416" y="48" width="52" height="28" rx="4"/>
<text x="442" y="67" text-anchor="middle" class="tx">3</text>
<rect class="cell" x="474" y="48" width="52" height="28" rx="4"/>
<text x="500" y="67" text-anchor="middle" class="tx">4</text>
<text x="560" y="67" class="mut">ignoré · écriture reste 0</text>
<!-- ligne 2 -->
<text x="20" y="103" class="mut">lecture 1 → 2 pair</text>
<rect class="accell" x="300" y="84" width="52" height="28" rx="4"/>
<text x="326" y="103" text-anchor="middle" class="tx ac">2</text>
<rect class="cell" x="358" y="84" width="52" height="28" rx="4"/>
<text x="384" y="103" text-anchor="middle" class="tx">2</text>
<rect class="cell" x="416" y="84" width="52" height="28" rx="4"/>
<text x="442" y="103" text-anchor="middle" class="tx">3</text>
<rect class="cell" x="474" y="84" width="52" height="28" rx="4"/>
<text x="500" y="103" text-anchor="middle" class="tx">4</text>
<text x="560" y="103" class="mut ac">placé en case 0 · écriture 1</text>
<!-- ligne 3 -->
<text x="20" y="139" class="mut">lecture 2 → 3 impair</text>
<rect class="cell" x="300" y="120" width="52" height="28" rx="4"/>
<text x="326" y="139" text-anchor="middle" class="tx">2</text>
<rect class="cell" x="358" y="120" width="52" height="28" rx="4"/>
<text x="384" y="139" text-anchor="middle" class="tx">2</text>
<rect class="cell" x="416" y="120" width="52" height="28" rx="4"/>
<text x="442" y="139" text-anchor="middle" class="tx">3</text>
<rect class="cell" x="474" y="120" width="52" height="28" rx="4"/>
<text x="500" y="139" text-anchor="middle" class="tx">4</text>
<text x="560" y="139" class="mut">ignoré · écriture reste 1</text>
<!-- ligne 4 -->
<text x="20" y="175" class="mut">lecture 3 → 4 pair</text>
<rect class="cell" x="300" y="156" width="52" height="28" rx="4"/>
<text x="326" y="175" text-anchor="middle" class="tx">2</text>
<rect class="accell" x="358" y="156" width="52" height="28" rx="4"/>
<text x="384" y="175" text-anchor="middle" class="tx ac">4</text>
<rect class="cell" x="416" y="156" width="52" height="28" rx="4"/>
<text x="442" y="175" text-anchor="middle" class="tx">3</text>
<rect class="cell" x="474" y="156" width="52" height="28" rx="4"/>
<text x="500" y="175" text-anchor="middle" class="tx">4</text>
<text x="560" y="175" class="mut ac">placé en case 1 · écriture 2</text>
<!-- ligne 5 -->
<text x="20" y="211" class="mut">len = écriture</text>
<rect class="cell" x="300" y="192" width="52" height="28" rx="4"/>
<text x="326" y="211" text-anchor="middle" class="tx">2</text>
<rect class="cell" x="358" y="192" width="52" height="28" rx="4"/>
<text x="384" y="211" text-anchor="middle" class="tx">4</text>
<rect class="ghost" x="416" y="192" width="52" height="28" rx="4"/>
<rect class="ghost" x="474" y="192" width="52" height="28" rx="4"/>
<text x="560" y="211" class="mut">len 2, capacité toujours 4</text>
<!-- pied -->
<text x="400" y="248" text-anchor="middle" class="mut">La même allocation du début à la fin : les éléments gardés recouvrent les supprimés, puis len diminue.</text>
</svg>
</div>

### filter().collect() :
- **Temps** : O(n) (mais nécessite une copie vers une nouvelle allocation).
- **Espace** : O(n) (nouveau Vec alloué).

### Suggestion de benchmark :
```rust
let mut big_vec = (0..1_000_000).collect::<Vec<_>>();
// Mesurer `retain`
let start = std::time::Instant::now();
big_vec.retain(|x| x % 2 == 0);
println!("retain: {:?}", start.elapsed());

// Mesurer `filter().collect()`
let big_vec = (0..1_000_000).collect::<Vec<_>>();
let start = std::time::Instant::now();
let filtered = big_vec.iter().filter(|x| *x % 2 == 0).collect::<Vec<_>>();
println!("filter.collect: {:?}", start.elapsed());
```

**Résultat typique** : `retain()` est 2 à 3 fois plus rapide grâce à l'absence d'allocations.

## Quand utiliser chaque méthode

### Préférer retain() quand :
- Vous voulez modifier le Vec en place.
- L'efficacité mémoire est critique (ex : Vec de grande taille).
- L'ordre des éléments doit être préservé.

### Préférer filter().collect() quand :
- Vous avez besoin que le Vec original reste intact.
- Vous enchaînez plusieurs adaptateurs d'itérateur (ex : `.filter().map()`).
- Vous travaillez avec des itérateurs non-Vec (ex : ranges, slices).

## Notes avancées

### retain_mut() :
Rust fournit également `retain_mut()` pour les prédicats qui nécessitent un accès mutable aux éléments :

```rust
let mut vec = vec![1, 2, 3];
vec.retain_mut(|x| {
    *x += 1;           // Modification en place
    *x % 2 == 0        // Garde si pair après incrément
});
assert_eq!(vec, [2, 4]);
```

### Stabilité :
Les deux méthodes préservent l'ordre relatif des éléments conservés (filtrage stable).

## Quand `retain()` l'emporte
**retain()** : Plus rapide, efficace en mémoire et en place. Idéal pour les modifications en masse.
**filter().collect()** : Flexible, non destructif. Idéal pour les pipelines d'itérateurs.

## Cas d'usage réel :
- **retain()** : Nettoyer les sessions expirées dans un pool de sessions serveur.
- **filter().collect()** : Transformer les données de réponse d'API en un sous-ensemble filtré.

Un `retain()` dont le prédicat garde tout coûte un parcours et rien d'autre — aucune suppression,
aucune réallocation, capacité inchangée.
