---
id: associated-types-io-driver-api
title: >-
  Concevoir une API flexible et type-safe pour un driver I/O bas niveau avec des
  types associés et non génériques
slug: associated-types-io-driver-api
author: mayo
locale: fr
excerpt: >-
  Utiliser les types associés dans les traits Rust pour concevoir des APIs
  flexibles et type-safe pour les drivers I/O bas niveau et comparer les
  avantages par rapport aux paramètres de type génériques
tags:
  - rust
  - associated-types
  - traits
  - io-drivers
  - type-safety
  - embedded
date: '2025-12-04'
---

# Comment utiliserais-tu les types associés dans un trait pour concevoir une API flexible et type-safe pour un driver I/O bas niveau, et en quoi diffèrent-ils des paramètres de type génériques dans ce contexte ?

Dans un driver I/O bas niveau pour un système embarqué, j'utiliserais les types associés dans un trait Rust pour définir une API flexible et type-safe qui lie des types d'entrée/sortie spécifiques à chaque implémentation de driver. Contrairement aux paramètres de type génériques, les types associés fournissent une conception plus claire et plus contrainte, améliorant la clarté et maintenant les performances. Voici comment je procéderais avec un exemple.

<div class="svg-container" style="margin:2rem 0;">
<svg class="td8-fig" viewBox="0 0 800 280" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Types associés verrouillant Input et Output de UartDriver à u8 comparés aux méthodes génériques qui monomorphisent par type d'appel">
<style>
.td8-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .td8-fig,[data-theme="dark"] .td8-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.td8-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.td8-fig .boxAc{fill:var(--box);stroke:var(--ac);stroke-width:2}
.td8-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td8-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td8-fig .mut{fill:var(--mut);font:600 11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td8-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- markers -->
<defs>
<marker id="td8-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
</defs>
<!-- column titles -->
<text x="200" y="26" class="ti">Types associés</text>
<text x="600" y="26" class="ti">Paramètres génériques</text>
<!-- left column -->
<rect class="boxAc" x="60" y="45" width="280" height="50" rx="6"/>
<text x="200" y="67" class="tx">type Input = u8; type Output = u8;</text>
<text x="200" y="84" class="mut">fixé par driver</text>
<path class="ln" d="M200,95 L200,121" marker-end="url(#td8-arrow-fr)"/>
<rect class="box" x="60" y="122" width="280" height="46" rx="6"/>
<text x="200" y="145" class="tx">write(&amp;mut self, u8)</text>
<text x="200" y="160" class="mut">un seul impl, pas de bounds</text>
<path class="ln" d="M200,168 L200,194" marker-end="url(#td8-arrow-fr)"/>
<rect class="box" x="60" y="195" width="280" height="46" rx="6"/>
<text x="200" y="218" class="tx">mov inliné vers registre</text>
<text x="200" y="233" class="mut">coût de conversion nul</text>
<!-- right column -->
<rect class="box" x="460" y="45" width="280" height="50" rx="6"/>
<text x="600" y="67" class="tx">write&lt;T&gt;(&amp;mut self, data: T)</text>
<text x="600" y="84" class="mut">T pourrait être n'importe quoi</text>
<path class="ln" d="M600,95 L600,121" marker-end="url(#td8-arrow-fr)"/>
<rect class="box" x="460" y="122" width="280" height="46" rx="6"/>
<text x="600" y="145" class="tx">bound T: Into&lt;u8&gt; nécessaire</text>
<text x="600" y="160" class="mut">overhead de conversion</text>
<path class="ln" d="M600,168 L600,194" marker-end="url(#td8-arrow-fr)"/>
<rect class="box" x="460" y="195" width="280" height="46" rx="6"/>
<text x="600" y="218" class="tx">write&lt;u8&gt;, write&lt;i32&gt;, ...</text>
<text x="600" y="233" class="mut">gonflage de monomorphization</text>
<!-- captions -->
<text x="400" y="265" class="mut">UartDriver verrouille Input/Output à u8 — types incompatibles rejetés à la compilation</text>
</svg>
</div>

## Concevoir le Trait avec des Types associés

Pour un driver I/O gérant les interfaces matérielles (ex : UART, SPI), je définirais un trait comme ceci :

```rust
trait IoDriver {
    type Input;  // Type de données à écrire
    type Output; // Type de données à lire

    fn write(&mut self, data: Self::Input) -> Result<(), ()>;
    fn read(&mut self) -> Result<Self::Output, ()>;
}
```

### Types associés :
- **Input** : Le type que le driver accepte pour l'écriture (ex : `u8` pour les octets, `[u8]` pour les buffers).
- **Output** : Le type retourné lors de la lecture (ex : `u8`, `Option<u8>`).

**Pourquoi** : Chaque driver fixe ses types I/O, assurant la sécurité de type et un contrat clair sans flexibilité par appel.

## Implémentation : Driver UART

Pour un driver UART (série) qui envoie et reçoit des octets uniques :

```rust
struct UartDriver {
    // État matériel (simplifié)
    buffer: u8,
}

impl IoDriver for UartDriver {
    type Input = u8;   // Écrit des octets uniques
    type Output = u8;  // Lit des octets uniques

    fn write(&mut self, data: u8) -> Result<(), ()> {
        self.buffer = data;
        Ok(()) // Simule une écriture matérielle
    }

    fn read(&mut self) -> Result<u8, ()> {
        Ok(self.buffer) // Simule une lecture matérielle
    }
}

// Usage
let mut uart = UartDriver { buffer: 0 };
uart.write(42).unwrap();
assert_eq!(uart.read(), Ok(42));
```

## Comparaison avec les paramètres de Type génériques

Voici comment ça pourrait ressembler avec des generics à la place :

```rust
trait GenericIoDriver {
    fn write<T>(&mut self, data: T) -> Result<(), ()>;
    fn read<T>(&mut self) -> Result<T, ()>;
}

impl GenericIoDriver for UartDriver {
    fn write<T>(&mut self, data: T) -> Result<(), ()> {
        // Problème : T pourrait être n'importe quoi—comment le gérer ?
        // Peut-être restreindre avec un bound, mais toujours flou
        unimplemented!()
    }
    fn read<T>(&mut self) -> Result<T, ()> {
        unimplemented!()
    }
}
```

### Problèmes :
- **T est trop flexible**—`write` pourrait recevoir un `String` ou `i32`, mais UART attend `u8`. Les bounds comme `T: Into<u8>` ajoutent un overhead de conversion et de la complexité.
- **Monomorphization** génère du code pour chaque `T`, gonflant inutilement le binaire.

## Avantages des Types associés

### Sécurité de Type

**Types Associés** : `UartDriver` verrouille `Input` et `Output` à `u8`. Les appelants ne peuvent pas passer de types incompatibles :

```rust
uart.write("hello"); // Erreur de compilation : attendait u8, reçu &str
```

**Generics** : Nécessite des vérifications à l'exécution ou des bounds complexes, risquant des erreurs ou de l'overhead.

### Clarté de conception

**Types Associés** : Le trait déclare "ce driver fonctionne avec ces types spécifiques", rendant l'intention explicite. `UartDriver` est orienté octets, tandis qu'un `SpiDriver` pourrait utiliser `[u8]` :

```rust
struct SpiDriver;
impl IoDriver for SpiDriver {
    type Input = [u8];  // Écritures de buffer
    type Output = [u8]; // Lectures de buffer
    fn write(&mut self, _data: [u8]) -> Result<(), ()> { Ok(()) }
    fn read(&mut self) -> Result<[u8], ()> { Ok([0; 4]) }
}
```

**Generics** : L'intention est brouillée—`T` pourrait être n'importe quoi par appel, forçant les implémenteurs à gérer ou rejeter les types dynamiquement.

### Performance

**Types Associés** : Dispatch statique avec une implémentation par driver. `write` et `read` s'inlinent directement vers les ops matérielles (ex : `mov` vers un registre), pas de conversion ou overhead de dispatch.

**Generics** : Fait la monomorphization pour chaque `T` utilisé, augmentant la taille du code (ex : `write<u8>`, `write<i32>`), même si le driver ne supporte qu'un type. Les bounds comme `T: Into<u8>` ajoutent des appels à l'exécution.

## Améliorer le système

### Usage générique

Enveloppe dans une fonction générique pour la commodité :

```rust
fn process_io<D: IoDriver>(driver: &mut D, input: D::Input) -> D::Output {
    driver.write(input).unwrap();
    driver.read().unwrap()
}
let mut uart = UartDriver { buffer: 0 };
let result = process_io(&mut uart, 42); // Fonctionne avec u8
```

<div class="svg-container" style="margin:2rem 0;">
<svg class="td8b-fig" viewBox="0 0 800 295" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Chaque impl de driver remplit les trous Input et Output de IoDriver, et process_io résout D::Input différemment selon le driver au site d'appel">
<style>
.td8b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .td8b-fig,[data-theme="dark"] .td8b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.td8b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.td8b-fig .boxAc{fill:var(--box);stroke:var(--ac);stroke-width:2}
.td8b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td8b-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td8b-fig .mut{fill:var(--mut);font:600 11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td8b-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.td8b-fig .lnAc{stroke:var(--ac);stroke-width:2;fill:none}
</style>
<!-- markers -->
<defs>
<marker id="td8b-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
<marker id="td8b-arrowAc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ac)"/></marker>
</defs>
<!-- the trait, with two holes -->
<rect class="boxAc" x="250" y="30" width="300" height="50" rx="6"/>
<text x="400" y="52" class="tx">trait IoDriver { type Input; type Output }</text>
<text x="400" y="70" class="mut">deux trous, remplis une fois par driver</text>
<!-- split to the two impls -->
<path class="ln" d="M400,80 L400,96"/>
<path class="ln" d="M400,96 L210,96 L210,113" marker-end="url(#td8b-arrow)"/>
<path class="ln" d="M400,96 L590,96 L590,113" marker-end="url(#td8b-arrow)"/>
<!-- impl 1 -->
<rect class="box" x="60" y="115" width="300" height="52" rx="6"/>
<text x="210" y="137" class="tx">impl IoDriver for UartDriver</text>
<text x="210" y="155" class="mut">Input = u8, Output = u8</text>
<path class="lnAc" d="M210,167 L210,193" marker-end="url(#td8b-arrowAc)"/>
<!-- impl 2 -->
<rect class="box" x="440" y="115" width="300" height="52" rx="6"/>
<text x="590" y="137" class="tx">impl IoDriver for SpiDriver</text>
<text x="590" y="155" class="mut">Input = [u8], Output = [u8]</text>
<path class="ln" d="M590,167 L590,193" marker-end="url(#td8b-arrow)"/>
<!-- call site 1 -->
<rect class="boxAc" x="60" y="195" width="300" height="52" rx="6"/>
<text x="210" y="217" class="tx">process_io(&amp;mut uart, 42)</text>
<text x="210" y="235" class="mut">ici D::Input se lit u8</text>
<!-- call site 2 -->
<rect class="box" x="440" y="195" width="300" height="52" rx="6"/>
<text x="590" y="217" class="tx">process_io(&amp;mut spi, buf)</text>
<text x="590" y="235" class="mut">ici D::Input se lit [u8]</text>
<!-- caption -->
<text x="400" y="277" class="mut">Une signature, deux sens de D::Input — c'est le driver qui choisit le type, jamais l'appelant</text>
</svg>
</div>


### Flexibilité

Ajoute des types associés pour les erreurs ou configs si nécessaire (ex : `type Error`).

## Exemple avancé : système Multi-Driver

```rust
// Type d'erreur personnalisé
#[derive(Debug, PartialEq)]
enum IoError {
    BufferFull,
    HardwareFailure,
    InvalidData,
}

// Trait amélioré avec gestion d'erreur
trait AdvancedIoDriver {
    type Input;
    type Output;
    type Error;

    fn write(&mut self, data: Self::Input) -> Result<(), Self::Error>;
    fn read(&mut self) -> Result<Self::Output, Self::Error>;
    fn flush(&mut self) -> Result<(), Self::Error>;
}

// Driver SPI avec gestion de buffer
struct SpiDriver {
    buffer: Vec<u8>,
    max_size: usize,
}

impl AdvancedIoDriver for SpiDriver {
    type Input = Vec<u8>;
    type Output = Vec<u8>;
    type Error = IoError;

    fn write(&mut self, data: Vec<u8>) -> Result<(), IoError> {
        if data.len() > self.max_size {
            return Err(IoError::BufferFull);
        }
        self.buffer = data;
        Ok(())
    }

    fn read(&mut self) -> Result<Vec<u8>, IoError> {
        Ok(self.buffer.clone())
    }

    fn flush(&mut self) -> Result<(), IoError> {
        self.buffer.clear();
        Ok(())
    }
}

// Fonction générique pour traiter n'importe quel driver
fn handle_io<D: AdvancedIoDriver>(
    driver: &mut D, 
    data: D::Input
) -> Result<D::Output, D::Error> {
    driver.write(data)?;
    let result = driver.read()?;
    driver.flush()?;
    Ok(result)
}
```

## Vérification

### Vérification de compilation

S'assurer que les incompatibilités de types échouent :

```rust
uart.write([1, 2, 3]); // Erreur : attendait u8, reçu [i32; 3]
```

### Benchmark

Utilise criterion pour confirmer l'absence d'overhead :

```rust
use criterion::{black_box, Criterion};
fn bench(c: &mut Criterion) {
    let mut uart = UartDriver { buffer: 0 };
    c.bench_function("uart_write", |b| b.iter(|| uart.write(black_box(42))));
}
```

Attends-toi à des cycles minimaux, équivalents à l'accès matériel brut.

## Quand utiliser chaque approche

### Utilise les Types associés quand :
- Chaque implémentation a des types I/O fixes
- Tu veux une API claire et contrainte
- La performance est critique (pas de monomorphization inutile)
- Tu conçois des drivers matériels spécialisés

### Utilise les Generics quand :
- Tu as besoin de flexibilité par appel
- Les types varient dynamiquement
- Tu implémentes des algorithmes génériques
- L'uniformité n'est pas requise par implémentation

## Conclusion

J'utiliserais les types associés dans `IoDriver` pour fixer `Input` et `Output` par driver, comme avec `UartDriver`, assurant la sécurité de type et une API claire plutôt que la sur-flexibilité des generics. Cela évite le gonflage de monomorphization et les conversions à l'exécution, délivrant du code efficace et inliné pour un système I/O embarqué. Cette conception équilibre utilisabilité et performance, exploitant le système de types de Rust pour des drivers robustes.
