# Pulsar Project Structure

## Overview

This document outlines the complete project structure for Pulsar, a Solana RWA Risk Gateway implementing the x402 protocol.

## Directory Structure

```
pulsar/
├── programs/
│   └── pulsar_payment/          # Solana Anchor program
│       ├── Cargo.toml           # Rust dependencies
│       ├── src/
│       │   └── lib.rs           # Main program logic
│       └── tests/               # Program tests
│
├── api/                         # API Server (TypeScript/Express)
│   ├── package.json
│   ├── tsconfig.json
│   ├── README.md
│   ├── src/
│   │   ├── index.ts             # Express server setup
│   │   ├── middleware/
│   │   │   └── auth.ts          # x402 signature verification
│   │   └── routes/
│   │       ├── payment.ts       # Payment endpoints
│   │       └── data.ts          # RWA risk data endpoints
│   └── tests/
│
├── client/                      # Client SDK (TypeScript)
│   ├── package.json
│   ├── tsconfig.json
│   ├── README.md
│   ├── src/
│   │   └── index.ts             # PulsarClient class
│   └── tests/
│
├── tests/                       # Integration tests
│   └── payment.test.ts          # Anchor tests
│
├── scripts/
│   └── deploy.sh                # Deployment script
│
├── docs/
│   ├── ARCHITECTURE.md          # System architecture
│   └── SETUP.md                 # Setup instructions
│
├── Anchor.toml                   # Anchor workspace config
├── Cargo.toml                   # Rust workspace config
├── package.json                 # Root package.json (workspaces)
├── tsconfig.json                # TypeScript config
├── .gitignore                   # Git ignore rules
└── README.md                    # Project overview
```

## Key Components

### 1. Solana Program (`programs/pulsar_payment/`)

**Purpose**: On-chain payment processing using USDC

**Key Features**:
- Gateway initialization
- Payment processing
- Fee management
- Event emission

**Instructions**:
- `initialize` - Set up gateway with fee
- `process_payment` - Transfer USDC and record payment
- `update_fee` - Update gateway fee (authority only)

### 2. API Server (`api/`)

**Purpose**: HTTP 402 implementation and data endpoints

**Key Features**:
- x402 protocol handler
- Wallet signature verification
- RWA risk data endpoints
- Payment verification

**Endpoints**:
- `GET /api/v1/payment/quote` - Payment quotes
- `POST /api/v1/payment/verify` - Verify transactions
- `GET /api/v1/data/rwa-risk/:tokenMint` - RWA risk metrics
- `GET /api/v1/data/liquidation-params/:tokenMint` - Liquidation params

### 3. Client SDK (`client/`)

**Purpose**: TypeScript SDK for wallet integration

**Key Features**:
- Wallet signature generation
- Automatic x402 headers
- API client wrapper
- Type-safe interfaces

## Technology Stack

- **Blockchain**: Solana
- **Smart Contracts**: Anchor (Rust)
- **API Server**: Express.js (TypeScript)
- **Client SDK**: TypeScript
- **Payment**: USDC (SPL Token)
- **Protocol**: x402 (HTTP 402)

## Next Steps

1. Install dependencies: `npm install`
2. Build programs: `anchor build`
3. Configure API: Copy `api/.env.example` to `api/.env`
4. Deploy to devnet: `./scripts/deploy.sh devnet`
5. Start API server: `cd api && npm run dev`

## Development Workflow

1. **Program Development**:
   ```bash
   anchor build
   anchor test
   ```

2. **API Development**:
   ```bash
   cd api
   npm run dev
   ```

3. **Client Development**:
   ```bash
   cd client
   npm run build
   ```

4. **Deployment**:
   ```bash
   ./scripts/deploy.sh devnet
   ```

