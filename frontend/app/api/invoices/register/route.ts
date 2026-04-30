import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

type RegisterInvoiceRequest = {
  id?: string;
  merchant?: string;
  amount?: string;
  useEscrow?: boolean;
};

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: RegisterInvoiceRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { id, merchant, amount, useEscrow } = body;

  if (!id || !merchant || !amount || typeof useEscrow !== 'boolean') {
    return NextResponse.json({ error: 'Missing invoice fields' }, { status: 400 });
  }

  await prisma.invoice.upsert({
    where: { id },
    update: {
      ownerId: userId,
      merchant,
      amount: BigInt(amount),
      useEscrow,
    },
    create: {
      id,
      ownerId: userId,
      merchant,
      amount: BigInt(amount),
      useEscrow,
      status: 'Pending',
    },
  });

  return NextResponse.json({ ok: true });
}

