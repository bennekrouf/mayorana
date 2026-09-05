---
id: logic-apps-workflow-chains-fr
title: "Tes Logic Apps forment un graphe, et le portail Azure ne te montre qu'une liste"
locale: fr
slug: logic-apps-workflow-chains-fr
date: '2026-09-05'
author: mayo
excerpt: >-
  Passé une douzaine de workflows, un parc Azure Logic Apps cesse d'être une
  liste pour devenir un graphe relié par des files Service Bus et des topics
  Event Grid. Pourquoi le portail ne peut pas le montrer, et quoi faire.
tags:
  - azure
  - logic-apps
  - service-bus
  - event-grid
  - integration
---

# Tes Logic Apps forment un graphe, et le portail Azure ne te montre qu'une liste

Demande à quiconque a hérité d'un parc Azure Integration Services ce qui a été le plus dur la première semaine. Ce n'est presque jamais le code. C'est de comprendre ce qui appelle quoi.

## Le portail montre des workflows, pas des connexions

Ouvre Logic Apps dans le portail Azure et tu obtiens une liste. Chaque workflow a une définition, un historique d'exécutions et un jeu de déclencheurs. Chacune de ces vues est limitée à un seul workflow.

Mais les workflows ne sont pas indépendants. L'un reçoit une requête HTTP et dépose un message sur une file Service Bus. Un deuxième est déclenché par cette file, transforme le payload et publie un événement Event Grid. Un troisième souscrit au topic et écrit dans Cosmos DB. Le processus métier, c'est la chaîne. Le portail ne te montre jamais qu'un maillon à la fois.

Cela produit un mode de défaillance très courant : une commande disparaît, et la première demi-heure de l'investigation ne sert pas à déboguer mais à reconstituer quels workflows étaient censés intervenir.

## Pourquoi la connexion est difficile à voir

Le lien entre deux workflows est indirect par conception. Le workflow A n'appelle pas le workflow B. Le workflow A écrit dans une file nommée `orders-inbound`, et le workflow B se trouve avoir un déclencheur lié à `orders-inbound`. Aucune des deux définitions ne nomme l'autre.

Cette indirection est tout l'intérêt de l'intégration par messages — c'est ce qui permet de les déployer indépendamment. Cela signifie aussi que la topologie n'existe que comme propriété émergente des définitions, exactement le genre de chose que la documentation cesse de décrire correctement dans le mois qui suit sa rédaction.

Les réponses habituelles sont toutes partielles :

- **Un schéma Visio.** Juste le jour où il a été dessiné. Aucun mécanisme ne le maintient juste.
- **Des conventions de nommage.** Utiles jusqu'au workflow qui précède la convention — invariablement celui que tu débogues.
- **Les cartes Application Insights.** Elles montrent ce qui a appelé quoi sur une fenêtre échantillonnée. Utile, mais c'est du trafic observé, pas la topologie : une chaîne qui n'a pas tourné récemment n'y figure tout simplement pas.

## Déduire le graphe plutôt que le dessiner

Les définitions contiennent tout le nécessaire. Chaque workflow déclare dans ses actions les files et topics qu'il alimente, et dans ses déclencheurs ceux qu'il écoute. Rapproche les sorties des uns des entrées des autres et le graphe apparaît.

Une fois le graphe obtenu, plusieurs questions qui relevaient de l'archéologie deviennent une simple consultation :

- Quels workflows cette chaîne traverse-t-elle, et dans quel ordre ?
- Si je change le schéma de cette file, qu'est-ce qui casse en aval ?
- Cette chaîne a trois étapes — laquelle a réussi en dernier ?
- Est-ce que quelque chose écrit dans une file que personne ne lit ?

Cette dernière question trouve de vrais bugs étonnamment souvent. Un workflow a été renommé, son consommateur pointe encore sur l'ancien nom de file, et les messages s'accumulent en silence depuis des semaines.

## Parcourir une chaîne plutôt qu'un workflow

Le deuxième apport du graphe est une meilleure unité pour l'historique d'exécutions. Le portail donne un historique par workflow : investiguer un processus métier en échec revient donc à ouvrir quatre panneaux et à comparer des timestamps à l'œil.

Un historique par *chaîne* — chaque exécution de chaque workflow de la chaîne, dans l'ordre réel — est la vue que l'investigation réclame. La défaillance saute généralement aux yeux, parce que la chaîne s'arrête, tout simplement.

C'est ce que fait [AIS Monitor](/fr/apps/ais-monitor) : il construit le graphe des chaînes à partir de tes définitions de workflows déployés, le dessine, et permet de suivre l'historique le long d'une chaîne plutôt que d'un workflow. Il garde aussi les payloads HTTP de test à côté du workflow concerné, pour que redéclencher un point d'entrée ne signifie pas reconstruire la requête de mémoire.

L'usage en lecture ne demande que le rôle Reader. La console de bureau peut aussi modifier l'état Azure — déclencher des workflows, réinitialiser des app settings, purger et réinjecter des messages Service Bus, attribuer des rôles RBAC — et chacune de ces actions passe par une confirmation qui affiche la commande `az` exacte avant de la lancer.

## Où cela se situe

Surveiller un parc déployé est un problème. Développer localement contre lui en est un autre : pour cela, [AIS Runner](/fr/apps/ais-runner) exécute Logic Apps Standard sur ta machine sans déployer sur Azure.

Et quand la question n'est pas « quels workflows sont concernés » mais « jusqu'où cette commande est-elle allée », c'est un problème de traçage : [AIS Tracing](/fr/apps/ais-tracing) suit un identifiant de corrélation à travers tous les containers d'un compte Cosmos DB, et [AIS Analytics](/fr/apps/ais-analytics) fait de même sur un espace de travail Log Analytics.

Toutes sont des apps de bureau natives écrites en Rust, à source disponible sur GitHub, et gratuites pour un usage personnel, éducatif et non lucratif — l'usage commercial requiert une licence.
