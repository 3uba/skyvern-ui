'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const ACTIVE_STATUSES = ['running', 'queued', 'created'];

export const runKeys = {
  all: ['runs'] as const,
  lists: () => [...runKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...runKeys.lists(), filters] as const,
  detail: (id: string) => [...runKeys.all, 'detail', id] as const,
  timeline: (id: string) => [...runKeys.all, 'timeline', id] as const,
  artifacts: (id: string) => [...runKeys.all, 'artifacts', id] as const,
};

async function fetchApi(path: string) {
  const res = await fetch(`/api/skyvern/${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function postApi(path: string) {
  const res = await fetch(`/api/skyvern/${path}`, { method: 'POST' });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function useRuns(page = 1, pageSize = 10, searchKey?: string) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  if (searchKey) params.set('search_key', searchKey);

  return useQuery({
    queryKey: runKeys.list({ page, pageSize, searchKey }),
    queryFn: () => fetchApi(`runs?${params}`),
    // Auto-refresh list if any run is active
    refetchInterval: (query) => {
      const data = query.state.data;
      if (Array.isArray(data) && data.some((r: Record<string, string>) => ACTIVE_STATUSES.includes(r.status))) {
        return 5000;
      }
      return false;
    },
  });
}

export function useRun(runId: string) {
  return useQuery({
    queryKey: runKeys.detail(runId),
    queryFn: () => fetchApi(`runs/${runId}`),
    enabled: !!runId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (ACTIVE_STATUSES.includes(status)) return 2000;
      return false;
    },
  });
}

export function useRunTimeline(runId: string) {
  return useQuery({
    queryKey: runKeys.timeline(runId),
    queryFn: () => fetchApi(`runs/${runId}/timeline`),
    enabled: !!runId,
    refetchInterval: (query) => {
      // Re-poll timeline while the parent run is active
      // We can't know run status here, so poll at a slower rate
      // and let React Query de-duplicate
      const data = query.state.data;
      if (Array.isArray(data)) {
        const hasActive = data.some(
          (e: Record<string, unknown>) =>
            (e as { block?: { status?: string } }).block?.status === 'running',
        );
        if (hasActive) return 3000;
      }
      return false;
    },
  });
}

export function useRunArtifacts(runId: string) {
  return useQuery({
    queryKey: runKeys.artifacts(runId),
    queryFn: () => fetchApi(`runs/${runId}/artifacts`),
    enabled: !!runId,
  });
}

export function useCancelRun(runId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => postApi(`runs/${runId}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: runKeys.detail(runId) });
      queryClient.invalidateQueries({ queryKey: runKeys.timeline(runId) });
    },
  });
}
