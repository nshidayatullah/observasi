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
  sync: 'bg-offline-500',
};

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-white',
  APPROVED: 'bg-success-500 text-ink-900',
  REJECTED: 'bg-danger-500 text-ink-900',
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
      className="flex rounded-r-md border-2 border-l-0 border-ink-900 bg-white shadow-card transition-shadow active:shadow-none"
    >
      {/* Status Rail — 8px solid, elemen tanda tangan neo-brutalism (§1.3, §5.4) */}
      <span
        className={cn(
          'inline-block w-2 shrink-0 self-stretch rounded-l-sm border-r-2 border-ink-900',
          RAIL_COLOR[railKey],
        )}
        aria-hidden
      />

      <div className="flex flex-1 items-start gap-3 p-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-ink-900">{title}</p>
          <p className="truncate text-sm text-ink-500">{subtitle}</p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className="font-mono text-sm leading-none text-ink-500">
            {formatTime(createdAt)}
          </span>
          <div className="flex flex-wrap justify-end gap-1">
            {hasFinding ? (
              <span className="rounded-sm border-2 border-ink-900 bg-signal-500 px-1.5 py-0.5 text-xs font-medium leading-none text-ink-900">
                Ada Temuan
              </span>
            ) : null}
            <span
              className={cn(
                'rounded-sm border-2 border-ink-900 px-1.5 py-0.5 text-xs font-medium leading-none',
                STATUS_BADGE[status] ?? 'bg-white text-ink-900',
              )}
            >
              {OBSERVATION_STATUS_LABEL[status]}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
