---
id: dispatch-performance-rust
title: >-
  fn process<T: MyTrait>(x: T)) VS utiliser dyn MyTrait pour le dispatch
  dynamique.
slug: dispatch-performance-rust
locale: fr
date: '2025-10-22'
author: mayo
excerpt: Dispatch Statique vs. Dynamique
tags:
  - rust
  - dispatch
  - generics
  - performance
  - traits
---

# Quel est le compromis de performance entre utiliser une fonction générique avec un trait bound (ex : fn process<T: MyTrait>(x: T)) versus utiliser dyn MyTrait pour le dispatch dynamique, et dans quels scénarios préférerais-tu l'un ou l'autre ?

En Rust, le **dispatch statique** (via les generics avec trait bounds) et le **dispatch dynamique** (via `dyn Trait`) offrent des profils de performance distincts, critiques pour des systèmes comme les processeurs de données temps réel. Le dispatch statique exploite la monomorphization pour la vitesse, tandis que le dispatch dynamique utilise des vtables pour la flexibilité. Ci-dessous, je compare les deux avec un exemple et expose quand choisir chacun basé sur la performance, flexibilité et maintenabilité.

<div class="svg-container" style="margin:2rem 0;">
<svg class="td3-fig" viewBox="0 0 800 320" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Séquence d'appel par événement pour process_static versus process_dynamic sur 1 million d'événements">
<style>
.td3-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .td3-fig,[data-theme="dark"] .td3-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.td3-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.td3-fig .boxAc{fill:var(--box);stroke:var(--ac);stroke-width:2}
.td3-fig .lane{stroke:var(--ln);stroke-width:1.5;stroke-dasharray:4 3}
.td3-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td3-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td3-fig .mut{fill:var(--mut);font:600 11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td3-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- markers -->
<defs>
<marker id="td3-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
</defs>
<!-- lane titles -->
<text x="200" y="26" class="ti">process_static::&lt;T&gt;()</text>
<text x="600" y="26" class="ti">process_dynamic(&amp;mut dyn T)</text>
<!-- static lane -->
<line class="lane" x1="200" y1="40" x2="200" y2="270"/>
<rect class="box" x="90" y="45" width="220" height="40" rx="6"/>
<text x="200" y="70" class="tx">boucle d'événements, par item</text>
<path class="ln" d="M200,85 L200,111" marker-end="url(#td3-arrow-fr)"/>
<rect class="boxAc" x="90" y="112" width="220" height="40" rx="6"/>
<text x="200" y="137" class="tx">add inliné, pas d'appel</text>
<path class="ln" d="M200,152 L200,178" marker-end="url(#td3-arrow-fr)"/>
<rect class="box" x="90" y="179" width="220" height="40" rx="6"/>
<text x="200" y="204" class="tx">boucle unrollée / SIMD</text>
<text x="200" y="230" class="mut">1M événements ≈ 1ms</text>
<!-- dynamic lane -->
<line class="lane" x1="600" y1="40" x2="600" y2="270"/>
<rect class="box" x="490" y="45" width="220" height="40" rx="6"/>
<text x="600" y="70" class="tx">boucle d'événements, par item</text>
<path class="ln" d="M600,85 L600,111" marker-end="url(#td3-arrow-fr)"/>
<rect class="box" x="490" y="112" width="220" height="40" rx="6"/>
<text x="600" y="137" class="tx">charge le ptr vtable</text>
<path class="ln" d="M600,152 L600,178" marker-end="url(#td3-arrow-fr)"/>
<rect class="box" x="490" y="179" width="220" height="40" rx="6"/>
<text x="600" y="204" class="tx">appel indirect [rax]</text>
<text x="600" y="230" class="mut">1M événements ≈ 1.2ms</text>
<!-- caption -->
<text x="400" y="300" class="mut">Même boucle, deux chemins de dispatch : arithmétique inlinée vs indirection vtable à chaque itération</text>
</svg>
</div>

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

### Version à dispatch statique
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

### Version à dispatch dynamique
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

## Compromis de performance

### Dispatch statique

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

### Dispatch dynamique

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

<div class="svg-container" style="margin:2rem 0;">
<svg class="td3b-fig" viewBox="0 0 800 300" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Empreinte binaire : le dispatch statique émet une copie de code machine par type de processeur alors que le dispatch dynamique n'émet qu'un seul corps partagé">
<style>
.td3b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .td3b-fig,[data-theme="dark"] .td3b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.td3b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.td3b-fig .boxAc{fill:var(--box);stroke:var(--ac);stroke-width:2}
.td3b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td3b-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td3b-fig .mut{fill:var(--mut);font:600 11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td3b-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.td3b-fig .lnAc{stroke:var(--ac);stroke-width:2;fill:none}
</style>
<!-- markers -->
<defs>
<marker id="td3b-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
<marker id="td3b-arrowAc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ac)"/></marker>
</defs>
<!-- titles -->
<text x="220" y="26" class="ti">Statique : une copie par type</text>
<text x="612" y="26" class="ti">Dynamique : une copie pour tous</text>
<!-- left: types -->
<rect class="box" x="55" y="54" width="120" height="38" rx="6"/>
<text x="115" y="78" class="tx">FastProcessor</text>
<rect class="box" x="55" y="104" width="120" height="38" rx="6"/>
<text x="115" y="128" class="tx">LogProcessor</text>
<rect class="box" x="55" y="154" width="120" height="38" rx="6"/>
<text x="115" y="178" class="tx">…8 autres types</text>
<!-- left: one arrow per type, no sharing -->
<path class="ln" d="M175,73 L203,73" marker-end="url(#td3b-arrow)"/>
<path class="ln" d="M175,123 L203,123" marker-end="url(#td3b-arrow)"/>
<path class="ln" d="M175,173 L203,173" marker-end="url(#td3b-arrow)"/>
<!-- left: emitted copies -->
<rect class="box" x="205" y="54" width="180" height="38" rx="6"/>
<text x="295" y="78" class="tx">process_static&lt;Fast&gt;</text>
<rect class="box" x="205" y="104" width="180" height="38" rx="6"/>
<text x="295" y="128" class="tx">process_static&lt;Log&gt;</text>
<rect class="box" x="205" y="154" width="180" height="38" rx="6"/>
<text x="295" y="178" class="tx">× 8 copies de plus</text>
<!-- right: types -->
<rect class="box" x="440" y="54" width="120" height="38" rx="6"/>
<text x="500" y="78" class="tx">FastProcessor</text>
<rect class="box" x="440" y="104" width="120" height="38" rx="6"/>
<text x="500" y="128" class="tx">LogProcessor</text>
<rect class="box" x="440" y="154" width="120" height="38" rx="6"/>
<text x="500" y="178" class="tx">…8 autres types</text>
<!-- right: Y-merge into a single shared body -->
<path class="lnAc" d="M560,73 L590,73"/>
<path class="lnAc" d="M560,123 L590,123"/>
<path class="lnAc" d="M560,173 L590,173"/>
<path class="lnAc" d="M590,73 L590,173"/>
<path class="lnAc" d="M590,123 L633,123" marker-end="url(#td3b-arrowAc)"/>
<rect class="boxAc" x="635" y="99" width="150" height="48" rx="6"/>
<text x="710" y="120" class="tx">process_dynamic</text>
<text x="710" y="138" class="mut">un seul corps, ~50 o</text>
<!-- footprint captions -->
<text x="220" y="225" class="mut">.text grossit de ~100 o par type</text>
<text x="220" y="243" class="mut">≈ 1 Ko dès qu'il y en a 10</text>
<text x="612" y="225" class="mut">.text reste stable quand on ajoute des types</text>
<text x="612" y="243" class="mut">chaque valeur porte un ptr vtable de 8 octets</text>
<!-- caption -->
<text x="400" y="282" class="mut">Les cycles favorisent la colonne de gauche ; la taille binaire et l'ajout de types favorisent la droite</text>
</svg>
</div>

## Scénarios et Préférences

### Choisir le Dispatch statique

- **Scénario** : Boucles chaudes dans un processeur de données temps réel (ex : filtrage audio, routage de paquets) où chaque cycle compte.
- **Pourquoi** : Overhead zéro, inlining, et potentiel d'optimisation. Dans `process_static`, le compilateur peut unroller ou SIMDifier la boucle pour des événements `f32`.
- **Compromis** : Binaire plus large, mais acceptable pour un ensemble connu et petit de processeurs (ex : 2-5 types).
- **Maintenabilité** : Moins flexible—ajouter un nouveau processeur nécessite une recompilation.

### Choisir le Dispatch dynamique

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
