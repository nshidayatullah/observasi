import {
  ROLE,
  USER_STATUS,
  OBSERVATION_STATUS,
  OBSERVATION_TYPE,
  COMPANY,
} from '@observasi/shared';
import type { Role, UserStatus, ObservationStatus } from '@observasi/shared';

/* ── Daftar Pengguna ────────────────────────────────────── */

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
    lastLoginAt: '2026-07-31T09:14:00.000Z',
  },
  {
    id: 2,
    name: 'dr. Haamim Sajdah S',
    email: 'haamim@example.com',
    role: ROLE.DOCTOR,
    status: USER_STATUS.ACTIVE,
    forcePasswordChange: false,
    lastLoginAt: '2026-07-31T10:30:00.000Z',
  },
  {
    id: 3,
    name: 'Hidayatullah',
    email: 'admin@example.com',
    role: ROLE.SUPERADMIN,
    status: USER_STATUS.ACTIVE,
    forcePasswordChange: false,
    lastLoginAt: '2026-07-31T08:00:00.000Z',
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
  {
    id: 5,
    name: 'Rina Andriani',
    email: 'rina@example.com',
    role: ROLE.PARAMEDIC,
    status: USER_STATUS.ACTIVE,
    forcePasswordChange: false,
    lastLoginAt: '2026-07-30T14:20:00.000Z',
  },
  {
    id: 6,
    name: 'dr. Fitri Nurlaila',
    email: 'fitri@example.com',
    role: ROLE.DOCTOR,
    status: USER_STATUS.ACTIVE,
    forcePasswordChange: false,
    lastLoginAt: '2026-07-31T09:00:00.000Z',
  },
  {
    id: 7,
    name: 'Bambang Hermawan',
    email: 'bambang@example.com',
    role: ROLE.PARAMEDIC,
    status: USER_STATUS.INACTIVE,
    forcePasswordChange: false,
    lastLoginAt: '2026-06-15T11:00:00.000Z',
  },
];

/* ── Observasi Mess ─────────────────────────────────────── */

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
  // --- PENDING ---
  {
    id: 101,
    type: OBSERVATION_TYPE.MESS,
    paramedicId: 1,
    paramedicName: 'Muhammad Suryani',
    messComplex: 'Mess A',
    roomNumber: '7',
    observationDate: '2026-07-31',
    createdAt: '2026-07-31T09:14:00.000Z',
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
    createdAt: '2026-07-31T09:02:00.000Z',
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
    observationDate: '2026-07-30',
    createdAt: '2026-07-30T11:05:00.000Z',
    hasFinding: true,
    status: OBSERVATION_STATUS.PENDING,
    officerName: 'Agung Priambara',
    employeeName: 'Ahmad Fauzi',
    employeeNik: 'AMM-002211',
    company: COMPANY.PT_AMM,
    position: 'Mekanik',
    department: 'Workshop',
    bloodPressure: '125/80 mmHg',
    activity: 'Menonton televisi',
    reason: 'Kamar sebelah ramai, tidak bisa tidur',
  },
  {
    id: 104,
    type: OBSERVATION_TYPE.MESS,
    paramedicId: 5,
    paramedicName: 'Rina Andriani',
    messComplex: 'Mess GL',
    roomNumber: '2',
    observationDate: '2026-07-31',
    createdAt: '2026-07-31T09:45:00.000Z',
    hasFinding: true,
    status: OBSERVATION_STATUS.PENDING,
    officerName: 'Rina Andriani',
    employeeName: 'Dedi Kusuma',
    employeeNik: 'PPA-007823',
    company: COMPANY.PT_PPA,
    position: 'Welder',
    department: 'Fabrication',
    bloodPressure: '140/90 mmHg',
    activity: 'Menelepon keluarga',
    reason: 'Baru dapat kabar anak sakit di kampung',
  },
  {
    id: 105,
    type: OBSERVATION_TYPE.MESS,
    paramedicId: 5,
    paramedicName: 'Rina Andriani',
    messComplex: 'Mess B',
    roomNumber: '10',
    observationDate: '2026-07-31',
    createdAt: '2026-07-31T10:20:00.000Z',
    hasFinding: false,
    status: OBSERVATION_STATUS.PENDING,
    officerName: 'Rina Andriani',
  },

  // --- APPROVED ---
  {
    id: 201,
    type: OBSERVATION_TYPE.MESS,
    paramedicId: 1,
    paramedicName: 'Muhammad Suryani',
    messComplex: 'Mess A',
    roomNumber: '4',
    observationDate: '2026-07-29',
    createdAt: '2026-07-29T09:30:00.000Z',
    hasFinding: true,
    status: OBSERVATION_STATUS.APPROVED,
    officerName: 'Muhammad Suryani',
    employeeName: 'Rudi Hartono',
    employeeNik: 'PPA-003211',
    company: COMPANY.PT_PPA,
    position: 'Driver DT',
    department: 'Hauling',
    bloodPressure: '120/80 mmHg',
    activity: 'Menonton YouTube',
    reason: 'Jam tidur belum teratur setelah libur panjang',
  },
  {
    id: 202,
    type: OBSERVATION_TYPE.MESS,
    paramedicId: 1,
    paramedicName: 'Muhammad Suryani',
    messComplex: 'Mess A',
    roomNumber: '9',
    observationDate: '2026-07-28',
    createdAt: '2026-07-28T09:15:00.000Z',
    hasFinding: false,
    status: OBSERVATION_STATUS.APPROVED,
    officerName: 'Muhammad Suryani',
  },
  {
    id: 203,
    type: OBSERVATION_TYPE.MESS,
    paramedicId: 4,
    paramedicName: 'Agung Priambara',
    messComplex: 'Mess C',
    roomNumber: '1',
    observationDate: '2026-07-27',
    createdAt: '2026-07-27T10:40:00.000Z',
    hasFinding: true,
    status: OBSERVATION_STATUS.APPROVED,
    officerName: 'Agung Priambara',
    employeeName: 'Hendra Gunawan',
    employeeNik: 'AMM-001988',
    company: COMPANY.PT_AMM,
    position: 'Operator Crusher',
    department: 'Crushing Plant',
    bloodPressure: '135/85 mmHg',
    activity: 'Baca novel di ponsel',
    reason: 'Stres pekerjaan shift malam',
  },

  // --- REJECTED ---
  {
    id: 301,
    type: OBSERVATION_TYPE.MESS,
    paramedicId: 4,
    paramedicName: 'Agung Priambara',
    messComplex: 'Mess C',
    roomNumber: '8',
    observationDate: '2026-07-26',
    createdAt: '2026-07-26T09:50:00.000Z',
    hasFinding: true,
    status: OBSERVATION_STATUS.REJECTED,
    officerName: 'Agung Priambara',
    employeeName: 'Eko Prasetyo',
    employeeNik: 'AMM-003456',
    company: COMPANY.PT_AMM,
    position: 'Helper',
    department: 'Workshop',
    bloodPressure: '110/70 mmHg',
    activity: 'Ngobrol di kantin mess',
    reason: 'Katanya lapar, keluar cari makan',
  },
];

/* ── Observasi Non-Mess ─────────────────────────────────── */

export type MockNonMessObservation = {
  id: number;
  type: typeof OBSERVATION_TYPE.NON_MESS;
  paramedicId: number;
  paramedicName: string;
  observationDate: string;
  createdAt: string;
  status: ObservationStatus;
  officerName: string;
  employeeName: string;
  employeeNrp: string;
  company: (typeof COMPANY)[keyof typeof COMPANY];
  position: string;
  department: string;
  houseCondition: string;
  sleepHours: string;
  respondentName?: string;
  observationLocation: string;
};

export const mockNonMessObservations: MockNonMessObservation[] = [
  {
    id: 401,
    type: OBSERVATION_TYPE.NON_MESS,
    paramedicId: 1,
    paramedicName: 'Muhammad Suryani',
    observationDate: '2026-07-30',
    createdAt: '2026-07-30T14:30:00.000Z',
    status: OBSERVATION_STATUS.PENDING,
    officerName: 'Muhammad Suryani',
    employeeName: 'Rudi Hartono',
    employeeNrp: 'PPA-003211',
    company: COMPANY.PT_PPA,
    position: 'Driver DT',
    department: 'Hauling',
    houseCondition: 'Cukup',
    sleepHours: '22:00 - 04:30',
    respondentName: 'Sumiati (istri)',
    observationLocation: 'Satui, Tanah Bumbu',
  },
  {
    id: 402,
    type: OBSERVATION_TYPE.NON_MESS,
    paramedicId: 1,
    paramedicName: 'Muhammad Suryani',
    observationDate: '2026-07-28',
    createdAt: '2026-07-28T15:00:00.000Z',
    status: OBSERVATION_STATUS.APPROVED,
    officerName: 'Muhammad Suryani',
    employeeName: 'Supriyanto',
    employeeNrp: 'PPA-005678',
    company: COMPANY.PT_PPA,
    position: 'Operator Excavator',
    department: 'Mining',
    houseCondition: 'Bersih & Rapi',
    sleepHours: '21:30 - 05:00',
    respondentName: 'Siti (istri)',
    observationLocation: 'Satui, Tanah Bumbu',
  },
  {
    id: 403,
    type: OBSERVATION_TYPE.NON_MESS,
    paramedicId: 5,
    paramedicName: 'Rina Andriani',
    observationDate: '2026-07-29',
    createdAt: '2026-07-29T13:45:00.000Z',
    status: OBSERVATION_STATUS.PENDING,
    officerName: 'Rina Andriani',
    employeeName: 'Yanto',
    employeeNrp: 'AMM-004500',
    company: COMPANY.PT_AMM,
    position: 'Operator Dozer',
    department: 'Mining',
    houseCondition: 'Kurang Rapi',
    sleepHours: '23:00 - 05:30',
    observationLocation: 'Satui, Tanah Bumbu',
  },
];

/* ── Komplek Mess ───────────────────────────────────────── */

export const mockMessComplexes = [
  { id: 1, name: 'Mess A', roomCount: 12 },
  { id: 2, name: 'Mess B', roomCount: 12 },
  { id: 3, name: 'Mess C', roomCount: 12 },
  { id: 4, name: 'Mess GL', roomCount: 12 },
  { id: 5, name: 'Mess Mandala', roomCount: 12 },
  { id: 6, name: 'Mess D', roomCount: 8 },
  { id: 7, name: 'Mess E', roomCount: 8 },
  { id: 8, name: 'Mess F', roomCount: 8 },
  { id: 9, name: 'Mess G', roomCount: 6 },
  { id: 10, name: 'Mess H', roomCount: 6 },
  { id: 11, name: 'Mess KPR', roomCount: 20 },
  { id: 12, name: 'Mess Baru', roomCount: 16 },
];

export const mockBlok = [
  { id: 1, name: 'Blok A', location: 'Site BIB', messCount: 2, messList: ['Mess A', 'Mess B'] },
  { id: 2, name: 'Blok B', location: 'Site BIB', messCount: 2, messList: ['Mess C', 'Mess D'] },
  {
    id: 3,
    name: 'Blok C',
    location: 'Site BIB',
    messCount: 3,
    messList: ['Mess GL', 'Mess Mandala', 'Mess E'],
  },
  { id: 4, name: 'Blok D', location: 'Site BIB', messCount: 2, messList: ['Mess F', 'Mess G'] },
  {
    id: 5,
    name: 'Blok E',
    location: 'Site BIB',
    messCount: 3,
    messList: ['Mess H', 'Mess KPR', 'Mess Baru'],
  },
];

export const mockLokasi = [
  { id: 1, name: 'Satui', kecamatan: 'Satui', kabupaten: 'Tanah Bumbu' },
  { id: 2, name: 'Simpang Empat', kecamatan: 'Simpang Empat', kabupaten: 'Tanah Bumbu' },
  { id: 3, name: 'Batu Licin', kecamatan: 'Batu Licin', kabupaten: 'Tanah Bumbu' },
  { id: 4, name: 'Kusan Hilir', kecamatan: 'Kusan Hilir', kabupaten: 'Tanah Bumbu' },
  { id: 5, name: 'Angsana', kecamatan: 'Angsana', kabupaten: 'Tanah Bumbu' },
  { id: 6, name: 'Kuranji', kecamatan: 'Kuranji', kabupaten: 'Tanah Bumbu' },
  { id: 7, name: 'Karang Bintang', kecamatan: 'Karang Bintang', kabupaten: 'Tanah Bumbu' },
  { id: 8, name: 'Mantewe', kecamatan: 'Mantewe', kabupaten: 'Tanah Bumbu' },
  { id: 9, name: 'Sungai Loban', kecamatan: 'Sungai Loban', kabupaten: 'Tanah Bumbu' },
  { id: 10, name: 'Teluk Kepayang', kecamatan: 'Teluk Kepayang', kabupaten: 'Tanah Bumbu' },
];

/* ── KPI ────────────────────────────────────────────────── */

export const mockKpiSummary = {
  messCount: 156,
  nonMessCount: 42,
  findingCount: 53,
  scheduleCompliance: 0.88,
  averageApprovalHours: 14,
  overdueApprovalCount: 5,
};
