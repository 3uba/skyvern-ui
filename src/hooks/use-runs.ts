'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi, postApi } from '@/lib/api/fetch';
import type { Run, TimelineEntry, Artifact } from '@/components/runs/types';

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
    queryFn: () => fetchApi<Run>(`runs/${runId}`),
    enabled: !!runId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (typeof status === 'string' && ACTIVE_STATUSES.includes(status)) return 2000;
      return false;
    },
  });
}

export function useRunTimeline(runId: string, workflowPermanentId?: string, isRunActive = false) {
  // Workflow runs (wr_) need the workflow-specific timeline endpoint
  // because /v1/runs/{id}/timeline has a backend bug for workflow runs.
  const isWorkflowRun = runId.startsWith('wr_');
  const path =
    isWorkflowRun && workflowPermanentId
      ? `workflows/${workflowPermanentId}/runs/${runId}/timeline`
      : `runs/${runId}/timeline`;

  return useQuery({
    queryKey: runKeys.timeline(runId),
    queryFn: () => fetchApi<TimelineEntry[]>(path),
    enabled: !!runId && (!isWorkflowRun || !!workflowPermanentId),
    // Keep polling while the run is active so new blocks are detected
    refetchInterval: isRunActive ? 3000 : false,
  });
}

export function useRunArtifacts(runId: string, isActive = false) {
  return useQuery({
    queryKey: runKeys.artifacts(runId),
    queryFn: () => fetchApi<Artifact[]>(`runs/${runId}/artifacts`),
    enabled: !!runId,
    refetchInterval: isActive ? 2000 : false,
  });
}

export function useBlockArtifacts(blockId: string | null, isActive = false) {
  return useQuery({
    queryKey: ['blockArtifacts', blockId],
    queryFn: () => fetchApi<Artifact[]>(`workflow_run_block/${blockId}/artifacts`),
    enabled: !!blockId,
    // Keep polling for active runs to get the latest screenshot
    refetchInterval: isActive ? 3000 : false,
  });
}

export function useCancelRun(runId: string) {
  const queryClient = useQueryClient();
  // Workflow runs (wr_) need the legacy cancel endpoint because
  // /v1/runs/{id}/cancel can't resolve workflow run IDs.
  const isWorkflowRun = runId.startsWith('wr_');
  const cancelPath = isWorkflowRun
    ? `workflows/runs/${runId}/cancel`
    : `runs/${runId}/cancel`;

  return useMutation({
    mutationFn: () => postApi(cancelPath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: runKeys.detail(runId) });
      queryClient.invalidateQueries({ queryKey: runKeys.timeline(runId) });
    },
  });
}
