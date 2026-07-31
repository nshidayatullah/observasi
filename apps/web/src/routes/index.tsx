import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { ProtectedRoute } from './protected-route';
import { ROLE } from '@observasi/shared';

const LoginPage = lazy(() => import('@/pages/login/login-page'));
const ForcePasswordChangePage = lazy(
  () => import('@/pages/force-password-change/force-password-change-page'),
);
const HomePage = lazy(() => import('@/pages/home/home-page'));
const SelectObservationTypePage = lazy(
  () => import('@/pages/select-observation-type/select-observation-type-page'),
);
const ObservationHistoryPage = lazy(
  () => import('@/pages/observation-history/observation-history-page'),
);
const ObservationDetailPage = lazy(
  () => import('@/pages/observation-detail/observation-detail-page'),
);
const MessObservationFormPage = lazy(() => import('@/pages/observasi-mess/observasi-mess-page'));
const NonMessObservationFormPage = lazy(
  () => import('@/pages/observasi-non-mess/observasi-non-mess-page'),
);
const ApprovalQueuePage = lazy(() => import('@/pages/approval-queue/approval-queue-page'));
const SchedulePage = lazy(() => import('@/pages/schedule/schedule-page'));
const UserListPage = lazy(() => import('@/pages/users/user-list-page'));
const UserFormPage = lazy(() => import('@/pages/users/user-form-page'));
const ProfilePage = lazy(() => import('@/pages/profile/profile-page'));
const NotFoundPage = lazy(() => import('@/pages/errors/not-found-page'));
const ForbiddenPage = lazy(() => import('@/pages/errors/forbidden-page'));

function RouteFallback() {
  return <div className="p-6 text-ink-500">Memuat…</div>;
}

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Navigate to="/beranda" replace />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/ganti-password" element={<ForcePasswordChangePage />} />
          <Route path="/beranda" element={<HomePage />} />
          <Route path="/profil" element={<ProfilePage />} />
          <Route path="/observasi" element={<ObservationHistoryPage />} />
          <Route path="/observasi/mess/:id" element={<ObservationDetailPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[ROLE.PARAMEDIC]} />}>
          <Route path="/observasi/baru" element={<SelectObservationTypePage />} />
          <Route path="/observasi/baru/mess" element={<MessObservationFormPage />} />
          <Route path="/observasi/baru/non-mess" element={<NonMessObservationFormPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/jadwal" element={<SchedulePage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[ROLE.DOCTOR]} />}>
          <Route path="/persetujuan" element={<ApprovalQueuePage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[ROLE.SUPERADMIN]} />}>
          <Route path="/pengguna" element={<UserListPage />} />
          <Route path="/pengguna/baru" element={<UserFormPage />} />
        </Route>

        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
