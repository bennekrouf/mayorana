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

<div class="svg-container" style="margin:2rem 0;">
<svg class="i2p-fig" viewBox="0 0 800 430" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Vous parlez à Claude, qui pilote la bibliothèque, PolishCast et PublishKit via MCP, et LinkedIn et TikTok via Chrome. Six étapes : planifier, enregistrer, peaufiner, couper, rédiger, publier, chacune laissant un statut dans la bibliothèque partagée, de Planned à Posted.">
<!-- style -->
<style>
.i2p-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .i2p-fig,[data-theme="dark"] .i2p-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.i2p-fig text{font-family:ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.i2p-fig .title{font-size:14px;font-weight:700}
.i2p-fig .body{font-size:12px;font-weight:600}
.i2p-fig .code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;font-weight:700}
.i2p-fig .cap{font-size:11px;fill:var(--mut)}
.i2p-fig .st{font-size:11px;font-weight:700;fill:var(--ac)}
.i2p-fig .on{fill:#ffffff}
.i2p-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.i2p-fig .tool{fill:var(--box);stroke:var(--ac);stroke-width:2}
.i2p-fig .acbox{fill:var(--ac);stroke:var(--ac)}
.i2p-fig .bad{fill:var(--box);stroke:#e11d48;stroke-width:2}
.i2p-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="i2p0-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"></path>
</marker>
</defs>
<!-- you and the hub -->
<rect class="box" x="150" y="20" width="200" height="60" rx="8"></rect>
<text x="250" y="47.5" text-anchor="middle" class="title">Vous</text>
<text x="250" y="65.5" text-anchor="middle" class="cap">une conversation</text>
<path class="ln" d="M352,50 L447,50" marker-end="url(#i2p0-arrow-fr)"></path>
<rect class="acbox" x="450" y="20" width="200" height="60" rx="8"></rect>
<text x="550" y="47.5" text-anchor="middle" class="title on">Claude</text>
<text x="550" y="65.5" text-anchor="middle" class="cap on">enchaîne les outils</text>
<!-- fan out to the apps -->
<path class="ln" d="M550,80 L550,110"></path>
<path class="ln" d="M115,110 L685,110"></path>
<path class="ln" d="M115,110 L115,147" marker-end="url(#i2p0-arrow-fr)"></path>
<text x="122" y="133" text-anchor="start" class="cap">MCP</text>
<rect class="box" x="30" y="150" width="170" height="85" rx="8"></rect>
<text x="115" y="190" text-anchor="middle" class="title">Bibliothèque</text>
<text x="115" y="208" text-anchor="middle" class="cap">planifier, suivre</text>
<path class="ln" d="M305,110 L305,147" marker-end="url(#i2p0-arrow-fr)"></path>
<text x="312" y="133" text-anchor="start" class="cap">MCP</text>
<rect class="box" x="220" y="150" width="170" height="85" rx="8"></rect>
<text x="305" y="182.5" text-anchor="middle" class="title">PolishCast</text>
<text x="305" y="200.5" text-anchor="middle" class="cap">enregistrer, peaufiner,</text>
<text x="305" y="215.5" text-anchor="middle" class="cap">couper le clip</text>
<path class="ln" d="M495,110 L495,147" marker-end="url(#i2p0-arrow-fr)"></path>
<text x="502" y="133" text-anchor="start" class="cap">MCP</text>
<rect class="box" x="410" y="150" width="170" height="85" rx="8"></rect>
<text x="495" y="190" text-anchor="middle" class="title">PublishKit</text>
<text x="495" y="208" text-anchor="middle" class="cap">rédiger, planifier</text>
<path class="ln" d="M685,110 L685,147" marker-end="url(#i2p0-arrow-fr)"></path>
<text x="692" y="133" text-anchor="start" class="cap">Chrome</text>
<rect class="box" x="600" y="150" width="170" height="85" rx="8"></rect>
<text x="685" y="182.5" text-anchor="middle" class="title">LinkedIn · TikTok</text>
<text x="685" y="200.5" text-anchor="middle" class="cap">dans votre Chrome,</text>
<text x="685" y="215.5" text-anchor="middle" class="cap">après votre oui</text>
<!-- the six steps -->
<text x="30" y="285" text-anchor="start" class="title">Six étapes, un statut chacune dans la bibliothèque partagée</text>
<rect class="box" x="20" y="300" width="110" height="56" rx="8"></rect>
<text x="75" y="325.5" text-anchor="middle" class="title">1 Planifier</text>
<text x="75" y="343.5" text-anchor="middle" class="cap">Bibliothèque</text>
<text x="75" y="380" text-anchor="middle" class="st">Planned</text>
<path class="ln" d="M132,328 L147,328" marker-end="url(#i2p0-arrow-fr)"></path>
<rect class="box" x="150" y="300" width="110" height="56" rx="8"></rect>
<text x="205" y="325.5" text-anchor="middle" class="title">2 Enregistrer</text>
<text x="205" y="343.5" text-anchor="middle" class="cap">PolishCast</text>
<text x="205" y="380" text-anchor="middle" class="st">Recording</text>
<path class="ln" d="M262,328 L277,328" marker-end="url(#i2p0-arrow-fr)"></path>
<rect class="box" x="280" y="300" width="110" height="56" rx="8"></rect>
<text x="335" y="325.5" text-anchor="middle" class="title">3 Peaufiner</text>
<text x="335" y="343.5" text-anchor="middle" class="cap">PolishCast</text>
<text x="335" y="380" text-anchor="middle" class="st">Ready</text>
<path class="ln" d="M392,328 L407,328" marker-end="url(#i2p0-arrow-fr)"></path>
<rect class="box" x="410" y="300" width="110" height="56" rx="8"></rect>
<text x="465" y="325.5" text-anchor="middle" class="title">4 Couper</text>
<text x="465" y="343.5" text-anchor="middle" class="cap">PolishCast</text>
<text x="465" y="380" text-anchor="middle" class="st">Ready</text>
<path class="ln" d="M522,328 L537,328" marker-end="url(#i2p0-arrow-fr)"></path>
<rect class="box" x="540" y="300" width="110" height="56" rx="8"></rect>
<text x="595" y="325.5" text-anchor="middle" class="title">5 Rédiger</text>
<text x="595" y="343.5" text-anchor="middle" class="cap">PublishKit</text>
<text x="595" y="380" text-anchor="middle" class="st">Queued</text>
<path class="ln" d="M652,328 L667,328" marker-end="url(#i2p0-arrow-fr)"></path>
<rect class="box" x="670" y="300" width="110" height="56" rx="8"></rect>
<text x="725" y="325.5" text-anchor="middle" class="title">6 Publier</text>
<text x="725" y="343.5" text-anchor="middle" class="cap">Chrome</text>
<text x="725" y="380" text-anchor="middle" class="st">Posted</text>
<text x="400" y="412" text-anchor="middle" class="cap">chaque application affiche le même statut et le même calendrier</text>
</svg>
</div>

## Pourquoi ça marche

- **Une conversation au lieu de six applications.** Vous décrivez le résultat, pas les clics.
- **Chaque application reste l'experte.** [PolishCast](/fr/apps/polishcast) monte la vidéo, [PublishKit](/fr/apps/publishkit) garde les posts. Claude ne fait que les relier.
- **Une seule bibliothèque partagée.** Chaque fichier connaît son statut, et chaque application affiche le même calendrier. Plus de tableur à tenir à jour.
- **Vous gardez les décisions qui comptent.** Claude vous montre d'abord les textes, et ne clique jamais sur Publier sans votre accord.

Vous enregistrez du son, un podcast ou un live ? [TrackCut](/fr/apps/trackcut) prend la place de PolishCast aux étapes 2 et 3 : il découpe l'enregistrement en pistes, dans la même bibliothèque.

## Le comment, étape par étape

### 1. Planifier l'idée

<div class="svg-container" style="margin:2rem 0;">
<svg class="i2p-fig" viewBox="0 0 800 110" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Dire « Planifie une vidéo pour jeudi » fait appeler plan_media à Claude, et l&#x27;idée apparaît dans la bibliothèque en Planned, jeudi.">
<!-- style -->
<style>
.i2p-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .i2p-fig,[data-theme="dark"] .i2p-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.i2p-fig text{font-family:ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.i2p-fig .title{font-size:14px;font-weight:700}
.i2p-fig .body{font-size:12px;font-weight:600}
.i2p-fig .code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;font-weight:700}
.i2p-fig .cap{font-size:11px;fill:var(--mut)}
.i2p-fig .st{font-size:11px;font-weight:700;fill:var(--ac)}
.i2p-fig .on{fill:#ffffff}
.i2p-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.i2p-fig .tool{fill:var(--box);stroke:var(--ac);stroke-width:2}
.i2p-fig .acbox{fill:var(--ac);stroke:var(--ac)}
.i2p-fig .bad{fill:var(--box);stroke:#e11d48;stroke-width:2}
.i2p-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="i2p1-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"></path>
</marker>
</defs>
<!-- plan -->
<rect class="box" x="30" y="20" width="216" height="70" rx="8"></rect>
<text x="138" y="45" text-anchor="middle" class="title">Vous dites</text>
<text x="138" y="63" text-anchor="middle" class="cap">« Planifie une vidéo</text>
<text x="138" y="78" text-anchor="middle" class="cap">pour jeudi… »</text>
<rect class="tool" x="292" y="20" width="216" height="70" rx="8"></rect>
<text x="400" y="52.5" text-anchor="middle" class="code">plan_media</text>
<text x="400" y="70.5" text-anchor="middle" class="cap">ajoute l'idée</text>
<rect class="acbox" x="554" y="20" width="216" height="70" rx="8"></rect>
<text x="662" y="52.5" text-anchor="middle" class="title on">Bibliothèque</text>
<text x="662" y="70.5" text-anchor="middle" class="cap on">Planned · jeudi</text>
<path class="ln" d="M248,55 L289,55" marker-end="url(#i2p1-arrow-fr)"></path>
<path class="ln" d="M510,55 L551,55" marker-end="url(#i2p1-arrow-fr)"></path>
</svg>
</div>

Outils : `plan_media`, `calendar`. L'idée apparaît sur le calendrier de chaque application avant même d'être enregistrée.

> Planifie une vidéo pour jeudi : « Exporter un clip vertical en une phrase », pour LinkedIn et TikTok. Note : montrer l'avant et l'après.

### 2. Enregistrer

<div class="svg-container" style="margin:2rem 0;">
<svg class="i2p-fig" viewBox="0 0 800 110" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="start_recording fait un compte à rebours et enregistre, vous faites la démo, stop_recording enregistre la prise, et set_zooms place un zoom à chaque clic.">
<!-- style -->
<style>
.i2p-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .i2p-fig,[data-theme="dark"] .i2p-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.i2p-fig text{font-family:ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.i2p-fig .title{font-size:14px;font-weight:700}
.i2p-fig .body{font-size:12px;font-weight:600}
.i2p-fig .code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;font-weight:700}
.i2p-fig .cap{font-size:11px;fill:var(--mut)}
.i2p-fig .st{font-size:11px;font-weight:700;fill:var(--ac)}
.i2p-fig .on{fill:#ffffff}
.i2p-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.i2p-fig .tool{fill:var(--box);stroke:var(--ac);stroke-width:2}
.i2p-fig .acbox{fill:var(--ac);stroke:var(--ac)}
.i2p-fig .bad{fill:var(--box);stroke:#e11d48;stroke-width:2}
.i2p-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="i2p2-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"></path>
</marker>
</defs>
<!-- record -->
<rect class="tool" x="30" y="20" width="150.5" height="70" rx="8"></rect>
<text x="105.25" y="45" text-anchor="middle" class="code">start_recording</text>
<text x="105.25" y="63" text-anchor="middle" class="cap">compte à rebours,</text>
<text x="105.25" y="78" text-anchor="middle" class="cap">puis enregistre</text>
<rect class="box" x="226.5" y="20" width="150.5" height="70" rx="8"></rect>
<text x="301.75" y="52.5" text-anchor="middle" class="title">Vous</text>
<text x="301.75" y="70.5" text-anchor="middle" class="cap">faites la démo</text>
<rect class="tool" x="423" y="20" width="150.5" height="70" rx="8"></rect>
<text x="498.25" y="52.5" text-anchor="middle" class="code">stop_recording</text>
<text x="498.25" y="70.5" text-anchor="middle" class="cap">enregistre la prise</text>
<rect class="acbox" x="619.5" y="20" width="150.5" height="70" rx="8"></rect>
<text x="694.75" y="45" text-anchor="middle" class="title on">Prise</text>
<text x="694.75" y="63" text-anchor="middle" class="cap on">set_zooms : un zoom</text>
<text x="694.75" y="78" text-anchor="middle" class="cap on">à chaque clic</text>
<path class="ln" d="M182.5,55 L223.5,55" marker-end="url(#i2p2-arrow-fr)"></path>
<path class="ln" d="M379,55 L420,55" marker-end="url(#i2p2-arrow-fr)"></path>
<path class="ln" d="M575.5,55 L616.5,55" marker-end="url(#i2p2-arrow-fr)"></path>
</svg>
</div>

Outils : `list_sources`, `start_recording`, `stop_recording`, `set_zooms`. PolishCast fait un compte à rebours, puis enregistre jusqu'à ce que vous disiez stop.

> Enregistre ma fenêtre principale dans 3 secondes.

> Arrête l'enregistrement et propose les zooms.

### 3. Peaufiner

<div class="svg-container" style="margin:2rem 0;">
<svg class="i2p-fig" viewBox="0 0 800 200" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="La prise passe par set_blanks pour couper les silences et set_style pour le fond, puis export écrit un MP4 16:9 ; fulfil_plan fait de l&#x27;idée de jeudi cette vidéo, désormais Ready dans la bibliothèque.">
<!-- style -->
<style>
.i2p-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .i2p-fig,[data-theme="dark"] .i2p-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.i2p-fig text{font-family:ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.i2p-fig .title{font-size:14px;font-weight:700}
.i2p-fig .body{font-size:12px;font-weight:600}
.i2p-fig .code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;font-weight:700}
.i2p-fig .cap{font-size:11px;fill:var(--mut)}
.i2p-fig .st{font-size:11px;font-weight:700;fill:var(--ac)}
.i2p-fig .on{fill:#ffffff}
.i2p-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.i2p-fig .tool{fill:var(--box);stroke:var(--ac);stroke-width:2}
.i2p-fig .acbox{fill:var(--ac);stroke:var(--ac)}
.i2p-fig .bad{fill:var(--box);stroke:#e11d48;stroke-width:2}
.i2p-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="i2p3-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"></path>
</marker>
</defs>
<!-- polish -->
<rect class="box" x="30" y="20" width="150.5" height="70" rx="8"></rect>
<text x="105.25" y="52.5" text-anchor="middle" class="title">Prise</text>
<text x="105.25" y="70.5" text-anchor="middle" class="cap">de l'étape 2</text>
<rect class="tool" x="226.5" y="20" width="150.5" height="70" rx="8"></rect>
<text x="301.75" y="52.5" text-anchor="middle" class="code">set_blanks</text>
<text x="301.75" y="70.5" text-anchor="middle" class="cap">coupe les silences</text>
<rect class="tool" x="423" y="20" width="150.5" height="70" rx="8"></rect>
<text x="498.25" y="52.5" text-anchor="middle" class="code">set_style</text>
<text x="498.25" y="70.5" text-anchor="middle" class="cap">fond, cadre</text>
<rect class="acbox" x="619.5" y="20" width="150.5" height="70" rx="8"></rect>
<text x="694.75" y="52.5" text-anchor="middle" class="title on">export</text>
<text x="694.75" y="70.5" text-anchor="middle" class="cap on">MP4 16:9</text>
<path class="ln" d="M182.5,55 L223.5,55" marker-end="url(#i2p3-arrow-fr)"></path>
<path class="ln" d="M379,55 L420,55" marker-end="url(#i2p3-arrow-fr)"></path>
<path class="ln" d="M575.5,55 L616.5,55" marker-end="url(#i2p3-arrow-fr)"></path>
<!-- the plan becomes the video -->
<path class="ln" d="M694.75,92 L694.75,117" marker-end="url(#i2p3-arrow-fr)"></path>
<rect class="tool" x="619.5" y="120" width="150.5" height="65" rx="8"></rect>
<text x="694.75" y="142.5" text-anchor="middle" class="code">fulfil_plan</text>
<text x="694.75" y="160.5" text-anchor="middle" class="cap">l'idée devient</text>
<text x="694.75" y="175.5" text-anchor="middle" class="cap">cette vidéo</text>
<path class="ln" d="M617.5,152.5 L576.5,152.5" marker-end="url(#i2p3-arrow-fr)"></path>
<rect class="box" x="423" y="120" width="150.5" height="65" rx="8"></rect>
<text x="498.25" y="142.5" text-anchor="middle" class="title">Bibliothèque</text>
<text x="498.25" y="160.5" text-anchor="middle" class="cap">Ready, notes</text>
<text x="498.25" y="175.5" text-anchor="middle" class="cap">et tags gardés</text>
</svg>
</div>

Outils : `set_blanks`, `set_style`, `export`, `fulfil_plan`. Les notes et les tags de l'idée passent à la vidéo finie.

> Coupe les silences, mets le fond sombre, exporte en 1080p, et relie-la à l'idée de jeudi.

### 4. Couper le clip pour TikTok

<div class="svg-container" style="margin:2rem 0;">
<svg class="i2p-fig" viewBox="0 0 800 230" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="export_clip prend un début, une fin et le format 9:16, et fait de la vidéo 16:9 un clip de 1080 par 1920 pour TikTok.">
<!-- style -->
<style>
.i2p-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .i2p-fig,[data-theme="dark"] .i2p-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.i2p-fig text{font-family:ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.i2p-fig .title{font-size:14px;font-weight:700}
.i2p-fig .body{font-size:12px;font-weight:600}
.i2p-fig .code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;font-weight:700}
.i2p-fig .cap{font-size:11px;fill:var(--mut)}
.i2p-fig .st{font-size:11px;font-weight:700;fill:var(--ac)}
.i2p-fig .on{fill:#ffffff}
.i2p-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.i2p-fig .tool{fill:var(--box);stroke:var(--ac);stroke-width:2}
.i2p-fig .acbox{fill:var(--ac);stroke:var(--ac)}
.i2p-fig .bad{fill:var(--box);stroke:#e11d48;stroke-width:2}
.i2p-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="i2p4-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"></path>
</marker>
</defs>
<!-- 16:9 in, 9:16 out -->
<rect class="box" x="40" y="52" width="224" height="126" rx="8"></rect>
<text x="152" y="112.5" text-anchor="middle" class="title">MP4 16:9</text>
<text x="152" y="130.5" text-anchor="middle" class="cap">vidéo finie</text>
<path class="ln" d="M266,115 L317,115" marker-end="url(#i2p4-arrow-fr)"></path>
<rect class="tool" x="320" y="80" width="190" height="70" rx="8"></rect>
<text x="415" y="112.5" text-anchor="middle" class="code">export_clip</text>
<text x="415" y="130.5" text-anchor="middle" class="cap">début, fin, 9:16</text>
<path class="ln" d="M512,115 L597,115" marker-end="url(#i2p4-arrow-fr)"></path>
<rect class="acbox" x="600" y="15" width="112" height="200" rx="8"></rect>
<text x="656" y="105" text-anchor="middle" class="title on">MP4 9:16</text>
<text x="656" y="123" text-anchor="middle" class="cap on">1080×1920</text>
<text x="656" y="138" text-anchor="middle" class="cap on">pour TikTok</text>
</svg>
</div>

Outil : `export_clip`. Les temps sont ceux de la vidéo finie : vous les donnez tels que vous les avez vus en la regardant.

> Coupe un clip vertical de 0:45 à 1:15 pour TikTok.

### 5. Rédiger les posts

<div class="svg-container" style="margin:2rem 0;">
<svg class="i2p-fig" viewBox="0 0 800 200" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="La vidéo passe dans queue_linkedin avec le texte du post, le clip dans queue_tiktok avec sa légende ; les deux brouillons apparaissent dans la bibliothèque en Queued pour jeudi 9:00.">
<!-- style -->
<style>
.i2p-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .i2p-fig,[data-theme="dark"] .i2p-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.i2p-fig text{font-family:ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.i2p-fig .title{font-size:14px;font-weight:700}
.i2p-fig .body{font-size:12px;font-weight:600}
.i2p-fig .code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;font-weight:700}
.i2p-fig .cap{font-size:11px;fill:var(--mut)}
.i2p-fig .st{font-size:11px;font-weight:700;fill:var(--ac)}
.i2p-fig .on{fill:#ffffff}
.i2p-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.i2p-fig .tool{fill:var(--box);stroke:var(--ac);stroke-width:2}
.i2p-fig .acbox{fill:var(--ac);stroke:var(--ac)}
.i2p-fig .bad{fill:var(--box);stroke:#e11d48;stroke-width:2}
.i2p-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="i2p5-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"></path>
</marker>
</defs>
<!-- two drafts -->
<rect class="box" x="30" y="20" width="130" height="70" rx="8"></rect>
<text x="95" y="52.5" text-anchor="middle" class="title">Vidéo</text>
<text x="95" y="70.5" text-anchor="middle" class="cap">16:9</text>
<path class="ln" d="M162,55 L203,55" marker-end="url(#i2p5-arrow-fr)"></path>
<rect class="tool" x="206" y="20" width="190" height="70" rx="8"></rect>
<text x="301" y="52.5" text-anchor="middle" class="code">queue_linkedin</text>
<text x="301" y="70.5" text-anchor="middle" class="cap">texte + vidéo</text>
<path class="ln" d="M398,55 L439,55" marker-end="url(#i2p5-arrow-fr)"></path>
<rect class="box" x="442" y="20" width="140" height="70" rx="8"></rect>
<text x="512" y="52.5" text-anchor="middle" class="title">LinkedIn</text>
<text x="512" y="70.5" text-anchor="middle" class="cap">brouillon</text>
<path class="ln" d="M584,55 L625,55" marker-end="url(#i2p5-arrow-fr)"></path>
<rect class="box" x="30" y="110" width="130" height="70" rx="8"></rect>
<text x="95" y="142.5" text-anchor="middle" class="title">Clip</text>
<text x="95" y="160.5" text-anchor="middle" class="cap">9:16</text>
<path class="ln" d="M162,145 L203,145" marker-end="url(#i2p5-arrow-fr)"></path>
<rect class="tool" x="206" y="110" width="190" height="70" rx="8"></rect>
<text x="301" y="142.5" text-anchor="middle" class="code">queue_tiktok</text>
<text x="301" y="160.5" text-anchor="middle" class="cap">légende + clip</text>
<path class="ln" d="M398,145 L439,145" marker-end="url(#i2p5-arrow-fr)"></path>
<rect class="box" x="442" y="110" width="140" height="70" rx="8"></rect>
<text x="512" y="142.5" text-anchor="middle" class="title">TikTok</text>
<text x="512" y="160.5" text-anchor="middle" class="cap">brouillon</text>
<path class="ln" d="M584,145 L625,145" marker-end="url(#i2p5-arrow-fr)"></path>
<!-- both on the calendar -->
<rect class="acbox" x="628" y="20" width="142" height="160" rx="8"></rect>
<text x="699" y="82.5" text-anchor="middle" class="title on">Bibliothèque</text>
<text x="699" y="100.5" text-anchor="middle" class="cap on">Queued</text>
<text x="699" y="115.5" text-anchor="middle" class="cap on">jeudi 9:00</text>
<text x="699" y="130.5" text-anchor="middle" class="cap on">rappel à l'heure</text>
</svg>
</div>

Outils : `queue_linkedin`, `queue_tiktok`, `set_date`. À l'heure prévue, PublishKit vous rappelle qu'un post est à publier.

> Écris un post LinkedIn avec la vidéo et une légende TikTok avec le clip, tous les deux pour jeudi 9:00. Montre-moi d'abord les textes.

### 6. Publier

<div class="svg-container" style="margin:2rem 0;">
<svg class="i2p-fig" viewBox="0 0 800 220" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="post_now donne la page de rédaction, le texte et les médias ; Claude les remplit dans votre Chrome et s&#x27;arrête sur « Je publie ? ». Après votre oui il clique sur Publier, et publish_post garde l&#x27;adresse du post : la bibliothèque l&#x27;affiche en Posted.">
<!-- style -->
<style>
.i2p-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .i2p-fig,[data-theme="dark"] .i2p-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.i2p-fig text{font-family:ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.i2p-fig .title{font-size:14px;font-weight:700}
.i2p-fig .body{font-size:12px;font-weight:600}
.i2p-fig .code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;font-weight:700}
.i2p-fig .cap{font-size:11px;fill:var(--mut)}
.i2p-fig .st{font-size:11px;font-weight:700;fill:var(--ac)}
.i2p-fig .on{fill:#ffffff}
.i2p-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.i2p-fig .tool{fill:var(--box);stroke:var(--ac);stroke-width:2}
.i2p-fig .acbox{fill:var(--ac);stroke:var(--ac)}
.i2p-fig .bad{fill:var(--box);stroke:#e11d48;stroke-width:2}
.i2p-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="i2p6-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"></path>
</marker>
</defs>
<!-- fill the post, then stop -->
<rect class="tool" x="30" y="20" width="216" height="70" rx="8"></rect>
<text x="138" y="45" text-anchor="middle" class="code">post_now</text>
<text x="138" y="63" text-anchor="middle" class="cap">texte, médias,</text>
<text x="138" y="78" text-anchor="middle" class="cap">page de rédaction</text>
<rect class="box" x="292" y="20" width="216" height="70" rx="8"></rect>
<text x="400" y="45" text-anchor="middle" class="title">Chrome</text>
<text x="400" y="63" text-anchor="middle" class="cap">texte collé,</text>
<text x="400" y="78" text-anchor="middle" class="cap">fichier joint</text>
<rect class="bad" x="554" y="20" width="216" height="70" rx="8"></rect>
<text x="662" y="52.5" text-anchor="middle" class="title">STOP</text>
<text x="662" y="70.5" text-anchor="middle" class="cap">« Je publie ? »</text>
<path class="ln" d="M248,55 L289,55" marker-end="url(#i2p6-arrow-fr)"></path>
<path class="ln" d="M510,55 L551,55" marker-end="url(#i2p6-arrow-fr)"></path>
<!-- after your yes, right to left -->
<path class="ln" d="M662,92 L662,127" marker-end="url(#i2p6-arrow-fr)"></path>
<rect class="box" x="554" y="130" width="216" height="70" rx="8"></rect>
<text x="662" y="155" text-anchor="middle" class="title">Vous</text>
<text x="662" y="173" text-anchor="middle" class="cap">dites oui, Claude</text>
<text x="662" y="188" text-anchor="middle" class="cap">clique Publier</text>
<path class="ln" d="M552,165 L511,165" marker-end="url(#i2p6-arrow-fr)"></path>
<rect class="tool" x="292" y="130" width="216" height="70" rx="8"></rect>
<text x="400" y="162.5" text-anchor="middle" class="code">publish_post</text>
<text x="400" y="180.5" text-anchor="middle" class="cap">+ l'adresse du post</text>
<path class="ln" d="M290,165 L249,165" marker-end="url(#i2p6-arrow-fr)"></path>
<rect class="acbox" x="30" y="130" width="216" height="70" rx="8"></rect>
<text x="138" y="155" text-anchor="middle" class="title on">Bibliothèque</text>
<text x="138" y="173" text-anchor="middle" class="cap on">Posted,</text>
<text x="138" y="188" text-anchor="middle" class="cap on">lien gardé</text>
</svg>
</div>

Outils : `post_now`, puis Claude dans Chrome, puis `publish_post`. PublishKit ne publie jamais tout seul. Claude travaille dans votre propre Chrome, où vous êtes déjà connecté. Il ne se connecte jamais à votre place, et s'arrête avant le bouton Publier jusqu'à votre oui.

> C'est l'heure : publie celui de LinkedIn via Chrome.

### Ensuite : suivre

<div class="svg-container" style="margin:2rem 0;">
<svg class="i2p-fig" viewBox="0 0 800 180" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="calendar et list_media montrent ce qui est planifié, en attente et publié.">
<!-- style -->
<style>
.i2p-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .i2p-fig,[data-theme="dark"] .i2p-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.i2p-fig text{font-family:ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.i2p-fig .title{font-size:14px;font-weight:700}
.i2p-fig .body{font-size:12px;font-weight:600}
.i2p-fig .code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;font-weight:700}
.i2p-fig .cap{font-size:11px;fill:var(--mut)}
.i2p-fig .st{font-size:11px;font-weight:700;fill:var(--ac)}
.i2p-fig .on{fill:#ffffff}
.i2p-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.i2p-fig .tool{fill:var(--box);stroke:var(--ac);stroke-width:2}
.i2p-fig .acbox{fill:var(--ac);stroke:var(--ac)}
.i2p-fig .bad{fill:var(--box);stroke:#e11d48;stroke-width:2}
.i2p-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="i2p7-arrow-fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"></path>
</marker>
</defs>
<!-- keep track -->
<rect class="tool" x="30" y="55" width="240" height="70" rx="8"></rect>
<text x="150" y="87.5" text-anchor="middle" class="code">calendar · list_media</text>
<text x="150" y="105.5" text-anchor="middle" class="cap">où en est chaque fichier</text>
<path class="ln" d="M272,90 L340,90"></path>
<path class="ln" d="M340,37.5 L340,142.5"></path>
<path class="ln" d="M340,37.5 L437,37.5" marker-end="url(#i2p7-arrow-fr)"></path>
<rect class="box" x="440" y="15" width="300" height="45" rx="8"></rect>
<text x="590" y="35" text-anchor="middle" class="title">Planned</text>
<text x="590" y="53" text-anchor="middle" class="cap">idées pas encore tournées</text>
<path class="ln" d="M340,92.5 L437,92.5" marker-end="url(#i2p7-arrow-fr)"></path>
<rect class="box" x="440" y="70" width="300" height="45" rx="8"></rect>
<text x="590" y="90" text-anchor="middle" class="title">Queued</text>
<text x="590" y="108" text-anchor="middle" class="cap">brouillons en attente</text>
<path class="ln" d="M340,147.5 L437,147.5" marker-end="url(#i2p7-arrow-fr)"></path>
<rect class="box" x="440" y="125" width="300" height="45" rx="8"></rect>
<text x="590" y="145" text-anchor="middle" class="title">Posted</text>
<text x="590" y="163" text-anchor="middle" class="cap">en ligne, avec leur lien</text>
</svg>
</div>

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
