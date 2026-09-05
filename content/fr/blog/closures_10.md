---
id: closure-dispatch-rust-fr
title: 'impl Fn() vs. Box<dyn Fn()>: Le Duel du Dispatch des Closures en Rust'
locale: fr
slug: closure-dispatch-rust-fr
author: mayo
excerpt: >-
  Comparaison du static et dynamic dispatch pour les closures en Rust, focus sur
  performance et cas d'usage
tags:
  - rust
  - closures
  - dispatch
  - performance
  - traits
date: '2025-11-05'
---

# impl Fn() vs. Box<dyn Fn()>: Le Duel du Dispatch des Closures en Rust

Le système de closures de Rust offre deux façons de gérer un comportement function-like : `impl Fn()` pour le static dispatch et `Box<dyn Fn()>` pour le dynamic dispatch. Chacune a des caractéristiques distinctes de performance et flexibilité, guidées par l'ownership, les traits, et les lifetimes de Rust. Je vais les comparer et expliquer quand choisir l'une plutôt que l'autre.

<div class="svg-container" style="margin:2rem 0;">
<svg class="cl10-fig" viewBox="0 0 800 260" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Comparaison des chemins d'appel : impl Fn est inliné directement au site d'appel, tandis que Box dyn Fn passe par un fat pointer et un vtable lookup avant d'atteindre le code alloué sur le heap">
<!-- style -->
<style>
.cl10-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .cl10-fig,[data-theme="dark"] .cl10-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cl10-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.cl10-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.cl10-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.cl10-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl10-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.cl10-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.cl10-fig .lnac{stroke:var(--ac);stroke-width:2;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="cl10arrowfr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
<marker id="cl10arrowacfr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ac)"/></marker>
</defs>
<!-- top lane: static -->
<text x="40" y="34" class="ti">impl Fn() — dispatch statique</text>
<rect x="40" y="46" width="150" height="46" rx="6" class="box"/>
<text x="115" y="74" text-anchor="middle" class="tx">site d'appel</text>
<path d="M190,69 L330,69" class="lnac" marker-end="url(#cl10arrowacfr)"/>
<rect x="330" y="46" width="200" height="46" rx="6" class="boxac"/>
<text x="430" y="69" text-anchor="middle" class="tx">code inliné</text>
<text x="430" y="83" text-anchor="middle" class="mut">monomorphized</text>
<text x="620" y="74" class="mut">~1–2 ns, sans indirection</text>
<!-- bottom lane: dynamic -->
<text x="40" y="146" class="ti">Box&lt;dyn Fn()&gt; — dispatch dynamique</text>
<rect x="40" y="158" width="150" height="46" rx="6" class="box"/>
<text x="115" y="186" text-anchor="middle" class="tx">site d'appel</text>
<path d="M190,181 L270,181" class="ln" marker-end="url(#cl10arrowfr)"/>
<rect x="270" y="158" width="140" height="46" rx="6" class="box"/>
<text x="340" y="181" text-anchor="middle" class="tx">fat pointer</text>
<text x="340" y="195" text-anchor="middle" class="mut">data + vtable</text>
<path d="M410,181 L490,181" class="ln" marker-end="url(#cl10arrowfr)"/>
<rect x="490" y="158" width="140" height="46" rx="6" class="box"/>
<text x="560" y="181" text-anchor="middle" class="tx">vtable lookup</text>
<path d="M630,181 L690,181 L690,220" class="ln" marker-end="url(#cl10arrowfr)"/>
<rect x="600" y="220" width="180" height="34" rx="6" class="box"/>
<text x="690" y="242" text-anchor="middle" class="tx">code closure sur le heap</text>
<text x="40" y="242" class="mut">~5–10 ns, deux indirections</text>
</svg>
</div>

## Différences clés

| **Aspect** | **impl Fn() (Static Dispatch)** | **Box&lt;dyn Fn()&gt; (Dynamic Dispatch)** |
|------------|--------------------------------|--------------------------------------|
| **Mécanisme de Dispatch** | Monomorphized au moment de la compilation (zero-cost) | Utilise des vtables (runtime lookup) |
| **Performance** | Plus rapide (~1–2 ns, appel direct) | Plus lent (~5–10 ns, vtable lookup) |
| **Flexibilité** | Type concret unique par instance | Peut stocker des closures hétérogènes |
| **Mémoire** | Stack-allocated (sauf si moved) | Heap-allocated (fat pointer + heap data) |
| **Cas d'Usage** | Type de closure fixe, critique en performance | Comportement dynamique, types de closures multiples |

## Quand utiliser chacune

### 1. impl Fn() (Static Dispatch)
- **Utilise Quand** :
  - Le type de closure est fixe et connu au moment de la compilation.
  - La performance est critique (ex : hot loops, systèmes embarqués).
  - Les zero-cost abstractions sont désirées.
- **Pourquoi** : Le compilateur génère une fonction unique pour chaque type de closure via monomorphization, permettant l'inlining et aucun overhead runtime.

**Exemple** :
```rust
fn make_adder(x: i32) -> impl Fn(i32) -> i32 {
    move |y| x + y
}

fn main() {
    let add_five = make_adder(5); // Type: closure(5)
    println!("{}", add_five(3)); // 8
}
```

Pas d'allocation heap, appels de fonction directs, et performance optimale.

### 2. Box&lt;dyn Fn()&gt; (Dynamic Dispatch)
- **Utilise Quand** :
  - Tu dois stocker différentes closures dans la même collection (ex : callbacks).
  - Les types de closures varient au runtime (ex : systèmes de plugins).
  - La flexibilité l'emporte sur les coûts de performance.
- **Pourquoi** : `dyn Fn()` utilise une vtable pour la résolution de méthode au runtime, permettant des closures hétérogènes au coût d'allocation heap et d'overhead de lookup.

**Exemple** :
```rust
fn create_op(is_add: bool) -> Box<dyn Fn(i32, i32) -> i32> {
    if is_add {
        Box::new(|x, y| x + y)
    } else {
        Box::new(|x, y| x * y)
    }
}

fn main() {
    let add = create_op(true);
    let mul = create_op(false);
    println!("{} {}", add(2, 3), mul(2, 3)); // 5 6
}
```

Supporte le comportement dynamique, idéal pour les event handlers ou plugins.

Remarque que `create_op` n'est pas seulement *plus lent* avec `impl Fn` — c'est impossible. Chaque littéral de closure reçoit son propre type anonyme : les deux branches renvoient donc deux types sans rapport, alors qu'`impl Trait` promet exactement un seul :

<div class="svg-container" style="margin:2rem 0;">
<svg class="cl10b-fig" viewBox="0 0 800 320" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Deux littéraux de closure aux types anonymes distincts sont rejetés par impl Fn mais s'unifient derrière un unique type dyn Fn boxé">
<!-- style -->
<style>
.cl10b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .cl10b-fig,[data-theme="dark"] .cl10b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cl10b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.cl10b-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.cl10b-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.cl10b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl10b-fig .acb{fill:var(--ac);font:700 12px ui-sans-serif,system-ui,sans-serif}
.cl10b-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.cl10b-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="cl10b-arrowfr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
<marker id="cl10b-arrowacfr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ac)"/></marker>
</defs>
<!-- title -->
<text x="400" y="20" text-anchor="middle" class="ti">Deux branches, deux types anonymes — un seul type de retour les accepte</text>
<!-- literal A -->
<rect x="250" y="36" width="140" height="44" rx="6" class="box"/>
<text x="320" y="58" text-anchor="middle" class="tx">|x, y| x + y</text>
<text x="320" y="74" text-anchor="middle" class="mut">type n°1</text>
<!-- literal B -->
<rect x="410" y="36" width="140" height="44" rx="6" class="box"/>
<text x="480" y="58" text-anchor="middle" class="tx">|x, y| x * y</text>
<text x="480" y="74" text-anchor="middle" class="mut">type n°2</text>
<!-- merge stems -->
<path d="M320,80 L320,104" class="ln"/>
<path d="M480,80 L480,104" class="ln"/>
<!-- shared bus -->
<path d="M170,104 L630,104" class="ln"/>
<!-- branch to impl Fn -->
<path d="M170,104 L170,140" class="ln" marker-end="url(#cl10b-arrowfr)"/>
<!-- branch to Box dyn -->
<path d="M630,104 L630,140" class="ln" marker-end="url(#cl10b-arrowacfr)"/>
<!-- impl Fn outcome -->
<rect x="40" y="140" width="260" height="110" rx="6" class="box"/>
<text x="170" y="166" text-anchor="middle" class="tx">-&gt; impl Fn(i32, i32) -&gt; i32</text>
<text x="170" y="186" text-anchor="middle" class="mut">désigne un seul type concret</text>
<text x="170" y="205" text-anchor="middle" class="mut">choisi une fois, à la compilation</text>
<text x="170" y="230" text-anchor="middle" class="acb">E0308 : types incompatibles</text>
<!-- Box dyn outcome -->
<rect x="500" y="140" width="260" height="110" rx="6" class="boxac"/>
<text x="630" y="166" text-anchor="middle" class="tx">-&gt; Box&lt;dyn Fn(i32, i32) -&gt; i32&gt;</text>
<text x="630" y="186" text-anchor="middle" class="mut">les deux types effacés via une vtable</text>
<text x="630" y="205" text-anchor="middle" class="mut">les branches s'accordent</text>
<text x="630" y="230" text-anchor="middle" class="acb">compile — une alloc par Box</text>
<!-- caption -->
<text x="400" y="284" text-anchor="middle" class="mut">Le même mur bloque `Vec&lt;impl Fn&gt;` : un vecteur exige un seul type d'élément.</text>
<text x="400" y="301" text-anchor="middle" class="mut">Ici le dynamic dispatch n'est pas l'option lente — c'est la seule option.</text>
</svg>
</div>

## Considérations de Lifetime

- **Box&lt;dyn Fn()&gt;** : Nécessite des lifetimes explicites si la closure capture des références :
  ```rust
  struct Handler<'a> {
      callback: Box<dyn Fn() -> &'a str + 'a>,
  }
  ```
- **impl Fn()** : Les lifetimes sont typiquement inférées sauf si des références sont capturées, simplifiant l'usage.

## Trade-offs de performance

| **Scénario** | **impl Fn()** | **Box&lt;dyn Fn()&gt;** |
|--------------|---------------|-------------------|
| **Vitesse d'Appel** | ~1–2 ns (appel direct) | ~5–10 ns (vtable lookup) |
| **Overhead Mémoire** | Aucun (stack-allocated) | 16–24 bytes (fat pointer + heap data) |
| **Code Bloat** | Possible (monomorphization) | Minimal (vtable unique) |

## Exemples avancés

### Collection de Closures Hétérogènes

```rust
// ✅ Dynamic dispatch permet ceci
fn create_handlers() -> Vec<Box<dyn Fn(i32) -> String>> {
    vec![
        Box::new(|x| format!("Double: {}", x * 2)),
        Box::new(|x| format!("Square: {}", x * x)),
        Box::new(|x| format!("Cube: {}", x * x * x)),
    ]
}

fn main() {
    let handlers = create_handlers();
    for (i, handler) in handlers.iter().enumerate() {
        println!("Handler {}: {}", i, handler(5));
    }
}
```

### Static dispatch avec génériques
```rust
// ✅ Static dispatch avec type parameter
fn process_data<F>(data: &[i32], processor: F) -> Vec<i32>
where
    F: Fn(i32) -> i32,
{
    data.iter().map(|&x| processor(x)).collect()
}

fn main() {
    let numbers = vec![1, 2, 3, 4, 5];
    
    // Chaque appel est monomorphized
    let doubled = process_data(&numbers, |x| x * 2);
    let squared = process_data(&numbers, |x| x * x);
    
    println!("Doubled: {:?}", doubled);
    println!("Squared: {:?}", squared);
}
```

### Event System avec Dynamic Dispatch

```rust
use std::collections::HashMap;

type EventHandler = Box<dyn Fn(&str) + Send + Sync>;

struct EventSystem {
    handlers: HashMap<String, Vec<EventHandler>>,
}

impl EventSystem {
    fn new() -> Self {
        Self {
            handlers: HashMap::new(),
        }
    }
    
    fn subscribe<F>(&mut self, event: &str, handler: F)
    where
        F: Fn(&str) + Send + Sync + 'static,
    {
        self.handlers
            .entry(event.to_string())
            .or_insert_with(Vec::new)
            .push(Box::new(handler));
    }
    
    fn emit(&self, event: &str, data: &str) {
        if let Some(handlers) = self.handlers.get(event) {
            for handler in handlers {
                handler(data);
            }
        }
    }
}

fn main() {
    let mut system = EventSystem::new();
    
    // Différents handlers pour le même event
    system.subscribe("user_login", |data| {
        println!("Logging: User {} logged in", data);
    });
    
    system.subscribe("user_login", |data| {
        println!("Analytics: Track login for {}", data);
    });
    
    system.emit("user_login", "alice");
}
```

## Patterns d'Optimisation

### Éviter Dynamic Dispatch dans les Hot Paths

```rust
// ❌ Mauvais - dynamic dispatch dans une boucle critique
fn bad_hot_loop(data: &[i32], op: &dyn Fn(i32) -> i32) -> Vec<i32> {
    let mut result = Vec::new();
    for &x in data {
        result.push(op(x)); // Vtable lookup à chaque itération
    }
    result
}

// ✅ Bon - static dispatch
fn good_hot_loop<F>(data: &[i32], op: F) -> Vec<i32>
where
    F: Fn(i32) -> i32,
{
    let mut result = Vec::new();
    for &x in data {
        result.push(op(x)); // Inlined
    }
    result
}
```

### Hybrid Approach

```rust
// Combiner les deux approches selon le contexte
enum Operation {
    Static(fn(i32) -> i32),           // Function pointer (fast)
    Dynamic(Box<dyn Fn(i32) -> i32>), // Closure (flexible)
}

impl Operation {
    fn call(&self, x: i32) -> i32 {
        match self {
            Operation::Static(f) => f(x),
            Operation::Dynamic(f) => f(x),
        }
    }
}

fn main() {
    let ops = vec![
        Operation::Static(|x| x * 2),              // Compile-time connu
        Operation::Dynamic(Box::new(|x| x + 10)),  // Runtime flexible
    ];
    
    for op in &ops {
        println!("{}", op.call(5));
    }
}
```

## Benchmarking

### Setup de Benchmark avec Criterion

```rust
use criterion::{black_box, criterion_group, criterion_main, Criterion};

fn bench_dispatch(c: &mut Criterion) {
    let static_fn = |x: i32| x * 2 + 1;
    let dynamic_fn: Box<dyn Fn(i32) -> i32> = Box::new(|x| x * 2 + 1);
    
    c.bench_function("static_dispatch", |b| {
        b.iter(|| static_fn(black_box(42)))
    });
    
    c.bench_function("dynamic_dispatch", |b| {
        b.iter(|| dynamic_fn(black_box(42)))
    });
}

criterion_group!(benches, bench_dispatch);
criterion_main!(benches);
```

### Résultats typiques

```
static_dispatch    time: [1.2345 ns 1.2456 ns 1.2567 ns]
dynamic_dispatch   time: [8.7654 ns 8.8765 ns 8.9876 ns]
```

**Observation** : `impl Fn()` est ~7x plus rapide que `Box<dyn Fn()>`.

## Memory Layout et Overhead

### Static Dispatch Memory Layout

```rust
use std::mem;

fn analyze_static() {
    let x = 42;
    let closure = |y| x + y;
    
    println!("Static closure size: {} bytes", mem::size_of_val(&closure));
    // Typiquement 4 bytes (taille de x capturé)
}
```

### Dynamic Dispatch Memory Layout

```rust
fn analyze_dynamic() {
    let x = 42;
    let closure: Box<dyn Fn(i32) -> i32> = Box::new(move |y| x + y);
    
    println!("Dynamic closure size: {} bytes", mem::size_of_val(&closure));
    // Typiquement 16 bytes (fat pointer: 8 bytes data + 8 bytes vtable)
    
    // Plus l'allocation heap pour les données capturées
}
```

## Points clés

**Choisis `impl Fn()` pour** :
- Code sensible aux performances (ex : chaînes d'iterators).
- Type de closure unique (ex : factory functions).
- Zero-cost abstractions.

**Choisis `Box<dyn Fn()>` pour** :
- Comportement dynamique (ex : event handlers, plugins).
- Stockage de types de closures mixtes (ex : `Vec<Box<dyn Fn()>>`).
- Flexibilité runtime.

**Exemples Réels** :
- `impl Fn()` : Utilisé dans les adaptateurs d'iterators comme `map` et `filter` pour une performance zero-cost.
- `Box<dyn Fn()>` : Commun dans les frameworks GUI pour les callbacks d'événements où la flexibilité est clé.

## Verification de performance

Pour quantifier la différence de performance, benchmark avec `criterion` :

```rust
use criterion::{black_box, Criterion};

fn bench(c: &mut Criterion) {
    let impl_fn = |x: i32| x + 5;
    let dyn_fn: Box<dyn Fn(i32) -> i32> = Box::new(|x| x + 5);
    
    c.bench_function("impl_fn", |b| b.iter(|| impl_fn(black_box(3))));
    c.bench_function("dyn_fn", |b| b.iter(|| dyn_fn(black_box(3))));
}
```

`impl Fn()` est plus rapide et utilise moins de mémoire.

## Conclusion

Utilise `impl Fn()` pour un dispatch static zero-cost dans les scénarios critiques en performance avec des types de closures connus. Opte pour `Box<dyn Fn()>` quand la flexibilité est nécessaire, comme dans les systèmes de plugins ou applications event-driven nécessitant du polymorphisme runtime. Le système d'ownership et de traits de Rust assure que les deux approches sont sûres, le choix dépendant de l'équilibre entre performance et exigences dynamiques.
