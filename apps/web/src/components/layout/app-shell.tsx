import type { ReactNode } from 'react';
import { Header } from './header';
import { BottomNav } from './bottom-nav';

type AppShellProps = {
  title: string;
  showBack?: boolean;
  syncQueueCount?: number;
  children: ReactNode;
};

export function AppShell({ title, showBack, syncQueueCount, children }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-ink-50">
      <Header title={title} showBack={showBack} syncQueueCount={syncQueueCount} />
      <main className="px-4 pb-24 pt-4 lg:px-6">{children}</main>
      <BottomNav />
    </div>
  );
}
