import { db } from '@/lib/db';
import { organizationSettings } from '@/lib/db/schema';

const SKYVERN_URL = process.env.SKYVERN_INTERNAL_URL || 'http://127.0.0.1:8448';

export async function getSkyvernConfig() {
  const settings = await db.select().from(organizationSettings).limit(1);

  if (!settings[0]) {
    throw new Error('Skyvern API key not configured');
  }

  return {
    apiKey: settings[0].skyvernApiKey,
    apiUrl: settings[0].skyvernApiUrl || SKYVERN_URL,
  };
}

export async function skyvernFetch(path: string, options?: RequestInit) {
  const config = await getSkyvernConfig();
  return fetch(`${config.apiUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      ...options?.headers,
    },
  });
}
