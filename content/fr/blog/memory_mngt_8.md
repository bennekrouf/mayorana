---
id: string-literals-memory-rust-fr
title: >-
  Comment Rust gère-t-il les string literals (&str) en termes d'allocation
  mémoire ? Où vivent-elles ?
slug: string-literals-memory-rust-fr
locale: fr
date: '2025-11-28'
author: mayo
excerpt: Rust memory et string
tags:
  - rust
  - memory
  - string
  - str
  - allocation
---

# Comment Rust gère-t-il les string literals (&str) en termes d'allocation mémoire ? Où vivent-elles ?

Les string literals (`&str`) en Rust sont gérées efficacement, avec des caractéristiques mémoire distinctes comparées aux types `String` heap-allocated. Comprendre leur allocation et lifetime est clé pour écrire du code Rust performant et sûr.

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm8-fig" viewBox="0 0 800 260" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Une variable str statique sur le stack pointe dans le segment rodata read-only du binaire, tandis qu'une variable String pointe vers une allocation heap mutable">
<style>
.mm8-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .mm8-fig,[data-theme="dark"] .mm8-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.mm8-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm8-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm8-fig .title{font:700 13px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm8-fig .body{font:600 12px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm8-fig .cap{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
.mm8-fig .ac{fill:var(--ac)}
.mm8-fig path{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="mm8-arrow-fr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ln)"/></marker>
<marker id="mm8-arrow-ac-fr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ac)"/></marker>
</defs>
<!-- stack variables -->
<rect x="40" y="30" width="220" height="60" rx="8" class="box"/>
<text x="150" y="55" text-anchor="middle" class="body">s: &amp;'static str</text>
<text x="150" y="72" text-anchor="middle" class="cap">ptr + len (stack)</text>
<rect x="40" y="120" width="220" height="60" rx="8" class="box"/>
<text x="150" y="145" text-anchor="middle" class="body">name: String</text>
<text x="150" y="162" text-anchor="middle" class="cap">ptr + len + cap (stack)</text>
<!-- memory segments -->
<rect x="480" y="30" width="280" height="60" rx="8" class="acbox"/>
<text x="620" y="55" text-anchor="middle" class="title ac">segment .rodata</text>
<text x="620" y="72" text-anchor="middle" class="cap">"hello" — immutable, 'static</text>
<rect x="480" y="120" width="280" height="60" rx="8" class="box"/>
<text x="620" y="145" text-anchor="middle" class="title">Heap</text>
<text x="620" y="162" text-anchor="middle" class="cap">"Alice and Bob" — mutable, scopé</text>
<!-- arrows -->
<path d="M260,60 L480,60" style="stroke:var(--ac)" marker-end="url(#mm8-arrow-ac-fr)"/>
<path d="M260,150 L480,150" marker-end="url(#mm8-arrow-fr)"/>
<!-- caption -->
<rect x="150" y="210" width="500" height="40" rx="8" class="box"/>
<text x="400" y="235" text-anchor="middle" class="cap">Retourner &amp;str emprunté d'un String local devient pendant quand la fonction retourne</text>
</svg>
</div>

## Les string literals (&str) en mémoire
### Localisation de Stockage

- Les string literals (ex : `"hello"`) sont stockées dans le **segment de données read-only** (`.rodata`) du binaire compilé, pas sur le heap ou stack.
- Elles sont intégrées directement dans l'exécutable et chargées en mémoire au démarrage du programme.
- La mémoire est **static**, signifiant qu'elle vit pendant toute la durée du programme.

### Inférence de Type

- Le type de `"hello"` est `&'static str` :
  - `&str` : Une string slice immutable.
  - `'static` : Un lifetime durant tout le programme.

**Exemple : Layout Mémoire** :
```rust
let s: &'static str = "hello"; // Pointe vers mémoire static
```

- **Représentation Binaire** :
  - Mémoire Exécutable : `"hello"` stocké dans section `.rodata`, ex : à l'adresse `0x1000`.
  - Variable `s` : Un pointeur (`0x1000`) + length (`5`), stocké sur le stack.

## Propriétés clés

| **Propriété** | **Explication** |
|---------------|-----------------|
| **Immutable** | Ne peut pas modifier le literal (ex : `"hello"[0] = 'H'` est interdit). |
| **Zero-Cost** | Pas d'allocation runtime (déjà en mémoire). |
| **Lifetime** | Toujours `'static` (valide pour tout le programme). |

## Comparaison avec `String`

| **Feature** | **&'static str (literal)** | **String** |
|-------------|----------------------------|------------|
| **Localisation Mémoire** | Segment données read-only | Heap |
| **Mutabilité** | Immutable | Mutable |
| **Lifetime** | `'static` | Scopé au propriétaire |
| **Coût d'Allocation** | Aucun (compile-time) | Allocation runtime |

## Cas d'Usage courants

### Constantes
```rust
const GREETING: &str = "hello"; // Pas d'allocation
```

### Arguments de Function
Préfère `&str` à `&String` pour accepter les literals sans allocation :
```rust
fn print(s: &str) { /* ... */ }
print("world"); // Pas de conversion nécessaire
```

## Pourquoi pas Toujours utiliser &'static str ?

- Limité aux **strings connues au moment de la compilation**.
- Ne peut pas dynamiquement les créer ou modifier (contrairement à `String`).

**Exemple : Strings Dynamiques Nécessitent `String`** :
```rust
let name = "Alice".to_string(); // Copie heap-allocated
name.push_str(" and Bob");      // Mutabilité possible
```

## Le problème : risque de Dangling Pointer

Retourner une référence (`&str`) vers un `String` local crée un dangling pointer, car le `String` est droppé quand la fonction se termine.

**Exemple : Code qui Échoue à Compiler** :
```rust
fn return_str() -> &str {         // ERREUR: Missing lifetime specifier!
    let s = String::from("hello");
    &s                            // Retourne une référence vers `s`...
}                                 // `s` est droppé ici (dangling pointer!)
```

**Erreur du Compiler** :
```
error[E0106]: missing lifetime specifier
 --> src/main.rs:1:17
  |
1 | fn return_str() -> &str {
  |                   ^ expected named lifetime parameter
  |
  = help: this function's return type contains a borrowed value, but there is no value for it to be borrowed from
```

### Pourquoi Rust rejette ceci
- **Règles d'Ownership** : `String` (`s`) est possédé par la fonction et droppé quand le scope se termine. Retourner `&s` créerait une référence vers mémoire libérée.
- **Application de Lifetime** : Rust nécessite des lifetimes explicites pour assurer que les références sont toujours valides. Ici, la référence (`&str`) n'a pas de propriétaire d'où emprunter après que la fonction sort.

### Comment le Corriger

Le correctif ne peut prendre que trois formes, et elles diffèrent par qui possède les octets :

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm8b-fig" viewBox="0 0 800 290" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Une fonction rejetée retournant une référence vers un String local se ramifie en trois conceptions valides : retourner un String owned, retourner un str static, ou retourner un Cow emprunté ou owned">
<style>
.mm8b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .mm8b-fig,[data-theme="dark"] .mm8b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.mm8b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm8b-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm8b-fig .deadbox{fill:none;stroke:var(--mut);stroke-width:1.5;stroke-dasharray:4 3}
.mm8b-fig .title{font:700 13px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm8b-fig .body{font:600 12px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm8b-fig .cap{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
.mm8b-fig .ac{fill:var(--ac)}
.mm8b-fig .mut{fill:var(--mut)}
.mm8b-fig path{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="mm8b-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ln);stroke:none"/></marker>
<marker id="mm8b-arrowac" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ac);stroke:none"/></marker>
</defs>
<!-- rejected root -->
<rect x="280" y="26" width="240" height="58" rx="8" class="deadbox"/>
<text x="400" y="50" text-anchor="middle" class="body mut">fn return_str() -&gt; &amp;str</text>
<text x="400" y="68" text-anchor="middle" class="cap">rien à emprunter pour le &amp;str</text>
<!-- fan out -->
<path d="M400,84 L400,112"/>
<path d="M135,112 L665,112"/>
<path d="M135,112 L135,140" marker-end="url(#mm8b-arrow)"/>
<path d="M400,112 L400,140" style="stroke:var(--ac)" marker-end="url(#mm8b-arrowac)"/>
<path d="M665,112 L665,140" marker-end="url(#mm8b-arrow)"/>
<!-- option 1 -->
<rect x="30" y="140" width="210" height="80" rx="8" class="box"/>
<text x="135" y="164" text-anchor="middle" class="body">-&gt; String</text>
<text x="135" y="184" text-anchor="middle" class="cap">l'ownership passe à l'appelant</text>
<text x="135" y="202" text-anchor="middle" class="cap">coûte une allocation heap</text>
<!-- option 2 -->
<rect x="295" y="140" width="210" height="80" rx="8" class="acbox"/>
<text x="400" y="164" text-anchor="middle" class="body ac">-&gt; &amp;'static str</text>
<text x="400" y="184" text-anchor="middle" class="cap">octets déjà dans .rodata</text>
<text x="400" y="202" text-anchor="middle" class="cap">zéro allocation, literals seulement</text>
<!-- option 3 -->
<rect x="560" y="140" width="210" height="80" rx="8" class="box"/>
<text x="665" y="164" text-anchor="middle" class="body">-&gt; Cow&lt;'static, str&gt;</text>
<text x="665" y="184" text-anchor="middle" class="cap">emprunté ou owned selon l'appel</text>
<text x="665" y="202" text-anchor="middle" class="cap">n'alloue que si nécessaire</text>
<!-- caption -->
<text x="400" y="252" text-anchor="middle" class="cap">Le String local n'est jamais une option : il meurt à l'accolade fermante.</text>
<text x="400" y="272" text-anchor="middle" class="cap">Chaque correctif cède l'ownership ou pointe vers de la mémoire qui survit à l'appel.</text>
</svg>
</div>

#### Option 1 : retourner un `String` Owned (Pas de référence)
```rust
fn return_owned() -> String {  // Transfère ownership à l'appelant
    String::from("hello")      // Pas de référence, pas de problème lifetime
}
```

#### Option 2 : retourner un `&'static str` (String Literal)
```rust
fn return_static() -> &'static str {  // Vit pour toujours dans binaire
    "hello"                          // Mémoire static (pas heap)
}
```

#### Option 3 : utiliser `Cow<str>` pour flexibilité
```rust
use std::borrow::Cow;

fn return_cow(is_heap: bool) -> Cow<'static, str> {
    if is_heap {
        Cow::Owned(String::from("hello"))  // Heap-allocated
    } else {
        Cow::Borrowed("hello")             // Mémoire static
    }
}
```


**String literals** :
- Vivent en mémoire static (partie du binaire).
- Sont immutables et zero-cost.
- Ont un lifetime `'static`.

**Quand les utiliser** :
- Pour strings fixes, read-only (ex : messages, constantes).
- Pour éviter allocations dans APIs de fonction (`&str` plutôt que `&String`).

**Ne retourne jamais `&str` emprunté d'un `String` local**—c'est impossible en Rust safe.

**Solutions** :
- Retourner `String` (transfert d'ownership).
- Utiliser `&'static str` (literals seulement).
- Utiliser `Cow<str>` pour choix dynamiques.

**Note Avancée** : Rust optimise les références `&str` vers literals. Même si tu écris :
```rust
let s = String::from("hello");
let slice = &s[..]; // Pointe vers heap, pas mémoire static !
```
Le compilateur peut élider les copies si le contenu est connu statiquement.

Remplacer `&s` par `&s[..]` n'aide pas. La slice pointe toujours dans le même `String` qui est sur
le point d'être libéré ; tu as changé le type, pas la lifetime.
