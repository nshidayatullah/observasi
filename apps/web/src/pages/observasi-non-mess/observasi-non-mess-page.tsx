import { useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import {
  nonMessObservationSchema,
  type NonMessObservationInput,
  COMPANY_LABEL,
  MARITAL_STATUS_LABEL,
} from '@observasi/shared';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { FormStepper, type FormStep } from '@/components/common/form-stepper';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/auth-context';

const STEPS: FormStep[] = [
  { label: 'Identitas & Kondisi' },
  { label: 'Kuesioner Keluarga' },
  { label: 'Periksa & Kirim' },
];

export default function NonMessObservationFormPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const clientUuid = useRef(crypto.randomUUID());
  const [step, setStep] = useState(0);

  const form = useForm<NonMessObservationInput>({
    resolver: zodResolver(nonMessObservationSchema),
    defaultValues: {
      clientUuid: clientUuid.current,
      observationDate: new Date().toISOString().slice(0, 10),
      officerName: user?.name ?? '',
      adminEmail: '',
      hasPet: false,
      hasNoise: false,
      roomFacilities: [],
      otherActivities: [],
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    control,
    trigger,
    formState: { errors, isSubmitting },
  } = form;

  const hasPet = watch('hasPet') ?? false;
  const hasNoise = watch('hasNoise') ?? false;
  const lastStepIndex = 2;

  const step1Fields: (keyof NonMessObservationInput)[] = [
    'employeeName',
    'employeeNrp',
    'birthDate',
    'maritalStatus',
    'yearsOfService',
    'position',
    'department',
    'company',
    'houseCondition',
    'sleepHours',
  ];

  const validateStep = async (i: number) => {
    if (i === 0) return trigger(step1Fields);
    if (i === 1)
      return trigger(['respondentName', 'fatigueUnderstanding', 'familyRole', 'fatigueRisk']);
    return true;
  };

  const goNext = async () => {
    if (!(await validateStep(step))) return;
    if (step < lastStepIndex) setStep(step + 1);
  };

  const goBack = () => setStep(Math.max(0, step - 1));

  const onSubmit = handleSubmit((values) => {
    // Submit via api-client — T-144 akan integrasikan ke backend nyata
    console.log('Non-Mess observation:', values);
    navigate('/observasi');
  });

  return (
    <AppShell title="Kunjungan Rumah" showBack>
      <div className="flex flex-col gap-5 pb-4">
        <FormStepper steps={STEPS} currentStep={step} />

        {step === 0 && (
          <Step1
            register={register}
            errors={errors}
            control={control}
            hasPet={hasPet}
            hasNoise={hasNoise}
          />
        )}
        {step === 1 && <Step2 register={register} errors={errors} />}
        {step === lastStepIndex && <Step3Summary form={form} />}

        <div
          className={cn(
            'sticky bottom-0 -mx-4 flex gap-3 border-t-[3px] border-ink-900 bg-ink-50 px-4 py-3',
            step === 0 ? 'justify-end' : 'justify-between',
          )}
        >
          {step > 0 && (
            <Button type="button" variant="secondary" onClick={goBack} disabled={isSubmitting}>
              Kembali
            </Button>
          )}
          {step < lastStepIndex ? (
            <Button type="button" onClick={goNext}>
              Lanjut
            </Button>
          ) : (
            <Button type="submit" onClick={onSubmit}>
              Kirim Observasi
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}

/* ── Step 1: Identitas & Kondisi ────────────────────────── */

function Step1({
  register,
  errors,
  control,
  hasPet,
  hasNoise,
}: {
  register: ReturnType<typeof useForm<NonMessObservationInput>>['register'];
  errors: ReturnType<typeof useForm<NonMessObservationInput>>['formState']['errors'];
  control: ReturnType<typeof useForm<NonMessObservationInput>>['control'];
  hasPet: boolean;
  hasNoise: boolean;
}) {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-ink-500">* wajib diisi</p>

      {/* Data Diri */}
      <SectionTitle>Data Diri Karyawan</SectionTitle>
      <F label="Nama Karyawan" htmlFor="employeeName" required err={errors.employeeName?.message}>
        <Input id="employeeName" hasError={!!errors.employeeName} {...register('employeeName')} />
      </F>
      <F label="NRP" htmlFor="employeeNrp" required err={errors.employeeNrp?.message}>
        <Input
          id="employeeNrp"
          className="font-mono"
          hasError={!!errors.employeeNrp}
          {...register('employeeNrp')}
        />
      </F>
      <F label="Tanggal Lahir" htmlFor="birthDate" required err={errors.birthDate?.message}>
        <Input
          id="birthDate"
          type="date"
          hasError={!!errors.birthDate}
          {...register('birthDate')}
        />
      </F>
      <F
        label="Status Pernikahan"
        htmlFor="maritalStatus"
        required
        err={errors.maritalStatus?.message}
      >
        <select
          id="maritalStatus"
          className="h-12 w-full rounded-md border-[3px] border-ink-900 bg-white px-3 text-base text-ink-900"
          {...register('maritalStatus')}
        >
          <option value="">Pilih status</option>
          {Object.entries(MARITAL_STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </F>
      <F label="Masa Kerja" htmlFor="yearsOfService" required err={errors.yearsOfService?.message}>
        <Input
          id="yearsOfService"
          placeholder="6 tahun"
          hasError={!!errors.yearsOfService}
          {...register('yearsOfService')}
        />
      </F>
      <div className="grid grid-cols-2 gap-4">
        <F label="Jabatan" htmlFor="position" required err={errors.position?.message}>
          <Input id="position" hasError={!!errors.position} {...register('position')} />
        </F>
        <F label="Departemen" htmlFor="department" required err={errors.department?.message}>
          <Input id="department" hasError={!!errors.department} {...register('department')} />
        </F>
      </div>
      <F label="Perusahaan" htmlFor="company" required err={errors.company?.message}>
        <select
          id="company"
          className="h-12 w-full rounded-md border-[3px] border-ink-900 bg-white px-3 text-base text-ink-900"
          {...register('company')}
        >
          <option value="">Pilih perusahaan</option>
          {Object.entries(COMPANY_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </F>

      {/* Kondisi Rumah */}
      <SectionTitle>Kondisi Rumah</SectionTitle>
      <F
        label="Kondisi Rumah"
        htmlFor="houseCondition"
        required
        err={errors.houseCondition?.message}
      >
        <Input
          id="houseCondition"
          hasError={!!errors.houseCondition}
          {...register('houseCondition')}
        />
      </F>
      <div className="grid grid-cols-2 gap-4">
        <F label="Jenis Dinding" htmlFor="wallType" err={errors.wallType?.message}>
          <Input id="wallType" hasError={!!errors.wallType} {...register('wallType')} />
        </F>
        <F label="Jenis Lantai" htmlFor="floorType" err={errors.floorType?.message}>
          <Input id="floorType" hasError={!!errors.floorType} {...register('floorType')} />
        </F>
      </div>
      <F label="Jenis Atap" htmlFor="roofType" err={errors.roofType?.message}>
        <Input id="roofType" hasError={!!errors.roofType} {...register('roofType')} />
      </F>
      <F label="Jumlah Kamar" htmlFor="roomCount" err={errors.roomCount?.message}>
        <Input id="roomCount" hasError={!!errors.roomCount} {...register('roomCount')} />
      </F>

      {/* Aktivitas & Tidur */}
      <SectionTitle>Aktivitas & Tidur</SectionTitle>
      <F label="Jam Tidur" htmlFor="sleepHours" required err={errors.sleepHours?.message}>
        <Input
          id="sleepHours"
          placeholder="22:00 - 05:00"
          hasError={!!errors.sleepHours}
          {...register('sleepHours')}
        />
      </F>
      <F label="Waktu Bangun" htmlFor="wakeUpTime" err={errors.wakeUpTime?.message}>
        <Input
          id="wakeUpTime"
          placeholder="05:00"
          hasError={!!errors.wakeUpTime}
          {...register('wakeUpTime')}
        />
      </F>

      {/* Fasilitas & Lingkungan */}
      <SectionTitle>Fasilitas & Lingkungan</SectionTitle>
      <F label="Kebersihan & Kerapihan" htmlFor="cleanliness" err={errors.cleanliness?.message}>
        <select
          id="cleanliness"
          className="h-12 w-full rounded-md border-[3px] border-ink-900 bg-white px-3 text-base text-ink-900"
          {...register('cleanliness')}
        >
          <option value="">Pilih kondisi</option>
          <option value="BERSIH_RAPI">Bersih & Rapi</option>
          <option value="CUKUP">Cukup</option>
          <option value="KURANG_RAPI">Kurang Rapi</option>
        </select>
      </F>

      <fieldset>
        <legend className="mb-1.5 block text-sm font-medium text-ink-900">Hewan Peliharaan</legend>
        <Controller
          control={control}
          name="hasPet"
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-3">
              <ToggleBtn
                active={field.value === true}
                onClick={() => field.onChange(true)}
                label="Ada"
                sub=""
              />
              <ToggleBtn
                active={field.value === false}
                onClick={() => field.onChange(false)}
                label="Tidak Ada"
                sub=""
              />
            </div>
          )}
        />
      </fieldset>
      {hasPet && (
        <F label="Sebutkan" htmlFor="petDetail" required err={errors.petDetail?.message}>
          <Input id="petDetail" hasError={!!errors.petDetail} {...register('petDetail')} />
        </F>
      )}

      <fieldset>
        <legend className="mb-1.5 block text-sm font-medium text-ink-900">Ada Kebisingan?</legend>
        <Controller
          control={control}
          name="hasNoise"
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-3">
              <ToggleBtn
                active={field.value === true}
                onClick={() => field.onChange(true)}
                label="Ya"
                sub=""
              />
              <ToggleBtn
                active={field.value === false}
                onClick={() => field.onChange(false)}
                label="Tidak"
                sub=""
              />
            </div>
          )}
        />
      </fieldset>
      {hasNoise && (
        <F
          label="Sumber Kebisingan"
          htmlFor="noiseSource"
          required
          err={errors.noiseSource?.message}
        >
          <Input id="noiseSource" hasError={!!errors.noiseSource} {...register('noiseSource')} />
        </F>
      )}

      <F
        label="Potensi Gangguan Tidur"
        htmlFor="sleepDisturbance"
        err={errors.sleepDisturbance?.message}
      >
        <textarea
          id="sleepDisturbance"
          rows={2}
          className="w-full rounded-md border-[3px] border-ink-900 bg-white p-3 text-base text-ink-900"
          {...register('sleepDisturbance')}
        />
      </F>
    </div>
  );
}

/* ── Step 2: Kuesioner Fatigue Keluarga ─────────────────── */

function Step2({
  register,
  errors,
}: {
  register: ReturnType<typeof useForm<NonMessObservationInput>>['register'];
  errors: ReturnType<typeof useForm<NonMessObservationInput>>['formState']['errors'];
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-title text-ink-900">Kuesioner Fatigue Keluarga</h2>
        <p className="mt-1 text-sm text-ink-500">
          Wawancarai anggota keluarga yang tinggal serumah.
        </p>
      </div>

      <SectionTitle>Data Responden</SectionTitle>
      <F
        label="Nama Responden"
        htmlFor="respondentName"
        required
        err={errors.respondentName?.message}
      >
        <Input
          id="respondentName"
          hasError={!!errors.respondentName}
          {...register('respondentName')}
        />
      </F>
      <div className="grid grid-cols-2 gap-4">
        <F label="Umur" htmlFor="respondentAge" err={errors.respondentAge?.message}>
          <Input
            id="respondentAge"
            hasError={!!errors.respondentAge}
            {...register('respondentAge')}
          />
        </F>
        <F
          label="Pendidikan"
          htmlFor="respondentEducation"
          err={errors.respondentEducation?.message}
        >
          <Input
            id="respondentEducation"
            hasError={!!errors.respondentEducation}
            {...register('respondentEducation')}
          />
        </F>
      </div>
      <F
        label="Hubungan dengan Karyawan"
        htmlFor="respondentRelation"
        err={errors.respondentRelation?.message}
      >
        <Input
          id="respondentRelation"
          placeholder="Istri / Suami / Anak"
          hasError={!!errors.respondentRelation}
          {...register('respondentRelation')}
        />
      </F>
      <F label="Keluarga dari (A.N)" htmlFor="familyOf" err={errors.familyOf?.message}>
        <Input id="familyOf" hasError={!!errors.familyOf} {...register('familyOf')} />
      </F>
      <F
        label="Jabatan di Perusahaan"
        htmlFor="familyOfPosition"
        err={errors.familyOfPosition?.message}
      >
        <Input
          id="familyOfPosition"
          placeholder="Kosongkan jika tidak"
          hasError={!!errors.familyOfPosition}
          {...register('familyOfPosition')}
        />
      </F>

      <SectionTitle>Pemahaman Fatigue</SectionTitle>
      <F
        label="Apa yang Anda ketahui tentang fatigue?"
        htmlFor="fatigueUnderstanding"
        required
        err={errors.fatigueUnderstanding?.message}
      >
        <textarea
          id="fatigueUnderstanding"
          rows={3}
          className="w-full rounded-md border-[3px] border-ink-900 bg-white p-3 text-base text-ink-900"
          {...register('fatigueUnderstanding')}
        />
      </F>
      <F
        label="Bagaimana peran keluarga mencegah fatigue?"
        htmlFor="familyRole"
        required
        err={errors.familyRole?.message}
      >
        <textarea
          id="familyRole"
          rows={3}
          className="w-full rounded-md border-[3px] border-ink-900 bg-white p-3 text-base text-ink-900"
          {...register('familyRole')}
        />
      </F>
      <F
        label="Menurut Anda apa risiko kelelahan saat bekerja?"
        htmlFor="fatigueRisk"
        required
        err={errors.fatigueRisk?.message}
      >
        <textarea
          id="fatigueRisk"
          rows={3}
          className="w-full rounded-md border-[3px] border-ink-900 bg-white p-3 text-base text-ink-900"
          {...register('fatigueRisk')}
        />
      </F>
      <F
        label="Apa yang biasanya membuat karyawan lelah?"
        htmlFor="fatigueCause"
        err={errors.fatigueCause?.message}
      >
        <textarea
          id="fatigueCause"
          rows={3}
          className="w-full rounded-md border-[3px] border-ink-900 bg-white p-3 text-base text-ink-900"
          {...register('fatigueCause')}
        />
      </F>
    </div>
  );
}

/* ── Step 3: Ringkasan ──────────────────────────────────── */

function Step3Summary({ form }: { form: ReturnType<typeof useForm<NonMessObservationInput>> }) {
  const v = form.watch();
  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-display text-title text-ink-900">Periksa Sebelum Kirim</h2>
      <p className="text-sm text-ink-500">Pastikan semua data sudah benar.</p>
      <Card className="overflow-hidden p-0">
        <div className="border-b-2 border-ink-200 px-4 py-3">
          <h3 className="text-label font-semibold text-ink-700">Data Karyawan</h3>
        </div>
        <div className="px-4 py-2">
          <SR label="Nama Karyawan" value={v.employeeName} />
          <SR label="NRP" value={v.employeeNrp} mono />
          <SR label="Perusahaan" value={v.company ? COMPANY_LABEL[v.company] : '—'} />
          <SR
            label="Jabatan / Dept."
            value={[v.position, v.department].filter(Boolean).join(' — ')}
          />
          <SR label="Kondisi Rumah" value={v.houseCondition} />
          <SR label="Jam Tidur" value={v.sleepHours} />
          {v.respondentName ? <SR label="Responden" value={v.respondentName} /> : null}
        </div>
      </Card>
    </div>
  );
}

/* ── Shared helpers ─────────────────────────────────────── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display text-subtitle font-semibold text-ink-700 border-b-2 border-ink-200 pb-1.5">
      {children}
    </h3>
  );
}

function F({
  label,
  htmlFor,
  required,
  err,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  err?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {htmlFor ? (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      ) : (
        <Label required={required}>{label}</Label>
      )}
      {children}
      {err ? <p className="mt-1 text-sm text-danger-700">{err}</p> : null}
    </div>
  );
}

function ToggleBtn({
  active,
  onClick,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-14 flex-col justify-center rounded-md border-[3px] px-3 text-left',
        active ? 'border-ink-900 bg-primary-500 shadow-sm' : 'border-ink-300 bg-white',
      )}
    >
      <span className="font-medium text-ink-900">{label}</span>
      {sub ? <span className="text-xs text-ink-700">{sub}</span> : null}
    </button>
  );
}

function SR({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-2 py-1.5">
      <span className="shrink-0 text-sm text-ink-500">{label}</span>
      <span className={cn('text-right text-sm font-medium text-ink-900', mono && 'font-mono')}>
        {value || '—'}
      </span>
    </div>
  );
}
