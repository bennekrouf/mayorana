---
id: trace-correlation-id-cosmos-db-fr
title: "Jusqu'où cette commande est-elle allée ? Tracer un identifiant de corrélation dans Cosmos DB"
locale: fr
slug: trace-correlation-id-cosmos-db-fr
date: '2026-09-05'
author: mayo
excerpt: >-
  Un client signale qu'une commande n'est jamais arrivée. Tu as un
  identifiant de corrélation et un compte Azure Cosmos DB avec plus de
  containers que personne ne se rappelle. Les résultats vides comptent plus
  que les résultats pleins.
tags:
  - azure
  - cosmos-db
  - observability
  - integration
  - debugging
---

# Jusqu'où cette commande est-elle allée ? Tracer un identifiant de corrélation dans Cosmos DB

Le ticket de support indique que la commande `SO-44192` n'est jamais arrivée. Tu as la référence, et tu as un compte Cosmos DB qui contient l'état de chaque étape du flux d'intégration. La question tient en une phrase : jusqu'où est-elle allée ?

Y répondre tient rarement en une étape.

## La forme du problème

Un flux d'intégration typique persiste son état au fil de l'eau. L'étape d'entrée écrit un document. L'étape de validation en écrit un autre. Enrichissement, routage, confirmation de livraison — chacune laisse une trace, souvent dans son propre container, parfois dans sa propre base.

Pour suivre une valeur là-dedans, il faut savoir trois choses :

1. Quels containers pourraient contenir un document pour ce flux.
2. Quel champ, dans chaque container, porte la valeur de corrélation.
3. À quoi ressemble « absent », par opposition à « j'ai mal écrit la requête ».

C'est sur le troisième point que part l'essentiel du temps.

## Pourquoi c'est pire que ça n'en a l'air

Chaque container a été conçu par la personne qui a construit l'étape, au moment où elle l'a construite. La valeur de corrélation s'appelle `correlationId` dans l'un, `orderRef` dans un autre, se cache sous `metadata.trackingId` dans un troisième, et dans le container ajouté le trimestre dernier, c'est la clé de partition.

La version honnête de la tâche est donc : ouvrir Data Explorer, écrire une requête, obtenir zéro résultat, se demander si la donnée est absente ou si le nom du champ est faux, vérifier le schéma, réécrire la requête, recommencer — une fois par container.

Au vingtième container, tu as perdu une heure et toute confiance dans tes résultats négatifs. Or ce sont les négatifs que tu es venu chercher.

## Les résultats vides sont la trouvaille

Ce point mérite d'être explicite, car il inverse la façon dont on lit habituellement ces requêtes.

Quand tu traces une valeur à travers un flux, un container **sans** document correspondant n'est pas une requête ratée à passer. C'est une information. Le motif que tu cherches est celui-ci :

```
entrée        ✓  10:02:11
validation    ✓  10:02:14
enrichissement ✓ 10:02:19
routage       —
livraison     —
```

La rupture entre l'enrichissement et le routage *est* la réponse. La commande est allée jusqu'à l'enrichissement et s'est arrêtée. Tu sais maintenant quelle étape ouvrir dans les logs, et tu y es arrivé sans lire un seul log.

Un outil qui masque ses résultats vides jette la moitié de ce que la trace te dit.

## Déduire le champ de liaison

La partie réellement pénible — le nom de champ qui diffère d'un container à l'autre — se résout sans configuration.

Échantillonne un container. Regarde les valeurs à travers ses documents. Les champs qui relient les documents entre eux ont une signature reconnaissable : forte cardinalité, format constant, présence dans la plupart des documents et — surtout — valeurs partagées avec des champs d'autres containers. Un timestamp `createdAt` ne ressemble pas à cela. Un identifiant de corrélation, si.

Faire cette déduction depuis les données signifie que tu n'as jamais à décrire ton schéma à l'outil, et que cela continue de fonctionner quand quelqu'un ajoute un container le trimestre suivant avec encore un autre nom de champ.

## En pratique

[AIS Tracing](/fr/apps/ais-tracing) fait exactement cela : il échantillonne les containers d'un compte Cosmos DB, détermine quel champ relie les documents d'un même flux, suit la valeur que tu lui donnes à travers tous, et dessine chaque étape sur une timeline en laissant les trous visibles.

Il est en lecture seule sur ton compte, et c'est une app de bureau native — aucun agent à déployer, rien à installer dans ta souscription.

Si l'état de tes flux vit dans un espace de travail Log Analytics plutôt que dans Cosmos DB, [AIS Analytics](/fr/apps/ais-analytics) est le même traceur pointé sur celui-ci, qui déduit la colonne de liaison plutôt que le champ.

Et si ta vraie question est « quels workflows étaient censés intervenir » plutôt que « jusqu'où est-ce allé », c'est un problème de topologie : [AIS Monitor](/fr/apps/ais-monitor) construit le graphe des chaînes à partir de tes Logic Apps déployées.
