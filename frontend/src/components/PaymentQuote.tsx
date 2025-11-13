import { useEffect, useState } from "react";
import { api, type PaymentQuote } from "../lib/api";

interface PaymentQuoteProps {
    endpoint: string;
}

export function PaymentQuote({ endpoint }: PaymentQuoteProps) {
    const [quote, setQuote] = useState<PaymentQuote | null>(null);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-white">
                Payment Quote
            </h3>
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
        </div>
    );
}
