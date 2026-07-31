import { http, HttpResponse } from 'msw';
import { OBSERVATION_STATUS, USER_STATUS } from '@observasi/shared';
import {
  mockUsers,
  mockMessObservations,
  mockNonMessObservations,
  mockMessComplexes,
  mockBlok,
  mockLokasi,
  mockKpiSummary,
  type MockMessObservation,
  type MockUser,
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

  http.post(`${BASE}/users`, async ({ request }) => {
    const body = (await request.json()) as { name?: string; email?: string; role?: string };
    const newUser = {
      id: Math.max(...mockUsers.map((u) => u.id)) + 1,
      name: body.name ?? '',
      email: body.email ?? '',
      role: (body.role as MockUser['role']) ?? 'PARAMEDIC',
      status: 'ACTIVE' as const,
      forcePasswordChange: true,
      lastLoginAt: null,
    };
    mockUsers.push(newUser);
    return HttpResponse.json(
      { data: { ...newUser, temporaryPassword: 'Kx7mQp2nRw4t' } },
      { status: 201 },
    );
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
      officerName: body.officerName ?? 'Muhammad Suryani',
      ...(body.employeeName !== undefined ? { employeeName: body.employeeName } : {}),
      ...(body.employeeNik !== undefined ? { employeeNik: body.employeeNik } : {}),
      ...(body.company !== undefined ? { company: body.company } : {}),
      ...(body.position !== undefined ? { position: body.position } : {}),
      ...(body.department !== undefined ? { department: body.department } : {}),
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

  http.get(`${BASE}/observations/non-mess`, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const filtered = status
      ? mockNonMessObservations.filter((o) => o.status === status)
      : mockNonMessObservations;
    return HttpResponse.json({
      data: filtered,
      meta: { page: 1, perPage: 25, total: filtered.length, totalPages: 1 },
    });
  }),

  http.get(`${BASE}/observations/non-mess/:id`, ({ params }) => {
    const obs = mockNonMessObservations.find((o) => o.id === Number(params['id']));
    if (!obs)
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Tidak ditemukan.' } },
        { status: 404 },
      );
    return HttpResponse.json({ data: obs });
  }),

  http.get(`${BASE}/schedules/roster`, () => {
    return HttpResponse.json({
      data: [
        {
          id: 1,
          paramedicId: 1,
          paramedicName: 'Muhammad Suryani',
          month: '2026-07',
          messDays: 18,
          nonMessDays: 6,
          assignments: [
            { date: '2026-07-01', type: 'MESS', location: 'Mess A' },
            { date: '2026-07-02', type: 'MESS', location: 'Mess A' },
            { date: '2026-07-04', type: 'NON_MESS', location: 'Satui' },
            { date: '2026-07-07', type: 'MESS', location: 'Mess B' },
            { date: '2026-07-08', type: 'MESS', location: 'Mess B' },
            { date: '2026-07-10', type: 'NON_MESS', location: 'Satui' },
            { date: '2026-07-14', type: 'MESS', location: 'Mess A' },
            { date: '2026-07-15', type: 'MESS', location: 'Mess A' },
            { date: '2026-07-17', type: 'NON_MESS', location: 'Satui' },
            { date: '2026-07-21', type: 'MESS', location: 'Mess GL' },
            { date: '2026-07-22', type: 'MESS', location: 'Mess GL' },
            { date: '2026-07-25', type: 'NON_MESS', location: 'Satui' },
            { date: '2026-07-28', type: 'MESS', location: 'Mess A' },
            { date: '2026-07-29', type: 'MESS', location: 'Mess A' },
            { date: '2026-07-31', type: 'MESS', location: 'Mess Mandala' },
          ],
        },
        {
          id: 2,
          paramedicId: 4,
          paramedicName: 'Agung Priambara',
          month: '2026-07',
          messDays: 15,
          nonMessDays: 4,
          assignments: [
            { date: '2026-07-01', type: 'MESS', location: 'Mess C' },
            { date: '2026-07-03', type: 'NON_MESS', location: 'Satui' },
            { date: '2026-07-06', type: 'MESS', location: 'Mess C' },
            { date: '2026-07-08', type: 'MESS', location: 'Mess C' },
            { date: '2026-07-11', type: 'NON_MESS', location: 'Satui' },
            { date: '2026-07-13', type: 'MESS', location: 'Mess GL' },
            { date: '2026-07-16', type: 'MESS', location: 'Mess C' },
            { date: '2026-07-19', type: 'NON_MESS', location: 'Satui' },
            { date: '2026-07-22', type: 'MESS', location: 'Mess C' },
            { date: '2026-07-24', type: 'MESS', location: 'Mess GL' },
            { date: '2026-07-27', type: 'MESS', location: 'Mess C' },
            { date: '2026-07-30', type: 'MESS', location: 'Mess C' },
          ],
        },
        {
          id: 3,
          paramedicId: 5,
          paramedicName: 'Rina Andriani',
          month: '2026-07',
          messDays: 20,
          nonMessDays: 8,
          assignments: [
            { date: '2026-07-02', type: 'MESS', location: 'Mess GL' },
            { date: '2026-07-04', type: 'NON_MESS', location: 'Satui' },
            { date: '2026-07-07', type: 'MESS', location: 'Mess Mandala' },
            { date: '2026-07-09', type: 'MESS', location: 'Mess GL' },
            { date: '2026-07-12', type: 'NON_MESS', location: 'Satui' },
            { date: '2026-07-14', type: 'MESS', location: 'Mess Mandala' },
            { date: '2026-07-16', type: 'MESS', location: 'Mess GL' },
            { date: '2026-07-18', type: 'NON_MESS', location: 'Satui' },
            { date: '2026-07-20', type: 'MESS', location: 'Mess GL' },
            { date: '2026-07-23', type: 'MESS', location: 'Mess Mandala' },
            { date: '2026-07-26', type: 'NON_MESS', location: 'Satui' },
            { date: '2026-07-28', type: 'MESS', location: 'Mess GL' },
            { date: '2026-07-30', type: 'NON_MESS', location: 'Satui' },
            { date: '2026-07-31', type: 'MESS', location: 'Mess GL' },
          ],
        },
      ],
    });
  }),

  http.get(`${BASE}/master-data/blok`, () => {
    return HttpResponse.json({ data: mockBlok });
  }),

  http.get(`${BASE}/master-data/lokasi`, () => {
    return HttpResponse.json({ data: mockLokasi });
  }),

  http.get(`${BASE}/schedules`, () => {
    return HttpResponse.json({
      data: [
        {
          id: 1,
          date: '2026-07-31',
          shift: 'Malam',
          locationType: 'MESS',
          locationName: 'Mess A',
          targetCount: 5,
          completedCount: 3,
        },
        {
          id: 2,
          date: '2026-08-01',
          shift: 'Malam',
          locationType: 'MESS',
          locationName: 'Mess B',
          targetCount: 4,
          completedCount: 0,
        },
        {
          id: 3,
          date: '2026-08-02',
          shift: 'Siang',
          locationType: 'NON_MESS',
          locationName: 'Satui',
          targetCount: 3,
          completedCount: 0,
        },
      ],
    });
  }),
];
