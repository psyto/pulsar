import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface PaymentQuote {
    endpoint: string;
    price: {
        amount: string;
        currency: string;
        decimals: number;
    };
    recipient: string;
    network: string;
    programId: string;
}

export interface RwaRiskData {
    tokenMint: string;
    timestamp: string;
    metrics: {
        legalCompliance: {
            status: string;
            jurisdiction: string;
            structure: string;
            lastVerified: string;
        };
        counterpartyRisk: {
            issuerRating: string;
            defaultProbability: number;
            solvencyScore: number;
            lastUpdated: string;
        };
        oracleIntegrity: {
            consensusNodes: number;
            dataReliability: number;
            latency: string;
            lastUpdate: string;
        };
    };
    requestedBy: string;
}

export interface LiquidationParams {
    tokenMint: string;
    timestamp: string;
    parameters: {
        liquidationThreshold: number;
        maxLtv: number;
        liquidationPenalty: number;
        healthFactor: number;
        volatility: number;
        correlation: {
            sol: number;
            usdc: number;
        };
    };
    requestedBy: string;
}

// Mock API client - works with mock data from backend
export const api = {
    async getPaymentQuote(
        endpoint: string = "rwa-risk"
    ): Promise<PaymentQuote> {
        try {
            const response = await axios.get(
                `${API_URL}/api/v1/payment/quote`,
                {
                    params: { endpoint },
                }
            );
            return response.data;
        } catch (error) {
            // Fallback to mock data if API is not available
            console.warn("API not available, using mock data");
            return {
                endpoint,
                price: {
                    amount: endpoint === "rwa-risk" ? "0.05" : "0.10",
                    currency: "USDC",
                    decimals: 6,
                },
                recipient: "MockTreasury1111111111111111111111111",
                network: "solana",
                programId: "MockProgram1111111111111111111111111",
            };
        }
    },

    async getRwaRiskData(
        tokenMint: string,
        mockWallet?: string
    ): Promise<RwaRiskData> {
        try {
            // Try real API first (will work with mock data from backend)
            // Use demo mode for frontend (no auth required)
            const response = await axios.get(
                `${API_URL}/api/v1/data/rwa-risk/${tokenMint}`,
                {
                    headers: {
                        "x-demo-mode": "true",
                    },
                }
            );
            return response.data;
        } catch (error) {
            // Fallback mock data
            console.warn("API not available, using mock data");
            return {
                tokenMint,
                timestamp: new Date().toISOString(),
                metrics: {
                    legalCompliance: {
                        status: "compliant",
                        jurisdiction: "US",
                        structure: "tokenized_fund",
                        lastVerified: "2024-01-15T00:00:00Z",
                    },
                    counterpartyRisk: {
                        issuerRating: "A",
                        defaultProbability: 0.02,
                        solvencyScore: 0.95,
                        lastUpdated: "2024-01-15T00:00:00Z",
                    },
                    oracleIntegrity: {
                        consensusNodes: 5,
                        dataReliability: 0.99,
                        latency: "<10ms",
                        lastUpdate: new Date().toISOString(),
                    },
                },
                requestedBy: mockWallet || "demo-wallet",
            };
        }
    },

    async getLiquidationParams(
        tokenMint: string,
        mockWallet?: string
    ): Promise<LiquidationParams> {
        try {
            // Use demo mode for frontend (no auth required)
            const response = await axios.get(
                `${API_URL}/api/v1/data/liquidation-params/${tokenMint}`,
                {
                    headers: {
                        "x-demo-mode": "true",
                    },
                }
            );
            return response.data;
        } catch (error) {
            // Fallback mock data
            console.warn("API not available, using mock data");
            return {
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
                requestedBy: mockWallet || "demo-wallet",
            };
        }
    },
};
