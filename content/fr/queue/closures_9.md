---
id: storing-closures-in-structs-fr
title: >-
  Comment stocker une closure dans une struct ?
slug: storing-closures-in-structs-fr
locale: "fr"
author: mayo
excerpt: >-
  Stocker des closures dans des structs en utilisant des paramètres génériques, trait objects, et
  annotations de lifetime avec les bounds Fn, FnMut, et FnOnce

tags:
  - rust
  - closures
  - structs
  - trait-bounds
  - lifetimes
  - generic-types
date: '2025-07-14'
---

# Comment stocker une closure dans une struct ? Quels trait bounds et annotations de lifetime sont requis ?

Stocker une closure dans une struct nécessite de spécifier des trait bounds (`Fn`, `FnMut`, `FnOnce`) et potentiellement des lifetimes si la closure capture des références. Voici comment faire :

## 1. Struct Générique (Static Dispatch)

Utilise un paramètre de type générique avec des bounds `Fn`/`FnMut`/`FnOnce`. Idéal pour des types de closures fixes.

### Exemple : Trait Fn

```rust
struct Processor<F>
where
    F: Fn(i32) -> i32, // Trait bound pour le type de closure
{
    operation: F,
    value: i32,
}

impl<F> Processor<F>
where
    F: Fn(i32) -> i32,
{
    fn run(&self) -> i32 {
        (self.operation)(self.value)
    }
}

fn main() {
    let adder = Processor {
        operation: |x| x + 5, // Closure capturée par valeur
        value: 10,
    };
    println!("{}", adder.run()); // 15
}
```

### Points Clés
- **Overhead runtime zéro** : Monomorphized pour chaque type de closure.
- **Type de closure fixe** : Ne peut pas stocker différentes closures dans la même struct.

## 2. Trait Object (Dynamic Dispatch)

Utilise `Box<dyn Fn...>` pour stocker des closures hétérogènes. Nécessite une allocation heap.

### Exemple : Box&lt;dyn Fn&gt;

```rust
struct DynamicProcessor<'a> {
    operation: Box<dyn Fn(i32) -> i32 + 'a>, // Trait object avec lifetime optionnel
    value: i32,
}

impl<'a> DynamicProcessor<'a> {
    fn run(&self) -> i32 {
        (self.operation)(self.value)
    }
}

fn main() {
    let multiplier = 2;
    let processor = DynamicProcessor {
        operation: Box::new(|x| x * multiplier), // Capture `multiplier`
        value: 10,
    };
    println!("{}", processor.run()); // 20
}
```

### Points Clés
- **Annotation de lifetime** : Requise si la closure capture des références (ex : `Box<dyn Fn() -> &str + 'a>`).
- **Flexibilité** : Peut stocker n'importe quelle closure correspondant au trait.
- **Overhead** : Vtable lookup (dynamic dispatch).

## 3. Exemples Avancés de Storage

### Closures Stateful avec FnMut

```rust
struct Counter<F>
where
    F: FnMut() -> i32,
{
    increment: F,
    current: i32,
}

impl<F> Counter<F>
where
    F: FnMut() -> i32,
{
    fn new(increment: F) -> Self {
        Self {
            increment,
            current: 0,
        }
    }
    
    fn next(&mut self) -> i32 {
        self.current += (self.increment)();
        self.current
    }
}

fn counter_example() {
    let mut step = 1;
    let mut counter = Counter::new(move || {
        let current_step = step;
        step += 1; // Mute l'état capturé
        current_step
    });
    
    println!("Count 1: {}", counter.next()); // 1
    println!("Count 2: {}", counter.next()); // 3 (1+2)
    println!("Count 3: {}", counter.next()); // 6 (3+3)
}
```

### Multiple Closures dans une Struct

```rust
struct EventHandler<F1, F2, F3>
where
    F1: Fn(&str),           // OnStart
    F2: FnMut(&str) -> bool, // OnProcess (returns continue flag)
    F3: FnOnce(),           // OnComplete
{
    on_start: F1,
    on_process: F2,
    on_complete: Option<F3>, // Option car FnOnce ne peut être appelée qu'une fois
}

impl<F1, F2, F3> EventHandler<F1, F2, F3>
where
    F1: Fn(&str),
    F2: FnMut(&str) -> bool,
    F3: FnOnce(),
{
    fn new(on_start: F1, on_process: F2, on_complete: F3) -> Self {
        Self {
            on_start,
            on_process,
            on_complete: Some(on_complete),
        }
    }
    
    fn handle_event(&mut self, event: &str) {
        (self.on_start)(event);
        
        let should_continue = (self.on_process)(event);
        
        if !should_continue {
            if let Some(complete_handler) = self.on_complete.take() {
                complete_handler(); // Consomme la closure FnOnce
            }
        }
    }
}

fn multiple_closures_example() {
    let mut processed_count = 0;
    
    let mut handler = EventHandler::new(
        |event| println!("🚀 Starting: {}", event),
        |event| {
            processed_count += 1;
            println!("⚙️  Processing: {} (count: {})", event, processed_count);
            processed_count < 3 // Continue jusqu'à 3 events
        },
        || println!("✅ Completed processing"),
    );
    
    handler.handle_event("event1");
    handler.handle_event("event2");
    handler.handle_event("event3"); // Déclenche completion
}
```

### Collections de Closures Hétérogènes

```rust
struct Pipeline {
    steps: Vec<Box<dyn FnMut(i32) -> i32>>,
}

impl Pipeline {
    fn new() -> Self {
        Self { steps: Vec::new() }
    }
    
    fn add_step<F>(mut self, step: F) -> Self
    where
        F: FnMut(i32) -> i32 + 'static,
    {
        self.steps.push(Box::new(step));
        self
    }
    
    fn execute(&mut self, input: i32) -> i32 {
        self.steps.iter_mut().fold(input, |acc, step| step(acc))
    }
}

fn pipeline_example() {
    let mut counter = 0;
    
    let mut pipeline = Pipeline::new()
        .add_step(|x| x * 2)           // Multiply by 2
        .add_step(|x| x + 10)          // Add 10
        .add_step(move |x| {           // Stateful step
            counter += 1;
            println!("Step {} processing: {}", counter, x);
            x
        })
        .add_step(|x| if x > 50 { x - 20 } else { x }); // Conditional
    
    println!("Result 1: {}", pipeline.execute(5));  // ((5*2)+10) = 20
    println!("Result 2: {}", pipeline.execute(15)); // ((15*2)+10) = 40
    println!("Result 3: {}", pipeline.execute(25)); // ((25*2)+10-20) = 40
}
```

## 4. Capturer des Références (Lifetimes)

Si la closure capture des références, la struct doit déclarer des lifetimes pour assurer la validité :

```rust
struct RefProcessor<'a, F>
where
    F: Fn(&'a str) -> &'a str, // Lifetime lié à input/output
{
    process: F,
    data: &'a str,
}

impl<'a, F> RefProcessor<'a, F>
where
    F: Fn(&'a str) -> &'a str,
{
    fn new(process: F, data: &'a str) -> Self {
        Self { process, data }
    }
    
    fn run(&self) -> &'a str {
        (self.process)(self.data)
    }
}

fn reference_example() {
    let data = "hello world";
    let processor = RefProcessor::new(
        |s| &s[6..], // Retourne "world"
        data
    );
    
    println!("Processed: {}", processor.run()); // "world"
    
    // `data` doit survivre au `processor`
}
```

### Exemple Plus Complexe avec Multiple Lifetimes

```rust
struct DataTransformer<'a, 'b, F>
where
    F: Fn(&'a str, &'b str) -> String,
{
    transform: F,
    source: &'a str,
    template: &'b str,
}

impl<'a, 'b, F> DataTransformer<'a, 'b, F>
where
    F: Fn(&'a str, &'b str) -> String,
{
    fn new(transform: F, source: &'a str, template: &'b str) -> Self {
        Self {
            transform,
            source,
            template,
        }
    }
    
    fn execute(&self) -> String {
        (self.transform)(self.source, self.template)
    }
}

fn multiple_lifetimes_example() {
    let source_data = "John Doe";
    let template_string = "Hello, {}!";
    
    let transformer = DataTransformer::new(
        |source, template| {
            template.replace("{}", source)
        },
        source_data,
        template_string,
    );
    
    println!("{}", transformer.execute()); // "Hello, John Doe!"
}
```

## 5. Patterns Avancés de Storage

### Builder Pattern avec Closures

```rust
struct ServiceBuilder<F1, F2>
where
    F1: Fn(&str) -> bool,  // Validator
    F2: Fn(&str) -> String, // Transformer
{
    validator: Option<F1>,
    transformer: Option<F2>,
    name: String,
}

impl<F1, F2> ServiceBuilder<F1, F2>
where
    F1: Fn(&str) -> bool,
    F2: Fn(&str) -> String,
{
    fn new(name: String) -> ServiceBuilder<fn(&str) -> bool, fn(&str) -> String> {
        ServiceBuilder {
            validator: None,
            transformer: None,
            name,
        }
    }
    
    fn with_validator<V>(self, validator: V) -> ServiceBuilder<V, F2>
    where
        V: Fn(&str) -> bool,
    {
        ServiceBuilder {
            validator: Some(validator),
            transformer: self.transformer,
            name: self.name,
        }
    }
    
    fn with_transformer<T>(self, transformer: T) -> ServiceBuilder<F1, T>
    where
        T: Fn(&str) -> String,
    {
        ServiceBuilder {
            validator: self.validator,
            transformer: Some(transformer),
            name: self.name,
        }
    }
}

fn builder_pattern_example() {
    let service = ServiceBuilder::new("EmailService".to_string())
        .with_validator(|email| email.contains('@') && email.contains('.'))
        .with_transformer(|email| email.to_lowercase());
    
    println!("Service: {}", service.name);
    
    if let Some(ref validator) = service.validator {
        println!("test@example.com is valid: {}", validator("test@example.com"));
    }
    
    if let Some(ref transformer) = service.transformer {
        println!("Transformed: {}", transformer("TEST@EXAMPLE.COM"));
    }
}
```

### State Machine avec Closures

```rust
use std::collections::HashMap;

struct StateMachine<S, E, F>
where
    S: Clone + Eq + std::hash::Hash + std::fmt::Debug,
    E: Clone + std::fmt::Debug,
    F: FnMut(&S, &E) -> S,
{
    current_state: S,
    transition: F,
    history: Vec<(S, E, S)>, // (from, event, to)
}

impl<S, E, F> StateMachine<S, E, F>
where
    S: Clone + Eq + std::hash::Hash + std::fmt::Debug,
    E: Clone + std::fmt::Debug,
    F: FnMut(&S, &E) -> S,
{
    fn new(initial_state: S, transition: F) -> Self {
        Self {
            current_state: initial_state,
            transition,
            history: Vec::new(),
        }
    }
    
    fn handle_event(&mut self, event: E) -> &S {
        let old_state = self.current_state.clone();
        let new_state = (self.transition)(&self.current_state, &event);
        
        println!("Transition: {:?} --{:?}--> {:?}", old_state, event, new_state);
        
        self.history.push((old_state, event, new_state.clone()));
        self.current_state = new_state;
        
        &self.current_state
    }
    
    fn get_state(&self) -> &S {
        &self.current_state
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
enum ConnectionState {
    Disconnected,
    Connecting,
    Connected,
    Error,
}

#[derive(Debug, Clone)]
enum ConnectionEvent {
    Connect,
    Connected,
    Disconnect,
    Timeout,
    Error,
}

fn state_machine_example() {
    let mut connection = StateMachine::new(
        ConnectionState::Disconnected,
        |state, event| {
            use ConnectionState::*;
            use ConnectionEvent::*;
            
            match (state, event) {
                (Disconnected, Connect) => Connecting,
                (Connecting, Connected) => Connected,
                (Connecting, Timeout) => Error,
                (Connected, Disconnect) => Disconnected,
                (Error, Connect) => Connecting,
                _ => state.clone(), // No transition
            }
        },
    );
    
    // Test sequence
    connection.handle_event(ConnectionEvent::Connect);
    connection.handle_event(ConnectionEvent::Connected);
    connection.handle_event(ConnectionEvent::Disconnect);
    connection.handle_event(ConnectionEvent::Connect);
    connection.handle_event(ConnectionEvent::Timeout);
    
    println!("Final state: {:?}", connection.get_state());
    println!("History: {} transitions", connection.history.len());
}
```

### Cache avec Closures

```rust
use std::collections::HashMap;
use std::hash::Hash;

struct Cache<K, V, F>
where
    K: Clone + Eq + Hash,
    V: Clone,
    F: FnMut(&K) -> V,
{
    data: HashMap<K, V>,
    loader: F,
    stats: CacheStats,
}

#[derive(Debug, Default)]
struct CacheStats {
    hits: usize,
    misses: usize,
}

impl<K, V, F> Cache<K, V, F>
where
    K: Clone + Eq + Hash,
    V: Clone,
    F: FnMut(&K) -> V,
{
    fn new(loader: F) -> Self {
        Self {
            data: HashMap::new(),
            loader,
            stats: CacheStats::default(),
        }
    }
    
    fn get(&mut self, key: &K) -> V {
        if let Some(value) = self.data.get(key) {
            self.stats.hits += 1;
            value.clone()
        } else {
            self.stats.misses += 1;
            let value = (self.loader)(key);
            self.data.insert(key.clone(), value.clone());
            value
        }
    }
    
    fn stats(&self) -> &CacheStats {
        &self.stats
    }
    
    fn clear(&mut self) {
        self.data.clear();
        self.stats = CacheStats::default();
    }
}

fn cache_example() {
    // Cache avec closure qui "calcule" des valeurs coûteuses
    let mut cache = Cache::new(|key: &String| {
        println!("Computing expensive operation for: {}", key);
        std::thread::sleep(std::time::Duration::from_millis(100)); // Simulate work
        format!("result_for_{}", key)
    });
    
    // Test du cache
    let keys = vec!["a".to_string(), "b".to_string(), "a".to_string(), "c".to_string(), "b".to_string()];
    
    for key in keys {
        let start = std::time::Instant::now();
        let result = cache.get(&key);
        let duration = start.elapsed();
        println!("Key: {}, Result: {}, Time: {:?}", key, result, duration);
    }
    
    println!("Cache stats: {:?}", cache.stats());
    // Expected: 3 misses (a, b, c), 2 hits (a, b)
}
```

## Quand Utiliser Chaque Approche

| Approche | Cas d'Usage | Trade-Offs |
|----------|-------------|------------|
| Générique (impl Fn) | Haute performance, type de closure fixe | Moins flexible, binary bloat |
| Trait Object | Comportement dynamique, closures multiples | Overhead runtime, heap allocation |
| Lifetime Annotated | Closures capturant des références | Assure la sécurité, ajoute complexité |

### Matrice de Décision

```rust
// Guide de décision pour stocker des closures
fn decision_guide() {
    // ✅ Utilise Generic quand:
    // - Performance critique
    // - Type de closure connu au moment de la compilation
    // - Pas besoin de changer la closure après construction
    
    struct FastProcessor<F: Fn(i32) -> i32> {
        op: F,
    }
    
    // ✅ Utilise Trait Object quand:
    // - Besoin de flexibilité runtime
    // - Multiple types de closures possibles
    // - Configuration dynamique
    
    struct FlexibleProcessor {
        op: Box<dyn Fn(i32) -> i32>,
    }
    
    // ✅ Utilise Lifetimes quand:
    // - Closure capture des références
    // - Données empruntées depuis l'extérieur
    // - Éviter les allocations inutiles
    
    struct BorrowingProcessor<'a, F: Fn(&'a str) -> &'a str> {
        op: F,
        data: &'a str,
    }
}
```

## Erreurs Courantes et Solutions

### 1. Oublier le Trait Bound

```rust
// ❌ Erreur: trait bound manquant
/*
struct BadProcessor<F> {
    operation: F, // ERREUR: F n'a pas de bounds
}
*/

// ✅ Solution: ajouter trait bound
struct GoodProcessor<F>
where
    F: Fn(i32) -> i32,
{
    operation: F,
}
```

### 2. Lifetime Mismatch

```rust
// ❌ Problématique: lifetime insuffisant
fn lifetime_issues() {
    /*
    fn create_processor() -> RefProcessor<'???, ???> {
        let data = "local data";
        RefProcessor::new(|s| s, data) // ERREUR: data doesn't live long enough
    }
    */
    
    // ✅ Solution: utiliser owned data ou static lifetime
    fn create_processor() -> impl Fn(&str) -> String {
        |s| s.to_string() // Convert to owned
    }
}
```

### 3. Mutable Borrow Issues

```rust
// Gérer les closures FnMut correctement
struct MutableProcessor<F>
where
    F: FnMut() -> i32,
{
    operation: F,
}

impl<F> MutableProcessor<F>
where
    F: FnMut() -> i32,
{
    fn new(operation: F) -> Self {
        Self { operation }
    }
    
    fn run(&mut self) -> i32 { // &mut self requis pour FnMut
        (self.operation)()
    }
}

fn mutable_example() {
    let mut counter = 0;
    let mut processor = MutableProcessor::new(|| {
        counter += 1;
        counter
    });
    
    println!("Run 1: {}", processor.run()); // 1
    println!("Run 2: {}", processor.run()); // 2
}
```

## Points Clés

✅ **Structs génériques : Meilleures pour performance et static dispatch.**  
✅ **Trait objects : Utilise quand tu stockes des closures hétérogènes.**  
✅ **Lifetimes : Requis si la closure capture des références.**

### Règles Pratiques

1. **Performance first** → Generic avec trait bounds
2. **Flexibilité needed** → Box<dyn Trait>
3. **References captured** → Explicit lifetimes
4. **Mutable state** → FnMut avec &mut self
5. **One-time use** → FnOnce avec Option<F>

**Essaie Ceci** : Que se passe-t-il si une closure capture une référence `&mut` et est stockée dans une struct ?  
**Réponse** : La struct doit être `mut`, et la closure doit implémenter `FnMut` !

## Exemple Pratique Complet

```rust
use std::collections::HashMap;

// Système de plugins avec closures stockées
struct PluginSystem<'a> {
    plugins: HashMap<String, Box<dyn FnMut(&str) -> String + 'a>>,
    middleware: Vec<Box<dyn Fn(&str, &str) -> String + 'a>>,
}

impl<'a> PluginSystem<'a> {
    fn new() -> Self {
        Self {
            plugins: HashMap::new(),
            middleware: Vec::new(),
        }
    }
    
    fn register_plugin<F>(&mut self, name: &str, plugin: F)
    where
        F: FnMut(&str) -> String + 'a,
    {
        self.plugins.insert(name.to_string(), Box::new(plugin));
    }
    
    fn add_middleware<F>(&mut self, middleware: F)
    where
        F: Fn(&str, &str) -> String + 'a,
    {
        self.middleware.push(Box::new(middleware));
    }
    
    fn execute(&mut self, plugin_name: &str, input: &str) -> Option<String> {
        if let Some(plugin) = self.plugins.get_mut(plugin_name) {
            let mut result = plugin(input);
            
            // Apply middleware
            for middleware in &self.middleware {
                result = middleware(plugin_name, &result);
            }
            
            Some(result)
        } else {
            None
        }
    }
}

fn plugin_system_example() {
    let mut system = PluginSystem::new();
    
    // Register plugins avec différentes closures
    let mut counter = 0;
    system.register_plugin("counter", move |_input| {
        counter += 1;
        format!("Count: {}", counter)
    });
    
    system.register_plugin("uppercase", |input| {
        input.to_uppercase()
    });
    
    system.register_plugin("reverse", |input| {
        input.chars().rev().collect()
    });
    
    // Add middleware
    system.add_middleware(|plugin_name, result| {
        format!("[{}] {}", plugin_name, result)
    });
    
    system.add_middleware(|_plugin_name, result| {
        format!("🔧 {}", result)
    });
    
    // Test le système
    println!("{:?}", system.execute("counter", "test"));     // Some("🔧 [counter] Count: 1")
    println!("{:?}", system.execute("uppercase", "hello"));  // Some("🔧 [uppercase] HELLO")
    println!("{:?}", system.execute("reverse", "world"));    // Some("🔧 [reverse] dlrow")
    println!("{:?}", system.execute("counter", "test"));     // Some("🔧 [counter] Count: 2")
    println!("{:?}", system.execute("missing", "test"));     // None
}

fn main() {
    counter_example();
    println!("---");
    multiple_closures_example();
    println!("---");
    pipeline_example();
    println!("---");
    state_machine_example();
    println!("---");
    cache_example();
    println!("---");
    plugin_system_example();
}
```

---

**Conclusion :** Stocker des closures dans des structs offre une flexibilité énorme pour créer des architectures modulaires et expressives. Choisis l'approche selon vos besoins de performance, flexibilité et sécurité des lifetimes !