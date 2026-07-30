---
id: concurrency-rust-fr
title: >-
  Comment les mécanismes d'Ownership et de Borrowing Assurent une Concurrence
  Sûre
slug: concurrency-rust-fr
locale: fr
date: '2025-11-25'
author: mayo
excerpt: Rust memory et string
content_focus: rust memory et string
technical_level: Discussion technique expert
tags:
  - rust
  - beginner
  - memory
  - concurrency
  - ownership
  - borrowing
---

# Comment l'ownership et le borrowing préviennent-ils les data races ?

Le modèle de concurrence de Rust exploite ses règles d'ownership et de borrowing pour garantir la thread safety au moment de la compilation, éliminant les data races sans nécessiter un garbage collector. Cette approche assure un parallélisme sûr et haute performance avec un overhead runtime minimal.

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm12-fig" viewBox="0 0 800 250" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Plusieurs threads détiennent chacun un Arc cloné pointant vers les mêmes données protégées par un Mutex, mais le Mutex n'autorise qu'un seul thread à la fois en accès exclusif">
<!-- style -->
<style>
.mm12-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .mm12-fig,[data-theme="dark"] .mm12-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.mm12-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm12-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm12-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.mm12-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.mm12-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.mm12-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="mm12arrowfr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
</defs>
<!-- threads -->
<rect x="40" y="30" width="160" height="46" rx="6" class="box"/>
<text x="120" y="58" text-anchor="middle" class="tx">Thread A : clone Arc</text>
<rect x="40" y="94" width="160" height="46" rx="6" class="box"/>
<text x="120" y="122" text-anchor="middle" class="tx">Thread B : clone Arc</text>
<rect x="40" y="158" width="160" height="46" rx="6" class="box"/>
<text x="120" y="186" text-anchor="middle" class="tx">Thread C : clone Arc</text>
<!-- Y-merge to mutex -->
<path d="M200,53 L340,53 L340,125" class="ln" marker-end="url(#mm12arrowfr)"/>
<path d="M200,117 L340,117 L340,125" class="ln"/>
<path d="M200,181 L340,181 L340,125" class="ln" marker-end="url(#mm12arrowfr)"/>
<!-- mutex -->
<rect x="340" y="103" width="160" height="46" rx="6" class="boxac"/>
<text x="420" y="122" text-anchor="middle" class="tx">Mutex&lt;T&gt;</text>
<text x="420" y="138" text-anchor="middle" class="mut">un seul lock() à la fois</text>
<!-- to data -->
<path d="M500,126 L560,126" class="ln" marker-end="url(#mm12arrowfr)"/>
<rect x="560" y="103" width="180" height="46" rx="6" class="box"/>
<text x="650" y="126" text-anchor="middle" class="tx">données partagées</text>
<text x="650" y="142" text-anchor="middle" class="mut">accès exclusif, pas de race</text>
<text x="40" y="222" class="mut">Arc : ownership partagé entre threads · Mutex : accès exclusif à la fois</text>
</svg>
</div>

## Modèle de Concurrence de Rust

Rust utilise les mécanismes suivants pour gérer la concurrence :
- **Ownership** : Assure l'accès mutable exclusif aux données.
- **Borrowing** : Gouverne comment les données sont accédées via des références.
- **Lifetimes** : Préviennent les dangling references entre threads.
- **Traits Send/Sync** : Définissent quels types sont sûrs pour le threading.

## Comment l'Ownership et le Borrowing Préviennent les Data Races

Une **data race** survient quand :
- Deux threads accèdent aux mêmes données simultanément.
- Au moins un accès est une écriture.
- Il n'y a pas de synchronisation.

Les règles de Rust rendent les data races impossibles dans le code safe :

### 1. Mutabilité Exclusive (`&mut T`)

- Seule une référence mutable (`&mut T`) peut exister à la fois, appliquée par le borrow checker.
- Ceci prévient plusieurs threads d'écrire aux mêmes données simultanément.

**Exemple** :
```rust
let mut data = 0;
let r1 = &mut data;  // OK: Mutable borrow
// let r2 = &mut data;  // ERREUR: Cannot borrow `data` as mutable more than once
```

### 2. Pas de Mutabilité Partagée Sans Synchronisation

- Les références partagées (`&T`) sont read-only, sûres pour l'accès concurrent.
- Pour muter des données partagées, des primitives de synchronisation comme `Mutex` sont requises :

**Exemple** :
```rust
use std::sync::Mutex;

let shared = Mutex::new(42);
let guard = shared.lock().unwrap();  // Accès exclusif
*guard += 1;  // Mutation sûre
```

## Types Thread-Safe : Send et Sync

- **Send** : Un type peut être transféré sûrement entre threads (ex : `String`, `Mutex<T>`).
- **Sync** : Un type peut être partagé sûrement entre threads via des références (ex : `&i32`, `Arc<T>`).

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm12b-fig" viewBox="0 0 800 250" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Send déplace une valeur à travers la frontière de thread, Sync permet à deux threads d'utiliser une même référence en même temps, et Rc n'est ni l'un ni l'autre donc rejeté à la compilation">
<!-- style -->
<style>
.mm12b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00;--bad:#e11d48}
:root.dark .mm12b-fig,[data-theme="dark"] .mm12b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.mm12b-fig .panel{fill:none;stroke:var(--ln);stroke-width:1.5}
.mm12b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm12b-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm12b-fig .boxbad{fill:var(--box);stroke:var(--bad);stroke-width:2;stroke-dasharray:4 3}
.mm12b-fig .ti{fill:var(--tx);font:700 13px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.mm12b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.mm12b-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.mm12b-fig .bad{fill:var(--bad);font:600 11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.mm12b-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.mm12b-fig .lnac{stroke:var(--ac);stroke-width:2;fill:none}
.mm12b-fig .lnbad{stroke:var(--bad);stroke-width:1.5;fill:none;stroke-dasharray:4 3}
</style>
<!-- defs -->
<defs>
<marker id="mm12b-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
<marker id="mm12b-arrowac-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ac)"/></marker>
<marker id="mm12b-arrowbad-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--bad)"/></marker>
</defs>
<!-- panel 1: Send -->
<rect x="20" y="44" width="242" height="170" rx="8" class="panel"/>
<text x="141" y="68" class="ti">Send — la valeur traverse</text>
<rect x="36" y="84" width="90" height="32" rx="5" class="box"/>
<text x="81" y="105" class="tx">Thread A</text>
<path d="M126,100 L156,100" class="lnac" marker-end="url(#mm12b-arrowac-fr)"/>
<rect x="156" y="84" width="90" height="32" rx="5" class="boxac"/>
<text x="201" y="105" class="tx">Thread B</text>
<text x="141" y="150" class="mut">l'ownership se déplace</text>
<text x="141" y="168" class="mut">A n'y touche plus ensuite</text>
<text x="141" y="198" class="mut">String · Box&lt;T&gt; · Mutex&lt;T&gt;</text>
<!-- panel 2: Sync -->
<rect x="278" y="44" width="242" height="170" rx="8" class="panel"/>
<text x="399" y="68" class="ti">Sync — référence partagée</text>
<rect x="294" y="84" width="90" height="32" rx="5" class="box"/>
<text x="339" y="105" class="tx">Thread A</text>
<rect x="414" y="84" width="90" height="32" rx="5" class="box"/>
<text x="459" y="105" class="tx">Thread B</text>
<path d="M339,116 L339,132 L399,132" class="ln"/>
<path d="M459,116 L459,132 L399,132" class="ln"/>
<path d="M399,132 L399,146" class="ln" marker-end="url(#mm12b-arrow-fr)"/>
<rect x="339" y="146" width="120" height="34" rx="5" class="boxac"/>
<text x="399" y="168" class="tx">&amp;T — une valeur</text>
<text x="399" y="198" class="mut">&amp;i32 · Arc&lt;T&gt; · Mutex&lt;T&gt;</text>
<!-- panel 3: neither -->
<rect x="536" y="44" width="242" height="170" rx="8" class="panel"/>
<text x="657" y="68" class="ti">Rc&lt;T&gt; — ni l'un ni l'autre</text>
<rect x="552" y="84" width="90" height="32" rx="5" class="box"/>
<text x="597" y="105" class="tx">Thread A</text>
<rect x="672" y="84" width="90" height="32" rx="5" class="box"/>
<text x="717" y="105" class="tx">Thread B</text>
<path d="M597,116 L597,132 L657,132" class="lnbad"/>
<path d="M717,116 L717,132 L657,132" class="lnbad"/>
<path d="M657,132 L657,146" class="lnbad" marker-end="url(#mm12b-arrowbad-fr)"/>
<rect x="597" y="146" width="120" height="34" rx="5" class="boxbad"/>
<text x="657" y="168" class="tx">Rc&lt;T&gt;</text>
<text x="657" y="198" class="bad">rejeté à la compilation</text>
<!-- footer -->
<text x="400" y="238" class="mut">Send demande « peut-elle se déplacer ici ? » · Sync demande « les deux côtés peuvent-ils en tenir une référence à la fois ? »</text>
</svg>
</div>

**Exemple : Spawning Threads** :
```rust
use std::thread;

let value = String::from("hello");  // `String` est `Send`
thread::spawn(move || {             // `move` transfère ownership
    println!("{}", value);          // Sûr: aucun autre thread ne peut accéder `value`
}).join().unwrap();
```

## Outils de Concurrence Courants

| **Outil** | **But** | **Mécanisme de Thread Safety** |
|-----------|---------|--------------------------------|
| `Mutex<T>` | Exclusion mutuelle | Locks pour accès exclusif |
| `Arc<T>` | Atomic reference counting | Ownership partagée entre threads |
| `RwLock<T>` | Read-write lock | Lecteurs multiples ou un écrivain |
| `mpsc channels` | Message passing | Transfère ownership entre threads |

**Exemple : État Partagé avec Arc + Mutex** :
```rust
use std::sync::{Arc, Mutex};
use std::thread;

let counter = Arc::new(Mutex::new(0));
let mut handles = vec![];

for _ in 0..10 {
    let counter = Arc::clone(&counter);
    handles.push(thread::spawn(move || {
        let mut num = counter.lock().unwrap();
        *num += 1;  // Mutex assure accès exclusif
    }));
}

for handle in handles {
    handle.join().unwrap();
}
println!("Result: {}", *counter.lock().unwrap());  // Affiche 10
```

## Pourquoi C'est Important

- **Pas d'overhead runtime** : Les vérifications de sécurité se produisent au moment de la compilation.
- **Pas de garbage collector** : Concurrence sûre sans pauses GC.
- **Parallélisme sans peur** : Le compilateur rejette les patterns unsafe, permettant une programmation concurrente confiante.

## Points Clés

✅ **Les règles d'ownership préviennent** :
- L'accès mutable concurrent (pas de data races).
- Les dangling references (via lifetimes).

✅ **Send/Sync appliquent** la thread safety au moment de la compilation.

🚀 **Utilise `Mutex`, `Arc`, ou channels** pour un état partagé sûr.

**Impact Réel** : Les crates comme `rayon` (iterators parallèles) et `tokio` (runtime async) s'appuient sur ces garanties pour une concurrence robuste.

**Expérimente** : Que se passe-t-il si tu essaies de partager un `Rc<T>` entre threads ?

**Réponse** : Erreur de compilation ! `Rc<T>` n'est pas `Send` (pas thread-safe). Utilise `Arc<T>` à la place.
