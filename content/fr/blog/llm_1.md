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

L'attention, ce sont 4 petites opérations qu'on enchaîne. On les voit une par une, chacune avec son code.

Ici, une matrice est simplement un tableau de nombres : une liste de lignes, et chaque ligne est le vecteur d'un mot. Pour commencer simplement, on utilise les embeddings tels quels pour Q, K et V : on les copie 3 fois.

### 1. Multiplication matricielle : comparer chaque mot avec tous les autres

Pour savoir si deux mots sont liés, on multiplie leurs nombres deux à deux, puis on additionne le tout. C'est le produit scalaire. Plus le résultat est grand, plus les deux mots "vont dans le même sens". La multiplication de matrices fait ce calcul pour toutes les paires de mots d'un coup.

```rust
// Multiplie la matrice `a` par la matrice `b`.
// Chaque case du résultat compare une ligne de `a` avec une colonne de `b`.
fn mat_mul(a: &[Vec<f32>], b: &[Vec<f32>]) -> Vec<Vec<f32>> {
    let mut result = vec![vec![0.0; b[0].len()]; a.len()]; // un tableau rempli de zéros
    for row in 0..a.len() {
        for col in 0..b[0].len() {
            // produit scalaire : on multiplie les nombres deux à deux, puis on additionne
            for pos in 0..b.len() { // `pos` avance dans les nombres du vecteur
                result[row][col] += a[row][pos] * b[pos][col];
            }
        }
    }
    result
}
```

### 2. Transposition : inverser lignes et colonnes pour aligner les matrices

Petit souci : la multiplication compare les lignes de la première matrice avec les **colonnes** de la seconde. Or dans K, chaque mot est une **ligne**. La transposition règle ça : les lignes deviennent des colonnes. C'est pour ça qu'on multiplie Q par la transposée de K.

```rust
// Retourne le tableau : la 1re ligne devient la 1re colonne, et ainsi de suite.
fn transpose(matrix: &[Vec<f32>]) -> Vec<Vec<f32>> {
    let mut result = vec![vec![0.0; matrix.len()]; matrix[0].len()];
    for row in 0..matrix.len() {
        for col in 0..matrix[0].len() {
            result[col][row] = matrix[row][col]; // on échange ligne et colonne
        }
    }
    result
}

// Q comparé à K : un score pour chaque paire de mots
let mut scores = mat_mul(&q, &transpose(&k));
```

### 3. Scaling : diviser par la racine carrée de la taille du vecteur

Avec des vecteurs de 768 nombres, les scores deviennent vite très grands. On les divise donc tous par la racine carrée de la taille du vecteur : pour 768, ça fait environ 28. On voit juste après pourquoi c'est important.

```rust
// Divise chaque score par la racine carrée de la taille du vecteur.
// `vector_size` = combien de nombres il y a dans le vecteur d'un mot (ex : 768).
fn scale(scores: &mut [Vec<f32>], vector_size: f32) {
    let divider = vector_size.sqrt(); // pour 768, environ 28
    for row in scores.iter_mut() {
        for score in row.iter_mut() {
            *score /= divider;
        }
    }
}

scale(&mut scores, 768.0);
```

### 4. Softmax : transformer les scores en pourcentages

Dernière étape : chaque ligne de scores devient une liste de pourcentages qui font 100 % au total. Chaque mot sait alors quelle part d'attention donner à chacun des autres.

```rust
// Transforme chaque ligne de scores en pourcentages qui font 100 % au total.
fn softmax(scores: &mut [Vec<f32>]) {
    for row in scores.iter_mut() {
        // le plus grand score de la ligne
        let biggest = row.iter().cloned().fold(f32::NEG_INFINITY, f32::max);
        for score in row.iter_mut() {
            // on retire le plus grand score avant l'exponentielle :
            // même résultat, mais les nombres restent petits
            *score = (*score - biggest).exp();
        }
        let total: f32 = row.iter().sum();
        for score in row.iter_mut() {
            *score /= total; // chaque score devient sa part du total
        }
    }
}

softmax(&mut scores); // chaque ligne fait maintenant 100 %
```

## Pourquoi "stabiliser" avec le scaling ?

Le scaling divise les scores par la racine carrée de la taille du vecteur. Pourquoi ? Plus les vecteurs sont grands (768 dimensions !), plus les scores grimpent. Et le Softmax amplifie énormément les écarts : avec de gros scores, il donne presque 100 % à un seul mot et 0 % à tous les autres. Le modèle ne regarde plus qu'un mot, et pendant l'entraînement, il n'apprend presque plus rien.

En divisant ainsi, on ramène les scores à une taille normale. Le mot le plus important reste le plus important, mais l'attention peut à nouveau se répartir sur plusieurs mots.

## Ce qu'il faut retenir

- L'attention, c'est 4 opérations : multiplication, transposition, scaling, softmax
- Un mot = un vecteur (pas un scalaire)
- Le scaling évite que l'attention se bloque sur un seul mot
