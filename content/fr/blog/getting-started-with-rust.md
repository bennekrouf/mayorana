---
id: "getting-started-with-rust-fr"
title: "Débuter avec Rust"
slug: "getting-started-with-rust-fr"
locale: "fr"
date: "2025-04-15"
author: "Mayorana"  
excerpt: "Introduction à Rust, couvrant l'installation, la syntaxe de base, et un premier projet."
tags:
  - "rust"
  - "programming"
  - "beginners"
  - "tutorial"
---

# Débuter avec Rust

Rust gagne considérablement en popularité parmi les développeurs pour son focus sur la performance, la memory safety, et la concurrence. Si tu es nouveau à Rust, ce guide t'aidera à débuter avec les bases.

<div class="svg-container" style="margin:2rem 0;">
<svg class="rstart-fig" viewBox="0 0 800 220" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Pipeline de démarrage Rust : installer avec rustup, compiler un fichier unique avec rustc, puis scaffolder et builder un vrai projet avec cargo">
<style>
.rstart-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .rstart-fig,[data-theme="dark"] .rstart-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.rstart-fig text{font-family:ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.rstart-fig .title{font-size:14px;font-weight:700}
.rstart-fig .body{font-size:12px;font-weight:600}
.rstart-fig .cap{font-size:11px;fill:var(--mut)}
.rstart-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.rstart-fig .acbox{fill:var(--ac);stroke:var(--ac)}
.rstart-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="rstart-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"></path>
</marker>
</defs>
<!-- step 1 -->
<rect class="box" x="20" y="60" width="170" height="90" rx="8"></rect>
<text x="105" y="90" text-anchor="middle" class="title">rustup</text>
<text x="105" y="110" text-anchor="middle" class="cap">installe la toolchain</text>
<text x="105" y="125" text-anchor="middle" class="cap">via sh.rustup.rs</text>
<!-- step 2 -->
<rect class="box" x="210" y="60" width="170" height="90" rx="8"></rect>
<text x="295" y="90" text-anchor="middle" class="title">rustc hello.rs</text>
<text x="295" y="110" text-anchor="middle" class="cap">compile un seul fichier</text>
<text x="295" y="125" text-anchor="middle" class="cap">./hello pour exécuter</text>
<!-- step 3 -->
<rect class="box" x="400" y="60" width="170" height="90" rx="8"></rect>
<text x="485" y="90" text-anchor="middle" class="title">cargo new</text>
<text x="485" y="110" text-anchor="middle" class="cap">scaffold le projet</text>
<text x="485" y="125" text-anchor="middle" class="cap">Cargo.toml + src/</text>
<!-- step 4 accent -->
<rect class="acbox" x="590" y="60" width="170" height="90" rx="8"></rect>
<text x="675" y="90" text-anchor="middle" class="title" fill="#ffffff">cargo build/run</text>
<text x="675" y="110" text-anchor="middle" class="cap" fill="#ffffff">gère les dépendances</text>
<text x="675" y="125" text-anchor="middle" class="cap" fill="#ffffff">et build pour toi</text>
<!-- arrows -->
<path class="ln" d="M190,105 L210,105" marker-end="url(#rstart-arrow-fr)"></path>
<path class="ln" d="M380,105 L400,105" marker-end="url(#rstart-arrow-fr)"></path>
<path class="ln" d="M570,105 L590,105" marker-end="url(#rstart-arrow-fr)"></path>
<!-- caption -->
<text x="400" y="195" text-anchor="middle" class="cap">rustc fonctionne pour un fichier — cargo est le flux de travail quotidien pour un vrai projet</text>
</svg>
</div>

## Configuration de Ton Environnement

D'abord, tu dois installer Rust. La façon la plus simple est d'utiliser rustup, l'installateur de toolchain Rust :

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Cette commande téléchargera un script et démarrera le processus d'installation.

### Vérification de l'Installation

Une fois l'installation terminée, vérifie que tout fonctionne correctement :

```bash
rustc --version
cargo --version
```

Tu dois voir les numéros de version de Rust et Cargo s'afficher.

### Configuration de l'Éditeur

Pour une meilleure expérience de développement, configure ton éditeur préféré :

**VS Code :**
- Installe l'extension "rust-analyzer"
- Installe l'extension "CodeLLDB" pour le debugging

**IntelliJ/CLion :**
- Installe le plugin "Rust"

**Vim/Neovim :**
- Utilise rust.vim et coc-rust-analyzer

## Ton Premier Programme Rust

Créons un simple programme "Hello, World!". Créé un nouveau fichier appelé `hello.rs` avec le contenu suivant :

```rust
fn main() {
    println!("Hello, World!");
}
```

Pour compiler et exécuter ce programme, utilise les commandes suivantes :

```bash
rustc hello.rs
./hello  # Sur Windows: hello.exe
```

### Anatomie du Programme

Analysons ce simple programme :

```rust
fn main() {           // Fonction principale - point d'entrée du programme
    println!(         // Macro pour imprimer du texte
        "Hello, World!" // String à imprimer
    );                // Point-virgule requis pour terminer l'expression
}
```

**Points importants :**
- `fn main()` est la fonction principale, exécutée en premier
- `println!` est une **macro** (note le `!`) qui imprime du texte
- Les déclarations se terminent par un point-virgule `;`

## Comprendre Cargo

Cargo est le système de build et gestionnaire de packages de Rust. Il gère de nombreuses tâches comme compilateur ton code, télécharger des libraries, et compilateur ces libraries.

### Créer un Nouveau Projet

Pour créer un nouveau projet avec Cargo :

```bash
cargo new hello_cargo
cd hello_cargo
```

Ceci crée un nouveau répertoire appelé `hello_cargo` avec la structure suivante :

```
hello_cargo/
├── Cargo.toml        # Métadonnées du projet et dépendances
├── Cargo.lock        # Verrouillage des versions (généré automatiquement)
├── .gitignore        # Fichier Git ignore
└── src/
    └── main.rs       # Code source principal
```

### Le Fichier Cargo.toml

Le fichier `Cargo.toml` contient les métadonnées de ton projet :

```toml
[package]
name = "hello_cargo"
version = "0.1.0"
edition = "2021"        # Édition de Rust à utiliser

[dependencies]
# Les dépendances seront listées ici
```

### Commandes Cargo Essentielles

```bash
cargo build           # Compile le projet (debug mode)
cargo build --release # Compile en mode optimisé (release)
cargo run             # Compile et exécute le projet
cargo check           # Vérifie que le code compile sans générer l'exécutable
cargo clean           # Nettoie les fichiers de build
cargo test            # Exécute les tests
cargo doc             # Génère la documentation
```

### Exemple Pratique avec une Dépendance

Modifions notre projet pour utiliser une dépendance externe. Éditons `Cargo.toml` :

```toml
[package]
name = "hello_cargo"
version = "0.1.0"
edition = "2021"

[dependencies]
rand = "0.8"
```

Maintenant, modifions `src/main.rs` :

```rust
use rand::Rng;  // Importer le trait Rng

fn main() {
    println!("Hello, World!");
    
    let secret_number = rand::thread_rng().gen_range(1..=100);
    println!("Le nombre secret est : {}", secret_number);
}
```

Exécute avec `cargo run` - Cargo téléchargera et compilera automatiquement la dépendance `rand`.

## Concepts Clés de Rust

### Variables et Mutabilité

Par défaut, les variables en Rust sont **immutables** :

```rust
fn main() {
    let x = 5;
    println!("La valeur de x est : {}", x);
    
    // x = 6; // ❌ ERREUR : cannot assign twice to immutable variable
}
```

Pour rendre une variable mutable, utilise le mot-clé `mut` :

```rust
fn main() {
    let mut y = 5;
    println!("La valeur de y est : {}", y);
    
    y = 6; // ✅ OK : y est mutable
    println!("La valeur de y est maintenant : {}", y);
}
```

### Constantes vs Variables

```rust
const PI: f64 = 3.14159;  // Constante - toujours immutable

fn main() {
    let x = 5;        // Variable immutable
    let mut y = 10;   // Variable mutable
    
    println!("PI = {}, x = {}, y = {}", PI, x, y);
}
```

### Shadowing (Masquage)

Rust permet de "masquer" une variable en déclarant une nouvelle variable avec le même nom :

```rust
fn main() {
    let x = 5;
    let x = x + 1;    // Nouveau x qui masque le précédent
    let x = x * 2;    // Encore un nouveau x
    
    println!("La valeur de x est : {}", x); // 12
    
    // On peut même changer le type
    let spaces = "   ";        // &str
    let spaces = spaces.len(); // usize
    println!("Nombre d'espaces : {}", spaces);
}
```

### Types de Données de Base

```rust
fn main() {
    // Integers
    let signed: i32 = -42;      // 32-bit signé
    let unsigned: u32 = 42;     // 32-bit non-signé
    
    // Floats
    let pi: f64 = 3.14159;      // 64-bit (default)
    let e: f32 = 2.718;         // 32-bit
    
    // Boolean
    let is_rust_awesome: bool = true;
    
    // Character (Unicode)
    let heart: char = '💖';
    
    // String slice
    let greeting: &str = "Bonjour";
    
    // String owned
    let name: String = String::from("Rust");
    
    println!("i32: {}, u32: {}, f64: {}, f32: {}", signed, unsigned, pi, e);
    println!("bool: {}, char: {}, &str: {}, String: {}", 
             is_rust_awesome, heart, greeting, name);
}
```

### Tuples et Arrays

```rust
fn main() {
    // Tuple - types mixtes, taille fixe
    let person: (String, i32, bool) = (String::from("Alice"), 25, true);
    let (name, age, is_student) = person; // Destructuring
    
    println!("{} a {} ans, étudiant: {}", name, age, is_student);
    
    // Access par index
    let coordinates = (3.0, 4.0);
    println!("x: {}, y: {}", coordinates.0, coordinates.1);
    
    // Array - même type, taille fixe
    let numbers: [i32; 5] = [1, 2, 3, 4, 5];
    let first = numbers[0];
    let length = numbers.len();
    
    println!("Premier élément: {}, longueur: {}", first, length);
    
    // Array avec valeur répétée
    let zeros = [0; 10]; // [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    println!("Array de zéros: {:?}", zeros);
}
```

## Ownership (Propriété)

L'ownership est la fonctionnalité la plus unique de Rust et permet la memory safety sans garbage collection. Les règles principales sont :

1. **Chaque valeur en Rust a une variable qui en est le propriétaire**
2. **Il ne peut y avoir qu'un seul propriétaire à la fois**
3. **Quand le propriétaire sort du scope, la valeur sera supprimée**

### Exemple de Move

```rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1; // ✅ s1 est "moved" vers s2, s1 n'est plus valide
    
    // println!("{}", s1); // ❌ ERREUR : borrow of moved value
    println!("{}", s2);     // ✅ OK
}
```

### Clone pour Copier

```rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1.clone(); // ✅ Copie profonde explicite
    
    println!("s1 = {}, s2 = {}", s1, s2); // ✅ Les deux sont valides
}
```

### Copy Types

Certains types implémentent le trait `Copy` et sont copiés automatiquement :

```rust
fn main() {
    let x = 5;       // i32 implémente Copy
    let y = x;       // x est copié vers y
    
    println!("x = {}, y = {}", x, y); // ✅ Les deux sont valides
    
    // Types qui implémentent Copy :
    // - Tous les types entiers (i32, u32, etc.)
    // - Types booléens (bool)
    // - Types flottants (f32, f64)
    // - Character (char)
    // - Tuples contenant uniquement des types Copy
}
```

### Ownership et Functions

```rust
fn main() {
    let s = String::from("hello");
    
    takes_ownership(s);              // s est moved dans la fonction
    // println!("{}", s);            // ❌ ERREUR : s n'est plus valide
    
    let x = 5;
    makes_copy(x);                   // x est copié dans la fonction
    println!("{}", x);               // ✅ OK : x est encore valide
}

fn takes_ownership(some_string: String) { // some_string entre dans le scope
    println!("{}", some_string);
} // some_string sort du scope et est supprimé

fn makes_copy(some_integer: i32) { // some_integer entre dans le scope
    println!("{}", some_integer);
} // some_integer sort du scope, mais rien de spécial ne se passe
```

### Références et Emprunts

Pour utiliser une valeur sans prendre l'ownership, utilise les **références** :

```rust
fn main() {
    let s1 = String::from("hello");
    
    let len = calculate_length(&s1); // Passer une référence
    
    println!("La longueur de '{}' est {}.", s1, len); // s1 toujours valide
}

fn calculate_length(s: &String) -> usize { // s est une référence à String
    s.len()
} // s sort du scope, mais ne possède pas la donnée, rien n'est supprimé
```

### Références Mutables

```rust
fn main() {
    let mut s = String::from("hello");
    
    change(&mut s); // Passer une référence mutable
    
    println!("{}", s);
}

fn change(some_string: &mut String) {
    some_string.push_str(", world");
}
```

**Règles des références :**
- Une seule référence mutable OU plusieurs références immutables
- Les références doivent toujours être valides

## Structures de Contrôle

### Conditions avec if

```rust
fn main() {
    let number = 6;
    
    if number % 4 == 0 {
        println!("Le nombre est divisible par 4");
    } else if number % 3 == 0 {
        println!("Le nombre est divisible par 3");
    } else if number % 2 == 0 {
        println!("Le nombre est divisible par 2");
    } else {
        println!("Le nombre n'est pas divisible par 4, 3, ou 2");
    }
    
    // if est une expression
    let condition = true;
    let number = if condition { 5 } else { 6 };
    println!("La valeur du nombre est : {}", number);
}
```

### Boucles

```rust
fn main() {
    // Boucle infinie
    let mut counter = 0;
    let result = loop {
        counter += 1;
        
        if counter == 10 {
            break counter * 2; // Retourner une valeur avec break
        }
    };
    println!("Le résultat est {}", result);
    
    // Boucle while
    let mut number = 3;
    while number != 0 {
        println!("{}!", number);
        number -= 1;
    }
    println!("LIFTOFF!!!");
    
    // Boucle for
    let a = [10, 20, 30, 40, 50];
    for element in a {
        println!("La valeur est : {}", element);
    }
    
    // Range avec for
    for number in (1..4).rev() {
        println!("{}!", number);
    }
    println!("LIFTOFF!!!");
}
```

## Functions

```rust
fn main() {
    println!("Hello, world!");
    
    another_function(5);
    print_labeled_measurement(5, 'h');
    
    let x = plus_one(5);
    println!("La valeur de x est : {}", x);
}

fn another_function(x: i32) {
    println!("La valeur de x est : {}", x);
}

fn print_labeled_measurement(value: i32, unit_label: char) {
    println!("La mesure est : {}{}", value, unit_label);
}

// Function avec valeur de retour
fn plus_one(x: i32) -> i32 {
    x + 1 // Expression sans point-virgule = valeur de retour
}

// Avec return explicite
fn minus_one(x: i32) -> i32 {
    return x - 1; // return explicite avec point-virgule
}
```

## Gestion d'Erreur de Base

### Option

```rust
fn main() {
    let some_number = Some(5);
    let some_string = Some("a string");
    let absent_number: Option<i32> = None;
    
    // Pattern matching avec match
    match some_number {
        Some(value) => println!("La valeur est {}", value),
        None => println!("Aucune valeur"),
    }
    
    // Avec if let
    if let Some(value) = some_number {
        println!("La valeur est {}", value);
    }
}
```

### Result

```rust
use std::fs::File;
use std::io::ErrorKind;

fn main() {
    // Gestion d'erreur avec match
    let file_result = File::open("hello.txt");
    
    let _file = match file_result {
        Ok(file) => file,
        Err(error) => match error.kind() {
            ErrorKind::NotFound => {
                println!("Fichier non trouvé !");
                return;
            }
            other_error => {
                println!("Problème à l'ouverture du fichier : {:?}", other_error);
                return;
            }
        },
    };
    
    // Avec unwrap_or_else
    let _file = File::open("hello.txt").unwrap_or_else(|error| {
        if error.kind() == ErrorKind::NotFound {
            println!("Création du fichier...");
            File::create("hello.txt").unwrap_or_else(|error| {
                panic!("Problème lors de la création du fichier : {:?}", error);
            })
        } else {
            panic!("Problème à l'ouverture du fichier : {:?}", error);
        }
    });
}
```

## Premier Projet Pratique : Jeu de Devinette

Créons un jeu simple pour mettre en pratique ce que nous avons appris :

```rust
use rand::Rng;
use std::cmp::Ordering;
use std::io;

fn main() {
    println!("Devine le nombre !");
    
    let secret_number = rand::thread_rng().gen_range(1..=100);
    
    loop {
        println!("Saisie quelque chose.");
        
        let mut guess = String::new();
        
        io::stdin()
            .read_line(&mut guess)
            .expect("Échec de la lecture de la ligne");
            
        let guess: u32 = match guess.trim().parse() {
            Ok(num) => num,
            Err(_) => {
                println!("Entre un nombre valide !");
                continue;
            }
        };
        
        println!("Tu as deviné : {}", guess);
        
        match guess.cmp(&secret_number) {
            Ordering::Less => println!("Trop petit !"),
            Ordering::Greater => println!("Trop grand !"),
            Ordering::Equal => {
                println!("Tu as gagné !");
                break;
            }
        }
    }
}
```

Pour ce projet, ajoute dans ton `Cargo.toml` :

```toml
[dependencies]
rand = "0.8"
```

## Outils Utiles

### Formatage du Code

```bash
cargo fmt  # Formate automatiquement ton code
```

### Linting

```bash
cargo clippy  # Analyse statique pour améliorer ton code
```

### Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn it_works() {
        let result = 2 + 2;
        assert_eq!(result, 4);
    }
    
    #[test]
    #[should_panic]
    fn another() {
        panic!("Make this test fail");
    }
}
```

Exécute avec `cargo test`.

## Prochaines Étapes

Maintenant que tu as les bases, Essaie de construire un petit projet pour pratiquer vos compétences. Voici quelques suggestions :

### Projets Débutants
1. **Calculatrice en ligne de commande**
2. **Convertisseur de température**
3. **Gestionnaire de liste de tâches simple**
4. **Générateur de mots de passe**

### Ressources d'Apprentissage

La documentation Rust est excellente pour approfondir vos connaissances :

- [Le Livre Rust (The Rust Book)](https://doc.rust-lang.org/book/) - Guide complet et officiel
- [Rust by Example](https://doc.rust-lang.org/rust-by-example/) - Apprendre par l'exemple
- [Rustlings](https://github.com/rust-lang/rustlings) - Petits exercices pratiques
- [Rust Cookbook](https://rust-lang-nursery.github.io/rust-cookbook/) - Recettes de code
- [Comprehensive Rust](https://google.github.io/comprehensive-rust/) - Cours Google

### Communauté

- [Forum officiel Rust](https://users.rust-lang.org/)
- [Reddit r/rust](https://www.reddit.com/r/rust/)
- [Discord Rust Community](https://discord.gg/rust-lang-community)
- [This Week in Rust](https://this-week-in-rust.org/) - Newsletter hebdomadaire

### Concepts Avancés à Explorer Ensuite

1. **Structs et Enums**
2. **Pattern Matching avancé**
3. **Traits et Generics**
4. **Gestion des erreurs avancée**
5. **Concurrence et parallélisme**
6. **Macros**
7. **Unsafe Rust**

Bon codage avec Rust ! 🦀

---

**Astuce :** N'hésite pas à expérimenter avec le code. Rust a un excellent compilateur qui te guidera avec des messages d'erreur très informatifs. Chaque erreur est une opportunité d'apprentissage !
