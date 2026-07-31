import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/app-shell';
import { apiClient } from '@/lib/api-client';
import { formatDate, formatTime } from '@/lib/format';
import { OBSERVATION_STATUS_LABEL, COMPANY_LABEL, MARITAL_STATUS_LABEL } from '@observasi/shared';
import type { Company, MaritalStatus } from '@observasi/shared';
import { cn } from '@/lib/utils';

type NonMessDetail = {
  id: number;
  type: 'NON_MESS';
  paramedicName: string;
  officerName: string;
  observationDate: string;
  createdAt: string;
  status: string;
  employeeName: string;
  employeeNrp: string;
  birthDate: string;
  maritalStatus: string;
  yearsOfService: string;
  position: string;
  department: string;
  company: Company;
  houseCondition: string;
  wallType: string;
  floorType: string;
  roofType: string;
  roomCount: string;
  sleepHours: string;
  wakeUpTime: string;
  cleanliness: string;
  hasPet: boolean;
  petDetail: string;
  hasNoise: boolean;
  noiseSource: string;
  sleepDisturbance: string;
  respondentName: string;
  respondentAge: string;
  respondentEducation: string;
  respondentRelation: string;
  fatigueUnderstanding: string;
  familyRole: string;
  fatigueRisk: string;
  fatigueCause: string;
  observationLocation: string;
};

export default function NonMessDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: obs, isLoading } = useQuery({
    queryKey: ['observations', 'non-mess', 'detail', Number(id)],
    queryFn: () => apiClient.get<NonMessDetail>(`/observations/non-mess/${id}`),
    enabled: Number.isFinite(Number(id)),
  });

  if (isLoading || !obs) {
    return (
      <AppShell title="Kunjungan Rumah" showBack>
        <p className="text-ink-500">Memuat…</p>
      </AppShell>
    );
  }

  const isPending = obs.status === 'PENDING';

  return (
    <AppShell title="Kunjungan Rumah" showBack>
      <div
        className={cn(
          'mb-5 rounded-md border-2 border-ink-900 p-3 font-medium',
          isPending && 'bg-primary-500 text-ink-900',
          obs.status === 'APPROVED' && 'bg-success-500 text-ink-900',
          obs.status === 'REJECTED' && 'bg-danger-500 text-ink-900',
        )}
      >
        {OBSERVATION_STATUS_LABEL[obs.status as keyof typeof OBSERVATION_STATUS_LABEL]}
      </div>

      <Section title="Informasi Dasar">
        <Row label="Tanggal" value={formatDate(obs.observationDate)} />
        <Row label="Petugas" value={obs.officerName} />
        <Row label="Lokasi" value={obs.observationLocation} />
        <Row label="Dikirim" value={formatTime(obs.createdAt)} />
      </Section>

      <Section title="Data Karyawan">
        <Row label="Nama" value={obs.employeeName} />
        <Row label="NRP" value={obs.employeeNrp} mono />
        <Row label="Tanggal Lahir" value={obs.birthDate} />
        <Row label="Status" value={MARITAL_STATUS_LABEL[obs.maritalStatus as MaritalStatus]} />
        <Row label="Bulan Masuk" value={obs.yearsOfService} />
        <Row
          label="Jabatan / Dept."
          value={[obs.position, obs.department].filter(Boolean).join(' — ')}
        />
        <Row label="Perusahaan" value={COMPANY_LABEL[obs.company]} />
      </Section>

      <Section title="Kondisi Rumah">
        <Row label="Kondisi" value={obs.houseCondition} />
        {obs.wallType ? <Row label="Dinding" value={obs.wallType} /> : null}
        {obs.floorType ? <Row label="Lantai" value={obs.floorType} /> : null}
        {obs.roofType ? <Row label="Atap" value={obs.roofType} /> : null}
        {obs.roomCount ? <Row label="Jumlah Kamar" value={obs.roomCount} /> : null}
        <Row label="Kebersihan" value={obs.cleanliness} />
      </Section>

      <Section title="Aktivitas & Tidur">
        <Row label="Jam Tidur" value={obs.sleepHours} />
        {obs.wakeUpTime ? <Row label="Waktu Bangun" value={obs.wakeUpTime} /> : null}
        {obs.hasPet ? (
          <Row label="Hewan Peliharaan" value={obs.petDetail || 'Ada'} />
        ) : (
          <Row label="Hewan Peliharaan" value="Tidak ada" />
        )}
        {obs.hasNoise ? (
          <Row label="Kebisingan" value={obs.noiseSource || 'Ada'} />
        ) : (
          <Row label="Kebisingan" value="Tidak ada" />
        )}
        {obs.sleepDisturbance ? <Row label="Gangguan Tidur" value={obs.sleepDisturbance} /> : null}
      </Section>

      {obs.respondentName ? (
        <Section title="Kuesioner Keluarga">
          <Row label="Responden" value={obs.respondentName} />
          {obs.respondentAge ? <Row label="Umur" value={obs.respondentAge} /> : null}
          {obs.respondentEducation ? (
            <Row label="Pendidikan" value={obs.respondentEducation} />
          ) : null}
          {obs.respondentRelation ? <Row label="Hubungan" value={obs.respondentRelation} /> : null}
          {obs.fatigueUnderstanding ? (
            <div className="px-4 py-2">
              <p className="text-xs text-ink-500 mb-0.5">Pemahaman Fatigue</p>
              <p className="text-sm text-ink-900">{obs.fatigueUnderstanding}</p>
            </div>
          ) : null}
          {obs.familyRole ? (
            <div className="px-4 py-2">
              <p className="text-xs text-ink-500 mb-0.5">Peran Keluarga</p>
              <p className="text-sm text-ink-900">{obs.familyRole}</p>
            </div>
          ) : null}
          {obs.fatigueRisk ? (
            <div className="px-4 py-2">
              <p className="text-xs text-ink-500 mb-0.5">Risiko Kelelahan</p>
              <p className="text-sm text-ink-900">{obs.fatigueRisk}</p>
            </div>
          ) : null}
          {obs.fatigueCause ? (
            <div className="px-4 py-2">
              <p className="text-xs text-ink-500 mb-0.5">Penyebab Kelelahan</p>
              <p className="text-sm text-ink-900">{obs.fatigueCause}</p>
            </div>
          ) : null}
        </Section>
      ) : null}
    </AppShell>
  );
}

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
