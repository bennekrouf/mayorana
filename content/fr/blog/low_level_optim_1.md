---
id: memory-layout-optimization-rust
title: 'Rust repr : Optimiser la Mémoire des Structs pour l''Efficacité Cache'
slug: memory-layout-optimization-rust
locale: fr
date: '2025-11-13'
author: mayo
excerpt: >-
  Optimisation mémoire bas niveau en Rust, couvrant les attributs repr,
  l'efficacité cache, et les compromis de performance
tags:
  - rust
  - optimization
  - memory
  - performance
  - cache
---

# Optimisation Layout Mémoire : Comment utiliserais-tu l'attribut repr de Rust pour optimiser le layout mémoire d'une struct pour l'efficacité cache ?

L'attribut `repr` contrôle le layout mémoire des structs, ce qui est critique pour l'optimisation bas niveau dans les systèmes à haut débit où la localité cache détermine les performances.

<div class="svg-container" style="margin:2rem 0;">
<svg class="lo1-fig" viewBox="0 0 800 240" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Comparaison entre le layout paddé de repr(C) et le layout compact de repr(packed) pour la même struct">
<style>
.lo1-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .lo1-fig,[data-theme="dark"] .lo1-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.lo1-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.lo1-fig .pad{fill:var(--bg);stroke:var(--ln);stroke-width:1.5;stroke-dasharray:4,3}
.lo1-fig .warn{fill:var(--box);stroke:var(--ac);stroke-width:2}
.lo1-fig .cap{fill:var(--box);stroke:var(--ac);stroke-width:2}
.lo1-fig .cap2{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.lo1-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.lo1-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo1-fig .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo1-fig .ac{fill:var(--ac);font:700 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo1-fig line{stroke:var(--ln);stroke-width:1.5}
</style>
<defs>
<marker id="lo1-arrow-fr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"/>
</marker>
</defs>
<!-- groupe gauche repr(C) -->
<text x="210" y="30" class="ti">repr(C) : struct Data</text>
<rect x="40" y="45" width="60" height="55" class="box"/>
<text x="70" y="68" text-anchor="middle" class="tx">flag</text>
<text x="70" y="84" text-anchor="middle" class="mut">1o</text>
<rect x="100" y="45" width="60" height="55" class="pad"/>
<text x="130" y="68" text-anchor="middle" class="mut">pad</text>
<text x="130" y="84" text-anchor="middle" class="mut">3o</text>
<rect x="160" y="45" width="90" height="55" class="box"/>
<text x="205" y="68" text-anchor="middle" class="tx">value</text>
<text x="205" y="84" text-anchor="middle" class="mut">u32, 4o</text>
<rect x="250" y="45" width="130" height="55" class="box"/>
<text x="315" y="68" text-anchor="middle" class="tx">counter</text>
<text x="315" y="84" text-anchor="middle" class="mut">u64, 8o</text>
<!-- flèche vers la légende -->
<line x1="210" y1="100" x2="210" y2="140" marker-end="url(#lo1-arrow-fr)"/>
<rect x="60" y="150" width="300" height="55" rx="6" class="cap"/>
<text x="210" y="172" class="ac">16 octets au total</text>
<text x="210" y="190" class="mut">accès alignés, cache-friendly</text>
<!-- groupe droit repr(packed) -->
<text x="590" y="30" class="ti">repr(packed) : struct PackedData</text>
<rect x="420" y="45" width="60" height="55" class="box"/>
<text x="450" y="68" text-anchor="middle" class="tx">flag</text>
<text x="450" y="84" text-anchor="middle" class="mut">1o</text>
<rect x="480" y="45" width="90" height="55" class="warn"/>
<text x="525" y="68" text-anchor="middle" class="tx">value</text>
<text x="525" y="84" text-anchor="middle" class="mut">u32, 4o</text>
<rect x="570" y="45" width="130" height="55" class="warn"/>
<text x="635" y="68" text-anchor="middle" class="tx">counter</text>
<text x="635" y="84" text-anchor="middle" class="mut">u64, 8o</text>
<!-- flèche vers la légende -->
<line x1="560" y1="100" x2="560" y2="140" marker-end="url(#lo1-arrow-fr)"/>
<rect x="440" y="150" width="260" height="55" rx="6" class="cap2"/>
<text x="570" y="172" class="tx">13 octets au total</text>
<text x="570" y="190" class="mut">accès non-aligné, plus lent</text>
</svg>
</div>

## Comment Ils Fonctionnent

**`repr(C)`** : Impose un layout compatible C avec des champs ordonnés séquentiellement comme déclarés, ajoutant du padding pour aligner chaque champ à son alignement naturel (ex : `u32` s'aligne sur 4 octets). Assure une interopérabilité prévisible et s'aligne typiquement bien avec les lignes de cache CPU (souvent 64 octets).

**`repr(packed)`** : Supprime tout padding, empaquetant les champs étroitement ensemble indépendamment de l'alignement. Minimise l'usage mémoire mais peut mener à des accès mémoire non-alignés, qui sont plus lents sur la plupart des architectures.

## Optimisation pour la Localité Cache

Avec `repr(C)`, le compilateur ajoute du padding pour aligner les champs, augmentant la taille de struct mais assurant un accès efficace et aligné :

```rust
#[repr(C)]
struct Data {
    flag: bool,   // 1 octet + 3 octets de padding (sur alignement 32-bit)
    value: u32,   // 4 octets
    counter: u64, // 8 octets
}
// Taille : 16 octets (due au padding pour l'alignement)
```

Ici, `repr(C)` assure que `value` et `counter` sont alignés—excellent pour les boucles accédant à `value` répétitivement. Les lectures alignées sont rapides et cache-friendly, mais le padding après `flag` gaspille de l'espace.

Avec `repr(packed)` :

```rust
#[repr(packed)]
struct PackedData {
    flag: bool,   // 1 octet
    value: u32,   // 4 octets, non-aligné
    counter: u64, // 8 octets, non-aligné
}
// Taille : 13 octets (pas de padding)
```

Cela réduit la taille à 13 octets, idéal pour des contraintes mémoire serrées, mais les accès non-alignés à `value` et `counter` encourent des pénalités de performance significatives.

## Compromis

| Aspect | `repr(C)` | `repr(packed)` |
|--------|-----------|----------------|
| **Performance** | Accès aligné rapide, cache-efficace | Pénalités d'accès non-aligné plus lentes |
| **Usage Mémoire** | Plus large due au padding | Empreinte minimale |
| **Portabilité** | Sûr à travers les plateformes | Risque d'UB ou panics sur architectures strictes |

- **Performance** : `repr(C)` gagne pour la vitesse—l'accès aligné est plus rapide et cache-efficace
- **Usage Mémoire** : `repr(packed)` réduit l'empreinte, critique pour de larges tableaux ou contraintes serrées
- **Portabilité** : `repr(C)` est plus sûr ; `repr(packed)` risque un comportement indéfini avec du déréférencement unsafe

## Scénario d'Exemple

Parser de paquets temps réel dans un serveur réseau traitant des millions de paquets par seconde :

```rust
#[repr(C)]
struct Packet {
    header: u8,   // 1 octet + 3 padding
    id: u32,      // 4 octets
    payload: u64, // 8 octets
}
```

Avec `repr(C)`, la taille est 16 octets, et `id`/`payload` sont alignés, accélérant l'accès aux champs dans des boucles serrées vérifiant `id`. La localité cache est décente puisque la struct rentre dans une ligne de cache de 64 octets.

Si j'utilisais `repr(packed)` (13 octets), j'économiserais 3 octets par paquet, mais les accès non-alignés à `id` et `payload` pourraient diviser le débit par deux due aux pénalités—inacceptable pour cette charge de travail.

**Choix** : `repr(C)` pour du code critique en performance. Considère réordonner les champs (`payload`, `id`, `header`) pour grouper les champs chauds ensemble.

**Scénario alternatif** : Sérialiser des milliers de petites structs sur disque avec accès peu fréquent—`repr(packed)` pourrait avoir du sens pour minimiser le stockage, acceptant une désérialisation plus lente.

<div class="svg-container" style="margin:2rem 0;">
<svg class="lo1-fig2" viewBox="0 0 800 380" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Arbre de décision pour choisir entre repr(C), repr(packed) et le layout Rust par défaut selon le pattern d'accès et la pression mémoire">
<style>
.lo1-fig2{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .lo1-fig2,[data-theme="dark"] .lo1-fig2{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.lo1-fig2 .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.lo1-fig2 .dia{fill:var(--bg);stroke:var(--ln);stroke-width:1.5}
.lo1-fig2 .fin{fill:var(--box);stroke:var(--ac);stroke-width:2.5}
.lo1-fig2 .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo1-fig2 .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo1-fig2 .ac{fill:var(--ac);font:700 13px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo1-fig2 .mut{fill:var(--mut);font:500 11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.lo1-fig2 line{stroke:var(--ln);stroke-width:1.5}
</style>
<defs>
<marker id="lo1b-arrow-fr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"/>
</marker>
</defs>
<!-- racine -->
<rect x="300" y="14" width="200" height="44" rx="6" class="box"/>
<text x="400" y="41" class="ti">Choisir un repr</text>
<line x1="400" y1="58" x2="400" y2="74" marker-end="url(#lo1b-arrow-fr)"/>
<!-- première décision -->
<polygon points="400,76 520,136 400,196 280,136" class="dia"/>
<text x="400" y="141" class="tx">Boucle chaude ou FFI C ?</text>
<line x1="520" y1="136" x2="548" y2="136" marker-end="url(#lo1b-arrow-fr)"/>
<text x="534" y="127" class="mut">oui</text>
<rect x="550" y="106" width="230" height="60" rx="6" class="fin"/>
<text x="665" y="132" class="ac">repr(C)</text>
<text x="665" y="152" class="mut">le padding paie l'accès aligné</text>
<!-- deuxième décision -->
<line x1="400" y1="196" x2="400" y2="212" marker-end="url(#lo1b-arrow-fr)"/>
<text x="420" y="209" class="mut">non</text>
<polygon points="400,214 520,274 400,334 280,274" class="dia"/>
<text x="400" y="270" class="tx">Contrainte mémoire ou</text>
<text x="400" y="286" class="tx">écrit sur disque ?</text>
<line x1="520" y1="274" x2="548" y2="274" marker-end="url(#lo1b-arrow-fr)"/>
<text x="534" y="265" class="mut">oui</text>
<rect x="550" y="244" width="230" height="60" rx="6" class="box"/>
<text x="665" y="270" class="tx">repr(packed)</text>
<text x="665" y="290" class="mut">13 o, accès non-alignés</text>
<line x1="280" y1="274" x2="252" y2="274" marker-end="url(#lo1b-arrow-fr)"/>
<text x="264" y="265" class="mut">non</text>
<rect x="20" y="244" width="230" height="60" rx="6" class="box"/>
<text x="135" y="270" class="tx">Layout Rust par défaut</text>
<text x="135" y="290" class="mut">le compilateur réordonne</text>
<!-- légende -->
<text x="400" y="362" class="mut">Sur ARM et autres cibles à alignement strict, l'accès à un champ packed peut paniquer — mesure sur la cible</text>
</svg>
</div>

## Considérations Avancées

### Techniques d'Optimisation Layout

```rust
// Technique 1: Réorganisation des champs par taille
#[repr(C)]
struct OptimizedPacket {
    payload: u64,  // 8 octets - le plus large en premier
    id: u32,       // 4 octets
    header: u8,    // 1 octet
    flags: u8,     // 1 octet - groupe les petits champs
    // Total: 16 octets avec padding optimal
}

// Technique 2: Alignement sur ligne de cache
#[repr(C, align(64))]
struct CacheAlignedData {
    hot_data: [u32; 4],     // Données fréquemment accédées
    _padding: [u8; 48],     // Pad jusqu'à 64 octets
}

// Technique 3: Hybride pour cas spéciaux
#[repr(C)]
struct HybridPacket {
    // Partie chaude - alignée pour performance
    critical_fields: CriticalData,
    
    // Partie froide - peut être packed
    #[repr(packed)]
    metadata: PackedMetadata,
}

#[repr(C)]
struct CriticalData {
    timestamp: u64,
    sequence: u32,
    type_id: u32,
}

#[repr(packed)]
struct PackedMetadata {
    flags: u8,
    version: u8,
    checksum: u16,
}
```

### Mesures et Validation

```rust
// Validation des tailles et alignements
use std::mem;

fn validate_layout<T>() {
    println!("Type: {}", std::any::type_name::<T>());
    println!("Size: {} bytes", mem::size_of::<T>());
    println!("Alignment: {} bytes", mem::align_of::<T>());
    println!("---");
}

fn main() {
    validate_layout::<Data>();
    validate_layout::<PackedData>();
    validate_layout::<OptimizedPacket>();
}

// Benchmark pour mesurer l'impact performance
use criterion::{black_box, Criterion};

fn bench_access_patterns(c: &mut Criterion) {
    let aligned_data = vec![Data { flag: true, value: 42, counter: 100 }; 10000];
    let packed_data = vec![PackedData { flag: true, value: 42, counter: 100 }; 10000];
    
    c.bench_function("aligned_sequential", |b| {
        b.iter(|| {
            for item in &aligned_data {
                black_box(item.value + item.counter as u32);
            }
        })
    });
    
    c.bench_function("packed_sequential", |b| {
        b.iter(|| {
            for item in &packed_data {
                black_box(item.value + item.counter as u32);
            }
        })
    });
}
```

### Analyse avec perf

```bash
# Mesurer les cache misses
perf stat -e cache-misses,cache-references ./bench_aligned
perf stat -e cache-misses,cache-references ./bench_packed

# Profiling détaillé
perf record -e cache-misses ./app
perf report --stdio

# Analyse de la localité mémoire
perf mem record ./app
perf mem report
```

## Stratégies par Domaine d'Application

### Systèmes Embarqués
```rust
// Priorité: minimiser la mémoire
#[repr(packed)]
struct SensorReading {
    timestamp: u32,    // 4 octets
    value: u16,        // 2 octets
    sensor_id: u8,     // 1 octet
    flags: u8,         // 1 octet
}
// Total: 8 octets vs 12 avec repr(C)
```

### Traitement Haute Performance
```rust
// Priorité: maximiser le débit
#[repr(C, align(64))]
struct ProcessingUnit {
    // Cache line 1: données chaudes
    input_buffer: [f32; 8],    // 32 octets
    output_buffer: [f32; 8],   // 32 octets
    
    // Cache line 2: métadonnées froides
    metadata: ProcessingMetadata,
}

#[repr(C)]
struct ProcessingMetadata {
    id: u64,
    created_at: u64,
    flags: u32,
    _padding: u32,
}
```

### Sérialisation/Réseau
```rust
// Priorité: format de données compact
#[repr(C, packed)]  // Compatible C mais packed
struct NetworkPacket {
    magic: u32,        // Network byte order
    version: u8,
    packet_type: u8,
    length: u16,       // Network byte order
    payload: [u8; 0], // Variable length
}
```

## Outils de Diagnostic

### Macros de Debug
```rust
macro_rules! debug_layout {
    ($t:ty) => {
        println!("=== {} ===", stringify!($t));
        println!("Size: {} bytes", std::mem::size_of::<$t>());
        println!("Align: {} bytes", std::mem::align_of::<$t>());
        
        // Affiche l'offset de chaque champ (requiert memoffset crate)
        // println!("Field offsets:");
        // println!("  field1: {}", memoffset::offset_of!($t, field1));
    };
}

// Usage
debug_layout!(Data);
debug_layout!(PackedData);
```

### Tests de Compatibilité
```rust
#[cfg(test)]
mod layout_tests {
    use super::*;
    
    #[test]
    fn test_c_compatibility() {
        // Vérifier que la struct est compatible C
        assert_eq!(std::mem::size_of::<Data>(), 16);
        assert_eq!(std::mem::align_of::<Data>(), 8);
    }
    
    #[test]
    fn test_packing_efficiency() {
        // Vérifier l'efficacité du packing
        assert_eq!(std::mem::size_of::<PackedData>(), 13);
        assert!(std::mem::size_of::<PackedData>() < std::mem::size_of::<Data>());
    }
}
```

## Considérations Avancées

- Utilise des outils de profiling comme `perf` pour confirmer les réductions de cache miss
- Considère `#[repr(C, packed)]` pour un layout compatible C mais packed
- La réorganisation de champs peut optimiser l'usage de ligne de cache sans changer `repr`
- Teste les compromis sur le matériel cible, particulièrement ARM vs x86_64

## Points Clés à Retenir

✅ **`repr(C)`** : Choisis pour du code critique en performance où l'efficacité cache compte  
✅ **`repr(packed)`** : Utilise pour des scénarios contraints en mémoire avec accès peu fréquent  
🚀 Profile les performances cache avant et après pour valider les optimisations

**Essaie ça :** Que se passe-t-il si tu accèdes à un champ dans une struct `repr(packed)` via un pointeur brut ?  
**Réponse :** L'accès non-aligné via des pointeurs bruts peut causer des panics sur des architectures strictes ou des pénalités de performance—mesure toujours sur ta plateforme cible !
