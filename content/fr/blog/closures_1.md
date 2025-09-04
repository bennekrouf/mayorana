---
id: function-vs-closure-rust-fr
title: Functions ou Closures en Rust ?
locale: fr
slug: function-vs-closure-rust-fr
date: '2025-08-30'
author: mayo
excerpt: >-
  Functions vs closures en Rust, couvrant ownership, traits, lifetimes, et
  implications de performance.
category: rust
tags:
  - rust
  - functions
  - closures
  - traits
  - ownership
---

# Quelle est la différence entre une function et une closure en Rust ?

Comprendre la distinction entre functions et closures est fondamental pour maîtriser le système d'ownership de Rust et ses caractéristiques de performance.

## Différences Clés

| Functions | Closures |
|-----------|----------|
| Définies au moment de la compilation avec `fn` | Anonymes, créées au runtime |
| Static dispatch (pas d'overhead runtime) | Peut impliquer du dynamic dispatch (trait objects) |
| Ne peuvent pas capturer les variables d'environnement | Peuvent capturer les variables du scope englobant |
| Ont toujours un type connu | Type unique et inféré (chaque closure a son propre type) |

## Mécaniques Sous-jacentes

### Les Closures Sont des Structs + Traits

Rust modélise les closures comme des structs qui :
- Stockent les variables capturées (comme fields)
- Implémentent l'un des closure traits (`Fn`, `FnMut`, ou `FnOnce`)

Par exemple, cette closure :
```rust
let x = 42;
let closure = |y| x + y;
```

Est désugared vers quelque chose comme :
```rust
struct AnonymousClosure {
  x: i32,  // Variable capturée
}

impl FnOnce<(i32,)> for AnonymousClosure {
  type Output = i32;
  fn call_once(self, y: i32) -> i32 {
      self.x + y
  }
}
```

### Dynamic Dispatch (Vtables)

Quand les closures sont des trait objects (ex: `Box<dyn Fn(i32) -> i32>`), Rust utilise des vtables pour le dynamic dispatch :
- **Vtable** : Une lookup table stockant des function pointers, permettant le polymorphisme runtime
- **Overhead** : Appels de fonction indirects (~2–3x plus lent que le static dispatch)

## Quand Utiliser Chacune

Utilise les **Functions** quand :
- Tu as besoin de zero-cost abstractions (ex : opérations mathématiques)
- Aucune capture d'environnement n'est requise

```rust
fn add(a: i32, b: i32) -> i32 { a + b }
```

Utilise les **Closures** quand :
- Tu dois capturer l'état de l'environnement
- Écriture de logique courte et ad-hoc (ex : callbacks, iterators)

```rust
let threshold = 10;
let filter = |x: i32| x > threshold;  // Capture `threshold`
```

## Considérations de Performance

| Scénario | Static Dispatch (Closures) | Dynamic Dispatch (dyn Fn) |
|----------|----------------------------|----------------------------|
| Vitesse | Rapide (inlined) | Plus lent (vtable lookup) |
| Mémoire | Pas d'overhead | Vtable + fat pointer |
| Cas d'usage | Hot loops, embedded | Callbacks hétérogènes |

## Exemple : Static vs. Dynamic Dispatch

```rust
// Static dispatch (compile-time)
fn static_call<F: Fn(i32) -> i32>(f: F, x: i32) -> i32 {
  f(x)  // Inlined
}

// Dynamic dispatch (runtime)
fn dynamic_call(f: &dyn Fn(i32) -> i32, x: i32) -> i32 {
  f(x)  // Vtable lookup
}
```

## Points Clés

✅ **Functions** : Performance prévisible, pas de captures  
✅ **Closures** : Flexibles, capturent l'environnement, mais peuvent impliquer des vtables  
🚀 Préfére le static dispatch (`impl Fn`) sauf si tu as besoin de trait objects

**Essaie Ceci :** Que se passe-t-il si une closure capture une mutable reference et est appelée deux fois ?  
**Réponse :** Le borrow checker assure un accès exclusif—ça ne compilera pas sauf si le premier appel se termine !

## Exemples Avancés

### Capture par Valeur vs Reference

```rust
fn main() {
    let mut count = 0;
    
    // Capture par reference mutable
    let mut increment = || {
        count += 1;
        count
    };
    
    println!("{}", increment()); // 1
    println!("{}", increment()); // 2
    
    // count est toujours accessible après
    println!("Final count: {}", count); // 2
}
```

### Move Semantics avec les Closures

```rust
use std::thread;

fn main() {
    let data = vec![1, 2, 3, 4, 5];
    
    // move force la closure à prendre ownership
    let handle = thread::spawn(move || {
        println!("Data: {:?}", data);
        data.len()
    });
    
    // data n'est plus accessible ici
    // println!("{:?}", data); // ❌ Erreur de compilation
    
    let result = handle.join().unwrap();
    println!("Length: {}", result);
}
```

### Closure Traits en Action

```rust
fn demonstrate_closure_traits() {
    let x = String::from("hello");
    
    // FnOnce - consomme les valeurs capturées
    let consume = move || {
        println!("{}", x);
        x // Move x out, peut être appelée qu'une fois
    };
    
    let y = 42;
    
    // Fn - borrow immutable
    let borrow = || {
        println!("{}", y); // y peut être utilisé plusieurs fois
    };
    
    let mut z = 0;
    
    // FnMut - emprunte mutablement
    let borrow_mut = || {
        z += 1;
        println!("{}", z);
    };
}
```

## Optimisations du Compiler

### Inline et Zero-Cost Abstractions

```rust
// Cette closure sera probablement inlined
let numbers = vec![1, 2, 3, 4, 5];
let doubled: Vec<i32> = numbers
    .iter()
    .map(|x| x * 2)  // Closure inlined
    .collect();

// Équivalent en performance à une boucle for manuelle
let mut doubled_manual = Vec::new();
for x in &numbers {
    doubled_manual.push(x * 2);
}
```

### Éviter les Allocations Inutiles

```rust
// ❌ Mauvais - crée des String temporaires
let names = vec!["Alice", "Bob", "Charlie"];
let filtered: Vec<String> = names
    .iter()
    .filter(|name| name.len() > 3)
    .map(|name| name.to_string()) // Allocation inutile
    .collect();

// ✅ Mieux - travaille avec des références
let filtered: Vec<&str> = names
    .iter()
    .filter(|name| name.len() > 3)
    .copied() // Copie les &str, pas d'allocation
    .collect();
```

## Patterns Avancés

### Higher-Order Functions

```rust
fn apply_twice<F>(f: F, x: i32) -> i32 
where 
    F: Fn(i32) -> i32,
{
    f(f(x))
}

fn main() {
    let double = |x| x * 2;
    let result = apply_twice(double, 5); // (5 * 2) * 2 = 20
    println!("{}", result);
}
```

### Returning Closures

```rust
// ❌ Ne compile pas - taille inconnue
// fn make_adder(x: i32) -> impl Fn(i32) -> i32 {
//     |y| x + y
// }

// ✅ Solution avec Box
fn make_adder(x: i32) -> Box<dyn Fn(i32) -> i32> {
    Box::new(move |y| x + y)
}

// ✅ Ou mieux, avec impl Trait (static dispatch)
fn make_adder_static(x: i32) -> impl Fn(i32) -> i32 {
    move |y| x + y
}
```

## Debugging et Introspection

### Type de Closure

```rust
fn print_closure_type<F>(_f: &F) 
where 
    F: Fn(i32) -> i32,
{
    println!("Closure type: {}", std::any::type_name::<F>());
}

fn main() {
    let x = 10;
    let closure = |y| x + y;
    print_closure_type(&closure);
    // Output: quelque chose comme "main::{{closure}}"
}
```

### Memory Layout

```rust
use std::mem;

fn main() {
    let x = 42i32;
    let y = 84i32;
    
    // Closure qui capture x et y
    let closure = |z| x + y + z;
    
    println!("Closure size: {} bytes", mem::size_of_val(&closure));
    // Probablement 8 bytes (2 × i32)
    
    // Function pointer
    fn regular_fn(z: i32) -> i32 { z + 126 }
    let fn_ptr: fn(i32) -> i32 = regular_fn;
    
    println!("Function pointer size: {} bytes", mem::size_of_val(&fn_ptr));
    // 8 bytes sur une architecture 64-bit
}
```

## Conseils de Performance

### Hot Paths

```rust
// Dans les hot paths, Préfére les functions ou static dispatch
fn process_hot_loop() {
    let data = vec![1; 1_000_000];
    
    // ✅ Static dispatch - rapide
    let result: i32 = data.iter().map(|x| x * 2).sum();
    
    // ❌ Dynamic dispatch - plus lent dans les boucles
    let dyn_fn: &dyn Fn(&i32) -> i32 = &|x| x * 2;
    let result2: i32 = data.iter().map(dyn_fn).sum();
}
```

### Memory-Conscious Code

```rust
// Evite de capturer de gros objets par valeur
fn efficient_capture() {
    let big_data = vec![0; 1_000_000];
    
    // ❌ Capture toute la vec
    let bad_closure = move || big_data.len();
    
    // ✅ Capture seulement ce qui est nécessaire
    let length = big_data.len();
    let good_closure = move || length;
}
```

---

**Conclusion :** Maîtriser les functions et closures en Rust te permet d'écrire du code à la fois expressif et performant. Choisis functions pour la prévisibilité, closures pour la flexibilité, et static dispatch quand c'est possible !
