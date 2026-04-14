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

## Points clés

✅ `value.clamp(min, max)` borne une valeur en un seul appel — pas besoin de logique `if` manuelle.

✅ Disponible dans la bibliothèque standard de Rust depuis la version 1.50, pour les entiers et les flottants.

✅ C++ a l'équivalent depuis C++17 ; JavaScript et C nécessitent encore des implémentations manuelles.

🚫 Ne pas confondre `clamp` avec `saturating_add` / `saturating_sub` — ceux-ci empêchent l'overflow d'entiers aux limites du type, pas des bornes personnalisées arbitraires.

**Expérience de pensée** : Que se passe-t-il si on appelle `value.clamp(max, min)` — avec `min` et `max` inversés ?
**Réponse** : Rust panique en mode debug (`min > max` est explicitement vérifié). Toujours s'assurer que `min ≤ max`.
