---
id: efficient-duplicate-removal-vec
title: 'Comment supprimer efficacement les doublons d''un Vec<T> où T: Eq + Hash ?'
slug: efficient-duplicate-removal-vec
locale: fr
author: mayo
excerpt: >-
  Approches efficaces pour supprimer les doublons d'un Vec<T> où T: Eq + Hash,
  comparant les méthodes basées sur HashSet et le tri avec analyse de
  performance
tags:
  - rust
  - collections
date: '2025-10-28'
---

# Comment supprimer efficacement les doublons d'un Vec<T> où T: Eq + Hash ?

## Approches efficaces

Lorsque T implémente Eq + Hash (pour les vérifications d'égalité et le hachage), les méthodes optimales sont :

<div class="svg-container" style="margin:2rem 0;">
<svg class="ci5-fig" viewBox="0 0 800 260" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Comparaison côte à côte de l'approche HashSet, qui préserve l'ordre, et de sort+dedup, plus rapide mais qui change l'ordre">
<!-- style -->
<style>
.ci5-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .ci5-fig,[data-theme="dark"] .ci5-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.ci5-fig .bg{fill:var(--bg)}
.ci5-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.ci5-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.ci5-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.ci5-fig .title{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.ci5-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif}
.ci5-fig .ac{fill:var(--ac)}
.ci5-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="ci5-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ln)"/></marker>
</defs>
<!-- bg -->
<rect class="bg" x="0" y="0" width="800" height="260" rx="8"/>
<!-- title -->
<text x="400" y="26" text-anchor="middle" class="title">Déduplication de Vec&lt;1,2,2,3,3,3&gt;</text>
<!-- input box -->
<rect class="box" x="300" y="40" width="200" height="34" rx="6"/>
<text x="400" y="61" text-anchor="middle" class="tx">[1, 2, 2, 3, 3, 3]</text>
<!-- split -->
<path class="ln" d="M400 74V94"/>
<path class="ln" d="M220 94H580"/>
<path class="ln" d="M220 94V114" marker-end="url(#ci5-arrow-fr)"/>
<path class="ln" d="M580 94V114" marker-end="url(#ci5-arrow-fr)"/>
<!-- left column: HashSet -->
<rect class="acbox" x="120" y="114" width="200" height="36" rx="6"/>
<text x="220" y="137" text-anchor="middle" class="tx ac">HashSet retain</text>
<path class="ln" d="M220 150V174" marker-end="url(#ci5-arrow-fr)"/>
<rect class="box" x="120" y="174" width="200" height="34" rx="6"/>
<text x="220" y="195" text-anchor="middle" class="tx">[1, 2, 3]</text>
<text x="220" y="226" text-anchor="middle" class="mut" font-weight="700">ordre préservé</text>
<text x="220" y="244" text-anchor="middle" class="mut">O(n) temps · O(n) espace</text>
<!-- right column: sort+dedup -->
<rect class="box" x="480" y="114" width="200" height="36" rx="6"/>
<text x="580" y="137" text-anchor="middle" class="tx">sort() + dedup()</text>
<path class="ln" d="M580 150V174" marker-end="url(#ci5-arrow-fr)"/>
<rect class="box" x="480" y="174" width="200" height="34" rx="6"/>
<text x="580" y="195" text-anchor="middle" class="tx">[1, 2, 3]</text>
<text x="580" y="226" text-anchor="middle" class="mut">ordre modifié</text>
<text x="580" y="244" text-anchor="middle" class="mut">O(n log n) temps · O(1) espace</text>
</svg>
</div>

## 1. Utilisation de HashSet (préserve l'ordre)

### Étapes :
1. Parcourir le Vec.
2. Suivre les éléments déjà vus avec un HashSet.
3. Collecter uniquement les éléments non vus.

### Code :
```rust
use std::collections::HashSet;

fn dedup_ordered<T: Eq + std::hash::Hash + Clone>(vec: &mut Vec<T>) {
    let mut seen = HashSet::new();
    vec.retain(|x| seen.insert(x.clone()));
}
```

### Exemple :
```rust
let mut vec = vec![1, 2, 2, 3, 3, 3];
dedup_ordered(&mut vec);
assert_eq!(vec, [1, 2, 3]); // Ordre préservé
```

### Performance :
- **Temps** : O(n) (cas moyen, en supposant une bonne distribution de hachage).
- **Espace** : O(n) (pour le HashSet).

## 2. Tri + Dedup (détruit l'ordre)

### Étapes :
1. Trier le Vec (regroupe les doublons).
2. Supprimer les doublons consécutifs avec dedup().

### Code :
```rust
fn dedup_unordered<T: Ord>(vec: &mut Vec<T>) {
    vec.sort();      // O(n log n)
    vec.dedup();     // O(n)
}
```

### Exemple :
```rust
let mut vec = vec![3, 2, 2, 1, 3];
dedup_unordered(&mut vec);
assert_eq!(vec, [1, 2, 3]); // Ordre modifié
```

### Performance :
- **Temps** : O(n log n) (dominé par le tri).
- **Espace** : O(1) (en place, pas d'allocations supplémentaires).

## Comparaison

| Méthode | Complexité temporelle | Complexité spatiale | Préserve l'ordre ? | Cas d'usage |
|--------|-----------------|------------------|------------------|----------|
| HashSet | O(n) | O(n) | ✅ Oui | L'ordre est important, tri non autorisé. |
| Tri + Dedup | O(n log n) | O(1) | ❌ Non | L'ordre est sans importance, mémoire limitée. |

## Points clés

✅ **Utilisez HashSet si** :
- L'ordre doit être préservé.
- Vous pouvez tolérer un espace O(n).

✅ **Utilisez Tri + Dedup si** :
- L'ordre n'a pas d'importance.
- La mémoire est limitée (ex : systèmes embarqués).

## Alternatives :
- Pour les environnements no_std, utilisez un BTreeSet (plus lent mais évite le hachage).
- Utilisez itertools::unique pour la déduplication basée sur les iterators.

**Essayez ceci** : Que se passe-t-il si T est Clone mais pas Hash ?

**Réponse** : Utilisez Vec::dedup_by avec une vérification d'égalité personnalisée (sans hachage).
