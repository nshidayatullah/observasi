import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { ROLE_LABEL, USER_STATUS_LABEL } from '@observasi/shared';
import { useUsers } from '@/features/users/use-users';

export default function UserListPage() {
  const { data: users, isLoading } = useUsers();

  return (
    <AppShell title="Pengguna">
      {isLoading ? (
        <p className="text-ink-500">Memuat…</p>
      ) : (
        <div className="flex flex-col gap-3">
          {users?.map((u) => (
            <Card key={u.id} className="p-3">
              <p className="font-medium text-ink-900">{u.name}</p>
              <p className="text-sm text-ink-500">{u.email}</p>
              <div className="mt-1 flex gap-2">
                <span className="rounded-sm border-2 border-ink-900 bg-primary-100 px-1.5 py-0.5 text-xs font-medium text-ink-900">
                  {ROLE_LABEL[u.role]}
                </span>
                <span className="rounded-sm border-2 border-ink-900 bg-ink-100 px-1.5 py-0.5 text-xs font-medium text-ink-900">
                  {USER_STATUS_LABEL[u.status]}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
