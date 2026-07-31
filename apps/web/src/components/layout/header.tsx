import { ArrowLeft, CloudOff } from 'lucide-react';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/utils';

type HeaderProps = {
  title: string;
  showBack?: boolean;
  syncQueueCount?: number;
};

export function Header({ title, showBack = false, syncQueueCount = 0 }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b-[3px] border-ink-900 bg-white px-4">
      {showBack ? (
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Kembali"
          className="flex h-11 w-11 items-center justify-center"
        >
          <ArrowLeft className="h-6 w-6" strokeWidth={1.75} />
        </button>
      ) : null}
      <h1 className="font-display flex-1 truncate text-lg font-semibold text-ink-900">{title}</h1>
      {syncQueueCount > 0 ? (
        <span
          className={cn(
            'flex items-center gap-1 rounded-sm border-2 border-ink-900 bg-offline-100 px-2 py-1 text-xs font-medium text-ink-900',
          )}
          aria-label={`${syncQueueCount} observasi menunggu sinkronisasi`}
        >
          <CloudOff className="h-4 w-4" strokeWidth={1.75} />
          {syncQueueCount}
        </span>
      ) : null}
    </header>
  );
}
