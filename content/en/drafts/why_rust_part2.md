---
id: c-low-level-cost
title: "C Gives You Control, But at What Cost?"
locale: "en"
slug: c-low-level-cost
date: '2025-08-01'
author: mayo
excerpt: >-
  C avoids garbage collection and gives manual memory control, but opens the door to dangerous bugs.
  Explore real-world memory issues and why they matter.
category: rust
tags:
- rust
- c
- memory
- dangling-pointer
- undefined-behavior
---

# C: Power Without Protection

With C, there's no runtime, no GC. Just raw speed and control.

```c
char* msg = malloc(100);
strcpy(msg, "hello");
free(msg);
printf("%s", msg); // ❌ Use after free
```

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

**Security vulnerabilities by category:**
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

**➡️ Next:** "Rust's Ownership: Memory Safety Without Garbage Collection"