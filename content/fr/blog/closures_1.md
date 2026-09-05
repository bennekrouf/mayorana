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
tags:
  - rust
  - functions
  - closures
  - traits
  - ownership
---

# Quelle est la différence entre une function et une closure en Rust ?

Comprendre la distinction entre functions et closures est fondamental pour maîtriser le système d'ownership de Rust et ses caractéristiques de performance.

<div class="svg-container" style="margin:2rem 0;">
<svg class="cl1-fig" viewBox="0 0 800 300" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Une closure devient une struct qui capture son environnement, puis un dispatch statique ou dynamique l'appelle">
<!-- style -->
<style>
.cl1-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .cl1-fig,[data-theme="dark"] .cl1-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cl1-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.cl1-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.cl1-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.cl1-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl1-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.cl1-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="cl1arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
</defs>
<!-- title -->
<text x="400" y="16" text-anchor="middle" class="ti">La closure devient une struct ; le dispatch fixe le coût</text>
<!-- source -->
<rect x="300" y="26" width="200" height="50" rx="6" class="box"/>
<text x="400" y="47" text-anchor="middle" class="tx">let x = 42;</text>
<text x="400" y="63" text-anchor="middle" class="tx">|y| x + y</text>
<!-- arrow to struct -->
<path d="M400,76 L400,106" class="ln" marker-end="url(#cl1arrow)"/>
<!-- struct -->
<rect x="250" y="106" width="300" height="60" rx="6" class="box"/>
<text x="400" y="128" text-anchor="middle" class="tx">struct Closure { x: i32 }</text>
<text x="400" y="146" text-anchor="middle" class="mut">impl Fn(i32) -&gt; i32</text>
<!-- fork -->
<path d="M400,166 L400,186 L230,186 L230,206" class="ln" marker-end="url(#cl1arrow)"/>
<path d="M400,186 L570,186 L570,206" class="ln" marker-end="url(#cl1arrow)"/>
<!-- static dispatch -->
<rect x="80" y="206" width="300" height="74" rx="6" class="boxac"/>
<text x="230" y="230" text-anchor="middle" class="tx">impl Fn (dispatch statique)</text>
<text x="230" y="248" text-anchor="middle" class="mut">inliné, zero-cost</text>
<text x="230" y="264" text-anchor="middle" class="mut">choix recommandé par défaut</text>
<!-- dynamic dispatch -->
<rect x="420" y="206" width="300" height="74" rx="6" class="box"/>
<text x="570" y="230" text-anchor="middle" class="tx">Box&lt;dyn Fn&gt; (dispatch dynamique)</text>
<text x="570" y="248" text-anchor="middle" class="mut">vtable lookup</text>
<text x="570" y="264" text-anchor="middle" class="mut">~2-3x plus lent</text>
</svg>
</div>

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

<div class="svg-container" style="margin:2rem 0;">
<svg class="cl1-fig2" viewBox="0 0 800 380" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Arbre de décision : sans capture d'environnement une fn suffit, avec capture une closure, puis impl Fn pour un seul type et Box dyn Fn pour plusieurs">
<!-- style -->
<style>
.cl1-fig2{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .cl1-fig2,[data-theme="dark"] .cl1-fig2{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cl1-fig2 .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.cl1-fig2 .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.cl1-fig2 .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.cl1-fig2 .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl1-fig2 .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.cl1-fig2 .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="cl1b-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
</defs>
<!-- title -->
<text x="400" y="18" text-anchor="middle" class="ti">Laquelle te faut-il vraiment ?</text>
<!-- q1 -->
<rect x="270" y="36" width="260" height="48" rx="6" class="box"/>
<text x="400" y="58" text-anchor="middle" class="tx">La logique lit-elle une variable</text>
<text x="400" y="75" text-anchor="middle" class="tx">du scope englobant ?</text>
<!-- split -->
<path d="M400,84 L400,104 L170,104 L170,124" class="ln" marker-end="url(#cl1b-arrow-fr)"/>
<path d="M400,104 L630,104 L630,124" class="ln" marker-end="url(#cl1b-arrow-fr)"/>
<text x="290" y="99" text-anchor="middle" class="mut">non</text>
<text x="512" y="99" text-anchor="middle" class="mut">oui</text>
<!-- fn -->
<rect x="40" y="124" width="260" height="66" rx="6" class="box"/>
<text x="170" y="150" text-anchor="middle" class="tx">fn add(a: i32, b: i32)</text>
<text x="170" y="170" text-anchor="middle" class="mut">aucune capture, appel direct</text>
<!-- closure -->
<rect x="500" y="124" width="260" height="66" rx="6" class="box"/>
<text x="630" y="150" text-anchor="middle" class="tx">|x| x &gt; threshold</text>
<text x="630" y="170" text-anchor="middle" class="mut">closure : type anonyme unique</text>
<!-- to q2 -->
<path d="M630,190 L630,210" class="ln" marker-end="url(#cl1b-arrow-fr)"/>
<!-- q2 -->
<rect x="390" y="210" width="420" height="44" rx="6" class="box"/>
<text x="600" y="238" text-anchor="middle" class="tx">Toujours la même closure à cet endroit ?</text>
<!-- split2 -->
<path d="M600,254 L600,272 L405,272 L405,292" class="ln" marker-end="url(#cl1b-arrow-fr)"/>
<path d="M600,272 L680,272 L680,292" class="ln" marker-end="url(#cl1b-arrow-fr)"/>
<text x="480" y="267" text-anchor="middle" class="mut">oui</text>
<text x="655" y="267" text-anchor="middle" class="mut">non</text>
<!-- impl Fn -->
<rect x="300" y="292" width="210" height="66" rx="6" class="boxac"/>
<text x="405" y="318" text-anchor="middle" class="tx">impl Fn</text>
<text x="405" y="338" text-anchor="middle" class="mut">inliné, zero-cost</text>
<!-- box dyn -->
<rect x="560" y="292" width="210" height="66" rx="6" class="box"/>
<text x="665" y="318" text-anchor="middle" class="tx">Box&lt;dyn Fn&gt;</text>
<text x="665" y="338" text-anchor="middle" class="mut">vtable, types hétérogènes</text>
<!-- caption -->
<text x="170" y="318" text-anchor="middle" class="mut">Ne prends une closure que si la réponse</text>
<text x="170" y="336" text-anchor="middle" class="mut">à la première question est oui.</text>
</svg>
</div>

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

**Functions** : Performance prévisible, pas de captures  
**Closures** : Flexibles, capturent l'environnement, mais peuvent impliquer des vtables  
Préfére le static dispatch (`impl Fn`) sauf si tu as besoin de trait objects

Capture une référence mutable puis appelle la closure deux fois : le borrow checker refuse.
Le premier appel détient encore l'accès exclusif au moment où le second commence.

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
