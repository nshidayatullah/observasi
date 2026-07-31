import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { ROLE_LABEL } from '@observasi/shared';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/auth-context';

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('darkMode', String(dark));
  }, [dark]);

  return [dark, () => setDark((v) => !v)] as const;
}

export default function ProfilePage() {
  const { user, clearSession } = useAuth();
  const [dark, toggleDark] = useDarkMode();

  if (!user) return null;

  return (
    <AppShell title="Profil">
      <div className="rounded-md border-2 border-ink-900 bg-white p-4 shadow-card">
        <p className="font-display text-lg font-semibold text-ink-900">{user.name}</p>
        <p className="text-sm text-ink-500">{user.email}</p>
        <p className="mt-1 text-sm text-ink-500">{ROLE_LABEL[user.role]}</p>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-md border-2 border-ink-900 bg-white p-4 shadow-card">
        <span className="text-sm font-medium text-ink-900">Mode Gelap</span>
        <button
          type="button"
          onClick={toggleDark}
          className={cn(
            'h-7 w-12 rounded-full border-2 border-ink-900 transition-colors',
            dark ? 'bg-primary-500' : 'bg-ink-200',
          )}
          aria-label={dark ? 'Nonaktifkan mode gelap' : 'Aktifkan mode gelap'}
        >
          <span
            className={cn(
              'mt-0.5 block h-4 w-4 rounded-full border-2 border-ink-900 bg-white transition-transform',
              dark ? 'translate-x-6' : 'translate-x-0.5',
            )}
          />
        </button>
      </div>

      <Button variant="secondary" size="full" className="mt-6" onClick={() => clearSession()}>
        Keluar
      </Button>
    </AppShell>
  );
}
