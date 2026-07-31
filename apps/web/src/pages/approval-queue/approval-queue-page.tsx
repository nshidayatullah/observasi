import { AppShell } from '@/components/layout/app-shell';
import { EmptyState } from '@/components/common/empty-state';
import { ObservationCard } from '@/components/common/observation-card';
import { useMessObservations } from '@/features/observations/use-mess-observations';

export default function ApprovalQueuePage() {
  const { data: observations, isLoading } = useMessObservations({ status: 'PENDING' });

  return (
    <AppShell title="Persetujuan">
      {isLoading ? (
        <p className="text-ink-500">Memuat…</p>
      ) : !observations || observations.length === 0 ? (
        <EmptyState title="Tidak ada observasi menunggu persetujuan." />
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="rounded-md border-2 border-ink-900 bg-white p-3 text-center shadow-card">
              <p className="font-display text-2xl font-semibold text-ink-900">
                {observations.length}
              </p>
              <p className="text-sm text-ink-500">Menunggu</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {observations.map((o) => (
              <ObservationCard
                key={o.id}
                id={o.id}
                title={`${o.messComplex} / ${o.roomNumber}`}
                subtitle={`${o.paramedicName} · ${o.employeeName ?? 'Tidak ada temuan'}`}
                createdAt={o.createdAt}
                hasFinding={o.hasFinding}
                status={o.status}
              />
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}
