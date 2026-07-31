import { useState } from 'react';
import { Plus, ChevronDown, ChevronRight, Trash2, Pencil } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

type MessComplex = { id: number; name: string; roomCount: number };

export default function MasterMessPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['master-data', 'mess-complexes'],
    queryFn: () => apiClient.get<MessComplex[]>('/master-data/mess-complexes'),
  });
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <AppShell title="Master Mess" showBack>
      {isLoading ? (
        <p className="text-ink-500">Memuat…</p>
      ) : (
        <div className="flex flex-col gap-3">
          {(data ?? []).map((c) => (
            <Card key={c.id} className="overflow-hidden p-0">
              <button
                type="button"
                onClick={() => setOpenId(openId === c.id ? null : c.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div>
                  <p className="font-medium text-ink-900">{c.name}</p>
                  <p className="text-sm text-ink-500">{c.roomCount} kamar</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`Edit ${c.name}`);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-sm border-2 border-ink-900 bg-white"
                    aria-label={`Edit ${c.name}`}
                  >
                    <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                  {openId === c.id ? (
                    <ChevronDown className="h-5 w-5" strokeWidth={1.75} />
                  ) : (
                    <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
                  )}
                </div>
              </button>
              {openId === c.id ? (
                <div className="border-t-2 border-ink-200 px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: c.roomCount }, (_, i) => i + 1).map((n) => (
                      <span
                        key={n}
                        className="inline-flex items-center gap-1 rounded-sm border-2 border-ink-900 bg-ink-100 px-2 py-1 text-sm font-medium text-ink-900"
                      >
                        {n}
                        <button
                          type="button"
                          onClick={() => alert(`Hapus kamar ${n}`)}
                          className="ml-0.5 text-danger-700"
                          aria-label={`Hapus kamar ${n}`}
                        >
                          <Trash2 className="h-3 w-3" strokeWidth={2} />
                        </button>
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={() => alert('Tambah kamar')}
                      className="inline-flex items-center gap-1 rounded-sm border-2 border-dashed border-ink-300 px-2 py-1 text-sm text-ink-500 hover:border-primary-500 hover:text-primary-700"
                    >
                      <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                      Tambah
                    </button>
                  </div>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}
      <Button size="full" className="mt-5" onClick={() => alert('Tambah komplek — Fase 5')}>
        <Plus className="h-5 w-5" strokeWidth={1.75} />
        Tambah Komplek
      </Button>
    </AppShell>
  );
}
