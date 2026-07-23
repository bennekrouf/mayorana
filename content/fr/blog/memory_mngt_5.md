---
id: dangling-pointer-rust-fr
title: >-
  Qu'est-ce qu'un dangling pointer, et comment Rust le prévient-il au moment de
  la compilation ?
slug: dangling-pointer-rust-fr
locale: fr
date: '2025-08-25'
author: mayo
excerpt: Rust memory et string
content_focus: rust memory et string
technical_level: Discussion technique expert

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

## Comment Rust Prévient les Dangling Pointers

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

## Pourquoi C'est Important

| **Langage** | **Risque Dangling Pointer** | **Mécanisme de Sécurité** |
|-------------|------------------------------|---------------------------|
| C/C++       | Élevé (gestion mémoire manuelle) | Aucun (responsabilité du programmeur) |
| Rust        | Zéro                         | Vérifications compile-time (ownership + lifetimes) |

## Points Clés

✅ Le compilateur de Rust garantit :
- Pas de références vers mémoire libérée.
- Pas de comportement indéfini depuis dangling pointers.
- Sécurité sans overhead runtime.

**Impact Réel** : Les crates comme `hyper` (HTTP) et `tokio` (async) s'appuient sur ces garanties pour du code sécurisé et performant.
