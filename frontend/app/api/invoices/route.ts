import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { INVOICE_STATUS_ORDER, type InvoiceApiError, type InvoiceRecord, type InvoiceStatus } from '@/lib/invoices';

const prisma = new PrismaClient();

const isInvoiceStatus = (value: string): value is InvoiceStatus =>
  INVOICE_STATUS_ORDER.includes(value as InvoiceStatus);

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      const payload: InvoiceApiError = { error: "Unauthorized" };
      return NextResponse.json(payload, { status: 401 });
    }

    const invoices = await prisma.invoice.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
    });

    const serializedInvoices: InvoiceRecord[] = invoices.map((invoice) => ({
      ...invoice,
      amount: invoice.amount.toString(),
      payer: invoice.payer ?? null,
      status: isInvoiceStatus(invoice.status) ? invoice.status : "Pending",
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString(),
    }));

    return NextResponse.json(serializedInvoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    const payload: InvoiceApiError = { error: "Failed to fetch invoices" };
    return NextResponse.json(payload, { status: 500 });
  }
}
