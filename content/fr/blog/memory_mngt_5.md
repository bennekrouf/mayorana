---
id: dangling-pointer-rust-fr
title: >-
  Qu'est-ce qu'un dangling pointer, et comment Rust le prévient-il au moment de
  la compilation ?
slug: dangling-pointer-rust-fr
locale: fr
date: '2025-08-25'
author: mayo
excerpt: >-
  Pourquoi un dangling pointer est une erreur de compilation en Rust plutôt
  qu'un crash en production, et comment les lifetimes rendent ce contrôle
  possible.

tags:
  - rust
  - memory
  - dangling-pointer
  - ownership
  - lifetimes
---

# Qu'est-ce qu'un dangling pointer, et comment Rust le prévient-il au moment de la compilation ?

Un **dangling pointer** survient quand un pointeur référence de la mémoire qui a déjà été libérée, menant à un comportement indéfini comme des crashes ou vulnérabilités de sécurité. Dans des langages comme C/C++, c'est un problème courant :

```c
int* create_int() {
    int x = 5;  // `x` vit sur le stack
    return &x;  // Retourne un pointeur vers `x`...
}  // `x` est détruit ici (dangling pointer retourné !)
```

Étape par étape, voici ce que fait le stack dans cette fonction C — et pourquoi le pointeur retourné est déjà invalide avant même que l'appelant le lise :

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm5b-fig" viewBox="0 0 800 250" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Trois instantanés du stack montrant create_int empilant une frame contenant x, retournant son adresse, puis la frame dépilée si bien que le pointeur de l'appelant désigne de la mémoire récupérée">
<style>
.mm5b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .mm5b-fig,[data-theme="dark"] .mm5b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.mm5b-fig .frame{fill:var(--bg);stroke:var(--ln);stroke-width:1.5}
.mm5b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm5b-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm5b-fig .deadbox{fill:none;stroke:var(--mut);stroke-width:1.5;stroke-dasharray:4 3}
.mm5b-fig .title{font:700 13px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm5b-fig .body{font:600 12px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm5b-fig .cap{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
.mm5b-fig .ac{fill:var(--ac)}
.mm5b-fig .mut{fill:var(--mut)}
.mm5b-fig path{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="mm5b-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ln);stroke:none"/></marker>
<marker id="mm5b-arrowac" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ac);stroke:none"/></marker>
</defs>
<!-- step 1 -->
<text x="135" y="26" text-anchor="middle" class="title">1. frame empilée</text>
<rect x="22" y="42" width="226" height="138" rx="8" class="frame"/>
<rect x="30" y="52" width="210" height="52" rx="6" class="box"/>
<text x="135" y="72" text-anchor="middle" class="body">frame appelante</text>
<text x="135" y="90" text-anchor="middle" class="cap">int* p ; pas encore défini</text>
<rect x="30" y="118" width="210" height="52" rx="6" class="box"/>
<text x="135" y="138" text-anchor="middle" class="body">frame create_int</text>
<text x="135" y="156" text-anchor="middle" class="cap">x = 5 vit ici</text>
<!-- step 2 -->
<text x="395" y="26" text-anchor="middle" class="title">2. return &amp;x</text>
<rect x="282" y="42" width="226" height="138" rx="8" class="frame"/>
<rect x="290" y="52" width="210" height="52" rx="6" class="box"/>
<text x="395" y="72" text-anchor="middle" class="body">frame appelante</text>
<text x="395" y="90" text-anchor="middle" class="cap">p = adresse de x</text>
<rect x="290" y="118" width="210" height="52" rx="6" class="box"/>
<text x="395" y="138" text-anchor="middle" class="body">frame create_int</text>
<text x="395" y="156" text-anchor="middle" class="cap">x = 5 encore vivant</text>
<!-- step 3 -->
<text x="655" y="26" text-anchor="middle" class="title">3. frame dépilée</text>
<rect x="542" y="42" width="226" height="138" rx="8" class="frame"/>
<rect x="550" y="52" width="210" height="52" rx="6" class="acbox"/>
<text x="655" y="72" text-anchor="middle" class="body ac">p garde l'adresse</text>
<text x="655" y="90" text-anchor="middle" class="cap">rien ne l'a invalidé</text>
<rect x="550" y="118" width="210" height="52" rx="6" class="deadbox"/>
<text x="655" y="138" text-anchor="middle" class="body mut">emplacement récupéré</text>
<text x="655" y="156" text-anchor="middle" class="cap">réutilisé au prochain appel</text>
<!-- transitions -->
<path d="M248,111 L282,111" marker-end="url(#mm5b-arrow)"/>
<path d="M508,111 L542,111" marker-end="url(#mm5b-arrow)"/>
<!-- the dangling pointer itself -->
<path d="M760,78 C792,78 792,144 762,144" style="stroke:var(--ac)" marker-end="url(#mm5b-arrowac)"/>
<!-- caption -->
<text x="400" y="208" text-anchor="middle" class="cap">C compile cela sans broncher : le pointeur survit à la frame qu'il désigne.</text>
<text x="400" y="228" text-anchor="middle" class="cap">Rust rejette l'étape 2 d'emblée, donc l'étape 3 ne peut jamais arriver.</text>
</svg>
</div>

Rust élimine les dangling pointers au moment de la compilation en utilisant son modèle d'ownership et système de lifetimes, assurant la memory safety sans overhead runtime.

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm5-fig" viewBox="0 0 800 260" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Retourner une référence vers une variable locale est rejeté par le borrow checker, tandis que lier le lifetime de retour au paramètre d'entrée est accepté">
<style>
.mm5-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00;--bad:#ef4444}
:root.dark .mm5-fig,[data-theme="dark"] .mm5-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569;--bad:#f87171}
.mm5-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm5-fig .badbox{fill:var(--box);stroke:var(--bad);stroke-width:2}
.mm5-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm5-fig .title{font:700 13px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm5-fig .body{font:600 12px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm5-fig .cap{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
.mm5-fig .bad{fill:var(--bad)}
.mm5-fig .ac{fill:var(--ac)}
.mm5-fig path{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="mm5-arrow-bad-fr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--bad)"/></marker>
<marker id="mm5-arrow-ac-fr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ac)"/></marker>
</defs>
<!-- rejected path -->
<text x="200" y="24" text-anchor="middle" class="title">Rejeté</text>
<rect x="60" y="40" width="280" height="60" rx="8" class="box"/>
<text x="200" y="65" text-anchor="middle" class="body">fn dangling() { let s = ..; }</text>
<text x="200" y="82" text-anchor="middle" class="cap">s droppé en fin de scope</text>
<rect x="60" y="130" width="280" height="60" rx="8" class="badbox"/>
<text x="200" y="155" text-anchor="middle" class="body bad">return &amp;s</text>
<text x="200" y="172" text-anchor="middle" class="cap">erreur compile-time : référence pendante</text>
<path d="M200,100 L200,130" marker-end="url(#mm5-arrow-bad-fr)"/>
<!-- accepted path -->
<text x="600" y="24" text-anchor="middle" class="title">Accepté</text>
<rect x="460" y="40" width="280" height="60" rx="8" class="box"/>
<text x="600" y="65" text-anchor="middle" class="body">fn valid&lt;'a&gt;(s: &amp;'a String)</text>
<text x="600" y="82" text-anchor="middle" class="cap">lifetime d'entrée 'a emprunté</text>
<rect x="460" y="130" width="280" height="60" rx="8" class="acbox"/>
<text x="600" y="155" text-anchor="middle" class="body ac">-&gt; &amp;'a String { s }</text>
<text x="600" y="172" text-anchor="middle" class="cap">sortie liée aux données de l'appelant</text>
<path d="M600,100 L600,130" style="stroke:var(--ac)" marker-end="url(#mm5-arrow-ac-fr)"/>
<!-- caption -->
<text x="400" y="230" text-anchor="middle" class="cap">Le borrow checker rejette les références qui survivent au scope de leurs données</text>
</svg>
</div>

## Comment Rust prévient les dangling pointers
Rust utilise deux mécanismes clés pour prévenir les dangling pointers :

### 1. Règles d'Ownership + Borrowing

- **Règle** : Les références (`&T` ou `&mut T`) ne doivent pas survivre aux données qu'elles pointent.
- **Appliqué par** : Le borrow checker, qui track les scopes de variables et assure que les références restent valides.

**Exemple : Rejeté au Compile Time** :
```rust
fn dangling() -> &String {  // Spécificateur de lifetime manquant !
    let s = String::from("hello");
    &s  // ERREUR: `s` meurt à la fin de la fonction
}       // Compiler: "returns a reference to dropped data"
```

**Corrigé avec Lifetimes** (Garantie Explicite) :
```rust
fn valid_reference<'a>(s: &'a String) -> &'a String {
    s  // OK: Référence retournée liée au lifetime de l'input
}
```

### 2. Annotations de Lifetime

- Rust nécessite des **déclarations de lifetime explicites** (`'a`) quand les références traversent les frontières de scope.
- Le compilateur assure que toutes les références obéissent à leurs lifetimes assignés, prévenant les références vers mémoire libérée.

**Exemple : Struct avec Référence** :
```rust
struct Book<'a> {  // Doit déclarer lifetime
    title: &'a str  // Référence doit vivre aussi longtemps que `Book`
}

fn main() {
    let title = String::from("Rust");
    let book = Book { title: &title };
    // `book.title` ne peut pas survivre à `title`
}
```

## Pourquoi C'est important

| **Langage** | **Risque Dangling Pointer** | **Mécanisme de Sécurité** |
|-------------|------------------------------|---------------------------|
| C/C++       | Élevé (gestion mémoire manuelle) | Aucun (responsabilité du programmeur) |
| Rust        | Zéro                         | Vérifications compile-time (ownership + lifetimes) |

## Pourquoi ça ne peut jamais compiler
Le compilateur de Rust garantit :
- Pas de références vers mémoire libérée.
- Pas de comportement indéfini depuis dangling pointers.
- Sécurité sans overhead runtime.

**Impact Réel** : Les crates comme `hyper` (HTTP) et `tokio` (async) s'appuient sur ces garanties pour du code sécurisé et performant.
