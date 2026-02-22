import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';

/**
 * Proxies artifact downloads from S3 signed URLs to avoid CORS issues.
 * Usage: GET /api/artifact-proxy?url=<encoded-s3-url>
 */
export async function GET(request: NextRequest) {
  // Auth check
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json(
      { error: 'Missing url parameter' },
      { status: 400 },
    );
  }

  // Only allow S3/known artifact URLs
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  const allowed =
    parsed.hostname.endsWith('.amazonaws.com') ||
    parsed.hostname.endsWith('.r2.cloudflarestorage.com') ||
    parsed.hostname.endsWith('.storage.googleapis.com') ||
    parsed.hostname.endsWith('.blob.core.windows.net') ||
    parsed.hostname === 'localhost' ||
    parsed.hostname === '127.0.0.1';

  if (!allowed) {
    return NextResponse.json(
      { error: 'URL not allowed' },
      { status: 403 },
    );
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return new NextResponse(`Upstream error: ${response.status}`, {
        status: response.status,
      });
    }

    const contentType =
      response.headers.get('content-type') || 'application/octet-stream';
    const body = await response.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to fetch artifact' },
      { status: 502 },
    );
  }
}
