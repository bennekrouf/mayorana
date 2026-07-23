---
id: deadlocks-c-vs-rust
title: 'Deadlocks en C vs Rust : Que garantit vraiment Rust ?'
locale: fr
slug: deadlocks-c-vs-rust
date: '2025-08-25'
author: mayo
excerpt: >-
  Les deadlocks ne sont pas évités par le compilateur, mais Rust offre des
  garanties de sécurité qui rendent leur apparition plus difficile qu'en C.
  Comparaison détaillée.

tags:
  - rust
  - c
  - concurrence
  - deadlock
---

# Deadlocks en C vs Rust : Que garantit vraiment Rust ?

Les deadlocks sont des bugs **concurrentiels à l'exécution**, pas des erreurs détectées à la compilation. Alors pourquoi dit-on que Rust est plus sûr pour la programmation multithread ? Voyons ce que Rust empêche vraiment — et ce qu'il ne peut pas empêcher.

## Qu'est-ce qu'un deadlock ?

Un deadlock apparaît lorsque plusieurs threads détiennent des ressources et attendent indéfiniment que les autres les libèrent. Il faut que ces **4 conditions de Coffman** soient réunies :

1. **Exclusion mutuelle** — au moins une ressource ne peut pas être partagée  
2. **Maintien et attente** — un thread détient une ressource et en attend une autre  
3. **Pas de préemption** — les ressources ne peuvent pas être reprises de force  
4. **Attente circulaire** — les threads s'attendent mutuellement en boucle

Rust **n’élimine pas** les deadlocks, mais fournit des outils pour mieux les éviter.

## Exemple de deadlock en C et en Rust

### En C (Pthreads) :

```c
pthread_mutex_lock(&a);
// traitement
pthread_mutex_lock(&b);  // risque de deadlock si un autre thread a bloqué `b` puis `a`
```

### En Rust :

```rust
let a = Arc::new(Mutex::new(()));
let b = Arc::new(Mutex::new(()));

let t1 = {
    let a = Arc::clone(&a);
    let b = Arc::clone(&b);
    std::thread::spawn(move || {
        let _a = a.lock().unwrap();
        let _b = b.lock().unwrap();  // même problème si ordre de verrouillage inversé
    })
};
```

💥 Dans les deux cas, un deadlock est possible si les threads verrouillent les ressources dans des ordres différents.

<div class="svg-container" style="margin:2rem 0;">
<svg class="dlock-fig" viewBox="0 0 800 320" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Attente circulaire : le thread 1 détient le verrou A et attend le verrou B, tandis que le thread 2 détient le verrou B et attend le verrou A">
<style>
.dlock-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .dlock-fig,[data-theme="dark"] .dlock-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.dlock-fig text{font-family:ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.dlock-fig .title{font-size:14px;font-weight:700}
.dlock-fig .body{font-size:12px;font-weight:600}
.dlock-fig .cap{font-size:11px;fill:var(--mut)}
.dlock-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.dlock-fig .ln{stroke:var(--ac);stroke-width:2;fill:none}
.dlock-fig .lbl{font-size:11px;font-weight:600;fill:var(--ac)}
</style>
<!-- defs -->
<defs>
<marker id="dlock-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ac)"></path>
</marker>
</defs>
<!-- four corner nodes -->
<rect class="box" x="60" y="30" width="180" height="60" rx="8"></rect>
<text x="150" y="55" text-anchor="middle" class="title">Thread 1</text>
<text x="150" y="75" text-anchor="middle" class="cap">détient Mutex A</text>
<!-- lock a -->
<rect class="box" x="560" y="30" width="180" height="60" rx="8"></rect>
<text x="650" y="55" text-anchor="middle" class="title">Mutex B</text>
<text x="650" y="75" text-anchor="middle" class="cap">verrouillé, attendu</text>
<!-- thread 2 -->
<rect class="box" x="560" y="230" width="180" height="60" rx="8"></rect>
<text x="650" y="255" text-anchor="middle" class="title">Thread 2</text>
<text x="650" y="275" text-anchor="middle" class="cap">détient Mutex B</text>
<!-- lock b -->
<rect class="box" x="60" y="230" width="180" height="60" rx="8"></rect>
<text x="150" y="255" text-anchor="middle" class="title">Mutex A</text>
<text x="150" y="275" text-anchor="middle" class="cap">verrouillé, attendu</text>
<!-- cycle arrows -->
<path class="ln" d="M240,60 L560,60" marker-end="url(#dlock-arrow-fr)"></path>
<text x="400" y="50" text-anchor="middle" class="lbl">attend</text>
<path class="ln" d="M650,90 L650,230" marker-end="url(#dlock-arrow-fr)"></path>
<text x="710" y="165" text-anchor="middle" class="lbl">bloqué par</text>
<path class="ln" d="M560,260 L240,260" marker-end="url(#dlock-arrow-fr)"></path>
<text x="400" y="280" text-anchor="middle" class="lbl">attend</text>
<path class="ln" d="M150,230 L150,90" marker-end="url(#dlock-arrow-fr)"></path>
<text x="95" y="165" text-anchor="middle" class="lbl">bloqué par</text>
<!-- center label -->
<text x="400" y="165" text-anchor="middle" class="body" fill="var(--ac)">Attente circulaire — aucun contrôle du compilateur ne la détecte</text>
</svg>
</div>

## Les garanties supplémentaires de Rust

| Fonctionnalité              | C (Pthreads) | Rust                      | Pourquoi c’est important               |
|-----------------------------|---------------|---------------------------|----------------------------------------|
| Suivi de possession         | ❌            | ✅ (Vérifié par le compilateur) | Évite l'usage concurrent non sûr       |
| Déverrouillage automatique  | ❌            | ✅ (via `Drop` / RAII)     | Empêche d'oublier de libérer un lock  |
| Partage sécurisé de verrous | ❌            | ✅ (`Arc<Mutex<T>>`)       | Semantique claire entre threads       |
| Prévention des data races   | ❌            | ✅ (en code sûr uniquement) | Évite des scénarios de deadlocks       |
| Prévention des deadlocks    | ❌            | ❌                         | Nécessite une logique explicite        |

## Le cycle de vie des verrous en Rust

Rust garantit que :
- Les verrous sont libérés automatiquement en fin de scope
- Un mutex ne peut pas être accédé sans être verrouillé
- Les règles d’emprunt empêchent les accès concurrents non valides

Mais : **Rust ne vérifie pas l’ordre de verrouillage**. Si un thread verrouille `a` puis `b`, et un autre `b` puis `a`, un deadlock peut quand même se produire.

## Compilation vs Exécution

| Problème                    | Détecté en C ? | Détecté en Rust ? | Sécurité à la compilation ? |
|-----------------------------|----------------|--------------------|------------------------------|
| Data races                  | ❌             | ✅                 | ✅                           |
| Use-after-free              | ❌             | ✅                 | ✅                           |
| Pointeurs pendants          | ❌             | ✅                 | ✅                           |
| Ordre de verrouillage cyclique | ❌         | ❌                 | ❌                           |
| Deadlocks                   | ❌             | ❌                 | ❌                           |

## Outils dynamiques pour détecter les deadlocks

Rust ne vérifie pas l'ordre des locks à la compilation, mais vous pouvez utiliser :

- [`loom`](https://docs.rs/loom) – test d'interleavings concurrents
- [`deadlock`](https://docs.rs/deadlock) – détection de deadlocks en mode debug
- Analyseurs statiques (en développement)

## Résumé

✅ **Rust** garantit la sûreté mémoire et empêche les erreurs classiques de synchronisation  
❌ **Les deadlocks** sont toujours possibles — à vous de gérer l’ordre des verrous  
🚀 Structurez vos locks proprement, et testez avec des outils comme `loom`

**À tester :** Que se passe-t-il si deux threads tentent de `lock()` des `Mutex<T>` dans un ordre opposé ?  
**Réponse :** Si l’ordre forme un cycle, votre programme risque de se bloquer. Rust ne l’empêche pas — mais il rend tout le reste bien plus sûr.
