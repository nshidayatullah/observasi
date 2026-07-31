import {
  ROLE,
  USER_STATUS,
  OBSERVATION_STATUS,
  OBSERVATION_TYPE,
  COMPANY,
} from '@observasi/shared';
import type { Role, UserStatus, ObservationStatus } from '@observasi/shared';

export type MockUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  forcePasswordChange: boolean;
  lastLoginAt: string | null;
};

export const mockUsers: MockUser[] = [
  {
    id: 1,
    name: 'Muhammad Suryani',
    email: 'suryani@example.com',
    role: ROLE.PARAMEDIC,
    status: USER_STATUS.ACTIVE,
    forcePasswordChange: false,
    lastLoginAt: '2026-07-31T01:30:00.000Z',
  },
  {
    id: 2,
    name: 'dr. Haamim Sajdah S',
    email: 'haamim@example.com',
    role: ROLE.DOCTOR,
    status: USER_STATUS.ACTIVE,
    forcePasswordChange: false,
    lastLoginAt: '2026-07-31T02:00:00.000Z',
  },
  {
    id: 3,
    name: 'Hidayatullah',
    email: 'admin@example.com',
    role: ROLE.SUPERADMIN,
    status: USER_STATUS.ACTIVE,
    forcePasswordChange: false,
    lastLoginAt: '2026-07-31T00:00:00.000Z',
  },
  {
    id: 4,
    name: 'Agung Priambara',
    email: 'agung@example.com',
    role: ROLE.PARAMEDIC,
    status: USER_STATUS.ACTIVE,
    forcePasswordChange: true,
    lastLoginAt: null,
  },
];

export type MockMessObservation = {
  id: number;
  type: typeof OBSERVATION_TYPE.MESS;
  paramedicId: number;
  paramedicName: string;
  messComplex: string;
  roomNumber: string;
  observationDate: string;
  createdAt: string;
  hasFinding: boolean;
  status: ObservationStatus;
  officerName: string;
  employeeName?: string;
  employeeNik?: string;
  company?: (typeof COMPANY)[keyof typeof COMPANY];
  position?: string;
  department?: string;
  bloodPressure?: string;
  activity?: string;
  reason?: string;
};

export const mockMessObservations: MockMessObservation[] = [
  {
    id: 101,
    type: OBSERVATION_TYPE.MESS,
    paramedicId: 1,
    paramedicName: 'Muhammad Suryani',
    messComplex: 'Mess A',
    roomNumber: '7',
    observationDate: '2026-07-31',
    createdAt: '2026-07-31T02:14:00.000Z',
    hasFinding: true,
    status: OBSERVATION_STATUS.PENDING,
    officerName: 'Muhammad Suryani',
    employeeName: 'Budi Santoso',
    employeeNik: 'PPA-004512',
    company: COMPANY.PT_PPA,
    position: 'Operator HD',
    department: 'Production',
    bloodPressure: '130/85 mmHg',
    activity: 'Bermain game di ponsel',
    reason: 'Belum mengantuk, baru pulang dari warung',
  },
  {
    id: 102,
    type: OBSERVATION_TYPE.MESS,
    paramedicId: 1,
    paramedicName: 'Muhammad Suryani',
    messComplex: 'Mess A',
    roomNumber: '6',
    observationDate: '2026-07-31',
    createdAt: '2026-07-31T02:02:00.000Z',
    hasFinding: false,
    status: OBSERVATION_STATUS.PENDING,
    officerName: 'Muhammad Suryani',
  },
  {
    id: 103,
    type: OBSERVATION_TYPE.MESS,
    paramedicId: 4,
    paramedicName: 'Agung Priambara',
    messComplex: 'Mess C',
    roomNumber: '3',
    observationDate: '2026-07-27',
    createdAt: '2026-07-27T03:05:00.000Z',
    hasFinding: true,
    status: OBSERVATION_STATUS.PENDING,
    officerName: 'Agung Priambara',
    employeeName: 'Ahmad Fauzi',
    employeeNik: 'AMM-002211',
    company: COMPANY.PT_AMM,
    bloodPressure: '125/80 mmHg',
    activity: 'Menonton televisi',
    reason: 'Kamar sebelah ramai',
  },
];

export const mockMessComplexes = [
  { id: 1, name: 'Mess A', roomCount: 12 },
  { id: 2, name: 'Mess B', roomCount: 12 },
  { id: 3, name: 'Mess C', roomCount: 12 },
  { id: 4, name: 'Mess GL', roomCount: 12 },
  { id: 5, name: 'Mess Mandala', roomCount: 12 },
];

export const mockKpiSummary = {
  messCount: 128,
  nonMessCount: 34,
  findingCount: 41,
  scheduleCompliance: 0.9,
  averageApprovalHours: 18,
  overdueApprovalCount: 3,
};
