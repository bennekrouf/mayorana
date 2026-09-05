---
id: simd-matrix-mult-rust
title: 'SIMD en Rust : Optimiser la Multiplication de Matrices'
slug: simd-matrix-mult-rust
locale: fr
date: '2025-11-16'
author: mayo
excerpt: >-
  Exploiter le support SIMD de Rust pour accélérer la multiplication de matrices
  avec des considérations pour la portabilité et la justesse
tags:
  - rust
  - simd
  - optimization
  - matrix-multiplication
  - performance
---

# SIMD en Rust : Optimiser la Multiplication de Matrices

Les capacités **SIMD (Single Instruction, Multiple Data)** de Rust permettent le traitement parallèle de plusieurs éléments de données en une seule instruction CPU, idéal pour des tâches computationnellement intensives comme la multiplication de matrices. Je vais expliquer comment exploiter `std::arch` pour un débit maximum, adresser la portabilité à travers les architectures (ex : x86_64 avec SSE/AVX vs ARM avec NEON), et souligner les défis et solutions pour assurer justesse et performance.

<div class="svg-container" style="margin:2rem 0;">
<svg class="lo3-fig" viewBox="0 0 800 250" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Comparaison entre une boucle scalaire traitant un f32 à la fois et une instruction AVX traitant 8 lanes f32 simultanément">
<style>
.lo3-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .lo3-fig,[data-theme="dark"] .lo3-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.lo3-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.lo3-fig .fin{fill:var(--box);stroke:var(--ac);stroke-width:2}
.lo3-fig .lane{fill:var(--bg);stroke:var(--ln);stroke-width:1}
.lo3-fig .lane-on{fill:var(--ac);stroke:var(--ac);stroke-width:1}
.lo3-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo3-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo3-fig .ac{fill:var(--ac);font:700 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo3-fig line{stroke:var(--ln);stroke-width:1.5}
</style>
<defs>
<marker id="lo3-arrow-fr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"/>
</marker>
</defs>
<!-- gauche : scalaire -->
<rect x="40" y="30" width="320" height="110" rx="6" class="box"/>
<text x="200" y="52" class="tx">Boucle scalaire</text>
<text x="200" y="70" class="mut">c[i][j] += a[i][k] * b[k][j]</text>
<rect x="80" y="82" width="20" height="20" class="lane-on"/>
<rect x="105" y="82" width="20" height="20" class="lane"/>
<rect x="130" y="82" width="20" height="20" class="lane"/>
<rect x="155" y="82" width="20" height="20" class="lane"/>
<rect x="180" y="82" width="20" height="20" class="lane"/>
<rect x="205" y="82" width="20" height="20" class="lane"/>
<rect x="230" y="82" width="20" height="20" class="lane"/>
<rect x="255" y="82" width="20" height="20" class="lane"/>
<text x="200" y="122" class="mut">1 f32 par instruction, 8 itérations</text>
<!-- droite : SIMD -->
<rect x="440" y="30" width="320" height="110" rx="6" class="fin"/>
<text x="600" y="52" class="tx">AVX : _mm256_mul_ps / add_ps</text>
<text x="600" y="70" class="mut">8 termes du produit scalaire à la fois</text>
<rect x="480" y="82" width="20" height="20" class="lane-on"/>
<rect x="505" y="82" width="20" height="20" class="lane-on"/>
<rect x="530" y="82" width="20" height="20" class="lane-on"/>
<rect x="555" y="82" width="20" height="20" class="lane-on"/>
<rect x="580" y="82" width="20" height="20" class="lane-on"/>
<rect x="605" y="82" width="20" height="20" class="lane-on"/>
<rect x="630" y="82" width="20" height="20" class="lane-on"/>
<rect x="655" y="82" width="20" height="20" class="lane-on"/>
<text x="600" y="122" class="ac">8 f32 par instruction, 1 itération</text>
<!-- fusion vers le résultat -->
<line x1="200" y1="140" x2="200" y2="168" marker-end="url(#lo3-arrow-fr)"/>
<line x1="600" y1="140" x2="600" y2="168" marker-end="url(#lo3-arrow-fr)"/>
<path d="M200,168 L200,190 L600,190 L600,168" fill="none" stroke="var(--ln)" stroke-width="1.5"/>
<rect x="270" y="195" width="260" height="45" rx="6" class="box"/>
<text x="400" y="222" class="tx">~8x moins d'itérations de boucle</text>
</svg>
</div>

## Vectoriser la multiplication de matrices avec SIMD

La multiplication de matrices (ex : \( C = A \times B \), où \( A \) est \( m \times n \), \( B \) est \( n \times p \), et \( C \) est \( m \times p \)) implique de calculer des produits scalaires de lignes et colonnes. Une implémentation scalaire naïve pour une matrice 4x4 est :

```rust
fn matrix_mult_scalar(a: &[[f32; 4]; 4], b: &[[f32; 4]; 4], c: &mut [[f32; 4]; 4]) {
    for i in 0..4 {
        for j in 0..4 {
            c[i][j] = 0.0;
            for k in 0..4 {
                c[i][j] += a[i][k] * b[k][j];
            }
        }
    }
}
```

Cela traite un `f32` à la fois, ce qui est lent. SIMD peut calculer plusieurs éléments simultanément (ex : 8 `f32` avec AVX sur x86_64). Voici comment le vectoriser en utilisant `std::arch` :

### Sélectionner les Instructions SIMD
Sur x86_64 avec AVX (registres 256-bit), utilise :
- `_mm256_loadu_ps` : Charge 8 `f32` dans un registre 256-bit.
- `_mm256_mul_ps` : Multiplie deux vecteurs 256-bit.
- `_mm256_add_ps` : Additionne deux vecteurs 256-bit.
- `_mm256_storeu_ps` : Stocke les résultats en mémoire.

### Implémentation Vectorisée
En supposant que \( p \) est un multiple de 8 (padding si nécessaire), vectorise la boucle interne :

```rust
#[cfg(target_arch = "x86_64")]
use std::arch::x86_64::*;

unsafe fn matrix_mult_simd(a: &[[f32; 8]; 8], b: &[[f32; 8]; 8], c: &mut [[f32; 8]; 8]) {
    for i in 0..8 {
        for j in (0..8).step_by(8) { // Traite 8 éléments de C[i][j..j+8]
            let mut sum = _mm256_setzero_ps(); // Registre 256-bit à zéro
            for k in 0..8 {
                let a_vec = _mm256_set1_ps(a[i][k]); // Broadcast a[i][k]
                let b_ptr = b[k][j..].as_ptr();
                let b_vec = _mm256_loadu_ps(b_ptr);  // Charge 8 éléments de B
                let prod = _mm256_mul_ps(a_vec, b_vec);
                sum = _mm256_add_ps(sum, prod);      // Accumule
            }
            _mm256_storeu_ps(c[i][j..].as_mut_ptr(), sum); // Stocke 8 résultats
        }
    }
}
```

Cela calcule 8 termes de produit scalaire par itération, réduisant les itérations de boucle par 8x. Enveloppe cela dans des boucles externes, optionnellement avec unrolling ou tiling (ex : blocs 8x8) pour un meilleur usage cache.

## Utiliser les outils SIMD de Rust

- **`std::arch`** : Fournit des intrinsiques brutes, nécessitant `unsafe` et un ciblage d'architecture manuel (ex : `#[cfg(target_arch = "x86_64")]`). Active AVX avec `--features avx2` dans `Cargo.toml`.
- **Crates comme `packed_simd`** : Offre des abstractions portables :
  ```rust
  use packed_simd::f32x8;

  fn matrix_mult_simd_portable(a: &[[f32; 8]; 8], b: &[[f32; 8]; 8], c: &mut [[f32; 8]; 8]) {
      for i in 0..8 {
          for j in (0..8).step_by(8) {
              let mut sum = f32x8::splat(0.0);
              for k in 0..8 {
                  let a_vec = f32x8::splat(a[i][k]);
                  let b_vec = f32x8::from_slice_unaligned(&b[k][j..]);
                  let prod = a_vec * b_vec;
                  sum = sum + prod;
              }
              sum.write_unaligned(&mut c[i][j..]);
          }
      }
  }
  ```
  Cela cache les spécificités d'architecture, se rabattant sur du code scalaire si SIMD n'est pas disponible.

## Défis à Travers les Architectures

- **Disponibilité des Jeux d'Instructions** : AVX est spécifique à x86_64 ; ARM utilise NEON (128-bit, 4x `f32`). Le code AVX échoue sur ARM ou des CPUs x86 plus anciens sans AVX.
  - **Solution** : Utilise `#[cfg]` pour la compilation conditionnelle ou la détection de fonctionnalités à l'exécution avec `std::is_x86_feature_detected!("avx2")`. Fallback vers scalaire ou SIMD plus étroit (ex : SSE2).
- **Alignement** : AVX préfère la mémoire alignée sur 32 octets. Les chargements non-alignés (`_mm256_loadu_ps`) sont plus lents.
  - **Solution** : Aligne les données avec `#[repr(align(32))]` ou pad les tableaux, échangeant mémoire contre vitesse.
- **Portabilité** : Hardcoder AVX te verrouille sur x86_64. `packed_simd` aide, mais les performances varient (ex : NEON 4-wide vs AVX 8-wide).
  - **Solution** : Abstrais avec des crates ou écris plusieurs implémentations, sélectionnant à l'exécution.
- **Justesse** : L'associativité des nombres flottants change avec l'ordre de sommation SIMD, risquant une dérive numérique.
  - **Solution** : Teste contre les résultats scalaires avec des entrées connues ; utilise `fsum` ou réduction par paires pour la précision.

<div class="svg-container" style="margin:2rem 0;">
<svg class="lo3b-fig" viewBox="0 0 800 370" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Arbre de dispatch choisissant à l'exécution un noyau de multiplication matricielle AVX2, SSE2, NEON ou scalaire, tous validés contre la même référence scalaire">
<style>
.lo3b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .lo3b-fig,[data-theme="dark"] .lo3b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.lo3b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.lo3b-fig .fin{fill:var(--box);stroke:var(--ac);stroke-width:2.5}
.lo3b-fig .hd{fill:var(--bg);stroke:var(--mut);stroke-width:1.5}
.lo3b-fig .ti{fill:var(--tx);font:700 13px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo3b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo3b-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo3b-fig .ac{fill:var(--ac);font:700 13px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo3b-fig line,.lo3b-fig path.ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="lo3b-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"/>
</marker>
<marker id="lo3b-arrowac" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ac)"/>
</marker>
</defs>
<!-- point d'appel unique -->
<rect x="280" y="18" width="240" height="46" rx="6" class="box"/>
<text x="400" y="40" class="ti">matrix_mult(a, b, c)</text>
<text x="400" y="56" class="mut">un seul point d'appel dans ton code</text>
<line x1="400" y1="64" x2="400" y2="86" marker-end="url(#lo3b-arrow)"/>
<!-- dispatch -->
<rect x="240" y="88" width="320" height="46" rx="6" class="hd"/>
<text x="400" y="110" class="tx">Choix du noyau : cfg + détection</text>
<text x="400" y="126" class="mut">le premier match gagne, testé une fois au démarrage</text>
<!-- bus de distribution -->
<line x1="400" y1="134" x2="400" y2="158"/>
<line x1="108" y1="158" x2="692" y2="158"/>
<line x1="108" y1="158" x2="108" y2="178" marker-end="url(#lo3b-arrowac)"/>
<line x1="303" y1="158" x2="303" y2="178" marker-end="url(#lo3b-arrow)"/>
<line x1="497" y1="158" x2="497" y2="178" marker-end="url(#lo3b-arrow)"/>
<line x1="692" y1="158" x2="692" y2="178" marker-end="url(#lo3b-arrow)"/>
<!-- quatre noyaux -->
<rect x="20" y="180" width="176" height="70" rx="6" class="fin"/>
<text x="108" y="203" class="ac">AVX2 — 8 × f32</text>
<text x="108" y="222" class="mut">_mm256_mul_ps</text>
<text x="108" y="240" class="mut">is_x86_feature_detected!</text>
<rect x="215" y="180" width="176" height="70" rx="6" class="box"/>
<text x="303" y="203" class="tx">SSE2 — 4 × f32</text>
<text x="303" y="222" class="mut">_mm_mul_ps</text>
<text x="303" y="240" class="mut">CPUs x86_64 anciens</text>
<rect x="409" y="180" width="176" height="70" rx="6" class="box"/>
<text x="497" y="203" class="tx">NEON — 4 × f32</text>
<text x="497" y="222" class="mut">vmulq_f32</text>
<text x="497" y="240" class="mut">cfg(target_arch aarch64)</text>
<rect x="604" y="180" width="176" height="70" rx="6" class="box"/>
<text x="692" y="203" class="tx">Repli scalaire</text>
<text x="692" y="222" class="mut">c[i][j] += a * b</text>
<text x="692" y="240" class="mut">compile partout</text>
<!-- fusion vers la référence -->
<path class="ln" d="M108,250 L108,274 L400,274"/>
<path class="ln" d="M303,250 L303,274"/>
<path class="ln" d="M497,250 L497,274"/>
<path class="ln" d="M692,250 L692,274 L400,274"/>
<line x1="400" y1="274" x2="400" y2="296" marker-end="url(#lo3b-arrow)"/>
<rect x="170" y="298" width="460" height="58" rx="6" class="box"/>
<text x="400" y="322" class="tx">Chaque noyau doit égaler la référence scalaire</text>
<text x="400" y="342" class="mut">le SIMD réordonne la somme — vérifie dans une tolérance</text>
</svg>
</div>

## Optimisations avancées

### Implémentation Multi-Architecture

```rust
// Support multi-architecture avec détection runtime
#[cfg(any(target_arch = "x86", target_arch = "x86_64"))]
mod x86_simd {
    use std::arch::x86_64::*;
    
    #[target_feature(enable = "avx2")]
    pub unsafe fn matrix_mult_avx2(
        a: &[[f32; 8]; 8], 
        b: &[[f32; 8]; 8], 
        c: &mut [[f32; 8]; 8]
    ) {
        // Implémentation AVX2 optimisée
        for i in 0..8 {
            for j in (0..8).step_by(8) {
                let mut sum = _mm256_setzero_ps();
                for k in 0..8 {
                    let a_vec = _mm256_set1_ps(a[i][k]);
                    let b_vec = _mm256_loadu_ps(b[k][j..].as_ptr());
                    sum = _mm256_fmadd_ps(a_vec, b_vec, sum); // Fused multiply-add
                }
                _mm256_storeu_ps(c[i][j..].as_mut_ptr(), sum);
            }
        }
    }
    
    #[target_feature(enable = "sse2")]
    pub unsafe fn matrix_mult_sse2(
        a: &[[f32; 4]; 4], 
        b: &[[f32; 4]; 4], 
        c: &mut [[f32; 4]; 4]
    ) {
        // Implémentation SSE2 pour CPUs plus anciens
        for i in 0..4 {
            let mut sum = _mm_setzero_ps();
            for k in 0..4 {
                let a_vec = _mm_set1_ps(a[i][k]);
                let b_vec = _mm_loadu_ps(b[k].as_ptr());
                let prod = _mm_mul_ps(a_vec, b_vec);
                sum = _mm_add_ps(sum, prod);
            }
            _mm_storeu_ps(c[i].as_mut_ptr(), sum);
        }
    }
}

#[cfg(target_arch = "aarch64")]
mod arm_simd {
    use std::arch::aarch64::*;
    
    pub unsafe fn matrix_mult_neon(
        a: &[[f32; 4]; 4], 
        b: &[[f32; 4]; 4], 
        c: &mut [[f32; 4]; 4]
    ) {
        // Implémentation NEON pour ARM
        for i in 0..4 {
            let mut sum = vdupq_n_f32(0.0);
            for k in 0..4 {
                let a_vec = vdupq_n_f32(a[i][k]);
                let b_vec = vld1q_f32(b[k].as_ptr());
                sum = vfmaq_f32(sum, a_vec, b_vec); // Fused multiply-add
            }
            vst1q_f32(c[i].as_mut_ptr(), sum);
        }
    }
}

// Dispatcher runtime
pub fn matrix_mult_optimized(
    a: &[[f32; 8]; 8], 
    b: &[[f32; 8]; 8], 
    c: &mut [[f32; 8]; 8]
) {
    #[cfg(target_arch = "x86_64")]
    {
        if is_x86_feature_detected!("avx2") {
            unsafe { x86_simd::matrix_mult_avx2(a, b, c) }
        } else if is_x86_feature_detected!("sse2") {
            // Conversion vers format 4x4 pour SSE2
            matrix_mult_sse2_fallback(a, b, c)
        } else {
            matrix_mult_scalar_fallback(a, b, c)
        }
    }
    
    #[cfg(target_arch = "aarch64")]
    {
        // Conversion vers format 4x4 pour NEON
        matrix_mult_neon_fallback(a, b, c)
    }
    
    #[cfg(not(any(target_arch = "x86_64", target_arch = "aarch64")))]
    {
        matrix_mult_scalar_fallback(a, b, c)
    }
}
```

### Techniques d'Optimisation Cache

```rust
// Blocking/Tiling pour optimiser les accès cache
const BLOCK_SIZE: usize = 64; // Optimisé pour L1 cache

pub fn matrix_mult_blocked<const N: usize>(
    a: &[[f32; N]; N], 
    b: &[[f32; N]; N], 
    c: &mut [[f32; N]; N]
) {
    // Initialiser C à zéro
    for row in c.iter_mut() {
        row.fill(0.0);
    }
    
    // Blocking triple-nested
    for ii in (0..N).step_by(BLOCK_SIZE) {
        for jj in (0..N).step_by(BLOCK_SIZE) {
            for kk in (0..N).step_by(BLOCK_SIZE) {
                // Bloc interne SIMD-optimisé
                let i_end = (ii + BLOCK_SIZE).min(N);
                let j_end = (jj + BLOCK_SIZE).min(N);
                let k_end = (kk + BLOCK_SIZE).min(N);
                
                matrix_mult_block_simd(
                    a, b, c,
                    ii..i_end,
                    jj..j_end, 
                    kk..k_end
                );
            }
        }
    }
}

fn matrix_mult_block_simd<const N: usize>(
    a: &[[f32; N]; N],
    b: &[[f32; N]; N], 
    c: &mut [[f32; N]; N],
    i_range: std::ops::Range<usize>,
    j_range: std::ops::Range<usize>,
    k_range: std::ops::Range<usize>
) {
    #[cfg(target_arch = "x86_64")]
    unsafe {
        if is_x86_feature_detected!("avx2") {
            for i in i_range {
                for j in j_range.clone().step_by(8) {
                    if j + 8 <= j_range.end {
                        let mut sum = _mm256_loadu_ps(c[i][j..].as_ptr());
                        
                        for k in k_range.clone() {
                            let a_vec = _mm256_set1_ps(a[i][k]);
                            let b_vec = _mm256_loadu_ps(b[k][j..].as_ptr());
                            sum = _mm256_fmadd_ps(a_vec, b_vec, sum);
                        }
                        
                        _mm256_storeu_ps(c[i][j..].as_mut_ptr(), sum);
                    } else {
                        // Fallback scalaire pour les éléments restants
                        for jj in j..j_range.end {
                            for k in k_range.clone() {
                                c[i][jj] += a[i][k] * b[k][jj];
                            }
                        }
                    }
                }
            }
            return;
        }
    }
    
    // Fallback scalaire
    for i in i_range {
        for j in j_range.clone() {
            for k in k_range.clone() {
                c[i][j] += a[i][k] * b[k][j];
            }
        }
    }
}
```

### Benchmarking complet

```rust
use criterion::{BenchmarkId, Criterion, Throughput, black_box};

fn comprehensive_matrix_bench(c: &mut Criterion) {
    let sizes = [64, 128, 256, 512];
    
    let mut group = c.benchmark_group("matrix_multiplication");
    
    for size in sizes {
        group.throughput(Throughput::Elements((size * size * size) as u64));
        
        // Matrices alignées pour SIMD
        let mut a = vec![vec![1.0f32; size]; size];
        let mut b = vec![vec![2.0f32; size]; size];
        let mut c = vec![vec![0.0f32; size]; size];
        
        // Initialisation avec données aléatoires
        for i in 0..size {
            for j in 0..size {
                a[i][j] = (i + j) as f32;
                b[i][j] = (i * j) as f32;
            }
        }
        
        group.bench_with_input(
            BenchmarkId::new("scalar", size),
            &size,
            |bench, _| {
                bench.iter(|| {
                    matrix_mult_scalar_generic(
                        black_box(&a),
                        black_box(&b),
                        black_box(&mut c)
                    )
                })
            }
        );
        
        #[cfg(target_arch = "x86_64")]
        group.bench_with_input(
            BenchmarkId::new("simd_avx2", size),
            &size,
            |bench, _| {
                bench.iter(|| {
                    matrix_mult_optimized_generic(
                        black_box(&a),
                        black_box(&b), 
                        black_box(&mut c)
                    )
                })
            }
        );
        
        group.bench_with_input(
            BenchmarkId::new("blocked", size),
            &size,
            |bench, _| {
                bench.iter(|| {
                    matrix_mult_blocked_generic(
                        black_box(&a),
                        black_box(&b),
                        black_box(&mut c)
                    )
                })
            }
        );
    }
    
    group.finish();
}

// Fonctions génériques pour vecteurs de taille dynamique
fn matrix_mult_scalar_generic(
    a: &[Vec<f32>],
    b: &[Vec<f32>], 
    c: &mut [Vec<f32>]
) {
    let n = a.len();
    for i in 0..n {
        for j in 0..n {
            c[i][j] = 0.0;
            for k in 0..n {
                c[i][j] += a[i][k] * b[k][j];
            }
        }
    }
}
```

## Benchmark face à la version scalaire
- **Benchmarking** : Utilise `criterion` pour comparer SIMD vs scalaire :
  ```rust
  use criterion::{black_box, Criterion};
  fn bench(c: &mut Criterion) {
      let a = [[1.0_f32; 8]; 8];
      let b = [[2.0_f32; 8]; 8];
      let mut c = [[0.0_f32; 8]; 8];
      c.bench_function("simd", |b| b.iter(|| unsafe { matrix_mult_simd(black_box(&a), black_box(&b), black_box(&mut c)) }));
      c.bench_function("scalar", |b| b.iter(|| matrix_mult_scalar(black_box(&a), black_box(&b), black_box(&mut c))));
  }
  ```
  Attends-toi à ce que SIMD soit 4-8x plus rapide pour de grandes matrices.
- **Profiling** : Utilise `perf` sur Linux (`perf stat -e cycles,instructions`) pour confirmer la réduction d'instructions (ex : 8x moins de multiplications).
- **Inspection d'Assembleur** : Lance `cargo rustc --release -- --emit asm` ou utilise `godbolt.org` pour vérifier des boucles serrées avec instructions SIMD (ex : `vmulps`, `vaddps`).

### Tests de Justesse

```rust
#[cfg(test)]
mod correctness_tests {
    use super::*;
    
    #[test]
    fn test_simd_vs_scalar() {
        let a = [[1.0, 2.0, 3.0, 4.0]; 4];
        let b = [[5.0, 6.0, 7.0, 8.0]; 4];
        
        let mut c_scalar = [[0.0; 4]; 4];
        let mut c_simd = [[0.0; 4]; 4];
        
        matrix_mult_scalar(&a, &b, &mut c_scalar);
        unsafe { matrix_mult_simd_4x4(&a, &b, &mut c_simd); }
        
        // Comparaison avec tolérance pour erreurs d'arrondi
        for i in 0..4 {
            for j in 0..4 {
                assert!(
                    (c_scalar[i][j] - c_simd[i][j]).abs() < 1e-6,
                    "Mismatch at [{}, {}]: scalar={}, simd={}",
                    i, j, c_scalar[i][j], c_simd[i][j]
                );
            }
        }
    }
    
    #[test]
    fn test_numerical_stability() {
        // Test avec valeurs extrêmes
        let mut a = [[0.0; 4]; 4];
        let mut b = [[0.0; 4]; 4];
        
        // Matrice avec grandes valeurs
        for i in 0..4 {
            for j in 0..4 {
                a[i][j] = 1e6;
                b[i][j] = 1e-6;
            }
        }
        
        let mut c_scalar = [[0.0; 4]; 4];
        let mut c_simd = [[0.0; 4]; 4];
        
        matrix_mult_scalar(&a, &b, &mut c_scalar);
        unsafe { matrix_mult_simd_4x4(&a, &b, &mut c_simd); }
        
        // Vérifier que les résultats sont raisonnables
        for i in 0..4 {
            for j in 0..4 {
                assert!(c_scalar[i][j].is_finite());
                assert!(c_simd[i][j].is_finite());
                assert!((c_scalar[i][j] - c_simd[i][j]).abs() / c_scalar[i][j] < 1e-3);
            }
        }
    }
}
```

## Exemple de résultat pratique

Pour une matrice 1024x1024, AVX pourrait réduire le runtime de secondes à millisecondes sur un CPU moderne, en supposant une bonne localité de données. Le profiling devrait montrer une réduction d'instructions 8x dans la boucle interne, avec des benchmarks confirmant des speedups significatifs.

## Considérations pratiques

### Gestion mémoire Optimisée

```rust
// Allocation alignée pour performance SIMD optimale
use std::alloc::{alloc, dealloc, Layout};

struct AlignedMatrix<const N: usize> {
    data: *mut f32,
    layout: Layout,
}

impl<const N: usize> AlignedMatrix<N> {
    fn new() -> Self {
        let layout = Layout::from_size_align(
            N * N * std::mem::size_of::<f32>(),
            32 // Alignement AVX
        ).unwrap();
        
        let data = unsafe { alloc(layout) as *mut f32 };
        
        Self { data, layout }
    }
    
    fn as_slice(&self) -> &[f32] {
        unsafe { std::slice::from_raw_parts(self.data, N * N) }
    }
    
    fn as_mut_slice(&mut self) -> &mut [f32] {
        unsafe { std::slice::from_raw_parts_mut(self.data, N * N) }
    }
}

impl<const N: usize> Drop for AlignedMatrix<N> {
    fn drop(&mut self) {
        unsafe { dealloc(self.data as *mut u8, self.layout) }
    }
}
```

## Conclusion
Pour un débit maximum sur une architecture connue (ex : x86_64 avec AVX), utilise `std::arch` pour vectoriser la boucle interne de multiplication de matrices, avec tiling pour l'efficacité cache. Pour la portabilité, passe à `packed_simd`, acceptant un certain overhead. Adresse les défis comme l'alignement et la détection de fonctionnalités avec compilation conditionnelle et vérifications runtime, assurant à la fois vitesse et justesse dans un système de production.
