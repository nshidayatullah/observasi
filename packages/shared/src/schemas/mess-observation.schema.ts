import { z } from 'zod';
import { COMPANY } from '../constants';

// BR-OBS-04: temuan wajib disertai data karyawan lengkap.
// Divalidasi juga di DB constraint mess_finding_requires_employee sebagai jaring pengaman.
export const messObservationSchema = z
  .object({
    clientUuid: z.string().uuid(),
    observationDate: z.string().min(1, 'Tanggal observasi wajib diisi'),
    messComplex: z.string().min(1, 'Komplek mess wajib dipilih'),
    roomNumber: z.string().min(1, 'Nomor mess wajib dipilih'),
    hasFinding: z.boolean(),
    employeeName: z.string().optional(),
    employeeNik: z.string().optional(),
    company: z.enum([COMPANY.PT_PPA, COMPANY.PT_AMM, COMPANY.MITRA_KERJA]).optional(),
    bloodPressure: z.string().optional(),
    activity: z.string().optional(),
    reason: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.hasFinding) return;
    const requiredWhenFinding: (keyof typeof data)[] = [
      'employeeName',
      'employeeNik',
      'company',
      'activity',
      'reason',
    ];
    for (const field of requiredWhenFinding) {
      if (!data[field]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message: 'Wajib diisi karena ada temuan',
        });
      }
    }
  });

export type MessObservationInput = z.infer<typeof messObservationSchema>;
