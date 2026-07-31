import { Link } from 'react-router';
import { Plus } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/common/empty-state';
import { ObservationCard } from '@/components/common/observation-card';
import { useAuth } from '@/features/auth/auth-context';
import { useMessObservations } from '@/features/observations/use-mess-observations';
import { ROLE } from '@observasi/shared';

export default function HomePage() {
  const { user } = useAuth();
  const { data: observations } = useMessObservations();
  const hour = new Date().getHours();
  const greeting = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : 'Selamat sore';

  if (!user) return null;

  if (user.role === ROLE.PARAMEDIC) {
    const mine = (observations ?? []).filter((o) => o.paramedicId === user.id).slice(0, 3);
    return (
      <AppShell title={`${greeting}, ${user.name}`}>
        <Link
          to="/observasi/baru"
          className="flex h-24 items-center justify-center gap-2 rounded-md border-[3px] border-ink-900 bg-primary-500 font-display text-lg font-semibold text-ink-900 shadow-raised active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
        >
          <Plus className="h-6 w-6" strokeWidth={1.75} />
          Mulai Observasi
        </Link>

        <h2 className="font-display mt-6 text-lg font-semibold text-ink-900">Jadwal Hari Ini</h2>
        <Card className="flex items-center gap-4 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border-2 border-ink-900 bg-primary-100">
            <span className="font-display text-sm font-semibold text-primary-900">MLM</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-ink-500">Shift Malam · Mess</p>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-sm border-2 border-ink-900 bg-ink-100">
                <div className="h-full w-3/5 bg-primary-500" />
              </div>
              <span className="font-mono text-xs text-ink-500">3/5</span>
            </div>
          </div>
          <span className="font-mono text-sm text-ink-500">60%</span>
        </Card>

        <div className="mt-6 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-900">Observasi Terakhir</h2>
          <Link to="/observasi" className="text-sm font-medium text-primary-700">
            Lihat semua
          </Link>
        </div>
        <div className="mt-2 flex flex-col gap-3">
          {mine.length === 0 ? (
            <EmptyState title="Belum ada observasi. Mulai observasi pertama dari tombol di atas." />
          ) : (
            mine.map((o) => (
              <ObservationCard
                key={o.id}
                id={o.id}
                title={`${o.messComplex} / ${o.roomNumber}`}
                subtitle={o.employeeName ?? 'Tidak ada temuan'}
                createdAt={o.createdAt}
                hasFinding={o.hasFinding}
                status={o.status}
              />
            ))
          )}
        </div>
      </AppShell>
    );
  }

  const pendingCount = (observations ?? []).filter((o) => o.status === 'PENDING').length;

  return (
    <AppShell title={`${greeting}, ${user?.name.split(' ')[0]}`}>
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 text-center">
          <p className="font-display text-2xl font-semibold text-ink-900">{pendingCount}</p>
          <p className="text-sm text-ink-500">Menunggu Persetujuan</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="font-display text-2xl font-semibold text-ink-900">
            {(observations ?? []).length}
          </p>
          <p className="text-sm text-ink-500">Total Observasi</p>
        </Card>
      </div>
    </AppShell>
  );
}
