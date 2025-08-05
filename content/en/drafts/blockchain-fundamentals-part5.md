---
id: blockchain-fundamentals-quadratic-residues
title: Blockchain Fundamentals Part 5 - Quadratic Residues in ECC
slug: blockchain-fundamentals-part5-quadratic-residues
author: mayo
locale: en
excerpt: Understanding quadratic residues and their role in finding valid elliptic curve points
category: blockchain
tags:
  - blockchain
---

# Blockchain Fundamentals Part 5: Quadratic Residues in ECC

## Given `x = 4`, test whether `x` is a quadratic residue modulo `17`, and explain how this relates to finding valid points on a curve.

**What is a Quadratic Residue?** A number `y` such that `y² ≡ x mod p` has a solution.

**Test for `x = 4`:** We need to check if there's a `y` where `y² ≡ 4 mod 17`.

Let's try some values:
* `5² = 25 ≡ 8 mod 17` → Nope, not 4.
* `6² = 36 ≡ 2 mod 17` → Still not 4.
* `2² = 4 ≡ 4 mod 17` → **Bingo!** (And `15² = 225 ≡ 4 mod 17` works too).

**Code Example**:
```javascript
function isQuadraticResidue(x, p) {
    for (let y = 0; y < p; y++) {
        if ((y * y) % p === x % p) {
            return { isResidue: true, solutions: [] };
        }
    }
    return { isResidue: false, solutions: [] };
}

function findQuadraticResidues(x, p) {
    const solutions = [];
    for (let y = 0; y < p; y++) {
        if ((y * y) % p === x % p) {
            solutions.push(y);
        }
    }
    return solutions;
}

// Test x = 4 mod 17
const solutions = findQuadraticResidues(4, 17);
console.log(`Solutions for y² ≡ 4 mod 17: ${solutions}`); // [2, 15]
```

**How this connects to ECC:**
* In elliptic curve cryptography, a point `(x, y)` is valid only if `y² ≡ x³ + ax + b mod p`.
* This means `x³ + ax + b` has to be a quadratic residue. If it's not, then `y` doesn't exist.

**Practical Example**:
```javascript
// Example curve: y² = x³ + 2x + 3 mod 17
function findValidPoints(a, b, p) {
    const validPoints = [];
    
    for (let x = 0; x < p; x++) {
        const rightSide = (x ** 3 + a * x + b) % p;
        const ySolutions = findQuadraticResidues(rightSide, p);
        
        for (const y of ySolutions) {
            validPoints.push({ x, y });
            console.log(`Valid point: (${x}, ${y})`);
        }
    }
    
    return validPoints;
}

// Find all points on y² = x³ + 2x + 3 mod 17
const points = findValidPoints(2, 3, 17);
console.log(`Total valid points: ${points.length}`);
```

**Why This Matters**:
* Not every `x` coordinate has a matching `y` coordinate on the curve.
* The quadratic residue test tells us if a point exists for a given `x`.
* This impacts key generation and point validation in crypto protocols.

## Key Takeaway

✅ **Quadratic residues**: They determine which `x` coordinates have valid `y` coordinates on elliptic curves.