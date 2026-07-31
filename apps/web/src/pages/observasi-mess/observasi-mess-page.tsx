import { useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import {
  messObservationSchema,
  type MessObservationInput,
  type Company,
  COMPANY,
  COMPANY_LABEL,
} from '@observasi/shared';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { FormStepper, type FormStep } from '@/components/common/form-stepper';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/auth-context';
import { useMessComplexes } from '@/features/master-data/use-mess-complexes';
import { useCreateMessObservation } from '@/features/observations/use-mess-observations';

const ALL_STEPS: FormStep[] = [
  { label: 'Informasi Dasar' },
  { label: 'Deskripsi Temuan' },
  { label: 'Periksa & Kirim' },
];

type Step1Field = 'observationDate' | 'messComplex' | 'roomNumber' | 'officerName' | 'hasFinding';
type FindingField =
  | 'employeeName'
  | 'employeeNik'
  | 'company'
  | 'position'
  | 'department'
  | 'bloodPressure'
  | 'activity'
  | 'reason';

const STEP_1_FIELDS: Step1Field[] = [
  'observationDate',
  'messComplex',
  'roomNumber',
  'officerName',
  'hasFinding',
];
const FINDING_FIELDS: FindingField[] = [
  'employeeName',
  'employeeNik',
  'company',
  'position',
  'department',
  'bloodPressure',
  'activity',
  'reason',
];

export default function MessObservationFormPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const clientUuid = useRef(crypto.randomUUID());
  const { data: complexes } = useMessComplexes();
  const create = useCreateMessObservation();
  const [step, setStep] = useState(0);

  const form = useForm<MessObservationInput>({
    resolver: zodResolver(messObservationSchema),
    defaultValues: {
      clientUuid: clientUuid.current,
      observationDate: new Date().toISOString().slice(0, 10),
      officerName: user?.name ?? '',
      hasFinding: false,
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

  const hasFinding = watch('hasFinding');
  const selectedComplex = watch('messComplex');
  const rooms = complexes?.find((c) => c.name === selectedComplex);
  const hasDescriptionStep = hasFinding;
  const lastStepIndex = hasDescriptionStep ? 2 : 1;
  const steps = hasDescriptionStep ? ALL_STEPS : [ALL_STEPS[0]!, ALL_STEPS[2]!];

  const validateStep = async (stepIndex: number): Promise<boolean> => {
    if (stepIndex === 0) return trigger(STEP_1_FIELDS);
    if (stepIndex === 1 && hasFinding) return trigger(FINDING_FIELDS);
    return true;
  };

  const goNext = async () => {
    const valid = await validateStep(step);
    if (!valid) return;

    if (step === 0 && !hasFinding) {
      setStep(lastStepIndex);
    } else if (step < lastStepIndex) {
      setStep(step + 1);
    }
  };

  const goBack = () => {
    if (step === lastStepIndex && !hasFinding) {
      setStep(0);
    } else {
      setStep(Math.max(0, step - 1));
    }
  };

  const onSubmit = handleSubmit((values) => {
    create.mutate(values, {
      onSuccess: () => navigate('/observasi'),
    });
  });

  return (
    <AppShell title="Observasi Mess" showBack>
      <div className="flex flex-col gap-5 pb-4">
        <FormStepper steps={steps} currentStep={step === lastStepIndex ? steps.length - 1 : step} />

        {step === 0 && (
          <StepInformasiDasar
            register={register}
            errors={errors}
            control={control}
            complexes={complexes ?? []}
            rooms={rooms}
          />
        )}

        {step === 1 && hasFinding && <StepDeskripsiTemuan register={register} errors={errors} />}

        {step === lastStepIndex && (
          <StepRingkasan form={form} hasFinding={hasFinding} onEdit={setStep} />
        )}

        {create.isError ? (
          <p role="alert" className="text-sm text-danger-700">
            Observasi gagal terkirim. Coba lagi.
          </p>
        ) : null}

        <div
          className={cn(
            'sticky bottom-0 -mx-4 flex gap-3 border-t-[3px] border-ink-900 bg-ink-50 px-4 py-3',
            step === 0 ? 'justify-end' : 'justify-between',
          )}
        >
          {step > 0 ? (
            <Button type="button" variant="secondary" onClick={goBack} disabled={isSubmitting}>
              Kembali
            </Button>
          ) : null}

          {step < lastStepIndex ? (
            <Button type="button" onClick={goNext}>
              Lanjut
            </Button>
          ) : (
            <Button type="submit" onClick={onSubmit} disabled={isSubmitting || create.isPending}>
              {create.isPending ? 'Mengirim…' : 'Kirim Observasi'}
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}

/* ── Step 1: Informasi Dasar ────────────────────────────── */

function StepInformasiDasar({
  register,
  errors,
  control,
  complexes,
  rooms,
}: {
  register: ReturnType<typeof useForm<MessObservationInput>>['register'];
  errors: ReturnType<typeof useForm<MessObservationInput>>['formState']['errors'];
  control: ReturnType<typeof useForm<MessObservationInput>>['control'];
  complexes: { id: number; name: string }[];
  rooms: { id: number; name: string; roomCount: number } | undefined;
}) {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-ink-500">* wajib diisi</p>

      <FieldGroup
        label="Tanggal Observasi"
        htmlFor="observationDate"
        required
        error={errors.observationDate?.message}
      >
        <Input
          id="observationDate"
          type="date"
          hasError={Boolean(errors.observationDate)}
          {...register('observationDate')}
        />
      </FieldGroup>

      <FieldGroup
        label="Komplek Mess"
        htmlFor="messComplex"
        required
        error={errors.messComplex?.message}
      >
        <select
          id="messComplex"
          className="h-12 w-full rounded-md border-[3px] border-ink-900 bg-white px-3 text-base text-ink-900"
          {...register('messComplex')}
        >
          <option value="">Pilih komplek</option>
          {complexes.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </FieldGroup>

      <FieldGroup
        label="Nomor Mess"
        htmlFor="roomNumber"
        required
        error={errors.roomNumber?.message}
      >
        <select
          id="roomNumber"
          className="h-12 w-full rounded-md border-[3px] border-ink-900 bg-white px-3 text-base text-ink-900"
          disabled={!rooms}
          {...register('roomNumber')}
        >
          <option value="">Pilih nomor</option>
          {rooms &&
            Array.from({ length: rooms.roomCount }, (_, i) => i + 1).map((n) => (
              <option key={n} value={String(n)}>
                {n}
              </option>
            ))}
        </select>
      </FieldGroup>

      <FieldGroup
        label="Petugas Observasi"
        htmlFor="officerName"
        required
        error={errors.officerName?.message}
      >
        <Input
          id="officerName"
          hasError={Boolean(errors.officerName)}
          {...register('officerName')}
        />
      </FieldGroup>

      <fieldset>
        <legend className="mb-1.5 block text-sm font-medium text-ink-900">
          Temuan
          <span className="text-danger-500"> *</span>
        </legend>
        <p className="mb-2 text-sm text-ink-500">Apakah ada karyawan yang belum tidur?</p>
        <Controller
          control={control}
          name="hasFinding"
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => field.onChange(true)}
                className={cn(
                  'flex h-14 flex-col justify-center rounded-md border-[3px] px-3 text-left',
                  field.value
                    ? 'border-ink-900 bg-signal-500 shadow-sm'
                    : 'border-ink-300 bg-white',
                )}
              >
                <span className="font-medium text-ink-900">Ya</span>
                <span className="text-xs text-ink-700">Ada pelanggaran</span>
              </button>
              <button
                type="button"
                onClick={() => field.onChange(false)}
                className={cn(
                  'flex h-14 flex-col justify-center rounded-md border-[3px] px-3 text-left',
                  !field.value
                    ? 'border-ink-900 bg-primary-500 shadow-sm'
                    : 'border-ink-300 bg-white',
                )}
              >
                <span className="font-medium text-ink-900">Tidak</span>
                <span className="text-xs text-ink-700">Semua tertib</span>
              </button>
            </div>
          )}
        />
      </fieldset>
    </div>
  );
}

/* ── Step 2: Deskripsi Temuan ───────────────────────────── */

function StepDeskripsiTemuan({
  register,
  errors,
}: {
  register: ReturnType<typeof useForm<MessObservationInput>>['register'];
  errors: ReturnType<typeof useForm<MessObservationInput>>['formState']['errors'];
}) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-display text-title text-ink-900">Deskripsi Temuan</h2>

      <FieldGroup
        label="Nama Karyawan"
        htmlFor="employeeName"
        required
        error={errors.employeeName?.message}
      >
        <Input
          id="employeeName"
          hasError={Boolean(errors.employeeName)}
          {...register('employeeName')}
        />
      </FieldGroup>

      <FieldGroup label="NIK" htmlFor="employeeNik" required error={errors.employeeNik?.message}>
        <Input
          id="employeeNik"
          className="font-mono"
          hasError={Boolean(errors.employeeNik)}
          {...register('employeeNik')}
        />
      </FieldGroup>

      <FieldGroup label="Perusahaan" htmlFor="company" required error={errors.company?.message}>
        <select
          id="company"
          className="h-12 w-full rounded-md border-[3px] border-ink-900 bg-white px-3 text-base text-ink-900"
          {...register('company')}
        >
          <option value="">Pilih perusahaan</option>
          {Object.values(COMPANY).map((c: Company) => (
            <option key={c} value={c}>
              {COMPANY_LABEL[c]}
            </option>
          ))}
        </select>
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Jabatan" htmlFor="position" required error={errors.position?.message}>
          <Input id="position" hasError={Boolean(errors.position)} {...register('position')} />
        </FieldGroup>
        <FieldGroup
          label="Departemen"
          htmlFor="department"
          required
          error={errors.department?.message}
        >
          <Input
            id="department"
            hasError={Boolean(errors.department)}
            {...register('department')}
          />
        </FieldGroup>
      </div>

      <FieldGroup
        label="Tekanan Darah"
        htmlFor="bloodPressure"
        error={errors.bloodPressure?.message}
      >
        <Input
          id="bloodPressure"
          className="font-mono"
          placeholder="120/80 mmHg"
          {...register('bloodPressure')}
        />
      </FieldGroup>

      <FieldGroup
        label="Aktivitas yang Dilakukan"
        htmlFor="activity"
        required
        error={errors.activity?.message}
      >
        <textarea
          id="activity"
          rows={3}
          className="w-full rounded-md border-[3px] border-ink-900 bg-white p-3 text-base text-ink-900"
          {...register('activity')}
        />
      </FieldGroup>

      <FieldGroup
        label="Alasan Belum Tidur"
        htmlFor="reason"
        required
        error={errors.reason?.message}
      >
        <textarea
          id="reason"
          rows={3}
          className="w-full rounded-md border-[3px] border-ink-900 bg-white p-3 text-base text-ink-900"
          {...register('reason')}
        />
      </FieldGroup>
    </div>
  );
}

/* ── Step 3: Ringkasan ──────────────────────────────────── */

function StepRingkasan({
  form,
  hasFinding,
  onEdit,
}: {
  form: ReturnType<typeof useForm<MessObservationInput>>;
  hasFinding: boolean;
  onEdit: (step: number) => void;
}) {
  const values = form.watch();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-title text-ink-900">Periksa Sebelum Kirim</h2>
        <p className="mt-1 text-sm text-ink-500">
          Pastikan semua data sudah benar. Observasi yang sudah dikirim tidak dapat diubah.
        </p>
      </div>

      <SummaryCard title="Informasi Dasar" onEdit={() => onEdit(0)}>
        <SummaryRow label="Tanggal" value={values.observationDate} />
        <SummaryRow label="Lokasi" value={`${values.messComplex} / ${values.roomNumber}`} />
        <SummaryRow label="Petugas" value={values.officerName} />
        <SummaryRow
          label="Temuan"
          value={hasFinding ? 'Ya — Ada pelanggaran' : 'Tidak — Semua tertib'}
        />
      </SummaryCard>

      {hasFinding ? (
        <SummaryCard title="Deskripsi Temuan" onEdit={() => onEdit(1)}>
          <SummaryRow label="Nama Karyawan" value={values.employeeName} />
          <SummaryRow label="NIK" value={values.employeeNik} mono />
          <SummaryRow
            label="Perusahaan"
            value={values.company ? COMPANY_LABEL[values.company] : undefined}
          />
          <SummaryRow label="Jabatan" value={values.position} />
          <SummaryRow label="Departemen" value={values.department} />
          <SummaryRow label="Tekanan Darah" value={values.bloodPressure} mono />
          <SummaryRow label="Aktivitas" value={values.activity} long />
          <SummaryRow label="Alasan Belum Tidur" value={values.reason} long />
        </SummaryCard>
      ) : null}
    </div>
  );
}

function SummaryCard({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b-2 border-ink-200 px-4 py-3">
        <h3 className="text-label font-semibold text-ink-700">{title}</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
          Ubah
        </Button>
      </div>
      <div className="px-4 py-2">{children}</div>
    </Card>
  );
}

function SummaryRow({
  label,
  value,
  mono,
  long,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  long?: boolean;
}) {
  const display = value || '—';
  return (
    <div className={cn('flex justify-between gap-2 py-1.5', long && 'flex-col')}>
      <span className="shrink-0 text-sm text-ink-500">{label}</span>
      <span
        className={cn(
          'text-sm font-medium text-ink-900',
          long ? '' : 'text-right',
          mono && 'font-mono',
        )}
      >
        {display}
      </span>
    </div>
  );
}

/* ── Utility ────────────────────────────────────────────── */

function FieldGroup({
  label,
  htmlFor,
  required,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
      {error ? <p className="mt-1 text-sm text-danger-700">{error}</p> : null}
    </div>
  );
}
