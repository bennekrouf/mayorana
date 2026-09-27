---
id: embeddings-vector-databases-rag
title: 'Épisode 6 : Embeddings et bases vectorielles'
slug: embeddings-vector-databases-rag
locale: fr
date: '2026-09-27'
author: mayo
excerpt: >-
  Des mots-clés au sens : comment les embeddings et la similarité cosinus
  permettent de chercher par proximité, pourquoi il faut une base
  vectorielle, et comment tout s'assemble en un RAG.
tags:
  - llm
  - ai
  - embeddings
  - vector-database
  - rag
---

# Épisode 6 : Embeddings et bases vectorielles

## D'où vient le besoin ?

Pendant longtemps, chercher dans un texte, c'était chercher des **mots exacts**. "Voiture" ne trouvait pas "automobile". La **recherche par mot-clé** est rapide mais **bête** : elle ne comprend pas le sens.

C'est là qu'interviennent les **embeddings**.

## Pourquoi les embeddings changent tout ?

Un embedding, c'est un vecteur qui représente le **sens** d'un texte. Deux textes qui veulent dire la même chose auront des vecteurs **proches géométriquement**.

**Analogie** : une carte où chaque mot est une ville. "Voiture", "automobile", "véhicule" sont voisines. "Banane" est à l'autre bout.

## Comment on calcule la proximité ?

Avec la **similarité cosinus**. Elle mesure l'**angle** entre deux vecteurs, pas leur distance. Pourquoi l'angle ? Parce qu'un texte long et un texte court sur le même sujet peuvent avoir des vecteurs de tailles différentes, mais qui **pointent dans la même direction**.

- Similarité = 1 → même direction, sens très proche
- Similarité = 0 → aucun rapport
- Similarité = -1 → directions opposées. Rare en pratique, et ce n'est pas "le sens contraire" : "chaud" et "froid" sont même assez proches, car ils apparaissent dans les mêmes contextes.

C'est un cousin direct du produit scalaire Q·K de l'attention : la similarité cosinus, c'est ce même produit scalaire, divisé par la longueur des deux vecteurs. On garde l'orientation, on ignore la taille.

## Pourquoi une base vectorielle ?

Une base SQL cherche par **égalité**. Une base vectorielle cherche par **proximité**. Mais comparer 10 millions de vecteurs un par un est trop lent. Des outils comme **LanceDB**, **Pinecone**, **Qdrant** utilisent des algorithmes d'**indexation approximative** (HNSW, IVF…) pour trouver les voisins en millisecondes.

**Analogie** : un index à la fin d'un livre. Tu ne lis pas 500 pages, tu vas directement à la bonne.

## Le lien avec l'attention

L'attention compare des mots **dans une phrase**. Une base vectorielle compare des **documents entiers**. Même principe (trouver ce qui est proche dans l'espace du sens), échelle différente.

## Le lien avec le transfer learning

Les embeddings viennent d'un modèle **pré-entraîné**. C'est du transfer learning pur : on réutilise un modèle qui a appris le sens du langage sur des milliards de phrases.

## Le pipeline complet

1. **Pré-entraînement** : le modèle apprend le sens du langage
2. **Embedding** : on transforme nos documents en vecteurs
3. **Indexation** : on stocke dans une base vectorielle
4. **Requête** : on transforme la question en vecteur
5. **Recherche** : on trouve les documents les plus proches
6. **Injection** : on donne ces documents à un LLM

## Ce que certains appellent un RAG

Ce pipeline — embeddings + base vectorielle + recherche par similarité + injection dans un LLM — c'est ce que certains appellent un **RAG** (Retrieval-Augmented Generation). Le nom est compliqué, l'idée est simple : **on va chercher de l'information pertinente avant de générer une réponse**.

C'est une application concrète de tout ce qu'on a vu : vecteurs, similarité, transfer learning, LLM.

## Ce qu'il faut retenir

- Les embeddings transforment le **sens** en **géométrie**
- Une base vectorielle cherche par **proximité**
- La similarité cosinus compare l'**orientation**
- C'est le même principe que l'attention, à plus grande échelle
- Les embeddings viennent du **transfer learning**
- Le pipeline complet est ce que certains appellent un **RAG**
