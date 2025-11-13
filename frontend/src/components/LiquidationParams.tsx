import { useEffect, useState } from "react";
import { api, type LiquidationParams } from "../lib/api";
import { useWallet } from "@solana/wallet-adapter-react";

interface LiquidationParamsProps {
    tokenMint: string;
}

export function LiquidationParams({ tokenMint }: LiquidationParamsProps) {
    const { publicKey } = useWallet();
    const [data, setData] = useState<LiquidationParams | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        if (!tokenMint) return;

        setLoading(true);
        try {
            const params = await api.getLiquidationParams(
                tokenMint,
                publicKey?.toBase58()
            );
            setData(params);
        } catch (error) {
            console.error("Failed to fetch liquidation parameters:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tokenMint) {
            fetchData();
        }
    }, [tokenMint, publicKey]);

    if (!tokenMint) {
        return (
            <div className="text-center py-8 text-gray-400">
                Enter a token mint address to view liquidation parameters
            </div>
        );
    }

    if (loading) {
        return (
            <div className="text-center py-8 text-gray-400">
                Loading parameters...
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-8 text-red-400">
                Failed to load liquidation parameters
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 text-white">
                    Liquidation Parameters
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-gray-400 text-sm">
                            Liquidation Threshold
                        </div>
                        <div className="text-white text-2xl font-bold">
                            {(
                                data.parameters.liquidationThreshold * 100
                            ).toFixed(0)}
                            %
                        </div>
                    </div>
                    <div>
                        <div className="text-gray-400 text-sm">Max LTV</div>
                        <div className="text-white text-2xl font-bold">
                            {(data.parameters.maxLtv * 100).toFixed(0)}%
                        </div>
                    </div>
                    <div>
                        <div className="text-gray-400 text-sm">
                            Liquidation Penalty
                        </div>
                        <div className="text-white font-semibold">
                            {(data.parameters.liquidationPenalty * 100).toFixed(
                                1
                            )}
                            %
                        </div>
                    </div>
                    <div>
                        <div className="text-gray-400 text-sm">
                            Health Factor
                        </div>
                        <div className="text-pulsar-primary font-semibold text-xl">
                            {data.parameters.healthFactor.toFixed(2)}
                        </div>
                    </div>
                    <div>
                        <div className="text-gray-400 text-sm">Volatility</div>
                        <div className="text-white font-semibold">
                            {(data.parameters.volatility * 100).toFixed(1)}%
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 text-white">
                    Correlation Matrix
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-gray-400 text-sm">
                            SOL Correlation
                        </div>
                        <div className="text-white font-semibold">
                            {data.parameters.correlation.sol.toFixed(2)}
                        </div>
                    </div>
                    <div>
                        <div className="text-gray-400 text-sm">
                            USDC Correlation
                        </div>
                        <div className="text-white font-semibold">
                            {data.parameters.correlation.usdc.toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
