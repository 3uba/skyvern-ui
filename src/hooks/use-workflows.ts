'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi, postApi } from '@/lib/api/fetch';

export const workflowKeys = {
  all: ['workflows'] as const,
  lists: () => [...workflowKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...workflowKeys.lists(), filters] as const,
  detail: (id: string) => [...workflowKeys.all, 'detail', id] as const,
};

export function useWorkflows(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: workflowKeys.list({ page, pageSize }),
    queryFn: () => fetchApi(`workflows?page=${page}&page_size=${pageSize}`),
  });
}

export function useWorkflow(workflowId: string) {
  return useQuery({
    queryKey: workflowKeys.detail(workflowId),
    queryFn: () => fetchApi(`workflows/${workflowId}`),
    enabled: !!workflowId,
  });
}

export function useCreateWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => postApi('workflows', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.lists() });
    },
  });
}

export function useUpdateWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workflowId, data }: { workflowId: string; data: Record<string, unknown> }) =>
      postApi(`workflows/${workflowId}`, data),
    onSuccess: (_, { workflowId }) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.detail(workflowId) });
      queryClient.invalidateQueries({ queryKey: workflowKeys.lists() });
    },
  });
}

export function useDeleteWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workflowId: string) => postApi(`workflows/${workflowId}/delete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.lists() });
    },
  });
}

export function useRunWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workflowId, data }: { workflowId: string; data?: Record<string, unknown> }) =>
      postApi('run/workflows', { workflow_id: workflowId, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['runs'] });
    },
  });
}
