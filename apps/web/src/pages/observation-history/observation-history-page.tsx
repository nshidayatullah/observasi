import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { EmptyState } from '@/components/common/empty-state';
import { ObservationCard } from '@/components/common/observation-card';
import { useMessObservations } from '@/features/observations/use-mess-observations';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { MessObservation } from '@/features/observations/types';
import { cn } from '@/lib/utils';

type NonMessObs = {
  id: number;
  type: 'NON_MESS';
  observationDate: string;
  createdAt: string;
  status: string;
  employeeName: string;
  observationLocation: string;
  officerName: string;
};

type FilterTab = 'semua' | 'mess' | 'rumah';

export default function ObservationHistoryPage() {
  const [tab, setTab] = useState<FilterTab>('semua');
  const { data: mess, isLoading: messLoading } = useMessObservations();
  const { data: nonMess, isLoading: nmLoading } = useQuery({
    queryKey: ['observations', 'non-mess', 'list', {}],
    queryFn: () => apiClient.get<NonMessObs[]>('/observations/non-mess'),
  });

  const isLoading = messLoading || nmLoading;

  // Gabung & urutkan
  const semua = [
    ...(mess ?? []).map((o) => ({
      id: o.id,
      type: 'MESS' as const,
      title: `${o.messComplex} / ${o.roomNumber}`,
      subtitle: o.employeeName ?? 'Tidak ada temuan',
      createdAt: o.createdAt,
      hasFinding: o.hasFinding,
      status: o.status as MessObservation['status'],
    })),
    ...(nonMess ?? []).map((o) => ({
      id: o.id,
      type: 'NON_MESS' as const,
      title: `${o.employeeName}`,
      subtitle: `Kunjungan Rumah · ${o.observationLocation}`,
      createdAt: o.createdAt,
      hasFinding: false,
      status: o.status as MessObservation['status'],
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filtered =
    tab === 'semua'
      ? semua
      : tab === 'mess'
        ? semua.filter((o) => o.type === 'MESS')
        : semua.filter((o) => o.type === 'NON_MESS');

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'semua', label: 'Semua' },
    { key: 'mess', label: 'Mess' },
    { key: 'rumah', label: 'Rumah' },
  ];

  return (
    <AppShell title="Observasi">
      {/* Filter tab */}
      <div className="mb-4 flex gap-1 rounded-md border-2 border-ink-900 bg-ink-200 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              'flex-1 rounded-sm py-1.5 text-sm font-medium transition-colors',
              tab === t.key
                ? 'border-2 border-ink-900 bg-white text-ink-900 shadow-sm'
                : 'text-ink-500',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-ink-500">Memuat…</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={
            tab === 'semua'
              ? 'Belum ada observasi.'
              : `Belum ada observasi ${tab === 'mess' ? 'Mess' : 'Kunjungan Rumah'}.`
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((o) => (
            <ObservationCard
              key={`${o.type}-${o.id}`}
              id={o.id}
              title={o.title}
              subtitle={o.subtitle}
              createdAt={o.createdAt}
              hasFinding={o.hasFinding}
              status={o.status}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}
