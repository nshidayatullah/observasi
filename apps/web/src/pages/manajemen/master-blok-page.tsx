import { useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const MOCK_BLOK = [
  { id: 1, name: 'Blok A', location: 'Site BIB', messCount: 2 },
  { id: 2, name: 'Blok B', location: 'Site BIB', messCount: 2 },
  { id: 3, name: 'Blok C', location: 'Site BIB', messCount: 3 },
  { id: 4, name: 'Blok D', location: 'Site BIB', messCount: 1 },
];

export default function MasterBlokPage() {
  const [data] = useState(MOCK_BLOK);

  return (
    <AppShell title="Master Blok" showBack>
      <div className="flex flex-col gap-3">
        {data.map((b) => (
          <Card key={b.id} className="flex items-center justify-between p-4">
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
                <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
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
          </Card>
        ))}
      </div>
      <Button size="full" className="mt-5" onClick={() => alert('Tambah blok — Fase 5')}>
        <Plus className="h-5 w-5" strokeWidth={1.75} />
        Tambah Blok
      </Button>
    </AppShell>
  );
}
