---
id: rust-traits-vs-interfaces
title: 'Rust Traits vs. Interfaces Java/C# : Comportement partagé bien fait'
locale: fr
slug: rust-traits-vs-interfaces
date: '2025-10-20'
author: mayo
excerpt: >-
  Discussion sur les traits Rust vs les interfaces Java/C#, couvrant les
  mécanismes de dispatch, le comportement pendant la compilation, et les
  optimisations de performance.
tags:
  - rust
  - traits
  - performance
  - interfaces
  - dispatch
---

# En quoi les traits Rust diffèrent-ils des interfaces dans des langages comme Java ou C#, et comment les utiliser pour définir un comportement partagé pour des types dans une bibliothèque critique en performance ?

Les traits Rust et les interfaces définissent tous deux un comportement partagé, mais diffèrent fondamentalement en conception et exécution, particulièrement dans des contextes critiques en performance.

<div class="svg-container" style="margin:2rem 0;">
<svg class="td1-fig" viewBox="0 0 800 300" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Comparaison entre le dispatch statique de Rust et le dispatch dynamique de Java ou C# pour un appel PacketHandler">
<style>
.td1-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .td1-fig,[data-theme="dark"] .td1-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.td1-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.td1-fig .boxAc{fill:var(--box);stroke:var(--ac);stroke-width:2}
.td1-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td1-fig .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td1-fig .mut{fill:var(--mut);font:600 11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td1-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- markers -->
<defs>
<marker id="td1-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
</defs>
<!-- column titles -->
<text x="200" y="26" class="ti">Rust : dispatch statique</text>
<text x="600" y="26" class="ti">Java/C# : dispatch dynamique</text>
<!-- left column -->
<rect class="box" x="60" y="45" width="280" height="42" rx="6"/>
<text x="200" y="70" class="tx">process_packets::&lt;TcpHandler&gt;()</text>
<path class="ln" d="M200,87 L200,113" marker-end="url(#td1-arrow-fr)"/>
<rect class="box" x="60" y="114" width="280" height="42" rx="6"/>
<text x="200" y="139" class="tx">Monomorphisé par type</text>
<path class="ln" d="M200,156 L200,182" marker-end="url(#td1-arrow-fr)"/>
<rect class="boxAc" x="60" y="183" width="280" height="52" rx="6"/>
<text x="200" y="204" class="tx">Code machine inliné</text>
<text x="200" y="222" class="mut">overhead zéro à l'exécution</text>
<!-- right column -->
<rect class="box" x="460" y="45" width="280" height="42" rx="6"/>
<text x="600" y="70" class="tx">process(&amp;mut self, data)</text>
<path class="ln" d="M600,87 L600,113" marker-end="url(#td1-arrow-fr)"/>
<rect class="box" x="460" y="114" width="280" height="42" rx="6"/>
<text x="600" y="139" class="tx">Lookup vtable</text>
<path class="ln" d="M600,156 L600,182" marker-end="url(#td1-arrow-fr)"/>
<rect class="box" x="460" y="183" width="280" height="52" rx="6"/>
<text x="600" y="204" class="tx">Appel indirect</text>
<text x="600" y="222" class="mut">1-2 cycles, pas d'inlining</text>
<!-- captions -->
<text x="200" y="265" class="mut">Abstraction à coût zéro</text>
<text x="600" y="265" class="mut">Polymorphisme à l'exécution</text>
</svg>
</div>

## Différences clés

| Aspect | Traits Rust | Interfaces Java/C# |
|--------|-------------|-------------------|
| **Dispatch** | Dispatch statique (generics) par défaut, dynamique (`dyn`) sur demande | Polymorphisme à l'exécution via vtables |
| **Implémentation** | Explicite via `impl Trait for Type` | Implicite (C#) ou explicite (Java) |
| **Pendant la compilation** | Résolu pendant la compilation via monomorphization | Construits à l'exécution avec optimisation JIT |
| **Héritage** | Pas d'héritage ; composition via supertraits | Héritage d'interface avec vérifications à l'exécution |
| **Performance** | Abstraction à coût zéro, inlining activé | Coût de dispatch 1-2 cycles, inlining limité |

## Implémentation et Dispatch

**Traits Rust** : Supportent le dispatch statique via les generics où le compilateur fait la monomorphization du code pour chaque type, inlinant les appels pour un overhead zéro à l'exécution. Le dispatch dynamique (`dyn Trait`) utilise des vtables mais est sur demande.

**Interfaces Java/C#** : S'appuient sur le polymorphisme à l'exécution via vtables, engendrant des coûts de dispatch et empêchant l'inlining à travers les frontières de types.

## Exemple : Stack réseau critique en performance

Définis un trait `PacketHandler` pour un traitement efficace de paquets à travers différents protocoles :

```rust
trait PacketHandler {
    fn process(&mut self, data: &[u8]) -> usize; // Octets traités
    fn reset(&mut self); // Réinitialiser l'état
}

struct TcpHandler { state: u32 }
struct UdpHandler { count: u16 }

impl PacketHandler for TcpHandler {
    fn process(&mut self, data: &[u8]) -> usize {
        self.state = data.iter().fold(self.state, |acc, &x| acc.wrapping_add(x as u32));
        data.len()
    }
    fn reset(&mut self) { self.state = 0; }
}

impl PacketHandler for UdpHandler {
    fn process(&mut self, data: &[u8]) -> usize {
        self.count = self.count.wrapping_add(1);
        data.len()
    }
    fn reset(&mut self) { self.count = 0; }
}

fn process_packets<H: PacketHandler>(handler: &mut H, packets: &[&[u8]]) -> usize {
    let mut total = 0;
    for packet in packets {
        total += handler.process(packet);
    }
    total
}
```

Utilisation :
```rust
let mut tcp = TcpHandler { state: 0 };
let packets = vec![&[1, 2, 3], &[4, 5, 6]];
let bytes = process_packets(&mut tcp, &packets); // Dispatch statique
```

## Comment ça améliore les performances et la sécurité

### Performance

- **Dispatch statique** : `process_packets` fait la monomorphization pour `TcpHandler` et `UdpHandler`, générant des chemins de code séparés et inlinés. Pas de lookups vtable, économisant des cycles dans les boucles chaudes
- **Inlining** : Le compilateur peut inliner les appels `process`, les fusionnant avec la boucle, réduisant les branches et activant les optimisations SIMD
- **Coût zéro** : L'abstraction trait n'ajoute aucun overhead à l'exécution—équivalent à écrire à la main `process_tcp` et `process_udp`

### Sécurité

- **Sécurité de type** : Le trait bound `H: PacketHandler` assure que seuls les types compatibles sont passés, vérifié pendant la compilation—pas de casts à l'exécution comme `instanceof` de Java
- **Encapsulation** : Chaque handler gère son état (`state` ou `count`), avec l'ownership de Rust qui fait respecter les règles de mutation

<div class="svg-container" style="margin:2rem 0;">
<svg class="td1-fig2" viewBox="0 0 800 300" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Le bound H PacketHandler est vérifié pendant la compilation, menant soit au code monomorphisé et inliné, soit à une erreur de compilation avant tout binaire">
<style>
.td1-fig2{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .td1-fig2,[data-theme="dark"] .td1-fig2{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.td1-fig2 .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.td1-fig2 .boxAc{fill:var(--box);stroke:var(--ac);stroke-width:2}
.td1-fig2 .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td1-fig2 .ti{fill:var(--tx);font:700 14px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td1-fig2 .mut{fill:var(--mut);font:600 11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.td1-fig2 .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
.td1-fig2 .lnAc{stroke:var(--ac);stroke-width:2;fill:none}
</style>
<!-- markers -->
<defs>
<marker id="td1b-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
<marker id="td1b-arrowAc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ac)"/></marker>
</defs>
<!-- title -->
<text x="400" y="26" class="ti">Où un mauvais type de handler est attrapé</text>
<!-- call site -->
<rect class="box" x="40" y="110" width="210" height="60" rx="6"/>
<text x="145" y="136" class="tx">process_packets(&amp;mut tcp)</text>
<text x="145" y="156" class="mut">H inféré = TcpHandler</text>
<!-- arrow into gate -->
<path class="lnAc" d="M250,140 L300,140" marker-end="url(#td1b-arrowAc)"/>
<!-- gate -->
<rect class="boxAc" x="302" y="105" width="200" height="70" rx="6"/>
<text x="402" y="132" class="tx">H: PacketHandler ?</text>
<text x="402" y="152" class="mut">résolu pendant la compilation</text>
<!-- split from gate -->
<path class="ln" d="M502,140 L532,140"/>
<path class="ln" d="M532,140 L532,70 L560,70" marker-end="url(#td1b-arrow)"/>
<path class="ln" d="M532,140 L532,215 L560,215" marker-end="url(#td1b-arrow)"/>
<!-- accepted -->
<rect class="box" x="562" y="45" width="208" height="50" rx="6"/>
<text x="666" y="68" class="tx">impl trouvée</text>
<text x="666" y="85" class="mut">monomorphiser, puis inliner</text>
<!-- rejected -->
<rect class="box" x="562" y="190" width="208" height="50" rx="6"/>
<text x="666" y="213" class="tx">aucune impl pour ce type</text>
<text x="666" y="230" class="mut">error[E0277] — rien n'est construit</text>
<!-- caption -->
<text x="400" y="275" class="mut">Java : la même erreur compile et surgit comme un test instanceof ou un cast raté à l'exécution</text>
</svg>
</div>

## Contraste avec Java/C#

Équivalent Java :
```java
interface PacketHandler {
    int process(byte[] data);
    void reset();
}

class TcpHandler implements PacketHandler {
    // dispatch basé sur vtable, pas d'inlining à travers les types
}
```

Chaque appel `process` passe par une vtable, empêchant la fusion de boucle et ajoutant de l'indirection. Le dispatch statique de Rust évite cela—critique pour les stacks réseau gérant des millions de paquets par seconde.

## Considérations avancées

- **Types associés** : Activent des contraintes au niveau type sans overhead à l'exécution
- **Implémentations par défaut** : Réduisent le boilerplate tout en maintenant le coût zéro
- **Supertraits** : Composent le comportement sans complexité d'héritage
- **Dispatch dynamique** : Utilise `Box<dyn PacketHandler>` quand l'effacement de type est nécessaire

## Points clés à retenir

✅ **Traits Rust** : Résolution pendant la compilation, abstraction à coût zéro, dispatch statique par défaut  
✅ **Interfaces Java/C#** : Polymorphisme à l'exécution, overhead vtable, dynamique par nature  
🚀 Utilise les traits pour du code critique en performance où le dispatch statique élimine l'overhead

**Essaie ça :** Que se passe-t-il si tu utilises `&dyn PacketHandler` au lieu des generics ?  
**Réponse :** Tu obtiens un dispatch dynamique avec overhead vtable—mesure la différence de performance dans tes chemins chauds !
