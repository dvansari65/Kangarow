import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';

const prisma = new PrismaClient();

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
  { params }: { params: Promise<any> }
) {
  const { id } = await params;
  
  const invoice = await prisma.invoice.findUnique({
    where: { id: id as string }
  });

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404, headers: corsHeaders() });
  }

  const label = "AUDD Payflow Merchant";
  const icon = "https://auddpayflow.com/icon.png"; // Replace with real deployed URL
  const message = `Payment for Invoice #${id} via AUDD Payflow`;

  return NextResponse.json({
    label,
    icon,
    message,
  }, { headers: corsHeaders() });
}

// POST request builds and returns the serialized transaction
export async function POST(
  request: Request,
  { params }: { params: Promise<any> }
) {
  const { id } = await params;
  let body;
  try {
    body = await request.json();
  } catch (e) {
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
  
  // Connect to RPC
  const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com");
  const { blockhash } = await connection.getLatestBlockhash('finalized');
  
  const transaction = new Transaction({
    recentBlockhash: blockhash,
    feePayer: payerPubkey,
  });
  
  // NOTE: Here you construct the real Anchor instruction.
  // const programId = new PublicKey("...");
  // const instruction = new TransactionInstruction({ ... });
  // transaction.add(instruction);

  const serializedTransaction = transaction.serialize({
    requireAllSignatures: false, // Wait for the wallet to sign it
  }).toString('base64');

  return NextResponse.json({
    transaction: serializedTransaction,
    message: `Confirm payment of ${(Number(invoice.amount) / 1_000_000)} AUDD for Invoice #${id}`,
  }, { headers: corsHeaders() });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept-Encoding',
  };
}
