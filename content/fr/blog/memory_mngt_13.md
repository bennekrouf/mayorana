---
id: reborrow-rust-fr
title: "Qu'est-ce que &mut *x (réemprunt) en Rust, et pourquoi gèle-t-il la référence originale ?"
slug: reborrow-rust-fr
locale: fr
date: '2025-12-06'
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

✅ `&mut *x` crée une nouvelle référence mutable pointant vers les mêmes données que `x`, sans consommer `x`.

✅ Tant que le réemprunt `y` est en vie, `x` est gelé — le borrow checker empêche leur utilisation simultanée.

✅ Dès que `y` sort du scope, le gel est levé et `x` est à nouveau utilisable.

✅ Rust moderne effectue les réemprunts implicitement lors du passage de `&mut T` à des fonctions — vous avez rarement besoin d'écrire `&mut *x` explicitement.

🚫 Un réemprunt **n'est pas** un clone des données — aucune mémoire n'est copiée. Seule la référence (un pointeur) est dupliquée, avec son lifetime contraint par le borrow checker.

**Expérience de pensée** : Que se passe-t-il si vous réempruntez `x` deux fois simultanément dans `y` et `z` ?
**Réponse** : Le compilateur le rejette. Vous ne pouvez pas avoir deux réemprunts mutables actifs de la même référence en même temps — la même règle qui interdit deux références `&mut` vers les mêmes données en général.
