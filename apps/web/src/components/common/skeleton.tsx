import { cn } from '@/lib/utils';

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('animate-pulse rounded-md bg-ink-200', className)} />;
}

export function SkeletonCard() {
  return (
    <div className="flex overflow-hidden rounded-md border-2 border-ink-300">
      <div className="w-2 shrink-0 bg-ink-200" />
      <div className="flex-1 space-y-3 p-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-3.5 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-full rounded-md" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-6 w-32" />
          <div className="rounded-md border-2 border-ink-200 p-4">
            <div className="space-y-2.5">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
