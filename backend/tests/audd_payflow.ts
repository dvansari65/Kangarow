import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AuddPayflow } from "../target/types/audd_payflow";
import {
  createMint,
  createAccount,
  mintTo,
  getAccount,
  getAssociatedTokenAddress,
  createAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { expect } from "chai";

describe("audd_payflow", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AuddPayflow as Program<AuddPayflow>;

  let mint: anchor.web3.PublicKey;
  let payer = provider.wallet as anchor.Wallet;
  let payerKp = payer.payer
  let merchantKp = anchor.web3.Keypair.generate();
  let treasuryKp = anchor.web3.Keypair.generate();
  
  let payerAta: anchor.web3.PublicKey;
  let merchantAta: anchor.web3.PublicKey;
  let treasuryAta: anchor.web3.PublicKey;

  before(async () => {
    // Airdrop
    const sig1 = await provider.connection.requestAirdrop(payerKp.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(sig1);

    const sig2 = await provider.connection.requestAirdrop(merchantKp.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(sig2);

    // Create Mint
    mint = await createMint(
      provider.connection,
      payerKp,
      payerKp.publicKey,
      null,
      6
    );
    console.log("mint:",mint.toString())
    // Create ATAs
    payerAta = await createAssociatedTokenAccount(
      provider.connection,
      payerKp,
      mint,
      payerKp.publicKey
    );

    merchantAta = await createAssociatedTokenAccount(
      provider.connection,
      merchantKp,
      mint,
      merchantKp.publicKey
    );

    treasuryAta = await createAssociatedTokenAccount(
      provider.connection,
      payerKp, // Payer can fund the ATA creation
      mint,
      treasuryKp.publicKey
    );
    console.log("TREASURY_ATA:  ", treasuryAta.toString());
    // Mint to Payer
    await mintTo(
      provider.connection,
      payerKp,
      mint,
      payerAta,
      payerKp.publicKey,
      1000000000 // 1000 AUDD
    );
  });

  it("Creates a Direct Invoice and Pays it", async () => {
    const invoiceId = new anchor.BN(1);
    const amount = new anchor.BN(100000000); // 100 AUDD

    const [invoicePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("invoice"), merchantKp.publicKey.toBuffer(), invoiceId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const [vaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), invoicePda.toBuffer()],
      program.programId
    );

    // Create
    await program.methods
      .createInvoice(invoiceId, amount, false)
      .accounts({
        merchant: merchantKp.publicKey,
        invoice: invoicePda,
        mint,
        vault: vaultPda,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      } as any)
      .signers([merchantKp])
      .rpc();

    let invoice = await program.account.invoice.fetch(invoicePda);
    expect(invoice.status.pending).to.not.be.undefined;

    // Pay
    await program.methods
      .payInvoice()
      .accounts({
        payer: payerKp.publicKey,
        invoice: invoicePda,
        payerAta,
        merchantAta,
        vault: vaultPda,
        treasuryAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      } as any)
      .signers([payerKp])
      .rpc();

    invoice = await program.account.invoice.fetch(invoicePda);
    expect(invoice.status.paid).to.not.be.undefined;

    const merchantAtaAcc = await getAccount(provider.connection, merchantAta);
    expect(merchantAtaAcc.amount.toString()).to.equal("100000000");

    const treasuryAtaAcc = await getAccount(provider.connection, treasuryAta);
    // 100 * 3 / 1000 = 0.3 => 300,000 units
    expect(treasuryAtaAcc.amount.toString()).to.equal("300000");
  });

  it("Creates an Escrow Invoice, Pays it, and Releases it", async () => {
    const invoiceId = new anchor.BN(2);
    const amount = new anchor.BN(200000000); // 200 AUDD

    const [invoicePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("invoice"), merchantKp.publicKey.toBuffer(), invoiceId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const [vaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), invoicePda.toBuffer()],
      program.programId
    );

    // Create
    await program.methods
      .createInvoice(invoiceId, amount, true)
      .accounts({
        merchant: merchantKp.publicKey,
        invoice: invoicePda,
        mint,
        vault: vaultPda,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      } as any)
      .signers([merchantKp])
      .rpc();

    // Pay
    await program.methods
      .payInvoice()
      .accounts({
        payer: payerKp.publicKey,
        invoice: invoicePda,
        payerAta,
        merchantAta,
        vault: vaultPda,
        treasuryAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      } as any)
      .signers([payerKp])
      .rpc();

    let invoice = await program.account.invoice.fetch(invoicePda);
    expect(invoice.status.funded).to.not.be.undefined;

    const vaultAcc = await getAccount(provider.connection, vaultPda);
    expect(vaultAcc.amount.toString()).to.equal("200000000");

    const treasuryAtaAcc = await getAccount(provider.connection, treasuryAta);
    // Previous 300,000 + (200 * 3 / 1000) => 300k + 600k = 900,000
    expect(treasuryAtaAcc.amount.toString()).to.equal("900000");

    // Release
    await program.methods
      .releaseEscrow()
      .accounts({
        authority: payerKp.publicKey,
        invoice: invoicePda,
        merchantAta,
        vault: vaultPda,
        tokenProgram: TOKEN_PROGRAM_ID,
      } as any)
      .signers([payerKp])
      .rpc();

    invoice = await program.account.invoice.fetch(invoicePda);
    expect(invoice.status.paid).to.not.be.undefined;

    const merchantAtaAccAfter = await getAccount(provider.connection, merchantAta);
    expect(merchantAtaAccAfter.amount.toString()).to.equal("300000000"); // 100 from before + 200 now
  });
});
