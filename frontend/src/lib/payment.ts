import {
    Connection,
    PublicKey,
    Transaction,
    sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
    getAssociatedTokenAddress,
    createTransferInstruction,
    TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

/**
 * Payment service for handling on-chain payments
 */
export class PaymentService {
    private connection: Connection;
    private usdcMint: PublicKey;

    constructor(connection: Connection, _programId: string, usdcMint?: string) {
        this.connection = connection;
        // Default to USDC on devnet/mainnet
        this.usdcMint = new PublicKey(
            usdcMint ||
                "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" // USDC
        );
    }

    /**
     * Generate a payment transaction
     */
    async createPaymentTransaction(
        wallet: PublicKey,
        amount: number,
        _nonce: number,
        treasuryWallet: string
    ): Promise<Transaction> {
        const transaction = new Transaction();

        // Get user's USDC token account
        const userTokenAccount = await getAssociatedTokenAddress(
            this.usdcMint,
            wallet
        );

        // Get treasury USDC token account
        const treasuryPubkey = new PublicKey(treasuryWallet);
        const treasuryTokenAccount = await getAssociatedTokenAddress(
            this.usdcMint,
            treasuryPubkey
        );

        // Convert amount to lamports (USDC has 6 decimals)
        const amountLamports = Math.floor(amount * Math.pow(10, 6));

        // Create transfer instruction
        const transferInstruction = createTransferInstruction(
            userTokenAccount,
            treasuryTokenAccount,
            wallet,
            amountLamports,
            [],
            TOKEN_PROGRAM_ID
        );

        transaction.add(transferInstruction);

        // Add program instruction for payment processing
        // In a real implementation, we'd use the Anchor program
        // For now, we'll use a direct transfer and track via transaction signature

        return transaction;
    }


    /**
     * Submit payment transaction to Solana network
     */
    async submitPayment(
        transaction: Transaction,
        signTransaction: (tx: Transaction) => Promise<Transaction>
    ): Promise<string> {
        // Sign transaction
        const signedTransaction = await signTransaction(transaction);

        // Send and confirm transaction
        const signature = await sendAndConfirmTransaction(
            this.connection,
            signedTransaction,
            [],
            {
                commitment: "confirmed",
                skipPreflight: false,
            }
        );

        return signature;
    }

    /**
     * Verify payment transaction
     */
    async verifyPayment(signature: string): Promise<{
        verified: boolean;
        error?: string;
    }> {
        try {
            const tx = await this.connection.getTransaction(signature, {
                commitment: "confirmed",
            });

            if (!tx) {
                return {
                    verified: false,
                    error: "Transaction not found",
                };
            }

            if (tx.meta?.err) {
                return {
                    verified: false,
                    error: `Transaction failed: ${JSON.stringify(tx.meta.err)}`,
                };
            }

            return { verified: true };
        } catch (error) {
            return {
                verified: false,
                error:
                    error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    /**
     * Generate a unique nonce for payment
     */
    generateNonce(): number {
        // Generate nonce from timestamp and random number
        return Date.now() + Math.floor(Math.random() * 1000);
    }
}

/**
 * Create payment service instance
 */
export function createPaymentService(connection: Connection): PaymentService {
    const programId =
        import.meta.env.VITE_PAYMENT_PROGRAM_ID ||
        "84zwY58ivSmpGY8gsenAc2c4XpwBUyh1thF9XXx3LhfD";
    return new PaymentService(connection, programId);
}

