import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main className="flex min-h-dvh items-center justify-center p-6">
        <div className="rounded-md border-[3px] border-ink-900 bg-white p-8 shadow-raised">
          <h1 className="font-display text-2xl font-semibold text-ink-900">
            Observasi Istirahat Karyawan
          </h1>
          <p className="mt-2 text-ink-500">Fase 0 — fondasi siap. Halaman dibangun di Fase 3.</p>
        </div>
      </main>
    </QueryClientProvider>
  );
}
