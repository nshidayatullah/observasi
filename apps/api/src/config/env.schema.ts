// Validasi env wajib di startup — 05_CODING_STANDARD.md §5.5. Boot gagal jika var wajib hilang.
import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string().default('1h'),
  JWT_REFRESH_TTL: z.string().default('7d'),
  UPLOAD_DIR: z.string().min(1),
  MAX_UPLOAD_BYTES: z.coerce.number().positive(),
  CORS_ORIGINS: z.string().min(1),
  PORT: z.coerce.number().default(3000),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Konfigurasi env tidak valid:\n${result.error.toString()}`);
  }
  return result.data;
}
