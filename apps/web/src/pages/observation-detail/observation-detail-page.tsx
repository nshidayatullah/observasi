import { useParams } from 'react-router';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import {
  useMessObservationDetail,
  useApproveMessObservation,
  useRejectMessObservation,
} from '@/features/observations/use-mess-observations';
import { useAuth } from '@/features/auth/auth-context';
import { formatDate, formatTime } from '@/lib/format';
import { ROLE } from '@observasi/shared';

export default function ObservationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: observation, isLoading } = useMessObservationDetail(Number(id));
  const approve = useApproveMessObservation();
  const reject = useRejectMessObservation();

  if (isLoading || !observation) {
    return (
      <AppShell title="Observasi Mess" showBack>
        <p className="text-ink-500">Memuat…</p>
      </AppShell>
    );
  }

  const rows: [string, string][] = [
    ['Tanggal', formatDate(observation.observationDate)],
    ['Lokasi', `${observation.messComplex} / ${observation.roomNumber}`],
    ['Petugas', observation.paramedicName],
    ['Dikirim', formatTime(observation.createdAt)],
  ];

  return (
    <AppShell title="Observasi Mess" showBack>
      {observation.hasFinding ? (
        <div className="mb-4 flex items-center gap-2 rounded-md border-2 border-ink-900 bg-signal-500 p-3 font-medium text-ink-900">
          Ada Temuan —{' '}
          {observation.status === 'PENDING' ? 'Menunggu persetujuan' : observation.status}
        </div>
      ) : null}

      <h2 className="font-display text-lg font-semibold text-ink-900">Informasi Dasar</h2>
      <dl className="mt-2 divide-y divide-ink-200">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between py-2 text-sm">
            <dt className="text-ink-500">{label}</dt>
            <dd className="font-medium text-ink-900">{value}</dd>
          </div>
        ))}
      </dl>

      {observation.hasFinding ? (
        <>
          <h2 className="font-display mt-6 text-lg font-semibold text-ink-900">Data Karyawan</h2>
          <dl className="mt-2 divide-y divide-ink-200">
            <div className="flex justify-between py-2 text-sm">
              <dt className="text-ink-500">Nama</dt>
              <dd className="font-medium text-ink-900">{observation.employeeName}</dd>
            </div>
            <div className="flex justify-between py-2 text-sm">
              <dt className="text-ink-500">NIK</dt>
              <dd className="font-mono font-medium text-ink-900">{observation.employeeNik}</dd>
            </div>
            <div className="flex justify-between py-2 text-sm">
              <dt className="text-ink-500">Tekanan Darah</dt>
              <dd className="font-mono font-medium text-ink-900">{observation.bloodPressure}</dd>
            </div>
          </dl>
          <h2 className="font-display mt-6 text-lg font-semibold text-ink-900">Aktivitas</h2>
          <p className="mt-2 text-ink-900">{observation.activity}</p>
          <h2 className="font-display mt-6 text-lg font-semibold text-ink-900">
            Alasan Belum Tidur
          </h2>
          <p className="mt-2 text-ink-900">{observation.reason}</p>
        </>
      ) : null}

      {user?.role === ROLE.DOCTOR && observation.status === 'PENDING' ? (
        <div className="mt-6 flex gap-3">
          <Button
            variant="danger"
            className="flex-1"
            disabled={reject.isPending}
            onClick={() => reject.mutate({ id: observation.id, notes: 'Ditolak dari detail' })}
          >
            Tolak
          </Button>
          <Button
            className="flex-1"
            disabled={approve.isPending}
            onClick={() => approve.mutate({ id: observation.id })}
          >
            Setujui
          </Button>
        </div>
      ) : null}
    </AppShell>
  );
}
