import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus, MoreVertical } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/empty-state';
import { ROLE_LABEL, USER_STATUS_LABEL, USER_STATUS } from '@observasi/shared';
import { useUsers } from '@/features/users/use-users';
import { cn } from '@/lib/utils';

export default function UserListPage() {
  const navigate = useNavigate();
  const { data: users, isLoading } = useUsers();
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  return (
    <AppShell title="Pengguna">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink-500">{users ? `${users.length} pengguna` : 'Memuat…'}</p>
        <Button size="sm" onClick={() => navigate('/manajemen/pengguna/baru')}>
          <Plus className="h-4 w-4" strokeWidth={2} />
          Tambah
        </Button>
      </div>

      {isLoading ? (
        <p className="text-ink-500">Memuat…</p>
      ) : !users || users.length === 0 ? (
        <EmptyState title="Belum ada pengguna." />
      ) : (
        <div className="flex flex-col gap-3">
          {users.map((u) => (
            <Card key={u.id} className="relative p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink-900">{u.name}</p>
                  <p className="truncate text-sm text-ink-500">{u.email}</p>
                  {u.lastLoginAt ? (
                    <p className="mt-0.5 text-xs text-ink-500">
                      Login terakhir:{' '}
                      {new Date(u.lastLoginAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-xs text-ink-500">Belum pernah login</p>
                  )}
                </div>

                {/* Menu aksi */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenMenu(openMenu === u.id ? null : u.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-sm border-2 border-ink-900 bg-white"
                    aria-label={`Aksi untuk ${u.name}`}
                  >
                    <MoreVertical className="h-4 w-4" strokeWidth={2} />
                  </button>

                  {openMenu === u.id ? (
                    <UserMenu
                      userName={u.name}
                      status={u.status}
                      onClose={() => setOpenMenu(null)}
                    />
                  ) : null}
                </div>
              </div>

              <div className="mt-2 flex gap-2">
                <span className="rounded-sm border-2 border-ink-900 bg-primary-100 px-1.5 py-0.5 text-xs font-medium text-ink-900">
                  {ROLE_LABEL[u.role]}
                </span>
                <span
                  className={cn(
                    'rounded-sm border-2 border-ink-900 px-1.5 py-0.5 text-xs font-medium text-ink-900',
                    u.status === USER_STATUS.ACTIVE && 'bg-success-100',
                    u.status === USER_STATUS.INACTIVE && 'bg-ink-200',
                    u.status === USER_STATUS.LOCKED && 'bg-signal-100',
                  )}
                >
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

/* ── Dropdown Menu ──────────────────────────────────────── */

function UserMenu({
  userName,
  status,
  onClose,
}: {
  userName: string;
  status: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const isActive = status === USER_STATUS.ACTIVE;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-10 z-30 w-44 rounded-md border-[3px] border-ink-900 bg-white py-1 shadow-raised"
    >
      <MenuBtn
        label="Reset Password"
        onClick={() => {
          alert(`Password ${userName} direset.`);
          onClose();
        }}
      />
      {isActive ? (
        <MenuBtn
          label="Nonaktifkan"
          danger
          onClick={() => {
            alert(`${userName} dinonaktifkan.`);
            onClose();
          }}
        />
      ) : (
        <MenuBtn
          label="Aktifkan"
          onClick={() => {
            alert(`${userName} diaktifkan.`);
            onClose();
          }}
        />
      )}
      <div className="my-0.5 border-t-2 border-ink-200" />
      <MenuBtn
        label="Hapus"
        danger
        onClick={() => {
          alert(`${userName} dihapus.`);
          onClose();
        }}
      />
    </div>
  );
}

function MenuBtn({
  label,
  danger,
  onClick,
}: {
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'block w-full px-4 py-2 text-left text-sm font-medium transition-colors hover:bg-ink-100',
        danger ? 'text-danger-700' : 'text-ink-900',
      )}
    >
      {label}
    </button>
  );
}
