---
id: concurrency-rust-fr
title: "Comment les mécanismes d'Ownership et de Borrowing Assurent une Concurrence Sûre"
slug: concurrency-rust-fr
locale: "fr"
date: '2025-07-07'
author: mayo
excerpt: >-
  Rust memory et string
content_focus: "rust memory et string"
technical_level: "Discussion technique expert"

tags:
  - rust
  - beginner
  - memory
  - concurrency
  - ownership
  - borrowing
scheduledFor: '2025-07-08'
scheduledAt: '2025-07-08T06:55:13.405Z'
---

# Comment l'ownership et le borrowing préviennent-ils les data races ?

Le modèle de concurrence de Rust exploite ses règles d'ownership et de borrowing pour garantir la thread safety au moment de la compilation, éliminant les data races sans nécessiter un garbage collector. Cette approche assure un parallélisme sûr et haute performance avec un overhead runtime minimal.

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
