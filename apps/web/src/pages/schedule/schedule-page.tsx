import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, MapPin, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/empty-state';
import { SkeletonCard } from '@/components/common/skeleton';
import { useAuth } from '@/features/auth/auth-context';
import { apiClient } from '@/lib/api-client';
import { ROLE } from '@observasi/shared';
import { cn } from '@/lib/utils';

type ScheduleItem = {
  id: number;
  date: string;
  shift: string;
  locationType: string;
  locationName: string;
  targetCount: number;
  completedCount: number;
};

type RosterEntry = {
  id: number;
  paramedicName: string;
  paramedicId: number;
  month: string;
  messDays: number;
  nonMessDays: number;
  assignments: { date: string; type: 'MESS' | 'NON_MESS'; location: string }[];
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function formatMonth(ym: string) {
  const [y, m] = ym.split('-');
  return `${MONTHS[Number(m) - 1]} ${y}`;
}

export default function SchedulePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === ROLE.SUPERADMIN;

  if (isAdmin) return <SuperadminRoster />;
  return <ParamedicSchedule />;
}

/* ── Paramedis: jadwal sendiri ─────────────────────────── */

function ParamedicSchedule() {
  const { data, isLoading } = useQuery({
    queryKey: ['schedules'],
    queryFn: () => apiClient.get<ScheduleItem[]>('/schedules'),
  });

  return (
    <AppShell title="Jadwal">
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState title="Belum ada jadwal observasi." />
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((s) => (
            <Card key={s.id} className="flex items-center gap-4 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border-2 border-ink-900 bg-primary-100">
                <CalendarDays className="h-5 w-5 text-primary-900" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink-900">
                  {s.shift} · {s.locationName}
                </p>
                <p className="flex items-center gap-1 text-xs text-ink-500">
                  <MapPin className="h-3 w-3" />
                  {s.locationType === 'MESS' ? 'Mess' : 'Kunjungan Rumah'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm text-ink-900">
                  {s.completedCount}/{s.targetCount}
                </p>
                <div className="mt-1 h-1.5 w-16 overflow-hidden rounded-sm border border-ink-900 bg-ink-100">
                  <div
                    className="h-full bg-primary-500"
                    style={{
                      width: `${s.targetCount > 0 ? Math.round((s.completedCount / s.targetCount) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}

/* ── Superadmin: roster bulanan ─────────────────────────── */

function SuperadminRoster() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-12

  const monthKey = `${year}-${String(month).padStart(2, '0')}`;

  const { data, isLoading } = useQuery({
    queryKey: ['schedules', 'roster', monthKey],
    queryFn: () => apiClient.get<RosterEntry[]>('/schedules/roster'),
  });

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else setMonth(month + 1);
  };

  // Hardcoded roster data untuk mock
  const roster: RosterEntry[] = data ?? [
    {
      id: 1,
      paramedicId: 1,
      paramedicName: 'Muhammad Suryani',
      month: monthKey,
      messDays: 18,
      nonMessDays: 6,
      assignments: [
        { date: '2026-07-01', type: 'MESS', location: 'Mess A' },
        { date: '2026-07-03', type: 'NON_MESS', location: 'Satui' },
        { date: '2026-07-05', type: 'MESS', location: 'Mess B' },
      ],
    },
    {
      id: 2,
      paramedicId: 4,
      paramedicName: 'Agung Priambara',
      month: monthKey,
      messDays: 15,
      nonMessDays: 4,
      assignments: [
        { date: '2026-07-02', type: 'MESS', location: 'Mess C' },
        { date: '2026-07-04', type: 'NON_MESS', location: 'Satui' },
      ],
    },
    {
      id: 3,
      paramedicId: 5,
      paramedicName: 'Rina Andriani',
      month: monthKey,
      messDays: 20,
      nonMessDays: 8,
      assignments: [
        { date: '2026-07-01', type: 'MESS', location: 'Mess GL' },
        { date: '2026-07-06', type: 'NON_MESS', location: 'Satui' },
      ],
    },
  ];

  return (
    <AppShell title="Roster Paramedis">
      {/* Navigasi bulan */}
      <div className="mb-5 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="flex h-11 w-11 items-center justify-center rounded-md border-2 border-ink-900 bg-white"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <h2 className="font-display text-title text-ink-900">{formatMonth(monthKey)}</h2>
        <button
          type="button"
          onClick={nextMonth}
          className="flex h-11 w-11 items-center justify-center rounded-md border-2 border-ink-900 bg-white"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </div>

      {/* Ringkasan */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <p className="font-display text-xl font-semibold text-ink-900">{roster.length}</p>
          <p className="text-xs text-ink-500">Paramedis</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="font-display text-xl font-semibold text-ink-900">
            {roster.reduce((s, r) => s + r.messDays, 0)}
          </p>
          <p className="text-xs text-ink-500">Hari Mess</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="font-display text-xl font-semibold text-ink-900">
            {roster.reduce((s, r) => s + r.nonMessDays, 0)}
          </p>
          <p className="text-xs text-ink-500">Hari Rumah</p>
        </Card>
      </div>

      {/* Daftar roster */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {roster.map((r) => (
            <RosterCard key={r.id} entry={r} />
          ))}
        </div>
      )}

      <Button size="full" className="mt-5" onClick={() => alert('Tambah roster — Fase 5 backend')}>
        <Plus className="h-5 w-5" strokeWidth={1.75} />
        Tambah Roster
      </Button>
    </AppShell>
  );
}

function RosterCard({ entry }: { entry: RosterEntry }) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="overflow-hidden p-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-4 px-4 py-3 text-left"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border-2 border-ink-900 bg-primary-100">
          <span className="font-display text-sm font-semibold text-primary-900">
            {entry.paramedicName.charAt(0)}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-ink-900">{entry.paramedicName}</p>
          <p className="text-xs text-ink-500">
            Mess {entry.messDays} hari · Rumah {entry.nonMessDays} hari
          </p>
        </div>
        <div className="flex items-center gap-3 text-right">
          <div>
            <p className="font-mono text-sm text-ink-900">{entry.messDays + entry.nonMessDays}</p>
            <p className="text-xs text-ink-500">total</p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              alert(`Hapus roster ${entry.paramedicName}`);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-sm border-2 border-ink-900 bg-white"
            aria-label={`Hapus roster ${entry.paramedicName}`}
          >
            <Trash2 className="h-3.5 w-3.5 text-danger-700" strokeWidth={2} />
          </button>
        </div>
      </button>

      {open ? (
        <div className="border-t-2 border-ink-200 px-4 py-3">
          <p className="mb-2 text-xs font-medium text-ink-500">Detail Penugasan</p>
          <div className="flex flex-col gap-1.5">
            {entry.assignments.map((a, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-sm border-2 border-ink-200 bg-ink-50 px-3 py-1.5"
              >
                <span className="text-sm text-ink-900">{a.date}</span>
                <span
                  className={cn(
                    'rounded-sm px-1.5 py-0.5 text-xs font-medium',
                    a.type === 'MESS'
                      ? 'bg-primary-100 text-primary-900'
                      : 'bg-signal-100 text-signal-700',
                  )}
                >
                  {a.type === 'MESS' ? 'Mess' : 'Rumah'} · {a.location}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </Card>
  );
}
