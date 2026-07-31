import type { ObservationStatus, Company } from '@observasi/shared';

export type MessObservation = {
  id: number;
  type: 'MESS';
  paramedicId: number;
  paramedicName: string;
  messComplex: string;
  roomNumber: string;
  observationDate: string;
  createdAt: string;
  hasFinding: boolean;
  status: ObservationStatus;
  employeeName?: string;
  employeeNik?: string;
  company?: Company;
  bloodPressure?: string;
  activity?: string;
  reason?: string;
};
