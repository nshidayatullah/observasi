import { Link } from 'react-router';
import { Users, Building2, Grid3x3, MapPin } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';

const ITEMS = [
  {
    to: '/manajemen/pengguna',
    label: 'Master User',
    desc: 'Kelola akun paramedis, dokter, superadmin',
    icon: Users,
  },
  {
    to: '/manajemen/mess',
    label: 'Master Mess',
    desc: 'Komplek & nomor kamar mess',
    icon: Building2,
  },
  { to: '/manajemen/blok', label: 'Master Blok', desc: 'Blok area observasi', icon: Grid3x3 },
  { to: '/manajemen/lokasi', label: 'Master Lokasi', desc: 'Lokasi kunjungan rumah', icon: MapPin },
];

export default function ManajemenPage() {
  return (
    <AppShell title="Manajemen">
      <div className="flex flex-col gap-3">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-start gap-4 rounded-md border-[3px] border-ink-900 bg-white p-4 shadow-card active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border-2 border-ink-900 bg-primary-100">
                <Icon className="h-5 w-5 text-primary-900" strokeWidth={1.75} />
              </div>
              <div>
                <p className="font-medium text-ink-900">{item.label}</p>
                <p className="text-sm text-ink-500">{item.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
