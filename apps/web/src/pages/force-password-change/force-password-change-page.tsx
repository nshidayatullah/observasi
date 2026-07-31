import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, type ChangePasswordInput } from '@observasi/shared';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/features/auth/auth-context';

export default function ForcePasswordChangePage() {
  const { user, setSession, accessToken } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

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
