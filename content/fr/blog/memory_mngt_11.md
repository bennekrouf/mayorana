---
id: drop-trait-rust-fr
title: Comprendre le Trait Drop en Rust
slug: drop-trait-rust-fr
locale: fr
date: '2025-11-24'
author: mayo
excerpt: >-
  Comment fonctionne le trait Drop, quand le destructeur s'exécute, et pourquoi
  l'implémenter à la main est plus rare qu'il n'y paraît.
tags:
  - rust
  - beginner
  - memory
  - drop
  - ownership
---

# Comprendre le Trait Drop en Rust

Le trait `Drop` en Rust permet une logique de cleanup personnalisée quand une valeur sort du scope, fournissant une gestion déterministe des ressources similaire au RAII de C++ (Resource Acquisition Is Initialization). Il assure la memory safety et la désallocation appropriée des ressources sans garbage collector.

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm11-fig" viewBox="0 0 800 240" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Les valeurs sont déclarées res1 puis res2, et droppées dans l'ordre inverse LIFO : res2 en premier, puis res1, quand le scope se termine">
<style>
.mm11-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .mm11-fig,[data-theme="dark"] .mm11-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.mm11-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm11-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm11-fig .title{font:700 13px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm11-fig .body{font:600 12px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm11-fig .cap{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
.mm11-fig .ac{fill:var(--ac)}
.mm11-fig path{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="mm11-arrow-fr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ac)"/></marker>
</defs>
<text x="400" y="24" text-anchor="middle" class="title">Ordre de Déclaration</text>
<rect x="60" y="40" width="300" height="50" rx="8" class="box"/>
<text x="210" y="70" text-anchor="middle" class="body">let _res1 = Resource { id: 1 };</text>
<rect x="60" y="100" width="300" height="50" rx="8" class="box"/>
<text x="210" y="130" text-anchor="middle" class="body">let _res2 = Resource { id: 2 };</text>
<text x="400" y="160" text-anchor="middle" class="cap">fin de scope → drop en ordre inverse</text>
<text x="620" y="24" text-anchor="middle" class="title">Ordre de Drop</text>
<rect x="440" y="40" width="300" height="50" rx="8" class="acbox"/>
<text x="590" y="70" text-anchor="middle" class="body ac">1er : drop resource 2</text>
<rect x="440" y="100" width="300" height="50" rx="8" class="box"/>
<text x="590" y="130" text-anchor="middle" class="body">2e : drop resource 1</text>
<path d="M360,65 L440,65" marker-end="url(#mm11-arrow-fr)"/>
<path d="M360,125 L440,125" marker-end="url(#mm11-arrow-fr)"/>
</svg>
</div>

## Qu'est-ce que le Trait Drop ?

Le trait `Drop` définit une seule méthode, `drop`, qui est automatiquement appelée quand une valeur est détruite :

```rust
trait Drop {
    fn drop(&mut self);  // Appelée automatiquement quand la valeur est détruite
}
```

## Comment ça Fonctionne

- **Invocation Automatique** : Rust appelle `drop` quand :
  - Une variable sort du scope.
  - L'ownership est transférée (ex : moved dans une fonction).
  - Explicitement droppée via `std::mem::drop`.
- **Ordre LIFO** : Les valeurs sont droppées dans l'ordre inverse de leur déclaration (comportement stack-like).

**Exemple : Drop Basique** :
```rust
struct Resource {
    id: u32,
}

impl Drop for Resource {
    fn drop(&mut self) {
        println!("Dropping resource {}", self.id);
    }
}

fn main() {
    let _res1 = Resource { id: 1 };  // Droppée en second
    let _res2 = Resource { id: 2 };  // Droppée en premier
}
```

**Sortie** :
```
Dropping resource 2
Dropping resource 1
```

Trois événements différents convergent vers le même appel au destructeur — et exactement un le contourne :

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm11b-fig" viewBox="0 0 800 300" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Fin de scope, move d'ownership et mem drop convergent tous vers le même appel au destructeur, tandis que mem forget consomme la valeur sans jamais exécuter le destructeur">
<style>
.mm11b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .mm11b-fig,[data-theme="dark"] .mm11b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.mm11b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm11b-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm11b-fig .deadbox{fill:none;stroke:var(--mut);stroke-width:1.5;stroke-dasharray:4 3}
.mm11b-fig .title{font:700 13px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm11b-fig .body{font:600 12px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm11b-fig .cap{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
.mm11b-fig .ac{fill:var(--ac)}
.mm11b-fig .mut{fill:var(--mut)}
.mm11b-fig path{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="mm11b-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ln);stroke:none"/></marker>
<marker id="mm11b-arrowac" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ac);stroke:none"/></marker>
</defs>
<!-- triggers -->
<rect x="20" y="40" width="175" height="62" rx="8" class="box"/>
<text x="107" y="66" text-anchor="middle" class="body">fin de scope</text>
<text x="107" y="86" text-anchor="middle" class="cap">l'accolade fermante</text>
<rect x="215" y="40" width="175" height="62" rx="8" class="box"/>
<text x="302" y="66" text-anchor="middle" class="body">ownership moved</text>
<text x="302" y="86" text-anchor="middle" class="cap">le scope de l'appelé finit</text>
<rect x="410" y="40" width="175" height="62" rx="8" class="box"/>
<text x="497" y="66" text-anchor="middle" class="body">std::mem::drop(v)</text>
<text x="497" y="86" text-anchor="middle" class="cap">clôt le scope plus tôt</text>
<rect x="605" y="40" width="175" height="62" rx="8" class="acbox"/>
<text x="692" y="66" text-anchor="middle" class="body ac">std::mem::forget(v)</text>
<text x="692" y="86" text-anchor="middle" class="cap">consommé, aucun cleanup</text>
<!-- Y-merge of the three normal triggers -->
<path d="M107,102 L107,140"/>
<path d="M302,102 L302,140"/>
<path d="M497,102 L497,140"/>
<path d="M107,140 L497,140"/>
<path d="M302,140 L302,180" marker-end="url(#mm11b-arrow)"/>
<!-- destructor runs -->
<rect x="180" y="180" width="245" height="62" rx="8" class="box"/>
<text x="302" y="206" text-anchor="middle" class="body">drop(&amp;mut self) s'exécute</text>
<text x="302" y="226" text-anchor="middle" class="cap">puis les champs, mémoire libérée</text>
<!-- forget path -->
<path d="M675,102 L675,180" style="stroke:var(--ac)" marker-end="url(#mm11b-arrowac)"/>
<rect x="560" y="180" width="230" height="62" rx="8" class="deadbox"/>
<text x="675" y="206" text-anchor="middle" class="body mut">destructeur jamais appelé</text>
<text x="675" y="226" text-anchor="middle" class="cap">fichier ouvert, mémoire retenue</text>
<!-- caption -->
<text x="400" y="272" text-anchor="middle" class="cap">Un move ne saute pas le cleanup : il déplace qui en est responsable.</text>
<text x="400" y="290" text-anchor="middle" class="cap">Seul mem::forget supprime la responsabilité, d'où la fuite.</text>
</svg>
</div>

## Quand implémenter Drop manuellement
### 1. Cleanup de Ressources

Pour gérer des ressources non-mémoire comme fichiers, sockets, ou locks :

```rust
struct DatabaseConnection {
    // Détails de connexion
}

impl Drop for DatabaseConnection {
    fn drop(&mut self) {
        self.close();  // Assure que la connexion est libérée
    }
}
```

### 2. Gestion mémoire Personnalisée

Pour intégrer avec FFI ou code unsafe :

```rust
struct RawBuffer {
    ptr: *mut u8,
}

impl Drop for RawBuffer {
    fn drop(&mut self) {
        unsafe { libc::free(self.ptr as *mut _); }  // Libère manuellement mémoire heap
    }
}
```

### 3. Logging/Télémétrie

Pour tracker le cycle de vie d'objets :

```rust
struct MetricsTracker {
    start: std::time::Instant,
}

impl Drop for MetricsTracker {
    fn drop(&mut self) {
        log::info!("Tracker dropped after {}ms", self.start.elapsed().as_millis());
    }
}
```

## Règles clés

- **Pas d'Appels Explicites** : Appelle rarement `drop` directement ; utilise `std::mem::drop` pour explicitement drop une valeur.
- **Pas de Panics** : Évite de paniquer dans `drop`, car cela peut mener à des double-drops ou arrêts de programme.
- **Auto Traits** : Les types implémentant `Drop` ne peuvent pas être `Copy`.

## Drop vs. Copy/Clone

| **Trait** | **But** | **Mutuellement Exclusif ?** |
|-----------|---------|----------------------------|
| `Drop`    | Logique de cleanup | Oui (ne peut pas être `Copy`) |
| `Copy`    | Copie bitwise | Oui |
| `Clone`   | Deep copy explicite | Non |

## Avancé : #[may_dangle] (Nightly)

Pour les types génériques où `T` pourrait ne pas avoir besoin d'être droppé (unsafe) :

```rust
unsafe impl<#[may_dangle] T> Drop for MyBox<T> {
    fn drop(&mut self) { /* ... */ }
}
```

## Quand ne pas utiliser Drop
- **Données Simples** : Pas besoin de `Drop` si le cleanup est géré par d'autres types (ex : `Box`, `Vec`).
- **Thread-Safety** : Utilise `Arc` + `Mutex` au lieu de locking manuel dans `drop`.

## `Drop`, en résumé
**Utilise `Drop` pour** :
- Cleanup de ressources (fichiers, locks, mémoire).
- Garanties FFI/safety-critical.
- Debugging/profiling.

**Évite** :
- Réimplémenter de la logique fournie par Rust (ex : désallocation de `Box`).
- Opérations complexes qui pourraient paniquer.

**Exemple Réel** : Le type `MutexGuard` utilise `Drop` pour libérer les locks automatiquement :

```rust
{
    let guard = mutex.lock();  // Lock acquis
    // ...
}  // `guard` dropped ici → lock libéré
```

`mem::forget` sur un type qui implémente `Drop` saute complètement le destructeur. C'est du Rust
safe — fuir n'est pas de l'unsoundness — mais ça veut dire un fichier non fermé ou un buffer non
libéré, donc c'est un outil délibéré et non une échappatoire.
