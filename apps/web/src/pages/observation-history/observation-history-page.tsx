import { AppShell } from '@/components/layout/app-shell';
import { EmptyState } from '@/components/common/empty-state';
import { ObservationCard } from '@/components/common/observation-card';
import { useMessObservations } from '@/features/observations/use-mess-observations';

export default function ObservationHistoryPage() {
  const { data: observations, isLoading } = useMessObservations();

  return (
    <AppShell title="Observasi">
      {isLoading ? (
        <p className="text-ink-500">Memuat…</p>
      ) : !observations || observations.length === 0 ? (
        <EmptyState title="Belum ada observasi. Mulai observasi pertama dari beranda." />
      ) : (
        <div className="flex flex-col gap-3">
          {observations.map((o) => (
            <ObservationCard
              key={o.id}
              id={o.id}
              title={`${o.messComplex} / ${o.roomNumber}`}
              subtitle={o.employeeName ?? 'Tidak ada temuan'}
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
