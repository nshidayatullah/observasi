import { http, HttpResponse } from 'msw';
import { OBSERVATION_STATUS, USER_STATUS } from '@observasi/shared';
import {
  mockUsers,
  mockMessObservations,
  mockMessComplexes,
  mockKpiSummary,
  type MockMessObservation,
} from './fixtures';

const MOCK_PASSWORD = 'Password123';
const BASE = '/api/v1';

function issueToken(userId: number): string {
  return `mock-access-token.${userId}.${Date.now()}`;
}

export const handlers = [
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.toLowerCase().trim();
    const user = mockUsers.find((u) => u.email.toLowerCase() === email);

    if (!user || body.password !== MOCK_PASSWORD) {
      return HttpResponse.json(
        { error: { code: 'INVALID_CREDENTIALS', message: 'Email atau password salah.' } },
        { status: 401 },
      );
    }
    if (user.status === USER_STATUS.INACTIVE) {
      return HttpResponse.json(
        {
          error: {
            code: 'ACCOUNT_INACTIVE',
            message: 'Akun Anda dinonaktifkan. Hubungi Superadmin.',
          },
        },
        { status: 403 },
      );
    }

    return HttpResponse.json({
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          forcePasswordChange: user.forcePasswordChange,
        },
        accessToken: issueToken(user.id),
        refreshToken: `mock-refresh-token.${user.id}`,
      },
    });
  }),

  http.post(`${BASE}/auth/change-password`, async () => {
    return HttpResponse.json({ data: { success: true } });
  }),

  http.post(`${BASE}/auth/logout`, () => HttpResponse.json({ data: { success: true } })),

  http.get(`${BASE}/auth/me`, ({ request }) => {
    const auth = request.headers.get('authorization') ?? '';
    const userId = Number(auth.split('.')[1]);
    const user = mockUsers.find((u) => u.id === userId);
    if (!user) {
      return HttpResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Sesi tidak valid.' } },
        { status: 401 },
      );
    }
    return HttpResponse.json({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        forcePasswordChange: user.forcePasswordChange,
      },
    });
  }),

  http.get(`${BASE}/users`, () => {
    return HttpResponse.json({
      data: mockUsers,
      meta: { page: 1, perPage: 25, total: mockUsers.length, totalPages: 1 },
    });
  }),

  http.get(`${BASE}/observations/mess`, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const filtered = status
      ? mockMessObservations.filter((o) => o.status === status)
      : mockMessObservations;
    return HttpResponse.json({
      data: filtered,
      meta: { page: 1, perPage: 25, total: filtered.length, totalPages: 1 },
    });
  }),

  http.get(`${BASE}/observations/mess/:id`, ({ params }) => {
    const observation = mockMessObservations.find((o) => o.id === Number(params['id']));
    if (!observation) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Observasi tidak ditemukan.' } },
        { status: 404 },
      );
    }
    return HttpResponse.json({ data: observation });
  }),

  http.post(`${BASE}/observations/mess`, async ({ request }) => {
    const body = (await request.json()) as Partial<MockMessObservation> & { clientUuid: string };
    const existing = mockMessObservations.find(
      (o) => (o as unknown as { clientUuid?: string }).clientUuid === body.clientUuid,
    );
    if (existing) {
      return HttpResponse.json({ data: existing }, { status: 409 });
    }
    const created: MockMessObservation = {
      id: Math.max(...mockMessObservations.map((o) => o.id)) + 1,
      type: 'MESS',
      paramedicId: 1,
      paramedicName: 'Muhammad Suryani',
      messComplex: body.messComplex ?? '',
      roomNumber: body.roomNumber ?? '',
      observationDate: body.observationDate ?? new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
      hasFinding: body.hasFinding ?? false,
      status: OBSERVATION_STATUS.PENDING,
      ...(body.employeeName !== undefined ? { employeeName: body.employeeName } : {}),
      ...(body.employeeNik !== undefined ? { employeeNik: body.employeeNik } : {}),
      ...(body.bloodPressure !== undefined ? { bloodPressure: body.bloodPressure } : {}),
      ...(body.activity !== undefined ? { activity: body.activity } : {}),
      ...(body.reason !== undefined ? { reason: body.reason } : {}),
    };
    mockMessObservations.unshift(created);
    return HttpResponse.json({ data: created }, { status: 201 });
  }),

  http.post(`${BASE}/observations/mess/:id/approve`, ({ params }) => {
    const observation = mockMessObservations.find((o) => o.id === Number(params['id']));
    if (!observation) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Observasi tidak ditemukan.' } },
        { status: 404 },
      );
    }
    observation.status = OBSERVATION_STATUS.APPROVED;
    return HttpResponse.json({ data: observation });
  }),

  http.post(`${BASE}/observations/mess/:id/reject`, ({ params }) => {
    const observation = mockMessObservations.find((o) => o.id === Number(params['id']));
    if (!observation) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Observasi tidak ditemukan.' } },
        { status: 404 },
      );
    }
    observation.status = OBSERVATION_STATUS.REJECTED;
    return HttpResponse.json({ data: observation });
  }),

  http.get(`${BASE}/master-data/mess-complexes`, () => {
    return HttpResponse.json({ data: mockMessComplexes });
  }),

  http.get(`${BASE}/kpi/summary`, () => {
    return HttpResponse.json({ data: mockKpiSummary });
  }),
];
