import { z } from 'zod';
import { COMPANY, MARITAL_STATUS, ROOM_CONDITION, ROOM_FACILITY } from '../constants';

// BR-OBS-06: kuesioner fatigue keluarga wajib jika karyawan punya keluarga serumah.
// Non-Mess observation schema — 3 bagian + kuesioner fatigue.

const companyEnum = z.enum([COMPANY.PT_PPA, COMPANY.PT_AMM, COMPANY.MITRA_KERJA], {
  message: 'Perusahaan wajib dipilih',
});
const maritalEnum = z.enum([MARITAL_STATUS.LAJANG, MARITAL_STATUS.MENIKAH, MARITAL_STATUS.DUDA], {
  message: 'Status pernikahan wajib dipilih',
});
const conditionEnum = z.enum(
  [ROOM_CONDITION.BERSIH_RAPI, ROOM_CONDITION.CUKUP, ROOM_CONDITION.KURANG_RAPI],
  { message: 'Kondisi wajib dipilih' },
);

export const nonMessObservationSchema = z
  .object({
    clientUuid: z.string().uuid(),

    /* Bagian 1: Identitas & Kondisi */
    employeeName: z.string().min(1, 'Nama karyawan wajib diisi'),
    employeeNrp: z.string().min(1, 'NRP wajib diisi'),
    birthDate: z.string().min(1, 'Tanggal lahir wajib diisi'),
    maritalStatus: maritalEnum,
    yearsOfService: z.string().min(1, 'Masa kerja wajib diisi'),
    position: z.string().min(1, 'Jabatan wajib diisi'),
    department: z.string().min(1, 'Departemen wajib diisi'),
    company: companyEnum,
    houseCondition: z.string().min(1, 'Kondisi rumah wajib diisi'),
    wallType: z.string().optional(),
    floorType: z.string().optional(),
    roofType: z.string().optional(),
    roomCount: z.string().optional(),

    /* Aktivitas & Tidur */
    sleepHours: z.string().min(1, 'Jam tidur wajib diisi'),
    wakeUpTime: z.string().optional(),

    /* Fasilitas & Lingkungan */
    roomFacilities: z
      .array(z.enum(Object.values(ROOM_FACILITY) as [string, ...string[]]))
      .optional(),
    hasPet: z.boolean().optional(),
    petDetail: z.string().optional(),
    otherActivities: z.array(z.string()).optional(),
    cleanliness: conditionEnum.optional(),
    hasNoise: z.boolean().optional(),
    noiseSource: z.string().optional(),
    sleepDisturbance: z.string().optional(),

    /* Bagian 2: Kuesioner Fatigue Keluarga */
    respondentName: z.string().optional(),
    respondentAge: z.string().optional(),
    respondentEducation: z.string().optional(),
    respondentRelation: z.string().optional(),
    familyOf: z.string().optional(),
    familyOfPosition: z.string().optional(),
    fatigueUnderstanding: z.string().optional(),
    familyRole: z.string().optional(),
    fatigueRisk: z.string().optional(),
    fatigueCause: z.string().optional(),

    /* Bagian 3: Dokumentasi */
    officerName: z.string().min(1, 'Petugas wajib diisi'),
    observationLocation: z.string().min(1, 'Lokasi observasi wajib diisi'),
    adminEmail: z.string().email('Format email tidak valid').optional(),
    observationDate: z.string().min(1, 'Tanggal observasi wajib diisi'),
  })
  .superRefine((data, ctx) => {
    // Kondisional: jika punya hewan peliharaan, wajib diisi detailnya
    if (data.hasPet && !data.petDetail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['petDetail'],
        message: 'Wajib diisi karena ada hewan peliharaan',
      });
    }
    // Kondisional: jika ada kebisingan, wajib diisi sumbernya
    if (data.hasNoise && !data.noiseSource) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['noiseSource'],
        message: 'Wajib diisi karena ada kebisingan',
      });
    }
  });

export type NonMessObservationInput = z.infer<typeof nonMessObservationSchema>;
