import { createClient } from '@hey-api/client-fetch';

// Client hits OUR proxy, not Skyvern directly!
export const apiClient = createClient({
  baseUrl: '/api/skyvern',
});
