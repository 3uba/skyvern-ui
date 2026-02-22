import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(user);
  const needsSetup = Number(result[0].count) === 0;
  return NextResponse.json({ needsSetup });
}
