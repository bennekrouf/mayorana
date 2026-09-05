---
id: ai-commit-messages-without-giving-up-control-fr
title: "Des messages de commit par IA sans céder le contrôle de ton historique git"
locale: fr
slug: ai-commit-messages-without-giving-up-control-fr
date: '2026-09-05'
author: mayo
excerpt: >-
  L'outillage git dopé à l'IA prend deux formes : une zone de texte d'où l'on
  copie, ou un agent qui exécute des commandes et prévient après coup. Il
  existe une troisième voie, et tout tient à l'endroit où se situe la validation.
tags:
  - git
  - ai
  - developer-tools
  - rust
  - llm
---

# Des messages de commit par IA sans céder le contrôle de ton historique git

L'outillage IA autour de git prend couramment deux formes, et toutes deux mettent mal à l'aise, pour des raisons différentes.

## Forme un : la zone de texte

Tu colles un diff dans une fenêtre de chat, tu récupères un message de commit et tu le recopies dans ton terminal. Ça marche. C'est aussi trois changements de contexte pour une tâche qui devrait n'en demander aucun, et le modèle ne voit jamais que ce que tu as pensé à coller.

## Forme deux : l'agent autonome

Tu donnes à un outil l'accès au dépôt et il committe, pousse et ouvre la pull request. Plus rapide — jusqu'à la première fois où il force-push une branche, réécrit un commit que tu n'avais pas terminé, ou ouvre une PR sur la mauvaise base.

L'argument de vente de ces outils, c'est l'autonomie. Mais l'autonomie n'est pas ce que l'on attend d'un outil git. Git est la partie du workflow où une action non voulue coûte réellement cher : l'historique est un état partagé, et défaire un mauvais push est une conversation avec ton équipe, pas une frappe au clavier.

## Ce qui compte vraiment, c'est où se situe la validation

La bonne distinction n'est pas « à quel point le modèle est bon » mais « que se passe-t-il entre la proposition et l'effet ».

Rédiger un message de commit est un problème de texte, et les modèles y excellent. Lancer `git push` n'est pas un problème de texte — c'est une action irréversible sur un état partagé. Les fusionner en une étape autonome fait dépendre la seconde de la qualité de la première, ce qui est exactement le mauvais couplage.

Sépare-les et les deux s'améliorent :

- **La rédaction** peut être généreuse. Laisse le modèle lire tout le répertoire de travail, proposer un message, proposer un corps de PR. Rien n'est en jeu ; c'est du texte à l'écran.
- **Les effets** sont validés un par un. Le commit est une validation. Le push en est une autre. L'ouverture de la PR encore une autre. Chacune montre la commande exacte avant qu'elle ne parte.

Ce n'est pas un compromis entre les deux formes. C'est strictement mieux que les deux : tu as la rédaction du modèle sans le copier-coller, et l'exécution des commandes sans abandonner la décision.

## Le diff est la partie sensible

Il y a une deuxième raison de tenir à cette frontière, et elle concerne ce qui quitte la machine.

Un diff est l'un des artefacts les plus révélateurs que produit un dépôt privé. Il contient non seulement du code mais la forme de ce sur quoi tu travailles en ce moment — fonctionnalités non publiées, correctifs de sécurité avant leur sortie, les entrailles de ce qui est propriétaire.

L'envoyer à une API hébergée est une vraie décision, et pour beaucoup d'équipes elle a déjà été prise par une politique interne. Faire tourner le modèle de rédaction en local via [ollama](https://ollama.com) supprime la question : le diff est lu, le message est rédigé, et rien ne traverse le réseau. Les modèles locaux sont largement suffisants pour résumer un diff — une tâche bien cadrée dont la réponse se trouve dans l'entrée.

Un modèle hébergé reste disponible pour les équipes qui le préfèrent. L'important est que ce soit un choix et non une obligation.

## À quoi ressemble le flux

Le chemin d'un répertoire de travail modifié vers une pull request ouverte est une séquence, et c'est la même à chaque fois :

1. Scanner le répertoire de travail — qu'est-ce qui a changé ?
2. Rédiger un message de commit à partir de ce diff.
3. Committer. *(validation)*
4. Pousser. *(validation)*
5. Rédiger une description de PR à partir des commits de la branche.
6. Ouvrir la pull request. *(validation)*

Modéliser cela explicitement comme un graphe d'étapes, plutôt que comme un unique bouton « fais le truc », est ce qui fait de chaque barrière un point d'arrêt naturel plutôt qu'une interruption greffée sur une boucle autonome.

[GitAgent](/fr/apps/gitagent) implémente exactement cela. C'est une app de bureau native en Rust, elle rédige avec un modèle ollama local ou avec DeepSeek, et rien ne touche l'historique git ni le remote sans un accord explicite sur cette étape précise. La création de PR passe par le CLI GitHub : cette étape est donc limitée à GitHub pour l'instant ; commit et push fonctionnent avec n'importe quel remote.

L'app est marquée en cours de développement — le chemin commit-vers-PR fonctionne, mais l'interface bouge encore. [Télécharge-la](/fr/apps/gitagent) pour macOS, Windows ou Linux : gratuite pour un usage personnel, éducatif et non lucratif, licence requise pour l'usage commercial.

## La forme générale

Le plus intéressant, au fond, ne concerne pas git. C'est que « outil IA » et « agent autonome » sont devenus discrètement synonymes, et qu'ils ne devraient pas l'être.

Beaucoup d'outillage utile consiste en un modèle qui rédige et un humain qui garde la décision — non parce que le modèle serait indigne de confiance, mais parce que le coût d'une mauvaise action est asymétrique. Git en est un exemple net. Ce ne sera pas le dernier.
