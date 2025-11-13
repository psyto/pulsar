#!/bin/bash

# Deploy script for Pulsar programs
# Usage: ./scripts/deploy.sh [localnet|devnet|mainnet]

NETWORK=${1:-localnet}

echo "🚀 Deploying Pulsar to $NETWORK..."

case $NETWORK in
  localnet)
    anchor deploy --provider.cluster localnet
    ;;
  devnet)
    anchor deploy --provider.cluster devnet
    ;;
  mainnet)
    read -p "⚠️  Are you sure you want to deploy to mainnet? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
      anchor deploy --provider.cluster mainnet
    else
      echo "Deployment cancelled."
      exit 1
    fi
    ;;
  *)
    echo "Invalid network. Use: localnet, devnet, or mainnet"
    exit 1
    ;;
esac

echo "✅ Deployment complete!"

