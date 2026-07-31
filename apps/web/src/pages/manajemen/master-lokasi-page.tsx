import { Plus, Edit3, Trash2 } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SkeletonCard } from '@/components/common/skeleton';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

type Lokasi = { id: number; name: string; kecamatan: string; kabupaten: string };

export default function MasterLokasiPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['master-data', 'lokasi'],
    queryFn: () => apiClient.get<Lokasi[]>('/master-data/lokasi'),
  });

  return (
    <AppShell title="Master Lokasi" showBack>
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {(data ?? []).map((l) => (
            <Card key={l.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-ink-900">{l.name}</p>
                <p className="text-sm text-ink-500">
                  Kec. {l.kecamatan}, {l.kabupaten}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert(`Edit ${l.name}`)}
                  className="flex h-8 w-8 items-center justify-center rounded-sm border-2 border-ink-900 bg-white"
                  aria-label={`Edit ${l.name}`}
                >
                  <Edit3 className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={() => alert(`Hapus ${l.name}`)}
                  className="flex h-8 w-8 items-center justify-center rounded-sm border-2 border-ink-900 bg-white"
                  aria-label={`Hapus ${l.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5 text-danger-700" strokeWidth={2} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Button size="full" className="mt-5" onClick={() => alert('Tambah lokasi — Fase 5')}>
        <Plus className="h-5 w-5" strokeWidth={1.75} />
        Tambah Lokasi
      </Button>
    </AppShell>
  );
}
