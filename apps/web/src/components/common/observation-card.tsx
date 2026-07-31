import { Link } from 'react-router';
import { OBSERVATION_STATUS_LABEL, type ObservationStatus } from '@observasi/shared';
import { formatTime } from '@/lib/format';
import { cn } from '@/lib/utils';

type ObservationCardProps = {
  id: number;
  title: string;
  subtitle: string;
  createdAt: string;
  hasFinding: boolean;
  status: ObservationStatus;
};

const RAIL_COLOR: Record<string, string> = {
  finding: 'bg-signal-500',
  pending: 'bg-primary-500',
  APPROVED: 'bg-success-500',
  REJECTED: 'bg-danger-500',
};

export function ObservationCard({
  id,
  title,
  subtitle,
  createdAt,
  hasFinding,
  status,
}: ObservationCardProps) {
  const railKey = status === 'PENDING' ? (hasFinding ? 'finding' : 'pending') : status;

  return (
    <Link
      to={`/observasi/mess/${id}`}
      className="flex overflow-hidden rounded-md border-2 border-ink-900 bg-white shadow-card"
    >
      <span
        className={cn('w-2 shrink-0 border-r-2 border-ink-900', RAIL_COLOR[railKey])}
        aria-hidden
      />
      <div className="flex-1 p-3">
        <div className="flex items-center justify-between">
          <span className="font-medium text-ink-900">{title}</span>
          <span className="font-mono text-sm text-ink-500">{formatTime(createdAt)}</span>
        </div>
        <p className="text-sm text-ink-500">{subtitle}</p>
        <div className="mt-1 flex items-center gap-2 text-sm">
          {hasFinding ? (
            <span className="rounded-sm border-2 border-ink-900 bg-signal-500 px-1.5 py-0.5 text-xs font-medium text-ink-900">
              Ada Temuan
            </span>
          ) : (
            <span className="text-ink-500">Tertib</span>
          )}
          <span className="text-ink-500">{OBSERVATION_STATUS_LABEL[status]}</span>
        </div>
      </div>
    </Link>
  );
}
