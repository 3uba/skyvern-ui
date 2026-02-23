'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi, postApi } from '@/lib/api/fetch';

export const credentialKeys = {
  all: ['credentials'] as const,
  lists: () => [...credentialKeys.all, 'list'] as const,
};

export function useCredentials() {
  return useQuery({
    queryKey: credentialKeys.lists(),
    queryFn: () => fetchApi('credentials'),
  });
}

export function useCreateCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => postApi('credentials', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: credentialKeys.lists() });
    },
  });
}

export function useDeleteCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentialId: string) => postApi(`credentials/${credentialId}/delete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: credentialKeys.lists() });
    },
  });
}
