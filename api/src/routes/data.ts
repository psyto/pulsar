import { Router, Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { DataService } from '../services/dataService';

const router = Router();

/**
 * GET /api/v1/data/rwa-risk/:tokenMint
 * Get RWA risk metrics for a specific token
 */
router.get('/rwa-risk/:tokenMint', async (req: Request, res: Response) => {
  try {
    const { tokenMint } = req.params;
    const authReq = req as AuthenticatedRequest;
    
    // Allow demo mode without authentication (for frontend demo)
    const isDemoMode = !authReq.wallet && req.headers['x-demo-mode'] === 'true';
    const requestedBy = authReq.wallet?.toBase58() || (isDemoMode ? 'demo-mode' : 'unknown');

    // Get data service from app locals (initialized in index.ts)
    const dataService = req.app.locals.dataService as DataService | undefined;
    const dataServiceInitialized = req.app.locals.dataServiceInitialized as boolean;

    // Try to use real data service if available
    if (dataService && dataServiceInitialized) {
      try {
        const riskData = await dataService.getRwaRiskData(tokenMint, requestedBy);
        return res.json(riskData);
      } catch (error) {
        console.error('Error fetching real RWA risk data:', error);
        // Fall through to mock data if real data fails and fallback is enabled
        if (process.env.FALLBACK_TO_MOCK !== 'true') {
          throw error;
        }
      }
    }

    // Fallback to mock data (for MVP or when service not initialized)
    const riskData = {
      tokenMint,
      timestamp: new Date().toISOString(),
      metrics: {
        legalCompliance: {
          status: 'compliant',
          jurisdiction: 'US',
          structure: 'tokenized_fund',
          lastVerified: '2024-01-15T00:00:00Z',
        },
        counterpartyRisk: {
          issuerRating: 'A',
          defaultProbability: 0.02,
          solvencyScore: 0.95,
          lastUpdated: '2024-01-15T00:00:00Z',
        },
        oracleIntegrity: {
          consensusNodes: 5,
          dataReliability: 0.99,
          latency: '<10ms',
          lastUpdate: new Date().toISOString(),
        },
      },
      requestedBy,
    };

    res.json(riskData);
  } catch (error) {
    console.error('RWA risk data error:', error);
    res.status(500).json({ error: 'Failed to fetch RWA risk data' });
  }
});

/**
 * GET /api/v1/data/liquidation-params/:tokenMint
 * Get liquidation modeling parameters
 */
router.get('/liquidation-params/:tokenMint', async (req: Request, res: Response) => {
  try {
    const { tokenMint } = req.params;
    const authReq = req as AuthenticatedRequest;
    
    // Allow demo mode without authentication (for frontend demo)
    const isDemoMode = !authReq.wallet && req.headers['x-demo-mode'] === 'true';
    const requestedBy = authReq.wallet?.toBase58() || (isDemoMode ? 'demo-mode' : 'unknown');

    // Get data service from app locals (initialized in index.ts)
    const dataService = req.app.locals.dataService as DataService | undefined;
    const dataServiceInitialized = req.app.locals.dataServiceInitialized as boolean;

    // Try to use real data service if available
    if (dataService && dataServiceInitialized) {
      try {
        const liquidationParams = await dataService.getLiquidationParams(tokenMint, requestedBy);
        return res.json(liquidationParams);
      } catch (error) {
        console.error('Error fetching real liquidation parameters:', error);
        // Fall through to mock data if real data fails and fallback is enabled
        if (process.env.FALLBACK_TO_MOCK !== 'true') {
          throw error;
        }
      }
    }

    // Fallback to mock data (for MVP or when service not initialized)
    const liquidationParams = {
      tokenMint,
      timestamp: new Date().toISOString(),
      parameters: {
        liquidationThreshold: 0.85,
        maxLtv: 0.75,
        liquidationPenalty: 0.05,
        healthFactor: 1.25,
        volatility: 0.12,
        correlation: {
          sol: 0.35,
          usdc: 0.95,
        },
      },
      requestedBy,
    };

    res.json(liquidationParams);
  } catch (error) {
    console.error('Liquidation params error:', error);
    res.status(500).json({ error: 'Failed to fetch liquidation parameters' });
  }
});

export { router as dataRouter };

