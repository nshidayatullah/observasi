import { useMutation } from '@tanstack/react-query';
import { apiClient, ApiError } from '@/lib/api-client';
import { useAuth } from './auth-context';
import type { LoginInput } from '@observasi/shared';
import type { AuthUser } from './auth-context';

type LoginResponse = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

export function useLogin() {
  const { setSession } = useAuth();

  return useMutation<LoginResponse, ApiError, LoginInput>({
    mutationFn: (input) => apiClient.post<LoginResponse>('/auth/login', input),
    onSuccess: (data) => {
      setSession(data.user, data.accessToken);
    },
  });
}
