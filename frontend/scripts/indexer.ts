import * as anchor from "@coral-xyz/anchor";
import { PrismaClient } from "@prisma/client";
import { Connection, PublicKey } from "@solana/web3.js";
import idl from "../idl/audd_payflow.json";

const prisma = new PrismaClient();

// The Program ID from your deployment
const PROGRAM_ID = new PublicKey("9EzefVPa9QWgquqB3QNpUNxgdPPeJjgZkCuvGn8dndBa");

let connection: Connection;
let provider: anchor.AnchorProvider;
let program: anchor.Program;
let listenerCreatedId: number | null = null;
let listenerPaidId: number | null = null;
let listenerReleasedId: number | null = null;
let listenerRefundedId: number | null = null;

interface InvoiceCreatedEventPayload {
  id: anchor.BN
  merchant: PublicKey
  amount: anchor.BN
  useEscrow: boolean
}

interface InvoicePaidEventPayload {
  id: anchor.BN
  payer: PublicKey
  useEscrow: boolean
}

interface EscrowReleasedEventPayload {
  id: anchor.BN
}

interface EscrowRefundedEventPayload {
  id: anchor.BN
  payer: PublicKey
}

function setupConnection() {
  const rpcUrl = process.env.RPC_URL || process.env.NEXT_PUBLIC_RPC_URL || ""

  if (!rpcUrl) {
    throw new Error("RPC_URL is not configured for the indexer runtime.")
  }

  connection = new Connection(rpcUrl, "confirmed");
  provider = new anchor.AnchorProvider(connection, new anchor.Wallet(anchor.web3.Keypair.generate()), {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);
  program = new anchor.Program(idl as anchor.Idl, provider);
}

async function catchUpMissedEvents() {
  console.log("Fetching recent signatures to catch up on missed events...");
  try {
    const signatures = await connection.getSignaturesForAddress(PROGRAM_ID, { limit: 50 });
    // In a fully robust indexer, you would parse the transaction logs here.
    // For this demonstration, we acknowledge the catch-up phase.
    console.log(`Found ${signatures.length} recent transactions.`);
  } catch (err) {
    console.error("Error catching up on events:", err);
  }
}

async function subscribeToEvents() {
  if (listenerCreatedId !== null) program.removeEventListener(listenerCreatedId);
  if (listenerPaidId !== null) program.removeEventListener(listenerPaidId);
  if (listenerReleasedId !== null) program.removeEventListener(listenerReleasedId);
  if (listenerRefundedId !== null) program.removeEventListener(listenerRefundedId);

  console.log("Subscribing to smart contract events...");

  listenerCreatedId = program.addEventListener("InvoiceCreatedEvent", async (event: InvoiceCreatedEventPayload, slot: number) => {
    console.log(`\n[Slot ${slot}] 🔔 InvoiceCreatedEvent:`, event.id.toString());
    try {
      await prisma.invoice.upsert({
        where: { id: event.id.toString() },
        update: {}, // Don't override if already exists
        create: {
          id: event.id.toString(),
          merchant: event.merchant.toString(),
          amount: BigInt(event.amount.toString()),
          useEscrow: event.useEscrow,
          status: "Pending",
        },
      });
      console.log("✅ Saved Invoice to DB");
    } catch (err) {
      console.error("❌ Error saving InvoiceCreatedEvent:", err);
    }
  });

  listenerPaidId = program.addEventListener("InvoicePaidEvent", async (event: InvoicePaidEventPayload, slot: number) => {
    console.log(`\n[Slot ${slot}] 💰 InvoicePaidEvent:`, event.id.toString());
    try {
      await prisma.invoice.update({
        where: { id: event.id.toString() },
        data: {
          payer: event.payer.toString(),
          status: event.useEscrow ? "Funded" : "Paid",
        },
      });
      console.log("✅ Updated Invoice in DB");
    } catch (err) {
      console.error("❌ Error updating InvoicePaidEvent:", err);
    }
  });

  listenerReleasedId = program.addEventListener("EscrowReleasedEvent", async (event: EscrowReleasedEventPayload, slot: number) => {
    console.log(`\n[Slot ${slot}] ✅ EscrowReleasedEvent:`, event.id.toString());
    try {
      await prisma.invoice.update({
        where: { id: event.id.toString() },
        data: { status: "Paid" },
      });
      console.log("✅ Marked escrow invoice as Paid");
    } catch (err) {
      console.error("❌ Error updating EscrowReleasedEvent:", err);
    }
  });

  listenerRefundedId = program.addEventListener("EscrowRefundedEvent", async (event: EscrowRefundedEventPayload, slot: number) => {
    console.log(`\n[Slot ${slot}] ↩️ EscrowRefundedEvent:`, event.id.toString());
    try {
      await prisma.invoice.update({
        where: { id: event.id.toString() },
        data: {
          payer: event.payer.toString(),
          status: "Cancelled",
        },
      });
      console.log("✅ Marked escrow invoice as Cancelled");
    } catch (err) {
      console.error("❌ Error updating EscrowRefundedEvent:", err);
    }
  });
}

async function main() {
  console.log("🚀 Starting Indexer...");
  
  setupConnection();
  await catchUpMissedEvents();
  await subscribeToEvents();

  console.log("🎧 Listening for events. Press Ctrl+C to exit.");
  
  // Keep process alive
  setInterval(() => {}, 1000 * 60 * 60);
}

main().catch(console.error);
