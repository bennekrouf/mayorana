---
id: higher-order-functions-rust-fr
title: 'Higher-Order Functions de Rust: Alimenter des Closures Flexibles'
slug: higher-order-functions-rust-fr
locale: fr
author: mayo
excerpt: >-
  Explorer les higher-order functions en Rust pour des patterns de programmation
  fonctionnelle
tags:
  - rust
  - closures
  - higher-order-functions
  - traits
  - lifetimes
date: '2025-11-08'
---

# Higher-Order Functions de Rust: Alimenter des Closures Flexibles

Les higher-order functions (HOFs) en Rust—fonctions qui acceptent ou retournent d'autres functions/closures—exploitent le système de closures de Rust, les trait bounds (`Fn`, `FnMut`, `FnOnce`), et le modèle d'ownership pour permettre des patterns puissants de programmation fonctionnelle comme les callbacks et decorators. Je vais expliquer comment les HOFs fonctionnent en Rust, leurs mécaniques, et cas d'usage pratiques.

<div class="svg-container" style="margin:2rem 0;">
<svg class="cl6-fig" viewBox="0 0 800 230" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Une higher-order function retourne une closure qui possède ses données capturées, via dispatch statique ou dynamique">
<!-- style -->
<style>
.cl6-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .cl6-fig,[data-theme="dark"] .cl6-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cl6-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.cl6-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.cl6-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.cl6-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl6-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.cl6-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="cl6arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
</defs>
<!-- title -->
<text x="400" y="20" text-anchor="middle" class="ti">Une higher-order function retourne une closure qui possède ses données</text>
<!-- row1: static -->
<rect x="40" y="50" width="190" height="60" rx="6" class="box"/>
<text x="135" y="86" text-anchor="middle" class="tx">make_adder(5)</text>
<path d="M230,80 L290,80" class="ln" marker-end="url(#cl6arrow)"/>
<rect x="290" y="50" width="230" height="60" rx="6" class="boxac"/>
<text x="405" y="75" text-anchor="middle" class="tx">move |y| x + y</text>
<text x="405" y="93" text-anchor="middle" class="mut">possède x = 5 (Copy)</text>
<path d="M520,80 L580,80" class="ln" marker-end="url(#cl6arrow)"/>
<rect x="580" y="50" width="180" height="60" rx="6" class="box"/>
<text x="670" y="86" text-anchor="middle" class="tx">add_five(3) → 8</text>
<!-- row2: dynamic -->
<rect x="40" y="150" width="190" height="60" rx="6" class="box"/>
<text x="135" y="186" text-anchor="middle" class="tx">math_op("add")</text>
<path d="M230,180 L290,180" class="ln" marker-end="url(#cl6arrow)"/>
<rect x="290" y="150" width="230" height="60" rx="6" class="box"/>
<text x="405" y="175" text-anchor="middle" class="tx">Box&lt;dyn Fn(i32,i32)-&gt;i32&gt;</text>
<text x="405" y="193" text-anchor="middle" class="mut">dispatch via vtable</text>
<path d="M520,180 L580,180" class="ln" marker-end="url(#cl6arrow)"/>
<rect x="580" y="150" width="180" height="60" rx="6" class="box"/>
<text x="670" y="186" text-anchor="middle" class="tx">add(2,3) → 5</text>
</svg>
</div>

## Que sont les Higher-Order Functions ?

Les HOFs soit :
- Acceptent une ou plusieurs functions/closures comme arguments, ou
- Retournent une function/closure.

Le support de Rust pour les HOFs est basé sur son système de closures, qui s'intègre parfaitement avec l'ownership, les traits, et les lifetimes.

## Exemple : Function Retournant une Closure

Une fonction qui retourne une closure "adder" configurable :

```rust
fn make_adder(x: i32) -> impl Fn(i32) -> i32 {
    // `move` transfère ownership de `x` dans la closure
    move |y| x + y
}

fn main() {
    let add_five = make_adder(5); // Retourne une closure qui ajoute 5
    println!("{}", add_five(3)); // 8
}
```

### Mécaniques Clés

- **Capture de Closure** : Le mot-clé `move` assure que la closure possède `x`, évitant les problèmes de lifetime après que `make_adder` se termine. Sans `move`, emprunter `x` causerait une erreur de compilation à cause du scope de `x` qui se termine.
- **Type de Retour** : `impl Fn(i32) -> i32` spécifie que la closure implémente le trait `Fn`. Chaque closure a un type anonyme unique, donc `impl Trait` est utilisé pour l'abstraire.

## Exemple Avancé : Retour de Closure Conditionnel

Pour un comportement dynamique, retourne un `Box<dyn Fn>` pour supporter différentes closures au runtime :

```rust
fn math_op(op: &str) -> Box<dyn Fn(i32, i32) -> i32> {
    match op {
        "add" => Box::new(|x, y| x + y),
        "mul" => Box::new(|x, y| x * y),
        "sub" => Box::new(|x, y| x - y),
        "div" => Box::new(|x, y| if y != 0 { x / y } else { 0 }),
        _ => panic!("Opération non supportée: {}", op),
    }
}

fn main() {
    let add = math_op("add");
    let mul = math_op("mul");
    let sub = math_op("sub");
    
    println!("Add: {}", add(2, 3)); // 5
    println!("Mul: {}", mul(2, 3)); // 6
    println!("Sub: {}", sub(5, 2)); // 3
}
```

Ceci utilise le dynamic dispatch pour gérer des types de closures variés, idéal pour des systèmes de type plugin.

## Exemples Avancés de HOFs

### 1. Composition de Functions

```rust
// Compose deux functions
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
    let square = |x: i32| x * x;
    
    // Compose: add_one puis double
    let add_then_double = compose(add_one, double);
    println!("(5 + 1) * 2 = {}", add_then_double(5)); // 12
    
    // Compose: double puis square
    let double_then_square = compose(double, square);
    println!("(5 * 2)² = {}", double_then_square(5)); // 100
    
    // Triple composition
    let complex = compose(add_one, compose(double, square));
    println!("((5 + 1) * 2)² = {}", complex(5)); // 144
}
```

### 2. Curry Functions

```rust
// Currying : transform une function à 2 paramètres en functions imbriquées
fn curry<F, A, B, C>(f: F) -> impl Fn(A) -> impl Fn(B) -> C
where
    F: Fn(A, B) -> C,
{
    move |a| move |b| f(a, b)
}

fn main() {
    let add = |x: i32, y: i32| x + y;
    let multiply = |x: i32, y: i32| x * y;
    
    // Curry add
    let curried_add = curry(add);
    let add_five = curried_add(5);
    println!("5 + 3 = {}", add_five(3)); // 8
    println!("5 + 7 = {}", add_five(7)); // 12
    
    // Curry multiply
    let curried_mul = curry(multiply);
    let double = curried_mul(2);
    let triple = curried_mul(3);
    
    println!("Double 4 = {}", double(4)); // 8
    println!("Triple 4 = {}", triple(4)); // 12
}
```

### 3. Decorators et Middleware

```rust
use std::time::{Duration, Instant};

// Decorator pour mesurer le temps d'exécution
fn time_it<F, T>(f: F) -> impl Fn() -> T
where
    F: Fn() -> T,
{
    move || {
        let start = Instant::now();
        let result = f();
        let duration = start.elapsed();
        println!("Temps d'exécution: {:?}", duration);
        result
    }
}

// Decorator pour retry logic
fn with_retry<F, T, E>(f: F, max_attempts: usize) -> impl Fn() -> Result<T, E>
where
    F: Fn() -> Result<T, E>,
    E: std::fmt::Debug,
{
    move || {
        for attempt in 1..=max_attempts {
            match f() {
                Ok(result) => return Ok(result),
                Err(e) if attempt == max_attempts => return Err(e),
                Err(e) => {
                    println!("Tentative {} échouée: {:?}", attempt, e);
                    std::thread::sleep(Duration::from_millis(100 * attempt as u64));
                }
            }
        }
        unreachable!()
    }
}

// Decorator pour logging
fn with_logging<F, T>(name: &str, f: F) -> impl Fn() -> T
where
    F: Fn() -> T,
{
    let name = name.to_string();
    move || {
        println!("🚀 Début de {}", name);
        let result = f();
        println!("✅ Fin de {}", name);
        result
    }
}

fn decorator_example() {
    // Function simulant du travail
    let expensive_work = || {
        std::thread::sleep(Duration::from_millis(200));
        42
    };
    
    // Application de multiple decorators
    let decorated = with_logging("travail coûteux", 
        time_it(expensive_work)
    );
    
    let result = decorated();
    println!("Résultat: {}", result);
    
    // Exemple avec retry
    let flaky_operation = || -> Result<String, &'static str> {
        use rand::Rng;
        if rand::thread_rng().gen_bool(0.7) {
            Err("Opération échouée")
        } else {
            Ok("Succès!".to_string())
        }
    };
    
    let reliable_operation = with_retry(flaky_operation, 3);
    match reliable_operation() {
        Ok(result) => println!("Opération réussie: {}", result),
        Err(e) => println!("Opération échouée après retries: {:?}", e),
    }
}
```

Le decorator est le cas subtil : `with_logging` *accepte* une closure et en *retourne* une, donc la closure retournée doit avaler `f` en entier. Voici ce qu'un appel à travers le wrapper fait réellement :

<div class="svg-container" style="margin:2rem 0;">
<svg class="cl6b-fig" viewBox="0 0 800 300" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Un appel traversant la closure decorator retournée par with_logging, qui possède la fonction enveloppée et exécute le log avant de lui déléguer">
<!-- style -->
<style>
.cl6b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .cl6b-fig,[data-theme="dark"] .cl6b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cl6b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.cl6b-fig .shell{fill:none;stroke:var(--ac);stroke-width:2}
.cl6b-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.cl6b-fig .hdac{fill:var(--ac);font:700 13px ui-sans-serif,system-ui,sans-serif}
.cl6b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl6b-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.cl6b-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="cl6b-arrowfr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
</defs>
<!-- title -->
<text x="400" y="20" text-anchor="middle" class="ti">Une closure decorator enveloppe la fonction qu'on lui a confiée</text>
<!-- shell -->
<rect x="200" y="44" width="420" height="200" rx="8" class="shell"/>
<text x="410" y="66" text-anchor="middle" class="hdac">closure retournée par with_logging</text>
<text x="410" y="84" text-anchor="middle" class="mut">move || { … } — possède `f` entièrement</text>
<!-- caller -->
<rect x="30" y="112" width="150" height="54" rx="6" class="box"/>
<text x="105" y="136" text-anchor="middle" class="tx">decorated()</text>
<text x="105" y="154" text-anchor="middle" class="mut">appelant</text>
<!-- arrow into log step -->
<path d="M180,139 L230,139" class="ln" marker-end="url(#cl6b-arrowfr)"/>
<!-- log step -->
<rect x="230" y="112" width="170" height="54" rx="6" class="box"/>
<text x="315" y="136" text-anchor="middle" class="tx">println!("Début…")</text>
<text x="315" y="154" text-anchor="middle" class="mut">comportement ajouté</text>
<!-- arrow to inner f -->
<path d="M400,139 L440,139" class="ln" marker-end="url(#cl6b-arrowfr)"/>
<!-- inner f -->
<rect x="440" y="112" width="150" height="54" rx="6" class="box"/>
<text x="515" y="136" text-anchor="middle" class="tx">f()</text>
<text x="515" y="154" text-anchor="middle" class="mut">l'original capturé</text>
<!-- inner note -->
<text x="410" y="200" text-anchor="middle" class="mut">`f` a été moved dedans : le wrapper reste valide bien après le retour de with_logging</text>
<text x="410" y="218" text-anchor="middle" class="mut">un nouveau type anonyme par enveloppe — inlinable, sans vtable</text>
<!-- arrow out -->
<path d="M590,139 L650,139" class="ln" marker-end="url(#cl6b-arrowfr)"/>
<!-- result -->
<rect x="650" y="112" width="120" height="54" rx="6" class="box"/>
<text x="710" y="143" text-anchor="middle" class="tx">42</text>
<!-- caption -->
<text x="400" y="276" text-anchor="middle" class="mut">Enveloppe le wrapper et ça s'imbrique encore — chaque couche est une coquille `impl Fn`.</text>
</svg>
</div>

### 4. Factory Pattern avec HOFs

```rust
use std::collections::HashMap;

// Factory pour créer différents types de validators
fn create_validator(rule: &str) -> Box<dyn Fn(&str) -> bool> {
    match rule {
        "email" => Box::new(|s| s.contains('@') && s.contains('.')),
        "non_empty" => Box::new(|s| !s.is_empty()),
        "min_length" => Box::new(|s| s.len() >= 5),
        "max_length" => Box::new(|s| s.len() <= 50),
        "alphanumeric" => Box::new(|s| s.chars().all(|c| c.is_alphanumeric())),
        _ => Box::new(|_| true), // Default: toujours valide
    }
}

// Compose plusieurs validators
fn combine_validators(validators: Vec<Box<dyn Fn(&str) -> bool>>) -> impl Fn(&str) -> bool {
    move |input| {
        validators.iter().all(|validator| validator(input))
    }
}

fn validation_example() {
    // Créer des validators individuels
    let email_validator = create_validator("email");
    let non_empty_validator = create_validator("non_empty");
    let min_length_validator = create_validator("min_length");
    
    // Combine les validators
    let combined = combine_validators(vec![
        non_empty_validator,
        min_length_validator,
        email_validator,
    ]);
    
    // Test des inputs
    let test_cases = vec![
        "",
        "test",
        "test@example.com",
        "a@b.c",
        "valid.email@domain.com",
    ];
    
    for input in test_cases {
        let is_valid = combined(input);
        println!("'{}' -> {}", input, if is_valid { "✅ Valide" } else { "❌ Invalide" });
    }
}
```

## Cas d'Usage pour les HOFs

### 1. Iterator Adaptors

Les closures alimentent les méthodes d'iterator comme `map`, `filter`, et `fold` :

```rust
fn iterator_hof_examples() {
    let numbers = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    // Map avec closure
    let doubled: Vec<_> = numbers.iter().map(|x| x * 2).collect();
    println!("Doubled: {:?}", doubled); // [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
    
    // Filter avec condition complexe
    let even_squares: Vec<_> = numbers
        .iter()
        .filter(|&&x| x % 2 == 0)
        .map(|x| x * x)
        .collect();
    println!("Even squares: {:?}", even_squares); // [4, 16, 36, 64, 100]
    
    // Fold avec closure stateful
    let sum_of_squares = numbers
        .iter()
        .fold(0, |acc, x| acc + x * x);
    println!("Sum of squares: {}", sum_of_squares); // 385
    
    // Chain operations
    let result: Vec<_> = numbers
        .iter()
        .filter(|&&x| x > 3)
        .map(|x| x * 2)
        .take(3)
        .collect();
    println!("Filtered, mapped, taken: {:?}", result); // [8, 10, 12]
}
```

### 2. Event Systems et Callbacks

```rust
use std::collections::HashMap;

struct EventEmitter {
    listeners: HashMap<String, Vec<Box<dyn Fn(&str)>>>,
}

impl EventEmitter {
    fn new() -> Self {
        Self {
            listeners: HashMap::new(),
        }
    }
    
    fn on<F>(&mut self, event: &str, callback: F)
    where
        F: Fn(&str) + 'static,
    {
        self.listeners
            .entry(event.to_string())
            .or_insert_with(Vec::new)
            .push(Box::new(callback));
    }
    
    fn emit(&self, event: &str, data: &str) {
        if let Some(callbacks) = self.listeners.get(event) {
            for callback in callbacks {
                callback(data);
            }
        }
    }
    
    // HOF pour créer des listeners avec middleware
    fn on_with_middleware<F, M>(&mut self, event: &str, middleware: M, callback: F)
    where
        F: Fn(&str) + 'static,
        M: Fn(&str, Box<dyn Fn(&str)>) + 'static,
    {
        let wrapped_callback = move |data: &str| {
            middleware(data, Box::new(&callback));
        };
        
        self.on(event, wrapped_callback);
    }
}

fn event_system_example() {
    let mut emitter = EventEmitter::new();
    
    // Simple callback
    emitter.on("user_login", |user| {
        println!("👤 User logged in: {}", user);
    });
    
    // Callback avec logging
    emitter.on("user_login", |user| {
        println!("📊 Analytics: Login event for {}", user);
    });
    
    // Multiple events
    emitter.on("user_logout", |user| {
        println!("👋 User logged out: {}", user);
    });
    
    // Emit events
    emitter.emit("user_login", "alice");
    emitter.emit("user_login", "bob");
    emitter.emit("user_logout", "alice");
}
```

### 3. Pipeline Processing

```rust
// Pipeline pour traiter des données avec multiple étapes
struct Pipeline<T> {
    steps: Vec<Box<dyn Fn(T) -> T>>,
}

impl<T: 'static> Pipeline<T> {
    fn new() -> Self {
        Self { steps: Vec::new() }
    }
    
    fn add_step<F>(mut self, step: F) -> Self
    where
        F: Fn(T) -> T + 'static,
    {
        self.steps.push(Box::new(step));
        self
    }
    
    fn execute(self, input: T) -> T {
        self.steps.into_iter().fold(input, |acc, step| step(acc))
    }
}

// HOF pour créer des étapes de transformation
fn create_transformer(operation: &str) -> Box<dyn Fn(i32) -> i32> {
    match operation {
        "double" => Box::new(|x| x * 2),
        "square" => Box::new(|x| x * x),
        "increment" => Box::new(|x| x + 1),
        "abs" => Box::new(|x| x.abs()),
        _ => Box::new(|x| x),
    }
}

fn pipeline_example() {
    let pipeline = Pipeline::new()
        .add_step(|x: i32| x + 10)        // Add 10
        .add_step(|x| x * 2)              // Double
        .add_step(|x| if x > 50 { x - 20 } else { x }) // Conditional
        .add_step(|x| x.min(100));        // Cap at 100
    
    let input = 15;
    let result = pipeline.execute(input);
    println!("Pipeline: {} -> {}", input, result); // 15 -> 30
    
    // Pipeline avec transformers dynamiques
    let dynamic_pipeline = Pipeline::new()
        .add_step(*create_transformer("increment"))
        .add_step(*create_transformer("square"))
        .add_step(*create_transformer("double"));
    
    let result2 = dynamic_pipeline.execute(5);
    println!("Dynamic pipeline: 5 -> {}", result2); // 5 -> 72 ((5+1)² * 2)
}
```

## Performance et Optimisations

### 1. Static vs Dynamic Dispatch

```rust
use std::time::Instant;

// Static dispatch - plus rapide
fn apply_static<F: Fn(i32) -> i32>(f: F, x: i32) -> i32 {
    f(x)
}

// Dynamic dispatch - plus flexible
fn apply_dynamic(f: &dyn Fn(i32) -> i32, x: i32) -> i32 {
    f(x)
}

fn performance_comparison() {
    let operation = |x: i32| x * 2 + 1;
    let iterations = 10_000_000;
    
    // Test static dispatch
    let start = Instant::now();
    for i in 0..iterations {
        apply_static(&operation, i);
    }
    let static_time = start.elapsed();
    
    // Test dynamic dispatch
    let start = Instant::now();
    for i in 0..iterations {
        apply_dynamic(&operation, i);
    }
    let dynamic_time = start.elapsed();
    
    println!("Static dispatch: {:?}", static_time);
    println!("Dynamic dispatch: {:?}", dynamic_time);
    println!("Ratio: {:.2}x", dynamic_time.as_nanos() as f64 / static_time.as_nanos() as f64);
}
```

### 2. Éviter les Allocations Inutiles

```rust
// ❌ Mauvais - allocations répétées
fn bad_hof_pattern() -> Vec<Box<dyn Fn(i32) -> i32>> {
    let mut transformers = Vec::new();
    for i in 1..=5 {
        transformers.push(Box::new(move |x| x * i)); // Allocation pour chaque closure
    }
    transformers
}

// ✅ Bon - structure plus efficace
fn good_hof_pattern() -> impl Fn(i32) -> i32 {
    |x| (1..=5).fold(x, |acc, i| acc * i) // Pas d'allocations
}
```

## Points Clés

**Les HOFs permettent des patterns flexibles et réutilisables** en traitant les functions comme des valeurs de première classe.  
**Utilise `impl Fn`** pour le static dispatch zero-cost dans le code critique en performance.  
**Utilise `Box<dyn Fn>`** pour un comportement dynamique avec multiple types de closures.  
**Utilise `move`** pour assurer que les closures possèdent les données capturées quand retournées.

### Règles de Décision

1. **Performance critique** → `impl Fn` (static dispatch)
2. **Comportement dynamique** → `Box<dyn Fn>` (dynamic dispatch)
3. **Composition simple** → Functions inline
4. **Logic complexe** → Structs avec méthodes
5. **APIs publiques** → `impl Trait` pour flexibilité

**Exemple Réel** : Les HOFs sont centrales à l'API iterator de Rust (`map`, `filter`) et aux frameworks async comme `tokio`, où les closures définissent le comportement des tâches.

Change `make_adder` pour multiplier au lieu d'additionner : rien d'autre ne bouge. Les deux
closures sont des `Fn(i32) -> i32`, et c'est tout le contrat que voit l'appelant.

## Exemple Pratique Complet

```rust
use std::collections::HashMap;

// Système de traitement de commandes avec HOFs
struct OrderProcessor {
    validators: Vec<Box<dyn Fn(&Order) -> Result<(), String>>>,
    transformers: Vec<Box<dyn Fn(Order) -> Order>>,
    handlers: HashMap<String, Box<dyn Fn(&Order)>>,
}

#[derive(Debug, Clone)]
struct Order {
    id: String,
    amount: f64,
    customer: String,
    items: Vec<String>,
}

impl OrderProcessor {
    fn new() -> Self {
        Self {
            validators: Vec::new(),
            transformers: Vec::new(),
            handlers: HashMap::new(),
        }
    }
    
    // HOF pour ajouter des validators
    fn with_validator<F>(mut self, validator: F) -> Self
    where
        F: Fn(&Order) -> Result<(), String> + 'static,
    {
        self.validators.push(Box::new(validator));
        self
    }
    
    // HOF pour ajouter des transformers
    fn with_transformer<F>(mut self, transformer: F) -> Self
    where
        F: Fn(Order) -> Order + 'static,
    {
        self.transformers.push(Box::new(transformer));
        self
    }
    
    // HOF pour ajouter des handlers
    fn with_handler<F>(mut self, event: &str, handler: F) -> Self
    where
        F: Fn(&Order) + 'static,
    {
        self.handlers.insert(event.to_string(), Box::new(handler));
        self
    }
    
    fn process(&self, mut order: Order) -> Result<Order, String> {
        // Validation
        for validator in &self.validators {
            validator(&order)?;
        }
        
        // Transformation
        for transformer in &self.transformers {
            order = transformer(order);
        }
        
        // Event handling
        if let Some(handler) = self.handlers.get("processed") {
            handler(&order);
        }
        
        Ok(order)
    }
}

fn order_processing_example() {
    let processor = OrderProcessor::new()
        .with_validator(|order| {
            if order.amount <= 0.0 {
                Err("Le montant doit être positif".to_string())
            } else {
                Ok(())
            }
        })
        .with_validator(|order| {
            if order.customer.is_empty() {
                Err("Le client est requis".to_string())
            } else {
                Ok(())
            }
        })
        .with_transformer(|mut order| {
            // Ajouter des frais de service
            order.amount = (order.amount * 1.05).round() / 100.0 * 100.0;
            order
        })
        .with_transformer(|mut order| {
            // Normaliser le nom du client
            order.customer = order.customer.to_uppercase();
            order
        })
        .with_handler("processed", |order| {
            println!("📦 Commande traitée: {} pour {} ({}€)", 
                     order.id, order.customer, order.amount);
        });
    
    let order = Order {
        id: "ORD-001".to_string(),
        amount: 99.99,
        customer: "alice dupont".to_string(),
        items: vec!["item1".to_string(), "item2".to_string()],
    };
    
    match processor.process(order) {
        Ok(processed_order) => {
            println!("✅ Commande traitée avec succès: {:?}", processed_order);
        }
        Err(e) => {
            println!("❌ Erreur de traitement: {}", e);
        }
    }
}

fn main() {
    decorator_example();
    println!("---");
    validation_example();
    println!("---");
    iterator_hof_examples();
    println!("---");
    event_system_example();
    println!("---");
    pipeline_example();
    println!("---");
    order_processing_example();
}
```

---

**Conclusion :** Les higher-order functions en Rust offrent une puissance énorme pour créer des abstractions flexibles et réutilisables. Maîtrise-les pour écrire du code fonctionnel expressif et performant !
