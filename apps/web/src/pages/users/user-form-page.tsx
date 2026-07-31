import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import { ROLE, ROLE_LABEL } from '@observasi/shared';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';

const userSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  role: z.enum([ROLE.PARAMEDIC, ROLE.DOCTOR, ROLE.SUPERADMIN], { message: 'Role wajib dipilih' }),
});

type UserInput = z.infer<typeof userSchema>;

export default function UserFormPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserInput>({ resolver: zodResolver(userSchema) });

  const onSubmit = handleSubmit(async (values) => {
    const result = await apiClient.post<{ temporaryPassword: string }>('/users', values);
    setPassword(result.temporaryPassword);
  });

  if (password) {
    return (
      <AppShell title="Pengguna Dibuat" showBack>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink-500">
            Simpan password sementara ini. Password tidak akan ditampilkan lagi.
          </p>
          <div className="rounded-md border-[3px] border-ink-900 bg-signal-100 p-4 text-center">
            <p className="font-mono text-xl font-semibold text-ink-900 break-all">{password}</p>
          </div>
          <p className="text-sm text-ink-500">
            Pengguna wajib mengganti password saat login pertama.
          </p>
          <Button
            size="full"
            onClick={() => {
              void navigator.clipboard.writeText(password);
              navigate('/pengguna');
            }}
          >
            Salin & Tutup
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Tambah Pengguna" showBack>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <p className="text-sm text-ink-500">* wajib diisi</p>

        <div>
          <Label htmlFor="name" required>
            Nama Lengkap
          </Label>
          <Input id="name" hasError={!!errors.name} {...register('name')} />
          {errors.name ? (
            <p className="mt-1 text-sm text-danger-700">{errors.name.message}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="email" required>
            Email
          </Label>
          <Input id="email" type="email" hasError={!!errors.email} {...register('email')} />
          <p className="mt-1 text-xs text-ink-500">Dipakai untuk login.</p>
          {errors.email ? (
            <p className="mt-1 text-sm text-danger-700">{errors.email.message}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="role" required>
            Role
          </Label>
          <select
            id="role"
            className="h-12 w-full rounded-md border-[3px] border-ink-900 bg-white px-3 text-base text-ink-900"
            {...register('role')}
          >
            <option value="">Pilih role</option>
            {Object.entries(ROLE_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          {errors.role ? (
            <p className="mt-1 text-sm text-danger-700">{errors.role.message}</p>
          ) : null}
        </div>

        <Button type="submit" size="full" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan…' : 'Simpan Pengguna'}
        </Button>
      </form>
    </AppShell>
  );
}
