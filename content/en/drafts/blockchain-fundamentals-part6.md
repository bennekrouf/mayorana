---
id: blockchain-fundamentals-point-validation
title: Blockchain Fundamentals Part 6 - Point Validation on Elliptic Curves
slug: blockchain-fundamentals-part6-point-validation
author: mayo
locale: en
excerpt: Learning how to verify if a point lies on an elliptic curve
category: blockchain
tags:
  - crypto
  - blockchain
  - beginner
  - solana
  - elliptic-curves
  - point-operations
date: '2025-07-31'
---
# Blockchain Fundamentals Part 2: Points and Curve Operations

## Given the elliptic curve `y² = x³ + 2x + 3 mod 17`, determine whether `(3, 6)` lies on the curve.

**What's the Goal?** We need to check if plugging `x = 3` and `y = 6` into the curve equation holds true.

**Step-by-Step:**

1. **Compute the right-hand side (RHS)**: `x³ + 2x + 3 mod 17`
   - `= 3³ + 2*3 + 3 = 27 + 6 + 3 = 36`
   - `36 mod 17 = 2` (since `17 * 2 = 34`, remainder is `2`).

2. **Compute the left-hand side (LHS)**: `y² mod 17`
   - `= 6² = 36 mod 17 = 2` (same as above).

3. **Compare LHS and RHS**: Since `2 == 2`, the point `(3, 6)` **is** on the curve!

**Code Example**:
```javascript
function isPointOnCurve(x, y, a, b, p) {
    // Calculate y² mod p
    const leftSide = (y * y) % p;
    
    // Calculate x³ + ax + b mod p
    const rightSide = (x ** 3 + a * x + b) % p;
    
    return leftSide === rightSide;
}

// Test the point (3, 6) on curve y² = x³ + 2x + 3 mod 17
const x = 3, y = 6, a = 2, b = 3, p = 17;
const result = isPointOnCurve(x, y, a, b, p);
console.log(`Point (${x}, ${y}) is on curve: ${result}`); // true
```

**Validation Function**:
```javascript
function validateEllipticCurvePoint(point, curve) {
    const { x, y } = point;
    const { a, b, p } = curve;
    
    // Handle point at infinity (special case)
    if (x === null && y === null) {
        return true; // Point at infinity is always valid
    }
    
    // Check if coordinates are in valid range
    if (x < 0 || x >= p || y < 0 || y >= p) {
        return false;
    }
    
    // Check curve equation
    return isPointOnCurve(x, y, a, b, p);
}

// Example usage
const curve = { a: 2, b: 3, p: 17 };
const testPoints = [
    { x: 3, y: 6 },   // Should be valid
    { x: 5, y: 8 },   // Need to check
    { x: 1, y: 1 }    // Need to check
];

testPoints.forEach(point => {
    const isValid = validateEllipticCurvePoint(point, curve);
    console.log(`Point (${point.x}, ${point.y}): ${isValid ? 'Valid' : 'Invalid'}`);
});
```

**Why Does This Matter?** In ECC, only points that satisfy the curve equation are valid for cryptographic operations (like key generation).

**Security Implications**:
- Invalid points can lead to vulnerabilities in cryptographic protocols
- Point validation prevents attacks using malformed public keys
- Essential for secure implementation of digital signatures

## Key Takeaway
✅ **Point validation**: Essential first step before any elliptic curve cryptographic operation.