---
id: embeddings-vector-databases-rag
title: 'Episode 6: Embeddings and Vector Databases'
slug: embeddings-vector-databases-rag
locale: en
date: '2026-09-27'
author: mayo
excerpt: >-
  From keywords to meaning: how embeddings and cosine similarity let you
  search by proximity, why you need a vector database, and how it all comes
  together as a RAG.
tags:
  - llm
  - ai
  - embeddings
  - vector-database
  - rag
---

# Episode 6: Embeddings and Vector Databases

## Where does the need come from?

For a long time, searching a text meant searching for **exact words**. "Car" didn't find "automobile". **Keyword search** is fast but **dumb**: it doesn't understand meaning.

That's where **embeddings** come in.

## Why do embeddings change everything?

An embedding is a vector that represents the **meaning** of a text. Two texts that mean the same thing will have vectors that are **geometrically close**.

**Analogy**: a map where each word is a city. "Car", "automobile" and "vehicle" are neighbours. "Banana" is at the other end.

## How is closeness computed?

With **cosine similarity**. It measures the **angle** between two vectors, not their distance. Why the angle? Because a long text and a short text on the same topic can have vectors of different sizes that still **point in the same direction**.

- Similarity = 1 → same direction, very close meaning
- Similarity = 0 → unrelated
- Similarity = -1 → opposite directions. Rare in practice, and it doesn't mean "opposite meaning": "hot" and "cold" are actually fairly close, because they appear in the same contexts.

It's a direct cousin of the Q·K dot product in attention: cosine similarity is that same dot product, divided by the length of both vectors. You keep the orientation and ignore the size.

## Why a vector database?

A SQL database searches by **equality**. A vector database searches by **proximity**. But comparing 10 million vectors one by one is too slow. Tools like **LanceDB**, **Pinecone** and **Qdrant** use **approximate indexing** algorithms (HNSW, IVF…) to find the neighbours in milliseconds.

**Analogy**: the index at the back of a book. You don't read 500 pages, you go straight to the right one.

## The link with attention

Attention compares words **within a sentence**. A vector database compares **whole documents**. Same principle (find what's close in the space of meaning), different scale.

## The link with transfer learning

Embeddings come from a **pre-trained** model. It's transfer learning in its purest form: you reuse a model that learned the meaning of language from billions of sentences.

## The full pipeline

1. **Pre-training**: the model learns the meaning of language
2. **Embedding**: we turn our documents into vectors
3. **Indexing**: we store them in a vector database
4. **Query**: we turn the question into a vector
5. **Search**: we find the closest documents
6. **Injection**: we hand those documents to an LLM

## What some people call a RAG

This pipeline — embeddings + vector database + similarity search + injection into an LLM — is what some people call a **RAG** (Retrieval-Augmented Generation). The name is complicated, the idea is simple: **fetch relevant information before generating an answer**.

It's a concrete application of everything we've covered: vectors, similarity, transfer learning, LLMs.

## Key takeaways

- Embeddings turn **meaning** into **geometry**
- A vector database searches by **proximity**
- Cosine similarity compares **orientation**
- It's the same principle as attention, on a larger scale
- Embeddings come from **transfer learning**
- The full pipeline is what some people call a **RAG**
