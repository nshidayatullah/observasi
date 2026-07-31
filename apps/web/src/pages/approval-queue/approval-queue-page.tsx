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

type Grouped = { date: string; paramedics: { name: string; items: MessObservation[] }[] };

export default function ApprovalQueuePage() {
  const { data: observations, isLoading } = useMessObservations({ status: 'PENDING' });
  const approve = useApproveMessObservation();

  const grouped = useMemo(() => {
    if (!observations) return [];
    const map = new Map<string, Map<string, MessObservation[]>>();
    for (const o of observations) {
      const d = map.get(o.observationDate) ?? new Map();
      const p = d.get(o.paramedicName) ?? [];
      p.push(o);
      d.set(o.paramedicName, p);
      map.set(o.observationDate, d);
    }
    const result: Grouped[] = [];
    for (const [date, pmap] of [...map].sort((a, b) => b[0].localeCompare(a[0]))) {
      result.push({ date, paramedics: [...pmap].map(([name, items]) => ({ name, items })) });
    }
    return result;
  }, [observations]);

  const approveAll = (ids: number[]) => {
    for (const id of ids) approve.mutate({ id });
  };

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
              <p className="text-sm text-ink-500">Hari</p>
            </Card>
          </div>

          {grouped.map((g) => (
            <div key={g.date}>
              <h2 className="font-display text-subtitle font-semibold text-ink-700 border-b-2 border-ink-200 pb-1 mb-3">
                {formatDate(g.date)}
              </h2>

              <div className="flex flex-col gap-4">
                {g.paramedics.map((p) => (
                  <Card key={p.name} className="overflow-hidden p-0">
                    {/* Header per paramedic */}
                    <div className="flex items-center justify-between border-b-2 border-ink-200 bg-ink-100 px-4 py-2.5">
                      <div>
                        <p className="text-sm font-semibold text-ink-900">{p.name}</p>
                        <p className="text-xs text-ink-500">{p.items.length} observasi</p>
                      </div>
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={approve.isPending}
                        onClick={() => approveAll(p.items.map((o) => o.id))}
                      >
                        <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
                        Setujui Semua
                      </Button>
                    </div>

                    {/* Daftar observasi */}
                    <div className="flex flex-col">
                      {p.items.map((o) => (
                        <Link
                          key={o.id}
                          to={`/observasi/mess/${o.id}`}
                          className="flex items-center justify-between border-b-2 border-ink-200 px-4 py-3 last:border-b-0 hover:bg-ink-50 transition-colors"
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
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
