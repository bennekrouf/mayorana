---
id: attention-four-operations
title: "Épisode 1 : L'Attention, c'est juste 4 opérations mathématiques"
slug: attention-four-operations
locale: fr
date: '2026-09-27'
author: mayo
excerpt: >-
  Derrière les Transformers et le mécanisme d'attention, il n'y a que quatre
  opérations simples : multiplication matricielle, transposition, scaling et
  softmax. Les voici, en Rust.
tags:
  - llm
  - ai
  - rust
  - attention
  - transformers
---

# Épisode 1 : L'Attention, c'est juste 4 opérations mathématiques

## Pourquoi ce sujet ?

Quand on parle de LLM, on entend souvent des mots effrayants : "Transformers", "mécanisme d'attention", "Q/K/V". Mais en réalité, au cœur de tout ça, il n'y a que **4 opérations simples**.

## L'idée centrale

L'attention, c'est le mécanisme qui permet à un mot de **regarder les autres mots** de la phrase pour mieux se comprendre lui-même.

Exemple : dans "La banque a fermé ses portes", le mot "banque" n'a pas le même sens que dans "La banque de sang est vide". C'est l'attention qui permet au modèle de faire la différence.

## Petit rappel : scalaire vs vecteur

- **Un scalaire** : un simple nombre. Ex : `3.14`, `42`.
- **Un vecteur** : une liste ordonnée de scalaires. Ex : `[0.5, 0.1, 0.4, 0.0]`. Il a une **direction** et une **longueur**.

**Pourquoi c'est important ?** Un mot dans un LLM est représenté par un **vecteur** (souvent 768 dimensions). C'est cette richesse qui permet de capturer des sens nuancés.

## Les 4 opérations (en Rust)

```rust
fn mat_mul(a: &[Vec<f32>], b: &[Vec<f32>]) -> Vec<Vec<f32>> {
    let bt = transpose(b); // les colonnes de b deviennent des lignes
    a.iter()
        .map(|row| bt.iter()
            .map(|col| row.iter().zip(col).map(|(x, y)| x * y).sum()) // produit scalaire
            .collect())
        .collect()
}
fn transpose(m: &[Vec<f32>]) -> Vec<Vec<f32>> {
    (0..m[0].len()).map(|j| m.iter().map(|r| r[j]).collect()).collect()
}
fn scale(matrix: &mut [Vec<f32>], dim: f32) {
    matrix.iter_mut().flatten().for_each(|x| *x /= dim.sqrt());
}
fn softmax(matrix: &mut [Vec<f32>]) {
    for row in matrix {
        let max = row.iter().cloned().fold(f32::NEG_INFINITY, f32::max);
        row.iter_mut().for_each(|x| *x = (*x - max).exp()); // - max : pas d'overflow
        let sum: f32 = row.iter().sum();
        row.iter_mut().for_each(|x| *x /= sum);
    }
}
```

- **Multiplication matricielle** : comparer chaque mot avec tous les autres
- **Transposition** : inverser lignes et colonnes pour aligner les matrices
- **Scaling** : diviser par la racine carrée de la dimension
- **Softmax** : transformer les scores en pourcentages

Pour commencer simplement, on utilise les embeddings tels quels pour Q, K et V : on les copie 3 fois.

## Pourquoi "stabiliser" avec le scaling ?

Le scaling divise les scores par √d. Pourquoi ? Plus les vecteurs sont grands (768 dimensions !), plus les scores grimpent. Et le Softmax amplifie énormément les écarts : avec de gros scores, il donne presque 100 % à un seul mot et 0 % à tous les autres. Le modèle ne regarde plus qu'un mot, et pendant l'entraînement, il n'apprend presque plus rien.

En divisant par √d, on ramène les scores à une taille normale. Le mot le plus important reste le plus important, mais l'attention peut à nouveau se répartir sur plusieurs mots.

## Ce qu'il faut retenir

- L'attention n'est PAS magique, c'est des maths simples
- Un mot = un vecteur (pas un scalaire)
- Le scaling évite que l'attention se bloque sur un seul mot
- Le meilleur apprentissage, c'est de le coder soi-même
