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

```text
                 YOU, in one conversation
                           |
                           v
 +-------------------------------------------------+
 |                      Claude                     |
 +------+-------------+-------------+--------------+
        | MCP         | MCP         | MCP          | Chrome
        v             v             v              v
    Library      PolishCast    PublishKit    LinkedIn
    plan,        record,       write,        TikTok
    track        polish, clip  schedule      (your yes)

 1 Plan -> 2 Record -> 3 Polish -> 4 Clip -> 5 Write -> 6 Post

 Status in the library, seen by every app:
 Planned -> Recording -> Ready -----------> Queued -> Posted
```

## Why it works

- **One conversation instead of six apps.** You describe the result, not the clicks.
- **Each app stays the expert.** [PolishCast](/en/apps/polishcast) edits the video, [PublishKit](/en/apps/publishkit) keeps the posts. Claude only connects them.
- **One shared library.** Every file knows its status, and every app shows the same calendar. No spreadsheet to keep up to date.
- **You keep the decisions that matter.** Claude shows you the texts first, and never clicks Post without your yes.

Recording audio instead, like a podcast or a live set? [TrackCut](/en/apps/trackcut) takes PolishCast's place in steps 2 and 3: it splits the recording into tracks, in the same library.

## The how, step by step

### 1. Plan the idea

```text
 "Plan a video..." --> plan_media --> Library: Planned, Thursday
```

Tools: `plan_media`, `calendar`. The idea shows on the calendar of every app before anything is recorded.

> Plan a video for Thursday: "Export a vertical clip in one sentence", for LinkedIn and TikTok. Note: show the before and after.

### 2. Record

```text
 start_recording --> you do the demo --> stop_recording
                                              |
                                              v
                              take saved, set_zooms suggests
                              a zoom on every click
```

Tools: `list_sources`, `start_recording`, `stop_recording`, `set_zooms`. PolishCast counts down, then records until you say stop.

> Record my main window in 3 seconds.

> Stop the recording and suggest the zooms.

### 3. Polish

```text
 take --> set_blanks --> set_style --> export --> MP4, 16:9
          cut pauses     background              |
                                                 v
                                   fulfil_plan: the idea
                                   becomes this video
```

Tools: `set_blanks`, `set_style`, `export`, `fulfil_plan`. The plan's notes and tags move to the finished video.

> Cut the pauses, use the dark background, export in 1080p, and link it to Thursday's plan.

### 4. Cut the clip for TikTok

```text
 MP4 16:9 --> export_clip (start, end, 9:16) --> MP4 1080x1920
```

Tool: `export_clip`. Times are in the finished video, so you give them as you saw them while watching it.

> Cut a vertical clip from 0:45 to 1:15 for TikTok.

### 5. Write the posts

```text
 video --> queue_linkedin (text + video)  --> LinkedIn draft
 clip  --> queue_tiktok   (caption + clip) --> TikTok draft
                         |
                         v
         Library: Queued, on the calendar Thursday 9:00
```

Tools: `queue_linkedin`, `queue_tiktok`, `set_date`. At the planned time, PublishKit reminds you that a post is due.

> Write a LinkedIn post with the video and a TikTok caption with the clip, both for Thursday 9:00. Show me the texts first.

### 6. Post

```text
 post_now --> Chrome: compose page, text pasted, file attached
                 |
                 v
        STOP: "Post this?"  -- you: "yes" --> Post
                 |
                 v
 publish_post (+ the post's address) --> Library: Posted
```

Tools: `post_now`, then Claude in Chrome, then `publish_post`. PublishKit never posts by itself. Claude works in your own Chrome, where you are already signed in. It never signs in for you, and it stops before the Post button until you say yes.

> It's time: post the LinkedIn one through Chrome.

### Then: keep track

```text
 calendar / list_media --> what is planned, queued, posted
```

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
