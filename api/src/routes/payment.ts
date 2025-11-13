import { Router, Request, Response } from 'express';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';

const router = Router();
const connection = new Connection(
  process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  'confirmed'
);

/**
 * GET /api/v1/payment/quote
 * Get payment quote for API access
 */
router.get('/quote', async (req: Request, res: Response) => {
  try {
    const endpoint = req.query.endpoint as string || 'default';
    
    // Get pricing based on endpoint
    const pricing = {
      default: {
        amount: '0.01',
        currency: 'USDC',
        decimals: 6,
      },
      'rwa-risk': {
        amount: '0.05',
        currency: 'USDC',
        decimals: 6,
      },
      'liquidation-params': {
        amount: '0.10',
        currency: 'USDC',
        decimals: 6,
      },
    };

    const price = pricing[endpoint as keyof typeof pricing] || pricing.default;

    res.json({
      endpoint,
      price,
      recipient: process.env.TREASURY_WALLET || '',
      network: 'solana',
      programId: process.env.PAYMENT_PROGRAM_ID || '',
    });
  } catch (error) {
    console.error('Payment quote error:', error);
    res.status(500).json({ error: 'Failed to generate payment quote' });
  }
});

/**
 * POST /api/v1/payment/verify
 * Verify payment transaction
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { signature, nonce } = req.body;

    if (!signature) {
      return res.status(400).json({ error: 'Missing transaction signature' });
    }

    // Verify transaction on-chain
    const tx = await connection.getTransaction(signature, {
      commitment: 'confirmed',
    });

    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (!tx.meta?.err) {
      res.json({
        verified: true,
        signature,
        nonce,
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(400).json({
        verified: false,
        error: 'Transaction failed',
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

export { router as paymentRouter };

