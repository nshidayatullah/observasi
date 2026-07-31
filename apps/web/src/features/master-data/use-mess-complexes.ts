import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export type MessComplex = { id: number; name: string; roomCount: number };

export function useMessComplexes() {
  return useQuery({
    queryKey: ['master-data', 'mess-complexes'] as const,
    queryFn: () => apiClient.get<MessComplex[]>('/master-data/mess-complexes'),
  });
}
