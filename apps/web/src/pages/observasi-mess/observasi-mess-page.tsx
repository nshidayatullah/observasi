import { useRef } from 'react';
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
import { cn } from '@/lib/utils';
import { useMessComplexes } from '@/features/master-data/use-mess-complexes';
import { useCreateMessObservation } from '@/features/observations/use-mess-observations';

export default function MessObservationFormPage() {
  const navigate = useNavigate();
  const clientUuid = useRef(crypto.randomUUID());
  const { data: complexes } = useMessComplexes();
  const create = useCreateMessObservation();

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<MessObservationInput>({
    resolver: zodResolver(messObservationSchema),
    defaultValues: {
      clientUuid: clientUuid.current,
      observationDate: new Date().toISOString().slice(0, 10),
      hasFinding: false,
    },
  });

  const hasFinding = watch('hasFinding');
  const selectedComplex = watch('messComplex');
  const rooms = complexes?.find((c) => c.name === selectedComplex);

  const onSubmit = handleSubmit((values) => {
    create.mutate(values, {
      onSuccess: () => navigate('/observasi'),
    });
  });

  return (
    <AppShell title="Observasi Mess" showBack>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5 pb-4">
        <p className="text-sm text-ink-500">* wajib diisi</p>

        <div>
          <Label htmlFor="observationDate" required>
            Tanggal Observasi
          </Label>
          <Input id="observationDate" type="date" {...register('observationDate')} />
        </div>

        <div>
          <Label htmlFor="messComplex" required>
            Komplek Mess
          </Label>
          <select
            id="messComplex"
            className="h-12 w-full rounded-md border-[3px] border-ink-900 bg-white px-3 text-base text-ink-900"
            {...register('messComplex')}
          >
            <option value="">Pilih komplek</option>
            {complexes?.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.messComplex ? (
            <p className="mt-1 text-sm text-danger-700">{errors.messComplex.message}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="roomNumber" required>
            Nomor Mess
          </Label>
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
          {errors.roomNumber ? (
            <p className="mt-1 text-sm text-danger-700">{errors.roomNumber.message}</p>
          ) : null}
        </div>

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
                    'h-14 rounded-md border-[3px] px-3 text-left',
                    field.value
                      ? 'border-ink-900 bg-signal-500 shadow-sm'
                      : 'border-ink-300 bg-white',
                  )}
                >
                  <p className="font-medium text-ink-900">Ya</p>
                  <p className="text-xs text-ink-700">Ada pelanggaran</p>
                </button>
                <button
                  type="button"
                  onClick={() => field.onChange(false)}
                  className={cn(
                    'h-14 rounded-md border-[3px] px-3 text-left',
                    !field.value
                      ? 'border-ink-900 bg-primary-500 shadow-sm'
                      : 'border-ink-300 bg-white',
                  )}
                >
                  <p className="font-medium text-ink-900">Tidak</p>
                  <p className="text-xs text-ink-700">Semua tertib</p>
                </button>
              </div>
            )}
          />
        </fieldset>

        {hasFinding ? (
          <>
            <div>
              <Label htmlFor="employeeName" required>
                Nama Karyawan
              </Label>
              <Input id="employeeName" {...register('employeeName')} />
              {errors.employeeName ? (
                <p className="mt-1 text-sm text-danger-700">{errors.employeeName.message}</p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="employeeNik" required>
                NIK
              </Label>
              <Input id="employeeNik" className="font-mono" {...register('employeeNik')} />
              {errors.employeeNik ? (
                <p className="mt-1 text-sm text-danger-700">{errors.employeeNik.message}</p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="company" required>
                Perusahaan
              </Label>
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
              {errors.company ? (
                <p className="mt-1 text-sm text-danger-700">{errors.company.message}</p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="bloodPressure">Tekanan Darah</Label>
              <Input
                id="bloodPressure"
                className="font-mono"
                placeholder="120/80 mmHg"
                {...register('bloodPressure')}
              />
            </div>

            <div>
              <Label htmlFor="activity" required>
                Aktivitas yang Dilakukan
              </Label>
              <textarea
                id="activity"
                rows={3}
                className="w-full rounded-md border-[3px] border-ink-900 bg-white p-3 text-base text-ink-900"
                {...register('activity')}
              />
              {errors.activity ? (
                <p className="mt-1 text-sm text-danger-700">{errors.activity.message}</p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="reason" required>
                Alasan Belum Tidur
              </Label>
              <textarea
                id="reason"
                rows={3}
                className="w-full rounded-md border-[3px] border-ink-900 bg-white p-3 text-base text-ink-900"
                {...register('reason')}
              />
              {errors.reason ? (
                <p className="mt-1 text-sm text-danger-700">{errors.reason.message}</p>
              ) : null}
            </div>
          </>
        ) : null}

        {create.isError ? (
          <p role="alert" className="text-sm text-danger-700">
            Observasi gagal terkirim. Coba lagi.
          </p>
        ) : null}

        <Button type="submit" size="full" disabled={isSubmitting || create.isPending}>
          {create.isPending ? 'Mengirim…' : 'Kirim Observasi'}
        </Button>
      </form>
    </AppShell>
  );
}
