---
id: stack-heap-allocation-rust-fr
title: 'Stack vs. Heap en Rust: Où Vivent tes Données ?'
slug: stack-heap-allocation-rust-fr
locale: fr
date: '2025-10-01'
author: mayo
excerpt: Rust memory et string
content_focus: rust memory et string
technical_level: Discussion technique expert

tags:
  - rust
  - memory
  - stack
  - heap
  - allocation
---

# Quelle est la différence entre allocation stack et heap en Rust ? Comment Rust décide-t-il où allouer les données ?

Rust utilise l'allocation stack et heap pour gérer la mémoire, avec des caractéristiques distinctes pour chacune. Comprendre leurs différences et comment Rust décide où allouer les données est clé pour écrire du code efficace et sûr.

<div class="svg-container" style="margin:2rem 0;">
<svg class="mm3-fig" viewBox="0 0 800 300" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Frames de stack contenant des valeurs taille fixe et un pointeur, qui indirecte vers un buffer alloué sur le heap">
<style>
.mm3-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .mm3-fig,[data-theme="dark"] .mm3-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.mm3-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.mm3-fig .acbox{fill:var(--box);stroke:var(--ac);stroke-width:2}
.mm3-fig .title{font:700 14px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm3-fig .body{font:600 12px ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.mm3-fig .cap{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--mut)}
.mm3-fig .ac{fill:var(--ac)}
.mm3-fig path{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="mm3-arrow-fr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--ac)"/></marker>
</defs>
<!-- column titles -->
<text x="180" y="26" text-anchor="middle" class="title">Stack (LIFO, taille fixe)</text>
<text x="600" y="26" text-anchor="middle" class="title">Heap (taille dynamique)</text>
<!-- stack frames -->
<rect x="60" y="46" width="240" height="50" rx="6" class="box"/>
<text x="180" y="76" text-anchor="middle" class="body">let x = 5;  (i32)</text>
<rect x="60" y="106" width="240" height="50" rx="6" class="box"/>
<text x="180" y="136" text-anchor="middle" class="body">let s = String::from(..)</text>
<rect x="60" y="166" width="240" height="50" rx="6" class="acbox"/>
<text x="180" y="196" text-anchor="middle" class="body ac">boxed: ptr ●</text>
<!-- heap blocks -->
<rect x="480" y="106" width="240" height="50" rx="6" class="box"/>
<text x="600" y="136" text-anchor="middle" class="cap">"heap" (octets String)</text>
<rect x="480" y="180" width="240" height="60" rx="6" class="acbox"/>
<text x="600" y="205" text-anchor="middle" class="body ac">42</text>
<text x="600" y="223" text-anchor="middle" class="cap">Box::new(42)</text>
<!-- arrows: pointers indirect into heap -->
<path d="M300,131 L480,131" marker-end="url(#mm3-arrow-fr)"/>
<path d="M300,191 L480,210" style="stroke:var(--ac)" marker-end="url(#mm3-arrow-fr)"/>
</svg>
</div>

## Stack vs. Heap en Rust

| **Stack** | **Heap** |
|-----------|----------|
| Allocation/désallocation rapide (LIFO). | Allocation plus lente (dynamique). |
| Taille fixe, connue au moment de la compilation. | Taille peut grandir (ex : `String`, `Vec`). |
| Cleanup automatique (pas de `free()` nécessaire). | Gestion manuelle (via trait `Drop`). |
| Utilisé pour types primitifs (`i32`, `bool`), petites structs. | Utilisé pour données larges, dynamiques (`String`, `Box<T>`). |

## Comment Rust Décide Où Allouer

### Par Défaut → Stack

Si un type a une **taille fixe** (ex : `i32`, arrays, structs sans `String`/`Vec`), il est alloué sur le **stack**.

**Exemple** :
```rust
let x = 5; // Stack (i32 est taille fixe)
```

### Allocation Heap Explicite

Utilise des types comme `Box<T>`, `String`, `Vec`, etc., pour allouer sur le **heap**.

**Exemple** :
```rust
let s = String::from("heap"); // Heap (string UTF-8 extensible)
let boxed = Box::new(42);     // Heap (Box<T>)
```

## Move Semantics

Quand une valeur est **moved**, ses données heap sont transférées, pas copiées, assurant une gestion mémoire efficace.

**Exemple** :
```rust
let s1 = String::from("hello"); // Heap-allocated
let s2 = s1; // Move ownership (données heap pas copiées)
// println!("{}", s1); // ERREUR: s1 est invalidé
```

## Points Clés

✅ **Stack** : Rapide, taille fixe, automatique.  
✅ **Heap** : Flexible, dynamique, manuel (via smart pointers).  
✅ Rust privilégie le stack mais utilise le heap pour données extensibles/taille inconnue.

**Suivi** : Quand forcerais-tu l'allocation heap ?
- Pour de grosses structs (éviter stack overflow).
- Quand tu as besoin de dynamic dispatch (ex : `Box<dyn Trait>`).
- Pour partager ownership entre threads (`Arc<T>`).
