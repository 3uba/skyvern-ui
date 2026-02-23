const BASE = '/api/skyvern';

export async function fetchApi<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/${path}`, options);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function postApi<T = unknown>(path: string, data?: unknown): Promise<T> {
  return fetchApi<T>(path, {
    method: 'POST',
    headers: data ? { 'Content-Type': 'application/json' } : undefined,
    body: data ? JSON.stringify(data) : undefined,
  });
}
