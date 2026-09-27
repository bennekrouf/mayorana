---
id: llm-from-scratch-introduction
title: 'Épisode 0 : Pourquoi coder les LLM from scratch'
slug: llm-from-scratch-introduction
locale: fr
date: '2026-09-27'
author: mayo
excerpt: >-
  Comprendre comment fonctionnent les LLM sans doctorat en mathématiques :
  la promesse de la série, ce que tu vas apprendre, et l'idée qui relie tous
  les épisodes.
tags:
  - llm
  - ai
  - rust
  - machine-learning
---

# Épisode 0 : Pourquoi coder les LLM from scratch

## La promesse de cette série

Comprendre comment fonctionnent les LLM (ChatGPT, Claude, etc.) sans avoir besoin d'un doctorat en mathématiques. Chaque épisode part d'une question simple, explique le "pourquoi" avant le "comment", et utilise des exemples en Rust quand ça aide.

## Pourquoi "from scratch" ?

Parce que lire des articles ne suffit pas. C'est comme la cuisine : regarder une recette ne t'apprend pas à cuisiner. Coder les 4 opérations de l'attention toi-même t'apprendra plus que des heures de lecture.

## Ce que tu vas apprendre

- Comment un mot "regarde" les autres mots (attention)
- Pourquoi on sépare Q, K et V (spécialisation)
- Comment le sens est transformé en géométrie (embeddings)
- Comment réutiliser un modèle existant (transfer learning)
- Comment tout ça s'assemble pour créer un RAG

## À qui s'adresse cette série ?

À toute personne curieuse qui sait lire du code simple et qui veut comprendre l'IA sans se perdre dans le jargon. Pas besoin d'être mathématicien, juste d'être patient.

## Le fil rouge

Une seule idée parcourt toute la série : **le sens peut être représenté par des vecteurs, et on peut comparer ces vecteurs par proximité**. Tout le reste en découle.
