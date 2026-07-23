---
id: vec-push-vs-with-capacity-performance-duplicate
title: >-
  Quel est l'impact sur les performances de l'utilisation de Vec::push() dans
  une boucle vs. la pré-allocation avec Vec::with_capacity() ?
slug: vec-push-vs-with-capacity-performance-duplicate
locale: fr
author: mayo
excerpt: >-
  Analyse des différences de performance entre Vec::push() dans des boucles et
  la pré-allocation avec Vec::with_capacity(), couvrant les coûts de
  réallocation mémoire et les stratégies d'optimisation
tags:
  - rust
  - collections
date: '2025-10-27'
---

# Quel est l'impact sur les performances de l'utilisation de Vec::push() dans une boucle vs. la pré-allocation avec Vec::with_capacity() ?

<div class="svg-container" style="margin:2rem 0;">
<svg class="ci4-fig" viewBox="0 0 800 230" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Vec::push() dans une boucle libère et réalloue des blocs mémoire de manière répétée, fragmentant le tas, tandis que with_capacity() alloue un seul bloc contigu">
<!-- style -->
<style>
.ci4-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .ci4-fig,[data-theme="dark"] .ci4-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.ci4-fig .bg{fill:var(--bg)}
.ci4-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.ci4-fig .ghost{fill:none;stroke:var(--ln);stroke-width:1.5;stroke-dasharray:3 3}
.ci4-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.ci4-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.ci4-fig .title{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.ci4-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif}
.ci4-fig .ac{fill:var(--ac)}
.ci4-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.ci4-fig .acln{stroke:var(--ac);stroke-width:2;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="ci4-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ln)"/></marker>
<marker id="ci4-arrowac-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ac)"/></marker>
</defs>
<!-- bg -->
<rect class="bg" x="0" y="0" width="800" height="230" rx="8"/>
<!-- title -->
<text x="400" y="26" text-anchor="middle" class="title">Croissance : push() en boucle vs with_capacity()</text>
<!-- row1: freed ghost blocks -->
<text x="20" y="65" class="tx">boucle push()</text>
<rect class="ghost" x="110" y="48" width="30" height="24" rx="4"/>
<text x="125" y="64" text-anchor="middle" class="mut" font-size="9">libéré</text>
<rect class="ghost" x="170" y="48" width="60" height="24" rx="4"/>
<text x="200" y="64" text-anchor="middle" class="mut" font-size="9">libéré</text>
<rect class="box" x="260" y="42" width="120" height="36" rx="4"/>
<text x="320" y="65" text-anchor="middle" class="tx">bloc contigu</text>
<path class="ln" d="M140 60H170" marker-end="url(#ci4-arrow-fr)"/>
<path class="ln" d="M230 60H260" marker-end="url(#ci4-arrow-fr)"/>
<text x="500" y="65" class="mut">allocations éparpillées → fragmentation possible</text>
<!-- row2: single contiguous block -->
<text x="20" y="140" class="tx">with_capacity(n)</text>
<rect class="acbox" x="110" y="120" width="270" height="36" rx="4"/>
<text x="245" y="143" text-anchor="middle" class="tx ac">un seul bloc, dimensionné pour n, dès le départ</text>
<path class="acln" d="M380 138H460" marker-end="url(#ci4-arrowac-fr)"/>
<rect class="box" x="460" y="120" width="130" height="36" rx="4"/>
<text x="525" y="143" text-anchor="middle" class="tx">push × n</text>
<text x="400" y="185" text-anchor="middle" class="mut">boucle push() : O(n log n) amorti avec copies+libérations répétées · with_capacity() : O(n), allocation unique</text>
<text x="400" y="210" text-anchor="middle" class="mut">Dimensionner à l'avance évite le remue-ménage de copie/libération qui fragmente le tas</text>
</svg>
</div>

## Différences clés de performance

| Vec::push() dans une boucle | Vec::with_capacity() + push() |
|-----------------------------|--------------------------------|
| Réalloue la mémoire plusieurs fois (croissance exponentielle). | Alloue une seule fois au début. |
| Complexité temporelle O(n log n) (amortie). | Complexité temporelle O(n). |
| Peut fragmenter la mémoire à cause des allocations répétées. | Bloc mémoire contigu unique. |

## Pourquoi les réallocations sont coûteuses

### Stratégie de croissance
- Un Vec commence avec une capacité de 0 et double sa capacité lorsqu'il est plein (ex: 0 → 4 → 8 → 16...).
- Chaque réallocation implique :
  - L'allocation d'une nouvelle mémoire.
  - La copie de tous les éléments existants.
  - La libération de l'ancienne mémoire.

### Exemple pour 10 éléments
- **push() avec Vec::new()** : 4 réallocations (capacité 0 → 4 → 8 → 16).
- **push() avec with_capacity(10)** : 0 réallocation.

## Comparaison de benchmark

```rust
use std::time::Instant;

fn main() {
    // Test avec 1 million d'éléments
    let n = 1_000_000;
    
    // Méthode 1 : Sans pré-allocation
    let start = Instant::now();
    let mut v1 = Vec::new();
    for i in 0..n {
        v1.push(i);
    }
    println!("Vec::new(): {:?}", start.elapsed());
    
    // Méthode 2 : Pré-allocation
    let start = Instant::now();
    let mut v2 = Vec::with_capacity(n);
    for i in 0..n {
        v2.push(i);
    }
    println!("Vec::with_capacity(): {:?}", start.elapsed());
}
```

### Résultats typiques
```
Vec::new(): 1.8ms  
Vec::with_capacity(): 0.4ms  // 4.5x plus rapide
```

## Quand pré-allouer

- **Taille connue** : Utilisez with_capacity(n) si vous connaissez le nombre exact/maximum d'éléments.
- **Code critique en performance** : Évitez les réallocations dans les boucles critiques.
- **Données volumineuses** : Empêchez le stack overflow pour les collections énormes.

## Quand Vec::new() est acceptable

- **Petites/tailles inconnues** : Pour une utilisation ad-hoc ou des vecteurs de courte durée.
- **Simplicité du code** : Quand la performance n'est pas critique.

## Optimisation avancée : extend()

Si vous avez un iterator, extend() est souvent plus rapide qu'une boucle avec push() :

```rust
let mut v = Vec::with_capacity(n);
v.extend(0..n);  // Optimisé pour les iterators (évite les vérifications de limites)
```

## Points clés à retenir

✅ **Utilisez with_capacity() pour** :
- Les nombres d'éléments prévisibles.
- Les scénarios haute performance.

✅ **Utilisez Vec::new() pour** :
- Les petites/tailles inconnues ou le prototypage.

🚀 **Évitez les réallocations inutiles**—elles dominent le temps d'exécution pour les Vec volumineux.

## Impact dans le monde réel

Dans la crate regex, la pré-allocation est utilisée pour les groupes de capture afin d'éviter les réallocations pendant le pattern matching.

**Essayez ceci** : Que se passe-t-il si vous pré-allouez trop (ex: with_capacity(1000) mais n'utilisez que 10 éléments) ?

**Réponse** : Mémoire gaspillée. Utilisez shrink_to_fit() pour libérer la capacité inutilisée.
