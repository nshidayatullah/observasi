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

      {/* Status Observasi Hari Ini */}
      <Card className="p-4">
        <h2 className="text-label font-semibold text-ink-700">Status Hari Ini</h2>
        <p className="text-xs text-ink-500">Pantau paramedis yang sudah/belum observasi</p>
        <div className="mt-3 flex flex-col gap-2">
          {STATUS_HARI_INI.map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-3 rounded-md border-2 border-ink-200 p-2.5"
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-ink-900 text-xs font-bold ${p.done ? 'bg-success-500 text-ink-900' : 'bg-ink-100 text-ink-500'}`}
              >
                {p.done ? '✓' : '—'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-900">{p.name}</p>
                {p.done ? (
                  <p className="text-xs text-ink-500">
                    Mess {p.mess} · Rumah {p.rumah} — {p.lastTime} WITA
                  </p>
                ) : (
                  <p className="text-xs text-signal-700">Belum observasi hari ini</p>
                )}
              </div>
              {p.done ? (
                <span className="shrink-0 rounded-sm bg-success-500 px-2 py-0.5 text-[11px] font-medium text-ink-900 border border-ink-900">
                  Selesai
                </span>
              ) : (
                <span className="shrink-0 rounded-sm bg-signal-500 px-2 py-0.5 text-[11px] font-medium text-ink-900 border border-ink-900">
                  Pending
                </span>
              )}
            </div>
          ))}
        </div>
      </Card>

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

      {/* Tren Bulanan */}
      <Card className="p-4">
        <h2 className="text-label font-semibold text-ink-700">Tren Bulanan</h2>
        <div className="mt-3 flex items-end gap-2" style={{ height: 130 }}>
          {TREN_BULANAN.map((m, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] font-mono font-medium text-ink-700">
                {m.mess + m.rumah}
              </span>
              <div className="flex w-full flex-col justify-end gap-0.5" style={{ height: 80 }}>
                <div
                  className="w-full bg-primary-500 border border-ink-900 rounded-t-sm"
                  style={{ height: `${(m.mess / 60) * 80}px` }}
                />
                <div
                  className="w-full bg-signal-500 border border-ink-900 rounded-t-sm"
                  style={{ height: `${(m.rumah / 60) * 80}px` }}
                />
              </div>
              <span className="text-[10px] text-ink-500">{m.bln}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm border border-ink-900 bg-primary-500" />{' '}
            Mess
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm border border-ink-900 bg-signal-500" />{' '}
            Rumah
          </span>
        </div>
      </Card>

      {/* Distribusi Status */}
      <Card className="p-4">
        <h2 className="text-label font-semibold text-ink-700">Distribusi Status</h2>
        <div className="mt-3 flex flex-col gap-2.5">
          <StatusBar label="Menunggu" count={23} max={60} color="bg-ink-200" />
          <StatusBar label="Disetujui" count={32} max={60} color="bg-success-500" />
          <StatusBar label="Ditolak" count={5} max={60} color="bg-danger-500" />
        </div>
      </Card>

      {/* Rasio Temuan */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 text-center">
          <h2 className="text-label font-semibold text-ink-700">Rasio Temuan</h2>
          <div className="mt-3 flex justify-center">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-[4px] border-ink-900 bg-ink-100">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(var(--color-signal-500) 0deg, var(--color-signal-500) ${Math.round((data.findingCount / data.messCount) * 360)}deg, var(--color-primary-500) ${Math.round((data.findingCount / data.messCount) * 360)}deg, var(--color-primary-500) 360deg)`,
                  clipPath: 'circle(50%)',
                }}
              />
              <div className="z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 border-ink-900 bg-white">
                <span className="font-display text-lg font-semibold text-ink-900">
                  {Math.round((data.findingCount / data.messCount) * 100)}%
                </span>
              </div>
            </div>
          </div>
          <div className="mt-2 flex justify-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm border border-ink-900 bg-signal-500" />{' '}
              Temuan
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm border border-ink-900 bg-primary-500" />{' '}
              Tertib
            </span>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-label font-semibold text-ink-700">Top Komplek</h2>
          <div className="mt-3 flex flex-col gap-2">
            <TopRow rank={1} name="Mess A" count={34} max={40} />
            <TopRow rank={2} name="Mess C" count={28} max={40} />
            <TopRow rank={3} name="Mess GL" count={22} max={40} />
            <TopRow rank={4} name="Mess Mandala" count={18} max={40} />
            <TopRow rank={5} name="Mess B" count={15} max={40} />
          </div>
        </Card>
      </div>

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

/* ── Chart helpers ──────────────────────────────────────── */

const STATUS_HARI_INI = [
  { name: 'Muhammad Suryani', done: true, mess: 3, rumah: 1, lastTime: '09:14' },
  { name: 'Agung Priambara', done: true, mess: 2, rumah: 0, lastTime: '10:05' },
  { name: 'Rina Andriani', done: true, mess: 4, rumah: 2, lastTime: '09:45' },
  { name: 'Bambang Hermawan', done: false, mess: 0, rumah: 0, lastTime: '' },
];

const TREN_BULANAN = [
  { bln: 'Feb', mess: 22, rumah: 5 },
  { bln: 'Mar', mess: 28, rumah: 7 },
  { bln: 'Apr', mess: 25, rumah: 6 },
  { bln: 'Mei', mess: 31, rumah: 8 },
  { bln: 'Jun', mess: 27, rumah: 9 },
  { bln: 'Jul', mess: 34, rumah: 11 },
];

function StatusBar({
  label,
  count,
  max,
  color,
}: {
  label: string;
  count: number;
  max: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-20 shrink-0 text-ink-500">{label}</span>
      <div className="h-4 flex-1 overflow-hidden rounded-sm border-2 border-ink-900 bg-ink-100">
        <div className={`h-full ${color}`} style={{ width: `${(count / max) * 100}%` }} />
      </div>
      <span className="w-8 text-right font-mono text-xs text-ink-900">{count}</span>
    </div>
  );
}

function TopRow({
  rank,
  name,
  count,
  max,
}: {
  rank: number;
  name: string;
  count: number;
  max: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-4 text-center font-mono text-xs text-ink-500">{rank}</span>
      <span className="w-20 truncate text-xs text-ink-900">{name}</span>
      <div className="h-3 flex-1 overflow-hidden rounded-sm border border-ink-900 bg-ink-100">
        <div className="h-full bg-primary-500" style={{ width: `${(count / max) * 100}%` }} />
      </div>
      <span className="w-7 text-right font-mono text-[11px] text-ink-500">{count}</span>
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
