<p align="center">
  <img src="./docs/payflow-logo-dark.svg" alt="AUDD Payflow" width="360" />
</p>

# AUDD Payflow

AUDD Payflow is a Solana-based invoicing flow for creating AUD-denominated invoices and settling them in AUDD on Solana devnet. The repo contains both the on-chain Anchor program and the Next.js app used to create invoices, collect payment, and track invoice status.

## What is in this repo

- `frontend/`
  Next.js 16 application for the landing page, protected dashboard, invoice creation, Solana Pay checkout, and the event indexer that syncs invoice status into Postgres.
- `backend/`
  Anchor program, Rust source, deployment config, and program tests for the invoice and escrow logic.

## Current scope

- Solana cluster support is currently `devnet` only.
- Payments are settled in AUDD token units with 6 decimals.
- The dashboard depends on PostgreSQL through Prisma.
- Invoice state in the database is updated by the frontend indexer process listening to on-chain program events.

## Product flow

1. Merchant signs in and creates an invoice from the dashboard.
2. The invoice is created on-chain through the Anchor program.
3. The app stores invoice ownership and metadata in Postgres.
4. The merchant shares either:
   - a browser payment page, or
   - a `solana:` deep link / QR flow for mobile wallets.
5. The payer approves the payment in a wallet.
6. The Anchor program moves funds directly to the merchant or into escrow.
7. The indexer listens for emitted events and updates invoice status in Postgres.

## Supported invoice states

- `Pending`
  Invoice created, awaiting payment.
- `Funded`
  Escrow invoice paid, funds held in the vault.
- `Paid`
  Direct invoice paid, or escrow invoice released.
- `Cancelled`
  Escrow refund completed.

## Key features implemented today

- Clerk-authenticated dashboard routes
- On-chain invoice creation through Anchor
- Direct settlement and escrow-backed settlement modes
- Solana Pay API endpoint for wallet-native payment requests
- Mobile wallet deep links and QR-based payment sharing
- Prisma-backed invoice persistence
- Event indexer for `InvoiceCreated`, `InvoicePaid`, `EscrowReleased`, and `EscrowRefunded`

## Repository structure

```text
auddPayment/
├─ backend/
│  ├─ programs/audd_payflow/src/   # Anchor program logic
│  ├─ tests/                       # Anchor program tests
│  └─ Anchor.toml
├─ frontend/
│  ├─ app/                         # Next.js app router
│  ├─ components/                  # UI, wallet, dashboard, share modal
│  ├─ app/api/                     # Invoice + Solana Pay API routes
│  ├─ lib/                         # Solana client helpers
│  ├─ prisma/                      # Prisma schema
│  ├─ scripts/indexer.ts           # Event listener -> DB sync
│  └─ docker-compose.yml           # Local Postgres for frontend
└─ README.md
```

## Frontend stack

- Next.js 16
- React 19
- Tailwind CSS 4
- Clerk
- Prisma + PostgreSQL
- `@coral-xyz/anchor`
- `@solana/web3.js`
- Solana Pay
- TanStack Query

## Smart contract behavior

The Anchor program in `backend/programs/audd_payflow/src/lib.rs` supports:

- `create_invoice`
- `pay_invoice`
- `release_escrow`
- `refund_escrow`

Important rules currently enforced on-chain:

- Direct invoices move funds to the merchant token account immediately.
- Escrow invoices move funds to a vault PDA and become `Funded`.
- Merchant-only release is blocked until the 7-day expiry has passed.
- Payer-only refund is blocked until the 30-day refund window has passed.
- A 0.3% protocol fee is transferred to the treasury token account on payment.

## Local development

### Prerequisites

- Node.js 20+
- npm
- Docker, if you want the local Postgres container
- Rust + Solana + Anchor, if you want to work on the on-chain program

### 1. Install dependencies

```bash
cd frontend
npm install
```

If you want to work on the program as well:

```bash
cd backend
npm install
```

### 2. Start PostgreSQL for the frontend

```bash
cd frontend
docker compose up -d
```

This starts a local Postgres 15 instance on `localhost:5432` using the values from `frontend/docker-compose.yml`.

### 3. Configure environment variables

Create `frontend/.env.local` with the variables your local setup needs.

Database:

- `DATABASE_URL`
- `DIRECT_URL`

Solana / Payflow:

- `NEXT_PUBLIC_PAYFLOW_PROGRAM_ID`
- `NEXT_PUBLIC_AUDD_MINT`
- `NEXT_PUBLIC_TREASURY_ATA`
- `NEXT_PUBLIC_AUDD_MINT_DEVNET` (optional override used by the Solana Pay route)
- `NEXT_PUBLIC_TREASURY_ATA_DEVNET` (optional override used by the Solana Pay route)
- `NEXT_PUBLIC_RPC_URL` or `NEXT_PUBLIC_SOLANA_RPC_DEVNET`
- `RPC_URL` for the indexer runtime

Authentication:

- standard Clerk Next.js environment variables required by `@clerk/nextjs`

### 4. Generate Prisma client and apply schema

```bash
cd frontend
npx prisma generate
npx prisma db push
```

### 5. Run the frontend

```bash
cd frontend
npm run dev
```

Open `http://localhost:3000`.

### 6. Run the indexer

In a second terminal:

```bash
cd frontend
npm run indexer
```

You can also run both together with:

```bash
cd frontend
npm run dev:all
```

## Frontend scripts

From `frontend/`:

- `npm run dev`
  Starts the Next.js development server.
- `npm run dev:all`
  Starts the app and the indexer together.
- `npm run build`
  Builds the production app.
- `npm run start`
  Starts the built app.
- `npm run lint`
  Runs ESLint.
- `npm run indexer`
  Runs the on-chain event listener that updates invoice records.

## Backend scripts

The `backend/package.json` currently includes:

- `npm run lint`
- `npm run lint:fix`

Program tests live in `backend/tests/audd_payflow.ts` and exercise:

- direct invoice payment
- escrow payment
- escrow release
- treasury fee transfer behavior

## Notes for operators

- If the indexer is not running, payments can still succeed on-chain while dashboard status in Postgres remains stale.
- The Solana Pay route checks the invoice status in the database before constructing the transaction payload.
- Protected dashboard routes are enforced with Clerk middleware in `frontend/proxy.ts`.

## Known limits in the current codebase

- Cluster selection is fixed to devnet.
- The indexer includes an event subscription path and only a minimal catch-up placeholder for missed historical events.
- Environment setup is manual; there is no committed `.env.example` yet.

## License

This repository does not currently declare a root project license. The backend package file is marked `ISC`, but you should choose a single repository-wide license before public distribution.
