/**
 * Wraps an S3/external artifact URL through our proxy to avoid CORS.
 * Local URLs (same origin) are returned as-is.
 */
export function proxyArtifactUrl(url: string): string {
  // Already a relative/local URL — no proxy needed
  if (url.startsWith('/')) return url;

  try {
    const parsed = new URL(url);
    // Only proxy external URLs (S3, R2, GCS, etc.)
    if (
      parsed.hostname.endsWith('.amazonaws.com') ||
      parsed.hostname.endsWith('.r2.cloudflarestorage.com') ||
      parsed.hostname.endsWith('.storage.googleapis.com') ||
      parsed.hostname.endsWith('.blob.core.windows.net')
    ) {
      return `/api/artifact-proxy?url=${encodeURIComponent(url)}`;
    }
  } catch {
    // Invalid URL, return as-is
  }

  return url;
}
