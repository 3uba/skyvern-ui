import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { user, organizationSettings } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Guard: reject if any user already exists
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(user);
  if (Number(countResult[0].count) > 0) {
    return NextResponse.json(
      { error: 'Setup has already been completed' },
      { status: 403 },
    );
  }

  const body = await request.json();
  const { name, email, password, skyvernApiKey, skyvernApiUrl } = body;

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: 'Name, email, and password are required' },
      { status: 400 },
    );
  }

  // Create the user via Better Auth's internal server-side API (bypasses HTTP block)
  const result = await auth.api.signUpEmail({
    body: { name, email, password },
  });

  if (!result?.user) {
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 },
    );
  }

  // Promote to admin
  await db
    .update(user)
    .set({ role: 'admin' })
    .where(eq(user.id, result.user.id));

  // Save Skyvern API config if provided
  if (skyvernApiKey) {
    await db.insert(organizationSettings).values({
      id: nanoid(),
      skyvernApiKey,
      skyvernApiUrl: skyvernApiUrl || 'http://skyvern:8000',
    });
  }

  return NextResponse.json({ success: true, user: result.user });
}
