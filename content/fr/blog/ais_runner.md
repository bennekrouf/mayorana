---
id: ais-runner-intro-fr
title: "AIS Runner : une interface bureau pour le développement local d'Azure Logic Apps Standard"
locale: fr
slug: ais-runner-intro-fr
date: '2026-05-29'
author: mayo
excerpt: >-
  AIS Runner est une application bureau basée sur Dioxus pour le développement
  local d'Azure Logic Apps Standard — gérez, exécutez, déboguez et comparez
  vos workflows sans quitter votre environnement de développement.
tags:
  - azure
  - logic-apps
  - dioxus
  - rust
  - desktop
---

# AIS Runner : une interface bureau pour le développement local d'Azure Logic Apps Standard

Développer des Azure Logic Apps Standard en local oblige habituellement à jongler entre la CLI, les extensions VS Code, le portail Azure, les pipelines DevOps et plusieurs terminaux pour inspecter des files Service Bus ou comparer des paramètres d'environnement. **AIS Runner** regroupe tout cela dans une seule application bureau basée sur Dioxus — une interface graphique pour gérer, exécuter, déboguer et comparer vos workflows sans quitter votre environnement de développement.

L'application est native sur macOS, Windows et Linux grâce à Dioxus desktop (WebView).

## 🔧 Environnement de développement local

- **Auto-détection des prérequis** — vérifie la présence de Node.js, Azure Functions Core Tools, .NET et Java, et guide l'installation
- **Gestion des workspaces de projet** — lie vos projets Logic Apps locaux à leurs équivalents Azure (souscription, groupe de ressources, nom de l'app, namespace Service Bus)
- **Éditeur de `local.settings.json`** — éditeur clé/valeur visuel avec masquage des secrets, regroupé par catégorie (Service Bus, chaînes de connexion, etc.)
- **Support du thème système** — détection auto du mode sombre/clair de l'OS avec bascule manuelle

## ▶️ Exécution des workflows

- Exécution locale des workflows avec **prise en charge des triggers** (HTTP, Service Bus, Blob)
- **Éditeur de payload** — compose et envoie des payloads JSON pour déclencher les workflows
- **Injection de messages Service Bus** — envoi de messages vers des queues via AMQP, avec détection automatique de l'émulateur local ou du namespace cloud
- **Support des triggers Blob** — vérifications préalables de l'existence du conteneur Azurite
- **Historique des exécutions** — inspection détaillée de chaque exécution, entrées/sorties par action

## 📊 Visualisation des workflows

- Liste des workflows avec indicateurs de type de trigger et statut
- **Panneau graphique visuel** — rendu DAG des dépendances entre actions
- **Analyse des workflows** — détecte toutes les queues, connexions et actions référencées
- **Diagnostic des connexions** — valide les références dans `connections.json` et signale les bindings `@appsetting` cassés

## ☁️ Intégration Azure Cloud

- **Panneau Azure** — liste les workflows distants, diff entre local et déployé
- **Sync & deploy** — comparaison du JSON local avec la version déployée sur Azure
- **Téléchargement des configs distantes** — récupère `parameters.json` et `connections.json` depuis Azure
- **Historique d'exécution depuis Azure** — récupère l'historique des workflows déployés
- **Intégration `az login`** — détecte les tokens expirés et propose une ré-authentification

## 🔄 Intégration Azure DevOps

- **Visualiseur de pipelines** — liste et navigation dans les pipelines DevOps liés au projet
- **Auto-détection de l'URL DevOps** depuis le remote git
- **Navigateur de groupes de variables** — liste tous les variable groups DevOps et inspecte leur contenu

## ⊞ Comparaison d'environnements

- **Comparaison multi-colonnes** — compare `local.settings.json` avec les paramètres Azure et plusieurs variable groups DevOps côte à côte
- **Filtrage des différences** — bascule « Différences seulement » avec cases par colonne pour comparer n'importe quel sous-ensemble d'environnements
- **Masquage des secrets** — masque les clés sensibles avec un bouton de révélation
- **Cellules cliquables** avec copie dans le presse-papiers et popup de détail

## ⚡ Event Grid

- **Navigateur de topics** — liste tous les topics Event Grid custom et système au niveau de la souscription, avec badges de groupe de ressources
- **Inspecteur de souscriptions** — déploie un topic pour voir les event subscriptions avec leur type d'endpoint, filtres et types d'événements
- **Comparaison de topics** — comparaison côte à côte de topics Event Grid entre environnements, en mettant en évidence les différences de souscriptions et de filtres

## 🚌 Service Bus

- **Détection des queues** — analyse tous les triggers et actions des workflows pour trouver les queues Service Bus référencées
- **Gestion de l'émulateur** — émulateur Service Bus basé sur Docker avec génération automatique de configuration
- **Navigateur de queues (panneau DB)** — inspection du nombre de messages, dead-letter queues, envoi de messages de test
- **Comparaison multi-environnements** — compare les queues entre les namespaces DEV/STG/PROD avec diff des propriétés (session, max delivery, durée de lock, TTL, auto-delete)
- **Badges DLQ et messages actifs** dans la vue de comparaison

## 💾 Connecteurs de données (panneau DB)

- **SQL** — gestion des connexions aux bases SQL Server référencées par les workflows
- **Cosmos DB** — navigation et gestion des connexions Cosmos DB
- **Blob Storage / Azurite** — intégration de l'émulateur Azurite local, gestion des conteneurs, configuration du WebJobs storage
- **SFTP** — visualisation des connexions SFTP pour les intégrations basées sur des fichiers
- **Maps** — gestion des maps Logic Apps (transformations XSLT/Liquid)

## 🖥️ Expérience utilisateur

- **Split pane redimensionnable** — séparateur ajustable entre la liste de workflows et le panneau de détail
- **Configuration persistante** — liens de workspace, préférences de graphe et paramètres conservés entre les sessions
- **Raccourcis clavier** — Échap pour fermer les overlays
- **Multi-plateforme** — fonctionne sur macOS, Windows et Linux via Dioxus desktop (WebView)

## Pourquoi une application bureau native ?

Construire AIS Runner avec Dioxus en Rust lui donne la réactivité d'une application native avec une couche UI moderne. Pas d'empreinte mémoire à la Electron, pas d'onglet de navigateur à perdre. L'app vit à côté de votre éditeur et de votre terminal, communique directement avec vos émulateurs locaux, et s'authentifie sur Azure avec la même session `az` CLI que vous utilisez déjà.

Si vous travaillez quotidiennement avec Logic Apps Standard, AIS Runner est conçu pour supprimer les frictions entre écrire un workflow, l'exécuter en local, le comparer entre environnements et le livrer en production.
