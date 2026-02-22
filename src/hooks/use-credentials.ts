'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const credentialKeys = {
  all: ['credentials'] as const,
  lists: () => [...credentialKeys.all, 'list'] as const,
};

async function fetchApi(path: string, options?: RequestInit) {
  const res = await fetch(`/api/skyvern/${path}`, options);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function useCredentials() {
  return useQuery({
    queryKey: credentialKeys.lists(),
    queryFn: () => fetchApi('credentials'),
  });
}

export function useCreateCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchApi('credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: credentialKeys.lists() });
    },
  });
}

export function useDeleteCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentialId: string) =>
      fetchApi(`credentials/${credentialId}/delete`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: credentialKeys.lists() });
    },
  });
}
