import { useState } from 'react';
import { Download, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/empty-state';
import { ObservationCard } from '@/components/common/observation-card';
import { useMessObservations } from '@/features/observations/use-mess-observations';
import { useAuth } from '@/features/auth/auth-context';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { MessObservation } from '@/features/observations/types';
import { ROLE } from '@observasi/shared';
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

type FilterTab = 'semua' | 'mess' | 'rumah' | 'laporan';

const REPORT_MONTHS = [
  {
    key: '2026-07',
    label: 'Juli 2026',
    total: 45,
    mess: 34,
    rumah: 11,
    temuan: 13,
    approved: 20,
    rejected: 2,
    pending: 5,
    avgApproval: '14',
  },
  {
    key: '2026-06',
    label: 'Juni 2026',
    total: 38,
    mess: 29,
    rumah: 9,
    temuan: 12,
    approved: 28,
    rejected: 3,
    pending: 0,
    avgApproval: '11',
  },
  {
    key: '2026-05',
    label: 'Mei 2026',
    total: 42,
    mess: 31,
    rumah: 11,
    temuan: 15,
    approved: 35,
    rejected: 4,
    pending: 0,
    avgApproval: '16',
  },
  {
    key: '2026-04',
    label: 'April 2026',
    total: 35,
    mess: 26,
    rumah: 9,
    temuan: 10,
    approved: 30,
    rejected: 1,
    pending: 0,
    avgApproval: '9',
  },
  {
    key: '2026-03',
    label: 'Maret 2026',
    total: 31,
    mess: 23,
    rumah: 8,
    temuan: 9,
    approved: 25,
    rejected: 2,
    pending: 0,
    avgApproval: '12',
  },
  {
    key: '2026-02',
    label: 'Februari 2026',
    total: 27,
    mess: 20,
    rumah: 7,
    temuan: 7,
    approved: 22,
    rejected: 1,
    pending: 0,
    avgApproval: '10',
  },
  {
    key: '2026-01',
    label: 'Januari 2026',
    total: 29,
    mess: 21,
    rumah: 8,
    temuan: 8,
    approved: 24,
    rejected: 2,
    pending: 0,
    avgApproval: '13',
  },
];

export default function ObservationHistoryPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === ROLE.SUPERADMIN;
  const [tab, setTab] = useState<FilterTab>('semua');
  const [expanded, setExpanded] = useState<string | null>(null);
  const { data: mess, isLoading: messLoading } = useMessObservations();
  const { data: nonMess, isLoading: nmLoading } = useQuery({
    queryKey: ['observations', 'non-mess', 'list', {}],
    queryFn: () => apiClient.get<NonMessObs[]>('/observations/non-mess'),
  });

  const isLoading = messLoading || nmLoading;

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
    ...(isAdmin ? [{ key: 'laporan' as FilterTab, label: 'Laporan' }] : []),
  ];

  return (
    <AppShell title="Observasi">
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

      {tab === 'laporan' ? (
        <div className="flex flex-col gap-3">
          {REPORT_MONTHS.map((m) => {
            const isOpen = expanded === m.key;
            return (
              <Card key={m.key} className="overflow-hidden p-0">
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : m.key)}
                  className="flex w-full items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-ink-900 bg-primary-100">
                      <FileText className="h-5 w-5 text-primary-900" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="font-medium text-ink-900">{m.label}</p>
                      <p className="text-sm text-ink-500">{m.total} observasi</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Unduh PDF ${m.label}`);
                      }}
                    >
                      <Download className="h-4 w-4" strokeWidth={2} />
                      PDF
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Unduh Excel ${m.label}`);
                      }}
                    >
                      <Download className="h-4 w-4" strokeWidth={2} />
                      Excel
                    </Button>
                    {isOpen ? (
                      <ChevronDown className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                    ) : (
                      <ChevronRight className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                    )}
                  </div>
                </button>

                {isOpen ? (
                  <div className="border-t-2 border-ink-200 px-4 py-3">
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="rounded-md border-2 border-ink-900 bg-primary-100 p-2 text-center">
                        <p className="font-display text-lg font-semibold text-ink-900">{m.mess}</p>
                        <p className="text-[11px] text-ink-500">Mess</p>
                      </div>
                      <div className="rounded-md border-2 border-ink-900 bg-signal-100 p-2 text-center">
                        <p className="font-display text-lg font-semibold text-ink-900">{m.rumah}</p>
                        <p className="text-[11px] text-ink-500">Rumah</p>
                      </div>
                      <div className="rounded-md border-2 border-ink-900 bg-white p-2 text-center">
                        <p className="font-display text-lg font-semibold text-ink-900">
                          {m.temuan}
                        </p>
                        <p className="text-[11px] text-ink-500">Temuan</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-ink-500">Disetujui</span>
                        <span className="font-medium text-success-700">{m.approved}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-500">Ditolak</span>
                        <span className="font-medium text-danger-700">{m.rejected}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-500">Menunggu</span>
                        <span className="font-medium text-ink-700">{m.pending}</span>
                      </div>
                      <div className="mt-1 flex justify-between border-t border-ink-200 pt-1.5">
                        <span className="text-ink-500">Rata-rata persetujuan</span>
                        <span className="font-medium text-ink-900">{m.avgApproval}h</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>
      ) : isLoading ? (
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
              obsType={o.type}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}
