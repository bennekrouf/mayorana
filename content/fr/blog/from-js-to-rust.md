---
id: move-closures-rust
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

## La Base JavaScript

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

## Le Choix Explicite de Rust

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

### Quand Vous Avez Besoin de `move`

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

### Emprunt vs Possession : La Différence Fondamentale

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

## Le Changement de Paradigme depuis JavaScript

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
