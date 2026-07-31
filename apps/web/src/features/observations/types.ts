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
  officerName: string;
  employeeName?: string;
  employeeNik?: string;
  company?: Company;
  position?: string;
  department?: string;
  bloodPressure?: string;
  activity?: string;
  reason?: string;
};
