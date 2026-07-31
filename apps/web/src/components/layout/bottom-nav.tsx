import { NavLink } from 'react-router';
import { Home, ClipboardList, CalendarDays, User, Stethoscope, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/auth-context';
import { ROLE } from '@observasi/shared';

type NavItem = {
  to: string;
  label: string;
  icon: typeof Home;
};

const PARAMEDIC_ITEMS: NavItem[] = [
  { to: '/beranda', label: 'Beranda', icon: Home },
  { to: '/observasi', label: 'Observasi', icon: ClipboardList },
  { to: '/jadwal', label: 'Jadwal', icon: CalendarDays },
  { to: '/profil', label: 'Profil', icon: User },
];

const DOCTOR_ITEMS: NavItem[] = [
  { to: '/beranda', label: 'Beranda', icon: Home },
  { to: '/persetujuan', label: 'Persetujuan', icon: Stethoscope },
  { to: '/observasi', label: 'Observasi', icon: ClipboardList },
  { to: '/profil', label: 'Profil', icon: User },
];

const SUPERADMIN_ITEMS: NavItem[] = [
  { to: '/beranda', label: 'Beranda', icon: Home },
  { to: '/pengguna', label: 'Pengguna', icon: Users },
  { to: '/jadwal', label: 'Jadwal', icon: CalendarDays },
  { to: '/observasi', label: 'Observasi', icon: ClipboardList },
  { to: '/profil', label: 'Profil', icon: User },
];

export function BottomNav() {
  const { user } = useAuth();
  const items =
    user?.role === ROLE.DOCTOR
      ? DOCTOR_ITEMS
      : user?.role === ROLE.SUPERADMIN
        ? SUPERADMIN_ITEMS
        : PARAMEDIC_ITEMS;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 flex h-16 border-t-[3px] border-ink-900 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Navigasi utama"
    >
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium',
              isActive ? 'text-primary-700' : 'text-ink-500',
            )
          }
        >
          <Icon className="h-6 w-6" strokeWidth={1.75} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
