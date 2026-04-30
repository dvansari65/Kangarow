import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

const COUNTER_BITS = BigInt(16);
const COUNTER_MASK = BigInt(0xffff);

export async function POST() {
  const randomSuffix = BigInt(randomBytes(2).readUInt16BE(0)) & COUNTER_MASK;
  const issuedAtMs = BigInt(Date.now());
  const invoiceId = ((issuedAtMs << COUNTER_BITS) | randomSuffix).toString();

  return NextResponse.json({ invoiceId });
}
