---
id: trait-bounds-rust
title: Trait Bounds
slug: trait-bounds-rust
locale: fr
date: '2025-10-21'
author: mayo
excerpt: >-
  Utilisation des trait bounds en Rust pour la sécurité de type et les
  performances dans les calculs mathématiques
tags:
  - rust
  - generics
  - trait-bounds
  - monomorphization
  - performance
---

# Trait Bounds

Dans une bibliothèque Rust sensible aux performances pour les calculs mathématiques, les trait bounds comme `T: Add + Mul` assurent la sécurité de type et maximisent les performances en restreignant les types génériques à ceux qui supportent les opérations requises, permettant un code efficace et spécifique au type via la monomorphization.

<div class="svg-container" style="margin:2rem 0;">
<svg class="td2-fig" viewBox="0 0 800 280" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Flux d'une fonction générique dot_product avec bounds vers la monomorphization puis du code machine spécialisé pour f32 et i32">
<style>
.td2-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .td2-fig,[data-theme="dark"] .td2-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.td2-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.td2-fig .boxAc{fill:var(--box);stroke:var(--ac);stroke-width:2}
.td2-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td2-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td2-fig .mut{fill:var(--mut);font:600 11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td2-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.td2-fig .lnAc{stroke:var(--ac);stroke-width:2;fill:none}
</style>
<!-- markers -->
<defs>
<marker id="td2-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
<marker id="td2-arrowAc-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ac)"/></marker>
</defs>
<!-- generic function -->
<rect class="box" x="240" y="20" width="320" height="46" rx="6"/>
<text x="400" y="42" class="tx">dot_product&lt;T: Add+Mul+Default+Copy&gt;</text>
<text x="400" y="58" class="mut">où T::Output = T</text>
<!-- arrow down to monomorphization -->
<path class="lnAc" d="M400,66 L400,92" marker-end="url(#td2-arrowAc-fr)"/>
<rect class="boxAc" x="280" y="93" width="240" height="40" rx="6"/>
<text x="400" y="118" class="tx">Monomorphization</text>
<!-- Y-merge split to two specialized versions -->
<path class="ln" d="M400,133 L400,150 L220,150 L220,168" marker-end="url(#td2-arrow-fr)"/>
<path class="ln" d="M400,150 L580,150 L580,168" marker-end="url(#td2-arrow-fr)"/>
<!-- f32 box -->
<rect class="box" x="80" y="169" width="280" height="70" rx="6"/>
<text x="220" y="192" class="tx">Version f32</text>
<text x="220" y="210" class="mut">fldz / fmul / fadd</text>
<text x="220" y="226" class="mut">inliné, sans appels</text>
<!-- i32 box -->
<rect class="box" x="440" y="169" width="280" height="70" rx="6"/>
<text x="580" y="192" class="tx">Version i32</text>
<text x="580" y="210" class="mut">xor / imul / add</text>
<text x="580" y="226" class="mut">inliné, sans appels</text>
<!-- caption -->
<text x="400" y="265" class="mut">Un seul corps générique, des chemins de code natifs séparés par T — pas de vtable</text>
</svg>
</div>

## Exemple : fonction de produit scalaire

Considère une fonction de produit scalaire pour deux vecteurs, critique dans le traitement du signal ou l'apprentissage automatique :

```rust
use std::ops::{Add, Mul};

fn dot_product<T>(a: &[T], b: &[T]) -> T
where
    T: Add<Output = T> + Mul<Output = T> + Default + Copy,
{
    assert_eq!(a.len(), b.len());
    let mut sum = T::default();
    for i in 0..a.len() {
        sum = sum + (a[i] * b[i]);
    }
    sum
}

// Usage
fn main() {
    let v1 = vec![1.0, 2.0, 3.0];
    let v2 = vec![4.0, 5.0, 6.0];
    let result = dot_product(&v1, &v2); // 32.0 (1*4 + 2*5 + 3*6)
    println!("{}", result);
}
```

## Application des Trait Bounds

- `T: Add<Output = T>` : S'assure que `T` supporte `+` et retourne `T`, permettant `sum + ...`.
- `T: Mul<Output = T>` : S'assure que `T` supporte `*` et retourne `T`, activant `a[i] * b[i]`.
- `T: Default` : Fournit une valeur de départ similaire à zéro pour `sum`, commune pour les types numériques.
- `T: Copy` : Permet la copie sur la pile des valeurs `T` (ex : `a[i]`), évitant le clonage coûteux ou les références pour les primitives comme `f32`.

<div class="svg-container" style="margin:2rem 0;">
<svg class="td2b-fig" viewBox="0 0 800 290" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Chaque trait bound de dot_product correspond à la ligne du corps de la fonction qu'il rend légale">
<style>
.td2b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .td2b-fig,[data-theme="dark"] .td2b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.td2b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.td2b-fig .boxAc{fill:var(--box);stroke:var(--ac);stroke-width:2}
.td2b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td2b-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td2b-fig .mut{fill:var(--mut);font:600 11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td2b-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.td2b-fig .lnAc{stroke:var(--ac);stroke-width:2;fill:none}
</style>
<!-- markers -->
<defs>
<marker id="td2b-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
<marker id="td2b-arrowAc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ac)"/></marker>
</defs>
<!-- headers -->
<text x="165" y="24" class="ti">Bound</text>
<text x="595" y="24" class="ti">La ligne qu'il rend légale</text>
<!-- row 1: Add -->
<rect class="box" x="40" y="44" width="250" height="40" rx="6"/>
<text x="165" y="69" class="tx">T: Add&lt;Output = T&gt;</text>
<path class="ln" d="M290,64 L428,64" marker-end="url(#td2b-arrow)"/>
<rect class="box" x="430" y="44" width="330" height="40" rx="6"/>
<text x="595" y="69" class="tx">sum = sum + …  (reste T)</text>
<!-- row 2: Mul -->
<rect class="box" x="40" y="96" width="250" height="40" rx="6"/>
<text x="165" y="121" class="tx">T: Mul&lt;Output = T&gt;</text>
<path class="ln" d="M290,116 L428,116" marker-end="url(#td2b-arrow)"/>
<rect class="box" x="430" y="96" width="330" height="40" rx="6"/>
<text x="595" y="121" class="tx">a[i] * b[i]</text>
<!-- row 3: Default -->
<rect class="box" x="40" y="148" width="250" height="40" rx="6"/>
<text x="165" y="173" class="tx">T: Default</text>
<path class="ln" d="M290,168 L428,168" marker-end="url(#td2b-arrow)"/>
<rect class="box" x="430" y="148" width="330" height="40" rx="6"/>
<text x="595" y="173" class="tx">let mut sum = T::default()</text>
<!-- row 4: Copy -->
<rect class="boxAc" x="40" y="200" width="250" height="40" rx="6"/>
<text x="165" y="225" class="tx">T: Copy</text>
<path class="lnAc" d="M290,220 L428,220" marker-end="url(#td2b-arrowAc)"/>
<rect class="boxAc" x="430" y="200" width="330" height="40" rx="6"/>
<text x="595" y="225" class="tx">lire a[i] sans move, sans clone</text>
<!-- caption -->
<text x="400" y="270" class="mut">Retire un bound et c'est exactement cette ligne qui ne compile plus — rien n'attend l'exécution</text>
</svg>
</div>

## Assurer la sécurité de type

- **Vérifications pendant la compilation** : Les bounds rejettent les types invalides pendant la compilation. Par exemple :
  ```rust
  let strings = vec!["a", "b"];
  dot_product(&strings, &strings); // Erreur : String n'implémente pas Add/Mul
  ```
  Cela prévient les erreurs à l'exécution, crucial pour une bibliothèque où les utilisateurs fournissent des types divers.
- **Exactitude** : `Output = T` s'assure que les opérations s'enchaînent sans incompatibilités de type (ex : pas d'`Option` ou `Result` inattendu).

## Assurer les performances

- **Dispatch statique** : Les bounds activent le dispatch statique via les generics. Le compilateur fait la monomorphization de `dot_product` pour chaque `T`, générant du code spécialisé (ex : un pour `f32`, un autre pour `i32`).
- **Inlining** : Les petites opérations comme `+` et `*` (de `Add` et `Mul`) sont inlined, réduisant l'overhead d'appel et activant les optimisations de boucle (ex : unrolling ou SIMD si `T` est une primitive).
- **Pas d'overhead d'abstraction** : Contrairement à `dyn Trait`, il n'y a pas de vtable—du code machine pur adapté à `T`.

## Impact sur la Monomorphization

La monomorphization duplique la fonction générique pour chaque type concret utilisé :

- **Pour `f32`** :
  ```asm
  ; Pseudocode assembleur
  fldz                ; sum = 0.0
  loop:
    fld [rsi + rax*4] ; Charge a[i]
    fmul [rdi + rax*4]; Multiplie avec b[i]
    fadd st(0), st(1) ; Ajoute à sum
    inc rax
    cmp rax, rcx
    jl loop
  ```

- **Pour `i32`** :
  ```asm
  xor eax, eax       ; sum = 0
  loop:
    mov ebx, [rsi + rcx*4] ; Charge a[i]
    imul ebx, [rdi + rcx*4]; Multiplie avec b[i]
    add eax, ebx       ; Ajoute à sum
    inc rcx
    cmp rcx, rdx
    jl loop
  ```

**Résultat** : Chaque version utilise des instructions natives pour les opérations de `T`, sans vérifications de type à l'exécution ou indirection.

## Compromis et considérations

- **Taille du code** : La monomorphization augmente la taille du binaire (ex : code séparé pour `f32`, `i32`, `f64`). Dans une bibliothèque avec beaucoup de types ou fonctions, cela pourrait gonfler l'exécutable, potentiellement nuisant à l'efficacité du cache d'instructions.
- **Temps de compilation** : Plus d'instances monomorphisées signifient des builds plus longs, bien que ce soit un coût unique.
- **Atténuation** : Utilise les bounds judicieusement—ex : `T: Copy` évite les références pour les primitives mais exclut les types complexes. Pour un usage plus large, considère `T: Clone` comme alternative, avec un compromis de performance.

## Vérification

- **Benchmark** : Utilise `criterion` pour confirmer les performances :
  ```rust
  use criterion::{black_box, Criterion};
  fn bench(c: &mut Criterion) {
      let v1 = vec![1.0_f32; 1000];
      let v2 = vec![2.0_f32; 1000];
      c.bench_function("dot_product_f32", |b| b.iter(|| dot_product(black_box(&v1), black_box(&v2))));
  }
  ```
  Attends-toi à des temps serrés et cohérents (ex : 1µs) grâce à l'inlining et aux opérations natives.
- **Assembleur** : `cargo rustc --release -- --emit asm` montre des boucles optimisées, pas d'appels.

## Conclusion

Les trait bounds comme `T: Add + Mul + Default + Copy` dans `dot_product` appliquent la sécurité (seulement les types numériques) et les performances (code statique, inlined). La monomorphization transforme cela en code machine spécifique au type, idéal pour une bibliothèque mathématique. Équilibrer ces bounds assure une API flexible mais efficace, avec du profiling pour éviter les coûts cachés.
