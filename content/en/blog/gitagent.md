---
id: ai-commit-messages-without-giving-up-control
title: "AI Commit Messages Without Handing Over Your Git History"
locale: en
slug: ai-commit-messages-without-giving-up-control
date: '2026-09-05'
author: mayo
excerpt: >-
  AI git tooling tends to come in two shapes: a text box you copy out of, or an
  agent that runs commands and tells you afterwards. There is a third option,
  and it comes down to where the approval sits.
tags:
  - git
  - ai
  - developer-tools
  - rust
  - llm
---

# AI Commit Messages Without Handing Over Your Git History

There are two common shapes for AI tooling around git, and both of them are uncomfortable for different reasons.

## Shape one: the text box

You paste a diff into a chat window, get a commit message back, and copy it into your terminal. It works. It is also three context switches for a task that should be one, and it means the model only ever sees what you remembered to paste.

## Shape two: the autonomous agent

You give a tool repository access and it commits, pushes and opens the pull request. Faster, until the first time it force-pushes a branch, rewrites a commit you had not finished, or opens a PR against the wrong base.

The pitch for these tools is autonomy. But autonomy is not what anyone actually wants from git tooling. Git is the one part of the workflow where an unwanted action is genuinely expensive — history is shared state, and undoing a bad push is a conversation with your team, not a keystroke.

## The thing that actually matters is where approval sits

The useful distinction is not "how smart is the model" but "what happens between the proposal and the effect".

Writing a commit message is a text problem, and models are good at it. Running `git push` is not a text problem — it is an irreversible action against shared state. Bundling them into one autonomous step means the quality of the first determines whether the second happens, which is exactly the wrong coupling.

Separate them and both get better:

- **Drafting** can be generous. Let the model read the whole working tree, propose a message, propose a PR body. Nothing is at stake; it is text on screen.
- **Effects** are gated individually. Commit is one approval. Push is another. Opening the PR is another. Each shows you the exact command before it runs.

This is not a compromise between the two shapes. It is strictly better than both: you get the model's drafting without the copy-paste, and you get command execution without surrendering the decision.

## The diff is the sensitive part

There is a second reason to care about the boundary, and it is about what leaves the machine.

A diff is one of the more revealing artefacts a private repository produces. It contains not just code but the shape of what you are currently working on — unreleased features, security fixes before they ship, the internals of whatever is proprietary.

Sending that to a hosted API is a real decision, and for a lot of teams it is a decision that has already been made for them by policy. Running the drafting model locally through [ollama](https://ollama.com) removes the question entirely: the diff is read, the message is drafted, and nothing crosses the network. Local models are more than adequate for summarising a diff, which is a well-scoped task with the answer sitting right there in the input.

A hosted model stays available for teams who prefer it. The point is that it is a choice rather than a requirement.

## What the flow looks like

The path from a dirty working tree to an open pull request is a sequence, and it is the same sequence every time:

1. Scan the working tree — what actually changed?
2. Draft a commit message from that diff.
3. Commit. *(approval)*
4. Push. *(approval)*
5. Draft a PR description from the commits on the branch.
6. Open the pull request. *(approval)*

Modelling it explicitly as a graph of steps, rather than as a single "do the thing" button, is what makes each gate a natural place to stop rather than an interruption bolted onto an autonomous loop.

[GitAgent](/en/apps/gitagent) implements exactly that. It is a native desktop app in Rust, it drafts with a local ollama model or with DeepSeek, and nothing touches git history or the remote without an explicit go-ahead on that specific step. PR creation goes through the GitHub CLI, so that step is GitHub-only for now; commit and push work against any remote.

It is marked work in progress — the commit-to-PR path works, but the interface is still moving. [Download it](/en/apps/gitagent) for macOS, Windows or Linux: free for personal, educational and non-profit use, with a licence required for commercial use.

## The general shape

The interesting part of this is not really about git. It is that "AI tool" and "autonomous agent" have quietly become synonyms, and they should not be.

Plenty of useful tooling is a model doing the drafting and a human keeping the decision — not because the model is untrustworthy, but because the cost of a wrong action is asymmetric. Git is a clean example. It will not be the last one.
