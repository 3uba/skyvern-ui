'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi, postApi } from '@/lib/api/fetch';

export const sessionKeys = {
  all: ['browser-sessions'] as const,
  lists: () => [...sessionKeys.all, 'list'] as const,
  detail: (id: string) => [...sessionKeys.all, 'detail', id] as const,
};

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
    mutationFn: (data: Record<string, unknown>) => postApi('browser_sessions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
    },
  });
}

export function useCloseBrowserSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => postApi(`browser_sessions/${sessionId}/close`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
    },
  });
}
