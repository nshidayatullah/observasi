import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/common/empty-state';
import { SkeletonCard } from '@/components/common/skeleton';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { CalendarDays, MapPin } from 'lucide-react';

type ScheduleItem = {
  id: number;
  date: string;
  shift: string;
  locationType: string;
  locationName: string;
  targetCount: number;
  completedCount: number;
};

export default function SchedulePage() {
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
