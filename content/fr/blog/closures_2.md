---
id: fn-traits-rust-fr
title: 'Quelle est la différence entre Fn, FnMut, et FnOnce ?'
locale: fr
slug: fn-traits-rust-fr
date: '2025-08-31'
author: mayo
excerpt: 'Functions et closures en Rust, couvrant ownership, traits, lifetimes'

tags:
  - rust
  - closures
  - traits
  - ownership
  - lifetimes
---

# Quelles sont les différences entre Fn, FnMut, et FnOnce ?

Distinguer les traits `Fn`, `FnMut`, et `FnOnce` est crucial pour maîtriser le système de closures de Rust.

<div class="svg-container" style="margin:2rem 0;">
<svg class="cl2-fig" viewBox="0 0 800 340" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Fn est un sous-ensemble de FnMut, lui-même un sous-ensemble de FnOnce, selon la façon dont chacun capture les variables">
<!-- style -->
<style>
.cl2-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .cl2-fig,[data-theme="dark"] .cl2-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cl2-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.cl2-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.cl2-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.cl2-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl2-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
</style>
<!-- title -->
<text x="400" y="20" text-anchor="middle" class="ti">Fn est un sous-ensemble de FnMut, lui-même un sous-ensemble de FnOnce</text>
<!-- outer: FnOnce -->
<rect x="40" y="60" width="720" height="250" rx="10" class="box"/>
<text x="60" y="85" class="tx">FnOnce — ownership (T), appelable une fois</text>
<!-- middle: FnMut -->
<rect x="110" y="105" width="580" height="170" rx="10" class="box"/>
<text x="130" y="130" class="tx">FnMut — mutable borrow (&amp;mut T), appels multiples</text>
<!-- inner: Fn -->
<rect x="190" y="150" width="420" height="90" rx="10" class="boxac"/>
<text x="400" y="180" text-anchor="middle" class="tx">Fn — immutable borrow (&amp;T), appels multiples</text>
<text x="400" y="198" text-anchor="middle" class="mut">choix par défaut recommandé sans mutation</text>
</svg>
</div>

## Capture des Closures

Les closures capturent les variables de leur environnement de trois façons, selon comment les variables sont utilisées :

- **Immutable Borrow (`&T`)** : Si la closure ne fait que lire une variable.
- **Mutable Borrow (`&mut T`)** : Si la closure modifie une variable.
- **Ownership (`T`)** : Si la closure prend ownership (ex : via `move` ou en consommant la variable).

Le compilateur infère automatiquement le mode de capture le moins restrictif nécessaire.

Le mot-clé `move` force la capture par ownership, mais le trait de la closure (`Fn`, `FnMut`, ou `FnOnce`) dépend de comment les variables capturées sont utilisées.

## Traits de Closure

Les closures Rust implémentent un ou plusieurs de ces traits :

| Trait   | Capture Variables Via | Sémantique d'Appel | Nombre d'Appels |
|---------|----------------------|-------------------|-----------------|
| `Fn`    | Immutable borrow (`&T`) | `&self`        | Multiple        |
| `FnMut` | Mutable borrow (`&mut T`) | `&mut self`  | Multiple        |
| `FnOnce`| Ownership (`T`)        | `self` (consomme closure) | Une fois |

### Différences clés

- **`Fn`** :
  - Peut être appelée répétitivement.
  - Capture les variables immutablement.
  - Exemple :
    ```rust
    let x = 42;
    let closure = || println!("{}", x); // Fn (capture `x` par &T)
    ```

- **`FnMut`** :
  - Peut muter les variables capturées.
  - Nécessite le mot-clé `mut` si stockée.
  - Exemple :
    ```rust
    let mut x = 42;
    let mut closure = || { x += 1; }; // FnMut (capture `x` par &mut T)
    ```

- **`FnOnce`** :
  - Prend ownership des variables capturées.
  - Ne peut être appelée qu'une fois.
  - Exemple :
    ```rust
    let x = String::from("hello");
    let closure = || { drop(x); }; // FnOnce (move `x` dans closure)
    ```

## Hiérarchie des Traits

- **`Fn`** : Implémente aussi `FnMut` et `FnOnce`.
- **`FnMut`** : Implémente aussi `FnOnce`.
- Une closure qui implémente `Fn` peut être utilisée où `FnMut` ou `FnOnce` est requis.
- Une closure qui implémente `FnMut` peut être utilisée comme `FnOnce`.

## Mot-clé `move`

Force la closure à prendre ownership des variables capturées, même si elles sont seulement lues :
```rust
let s = String::from("hello");
let closure = move || println!("{}", s); // `s` est moved dans la closure
```

- **Impact sur le Trait** :
  - Si la closure ne mute pas ou ne consomme pas `s`, elle implémente toujours `Fn` (puisque `s` est owned mais pas modifié).
  - Si la closure consomme `s` (ex : `drop(s)`), elle devient `FnOnce`.

<div class="svg-container" style="margin:2rem 0;">
<svg class="cl2-fig2" viewBox="0 0 800 300" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Les trois closures utilisent move, pourtant lire donne Fn, muter donne FnMut et consommer donne FnOnce">
<!-- style -->
<style>
.cl2-fig2{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .cl2-fig2,[data-theme="dark"] .cl2-fig2{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cl2-fig2 .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.cl2-fig2 .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.cl2-fig2 .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif}
.cl2-fig2 .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif}
.cl2-fig2 .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif}
.cl2-fig2 .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="cl2b-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
</defs>
<!-- title -->
<text x="400" y="18" text-anchor="middle" class="ti">Même `move`, même `s` — c'est le corps qui choisit le trait</text>
<text x="400" y="38" text-anchor="middle" class="mut">`move` décide de l'ownership. L'usage de `s` décide Fn / FnMut / FnOnce.</text>
<!-- row1 -->
<rect x="40" y="56" width="330" height="56" rx="6" class="box"/>
<text x="205" y="80" text-anchor="middle" class="tx">move || println!("{}", s)</text>
<text x="205" y="99" text-anchor="middle" class="mut">lit s uniquement</text>
<path d="M370,84 L470,84" class="ln" marker-end="url(#cl2b-arrow-fr)"/>
<rect x="470" y="56" width="290" height="56" rx="6" class="box"/>
<text x="615" y="80" text-anchor="middle" class="tx">Fn</text>
<text x="615" y="99" text-anchor="middle" class="mut">appelable autant de fois que voulu</text>
<!-- row2 -->
<rect x="40" y="126" width="330" height="56" rx="6" class="box"/>
<text x="205" y="150" text-anchor="middle" class="tx">move || s.push_str("!")</text>
<text x="205" y="169" text-anchor="middle" class="mut">mute s (exige `let mut`)</text>
<path d="M370,154 L470,154" class="ln" marker-end="url(#cl2b-arrow-fr)"/>
<rect x="470" y="126" width="290" height="56" rx="6" class="box"/>
<text x="615" y="150" text-anchor="middle" class="tx">FnMut</text>
<text x="615" y="169" text-anchor="middle" class="mut">plusieurs appels, accès exclusif</text>
<!-- row3 -->
<rect x="40" y="196" width="330" height="56" rx="6" class="box"/>
<text x="205" y="220" text-anchor="middle" class="tx">move || drop(s)</text>
<text x="205" y="239" text-anchor="middle" class="mut">consomme s</text>
<path d="M370,224 L470,224" class="ln" marker-end="url(#cl2b-arrow-fr)"/>
<rect x="470" y="196" width="290" height="56" rx="6" class="boxac"/>
<text x="615" y="220" text-anchor="middle" class="tx">FnOnce</text>
<text x="615" y="239" text-anchor="middle" class="mut">le 2e appel ne compile pas</text>
<!-- caption -->
<text x="400" y="282" text-anchor="middle" class="mut">Retire `move` de la ligne 1 : le trait reste Fn — seul le mode de capture change.</text>
</svg>
</div>

## Exemples Détaillés

### 1. Immutable capture (`Fn`)
```rust
let x = 5;
let print_x = || println!("{}", x); // Fn
print_x(); // OK
print_x(); // Toujours valide

// Peut être passée à une fonction attendant Fn, FnMut, ou FnOnce
fn call_fn<F: Fn()>(f: F) {
    f();
}
call_fn(print_x); // ✅ Marche
```

### 2. Mutable capture (`FnMut`)
```rust
let mut x = 5;
let mut add_one = || x += 1; // FnMut
add_one(); // x = 6
add_one(); // x = 7

// Nécessite une référence mutable
fn call_fn_mut<F: FnMut()>(mut f: F) {
    f();
}
call_fn_mut(add_one); // ✅ Marche
```

### 3. Ownership capture (`FnOnce`)
```rust
let x = String::from("hello");
let consume_x = || { drop(x); }; // FnOnce
consume_x(); // OK
// consume_x(); // ❌ ERREUR: closure called after being moved

// Ne peut être appelée qu'une fois
fn call_fn_once<F: FnOnce()>(f: F) {
    f(); // Consomme f
}
call_fn_once(consume_x); // ✅ Marche
```

## Exemples avancés

### Closure avec `move` et Différents Traits

```rust
fn demonstrate_move_semantics() {
    let data = vec![1, 2, 3];
    
    // move mais toujours Fn (lecture seule)
    let read_only = move || {
        println!("Data length: {}", data.len());
    };
    read_only(); // ✅ Peut être appelée plusieurs fois
    read_only(); // ✅ OK
    
    let data2 = vec![4, 5, 6];
    // move et FnOnce (consommation)
    let consume = move || {
        println!("Consuming data: {:?}", data2);
        drop(data2); // Consomme data2
    };
    consume(); // ✅ OK
    // consume(); // ❌ Erreur: déjà consumed
}
```

### Capturing dans des threads

```rust
use std::thread;

fn thread_examples() {
    let counter = std::sync::Arc::new(std::sync::Mutex::new(0));
    
    // Clone pour chaque thread (move nécessaire)
    let handles: Vec<_> = (0..3)
        .map(|i| {
            let counter = counter.clone();
            thread::spawn(move || { // move obligatoire pour threads
                let mut num = counter.lock().unwrap();
                *num += i;
                println!("Thread {} incremented counter", i);
            })
        })
        .collect();
    
    for handle in handles {
        handle.join().unwrap();
    }
    
    println!("Final counter: {}", *counter.lock().unwrap());
}
```

### Closures avec état complexe

```rust
struct Counter {
    count: usize,
    name: String,
}

fn stateful_closures() {
    let mut counter = Counter {
        count: 0,
        name: "MyCounter".to_string(),
    };
    
    // FnMut - modifie l'état
    let mut increment = || {
        counter.count += 1;
        println!("{}: {}", counter.name, counter.count);
    };
    
    increment(); // MyCounter: 1
    increment(); // MyCounter: 2
    
    // Peut encore accéder à counter après les appels
    println!("Counter name: {}", counter.name);
}
```

### Conversion de Traits et Boxed Closures

```rust
fn trait_conversions() {
    // Fn peut être convertie en FnMut ou FnOnce
    let fn_closure = || println!("Hello");
    
    // Toutes ces assignations sont valides
    let as_fn: &dyn Fn() = &fn_closure;
    let as_fn_mut: &dyn FnMut() = &fn_closure;
    let as_fn_once: &dyn FnOnce() = &fn_closure;
    
    // Boxed closures pour storage dynamique
    let mut closures: Vec<Box<dyn FnOnce()>> = vec![
        Box::new(|| println!("First")),
        Box::new(|| println!("Second")),
        Box::new(|| println!("Third")),
    ];
    
    // Consume toutes les closures
    for closure in closures {
        closure();
    }
}
```

## Patterns courants et idiomes

### Iterator avec Closures

```rust
fn iterator_patterns() {
    let numbers = vec![1, 2, 3, 4, 5];
    
    // Fn - lecture seule
    let doubled: Vec<_> = numbers
        .iter()
        .map(|x| x * 2) // Fn
        .collect();
    
    // FnMut - avec état mutable
    let mut sum = 0;
    let running_sums: Vec<_> = numbers
        .iter()
        .map(|x| {
            sum += x; // FnMut - modifie sum
            sum
        })
        .collect();
    
    println!("Doubled: {:?}", doubled);
    println!("Running sums: {:?}", running_sums);
}
```

### Callback System

```rust
struct EventSystem {
    callbacks: Vec<Box<dyn FnMut(&str)>>,
}

impl EventSystem {
    fn new() -> Self {
        Self { callbacks: Vec::new() }
    }
    
    fn register<F>(&mut self, callback: F)
    where
        F: FnMut(&str) + 'static,
    {
        self.callbacks.push(Box::new(callback));
    }
    
    fn trigger(&mut self, event: &str) {
        for callback in &mut self.callbacks {
            callback(event);
        }
    }
}

fn callback_example() {
    let mut system = EventSystem::new();
    
    let mut count = 0;
    system.register(move |event| {
        count += 1; // FnMut - modifie count
        println!("Event {}: {} (#{} call)", event, "processed", count);
    });
    
    system.trigger("user_login");
    system.trigger("user_logout");
}
```

## Performance et cas d'Usage

| Trait   | Overhead      | Cas d'Usage                        |
|---------|---------------|------------------------------------|
| `Fn`    | Zero-cost     | Callbacks read-only, iterators     |
| `FnMut` | Zero-cost     | Transformations avec état          |
| `FnOnce`| Peut allouer  | Opérations one-shot (spawn threads) |

### Benchmarking des Traits

```rust
use std::time::Instant;

fn benchmark_closure_traits() {
    let data = vec![1; 1_000_000];
    
    // Fn - lecture seule
    let start = Instant::now();
    let sum: i32 = data.iter().map(|x| x * 2).sum(); // Fn
    println!("Fn time: {:?}, sum: {}", start.elapsed(), sum);
    
    // FnMut - avec état
    let start = Instant::now();
    let mut multiplier = 2;
    let sum: i32 = data
        .iter()
        .map(|x| {
            let result = x * multiplier;
            multiplier += 0; // FnMut (même si pas de changement réel)
            result
        })
        .sum();
    println!("FnMut time: {:?}, sum: {}", start.elapsed(), sum);
}
```

## Debugging et introspection

### Déterminer le Trait d'une Closure

```rust
fn analyze_closure_trait() {
    let x = 42;
    
    // Helper functions pour tester les traits
    fn accepts_fn<F: Fn()>(_f: F) { println!("Implements Fn"); }
    fn accepts_fn_mut<F: FnMut()>(_f: F) { println!("Implements FnMut"); }
    fn accepts_fn_once<F: FnOnce()>(_f: F) { println!("Implements FnOnce"); }
    
    let closure = || println!("{}", x);
    
    // Test quel trait est implémenté
    accepts_fn(&closure);     // ✅ Fn
    accepts_fn_mut(&closure); // ✅ FnMut (car Fn: FnMut)
    accepts_fn_once(closure); // ✅ FnOnce (car Fn: FnOnce)
}
```

## Points clés

**`Fn`** : Read-only, réutilisable.  
**`FnMut`** : Mutable, réutilisable.  
**`FnOnce`** : Owned, usage unique.  
`move` force l'ownership mais ne change pas le trait—l'usage détermine le trait.

### Règles à retenir

1. **Hiérarchie** : `Fn` ⊂ `FnMut` ⊂ `FnOnce`
2. **Capture** : Le mode de capture détermine le trait minimum
3. **Usage** : Comment tu utilises les variables capturées détermine le trait final
4. **`move`** : Change le mode de capture, pas nécessairement le trait
5. **Performance** : Tous les traits sont zero-cost quand possible

Une closure qui capture `&mut` sans jamais muter n'implémente quand même que `FnMut`. Le trait
suit ce que la capture *autorise*, pas ce que le corps en fait réellement.

## Exemples de débogage courants

### Erreur : "Cannot borrow as mutable"

```rust
// ❌ Erreur commune
fn common_error() {
    let mut x = 5;
    let closure = || x += 1; // FnMut, mais pas déclarée mut
    // closure(); // Erreur: cannot borrow as mutable
}

// ✅ Solution
fn fixed_version() {
    let mut x = 5;
    let mut closure = || x += 1; // Déclarer closure comme mut
    closure(); // ✅ OK
}
```

### Erreur : "Use after move"

```rust
// ❌ Erreur commune
fn move_error() {
    let data = vec![1, 2, 3];
    let closure = move || println!("{:?}", data);
    closure();
    // println!("{:?}", data); // Erreur: use after move
}

// ✅ Solution : Clone avant move
fn move_fixed() {
    let data = vec![1, 2, 3];
    let data_copy = data.clone();
    let closure = move || println!("{:?}", data_copy);
    closure();
    println!("{:?}", data); // ✅ OK, data original toujours accessible
}
```

---

**Conclusion :** Maîtriser `Fn`, `FnMut`, et `FnOnce` te permet d'écrire des closures efficaces et expressives. Le système de traits de Rust garantit la memory safety tout en offrant des abstractions zero-cost quand possible !
