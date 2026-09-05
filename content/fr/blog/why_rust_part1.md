---
id: why-garbage-collector-fr
title: 'Partie 1 : GC Pauses et Latence: Le coût caché des langages de haut niveau'
locale: fr
slug: why-garbage-collector-fr
date: '2025-08-07'
author: mayo
excerpt: >-
  Java, Python et JavaScript offrent de la commodité, mais le garbage collector
  introduit une latence  imprévisible.

tags:
  - rust
  - java
  - python
  - gc
  - memory
---

# Garbage Collectors: pratiques mais Coûteux

Les langages de haut niveau comme Java, Python ou JavaScript gèrent la mémoire automatiquement. Mais cela vient avec des compromis.

## Que se passe-t-il avec ce code ?

```java
String message = "hello";
```

Cela crée un objet sur en mémoire (heap). Mais finalement, cette mémoire doit être récupérée. Et c'est là qu'intervient le Garbage Collector (GC).

## Comment chaque Langage Gère la mémoire

### Java: Collections Stop-the-World
Le runtime de Java a plusieurs mécanismes de garbage collection ou générationnel. La plupart ne sont pas bloquant. Mais à un moment donné il lui est nécessaire de s'exécuter en bloquant tous les autres thread ("Stop-the-world"). Et cela créé des blocages, ou latences non prévisibles. C'est pour cette raison que typiquement on n'utilisera jamais Java pour un système de freinage d'urgence mais plutôt un language système (C/C++ ou Rust) car n'a pas d'indisponibilité imprévisible. La trace "Full GC" suivante met en évidence cet évennement.

```
[GC (Allocation Failure) 8192K->1024K(10240K), 0.0057 secs]
[Full GC (Ergonomics) 8192K->512K(19456K), 0.0234 secs]
```

Le GC de Java s'exécute en background, mettant ton application en pause de manière imprévisible. Même les GC modernes comme G1 peuvent faire des pauses de millisecondes.

### Python: Reference Counting + Cycles
```python
import gc
gc.collect()  # Collection manuelle
# Retourne: nombre d'objets collectés
```

Python compte les références aux objets, mais a besoin d'un collector séparé pour les références circulaires. Les deux ajoutent de l'overhead à chaque opération.

### JavaScript: Generational Collection
```javascript
// Aucun contrôle direct - V8 décide quand collecter
global.gc(); // Disponible seulement avec --expose-gc flag
```

V8 gère la mémoire automatiquement sans contrôle développeur. Les pauses arrivent quand le moteur décide.

<div class="svg-container" style="margin:2rem 0;">
<svg class="gcstrat-fig" viewBox="0 0 800 270" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Trois stratégies de garbage collection paient chacune un coût différent, tandis que Rust libère à l'accolade fermante sans aucun collecteur">
<!-- style -->
<style>
.gcstrat-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .gcstrat-fig,[data-theme="dark"] .gcstrat-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.gcstrat-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.gcstrat-fig .boxac{fill:var(--box);stroke:var(--ac);stroke-width:2}
.gcstrat-fig .ti{fill:var(--tx);font:700 13px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.gcstrat-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.gcstrat-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.gcstrat-fig .ac{fill:var(--ac);font:700 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.gcstrat-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="gcstrat-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
</defs>
<!-- title -->
<text x="400" y="24" class="ti">Qui décide du moment où la mémoire disparaît ?</text>
<!-- java -->
<rect x="20" y="42" width="180" height="112" rx="7" class="box"/>
<text x="110" y="66" class="tx">Java</text>
<text x="110" y="86" class="mut">stop-the-world</text>
<text x="110" y="110" class="mut">les threads gèlent</text>
<text x="110" y="128" class="mut">pendant le balayage</text>
<text x="110" y="146" class="mut">coût : pics de latence</text>
<!-- python -->
<rect x="215" y="42" width="180" height="112" rx="7" class="box"/>
<text x="305" y="66" class="tx">Python</text>
<text x="305" y="86" class="mut">refcount + cycles</text>
<text x="305" y="110" class="mut">chaque affectation</text>
<text x="305" y="128" class="mut">incrémente un compteur</text>
<text x="305" y="146" class="mut">coût : overhead constant</text>
<!-- javascript -->
<rect x="410" y="42" width="180" height="112" rx="7" class="box"/>
<text x="500" y="66" class="tx">JavaScript</text>
<text x="500" y="86" class="mut">générationnel, V8</text>
<text x="500" y="110" class="mut">le moteur choisit</text>
<text x="500" y="128" class="mut">le moment, pas toi</text>
<text x="500" y="146" class="mut">coût : aucun contrôle</text>
<!-- rust -->
<rect x="605" y="42" width="175" height="112" rx="7" class="boxac"/>
<text x="692" y="66" class="ac">Rust</text>
<text x="692" y="86" class="mut">aucun collecteur</text>
<text x="692" y="110" class="mut">libéré à l'accolade</text>
<text x="692" y="128" class="mut">fermante, à chaque fois</text>
<text x="692" y="146" class="mut">coût : nul à l'exécution</text>
<!-- Y-merge of the three GC languages -->
<path d="M110,154 L110,178 L305,178" class="ln"/>
<path d="M305,154 L305,178" class="ln"/>
<path d="M500,154 L500,178 L305,178" class="ln"/>
<path d="M305,178 L305,196" class="ln" marker-end="url(#gcstrat-arrow-fr)"/>
<rect x="140" y="196" width="330" height="38" rx="6" class="box"/>
<text x="305" y="220" class="tx">un runtime décide — tu le découvres après</text>
<!-- rust path -->
<path d="M692,154 L692,196" class="ln" marker-end="url(#gcstrat-arrow-fr)"/>
<rect x="560" y="196" width="220" height="38" rx="6" class="boxac"/>
<text x="670" y="220" class="tx">le compilateur décide — tu peux le lire</text>
<!-- footer -->
<text x="400" y="258" class="mut">Les trois stratégies de GC échangent débit ou prévisibilité contre du confort ; Rust déplace la décision à la compilation</text>
</svg>
</div>

## L'Impact réel

Concrétement, voici quelques expériences mettant en évidence ce problème.

### Une indexation Elasticsearch qui prend des dizaines d'heures en entreprise
```
Exécution initiale:  200GB corpus → 2 heures
Après pression mémoire: Mêmes données → 12 heures

Cause: GC a passé 70% du temps à nettoyer
```

### Pics de latence Service Web : le CPU est sans arrêt occupé par le GC et introduit des latences dans les réponses aux appelles d'API
```
Réponse normale: 50ms
Pendant pause GC: 2000ms (40x plus lent!)
```

<div class="svg-container" style="margin:2rem 0;">
<svg class="gcpause-fig" viewBox="0 0 800 220" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Une requête normale de 50ms comparée à la même requête étirée à 2000ms par une pause GC imprévisible">
<style>
.gcpause-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .gcpause-fig,[data-theme="dark"] .gcpause-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.gcpause-fig text{font-family:ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.gcpause-fig .title{font-size:14px;font-weight:700}
.gcpause-fig .body{font-size:12px;font-weight:600}
.gcpause-fig .cap{font-size:11px;fill:var(--mut)}
.gcpause-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.gcpause-fig .acbox{fill:var(--ac);stroke:var(--ac)}
</style>
<!-- row 1: normal -->
<text x="40" y="55" class="title">Requête normale</text>
<rect class="box" x="40" y="65" width="70" height="34" rx="6"></rect>
<text x="140" y="87" class="body">50ms — terminé</text>
<!-- row 2: gc pause -->
<text x="40" y="145" class="title">Requête pendant une pause GC</text>
<rect class="box" x="40" y="155" width="70" height="34" rx="6"></rect>
<rect class="acbox" x="110" y="155" width="620" height="34" rx="6"></rect>
<text x="115" y="176" class="body" fill="#ffffff">Pause GC — thread gelé, durée imprévisible</text>
<!-- caption -->
<text x="400" y="210" text-anchor="middle" class="cap">Même requête, même code — 2000ms au total, 40x plus lent, et tu ne contrôles pas quand cela arrive</text>
</svg>
</div>

## Comparaison GC

| Langage    | Type GC           | Ton Contrôle | Prévisibilité  |
|------------|-------------------|----------------|----------------|
| Java       | Generational      | Flags JVM      | Faible         |
| Python     | Reference + Cycle | Module `gc`    | Très Faible    |
| JavaScript | Generational      | Aucun          | Très Faible    |

## Les coûts Cachés

**Overhead Mémoire:**
- Java: 2-8 bytes par header d'objet
- Python: 28+ bytes minimum par objet  
- JavaScript: Metadata V8 variable

**Overhead CPU:**
- 5-30% du temps CPU passé dans le GC
- Reference counting à chaque assignment (Python)
- Write barriers pour le generational GC

**Pics de Latence:**
- Temps de pause imprévisibles
- Pire sous pression mémoire
- Impossible de garantir les temps de réponse

## Quand le GC Devient un problème

### Les systèmes de trading
**Exigence:** <1ms temps de réponse
**Réalité:** N'importe quelle pause GC tue les performances

### Les systèmes temps réel (automobile, automatismes..etc)
**Exigence:** Budget constant de 16ms (60fps)  
**Réalité:** Frame drops pendant la collection

### Traitement de données à Grande Échelle
**Exigence:** Traiter des TBs efficacement  
**Réalité:** L'overhead GC grandit avec la taille du dataset

## Le coût, en résumé
✅ **Le GC facilite le développement**  
❌ **La latence est imprévisible**  
❌ **Les performances se dégradent sous charge**  
❌ **Aucun contrôle sur quand les pauses arrivent**  
❌ **Overhead mémoire et CPU toujours présent**

---

**La Question:** Quelles sont les alternatives si on ne veut pas de Garbabe collection ?

**Voir mon autre post:** "Gestion Manuelle de la Mémoire: Pourquoi C/C++ N'est Pas la Réponse"
