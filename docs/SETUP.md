# Pulsar Setup Guide

## Prerequisites

- Rust (1.78.0+)
- Solana CLI (1.18+)
- Anchor CLI (0.30.0+)
- Node.js (20+)
- npm or yarn

## Installation

### 1. Install Solana CLI

```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

### 2. Install Anchor

```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

### 3. Install Dependencies

```bash
# Install root dependencies
npm install

# Install workspace dependencies
npm install --workspaces
```

## Development Setup

### 1. Build Solana Programs

```bash
anchor build
```

### 2. Run Tests

```bash
anchor test
```

### 3. Start API Server

```bash
cd api
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### 4. Deploy to Localnet

```bash
# Start local validator
solana-test-validator

# In another terminal, deploy
./scripts/deploy.sh localnet
```

## Configuration

### API Server Environment Variables

Copy `api/.env.example` to `api/.env` and configure:

- `SOLANA_RPC_URL` - Solana RPC endpoint
- `TREASURY_WALLET` - Wallet address to receive payments
- `PAYMENT_PROGRAM_ID` - Deployed program ID
- `USDC_MINT_ADDRESS` - USDC mint address

## Project Structure

```
pulsar/
├── programs/
│   └── pulsar_payment/     # Solana program
├── api/                    # API server
│   ├── src/
│   │   ├── index.ts        # Express server
│   │   ├── routes/         # API routes
│   │   └── middleware/     # Auth middleware
├── client/                 # Client SDK
│   └── src/
│       └── index.ts        # PulsarClient
├── tests/                  # Integration tests
└── docs/                   # Documentation
```

## Next Steps

1. Deploy program to devnet
2. Configure API server
3. Test x402 payment flow
4. Integrate Switchboard Surge oracle
5. Add real RWA risk data sources

