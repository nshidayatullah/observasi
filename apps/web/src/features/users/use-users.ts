import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Role, UserStatus } from '@observasi/shared';

export type UserListItem = {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  lastLoginAt: string | null;
};

export const userKeys = {
  all: ['users'] as const,
  list: () => [...userKeys.all, 'list'] as const,
};

export function useUsers() {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: () => apiClient.get<UserListItem[]>('/users'),
  });
}
