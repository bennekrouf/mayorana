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
