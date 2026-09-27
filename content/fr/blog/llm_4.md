---
id: transfer-learning-reusing-knowledge
title: 'Épisode 4 : Le Transfer Learning — Réutiliser un savoir existant'
slug: transfer-learning-reusing-knowledge
locale: fr
date: '2026-09-27'
author: mayo
excerpt: >-
  Pourquoi personne n'entraîne un modèle à partir de zéro : d'où vient le
  transfer learning, ce qu'il fait gagner, et ses trois stratégies —
  feature extraction, fine-tuning et LoRA.
tags:
  - llm
  - ai
  - transfer-learning
  - fine-tuning
  - lora
---

# Épisode 4 : Le Transfer Learning — Réutiliser un savoir existant

## D'où ça vient ?

Un être humain qui sait jouer au tennis n'apprend pas le badminton à partir de zéro. Il réutilise ses réflexes. De même, un modèle qui a appris à reconnaître des chats n'a pas besoin de réapprendre ce qu'est un contour ou une texture.

En IA, l'idée a explosé avec les réseaux profonds vers 2012, puis avec les LLM en 2018. Le constat : **les premières couches apprennent des choses génériques**, les dernières des choses spécifiques.

## Pourquoi on fait ça ?

1. **Gain de temps** : entraîner from scratch coûte des millions. Fine-tuner prend quelques heures.
2. **Gain de données** : un modèle pré-entraîné sur 10M d'images a déjà "compris" ce qu'est une image.
3. **Gain de performance** : un modèle fine-tuné bat souvent un modèle entraîné from scratch sur les mêmes données.

## Les 3 stratégies

### 1. Feature Extraction

Tu **gèles** toutes les couches, tu n'entraînes qu'une **nouvelle couche finale**. Le modèle sert de "détecteur de features".

### 2. Fine-Tuning

Tu **dégèles** tout ou une partie, et tu réentraînes avec un **taux d'apprentissage très faible**.

### 3. LoRA (Low-Rank Adaptation)

On **ajoute de petites matrices** à côté des existantes, et on n'entraîne que celles-là : souvent moins de 1 % des paramètres du modèle. Combiné à un modèle chargé en 4 bits (**QLoRA**, 2023), on peut même fine-tuner un modèle de 70 milliards de paramètres sur un seul GPU haut de gamme.

## Le lien avec l'attention

- Tu **gardes** les premières couches (orthographe, grammaire, relations)
- Tu **réentraînes** les dernières (ta tâche spécifique)

Comme un immeuble : tu gardes la structure (tout ce que le modèle a déjà appris) et tu n'ajustes qu'une petite partie. Soit tu refais les derniers étages (le fine-tuning des dernières couches), soit tu ajoutes quelques cloisons par-dessus (LoRA).

## Ce qu'il faut retenir

- Réutiliser un savoir existant pour apprendre plus vite et mieux
- Trois stratégies : feature extraction, fine-tuning, LoRA
- Sans transfer learning, seuls les géants pourraient entraîner des modèles
