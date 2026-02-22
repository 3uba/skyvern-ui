import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { getSkyvernConfig } from '@/lib/api/skyvern-proxy';
import { logAuditEvent } from '@/lib/audit/log';

function buildSkyvernUrl(
  skyvernPath: string,
  apiUrl: string,
  searchParams: URLSearchParams,
  prefix: string,
): string {
  const url = new URL(`${prefix}${skyvernPath}`, apiUrl);
  searchParams.forEach((value, key) => url.searchParams.set(key, value));
  return url.toString();
}

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;

  // 1. Auth check
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Config
  let config;
  try {
    config = await getSkyvernConfig();
  } catch {
    return NextResponse.json(
      { error: 'Skyvern API key not configured. Ask admin to set it in Settings.' },
      { status: 503 },
    );
  }

  // 3. Build URL & forward (try /v1/ first, fall back to /api/v1/ on 404)
  const skyvernPath = path.join('/');
  const body = !['GET', 'HEAD'].includes(request.method) ? await request.text() : undefined;
  const headers = {
    'Content-Type': request.headers.get('content-type') || 'application/json',
    'x-api-key': config.apiKey,
  };

  let skyvernUrl = buildSkyvernUrl(skyvernPath, config.apiUrl, request.nextUrl.searchParams, '/v1/');
  let response = await fetch(skyvernUrl, { method: request.method, headers, body });

  if (response.status === 404) {
    skyvernUrl = buildSkyvernUrl(skyvernPath, config.apiUrl, request.nextUrl.searchParams, '/api/v1/');
    response = await fetch(skyvernUrl, { method: request.method, headers, body });
  }

  // 5. Audit log (fire-and-forget on write ops)
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    logAuditEvent({
      userId: session.user.id,
      userName: session.user.name,
      action: `skyvern.${request.method.toLowerCase()}.${skyvernPath.split('/')[0]}`,
      resource: skyvernPath.split('/')[0],
      resourceId: skyvernPath.split('/')[1],
      details: {
        method: request.method,
        path: skyvernUrl,
        status: response.status,
      },
    }).catch(console.error);
  }

  // 6. Return
  const responseBody = await response.text();
  return new NextResponse(responseBody, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('content-type') || 'application/json',
    },
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
