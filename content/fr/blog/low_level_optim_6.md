---
id: vec-push-vs-with-capacity-performance
title: 'Vec::push() dans une boucle vs. pré-allouer avec Vec::with_capacity() ?'
slug: vec-push-vs-with-capacity-performance
locale: fr
author: mayo
excerpt: >-
  Comparaison des performances de Vec::push() dans les boucles versus
  pré-allouer avec Vec::with_capacity(), analysant les coûts de réallocation
  mémoire et stratégies d'optimisation
tags:
  - rust
  - vec
  - performance
  - memory-allocation
  - optimization
  - collections
date: '2025-11-19'
---

# Quel est l'impact performance d'utiliser Vec::push() dans une boucle vs. pré-allouer avec Vec::with_capacity() ?

<div class="svg-container" style="margin:2rem 0;">
<svg class="lo6-fig" viewBox="0 0 800 240" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Vec::new() croît par doublements et copies répétés, tandis que Vec::with_capacity(n) alloue la taille finale une seule fois">
<!-- style -->
<style>
.lo6-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .lo6-fig,[data-theme="dark"] .lo6-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.lo6-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.lo6-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.lo6-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.lo6-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.lo6-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.lo6-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="lo6arrowfr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
</defs>
<!-- top lane -->
<text x="40" y="30" class="ti">Vec::new() — 4 réallocations pour 10 éléments</text>
<rect x="40" y="42" width="60" height="40" rx="5" class="box"/><text x="70" y="66" text-anchor="middle" class="tx">0</text>
<path d="M100,62 L128,62" class="ln" marker-end="url(#lo6arrowfr)"/>
<rect x="130" y="42" width="80" height="40" rx="5" class="box"/><text x="170" y="66" text-anchor="middle" class="tx">4</text>
<path d="M210,62 L238,62" class="ln" marker-end="url(#lo6arrowfr)"/>
<rect x="240" y="42" width="110" height="40" rx="5" class="box"/><text x="295" y="66" text-anchor="middle" class="tx">8</text>
<path d="M350,62 L378,62" class="ln" marker-end="url(#lo6arrowfr)"/>
<rect x="380" y="42" width="150" height="40" rx="5" class="box"/><text x="455" y="66" text-anchor="middle" class="tx">16</text>
<text x="600" y="66" class="mut">copie + libération à chaque fois</text>
<!-- bottom lane -->
<text x="40" y="140" class="ti">Vec::with_capacity(10) — 1 allocation</text>
<rect x="40" y="152" width="490" height="40" rx="5" class="boxac"/>
<text x="285" y="176" text-anchor="middle" class="tx">10 (alloué en amont)</text>
<text x="600" y="176" class="mut">aucune copie, aucune libération</text>
<!-- caption -->
<text x="40" y="222" class="mut">Mêmes 10 push — with_capacity() est ~4.5x plus rapide en benchmark</text>
</svg>
</div>

## Différences performance clés

| Vec::push() dans une Boucle | Vec::with_capacity() + push() |
|-----------------------------|---------------------------------|
| Réalloue la mémoire plusieurs fois (croissance exponentielle). | Alloue une fois en amont. |
| Complexité temporelle O(n log n) (amortie). | Complexité temporelle O(n). |
| Peut fragmenter la mémoire due aux allocations répétées. | Bloc mémoire contigu unique. |

## Pourquoi les réallocations Sont Coûteuses

### Stratégie de croissance
- Un Vec démarre avec une capacité 0 et double sa capacité quand plein (ex : 0 → 4 → 8 → 16...).
- Chaque réallocation implique :
  - Allouer une nouvelle mémoire.
  - Copier tous les éléments existants.
  - Libérer l'ancienne mémoire.

### Exemple pour 10 éléments
- **push() avec Vec::new()** : 4 réallocations (capacité 0 → 4 → 8 → 16).
- **push() avec with_capacity(10)** : 0 réallocation.

<div class="svg-container" style="margin:2rem 0;">
<svg class="lo6b-fig" viewBox="0 0 800 245" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Disposition d'un Vec après dix push : une struct sur la pile avec ptr, len et cap pointant vers un tampon de seize emplacements sur le tas, dix initialisés et six réservés mais inutilisés">
<style>
.lo6b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .lo6b-fig,[data-theme="dark"] .lo6b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.lo6b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.lo6b-fig .fin{fill:var(--box);stroke:var(--ac);stroke-width:2.5}
.lo6b-fig .used{fill:var(--bg);stroke:var(--mut);stroke-width:1.5}
.lo6b-fig .spare{fill:none;stroke:var(--ln);stroke-width:1.5;stroke-dasharray:3 3}
.lo6b-fig .hd{fill:var(--mut);font:700 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo6b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo6b-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo6b-fig .ac{fill:var(--ac);font:700 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo6b-fig line,.lo6b-fig path.ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.lo6b-fig line.acln{stroke:var(--ac)}
</style>
<defs>
<marker id="lo6b-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"/>
</marker>
</defs>
<!-- côté pile -->
<text x="120" y="32" class="hd">Sur la pile — 24 octets</text>
<rect x="30" y="40" width="180" height="110" rx="6" class="box"/>
<rect x="42" y="52" width="156" height="26" rx="4" class="used"/>
<text x="120" y="70" class="tx">ptr</text>
<rect x="42" y="84" width="156" height="26" rx="4" class="used"/>
<text x="120" y="102" class="tx">len = 10</text>
<rect x="42" y="116" width="156" height="26" rx="4" class="used"/>
<text x="120" y="134" class="tx">cap = 16</text>
<!-- ptr vers le tampon du tas -->
<line x1="210" y1="65" x2="278" y2="65" marker-end="url(#lo6b-arrow)"/>
<!-- tampon : 16 emplacements, 10 initialisés -->
<text x="519" y="32" class="hd">Sur le tas — un bloc de 64 octets</text>
<rect x="280" y="52" width="28" height="40" rx="3" class="used"/>
<rect x="310" y="52" width="28" height="40" rx="3" class="used"/>
<rect x="340" y="52" width="28" height="40" rx="3" class="used"/>
<rect x="370" y="52" width="28" height="40" rx="3" class="used"/>
<rect x="400" y="52" width="28" height="40" rx="3" class="used"/>
<rect x="430" y="52" width="28" height="40" rx="3" class="used"/>
<rect x="460" y="52" width="28" height="40" rx="3" class="used"/>
<rect x="490" y="52" width="28" height="40" rx="3" class="used"/>
<rect x="520" y="52" width="28" height="40" rx="3" class="used"/>
<rect x="550" y="52" width="28" height="40" rx="3" class="used"/>
<rect x="580" y="52" width="28" height="40" rx="3" class="spare"/>
<rect x="610" y="52" width="28" height="40" rx="3" class="spare"/>
<rect x="640" y="52" width="28" height="40" rx="3" class="spare"/>
<rect x="670" y="52" width="28" height="40" rx="3" class="spare"/>
<rect x="700" y="52" width="28" height="40" rx="3" class="spare"/>
<rect x="730" y="52" width="28" height="40" rx="3" class="spare"/>
<!-- accolades -->
<line x1="281" y1="102" x2="577" y2="102"/>
<text x="429" y="118" class="tx">len = 10 — initialisés</text>
<line x1="581" y1="102" x2="757" y2="102" class="acln"/>
<text x="669" y="118" class="ac">6 emplacements réservés, inutilisés</text>
<!-- routes vers les deux issues -->
<path class="ln" d="M429,126 L429,146 L255,146"/>
<line x1="255" y1="146" x2="255" y2="163" marker-end="url(#lo6b-arrow)"/>
<path class="ln" d="M669,126 L669,146 L565,146"/>
<line x1="565" y1="146" x2="565" y2="163" marker-end="url(#lo6b-arrow)"/>
<rect x="110" y="165" width="290" height="66" rx="6" class="box"/>
<text x="255" y="188" class="tx">Le 11e push() tient dans la réserve</text>
<text x="255" y="207" class="mut">aucun appel à l'allocateur, aucun memcpy</text>
<text x="255" y="224" class="mut">c'est le cas amorti O(1)</text>
<rect x="420" y="165" width="290" height="66" rx="6" class="fin"/>
<text x="565" y="188" class="ac">shrink_to_fit()</text>
<text x="565" y="207" class="mut">réalloue jusqu'à cap = 10</text>
<text x="565" y="224" class="mut">une copie pour récupérer 24 octets</text>
</svg>
</div>

## Comparaison Benchmark

```rust
use std::time::Instant;
fn main() {
    // Test avec 1 million d'éléments
    let n = 1_000_000;
    
    // Méthode 1 : Pas de pré-allocation
    let start = Instant::now();
    let mut v1 = Vec::new();
    for i in 0..n {
        v1.push(i);
    }
    println!("Vec::new(): {:?}", start.elapsed());
    
    // Méthode 2 : Pré-allouer
    let start = Instant::now();
    let mut v2 = Vec::with_capacity(n);
    for i in 0..n {
        v2.push(i);
    }
    println!("Vec::with_capacity(): {:?}", start.elapsed());
}
```

### Résultats typiques
```
Vec::new(): 1.8ms  
Vec::with_capacity(): 0.4ms  // 4.5x plus rapide
```

## Quand Pré-Allouer

- **Taille Connue** : Utilise with_capacity(n) si tu connais le nombre exact/maximum d'éléments.
- **Code Critique en Performance** : Évite les réallocations dans les boucles chaudes.
- **Grandes Données** : Prévient le stack overflow pour des collections énormes.

## Quand Vec::new() est Acceptable

- **Tailles Petites/Inconnues** : Pour usage ad-hoc ou vecteurs de courte durée.
- **Simplicité de Code** : Quand la performance n'est pas critique.

## Optimisations avancées et Patterns

### 1. Utilisation d'extend() pour les itérateurs

Si tu as un itérateur, `extend()` est souvent plus rapide qu'une boucle avec `push()` :

```rust
let mut v = Vec::with_capacity(n);
v.extend(0..n);  // Optimisé pour les itérateurs (évite les vérifications de bounds)

// Comparaison performance
fn benchmark_extend_vs_push() {
    let n = 1_000_000;
    let data: Vec<i32> = (0..n).collect();
    
    // Méthode push() en boucle
    let start = std::time::Instant::now();
    let mut v1 = Vec::with_capacity(n);
    for item in &data {
        v1.push(*item);
    }
    let push_time = start.elapsed();
    
    // Méthode extend()
    let start = std::time::Instant::now();
    let mut v2 = Vec::with_capacity(n);
    v2.extend(&data);
    let extend_time = start.elapsed();
    
    println!("Push loop: {:?}", push_time);
    println!("Extend: {:?}", extend_time);
    println!("Speedup: {:.2}x", push_time.as_nanos() as f64 / extend_time.as_nanos() as f64);
}
```

### 2. Techniques de Réservation dynamique

```rust
// Pattern pour croissance adaptative
struct AdaptiveVec<T> {
    inner: Vec<T>,
    growth_factor: f64,
}

impl<T> AdaptiveVec<T> {
    fn new() -> Self {
        Self {
            inner: Vec::new(),
            growth_factor: 1.5, // Croissance plus conservative que 2.0
        }
    }
    
    fn with_initial_capacity(capacity: usize) -> Self {
        Self {
            inner: Vec::with_capacity(capacity),
            growth_factor: 1.5,
        }
    }
    
    fn smart_push(&mut self, item: T) {
        if self.inner.len() == self.inner.capacity() {
            let new_capacity = ((self.inner.capacity() as f64) * self.growth_factor) as usize;
            self.inner.reserve(new_capacity.saturating_sub(self.inner.capacity()));
        }
        self.inner.push(item);
    }
    
    fn bulk_reserve(&mut self, additional: usize) {
        // Réserve avec stratégie intelligente
        let needed = self.inner.len() + additional;
        if needed > self.inner.capacity() {
            let optimal_size = needed.next_power_of_two();
            self.inner.reserve(optimal_size - self.inner.len());
        }
    }
}
```

### 3. Optimisations spécialisées par domaine

```rust
// Pattern pour traitement par batches
fn process_data_batched<T, F>(data: impl Iterator<Item = T>, batch_size: usize, mut processor: F) -> Vec<T>
where
    F: FnMut(T) -> T,
{
    let mut result = Vec::new();
    let mut batch = Vec::with_capacity(batch_size);
    
    for item in data {
        batch.push(processor(item));
        
        if batch.len() == batch_size {
            result.reserve(batch.len()); // Réserve exactement ce qui est nécessaire
            result.extend(batch.drain(..));
        }
    }
    
    // Traite le dernier batch
    if !batch.is_empty() {
        result.reserve(batch.len());
        result.extend(batch);
    }
    
    result
}

// Optimisation pour construction conditionnelle
fn collect_conditionally<T, P>(data: &[T], predicate: P) -> Vec<T>
where
    T: Clone,
    P: Fn(&T) -> bool,
{
    // Estimation heuristique de la capacité
    let estimated_size = data.len() / 4; // Suppose 25% de sélection
    let mut result = Vec::with_capacity(estimated_size);
    
    for item in data {
        if predicate(item) {
            result.push(item.clone());
        }
    }
    
    // Optimise la mémoire si surestimation importante
    if result.capacity() > result.len() * 2 {
        result.shrink_to_fit();
    }
    
    result
}
```

### 4. Benchmarking complet et Métriques

```rust
use criterion::{BenchmarkId, Criterion, Throughput, black_box};

fn comprehensive_vec_bench(c: &mut Criterion) {
    let sizes = [100, 1_000, 10_000, 100_000, 1_000_000];
    
    let mut group = c.benchmark_group("vec_allocation_strategies");
    
    for size in sizes {
        group.throughput(Throughput::Elements(size as u64));
        
        // Benchmark Vec::new() + push
        group.bench_with_input(
            BenchmarkId::new("vec_new_push", size),
            &size,
            |b, &size| {
                b.iter(|| {
                    let mut v = Vec::new();
                    for i in 0..size {
                        v.push(black_box(i));
                    }
                    black_box(v)
                })
            }
        );
        
        // Benchmark Vec::with_capacity + push
        group.bench_with_input(
            BenchmarkId::new("vec_with_capacity_push", size),
            &size,
            |b, &size| {
                b.iter(|| {
                    let mut v = Vec::with_capacity(size);
                    for i in 0..size {
                        v.push(black_box(i));
                    }
                    black_box(v)
                })
            }
        );
        
        // Benchmark collect() depuis iterator
        group.bench_with_input(
            BenchmarkId::new("collect_from_iterator", size),
            &size,
            |b, &size| {
                b.iter(|| {
                    let v: Vec<usize> = (0..size).map(|i| black_box(i)).collect();
                    black_box(v)
                })
            }
        );
        
        // Benchmark Vec::with_capacity + extend
        group.bench_with_input(
            BenchmarkId::new("vec_with_capacity_extend", size),
            &size,
            |b, &size| {
                b.iter(|| {
                    let mut v = Vec::with_capacity(size);
                    v.extend((0..size).map(|i| black_box(i)));
                    black_box(v)
                })
            }
        );
    }
    
    group.finish();
}

// Tests de validation
#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_allocation_strategies_correctness() {
        let n = 1000;
        
        // Toutes les méthodes doivent produire le même résultat
        let v1: Vec<usize> = {
            let mut v = Vec::new();
            for i in 0..n {
                v.push(i);
            }
            v
        };
        
        let v2: Vec<usize> = {
            let mut v = Vec::with_capacity(n);
            for i in 0..n {
                v.push(i);
            }
            v
        };
        
        let v3: Vec<usize> = (0..n).collect();
        
        let v4: Vec<usize> = {
            let mut v = Vec::with_capacity(n);
            v.extend(0..n);
            v
        };
        
        assert_eq!(v1, v2);
        assert_eq!(v2, v3);
        assert_eq!(v3, v4);
        
        // Vérifications de capacité
        assert!(v2.capacity() >= n);
        assert!(v4.capacity() >= n);
    }
    
    #[test]
    fn test_memory_efficiency() {
        let n = 1000;
        
        // Test avec pré-allocation exacte
        let mut v_exact = Vec::with_capacity(n);
        for i in 0..n {
            v_exact.push(i);
        }
        assert_eq!(v_exact.capacity(), n);
        
        // Test avec sur-allocation
        let mut v_over = Vec::with_capacity(n * 2);
        for i in 0..n {
            v_over.push(i);
        }
        assert!(v_over.capacity() >= n * 2);
        
        // Optimisation mémoire
        v_over.shrink_to_fit();
        assert!(v_over.capacity() >= n);
        assert!(v_over.capacity() < n * 2);
    }
}
```

### 5. Patterns d'Optimisation avancés

```rust
// Pool de Vec réutilisables pour éviter les allocations
pub struct VecPool<T> {
    pool: std::sync::Mutex<Vec<Vec<T>>>,
    default_capacity: usize,
}

impl<T> VecPool<T> {
    pub fn new(default_capacity: usize) -> Self {
        Self {
            pool: std::sync::Mutex::new(Vec::new()),
            default_capacity,
        }
    }
    
    pub fn get(&self) -> PooledVec<T> {
        let mut pool = self.pool.lock().unwrap();
        let mut vec = pool.pop().unwrap_or_else(|| Vec::with_capacity(self.default_capacity));
        vec.clear(); // Assure que le Vec est vide
        
        PooledVec {
            vec: Some(vec),
            pool: &self.pool,
        }
    }
}

pub struct PooledVec<'a, T> {
    vec: Option<Vec<T>>,
    pool: &'a std::sync::Mutex<Vec<Vec<T>>>,
}

impl<T> std::ops::Deref for PooledVec<'_, T> {
    type Target = Vec<T>;
    fn deref(&self) -> &Self::Target {
        self.vec.as_ref().unwrap()
    }
}

impl<T> std::ops::DerefMut for PooledVec<'_, T> {
    fn deref_mut(&mut self) -> &mut Self::Target {
        self.vec.as_mut().unwrap()
    }
}

impl<T> Drop for PooledVec<'_, T> {
    fn drop(&mut self) {
        if let Some(vec) = self.vec.take() {
            let mut pool = self.pool.lock().unwrap();
            pool.push(vec);
        }
    }
}

// Utilisation du pool
fn use_vec_pool() {
    let pool = VecPool::new(1000);
    
    // Réutilise les Vec sans réallocation
    for _ in 0..10 {
        let mut pooled_vec = pool.get();
        for i in 0..1000 {
            pooled_vec.push(i);
        }
        // Vec automatiquement retourné au pool à la fin du scope
    }
}

// Builder pattern pour construction efficace
pub struct VecBuilder<T> {
    vec: Vec<T>,
    sorted: bool,
    deduplicated: bool,
}

impl<T> VecBuilder<T> {
    pub fn new() -> Self {
        Self {
            vec: Vec::new(),
            sorted: true,
            deduplicated: true,
        }
    }
    
    pub fn with_capacity(capacity: usize) -> Self {
        Self {
            vec: Vec::with_capacity(capacity),
            sorted: true,
            deduplicated: true,
        }
    }
    
    pub fn push(mut self, item: T) -> Self {
        self.vec.push(item);
        self.sorted = false;
        self.deduplicated = false;
        self
    }
    
    pub fn extend_from_iter<I>(mut self, iter: I) -> Self
    where
        I: IntoIterator<Item = T>,
    {
        self.vec.extend(iter);
        self.sorted = false;
        self.deduplicated = false;
        self
    }
    
    pub fn sort(mut self) -> Self
    where
        T: Ord,
    {
        if !self.sorted {
            self.vec.sort();
            self.sorted = true;
        }
        self
    }
    
    pub fn dedup(mut self) -> Self
    where
        T: PartialEq,
    {
        if !self.deduplicated {
            self.vec.dedup();
            self.deduplicated = true;
        }
        self
    }
    
    pub fn build(self) -> Vec<T> {
        self.vec
    }
}
```

## Analyse de performance détaillée

### Complexité Temporelle

```rust
// Analyse des coûts asymptotiques
fn analyze_complexity() {
    println!("=== Analyse Complexité Temporelle ===");
    
    // Vec::new() + push en boucle
    // - Réallocations: log(n) fois
    // - Copies totales: O(n) éléments copiés au total
    // - Complexité: O(n) amortie, mais constante élevée
    
    // Vec::with_capacity() + push en boucle  
    // - Réallocations: 0
    // - Copies: 0
    // - Complexité: O(n) strict
    
    let sizes = [1000, 10000, 100000, 1000000];
    
    for &size in &sizes {
        // Mesure allocations
        let start = std::time::Instant::now();
        let mut v1 = Vec::new();
        for i in 0..size {
            v1.push(i);
        }
        let time_no_prealloc = start.elapsed();
        
        let start = std::time::Instant::now();
        let mut v2 = Vec::with_capacity(size);
        for i in 0..size {
            v2.push(i);
        }
        let time_prealloc = start.elapsed();
        
        let speedup = time_no_prealloc.as_nanos() as f64 / time_prealloc.as_nanos() as f64;
        
        println!("Size: {}, No prealloc: {:?}, Prealloc: {:?}, Speedup: {:.2}x", 
                 size, time_no_prealloc, time_prealloc, speedup);
    }
}
```

## Quand utiliser chaque approche

### Matrice de décision

| Scénario | Recommandation | Justification |
|----------|----------------|---------------|
| **Taille connue à l'avance** | `Vec::with_capacity(n)` | Évite toutes les réallocations |
| **Taille approximativement connue** | `Vec::with_capacity(estimate)` | Réduit les réallocations |
| **Taille totalement inconnue** | `Vec::new()` puis `shrink_to_fit()` | Simplicité, optimise après |
| **Construction depuis itérateur** | `collect()` | Optimisé par le compilateur |
| **Ajouts par petits batches** | `reserve()` périodiquement | Équilibre performance/mémoire |
| **Très gros volumes** | Pool + réutilisation | Évite la fragmentation |

### Cas d'Usage spécialisés

```rust
// Parsing de fichiers - taille estimable
fn parse_file_lines(content: &str) -> Vec<String> {
    let estimated_lines = content.len() / 50; // 50 chars par ligne en moyenne
    let mut lines = Vec::with_capacity(estimated_lines);
    
    for line in content.lines() {
        lines.push(line.to_string());
    }
    
    lines
}

// Stream processing - taille inconnue
fn process_stream<T>(stream: impl Iterator<Item = T>) -> Vec<T> {
    let mut results = Vec::new();
    let mut count = 0;
    
    for item in stream {
        results.push(item);
        count += 1;
        
        // Réserve proactivement pour éviter les réallocations fréquentes
        if count > 0 && count.is_power_of_two() {
            results.reserve(count);
        }
    }
    
    results.shrink_to_fit(); // Optimise la mémoire finale
    results
}
```

## Points clés à retenir

**Utilise with_capacity() pour** :
- Nombres d'éléments prévisibles.
- Scénarios haute performance.

**Utilise Vec::new() pour** :
- Tailles petites/inconnues ou prototypage.

**Évite les réallocations inutiles**—elles dominent le runtime pour les gros Vecs.

**Techniques avancées** :
- `extend()` pour les itérateurs
- `reserve()` pour croissance par batches  
- `shrink_to_fit()` pour optimiser la mémoire
- Pools pour réutilisation intensive

## Impact monde réel

Dans la crate regex, la pré-allocation est utilisée pour les groupes de capture pour éviter les réallocations pendant le pattern matching. Dans serde_json, les buffers de sérialisation sont pré-alloués basés sur la taille estimée du JSON de sortie.

Sur-réserver a un coût aussi. `with_capacity(1000)` pour dix éléments retient tout le bloc
jusqu'au drop du `Vec` ; `shrink_to_fit()` le rend, au prix d'une copie supplémentaire.
