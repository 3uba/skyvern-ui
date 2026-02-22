import { auth } from '@/lib/auth/auth';
import { toNextJsHandler } from 'better-auth/next-js';
import { NextRequest, NextResponse } from 'next/server';

const betterAuthHandler = toNextJsHandler(auth);

export const GET = betterAuthHandler.GET;

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  if (url.pathname.includes('/sign-up')) {
    return NextResponse.json(
      { error: 'Public registration is disabled' },
      { status: 403 },
    );
  }
  return betterAuthHandler.POST(request);
}
