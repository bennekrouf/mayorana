---
id: embeddings-absolute-vs-contextual
title: "Épisode 3 : Embeddings — Absolus au départ, contextuels à l'arrivée"
slug: embeddings-absolute-vs-contextual
locale: fr
date: '2026-09-27'
author: mayo
excerpt: >-
  Un embedding, c'est le mot dans l'absolu ou dans son contexte ? Les deux, à
  des moments différents. Plus les trois détails d'ingénierie autour de
  l'attention : multi-head, masking et position encoding.
tags:
  - llm
  - ai
  - embeddings
  - attention
  - transformers
---

# Épisode 3 : Embeddings — Absolus au départ, contextuels à l'arrivée

## La question de base

Un embedding de mot, c'est le mot **dans l'absolu** (dictionnaire) ou **dans le contexte** d'une phrase ?

## La réponse : LES DEUX, à des moments différents

### Étape 1 : L'embedding absolu

Chaque mot est converti en un vecteur fixe basé sur son dictionnaire. "Banque" aura le même vecteur dans "Banque de sang" et "Banque d'investissement".

Précision : les modèles ne travaillent pas vraiment sur des mots, mais sur des **tokens**, des morceaux de mots. Un mot courant comme "banque" est souvent un seul token, mais un mot rare peut être découpé en plusieurs tokens, chacun avec son propre ID. Pour simplifier, on continue à parler de "mots".

**Comment ça se calcule ?**

- Une matrice géante (ex : 50 000 tokens × 768 dimensions)
- Chaque token a un ID unique (ex : "Banque" = ID 1248)
- On lit la ligne 1248 de la matrice
- **Aucun calcul complexe**, juste une lecture mémoire

### Étape 2 : L'embedding contextuel

C'est là que Q/K/V intervient ! L'attention prend le vecteur absolu de "Banque", regarde les autres mots, et **mélange** leurs vecteurs V selon les pourcentages calculés.

Résultat : "Banque" a un **nouveau vecteur contextuel** différent selon la phrase.

## Pourquoi des vecteurs plutôt que des scalaires ?

Un scalaire ne représenterait qu'**une seule dimension** de sens. Un vecteur de 768 dimensions capture simultanément le genre, le nombre, le domaine sémantique, la connotation.

## Les 3 détails d'ingénierie

### 1. Multi-Head Attention

Au lieu d'une seule attention, on en fait plusieurs en parallèle (ex : 12 têtes). Chaque tête a ses propres Q, K et V, en plus petit, et regarde donc le texte sous un angle différent : par exemple, l'une suit la grammaire, une autre cherche qui fait référence à qui. À la fin, on recolle les résultats de toutes les têtes et on les mélange.

### 2. Masking

En génération, on interdit au modèle de regarder les mots futurs. On met des `-infini` dans les scores pour que le Softmax donne 0%.

### 3. Position Encoding

L'attention seule ne sait pas l'ordre des mots : pour elle, "le chien mord l'homme" et "l'homme mord le chien" contiennent exactement les mêmes mots. Il faut donc lui donner la position.

Les premiers modèles ajoutaient à chaque mot un vecteur qui dit en gros "je suis en position 3". La plupart des LLM actuels font plus malin, avec une technique appelée **RoPE** : ils font **tourner** Q et K selon la position, un peu comme les aiguilles d'une montre. Deux mots proches dans la phrase ont des angles proches, deux mots éloignés, des angles très différents.

## Ce qu'il faut retenir

- L'embedding brut est un point de départ **absolu**
- L'attention le transforme en coordonnée **contextuelle**
- Les 3 détails (multi-head, masking, position) sont des ajouts d'ingénierie autour du moteur
