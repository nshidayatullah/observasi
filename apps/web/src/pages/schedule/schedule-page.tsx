import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, MapPin, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
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

type CalendarDay = {
  day: number;
  date: string; // YYYY-MM-DD
  isCurrentMonth: boolean;
  assignments: { name: string; type: 'MESS' | 'NON_MESS'; location: string }[];
};

const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function formatMonth(ym: string) {
  const [y, m] = ym.split('-');
  return `${MONTHS[Number(m) - 1]} ${y}`;
}

function shortName(name: string) {
  const parts = name.split(' ');
  return parts.length > 1 ? parts[0]![0]! + parts[1]![0]! : parts[0]!.slice(0, 2).toUpperCase();
}

function buildCalendar(year: number, month: number, roster: RosterEntry[]): CalendarDay[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0=Minggu -> kita ubah ke 0=Senin
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Hari mulai Senin

  // Map assignments by date
  const byDate = new Map<string, CalendarDay['assignments']>();
  for (const r of roster) {
    for (const a of r.assignments) {
      const entry = byDate.get(a.date) ?? [];
      entry.push({ name: r.paramedicName, type: a.type, location: a.location });
      byDate.set(a.date, entry);
    }
  }

  const days: CalendarDay[] = [];

  // Hari kosong sebelum tanggal 1
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevDays = new Date(prevYear, prevMonth, 0).getDate();
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = prevDays - i;
    const date = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ day: d, date, isCurrentMonth: false, assignments: byDate.get(date) ?? [] });
  }

  // Hari bulan ini
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ day: d, date, isCurrentMonth: true, assignments: byDate.get(date) ?? [] });
  }

  // Hari setelah akhir bulan
  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    for (let d = 1; d <= remaining; d++) {
      const date = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, date, isCurrentMonth: false, assignments: byDate.get(date) ?? [] });
    }
  }

  return days;
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
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

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

  const roster: RosterEntry[] = data ?? [];

  const calendar = useMemo(() => buildCalendar(year, month, roster), [year, month, roster]);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <AppShell title="Roster Paramedis">
      {/* Navigasi bulan */}
      <div className="mb-4 flex items-center justify-between">
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
      <div className="mb-4 grid grid-cols-3 gap-2">
        <Card className="p-2 text-center">
          <p className="font-display text-lg font-semibold text-ink-900">{roster.length}</p>
          <p className="text-[11px] text-ink-500">Paramedis</p>
        </Card>
        <Card className="p-2 text-center">
          <p className="font-display text-lg font-semibold text-ink-900">
            {roster.reduce((s, r) => s + r.messDays, 0)}
          </p>
          <p className="text-[11px] text-ink-500">Hari Mess</p>
        </Card>
        <Card className="p-2 text-center">
          <p className="font-display text-lg font-semibold text-ink-900">
            {roster.reduce((s, r) => s + r.nonMessDays, 0)}
          </p>
          <p className="text-[11px] text-ink-500">Hari Rumah</p>
        </Card>
      </div>

      {/* Legenda */}
      <div className="mb-3 flex gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm border border-ink-900 bg-primary-500" />{' '}
          Mess
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm border border-ink-900 bg-signal-500" />{' '}
          Rumah
        </span>
        <span className="flex items-center gap-1.5 text-ink-500">
          <span className="inline-block h-2.5 w-2.5 rounded-sm border border-ink-300 bg-ink-100" />{' '}
          Libur
        </span>
      </div>

      {/* Kalender */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border-2 border-ink-900">
          {/* Header hari */}
          <div className="grid grid-cols-7 bg-ink-900 text-white">
            {DAYS.map((d) => (
              <div key={d} className="py-1.5 text-center text-[11px] font-medium">
                {d}
              </div>
            ))}
          </div>

          {/* Grid tanggal */}
          <div className="grid grid-cols-7">
            {calendar.map((cell, i) => {
              const isToday = cell.date === today;

              return (
                <button
                  type="button"
                  key={i}
                  onClick={() => cell.assignments.length > 0 && setSelectedDay(cell)}
                  className={cn(
                    'min-h-[72px] w-full border-b border-r border-ink-200 p-1 text-left transition-colors',
                    cell.assignments.length > 0 && 'cursor-pointer hover:bg-ink-100',
                    (i + 1) % 7 === 0 && 'border-r-0',
                    !cell.isCurrentMonth && 'bg-ink-50 opacity-40',
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex h-5 w-5 items-center justify-center rounded-sm text-[11px] font-medium',
                      isToday &&
                        cell.isCurrentMonth &&
                        'border border-ink-900 bg-primary-500 text-ink-900',
                      !cell.isCurrentMonth && 'text-ink-400',
                    )}
                  >
                    {cell.day}
                  </span>

                  {/* Assignment dots */}
                  <div className="mt-0.5 flex flex-wrap gap-0.5">
                    {cell.assignments.slice(0, 4).map((a, j) => (
                      <span
                        key={j}
                        title={`${a.name} — ${a.type === 'MESS' ? 'Mess' : 'Rumah'} · ${a.location}`}
                        className={cn(
                          'block truncate rounded-sm px-1 py-px text-[10px] font-medium leading-tight',
                          a.type === 'MESS'
                            ? 'bg-primary-500 text-ink-900'
                            : 'bg-signal-500 text-ink-900',
                        )}
                      >
                        {shortName(a.name)}
                      </span>
                    ))}
                    {cell.assignments.length > 4 ? (
                      <span className="text-[10px] text-ink-500">
                        +{cell.assignments.length - 4}
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal detail hari */}
      {selectedDay ? <DayModal day={selectedDay} onClose={() => setSelectedDay(null)} /> : null}

      <Button size="full" className="mt-5" onClick={() => alert('Tambah roster — Fase 5 backend')}>
        <Plus className="h-5 w-5" strokeWidth={1.75} />
        Tambah Roster
      </Button>
    </AppShell>
  );
}

/* ── Modal detail hari ──────────────────────────────────── */

function DayModal({ day, onClose }: { day: CalendarDay; onClose: () => void }) {
  const dateStr = new Date(day.date + 'T00:00:00').toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/60 md:items-center"
      onClick={onClose}
    >
      <div
        className="flex w-full flex-col gap-4 rounded-t-lg border-t-[3px] border-x-[3px] border-ink-900 bg-white p-5 shadow-sheet md:w-80 md:rounded-lg md:border-[3px] md:shadow-raised"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto h-1.5 w-10 rounded-full bg-ink-300 md:hidden" />
        <div className="flex items-center justify-between">
          <h3 className="font-display text-subtitle text-ink-900">{dateStr}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
        {day.assignments.length === 0 ? (
          <p className="text-sm text-ink-500">Tidak ada penugasan.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {day.assignments.map((a, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-center justify-between rounded-md border-2 border-ink-900 p-3',
                  a.type === 'MESS' ? 'bg-primary-500' : 'bg-signal-500',
                )}
              >
                <div>
                  <p className="text-sm font-medium text-ink-900">{a.name}</p>
                  <p className="text-xs text-ink-900/70">{a.location}</p>
                </div>
                <span className="rounded-sm border-2 border-ink-900 bg-white px-2 py-0.5 text-xs font-medium text-ink-900">
                  {a.type === 'MESS' ? 'Mess' : 'Kunjungan Rumah'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
