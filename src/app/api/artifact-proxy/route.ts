import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { getSkyvernConfig } from '@/lib/api/skyvern-proxy';

/**
 * Derives the artifact server URL.
 *
 * Priority:
 *  1. SKYVERN_ARTIFACT_URL env var (e.g. http://localhost:9090)
 *  2. Same host as Skyvern API, port 9090 (the default artifact server port)
 */
function getArtifactBaseUrl(apiUrl: string): string {
  if (process.env.SKYVERN_ARTIFACT_URL) {
    return process.env.SKYVERN_ARTIFACT_URL.replace(/\/$/, '');
  }
  try {
    const parsed = new URL(apiUrl);
    parsed.port = '9090';
    return parsed.origin;
  } catch {
    return 'http://localhost:9090';
  }
}

/**
 * Proxies artifact downloads to avoid CORS and handle Docker-internal URLs.
 * Supports Range requests so videos can be seeked without downloading fully.
 *
 * Usage:
 *   GET /api/artifact-proxy?url=<encoded-url>       — proxy any external URL
 *   GET /api/artifact-proxy?file=<encoded-filepath>  — serve file:// artifacts via artifact server (port 9090)
 */
export async function GET(request: NextRequest) {
  // Auth check
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const fileParam = request.nextUrl.searchParams.get('file');
  const urlParam = request.nextUrl.searchParams.get('url');

  // ── file:// artifacts — fetched via artifact server (port 9090) ──
  if (fileParam) {
    try {
      const config = await getSkyvernConfig();
      const artifactBase = getArtifactBaseUrl(config.apiUrl);
      const artifactUrl = `${artifactBase}/artifact/image?path=${encodeURIComponent(fileParam)}`;
      return proxyFetch(artifactUrl, request);
    } catch {
      return NextResponse.json(
        { error: 'Failed to fetch artifact from Skyvern' },
        { status: 502 },
      );
    }
  }

  // ── URL-based proxy ──────────────────────────────────────────────────────
  if (!urlParam) {
    return NextResponse.json(
      { error: 'Missing url or file parameter' },
      { status: 400 },
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(urlParam);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  const skyvernHost = (() => {
    try {
      return new URL(process.env.SKYVERN_INTERNAL_URL || '').hostname;
    } catch {
      return null;
    }
  })();

  const allowed =
    parsed.hostname.endsWith('.amazonaws.com') ||
    parsed.hostname.endsWith('.r2.cloudflarestorage.com') ||
    parsed.hostname.endsWith('.storage.googleapis.com') ||
    parsed.hostname.endsWith('.blob.core.windows.net') ||
    parsed.hostname === 'localhost' ||
    parsed.hostname === '127.0.0.1' ||
    (skyvernHost && parsed.hostname === skyvernHost);

  if (!allowed) {
    return NextResponse.json(
      { error: 'URL not allowed' },
      { status: 403 },
    );
  }

  try {
    return proxyFetch(urlParam, request);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch artifact' },
      { status: 502 },
    );
  }
}

/**
 * Fetches the upstream URL and streams the response back.
 * Forwards Range headers so the browser can seek within videos.
 */
async function proxyFetch(targetUrl: string, request: NextRequest) {
  const headers: Record<string, string> = {};
  const range = request.headers.get('range');
  if (range) {
    headers['Range'] = range;
  }

  const response = await fetch(targetUrl, { headers });
  if (!response.ok && response.status !== 206) {
    return new NextResponse(`Upstream error: ${response.status}`, {
      status: response.status,
    });
  }

  const responseHeaders: Record<string, string> = {
    'Content-Type': response.headers.get('content-type') || 'application/octet-stream',
    'Cache-Control': 'private, max-age=3600',
  };

  // Forward headers needed for Range/seek support
  const contentLength = response.headers.get('content-length');
  if (contentLength) responseHeaders['Content-Length'] = contentLength;

  const contentRange = response.headers.get('content-range');
  if (contentRange) responseHeaders['Content-Range'] = contentRange;

  const acceptRanges = response.headers.get('accept-ranges');
  if (acceptRanges) responseHeaders['Accept-Ranges'] = acceptRanges;

  // If upstream doesn't advertise Accept-Ranges but supports it,
  // add it ourselves so the browser knows seeking is possible.
  if (!acceptRanges && contentLength) {
    responseHeaders['Accept-Ranges'] = 'bytes';
  }

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}
