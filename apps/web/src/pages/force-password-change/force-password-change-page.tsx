import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, type ChangePasswordInput } from '@observasi/shared';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/features/auth/auth-context';

function passwordStrength(pw: string): { score: number; label: string } {
  if (!pw) return { score: 0, label: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-zA-Z]/.test(pw) && /[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw) || /[A-Z]/.test(pw)) score++;
  if (score <= 1) return { score: 1, label: 'Lemah' };
  if (score === 2) return { score: 2, label: 'Cukup kuat' };
  return { score: 3, label: 'Kuat' };
}

const STRENGTH_COLOR: Record<number, string> = {
  1: 'bg-danger-500',
  2: 'bg-signal-500',
  3: 'bg-success-500',
};

export default function ForcePasswordChangePage() {
  const { user, setSession, accessToken } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

  const newPassword = watch('newPassword');
  const strength = useMemo(() => passwordStrength(newPassword), [newPassword]);

  const changePassword = useMutation({
    mutationFn: (input: ChangePasswordInput) => apiClient.post('/auth/change-password', input),
    onSuccess: () => {
      if (user && accessToken) {
        setSession({ ...user, forcePasswordChange: false }, accessToken);
      }
    },
  });

  const onSubmit = handleSubmit((values) => changePassword.mutate(values));

  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink-50 p-6">
      <div className="w-full max-w-sm rounded-md border-[3px] border-ink-900 bg-white p-6 shadow-raised">
        <h1 className="font-display text-xl font-semibold text-ink-900">Ganti Password</h1>
        <p className="mt-1 text-sm text-ink-500">
          Demi keamanan, ganti password sebelum melanjutkan.
        </p>

        <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-5">
          <div>
            <Label htmlFor="currentPassword" required>
              Password Saat Ini
            </Label>
            <Input
              id="currentPassword"
              type="password"
              hasError={Boolean(errors.currentPassword)}
              {...register('currentPassword')}
            />
            {errors.currentPassword ? (
              <p className="mt-1 text-sm text-danger-700">{errors.currentPassword.message}</p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="newPassword" required>
              Password Baru
            </Label>
            <Input
              id="newPassword"
              type="password"
              hasError={Boolean(errors.newPassword)}
              {...register('newPassword')}
            />
            {newPassword ? (
              <div className="mt-2">
                <div className="flex h-1.5 gap-1">
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      className={cn(
                        'h-full flex-1 rounded-sm border border-ink-900',
                        s <= strength.score ? STRENGTH_COLOR[strength.score] : 'bg-ink-200',
                      )}
                    />
                  ))}
                </div>
                <p className="mt-1 text-xs text-ink-500">{strength.label}</p>
              </div>
            ) : null}
            <p className="mt-1 text-sm text-ink-500">
              Minimal 8 karakter, mengandung huruf dan angka.
            </p>
            {errors.newPassword ? (
              <p className="mt-1 text-sm text-danger-700">{errors.newPassword.message}</p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="confirmPassword" required>
              Ulangi Password Baru
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              hasError={Boolean(errors.confirmPassword)}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword ? (
              <p className="mt-1 text-sm text-danger-700">{errors.confirmPassword.message}</p>
            ) : null}
          </div>

          <Button type="submit" size="full" disabled={isSubmitting || changePassword.isPending}>
            {changePassword.isPending ? 'Menyimpan…' : 'Simpan dan Lanjutkan'}
          </Button>
        </form>
      </div>
    </div>
  );
}
