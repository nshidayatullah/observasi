// Label Bahasa Indonesia untuk enum di constants.ts — 08_UI_GUIDE.md §7.2. Satu-satunya sumber.
import {
  ROLE,
  USER_STATUS,
  OBSERVATION_STATUS,
  OBSERVATION_TYPE,
  COMPANY,
  MARITAL_STATUS,
  EMPLOYEE_SHIFT,
  ROOM_CONDITION,
  ROOM_FACILITY,
  VISIT_TIME,
  type Role,
  type UserStatus,
  type ObservationStatus,
  type ObservationType,
  type Company,
  type MaritalStatus,
  type EmployeeShift,
  type RoomCondition,
  type RoomFacility,
  type VisitTime,
} from './constants';

export const ROLE_LABEL: Record<Role, string> = {
  [ROLE.PARAMEDIC]: 'Paramedis',
  [ROLE.DOCTOR]: 'Dokter',
  [ROLE.SUPERADMIN]: 'Superadmin',
};

export const USER_STATUS_LABEL: Record<UserStatus, string> = {
  [USER_STATUS.ACTIVE]: 'Aktif',
  [USER_STATUS.INACTIVE]: 'Nonaktif',
  [USER_STATUS.LOCKED]: 'Terkunci',
};

export const OBSERVATION_STATUS_LABEL: Record<ObservationStatus, string> = {
  [OBSERVATION_STATUS.PENDING]: 'Menunggu Persetujuan',
  [OBSERVATION_STATUS.APPROVED]: 'Disetujui',
  [OBSERVATION_STATUS.REJECTED]: 'Ditolak',
};

export const OBSERVATION_TYPE_LABEL: Record<ObservationType, string> = {
  [OBSERVATION_TYPE.MESS]: 'Karyawan Mess',
  [OBSERVATION_TYPE.NON_MESS]: 'Kunjungan Rumah',
};

export const COMPANY_LABEL: Record<Company, string> = {
  [COMPANY.PT_PPA]: 'PT. PPA',
  [COMPANY.PT_AMM]: 'PT. AMM',
  [COMPANY.MITRA_KERJA]: 'Mitra Kerja',
};

export const MARITAL_STATUS_LABEL: Record<MaritalStatus, string> = {
  [MARITAL_STATUS.LAJANG]: 'Lajang',
  [MARITAL_STATUS.MENIKAH]: 'Menikah',
  [MARITAL_STATUS.DUDA]: 'Duda',
};

export const EMPLOYEE_SHIFT_LABEL: Record<EmployeeShift, string> = {
  [EMPLOYEE_SHIFT.SIANG]: 'Siang',
  [EMPLOYEE_SHIFT.MALAM]: 'Malam',
  [EMPLOYEE_SHIFT.OFF]: 'Off',
  [EMPLOYEE_SHIFT.OVERSHIFT]: 'Overshift',
  [EMPLOYEE_SHIFT.CUTI]: 'Cuti',
};

export const ROOM_CONDITION_LABEL: Record<RoomCondition, string> = {
  [ROOM_CONDITION.BERSIH_RAPI]: 'Bersih & Rapi',
  [ROOM_CONDITION.CUKUP]: 'Cukup',
  [ROOM_CONDITION.KURANG_RAPI]: 'Kurang Rapi',
};

export const ROOM_FACILITY_LABEL: Record<RoomFacility, string> = {
  [ROOM_FACILITY.AC]: 'AC',
  [ROOM_FACILITY.KIPAS_ANGIN]: 'Kipas Angin',
  [ROOM_FACILITY.VENTILASI]: 'Ventilasi',
  [ROOM_FACILITY.KASUR_LAYAK]: 'Kasur Layak',
};

export const VISIT_TIME_LABEL: Record<VisitTime, string> = {
  [VISIT_TIME.PAGI]: 'Pagi',
  [VISIT_TIME.SORE]: 'Sore',
  [VISIT_TIME.MALAM]: 'Malam',
};
