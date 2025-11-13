import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { PulsarPayment } from '../target/types/pulsar_payment';
import { 
  TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddress,
  createMint,
  createAccount,
  mintTo,
} from '@solana/spl-token';
import { 
  PublicKey, 
  Keypair, 
  SystemProgram,
  LAMPORTS_PER_SOL 
} from '@solana/web3.js';

describe('pulsar_payment', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.PulsarPayment as Program<PulsarPayment>;
  
  const authority = Keypair.generate();
  const user = Keypair.generate();
  let gateway: PublicKey;
  let usdcMint: PublicKey;
  let treasuryTokenAccount: PublicKey;
  let userTokenAccount: PublicKey;

  beforeAll(async () => {
    // Airdrop SOL to accounts
    await provider.connection.requestAirdrop(
      authority.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.requestAirdrop(
      user.publicKey,
      2 * LAMPORTS_PER_SOL
    );

    // Create USDC mint (mock)
    usdcMint = await createMint(
      provider.connection,
      authority,
      authority.publicKey,
      null,
      6
    );

    // Derive gateway PDA
    [gateway] = PublicKey.findProgramAddressSync(
      [Buffer.from('gateway')],
      program.programId
    );

    // Create treasury token account
    treasuryTokenAccount = await getAssociatedTokenAddress(
      usdcMint,
      gateway,
      true
    );

    // Create user token account
    userTokenAccount = await getAssociatedTokenAddress(
      usdcMint,
      user.publicKey
    );
    await createAccount(
      provider.connection,
      user,
      usdcMint,
      user.publicKey
    );

    // Mint USDC to user
    await mintTo(
      provider.connection,
      authority,
      usdcMint,
      userTokenAccount,
      authority,
      1000 * 1e6 // 1000 USDC
    );
  });

  it('Initializes the gateway', async () => {
    const fee = new anchor.BN(1000000); // 1 USDC (6 decimals)

    const tx = await program.methods
      .initialize(fee)
      .accounts({
        gateway,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    const gatewayAccount = await program.account.gateway.fetch(gateway);
    expect(gatewayAccount.authority.toString()).toBe(authority.publicKey.toString());
    expect(gatewayAccount.fee.toNumber()).toBe(1000000);
  });

  it('Processes a payment', async () => {
    const amount = new anchor.BN(10000000); // 10 USDC
    const nonce = new anchor.BN(12345);

    const tx = await program.methods
      .processPayment(amount, nonce)
      .accounts({
        gateway,
        user: user.publicKey,
        userTokenAccount,
        treasuryTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([user])
      .rpc();

    // Verify payment was processed
    // TODO: Check treasury balance increased
  });
});

