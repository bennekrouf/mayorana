---
id: cow-copy-on-write-rust-fr
title: 'Comment fonctionne Cow<''a, B> (Copy-on-Write) en Rust ? Quand l''utiliser ?'
slug: cow-copy-on-write-rust-fr
locale: fr
date: '2025-11-23'
author: mayo
excerpt: Rust memory et string
tags:
  - rust
  - beginner
  - memory
  - cow
  - string
  - copy-on-write
---

# Comment fonctionne Cow<'a, B> (Copy-on-Write) en Rust ? quand l'utiliserais-tu pour les strings ou autres données ?

`Cow<'a, B>` (Copy-on-Write) est un smart pointer dans le module `std::borrow` de Rust qui fournit une abstraction sans clone sur les données borrowed et owned. Il permet une gestion efficace des données qui peuvent ou non nécessiter une modification, minimisant les allocations tout en maintenant la flexibilité.

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm10-fig" viewBox="0 0 800 240" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Un Cow démarre comme une référence borrowed sans allocation, et se convertit en donnée owned seulement quand une modification est réellement nécessaire">
<style>
.mm10-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .mm10-fig,[data-theme="dark"] .mm10-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.mm10-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm10-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm10-fig .title{font:700 13px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm10-fig .body{font:600 12px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm10-fig .cap{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
.mm10-fig .ac{fill:var(--ac)}
.mm10-fig path{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="mm10-arrow-fr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ln)"/></marker>
<marker id="mm10-arrow-ac-fr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ac)"/></marker>
</defs>
<!-- input box -->
<rect x="30" y="90" width="180" height="60" rx="8" class="box"/>
<text x="120" y="115" text-anchor="middle" class="body">Cow::Borrowed</text>
<text x="120" y="133" text-anchor="middle" class="cap">entrée, zero-cost</text>
<!-- decision box -->
<rect x="300" y="90" width="200" height="60" rx="8" class="box"/>
<text x="400" y="115" text-anchor="middle" class="body">besoin de mutation ?</text>
<text x="400" y="133" text-anchor="middle" class="cap">vérifié au call site</text>
<path d="M210,120 L300,120" marker-end="url(#mm10-arrow-fr)"/>
<!-- no path -->
<rect x="590" y="20" width="190" height="55" rx="8" class="box"/>
<text x="685" y="45" text-anchor="middle" class="body">reste Borrowed</text>
<text x="685" y="61" text-anchor="middle" class="cap">non : zéro allocation</text>
<path d="M500,105 L590,55" marker-end="url(#mm10-arrow-fr)"/>
<!-- yes path -->
<rect x="590" y="155" width="190" height="55" rx="8" class="acbox"/>
<text x="685" y="180" text-anchor="middle" class="body ac">devient Owned</text>
<text x="685" y="196" text-anchor="middle" class="cap">oui : une allocation</text>
<path d="M500,135 L590,182" style="stroke:var(--ac)" marker-end="url(#mm10-arrow-ac-fr)"/>
</svg>
</div>

## Qu'est-ce que Cow ?

`Cow` (abréviation de Copy-on-Write) peut représenter :
- **Des données borrowed** (`&'a B`) : Une référence vers des données existantes, évitant les allocations.
- **Des données owned** (`<B as ToOwned>::Owned`) : Une copie complètement owned, allouée seulement quand la mutation est requise.

**Définition** (depuis `std::borrow`) :
```rust
pub enum Cow<'a, B>
where
    B: 'a + ToOwned + ?Sized,
{
    Borrowed(&'a B),  // Référence immutable (pas d'allocation)
    Owned(<B as ToOwned>::Owned),  // Données owned (allouées quand nécessaire)
}
```

**Comment ça Fonctionne** :
- Initialement enveloppe une référence (`Borrowed`), ce qui est zero-cost.
- Convertit vers des données owned (`Owned`) de façon lazy, seulement quand la modification est nécessaire.

## Exemple avec Cow<str> (Strings)

```rust
use std::borrow::Cow;

fn process(input: &str) -> Cow<str> {
    if input.contains("error") {
        Cow::Owned(input.replace("error", ""))  // Alloue nouvelle String
    } else {
        Cow::Borrowed(input)  // Pas d'allocation
    }
}

fn main() {
    let msg1 = "hello world";  // Pas d'allocation
    let msg2 = "error: foo";   // Va allouer quand traité

    println!("{}", process(msg1)); // "hello world" (borrowed)
    println!("{}", process(msg2)); // ": foo" (owned)
}
```

Les deux appels retournent le même type, mais la valeur retournée contient physiquement des choses différentes :

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm10b-fig" viewBox="0 0 800 326" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Vue mémoire côte à côte des deux appels à process : le Cow emprunté ne contient qu'un pointeur et une longueur visant les octets de l'appelant, tandis que le Cow owned contient un header String pointant vers un buffer heap fraîchement alloué">
<style>
.mm10b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .mm10b-fig,[data-theme="dark"] .mm10b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.mm10b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm10b-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm10b-fig .bytes{fill:var(--bg);stroke:var(--ln);stroke-width:1.5}
.mm10b-fig .title{font:700 13px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm10b-fig .body{font:600 12px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm10b-fig .cap{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
.mm10b-fig .ac{fill:var(--ac)}
.mm10b-fig path{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="mm10b-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ln);stroke:none"/></marker>
<marker id="mm10b-arrowac" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ac);stroke:none"/></marker>
</defs>
<!-- left panel: borrowed -->
<text x="207" y="26" text-anchor="middle" class="title">process("hello world")</text>
<rect x="30" y="40" width="355" height="48" rx="8" class="bytes"/>
<text x="207" y="62" text-anchor="middle" class="body">h e l l o   w o r l d</text>
<text x="207" y="79" text-anchor="middle" class="cap">octets de l'appelant, jamais touchés</text>
<rect x="30" y="126" width="355" height="54" rx="8" class="box"/>
<text x="207" y="150" text-anchor="middle" class="body">Cow::Borrowed(&amp;str)</text>
<text x="207" y="168" text-anchor="middle" class="cap">tag + { ptr, len } — rien de plus</text>
<path d="M207,126 L207,90" marker-end="url(#mm10b-arrow)"/>
<text x="400" y="112" text-anchor="middle" class="cap">pointe en arrière</text>
<text x="207" y="216" text-anchor="middle" class="cap">Il n'y a pas de troisième boîte : la valeur retournée</text>
<text x="207" y="234" text-anchor="middle" class="cap">est une fenêtre sur de la mémoire déjà existante.</text>
<text x="207" y="252" text-anchor="middle" class="cap">Allocations : 0</text>
<!-- right panel: owned -->
<text x="592" y="26" text-anchor="middle" class="title ac">process("error: foo")</text>
<rect x="415" y="40" width="355" height="48" rx="8" class="bytes"/>
<text x="592" y="62" text-anchor="middle" class="body">e r r o r :   f o o</text>
<text x="592" y="79" text-anchor="middle" class="cap">octets de l'appelant, jamais touchés non plus</text>
<rect x="415" y="126" width="355" height="54" rx="8" class="acbox"/>
<text x="592" y="150" text-anchor="middle" class="body ac">Cow::Owned(String)</text>
<text x="592" y="168" text-anchor="middle" class="cap">tag + { ptr, len, cap } — un vrai propriétaire</text>
<path d="M592,88 L592,126" marker-end="url(#mm10b-arrow)"/>
<rect x="415" y="216" width="355" height="48" rx="8" class="bytes"/>
<text x="592" y="238" text-anchor="middle" class="body">:   f o o</text>
<text x="592" y="255" text-anchor="middle" class="cap">nouveau buffer heap créé par replace()</text>
<path d="M592,180 L592,216" style="stroke:var(--ac)" marker-end="url(#mm10b-arrowac)"/>
<!-- caption -->
<text x="400" y="298" text-anchor="middle" class="cap">Les appelants déréférencent les deux de la même façon, sans distinguer la variante.</text>
<text x="400" y="316" text-anchor="middle" class="cap">La seule différence : un buffer heap a-t-il dû naître ou non.</text>
</svg>
</div>

## Cas d'Usage clés

### 1. Optimiser les Opérations String

Éviter les allocations quand on modifie des strings conditionnellement :

```rust
fn to_uppercase(input: &str) -> Cow<str> {
    if input.chars().any(|c| c.is_lowercase()) {
        Cow::Owned(input.to_uppercase())  // Alloue seulement si nécessaire
    } else {
        Cow::Borrowed(input)
    }
}
```

**Exemple Étendu** (vérification des chiffres) :
```rust
fn to_uppercase_no_digits(input: &str) -> Cow<str> {
    if input.chars().any(|c| c.is_lowercase() || c.is_digit(10)) {
        Cow::Owned(input.to_uppercase().replace(|c: char| c.is_digit(10), ""))
    } else {
        Cow::Borrowed(input)
    }
}
```

`Cow` assure qu'il n'y a pas d'allocation si l'input est déjà en uppercase et sans chiffres, optimisant les chemins read-only.

### 2. Flexibilité d'API

Accepter des données borrowed et owned sans forcer les clones :

```rust
fn print(data: Cow<str>) {
    println!("{}", data);
}

fn main() {
    let my_string = String::from("world");
    print(Cow::Borrowed("hello"));  // Pas d'allocation
    print(Cow::Owned(my_string));   // Fonctionne aussi
}
```

Ceci supporte `&str`, `String`, ou autres types implémentant `ToOwned`.

### 3. Parsing Zero-Copy

Courant dans les parsers (ex : `serde`), où les champs sont souvent non modifiés :

```rust
struct JsonValue<'a> {
    data: Cow<'a, str>,  // Emprunte depuis input sauf si modifié
}
```

## Quand éviter Cow

- **Données toujours mutées** : Utilise `String` ou `Vec` directement pour éviter l'overhead de `Cow`.
- **Thread-safety** : `Cow` n'est pas thread-safe ; utilise `Arc` + `Mutex` pour accès concurrent.

## Implications de performance

| **Scénario** | **Comportement** | **Coût d'Allocation** |
|--------------|------------------|-----------------------|
| Pas de modification | Reste comme `Borrowed` | Zéro |
| Modification | Convertit vers `Owned` | Une allocation |

## Points clés

**Utilise `Cow` quand** :
- Tu as besoin de modifier conditionnellement des données borrowed.
- Tu veux éviter les allocations pour les chemins read-only.
- Ton API devrait accepter `&str` et `String` efficacement.

**Usages réels** :
- `regex::Match` (emprunte les strings d'input).
- Désérialisation `serde`.
- Manipulation de path (`PathBuf` vs. `&Path`).

**Note** : `Cow` fonctionne avec tout type `ToOwned` (ex : `[u8]` → `Vec<u8>`, `Path` → `PathBuf`).

Étendre l'exemple `to_uppercase` aux chiffres montre où `Cow` gagne sa place : il n'alloue que
sur les entrées qui ont réellement besoin d'être réécrites, et retourne un emprunt pour tout le reste.
