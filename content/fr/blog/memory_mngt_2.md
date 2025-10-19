---
id: memory-safety-rust
title: Comment Rust assure la sécurité mémoire sans garbage collector ?
slug: memory-safety-rust
author: mayo
locale: fr
excerpt: Mémoire et chaînes de caractères en Rust

tags:
  - rust
  - mémoire
  - ownership
  - borrowing
  - lifetimes
date: '2025-07-31'
---
# Comment Rust assure la sécurité mémoire sans garbage collector ?
Rust garantit la sécurité mémoire à la compilation avec trois mécanismes : ownership, borrowing et lifetimes. Ça évite les fuites mémoire, les data races et les pointeurs pendants sans avoir besoin d'un garbage collector.

## Le problème du C/C++
C et C++ donnent un contrôle total sur la mémoire, mais ça mène à des problèmes critiques :

**Pointeurs pendants** :
```c
char* get_string() {
    char buffer[100] = "hello"; // Alloué sur la pile
    return buffer;              // Retourne un pointeur vers de la mémoire libérée
} // ERREUR : buffer est détruit ici

int* ptr = malloc(sizeof(int));
free(ptr);
*ptr = 42; // ERREUR : Utilisation après libération
```

**Fuites mémoire** :
```cpp
void leak_memory() {
    int* data = new int[1000]; // Allocation sur le tas
    if (some_condition) {
        return; // ERREUR : La mémoire n'est jamais libérée
    }
    delete[] data; // Libéré seulement dans le cas normal
}
```

**Double libération** :
```c
int* ptr = malloc(sizeof(int));
free(ptr);
free(ptr); // ERREUR : Double libération = comportement indéfini
```

## L'approche garbage collection de Java
Java résout ces problèmes avec la gestion automatique de la mémoire :

**✅ Avantages** :
- Pas de pointeurs pendants (les références deviennent null quand les objets sont collectés)
- Pas de fuites mémoire pour les objets accessibles
- Pas d'erreur de double libération

**❌ Inconvénients** :
- **Coût à l'exécution** : Les pauses du GC créent une latence imprévisible
- **Surcoût mémoire** : Métadonnées supplémentaires pour tracker les objets
- **Pas de nettoyage déterministe** : Les objets sont libérés quand le GC veut, pas immédiatement

```java
// Java - mémoire gérée automatiquement
String createString() {
    String s = new String("hello"); // Alloué sur le tas
    return s; // Safe : le GC nettoiera quand plus de référence
} // Pas besoin de nettoyage explicite
```

## 1. Règles d'ownership
- Chaque valeur en Rust a un **propriétaire unique**.
- Quand le propriétaire sort de scope, la valeur est **supprimée** (mémoire libérée).
- Évite les **doubles libérations** et les **fuites mémoire**.

**Exemple** :
```rust
fn main() {
    let s = String::from("hello"); // `s` possède la chaîne
    takes_ownership(s);            // Ownership transféré → `s` est invalide ici
    // println!("{}", s); // ERREUR : emprunt d'une valeur déplacée
}

fn takes_ownership(s: String) { 
    println!("{}", s); 
} // `s` est supprimé ici
```

## 2. Borrowing et références
- Permet des emprunts **immutables** (`&T`) ou **mutables** (`&mut T`).
- Règles imposées :
  - Soit **une référence mutable** soit **plusieurs références immutables** (pas de data races).
  - Les références doivent toujours être **valides** (pas de pointeurs pendants).

**Exemple** :
```rust
fn main() {
    let mut s = String::from("hello");
    let r1 = &s;     // OK : Emprunt immutable
    let r2 = &s;     // OK : Autre emprunt immutable
    // let r3 = &mut s; // ERREUR : Impossible d'emprunter comme mutable pendant un emprunt immutable
    println!("{}, {}", r1, r2);
}
```

## 3. Lifetimes
- S'assure que les références **ne survivent jamais** aux données qu'elles pointent.
- Évite les **références pendantes**.

**Exemple** :
```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

fn main() {
    let s1 = String::from("hello");
    let result;
    {
        let s2 = String::from("world");
        result = longest(&s1, &s2); // ERREUR : `s2` ne vit pas assez longtemps
    }
    // println!("{}", result); // `result` serait invalide ici
}
```

## Pourquoi pas de garbage collector ?
- **Abstractions sans coût** : Pas de surcharge à l'exécution.
- **Performance prévisible** : La mémoire est libérée de façon déterministe.
- **Pas de pauses** : Contrairement aux langages avec GC (Java, Go).

## Points clés
✅ **Ownership** : Évite les fuites mémoire.  
✅ **Borrowing** : Évite les data races.  
✅ **Lifetimes** : Évite les pointeurs pendants.

Le modèle de Rust assure la sécurité mémoire sans vérifications à l'exécution, ce qui le rend à la fois sûr et rapide.