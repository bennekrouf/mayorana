---
id: move-closures-rust-javascript-developers-fr
title: 'Comprendre les Move Closures en Rust : Guide pour les Développeurs JavaScript'
slug: move-closures-rust-javascript-developers
locale: fr
author: mayo
excerpt: >-
  Apprenez comment fonctionnent les move closures en Rust comparé aux closures
  JavaScript - ownership, threading et quand utiliser le mot-clé move
tags:
  - rust
  - closures
  - javascript
  - typescript
date: '2025-11-12'
---

# Comprendre les Move Closures en Rust : Guide pour les Développeurs JavaScript

Vous venez de JavaScript ? Les closures fonctionnent différemment en Rust. Une closure `move` force le transfert d'ownership des variables capturées—pas de références partagées comme en JS. C'est le pont entre les closures automatiques de JavaScript et le modèle d'ownership de Rust.

<div class="svg-container" style="margin:2rem 0;">
<svg class="moveclo-fig" viewBox="0 0 800 300" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Les closures JavaScript partagent une référence vers la variable capturée, alors que les closures move de Rust prennent l'ownership et l'original devient inaccessible">
<style>
.moveclo-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .moveclo-fig,[data-theme="dark"] .moveclo-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.moveclo-fig text{font-family:ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.moveclo-fig .title{font-size:14px;font-weight:700}
.moveclo-fig .body{font-size:12px;font-weight:600}
.moveclo-fig .cap{font-size:11px;fill:var(--mut)}
.moveclo-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.moveclo-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.moveclo-fig .acln{stroke:var(--ac);stroke-width:2;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="moveclo-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"></path>
</marker>
<marker id="moveclo-arrow-ac-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ac)"></path>
</marker>
</defs>
<!-- column titles -->
<text x="210" y="25" text-anchor="middle" class="title">JavaScript</text>
<text x="590" y="25" text-anchor="middle" class="title">Closure move Rust</text>
<!-- js outer -->
<rect class="box" x="70" y="45" width="280" height="55" rx="8"></rect>
<text x="210" y="68" text-anchor="middle" class="body">portée externe : count</text>
<text x="210" y="86" text-anchor="middle" class="cap">reste valide après capture</text>
<!-- js closure -->
<rect class="box" x="70" y="190" width="280" height="55" rx="8"></rect>
<text x="210" y="213" text-anchor="middle" class="body">closure : count++</text>
<text x="210" y="231" text-anchor="middle" class="cap">capture par référence</text>
<!-- js bidirectional arrow -->
<path class="ln" d="M210,100 L210,190" marker-end="url(#moveclo-arrow-fr)" marker-start="url(#moveclo-arrow-fr)"></path>
<text x="255" y="150" text-anchor="middle" class="cap">partagé</text>
<!-- rust outer -->
<rect class="box" x="450" y="45" width="280" height="55" rx="8"></rect>
<text x="590" y="68" text-anchor="middle" class="body">portée externe : count</text>
<text x="590" y="86" text-anchor="middle" class="cap">n'est plus accessible</text>
<!-- rust closure -->
<rect class="box" x="450" y="190" width="280" height="55" rx="8"></rect>
<text x="590" y="213" text-anchor="middle" class="body">closure move</text>
<text x="590" y="231" text-anchor="middle" class="cap">possède count exclusivement</text>
<!-- rust one-way move arrow -->
<path class="acln" d="M590,100 L590,190" marker-end="url(#moveclo-arrow-ac-fr)"></path>
<text x="630" y="150" text-anchor="middle" class="cap" fill="var(--ac)">move</text>
<!-- caption -->
<text x="400" y="285" text-anchor="middle" class="cap">JS : référence partagée implicite — Rust : transfert d'ownership explicite, vérifié par le compilateur</text>
</svg>
</div>

## La base JavaScript

En JavaScript, les closures capturent les variables par référence automatiquement :

```javascript
const makeCounter = () => {
  let count = 0;
  return () => count++; // capture `count` par référence
};

const counter = makeCounter();
console.log(counter()); // 0
console.log(counter()); // 1
```

La closure partage la même variable `count`. Pas de copie, pas de déplacement—juste une référence qui vit aussi longtemps que la closure.

## Le choix explicite de Rust

Rust vous oblige à choisir : emprunter ou posséder. Les closures régulières empruntent :

```rust
let mut count = 0;
let increment = || count += 1; // emprunte `count` mutablement
```

Les closures `move` prennent l'ownership :

```rust
let count = 0;
let increment = move || count + 1; // `count` déplacé/copié dans la closure
```

### Mécanismes de Transfert d'Ownership

Pour les types **non-Copy** comme `String` ou `Vec`, la closure prend l'ownership :

```rust
let s = String::from("hello");
let closure = move || println!("{}", s); // `s` déplacé dans la closure
// println!("{}", s); // ERREUR : `s` n'est plus valide
```

Pour les types **Copy** comme `i32` ou `bool`, la valeur est copiée :

```rust
let x = 42;
let closure = move || println!("{}", x); // `x` copié
println!("{}", x); // OK : le `x` original est toujours valide
```

### Quand vous avez besoin de `move`
Trois situations imposent le mot-clé, et toutes se ramènent à la même question — celle que JavaScript ne vous pose jamais :

<div class="svg-container" style="margin:2rem 0;">
<svg class="jsrsb-fig" viewBox="0 0 800 420" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Arbre de décision : si une closure survit à son scope ou doit être Send, il faut move, puis les types Copy sont copiés tandis que les types non-Copy invalident l'original ; sinon une closure emprunteuse suffit">
<style>
.jsrsb-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .jsrsb-fig,[data-theme="dark"] .jsrsb-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.jsrsb-fig text{font-family:ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.jsrsb-fig .title{font-size:13px;font-weight:700}
.jsrsb-fig .body{font-size:12px;font-weight:600}
.jsrsb-fig .cap{font-size:11px;fill:var(--mut)}
.jsrsb-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.jsrsb-fig .qbox{fill:var(--bg);stroke:var(--ln);stroke-width:1.5}
.jsrsb-fig .acbox{fill:var(--ac);stroke:var(--ac)}
.jsrsb-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.jsrsb-fig .acln{stroke:var(--ac);stroke-width:2;fill:none}
.jsrsb-fig .lbl{font-size:11px;font-weight:700;fill:var(--mut)}
</style>
<!-- defs -->
<defs>
<marker id="jsrsb-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"></path>
</marker>
<marker id="jsrsb-arrowac-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ac)"></path>
</marker>
</defs>
<!-- start -->
<rect class="box" x="280" y="20" width="240" height="50" rx="8"></rect>
<text x="400" y="42" text-anchor="middle" class="body">une closure capture une variable</text>
<text x="400" y="60" text-anchor="middle" class="cap">count, data, state …</text>
<path class="ln" d="M400,70 L400,94" marker-end="url(#jsrsb-arrow-fr)"></path>
<!-- question -->
<rect class="qbox" x="180" y="94" width="440" height="58" rx="8"></rect>
<text x="400" y="118" text-anchor="middle" class="title">Survit-elle au scope, ou doit-elle être Send ?</text>
<text x="400" y="138" text-anchor="middle" class="cap">thread::spawn · impl Fn retournée · tokio::spawn</text>
<!-- split -->
<path class="ln" d="M400,152 L400,176"></path>
<path class="ln" d="M205,176 L595,176"></path>
<path class="ln" d="M205,176 L205,206" marker-end="url(#jsrsb-arrow-fr)"></path>
<path class="acln" d="M595,176 L595,206" marker-end="url(#jsrsb-arrowac-fr)"></path>
<text x="185" y="196" text-anchor="end" class="lbl">non</text>
<text x="615" y="196" class="lbl" fill="var(--ac)">oui</text>
<!-- borrow branch -->
<rect class="box" x="60" y="206" width="290" height="56" rx="8"></rect>
<text x="205" y="230" text-anchor="middle" class="title">closure simple — emprunte</text>
<text x="205" y="250" text-anchor="middle" class="cap">le borrow checker choisit &amp;, &amp;mut ou par valeur</text>
<path class="ln" d="M205,262 L205,300" marker-end="url(#jsrsb-arrow-fr)"></path>
<rect class="box" x="60" y="300" width="290" height="64" rx="8"></rect>
<text x="205" y="324" text-anchor="middle" class="body">l'original reste utilisable</text>
<text x="205" y="343" text-anchor="middle" class="cap">adaptateurs d'itérateurs, callbacks</text>
<text x="205" y="357" text-anchor="middle" class="cap">de courte durée — le défaut en JS</text>
<!-- move branch -->
<rect class="acbox" x="450" y="206" width="290" height="56" rx="8"></rect>
<text x="595" y="230" text-anchor="middle" class="title" fill="#ffffff">closure move — possède</text>
<text x="595" y="250" text-anchor="middle" class="body" fill="#ffffff">les captures vivent autant que la closure</text>
<!-- move branch split by Copy-ness -->
<path class="ln" d="M595,262 L595,280"></path>
<path class="ln" d="M505,280 L690,280"></path>
<path class="ln" d="M505,280 L505,300" marker-end="url(#jsrsb-arrow-fr)"></path>
<path class="ln" d="M690,280 L690,300" marker-end="url(#jsrsb-arrow-fr)"></path>
<rect class="box" x="420" y="300" width="170" height="64" rx="8"></rect>
<text x="505" y="324" text-anchor="middle" class="body">Copy : i32, bool</text>
<text x="505" y="343" text-anchor="middle" class="cap">valeur copiée —</text>
<text x="505" y="357" text-anchor="middle" class="cap">original valide</text>
<rect class="box" x="610" y="300" width="170" height="64" rx="8"></rect>
<text x="695" y="324" text-anchor="middle" class="body">String, Vec</text>
<text x="695" y="343" text-anchor="middle" class="cap">déplacé —</text>
<text x="695" y="357" text-anchor="middle" class="cap">original invalidé</text>
<!-- caption -->
<text x="400" y="396" text-anchor="middle" class="cap">La question que JavaScript tranche pour vous avec un ramasse-miettes, Rust vous la fait trancher avec un mot-clé</text>
</svg>
</div>

#### Threading

En JavaScript, vous partageriez l'état entre opérations async sans y penser :

```javascript
const data = [1, 2, 3];
setTimeout(() => {
  console.log(data); // fonctionne simplement
}, 100);
```

Les threads Rust doivent posséder leurs données :

```rust
use std::thread;

let data = vec![1, 2, 3];
let handle = thread::spawn(move || {
    println!("{:?}", data); // `data` possédé par le thread
});
// println!("{:?}", data); // ERREUR : déplacé
handle.join().unwrap();
```

Sans `move`, le compilateur rejette ce code—le thread pourrait survivre à `data`.

#### Retour de Closures

Les factories JavaScript fonctionnent par référence :

```javascript
const makeAdder = (x) => (y) => x + y; // `x` capturé par référence

const addFive = makeAdder(5);
console.log(addFive(3)); // 8
```

Les closures Rust doivent posséder ce qu'elles survivent :

```rust
fn make_adder(x: i32) -> impl Fn(i32) -> i32 {
    move |y| x + y // `x` doit être déplacé
}

let add_five = make_adder(5);
println!("{}", add_five(3)); // 8
```

La closure survit à la portée de la fonction, donc elle a besoin de l'ownership de `x`.

#### Blocs Async

Similairement aux threads, les blocs async ont souvent besoin de `move` quand ils sont envoyés entre tâches :

```rust
let value = String::from("async");
let future = async move {
    println!("{}", value);
};
// tokio::spawn requiert une durée de vie 'static
tokio::spawn(future);
```

### Emprunt vs Possession : La différence Fondamentale

Les closures JavaScript partagent toujours :

```javascript
let count = 0;
const increment = () => count += 1;
increment();
console.log(count); // 1 - même `count`
```

Les closures régulières Rust empruntent :

```rust
let mut count = 0;
let mut increment = || count += 1; // emprunt mutable
increment();
println!("{}", count); // 1 - même `count`
```

Les closures `move` Rust possèdent :

```rust
let mut count = 0;
let mut increment = move || count += 1; // `count` déplacé
increment();
// println!("{}", count); // ERREUR : `count` déplacé
```

Le `count` déplacé est indépendant—les changements internes n'affectent pas l'original.

## Le changement de paradigme depuis JavaScript
JavaScript : les closures capturent par référence implicitement. Le GC gère la durée de vie. Vous ne pensez jamais à l'ownership :

```javascript
const createHandler = () => {
  const state = { count: 0 };
  return () => state.count++; // la référence vit aussi longtemps que nécessaire
};
```

Rust : vous choisissez explicitement. Empruntez pour un usage local. Déplacez pour un transfert d'ownership :

```rust
fn create_handler() -> impl FnMut() -> i32 {
    let mut state = 0;
    move || {
        state += 1;
        state
    } // `state` possédé par la closure
}
```

Cela empêche les data races et les use-after-free au moment de la compilation—des garanties que JavaScript ne peut pas offrir.

## Résumé
| Scénario | Utiliser `move` | Raison |
|----------|-----------|---------|
| Threading | Oui | Le thread peut survivre à la portée |
| Retour de closures | Oui | La closure survit à la fonction |
| Tâches async | Souvent | La tâche a besoin d'une durée de vie 'static |
| Usage local | Non | L'emprunt est suffisant |

**Principe fondamental :** Si une closure survit à son environnement ou doit être `Send`, utilisez `move`. Sinon, laissez le borrow checker choisir le mode de capture minimal.

Le mot-clé `move` est la façon de Rust de dire : "Cette closure possède maintenant ces variables." Ce n'est pas juste de la syntaxe—c'est un contrat appliqué au moment de la compilation, éliminant des classes entières d'erreurs runtime qui affectent les langages avec garbage collection.
