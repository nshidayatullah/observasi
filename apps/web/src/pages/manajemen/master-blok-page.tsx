import { Plus, Edit3, Trash2 } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SkeletonCard } from '@/components/common/skeleton';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

type Blok = { id: number; name: string; location: string; messCount: number; messList: string[] };

export default function MasterBlokPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['master-data', 'blok'],
    queryFn: () => apiClient.get<Blok[]>('/master-data/blok'),
  });

  return (
    <AppShell title="Master Blok" showBack>
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {(data ?? []).map((b) => (
            <Card key={b.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-ink-900">{b.name}</p>
                  <p className="text-sm text-ink-500">
                    {b.location} · {b.messCount} mess
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => alert(`Edit ${b.name}`)}
                    className="flex h-8 w-8 items-center justify-center rounded-sm border-2 border-ink-900 bg-white"
                    aria-label={`Edit ${b.name}`}
                  >
                    <Edit3 className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    onClick={() => alert(`Hapus ${b.name}`)}
                    className="flex h-8 w-8 items-center justify-center rounded-sm border-2 border-ink-900 bg-white"
                    aria-label={`Hapus ${b.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-danger-700" strokeWidth={2} />
                  </button>
                </div>
              </div>
              {b.messList.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5 border-t-2 border-ink-200 pt-3">
                  {b.messList.map((m) => (
                    <span
                      key={m}
                      className="rounded-sm border-2 border-ink-900 bg-primary-100 px-2 py-0.5 text-xs font-medium text-ink-900"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}
      <Button size="full" className="mt-5" onClick={() => alert('Tambah blok — Fase 5')}>
        <Plus className="h-5 w-5" strokeWidth={1.75} />
        Tambah Blok
      </Button>
    </AppShell>
  );
}
