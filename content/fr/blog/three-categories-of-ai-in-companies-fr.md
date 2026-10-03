---
title: "L'IA en entreprise, ce n'est pas 50 cas d'usage. C'est 3 choses."
slug: three-categories-of-ai-in-companies-fr
date: 2026-10-01
author: Mayorana
category: ai
tags: ["ai", "ai-agents", "mcp", "strategy"]
excerpt: "La plupart des projets d'IA générative et agentique entrent dans trois catégories : agents pour les clients, couche d'intégration pour les systèmes, copilotes pour les collaborateurs. Pourquoi ce prisme vaut mieux qu'une liste de cinquante cas d'usage."
seo_title: "L'IA en entreprise : 3 catégories derrière 50 cas d'usage"
meta_description: "La plupart des projets d'IA générative et d'agents tiennent en trois catégories : agents B2C, couche d'intégration type MCP, copilotes internes. Un prisme pour prioriser."
keywords: ["cas d'usage IA", "agents IA", "MCP", "Model Context Protocol", "IA générative", "stratégie IA", "IA en entreprise"]
---

Ouvrez n'importe quel article sur les « cas d'usage de l'IA » et vous tombez sur une liste : 30 idées, parfois 100. Traitement de factures. Comptes rendus de réunion. Scoring de leads. Un chatbot. Revue de code. Aucune n'est fausse, mais une liste aussi longue ne sert pas à grand-chose : elle ne dit pas par quoi commencer, parce qu'elle ne dit jamais ce que ces éléments ont en commun.

Si l'on enlève l'habillage marketing, la plupart des projets d'IA générative et agentique tombent dans trois catégories. Ce n'est pas que la technologie soit simple. C'est qu'un système d'IA ne peut avoir que trois types d'interlocuteurs : vos clients, vos systèmes ou vos collaborateurs.

## Le prisme : qui est en face ?

```text
 QUI EST EN FACE ?                CE QUE VOUS CONSTRUISEZ

 Les clients   ---------------->  1. Agents IA (B2C)
 Vos systèmes  ---------------->  2. Couche d'intégration (type MCP)
 Vos équipes   ---------------->  3. Copilotes de productivité
```

| Catégorie | Face à | Ce qu'elle fait | Risque principal |
|---|---|---|---|
| 1. Agents IA (B2C) | Les clients | Répond, réserve, vend, rembourse | Image de marque et responsabilité juridique |
| 2. Couche d'intégration | Les systèmes | Permet à l'IA de lire et d'agir sur les vrais backends | Sécurité et permissions |
| 3. Copilotes de productivité | Les collaborateurs | Rédige, résume, cherche, code | Une valeur que personne ne mesure |

La dernière colonne est ce que la plupart des listes de cas d'usage omettent : chaque catégorie échoue à sa manière.

## 1. Les agents IA pour les clients

Un agent qui parle directement à des personnes extérieures à l'entreprise et qui peut agir sur leur demande : répondre, modifier, réserver, rembourser. Support, vente, réservation, onboarding. Le trait déterminant : aucun collaborateur ne relit la réponse avant que le client ne la lise.

```text
 Client
    |   « Où est ma commande ? »
    v
+-------------------+    outils   +------------------+
|   Agent IA        | ----------> | Commandes, CRM,  |
| (règles + LLM)    | <---------- | réservations     |
+---------+---------+   données   +------------------+
          |
          |  il ne peut pas résoudre, ou l'enjeu est élevé
          v
   Agent humain, avec toute la conversation
```

**Cas réel : Klarna.** Début 2024, l'entreprise a indiqué que son assistant IA avait traité environ les deux tiers des conversations du service client durant son premier mois, avec un temps de résolution passé d'environ 11 minutes à moins de 2. En 2025, son PDG a reconnu que la course aux économies avait dégradé la qualité, et Klarna a recommencé à faire intervenir des conseillers humains sur certaines conversations.

**Cas réel : Air Canada.** En 2024, un tribunal canadien a jugé la compagnie responsable après que le chatbot de son site a donné à un client une information erronée sur les tarifs de deuil. Air Canada soutenait que le bot était une entité distincte. Le tribunal ne l'a pas suivie.

La leçon est la même dans les deux cas : l'agent est votre voix, et vous répondez de ce qu'il dit. Ces projets échouent rarement parce que le langage est mauvais. Ils échouent sur les règles, les permissions et l'escalade vers un humain.

## 2. Les couches d'intégration (type MCP)

La tuyauterie qui permet à un modèle de consulter vos systèmes réels et d'agir dessus : appel d'outils, connecteurs d'entreprise, et protocoles ouverts comme le Model Context Protocol (MCP). Personne ne l'utilise directement. C'est ce qui empêche les deux autres catégories de n'être que des beaux parleurs.

Sans elle, chaque application d'IA branche chaque système à sa façon. Avec une couche partagée, la multiplication devient une addition : trois applications et trois systèmes, c'est neuf intégrations sur mesure, ou six connexions.

```text
                         +-----------------------+
   Agent support ------->|                       |-------> CRM
   Agent ventes  ------->|  Couche type MCP      |-------> ERP
   Copilote  ----------->|  auth, permissions    |-------> Wiki, docs
                         |  logs, schémas        |
                         +-----------------------+
```

**Cas réel : MCP lui-même.** Anthropic a publié MCP comme standard ouvert fin 2024. OpenAI et d'autres l'ont adopté en quelques mois, et des éditeurs comme Stripe et Atlassian publient désormais leurs propres serveurs MCP. Block a été l'une des premières entreprises à s'appuyer dessus.

C'est dans cette couche que la sécurité doit vivre. Les jetons d'accès trop larges et l'injection de prompt via les données que lit l'agent sont les vrais risques. Ce doit donc être la couche, et non le prompt, qui impose ce qu'un agent a le droit de faire.

## 3. L'IA générative pour la productivité au quotidien

Des copilotes et assistants pour vos propres équipes : rédiger, résumer, chercher dans la connaissance interne, écrire du code, analyser des données. Un humain relit le résultat : c'est lui, le filet de sécurité. C'est pourquoi c'est l'endroit le moins risqué pour commencer, et pourquoi il est si facile de se tromper sur le retour sur investissement.

```text
 Employé : « Résume les incidents du trimestre pour le conseil »
     |
     v
+---------------------+        +-------------------------+
|  Copilote           | -----> | Connaissances internes  |
|  (LLM + garde-fous) | <----- | (docs, tickets, wiki)   |
+----------+----------+        +-------------------------+
           |
           v
 Brouillon / synthèse / code --> l'employé relit et valide
```

**Cas réel : Morgan Stanley.** La banque a donné à ses conseillers financiers un assistant fondé sur GPT-4 qui s'appuie sur la bibliothèque de recherche de l'entreprise : un cas d'école de « chercher et résumer la connaissance interne ».

**Cas réel : les outils pour développeurs.** Une expérience contrôlée menée par GitHub a montré que des développeurs terminaient une tâche environ 55 % plus vite avec Copilot. En 2025, METR a mené un essai randomisé avec des développeurs open source expérimentés travaillant sur leurs propres dépôts : ils ont mis environ 19 % de temps en plus avec des outils d'IA, tout en croyant être allés plus vite. Les deux résultats sont réels. La tâche, la base de code et la personne comptent : mesurez au lieu de supposer.

## Les vrais projets sont des combinaisons

```text
   Voyageur                  Support compagnie
        |                          |
        v                          v
 +-------------+            +-------------+
 | 1. Agent    |            | 3. Copilote |
 | réservation |            | du support  |
 +------+------+            +------+------+
        |                          |
        +-------------+------------+
                      v
          +-----------------------+
          | 2. Intégration (MCP)  |
          |   (outils partagés)   |
          +---+-------+-------+---+
              |       |       |
           Tarifs   Résas   Règles
```

Prenons un assistant de réservation de voyages (un exemple composite, pas une entreprise réelle). Les voyageurs parlent à un agent de réservation (1). Les équipes du support utilisent un copilote qui résume l'historique d'un voyage (3). Les deux appellent les mêmes outils tarifs, réservations et règles à travers une seule couche (2).

La catégorie 2 est le multiplicateur. Le travail qui permet à un agent client de consulter une réservation est le même que celui qui permet à un copilote interne de le faire. Construisez les outils une seule fois, avec leurs permissions, et chaque nouveau cas d'usage coûte moins cher.

## Ce qui reste en dehors

Ce prisme couvre l'IA générative et agentique. Ce n'est pas une carte de toute l'IA. Le machine learning prédictif (scoring de fraude, prévision de la demande, modèles d'attrition), la vision par ordinateur (inspection de défauts sur une ligne de production), les moteurs de recommandation et les problèmes d'optimisation comme le routage sont en dehors. Ils demandent d'autres données, d'autres compétences et une autre évaluation, et c'est souvent la meilleure réponse.

## Comment l'utiliser pour prioriser

Posez trois questions à toute proposition d'IA :

1. **Qui est en face ?** Des clients, des systèmes ou des collaborateurs ?
2. **Qu'est-ce que ça touche ?** Si la réponse est « plusieurs systèmes », vous construisez de la catégorie 2, que quelqu'un l'ait nommée ainsi ou non.
3. **Que coûte une mauvaise réponse, et qui la rattrape ?** Personne ne la rattrape avant qu'un client la lise. Un collaborateur la rattrape avant qu'elle ne quitte l'entreprise.

Puis une séquence qui fonctionne pour beaucoup d'entreprises : apprendre à moindre coût avec la catégorie 3, et la mesurer. Construire la catégorie 2 comme fondation commune, avec les permissions dès le premier jour. Poser la catégorie 1 par-dessus une fois que les deux premières sont solides.

Cela aide aussi contre le syndrome de l'objet brillant. Un nouveau framework d'agents ou le lancement d'un modèle ne change pas la catégorie de votre projet. Demandez-vous dans laquelle il est, et si c'est celle pour laquelle vous êtes prêt.
