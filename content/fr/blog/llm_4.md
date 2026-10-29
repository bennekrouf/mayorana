---
id: transfer-learning-reusing-knowledge
title: 'Épisode 4 : Le Transfer Learning — Stratégies et notions clés'
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
seo_title: "Transfer learning : stratégies et notions clés (épisode 4)"
meta_description: "Pourquoi personne n'entraîne un modèle de zéro : feature extraction, fine-tuning et LoRA, puis le vocabulaire : oubli catastrophique, freezing, domain shift."
---

# Épisode 4 : Le Transfer Learning — Stratégies et notions clés

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

## Le vocabulaire autour

Le transfer learning s'accompagne d'une poignée de termes qu'on entend souvent sans vraiment les comprendre. Voici chacun en langage simple.

### Le "pré-entraînement" (Pre-training)

Phase où le modèle apprend sur des **tonnes de données brutes**. Il apprend la grammaire, les faits, le raisonnement. **Long et coûteux**, fait une seule fois par les géants.

**Analogie** : 20 ans d'école. Long, mais une fois fait, tout s'apprend plus vite.

### Le "fine-tuning"

Phase où on **spécialise** le modèle pour une tâche précise. **Court et accessible**.

**Analogie** : une formation pro de 3 mois après 20 ans d'études.

### Le "catastrophic forgetting" (oubli catastrophique)

Le piège : si tu fine-tunes trop fort, le modèle **oublie** ce qu'il savait. D'où les taux d'apprentissage très faibles, et l'intérêt du freezing (juste en dessous) ou de LoRA, qui laissent les poids d'origine intacts.

**Analogie** : un pianiste qui oublie le classique à force de jazz.

### Le "freezing" (gel)

Empêcher les poids d'une couche de changer pendant l'entraînement. Utile pour préserver le savoir générique.

**Analogie** : mettre sous plastique une partie d'un document.

### Le "domain shift" (décalage de domaine)

Si le modèle a appris sur du texte généraliste et que tu l'appliques à du juridique très technique, il y a un **décalage**.

**Analogie** : un généraliste qui devient chirurgien cardiaque.

### Le "taux d'apprentissage" (Learning Rate)

Contrôle **à quelle vitesse** le modèle modifie ses poids. En transfer learning, on utilise un taux **très faible** (ex : 0.00001). Avec LoRA, on monte plutôt autour de 0.0001, car seules les petites matrices ajoutées bougent.

**Analogie** : le dosage d'un médicament. Trop fort, ça casse tout.

## Ce qu'il faut retenir

- Réutiliser un savoir existant pour apprendre plus vite et mieux
- Trois stratégies : feature extraction, fine-tuning, LoRA
- Sans transfer learning, seuls les géants pourraient entraîner des modèles
- **Pré-entraînement** = long, coûteux, générique
- **Fine-tuning** = court, accessible, spécifique
- **Oubli catastrophique** = le piège à éviter
- **Freezing** = geler pour préserver
- **Domain shift** = le décalage à anticiper
- **Learning rate** = la vitesse de changement des poids, très faible en fine-tuning
