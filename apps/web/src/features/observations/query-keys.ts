export const observationKeys = {
  all: ['observations'] as const,
  messList: (filters?: Record<string, string>) =>
    [...observationKeys.all, 'mess', 'list', filters ?? {}] as const,
  messDetail: (id: number) => [...observationKeys.all, 'mess', 'detail', id] as const,
};
