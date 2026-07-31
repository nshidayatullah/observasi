// Wrapper fetch tipis. Interceptor token/refresh nyata ditambahkan di T-140 (Fase 6).
// Selama Fase 3, base URL diarahkan ke MSW handler di src/mocks.
const API_BASE_URL = import.meta.env['VITE_API_BASE_URL'] ?? '/api/v1';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: { field: string; message: string }[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & { body?: unknown };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem('accessToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const json = (await response.json()) as { data?: T; meta?: unknown; error?: ApiErrorBody };

  if (!response.ok) {
    const error = json.error ?? { code: 'UNKNOWN_ERROR', message: 'Terjadi kesalahan.' };
    throw new ApiError(error.message, error.code, error.details);
  }

  return json.data as T;
}

type ApiErrorBody = {
  code: string;
  message: string;
  details?: { field: string; message: string }[];
};

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
