import { useState } from 'react';
import { useParams } from 'react-router';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { ApprovalDialog } from '@/components/common/approval-dialog';
import {
  useMessObservationDetail,
  useApproveMessObservation,
  useRejectMessObservation,
} from '@/features/observations/use-mess-observations';
import { useAuth } from '@/features/auth/auth-context';
import { formatDate, formatTime } from '@/lib/format';
import { OBSERVATION_STATUS_LABEL, ROLE } from '@observasi/shared';
import { cn } from '@/lib/utils';

type DialogMode = 'approve' | 'reject' | null;

export default function ObservationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: observation, isLoading } = useMessObservationDetail(Number(id));
  const approve = useApproveMessObservation();
  const reject = useRejectMessObservation();
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);

  const openDialog = (mode: DialogMode) => setDialogMode(mode);
  const closeDialog = () => setDialogMode(null);

  if (isLoading || !observation) {
    return (
      <AppShell title="Observasi Mess" showBack>
        <p className="text-ink-500">Memuat…</p>
      </AppShell>
    );
  }

  const isPending = observation.status === 'PENDING';
  const isDoctor = user?.role === ROLE.DOCTOR;
  const canAct = isDoctor && isPending;

  return (
    <AppShell title="Observasi Mess" showBack>
      {/* Banner status */}
      <div
        className={cn(
          'mb-5 rounded-md border-2 border-ink-900 p-3 font-medium',
          isPending && observation.hasFinding && 'bg-signal-500 text-ink-900',
          isPending && !observation.hasFinding && 'bg-primary-500 text-ink-900',
          observation.status === 'APPROVED' && 'bg-success-500 text-ink-900',
          observation.status === 'REJECTED' && 'bg-danger-500 text-ink-900',
        )}
      >
        {observation.hasFinding ? 'Ada Temuan — ' : 'Tertib — '}
        {OBSERVATION_STATUS_LABEL[observation.status]}
      </div>

      {/* Informasi Dasar */}
      <Section title="Informasi Dasar">
        <Row label="Tanggal" value={formatDate(observation.observationDate)} />
        <Row label="Lokasi" value={`${observation.messComplex} / ${observation.roomNumber}`} />
        <Row label="Petugas" value={observation.officerName ?? observation.paramedicName} />
        <Row label="Dikirim" value={formatTime(observation.createdAt)} />
      </Section>

      {/* Data Karyawan — hanya jika ada temuan */}
      {observation.hasFinding ? (
        <>
          <Section title="Data Karyawan">
            <Row label="Nama" value={observation.employeeName} />
            <Row label="NIK" value={observation.employeeNik} mono />
            <Row label="Perusahaan" value={observation.company} />
            {(observation.position ?? observation.department) ? (
              <Row
                label="Jabatan / Dept."
                value={[observation.position, observation.department].filter(Boolean).join(' — ')}
              />
            ) : null}
            {observation.bloodPressure ? (
              <Row label="Tekanan Darah" value={observation.bloodPressure} mono />
            ) : null}
          </Section>

          {observation.activity ? (
            <Section title="Aktivitas yang Dilakukan">
              <p className="text-sm text-ink-900">{observation.activity}</p>
            </Section>
          ) : null}

          {observation.reason ? (
            <Section title="Alasan Belum Tidur">
              <p className="text-sm text-ink-900">{observation.reason}</p>
            </Section>
          ) : null}
        </>
      ) : null}

      {/* Tombol aksi dokter */}
      {canAct ? (
        <div className="mt-6 flex gap-3">
          <Button variant="danger" className="flex-1" onClick={() => openDialog('reject')}>
            Tolak
          </Button>
          <Button className="flex-1" onClick={() => openDialog('approve')}>
            Setujui
          </Button>
        </div>
      ) : null}

      {/* Dialog persetujuan/penolakan */}
      <ApprovalDialog
        open={dialogMode !== null}
        mode={dialogMode ?? 'approve'}
        subtitle={`${observation.messComplex} / ${observation.roomNumber} · ${observation.employeeName ?? 'Tidak ada temuan'}`}
        loading={dialogMode === 'approve' ? approve.isPending : reject.isPending}
        onCancel={closeDialog}
        onConfirm={(notes) => {
          if (dialogMode === 'approve') {
            approve.mutate({ id: observation.id, notes }, { onSuccess: closeDialog });
          } else if (dialogMode === 'reject') {
            reject.mutate({ id: observation.id, notes }, { onSuccess: closeDialog });
          }
        }}
      />
    </AppShell>
  );
}

/* ── Sub-components ─────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h2 className="font-display text-title text-ink-900">{title}</h2>
      <div className="mt-2 rounded-md border-2 border-ink-900 bg-white">{children}</div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex justify-between border-b-2 border-ink-200 px-4 py-2.5 text-sm last:border-b-0">
      <dt className="shrink-0 text-ink-500">{label}</dt>
      <dd className={cn('ml-3 truncate text-right font-medium text-ink-900', mono && 'font-mono')}>
        {value}
      </dd>
    </div>
  );
}
