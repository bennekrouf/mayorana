---
id: handling-lifetimes-returning-closures-fr
title: >-
  Comment gérer les lifetimes lors du retour d'une closure qui capture des
  variables de son environnement ?
slug: handling-lifetimes-returning-closures-fr
locale: fr
author: mayo
excerpt: >-
  Gérer les lifetimes lors du retour de closures qui capturent des variables,
  couvrant le transfert d'ownership, les annotations de lifetime, et éviter les
  dangling references en Rust
tags:
  - rust
  - closures
  - lifetimes
  - ownership
  - move
  - references
date: '2025-11-09'
---

# Comment gérer les lifetimes lors du retour d'une closure qui capture des variables de son environnement ?

Quand on retourne une closure qui capture des variables (spécialement des références), tu dois assurer que les données capturées survivent à la closure. Rust applique ceci à travers les annotations de lifetime et les règles d'ownership. Voici comment le gérer :

<div class="svg-container" style="margin:2rem 0;">
<svg class="cl7-fig" viewBox="0 0 800 230" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Déplacer des données owned dans une closure retournée est sûr ; une référence capturée vers une variable locale devient dangling">
<!-- style -->
<style>
.cl7-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .cl7-fig,[data-theme="dark"] .cl7-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cl7-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.cl7-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.cl7-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.cl7-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl7-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.cl7-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="cl7arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
</defs>
<!-- title -->
<text x="400" y="16" text-anchor="middle" class="ti">Déplace les données owned ; jamais de closure survivant à une référence</text>
<!-- box1 -->
<rect x="300" y="26" width="200" height="50" rx="6" class="box"/>
<text x="400" y="47" text-anchor="middle" class="tx">fn f() -&gt; impl Fn() -&gt; ...</text>
<text x="400" y="63" text-anchor="middle" class="mut">capture une variable locale</text>
<!-- fork -->
<path d="M400,76 L400,96 L230,96 L230,116" class="ln" marker-end="url(#cl7arrow)"/>
<path d="M400,96 L590,96 L590,116" class="ln" marker-end="url(#cl7arrow)"/>
<!-- safe -->
<rect x="60" y="116" width="340" height="84" rx="6" class="boxac"/>
<text x="230" y="140" text-anchor="middle" class="tx">move || s (String owned)</text>
<text x="230" y="158" text-anchor="middle" class="mut">sûr : la closure possède les données</text>
<text x="230" y="174" text-anchor="middle" class="mut">aucune dépendance au frame appelant</text>
<!-- dangling -->
<rect x="420" y="116" width="340" height="84" rx="6" class="box"/>
<text x="590" y="140" text-anchor="middle" class="tx">move || &amp;local</text>
<text x="590" y="158" text-anchor="middle" class="mut">ERREUR : `local` droppée en fin de fn</text>
<text x="590" y="174" text-anchor="middle" class="mut">le compilateur rejette la dangling ref</text>
</svg>
</div>

## Stratégies Clés

### Utiliser move pour Transférer l'Ownership

Forcer la closure à prendre ownership des variables capturées, éliminant la dépendance aux lifetimes externes :

```rust
fn create_closure() -> impl Fn() -> String {
    let s = String::from("hello"); // Données owned
    move || s.clone() // `move` capture `s` par valeur
}
```

### Annote les Lifetimes pour les Références Capturées

Si tu captures des références, lie explicitement le lifetime de la closure aux données d'entrée :

```rust
fn capture_ref<'a>(s: &'a str) -> impl Fn() -> &'a str + 'a {
    move || s // Output de la closure lié à `'a`
}
```

Ce seul `'a` fait trois choses à la fois : il nomme la durée de validité de l'emprunt d'entrée, il borne la durée de vie de la closure elle-même, et il marque la référence que la closure renvoie. Les trois spans doivent tenir à l'intérieur des données de l'appelant :

<div class="svg-container" style="margin:2rem 0;">
<svg class="cl7b-fig" viewBox="0 0 800 300" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Spans de lifetime imbriqués montrant les données de l'appelant survivant à l'emprunt, à la closure retournée et à la référence qu'elle renvoie">
<!-- style -->
<style>
.cl7b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .cl7b-fig,[data-theme="dark"] .cl7b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cl7b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.cl7b-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.cl7b-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.cl7b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl7b-fig .lb{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl7b-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.cl7b-fig .acx{fill:var(--ac);font:700 11px ui-sans-serif,system-ui,sans-serif}
.cl7b-fig .lim{stroke:var(--ac);stroke-width:1.5;stroke-dasharray:5 4;fill:none}
</style>
<!-- title -->
<text x="400" y="18" text-anchor="middle" class="ti">Un seul `'a`, trois spans imbriqués — tous doivent finir avant la donnée</text>
<!-- signature -->
<rect x="190" y="30" width="420" height="34" rx="6" class="boxac"/>
<text x="400" y="52" text-anchor="middle" class="tx">fn capture_ref&lt;'a&gt;(s: &amp;'a str) -&gt; impl Fn() -&gt; &amp;'a str + 'a</text>
<!-- limit marker -->
<path d="M772,84 L772,252" class="lim"/>
<text x="772" y="78" text-anchor="end" class="acx">donnée droppée ici</text>
<!-- lane 1 -->
<text x="265" y="110" text-anchor="end" class="lb">String de l'appelant</text>
<rect x="280" y="90" width="492" height="30" rx="4" class="box"/>
<text x="526" y="110" text-anchor="middle" class="mut">la seule chose qui possède vraiment des octets</text>
<!-- lane 2 -->
<text x="265" y="152" text-anchor="end" class="lb">s: &amp;'a str</text>
<rect x="300" y="132" width="462" height="30" rx="4" class="box"/>
<text x="531" y="152" text-anchor="middle" class="mut">emprunt confié à la fonction</text>
<!-- lane 3 -->
<text x="265" y="194" text-anchor="end" class="lb">closure + 'a</text>
<rect x="320" y="174" width="400" height="30" rx="4" class="boxac"/>
<text x="520" y="194" text-anchor="middle" class="mut">ne peut plus être appelée après cette barre</text>
<!-- lane 4 -->
<text x="265" y="236" text-anchor="end" class="lb">valeur renvoyée</text>
<rect x="340" y="216" width="340" height="30" rx="4" class="box"/>
<text x="510" y="236" text-anchor="middle" class="mut">&amp;'a str, le même emprunt qui ressort</text>
<!-- caption -->
<text x="400" y="280" text-anchor="middle" class="mut">Retire la borne `+ 'a` et la closure peut s'échapper au-delà de la barre — d'où l'erreur.</text>
</svg>
</div>

### Evite de Retourner des Closures Capturant des Références Courtes

Les closures capturant des références à des variables locales ne peuvent pas échapper à leur scope :

```rust
// ERREUR: `s` does not live long enough!
fn invalid_closure() -> impl Fn() -> &str {
    let s = String::from("hello");
    move || &s // `s` meurt à la fin de la fonction
}
```

## Exemples Avancés de Gestion de Lifetimes

### 1. Ownership vs Borrowing

```rust
// ✅ Correct: Closure possède les données capturées
fn safe_owned_closure() -> impl Fn() -> String {
    let s = String::from("hello");
    move || {
        println!("Accessing owned data");
        s.clone() // `s` est owned par la closure
    }
}

// ✅ Correct: Closure liée au lifetime de la référence d'entrée
fn safe_borrowed_closure<'a>(s: &'a str) -> impl Fn() -> &'a str + 'a {
    move || {
        println!("Accessing borrowed data");
        s // Closure's lifetime correspond à `s`
    }
}

// ❌ Incorrect: Essaie de retourner une référence à des données locales
fn unsafe_closure() -> impl Fn() -> &'static str {
    let local = String::from("oops");
    // move || &local // ERREUR: `local` meurt ici
    move || "fallback" // Contournement avec string littéral
}

fn ownership_examples() {
    // Test owned closure
    let owned_closure = safe_owned_closure();
    println!("Owned result: {}", owned_closure());
    
    // Test borrowed closure
    let data = "borrowed data";
    let borrowed_closure = safe_borrowed_closure(data);
    println!("Borrowed result: {}", borrowed_closure());
    
    // `data` doit survivre au-delà de borrowed_closure
}
```

### 2. Complex Lifetime Scenarios

```rust
// Closure qui capture multiple références avec différents lifetimes
fn multi_lifetime_closure<'a, 'b>(
    name: &'a str, 
    value: &'b str
) -> impl Fn() -> String + 'a + 'b 
where 
    'a: 'b, // `name` doit vivre au moins aussi longtemps que `value`
{
    move || format!("{}: {}", name, value)
}

// Closure avec lifetime elision
fn simple_ref_closure(data: &str) -> impl Fn() -> &str + '_ {
    move |_| data // `'_` inféré du paramètre `data`
}

// Closure retournant une référence avec lifetime compliqué
fn process_data<'a>(data: &'a [i32]) -> impl Fn(usize) -> Option<&'a i32> + 'a {
    move |index| {
        data.get(index) // Retourne référence avec même lifetime que `data`
    }
}

fn complex_lifetimes_example() {
    let name = "counter";
    let value = "42";
    
    let closure = multi_lifetime_closure(name, value);
    println!("Multi-lifetime: {}", closure());
    
    // Process data example
    let numbers = vec![1, 2, 3, 4, 5];
    let processor = process_data(&numbers);
    
    match processor(2) {
        Some(val) => println!("Found value: {}", val),
        None => println!("Index out of bounds"),
    }
    
    // `numbers` doit survivre au processor
}
```

### 3. Closures avec État et Lifetimes

```rust
use std::collections::HashMap;

// Closure stateful qui capture des références
fn create_counter<'a>(name: &'a str) -> impl FnMut() -> String + 'a {
    let mut count = 0;
    let name_owned = name.to_string(); // Convert to owned pour éviter lifetime issues
    
    move || {
        count += 1;
        format!("{}: {}", name_owned, count)
    }
}

// Factory pour closures avec lifetime constraints
fn create_validator<'a>(
    valid_values: &'a [&'a str]
) -> impl Fn(&str) -> bool + 'a {
    move |input| {
        valid_values.contains(&input)
    }
}

// Closure qui capture un HashMap avec lifetimes
fn create_lookup<'a>(
    map: &'a HashMap<String, i32>
) -> impl Fn(&str) -> Option<i32> + 'a {
    move |key| {
        map.get(key).copied() // `.copied()` pour éviter de retourner &i32
    }
}

fn stateful_lifetimes_example() {
    // Counter example
    let counter_name = "requests";
    let mut counter = create_counter(counter_name);
    
    for _ in 0..3 {
        println!("{}", counter());
    }
    
    // Validator example
    let valid_statuses = vec!["active", "inactive", "pending"];
    let validator = create_validator(&valid_statuses);
    
    let test_values = vec!["active", "deleted", "pending"];
    for value in test_values {
        println!("'{}' is valid: {}", value, validator(value));
    }
    
    // Lookup example
    let mut scores = HashMap::new();
    scores.insert("alice".to_string(), 95);
    scores.insert("bob".to_string(), 87);
    
    let lookup = create_lookup(&scores);
    
    for name in &["alice", "bob", "charlie"] {
        match lookup(name) {
            Some(score) => println!("{}: {}", name, score),
            None => println!("{}: not found", name),
        }
    }
    
    // `valid_statuses` et `scores` doivent survivre aux closures
}
```

## Gestion des Erreurs de Lifetime

### 1. Diagnostic des Problèmes Courants

```rust
// Exemple d'erreurs communes et leurs solutions

// ❌ Problème: Référence à une variable locale
fn lifetime_error_1() {
    // Cette fonction ne compile pas
    /*
    fn bad_closure() -> impl Fn() -> &str {
        let local_string = String::from("temporary");
        move || &local_string // ERREUR: local_string dropped
    }
    */
    
    // ✅ Solution 1: Retourner owned data
    fn good_closure_owned() -> impl Fn() -> String {
        let local_string = String::from("temporary");
        move || local_string.clone() // Clone pour ownership
    }
    
    // ✅ Solution 2: Utiliser string literals (lifetime 'static)
    fn good_closure_static() -> impl Fn() -> &'static str {
        move || "static string" // Lifetime 'static
    }
    
    let closure1 = good_closure_owned();
    let closure2 = good_closure_static();
    
    println!("Owned: {}", closure1());
    println!("Static: {}", closure2());
}

// ❌ Problème: Lifetime mismatch
fn lifetime_error_2() {
    // Cette approche peut causer des problèmes
    fn problematic<'a>(data: &'a str, flag: bool) -> Box<dyn Fn() -> &'a str + 'a> {
        if flag {
            // OK: capture directement `data`
            Box::new(move || data)
        } else {
            // Problématique: créer une nouvelle référence
            let processed = data.to_uppercase();
            // Box::new(move || &processed) // ERREUR: processed dropped
            
            // ✅ Solution: retourner owned data au lieu de référence
            Box::new(move || {
                Box::leak(processed.into_boxed_str()) // Force 'static lifetime
            })
        }
    }
    
    let input = "hello world";
    let closure = problematic(input, false);
    println!("Result: {}", closure());
}
```

### 2. Patterns de Contournement

```rust
// Pattern 1: Arc pour partage de données
use std::sync::Arc;

fn shared_data_closure() -> impl Fn() -> String {
    let data = Arc::new(String::from("shared data"));
    
    move || {
        format!("Accessing: {}", data)
    }
}

// Pattern 2: Closure factory avec données owned
fn closure_factory(initial_data: Vec<String>) -> impl Fn(usize) -> Option<String> {
    move |index| {
        initial_data.get(index).cloned()
    }
}

// Pattern 3: Callback avec lifetime bounds
fn with_callback<'a, F, R>(data: &'a str, callback: F) -> R
where
    F: FnOnce(&'a str) -> R,
{
    callback(data)
}

fn workaround_patterns() {
    // Shared data
    let shared_closure = shared_data_closure();
    println!("{}", shared_closure());
    
    // Factory pattern
    let data = vec!["first".to_string(), "second".to_string()];
    let accessor = closure_factory(data);
    
    println!("Index 0: {:?}", accessor(0));
    println!("Index 5: {:?}", accessor(5));
    
    // Callback pattern
    let result = with_callback("test data", |s| {
        format!("Processed: {}", s.to_uppercase())
    });
    println!("Callback result: {}", result);
}
```

## Exemple: Gestion Sûre des Lifetimes

```rust
// ✅ Correct: Closure possède les données capturées
fn safe_closure() -> impl Fn() -> String {
    let s = String::from("hello");
    move || s.clone() // `s` est moved dans la closure (owned)
}

// ✅ Correct: Closure liée au lifetime de la référence d'entrée
fn capture_with_lifetime<'a>(s: &'a str) -> impl Fn() -> &'a str + 'a {
    move || s // Lifetime de la closure correspond à `s`
}

// ✅ Correct: Multiple références avec annotations explicites
fn complex_capture<'a, 'b>(
    name: &'a str, 
    data: &'b [i32]
) -> impl Fn() -> String + 'a + 'b {
    move || {
        format!("{}: {} items", name, data.len())
    }
}

fn safe_examples() {
    // Test safe owned closure
    let owned = safe_closure();
    println!("Safe owned: {}", owned());
    
    // Test lifetime-bound closure
    let text = "lifetime test";
    let borrowed = capture_with_lifetime(text);
    println!("Safe borrowed: {}", borrowed());
    
    // Test complex capture
    let name = "dataset";
    let numbers = vec![1, 2, 3, 4, 5];
    let complex = complex_capture(name, &numbers);
    println!("Complex: {}", complex());
    
    // Toutes les données doivent survivre aux closures
}
```

## Pièges de Lifetime

### Dangling References

Retourner une closure qui capture une référence à une variable locale échouera :

```rust
fn demonstrate_pitfalls() {
    // ❌ Dangling reference
    /*
    fn dangling_closure() -> impl Fn() -> &str {
        let local = String::from("oops");
        move || &local // ERREUR: `local` meurt ici
    }
    */
    
    // ✅ Solutions
    fn fixed_with_owned() -> impl Fn() -> String {
        let local = String::from("fixed");
        move || local // Move ownership
    }
    
    fn fixed_with_static() -> impl Fn() -> &'static str {
        move || "static data" // Static lifetime
    }
    
    let closure1 = fixed_with_owned();
    let closure2 = fixed_with_static();
    
    println!("Fixed owned: {}", closure1());
    println!("Fixed static: {}", closure2());
}
```

### Ambiguïté d'Elision

Utilise des lifetimes explicites quand le compilateur ne peut pas inférer les relations :

```rust
// Annotations explicites pour clarifier les relations
fn explicit_lifetimes<'a>(data: &'a [i32]) -> impl Fn(usize) -> &'a i32 + 'a {
    move |i| &data[i] // Closure liée au lifetime de `data`
}

// Version avec lifetime elision (plus concise)
fn elided_lifetimes(data: &[i32]) -> impl Fn(usize) -> &i32 + '_ {
    move |i| &data[i] // `'_` inféré automatiquement
}

fn lifetime_annotations_example() {
    let numbers = vec![10, 20, 30, 40, 50];
    
    let explicit_accessor = explicit_lifetimes(&numbers);
    let elided_accessor = elided_lifetimes(&numbers);
    
    println!("Explicit: {}", explicit_accessor(2)); // 30
    println!("Elided: {}", elided_accessor(3));     // 40
    
    // `numbers` doit survivre aux deux closures
}
```

## Cas d'Usage Réels

### 1. Web Framework Handlers

```rust
// Similaire à actix-web ou warp
struct Request {
    path: String,
    query: String,
}

// Handler factory avec lifetime management
fn create_handler<'a>(
    prefix: &'a str
) -> impl Fn(&Request) -> String + 'a {
    move |req| {
        format!("{}{} with query: {}", prefix, req.path, req.query)
    }
}

// Middleware avec closures
fn with_logging<F>(handler: F) -> impl Fn(&Request) -> String
where
    F: Fn(&Request) -> String,
{
    move |req| {
        println!("Processing request: {}", req.path);
        let response = handler(req);
        println!("Response generated");
        response
    }
}

fn web_framework_example() {
    let api_prefix = "/api/v1";
    let handler = create_handler(api_prefix);
    let logged_handler = with_logging(handler);
    
    let request = Request {
        path: "/users".to_string(),
        query: "page=1".to_string(),
    };
    
    let response = logged_handler(&request);
    println!("Final response: {}", response);
}
```

### 2. Configuration Closures

```rust
use std::collections::HashMap;

struct Config {
    settings: HashMap<String, String>,
}

impl Config {
    fn new() -> Self {
        let mut settings = HashMap::new();
        settings.insert("host".to_string(), "localhost".to_string());
        settings.insert("port".to_string(), "8080".to_string());
        Self { settings }
    }
    
    // Return closure tied to config's lifetime
    fn get_accessor(&self) -> impl Fn(&str) -> Option<&str> + '_ {
        move |key| {
            self.settings.get(key).map(|s| s.as_str())
        }
    }
    
    // Factory method pour owned closures
    fn create_validator(allowed_keys: Vec<String>) -> impl Fn(&str) -> bool {
        move |key| {
            allowed_keys.contains(&key.to_string())
        }
    }
}

fn config_example() {
    let config = Config::new();
    let accessor = config.get_accessor();
    
    // Test accessing config values
    if let Some(host) = accessor("host") {
        println!("Host: {}", host);
    }
    
    if let Some(port) = accessor("port") {
        println!("Port: {}", port);
    }
    
    // Validator example
    let validator = Config::create_validator(vec![
        "host".to_string(), 
        "port".to_string(), 
        "debug".to_string()
    ]);
    
    let keys_to_test = vec!["host", "invalid", "port"];
    for key in keys_to_test {
        println!("Key '{}' is valid: {}", key, validator(key));
    }
    
    // `config` doit survivre à `accessor`
}
```

## Points Clés

✅ **Utilise move pour transférer l'ownership des variables capturées.**  
✅ **Annote les lifetimes quand les closures capturent des références.**  
🚫 **Evite de retourner des closures qui capturent des références courtes.**

### Règles de Décision

1. **Données locales** → `move` avec ownership transfer
2. **Références d'entrée** → Explicit lifetime annotations
3. **Données partagées** → `Arc<T>` ou `Rc<T>`
4. **Configuration** → Tied to config object lifetime
5. **Temporary data** → Convert to owned before capture

## Cas d'Usage Réel

Dans les frameworks web comme actix-web, les handlers retournent souvent des closures capturant des données de requête avec des lifetimes explicitement gérés.

Retire le `move` de `capture_with_lifetime` et ça ne compile plus : la closure emprunterait `s`,
qui a déjà disparu au moment où on l'appelle.

## Exemple Pratique Complet

```rust
use std::collections::HashMap;

// Système de cache avec closures et lifetime management
struct CacheSystem {
    data: HashMap<String, String>,
}

impl CacheSystem {
    fn new() -> Self {
        let mut data = HashMap::new();
        data.insert("user:1".to_string(), "Alice".to_string());
        data.insert("user:2".to_string(), "Bob".to_string());
        Self { data }
    }
    
    // Retourne closure liée au lifetime du cache
    fn get_reader(&self) -> impl Fn(&str) -> Option<&str> + '_ {
        move |key| {
            self.data.get(key).map(|v| v.as_str())
        }
    }
    
    // Factory pour closures owned
    fn create_key_formatter(prefix: String) -> impl Fn(&str) -> String {
        move |id| {
            format!("{}:{}", prefix, id)
        }
    }
    
    // Middleware closure avec lifetime bounds
    fn with_caching<'a, F, R>(
        &'a self,
        cache_key: &str,
        compute: F
    ) -> impl Fn() -> R + 'a
    where
        F: Fn() -> R + 'a,
        R: Clone + std::fmt::Debug + 'a,
    {
        let cache_key = cache_key.to_string();
        move || {
            // Simuler cache lookup (simplifié)
            println!("Cache lookup for: {}", cache_key);
            compute()
        }
    }
}

fn cache_system_example() {
    let cache = CacheSystem::new();
    let reader = cache.get_reader();
    
    // Test reader
    match reader("user:1") {
        Some(name) => println!("Found user: {}", name),
        None => println!("User not found"),
    }
    
    // Test key formatter
    let user_formatter = CacheSystem::create_key_formatter("user".to_string());
    let user_key = user_formatter("123");
    println!("Generated key: {}", user_key);
    
    // Test caching middleware
    let expensive_computation = || {
        println!("Performing expensive computation...");
        42
    };
    
    let cached_computation = cache.with_caching("computation:1", expensive_computation);
    let result = cached_computation();
    println!("Computation result: {:?}", result);
    
    // `cache` doit survivre à toutes les closures
}

fn main() {
    ownership_examples();
    println!("---");
    complex_lifetimes_example();
    println!("---");
    stateful_lifetimes_example();
    println!("---");
    safe_examples();
    println!("---");
    web_framework_example();
    println!("---");
    config_example();
    println!("---");
    cache_system_example();
}
```

---

**Conclusion :** La gestion des lifetimes avec les closures requiert une compréhension claire de l'ownership et des annotations de lifetime. Utilise `move` pour transférer l'ownership, annote les lifetimes pour les références, et Evite les dangling references pour écrire du code Rust sûr et expressif !
