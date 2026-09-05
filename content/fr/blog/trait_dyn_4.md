---
id: object-safety-rust
title: >-
  Rendre les Traits Object-Safe pour dyn Trait de Rust dans les Systèmes de
  Plugins
slug: object-safety-rust
locale: fr
date: '2025-12-01'
author: mayo
excerpt: >-
  Comprendre l'object safety en Rust et refactoriser les traits pour le dispatch
  dynamique
tags:
  - rust
  - object-safety
  - dynamic-dispatch
  - traits
  - plugins
---

# Rendre les Traits Object-Safe pour dyn Trait de Rust dans les Systèmes de Plugins

Rust exige que les traits soient **object-safe** pour les utiliser avec `dyn Trait` pour le dispatch dynamique, car cela assure une vtable (table virtuelle) cohérente pour les appels de méthodes à l'exécution. Les traits non-object-safe, comme ceux avec des méthodes génériques ou des exigences statiques, ne peuvent pas être utilisés avec `dyn Trait`, mais ils peuvent être refactorisés pour les systèmes de plugins nécessitant du polymorphisme à l'exécution. Je vais expliquer pourquoi l'object safety est nécessaire et démontrer comment refactoriser un trait non-object-safe pour un système de plugins.

<div class="svg-container" style="margin:2rem 0;">
<svg class="td4-fig" viewBox="0 0 800 320" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Refactorisation d'un trait Transformer non-object-safe en un trait object-safe produisant un fat pointer Box dyn Transformer">
<style>
.td4-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .td4-fig,[data-theme="dark"] .td4-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.td4-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.td4-fig .boxAc{fill:var(--box);stroke:var(--ac);stroke-width:2}
.td4-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td4-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td4-fig .mut{fill:var(--mut);font:600 11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td4-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.td4-fig .lnAc{stroke:var(--ac);stroke-width:2;fill:none}
</style>
<!-- markers -->
<defs>
<marker id="td4-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
<marker id="td4-arrowAc-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ac)"/></marker>
</defs>
<!-- non object safe -->
<rect class="box" x="40" y="30" width="330" height="66" rx="6"/>
<text x="205" y="52" class="tx">transform&lt;T: Into&lt;f64&gt;&gt;(&amp;self, T)</text>
<text x="205" y="70" class="tx">fn new() -&gt; Self</text>
<text x="205" y="86" class="mut">méthode générique + retour Self statique</text>
<!-- X mark to failure -->
<path class="ln" d="M205,96 L205,122" marker-end="url(#td4-arrow-fr)"/>
<rect class="box" x="80" y="123" width="250" height="36" rx="6"/>
<text x="205" y="146" class="tx">Box&lt;dyn Transformer&gt; — échoue</text>
<!-- refactor arrow across -->
<path class="lnAc" d="M375,63 L425,63" marker-end="url(#td4-arrowAc-fr)"/>
<text x="400" y="50" class="mut">refactor</text>
<!-- object safe -->
<rect class="boxAc" x="430" y="30" width="330" height="66" rx="6"/>
<text x="595" y="52" class="tx">transform(&amp;self, value: f64) -&gt; f64</text>
<text x="595" y="70" class="tx">pas de generics, pas de retour Self</text>
<text x="595" y="86" class="mut">fonction factory crée les instances</text>
<path class="lnAc" d="M595,96 L595,122" marker-end="url(#td4-arrowAc-fr)"/>
<rect class="boxAc" x="470" y="123" width="250" height="36" rx="6"/>
<text x="595" y="146" class="tx">Box&lt;dyn Transformer&gt; — fonctionne</text>
<!-- fat pointer layout -->
<path class="ln" d="M595,159 L595,185" marker-end="url(#td4-arrow-fr)"/>
<rect class="box" x="440" y="186" width="140" height="50" rx="6"/>
<text x="510" y="207" class="tx">ptr données</text>
<text x="510" y="223" class="mut">SquareTransformer</text>
<rect class="box" x="590" y="186" width="140" height="50" rx="6"/>
<text x="660" y="207" class="tx">ptr vtable</text>
<text x="660" y="223" class="mut">fn transform</text>
<text x="595" y="260" class="mut">fat pointer : 16 octets (données + vtable)</text>
<text x="205" y="220" class="mut">La vtable exige une seule</text>
<text x="205" y="236" class="mut">signature par méthode — impossible ici</text>
</svg>
</div>

## Pourquoi l'Object Safety Compte

Un trait est **object-safe** si :
- Toutes les méthodes ont un receiver (`&self`, `&mut self`) ou pas de receiver, mais pas static.
- Les méthodes n'utilisent pas `Self` comme type de retour ou paramètre générique (sauf dans les clauses `where`).
- Les méthodes ne sont pas génériques (pas de paramètres `<T>`).

`dyn Trait` utilise un **fat pointer** (pointeur données + pointeur vtable) pour appeler les méthodes à l'exécution. Les traits non-object-safe empêchent la construction de vtable parce que :
- **Méthodes Génériques** : Différents paramètres de type créent des signatures de méthodes variées, rendant impossible une vtable unique.
- **Retours Self** : La taille et le type de `Self` diffèrent par implémenteur, cassant l'uniformité de la vtable.
- **Méthodes Statiques** : Celles-ci manquent d'une instance sur laquelle dispatcher, donc elles ne rentrent pas dans une vtable.

## Exemple : Trait Non-Object-Safe

Considère un système de plugins pour des transformateurs de données :

```rust
trait Transformer {
    fn transform<T: Into<f64>>(&self, value: T) -> f64; // Méthode générique
    fn new() -> Self;                                   // Statique, retourne Self
}

struct SquareTransformer;
impl Transformer for SquareTransformer {
    fn transform<T: Into<f64>>(&self, value: T) -> f64 {
        let v = value.into();
        v * v
    }
    fn new() -> Self { SquareTransformer }
}

// Échoue : Le trait n'est pas object-safe
// let transformer: Box<dyn Transformer> = Box::new(SquareTransformer);
```

**Problèmes** :
- `transform<T>` : Générique, nécessitant une entrée vtable unique par `T`.
- `new()` : Statique avec retour `Self`, variant par implémenteur et manquant de receiver.

## Refactorisé : Version Object-Safe

Pour activer `dyn Trait` pour un système de plugins :

```rust
trait Transformer {
    fn transform(&self, value: f64) -> f64; // Pas de generics, type fixe
}

struct SquareTransformer;
impl Transformer for SquareTransformer {
    fn transform(&self, value: f64) -> f64 {
        value * value
    }
}

// Fonction factory pour l'instanciation
fn create_square_transformer() -> Box<dyn Transformer> {
    Box::new(SquareTransformer)
}

// Usage dans le système de plugins
fn main() {
    let transformer: Box<dyn Transformer> = create_square_transformer();
    let result = transformer.transform(3.0); // 9.0
}
```

### Changements Apportés
- **Supprimé les Generics** : Changé `transform<T: Into<f64>>` en `transform(&self, value: f64)`. La vtable a maintenant une seule entrée fixe : `fn(&self, f64) -> f64`.  
  - **Compromis** : Moins flexible (seulement `f64`, pas `i32` ou `f32`), mais les plugins peuvent convertir les entrées en externe.
- **Supprimé la Méthode Statique** : Retiré `new() -> Self`. Les méthodes statiques n'appartiennent pas aux vtables.  
  - **Solution** : Ajouté une fonction factory (`create_square_transformer`) pour l'instanciation. Un chargeur de plugins pourrait utiliser un registre :
    ```rust
    use std::collections::HashMap;
    let mut plugins: HashMap<String, fn() -> Box<dyn Transformer>> = HashMap::new();
    plugins.insert("square".to_string(), create_square_transformer);
    ```

<div class="svg-container" style="margin:2rem 0;">
<svg class="td4b-fig" viewBox="0 0 800 290" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Un nom de plugin connu à l'exécution est cherché dans le registre de factories, boxé en dyn Transformer, puis appelé via son unique slot de vtable">
<style>
.td4b-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .td4b-fig,[data-theme="dark"] .td4b-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.td4b-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.td4b-fig .boxAc{fill:var(--box);stroke:var(--ac);stroke-width:2}
.td4b-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td4b-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td4b-fig .mut{fill:var(--mut);font:600 11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td4b-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.td4b-fig .lnAc{stroke:var(--ac);stroke-width:2;fill:none}
</style>
<!-- markers -->
<defs>
<marker id="td4b-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
<marker id="td4b-arrowAc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ac)"/></marker>
</defs>
<!-- title -->
<text x="400" y="26" class="ti">D'une chaîne connue à l'exécution à un appel compilé</text>
<!-- step 1 -->
<rect class="box" x="40" y="60" width="200" height="56" rx="6"/>
<text x="140" y="84" class="tx">la config dit "square"</text>
<text x="140" y="104" class="mut">connu seulement à l'exécution</text>
<path class="ln" d="M240,88 L298,88" marker-end="url(#td4b-arrow)"/>
<!-- step 2 -->
<rect class="boxAc" x="300" y="60" width="200" height="56" rx="6"/>
<text x="400" y="84" class="tx">plugins.get("square")</text>
<text x="400" y="104" class="mut">HashMap&lt;String, fn factory&gt;</text>
<path class="ln" d="M500,88 L558,88" marker-end="url(#td4b-arrow)"/>
<!-- step 3 -->
<rect class="box" x="560" y="60" width="200" height="56" rx="6"/>
<text x="660" y="84" class="tx">create_square_transformer</text>
<text x="660" y="104" class="mut">simple pointeur de fn, pas de Self</text>
<!-- wrap to second row -->
<path class="ln" d="M660,116 L660,148 L140,148 L140,175" marker-end="url(#td4b-arrow)"/>
<!-- step 4 -->
<rect class="box" x="40" y="177" width="200" height="56" rx="6"/>
<text x="140" y="201" class="tx">Box::new(SquareTransformer)</text>
<text x="140" y="221" class="mut">valeur sur le tas + ptr vtable</text>
<path class="lnAc" d="M240,205 L298,205" marker-end="url(#td4b-arrowAc)"/>
<!-- step 5 -->
<rect class="boxAc" x="300" y="177" width="200" height="56" rx="6"/>
<text x="400" y="201" class="tx">transformer.transform(3.0)</text>
<text x="400" y="221" class="mut">l'unique slot fixe de la vtable</text>
<path class="ln" d="M500,205 L558,205" marker-end="url(#td4b-arrow)"/>
<!-- step 6 -->
<rect class="box" x="560" y="177" width="200" height="56" rx="6"/>
<text x="660" y="201" class="tx">9.0</text>
<text x="660" y="221" class="mut">aucun generic instancié</text>
<!-- caption -->
<text x="400" y="265" class="mut">Un transform&lt;T&gt; generic n'a aucun slot unique à viser : cette chaîne serait impossible à construire</text>
</svg>
</div>

## Comment Ça Active dyn Trait

- **Construction de Vtable** : Le `Transformer` refactorisé a une méthode avec une signature fixe, activant une vtable comme :
  ```rust
  // Vtable conceptuelle
  struct TransformerVtable {
      transform: fn(*const (), f64) -> f64, // Pointeur vers SquareTransformer::transform
  }
  ```
  Un `Box<dyn Transformer>` associe cette vtable avec l'instance pour les appels à l'exécution.
- **Sécurité** : Pas de generics ou `Self` assure que la vtable est type-agnostic, sûre pour tout implémenteur.
- **Efficacité** : Le dispatch dynamique ajoute un lookup vtable (1-2 cycles), mais active le polymorphisme à l'exécution essentiel pour les plugins chargés dynamiquement.

## Considérations Avancées

### Gestion de Multiples Types d'Entrée

Si tu as besoin de flexibilité de type, utilise des enums ou des traits helper :

```rust
#[derive(Debug)]
enum Value {
    Int(i32),
    Float(f64),
    Text(String),
}

impl Value {
    fn to_f64(&self) -> f64 {
        match self {
            Value::Int(i) => *i as f64,
            Value::Float(f) => *f,
            Value::Text(s) => s.parse().unwrap_or(0.0),
        }
    }
}

trait Transformer {
    fn transform(&self, value: &Value) -> f64;
}

impl Transformer for SquareTransformer {
    fn transform(&self, value: &Value) -> f64 {
        let v = value.to_f64();
        v * v
    }
}
```

### Système de Plugin Complet

```rust
use std::collections::HashMap;

type PluginFactory = fn() -> Box<dyn Transformer>;

struct PluginRegistry {
    factories: HashMap<String, PluginFactory>,
}

impl PluginRegistry {
    fn new() -> Self {
        Self { factories: HashMap::new() }
    }
    
    fn register(&mut self, name: &str, factory: PluginFactory) {
        self.factories.insert(name.to_string(), factory);
    }
    
    fn create(&self, name: &str) -> Option<Box<dyn Transformer>> {
        self.factories.get(name).map(|f| f())
    }
}

fn main() {
    let mut registry = PluginRegistry::new();
    registry.register("square", create_square_transformer);
    
    if let Some(transformer) = registry.create("square") {
        let result = transformer.transform(4.0); // 16.0
        println!("Résultat : {}", result);
    }
}
```

## Points Clés à Retenir

**Object Safety** : Élimine les generics, `Self` returns et méthodes statiques pour activer `dyn Trait`  
**Factory Pattern** : Utilise des fonctions factory au lieu de méthodes `new()` statiques  
**Compromis** : Moins de flexibilité de type contre la capacité de dispatch dynamique  
Essentiels pour les systèmes de plugins où les types sont inconnus pendant la compilation

**Astuce** : Utilise `cargo check` pour vérifier rapidement si tes traits sont object-safe avant d'essayer `dyn Trait` !
