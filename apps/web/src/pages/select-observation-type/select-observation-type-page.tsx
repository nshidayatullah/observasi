import { Link } from 'react-router';
import { Building2, Home } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';

export default function SelectObservationTypePage() {
  return (
    <AppShell title="Pilih Tipe Observasi" showBack>
      <div className="flex flex-col gap-4">
        <Link
          to="/observasi/baru/mess"
          className="flex items-start gap-3 rounded-md border-[3px] border-ink-900 bg-white p-4 shadow-raised"
        >
          <Building2 className="h-8 w-8 shrink-0" strokeWidth={1.75} />
          <div>
            <p className="font-display text-lg font-semibold text-ink-900">Karyawan Mess</p>
            <p className="text-sm text-ink-500">Sidak jam istirahat di mess perusahaan</p>
          </div>
        </Link>

        <Link
          to="/observasi/baru/non-mess"
          className="flex items-start gap-3 rounded-md border-[3px] border-ink-900 bg-white p-4 shadow-raised"
        >
          <Home className="h-8 w-8 shrink-0" strokeWidth={1.75} />
          <div>
            <p className="font-display text-lg font-semibold text-ink-900">Kunjungan Rumah</p>
            <p className="text-sm text-ink-500">Karyawan yang tinggal di luar mess</p>
          </div>
        </Link>
      </div>
    </AppShell>
  );
}
