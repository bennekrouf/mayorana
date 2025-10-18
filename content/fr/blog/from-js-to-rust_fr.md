---
id: move-closures-rust
title: "Comprendre les fermetures move en Rust : Guide pour développeurs JavaScript"
slug: move-closures-rust-javascript-developers
locale: "fr"
author: mayo
excerpt: 'Apprenez comment fonctionnent les fermetures move en Rust comparées aux fermetures JavaScript - propriété, threading et quand utiliser le mot-clé move'
category: rust
date: "2025-17-10"
tags:
  - rust
  - closures
  - javascript
  - typescript
---

# Comprendre les fermetures move en Rust : Guide pour développeurs JavaScript

Vous venez de JavaScript ? Les fermetures fonctionnent différemment en Rust. Une fermeture `move` force le transfert de propriété des variables capturées—pas de références partagées comme en JS. C'est le pont entre les fermetures automatiques de JavaScript et le modèle de propriété de Rust.

## La base JavaScript

En JavaScript, les fermetures capturent automatiquement les variables par référence :

```javascript
const makeCounter = () => {
  let count = 0;
  return () => count++; // capture `count` par référence
};

const counter = makeCounter();
console.log(counter()); // 0
console.log(counter()); // 1
```

La fermeture partage la même variable `count`. Pas de copie, pas de déplacement—juste une référence qui vit aussi longtemps que la fermeture.

## Le choix explicite de Rust

Rust vous oblige à choisir : emprunter ou posséder. Les fermetures normales empruntent :

```rust
let mut count = 0;
let increment = || count += 1; // emprunte `count` mutablement
```

Les fermetures `move` prennent possession :

```rust
let count = 0;
let increment = move || count + 1; // `count` déplacé/copié dans la fermeture
```

### Mécanismes de transfert de propriété

Pour les types **non-Copy** comme `String` ou `Vec`, la fermeture prend possession :

```rust
let s = String::from("hello");
let closure = move || println!("{}", s); // `s` déplacé dans la fermeture
// println!("{}", s); // ERREUR : `s` n'est plus valide
```

Pour les types **Copy** comme `i32` ou `bool`, la valeur est copiée :

```rust
let x = 42;
let closure = move || println!("{}", x); // `x` copié
println!("{}", x); // OK : `x` original toujours valide
```

### Quand vous avez besoin de `move`

#### Threading

En JavaScript, vous partageriez l'état entre opérations asynchrones sans y penser :

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

#### Retour de fermetures

Les fabriques JavaScript fonctionnent par référence :

```javascript
const makeAdder = (x) => (y) => x + y; // `x` capturé par référence

const addFive = makeAdder(5);
console.log(addFive(3)); // 8
```

Les fermetures Rust doivent posséder ce qu'elles survivent :

```rust
fn make_adder(x: i32) -> impl Fn(i32) -> i32 {
    move |y| x + y // `x` doit être déplacé
}

let add_five = make_adder(5);
println!("{}", add_five(3)); // 8
```

La fermeture survit à la portée de la fonction, donc elle a besoin de la propriété de `x`.

#### Blocs async

Comme pour les threads, les blocs async ont souvent besoin de `move` quand ils sont envoyés entre tâches :

```rust
let value = String::from("async");
let future = async move {
    println!("{}", value);
};
// tokio::spawn nécessite une durée de vie 'static
tokio::spawn(future);
```

### Emprunt vs Possession : La différence fondamentale

Les fermetures JavaScript partagent toujours :

```javascript
let count = 0;
const increment = () => count += 1;
increment();
console.log(count); // 1 - même `count`
```

Les fermetures Rust normales empruntent :

```rust
let mut count = 0;
let mut increment = || count += 1; // emprunt mutable
increment();
println!("{}", count); // 1 - même `count`
```

Les fermetures Rust `move` possèdent :

```rust
let mut count = 0;
let mut increment = move || count += 1; // `count` déplacé
increment();
// println!("{}", count); // ERREUR : `count` déplacé
```

Le `count` déplacé est indépendant—les modifications internes n'affectent pas l'original.

## Le changement de paradigme depuis JavaScript

JavaScript : les fermetures capturent par référence implicitement. Le GC gère la durée de vie. Vous ne pensez jamais à la propriété :

```javascript
const createHandler = () => {
  const state = { count: 0 };
  return () => state.count++; // la référence vit aussi longtemps que nécessaire
};
```

Rust : vous choisissez explicitement. Empruntez pour un usage local. Déplacez pour un transfert de propriété :

```rust
fn create_handler() -> impl FnMut() -> i32 {
    let mut state = 0;
    move || {
        state += 1;
        state
    } // `state` possédé par la fermeture
}
```

Cela empêche les courses aux données et les use-after-free à la compilation—des garanties que JavaScript ne peut pas offrir.

## Résumé

| Scénario | Utiliser `move` | Raison |
|----------|-----------|---------|
| Threading | Oui | Le thread peut survivre à la portée |
| Retour de fermetures | Oui | La fermeture survit à la fonction |
| Tâches async | Souvent | La tâche a besoin d'une durée de vie 'static |
| Usage local | Non | L'emprunt est suffisant |

**Principe fondamental :** Si une fermeture survit à son environnement ou doit être `Send`, utilisez `move`. Sinon, laissez le vérificateur d'emprunt choisir le mode de capture minimal.

Le mot-clé `move` est la façon de Rust de dire : "Cette fermeture possède maintenant ces variables." Ce n'est pas juste de la syntaxe—c'est un contrat appliqué à la compilation, éliminant des classes entières d'erreurs d'exécution qui affligent les langages avec ramasse-miettes.
