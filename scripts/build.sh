#!/bin/bash

# Build script that uses system Rust instead of Solana's bundled Rust
# Usage: ./scripts/build.sh

echo "🔨 Building Pulsar with system Rust..."

# Prioritize system Rust tools in PATH (adjust path if needed)
export PATH="$HOME/.cargo/bin:$PATH"

# Use global Anchor installation (adjust path if needed)
"$HOME/.cargo/bin/anchor" build || anchor build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📦 Program: target/deploy/pulsar_payment.so"
    echo "📄 IDL: target/idl/pulsar_payment.json"
else
    echo "❌ Build failed!"
    exit 1
fi

