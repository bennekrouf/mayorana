---
id: stateful-closures-rust-fr
title: 'Closures avec État en Rust: Passer et Muter à Travers Plusieurs Appels'
slug: stateful-closures-rust-fr
locale: fr
author: mayo
excerpt: Gérer les closures avec état en Rust pour des appels de fonction répétés
tags:
  - rust
  - closures
  - state
  - fnmut
  - lifetimes
date: '2025-11-08'
---

# Closures avec État en Rust: Passer et Muter à Travers Plusieurs Appels

Pour passer une closure à une fonction Rust qui doit l'appeler plusieurs fois tout en maintenant l'état entre les appels, la closure doit implémenter le trait `FnMut` pour permettre la mutation de son environnement capturé. Je vais expliquer comment concevoir cela, en utilisant l'ownership, les traits et les lifetimes de Rust, et mettre en évidence quand utiliser des closures simples versus des approches structurées.

## Solution: Utiliser FnMut et Closure Mutable

Une closure qui mute l'état doit implémenter `FnMut`, qui permet plusieurs appels avec accès mutable aux variables capturées. La fonction qui reçoit la closure la prend comme `&mut impl FnMut` pour retenir l'ownership tout en permettant la mutation.

**Exemple** :
```rust
fn call_repeatedly<F: FnMut() -> i32>(f: &mut F) {
    println!("First call: {}", f());  // 1
    println!("Second call: {}", f()); // 2
}

fn main() {
    let mut counter = 0; // État stocké en dehors de la closure
    let mut closure = || {
        counter += 1; // Mute l'état capturé → `FnMut`
        counter
    };
    
    // Passer comme `&mut closure` pour retenir ownership
    call_repeatedly(&mut closure);
    // closure peut encore être utilisée ici
    println!("After: {}", closure()); // 3
}
```

### Mécaniques Clés

- **État Mutable** : La closure capture `counter` via un mutable borrow (`&mut i32`). La closure elle-même est déclarée `mut` pour permettre la mutation.
- **Signature de Function** : `fn call_repeatedly<F: FnMut() -> i32>(f: &mut F)` assure que la closure peut être appelée plusieurs fois avec accès mutable.
- **Sécurité des Lifetimes** : La closure emprunte `counter`, donc elle ne peut pas outlive `counter`, appliqué par le borrow checker de Rust.

## Alternative: Encapsuler l'État dans une Struct

Pour un état complexe, encapsule-le dans une struct avec une implémentation `FnMut` explicite :

```rust
struct Counter {
    count: i32,
}

impl Counter {
    fn new() -> Self {
        Counter { count: 0 }
    }
    
    fn call(&mut self) -> i32 {
        self.count += 1;
        self.count
    }
}

fn main() {
    let mut counter = Counter::new();
    
    // Closure qui capture counter par mutable borrow
    let mut closure = || counter.call();
    call_repeatedly(&mut closure);
    
    println!("After: {}", counter.call()); // Continue l'état
}
```

## Exemples Avancés

### 1. État Complexe avec Plusieurs Variables

```rust
fn demonstrate_complex_state() {
    let mut sum = 0;
    let mut count = 0;
    let mut max_seen = i32::MIN;
    
    let mut accumulator = |value: i32| {
        sum += value;
        count += 1;
        max_seen = max_seen.max(value);
        
        // Retourne moyenne, count, et max
        (sum as f64 / count as f64, count, max_seen)
    };
    
    // Function qui utilise notre closure stateful
    fn process_values<F>(mut processor: F, values: &[i32])
    where
        F: FnMut(i32) -> (f64, i32, i32),
    {
        for &value in values {
            let (avg, count, max) = processor(value);
            println!("Value: {}, Avg: {:.2}, Count: {}, Max: {}", 
                     value, avg, count, max);
        }
    }
    
    let values = vec![10, 5, 15, 3, 20];
    process_values(&mut accumulator, &values);
}
```

### 2. Closure avec État dans des Collections

```rust
fn demonstrate_closure_collection() {
    // Vector de closures stateful
    let mut counters: Vec<Box<dyn FnMut() -> i32>> = Vec::new();
    
    // Créer plusieurs closures avec états indépendants
    for i in 0..3 {
        let mut count = i * 10; // État initial différent
        counters.push(Box::new(move || {
            count += 1;
            count
        }));
    }
    
    // Appeler chaque closure
    for (i, counter) in counters.iter_mut().enumerate() {
        println!("Counter {}: {}", i, counter()); // 1, 11, 21
        println!("Counter {}: {}", i, counter()); // 2, 12, 22
    }
}
```

### 3. Closure Stateful avec Move

```rust
use std::collections::HashMap;

fn demonstrate_move_stateful() {
    // Créer une closure qui maintient un cache
    fn create_cached_processor() -> impl FnMut(&str) -> usize {
        let mut cache = HashMap::new();
        let mut call_count = 0;
        
        move |input: &str| {
            call_count += 1;
            
            if let Some(&cached_result) = cache.get(input) {
                println!("Cache hit for '{}' (call #{})", input, call_count);
                cached_result
            } else {
                let result = input.len(); // Calcul "coûteux"
                cache.insert(input.to_string(), result);
                println!("Computed '{}' = {} (call #{})", input, result, call_count);
                result
            }
        }
    }
    
    let mut processor = create_cached_processor();
    
    // Test du cache
    println!("Result: {}", processor("hello"));     // Compute
    println!("Result: {}", processor("world"));     // Compute  
    println!("Result: {}", processor("hello"));     // Cache hit
    println!("Result: {}", processor("rust"));      // Compute
    println!("Result: {}", processor("world"));     // Cache hit
}
```

## Patterns Avancés

### 1. Builder Pattern avec Closures Stateful

```rust
struct StatefulProcessor<F> {
    processor: F,
}

impl<F> StatefulProcessor<F>
where
    F: FnMut(i32) -> i32,
{
    fn new(processor: F) -> Self {
        Self { processor }
    }
    
    fn process_batch(&mut self, values: &[i32]) -> Vec<i32> {
        values.iter().map(|&x| (self.processor)(x)).collect()
    }
    
    fn process_single(&mut self, value: i32) -> i32 {
        (self.processor)(value)
    }
}

fn builder_pattern_example() {
    let mut multiplier = 2;
    
    let mut processor = StatefulProcessor::new(|x| {
        let result = x * multiplier;
        multiplier += 1; // L'état change à chaque appel
        result
    });
    
    println!("Single: {}", processor.process_single(5)); // 5 * 2 = 10
    println!("Single: {}", processor.process_single(5)); // 5 * 3 = 15
    
    let batch = vec![1, 2, 3];
    let results = processor.process_batch(&batch);
    println!("Batch: {:?}", results); // [4, 10, 18] (multipliers: 4, 5, 6)
}
```

### 2. State Machine avec Closures

```rust
#[derive(Debug, Clone, Copy)]
enum State {
    Idle,
    Processing,
    Complete,
    Error,
}

fn state_machine_example() {
    let mut current_state = State::Idle;
    let mut processed_count = 0;
    
    let mut state_machine = |input: &str| -> (State, String) {
        let previous_state = current_state;
        
        match (current_state, input) {
            (State::Idle, "start") => {
                current_state = State::Processing;
                ("Started processing".to_string())
            }
            (State::Processing, "process") => {
                processed_count += 1;
                if processed_count >= 3 {
                    current_state = State::Complete;
                    ("Processing complete".to_string())
                } else {
                    (format!("Processed item {} of 3", processed_count))
                }
            }
            (State::Complete, "reset") => {
                current_state = State::Idle;
                processed_count = 0;
                ("Reset to idle".to_string())
            }
            (_, "error") => {
                current_state = State::Error;
                ("Error occurred".to_string())
            }
            _ => {
                ("Invalid transition".to_string())
            }
        }
        .map(|msg| (current_state, msg))
        .unwrap_or_else(|| (current_state, format!("Invalid input '{}' in state {:?}", input, previous_state)))
    };
    
    // Test du state machine
    let inputs = vec!["start", "process", "process", "process", "reset", "start", "error"];
    
    for input in inputs {
        let (new_state, message) = state_machine(input);
        println!("Input: '{}' -> State: {:?}, Message: {}", input, new_state, message);
    }
}
```

## Pourquoi Pas FnOnce ou Fn ?

- **`FnOnce`** : Ne peut être appelée qu'une fois, consommant la closure. Inapproprié pour plusieurs appels.
- **`Fn`** : Utilise des emprunts immutables, empêchant la mutation d'état, donc ne peut pas modifier les variables capturées.

```rust
fn demonstrate_trait_differences() {
    let x = 5;
    let mut counter = 0;
    
    // Fn - read-only, peut être appelée plusieurs fois
    let fn_closure = || {
        println!("Reading x: {}", x); // Pas de mutation
        x * 2
    };
    
    // FnMut - peut muter, peut être appelée plusieurs fois
    let mut fn_mut_closure = || {
        counter += 1; // Mutation
        counter
    };
    
    // FnOnce - peut muter et consommer, une seule fois
    let data = String::from("hello");
    let fn_once_closure = || {
        println!("Consuming: {}", data);
        data // Move data out
    };
    
    // Tests
    println!("Fn: {} {}", fn_closure(), fn_closure()); // OK multiple fois
    println!("FnMut: {} {}", fn_mut_closure(), fn_mut_closure()); // OK multiple fois
    println!("FnOnce: {}", fn_once_closure()); // OK une fois
    // println!("FnOnce again: {}", fn_once_closure()); // ERREUR: déjà consumed
}
```

## Pièges Courants

### 1. Oublier `mut`

```rust
fn common_mistake_1() {
    let mut counter = 0;
    
    // ❌ Erreur: closure pas déclarée mut
    let closure = || {
        counter += 1; // Essaie de muter
        counter
    };
    
    // call_repeatedly(&mut closure); // ERREUR: cannot borrow as mutable
    
    // ✅ Solution: déclarer closure comme mut
    let mut closure = || {
        counter += 1;
        counter
    };
    
    call_repeatedly(&mut closure); // OK
}
```

### 2. Dangling References

```rust
fn common_mistake_2() {
    // ❌ Erreur: lifetime problem
    fn bad_factory() -> impl FnMut() -> i32 {
        let counter = 0; // Locale à cette fonction
        || { 
            // counter += 1; // ERREUR: counter doesn't live long enough
            // counter 
            42 // Contournement pour l'exemple
        }
    }
    
    // ✅ Solution: move ou ownership approprié
    fn good_factory() -> impl FnMut() -> i32 {
        let mut counter = 0;
        move || { // Move counter dans la closure
            counter += 1;
            counter
        }
    }
    
    let mut closure = good_factory();
    println!("Result: {}", closure()); // 1
    println!("Result: {}", closure()); // 2
}
```

### 3. Confusion entre &mut et move

```rust
fn borrow_vs_move_confusion() {
    let mut data = vec![1, 2, 3];
    
    // Avec &mut - data reste accessible
    {
        let mut closure = || {
            data.push(data.len() + 1); // Mute via &mut
            data.len()
        };
        println!("Length: {}", closure()); // 4
        println!("Length: {}", closure()); // 5
    } // closure dropped ici
    
    println!("Original data: {:?}", data); // OK: [1, 2, 3, 4, 5]
    
    // Avec move - data n'est plus accessible
    let mut data2 = vec![10, 20, 30];
    let mut closure2 = move || {
        data2.push(data2.len() + 10); // Move data2 dans closure
        data2.len()
    };
    
    println!("Length: {}", closure2()); // 4
    // println!("Data2: {:?}", data2); // ERREUR: data2 was moved
}
```

## Testing et Debugging

### 1. Test des Closures Stateful

```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_stateful_closure() {
        let mut sum = 0;
        let mut adder = |x: i32| {
            sum += x;
            sum
        };
        
        assert_eq!(adder(5), 5);
        assert_eq!(adder(3), 8);
        assert_eq!(adder(2), 10);
    }
    
    #[test]
    fn test_closure_with_function() {
        fn apply_three_times<F: FnMut() -> i32>(f: &mut F) -> Vec<i32> {
            vec![f(), f(), f()]
        }
        
        let mut counter = 0;
        let mut increment = || {
            counter += 1;
            counter
        };
        
        let results = apply_three_times(&mut increment);
        assert_eq!(results, vec![1, 2, 3]);
    }
}
```

### 2. Debugging State Changes

```rust
fn debug_state_changes() {
    let mut state = 0;
    let mut debug_closure = |action: &str| {
        println!("Before {}: state = {}", action, state);
        
        match action {
            "increment" => state += 1,
            "double" => state *= 2,
            "reset" => state = 0,
            _ => println!("Unknown action: {}", action),
        }
        
        println!("After {}: state = {}", action, state);
        state
    };
    
    let actions = vec!["increment", "increment", "double", "increment", "reset"];
    
    for action in actions {
        debug_closure(action);
        println!("---");
    }
}
```

## Performance et Optimisations

### 1. Éviter les Allocations Inutiles

```rust
fn performance_considerations() {
    // ❌ Mauvais - allocation à chaque appel
    let mut bad_closure = || {
        let mut vec = Vec::new(); // Nouvelle allocation
        vec.push(1);
        vec.push(2);
        vec.len()
    };
    
    // ✅ Bon - réutilisation du buffer
    let mut buffer = Vec::new();
    let mut good_closure = || {
        buffer.clear(); // Réutilise l'allocation existante
        buffer.push(1);
        buffer.push(2);
        buffer.len()
    };
    
    // Test performance (simplifié)
    use std::time::Instant;
    
    let start = Instant::now();
    for _ in 0..10000 {
        bad_closure();
    }
    println!("Bad closure time: {:?}", start.elapsed());
    
    let start = Instant::now();
    for _ in 0..10000 {
        good_closure();
    }
    println!("Good closure time: {:?}", start.elapsed());
}
```

## Points Clés

✅ **Utilise `FnMut`** pour les closures qui mutent l'état à travers plusieurs appels.  
✅ **Marque les closures et paramètres comme `mut`** pour permettre la mutation.  
✅ **Préfére les closures simples** pour l'état basique ; utilise les structs pour la gestion d'état complexe.

### Règles de Décision

1. **État simple (1-2 variables)** → Closure avec captures mutables
2. **État complexe** → Struct avec méthodes
3. **État partagé** → Arc<Mutex<T>> ou RefCell<T>
4. **Performance critique** → Éviter allocations dans la closure
5. **Testing important** → Struct pour meilleure testabilité

**Exemple Réel** : Les closures stateful sont communes dans les event loops ou tâches async (ex : `tokio`) où une closure maintient des compteurs ou buffers à travers les itérations.

**Expérimente** : Essaie de passer une closure non-`mut` à `call_repeatedly`.  
**Réponse** : Erreur de compilation ! La closure doit être mutable pour implémenter `FnMut`.

## Exemple Pratique Complet

```rust
use std::collections::VecDeque;

// Simulateur de fenêtre glissante avec closure stateful
fn sliding_window_example() {
    let window_size = 3;
    let mut window = VecDeque::new();
    let mut sum = 0.0;
    
    let mut sliding_average = |value: f64| -> f64 {
        // Ajouter nouvelle valeur
        window.push_back(value);
        sum += value;
        
        // Retirer valeur si fenêtre trop grande
        if window.len() > window_size {
            if let Some(old_value) = window.pop_front() {
                sum -= old_value;
            }
        }
        
        // Calculer moyenne
        sum / window.len() as f64
    };
    
    // Function qui utilise notre closure
    fn process_stream<F>(mut processor: F, values: &[f64])
    where
        F: FnMut(f64) -> f64,
    {
        for &value in values {
            let avg = processor(value);
            println!("Value: {:.1}, Moving Average: {:.2}", value, avg);
        }
    }
    
    let values = vec![1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 2.0, 1.0];
    process_stream(&mut sliding_average, &values);
}

fn main() {
    sliding_window_example();
}
```

---

**Conclusion :** Les closures stateful avec `FnMut` offrent un moyen puissant et ergonomique de maintenir l'état à travers plusieurs appels de fonction. Maîtrise ces patterns pour écrire du code Rust expressif et performant !
