# Pulsar Architecture

## Overview

Pulsar is a Solana-based RWA Risk Gateway that implements the x402 protocol for pay-per-call API access. The system consists of three main components:

1. **Solana Program** (`programs/pulsar_payment`) - On-chain payment processing
2. **API Server** (`api/`) - HTTP 402 endpoint implementation
3. **Client SDK** (`client/`) - Wallet integration and API client

## Architecture Diagram

```
┌─────────────┐
│   Client    │
│  (Wallet)   │
└──────┬──────┘
       │
       │ HTTP Request + Signature
       ▼
┌─────────────────────────────────┐
│      API Server (x402)          │
│  - Auth Middleware              │
│  - Payment Verification         │
│  - Data Endpoints               │
└──────┬──────────────────────────┘
       │
       │ On-chain Payment
       ▼
┌─────────────────────────────────┐
│   Solana Program                │
│   (pulsar_payment)              │
│  - Process Payment              │
│  - Gateway State                │
└─────────────────────────────────┘
       │
       │ Oracle Data
       ▼
┌─────────────────────────────────┐
│   Switchboard Surge             │
│   (Low-latency Oracle)          │
└─────────────────────────────────┘
```

## Components

### 1. Solana Program

**Location**: `programs/pulsar_payment/`

**Responsibilities**:
- Initialize payment gateway
- Process USDC payments
- Maintain gateway state (fee, authority)
- Emit payment events

**Key Instructions**:
- `initialize` - Set up gateway with fee configuration
- `process_payment` - Transfer USDC and record payment
- `update_fee` - Update gateway fee (authority only)

### 2. API Server

**Location**: `api/`

**Responsibilities**:
- Implement HTTP 402 "Payment Required" status
- Verify wallet signatures
- Serve RWA risk data endpoints
- Integrate with Solana program for payment verification

**Key Endpoints**:
- `GET /api/v1/payment/quote` - Get payment quote
- `POST /api/v1/payment/verify` - Verify payment transaction
- `GET /api/v1/data/rwa-risk/:tokenMint` - Get RWA risk metrics
- `GET /api/v1/data/liquidation-params/:tokenMint` - Get liquidation parameters

### 3. Client SDK

**Location**: `client/`

**Responsibilities**:
- Wallet integration
- Signature generation
- API client wrapper
- Payment flow management

## x402 Protocol Flow

1. Client requests data endpoint
2. Server responds with HTTP 402 + payment details
3. Client signs message with wallet
4. Client includes signature in request headers
5. Server verifies signature
6. Server processes payment on-chain (if needed)
7. Server returns requested data

## Security Considerations

- **Signature Verification**: All requests require valid wallet signatures
- **Timestamp Validation**: Prevents replay attacks (5-minute window)
- **Rate Limiting**: Prevents abuse
- **CORS**: Configurable allowed origins
- **Helmet**: Security headers

## Future Enhancements

- Switchboard Surge oracle integration
- Outcome-based pricing model
- Multi-endpoint support
- Analytics and monitoring
- KYC/Compliance integration (Solana Attestation Service)

