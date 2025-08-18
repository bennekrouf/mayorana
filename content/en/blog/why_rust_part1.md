---
id: why-garbage-collector
title: 'GC Pauses and Latency: The Hidden Cost of High-Level Languages'
locale: en
slug: why-garbage-collector
date: '2025-08-18'
author: mayo
excerpt: >-
  Java, Python, and JavaScript offer convenience, but garbage collection
  introduces unpredictable latency. Explore how runtime memory management
  affects performance in real systems.
category: rust
tags:
  - rust
  - gc
---

## Garbage Collectors: Convenient but Costly

High-level languages like Java, Python, and JavaScript handle memory automatically—but this comes with tradeoffs.

## What Happens When You Write This?

```java
String message = "hello";
```

This creates an object on the heap. But eventually, that memory must be reclaimed. Enter the Garbage Collector (GC).

## How Each Language Handles Memory

### Java: Stop-the-World Collections
```
[GC (Allocation Failure) 8192K->1024K(10240K), 0.0057 secs]
[Full GC (Ergonomics) 8192K->512K(19456K), 0.0234 secs]
```

Java's GC runs in background threads, pausing your application unpredictably. Even modern GCs like G1 can pause for milliseconds.

### Python: Reference Counting + Cycles
```python
import gc
gc.collect()  # Manual collection
# Returns: number of objects collected
```

Python counts references to objects, but needs a separate collector for circular references. Both add overhead to every operation.

### JavaScript: Generational Collection
```javascript
// No direct control - V8 decides when to collect
global.gc(); // Only available with --expose-gc flag
```

V8 manages memory automatically with no developer control. Pauses happen when the engine decides.

## The Real-World Impact

### Elasticsearch Indexing Nightmare
```
Initial run:  200GB corpus → 2 hours
After memory pressure: Same data → 12 hours

Cause: GC spent 70% of time cleaning up
```

### Web Service Latency Spikes
```
Normal response: 50ms
During GC pause: 2000ms (40x slower!)
```

## GC Comparison

| Language   | GC Type           | Your Control | Predictability |
|------------|-------------------|--------------|----------------|
| Java       | Generational      | JVM flags    | Low            |
| Python     | Reference + Cycle | `gc` module  | Very Low       |
| JavaScript | Generational      | None         | Very Low       |

## The Hidden Costs

**Memory Overhead:**
- Java: 2-8 bytes per object header
- Python: 28+ bytes per object minimum  
- JavaScript: Variable V8 metadata

**CPU Overhead:**
- 5-30% CPU time spent in GC
- Reference counting on every assignment (Python)
- Write barriers for generational GC

**Latency Spikes:**
- Unpredictable pause times
- Worse under memory pressure
- No way to guarantee response times

## When GC Becomes a Problem

### High-Frequency Trading
**Requirement:** <1ms response times  
**Reality:** Any GC pause kills performance

### Real-Time Systems  
**Requirement:** Consistent 16ms budget (60fps)  
**Reality:** Frame drops during collection

### Large-Scale Data Processing
**Requirement:** Process TBs efficiently  
**Reality:** GC overhead grows with dataset size

## Key Takeaways

✅ **GC makes development easier**  
❌ **Latency is unpredictable**  
❌ **Performance degrades under load**  
❌ **No control over when pauses happen**  
❌ **Memory and CPU overhead always present**

---

**The Question:** What if we could have memory safety *without* garbage collection?

**➡️ Next:** "Manual Memory Management: Why C/C++ Isn't the Answer"
