---
title: "From Idea to LinkedIn and TikTok in One Conversation"
slug: from-idea-to-linkedin-and-tiktok-with-mcp
date: "2026-11-01"
author: Mayorana
category: ai
tags: ["ai", "mcp", "claude", "content", "automation"]
excerpt: "Planning, recording, polishing, cutting a vertical clip, writing the posts and posting them: the whole publishing flow of one video, driven by Claude through MCP, with your yes before anything goes public."
seo_title: "Publish a Video to LinkedIn and TikTok with Claude and MCP"
meta_description: "The full flow from idea to LinkedIn and TikTok post, step by step: which MCP tools Claude uses in PolishCast and PublishKit, and the sentence to say at each step."
keywords: ["MCP", "Model Context Protocol", "Claude", "content workflow", "LinkedIn", "TikTok", "screen recording", "social media automation"]
status: "published"
---

Publishing one video is not one task. You plan it, record it, cut the pauses, export it, cut a vertical clip for TikTok, write a LinkedIn post and a caption, upload each one, and then try to remember what went out where.

None of these steps is hard. What costs time is moving between them: six apps, a lot of clicks, and the context lives in your head.

That gap is what MCP closes. Each app exposes what it can do as tools, and Claude chains them from one conversation. You say what you want, and you approve what goes public.

## The whole flow

<div class="svg-container" style="margin:2rem 0;">
<svg class="i2p-fig" viewBox="0 0 800 430" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="You talk to Claude, which drives the media library, PolishCast and PublishKit through MCP and LinkedIn and TikTok through Chrome. Six steps: plan, record, polish, clip, write, post, each leaving a status in the shared library, from Planned to Posted.">
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
<marker id="i2p0-arrow-en" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"></path>
</marker>
</defs>
<!-- you and the hub -->
<rect class="box" x="150" y="20" width="200" height="60" rx="8"></rect>
<text x="250" y="47.5" text-anchor="middle" class="title">You</text>
<text x="250" y="65.5" text-anchor="middle" class="cap">one conversation</text>
<path class="ln" d="M352,50 L447,50" marker-end="url(#i2p0-arrow-en)"></path>
<rect class="acbox" x="450" y="20" width="200" height="60" rx="8"></rect>
<text x="550" y="47.5" text-anchor="middle" class="title on">Claude</text>
<text x="550" y="65.5" text-anchor="middle" class="cap on">chains the tools</text>
<!-- fan out to the apps -->
<path class="ln" d="M550,80 L550,110"></path>
<path class="ln" d="M115,110 L685,110"></path>
<path class="ln" d="M115,110 L115,147" marker-end="url(#i2p0-arrow-en)"></path>
<text x="122" y="133" text-anchor="start" class="cap">MCP</text>
<rect class="box" x="30" y="150" width="170" height="85" rx="8"></rect>
<text x="115" y="190" text-anchor="middle" class="title">Library</text>
<text x="115" y="208" text-anchor="middle" class="cap">plan, track</text>
<path class="ln" d="M305,110 L305,147" marker-end="url(#i2p0-arrow-en)"></path>
<text x="312" y="133" text-anchor="start" class="cap">MCP</text>
<rect class="box" x="220" y="150" width="170" height="85" rx="8"></rect>
<text x="305" y="182.5" text-anchor="middle" class="title">PolishCast</text>
<text x="305" y="200.5" text-anchor="middle" class="cap">record, polish,</text>
<text x="305" y="215.5" text-anchor="middle" class="cap">cut the clip</text>
<path class="ln" d="M495,110 L495,147" marker-end="url(#i2p0-arrow-en)"></path>
<text x="502" y="133" text-anchor="start" class="cap">MCP</text>
<rect class="box" x="410" y="150" width="170" height="85" rx="8"></rect>
<text x="495" y="190" text-anchor="middle" class="title">PublishKit</text>
<text x="495" y="208" text-anchor="middle" class="cap">write, schedule</text>
<path class="ln" d="M685,110 L685,147" marker-end="url(#i2p0-arrow-en)"></path>
<text x="692" y="133" text-anchor="start" class="cap">Chrome</text>
<rect class="box" x="600" y="150" width="170" height="85" rx="8"></rect>
<text x="685" y="182.5" text-anchor="middle" class="title">LinkedIn · TikTok</text>
<text x="685" y="200.5" text-anchor="middle" class="cap">in your Chrome,</text>
<text x="685" y="215.5" text-anchor="middle" class="cap">after your yes</text>
<!-- the six steps -->
<text x="30" y="285" text-anchor="start" class="title">Six steps, one status each in the shared library</text>
<rect class="box" x="20" y="300" width="110" height="56" rx="8"></rect>
<text x="75" y="325.5" text-anchor="middle" class="title">1 Plan</text>
<text x="75" y="343.5" text-anchor="middle" class="cap">Library</text>
<text x="75" y="380" text-anchor="middle" class="st">Planned</text>
<path class="ln" d="M132,328 L147,328" marker-end="url(#i2p0-arrow-en)"></path>
<rect class="box" x="150" y="300" width="110" height="56" rx="8"></rect>
<text x="205" y="325.5" text-anchor="middle" class="title">2 Record</text>
<text x="205" y="343.5" text-anchor="middle" class="cap">PolishCast</text>
<text x="205" y="380" text-anchor="middle" class="st">Recording</text>
<path class="ln" d="M262,328 L277,328" marker-end="url(#i2p0-arrow-en)"></path>
<rect class="box" x="280" y="300" width="110" height="56" rx="8"></rect>
<text x="335" y="325.5" text-anchor="middle" class="title">3 Polish</text>
<text x="335" y="343.5" text-anchor="middle" class="cap">PolishCast</text>
<text x="335" y="380" text-anchor="middle" class="st">Ready</text>
<path class="ln" d="M392,328 L407,328" marker-end="url(#i2p0-arrow-en)"></path>
<rect class="box" x="410" y="300" width="110" height="56" rx="8"></rect>
<text x="465" y="325.5" text-anchor="middle" class="title">4 Clip</text>
<text x="465" y="343.5" text-anchor="middle" class="cap">PolishCast</text>
<text x="465" y="380" text-anchor="middle" class="st">Ready</text>
<path class="ln" d="M522,328 L537,328" marker-end="url(#i2p0-arrow-en)"></path>
<rect class="box" x="540" y="300" width="110" height="56" rx="8"></rect>
<text x="595" y="325.5" text-anchor="middle" class="title">5 Write</text>
<text x="595" y="343.5" text-anchor="middle" class="cap">PublishKit</text>
<text x="595" y="380" text-anchor="middle" class="st">Queued</text>
<path class="ln" d="M652,328 L667,328" marker-end="url(#i2p0-arrow-en)"></path>
<rect class="box" x="670" y="300" width="110" height="56" rx="8"></rect>
<text x="725" y="325.5" text-anchor="middle" class="title">6 Post</text>
<text x="725" y="343.5" text-anchor="middle" class="cap">Chrome</text>
<text x="725" y="380" text-anchor="middle" class="st">Posted</text>
<text x="400" y="412" text-anchor="middle" class="cap">every app shows the same status and the same calendar</text>
</svg>
</div>

## Why it works

- **One conversation instead of six apps.** You describe the result, not the clicks.
- **Each app stays the expert.** [PolishCast](/en/apps/polishcast) edits the video, [PublishKit](/en/apps/publishkit) keeps the posts. Claude only connects them.
- **One shared library.** Every file knows its status, and every app shows the same calendar. No spreadsheet to keep up to date.
- **You keep the decisions that matter.** Claude shows you the texts first, and never clicks Post without your yes.

Recording audio instead, like a podcast or a live set? [TrackCut](/en/apps/trackcut) takes PolishCast's place in steps 2 and 3: it splits the recording into tracks, in the same library.

## The how, step by step

### 1. Plan the idea

<div class="svg-container" style="margin:2rem 0;">
<svg class="i2p-fig" viewBox="0 0 800 110" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Saying &#x27;Plan a video for Thursday&#x27; makes Claude call plan_media, and the idea shows in the library as Planned on Thursday.">
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
<marker id="i2p1-arrow-en" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"></path>
</marker>
</defs>
<!-- plan -->
<rect class="box" x="30" y="20" width="216" height="70" rx="8"></rect>
<text x="138" y="45" text-anchor="middle" class="title">You say</text>
<text x="138" y="63" text-anchor="middle" class="cap">"Plan a video</text>
<text x="138" y="78" text-anchor="middle" class="cap">for Thursday…"</text>
<rect class="tool" x="292" y="20" width="216" height="70" rx="8"></rect>
<text x="400" y="52.5" text-anchor="middle" class="code">plan_media</text>
<text x="400" y="70.5" text-anchor="middle" class="cap">adds the idea</text>
<rect class="acbox" x="554" y="20" width="216" height="70" rx="8"></rect>
<text x="662" y="52.5" text-anchor="middle" class="title on">Library</text>
<text x="662" y="70.5" text-anchor="middle" class="cap on">Planned · Thursday</text>
<path class="ln" d="M248,55 L289,55" marker-end="url(#i2p1-arrow-en)"></path>
<path class="ln" d="M510,55 L551,55" marker-end="url(#i2p1-arrow-en)"></path>
</svg>
</div>

Tools: `plan_media`, `calendar`. The idea shows on the calendar of every app before anything is recorded.

> Plan a video for Thursday: "Export a vertical clip in one sentence", for LinkedIn and TikTok. Note: show the before and after.

### 2. Record

<div class="svg-container" style="margin:2rem 0;">
<svg class="i2p-fig" viewBox="0 0 800 110" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="start_recording counts down and records, you do the demo, stop_recording saves the take, and set_zooms puts a zoom on every click.">
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
<marker id="i2p2-arrow-en" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"></path>
</marker>
</defs>
<!-- record -->
<rect class="tool" x="30" y="20" width="150.5" height="70" rx="8"></rect>
<text x="105.25" y="45" text-anchor="middle" class="code">start_recording</text>
<text x="105.25" y="63" text-anchor="middle" class="cap">counts down,</text>
<text x="105.25" y="78" text-anchor="middle" class="cap">then records</text>
<rect class="box" x="226.5" y="20" width="150.5" height="70" rx="8"></rect>
<text x="301.75" y="52.5" text-anchor="middle" class="title">You</text>
<text x="301.75" y="70.5" text-anchor="middle" class="cap">do the demo</text>
<rect class="tool" x="423" y="20" width="150.5" height="70" rx="8"></rect>
<text x="498.25" y="52.5" text-anchor="middle" class="code">stop_recording</text>
<text x="498.25" y="70.5" text-anchor="middle" class="cap">saves the take</text>
<rect class="acbox" x="619.5" y="20" width="150.5" height="70" rx="8"></rect>
<text x="694.75" y="45" text-anchor="middle" class="title on">Take</text>
<text x="694.75" y="63" text-anchor="middle" class="cap on">set_zooms: a zoom</text>
<text x="694.75" y="78" text-anchor="middle" class="cap on">on every click</text>
<path class="ln" d="M182.5,55 L223.5,55" marker-end="url(#i2p2-arrow-en)"></path>
<path class="ln" d="M379,55 L420,55" marker-end="url(#i2p2-arrow-en)"></path>
<path class="ln" d="M575.5,55 L616.5,55" marker-end="url(#i2p2-arrow-en)"></path>
</svg>
</div>

Tools: `list_sources`, `start_recording`, `stop_recording`, `set_zooms`. PolishCast counts down, then records until you say stop.

> Record my main window in 3 seconds.

> Stop the recording and suggest the zooms.

### 3. Polish

<div class="svg-container" style="margin:2rem 0;">
<svg class="i2p-fig" viewBox="0 0 800 200" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="The take goes through set_blanks to cut pauses and set_style for the background, then export writes a 16:9 MP4; fulfil_plan turns Thursday&#x27;s idea into this video, now Ready in the library.">
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
<marker id="i2p3-arrow-en" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"></path>
</marker>
</defs>
<!-- polish -->
<rect class="box" x="30" y="20" width="150.5" height="70" rx="8"></rect>
<text x="105.25" y="52.5" text-anchor="middle" class="title">Take</text>
<text x="105.25" y="70.5" text-anchor="middle" class="cap">from step 2</text>
<rect class="tool" x="226.5" y="20" width="150.5" height="70" rx="8"></rect>
<text x="301.75" y="52.5" text-anchor="middle" class="code">set_blanks</text>
<text x="301.75" y="70.5" text-anchor="middle" class="cap">cuts the pauses</text>
<rect class="tool" x="423" y="20" width="150.5" height="70" rx="8"></rect>
<text x="498.25" y="52.5" text-anchor="middle" class="code">set_style</text>
<text x="498.25" y="70.5" text-anchor="middle" class="cap">background, frame</text>
<rect class="acbox" x="619.5" y="20" width="150.5" height="70" rx="8"></rect>
<text x="694.75" y="52.5" text-anchor="middle" class="title on">export</text>
<text x="694.75" y="70.5" text-anchor="middle" class="cap on">MP4 16:9</text>
<path class="ln" d="M182.5,55 L223.5,55" marker-end="url(#i2p3-arrow-en)"></path>
<path class="ln" d="M379,55 L420,55" marker-end="url(#i2p3-arrow-en)"></path>
<path class="ln" d="M575.5,55 L616.5,55" marker-end="url(#i2p3-arrow-en)"></path>
<!-- the plan becomes the video -->
<path class="ln" d="M694.75,92 L694.75,117" marker-end="url(#i2p3-arrow-en)"></path>
<rect class="tool" x="619.5" y="120" width="150.5" height="65" rx="8"></rect>
<text x="694.75" y="142.5" text-anchor="middle" class="code">fulfil_plan</text>
<text x="694.75" y="160.5" text-anchor="middle" class="cap">the idea becomes</text>
<text x="694.75" y="175.5" text-anchor="middle" class="cap">this video</text>
<path class="ln" d="M617.5,152.5 L576.5,152.5" marker-end="url(#i2p3-arrow-en)"></path>
<rect class="box" x="423" y="120" width="150.5" height="65" rx="8"></rect>
<text x="498.25" y="142.5" text-anchor="middle" class="title">Library</text>
<text x="498.25" y="160.5" text-anchor="middle" class="cap">Ready, notes</text>
<text x="498.25" y="175.5" text-anchor="middle" class="cap">and tags kept</text>
</svg>
</div>

Tools: `set_blanks`, `set_style`, `export`, `fulfil_plan`. The plan's notes and tags move to the finished video.

> Cut the pauses, use the dark background, export in 1080p, and link it to Thursday's plan.

### 4. Cut the clip for TikTok

<div class="svg-container" style="margin:2rem 0;">
<svg class="i2p-fig" viewBox="0 0 800 230" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="export_clip takes a start, an end and the 9:16 shape, and turns the 16:9 video into a 1080 by 1920 clip for TikTok.">
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
<marker id="i2p4-arrow-en" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"></path>
</marker>
</defs>
<!-- 16:9 in, 9:16 out -->
<rect class="box" x="40" y="52" width="224" height="126" rx="8"></rect>
<text x="152" y="112.5" text-anchor="middle" class="title">MP4 16:9</text>
<text x="152" y="130.5" text-anchor="middle" class="cap">finished video</text>
<path class="ln" d="M266,115 L317,115" marker-end="url(#i2p4-arrow-en)"></path>
<rect class="tool" x="320" y="80" width="190" height="70" rx="8"></rect>
<text x="415" y="112.5" text-anchor="middle" class="code">export_clip</text>
<text x="415" y="130.5" text-anchor="middle" class="cap">start, end, 9:16</text>
<path class="ln" d="M512,115 L597,115" marker-end="url(#i2p4-arrow-en)"></path>
<rect class="acbox" x="600" y="15" width="112" height="200" rx="8"></rect>
<text x="656" y="105" text-anchor="middle" class="title on">MP4 9:16</text>
<text x="656" y="123" text-anchor="middle" class="cap on">1080×1920</text>
<text x="656" y="138" text-anchor="middle" class="cap on">for TikTok</text>
</svg>
</div>

Tool: `export_clip`. Times are in the finished video, so you give them as you saw them while watching it.

> Cut a vertical clip from 0:45 to 1:15 for TikTok.

### 5. Write the posts

<div class="svg-container" style="margin:2rem 0;">
<svg class="i2p-fig" viewBox="0 0 800 200" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="The video goes into queue_linkedin with the post&#x27;s text, the clip into queue_tiktok with its caption; both drafts show in the library as Queued for Thursday 9:00.">
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
<marker id="i2p5-arrow-en" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"></path>
</marker>
</defs>
<!-- two drafts -->
<rect class="box" x="30" y="20" width="130" height="70" rx="8"></rect>
<text x="95" y="52.5" text-anchor="middle" class="title">Video</text>
<text x="95" y="70.5" text-anchor="middle" class="cap">16:9</text>
<path class="ln" d="M162,55 L203,55" marker-end="url(#i2p5-arrow-en)"></path>
<rect class="tool" x="206" y="20" width="190" height="70" rx="8"></rect>
<text x="301" y="52.5" text-anchor="middle" class="code">queue_linkedin</text>
<text x="301" y="70.5" text-anchor="middle" class="cap">text + video</text>
<path class="ln" d="M398,55 L439,55" marker-end="url(#i2p5-arrow-en)"></path>
<rect class="box" x="442" y="20" width="140" height="70" rx="8"></rect>
<text x="512" y="52.5" text-anchor="middle" class="title">LinkedIn</text>
<text x="512" y="70.5" text-anchor="middle" class="cap">draft</text>
<path class="ln" d="M584,55 L625,55" marker-end="url(#i2p5-arrow-en)"></path>
<rect class="box" x="30" y="110" width="130" height="70" rx="8"></rect>
<text x="95" y="142.5" text-anchor="middle" class="title">Clip</text>
<text x="95" y="160.5" text-anchor="middle" class="cap">9:16</text>
<path class="ln" d="M162,145 L203,145" marker-end="url(#i2p5-arrow-en)"></path>
<rect class="tool" x="206" y="110" width="190" height="70" rx="8"></rect>
<text x="301" y="142.5" text-anchor="middle" class="code">queue_tiktok</text>
<text x="301" y="160.5" text-anchor="middle" class="cap">caption + clip</text>
<path class="ln" d="M398,145 L439,145" marker-end="url(#i2p5-arrow-en)"></path>
<rect class="box" x="442" y="110" width="140" height="70" rx="8"></rect>
<text x="512" y="142.5" text-anchor="middle" class="title">TikTok</text>
<text x="512" y="160.5" text-anchor="middle" class="cap">draft</text>
<path class="ln" d="M584,145 L625,145" marker-end="url(#i2p5-arrow-en)"></path>
<!-- both on the calendar -->
<rect class="acbox" x="628" y="20" width="142" height="160" rx="8"></rect>
<text x="699" y="82.5" text-anchor="middle" class="title on">Library</text>
<text x="699" y="100.5" text-anchor="middle" class="cap on">Queued</text>
<text x="699" y="115.5" text-anchor="middle" class="cap on">Thursday 9:00</text>
<text x="699" y="130.5" text-anchor="middle" class="cap on">reminder on time</text>
</svg>
</div>

Tools: `queue_linkedin`, `queue_tiktok`, `set_date`. At the planned time, PublishKit reminds you that a post is due.

> Write a LinkedIn post with the video and a TikTok caption with the clip, both for Thursday 9:00. Show me the texts first.

### 6. Post

<div class="svg-container" style="margin:2rem 0;">
<svg class="i2p-fig" viewBox="0 0 800 220" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="post_now gives the compose page, text and media; Claude fills them in your Chrome and stops at &#x27;Post this?&#x27;. After your yes it clicks Post, and publish_post records the post&#x27;s address: the library shows it as Posted.">
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
<marker id="i2p6-arrow-en" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"></path>
</marker>
</defs>
<!-- fill the post, then stop -->
<rect class="tool" x="30" y="20" width="216" height="70" rx="8"></rect>
<text x="138" y="45" text-anchor="middle" class="code">post_now</text>
<text x="138" y="63" text-anchor="middle" class="cap">text, media,</text>
<text x="138" y="78" text-anchor="middle" class="cap">compose page</text>
<rect class="box" x="292" y="20" width="216" height="70" rx="8"></rect>
<text x="400" y="45" text-anchor="middle" class="title">Chrome</text>
<text x="400" y="63" text-anchor="middle" class="cap">text pasted,</text>
<text x="400" y="78" text-anchor="middle" class="cap">file attached</text>
<rect class="bad" x="554" y="20" width="216" height="70" rx="8"></rect>
<text x="662" y="52.5" text-anchor="middle" class="title">STOP</text>
<text x="662" y="70.5" text-anchor="middle" class="cap">"Post this?"</text>
<path class="ln" d="M248,55 L289,55" marker-end="url(#i2p6-arrow-en)"></path>
<path class="ln" d="M510,55 L551,55" marker-end="url(#i2p6-arrow-en)"></path>
<!-- after your yes, right to left -->
<path class="ln" d="M662,92 L662,127" marker-end="url(#i2p6-arrow-en)"></path>
<rect class="box" x="554" y="130" width="216" height="70" rx="8"></rect>
<text x="662" y="155" text-anchor="middle" class="title">You</text>
<text x="662" y="173" text-anchor="middle" class="cap">say yes, Claude</text>
<text x="662" y="188" text-anchor="middle" class="cap">clicks Post</text>
<path class="ln" d="M552,165 L511,165" marker-end="url(#i2p6-arrow-en)"></path>
<rect class="tool" x="292" y="130" width="216" height="70" rx="8"></rect>
<text x="400" y="162.5" text-anchor="middle" class="code">publish_post</text>
<text x="400" y="180.5" text-anchor="middle" class="cap">+ the post's address</text>
<path class="ln" d="M290,165 L249,165" marker-end="url(#i2p6-arrow-en)"></path>
<rect class="acbox" x="30" y="130" width="216" height="70" rx="8"></rect>
<text x="138" y="155" text-anchor="middle" class="title on">Library</text>
<text x="138" y="173" text-anchor="middle" class="cap on">Posted,</text>
<text x="138" y="188" text-anchor="middle" class="cap on">link kept</text>
</svg>
</div>

Tools: `post_now`, then Claude in Chrome, then `publish_post`. PublishKit never posts by itself. Claude works in your own Chrome, where you are already signed in. It never signs in for you, and it stops before the Post button until you say yes.

> It's time: post the LinkedIn one through Chrome.

### Then: keep track

<div class="svg-container" style="margin:2rem 0;">
<svg class="i2p-fig" viewBox="0 0 800 180" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="calendar and list_media show what is planned, queued and posted.">
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
<marker id="i2p7-arrow-en" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"></path>
</marker>
</defs>
<!-- keep track -->
<rect class="tool" x="30" y="55" width="240" height="70" rx="8"></rect>
<text x="150" y="87.5" text-anchor="middle" class="code">calendar · list_media</text>
<text x="150" y="105.5" text-anchor="middle" class="cap">where each file is</text>
<path class="ln" d="M272,90 L340,90"></path>
<path class="ln" d="M340,37.5 L340,142.5"></path>
<path class="ln" d="M340,37.5 L437,37.5" marker-end="url(#i2p7-arrow-en)"></path>
<rect class="box" x="440" y="15" width="300" height="45" rx="8"></rect>
<text x="590" y="35" text-anchor="middle" class="title">Planned</text>
<text x="590" y="53" text-anchor="middle" class="cap">ideas not recorded yet</text>
<path class="ln" d="M340,92.5 L437,92.5" marker-end="url(#i2p7-arrow-en)"></path>
<rect class="box" x="440" y="70" width="300" height="45" rx="8"></rect>
<text x="590" y="90" text-anchor="middle" class="title">Queued</text>
<text x="590" y="108" text-anchor="middle" class="cap">drafts waiting their time</text>
<path class="ln" d="M340,147.5 L437,147.5" marker-end="url(#i2p7-arrow-en)"></path>
<rect class="box" x="440" y="125" width="300" height="45" rx="8"></rect>
<text x="590" y="145" text-anchor="middle" class="title">Posted</text>
<text x="590" y="163" text-anchor="middle" class="cap">live, with their link</text>
</svg>
</div>

> What did I post this week, and what is still waiting?

## The whole sequence

```text
1. Plan a video for Thursday: "Export a vertical clip in one
   sentence", for LinkedIn and TikTok.
2. Record my main window in 3 seconds.
3. Stop the recording and suggest the zooms.
4. Cut the pauses, use the dark background, export in 1080p,
   and link it to Thursday's plan.
5. Cut a vertical clip from 0:45 to 1:15 for TikTok.
6. Write a LinkedIn post with the video and a TikTok caption
   with the clip, both for Thursday 9:00. Show me the texts first.
7. It's time: post the LinkedIn one through Chrome.
8. What did I post this week, and what is still waiting?
```

Eight sentences, three apps, one video on two networks.

## Key points

- ✅ The work between the steps is what MCP removes, not the steps themselves.
- ✅ Each app does one job well; Claude connects them.
- ✅ One shared library gives every file a status and every app the same calendar.
- ✅ Nothing goes public without your yes.
