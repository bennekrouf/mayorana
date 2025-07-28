---
id: closure-performance-overhead-rust-fr
title: >-
  Utiliser des closures versus des functions régulières ?
slug: closure-performance-overhead-rust-fr
locale: "fr"
author: mayo
excerpt: >-
  Analyser l'overhead de performance des closures versus les functions régulières en Rust,
  couvrant static dispatch, heap allocation, et scénarios d'optimisation
category: rust
tags:
  - rust
  - closures
  - performance
  - optimization
  - static-dispatch
  - heap-allocation
date: '2025-07-12'
---

# Quel est l'overhead de performance d'utiliser des closures versus des functions régulières en Rust ? Quand les closures peuvent-elles être moins efficaces ?

## Overhead de Performance

Les closures en Rust ont un overhead runtime zéro dans la plupart des cas grâce au static dispatch et aux optimisations du compilateur. Cependant, des scénarios spécifiques peuvent introduire des coûts :

| Aspect | Closures | Functions Régulières |
|--------|----------|-------------------|
| Dispatch | Static (via monomorphization) | Toujours static (appel direct) |
| Mémoire | Peut stocker données capturées (taille variable) | Pas de données capturées (taille fixe) |
| Heap Allocation | Seulement si boxed (Box&lt;dyn Fn&gt;) | Jamais |
| Optimisation | Inlined agressivement | Inlined agressivement |

## Quand les Closures Peuvent Être Moins Efficaces

### Trait Objects Heap-Allocated (Box&lt;dyn Fn&gt;)

Utiliser le dynamic dispatch (ex : `Box<dyn Fn>`) ajoute de l'overhead :
- **Vtable Lookups** : Appels indirects via function pointers.
- **Cache Misses** : Fat pointers (data + vtable) réduisent la localité.

```rust
let closures: Vec<Box<dyn Fn(i32) -> i32>> = vec![
    Box::new(|x| x + 1),
    Box::new(|x| x * 2),
]; // Heap-allocated, plus lent à appeler
```

### Environnements Capturés Volumineux

Les closures stockant de gros structs (ex : buffer 1KB) augmentent l'usage mémoire et peuvent inhiber l'inlining :

```rust
let data = [0u8; 1024]; // Array 1KB
let closure = move || data.len(); // Taille closure = 1KB + overhead
```

### Monomorphization Excessive

Les closures génériques avec beaucoup d'instanciations (ex : dans une hot loop) peuvent gonfler la taille du binaire :

```rust
(0..1_000).for_each(|i| { /* Closure unique par itération */ });
```

## Analyse Performance Détaillée

### 1. Benchmarks Static vs Dynamic Dispatch

```rust
use std::time::Instant;

// Static dispatch - rapide
fn apply_static<F: Fn(i32) -> i32>(f: F, x: i32) -> i32 {
    f(x)
}

// Dynamic dispatch - plus lent
fn apply_dynamic(f: &dyn Fn(i32) -> i32, x: i32) -> i32 {
    f(x)
}

fn benchmark_dispatch() {
    let operation = |x: i32| x * 2 + 1;
    let iterations = 10_000_000;
    
    // Test static dispatch
    let start = Instant::now();
    let mut result = 0;
    for i in 0..iterations {
        result += apply_static(&operation, i);
    }
    let static_time = start.elapsed();
    println!("Static result: {}, time: {:?}", result, static_time);
    
    // Test dynamic dispatch
    let start = Instant::now();
    let mut result = 0;
    for i in 0..iterations {
        result += apply_dynamic(&operation, i);
    }
    let dynamic_time = start.elapsed();
    println!("Dynamic result: {}, time: {:?}", result, dynamic_time);
    
    println!("Dynamic/Static ratio: {:.2}x", 
             dynamic_time.as_nanos() as f64 / static_time.as_nanos() as f64);
}
```

### 2. Impact de la Taille des Captures

```rust
use std::mem;

fn capture_size_analysis() {
    // Petite capture
    let small_data = 42i32;
    let small_closure = move || small_data * 2;
    println!("Small closure size: {} bytes", mem::size_of_val(&small_closure));
    
    // Grande capture
    let big_data = [0u8; 1024];
    let big_closure = move || big_data.len();
    println!("Big closure size: {} bytes", mem::size_of_val(&big_closure));
    
    // Multiple captures
    let a = 1i32;
    let b = 2i32;
    let c = vec![1, 2, 3];
    let multi_closure = move || a + b + c.len() as i32;
    println!("Multi capture size: {} bytes", mem::size_of_val(&multi_closure));
    
    // Comparaison avec function pointer
    fn regular_function() -> i32 { 42 }
    let fn_ptr: fn() -> i32 = regular_function;
    println!("Function pointer size: {} bytes", mem::size_of_val(&fn_ptr));
}
```

### 3. Memory Layout et Cache Performance

```rust
// Test cache locality avec différents patterns
fn cache_performance_test() {
    const SIZE: usize = 1_000_000;
    let data: Vec<i32> = (0..SIZE as i32).collect();
    
    // Pattern 1: Closure simple (good locality)
    let start = Instant::now();
    let sum1: i32 = data.iter().map(|&x| x * 2).sum();
    let time1 = start.elapsed();
    
    // Pattern 2: Boxed closures (poor locality)
    let operations: Vec<Box<dyn Fn(i32) -> i32>> = vec![
        Box::new(|x| x * 2),
        Box::new(|x| x + 1),
        Box::new(|x| x - 1),
    ];
    
    let start = Instant::now();
    let sum2: i32 = data.iter()
        .enumerate()
        .map(|(i, &x)| operations[i % operations.len()](x))
        .sum();
    let time2 = start.elapsed();
    
    println!("Simple closure: {} in {:?}", sum1, time1);
    println!("Boxed closures: {} in {:?}", sum2, time2);
    println!("Boxed/Simple ratio: {:.2}x", 
             time2.as_nanos() as f64 / time1.as_nanos() as f64);
}
```

## Zero-Cost Abstractions en Pratique

### Static Dispatch (impl Fn)

Les closures sont aussi rapides que les functions régulières quand :
- Les données capturées sont petites (ex : primitives).
- La monomorphization ne cause pas de code bloat.

```rust
// Ces deux approches génèrent le même ASM
fn regular_add(x: i32, y: i32) -> i32 {
    x + y
}

let closure_add = |x, y| x + y; // Même ASM que `regular_add`

fn performance_comparison() {
    let start = Instant::now();
    let mut sum = 0;
    for i in 0..1_000_000 {
        sum += regular_add(i, i + 1);
    }
    let regular_time = start.elapsed();
    
    let start = Instant::now();
    let mut sum = 0;
    for i in 0..1_000_000 {
        sum += closure_add(i, i + 1);
    }
    let closure_time = start.elapsed();
    
    println!("Regular function: {:?}", regular_time);
    println!("Closure: {:?}", closure_time);
    println!("Difference: negligible (both inlined)");
}
```

### Exemple : Inlining

```rust
fn inlining_example() {
    // Le compilateur inline cette closure complètement
    let x = 5;
    let closure = || x * 2; // Inlined → pas d'appel de fonction
    println!("{}", closure()); // ASM: `mov eax, 10`
    
    // Vérifiable avec `cargo rustc -- --emit asm`
}
```

## Scenarios d'Optimisation

### 1. Iterator Chains - Zero Cost

```rust
// Ces chaînes d'iterators sont complètement optimisées
fn optimized_iterator_chains() {
    let numbers: Vec<i32> = (0..1_000_000).collect();
    
    let start = Instant::now();
    
    // Cette chaîne est optimisée en une boucle simple
    let result: i32 = numbers
        .iter()
        .filter(|&&x| x % 2 == 0)    // Closure inlined
        .map(|&x| x * x)             // Closure inlined
        .take(100)                   // Limit inlined
        .sum();                      // Sum inlined
    
    let optimized_time = start.elapsed();
    
    // Équivalent manuel (pour comparaison)
    let start = Instant::now();
    let mut manual_result = 0;
    let mut count = 0;
    for &x in &numbers {
        if x % 2 == 0 && count < 100 {
            manual_result += x * x;
            count += 1;
        }
    }
    let manual_time = start.elapsed();
    
    println!("Optimized iterator: {} in {:?}", result, optimized_time);
    println!("Manual loop: {} in {:?}", manual_result, manual_time);
    println!("Performance difference: negligible");
}
```

### 2. Hot Path Optimizations

```rust
// Dans les hot paths, minimiser les captures
fn hot_path_optimizations() {
    let config_value = 42;
    let large_buffer = vec![0u8; 10_000];
    
    // ❌ Mauvais - capture tout
    let bad_closure = move || {
        println!("Config: {}", config_value);
        large_buffer.len() // Capture tout le buffer
    };
    
    // ✅ Bon - capture seulement ce qui est nécessaire
    let buffer_len = large_buffer.len();
    let good_closure = move || {
        println!("Config: {}", config_value);
        buffer_len // Capture seulement la taille
    };
    
    println!("Bad closure size: {} bytes", mem::size_of_val(&bad_closure));
    println!("Good closure size: {} bytes", mem::size_of_val(&good_closure));
}
```

### 3. Avoiding Allocation in Loops

```rust
// Éviter les allocations dans les boucles
fn avoid_allocations() {
    let data = vec![1, 2, 3, 4, 5];
    
    // ❌ Mauvais - allocation à chaque itération
    fn bad_pattern(data: &[i32]) -> Vec<i32> {
        data.iter()
            .map(|&x| {
                let boxed: Box<dyn Fn() -> i32> = Box::new(move || x * x);
                boxed() // Allocation + vtable lookup
            })
            .collect()
    }
    
    // ✅ Bon - pas d'allocations
    fn good_pattern(data: &[i32]) -> Vec<i32> {
        data.iter()
            .map(|&x| {
                let square = |y| y * y; // Static dispatch, inlined
                square(x)
            })
            .collect()
    }
    
    let start = Instant::now();
    let _bad_result = bad_pattern(&data);
    let bad_time = start.elapsed();
    
    let start = Instant::now();
    let _good_result = good_pattern(&data);
    let good_time = start.elapsed();
    
    println!("Bad pattern: {:?}", bad_time);
    println!("Good pattern: {:?}", good_time);
}
```

## Code Size et Binary Bloat

### 1. Monomorphization Impact

```rust
// Excessive monomorphization peut gonfler le binaire
fn monomorphization_example() {
    // Chaque type T génère une version unique
    fn generic_closure<T: std::fmt::Display>(value: T) -> impl Fn() -> String {
        move || format!("Value: {}", value)
    }
    
    // Ceci génère multiple copies dans le binaire
    let int_closure = generic_closure(42i32);
    let float_closure = generic_closure(3.14f64);
    let string_closure = generic_closure("hello".to_string());
    
    println!("{}", int_closure());
    println!("{}", float_closure());
    println!("{}", string_closure());
    
    // Chaque type génère son propre code machine
}
```

### 2. Binary Size Optimization

```rust
// Strategies pour réduire la taille du binaire
fn optimize_binary_size() {
    // ✅ Utiliser trait objects pour réduire monomorphization
    fn create_formatter(format_type: &str) -> Box<dyn Fn(i32) -> String> {
        match format_type {
            "hex" => Box::new(|x| format!("{:x}", x)),
            "bin" => Box::new(|x| format!("{:b}", x)),
            _ => Box::new(|x| format!("{}", x)),
        }
    }
    
    // ✅ Ou utiliser enum dispatch
    enum Formatter {
        Hex,
        Binary,
        Decimal,
    }
    
    impl Formatter {
        fn format(&self, value: i32) -> String {
            match self {
                Formatter::Hex => format!("{:x}", value),
                Formatter::Binary => format!("{:b}", value),
                Formatter::Decimal => format!("{}", value),
            }
        }
    }
    
    let formatter = Formatter::Hex;
    println!("Formatted: {}", formatter.format(255));
}
```

## Profiling et Mesures

### 1. Micro-benchmarking avec Criterion

```rust
// Utiliser criterion pour des benchmarks précis
use criterion::{black_box, Criterion};

fn benchmark_closures(c: &mut Criterion) {
    let data = vec![1, 2, 3, 4, 5];
    
    // Benchmark static dispatch
    c.bench_function("static_closure", |b| {
        b.iter(|| {
            let multiplier = 2;
            data.iter()
                .map(|&x| x * multiplier) // Static dispatch
                .sum::<i32>()
        })
    });
    
    // Benchmark dynamic dispatch
    c.bench_function("dynamic_closure", |b| {
        b.iter(|| {
            let multiplier = 2;
            let op: Box<dyn Fn(i32) -> i32> = Box::new(move |x| x * multiplier);
            data.iter()
                .map(|&x| op(x)) // Dynamic dispatch
                .sum::<i32>()
        })
    });
    
    // Benchmark function call
    c.bench_function("function_call", |b| {
        fn multiply(x: i32) -> i32 { x * 2 }
        b.iter(|| {
            data.iter()
                .map(|&x| multiply(x)) // Direct function call
                .sum::<i32>()
        })
    });
}
```

### 2. Memory Profiling

```rust
// Analyser l'usage mémoire des closures
fn memory_profiling() {
    use std::alloc::{GlobalAlloc, Layout, System};
    use std::sync::atomic::{AtomicUsize, Ordering};
    
    // Custom allocator pour tracker les allocations
    struct TrackingAllocator;
    
    static ALLOCATED: AtomicUsize = AtomicUsize::new(0);
    
    unsafe impl GlobalAlloc for TrackingAllocator {
        unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
            ALLOCATED.fetch_add(layout.size(), Ordering::Relaxed);
            System.alloc(layout)
        }
        
        unsafe fn dealloc(&self, ptr: *mut u8, layout: Layout) {
            ALLOCATED.fetch_sub(layout.size(), Ordering::Relaxed);
            System.dealloc(ptr, layout)
        }
    }
    
    let before = ALLOCATED.load(Ordering::Relaxed);
    
    // Test allocations avec closures
    {
        let _boxed_closures: Vec<Box<dyn Fn() -> i32>> = (0..100)
            .map(|i| Box::new(move || i) as Box<dyn Fn() -> i32>)
            .collect();
        
        let during = ALLOCATED.load(Ordering::Relaxed);
        println!("Memory allocated: {} bytes", during - before);
    }
    
    let after = ALLOCATED.load(Ordering::Relaxed);
    println!("Memory freed: {} bytes", (before + (ALLOCATED.load(Ordering::Relaxed) - after)));
}
```

## Points Clés

✅ **Utilisez `impl Fn` pour un static dispatch zero-cost.**  
🚫 **Évitez `Box<dyn Fn>` dans le code critique en performance.**  
⚠️ **Optimisez les captures volumineuses : Préférez l'emprunt ou minimisez les données capturées.**

### Règles d'Optimisation

1. **Hot paths** → Static dispatch uniquement
2. **Grosses captures** → Minimize ou utilisez des références
3. **Collections de closures** → Considérez enum dispatch
4. **Profiling** → Mesurez avant d'optimiser
5. **Binary size matters** → Évitez excessive monomorphization

## Impact Réel

- **rayon** utilise les closures avec static dispatch pour les iterators parallèles (pas d'overhead).
- **Les frameworks GUI** comme iced exploitent les closures pour les event handlers efficacement.
- **serde** utilise les closures pour la sérialisation zero-cost.

**Essayez Ceci** : Comparez la sortie assembly d'une closure et d'une fonction avec `cargo rustc -- --emit asm` !

## Exemple Pratique Complet

```rust
use std::time::Instant;

// Système de traitement de données avec différentes stratégies
struct DataProcessor;

impl DataProcessor {
    // Static dispatch - optimal performance
    fn process_static<F>(data: &[i32], operation: F) -> Vec<i32>
    where
        F: Fn(i32) -> i32,
    {
        data.iter().map(|&x| operation(x)).collect()
    }
    
    // Dynamic dispatch - flexible mais plus lent
    fn process_dynamic(data: &[i32], operation: &dyn Fn(i32) -> i32) -> Vec<i32> {
        data.iter().map(|&x| operation(x)).collect()
    }
    
    // Function pointer - compromis
    fn process_fn_ptr(data: &[i32], operation: fn(i32) -> i32) -> Vec<i32> {
        data.iter().map(|&x| operation(x)).collect()
    }
}

fn comprehensive_benchmark() {
    let data: Vec<i32> = (0..1_000_000).collect();
    let iterations = 10;
    
    // Test 1: Static dispatch
    let operation_static = |x| x * 2 + 1;
    let start = Instant::now();
    for _ in 0..iterations {
        let _result = DataProcessor::process_static(&data, &operation_static);
    }
    let static_time = start.elapsed();
    
    // Test 2: Dynamic dispatch
    let operation_dynamic: &dyn Fn(i32) -> i32 = &|x| x * 2 + 1;
    let start = Instant::now();
    for _ in 0..iterations {
        let _result = DataProcessor::process_dynamic(&data, operation_dynamic);
    }
    let dynamic_time = start.elapsed();
    
    // Test 3: Function pointer
    fn operation_fn(x: i32) -> i32 { x * 2 + 1 }
    let start = Instant::now();
    for _ in 0..iterations {
        let _result = DataProcessor::process_fn_ptr(&data, operation_fn);
    }
    let fn_ptr_time = start.elapsed();
    
    println!("Benchmark Results ({} iterations):", iterations);
    println!("Static dispatch: {:?}", static_time);
    println!("Dynamic dispatch: {:?}", dynamic_time);
    println!("Function pointer: {:?}", fn_ptr_time);
    
    println!("\nRelative Performance:");
    println!("Dynamic/Static: {:.2}x slower", 
             dynamic_time.as_nanos() as f64 / static_time.as_nanos() as f64);
    println!("FnPtr/Static: {:.2}x slower", 
             fn_ptr_time.as_nanos() as f64 / static_time.as_nanos() as f64);
}

fn main() {
    benchmark_dispatch();
    println!("---");
    capture_size_analysis();
    println!("---");
    cache_performance_test();
    println!("---");
    optimized_iterator_chains();
    println!("---");
    comprehensive_benchmark();
}
```

---

**Conclusion :** Les closures en Rust sont généralement aussi performantes que les functions régulières grâce au static dispatch et aux optimisations du compilateur. Les problèmes de performance surviennent principalement avec le dynamic dispatch et les captures volumineuses. Mesurez toujours avant d'optimiser !