---
id: sized-unsized-bounds-flexibility
title: "Écrire une fonction qui accepte à la fois des types sized (ex : [u8; 16]) et unsized (ex : [u8] ou dyn Trait) avec un bound ?Sized"
slug: sized-unsized-bounds-flexibility
locale: "fr"
author: mayo
excerpt: >-
  Comprendre le rôle des bounds ?Sized dans les définitions de traits Rust et les exploiter pour créer des fonctions flexibles qui fonctionnent efficacement avec des types sized et unsized
content_focus: "Sized et ?Sized"
technical_level: "Discussion technique experte"
category: rust
tags:
  - rust
  - sized
  - unsized
  - bounds
  - traits
  - generics
---

# Quelle est la signification du bound ?Sized dans les définitions de traits, et comment l'utiliserais-tu pour écrire une fonction qui accepte à la fois des types sized (ex : [u8; 16]) et des types unsized (ex : [u8] ou dyn Trait) ?

Le bound `?Sized` dans les définitions de traits Rust relâche la contrainte `Sized` par défaut sur les types génériques, permettant à une fonction ou trait de fonctionner avec à la fois des types sized (taille connue pendant la compilation, comme `[u8; 16]`) et des types unsized (ex : `[u8]`, `str`, `dyn Trait`). Dans une bibliothèque de sérialisation de données, j'utiliserais `?Sized` pour écrire une fonction flexible qui traite à la fois les tableaux fixes et les slices dynamiques efficacement, améliorant la fonctionnalité sans sacrifier la performance.

## Rôle de ?Sized

- **Sized par Défaut** : Par défaut, les paramètres génériques (`T`) impliquent `T: Sized`, signifiant que la taille du type doit être connue pendant la compilation. Cela exclut les types unsized comme les slices (`[u8]`), chaînes (`str`), ou trait objects (`dyn Trait`), qui n'existent que derrière des pointeurs (ex : `&[u8]`, `Box<dyn Trait>`).
- **Signification de ?Sized** : Ajouter `T: ?Sized` se retire de cette exigence, permettant à `T` d'être soit sized soit unsized. Cela active une applicabilité plus large, car la fonction peut accepter des références vers des types unsized (`&T`) ou des types sized directement.

## Exemple : Fonction de Sérialisation

Dans une bibliothèque de sérialisation, je définirais une fonction pour calculer une checksum sur n'importe quelles données contiguës de type byte :

```rust
trait Checksum {
    fn checksum(&self) -> u32;
}

fn compute_checksum<T: ?Sized + Checksum>(data: &T) -> u32 {
    data.checksum()
}

// Implémentations
struct FixedBuffer([u8; 16]);
struct DynamicBuffer([u8]);

impl Checksum for FixedBuffer {
    fn checksum(&self) -> u32 {
        self.0.iter().fold(0, |acc, &x| acc.wrapping_add(x as u32))
    }
}

impl Checksum for [u8] { // Type unsized
    fn checksum(&self) -> u32 {
        self.iter().fold(0, |acc, &x| acc.wrapping_add(x as u32))
    }
}

// Usage
let fixed = FixedBuffer([1; 16]);
let dynamic = vec![2; 32];
let fixed_sum = compute_checksum(&fixed);        // Sized: [u8; 16]
let dynamic_sum = compute_checksum(&dynamic[..]); // Unsized: [u8]
```

## Comment ?Sized Améliore la Fonctionnalité

### Flexibilité
Sans `?Sized`, `compute_checksum` rejetterait `&[u8]` :

```rust
fn compute_checksum<T: Sized + Checksum>(data: &T) -> u32 { /* ... */ }
// Erreur : [u8] n'implémente pas Sized
```

Avec `T: ?Sized`, elle accepte :
- **Sized** : `FixedBuffer` (16 octets connus pendant la compilation).
- **Unsized** : `[u8]` (taille connue seulement à l'exécution via la longueur).

### API Unifiée
Une fonction gère à la fois les tableaux fixes (`[u8; 16]`) et les slices (`[u8]`), plus les trait objects (`dyn Checksum`) si nécessaire. Cela réduit la duplication de code dans une bibliothèque de sérialisation traitant des entrées diverses.

## Maintenir l'Efficacité

- **Basé sur Références** : Utiliser `&T` évite de posséder `T` ou de nécessiter `Box<T>`. Pour les types unsized, cela exploite leur indirection inhérente (ex : `&[u8]` est un fat pointer : données + longueur), n'ajoutant aucun coût supplémentaire.
- **Dispatch Statique** : `T: ?Sized + Checksum` assure la monomorphization pour chaque `T`. Les appels `checksum` sont inlinés :
  - Pour `FixedBuffer` : Accès direct au tableau, unrollé si petit.
  - Pour `[u8]` : Itération de slice, potentiellement vectorisée par LLVM.
- **Pas d'Overhead** : Le bound `?Sized` lui-même n'ajoute aucun coût à l'exécution—c'est un relâchement pendant la compilation. La vtable (si `dyn Checksum`) n'est utilisée que si explicitement choisie, pas ici.

## Détails d'Implémentation

- **Trait Bound** : `Checksum` définit le comportement, implémenté pour les types sized (`FixedBuffer`) et unsized (`[u8]`). `?Sized` permet à `compute_checksum` de les relier.
- **Sécurité** : `&T` assure la sémantique de borrowing, prévenant les problèmes d'ownership avec les types unsized (qui ne peuvent pas être déplacés directement).

## Compromis

- **Indirection** : Les types unsized nécessitent une référence ou smart pointer (`&T`, `Box<T>`), ajoutant une couche vs `T` direct pour les types sized. Dans un chemin chaud, cela pourrait compter (ex : pointer chasing).
- **Complexité** : Les appelants doivent comprendre `&T` vs `T`. Je documenterais que `compute_checksum` prend des références pour l'universalité.
- **Alternative** : Si seules les slices sont nécessaires, `&[u8]` directement pourrait suffire, mais `?Sized` supporte un usage plus large (ex : `dyn Trait`).

## Vérification

### Test de Compilation
S'assurer que les types sized et unsized fonctionnent :

```rust
assert_eq!(compute_checksum(&FixedBuffer([1; 16])), 16);
assert_eq!(compute_checksum(&vec![2; 32][..]), 64);
```

### Benchmark
Utilise criterion pour vérifier l'overhead :

```rust
use criterion::{black_box, Criterion};
fn bench(c: &mut Criterion) {
    let fixed = FixedBuffer([1; 16]);
    let dynamic = vec![2; 32];
    c.bench_function("fixed", |b| b.iter(|| compute_checksum(black_box(&fixed))));
    c.bench_function("dynamic", |b| b.iter(|| compute_checksum(black_box(&dynamic[..]))));
}
```

Attends-toi à des performances similaires aux appels directs, avec inlining.

## Exemple Avancé : Support de Trait Objects

Pour étendre encore plus la flexibilité :

```rust
// Permet aussi les trait objects
fn compute_any_checksum(data: &dyn Checksum) -> u32 {
    data.checksum()
}

// Utilisation avec dispatch dynamique
let items: Vec<Box<dyn Checksum>> = vec![
    Box::new(FixedBuffer([1; 16])),
    Box::new(vec![2; 8]),
];

for item in &items {
    println!("Checksum: {}", compute_any_checksum(item.as_ref()));
}
```

## Considérations Pratiques

### Quand Utiliser ?Sized

**Utilise `?Sized` quand :**
- Tu veux une API unifiée pour types sized et unsized
- Tu travailles avec des slices, strings, ou trait objects
- Tu créés des abstractions génériques flexibles

**Évite `?Sized` quand :**
- Tu n'as besoin que de types sized
- La performance est critique et l'indirection pose problème
- La complexité supplémentaire n'apporte pas de valeur

### Patterns Courants

```rust
// Pattern 1: Fonction générique flexible
fn process<T: ?Sized + MyTrait>(data: &T) { /* ... */ }

// Pattern 2: Méthode sur trait avec ?Sized
trait Processor {
    fn process<T: ?Sized + Display>(&self, item: &T);
}

// Pattern 3: Structure générique avec ?Sized
struct Wrapper<T: ?Sized> {
    inner: Box<T>,
}
```

## Conclusion

`?Sized` permet à `compute_checksum` de gérer à la fois les types sized et unsized en relâchant la contrainte `Sized`, ce qui en fait l'idéal pour une bibliothèque de sérialisation. Elle maintient l'efficacité via le dispatch statique et les références, offrant la flexibilité sans coût à l'exécution. J'utiliserais cela pour unifier les APIs à travers des types de données divers, assurant performance et scalabilité dans un système Rust.