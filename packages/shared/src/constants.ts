// Sumber tunggal enum & konstanta. Frontend dan backend wajib import dari sini — 05_CODING_STANDARD.md §1.

export const ROLE = {
  PARAMEDIC: 'PARAMEDIC',
  DOCTOR: 'DOCTOR',
  SUPERADMIN: 'SUPERADMIN',
} as const;
export type Role = (typeof ROLE)[keyof typeof ROLE];

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  LOCKED: 'LOCKED',
} as const;
export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export const OBSERVATION_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;
export type ObservationStatus = (typeof OBSERVATION_STATUS)[keyof typeof OBSERVATION_STATUS];

export const OBSERVATION_TYPE = {
  MESS: 'MESS',
  NON_MESS: 'NON_MESS',
} as const;
export type ObservationType = (typeof OBSERVATION_TYPE)[keyof typeof OBSERVATION_TYPE];

export const COMPANY = {
  PT_PPA: 'PT_PPA',
  PT_AMM: 'PT_AMM',
  MITRA_KERJA: 'MITRA_KERJA',
} as const;
export type Company = (typeof COMPANY)[keyof typeof COMPANY];

export const MARITAL_STATUS = {
  LAJANG: 'LAJANG',
  MENIKAH: 'MENIKAH',
  DUDA: 'DUDA',
} as const;
export type MaritalStatus = (typeof MARITAL_STATUS)[keyof typeof MARITAL_STATUS];

// Shift kerja karyawan yang diobservasi. Kunjungan observasi (08.00-12.00) memeriksa
// istirahat karyawan SIANG (shift MALAM) sebelum mereka bertugas malam hari — 00_PRD.md §1.1.
export const EMPLOYEE_SHIFT = {
  SIANG: 'SIANG',
  MALAM: 'MALAM',
  OFF: 'OFF',
  OVERSHIFT: 'OVERSHIFT',
  CUTI: 'CUTI',
} as const;
export type EmployeeShift = (typeof EMPLOYEE_SHIFT)[keyof typeof EMPLOYEE_SHIFT];

export const ROOM_CONDITION = {
  BERSIH_RAPI: 'BERSIH_RAPI',
  CUKUP: 'CUKUP',
  KURANG_RAPI: 'KURANG_RAPI',
} as const;
export type RoomCondition = (typeof ROOM_CONDITION)[keyof typeof ROOM_CONDITION];

export const ROOM_FACILITY = {
  AC: 'AC',
  KIPAS_ANGIN: 'KIPAS_ANGIN',
  VENTILASI: 'VENTILASI',
  KASUR_LAYAK: 'KASUR_LAYAK',
} as const;
export type RoomFacility = (typeof ROOM_FACILITY)[keyof typeof ROOM_FACILITY];

// Waktu kunjungan observasi lapangan (bukan shift kerja karyawan) — selalu siang, 08.00-12.00.
export const VISIT_TIME = {
  PAGI: 'PAGI',
  SORE: 'SORE',
  MALAM: 'MALAM',
} as const;
export type VisitTime = (typeof VISIT_TIME)[keyof typeof VISIT_TIME];

export const AUDIT_ACTION = {
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DEACTIVATED: 'USER_DEACTIVATED',
  USER_PASSWORD_RESET: 'USER_PASSWORD_RESET',
  OBSERVATION_APPROVED: 'OBSERVATION_APPROVED',
  OBSERVATION_REJECTED: 'OBSERVATION_REJECTED',
} as const;
export type AuditAction = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];

export const MAX_PHOTO_SIZE_BYTES = 500 * 1024; // NFR-04: kompresi target ≤ 500 KB
export const MAX_PHOTO_SIZE_BEFORE_COMPRESSION_BYTES = 5 * 1024 * 1024;
export const ACCOUNT_LOCK_DURATION_MINUTES = 15;
export const ACCOUNT_LOCK_MAX_ATTEMPTS = 5;
export const ACCESS_TOKEN_TTL = '1h';
export const REFRESH_TOKEN_TTL = '7d';
