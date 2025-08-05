---
id: blockchain-fundamentals-solana-verification-simplified
title: Fondamentaux Blockchain Partie 17 - Comment Solana vérifie une signature de transaction (Ed25519)
slug: blockchain-fundamentals-part17-solana-verification-simplified
author: mayo
locale: fr
excerpt: Une explication simplifiée avec de vrais nombres montrant comment Solana valide les signatures Ed25519
category: blockchain
tags:
  - crypto
  - blockchain
  - beginner
  - solana
  - ed25519
  - transaction-verification
date: '2025-07-31'
---
# Fondamentaux Blockchain Partie 17 : Comment Solana vérifie une signature de transaction (Ed25519)

Décomposons ça avec de **vrais nombres** (exemple à petite échelle) pour que ce soit super clair.

## Acteurs clés dans une transaction Solana :

1. **Clé privée (`a`)** : Un nombre secret (ex: `a = 5`).
2. **Clé publique (`A`)** : Dérivée comme `A = a * B` (où `B` est un point de base standard).
   * Exemple : Si `B = (2, 3)` sur une courbe jouet, `A = 5 * (2, 3) = (un x, y)`.
3. **Signature (`R, s`)** : Générée lors de la signature d'une transaction.

## Vérification étape par étape

**But :** Vérifier que la signature `(R, s)` a été créée par le propriétaire de `A` pour les données exactes de la transaction.

### 1. Création de signature (Simplifié)

Lors de la signature, le portefeuille :

1. Calcule un **nonce** `r` (un nombre qui semble aléatoire dérivé de la clé privée et du message).
   * Exemple : `r = 7` (déterministe mais imprévisible).

2. Calcule `R = r * B` (un point de courbe).
   * Exemple : `R = 7 * (2, 3) = (un x, y)`.

3. Calcule `s = r + (H(R || A || message) * a)`.
   * `H(...)` est une fonction de hachage (comme SHA-512).
   * Exemple : Si `H(R || A || message) = 10`, alors `s = 7 + 10 * 5 = 57`.

**Signature finale :** `(R = (x, y), s = 57)`.

### 2. Vérification (Comment Solana vérifie)

Solana reçoit `(R, s)`, le `message`, et la clé publique `A`. Il vérifie :

**Équation à vérifier :**
```
s * B == R + H(R || A || message) * A  
```

**En branchant notre exemple :**

1. **Côté gauche (`s * B`)** : `57 * B` (c'est-à-dire, ajouter `B` à lui-même 57 fois).

2. **Côté droit (`R + H(...) * A`)** :
   * `H(R || A || message) = 10` (même hash qu'avant).
   * `10 * A = 10 * (a * B) = 10 * (5 * B) = 50 * B`.
   * Ajouter `R` (qui est `7 * B`) : `50 * B + 7 * B = 57 * B`.

**Résultat :** Les deux côtés égalent `57 * B` → **Signature valide !**

## Pourquoi tu ne peux pas la falsifier ?

Pour forger une signature, tu devrais résoudre pour `s` dans : `s * B = R + H(...) * A`

Sans connaître `a` (clé privée), c'est **impossible** pour les ordinateurs classiques (grâce au **problème du logarithme discret de courbe elliptique**).

## Analogie du monde réel :

Imagine :
* Ta **signature** = un sceau de cire estampé avec une bague secrète.
* **Vérification** = vérifier si le sceau correspond au design public de la bague.
* Si tu changes même **une lettre** dans le message, le sceau se casse.

Solana fait ça mathématiquement, assurant aucune falsification.

## Exemple de code :

```javascript
function verifySignatureStepByStep(signature, message, publicKey) {
    const { R, s } = signature;
    
    // Étape 1 : Calculer le hash de défi
    const challenge = sha512(R + publicKey + message) % CURVE_ORDER;
    console.log(`Défi : ${challenge}`);
    
    // Étape 2 : Calculer le côté gauche (s * B)
    const leftSide = scalarMultiply(s, ED25519_BASEPOINT);
    console.log(`Côté gauche : s * B = ${s} * B`);
    
    // Étape 3 : Calculer le côté droit (R + challenge * A)
    const challengeTimesA = scalarMultiply(challenge, publicKey);
    const rightSide = pointAdd(R, challengeTimesA);
    console.log(`Côté droit : R + ${challenge} * A`);
    
    // Étape 4 : Vérifier si les deux côtés sont égaux
    const isValid = leftSide.equals(rightSide);
    console.log(`Vérification : ${isValid ? 'VALIDE' : 'INVALIDE'}`);
    
    return isValid;
}
```

## Points clés :

1. Les signatures se lient aux **données exactes de la transaction** (grâce au hachage).
2. La vérification utilise des **clés publiques** (pas besoin de secret).
3. **Pas de contrefaçons** parce que tu ne peux pas inverser les maths sans la clé privée.

## Résumé
✅ **Vérification Ed25519** : Preuve mathématique que seul le détenteur de la clé privée aurait pu créer la signature pour ce message spécifique.