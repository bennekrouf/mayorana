---
id: closure-performance-overhead-rust-fr
title: Utiliser des closures versus des functions régulières ?
slug: closure-performance-overhead-rust-fr
locale: fr
author: mayo
excerpt: >-
  Analyser l'overhead de performance des closures versus les functions
  régulières en Rust, couvrant static dispatch, heap allocation, et scénarios
  d'optimisation
tags:
  - rust
  - closures
  - performance
  - optimization
  - static-dispatch
  - heap-allocation
date: '2025-11-10'
---

# Quel est l'overhead de performance d'utiliser des closures versus des functions régulières en Rust ? quand les closures peuvent-elles être moins efficaces ?

## Overhead de performance

Les closures en Rust ont un overhead runtime zéro dans la plupart des cas grâce au static dispatch et aux optimisations du compilateur. Cependant, des scénarios spécifiques peuvent introduire des coûts :

<div class="svg-container" style="margin:2rem 0;">
<svg class="cl8-fig" viewBox="0 0 800 220" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Comparaison du coût d'appel : impl Fn est inliné à coût quasi nul, Box de dyn Fn paie un vtable lookup">
<!-- style -->
<style>
.cl8-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .cl8-fig,[data-theme="dark"] .cl8-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cl8-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl8-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.cl8-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.cl8-fig .axis{stroke:var(--ln);stroke-width:1.5}
.cl8-fig .bar1{fill:var(--ac)}
.cl8-fig .bar2{fill:var(--mut);opacity:0.55}
</style>
<!-- title -->
<text x="400" y="20" text-anchor="middle" class="ti">Coût d'appel : impl Fn est inliné ; Box&lt;dyn Fn&gt; paie un vtable lookup</text>
<!-- axis -->
<path d="M250,68 L250,178" class="axis"/>
<!-- row1 -->
<text x="60" y="100" class="tx">impl Fn (statique)</text>
<rect x="250" y="82" width="90" height="32" rx="4" class="bar1"/>
<text x="352" y="103" class="mut">~0 ns (inliné)</text>
<!-- row2 -->
<text x="60" y="162" class="tx">Box&lt;dyn Fn&gt; (dynamique)</text>
<rect x="250" y="144" width="260" height="32" rx="4" class="bar2"/>
<text x="522" y="165" class="mut">~2-3x plus lent (vtable + cache miss)</text>
<!-- caption -->
<text x="400" y="205" text-anchor="middle" class="mut">Les grandes captures (ex : un buffer de 1KB) augmentent aussi la taille, quel que soit le dispatch</text>
</svg>
</div>

| Aspect | Closures | Functions Régulières |
|--------|----------|-------------------|
| Dispatch | Static (via monomorphization) | Toujours static (appel direct) |
| Mémoire | Peut stocker données capturées (taille variable) | Pas de données capturées (taille fixe) |
| Heap Allocation | Seulement si boxed (Box&lt;dyn Fn&gt;) | Jamais |
| Optimisation | Inlined agressivement | Inlined agressivement |

## Quand les Closures Peuvent Être moins Efficaces

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

### Environnements capturés volumineux
Les closures stockant de gros structs (ex : buffer 1KB) augmentent l'usage mémoire et peuvent inhiber l'inlining :

```rust
let data = [0u8; 1024]; // Array 1KB
let closure = move || data.len(); // Taille closure = 1KB + overhead
```

Une closure n'est qu'un struct anonyme contenant ses captures : « combien ça coûte » est donc en réalité une question sur le layout de ce struct :

<div class="svg-container" style="margin:2rem 0;">
<svg class="cl8b-fig" viewBox="0 0 800 330" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Layout mémoire de trois closures : une petite capture Copy, une capture d'array d'un kilooctet, et un trait object boxé avec environnement sur le heap et vtable">
<!-- style -->
<style>
.cl8b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .cl8b-fig,[data-theme="dark"] .cl8b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cl8b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.cl8b-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.cl8b-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.cl8b-fig .hd{fill:var(--tx);font:700 13px ui-sans-serif,system-ui,sans-serif}
.cl8b-fig .hdac{fill:var(--ac);font:700 13px ui-sans-serif,system-ui,sans-serif}
.cl8b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl8b-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.cl8b-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="cl8b-arrowacfr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ac)"/></marker>
</defs>
<!-- title -->
<text x="400" y="20" text-anchor="middle" class="ti">Une closure est un struct de ses captures — le layout, c'est le coût</text>
<!-- col1 header -->
<text x="140" y="46" text-anchor="middle" class="hd">petite capture Copy</text>
<text x="140" y="64" text-anchor="middle" class="mut">move || x * 2</text>
<!-- col1 box -->
<rect x="20" y="78" width="240" height="48" rx="6" class="box"/>
<text x="140" y="100" text-anchor="middle" class="tx">4 octets sur la stack</text>
<text x="140" y="118" text-anchor="middle" class="mut">juste le i32 capturé</text>
<!-- col1 note -->
<text x="140" y="152" text-anchor="middle" class="mut">entièrement inlinée —</text>
<text x="140" y="169" text-anchor="middle" class="mut">même ASM qu'une fn normale</text>
<!-- col2 header -->
<text x="400" y="46" text-anchor="middle" class="hd">grosse capture</text>
<text x="400" y="64" text-anchor="middle" class="mut">move || data.len()</text>
<!-- col2 box -->
<rect x="280" y="78" width="240" height="132" rx="6" class="box"/>
<text x="400" y="130" text-anchor="middle" class="tx">1024 octets sur la stack</text>
<text x="400" y="150" text-anchor="middle" class="mut">tout le [0u8; 1024]</text>
<text x="400" y="167" text-anchor="middle" class="mut">copié octet par octet</text>
<!-- col2 note -->
<text x="400" y="236" text-anchor="middle" class="mut">pas de heap, mais trop gros pour être inliné</text>
<!-- col3 header -->
<text x="660" y="46" text-anchor="middle" class="hdac">Box&lt;dyn Fn&gt;</text>
<text x="660" y="64" text-anchor="middle" class="mut">Box::new(|x| x + 1)</text>
<!-- col3 box1 -->
<rect x="540" y="78" width="240" height="44" rx="6" class="boxac"/>
<text x="660" y="98" text-anchor="middle" class="tx">16 octets : fat pointer</text>
<text x="660" y="115" text-anchor="middle" class="mut">ptr données + ptr vtable</text>
<!-- arrow 1 -->
<path d="M660,122 L660,150" class="ln" marker-end="url(#cl8b-arrowacfr)"/>
<!-- col3 box2 -->
<rect x="540" y="150" width="240" height="44" rx="6" class="box"/>
<text x="660" y="170" text-anchor="middle" class="tx">env capturé</text>
<text x="660" y="187" text-anchor="middle" class="mut">allocation heap séparée</text>
<!-- arrow 2 -->
<path d="M660,194 L660,222" class="ln" marker-end="url(#cl8b-arrowacfr)"/>
<!-- col3 box3 -->
<rect x="540" y="222" width="240" height="44" rx="6" class="box"/>
<text x="660" y="242" text-anchor="middle" class="tx">vtable</text>
<text x="660" y="259" text-anchor="middle" class="mut">un saut indirect par appel</text>
<!-- caption -->
<text x="400" y="300" text-anchor="middle" class="mut">Seule la colonne de droite touche le heap ; seule elle ne peut pas être inlinée.</text>
<text x="400" y="317" text-anchor="middle" class="mut">Celle du milieu est gratuite à l'appel mais coûteuse à déplacer.</text>
</svg>
</div>

### Monomorphization Excessive

Les closures génériques avec beaucoup d'instanciations (ex : dans une hot loop) peuvent gonfler la taille du binaire :

```rust
(0..1_000).for_each(|i| { /* Closure unique par itération */ });
```

## Analyse performance détaillée

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

### 2. Impact de la taille des captures

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

### 3. Memory Layout et Cache performance

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

## Zero-Cost abstractions en pratique

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

### 3. Avoiding allocation in Loops

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

### 1. Monomorphization impact

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

## Points clés

✅ **Utilise `impl Fn` pour un static dispatch zero-cost.**  
🚫 **Evite `Box<dyn Fn>` dans le code critique en performance.**  
⚠️ **Optimise les captures volumineuses : Préfére le borrowing ou minimise les données capturées.**

### Règles d'Optimisation

1. **Hot paths** → Static dispatch uniquement
2. **Grosses captures** → Minimize ou utilise des références
3. **Collections de closures** → Considére enum dispatch
4. **Profiling** → Mesure avant d'optimiser
5. **Binary size matters** → Evite excessive monomorphization

## Impact réel

- **rayon** utilise les closures avec static dispatch pour les iterators parallèles (pas d'overhead).
- **Les frameworks GUI** comme iced exploitent les closures pour les event handlers efficacement.
- **serde** utilise les closures pour la sérialisation zero-cost.

Si tu veux constater l'abstraction à coût nul plutôt que me croire sur parole :
`cargo rustc -- --emit asm`, puis compare la closure et la fonction équivalente.
## Exemple pratique complet

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

**Conclusion :** Les closures en Rust sont généralement aussi performantes que les functions régulières grâce au static dispatch et aux optimisations du compilateur. Les problèmes de performance surviennent principalement avec le dynamic dispatch et les captures volumineuses. Mesure toujours avant d'optimiser !
