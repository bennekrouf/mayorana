---
id: blockchain-fundamentals-quadratic-residues
title: Blockchain Fundamentals Part 5 - Quadratic Residues in ECC
slug: blockchain-fundamentals-part5-quadratic-residues
author: mayo
locale: en
excerpt: Understanding quadratic residues and their role in finding valid elliptic curve points
category: blockchain
tags:
  - crypto
  - blockchain
  - beginner
  - solana
  - elliptic-curves
  - quadratic-residues
date: '2025-07-31'
---
# Blockchain Fundamentals Part 5: Quadratic Residues in ECC

## Given `x = 4`, test whether `x` is a quadratic residue modulo `17`, and explain how this relates to finding valid points on a curve.

**What is a Quadratic Residue?** A number `y` such that `y² ≡ x mod p` has a solution.

**Test for `x = 4`:** We check if there exists a `y` where `y² ≡ 4 mod 17`.
* `5² = 25 ≡ 8 mod 17` → Not 4.
* `6² = 36 ≡ 2 mod 17` → Not 4.
* `2² = 4 ≡ 4 mod 17` → **Yes!** (Also, `15² = 225 ≡ 4 mod 17`).

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

**Relation to ECC:**
* In ECC, a point `(x, y)` is valid only if `y² ≡ x³ + ax + b mod p`.
* So, `x³ + ax + b` must be a quadratic residue (otherwise, `y` doesn't exist).

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
* Not every `x` coordinate has a corresponding `y` coordinate on the curve.
* Quadratic residue test determines if a point exists for a given `x`.
* This affects key generation and point validation in cryptographic protocols.

## Key Takeaway
✅ **Quadratic residues**: Determine which `x` coordinates have valid `y` coordinates on elliptic curves.