import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { observationKeys } from './query-keys';
import type { MessObservation } from './types';

export function useMessObservations(filters?: { status?: string }) {
  const params = new URLSearchParams(filters).toString();
  return useQuery({
    queryKey: observationKeys.messList(filters),
    queryFn: () =>
      apiClient.get<MessObservation[]>(`/observations/mess${params ? `?${params}` : ''}`),
  });
}

export function useMessObservationDetail(id: number) {
  return useQuery({
    queryKey: observationKeys.messDetail(id),
    queryFn: () => apiClient.get<MessObservation>(`/observations/mess/${id}`),
    enabled: Number.isFinite(id),
  });
}

export function useCreateMessObservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) =>
      apiClient.post<MessObservation>('/observations/mess', input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: observationKeys.all });
    },
  });
}

export function useApproveMessObservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
      apiClient.post<MessObservation>(`/observations/mess/${id}/approve`, { notes }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: observationKeys.all });
    },
  });
}

export function useRejectMessObservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes: string }) =>
      apiClient.post<MessObservation>(`/observations/mess/${id}/reject`, { notes }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: observationKeys.all });
    },
  });
}
