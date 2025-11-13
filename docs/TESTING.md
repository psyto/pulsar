# Testing Guide

## Overview

Pulsar has two types of tests:

1. **Anchor/Solana Program Tests** - Test the on-chain payment program
2. **API Tests** - Test the HTTP API server and x402 protocol

## Running Tests

### Anchor Program Tests

Run from the **project root**:

```bash
# From project root
npm test

# Or use the script directly
./scripts/test.sh

# Or use Anchor directly
PATH="$HOME/.cargo/bin:$PATH" ~/.cargo/bin/anchor test
```

**Important**: Anchor tests require a local Solana validator to be running:

```bash
# Terminal 1: Start validator
solana-test-validator

# Terminal 2: Run tests
npm test
```

### API Tests

Run from the **api directory**:

```bash
# From api directory
cd api
npm test

# Or from project root
npm run api:test  # (if we add this script)
```

API tests use Jest and don't require a validator.

## Test Structure

### Anchor Tests

Location: `tests/payment.test.ts`

Tests the Solana program:

-   Gateway initialization
-   Payment processing
-   Fee management

### API Tests

Location: `api/tests/`

Tests the HTTP API:

-   Payment endpoints (`/api/v1/payment/*`)
-   Data endpoints (`/api/v1/data/*`)
-   Authentication middleware
-   x402 protocol implementation

## Writing Tests

### Anchor Test Example

```typescript
import * as anchor from "@coral-xyz/anchor";
import { expect } from "chai";

describe("pulsar_payment", () => {
    it("should initialize gateway", async () => {
        // Test code here
    });
});
```

### API Test Example

```typescript
import request from "supertest";
import app from "../src/index";

describe("Payment API", () => {
    it("should return payment quote", async () => {
        const response = await request(app)
            .get("/api/v1/payment/quote")
            .expect(200);

        expect(response.body).toHaveProperty("price");
    });
});
```

## Continuous Integration

For CI/CD, ensure:

1. Install dependencies: `npm install`
2. Build programs: `npm run build`
3. Run Anchor tests: `npm test` (requires validator)
4. Run API tests: `cd api && npm test`
