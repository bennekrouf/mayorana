---
id: blockchain-fundamentals-solana-vs-evm
title: Fondamentaux Blockchain - Solana vs Chaînes EVM (Ethereum, BSC)
slug: blockchain-fundamentals-solana-vs-evm
author: mayo
locale: fr
excerpt: Comprendre les différences architecturales clés entre Solana et les blockchains basées sur EVM
category: blockchain
tags:
  - crypto
  - blockchain
  - beginner
  - solana
  - ethereum
  - evm
  - architecture
date: '2025-07-31'
---
# Fondamentaux Blockchain : Solana vs Chaînes EVM (Ethereum, BSC)

Bien que Solana et les chaînes EVM utilisent toutes les signatures numériques pour les transactions, leurs architectures sont fondamentalement différentes. Décomposons les différences clés.

## Signature & Cryptographie

**Solana :**
* **Algorithme de signature :** Ed25519 (Edwards-curve Digital Signature Algorithm)
* **Taille de clé :** Clés privées 32 octets, clés publiques 32 octets
* **Performance :** ~100k vérifications de signature/seconde
* **Format d'adresse :** Clés publiques encodées en Base58 (ex: `11111111111111111111111111111112`)

**Chaînes EVM (Ethereum, BSC, Polygon) :**
* **Algorithme de signature :** ECDSA avec courbe secp256k1 (pareil que Bitcoin)
* **Taille de clé :** Clés privées 32 octets, clés publiques 64 octets non compressées
* **Performance :** ~30k vérifications de signature/seconde
* **Format d'adresse :** Adresses 20 octets dérivées du hash de clé publique (ex: `0x742d35Cc6537C0532925a3b8D0D9e4cC3b0b22`)

## Structure de transaction

**Transaction Solana :**
```javascript
// Solana : Basé sur comptes avec références de comptes explicites
{
  "recentBlockhash": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
  "feePayer": "3LKD9ckx9xJZY8qkDUjGQe6mPa2RBJjHM3pBwNM8JJhP",
  "instructions": [
    {
      "programId": "11111111111111111111111111111112", // Programme système
      "accounts": [
        { "pubkey": "sender", "isSigner": true, "isWritable": true },
        { "pubkey": "receiver", "isSigner": false, "isWritable": true }
      ],
      "data": [2, 0, 0, 0, 64, 66, 15, 0, 0, 0, 0, 0] // Transférer 1M lamports
    }
  ],
  "signatures": ["signature1", "signature2"]
}
```

**Transaction EVM :**
```javascript
// Ethereum : Style UTXO avec from/to/value
{
  "from": "0x742d35Cc6537C0532925a3b8D0D9e4cC3b0b22",
  "to": "0x8ba1f109551bD432803012645Hac136c",
  "value": "1000000000000000000", // 1 ETH en wei
  "gas": "21000",
  "gasPrice": "20000000000", // 20 gwei
  "nonce": 42,
  "data": "0x", // Vide pour transfert simple
  "v": 27, // Paramètre de récupération
  "r": "0x...", // Composant de signature
  "s": "0x..." // Composant de signature
}
```

## Modèle de compte

**Solana : Basé sur comptes**
```javascript
// Chaque donnée est un compte
const accountTypes = {
  "executable": "Code de smart contract",
  "data": "État de contrat ou données utilisateur", 
  "system": "Portefeuille utilisateur avec solde SOL",
  "token": "Compte de token SPL"
};

// Exemple : Transfert de token nécessite plusieurs comptes
const tokenTransferAccounts = [
  "source_token_account",    // Compte de token de l'expéditeur
  "dest_token_account",      // Compte de token du destinataire  
  "source_owner",            // Portefeuille de l'expéditeur
  "token_program",           // Programme SPL Token
  "mint_account"             // Info de frappe du token
];
```

**EVM : Stockage de contrat + Comptes externes**
```javascript
// Seulement deux types de comptes
const evmAccounts = {
  "externally_owned": {
    "balance": "Solde ETH",
    "nonce": "Compteur de transactions"
  },
  "contract": {
    "balance": "Solde ETH", 
    "nonce": "Compteur de création de contrat",
    "code": "Bytecode de smart contract",
    "storage": "Variables d'état du contrat"
  }
};
```

## Modèle d'exécution

**Solana : Traitement parallèle**
```javascript
// Les transactions déclarent quels comptes elles vont modifier
function solanaExecution() {
  // Ces transactions peuvent tourner simultanément (comptes différents)
  const tx1 = { accounts: ["Alice", "Bob"] };     // Alice -> Bob
  const tx2 = { accounts: ["Carol", "Dave"] };    // Carol -> Dave
  
  // Ces transactions doivent tourner séquentiellement (compte partagé)
  const tx3 = { accounts: ["Alice", "Eve"] };     // Alice -> Eve (attend tx1)
  
  return "Exécution parallèle basée sur les dépendances de comptes";
}
```

**EVM : Traitement séquentiel**
```javascript
// Toutes les transactions s'exécutent une après l'autre
function evmExecution() {
  const block = [
    { from: "Alice", to: "Bob" },
    { from: "Carol", to: "Dave" }, 
    { from: "Alice", to: "Eve" }
  ];
  
  // Traiter séquentiellement même s'il n'y a pas de conflits
  for (const tx of block) {
    executeTransaction(tx); // Une à la fois
  }
  
  return "Exécution séquentielle";
}
```

## Modèle de programmation

**Solana : Programmes multiples**
```rust
// Solana : Programmes sans état, état dans les comptes
#[program]
pub mod token_program {
    pub fn transfer(ctx: Context<Transfer>, amount: u64) -> Result<()> {
        // La logique du programme est sans état
        // L'état est stocké dans les comptes passés
        token::transfer(
            ctx.accounts.from.to_account_info(),
            ctx.accounts.to.to_account_info(),
            amount,
        )
    }
}
```

**EVM : Smart contracts avec état**
```solidity
// Ethereum : Contrats avec état et stockage interne
contract Token {
    mapping(address => uint256) public balances; // Le contrat stocke l'état
    
    function transfer(address to, uint256 amount) public {
        require(balances[msg.sender] >= amount);
        balances[msg.sender] -= amount;  // Modifier l'état du contrat
        balances[to] += amount;
    }
}
```

## Comparaison de performance

| Fonctionnalité | Solana | Chaînes EVM |
|----------------|--------|-------------|
| **TPS** | 65,000+ | 15 (ETH), 100+ (BSC) |
| **Finalité** | ~400ms | 12s (ETH), 3s (BSC) |
| **Frais** | $0.0001-0.001 | $1-50+ (ETH), $0.1-1 (BSC) |
| **Vérification signature** | Ed25519 (rapide) | ECDSA (plus lent) |
| **Exécution parallèle** | Oui | Non |

## Expérience développeur

**Solana :**
```javascript
// Plus complexe : Doit gérer les comptes explicitement
const instruction = new TransactionInstruction({
  keys: [
    { pubkey: fromAccount, isSigner: true, isWritable: true },
    { pubkey: toAccount, isSigner: false, isWritable: true },
    { pubkey: systemProgram, isSigner: false, isWritable: false }
  ],
  programId: SystemProgram.programId,
  data: transferInstructionData
});
```

**EVM :**
```javascript
// Plus simple : Juste spécifier destinataire et montant
const tx = {
  to: "0x742d35Cc6537C0532925a3b8D0D9e4cC3b0b22",
  value: ethers.utils.parseEther("1.0"),
  gasLimit: 21000
};
```

## Points clés

✅ **Solana** : Rapide (Ed25519), exécution parallèle, basé sur comptes, complexe mais scalable  
✅ **EVM** : Écosystème mature, modèle plus simple, exécution séquentielle, largement adopté  
✅ **Le choix dépend de** : Besoins de performance vs maturité de l'écosystème vs expérience développeur

## Quand choisir quoi ?

**Choisir Solana si :**
- Tu as besoin de haut débit et frais bas
- Tu construis des applications critiques en performance
- Tu es à l'aise avec l'architecture basée sur comptes

**Choisir EVM si :**
- Tu veux une compatibilité maximale d'écosystème  
- Tu préfères un modèle de développement plus simple
- Tu as besoin d'outillage et bibliothèques éprouvés