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

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm2-fig" viewBox="0 0 800 260" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Ownership, borrowing et lifetimes convergent pour garantir la sécurité mémoire à la compilation sans garbage collector">
<style>
.mm2-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .mm2-fig,[data-theme="dark"] .mm2-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.mm2-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm2-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm2-fig .title{font:700 13px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm2-fig .body{font:600 12px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm2-fig .cap{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
.mm2-fig .ac{fill:var(--ac)}
.mm2-fig path{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="mm2-arrow-fr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ac)"/></marker>
</defs>
<!-- three mechanism boxes -->
<rect x="30" y="30" width="200" height="70" rx="8" class="box"/>
<text x="130" y="58" text-anchor="middle" class="title">Ownership</text>
<text x="130" y="76" text-anchor="middle" class="cap">propriétaire unique, drop en fin de scope</text>
<!-- box2 -->
<rect x="300" y="30" width="200" height="70" rx="8" class="box"/>
<text x="400" y="58" text-anchor="middle" class="title">Borrowing</text>
<text x="400" y="76" text-anchor="middle" class="cap">&amp;T ou &amp;mut T, jamais les deux</text>
<!-- box3 -->
<rect x="570" y="30" width="200" height="70" rx="8" class="box"/>
<text x="670" y="58" text-anchor="middle" class="title">Lifetimes</text>
<text x="670" y="76" text-anchor="middle" class="cap">les références ne survivent jamais aux données</text>
<!-- merge point -->
<path d="M130,100 L130,160 L400,160"/>
<path d="M400,100 L400,160"/>
<path d="M670,100 L670,160 L400,160"/>
<path d="M400,160 L400,180" marker-end="url(#mm2-arrow-fr)"/>
<!-- result box -->
<rect x="230" y="180" width="340" height="60" rx="8" class="acbox"/>
<text x="400" y="205" text-anchor="middle" class="title ac">Sécurité Mémoire</text>
<text x="400" y="223" text-anchor="middle" class="cap">pas de GC, pas d'overhead runtime</text>
</svg>
</div>

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

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm2-fig2" viewBox="0 0 800 310" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Frise montrant les durées de vie de s1 et s2, où l'emprunt renvoyé par longest survit à s2 et est donc rejeté à la compilation">
<style>
.mm2-fig2{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .mm2-fig2,[data-theme="dark"] .mm2-fig2{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.mm2-fig2 .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm2-fig2 .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm2-fig2 .title{font:700 14px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm2-fig2 .body{font:600 12px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm2-fig2 .cap{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
.mm2-fig2 .ac{fill:var(--ac)}
.mm2-fig2 path{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="mm2b-arrow-fr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ln);stroke:none"/></marker>
<marker id="mm2b-arrow-ac-fr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ac);stroke:none"/></marker>
</defs>
<!-- title -->
<text x="400" y="24" text-anchor="middle" class="title">Lifetime 'a : pourquoi cet emprunt est rejeté</text>
<!-- s1 bar -->
<text x="172" y="103" text-anchor="end" class="body">s1</text>
<rect x="210" y="86" width="530" height="26" rx="6" class="box"/>
<text x="222" y="103" class="cap">String — vit jusqu'à la fin de main</text>
<!-- s2 bar -->
<text x="172" y="143" text-anchor="end" class="body">s2</text>
<rect x="340" y="126" width="260" height="26" rx="6" class="box"/>
<text x="352" y="143" class="cap">String — scope interne seulement</text>
<!-- result bar -->
<text x="172" y="183" text-anchor="end" class="body ac">result</text>
<rect x="470" y="166" width="240" height="26" rx="6" class="acbox"/>
<text x="482" y="183" class="cap">&amp;'a str — doit rester valide</text>
<!-- drop marker -->
<path d="M600,78 L600,196" style="stroke:var(--ac);stroke-dasharray:5 4"/>
<text x="608" y="74" class="cap ac">s2 supprimé ici</text>
<!-- error callout -->
<rect x="430" y="204" width="330" height="46" rx="8" class="acbox"/>
<text x="595" y="223" text-anchor="middle" class="body ac">'a ne peut pas survivre à s2</text>
<text x="595" y="240" text-anchor="middle" class="cap">result serait pendant — erreur de compilation</text>
<path d="M595,192 L595,204" marker-end="url(#mm2b-arrow-ac-fr)"/>
<!-- time axis -->
<path d="M180,270 L756,270" marker-end="url(#mm2b-arrow-fr)"/>
<text x="210" y="288" text-anchor="middle" class="cap">let s1</text>
<text x="340" y="288" text-anchor="middle" class="cap">{ let s2</text>
<text x="470" y="288" text-anchor="middle" class="cap">longest(&amp;s1, &amp;s2)</text>
<text x="600" y="288" text-anchor="middle" class="cap">}</text>
<text x="710" y="288" text-anchor="middle" class="cap">usage de result</text>
</svg>
</div>

## Pourquoi pas de garbage collector ?
- **Abstractions sans coût** : Pas de surcharge à l'exécution.
- **Performance prévisible** : La mémoire est libérée de façon déterministe.
- **Pas de pauses** : Contrairement aux langages avec GC (Java, Go).


**Ownership** : Évite les fuites mémoire.  
**Borrowing** : Évite les data races.  
**Lifetimes** : Évite les pointeurs pendants.

Le modèle de Rust assure la sécurité mémoire sans vérifications à l'exécution, ce qui le rend à la fois sûr et rapide.