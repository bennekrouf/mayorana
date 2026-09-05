---
id: cache-line-awareness-optimization
title: Aligner les structures de données aux lignes de cache
slug: cache-line-awareness-optimization
locale: fr
author: mayo
excerpt: >-
  Conception de structures de données alignées sur le cache dans les
  applications Rust multi-threadées pour éviter le faux partage et optimiser les
  performances lors du traitement de grands ensembles de données
tags:
  - rust
  - optimization
  - advanced
date: '2025-11-22'
---

# Conscience des lignes de Cache : Supposons que vous optimisez une application Rust multi-threadée qui traite de grands ensembles de données. comment aligneriez-vous les structures de données aux lignes de cache, et quelles fonctionnalités ou techniques Rust utiliseriez-vous pour minimiser le faux partage ?

Dans une application Rust multi-threadée traitant de grands ensembles de données, la conscience des lignes de cache est essentielle pour maximiser les performances. Les lignes de cache du CPU (généralement 64 octets sur les architectures x86_64 et ARM modernes) dictent la manière dont les données sont récupérées, et le faux partage - où les threads modifient des données adjacentes sur la même ligne de cache - peut dégrader considérablement le débit en raison des invalidations constantes du cache. J'alignerais les structures de données aux lignes de cache et utiliserais les fonctionnalités de Rust pour éliminer le faux partage, optimisant ainsi une charge de travail multi-threadée.

<div class="svg-container" style="margin:2rem 0;">
<svg class="lo9-fig" viewBox="0 0 800 240" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Quatre compteurs naïfs empaquetés dans une seule ligne de cache de 64 octets causent du faux partage, tandis que le padding de chaque compteur sur sa propre ligne les isole">
<!-- style -->
<style>
.lo9-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .lo9-fig,[data-theme="dark"] .lo9-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.lo9-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.lo9-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.lo9-fig .bad{fill:var(--box);stroke:#e11d48;stroke-width:1.5}
.lo9-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.lo9-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.lo9-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
</style>
<!-- top: naive, one cache line -->
<text x="40" y="30" class="ti">Naïf — 4 compteurs partagent une ligne de cache de 64 octets</text>
<rect x="40" y="42" width="720" height="46" rx="5" class="bad"/>
<line x1="220" y1="42" x2="220" y2="88" stroke="var(--ln)" stroke-width="1"/>
<line x1="400" y1="42" x2="400" y2="88" stroke="var(--ln)" stroke-width="1"/>
<line x1="580" y1="42" x2="580" y2="88" stroke="var(--ln)" stroke-width="1"/>
<text x="130" y="70" text-anchor="middle" class="tx">T0</text>
<text x="310" y="70" text-anchor="middle" class="tx">T1</text>
<text x="490" y="70" text-anchor="middle" class="tx">T2</text>
<text x="670" y="70" text-anchor="middle" class="tx">T3</text>
<text x="40" y="106" class="mut">l'écriture d'un thread invalide toute la ligne pour les autres</text>
<!-- bottom: aligned, 4 separate lines -->
<text x="40" y="150" class="ti">#[repr(align(64))] + padding — une ligne de cache chacun</text>
<rect x="40" y="162" width="170" height="46" rx="5" class="boxac"/>
<text x="125" y="190" text-anchor="middle" class="tx">T0 + pad</text>
<rect x="223" y="162" width="170" height="46" rx="5" class="boxac"/>
<text x="308" y="190" text-anchor="middle" class="tx">T1 + pad</text>
<rect x="406" y="162" width="170" height="46" rx="5" class="boxac"/>
<text x="491" y="190" text-anchor="middle" class="tx">T2 + pad</text>
<rect x="589" y="162" width="170" height="46" rx="5" class="boxac"/>
<text x="674" y="190" text-anchor="middle" class="tx">T3 + pad</text>
<text x="40" y="226" class="mut">64 octets d'écart — les écritures restent locales, aucune invalidation</text>
</svg>
</div>

## Conception de structures Alignées sur le Cache

- **Alignement** : S'assurer que les données de chaque thread commencent sur une nouvelle ligne de cache en utilisant `#[repr(align(64))]`.
- **Remplissage** : Ajouter des octets factices pour séparer les données locales aux threads, évitant le chevauchement.
- **Séparation** : Diviser les données partagées en segments par thread, accessibles indépendamment.

### Exemple : Un compteur multi-threadé où chaque thread incrémente son propre total :

```rust
use std::sync::atomic::{AtomicU64, Ordering};
use std::thread;

// Naïf : Faux partage probable
struct Counters {
    counts: [AtomicU64; 4], // 4 threads, 8 octets chacun = 32 octets
}

impl Counters {
    fn new() -> Self {
        Counters {
            counts: [AtomicU64::new(0), AtomicU64::new(0), AtomicU64::new(0), AtomicU64::new(0)],
        }
    }
}
```

**Problème** : `counts` fait 32 octets, tenant dans une seule ligne de cache de 64 octets. Si le Thread 0 met à jour `counts[0]` et le Thread 1 met à jour `counts[1]`, ils sollicitent excessivement la même ligne, sérialisant l'accès.

<div class="svg-container" style="margin:2rem 0;">
<svg class="lo9b-fig" viewBox="0 0 800 290" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Chronologie en quatre étapes d'une ligne de cache qui fait des allers-retours entre deux cœurs : chaque fetch_add passe la ligne en Modified sur un cœur et invalide la copie de l'autre">
<style>
.lo9b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .lo9b-fig,[data-theme="dark"] .lo9b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.lo9b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.lo9b-fig .st{fill:var(--bg);stroke:var(--mut);stroke-width:1.5}
.lo9b-fig .m{fill:var(--box);stroke:var(--ac);stroke-width:2.5}
.lo9b-fig .inv{fill:none;stroke:var(--ln);stroke-width:1.5;stroke-dasharray:4 4}
.lo9b-fig .ti{fill:var(--tx);font:700 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo9b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo9b-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo9b-fig .ac{fill:var(--ac);font:700 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo9b-fig line{stroke:var(--ln);stroke-width:1.5}
</style>
<defs>
<marker id="lo9b-arrow-fr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"/>
</marker>
</defs>
<!-- step t1 -->
<rect x="20" y="40" width="175" height="150" rx="6" class="box"/>
<text x="107" y="62" class="ti">t1 · Cœur 0 fetch_add</text>
<rect x="32" y="72" width="151" height="34" rx="4" class="m"/>
<text x="107" y="93" class="ac">Cœur 0 — Modified</text>
<rect x="32" y="112" width="151" height="34" rx="4" class="inv"/>
<text x="107" y="133" class="mut">Cœur 1 — Invalid</text>
<text x="107" y="166" class="mut">ligne chargée en écriture</text>
<text x="107" y="182" class="mut">les 4 compteurs dedans</text>
<line x1="195" y1="115" x2="213" y2="115" marker-end="url(#lo9b-arrow-fr)"/>
<!-- step t2 -->
<rect x="215" y="40" width="175" height="150" rx="6" class="box"/>
<text x="302" y="62" class="ti">t2 · Cœur 1 fetch_add</text>
<rect x="227" y="72" width="151" height="34" rx="4" class="inv"/>
<text x="302" y="93" class="mut">Cœur 0 — Invalid</text>
<rect x="227" y="112" width="151" height="34" rx="4" class="m"/>
<text x="302" y="133" class="ac">Cœur 1 — Modified</text>
<text x="302" y="166" class="mut">read-for-ownership</text>
<text x="302" y="182" class="mut">vole toute la ligne</text>
<line x1="390" y1="115" x2="408" y2="115" marker-end="url(#lo9b-arrow-fr)"/>
<!-- step t3 -->
<rect x="410" y="40" width="175" height="150" rx="6" class="box"/>
<text x="497" y="62" class="ti">t3 · Cœur 0 à nouveau</text>
<rect x="422" y="72" width="151" height="34" rx="4" class="m"/>
<text x="497" y="93" class="ac">Cœur 0 — Modified</text>
<rect x="422" y="112" width="151" height="34" rx="4" class="inv"/>
<text x="497" y="133" class="mut">Cœur 1 — Invalid</text>
<text x="497" y="166" class="mut">la ligne revient</text>
<text x="497" y="182" class="mut">le Cœur 1 cale</text>
<line x1="585" y1="115" x2="603" y2="115" marker-end="url(#lo9b-arrow-fr)"/>
<!-- step t4 -->
<rect x="605" y="40" width="175" height="150" rx="6" class="box"/>
<text x="692" y="62" class="ti">t4 · et ainsi de suite…</text>
<rect x="617" y="72" width="151" height="34" rx="4" class="st"/>
<text x="692" y="93" class="tx">1M itérations / thread</text>
<rect x="617" y="112" width="151" height="34" rx="4" class="st"/>
<text x="692" y="133" class="tx">millions de transferts</text>
<text x="692" y="166" class="mut">aucune donnée partagée —</text>
<text x="692" y="182" class="mut">seule la ligne l'est</text>
<!-- footer -->
<rect x="120" y="210" width="560" height="60" rx="6" class="box"/>
<text x="400" y="234" class="tx">L'ordering Relaxed n'y change rien : la cohérence est par ligne, pas par variable</text>
<text x="400" y="254" class="mut">perf stat -e L1-dcache-load-misses est là où ça se voit</text>
</svg>
</div>

## Version restructurée, alignée sur le cache
```rust
#[repr(align(64))] // Alignement sur ligne de cache de 64 octets
struct CacheAlignedCounter {
    count: AtomicU64,      // 8 octets
    _padding: [u8; 56],    // 56 octets de remplissage pour atteindre 64
}

struct Counters {
    counts: [CacheAlignedCounter; 4], // 4 threads, 64 octets chacun
}

impl Counters {
    fn new() -> Self {
        Counters {
            counts: [
                CacheAlignedCounter { count: AtomicU64::new(0), _padding: [0; 56] },
                CacheAlignedCounter { count: AtomicU64::new(0), _padding: [0; 56] },
                CacheAlignedCounter { count: AtomicU64::new(0), _padding: [0; 56] },
                CacheAlignedCounter { count: AtomicU64::new(0), _padding: [0; 56] },
            ],
        }
    }

    fn run(&self) {
        let mut handles = Vec::new();
        for i in 0..4 {
            let counter = &self.counts[i];
            handles.push(thread::spawn(move || {
                for _ in 0..1_000_000 {
                    counter.count.fetch_add(1, Ordering::Relaxed);
                }
            }));
        }
        for h in handles { h.join().unwrap(); }
    }
}
```

- **Alignement** : `#[repr(align(64))]` garantit que chaque `CacheAlignedCounter` commence sur une limite de 64 octets.
- **Remplissage** : `_padding` remplit la structure jusqu'à 64 octets, donc `counts[1]` est sur une nouvelle ligne de cache.
- **Résultat** : Chaque thread met à jour son propre `count` sans invalider les lignes de cache des autres.

## Fonctionnalités et Techniques Rust

### #[repr(align(N))]
Force l'alignement des structures à une puissance de 2 (ex. 64), les alignant avec les lignes de cache.

### Remplissage Manuel
Des tableaux ou champs inutilisés (ex. `[u8; 56]`) garantissent que la taille correspond à la ligne de cache, évitant le chevauchement.

### Données par thread
Utiliser `thread_local!` ou un tableau indexé par ID de thread pour une séparation complète :

```rust
thread_local! {
    static MY_COUNTER: AtomicU64 = AtomicU64::new(0);
}
```

**Opérations Atomiques** : `fetch_add` avec l'ordre `Relaxed` est sûr ici (pas de dépendance de données), minimisant la surcharge de synchronisation.

## Prévention du faux partage

- **Séparation** : Chaque compteur est espacé de 64 octets, donc les écritures du Thread 0 sur `counts[0]` n'invalident pas `counts[1]`.
- **Vérification de Taille** : `std::mem::size_of::<CacheAlignedCounter>()` retourne 64, confirmant l'alignement.
- **Disposition** : Éviter le compactage (ex. `#[repr(packed)]`) sauf besoin explicite - le remplissage est notre allié ici.

## Vérification

### Profilage avec perf
Exécuter `perf stat -e cache-misses,L1-dcache-load-misses ./target/release/app` sur les deux versions :
- **Naïf** : Nombre élevé de L1-dcache-load-misses (ex. 10M) dû au faux partage.
- **Optimisé** : Baisse significative (ex. 1M), car chaque ligne de cache de thread reste locale.

### Benchmarking

```rust
use criterion::{black_box, Criterion};
fn bench(c: &mut Criterion) {
    let counters = Counters::new();
    c.bench_function("cache_aligned", |b| b.iter(|| black_box(counters.run())));
}
```

Attendre une accélération de 2-5x (ex. de 50ms à 10ms) sur un CPU 4 cœurs.

### Disposition mémoire
`std::mem::align_of::<CacheAlignedCounter>()` confirme l'alignement sur 64 octets.

## Conclusion

J'alignerais les données avec `#[repr(align(64))]` et les remplirais jusqu'à 64 octets, comme dans cet exemple de compteur, garantissant que chaque thread opère sur sa propre ligne de cache. Le système de types et les attributs de Rust rendent cela précis et sûr, tandis que le profilage avec perf valide la réduction des défauts de cache. Cela élimine le faux partage, débloquant le vrai parallélisme dans un processeur d'ensembles de données multi-threadé.
