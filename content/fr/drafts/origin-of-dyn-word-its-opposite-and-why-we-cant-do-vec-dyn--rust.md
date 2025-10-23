---
id: dyn-mot-cle-rust-fr
title: 'Le mot-clé `dyn` : Origines, Signification et Limitations'
slug: dyn-mot-cle-rust-fr
locale: fr
date: '2025-10-23'
author: mayo
excerpt: >-
  Exploration approfondie du mot-clé `dyn` en Rust, son origine, son opposé
  statique, et pourquoi Vec<dyn Trait> n'est pas possible
content_focus: 'Polymorphisme dynamique, traits, dispatch, limitations de taille'
technical_level: Discussion technique expert
tags:
  - rust
  - traits
  - polymorphisme
  - pointeurs-intelligents
---

# Le mot-clé `dyn` : Origines, Signification et Limitations

En Rust, le mot-clé `dyn` est au cœur du polymorphisme dynamique, permettant d'écrire du code flexible qui peut travailler avec différents types à l'exécution. Mais d'où vient ce mot mystérieux, comment fonctionne-t-il, et pourquoi certaines constructions comme `Vec<dyn Trait>` sont-elles impossibles ? Plongeons dans les mécanismes internes du langage.

## Origine et Signification de `dyn`

Le mot `dyn` est l'abréviation de "dynamic" (dynamique en anglais). Il a été introduit dans l'édition 2018 de Rust pour remplacer la syntaxe des traits objets sans mot-clé explicite, rendant le code plus clair et explicite.

### Évolution Historique

Avant Rust 2018, les traits objets s'écrivaient simplement avec `&Trait` :

```rust
// Ancienne syntaxe (avant 2018)
fn process_trait(obj: &Trait) {
    obj.do_something();
}
```

Avec Rust 2018, `dyn` est devenu obligatoire :

```rust
// Nouvelle syntaxe (2018+)
fn process_trait(obj: &dyn Trait) {
    obj.do_something();
}
```

Cette évolution a permis de distinguer clairement le polymorphisme statique (génériques) du polymorphisme dynamique (traits objets).

### Pourquoi "dyn" ?

Le choix de `dyn` reflète la nature du **dispatch dynamique** (dynamic dispatch). Contrairement au polymorphisme statique où la méthode à appeler est déterminée à la compilation, avec `dyn`, la résolution se fait à l'exécution via une table de fonctions virtuelles (vtable).

```rust
trait Animal {
    fn faire_du_bruit(&self);
}

struct Chien;
struct Chat;

impl Animal for Chien {
    fn faire_du_bruit(&self) {
        println!("Wouf!");
    }
}

impl Animal for Chat {
    fn faire_du_bruit(&self) {
        println!("Miaou!");
    }
}

fn faire_parler(animal: &dyn Animal) {
    animal.faire_du_bruit(); // Résolution à l'exécution
}
```

## L'Opposé de `dyn` : Le Polymorphisme Statique

L'opposé conceptuel de `dyn` n'est pas un mot-clé spécifique, mais plutôt l'ensemble des mécanismes de polymorphisme statique :

### Génériques avec Traits Liés

```rust
fn faire_parler_generique<T: Animal>(animal: &T) {
    animal.faire_du_bruit(); // Résolution à la compilation
}
```

### Impl Trait

```rust
fn creer_animal() -> impl Animal {
    Chien {} // Type concret connu à la compilation
}
```

### Tableau Comparatif

| Aspect | `dyn Trait` (Dynamique) | Génériques (Statique) |
|--------|------------------------|----------------------|
| Résolution | Exécution (vtable) | Compilation (monomorphisation) |
| Performance | Overhead d'indirection | Optimisations maximales |
| Flexibilité | Types multiples à l'exécution | Type unique à la compilation |
| Taille | Pointeur gras (data + vtable) | Taille du type concret |

## Le Problème de `Vec<dyn Trait>`

La limitation la plus surprenante pour les nouveaux Rustacés est l'impossibilité d'écrire `Vec<dyn Trait>`. Explorons les raisons techniques.

### Le Système de Taille (Sized Trait)

En Rust, tous les types doivent avoir une taille connue à la compilation. C'est ce qu'exprime le trait `Sized`. Or, `dyn Trait` n'est pas `Sized`.

```rust
// Ceci ne compile PAS !
// let v: Vec<dyn Animal> = vec![];
```

### Pourquoi `dyn Trait` n'est pas Sized ?

Un trait objet `dyn Trait` peut représenter n'importe quel type implémentant le trait, et ces types peuvent avoir des tailles différentes :

```rust
struct PetitChien; // Taille : 0 octets
struct GrosChien { 
    nom: String,   // Taille : 24 octets
    age: u32,      // + 4 octets
}
```

Comment stocker ces types de tailles différentes dans un `Vec` qui nécessite des éléments de taille uniforme ?

### Les Solutions Pratiques

#### 1. Pointeurs Intelligents (Box, Rc, Arc)

```rust
let animaux: Vec<Box<dyn Animal>> = vec![
    Box::new(Chien),
    Box::new(Chat),
];
```

#### 2. Références avec Lifetime

```rust
fn traiter_animaux(animaux: &[&dyn Animal]) {
    for animal in animaux {
        animal.faire_du_bruit();
    }
}
```

#### 3. Enum (Alternative Statique)

```rust
enum AnimalEnum {
    Chien(Chien),
    Chat(Chat),
}

impl Animal for AnimalEnum {
    fn faire_du_bruit(&self) {
        match self {
            AnimalEnum::Chien(chien) => chien.faire_du_bruit(),
            AnimalEnum::Chat(chat) => chat.faire_du_bruit(),
        }
    }
}
```

### Mécanisme des Pointeurs Gras

Quand vous utilisez `Box<dyn Trait>`, vous utilisez un **pointeur gras** (fat pointer) :

```rust
let chien: Box<dyn Animal> = Box::new(Chien);
```

Ce pointeur contient :
- Un pointeur vers les données (Chien)
- Un pointeur vers la vtable (table des méthodes Animal pour Chien)

## Implications des Choix de Conception

### Considérations de Performance

```rust
// Dispatch statique - plus rapide
fn benchmark_statique<T: Animal>(animaux: &[T]) {
    for animal in animaux {
        animal.faire_du_bruit(); // Appel direct
    }
}

// Dispatch dynamique - plus flexible
fn benchmark_dynamique(animaux: &[&dyn Animal]) {
    for animal in animaux {
        animal.faire_du_bruit(); // Appel via vtable
    }
}
```

### Trade-off Flexibilité vs Performance

Le choix entre `dyn` et les génériques représente un compromis classique :

- **Génériques** : Performance maximale, moins de flexibilité
- **`dyn`** : Flexibilité maximale, léger overhead

## Points Clés
✅ `dyn` signifie "dynamic" et permet le polymorphisme à l'exécution via les vtables
✅ L'opposé de `dyn` est le polymorphisme statique (génériques, impl Trait)
✅ `Vec<dyn Trait>` est impossible car `dyn Trait` n'a pas de taille connue à la compilation
✅ Utilisez `Box<dyn Trait>`, `&dyn Trait` ou des enums comme alternatives pratiques

**Impact Réel** : Cette compréhension permet d'architecturer des systèmes Rust efficaces qui utilisent le bon type de polymorphisme selon les besoins - statique pour la performance critique, dynamique pour l'extensibilité et l'abstraction runtime.
