import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate, useLocation } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';
import { loginSchema, type LoginInput } from '@observasi/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/features/auth/auth-context';
import { useLogin } from '@/features/auth/use-login';

export default function LoginPage() {
  const { user } = useAuth();
  const location = useLocation();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  if (user) {
    const from = (location.state as { from?: Location } | null)?.from ?? '/beranda';
    return <Navigate to={typeof from === 'string' ? from : '/beranda'} replace />;
  }

  const onSubmit = handleSubmit((values) => login.mutate(values));

  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink-50 p-6">
      <div className="w-full max-w-sm rounded-md border-[3px] border-ink-900 bg-white p-6 shadow-raised">
        <h1 className="font-display text-2xl font-semibold text-ink-900">
          Observasi Istirahat Karyawan
        </h1>

        <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-5">
          <div>
            <Label htmlFor="email" required>
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              hasError={Boolean(errors.email)}
              {...register('email')}
            />
            {errors.email ? (
              <p className="mt-1 text-sm text-danger-700">{errors.email.message}</p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="password" required>
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                hasError={Boolean(errors.password)}
                className="pr-11"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-0 top-0 flex h-12 w-11 items-center justify-center"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-ink-500" strokeWidth={1.75} />
                ) : (
                  <Eye className="h-5 w-5 text-ink-500" strokeWidth={1.75} />
                )}
              </button>
            </div>
            {errors.password ? (
              <p className="mt-1 text-sm text-danger-700">{errors.password.message}</p>
            ) : null}
          </div>

          {login.isError ? (
            <p role="alert" className="text-sm text-danger-700">
              {login.error.message}
            </p>
          ) : null}

          <Button type="submit" size="full" disabled={isSubmitting || login.isPending}>
            {login.isPending ? 'Memeriksa…' : 'Masuk'}
          </Button>

          <p className="text-center text-sm text-ink-500">Lupa password? Hubungi Superadmin.</p>
        </form>
      </div>
    </div>
  );
}
