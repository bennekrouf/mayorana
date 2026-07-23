---
id: why-garbage-collector
title: 'GC Pauses and Latency: The Hidden Cost of High-Level Languages'
locale: en
slug: why-garbage-collector
date: '2025-04-10'
author: mayo
excerpt: >-
  Java, Python, and JavaScript offer convenience, but garbage collection
  introduces unpredictable latency. Explore how runtime memory management
  affects performance in real systems.

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

<div class="svg-container" style="margin:2rem 0;">
<svg class="gcpause-fig" viewBox="0 0 800 220" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="A normal 50ms request compared to the same request stretched to 2000ms by an unpredictable GC pause">
<style>
.gcpause-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .gcpause-fig,[data-theme="dark"] .gcpause-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.gcpause-fig text{font-family:ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.gcpause-fig .title{font-size:14px;font-weight:700}
.gcpause-fig .body{font-size:12px;font-weight:600}
.gcpause-fig .cap{font-size:11px;fill:var(--mut)}
.gcpause-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.gcpause-fig .acbox{fill:var(--ac);stroke:var(--ac)}
</style>
<!-- row 1: normal -->
<text x="40" y="55" class="title">Normal request</text>
<rect class="box" x="40" y="65" width="70" height="34" rx="6"></rect>
<text x="140" y="87" class="body">50ms — done</text>
<!-- row 2: gc pause -->
<text x="40" y="145" class="title">Request during GC pause</text>
<rect class="box" x="40" y="155" width="70" height="34" rx="6"></rect>
<rect class="acbox" x="110" y="155" width="620" height="34" rx="6"></rect>
<text x="115" y="176" class="body" fill="#ffffff">GC pause — thread frozen, unpredictable duration</text>
<!-- caption -->
<text x="400" y="210" text-anchor="middle" class="cap">Same request, same code — 2000ms total, 40x slower, and you don't control when it happens</text>
</svg>
</div>

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
