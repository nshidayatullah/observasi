import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { ROLE_LABEL } from '@observasi/shared';
import { useAuth } from '@/features/auth/auth-context';

export default function ProfilePage() {
  const { user, clearSession } = useAuth();

  if (!user) return null;

  return (
    <AppShell title="Profil">
      <div className="rounded-md border-2 border-ink-900 bg-white p-4 shadow-card">
        <p className="font-display text-lg font-semibold text-ink-900">{user.name}</p>
        <p className="text-sm text-ink-500">{user.email}</p>
        <p className="mt-1 text-sm text-ink-500">{ROLE_LABEL[user.role]}</p>
      </div>

      <Button variant="secondary" size="full" className="mt-6" onClick={() => clearSession()}>
        Keluar
      </Button>
    </AppShell>
  );
}
