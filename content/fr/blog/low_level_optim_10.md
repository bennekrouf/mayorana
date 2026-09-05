---
id: profiling-optimization-rust
title: >-
  Profiling Rust : Résoudre les L1 Cache Misses avec perf, Flamegraph et
  Criterion
slug: profiling-optimization-rust
locale: fr
author: mayo
excerpt: >-
  Optimisation bas niveau en Rust, se concentrant sur les outils de profiling
  pour identifier et corriger les goulots d'étranglement de performance comme
  les L1 cache misses
tags:
  - rust
  - profiling
  - optimization
  - cache
  - performance
date: '2025-11-14'
---

# Profiling Rust : Résoudre les L1 Cache Misses avec perf, Flamegraph et Criterion

Profiler et optimiser les goulots d'étranglement de performance bas niveau dans une codebase Rust, comme les L1 cache misses excessifs, nécessite une approche systématique utilisant des outils spécialisés. Je vais détailler comment utiliser `perf`, `cargo flamegraph`, et `criterion` pour diagnostiquer et optimiser une section critique en performance, assurant des améliorations mesurables.

<div class="svg-container" style="margin:2rem 0;">
<svg class="lo10-fig" viewBox="0 0 800 230" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Array-of-Structs gaspille de l'espace de ligne de cache en chargeant des champs inutilisés, tandis que Struct-of-Arrays empaquette un champ de façon contiguë par ligne de cache">
<!-- style -->
<style>
.lo10-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .lo10-fig,[data-theme="dark"] .lo10-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.lo10-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.lo10-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.lo10-fig .x{fill:#FF6B00;opacity:0.75}
.lo10-fig .yz{fill:var(--mut);opacity:0.35}
.lo10-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.lo10-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.lo10-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
</style>
<!-- top: AoS -->
<text x="40" y="30" class="ti">Array-of-Structs — une ligne L1 de 64 octets</text>
<rect x="40" y="42" width="720" height="46" rx="5" class="box"/>
<rect x="40" y="42" width="120" height="46" class="x"/>
<rect x="160" y="42" width="120" height="46" class="yz"/>
<rect x="280" y="42" width="120" height="46" class="x"/>
<rect x="400" y="42" width="120" height="46" class="yz"/>
<rect x="520" y="42" width="120" height="46" class="x"/>
<rect x="640" y="42" width="120" height="46" class="yz"/>
<text x="400" y="106" text-anchor="middle" class="mut">lire x charge aussi y, z dont on n'a pas besoin — ligne gaspillée vite</text>
<!-- bottom: SoA -->
<text x="40" y="150" class="ti">Struct-of-Arrays — xs empaquetés en continu</text>
<rect x="40" y="162" width="720" height="46" rx="5" class="boxac"/>
<text x="400" y="190" text-anchor="middle" class="tx">xs: [f32] … 16 valeurs tiennent par ligne de 64 octets</text>
<text x="40" y="226" class="mut">accès contigu, aucun octet gaspillé — cache misses divisés par ~10</text>
</svg>
</div>

## Outils et Leurs Rôles

- **`perf` (Linux)** : Un profiler système pour les événements matériels comme les cache misses, cycles, et instructions. Idéal pour cibler les problèmes de L1 cache à travers l'application.
- **`cargo flamegraph`** : Génère des flame graphs visuels pour identifier où le temps est passé, corrélant les cache misses à des fonctions spécifiques.
- **`criterion`** : Un outil de microbenchmarking pour des mesures précises et répétables de petites sections de code, parfait pour les comparaisons avant-après optimisation.

## Scénario d'Exemple

Considère une application Rust traitant un large tableau de structs, où `perf` révèle des taux élevés de L1 cache miss causant des ralentissements :

```rust
struct Point { x: f32, y: f32, z: f32 } // 12 octets
fn process_points(points: &mut [Point]) {
    for p in points {
        p.x += 1.0; // Accès dispersé
        p.y += 1.0;
        p.z += 1.0;
    }
}
```

**Problème** : Le layout Array-of-Structs (AoS) cause une mauvaise localité, car accéder seulement à `x` tire les `y` et `z` inutiles dans la ligne de cache L1 de 64 octets, menant à des misses excessifs.

## Workflow pour optimiser les L1 Cache Misses

<div class="svg-container" style="margin:2rem 0;">
<svg class="lo10b-fig" viewBox="0 0 800 250" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Boucle de profiling en six étapes, de la reproduction à perf, flamegraph, criterion, optimisation et vérification, qui reboucle sur perf jusqu'à ce que le taux de miss baisse">
<!-- style -->
<style>
.lo10b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .lo10b-fig,[data-theme="dark"] .lo10b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.lo10b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.lo10b-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.lo10b-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo10b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo10b-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo10b-fig .ac{fill:var(--ac);font:700 11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo10b-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.lo10b-fig .lnac{stroke:var(--ac);stroke-width:2;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="lo10b-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
<marker id="lo10b-arrowac-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ac)"/></marker>
</defs>
<!-- title -->
<text x="400" y="24" class="ti">Reproduire → mesurer → corriger → remesurer</text>
<!-- step 1 -->
<rect x="25" y="50" width="115" height="60" rx="6" class="box"/>
<text x="82" y="75" class="tx">1 Reproduire</text>
<text x="82" y="93" class="mut">--release, 1M pts</text>
<path d="M140,80 L150,80" class="ln" marker-end="url(#lo10b-arrow-fr)"/>
<!-- step 2 -->
<rect x="152" y="50" width="115" height="60" rx="6" class="boxac"/>
<text x="209" y="75" class="tx">2 perf stat</text>
<text x="209" y="93" class="mut">est-ce le cache ?</text>
<path d="M267,80 L277,80" class="ln" marker-end="url(#lo10b-arrow-fr)"/>
<!-- step 3 -->
<rect x="279" y="50" width="115" height="60" rx="6" class="box"/>
<text x="336" y="75" class="tx">3 flamegraph</text>
<text x="336" y="93" class="mut">quelle fonction ?</text>
<path d="M394,80 L404,80" class="ln" marker-end="url(#lo10b-arrow-fr)"/>
<!-- step 4 -->
<rect x="406" y="50" width="115" height="60" rx="6" class="box"/>
<text x="463" y="75" class="tx">4 criterion</text>
<text x="463" y="93" class="mut">baseline 50ms</text>
<path d="M521,80 L531,80" class="ln" marker-end="url(#lo10b-arrow-fr)"/>
<!-- step 5 -->
<rect x="533" y="50" width="115" height="60" rx="6" class="box"/>
<text x="590" y="75" class="tx">5 Optimiser</text>
<text x="590" y="93" class="mut">AoS → SoA</text>
<path d="M648,80 L658,80" class="ln" marker-end="url(#lo10b-arrow-fr)"/>
<!-- step 6 -->
<rect x="660" y="50" width="115" height="60" rx="6" class="box"/>
<text x="717" y="75" class="tx">6 Vérifier</text>
<text x="717" y="93" class="mut">1% miss, 40ms</text>
<!-- feedback loop -->
<path d="M717,110 L717,170 L209,170 L209,112" class="lnac" marker-end="url(#lo10b-arrowac-fr)"/>
<text x="463" y="188" class="ac">toujours au-dessus de 1–2 % ? on refait un tour</text>
<!-- footer -->
<text x="400" y="222" class="mut">Chaque étape répond à une question différente — n'optimisez jamais avant que l'étape 2 prouve que le cache est en cause</text>
</svg>
</div>

### 1. Setup et Reproduction
- Compiler avec `--release` pour une performance réaliste (`cargo build --release`).
- Lancer l'app avec une charge de travail représentative (ex : 1M `Point`s).

### 2. Diagnostiquer avec `perf`
- **Commande** : `perf stat -e cycles,instructions,L1-dcache-loads,L1-dcache-load-misses ./target/release/app`
- **Sortie Exemple** :
  ```
  10,000,000,000 cycles
  15,000,000,000 instructions
  5,000,000,000 L1-dcache-loads
  500,000,000 L1-dcache-load-misses (10.00%)
  ```
- **Insight** : Un taux de miss de 10% est élevé (idéal : <1-2%). Les L1 misses (50-100 cycles chacun) dominent le runtime.

### 3. Localiser avec `cargo flamegraph`
- **Installation** : `cargo install flamegraph`
- **Lancement** : `cargo flamegraph --bin app`
- **Sortie** : Un flame graph SVG montre `process_points` prenant 80% du temps, avec des pics plats indiquant des stalls mémoire.
- **Hypothèse** : L'accès strided à travers `x`, `y`, `z` récupère des données inutiles par ligne de cache.

### 4. Microbenchmark avec `criterion`
- **Setup** :
  ```rust
  use criterion::{black_box, Criterion};
  fn bench(c: &mut Criterion) {
      let mut points = vec![Point { x: 0.0, y: 0.0, z: 0.0 }; 1_000_000];
      c.bench_function("process_points", |b| b.iter(|| process_points(black_box(&mut points))));
  }
  ```
- **Baseline** : 50ms par itération, variance élevée due aux cache misses.

### 5. Optimiser
- **Passer à Struct-of-Arrays (SoA)** :
  ```rust
  struct Points { xs: Vec<f32>, ys: Vec<f32>, zs: Vec<f32> }
  impl Points {
      fn new(n: usize) -> Self {
          Points { xs: vec![0.0; n], ys: vec![0.0; n], zs: vec![0.0; n] }
      }
      fn process(&mut self) {
          for x in &mut self.xs { *x += 1.0; } // Accès contigu
      }
  }
  ```
- **Pourquoi** : Les `xs` contigus rentrent 16 `f32`s par ligne de cache de 64 octets (vs 5 `Point`s avec padding), réduisant les loads et misses.
- **Alternative** : Si AoS est requis, aligner `Point` avec `#[repr(align(16))]` et padder à 16 octets pour réduire les récupérations de ligne partielle.

### 6. Vérifier
- **perf** : Relancer `perf stat` :
  ```
  8,000,000,000 cycles
  12,000,000,000 instructions
  3,000,000,000 L1-dcache-loads
  30,000,000 L1-dcache-load-misses (1.00%)
  ```
  Les misses chutent à 1%, les cycles diminuent de 20%.
- **Flamegraph** : Le nouveau graphe montre `process` comme un pic plus étroit, moins memory-bound.
- **criterion** : Le temps chute à 40ms, avec une variance plus serrée, confirmant l'efficacité du cache.

## Étapes d'Optimisation avancées

### Techniques Supplémentaires

```rust
// Technique 1: Prefetching explicite
use std::arch::x86_64::_mm_prefetch;
fn process_with_prefetch(points: &mut [Point]) {
    const PREFETCH_DISTANCE: usize = 64; // Lignes de cache en avance
    
    for (i, p) in points.iter_mut().enumerate() {
        // Prefetch la prochaine région
        if i + PREFETCH_DISTANCE < points.len() {
            unsafe {
                _mm_prefetch(
                    &points[i + PREFETCH_DISTANCE] as *const _ as *const i8,
                    std::arch::x86_64::_MM_HINT_T0
                );
            }
        }
        
        p.x += 1.0;
        p.y += 1.0;
        p.z += 1.0;
    }
}

// Technique 2: SIMD pour vectorisation
use std::simd::*;
fn process_simd(xs: &mut [f32]) {
    const LANE_COUNT: usize = 8; // AVX2 8x f32
    
    for chunk in xs.chunks_exact_mut(LANE_COUNT) {
        let vals = f32x8::from_slice(chunk);
        let incremented = vals + f32x8::splat(1.0);
        incremented.copy_to_slice(chunk);
    }
    
    // Traiter le reste
    for x in xs.chunks_exact_mut(LANE_COUNT).into_remainder() {
        *x += 1.0;
    }
}

// Technique 3: Alignement et padding optimaux
#[repr(C, align(64))] // Aligner sur ligne de cache
struct AlignedPoint {
    x: f32,
    y: f32,
    z: f32,
    _padding: [u8; 52], // Pad à 64 octets
}
```

### Mesures détaillées avec `perf`
```bash
# Profiling détaillé
perf record -e cache-misses,cache-references,cycles,instructions ./target/release/app

# Analyse par fonction
perf report --stdio

# Événements spécifiques au CPU
perf list | grep cache
perf stat -e L1-dcache-loads,L1-dcache-load-misses,L1-icache-load-misses ./app

# Profiling avec sampling
perf record -g --call-graph=dwarf ./app
perf report --no-children --sort=dso,symbol
```

### Optimisations Algorithmiques

```rust
// Blocking/Tiling pour améliorer la localité
fn process_blocked(points: &mut [Point], block_size: usize) {
    for chunk in points.chunks_mut(block_size) {
        // Traiter le bloc en entier avant de passer au suivant
        for p in chunk {
            p.x += 1.0;
        }
        for p in chunk {
            p.y += 1.0;
        }
        for p in chunk {
            p.z += 1.0;
        }
    }
}

// Loop fusion pour réduire les passes
fn process_fused(points: &mut [Point]) {
    for p in points {
        // Toutes les opérations sur le même élément
        p.x = p.x + 1.0;
        p.y = p.y + 1.0;
        p.z = p.z + 1.0;
        
        // Calculs supplémentaires qui utilisent x, y, z
        let magnitude = (p.x * p.x + p.y * p.y + p.z * p.z).sqrt();
        p.x /= magnitude;
        p.y /= magnitude;
        p.z /= magnitude;
    }
}
```

## Workflow de Profiling Systématique

### 1. Collecte de données Baseline
```rust
// Setup de benchmark complet
use criterion::{BenchmarkId, Criterion, Throughput};

fn comprehensive_bench(c: &mut Criterion) {
    let sizes = [1_000, 10_000, 100_000, 1_000_000];
    
    let mut group = c.benchmark_group("point_processing");
    
    for size in sizes {
        group.throughput(Throughput::Elements(size as u64));
        
        let mut points = vec![Point { x: 0.0, y: 0.0, z: 0.0 }; size];
        
        group.bench_with_input(
            BenchmarkId::new("aos", size),
            &size,
            |b, _| b.iter(|| process_points(black_box(&mut points)))
        );
        
        let mut soa_points = Points::new(size);
        group.bench_with_input(
            BenchmarkId::new("soa", size),
            &size,
            |b, _| b.iter(|| soa_points.process())
        );
    }
    
    group.finish();
}
```

### 2. Analyse de régression
```bash
# Comparer avant/après
criterion --save-baseline before
# ... faire les changements ...
criterion --baseline before
```

### 3. Validation Multi-Architecture
```rust
#[cfg(target_arch = "x86_64")]
fn process_optimized() { /* Implémentation AVX2 */ }

#[cfg(target_arch = "aarch64")]
fn process_optimized() { /* Implémentation NEON */ }

#[cfg(not(any(target_arch = "x86_64", target_arch = "aarch64")))]
fn process_optimized() { /* Fallback générique */ }
```

## Métriques de validation

### Métriques de performance clés
- **IPC (Instructions Per Cycle)** : >2.0 indique une bonne utilisation CPU
- **Cache Miss Rate** : <2% pour L1, <10% pour L2
- **Memory Bandwidth** : % d'utilisation de la bande passante théorique
- **Branch Misprediction Rate** : <5%

### Outils de mesure avancés
```bash
# Intel VTune (commercial)
vtune -collect memory-access ./app

# AMD μProf (gratuit)
AMDuProfCLI collect --config inst_based ./app

# Valgrind cachegrind
valgrind --tool=cachegrind ./app
```

## Où cela te laisse
Pour résoudre les L1 cache misses dans une codebase Rust, j'utiliserais `perf` pour détecter les taux de miss élevés, `cargo flamegraph` pour cibler le coupable, et `criterion` pour mesurer les améliorations. Le workflow—reproduire, diagnostiquer, hypothèse, optimiser, vérifier—assure des résultats guidés par les données. Dans ce cas, passer à un layout SoA a réduit drastiquement les cache misses, boostant le débit, comme confirmé par les outils de profiling. Cette approche aide les développeurs à résoudre efficacement les goulots d'étranglement.
