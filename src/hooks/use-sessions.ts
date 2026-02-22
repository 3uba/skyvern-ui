'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const sessionKeys = {
  all: ['browser-sessions'] as const,
  lists: () => [...sessionKeys.all, 'list'] as const,
  detail: (id: string) => [...sessionKeys.all, 'detail', id] as const,
};

async function fetchApi(path: string, options?: RequestInit) {
  const res = await fetch(`/api/skyvern/${path}`, options);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function useBrowserSessions() {
  return useQuery({
    queryKey: sessionKeys.lists(),
    queryFn: () => fetchApi('browser_sessions'),
    refetchInterval: 5000,
  });
}

export function useBrowserSession(sessionId: string) {
  return useQuery({
    queryKey: sessionKeys.detail(sessionId),
    queryFn: () => fetchApi(`browser_sessions/${sessionId}`),
    enabled: !!sessionId,
  });
}

export function useCreateBrowserSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchApi('browser_sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
    },
  });
}

export function useCloseBrowserSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) =>
      fetchApi(`browser_sessions/${sessionId}/close`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
    },
  });
}
