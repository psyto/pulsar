import { Request, Response, NextFunction } from 'express';
import { Connection, PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';

const connection = new Connection(
  process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  'confirmed'
);

export interface AuthenticatedRequest extends Request {
  wallet?: PublicKey;
  signature?: string;
}

/**
 * Middleware to verify wallet signature for x402 protocol authentication
 */
export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const signature = req.headers['x-payment-signature'] as string;
    const wallet = req.headers['x-wallet-address'] as string;
    const message = req.headers['x-message'] as string;
    const timestamp = req.headers['x-timestamp'] as string;

    if (!signature || !wallet || !message || !timestamp) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing required authentication headers',
      });
    }

    // Verify timestamp (prevent replay attacks)
    const requestTime = parseInt(timestamp, 10);
    const currentTime = Date.now();
    const timeWindow = 5 * 60 * 1000; // 5 minutes

    if (Math.abs(currentTime - requestTime) > timeWindow) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Request timestamp expired',
      });
    }

    // Verify signature
    const publicKey = new PublicKey(wallet);
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = Buffer.from(signature, 'base64');

    const isValid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKey.toBytes()
    );

    if (!isValid) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid signature',
      });
    }

    // Attach wallet info to request
    req.wallet = publicKey;
    req.signature = signature;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication failed',
    });
  }
};

