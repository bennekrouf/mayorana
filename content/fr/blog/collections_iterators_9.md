---
id: flatten-vec-iterators-performance
title: Aplatir un Vec<Vec<T>> en Vec<T> avec des itérateurs
locale: fr
slug: flatten-vec-iterators-performance
author: mayo
excerpt: >-
  Comparaison entre l'aplatissement de Vec<Vec<T>> avec des itérateurs et la
  concaténation manuelle, avec analyse des implications sur les performances
tags:
  - rust
  - vec
  - flatten
  - iterators
  - performance
  - collections
date: '2025-10-31'
---

# Comment aplatir un Vec<Vec<T>> en Vec<T> avec des itérateurs ? comparaison des performances avec la concaténation manuelle.

## Aplatissement avec les itérateurs

La manière la plus idiomatique est d'utiliser `.flatten()` ou `.flat_map()` :

<div class="svg-container" style="margin:2rem 0;">
<svg class="ci9-fig" viewBox="0 0 800 220" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Trois vecteurs internes fusionnent via flatten en un seul Vec plat de six éléments">
<!-- style -->
<style>
.ci9-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .ci9-fig,[data-theme="dark"] .ci9-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.ci9-fig .bg{fill:var(--bg)}
.ci9-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.ci9-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.ci9-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.ci9-fig .title{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.ci9-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif}
.ci9-fig .ac{fill:var(--ac)}
.ci9-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="ci9-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ln)"/></marker>
<marker id="ci9-arrowac-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ac)"/></marker>
</defs>
<!-- bg -->
<rect class="bg" x="0" y="0" width="800" height="220" rx="8"/>
<!-- title -->
<text x="400" y="24" text-anchor="middle" class="title">Vec&lt;Vec&lt;T&gt;&gt; → flatten() → Vec&lt;T&gt;</text>
<!-- three inner vecs -->
<rect class="box" x="60" y="46" width="150" height="34" rx="6"/>
<text x="135" y="67" text-anchor="middle" class="tx">[1, 2]</text>
<rect class="box" x="325" y="46" width="150" height="34" rx="6"/>
<text x="400" y="67" text-anchor="middle" class="tx">[3]</text>
<rect class="box" x="590" y="46" width="150" height="34" rx="6"/>
<text x="665" y="67" text-anchor="middle" class="tx">[4, 5, 6]</text>
<!-- merge lines to Y point -->
<path class="ln" d="M135 80V100"/>
<path class="ln" d="M400 80V100"/>
<path class="ln" d="M665 80V100"/>
<path class="ln" d="M135 100H665"/>
<path class="ln" d="M400 100V120" marker-end="url(#ci9-arrow-fr)"/>
<!-- flatten box -->
<rect class="acbox" x="320" y="120" width="160" height="36" rx="6"/>
<text x="400" y="143" text-anchor="middle" class="tx ac">.flatten().collect()</text>
<!-- arrow to result -->
<path class="ln" d="M400 156V178" marker-end="url(#ci9-arrow-fr)"/>
<rect class="box" x="270" y="178" width="260" height="30" rx="6"/>
<text x="400" y="198" text-anchor="middle" class="tx">[1, 2, 3, 4, 5, 6]</text>
</svg>
</div>

```rust
let nested = vec![vec![1, 2], vec![3], vec![4, 5, 6]];

// Méthode 1 : flatten() (pour Vec<Iterables>)
let flat: Vec<_> = nested.iter().flatten().copied().collect();

// Méthode 2 : flat_map() (pour des transformations personnalisées)
let flat: Vec<_> = nested.into_iter().flat_map(|v| v).collect();
```

**Résultat** : `[1, 2, 3, 4, 5, 6]`

## Concaténation manuelle

Pour comparaison, voici comment vous pourriez le faire manuellement :

```rust
let mut flat = Vec::new();
for subvec in nested {
    flat.extend(subvec);  // ou append() si subvec n'est plus nécessaire
}
```

## Comparaison des performances

| Méthode | Complexité temporelle | Complexité spatiale | Allocations | Optimisations |
|--------|-----------------|------------------|-------------|---------------|
| Itérateur (flatten) | O(n) | O(1) itérateur | 1 (résultat) | Peut fusionner les itérateurs |
| Manuel (extend) | O(n) | O(1) espace temporaire | 1 (résultat) | Pré-allocation possible |

## Principales observations

### Avantage de la pré-allocation (Manuel)

Vous pouvez pré-allouer le Vec cible si la taille totale est connue :

```rust
let total_len: usize = nested.iter().map(|v| v.len()).sum();
let mut flat = Vec::with_capacity(total_len);  // Critique pour les grands jeux de données
flat.extend(nested.into_iter().flatten());
```

### Évaluation paresseuse des itérateurs

- `.flatten()` est paresseux, mais `.collect()` doit quand même allouer le résultat.
- Les itérateurs chaînés (ex: `.filter().flatten()`) peuvent être mieux optimisés que les boucles manuelles.

Cette paresse signifie que `flatten()` ne garde vivants que deux objets — l'itérateur externe et l'itérateur interne qu'il est en train de vider — et fait tout son travail dans un seul appel à `next()` :

<div class="svg-container" style="margin:2rem 0;">
<svg class="ci9b-fig" viewBox="0 0 800 320" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Cheminement d'un seul appel next sur flatten : céder un élément de l'itérateur interne courant, ou s'il est épuisé demander la collection suivante à l'itérateur externe, ou terminer quand l'externe est fini">
<!-- style -->
<style>
.ci9b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .ci9b-fig,[data-theme="dark"] .ci9b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.ci9b-fig .bg{fill:var(--bg)}
.ci9b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.ci9b-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.ci9b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.ci9b-fig .title{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.ci9b-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif}
.ci9b-fig .ac{fill:var(--ac)}
.ci9b-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="ci9b-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ln)"/></marker>
</defs>
<!-- bg -->
<rect class="bg" x="0" y="0" width="800" height="320" rx="8"/>
<!-- titre -->
<text x="400" y="26" text-anchor="middle" class="title">Ce que fait un seul .next() sur .flatten()</text>
<!-- consommateur -->
<rect class="box" x="300" y="44" width="200" height="34" rx="6"/>
<text x="400" y="66" text-anchor="middle" class="tx">collect() demande un élément</text>
<path class="ln" d="M400 78V100" marker-end="url(#ci9b-arrow)"/>
<!-- itérateur interne courant -->
<rect class="acbox" x="290" y="100" width="220" height="36" rx="6"/>
<text x="400" y="123" text-anchor="middle" class="tx ac">itérateur interne courant</text>
<!-- branche : élément disponible -->
<path class="ln" d="M510 118H560" marker-end="url(#ci9b-arrow)"/>
<rect class="box" x="560" y="100" width="210" height="36" rx="6"/>
<text x="665" y="123" text-anchor="middle" class="tx">un élément → on le cède</text>
<!-- branche : épuisé -->
<path class="ln" d="M400 136V170" marker-end="url(#ci9b-arrow)"/>
<rect class="box" x="300" y="170" width="200" height="36" rx="6"/>
<text x="400" y="193" text-anchor="middle" class="tx">interne épuisé</text>
<path class="ln" d="M400 206V240" marker-end="url(#ci9b-arrow)"/>
<rect class="box" x="300" y="240" width="200" height="36" rx="6"/>
<text x="400" y="263" text-anchor="middle" class="tx">outer.next()</text>
<!-- branche : terminé -->
<path class="ln" d="M500 258H560" marker-end="url(#ci9b-arrow)"/>
<rect class="box" x="560" y="240" width="210" height="36" rx="6"/>
<text x="665" y="263" text-anchor="middle" class="tx">None → flatten terminé</text>
<!-- boucle de retour -->
<path class="ln" d="M300 258H200V118H290" marker-end="url(#ci9b-arrow)"/>
<text x="190" y="190" text-anchor="end" class="mut">Some(vec_interne)</text>
<text x="190" y="206" text-anchor="end" class="mut">devient le courant</text>
<!-- pied -->
<text x="400" y="302" text-anchor="middle" class="mut">Aucun Vec intermédiaire n'est créé pour la couche imbriquée — seul collect() alloue, une fois, pour le résultat.</text>
</svg>
</div>

## Exemple de benchmark

```rust
let nested: Vec<Vec<i32>> = (0..1_000).map(|i| vec![i; 100]).collect();

// Approche par itérateur
let start = std::time::Instant::now();
let flat = nested.iter().flatten().copied().collect::<Vec<_>>();
println!("flatten: {:?}", start.elapsed());

// Approche manuelle avec pré-allocation
let start = std::time::Instant::now();
let total_len = nested.iter().map(|v| v.len()).sum();
let mut flat = Vec::with_capacity(total_len);
flat.extend(nested.into_iter().flatten());
println!("manual: {:?}", start.elapsed());
```

**Résultat typique** :
- La méthode manuelle avec pré-allocation est ~10–20% plus rapide pour les grands Vec.
- La version avec itérateur est plus concise et aussi rapide pour les petites données.

## Quand utiliser chaque approche

| Approche | Convient le mieux pour | Pièges |
|----------|----------|----------|
| Itérateur | Lisibilité, chaînage d'opérations | Légèrement plus lent sans pré-allocation |
| Manuel | Performances maximales, grandes données | Verbeux ; nécessite le calcul de la longueur |

## Avancé : Aplatissement sans copie

Si vous avez `Vec<&[T]>` au lieu de `Vec<Vec<T>>`, utilisez `.flatten().copied()` pour éviter le clonage :

```rust
let slices: Vec<&[i32]> = vec![&[1, 2], &[3, 4]];
let flat: Vec<i32> = slices.iter().flatten().copied().collect();
```

## Points clés à retenir

**Utilisez .flatten() pour** :
- Un code propre et idiomatique.
- Le chaînage avec d'autres adaptateurs d'itérateurs (ex: `.filter()`).

**Utilisez extend manuel pour** :
- Les grands jeux de données où la pré-allocation est importante.
- Les cas où vous connaissez déjà la longueur totale.

**Toujours pré-allouer pour la concaténation manuelle de grandes collections !**

Pour aplatir et dédupliquer en une passe, collectez dans un `HashSet` plutôt que dans un `Vec` —
`.flatten().collect::<HashSet<_>>()` — en acceptant de perdre l'ordre.
