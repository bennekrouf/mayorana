---
id: blockchain-fundamentals-solana-private-keys
title: Fondamentaux Blockchain Partie 16 - Dérivation de clés privées Solana
slug: blockchain-fundamentals-part16-solana-private-keys
author: mayo
locale: fr
excerpt: Comprendre comment les clés privées sont générées et stockées dans les portefeuilles Solana
category: blockchain
tags:
  - crypto
  - blockchain
  - beginner
  - solana
  - wallets
  - mnemonics
date: '2025-07-31'
---
# Fondamentaux Blockchain Partie 16 : Dérivation de clés privées Solana

## Dans Solana, d'où vient la clé privée utilisée pour signer une transaction, et comment est-elle stockée ou dérivée d'une phrase mnémotechnique ?

**Origine de la clé privée :**
* Générée à partir d'un **générateur de nombres aléatoirement sécurisé cryptographiquement** (ex: lors de la création du portefeuille).
* Souvent dérivée d'une **phrase mnémotechnique** (12/24 mots lisibles par l'humain) en utilisant **BIP-39** (un standard de dérivation de clés).

**Comment fonctionnent les mnémotechniques :**

1. **Mnémotechnique → Graine :** La phrase est hachée (avec PBKDF2 + HMAC-SHA512) en une graine de 64 octets.
2. **Graine → Clé privée :** La graine est utilisée pour dériver des clés déterministes hiérarchiques (HD) via **BIP-44** (ex: `m/44'/501'/0'/0'` pour Solana).

**Exemple :**
```bash
# Mnémotechnique : "pomme banane cerise date écho forêt raisin maison glace jazz clé lave"
# → Hachée en graine (64 octets)  
# → Dérivée en clé privée (32 octets pour Ed25519)
```

**Exemple de code :**
```javascript
import { mnemonicToSeedSync } from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { Keypair } from '@solana/web3.js';

function deriveKeypairFromMnemonic(mnemonic, accountIndex = 0) {
    // Étape 1 : Convertir la mnémotechnique en graine
    const seed = mnemonicToSeedSync(mnemonic);
    
    // Étape 2 : Dériver la clé en utilisant le chemin BIP-44 pour Solana
    const path = `m/44'/501'/${accountIndex}'/0'`;
    const derivedSeed = derivePath(path, seed.toString('hex')).key;
    
    // Étape 3 : Créer la paire de clés Solana
    const keypair = Keypair.fromSeed(derivedSeed);
    
    return keypair;
}

// Exemple d'utilisation
const mnemonic = "pomme banane cerise date écho forêt raisin maison glace jazz clé lave";
const keypair = deriveKeypairFromMnemonic(mnemonic);
console.log("Clé publique :", keypair.publicKey.toString());
```

**Décomposition du chemin BIP-44 :**
```
m/44'/501'/0'/0'
│  │   │   │  │
│  │   │   │  └── Index d'adresse (0 pour la première adresse)
│  │   │   └──── Changement (0 pour les adresses externes)
│  │   └──────── Index de compte (0 pour le premier compte)
│  └──────────── Type de pièce (501 pour Solana)
└─────────────── Standard BIP-44
```

**Stockage :**
* **Portefeuilles logiciels :** Chiffrés dans les portefeuilles (ex: Phantom) avec des mots de passe
* **Portefeuilles matériels :** Stockés dans du matériel sécurisé (Ledger, Trezor)
* **Jamais stocker en texte brut :** Toujours chiffré ou dans du matériel sécurisé

**Bonnes pratiques sécuritaires :**
```javascript
// ✅ Bien : Générer une mnémotechnique sécurisée
const mnemonic = generateMnemonic(256); // Phrase de 24 mots

// ✅ Bien : Dériver plusieurs comptes à partir de la même graine
const account0 = deriveKeypairFromMnemonic(mnemonic, 0);
const account1 = deriveKeypairFromMnemonic(mnemonic, 1);

// ❌ Mal : Réutiliser la même clé privée partout
// ❌ Mal : Stocker les clés privées en texte brut
```

## Point clé
✅ **Clés privées Solana** : Dérivées de mnémotechniques sécurisées utilisant les standards BIP-39/BIP-44, permettant la récupération déterministe de portefeuille.