---
id: closure-parameter-rust-fr
title: Comment spécifier une closure comme paramètre de function ou type de retour ?
locale: fr
slug: closure-parameter-rust-fr
date: '2025-11-06'
author: mayo
excerpt: 'Functions et closures en Rust, couvrant ownership, traits, lifetimes'
tags:
  - rust
  - closures
  - traits
  - ownership
  - lifetimes
---

# Comment spécifier une closure comme paramètre de function ou type de retour ?

Les closures en Rust sont des types anonymes, donc tu dois utiliser des trait bounds (`Fn`, `FnMut`, `FnOnce`) pour définir leurs signatures. Voici comment travailler avec elles comme paramètres et types de retour.

<div class="svg-container" style="margin:2rem 0;">
<svg class="cl3-fig" viewBox="0 0 800 290" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Retourner une closure : impl Fn reste sur la stack, Box de dyn Fn passe sur le heap">
<!-- style -->
<style>
.cl3-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .cl3-fig,[data-theme="dark"] .cl3-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cl3-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.cl3-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.cl3-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.cl3-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl3-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.cl3-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="cl3arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
</defs>
<!-- title -->
<text x="400" y="16" text-anchor="middle" class="ti">Retourner une closure : impl Fn reste sur la stack, Box&lt;dyn Fn&gt; passe sur le heap</text>
<!-- source -->
<rect x="300" y="26" width="200" height="50" rx="6" class="box"/>
<text x="400" y="47" text-anchor="middle" class="tx">fn make_closure(...)</text>
<text x="400" y="63" text-anchor="middle" class="mut">-&gt; impl Fn ou Box&lt;dyn Fn&gt;</text>
<!-- fork -->
<path d="M400,76 L400,96 L230,96 L230,116" class="ln" marker-end="url(#cl3arrow)"/>
<path d="M400,96 L570,96 L570,116" class="ln" marker-end="url(#cl3arrow)"/>
<!-- impl Fn -->
<rect x="80" y="116" width="300" height="70" rx="6" class="boxac"/>
<text x="230" y="140" text-anchor="middle" class="tx">impl Fn(i32) -&gt; i32</text>
<text x="230" y="158" text-anchor="middle" class="mut">stack, monomorphized</text>
<!-- Box dyn Fn -->
<rect x="420" y="116" width="300" height="70" rx="6" class="box"/>
<text x="570" y="140" text-anchor="middle" class="tx">Box&lt;dyn Fn(i32) -&gt; i32&gt;</text>
<text x="570" y="158" text-anchor="middle" class="mut">heap, vtable</text>
<!-- arrows down to notes -->
<path d="M230,186 L230,210" class="ln" marker-end="url(#cl3arrow)"/>
<path d="M570,186 L570,210" class="ln" marker-end="url(#cl3arrow)"/>
<!-- notes -->
<rect x="80" y="210" width="300" height="55" rx="6" class="box"/>
<text x="230" y="233" text-anchor="middle" class="tx">type de closure unique</text>
<text x="230" y="250" text-anchor="middle" class="mut">zero-cost, fixe</text>
<rect x="420" y="210" width="300" height="55" rx="6" class="box"/>
<text x="570" y="233" text-anchor="middle" class="tx">closures hétérogènes</text>
<text x="570" y="250" text-anchor="middle" class="mut">flexible, coût runtime</text>
</svg>
</div>

## Closure comme Paramètre de Function

Utilise des paramètres de type générique avec trait bounds pour accepter des closures.

### Exemple : `Fn` (Immutable Borrow)

```rust
// Accepte une closure qui prend `i32` et retourne `i32` (read-only).
fn apply<F: Fn(i32) -> i32>(f: F, x: i32) -> i32 {
    f(x)
}

fn main() {
    let add_five = |x| x + 5; // Implémente `Fn`
    println!("{}", apply(add_five, 10)); // 15
}
```

### Exemple : `FnMut` (Mutable Borrow)

```rust
// Accepte une closure qui mute son environnement.
fn apply_mut<F: FnMut(i32) -> i32>(mut f: F, x: i32) -> i32 {
    f(x)
}

fn main() {
    let mut count = 0;
    let mut increment_and_add = |x| {
        count += 1; // Mute `count` → `FnMut`
        x + count
    };
    println!("{}", apply_mut(increment_and_add, 10)); // 11
}
```

### Exemple : `FnOnce` (Ownership)

```rust
// Accepte une closure qui consomme ses captures.
fn consume_closure<F: FnOnce() -> String>(f: F) -> String {
    f() // Appelle f une seule fois
}

fn main() {
    let message = String::from("Hello, World!");
    let closure = || {
        message // Move message dans la closure
    };
    
    println!("{}", consume_closure(closure)); // Hello, World!
    // closure ne peut pas être rappelée
}
```

<div class="svg-container" style="margin:2rem 0;">
<svg class="cl3-fig2" viewBox="0 0 800 320" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Deux sites d'appel avec des closures différentes poussent le compilateur à générer deux copies spécialisées de la fonction générique apply">
<!-- style -->
<style>
.cl3-fig2{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .cl3-fig2,[data-theme="dark"] .cl3-fig2{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cl3-fig2 .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.cl3-fig2 .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.cl3-fig2 .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.cl3-fig2 .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl3-fig2 .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.cl3-fig2 .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="cl3b-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
</defs>
<!-- title -->
<text x="400" y="18" text-anchor="middle" class="ti">Un `apply` générique, une copie machine par type de closure</text>
<!-- call site A -->
<rect x="40" y="44" width="250" height="54" rx="6" class="box"/>
<text x="165" y="68" text-anchor="middle" class="tx">apply(add_five, 10)</text>
<text x="165" y="87" text-anchor="middle" class="mut">type de closure n°1</text>
<!-- call site B -->
<rect x="40" y="118" width="250" height="54" rx="6" class="box"/>
<text x="165" y="142" text-anchor="middle" class="tx">apply(|x| x * 2, 10)</text>
<text x="165" y="161" text-anchor="middle" class="mut">type de closure n°2</text>
<!-- merge into generic -->
<path d="M290,71 L340,71 L340,108 L430,108" class="ln" marker-end="url(#cl3b-arrow-fr)"/>
<path d="M290,145 L340,145 L340,108" class="ln"/>
<!-- generic -->
<rect x="430" y="76" width="330" height="64" rx="6" class="boxac"/>
<text x="595" y="102" text-anchor="middle" class="tx">fn apply&lt;F: Fn(i32) -&gt; i32&gt;(f: F, x: i32)</text>
<text x="595" y="122" text-anchor="middle" class="mut">une seule source, F est un paramètre de type</text>
<!-- fan out -->
<path d="M595,140 L595,170 L245,170 L245,200" class="ln" marker-end="url(#cl3b-arrow-fr)"/>
<path d="M595,170 L575,170 L575,200" class="ln" marker-end="url(#cl3b-arrow-fr)"/>
<text x="400" y="164" text-anchor="middle" class="mut">monomorphization</text>
<!-- generated 1 -->
<rect x="100" y="200" width="290" height="70" rx="6" class="box"/>
<text x="245" y="226" text-anchor="middle" class="tx">apply::&lt;closure#1&gt;</text>
<text x="245" y="246" text-anchor="middle" class="mut">f(x) devient x + 5, inliné</text>
<!-- generated 2 -->
<rect x="430" y="200" width="290" height="70" rx="6" class="box"/>
<text x="575" y="226" text-anchor="middle" class="tx">apply::&lt;closure#2&gt;</text>
<text x="575" y="246" text-anchor="middle" class="mut">f(x) devient x * 2, inliné</text>
<!-- caption -->
<text x="400" y="300" text-anchor="middle" class="mut">Chaque closure a son propre type anonyme : voilà pourquoi les generics ne coûtent rien à l'exécution, et pourquoi le binaire grossit.</text>
</svg>
</div>

## Closures avec Paramètres Multiples

```rust
// Closure qui prend plusieurs paramètres
fn apply_binary<F>(f: F, a: i32, b: i32) -> i32
where
    F: Fn(i32, i32) -> i32,
{
    f(a, b)
}

fn main() {
    let add = |x, y| x + y;
    let multiply = |x, y| x * y;
    
    println!("Add: {}", apply_binary(add, 5, 3)); // 8
    println!("Multiply: {}", apply_binary(multiply, 5, 3)); // 15
}
```

## Closure comme Type de Retour

Utilise `impl Trait` pour le static dispatch (zero-cost) ou `Box<dyn Trait>` pour le dynamic dispatch (flexible).

### Exemple : Retourner `impl Fn` (Static Dispatch)

```rust
// Retourne une closure qui ajoute une valeur fixe (capture immutable).
fn make_adder(a: i32) -> impl Fn(i32) -> i32 {
    move |b| a + b // `move` force ownership (toujours `Fn` car `a` est read-only)
}

fn main() {
    let add_ten = make_adder(10);
    println!("{}", add_ten(5)); // 15
    
    // Peut être appelée plusieurs fois
    println!("{}", add_ten(3)); // 13
}
```

### Exemple : Retourner `impl FnMut` (Stateful Closure)

```rust
// Retourne une closure avec état interne
fn make_counter(start: i32) -> impl FnMut() -> i32 {
    let mut count = start;
    move || {
        count += 1;
        count
    }
}

fn main() {
    let mut counter = make_counter(0);
    
    println!("{}", counter()); // 1
    println!("{}", counter()); // 2
    println!("{}", counter()); // 3
}
```

### Exemple : Retourner `Box<dyn Fn>` (Dynamic Dispatch)

```rust
// Retourne un trait object pour des closures hétérogènes.
fn create_closure(is_add: bool) -> Box<dyn Fn(i32) -> i32> {
    if is_add {
        Box::new(|x| x + 1) // Closure heap-allocated
    } else {
        Box::new(|x| x - 1)
    }
}

fn main() {
    let add = create_closure(true);
    let sub = create_closure(false);
    println!("{} {}", add(5), sub(5)); // 6 4
}
```

## Différences Clés

| Approche            | `impl Fn` (Static)         | `Box<dyn Fn>` (Dynamic)    |
|---------------------|----------------------------|----------------------------|
| **Dispatch**        | Monomorphized (zero-cost)  | Vtable lookup (runtime cost) |
| **Cas d'Usage**     | Type de closure unique      | Types de closures multiples |
| **Mémoire**         | Stack-allocated            | Heap-allocated (trait object) |
| **Flexibilité**     | Moins (type fixe)          | Plus (toute closure `dyn Fn`) |

## Exemples Avancés

### Factory Pattern avec Closures

```rust
enum Operation {
    Add,
    Multiply,
    Power,
}

fn create_operation(op: Operation) -> Box<dyn Fn(i32, i32) -> i32> {
    match op {
        Operation::Add => Box::new(|a, b| a + b),
        Operation::Multiply => Box::new(|a, b| a * b),
        Operation::Power => Box::new(|a, b| a.pow(b as u32)),
    }
}

fn main() {
    let ops = vec![Operation::Add, Operation::Multiply, Operation::Power];
    let closures: Vec<_> = ops.into_iter()
        .map(create_operation)
        .collect();
    
    for (i, op) in closures.iter().enumerate() {
        println!("Op {}: {}", i, op(2, 3));
    }
    // Op 0: 5 (2+3)
    // Op 1: 6 (2*3)  
    // Op 2: 8 (2^3)
}
```

### Higher-Order Functions avec Generic Bounds

```rust
// Function qui prend une closure et l'applique plusieurs fois
fn apply_n_times<F>(mut f: F, mut value: i32, n: usize) -> i32
where
    F: FnMut(i32) -> i32,
{
    for _ in 0..n {
        value = f(value);
    }
    value
}

fn main() {
    let double = |x| x * 2;
    let add_one = |x| x + 1;
    
    // Double 3 fois: 5 -> 10 -> 20 -> 40
    println!("{}", apply_n_times(double, 5, 3)); // 40
    
    // Ajoute 1, 5 fois: 0 -> 1 -> 2 -> 3 -> 4 -> 5
    println!("{}", apply_n_times(add_one, 0, 5)); // 5
}
```

### Composition de Closures

```rust
// Compose deux closures
fn compose<F, G, T, U, V>(f: F, g: G) -> impl Fn(T) -> V
where
    F: Fn(T) -> U,
    G: Fn(U) -> V,
{
    move |x| g(f(x))
}

fn main() {
    let add_one = |x: i32| x + 1;
    let double = |x: i32| x * 2;
    
    // Compose: d'abord add_one, puis double
    let add_then_double = compose(add_one, double);
    
    println!("{}", add_then_double(5)); // (5 + 1) * 2 = 12
    
    // Ordre inverse
    let double_then_add = compose(double, add_one);
    println!("{}", double_then_add(5)); // (5 * 2) + 1 = 11
}
```

## Quand Utiliser Chaque Approche

### `impl Fn` - Recommandé pour :
- Retourner un type unique de closure (ex : factory functions).
- Code critique en performance (pas d'allocation heap).
- APIs où le type de closure est connu au moment de la compilation.

```rust
// Pattern courant : builder avec closures
struct DataProcessor;

impl DataProcessor {
    fn with_transform(self, transform: impl Fn(i32) -> i32 + 'static) -> ProcessorBuilder {
        ProcessorBuilder { transform: Box::new(transform) }
    }
}

struct ProcessorBuilder {
    transform: Box<dyn Fn(i32) -> i32>,
}
```

### `Box<dyn Fn>` - Recommandé pour :
- Retourner différents types de closures (ex : conditionnellement).
- Comportement dynamique (ex : systèmes de plugins, callbacks).
- Storage dans des collections ou structs.

```rust
// Event system avec callbacks dynamiques
struct EventSystem {
    handlers: std::collections::HashMap<String, Vec<Box<dyn Fn(&str)>>>,
}

impl EventSystem {
    fn new() -> Self {
        Self { handlers: std::collections::HashMap::new() }
    }
    
    fn on<F>(&mut self, event: &str, callback: F)
    where
        F: Fn(&str) + 'static,
    {
        self.handlers
            .entry(event.to_string())
            .or_insert_with(Vec::new)
            .push(Box::new(callback));
    }
    
    fn emit(&self, event: &str, data: &str) {
        if let Some(handlers) = self.handlers.get(event) {
            for handler in handlers {
                handler(data);
            }
        }
    }
}
```

## Pièges et Solutions

### `FnMut` dans les Structs

Stocke des closures mutables avec `FnMut` et annote `mut` :

```rust
struct Processor<F: FnMut(i32) -> i32> {
    op: F,
}

impl<F: FnMut(i32) -> i32> Processor<F> {
    fn new(op: F) -> Self {
        Self { op }
    }
    
    fn process(&mut self, value: i32) -> i32 {
        (self.op)(value) // Parenthèses nécessaires pour la closure
    }
}

fn main() {
    let mut count = 0;
    let mut processor = Processor::new(|x| {
        count += 1;
        x + count
    });
    
    println!("{}", processor.process(10)); // 11
    println!("{}", processor.process(10)); // 12
}
```

### Lifetimes avec Captures

Les closures capturant des références peuvent nécessiter des lifetimes explicites :

```rust
fn capture_ref<'a>(s: &'a str) -> impl Fn() -> &'a str + 'a {
    move || s // Closure capture `s` avec lifetime `'a`
}

fn main() {
    let text = String::from("Hello, World!");
    let getter = capture_ref(&text);
    
    println!("{}", getter()); // Hello, World!
    
    // text doit vivre au moins aussi longtemps que getter
}
```

### Erreur Commune : Return Type Mismatch

```rust
// ❌ Ne compile pas - types de retour différents
fn broken_factory(use_add: bool) -> impl Fn(i32) -> i32 {
    if use_add {
        |x| x + 1  // Type A
    } else {
        |x| x * 2  // Type B (différent de A)
    }
}

// ✅ Solution avec Box<dyn Fn>
fn fixed_factory(use_add: bool) -> Box<dyn Fn(i32) -> i32> {
    if use_add {
        Box::new(|x| x + 1)
    } else {
        Box::new(|x| x * 2)
    }
}
```

## Patterns de Performance

### Éviter les Allocations dans les Hot Paths

```rust
// ❌ Mauvais - allocation dans hot path  
fn slow_processor(data: &[i32]) -> Vec<i32> {
    data.iter()
        .map(|&x| {
            let boxed: Box<dyn Fn(i32) -> i32> = Box::new(|y| y * 2);
            boxed(x) // Allocation à chaque itération
        })
        .collect()
}

// ✅ Bon - pas d'allocation
fn fast_processor(data: &[i32]) -> Vec<i32> {
    let transformer = |x| x * 2; // impl Fn, zero-cost
    data.iter()
        .map(|&x| transformer(x))
        .collect()
}
```

### Static vs Dynamic Dispatch Benchmark

```rust
use std::time::Instant;

fn benchmark_dispatch() {
    let data: Vec<i32> = (0..1_000_000).collect();
    
    // Static dispatch
    let transform_static = |x: i32| x * 2 + 1;
    let start = Instant::now();
    let _result1: Vec<i32> = data.iter().map(|&x| transform_static(x)).collect();
    println!("Static dispatch: {:?}", start.elapsed());
    
    // Dynamic dispatch  
    let transform_dynamic: Box<dyn Fn(i32) -> i32> = Box::new(|x| x * 2 + 1);
    let start = Instant::now();
    let _result2: Vec<i32> = data.iter().map(|&x| transform_dynamic(x)).collect();
    println!("Dynamic dispatch: {:?}", start.elapsed());
}
```

## Points Clés

✅ **Paramètre** : Utilise les generics (`F: Fn(...)`) pour flexibilité et performance.  
✅ **Type de Retour** :  
- `impl Fn` pour static dispatch (rapide, type fixe).  
- `Box<dyn Fn>` pour dynamic dispatch (flexible, types multiples).  
🚀 Préfére `impl Fn` sauf si tu as besoin de polymorphisme runtime.

### Règles de Décision

1. **Un seul type de closure** → `impl Fn`
2. **Plusieurs types possibles** → `Box<dyn Fn>`
3. **Performance critique** → `impl Fn`
4. **Flexibilité dynamique** → `Box<dyn Fn>`
5. **Storage dans collections** → `Box<dyn Fn>`

**Essaie Ceci** : Que se passe-t-il si tu retournes une closure `FnOnce` ?  
**Réponse** : C'est permis, mais l'appelant ne peut l'invoquer qu'une fois !

## Exemple Pratique Complet

```rust
// Système de pipeline de traitement de données
struct DataPipeline {
    stages: Vec<Box<dyn Fn(i32) -> i32>>,
}

impl DataPipeline {
    fn new() -> Self {
        Self { stages: Vec::new() }
    }
    
    fn add_stage<F>(mut self, stage: F) -> Self
    where
        F: Fn(i32) -> i32 + 'static,
    {
        self.stages.push(Box::new(stage));
        self
    }
    
    fn process(&self, mut value: i32) -> i32 {
        for stage in &self.stages {
            value = stage(value);
        }
        value
    }
}

fn main() {
    let pipeline = DataPipeline::new()
        .add_stage(|x| x * 2)      // Double
        .add_stage(|x| x + 10)     // Add 10
        .add_stage(|x| x / 3);     // Divide by 3
    
    let result = pipeline.process(5);
    println!("Result: {}", result); // ((5 * 2) + 10) / 3 = 6
}
```

---

**Conclusion :** Maîtriser les closures comme paramètres et types de retour te donne une flexibilité énorme pour créer des APIs expressives et performantes en Rust. Choisis `impl Fn` pour la performance, `Box<dyn Fn>` pour la flexibilité !
