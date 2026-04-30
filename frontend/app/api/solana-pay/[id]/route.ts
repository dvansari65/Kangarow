import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { getDefaultCluster, isSolanaCluster, resolveRpcUrl } from '@/lib/solana-cluster';
import idl from '@/idl/audd_payflow.json';

const prisma = new PrismaClient();
type RouteParams = Promise<{ id: string }>;
type SolanaPayRequestBody = { account?: string };
const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PAYFLOW_PROGRAM_ID ?? idl.address);
const PAY_INVOICE_DISCRIMINATOR = Buffer.from(
  idl.instructions.find((instruction) => instruction.name === 'pay_invoice')?.discriminator ?? [],
);

// OPTIONS request is required for Solana Pay CORS compliance
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept-Encoding',
    },
  });
}

// GET request returns the metadata about the payment request to the wallet
export async function GET(
  request: Request,
  { params }: { params: RouteParams }
) {
  const { id } = await params;
  const { origin, searchParams } = new URL(request.url);
  const requestedCluster = searchParams.get('cluster');
  const cluster = isSolanaCluster(requestedCluster) ? requestedCluster : getDefaultCluster();
  
  const invoice = await prisma.invoice.findUnique({
    where: { id: id as string }
  });

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404, headers: corsHeaders() });
  }

  const label = "AUDD Payflow Merchant";
  const icon = `${origin}/favicon.ico`;
  const message = `Payment for Invoice #${id} via AUDD Payflow`;

  return NextResponse.json({
    label,
    icon,
    message,
    cluster,
    amount: (Number(invoice.amount) / 1_000_000).toFixed(2),
  }, { headers: corsHeaders() });
}

// POST request builds and returns the serialized transaction
export async function POST(
  request: Request,
  { params }: { params: RouteParams }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const requestedCluster = searchParams.get('cluster');
  const cluster = isSolanaCluster(requestedCluster) ? requestedCluster : getDefaultCluster();
  let body: SolanaPayRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: corsHeaders() });
  }

  const payerPubkeyStr = body.account;

  if (!payerPubkeyStr) {
    return NextResponse.json({ error: 'Missing account' }, { status: 400, headers: corsHeaders() });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: id as string }
  });

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404, headers: corsHeaders() });
  }

  const payerPubkey = new PublicKey(payerPubkeyStr);
  const merchantPubkey = new PublicKey(invoice.merchant);

  if (invoice.status !== 'Pending') {
    return NextResponse.json({ error: `Invoice is already ${invoice.status.toLowerCase()}` }, { status: 409, headers: corsHeaders() });
  }

  if (!PAY_INVOICE_DISCRIMINATOR.length) {
    return NextResponse.json({ error: 'Program instruction metadata is unavailable' }, { status: 500, headers: corsHeaders() });
  }

  const treasuryAtaRaw = getTreasuryAtaForCluster(cluster);
  const auddMintRaw = getAuddMintForCluster(cluster);

  if (!treasuryAtaRaw || !auddMintRaw) {
    return NextResponse.json({ error: 'AUDD mint or treasury token account is not configured' }, { status: 500, headers: corsHeaders() });
  }

  const treasuryAta = new PublicKey(treasuryAtaRaw);
  const auddMint = new PublicKey(auddMintRaw);
  const invoicePda = deriveInvoicePda(merchantPubkey, id);
  const vaultPda = deriveVaultPda(invoicePda);
  const payerAta = deriveAssociatedTokenAddress(payerPubkey, auddMint);
  const merchantAta = deriveAssociatedTokenAddress(merchantPubkey, auddMint);
  
  // Connect to RPC
  const connection = new Connection(resolveRpcUrl(cluster));
  const { blockhash } = await connection.getLatestBlockhash('finalized');
  
  const transaction = new Transaction({
    recentBlockhash: blockhash,
    feePayer: payerPubkey,
  });
  
  transaction.add(
    new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: payerPubkey, isSigner: true, isWritable: true },
        { pubkey: invoicePda, isSigner: false, isWritable: true },
        { pubkey: payerAta, isSigner: false, isWritable: true },
        { pubkey: merchantAta, isSigner: false, isWritable: true },
        { pubkey: vaultPda, isSigner: false, isWritable: true },
        { pubkey: treasuryAta, isSigner: false, isWritable: true },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      data: PAY_INVOICE_DISCRIMINATOR,
    }),
  );

  const serializedTransaction = transaction.serialize({
    requireAllSignatures: false, // Wait for the wallet to sign it
  }).toString('base64');

  return NextResponse.json({
    transaction: serializedTransaction,
    message: `Confirm payment of ${(Number(invoice.amount) / 1_000_000)} AUDD for Invoice #${id}`,
    cluster,
  }, { headers: corsHeaders() });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept-Encoding',
  };
}

function deriveAssociatedTokenAddress(owner: PublicKey, mint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  )[0];
}

function deriveInvoicePda(merchant: PublicKey, invoiceId: string): PublicKey {
  const id = BigInt(invoiceId);
  const idBytes = new Uint8Array(8);
  new DataView(idBytes.buffer).setBigUint64(0, id, true);

  return PublicKey.findProgramAddressSync(
    [Buffer.from("invoice"), merchant.toBuffer(), Buffer.from(idBytes)],
    PROGRAM_ID,
  )[0];
}

function deriveVaultPda(invoice: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), invoice.toBuffer()],
    PROGRAM_ID,
  )[0];
}

function getAuddMintForCluster(cluster: string): string | undefined {
  if (cluster === 'localnet') {
    return process.env.NEXT_PUBLIC_AUDD_MINT_LOCALNET ?? process.env.NEXT_PUBLIC_AUDD_MINT;
  }

  return process.env.NEXT_PUBLIC_AUDD_MINT_DEVNET ?? process.env.NEXT_PUBLIC_AUDD_MINT;
}

function getTreasuryAtaForCluster(cluster: string): string | undefined {
  if (cluster === 'localnet') {
    return process.env.NEXT_PUBLIC_TREASURY_ATA_LOCALNET ?? process.env.NEXT_PUBLIC_TREASURY_ATA;
  }

  return process.env.NEXT_PUBLIC_TREASURY_ATA_DEVNET ?? process.env.NEXT_PUBLIC_TREASURY_ATA;
}
