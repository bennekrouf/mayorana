---
id: clamp-rust-fr
title: "Qu'est-ce que `clamp` en Rust, et quand l'utiliser ?"
slug: clamp-rust
locale: fr
date: '2026-04-14'
author: mayo
excerpt: Bibliothèque standard Rust

tags:
  - rust
  - standard-library
  - basics
---

# Qu'est-ce que `clamp` en Rust, et quand l'utiliser ?

`clamp` est une fonction qui "coince" une valeur entre un minimum et un maximum :

```
Si valeur < min → retourne min
Si valeur > max → retourne max
Sinon           → retourne valeur
```

C'est exactement comme un étau : la valeur ne peut pas sortir des bornes que tu lui donnes.

<div class="svg-container" style="margin:2rem 0;">
<svg class="clamp-fig" viewBox="0 0 800 300" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="clamp évalue une valeur par rapport à min et max, puis fusionne les trois issues en une seule valeur de retour bornée">
<style>
.clamp-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .clamp-fig,[data-theme="dark"] .clamp-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.clamp-fig text{font-family:ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.clamp-fig .title{font-size:14px;font-weight:700}
.clamp-fig .body{font-size:12px;font-weight:600}
.clamp-fig .cap{font-size:11px;fill:var(--mut)}
.clamp-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.clamp-fig .acbox{fill:var(--ac);stroke:var(--ac)}
.clamp-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="clamp-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"></path>
</marker>
</defs>
<!-- input -->
<rect class="box" x="300" y="15" width="200" height="45" rx="8"></rect>
<text x="400" y="43" text-anchor="middle" class="body">valeur</text>
<!-- fan out to 3 branches -->
<path class="ln" d="M400,60 L400,85"></path>
<path class="ln" d="M160,85 L640,85"></path>
<path class="ln" d="M160,85 L160,110" marker-end="url(#clamp-arrow-fr)"></path>
<path class="ln" d="M400,85 L400,110" marker-end="url(#clamp-arrow-fr)"></path>
<path class="ln" d="M640,85 L640,110" marker-end="url(#clamp-arrow-fr)"></path>
<!-- branch boxes -->
<rect class="box" x="60" y="110" width="200" height="55" rx="8"></rect>
<text x="160" y="133" text-anchor="middle" class="body">valeur &lt; min</text>
<text x="160" y="150" text-anchor="middle" class="cap">→ retourne min</text>
<rect class="box" x="300" y="110" width="200" height="55" rx="8"></rect>
<text x="400" y="133" text-anchor="middle" class="body">min ≤ valeur ≤ max</text>
<text x="400" y="150" text-anchor="middle" class="cap">→ retourne valeur</text>
<rect class="box" x="540" y="110" width="200" height="55" rx="8"></rect>
<text x="640" y="133" text-anchor="middle" class="body">valeur &gt; max</text>
<text x="640" y="150" text-anchor="middle" class="cap">→ retourne max</text>
<!-- merge into single call -->
<path class="ln" d="M160,165 L160,195"></path>
<path class="ln" d="M400,165 L400,195"></path>
<path class="ln" d="M640,165 L640,195"></path>
<path class="ln" d="M160,195 L640,195"></path>
<path class="ln" d="M400,195 L400,220" marker-end="url(#clamp-arrow-fr)"></path>
<!-- output accent -->
<rect class="acbox" x="280" y="220" width="240" height="50" rx="8"></rect>
<text x="400" y="250" text-anchor="middle" class="body" fill="#ffffff">value.clamp(min, max)</text>
</svg>
</div>

## Dans ton code

```rust
let x0 = cx.floor().clamp(0.0, (src_w - 1) as f32) as usize;
```

Cette ligne fait trois choses :

1. `cx.floor()` — arrondit à l'inférieur (ex : `5.7 → 5.0`)
2. `.clamp(0.0, src_w - 1)` — bloque entre `0` et l'index maximum valide
3. `as usize` — convertit en entier non-signé pour l'utiliser comme index de tableau

Exemples concrets avec `src_w = 100` :

| `cx` | `cx.floor()` | Après `.clamp(0.0, 99.0)` | `as usize` |
|---|---|---|---|
| `-0.3` | `-1.0` | `0.0` — en dessous du min, coincé | `0` |
| `99.8` | `99.0` | `99.0` — dans les bornes | `99` |
| `150.0` | `150.0` | `99.0` — au dessus du max, coincé | `99` |

## C'est une fonction standard ?

### Rust

Oui ! `clamp` fait partie de la bibliothèque standard depuis **Rust 1.50** (février 2021). Elle existe pour les entiers et les flottants :

```rust
assert_eq!(5.clamp(0, 10), 5);      // dans les bornes → inchangé
assert_eq!((-3).clamp(0, 10), 0);   // trop petit → retourne min
assert_eq!(15.clamp(0, 10), 10);    // trop grand → retourne max

// Avec des flottants
assert_eq!((-3.0_f32).clamp(0.0, 10.0), 0.0);
```

### C++

Oui — `std::clamp` existe depuis **C++17**, dans `<algorithm>` :

```cpp
#include <algorithm>

int x = std::clamp(15, 0, 10);  // x = 10
```

### JavaScript (Node.js)

Non — il n'y a pas de `clamp` natif en JavaScript. Tu dois l'écrire toi-même :

```javascript
// Version classique
function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

// Arrow function
const clamp = (v, min, max) => Math.max(min, Math.min(v, max));

clamp(-3, 0, 10);  // 0
clamp(15, 0, 10);  // 10
clamp(5,  0, 10);  // 5
```

Des bibliothèques tierces (Lodash, etc.) l'implémentent, mais rien dans le langage de base.

### C

Non — il n'y a pas de `clamp` standard en C. Tu dois l'écrire manuellement :

```c
int clamp(int value, int min, int max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}

float clampf(float value, float min, float max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}
```

## Tableau récapitulatif

| **Langage** | **`clamp` natif ?** | **Comment faire** |
|---|---|---|
| Rust | ✅ Oui (std, depuis 1.50) | `value.clamp(min, max)` |
| C++ | ✅ Oui (C++17, `<algorithm>`) | `std::clamp(value, min, max)` |
| JavaScript | ❌ Non | `Math.max(min, Math.min(value, max))` |
| C | ❌ Non | Fonction maison avec `if` |

## Pourquoi c'est utile ?

`clamp` évite les erreurs de bord. Dans le redimensionnement d'image, les coordonnées calculées en virgule flottante peuvent sortir de la plage des index valides :

```
Sans clamp : cx = -0.3 → floor → -1 → cast en usize → usize::MAX ou panique
Avec clamp : cx = -0.3 → floor → -1.0 → clampé à 0.0 → 0 → toujours valide
```

C'est plus lisible et plus sûr que d'écrire des `if` partout dans ton code.

<div class="svg-container" style="margin:2rem 0;">
<svg class="clampb-fig" viewBox="0 0 800 260" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Une coordonnée interpolée négative castée en usize repasse à un index énorme et panique, alors que clamper avant le cast la garde dans la plage valide">
<!-- style -->
<style>
.clampb-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00;--bad:#e11d48}
:root.dark .clampb-fig,[data-theme="dark"] .clampb-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.clampb-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.clampb-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.clampb-fig .boxbad{fill:var(--box);stroke:var(--bad);stroke-width:2}
.clampb-fig .ti{fill:var(--tx);font:700 13px ui-sans-serif,system-ui,sans-serif}
.clampb-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.clampb-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.clampb-fig .bad{fill:var(--bad);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.clampb-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.clampb-fig .lnbad{stroke:var(--bad);stroke-width:1.5;fill:none}
.clampb-fig .lnac{stroke:var(--ac);stroke-width:2;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="clampb-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
<marker id="clampb-arrowbad-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--bad)"/></marker>
<marker id="clampb-arrowac-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ac)"/></marker>
</defs>
<!-- top row: without clamp -->
<text x="20" y="30" class="ti">Sans clamp — c'est le cast qui casse</text>
<rect x="20" y="44" width="150" height="42" rx="5" class="box"/>
<text x="95" y="70" class="tx">cx = -0.3</text>
<path d="M170,65 L200,65" class="ln" marker-end="url(#clampb-arrow-fr)"/>
<rect x="200" y="44" width="150" height="42" rx="5" class="box"/>
<text x="275" y="70" class="tx">floor → -1</text>
<path d="M350,65 L380,65" class="lnbad" marker-end="url(#clampb-arrowbad-fr)"/>
<rect x="380" y="44" width="180" height="42" rx="5" class="boxbad"/>
<text x="470" y="63" class="tx">as usize</text>
<text x="470" y="79" class="mut">aucun négatif n'existe</text>
<path d="M560,65 L590,65" class="lnbad" marker-end="url(#clampb-arrowbad-fr)"/>
<rect x="590" y="44" width="190" height="42" rx="5" class="boxbad"/>
<text x="685" y="63" class="bad">18446744073709551615</text>
<text x="685" y="79" class="mut">index hors bornes → panique</text>
<!-- bottom row: with clamp -->
<text x="20" y="150" class="ti">Avec clamp — borner avant le cast</text>
<rect x="20" y="164" width="150" height="42" rx="5" class="box"/>
<text x="95" y="190" class="tx">cx = -0.3</text>
<path d="M170,185 L200,185" class="ln" marker-end="url(#clampb-arrow-fr)"/>
<rect x="200" y="164" width="150" height="42" rx="5" class="box"/>
<text x="275" y="190" class="tx">floor → -1.0</text>
<path d="M350,185 L380,185" class="lnac" marker-end="url(#clampb-arrowac-fr)"/>
<rect x="380" y="164" width="180" height="42" rx="5" class="boxac"/>
<text x="470" y="183" class="tx">.clamp(0.0, w)</text>
<text x="470" y="199" class="mut">→ 0.0</text>
<path d="M560,185 L590,185" class="ln" marker-end="url(#clampb-arrow-fr)"/>
<rect x="590" y="164" width="190" height="42" rx="5" class="box"/>
<text x="685" y="183" class="tx">as usize → 0</text>
<text x="685" y="199" class="mut">toujours un index valide</text>
<!-- footer -->
<text x="400" y="240" class="mut">Le cast ne peut pas représenter un négatif — le clamp doit avoir lieu tant que la valeur est signée</text>
</svg>
</div>

## Points clés

✅ `value.clamp(min, max)` borne une valeur en un seul appel — pas besoin de logique `if` manuelle.

✅ Disponible dans la bibliothèque standard de Rust depuis la version 1.50, pour les entiers et les flottants.

✅ C++ a l'équivalent depuis C++17 ; JavaScript et C nécessitent encore des implémentations manuelles.

🚫 Ne pas confondre `clamp` avec `saturating_add` / `saturating_sub` — ceux-ci empêchent l'overflow d'entiers aux limites du type, pas des bornes personnalisées arbitraires.

**Expérience de pensée** : Que se passe-t-il si on appelle `value.clamp(max, min)` — avec `min` et `max` inversés ?
**Réponse** : Rust panique en mode debug (`min > max` est explicitement vérifié). Toujours s'assurer que `min ≤ max`.
