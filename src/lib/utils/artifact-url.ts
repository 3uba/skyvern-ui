/**
 * Wraps an external artifact URL through our proxy to avoid CORS
 * and handle Docker-internal URLs inaccessible from the browser.
 * Local URLs (same origin) are returned as-is.
 */
export function proxyArtifactUrl(url: string): string {
  // Already a relative/local URL — no proxy needed
  if (url.startsWith('/')) return url;

  // file:// URIs — served by Skyvern backend's /artifact/image endpoint
  if (url.startsWith('file://')) {
    return `/api/artifact-proxy?file=${encodeURIComponent(url.slice(7))}`;
  }

  try {
    const parsed = new URL(url);
    const appHost =
      typeof window !== 'undefined' ? window.location.host : '';

    // Skip proxying if the URL is on the same host as the app
    if (appHost && parsed.host === appHost) return url;

    // Proxy all external URLs (S3, Docker-internal, etc.)
    return `/api/artifact-proxy?url=${encodeURIComponent(url)}`;
  } catch {
    // Invalid URL, return as-is
  }

  return url;
}
