import { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { api, type PaymentQuote } from "../lib/api";
import { createPaymentService } from "../lib/payment";

interface PaymentQuoteProps {
    endpoint: string;
    onPaymentComplete?: (signature: string, nonce: number, amount: number) => void;
}

export function PaymentQuote({ endpoint, onPaymentComplete }: PaymentQuoteProps) {
    const { publicKey, signTransaction, connected } = useWallet();
    const { connection } = useConnection();
    const [quote, setQuote] = useState<PaymentQuote | null>(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        api.getPaymentQuote(endpoint)
            .then((data) => {
                setQuote(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [endpoint]);

    const handlePayment = async () => {
        if (!quote || !publicKey || !signTransaction || !connected) {
            setError("Please connect your wallet");
            return;
        }

        setPaying(true);
        setError(null);
        setPaymentStatus("Creating payment transaction...");

        try {
            const paymentService = createPaymentService(connection);
            const amount = parseFloat(quote.price.amount);
            const nonce = paymentService.generateNonce();

            // Create transaction
            const transaction = await paymentService.createPaymentTransaction(
                publicKey,
                amount,
                nonce,
                quote.recipient
            );

            setPaymentStatus("Please approve the transaction in your wallet...");

            // Sign and submit
            const signature = await paymentService.submitPayment(
                transaction,
                signTransaction
            );

            setPaymentStatus("Verifying payment...");

            // Verify payment
            const verification = await api.verifyPayment(
                signature,
                nonce,
                amount
            );

            if (!verification.verified) {
                throw new Error(verification.error || "Payment verification failed");
            }

            // Set payment state
            api.setPaymentState({
                signature,
                nonce,
                amount,
                timestamp: Date.now(),
            });

            setPaymentStatus("Payment successful!");
            
            // Call callback if provided
            if (onPaymentComplete) {
                onPaymentComplete(signature, nonce, amount);
            }

            // Clear status after 3 seconds
            setTimeout(() => {
                setPaymentStatus(null);
            }, 3000);
        } catch (err: any) {
            setError(err.message || "Payment failed");
            setPaymentStatus(null);
        } finally {
            setPaying(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="text-gray-400">Loading quote...</div>
            </div>
        );
    }

    if (!quote) {
        return (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="text-red-400">Failed to load quote</div>
            </div>
        );
    }

    const hasPayment = api.getPaymentState()?.signature;

    return (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-white">
                Payment Quote
            </h3>
            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-400">Endpoint:</span>
                        <span className="text-white font-mono text-sm">
                            {quote.endpoint}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Price:</span>
                        <span className="text-pulsar-primary font-bold">
                            {quote.price.amount} {quote.price.currency}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Network:</span>
                        <span className="text-white">{quote.network}</span>
                    </div>
                </div>

                {hasPayment ? (
                    <div className="bg-green-900/20 border border-green-700 rounded p-3">
                        <div className="text-green-400 text-sm">
                            ✓ Payment verified
                        </div>
                        <div className="text-gray-400 text-xs mt-1 font-mono">
                            {api.getPaymentState()?.signature?.slice(0, 8)}...
                        </div>
                    </div>
                ) : (
                    <>
                        {paymentStatus && (
                            <div className="bg-blue-900/20 border border-blue-700 rounded p-3">
                                <div className="text-blue-400 text-sm">
                                    {paymentStatus}
                                </div>
                            </div>
                        )}
                        {error && (
                            <div className="bg-red-900/20 border border-red-700 rounded p-3">
                                <div className="text-red-400 text-sm">{error}</div>
                            </div>
                        )}
                        <button
                            onClick={handlePayment}
                            disabled={!connected || paying}
                            className="w-full bg-pulsar-primary text-black font-semibold py-2 px-4 rounded hover:bg-pulsar-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {paying
                                ? "Processing..."
                                : connected
                                ? `Pay ${quote.price.amount} ${quote.price.currency}`
                                : "Connect Wallet to Pay"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
