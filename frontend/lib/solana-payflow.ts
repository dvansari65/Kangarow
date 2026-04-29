import type { Idl } from "@coral-xyz/anchor"
import { Connection, PublicKey, type Transaction, type VersionedTransaction } from "@solana/web3.js"

import idl from "@/idl/audd_payflow.json"

const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PAYFLOW_PROGRAM_ID ?? idl.address)

export interface PhantomProvider {
  isPhantom?: boolean
  publicKey: PublicKey | null
  connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: PublicKey }>
  disconnect: () => Promise<void>
  signTransaction: <T extends Transaction | VersionedTransaction>(transaction: T) => Promise<T>
  signAllTransactions?: <T extends Transaction | VersionedTransaction>(transactions: T[]) => Promise<T[]>
  on?: (event: string, handler: (payload: PublicKey | null) => void) => void
  off?: (event: string, handler: (payload: PublicKey | null) => void) => void
}

declare global {
  interface Window {
    solana?: PhantomProvider
  }
}

export interface PayflowConfig {
  rpcUrl: string
  mint: PublicKey
  treasuryAta: PublicKey
}

interface InvoiceActionInput {
  invoiceId: string
  merchant: string
}

interface CreateInvoiceInput {
  amount: number
  useEscrow: boolean
}

const getConfigValue = (value: string | undefined, label: string): string => {
  if (!value) {
    throw new Error(`${label} is not configured. Add it to your frontend environment before using live actions.`)
  }

  return value
}

const getPayflowConfig = (): PayflowConfig => ({
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL ?? "http://127.0.0.1:8899",
  mint: new PublicKey(getConfigValue(process.env.NEXT_PUBLIC_AUDD_MINT, "NEXT_PUBLIC_AUDD_MINT")),
  treasuryAta: new PublicKey(getConfigValue(process.env.NEXT_PUBLIC_TREASURY_ATA, "NEXT_PUBLIC_TREASURY_ATA")),
})

export const getPayflowConfigIssues = (): string[] => {
  const issues: string[] = []
  if (!process.env.NEXT_PUBLIC_AUDD_MINT) issues.push("AUDD mint address missing")
  if (!process.env.NEXT_PUBLIC_TREASURY_ATA) issues.push("Treasury token account missing")
  return issues
}

export const getInjectedWallet = (): PhantomProvider | null => {
  if (typeof window === "undefined") return null
  return window.solana?.isPhantom ? window.solana : null
}

export const deriveAssociatedTokenAddress = (owner: PublicKey, mint: PublicKey): PublicKey =>
  PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  )[0]

const deriveInvoicePda = (merchant: PublicKey, invoiceId: string): PublicKey => {
  const id = BigInt(invoiceId)
  const idBytes = new Uint8Array(8)
  new DataView(idBytes.buffer).setBigUint64(0, id, true)

  return PublicKey.findProgramAddressSync(
    [Buffer.from("invoice"), merchant.toBuffer(), Buffer.from(idBytes)],
    PROGRAM_ID,
  )[0]
}

const deriveVaultPda = (invoice: PublicKey): PublicKey =>
  PublicKey.findProgramAddressSync([Buffer.from("vault"), invoice.toBuffer()], PROGRAM_ID)[0]

const getConnection = (rpcUrl: string): Connection => new Connection(rpcUrl, "confirmed")

const createAnchorProgram = async (wallet: PhantomProvider) => {
  const anchor = await import("@coral-xyz/anchor")

  if (!wallet.publicKey) {
    throw new Error("Connect your wallet first.")
  }

  const { rpcUrl } = getPayflowConfig()
  const connection = getConnection(rpcUrl)

  const provider = new anchor.AnchorProvider(
    connection,
    {
      publicKey: wallet.publicKey,
      signTransaction: wallet.signTransaction.bind(wallet),
      signAllTransactions:
        wallet.signAllTransactions?.bind(wallet) ??
        (async (transactions) =>
          Promise.all(transactions.map((transaction) => wallet.signTransaction(transaction)))),
    },
    { commitment: "confirmed" },
  )

  return {
    anchor,
    program: new anchor.Program(idl as Idl, provider),
  }
}

const toMinorUnits = (amount: number): bigint => {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Enter a valid AUD amount greater than zero.")
  }

  return BigInt(Math.round(amount * 1_000_000))
}

const parseAnchorError = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.message.includes("User rejected")) return "The wallet request was cancelled."
    if (error.message.includes("NotExpiredYet")) return "The merchant cannot release escrow before the 7-day expiry window."
    if (error.message.includes("RefundNotAvailableYet")) return "Refund is not available yet for the connected payer wallet."
    if (error.message.includes("Unauthorized")) return "This wallet is not authorized to run that action on this invoice."
    if (error.message.includes("InvalidStatus")) return "This action is not allowed in the invoice's current state."
    return error.message
  }

  return "The transaction could not be completed."
}

export const createInvoice = async (wallet: PhantomProvider, input: CreateInvoiceInput): Promise<string> => {
  try {
    const { mint } = getPayflowConfig()
    const { anchor, program } = await createAnchorProgram(wallet)
    const invoiceId = Date.now().toString()
    const merchant = wallet.publicKey

    if (!merchant) {
      throw new Error("Connect your merchant wallet first.")
    }

    const invoice = deriveInvoicePda(merchant, invoiceId)
    const vault = deriveVaultPda(invoice)

    await program.methods
      .createInvoice(new anchor.BN(invoiceId), new anchor.BN(toMinorUnits(input.amount).toString()), input.useEscrow)
      .accounts({
        merchant,
        invoice,
        mint,
        vault,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc()

    return invoiceId
  } catch (error) {
    throw new Error(parseAnchorError(error))
  }
}

export const payInvoice = async (wallet: PhantomProvider, input: InvoiceActionInput): Promise<void> => {
  try {
    const { mint, treasuryAta } = getPayflowConfig()
    const { program } = await createAnchorProgram(wallet)
    const payer = wallet.publicKey

    if (!payer) {
      throw new Error("Connect your payer wallet first.")
    }

    const merchant = new PublicKey(input.merchant)
    const invoice = deriveInvoicePda(merchant, input.invoiceId)
    const vault = deriveVaultPda(invoice)
    const payerAta = deriveAssociatedTokenAddress(payer, mint)
    const merchantAta = deriveAssociatedTokenAddress(merchant, mint)

    await program.methods
      .payInvoice()
      .accounts({
        payer,
        invoice,
        payerAta,
        merchantAta,
        vault,
        treasuryAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc()
  } catch (error) {
    throw new Error(parseAnchorError(error))
  }
}

export const releaseEscrow = async (wallet: PhantomProvider, input: InvoiceActionInput): Promise<void> => {
  try {
    const { mint } = getPayflowConfig()
    const { program } = await createAnchorProgram(wallet)
    const authority = wallet.publicKey

    if (!authority) {
      throw new Error("Connect an authorized wallet first.")
    }

    const merchant = new PublicKey(input.merchant)
    const invoice = deriveInvoicePda(merchant, input.invoiceId)
    const vault = deriveVaultPda(invoice)
    const merchantAta = deriveAssociatedTokenAddress(merchant, mint)

    await program.methods
      .releaseEscrow()
      .accounts({
        authority,
        invoice,
        merchantAta,
        vault,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc()
  } catch (error) {
    throw new Error(parseAnchorError(error))
  }
}

export const refundEscrow = async (wallet: PhantomProvider, input: InvoiceActionInput): Promise<void> => {
  try {
    const { mint } = getPayflowConfig()
    const { program } = await createAnchorProgram(wallet)
    const authority = wallet.publicKey

    if (!authority) {
      throw new Error("Connect an authorized wallet first.")
    }

    const merchant = new PublicKey(input.merchant)
    const invoice = deriveInvoicePda(merchant, input.invoiceId)
    const vault = deriveVaultPda(invoice)
    const payerAta = deriveAssociatedTokenAddress(authority, mint)

    await program.methods
      .refundEscrow()
      .accounts({
        authority,
        invoice,
        payerAta,
        vault,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc()
  } catch (error) {
    throw new Error(parseAnchorError(error))
  }
}
