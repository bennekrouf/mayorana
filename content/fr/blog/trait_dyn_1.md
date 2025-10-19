---
id: rust-traits-vs-interfaces
title: 'Rust Traits vs. Interfaces Java/C# : Comportement partagé bien fait'
locale: fr
slug: rust-traits-vs-interfaces
date: '2025-10-19'
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
