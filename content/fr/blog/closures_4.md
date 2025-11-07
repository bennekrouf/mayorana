---
id: move-closures-rust-fr
title: >-
  Que sont les move closures (move || { ... }) ? Quand sont-elles nécessaires et
  comment interagissent-elles avec l'ownership ?
slug: move-closures-rust-fr
locale: fr
date: '2025-11-07'
author: mayo
excerpt: 'Functions et closures en Rust, couvrant ownership, traits, lifetimes'
tags:
  - rust
  - closures
  - ownership
  - traits
  - lifetimes
---

# Que sont les move closures (move || { ... }) ? Quand sont-elles nécessaires et comment interagissent-elles avec l'ownership ?

Une `move` closure (définie avec le mot-clé `move`) force la closure à prendre ownership des variables qu'elle capture de l'environnement. Contrairement aux closures normales, qui capturent les variables par référence (immutable ou mutable) quand c'est possible, les `move` closures déplacent ou copient les variables dans la closure elle-même.

## Mécaniques Clés

### 1. Transfer d'Ownership

- Pour les types **non-Copy** (ex : `String`, `Vec`), la closure prend ownership de la variable :
  ```rust
  let s = String::from("hello");
  let closure = move || println!("{}", s); // `s` est moved dans la closure
  // println!("{}", s); // ERREUR: `s` was moved
  ```

- Pour les types **Copy** (ex : `i32`, `bool`), la closure copie la valeur :
  ```rust
  let x = 42;
  let closure = move || println!("{}", x); // `x` est copié
  println!("{}", x); // OK: `x` est toujours valide
  ```

### 2. Interaction avec les Closure Traits

Le trait d'une `move` closure (`Fn`, `FnMut`, `FnOnce`) dépend de comment les variables capturées sont utilisées :

- **`Fn`** : Accès read-only aux variables capturées.
- **`FnMut`** : Mute les variables capturées.
- **`FnOnce`** : Consomme les variables capturées (ex : `drop`).

## Quand les Move Closures Sont-elles Nécessaires ?

### 1. Closures qui Survivent à leur Environnement

Quand une closure est utilisée dans un scope différent (ex : thread ou tâche async), elle doit posséder ses données pour éviter les dangling references :

```rust
use std::thread;

let data = String::from("thread-safe");
thread::spawn(move || { // `move` force ownership de `data`
    println!("{}", data); // Sûr: `data` vit dans la closure
}).join().unwrap();
```

### 2. Casser les Cycles de Référence

Si une closure doit capturer une valeur qui est aussi empruntée ailleurs, `move` assure que l'ownership est transféré :

```rust
let mut vec = vec![1, 2, 3];
let closure = move || { // Prend ownership de `vec`
    println!("Vec length: {}", vec.len());
    // vec.push(4); // ERREUR: `vec` est moved (impossible de muter après move)
};
// vec.push(4); // ERREUR: `vec` est moved dans closure
closure();
```

### 3. Contrôle Explicite d'Ownership

Quand tu veux éviter les emprunts accidentels ou forcer une copie :

```rust
let x = 42;
let closure = || println!("{}", x); // Emprunte `x`
let move_closure = move || println!("{}", x); // Copie `x` (puisque `i32` est `Copy`)

// Les deux closures peuvent coexister
closure();
move_closure();
println!("{}", x); // `x` toujours accessible
```

## Exemples Détaillés

### 1. Type Non-Copy (Ownership Moved)

```rust
fn demonstrate_non_copy_move() {
    let s = String::from("hello");
    let closure = move || {
        println!("Inside closure: {}", s);
        s.len() // Retourne la longueur
    };
    
    println!("Length: {}", closure()); // Fonctionne: closure possède `s`
    // println!("{}", s); // ERREUR: `s` a été moved
    
    // Si on veut utiliser s après, il faut cloner avant
    let s2 = String::from("world");
    let s2_clone = s2.clone();
    let closure2 = move || println!("{}", s2);
    closure2();
    println!("Still have: {}", s2_clone); // OK
}
```

### 2. Type Copy (Valeur Copiée)

```rust
fn demonstrate_copy_move() {
    let x = 42;
    let y = 3.14;
    
    let closure = move || {
        println!("x: {}, y: {}", x, y); // Copie x et y
        x + y as i32
    };
    
    println!("Result: {}", closure()); // 45
    println!("Original x: {}, y: {}", x, y); // OK: types Copy
}
```

### 3. Mixer `move` et Mutation

```rust
fn demonstrate_move_mutation() {
    let mut count = 0;
    let mut closure = move || { // `count` est copié (puisque `i32` est `Copy`)
        count += 1; // Opère sur la copie de `count`
        println!("Closure count: {}", count);
        count
    };
    
    println!("First call: {}", closure()); // 1
    println!("Second call: {}", closure()); // 2
    println!("Original count: {}", count); // 0 (original inchangé)
}
```

### 4. Move avec des Structures Complexes

```rust
#[derive(Debug, Clone)]
struct Person {
    name: String,
    age: u32,
}

fn demonstrate_struct_move() {
    let person = Person {
        name: "Alice".to_string(),
        age: 30,
    };
    
    // Move la struct entière
    let closure = move || {
        println!("Person: {:?}", person);
        person.age > 18 // Accès aux fields
    };
    
    println!("Is adult: {}", closure());
    // println!("{:?}", person); // ERREUR: person moved
    
    // Solution avec clone
    let person2 = Person {
        name: "Bob".to_string(),
        age: 25,
    };
    let person_clone = person2.clone();
    let closure2 = move || println!("Moved: {:?}", person2);
    closure2();
    println!("Still have: {:?}", person_clone);
}
```

## Cas d'Usage Avancés

### 1. Threads et Concurrence

```rust
use std::thread;
use std::sync::Arc;

fn thread_examples() {
    // Partage de données entre threads avec Arc
    let shared_data = Arc::new(vec![1, 2, 3, 4, 5]);
    let mut handles = vec![];
    
    for i in 0..3 {
        let data = shared_data.clone(); // Clone Arc, pas les données
        let handle = thread::spawn(move || { // move nécessaire pour threads
            let sum: i32 = data.iter().sum();
            println!("Thread {}: sum = {}", i, sum);
        });
        handles.push(handle);
    }
    
    for handle in handles {
        handle.join().unwrap();
    }
}
```

### 2. Async et Futures

```rust
async fn async_examples() {
    let message = String::from("async message");
    
    // Move nécessaire pour async blocks
    let future = async move {
        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
        println!("Async: {}", message);
        message.len()
    };
    
    let length = future.await;
    println!("Message length: {}", length);
    // println!("{}", message); // ERREUR: message moved
}
```

### 3. Event Handlers et Callbacks

```rust
struct EventSystem {
    callbacks: Vec<Box<dyn Fn(&str) + Send + 'static>>,
}

impl EventSystem {
    fn new() -> Self {
        Self { callbacks: Vec::new() }
    }
    
    fn register<F>(&mut self, callback: F)
    where
        F: Fn(&str) + Send + 'static,
    {
        self.callbacks.push(Box::new(callback));
    }
    
    fn trigger(&self, event: &str) {
        for callback in &self.callbacks {
            callback(event);
        }
    }
}

fn event_handler_example() {
    let mut system = EventSystem::new();
    
    let user_name = String::from("Alice");
    let login_count = std::cell::RefCell::new(0);
    
    // Move nécessaire car callback doit être 'static
    system.register(move |event| {
        if event == "login" {
            let mut count = login_count.borrow_mut();
            *count += 1;
            println!("{} logged in (#{} time)", user_name, *count);
        }
    });
    
    system.trigger("login");
    system.trigger("login");
}
```

## Pièges Courants

### 1. Moves Non Intentionnels

```rust
fn unintended_moves() {
    let important_data = String::from("crucial info");
    
    // Piège: move accidentel
    let _ = move || println!("{}", important_data); // `important_data` moved ici
    // println!("{}", important_data); // ERREUR: important_data is gone
    
    // Solution: cloner si nécessaire
    let important_data2 = String::from("more crucial info");
    let data_copy = important_data2.clone();
    let _ = move || println!("{}", important_data2);
    println!("Still have: {}", data_copy); // OK
}
```

### 2. Surutilisation de `move`

```rust
fn overusing_move() {
    let x = 42;
    
    // ❌ Inutile pour types Copy locaux
    let unnecessary = move || x + 1;
    
    // ✅ Emprunt suffisant
    let sufficient = || x + 1;
    
    // Les deux marchent, mais le second est plus idiomatique
    println!("{} {}", unnecessary(), sufficient());
    println!("{}", x); // Toujours accessible
}
```

### 3. Move avec Mutable References

```rust
fn move_with_mut_ref() {
    let mut data = vec![1, 2, 3];
    
    // ❌ Problématique: move une &mut reference
    {
        let data_ref = &mut data;
        // let closure = move || data_ref.push(4); // Move la référence, pas les données
        // Ceci crée des problèmes de lifetime
    }
    
    // ✅ Mieux: move les données elles-mêmes
    let owned_data = vec![1, 2, 3];
    let mut closure = move || {
        let mut local_data = owned_data.clone();
        local_data.push(4);
        local_data
    };
    
    let result = closure();
    println!("Result: {:?}", result);
}
```

## Patterns d'Optimisation

### 1. Selective Moving

```rust
fn selective_moving() {
    let name = String::from("Alice");
    let age = 30;
    let city = String::from("Paris");
    
    // Au lieu de tout move
    // let closure = move || format!("{} is {} years old in {}", name, age, city);
    
    // Move seulement ce qui est nécessaire
    let name_clone = name.clone();
    let closure = move || format!("{} is {} years old", name_clone, age);
    
    // `city` et `name` original toujours accessibles
    println!("Original name: {}, city: {}", name, city);
    println!("Closure result: {}", closure());
}
```

### 2. Lazy Evaluation avec Move

```rust
fn lazy_evaluation() {
    let expensive_data = vec![1; 1_000_000];
    
    // Lazy computation avec move
    let lazy_sum = move || {
        println!("Computing sum...");
        expensive_data.iter().sum::<i32>()
    };
    
    // Computation n'arrive que quand appelée
    println!("Before calling closure");
    let result = lazy_sum();
    println!("Sum: {}", result);
}
```

### 3. Builder Pattern avec Move Closures

```rust
struct DataProcessor<F> {
    transformer: F,
}

impl<F> DataProcessor<F>
where
    F: Fn(i32) -> i32,
{
    fn new(transformer: F) -> Self {
        Self { transformer }
    }
    
    fn process(&self, data: &[i32]) -> Vec<i32> {
        data.iter().map(|&x| (self.transformer)(x)).collect()
    }
}

fn builder_pattern_example() {
    let multiplier = 5;
    let offset = 10;
    
    // Move les valeurs dans la closure
    let processor = DataProcessor::new(move |x| x * multiplier + offset);
    
    let data = vec![1, 2, 3, 4, 5];
    let result = processor.process(&data);
    
    println!("Processed: {:?}", result); // [15, 20, 25, 30, 35]
    
    // multiplier et offset ne sont plus accessibles
    // mais on peut encore utiliser data
    println!("Original: {:?}", data);
}
```

## Debugging et Introspection

### 1. Vérifier ce qui est Moved

```rust
fn debug_moves() {
    let s1 = String::from("first");
    let s2 = String::from("second");
    let num = 42;
    
    let closure = move || {
        // s1 et s2 sont moved (non-Copy)
        // num est copié (Copy)
        format!("{} {} {}", s1, s2, num)
    };
    
    // println!("{}", s1); // ERREUR: moved
    // println!("{}", s2); // ERREUR: moved  
    println!("{}", num); // OK: copié
    
    println!("Closure result: {}", closure());
}
```

### 2. Taille des Closures

```rust
use std::mem;

fn closure_sizes() {
    let small_data = 42i32;
    let big_data = vec![1; 1000];
    
    // Sans move
    let borrow_closure = || {
        println!("{} {}", small_data, big_data.len());
    };
    
    // Avec move
    let move_closure = move || {
        println!("{} {}", small_data, big_data.len());
    };
    
    println!("Borrow closure size: {} bytes", mem::size_of_val(&borrow_closure));
    println!("Move closure size: {} bytes", mem::size_of_val(&move_closure));
    
    // Move closure sera plus grosse car elle contient big_data
}
```

## Points Clés

✅ **Utilise `move` closures quand** :
- La closure survit à son environnement (ex : threads).
- Tu as besoin d'ownership explicite pour éviter les problèmes du borrow checker.
- Tu veux découpler la closure de son environnement d'origine.

✅ **Evite `move` pour** :
- Closures locales et courtes qui n'échappent pas leur scope.
- Types `Copy` où l'emprunt est suffisant.
- Quand tu as encore besoin des valeurs originales après.

### Règles de Décision

1. **Thread ou async** → Toujours `move`
2. **Closure stockée longtemps** → Probablement `move`
3. **Closure locale temporaire** → Rarement `move`
4. **Éviter borrow checker conflicts** → `move` peut aider
5. **Performance critique** → Éviter `move` inutile

**Essaie Ceci** : Que se passe-t-il si tu utilises `move` avec une closure qui capture une mutable reference (`&mut T`) ?  
**Réponse** : La référence elle-même est moved (mais pas les données qu'elle pointe). C'est rarement utile et peut mener à des erreurs de lifetime !

## Exemple Pratique Complet

```rust
use std::thread;
use std::sync::mpsc;
use std::time::Duration;

// Système de workers avec move closures
fn worker_system_example() {
    let (sender, receiver) = mpsc::channel();
    
    // Worker threads avec move closures
    let mut handles = vec![];
    
    for worker_id in 0..3 {
        let sender = sender.clone();
        
        let handle = thread::spawn(move || { // Move sender et worker_id
            for i in 0..5 {
                let message = format!("Worker {} - Message {}", worker_id, i);
                sender.send(message).unwrap();
                thread::sleep(Duration::from_millis(100));
            }
            println!("Worker {} finished", worker_id);
        });
        
        handles.push(handle);
    }
    
    // Drop le sender original pour fermer le channel
    drop(sender);
    
    // Recevoir les messages
    for received in receiver {
        println!("Received: {}", received);
    }
    
    // Attendre tous les workers
    for handle in handles {
        handle.join().unwrap();
    }
}
```

---

**Conclusion :** Les `move` closures sont essentielles pour la concurrence et les situations où tu dois transférer l'ownership. Utilise-les judicieusement pour écrire du code Rust sûr et efficace !
