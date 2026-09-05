---
id: reborrow-rust-fr
title: "Qu'est-ce que &mut *x (réemprunt) en Rust, et pourquoi gèle-t-il la référence originale ?"
slug: reborrow-rust
locale: fr
date: '2026-03-31'
author: mayo
excerpt: Rust mémoire et borrowing

tags:
  - rust
  - memory
  - borrowing
  - ownership
  - borrow-checker
---

# Qu'est-ce que `&mut *x` (réemprunt) en Rust, et pourquoi gèle-t-il la référence originale ?

En Rust, l'expression `&mut *x` correspond à ce qu'on appelle un **réemprunt** (*reborrow* en anglais). Elle permet de créer une nouvelle référence mutable à partir d'une référence existante sans la consommer — quelque chose que le borrow checker interdirait normalement. Comprendre les réemprunts est essentiel pour écrire du Rust idiomatique lorsqu'on manipule des références mutables à travers des frontières de fonctions.

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm13-fig" viewBox="0 0 800 220" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Chronologie d'un réemprunt : x est actif, puis y réemprunte et x gèle, puis y est abandonné et x redevient actif">
<!-- style -->
<style>
.mm13-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .mm13-fig,[data-theme="dark"] .mm13-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.mm13-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm13-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm13-fig .frozen{fill:var(--box);stroke:var(--ln);stroke-width:1.5;stroke-dasharray:4 3;opacity:0.6}
.mm13-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.mm13-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.mm13-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.mm13-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="mm13arrowfr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
</defs>
<!-- title -->
<text x="400" y="24" text-anchor="middle" class="ti">Durée de vie de &amp;mut *x — la fenêtre de gel</text>
<!-- stage 1 -->
<rect x="40" y="44" width="200" height="46" rx="6" class="boxac"/>
<text x="140" y="72" text-anchor="middle" class="tx">x actif</text>
<path d="M240,67 L268,67" class="ln" marker-end="url(#mm13arrowfr)"/>
<!-- stage 2 -->
<rect x="270" y="44" width="240" height="46" rx="6" class="frozen"/>
<text x="390" y="66" text-anchor="middle" class="tx">x gelé</text>
<text x="390" y="82" text-anchor="middle" class="mut">y = &amp;mut *x est actif</text>
<path d="M510,67 L538,67" class="ln" marker-end="url(#mm13arrowfr)"/>
<!-- stage 3 -->
<rect x="540" y="44" width="220" height="46" rx="6" class="boxac"/>
<text x="650" y="66" text-anchor="middle" class="tx">x actif à nouveau</text>
<text x="650" y="82" text-anchor="middle" class="mut">y abandonné, gel levé</text>
<!-- caption -->
<text x="40" y="130" class="mut">Un seul de x, y est utilisable à la fois — le borrow checker impose la frontière</text>
<rect x="40" y="150" width="720" height="4" rx="2" fill="var(--ln)"/>
<text x="60" y="188" class="mut">t0 : let x = &amp;mut value;</text>
<text x="330" y="188" class="mut">t1 : let y = &amp;mut *x;</text>
<text x="610" y="188" class="mut">t2 : drop(y);</text>
</svg>
</div>

## Décortiquer `&mut *x`

Supposons une variable `x` de type `&mut T`. L'expression `&mut *x` effectue deux opérations en séquence :

- `*x` — déréférence `x` pour accéder à la valeur sous-jacente de type `T`.
- `&mut` — prend une nouvelle référence mutable sur cette valeur.

Le résultat est une nouvelle référence mutable `y` qui pointe vers les **mêmes données** que `x`, mais en tant que référence distincte avec son propre lifetime.

```rust
fn main() {
    let mut valeur = 42;
    let x: &mut i32 = &mut valeur;

    let y: &mut i32 = &mut *x; // réemprunt : y pointe vers les mêmes données que x
    *y += 1;

    // y n'est plus utilisé au-delà de ce point, donc x est à nouveau accessible
    println!("{}", x); // affiche 43
}
```

## Le mécanisme de "gel"

C'est le point crucial : **tant que `y` est en vie, `x` est gelé**.

Le borrow checker impose qu'on ne peut pas avoir deux références mutables actives vers les mêmes données en même temps. Pendant un réemprunt :

- `y` est la référence mutable **active** — vous pouvez l'utiliser pour lire ou modifier la valeur.
- `x` est **gelé** — il existe toujours, mais il ne peut pas être utilisé tant que `y` est en vie.
- Dès que `y` sort du scope, le gel est levé et `x` redevient utilisable.

```rust
fn main() {
    let mut valeur = String::from("bonjour");
    let x = &mut valeur;

    let y = &mut *x; // x est maintenant gelé
    y.push_str(", monde");

    // println!("{}", x); // ERREUR : x est gelé pendant que y est vivant

    drop(y); // y sort du scope, le gel est levé
    println!("{}", x); // OK : affiche "bonjour, monde"
}
```

Ce n'est pas un contournement des règles de sécurité de Rust — c'est ainsi que ces règles fonctionnent. Le borrow checker suit les lifetimes de `x` et de `y` et garantit qu'ils ne sont jamais utilisés simultanément.

## Pourquoi ne pas passer `x` directement ?

Si vous passez `x` directement à une fonction attendant `&mut T`, Rust déplace l'emprunt dans la fonction. Sans réemprunt, vous perdriez l'accès à `x` pendant toute la durée de l'appel.

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm13b-fig" viewBox="0 0 800 260" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Sans réemprunt le premier appel consommerait x et le second échouerait, mais le compilateur insère un réemprunt implicite si bien que l'emprunt revient et le second appel compile">
<!-- style -->
<style>
.mm13b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00;--bad:#e11d48}
:root.dark .mm13b-fig,[data-theme="dark"] .mm13b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.mm13b-fig .panel{fill:none;stroke:var(--ln);stroke-width:1.5}
.mm13b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm13b-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm13b-fig .boxbad{fill:var(--box);stroke:var(--bad);stroke-width:2;stroke-dasharray:4 3}
.mm13b-fig .ti{fill:var(--tx);font:700 13px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.mm13b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.mm13b-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.mm13b-fig .bad{fill:var(--bad);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.mm13b-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.mm13b-fig .lnbad{stroke:var(--bad);stroke-width:1.5;fill:none;stroke-dasharray:4 3}
</style>
<!-- defs -->
<defs>
<marker id="mm13b-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
<marker id="mm13b-arrowbad-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--bad)"/></marker>
</defs>
<!-- left panel: hypothetical move -->
<rect x="20" y="14" width="370" height="212" rx="8" class="panel"/>
<text x="205" y="36" class="ti">Si l'emprunt était déplacé</text>
<rect x="55" y="52" width="300" height="34" rx="5" class="box"/>
<text x="205" y="74" class="tx">let x = &amp;mut value;</text>
<path d="M205,86 L205,100" class="ln" marker-end="url(#mm13b-arrow-fr)"/>
<rect x="55" y="100" width="300" height="34" rx="5" class="box"/>
<text x="205" y="122" class="tx">ajouter_un(x) — x déplacé dans la fn</text>
<path d="M205,134 L205,148" class="lnbad" marker-end="url(#mm13b-arrowbad-fr)"/>
<rect x="55" y="148" width="300" height="34" rx="5" class="boxbad"/>
<text x="205" y="170" class="bad">ajouter_un(x) à nouveau → use after move</text>
<text x="205" y="206" class="mut">un seul appel consommerait la référence définitivement</text>
<!-- right panel: actual reborrow -->
<rect x="410" y="14" width="370" height="212" rx="8" class="panel"/>
<text x="595" y="36" class="ti">Ce que fait réellement le compilateur</text>
<rect x="445" y="52" width="300" height="34" rx="5" class="box"/>
<text x="595" y="74" class="tx">let x = &amp;mut value;</text>
<path d="M595,86 L595,100" class="ln" marker-end="url(#mm13b-arrow-fr)"/>
<rect x="445" y="100" width="300" height="34" rx="5" class="boxac"/>
<text x="595" y="118" class="tx">ajouter_un(&amp;mut *x) — inséré pour vous</text>
<text x="595" y="130" class="mut">l'emprunt ne dure que l'appel</text>
<path d="M595,134 L595,148" class="ln" marker-end="url(#mm13b-arrow-fr)"/>
<rect x="445" y="148" width="300" height="34" rx="5" class="box"/>
<text x="595" y="170" class="tx">ajouter_un(x) à nouveau → OK, affiche 2</text>
<text x="595" y="206" class="mut">le prêt revient quand l'appel se termine</text>
<!-- footer -->
<text x="400" y="248" class="mut">NLL écrit le &amp;mut *x pour vous — la forme explicite n'est que ce sucre syntaxique déplié</text>
</svg>
</div>

```rust
fn ajouter_un(n: &mut i32) {
    *n += 1;
}

fn main() {
    let mut valeur = 0;
    let x = &mut valeur;

    ajouter_un(x);        // Rust réemprunte implicitement x sous la forme &mut *x
    ajouter_un(x);        // x est encore utilisable après le premier appel
    println!("{}", x);    // affiche 2
}
```

Dans Rust moderne avec les **Non-Lexical Lifetimes (NLL)**, le compilateur effectue ce réemprunt implicitement lorsque vous passez un `&mut T` à une fonction. La forme explicite `&mut *x` est ce qui se produit sous le capot.

## Réemprunt implicite vs explicite

| **Forme** | **Quand l'utiliser** | **Exemple** |
|---|---|---|
| Implicite (`x`) | Passer `&mut T` à une fonction | `ajouter_un(x)` → le compilateur insère `&mut *x` |
| Explicite (`&mut *x`) | Scénarios complexes nécessitant un contrôle manuel | Chaînage de méthodes, adaptateurs d'itérateurs |

Dans la plupart du code Rust quotidien, vous n'avez jamais besoin d'écrire `&mut *x` explicitement. Le borrow checker NLL le gère. Cependant, les réemprunts explicites sont parfois nécessaires pour :

- **Chaînage de méthodes** : Lors de l'appel d'une méthode prenant `&mut self` sur un `&mut T`.
- **Patterns d'itérateurs** : Lors d'une itération sur une slice mutable via une référence.
- **Ancien code Rust** : Où l'inférence du borrow checker est moins sophistiquée.
- **Implémentations de traits** : Où le compilateur ne peut pas inférer le réemprunt automatiquement.

## Réemprunt vs déplacement (Move)

Il est important de ne pas confondre un réemprunt avec un déplacement. Un déplacement consommerait la référence originale ; un réemprunt la suspend seulement temporairement.

```rust
fn consommer(x: &mut i32) { *x += 1; }

fn main() {
    let mut v = 0;
    let x = &mut v;

    // Ceci est un réemprunt (x reste utilisable après l'appel) :
    consommer(&mut *x);
    println!("{}", x); // OK

    // Ceci fonctionne aussi grâce au réemprunt implicite :
    consommer(x);
    println!("{}", x); // OK aussi
}
```

## Comparaison avec les pointeurs bruts et `unsafe`

| **Concept** | **Sécurité** | **Fonctionnement** |
|---|---|---|
| `&mut *x` (réemprunt) | Sûr | Le borrow checker impose la règle de référence active unique |
| `*mut T` (pointeur brut) | Unsafe | Aucune garantie du borrow checker ; contrôle d'aliasing manuel |
| `UnsafeCell<T>` | Unsafe intérieur | Désactivation explicite des règles d'emprunt |

Les réemprunts vous offrent la flexibilité de travailler avec plusieurs handles de type référence à différentes étapes d'un calcul, tout en restant entièrement dans le modèle mémoire sûr de Rust.

## Points clés

`&mut *x` crée une nouvelle référence mutable pointant vers les mêmes données que `x`, sans consommer `x`.

Tant que le réemprunt `y` est en vie, `x` est gelé — le borrow checker empêche leur utilisation simultanée.

Dès que `y` sort du scope, le gel est levé et `x` est à nouveau utilisable.

Rust moderne effectue les réemprunts implicitement lors du passage de `&mut T` à des fonctions — vous avez rarement besoin d'écrire `&mut *x` explicitement.

Un réemprunt **n'est pas** un clone des données — aucune mémoire n'est copiée. Seule la référence (un pointeur) est dupliquée, avec son lifetime contraint par le borrow checker.

Réemprunter `x` dans `y` et `z` alors que les deux sont encore vivants est rejeté, et pour la
raison même qui justifie la règle : deux chemins mutables vivants vers une même valeur, c'est
exactement ce que l'exclusivité interdit.
