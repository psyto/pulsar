import { Connection } from '@solana/web3.js';
import { TokenMetadataService } from './tokenMetadata';
import { SwitchboardService } from './switchboardService';
import { AccountDataService } from './accountData';
import { DataAggregator } from './dataAggregator';
import {
  RwaRiskData,
  LiquidationParamsData,
  TokenInfo,
  RwaRiskMetrics,
  PriceData,
} from '../types/data';

/**
 * Main data service orchestrator
 * Coordinates between different data sources (on-chain, oracle, calculations)
 */
export class DataService {
  private tokenMetadata: TokenMetadataService;
  private switchboard: SwitchboardService;
  private accountData: AccountDataService;
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
    this.tokenMetadata = new TokenMetadataService(connection);
    this.switchboard = new SwitchboardService(connection);
    this.accountData = new AccountDataService(connection);
  }

  /**
   * Initialize all services
   */
  async initialize(): Promise<void> {
    await this.switchboard.initialize();
  }

  /**
   * Get RWA risk data for a token
   * Combines on-chain token info with oracle risk metrics
   */
  async getRwaRiskData(tokenMint: string, requestedBy: string): Promise<RwaRiskData> {
    try {
      // 1. Get token metadata from on-chain
      const tokenInfo = await this.tokenMetadata.getTokenInfo(tokenMint);

      // 2. Get account distribution data (optional, for enhancement)
      let accountData;
      try {
        accountData = await this.accountData.getTokenDistribution(tokenMint, tokenInfo);
      } catch (error) {
        console.warn(`Could not fetch account data for ${tokenMint}:`, error);
      }

      // 3. Try to get oracle data
      let oracleData: any = null;
      let oracleSource: 'switchboard' | 'pyth' | 'custom' | 'mock' | null = null;
      try {
        oracleData = await this.switchboard.getRwaRiskData(tokenMint, tokenInfo);
        oracleSource = this.switchboard.getProvider() as any;
      } catch (error) {
        console.warn(`Could not fetch oracle data for ${tokenMint}:`, error);
      }

      // 4. Aggregate data from all sources
      const metrics = DataAggregator.aggregateRwaRiskData(
        tokenInfo,
        oracleData,
        oracleSource,
        accountData
      );

      return {
        tokenMint,
        timestamp: new Date().toISOString(),
        metrics,
        requestedBy,
      };
    } catch (error) {
      console.error(`Error in getRwaRiskData for ${tokenMint}:`, error);
      throw error;
    }
  }

  /**
   * Get liquidation parameters for a token
   * Combines price data with risk calculations
   */
  async getLiquidationParams(tokenMint: string, requestedBy: string): Promise<LiquidationParamsData> {
    try {
      // 1. Get token info
      const tokenInfo = await this.tokenMetadata.getTokenInfo(tokenMint);

      // 2. Get account distribution data (for risk assessment)
      let accountData;
      try {
        accountData = await this.accountData.getTokenDistribution(tokenMint, tokenInfo);
      } catch (error) {
        console.warn(`Could not fetch account data for ${tokenMint}:`, error);
      }

      // 3. Try to get price data from oracle
      let priceData: PriceData | null = null;
      let oracleSource: 'switchboard' | 'pyth' | 'custom' | 'mock' | null = null;
      try {
        priceData = await this.switchboard.getPriceData(tokenMint);
        oracleSource = this.switchboard.getProvider() as any;
      } catch (error) {
        console.warn(`Could not fetch price data for ${tokenMint}:`, error);
      }

      // 4. Aggregate price data
      const aggregatedPrice = priceData || DataAggregator.aggregatePriceData(null, null);

      // 5. Calculate liquidation parameters
      // TODO: Implement LiquidationCalculator in Phase 4
      const parameters = this.getDefaultLiquidationParams(tokenInfo, aggregatedPrice, accountData);

      return {
        tokenMint,
        timestamp: new Date().toISOString(),
        parameters,
        requestedBy,
      };
    } catch (error) {
      console.error(`Error in getLiquidationParams for ${tokenMint}:`, error);
      throw error;
    }
  }

  /**
   * Get default RWA risk metrics (fallback when oracle data unavailable)
   */
  private getDefaultRwaRiskMetrics(tokenMint: string): RwaRiskMetrics {
    return {
      legalCompliance: {
        status: 'unknown',
        jurisdiction: 'unknown',
        structure: 'unknown',
        lastVerified: new Date().toISOString(),
      },
      counterpartyRisk: {
        issuerRating: 'N/A',
        defaultProbability: 0,
        solvencyScore: 0,
        lastUpdated: new Date().toISOString(),
      },
      oracleIntegrity: {
        consensusNodes: 0,
        dataReliability: 0,
        latency: 'unknown',
        lastUpdate: new Date().toISOString(),
      },
    };
  }

  /**
   * Get default liquidation parameters (fallback when calculations unavailable)
   */
  private getDefaultLiquidationParams(
    tokenInfo: TokenInfo,
    priceData: PriceData | null,
    accountData?: any
  ) {
    // Base default values
    let liquidationThreshold = 0.85;
    let maxLtv = 0.75;
    let volatility = 0.12;

    // Adjust based on account data if available
    if (accountData) {
      // Higher concentration = lower LTV
      if (accountData.concentration > 0.8) {
        maxLtv = 0.65;
        liquidationThreshold = 0.80;
      }
      // More holders = higher LTV
      if (accountData.totalHolders > 1000) {
        maxLtv = Math.min(0.85, maxLtv + 0.05);
      }
    }

    // Adjust based on price confidence
    if (priceData && priceData.confidence < 0.8) {
      volatility += 0.05; // Higher volatility for low confidence
    }

    return {
      liquidationThreshold,
      maxLtv,
      liquidationPenalty: 0.05,
      healthFactor: 1.25,
      volatility,
      correlation: {
        sol: 0.35,
        usdc: 0.95,
      },
    };
  }

  /**
   * Get token information only
   */
  async getTokenInfo(tokenMint: string): Promise<TokenInfo> {
    return this.tokenMetadata.getTokenInfo(tokenMint);
  }

  /**
   * Get token distribution data
   */
  async getTokenDistribution(tokenMint: string, tokenInfo?: TokenInfo) {
    return this.accountData.getTokenDistribution(tokenMint, tokenInfo);
  }

  /**
   * Clear caches
   */
  clearCache(tokenMint?: string): void {
    this.tokenMetadata.clearCache(tokenMint);
    this.accountData.clearCache(tokenMint);
  }
}

