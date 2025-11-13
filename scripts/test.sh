#!/bin/bash

# Test script that uses system Rust and proper test configuration
# Usage: ./scripts/test.sh

echo "🧪 Running Pulsar tests..."

# Prioritize system Rust tools in PATH
export PATH="$HOME/.cargo/bin:$PATH"

# Check if validator is already running
if lsof -ti:8899 > /dev/null 2>&1; then
    echo "✅ Using existing validator on port 8899"
    export ANCHOR_PROVIDER_URL="http://localhost:8899"
else
    echo "⚠️  No validator found on port 8899"
    echo "   Start one with: solana-test-validator"
    echo "   Or Anchor will try to start its own..."
fi

# Use global Anchor installation
"$HOME/.cargo/bin/anchor" test || anchor test
