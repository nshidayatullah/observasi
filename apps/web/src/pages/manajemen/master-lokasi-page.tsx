import { useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const MOCK_LOKASI = [
  { id: 1, name: 'Satui', kecamatan: 'Satui', kabupaten: 'Tanah Bumbu' },
  { id: 2, name: 'Simpang Empat', kecamatan: 'Simpang Empat', kabupaten: 'Tanah Bumbu' },
  { id: 3, name: 'Batu Licin', kecamatan: 'Batu Licin', kabupaten: 'Tanah Bumbu' },
  { id: 4, name: 'Kusan Hilir', kecamatan: 'Kusan Hilir', kabupaten: 'Tanah Bumbu' },
  { id: 5, name: 'Angsana', kecamatan: 'Angsana', kabupaten: 'Tanah Bumbu' },
];

export default function MasterLokasiPage() {
  const [data] = useState(MOCK_LOKASI);

  return (
    <AppShell title="Master Lokasi" showBack>
      <div className="flex flex-col gap-3">
        {data.map((l) => (
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
                <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
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
      <Button size="full" className="mt-5" onClick={() => alert('Tambah lokasi — Fase 5')}>
        <Plus className="h-5 w-5" strokeWidth={1.75} />
        Tambah Lokasi
      </Button>
    </AppShell>
  );
}
