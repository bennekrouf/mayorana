---
title: "De l'idée à LinkedIn et TikTok en une seule conversation"
slug: from-idea-to-linkedin-and-tiktok-with-mcp-fr
date: "2026-11-01"
author: Mayorana
category: ai
tags: ["ai", "mcp", "claude", "content", "automation"]
excerpt: "Planifier, enregistrer, peaufiner, couper un clip vertical, rédiger les posts et les publier : tout le circuit de publication d'une vidéo, piloté par Claude via MCP, avec votre accord avant toute mise en ligne."
seo_title: "Publier une vidéo sur LinkedIn et TikTok avec Claude et MCP"
meta_description: "Le circuit complet de l'idée au post LinkedIn et TikTok, étape par étape : les outils MCP que Claude utilise dans PolishCast et PublishKit, et la phrase à dire à chaque étape."
keywords: ["MCP", "Model Context Protocol", "Claude", "workflow de contenu", "LinkedIn", "TikTok", "enregistrement d'écran", "automatisation réseaux sociaux"]
status: "published"
---

Publier une vidéo, ce n'est pas une tâche. Il faut la planifier, l'enregistrer, couper les silences, l'exporter, en tirer un clip vertical pour TikTok, écrire un post LinkedIn et une légende, mettre chacun en ligne, puis se souvenir de ce qui est parti, et où.

Aucune de ces étapes n'est difficile. Ce qui coûte du temps, c'est de passer de l'une à l'autre : six applications, beaucoup de clics, et tout le contexte reste dans votre tête.

C'est ce trou que MCP comble. Chaque application expose ce qu'elle sait faire sous forme d'outils, et Claude les enchaîne depuis une seule conversation. Vous dites ce que vous voulez, et vous validez ce qui part en public.

## Le circuit complet

```text
               VOUS, dans une conversation
                           |
                           v
 +-------------------------------------------------+
 |                      Claude                     |
 +------+-------------+-------------+--------------+
        | MCP         | MCP         | MCP          | Chrome
        v             v             v              v
 Bibliothèque    PolishCast    PublishKit    LinkedIn
 planifier,      enregistrer,  rédiger,      TikTok
 suivre          peaufiner,    planifier     (votre oui)
                 couper

 1 Planifier -> 2 Enregistrer -> 3 Peaufiner -> 4 Couper
             -> 5 Rédiger -> 6 Publier

 Statut dans la bibliothèque, vu par toutes les applications :
 Planned -> Recording -> Ready -----------> Queued -> Posted
```

## Pourquoi ça marche

- **Une conversation au lieu de six applications.** Vous décrivez le résultat, pas les clics.
- **Chaque application reste l'experte.** [PolishCast](/fr/apps/polishcast) monte la vidéo, [PublishKit](/fr/apps/publishkit) garde les posts. Claude ne fait que les relier.
- **Une seule bibliothèque partagée.** Chaque fichier connaît son statut, et chaque application affiche le même calendrier. Plus de tableur à tenir à jour.
- **Vous gardez les décisions qui comptent.** Claude vous montre d'abord les textes, et ne clique jamais sur Publier sans votre accord.

Vous enregistrez du son, un podcast ou un live ? [TrackCut](/fr/apps/trackcut) prend la place de PolishCast aux étapes 2 et 3 : il découpe l'enregistrement en pistes, dans la même bibliothèque.

## Le comment, étape par étape

### 1. Planifier l'idée

```text
 "Planifie une vidéo..." --> plan_media
                               --> Bibliothèque : Planned, jeudi
```

Outils : `plan_media`, `calendar`. L'idée apparaît sur le calendrier de chaque application avant même d'être enregistrée.

> Planifie une vidéo pour jeudi : « Exporter un clip vertical en une phrase », pour LinkedIn et TikTok. Note : montrer l'avant et l'après.

### 2. Enregistrer

```text
 start_recording --> vous faites la démo --> stop_recording
                                                  |
                                                  v
                                  prise enregistrée, set_zooms
                                  propose un zoom à chaque clic
```

Outils : `list_sources`, `start_recording`, `stop_recording`, `set_zooms`. PolishCast fait un compte à rebours, puis enregistre jusqu'à ce que vous disiez stop.

> Enregistre ma fenêtre principale dans 3 secondes.

> Arrête l'enregistrement et propose les zooms.

### 3. Peaufiner

```text
 prise --> set_blanks --> set_style --> export --> MP4, 16:9
           silences       fond                    |
                                                  v
                                   fulfil_plan : l'idée
                                   devient cette vidéo
```

Outils : `set_blanks`, `set_style`, `export`, `fulfil_plan`. Les notes et les tags de l'idée passent à la vidéo finie.

> Coupe les silences, mets le fond sombre, exporte en 1080p, et relie-la à l'idée de jeudi.

### 4. Couper le clip pour TikTok

```text
 MP4 16:9 --> export_clip (début, fin, 9:16) --> MP4 1080x1920
```

Outil : `export_clip`. Les temps sont ceux de la vidéo finie : vous les donnez tels que vous les avez vus en la regardant.

> Coupe un clip vertical de 0:45 à 1:15 pour TikTok.

### 5. Rédiger les posts

```text
 vidéo --> queue_linkedin (texte + vidéo)  --> LinkedIn
 clip  --> queue_tiktok   (légende + clip) --> TikTok
                          |
                          v
       Bibliothèque : Queued, au calendrier jeudi 9:00
```

Outils : `queue_linkedin`, `queue_tiktok`, `set_date`. À l'heure prévue, PublishKit vous rappelle qu'un post est à publier.

> Écris un post LinkedIn avec la vidéo et une légende TikTok avec le clip, tous les deux pour jeudi 9:00. Montre-moi d'abord les textes.

### 6. Publier

```text
 post_now --> Chrome : texte collé, fichier joint
                 |
                 v
        STOP : « Je publie ? » -- vous : « oui » --> Publier
                 |
                 v
 publish_post (+ l'adresse du post) --> Bibliothèque : Posted
```

Outils : `post_now`, puis Claude dans Chrome, puis `publish_post`. PublishKit ne publie jamais tout seul. Claude travaille dans votre propre Chrome, où vous êtes déjà connecté. Il ne se connecte jamais à votre place, et s'arrête avant le bouton Publier jusqu'à votre oui.

> C'est l'heure : publie celui de LinkedIn via Chrome.

### Ensuite : suivre

```text
 calendar / list_media --> planifié, en attente, publié
```

> Qu'est-ce que j'ai publié cette semaine, et qu'est-ce qui attend encore ?

## La séquence complète

```text
1. Planifie une vidéo pour jeudi : « Exporter un clip vertical
   en une phrase », pour LinkedIn et TikTok.
2. Enregistre ma fenêtre principale dans 3 secondes.
3. Arrête l'enregistrement et propose les zooms.
4. Coupe les silences, mets le fond sombre, exporte en 1080p,
   et relie-la à l'idée de jeudi.
5. Coupe un clip vertical de 0:45 à 1:15 pour TikTok.
6. Écris un post LinkedIn avec la vidéo et une légende TikTok
   avec le clip, pour jeudi 9:00. Montre-moi d'abord les textes.
7. C'est l'heure : publie celui de LinkedIn via Chrome.
8. Qu'est-ce que j'ai publié cette semaine, et qu'est-ce qui
   attend encore ?
```

Huit phrases, trois applications, une vidéo sur deux réseaux.

## Points clés

- ✅ MCP supprime le travail entre les étapes, pas les étapes elles-mêmes.
- ✅ Chaque application fait bien une seule chose ; Claude les relie.
- ✅ Une bibliothèque partagée donne un statut à chaque fichier et le même calendrier à chaque application.
- ✅ Rien ne part en public sans votre accord.
