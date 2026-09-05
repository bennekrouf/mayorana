---
id: c-low-level-cost
title: 'C Gives You Control, But at What Cost?'
locale: en
slug: c-low-level-cost
date: '2025-04-11'
author: mayo
excerpt: >-
  C avoids garbage collection and gives manual memory control, but opens the
  door to dangerous bugs. Explore real-world memory issues and why they matter.

tags:
  - rust
  - c
---

# C: Power Without Protection

With C, there's no runtime, no GC. Just raw speed and control.

```c
char* msg = malloc(100);
strcpy(msg, "hello");
free(msg);
printf("%s", msg); // ❌ Use after free
```

<div class="svg-container" style="margin:2rem 0;">
<svg class="cmem-fig" viewBox="0 0 800 220" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="A use-after-free sequence: allocate, write, free, then a fourth step reads freed memory and triggers undefined behavior">
<style>
.cmem-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00}
:root.dark .cmem-fig,[data-theme="dark"] .cmem-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cmem-fig text{font-family:ui-sans-serif,system-ui,sans-serif;fill:var(--tx)}
.cmem-fig .title{font-size:13px;font-weight:700}
.cmem-fig .body{font-size:12px;font-weight:600}
.cmem-fig .cap{font-size:11px;fill:var(--mut)}
.cmem-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.cmem-fig .acbox{fill:var(--ac);stroke:var(--ac)}
.cmem-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="cmem-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="var(--ln)"></path>
</marker>
</defs>
<!-- step 1 -->
<rect class="box" x="10" y="70" width="170" height="80" rx="8"></rect>
<text x="95" y="100" text-anchor="middle" class="title">malloc(100)</text>
<text x="95" y="120" text-anchor="middle" class="cap">memory allocated</text>
<text x="95" y="135" text-anchor="middle" class="cap">msg → valid pointer</text>
<!-- step 2 -->
<rect class="box" x="210" y="70" width="170" height="80" rx="8"></rect>
<text x="295" y="100" text-anchor="middle" class="title">strcpy(msg, ..)</text>
<text x="295" y="120" text-anchor="middle" class="cap">writes "hello"</text>
<text x="295" y="135" text-anchor="middle" class="cap">into allocated block</text>
<!-- step 3 -->
<rect class="box" x="410" y="70" width="170" height="80" rx="8"></rect>
<text x="495" y="100" text-anchor="middle" class="title">free(msg)</text>
<text x="495" y="120" text-anchor="middle" class="cap">memory released</text>
<text x="495" y="135" text-anchor="middle" class="cap">msg is now dangling</text>
<!-- step 4 accent -->
<rect class="acbox" x="610" y="70" width="180" height="80" rx="8"></rect>
<text x="700" y="100" text-anchor="middle" class="title" fill="#ffffff">printf(msg)</text>
<text x="700" y="120" text-anchor="middle" class="cap" fill="#ffffff">reads freed memory</text>
<text x="700" y="135" text-anchor="middle" class="cap" fill="#ffffff">undefined behavior</text>
<!-- arrows -->
<path class="ln" d="M180,110 L210,110" marker-end="url(#cmem-arrow)"></path>
<path class="ln" d="M380,110 L410,110" marker-end="url(#cmem-arrow)"></path>
<path class="ln" d="M580,110 L610,110" marker-end="url(#cmem-arrow)"></path>
<!-- caption -->
<text x="400" y="195" text-anchor="middle" class="cap">Nothing in C stops step 4 from reading memory that no longer belongs to it</text>
</svg>
</div>

## Common Pitfalls

| Problem | Code | Risk |
|---------|------|------|
| Use-after-free | `printf("%s", msg);` | Undefined behavior |
| Double free | `free(msg); free(msg);` | Heap corruption |
| Buffer overflow | `char buf[4]; strcpy(buf, "long");` | Memory corruption |
| Memory leak | `malloc(...)` with no `free` | Slow crashes |

## Manual Memory Model

You must:
- Allocate memory
- Track ownership  
- Free it manually
- Avoid accessing freed or invalid memory

## Real-World Consequences

### Heartbleed (OpenSSL)
```c
// Simplified version of the bug
char* buffer = malloc(payload_length);
memcpy(buffer, payload, payload_length); // No bounds check!
// Attacker could read past buffer end
```

**Impact:** 500,000+ servers exposed private keys and passwords.

### CVE-2021-44228 (Log4Shell equivalent in C)
```c
char* user_input = get_user_data();
sprintf(log_buffer, "User: %s", user_input); // Buffer overflow possible
```

**The Problem:** No automatic bounds checking means attackers can:
- Crash your program
- Execute arbitrary code
- Steal sensitive data

## Memory Safety Statistics

**Security vulnerabilities by :**
- **70%** of Microsoft security bugs: memory safety issues
- **65%** of Chrome vulnerabilities: memory corruption  
- **~50%** of Android security patches: memory-related

## The Developer Burden

### Every Allocation Needs Tracking
```c
typedef struct {
    char* data;
    size_t size;
} Buffer;

Buffer* create_buffer(size_t size) {
    Buffer* buf = malloc(sizeof(Buffer));
    if (!buf) return NULL;
    
    buf->data = malloc(size);
    if (!buf->data) {
        free(buf);  // Must remember to cleanup!
        return NULL;
    }
    
    buf->size = size;
    return buf;
}

void destroy_buffer(Buffer* buf) {
    if (buf) {
        free(buf->data);  // Must free in correct order
        free(buf);
    }
}
```

**Mental overhead:** Every function must consider:
- Who owns this pointer?
- When should it be freed?
- Is it still valid?

### Debugging Memory Issues
```bash
$ valgrind ./my_program
==12345== Invalid read of size 4
==12345==    at 0x40084B: main (test.c:10)
==12345==  Address 0x5204044 is 0 bytes after a block of size 4 alloc'd
==12345==    at 0x4C2AB80: malloc (in /usr/lib/valgrind/vgpreload_memcheck-amd64-linux.so)
```

**The problem:** Bugs found at runtime, not compile time.

## Performance vs Safety Trade-off

### C Performance Characteristics
```c
// Zero overhead - direct memory access
int sum = 0;
for (int i = 0; i < 1000000; i++) {
    sum += array[i];  // No bounds checking
}
```

**Speed:** ✅ Maximum performance  
**Safety:** ❌ One mistake = security vulnerability

### Memory Layout Control
```c
// Precise control over memory layout
struct Point {
    float x, y, z;     // Exactly 12 bytes
} __attribute__((packed));

Point* points = malloc(1000 * sizeof(Point)); // Predictable allocation
```

**Control:** ✅ Complete memory layout control  
**Risk:** ❌ Manual lifetime management

## Tools Help, But Aren't Enough

### Static Analysis
```c
// clang-static-analyzer can catch some issues
char* ptr = malloc(10);
free(ptr);
*ptr = 'x';  // ⚠️ Warning: use after free
```

### Runtime Detection
```c
// AddressSanitizer (ASan) catches bugs at runtime
$ gcc -fsanitize=address program.c
$ ./a.out
=================================================================
==12345==ERROR: AddressSanitizer: heap-use-after-free
```

### The Limitation
- **Static tools:** Miss complex cases, false positives
- **Runtime tools:** Only catch bugs that execute during testing
- **Code review:** Human error, time-consuming

<div class="svg-container" style="margin:2rem 0;">
<svg class="cmemb-fig" viewBox="0 0 800 270" width="100%" style="height:auto;max-width:780px;display:block;margin:0 auto;" role="img" aria-label="Static analysis, sanitizers and code review each cover only part of the bug space, so a residue of memory bugs still reaches production">
<!-- style -->
<style>
.cmemb-fig{--bg:#f8fafc;--box:#ffffff;--tx:#1e293b;--mut:#64748b;--ln:#cbd5e1;--ac:#FF6B00;--bad:#e11d48}
:root.dark .cmemb-fig,[data-theme="dark"] .cmemb-fig{--bg:#0f172a;--box:#1e293b;--tx:#f8fafc;--mut:#94a3b8;--ln:#475569}
.cmemb-fig .box{fill:var(--box);stroke:var(--ln);stroke-width:1.5}
.cmemb-fig .boxbad{fill:var(--box);stroke:var(--bad);stroke-width:2}
.cmemb-fig .ti{fill:var(--tx);font:700 13px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.cmemb-fig .tx{fill:var(--tx);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.cmemb-fig .mut{fill:var(--mut);font:11px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.cmemb-fig .bad{fill:var(--bad);font:700 13px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.cmemb-fig .ac{fill:var(--ac);font:600 12px ui-sans-serif,system-ui,sans-serif;text-anchor:middle}
.cmemb-fig .ln{stroke:var(--ln);stroke-width:1.5;fill:none}
</style>
<!-- defs -->
<defs>
<marker id="cmemb-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--ln)"/></marker>
</defs>
<!-- title -->
<text x="400" y="24" class="ti">Every C safety net has a hole in a different place</text>
<!-- static analysis -->
<rect x="25" y="40" width="235" height="100" rx="7" class="box"/>
<text x="142" y="64" class="tx">Static analysis</text>
<text x="142" y="88" class="mut">reads code, never runs it</text>
<text x="142" y="108" class="mut">misses pointers whose path</text>
<text x="142" y="126" class="mut">it cannot prove — plus noise</text>
<!-- sanitizers -->
<rect x="282" y="40" width="235" height="100" rx="7" class="box"/>
<text x="399" y="64" class="tx">ASan / Valgrind</text>
<text x="399" y="88" class="mut">runs the real program</text>
<text x="399" y="108" class="mut">but only sees the lines</text>
<text x="399" y="126" class="mut">your tests actually execute</text>
<!-- code review -->
<rect x="539" y="40" width="235" height="100" rx="7" class="box"/>
<text x="656" y="64" class="tx">Code review</text>
<text x="656" y="88" class="mut">understands intent</text>
<text x="656" y="108" class="mut">but a freed pointer can be</text>
<text x="656" y="126" class="mut">files away from its use</text>
<!-- Y-merge -->
<path d="M142,140 L142,164 L399,164" class="ln"/>
<path d="M399,140 L399,164" class="ln"/>
<path d="M656,140 L656,164 L399,164" class="ln"/>
<path d="M399,164 L399,184" class="ln" marker-end="url(#cmemb-arrow)"/>
<!-- residue -->
<rect x="230" y="184" width="340" height="46" rx="6" class="boxbad"/>
<text x="400" y="204" class="bad">the overlap is not the whole space</text>
<text x="400" y="221" class="mut">what none of the three caught ships to production</text>
<!-- footer -->
<text x="400" y="256" class="ac">Rust deletes the category instead of hunting instances — none of these bugs compile</text>
</svg>
</div>

## Why C Persists Despite Risks

### Systems Programming Requirements
- **Operating systems:** Need direct hardware access
- **Embedded systems:** Memory constraints, no room for runtime
- **Performance-critical code:** Every nanosecond matters

### Legacy and Ecosystem
- **Massive codebases:** Decades of C code in production
- **Library ecosystem:** Most system libraries written in C
- **Developer knowledge:** Generations of C programmers

## The Fundamental Problem

C gives you two bad choices:

**Option 1: Manual Memory Management**
```c
char* data = malloc(size);
// ... complex logic ...
if (error) {
    free(data);  // Must remember cleanup in ALL paths
    return -1;
}
// ... more logic ...
free(data);  // Easy to forget or double-free
```

**Option 2: Garbage Collection**
- Add GC library like Boehm GC
- Lose performance predictability
- Still possible to have memory leaks

## Key Takeaways

✅ **Predictable performance - no GC pauses**  
✅ **Complete control over memory layout**  
✅ **Minimal runtime overhead**  
❌ **Unsafe by default - one mistake = vulnerability**  
❌ **High mental burden for developers**  
❌ **Most security bugs stem from memory issues**  
❌ **Tools catch bugs after they're written, not before**

---

**The Challenge:** We want C's performance without its danger.

**The Question:** What if the compiler could prevent memory bugs at compile time?

**Next:** "Rust's Ownership: Memory Safety Without Garbage Collection"
