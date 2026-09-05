---
id: string-vs-str-rust-fr
title: String vs. &str – Lequel Utiliser et Quand ?
slug: string-vs-str-rust-fr
locale: fr
author: mayo
excerpt: >-
  String vs str en Rust, couvrant gestion mémoire, ownership, et quand utiliser
  chaque type.

tags:
  - rust
  - string
date: '2025-08-06'
---

# Quelle est la différence entre String et str ?

Comprendre la différence entre `String` et `str` est fondamental pour une gestion efficace de la mémoire.

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm1-fig" viewBox="0 0 800 300" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Comparaison entre le layout owned de String et la vue fat-pointer de str vers heap, stack ou mémoire statique">
<style>
.mm1-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .mm1-fig,[data-theme="dark"] .mm1-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.mm1-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm1-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm1-fig .title{font:700 14px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm1-fig .body{font:600 12px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm1-fig .cap{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
.mm1-fig .ac{fill:var(--ac)}
.mm1-fig line,.mm1-fig path{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="mm1-arrow-fr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ln)"/></marker>
</defs>
<!-- title -->
<text x="400" y="26" text-anchor="middle" class="title">Données Owned vs. Borrowed</text>
<!-- String box -->
<rect x="60" y="50" width="230" height="110" rx="8" class="box"/>
<text x="175" y="72" text-anchor="middle" class="title">String</text>
<text x="175" y="92" text-anchor="middle" class="body">ptr | len | cap</text>
<text x="175" y="110" text-anchor="middle" class="cap">owned, mutable, extensible</text>
<text x="175" y="126" text-anchor="middle" class="cap">3 mots sur le stack</text>
<!-- str box -->
<rect x="510" y="50" width="230" height="110" rx="8" class="acbox"/>
<text x="625" y="72" text-anchor="middle" class="title ac">&amp;str</text>
<text x="625" y="92" text-anchor="middle" class="body">ptr | len</text>
<text x="625" y="110" text-anchor="middle" class="cap">vue borrowed, immutable</text>
<text x="625" y="126" text-anchor="middle" class="cap">fat pointer, 2 mots</text>
<!-- data box -->
<rect x="230" y="220" width="340" height="60" rx="8" class="box"/>
<text x="400" y="245" text-anchor="middle" class="body">Octets UTF-8</text>
<text x="400" y="262" text-anchor="middle" class="cap">buffer heap, array stack, ou .rodata</text>
<!-- arrows: Y-merge into shared point, then single arrow to data box -->
<path d="M175,160 L175,200 L400,200"/>
<path d="M625,160 L625,200 L400,200" style="stroke:var(--ac)"/>
<path d="M400,200 L400,220" marker-end="url(#mm1-arrow-fr)"/>
</svg>
</div>

## `String` et `str`, côte à côte
| `String` | `str` (habituellement `&str`) |
|----------|-------------------------------|
| String UTF-8 extensible, heap-allocated | Vue immutable, taille fixe dans string UTF-8 |
| Type owned (gère sa mémoire) | Type borrowed (ne possède pas la mémoire) |
| Mutable (peut modifier le contenu) | Vue immutable |
| Créé avec `String::from("...")` ou `"...".to_string()` | Depuis string literals (`"hello"`) ou emprunté depuis `String` (`&my_string`) |

## Layout mémoire

**`String`** : Stocke les données sur la heap avec trois composants :
- Pointeur vers buffer heap
- Length (taille actuelle)
- Capacity (taille allouée)

**`&str`** : Un "fat pointer" contenant :
- Pointeur vers données string (heap, stack, ou mémoire static)
- Length de la slice

## Cas d'usages

Utilise **`String`** quand :
- Tu as besoin de modifier ou faire grandir la string
- Tu as besoin d'ownership (ex : retourner depuis une fonction)
- Construire des strings dynamiquement

```rust
let mut owned = String::from("hello");
owned.push_str(" world");  // Mutation nécessite String
```

Utilise **`&str`** quand :
- Tu n'as besoin que d'une vue read-only d'une string
- Travailler avec des paramètres de fonction (évite les allocations inutiles)
- Gérer des string literals (stockées en mémoire read-only)

```rust
fn process_str(s: &str) -> usize {
    s.len()  // Accès read-only
}
```

## Exemple : Ownership vs Borrowing

```rust
fn process_string(s: String) { /* prend ownership */ }
fn process_str(s: &str)      { /* emprunte */ }

fn main() {
    let heap_str = String::from("hello");
    let static_str = "world";
    
    process_string(heap_str);  // Ownership moved
    process_str(static_str);   // Borrowed
    
    // heap_str plus accessible ici
    // static_str encore accessible
}
```

## Considérations de performance

**Paramètres de Fonction** :
```rust
// Inefficace - force l'allocation
fn bad(s: String) -> usize { s.len() }

// Efficace - accepte String et &str
fn good(s: &str) -> usize { s.len() }

// Exemple:
let owned = String::from("test");
good(&owned);     // Deref coercion: String -> &str
good("literal");  // &str direct
```

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm1-fig2" viewBox="0 0 800 340" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Un paramètre &str accepte à la fois un String et un literal via deref coercion, alors qu'un paramètre String force le literal à allouer">
<style>
.mm1-fig2{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .mm1-fig2,[data-theme="dark"] .mm1-fig2{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.mm1-fig2 .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm1-fig2 .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm1-fig2 .title{font:700 14px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm1-fig2 .sub{font:700 13px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
.mm1-fig2 .body{font:600 12px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm1-fig2 .cap{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
.mm1-fig2 .ac{fill:var(--ac)}
.mm1-fig2 path{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="mm1b-arrow-fr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ln);stroke:none"/></marker>
<marker id="mm1b-arrow-ac-fr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ac);stroke:none"/></marker>
</defs>
<!-- title -->
<text x="400" y="24" text-anchor="middle" class="title">Quels appelants peuvent atteindre ta fonction ?</text>
<!-- row 1 label -->
<text x="40" y="56" class="sub">fn good(s: &amp;str)</text>
<!-- callers -->
<rect x="40" y="70" width="190" height="46" rx="8" class="box"/>
<text x="135" y="90" text-anchor="middle" class="body">String::from("test")</text>
<text x="135" y="106" text-anchor="middle" class="cap">passé en &amp;owned</text>
<rect x="40" y="140" width="190" height="46" rx="8" class="box"/>
<text x="135" y="160" text-anchor="middle" class="body">"literal"</text>
<text x="135" y="176" text-anchor="middle" class="cap">déjà un &amp;'static str</text>
<!-- coercion node -->
<rect x="310" y="93" width="170" height="70" rx="8" class="acbox"/>
<text x="395" y="117" text-anchor="middle" class="title ac">&amp;str</text>
<text x="395" y="136" text-anchor="middle" class="cap">deref coercion</text>
<text x="395" y="152" text-anchor="middle" class="cap">zéro allocation</text>
<!-- callee -->
<rect x="560" y="105" width="200" height="46" rx="8" class="box"/>
<text x="660" y="133" text-anchor="middle" class="body">fn good(s: &amp;str)</text>
<!-- arrows row 1: Y-merge then single arrow -->
<path d="M230,93 L270,93 L270,128"/>
<path d="M230,163 L270,163 L270,128"/>
<path d="M270,128 L310,128" marker-end="url(#mm1b-arrow-ac-fr)"/>
<path d="M480,128 L560,128" marker-end="url(#mm1b-arrow-fr)"/>
<!-- divider -->
<path d="M40,215 L760,215" style="stroke-dasharray:4 4"/>
<!-- row 2 label -->
<text x="40" y="247" class="sub">fn bad(s: String)</text>
<rect x="40" y="262" width="190" height="46" rx="8" class="box"/>
<text x="135" y="290" text-anchor="middle" class="body">"literal"</text>
<rect x="310" y="262" width="170" height="46" rx="8" class="box"/>
<text x="395" y="282" text-anchor="middle" class="body">.to_string()</text>
<text x="395" y="299" text-anchor="middle" class="cap">alloc heap forcée</text>
<rect x="560" y="262" width="200" height="46" rx="8" class="box"/>
<text x="660" y="290" text-anchor="middle" class="body">fn bad(s: String)</text>
<path d="M230,285 L310,285" marker-end="url(#mm1b-arrow-fr)"/>
<path d="M480,285 L560,285" marker-end="url(#mm1b-arrow-fr)"/>
</svg>
</div>

**Allocation Mémoire** :
- `String` alloue sur heap, nécessite désallocation
- `&str` vers literals pointe vers le binaire du programme (zero allocation) 
- `&str` depuis `String` partage l'allocation existante

## Patterns courants

**Renvoyer des "Owned"** :
```rust
fn build_message(name: &str) -> String {
    format!("Hello, {}!", name)  // Retourne String owned
}
```

**Paramètre d'entrée flexible** :
```rust
fn analyze(text: &str) -> usize {
    // Fonctionne avec inputs String et &str
    text.chars().count()
}
```

**Éviter les Clones Inutiles** :
```rust
// Mauvais - allocation inutile
fn process_bad(s: &str) -> String {
    s.to_string()  // Seulement si tu as vraiment besoin de données owned
}

// Bon - travaille avec données borrowed quand possible
fn process_good(s: &str) -> &str {
    s.trim()  // Retourne slice de l'original
}
```

## Lequel écrire
- **`String`** : Owned, mutable, heap-allocated  
- **`str`** : Borrowed, immutable, flexible (heap/stack/static)  
Préfère `&str` pour les paramètres de fonction sauf si tu as besoin d'ownership ou mutation

`.to_string()` alloue dans les deux cas, mais pas pour la même raison : sur un littéral il copie
depuis les données en lecture seule du binaire, sur un `String` il clone un buffer heap existant.
