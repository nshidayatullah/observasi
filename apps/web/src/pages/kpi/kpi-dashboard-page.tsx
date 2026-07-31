import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';

type KpiSummary = {
  messCount: number;
  nonMessCount: number;
  findingCount: number;
  scheduleCompliance: number;
  averageApprovalHours: number;
  overdueApprovalCount: number;
};

export default function KpiDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['kpi', 'summary'],
    queryFn: () => apiClient.get<KpiSummary>('/kpi/summary'),
  });

  return (
    <AppShell title="Dashboard KPI">
      {isLoading || !data ? (
        <p className="text-ink-500">Memuat…</p>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Kartu ringkasan */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Mess" value={data.messCount} />
            <StatCard label="Kunjungan Rumah" value={data.nonMessCount} />
            <StatCard label="Temuan" value={data.findingCount} variant="finding" />
            <StatCard
              label="Kepatuhan Jadwal"
              value={`${Math.round(data.scheduleCompliance * 100)}%`}
            />
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

          {/* Per Paramedis — mock data */}
          <Card className="p-4">
            <h2 className="text-label font-semibold text-ink-700">Per Paramedis</h2>
            <div className="mt-3 divide-y-2 divide-ink-200">
              <ParamedicRow name="Muhammad Suryani" mess={45} rumah={12} compliance={0.95} />
              <ParamedicRow name="Agung Priambara" mess={38} rumah={9} compliance={0.72} warning />
            </div>
          </Card>
        </div>
      )}
    </AppShell>
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
