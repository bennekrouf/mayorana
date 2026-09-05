---
id: vec-drain-vs-truncate-clear
title: 'Vec::drain() vs Vec::truncate() ou Vec::clear() ?'
slug: vec-drain-vs-truncate-clear
locale: fr
author: mayo
excerpt: >-
  Comprendre le fonctionnement de Vec::drain() et le comparer avec
  Vec::truncate() et Vec::clear() pour différents scénarios de suppression
  d'éléments
tags:
  - rust
  - drain
  - vec
  - truncate
  - clear
  - collections
date: '2025-10-29'
---

# Comment fonctionne Vec::drain(), et quand est-il utile comparé à Vec::truncate() ou Vec::clear() ?

## Qu'est-ce que Vec::drain() ?

`drain()` supprime une plage d'éléments d'un Vec tout en cédant leur ownership via un itérateur. Contrairement à `truncate()` ou `clear()`, il vous permet de traiter les éléments supprimés avant qu'ils ne soient libérés.

<div class="svg-container" style="margin:2rem 0;">
<svg class="ci7-fig" viewBox="0 0 800 260" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Un Vec peut être réduit avec drain, qui cède les éléments supprimés via un itérateur, ou avec truncate/clear, qui les libèrent sans céder l'ownership">
<!-- style -->
<style>
.ci7-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .ci7-fig,[data-theme="dark"] .ci7-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.ci7-fig .bg{fill:var(--bg)}
.ci7-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.ci7-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.ci7-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.ci7-fig .title{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.ci7-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif}
.ci7-fig .ac{fill:var(--ac)}
.ci7-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="ci7-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ln)"/></marker>
</defs>
<!-- bg -->
<rect class="bg" x="0" y="0" width="800" height="260" rx="8"/>
<!-- title -->
<text x="400" y="26" text-anchor="middle" class="title">vec!['a','b','c','d'] — trois façons de supprimer des éléments</text>
<!-- source box -->
<rect class="box" x="300" y="42" width="200" height="36" rx="6"/>
<text x="400" y="65" text-anchor="middle" class="tx">['a','b','c','d']</text>
<!-- Y merge then split to 3 -->
<path class="ln" d="M400 78V98"/>
<path class="ln" d="M140 98H660"/>
<path class="ln" d="M140 98V118" marker-end="url(#ci7-arrow-fr)"/>
<path class="ln" d="M400 98V118" marker-end="url(#ci7-arrow-fr)"/>
<path class="ln" d="M660 98V118" marker-end="url(#ci7-arrow-fr)"/>
<!-- method boxes -->
<rect class="acbox" x="60" y="118" width="160" height="36" rx="6"/>
<text x="140" y="141" text-anchor="middle" class="tx ac">drain(1..3)</text>
<rect class="box" x="320" y="118" width="160" height="36" rx="6"/>
<text x="400" y="141" text-anchor="middle" class="tx">truncate(2)</text>
<rect class="box" x="580" y="118" width="160" height="36" rx="6"/>
<text x="660" y="141" text-anchor="middle" class="tx">clear()</text>
<!-- arrows to outputs -->
<path class="ln" d="M140 154V178" marker-end="url(#ci7-arrow-fr)"/>
<path class="ln" d="M400 154V178" marker-end="url(#ci7-arrow-fr)"/>
<path class="ln" d="M660 154V178" marker-end="url(#ci7-arrow-fr)"/>
<!-- output boxes -->
<rect class="box" x="60" y="178" width="160" height="34" rx="6"/>
<text x="140" y="199" text-anchor="middle" class="tx">['a','d']</text>
<rect class="box" x="320" y="178" width="160" height="34" rx="6"/>
<text x="400" y="199" text-anchor="middle" class="tx">['a','b']</text>
<rect class="box" x="580" y="178" width="160" height="34" rx="6"/>
<text x="660" y="199" text-anchor="middle" class="tx">[]</text>
<!-- captions -->
<text x="140" y="230" text-anchor="middle" class="mut ac">cède 'b','c' via itérateur</text>
<text x="400" y="230" text-anchor="middle" class="mut">libère la fin, sans itérateur</text>
<text x="660" y="230" text-anchor="middle" class="mut">libère tout, sans itérateur</text>
<text x="400" y="250" text-anchor="middle" class="mut">Les trois préservent la capacité du Vec — seul drain() permet d'utiliser les valeurs supprimées</text>
</svg>
</div>

### Signature
```rust
pub fn drain<R>(&mut self, range: R) -> Drain<'_, T>
where
    R: RangeBounds<usize>,
```

## Caractéristiques principales

| Méthode | Supprime les éléments | Cède l'ownership | Préserve la capacité | Complexité temporelle |
|---------|----------------------|------------------|---------------------|----------------------|
| `drain(..)` | Oui | ✅ Oui (via itérateur) | ✅ Oui | O(n) |
| `truncate()` | Oui (à partir d'un index) | ❌ Non | ✅ Oui | O(1) |
| `clear()` | Tous | ❌ Non | ✅ Oui | O(1) |

## Quand utiliser chaque méthode

### 1. Vec::drain()

**Cas d'usage** : Traiter les éléments supprimés (par exemple, filtrer, transformer ou supprimer par lots).

**Exemple** :
```rust
let mut vec = vec!['a', 'b', 'c', 'd'];
for ch in vec.drain(1..3) {  // Supprime 'b' et 'c'
    println!("Supprimé : {}", ch);  // Affiche 'b', puis 'c'
}
assert_eq!(vec, ['a', 'd']);  // Garde les éléments restants
```

**Performance** : Évite les allocations supplémentaires si on réutilise l'itérateur.

### 2. Vec::truncate()

**Cas d'usage** : Supprimer rapidement des éléments depuis la fin sans les traiter.

**Exemple** :
```rust
let mut vec = vec![1, 2, 3, 4];
vec.truncate(2);  // Libère 3 et 4 (pas d'itérateur)
assert_eq!(vec, [1, 2]);
```

### 3. Vec::clear()

**Cas d'usage** : Supprimer tous les éléments (plus rapide que `drain(..)` si vous n'en avez pas besoin).

**Exemple** :
```rust
let mut vec = vec![1, 2, 3];
vec.clear();  // Libère tous les éléments
assert!(vec.is_empty());
```

## Comportement mémoire

- Les trois méthodes conservent la capacité du Vec (pas de réallocation si des éléments sont rajoutés).
- `drain()` est paresseux : les éléments ne sont libérés que lorsque l'itérateur est consommé.

Cette paresse signifie que le travail intéressant s'étale sur la durée de vie de la garde `Drain`, et non dans l'appel à `drain()` :

<div class="svg-container" style="margin:2rem 0;">
<svg class="ci7b-fig" viewBox="0 0 800 220" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Chronologie de la garde Drain : l'appel verrouille le Vec, l'itérateur cède les éléments possédés, la destruction de la garde libère ce qui reste, puis la queue est remise en place">
<!-- style -->
<style>
.ci7b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .ci7b-fig,[data-theme="dark"] .ci7b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.ci7b-fig .bg{fill:var(--bg)}
.ci7b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.ci7b-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.ci7b-fig .dot{fill:var(--box);stroke:var(--ln);stroke-width:2}
.ci7b-fig .acdot{fill:var(--ac);stroke:var(--ac);stroke-width:2}
.ci7b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.ci7b-fig .title{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.ci7b-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif}
.ci7b-fig .ac{fill:var(--ac)}
.ci7b-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="ci7b-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ln)"/></marker>
</defs>
<!-- bg -->
<rect class="bg" x="0" y="0" width="800" height="220" rx="8"/>
<!-- titre -->
<text x="400" y="26" text-anchor="middle" class="title">Durée de vie de la garde Drain issue de vec.drain(1..3)</text>
<!-- chronologie -->
<path class="ln" d="M40 62H770" marker-end="url(#ci7b-arrow)"/>
<circle class="dot" cx="105" cy="62" r="6"/>
<circle class="dot" cx="300" cy="62" r="6"/>
<circle class="acdot" cx="495" cy="62" r="6"/>
<circle class="dot" cx="690" cy="62" r="6"/>
<!-- étape 1 -->
<path class="ln" d="M105 68V86"/>
<rect class="box" x="15" y="86" width="180" height="66" rx="6"/>
<text x="105" y="108" text-anchor="middle" class="tx" font-size="11">1 · appel de drain(1..3)</text>
<text x="105" y="126" text-anchor="middle" class="mut">len passe à 1 aussitôt,</text>
<text x="105" y="142" text-anchor="middle" class="mut">&amp;mut vec pris par la garde</text>
<!-- étape 2 -->
<path class="ln" d="M300 68V86"/>
<rect class="box" x="210" y="86" width="180" height="66" rx="6"/>
<text x="300" y="108" text-anchor="middle" class="tx" font-size="11">2 · next() cède 'b', 'c'</text>
<text x="300" y="126" text-anchor="middle" class="mut">la propriété vous revient,</text>
<text x="300" y="142" text-anchor="middle" class="mut">un élément à la fois</text>
<!-- étape 3 -->
<path class="ln" d="M495 68V86"/>
<rect class="acbox" x="405" y="86" width="180" height="66" rx="6"/>
<text x="495" y="108" text-anchor="middle" class="tx ac" font-size="11">3 · garde détruite</text>
<text x="495" y="126" text-anchor="middle" class="mut">tout ce qui n'a pas été cédé</text>
<text x="495" y="142" text-anchor="middle" class="mut">est libéré ici même</text>
<!-- étape 4 -->
<path class="ln" d="M690 68V86"/>
<rect class="box" x="600" y="86" width="180" height="66" rx="6"/>
<text x="690" y="108" text-anchor="middle" class="tx" font-size="11">4 · queue restaurée</text>
<text x="690" y="126" text-anchor="middle" class="mut">'d' décalé, vec devient</text>
<text x="690" y="142" text-anchor="middle" class="mut">['a','d'], capacité gardée</text>
<!-- pied -->
<text x="400" y="184" text-anchor="middle" class="mut">Les étapes 3 et 4 viennent de l'impl Drop de Drain : la suppression a lieu même sans aucun appel à next().</text>
<text x="400" y="204" text-anchor="middle" class="mut">Tant que la garde vit, vec est emprunté mutablement et intouchable.</text>
</svg>
</div>

## Utilisation avancée : Réutiliser le stockage

`drain()` est idéal pour remplacer efficacement un sous-ensemble d'éléments :

```rust
let mut vec = vec!["old", "old", "new", "old"];
vec.drain(0..2).for_each(drop);  // Supprime les deux premiers
vec.insert(0, "fresh");
assert_eq!(vec, ["fresh", "new", "old"]);
```

## Points clés à retenir

- **drain()** : À utiliser quand vous devez traiter les éléments supprimés ou supprimer par lots.
- **truncate()/clear()** : À utiliser pour une suppression en masse rapide sans traitement.
- **Tous préservent la capacité** : Pas de surcoût de réallocation pour les opérations futures.

## Exemple concret

Dans un moteur de jeu, `drain()` pourrait efficacement supprimer les entités expirées tout en permettant une logique de nettoyage (par exemple, sauvegarder l'état).

Un détail qui surprend : libérer un `Drain` sans le consommer supprime quand même les éléments.
La suppression vit dans le `Drop` de `Drain`, pas dans l'itération.
