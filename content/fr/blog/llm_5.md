---
id: transfer-learning-key-concepts
title: 'Épisode 5 : Les concepts clés autour du Transfer Learning'
slug: transfer-learning-key-concepts
locale: fr
date: '2026-09-27'
author: mayo
excerpt: >-
  Pré-entraînement, fine-tuning, oubli catastrophique, freezing, domain shift
  et learning rate : les notions du transfer learning qu'on entend souvent,
  expliquées simplement avec une analogie pour chacune.
tags:
  - llm
  - ai
  - transfer-learning
  - fine-tuning
---

# Épisode 5 : Les concepts clés autour du Transfer Learning

## Introduction

Le transfer learning repose sur quelques notions qu'on entend souvent sans vraiment les comprendre. Voici une vulgarisation de chaque concept.

## Le "pré-entraînement" (Pre-training)

Phase où le modèle apprend sur des **tonnes de données brutes**. Il apprend la grammaire, les faits, le raisonnement. **Long et coûteux**, fait une seule fois par les géants.

**Analogie** : 20 ans d'école. Long, mais une fois fait, tout s'apprend plus vite.

## Le "fine-tuning"

Phase où on **spécialise** le modèle pour une tâche précise. **Court et accessible**.

**Analogie** : une formation pro de 3 mois après 20 ans d'études.

## Le "catastrophic forgetting" (oubli catastrophique)

Le piège : si tu fine-tunes trop fort, le modèle **oublie** ce qu'il savait. D'où les taux d'apprentissage très faibles, et l'intérêt du freezing (juste en dessous) ou de LoRA, qui laissent les poids d'origine intacts.

**Analogie** : un pianiste qui oublie le classique à force de jazz.

## Le "freezing" (gel)

Empêcher les poids d'une couche de changer pendant l'entraînement. Utile pour préserver le savoir générique.

**Analogie** : mettre sous plastique une partie d'un document.

## Le "domain shift" (décalage de domaine)

Si le modèle a appris sur du texte généraliste et que tu l'appliques à du juridique très technique, il y a un **décalage**.

**Analogie** : un généraliste qui devient chirurgien cardiaque.

## Le "taux d'apprentissage" (Learning Rate)

Contrôle **à quelle vitesse** le modèle modifie ses poids. En transfer learning, on utilise un taux **très faible** (ex : 0.00001). Avec LoRA, on monte plutôt autour de 0.0001, car seules les petites matrices ajoutées bougent.

**Analogie** : le dosage d'un médicament. Trop fort, ça casse tout.

## Ce qu'il faut retenir

- **Pré-entraînement** = long, coûteux, générique
- **Fine-tuning** = court, accessible, spécifique
- **Oubli catastrophique** = le piège à éviter
- **Freezing** = geler pour préserver
- **Domain shift** = le décalage à anticiper
- **Learning rate** = le dosage qui détermine le succès
