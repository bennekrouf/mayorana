---
id: dispatch-performance-rust
title: "fn process<T: MyTrait>(x: T)) VS utiliser dyn MyTrait pour le dispatch dynamique."
slug: dispatch-performance-rust
locale: "fr"
date: '2025-07-07'
author: mayo
excerpt: >-
  Dispatch Statique vs. Dynamique
content_focus: "Dispatch Statique vs. Dynamique"
technical_level: "Discussion technique experte"

tags:
  - rust
  - dispatch
  - generics
  - performance
  - traits
---

# Quel est le compromis de performance entre utiliser une fonction générique avec un trait bound (ex : fn process<T: MyTrait>(x: T)) versus utiliser dyn MyTrait pour le dispatch dynamique, et dans quels scénarios préférerais-tu l'un ou l'autre ?

En Rust, le **dispatch statique** (via les generics avec trait bounds) et le **dispatch dynamique** (via `dyn Trait`) offrent des profils de performance distincts, critiques pour des systèmes comme les processeurs de données temps réel. Le dispatch statique exploite la monomorphization pour la vitesse, tandis que le dispatch dynamique utilise des vtables pour la flexibilité. Ci-dessous, je compare les deux avec un exemple et expose quand choisir chacun basé sur la performance, flexibilité et maintenabilité.

## Exemple : Processeur d'événements

Considère un système traitant des événements (ex : lectures de capteurs, paquets réseau) :

```rust
trait EventProcessor {
    fn process(&mut self, event: u32) -> u32;
}

struct FastProcessor { total: u32 }
struct LogProcessor { count: u32 }

impl EventProcessor for FastProcessor {
    fn process(&mut self, event: u32) -> u32 {
        self.total += event;
        self.total
    }
}

impl EventProcessor for LogProcessor {
    fn process(&mut self, event: u32) -> u32 {
        self.count += 1;
        self.count
    }
}
```

### Version Dispatch Statique

```rust
fn process_static<T: EventProcessor>(processor: &mut T, events: &[u32]) -> u32 {
    let mut result = 0;
    for &event in events {
        result = processor.process(event);
    }
    result
}

// Usage
fn main() {
    let mut fast = FastProcessor { total: 0 };
    let events = vec![1, 2, 3];
    let total = process_static(&mut fast, &events); // 6
    println!("{}", total);
}
```

### Version Dispatch Dynamique

```rust
fn process_dynamic(processor: &mut dyn EventProcessor, events: &[u32]) -> u32 {
    let mut result = 0;
    for &event in events {
        result = processor.process(event);
    }
    result
}

// Usage
fn main() {
    let mut fast = FastProcessor { total: 0 };
    let events = vec![1, 2, 3];
    let total = process_dynamic(&mut fast, &events); // 6
    let mut log = LogProcessor { count: 0 };
    let count = process_dynamic(&mut log, &events); // 3
    println!("{} {}", total, count);
}
```

## Compromis de Performance

### Dispatch Statique

- **Mécanisme** : Le compilateur fait la monomorphization de `process_static` pour chaque type (ex : `FastProcessor`, `LogProcessor`), créant des fonctions séparées comme `process_static_fast` et `process_static_log`.
- **Vitesse** : Aucun overhead à l'exécution—les appels à `process` sont inlinés, activant les optimisations (ex : unrolling de boucle, constant folding). Sur x86_64, ça pourrait compiler vers une boucle `add` serrée sans jumps.
- **Coût** : Taille de binaire plus large (ex : ~100 octets par fonction monomorphisée). Pour 10 types de processeurs, c'est ~1KB extra dans `.text`.
- **Exemple Assembleur** :
  ```asm
  ; process_static<FastProcessor>
  xor eax, eax      ; result = 0
  loop:
    add eax, [rsi]  ; total += event
    add rsi, 4
    dec rcx
    jnz loop
  ```

### Dispatch Dynamique

- **Mécanisme** : `dyn EventProcessor` utilise une vtable—un pointeur vers la table de méthodes du type—stockée avec l'objet (ex : `Box<dyn EventProcessor>` fait 16 octets : 8 pour les données, 8 pour la vtable).
- **Vitesse** : Plus lent à cause des appels indirects via la vtable (1-2 cycles par appel sur x86_64) et pas d'inlining à travers les frontières de types. Les cache misses sur l'accès vtable ajoutent de la latence.
- **Coût** : Binaire plus petit—une fonction `process_dynamic` (ex : 50 octets) fonctionne pour tous les types. La taille totale reste constante peu importe le nombre de processeurs.
- **Exemple Assembleur** :
  ```asm
  ; process_dynamic
  loop:
    mov rax, [rdi+8]   ; Charge le ptr vtable
    call [rax]         ; Appel indirect à process
    add rsi, 4
    dec rcx
    jnz loop
  ```
- **Quantifié** : Pour 1M d'événements, statique pourrait prendre 1ms (arithmétique pure), tandis que dynamique prend 1.2ms (overhead vtable + pas de fusion). Une différence de 20% compte en temps réel.

## Scénarios et Préférences

### Choisir le Dispatch Statique

- **Scénario** : Boucles chaudes dans un processeur de données temps réel (ex : filtrage audio, routage de paquets) où chaque cycle compte.
- **Pourquoi** : Overhead zéro, inlining, et potentiel d'optimisation. Dans `process_static`, le compilateur peut unroller ou SIMDifier la boucle pour des événements `f32`.
- **Compromis** : Binaire plus large, mais acceptable pour un ensemble connu et petit de processeurs (ex : 2-5 types).
- **Maintenabilité** : Moins flexible—ajouter un nouveau processeur nécessite une recompilation.

### Choisir le Dispatch Dynamique

- **Scénario** : Système de plugins ou processeurs configurables à l'exécution (ex : les utilisateurs chargent des implémentations `EventProcessor` dynamiquement).
- **Pourquoi** : Flexibilité—`dyn EventProcessor` permet à une seule fonction de gérer n'importe quel type sans recompiler. La taille du binaire reste gérable avec beaucoup de processeurs.
- **Compromis** : Exécution plus lente, mais acceptable si `process` est complexe (l'overhead d'appel est une fraction plus petite) ou l'invocation est peu fréquente.
- **Maintenabilité** : Plus facile à étendre—les nouveaux types implémentent juste le trait.

## Vérification

- **Benchmark** :
  ```rust
  use criterion::{black_box, Criterion};
  fn bench(c: &mut Criterion) {
      let events = vec![1; 1000];
      let mut fast = FastProcessor { total: 0 };
      c.bench_function("static", |b| b.iter(|| process_static(black_box(&mut fast), black_box(&events))));
      c.bench_function("dynamic", |b| b.iter(|| process_dynamic(black_box(&mut fast), black_box(&events))));
  }
  ```
  Attends-toi à ce que statique soit 10-20% plus rapide.
- **Taille** : `size target/release/app` montre statique qui gonfle `.text` par type.

## Conclusion

Dans un processeur de données temps réel, préfère le dispatch statique (`process_static`) pour les chemins chauds, échangeant la taille de code contre la vitesse et l'inlining. Pour la flexibilité (ex : processeurs pluggables), utilise `dyn EventProcessor`, acceptant les coûts vtable. Profile pour t'assurer que les gains de statique justifient son empreinte, équilibrant performance avec les objectifs de conception système.