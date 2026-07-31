import { Link } from 'react-router';

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-ink-50 p-6 text-center">
      <h1 className="font-display text-2xl font-semibold text-ink-900">
        Anda tidak punya akses ke halaman ini.
      </h1>
      <Link to="/beranda" className="text-primary-700 underline">
        Kembali ke beranda
      </Link>
    </div>
  );
}
