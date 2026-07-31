import { useMemo } from 'react';
import { Link } from 'react-router';
import { CheckCircle2 } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/empty-state';
import {
  useMessObservations,
  useApproveMessObservation,
} from '@/features/observations/use-mess-observations';
import { formatDate } from '@/lib/format';
import type { MessObservation } from '@/features/observations/types';

type Grouped = { name: string; days: { date: string; items: MessObservation[] }[]; total: number };

export default function ApprovalQueuePage() {
  const { data: observations, isLoading } = useMessObservations({ status: 'PENDING' });
  const approve = useApproveMessObservation();

  const grouped = useMemo(() => {
    if (!observations) return [];
    const map = new Map<string, Map<string, MessObservation[]>>();
    for (const o of observations) {
      const pm = map.get(o.paramedicName) ?? new Map();
      const arr = pm.get(o.observationDate) ?? [];
      arr.push(o);
      pm.set(o.observationDate, arr);
      map.set(o.paramedicName, pm);
    }
    const result: Grouped[] = [];
    for (const [name, dmap] of map) {
      const days = [...dmap]
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([date, items]) => ({ date, items }));
      result.push({ name, days, total: days.reduce((s, d) => s + d.items.length, 0) });
    }
    return result;
  }, [observations]);

  return (
    <AppShell title="Persetujuan">
      {isLoading ? (
        <p className="text-ink-500">Memuat…</p>
      ) : !observations || observations.length === 0 ? (
        <EmptyState title="Tidak ada observasi menunggu persetujuan." />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3 text-center">
              <p className="font-display text-2xl font-semibold text-ink-900">
                {observations.length}
              </p>
              <p className="text-sm text-ink-500">Menunggu</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="font-display text-2xl font-semibold text-ink-900">{grouped.length}</p>
              <p className="text-sm text-ink-500">Paramedis</p>
            </Card>
          </div>

          {grouped.map((g) => (
            <Card key={g.name} className="overflow-hidden p-0">
              <div className="flex items-center justify-between border-b-2 border-ink-900 bg-ink-100 px-4 py-3">
                <div>
                  <p className="font-semibold text-ink-900">{g.name}</p>
                  <p className="text-xs text-ink-500">
                    {g.total} obs · {g.days.length} hari
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  disabled={approve.isPending}
                  onClick={() => {
                    for (const d of g.days) for (const o of d.items) approve.mutate({ id: o.id });
                  }}
                >
                  <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
                  Setujui Semua
                </Button>
              </div>

              {g.days.map((d) => (
                <div key={d.date}>
                  <div className="border-b border-ink-200 bg-ink-50 px-4 py-1.5">
                    <span className="text-xs font-medium text-ink-500">{formatDate(d.date)}</span>
                    <span className="ml-2 text-xs text-ink-400">{d.items.length} obs</span>
                  </div>
                  {d.items.map((o) => (
                    <Link
                      key={o.id}
                      to={`/observasi/mess/${o.id}`}
                      className="flex items-center justify-between border-b border-ink-200 px-4 py-2.5 last:border-b-0 hover:bg-ink-50 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ink-900">
                          {o.messComplex} / {o.roomNumber}
                        </p>
                        <p className="truncate text-xs text-ink-500">
                          {o.employeeName ?? 'Tidak ada temuan'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {o.hasFinding ? (
                          <span className="rounded-sm border-2 border-ink-900 bg-signal-500 px-1.5 py-0.5 text-[11px] font-medium text-ink-900">
                            Ada Temuan
                          </span>
                        ) : (
                          <span className="text-xs text-ink-500">Tertib</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ))}
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
