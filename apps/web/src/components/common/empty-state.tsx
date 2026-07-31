import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  action?: ReactNode;
};

export function EmptyState({ title, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border-2 border-dashed border-ink-300 p-8 text-center">
      <p className="text-ink-500">{title}</p>
      {action}
    </div>
  );
}
