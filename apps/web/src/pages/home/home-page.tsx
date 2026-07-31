import { Link } from 'react-router';
import { Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/common/empty-state';
import { ObservationCard } from '@/components/common/observation-card';
import { useAuth } from '@/features/auth/auth-context';
import { useMessObservations } from '@/features/observations/use-mess-observations';
import { apiClient } from '@/lib/api-client';
import { ROLE } from '@observasi/shared';

type KpiSummary = {
  messCount: number;
  nonMessCount: number;
  findingCount: number;
  scheduleCompliance: number;
  averageApprovalHours: number;
  overdueApprovalCount: number;
};

export default function HomePage() {
  const { user } = useAuth();
  const { data: observations } = useMessObservations();
  const hour = new Date().getHours();
  const greeting = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : 'Selamat sore';

  if (!user) return null;

  /* ── Paramedis ─────────────────────────────────────── */
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

  /* ── Dokter & Superadmin — Dashboard KPI ───────────── */
  return (
    <AppShell title={`${greeting}, ${user.name}`}>
      <DashboardKpi />
    </AppShell>
  );
}

/* ── Dashboard KPI (non-Paramedis) ─────────────────────── */

function DashboardKpi() {
  const { data, isLoading } = useQuery({
    queryKey: ['kpi', 'summary'],
    queryFn: () => apiClient.get<KpiSummary>('/kpi/summary'),
  });

  if (isLoading || !data) {
    return <p className="text-ink-500">Memuat…</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Kartu ringkasan */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Mess" value={data.messCount} />
        <StatCard label="Kunjungan Rumah" value={data.nonMessCount} />
        <StatCard label="Temuan" value={data.findingCount} variant="finding" />
        <StatCard label="Kepatuhan" value={`${Math.round(data.scheduleCompliance * 100)}%`} />
      </div>

      {/* Persetujuan */}
      <Card className="p-4">
        <h2 className="text-label font-semibold text-ink-700">Persetujuan</h2>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-2xl font-semibold text-ink-900">
            {data.averageApprovalHours} jam
          </span>
          <span className="text-sm text-ink-500">rata-rata waktu tunggu</span>
        </div>
        {data.overdueApprovalCount > 0 ? (
          <p className="mt-1 text-sm text-signal-700">
            {data.overdueApprovalCount} observasi menunggu lebih dari 48 jam
          </p>
        ) : null}
      </Card>

      {/* Per Paramedis */}
      <Card className="p-4">
        <h2 className="text-label font-semibold text-ink-700">Per Paramedis</h2>
        <div className="mt-3 divide-y-2 divide-ink-200">
          <ParamedicRow name="Muhammad Suryani" mess={45} rumah={12} compliance={0.95} />
          <ParamedicRow name="Agung Priambara" mess={38} rumah={9} compliance={0.72} warning />
          <ParamedicRow name="Rina Andriani" mess={32} rumah={15} compliance={0.88} />
        </div>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  variant,
}: {
  label: string;
  value: string | number;
  variant?: 'finding';
}) {
  return (
    <Card className={`p-4 text-center ${variant === 'finding' ? 'bg-signal-500' : ''}`}>
      <p className="font-display text-2xl font-semibold text-ink-900">{value}</p>
      <p className="text-sm text-ink-500">{label}</p>
    </Card>
  );
}

function ParamedicRow({
  name,
  mess,
  rumah,
  compliance,
  warning,
}: {
  name: string;
  mess: number;
  rumah: number;
  compliance: number;
  warning?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink-900">{name}</p>
        <p className="text-xs text-ink-500">
          Mess {mess} · Rumah {rumah}
        </p>
      </div>
      <div className="flex w-28 items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-sm border-2 border-ink-900 bg-ink-100">
          <div
            className={`h-full ${warning ? 'bg-signal-500' : 'bg-primary-500'}`}
            style={{ width: `${Math.round(compliance * 100)}%` }}
          />
        </div>
        <span className="font-mono text-xs text-ink-500">{Math.round(compliance * 100)}%</span>
      </div>
    </div>
  );
}
