---
id: string-str-mismatch-rust-fr
title: >-
  Pourquoi &str Ne Rentre Pas dans &String en Rust: Fixes Sympas pour les String
  Mismatches !
slug: string-str-mismatch-rust-fr
locale: fr
date: '2025-08-26'
author: mayo
excerpt: Rust memory et string

tags:
  - rust
  - memory
  - string
  - str
  - ownership
---

# Pourquoi tu ne peux pas passer un &str directement à une fonction attendant un &String ? Comment gérerais-tu un tel scénario ?

En Rust, tu ne peux pas passer un `&str` directement à une fonction attendant un `&String` à cause de leurs types distincts, ce qui assure la type safety et prévient les assumptions sur l'ownership mémoire. Ci-dessous, j'explique pourquoi ce mismatch survient et comment le gérer efficacement.

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm6-fig" viewBox="0 0 800 220" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Le deref coercion permet à une référence String de se convertir automatiquement en slice str, mais la direction inverse est rejetée par le compilateur">
<style>
.mm6-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00;--bad:#ef4444}
:root.dark .mm6-fig,[data-theme="dark"] .mm6-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569;--bad:#f87171}
.mm6-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm6-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm6-fig .title{font:700 14px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm6-fig .body{font:600 12px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm6-fig .cap{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
.mm6-fig .ac{fill:var(--ac)}
.mm6-fig .bad{fill:var(--bad)}
.mm6-fig path{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="mm6-arrow-ac-fr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ac)"/></marker>
<marker id="mm6-arrow-bad-fr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--bad)"/></marker>
</defs>
<!-- boxes -->
<rect x="60" y="60" width="220" height="70" rx="8" class="box"/>
<text x="170" y="90" text-anchor="middle" class="title">&amp;String</text>
<text x="170" y="108" text-anchor="middle" class="cap">référence owned, extensible</text>
<rect x="520" y="60" width="220" height="70" rx="8" class="acbox"/>
<text x="630" y="90" text-anchor="middle" class="title ac">&amp;str</text>
<text x="630" y="108" text-anchor="middle" class="cap">slice flexible, paramètre préféré</text>
<!-- coercion arrow, top -->
<path d="M280,80 L520,80" style="stroke:var(--ac)" marker-end="url(#mm6-arrow-ac-fr)"/>
<text x="400" y="70" text-anchor="middle" class="cap ac">Deref coercion (automatique)</text>
<!-- blocked arrow, bottom -->
<path d="M520,115 L280,115" style="stroke:var(--bad)" marker-end="url(#mm6-arrow-bad-fr)"/>
<text x="400" y="135" text-anchor="middle" class="cap bad">pas de conversion implicite (erreur compile-time)</text>
<!-- caption box -->
<rect x="140" y="160" width="520" height="50" rx="8" class="box"/>
<text x="400" y="190" text-anchor="middle" class="body">Fix : accepte &amp;str en paramètre, ou convertis avec .to_string()</text>
</svg>
</div>

## Le Problème Central : Type Mismatch

- **`&String`** : Une référence vers un `String` heap-allocated, extensible.
- **`&str`** : Une string slice qui peut pointer vers mémoire heap, stack, ou static.
- Ce sont des **types différents**, donc Rust rejette les conversions implicites pour la sécurité.

Ce mismatch de types n'est pas de la bureaucratie — les deux références contiennent physiquement des choses différentes :

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm6b-fig" viewBox="0 0 800 310" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Comparaison côte à côte montrant qu'une référence vers String pointe d'abord vers une struct propriétaire ptr len cap avant d'atteindre les octets, tandis qu'une référence str est elle-même un pointeur et une longueur visant directement les octets">
<style>
.mm6b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .mm6b-fig,[data-theme="dark"] .mm6b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.mm6b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm6b-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm6b-fig .bytes{fill:var(--bg);stroke:var(--ln);stroke-width:1.5}
.mm6b-fig .title{font:700 14px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm6b-fig .body{font:600 12px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm6b-fig .cap{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
.mm6b-fig .ac{fill:var(--ac)}
.mm6b-fig path{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="mm6b-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ln);stroke:none"/></marker>
<marker id="mm6b-arrowac" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ac);stroke:none"/></marker>
</defs>
<!-- headers -->
<text x="205" y="28" text-anchor="middle" class="title">&amp;String — deux sauts</text>
<text x="595" y="28" text-anchor="middle" class="title ac">&amp;str — un seul saut</text>
<!-- left column -->
<rect x="30" y="46" width="350" height="48" rx="8" class="box"/>
<text x="205" y="68" text-anchor="middle" class="body">&amp;String</text>
<text x="205" y="85" text-anchor="middle" class="cap">un pointeur fin vers une struct propriétaire</text>
<rect x="30" y="132" width="350" height="48" rx="8" class="box"/>
<text x="205" y="154" text-anchor="middle" class="body">String { ptr, len, cap }</text>
<text x="205" y="171" text-anchor="middle" class="cap">porte la capacité, peut croître et réallouer</text>
<rect x="30" y="218" width="350" height="48" rx="8" class="bytes"/>
<text x="205" y="240" text-anchor="middle" class="body">h e l l o</text>
<text x="205" y="257" text-anchor="middle" class="cap">buffer heap, possédé par ce String</text>
<!-- left arrows -->
<path d="M205,94 L205,132" marker-end="url(#mm6b-arrow)"/>
<path d="M205,180 L205,218" marker-end="url(#mm6b-arrow)"/>
<!-- right column -->
<rect x="420" y="46" width="350" height="48" rx="8" class="acbox"/>
<text x="595" y="68" text-anchor="middle" class="body ac">&amp;str = { ptr, len }</text>
<text x="595" y="85" text-anchor="middle" class="cap">le fat pointer est la valeur entière</text>
<rect x="420" y="218" width="350" height="48" rx="8" class="bytes"/>
<text x="595" y="240" text-anchor="middle" class="body">h e l l o</text>
<text x="595" y="257" text-anchor="middle" class="cap">octets n'importe où : static, stack ou heap</text>
<!-- right arrow, no owner struct in between -->
<path d="M470,94 L470,218" style="stroke:var(--ac)" marker-end="url(#mm6b-arrowac)"/>
<text x="500" y="150" class="cap">aucune struct propriétaire au milieu,</text>
<text x="500" y="166" class="cap">donc pas de capacité ni de droit de croître</text>
<!-- caption -->
<text x="400" y="296" text-anchor="middle" class="cap">Une fonction qui exige &amp;String réclame la boîte du milieu ; un &amp;str n'en a aucune à offrir.</text>
</svg>
</div>

**Exemple : Le Problème** :
```rust
fn print_string(s: &String) {
    println!("{}", s);
}

fn main() {
    let my_str = "hello";  // Type: `&'static str`
    print_string(my_str);  // ERREUR: expected `&String`, found `&str`
}
```

## Solutions pour Relier &str et &String

### 1. Deref Coercion (Conversion Automatique)

Rust convertit automatiquement `&String` vers `&str` via le trait `Deref`, mais pas l'inverse. Le meilleur fix est de changer la fonction pour accepter `&str` pour plus de flexibilité.

```rust
fn print_str(s: &str) {  // Maintenant accepte `&str` et `&String`
    println!("{}", s);
}

fn main() {
    let my_string = String::from("hello");
    let my_str = "world";
    
    print_str(&my_string);  // Fonctionne: `&String` coerce vers `&str`
    print_str(my_str);      // Fonctionne directement
}
```

**Pourquoi ça marche** : `String` implémente `Deref<Target=str>`, permettant à `&String` de coercer vers `&str`.

### 2. Conversion Explicite (Quand Tu As Besoin de &String)

Si la fonction doit prendre `&String`, convertis `&str` vers `String` d'abord :

```rust
fn print_string(s: &String) {
    println!("{}", s);
}

fn main() {
    let my_str = "hello";
    print_string(&my_str.to_string());  // Alloue un nouveau `String`
}
```

**Inconvénient** : Ceci alloue un nouveau buffer heap, ce qui devrait être évité si possible à cause des coûts de performance.

### 3. Utilise `AsRef<str>` pour Flexibilité Maximum

Pour des fonctions qui devraient marcher avec tout type string-like :

```rust
fn print_as_str<S: AsRef<str>>(s: S) {
    println!("{}", s.as_ref());
}

fn main() {
    let my_string = String::from("hello");
    let my_str = "world";
    
    print_as_str(&my_string);  // Fonctionne
    print_as_str(my_str);      // Fonctionne
}
```

**Bonus** : Accepte aussi `Cow<str>`, `Box<str>`, etc.

## Points Clés

**Préféré** : Utilise `&str` dans les arguments de fonction (flexible et zero-cost).  
**Si coincé avec `&String`** : Convertis `&str` vers `String` (alloue).  
**Pour les APIs** : Utilise `AsRef<str>` ou `impl Deref<Target=str>` pour compatibilité maximum.

**Pourquoi Rust Applique Ceci** :
- Prévient les allocations accidentelles ou assumptions sur l'ownership mémoire.
- Encourage des APIs efficaces, borrow-friendly.

Passer un `String` à `print_str` sans le `&` est une erreur de type, pas une erreur de move : la
coercition de déréférencement ne s'applique qu'à travers une référence, donc le compilateur n'a
rien à coercer.
