---
id: query-key-value-three-matrices
title: 'Épisode 2 : Q, K, V — Pourquoi 3 matrices et pas une seule ?'
slug: query-key-value-three-matrices
locale: fr
date: '2026-09-27'
author: mayo
excerpt: >-
  Query, Key, Value : pourquoi les vrais modèles projettent chaque mot dans
  trois espaces différents, et comment cette séparation des rôles rend
  l'attention intelligente.
tags:
  - llm
  - ai
  - rust
  - attention
  - transformers
---

# Épisode 2 : Q, K, V — Pourquoi 3 matrices et pas une seule ?

## La question qui tue

Dans l'épisode précédent, on a dit qu'on "copie 3 fois les embeddings". Mais est-ce **toujours** le cas ? Et **pourquoi** 3 copies ?

## La réponse courte

Non. Dans les vrais modèles, on utilise **3 matrices de projection différentes** (Wq, Wk, Wv) apprises pendant l'entraînement.

## Les 3 rôles

### Q (Query) = La question

Le modèle projette chaque mot dans un espace où il formule sa "requête". "Banque" génère un Q qui signifie *"je cherche des infos sur l'argent"*.

### K (Key) = L'étiquette

Le même mot est projeté dans un AUTRE espace pour créer son étiquette. Cette étiquette répond : *"Je suis un mot qui parle d'argent"*.

### V (Value) = La connaissance

C'est ce qu'on transporte réellement. Une 3ème projection indépendante où le réseau stocke **ce qui est utile à transmettre**.

## Pourquoi cette séparation permet d'apprendre ?

Si Q et K étaient identiques, le mot ne saurait pas faire la différence entre **chercher** et **être cherché**. Concrètement, la matrice des scores deviendrait symétrique : "volé" donnerait exactement le même score à "pomme" que "pomme" à "volé". Et chaque mot obtiendrait souvent son meilleur score avec lui-même, puisque le produit scalaire d'un vecteur avec lui-même est grand : il se regarderait lui-même plutôt que les autres. En les séparant, le modèle peut ajuster finement ces espaces via la rétropropagation.

**Exemple** : "Le banquier a volé une pomme"

- "volé" (Q) interroge "pomme" (K) → fort pourcentage d'attention
- Dans V de "pomme", le réseau a stocké "fruit, rouge, comestible"
- Résultat : "volé" comprend qu'il a volé un objet comestible

## Un peu de Rust

```rust
// Version pédagogique : Q = K = V
let q = embeddings.clone();
let k = embeddings.clone();
let v = embeddings.clone();

// Version réelle : 3 projections
// let q = mat_mul(&embeddings, &w_q);
// let k = mat_mul(&embeddings, &w_k);
// let v = mat_mul(&embeddings, &w_v);
```

## Ce qu'il faut retenir

- Q = cherche, K = répond, V = transporte
- La séparation rend l'attention intelligente
- Les vecteurs capturent plusieurs nuances simultanément
