---
id: trace-correlation-id-log-analytics-fr
title: "Suivre un identifiant de corrélation dans Log Analytics sans écrire de KQL"
locale: fr
slug: trace-correlation-id-log-analytics-fr
date: '2026-09-05'
author: mayo
excerpt: >-
  Un espace de travail Log Analytics contient la réponse à la question de
  savoir où ton flux s'est arrêté. L'en extraire demande d'ordinaire une
  requête KQL par table et de savoir quelle colonne relie les étapes.
tags:
  - azure
  - log-analytics
  - kql
  - observability
  - debugging
---

# Suivre un identifiant de corrélation dans Log Analytics sans écrire de KQL

L'essentiel de la télémétrie d'intégration Azure atterrit dans un espace de travail Log Analytics. C'est le bon endroit. C'est aussi un endroit où une question simple — où le flux s'est-il arrêté ? — se transforme en projet de recherche.

## L'espace de travail dont personne ne connaît la forme

Un espace de travail en service depuis un an contient des tables venues de partout : `AzureDiagnostics` qui porte les données d'exécution Logic Apps, des tables personnalisées créées selon ce que l'équipe applicative a décidé d'émettre, les tables Application Insights, les diagnostics Service Bus, les traces de fonctions.

Personne n'en a un modèle mental complet. Ceux qui en ont un partiel en connaissent chacun un tiers différent.

Tracer un identifiant de corrélation revient donc à : déterminer quelles tables peuvent être pertinentes, déterminer comment s'appelle la colonne de corrélation dans chacune, écrire une requête par table, et garder les résultats en tête pendant qu'on compare les timestamps.

## Le KQL n'est pas la difficulté

Il est tentant de voir là un manque de compétence — si tout le monde connaissait KQL, le problème disparaîtrait.

Il ne disparaîtrait pas. KQL est un bon langage de requête et sa syntaxe s'apprend en un après-midi. La difficulté n'est pas d'exprimer la requête, c'est de savoir sur quoi l'exprimer. Un `union *` sur un gros espace de travail est assez lent et coûteux pour que personne ne le fasse deux fois. Cibler des tables précises suppose de savoir lesquelles comptent — précisément la connaissance qui te manque.

Le goulot d'étranglement est la découverte de schéma, pas la syntaxe. Et c'est une bonne nouvelle, car la découverte de schéma est mécanique.

## Laisser les données nommer leur propre clé

La colonne de liaison peut être déduite plutôt que déclarée. À travers les tables d'un espace de travail, la colonne qui relie les étapes d'un même flux a une forme distinctive : elle se répète d'une table à l'autre, ses valeurs ont une forte cardinalité, et la même valeur apparaît dans plusieurs tables dans une fenêtre de temps courte. Les colonnes qui lui ressemblent superficiellement — un timestamp, un identifiant de ressource, un niveau de sévérité — ne se comportent pas ainsi.

Détermine cette colonne depuis l'espace de travail lui-même et tout le problème de la requête-par-table s'effondre. Tu colles une valeur ; l'outil trouve où chercher et quoi chercher.

## Lire les trous

Comme pour le traçage dans une base documentaire, la sortie utile n'est pas une liste de lignes correspondantes. C'est une timeline avec des voies, y compris les voies vides.

```
http-trigger        ✓  14:31:02
transform           ✓  14:31:03
publish-to-queue    ✓  14:31:04
queue-consumer      —
persist             —
```

Le flux a atteint l'étape de publication et rien n'a consommé le message. C'est un problème Service Bus, pas un problème de transformation, et la timeline te l'a dit d'un coup d'œil plutôt qu'après quatre requêtes.

Afficher les voies vides est un choix délibéré. Une requête qui ne renvoie rien ressemble à une erreur ; une voie dessinée et vide ressemble à une trouvaille — ce qu'elle est.

## L'outil

[AIS Analytics](/fr/apps/ais-analytics) est une app de bureau native qui fait cela sur un espace de travail Log Analytics : colle un identifiant de corrélation, l'app déduit la colonne de liaison depuis les données, suit la valeur à travers les tables et dispose les étapes — présentes et absentes — sur une timeline. Elle n'exécute que des requêtes en lecture.

Elle a une sœur, [AIS Tracing](/fr/apps/ais-tracing), qui applique la même idée à un compte Azure Cosmos DB, pour les flux qui persistent leur état sous forme de documents plutôt que de logs. Les équipes qui ont les deux utilisent généralement les deux.

Si le trou que tu observes s'avère être un workflow qui ne s'est jamais déclenché, [AIS Monitor](/fr/apps/ais-monitor) montre comment tes Logic Apps déployées s'enchaînent — et [AIS Runner](/fr/apps/ais-runner) exécute l'ensemble en local quand tu veux le reproduire.
