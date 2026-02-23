'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postApi } from '@/lib/api/fetch';

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...taskKeys.lists(), filters] as const,
  detail: (id: string) => [...taskKeys.all, 'detail', id] as const,
};

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => postApi('run/tasks', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}
