# 03 — Database Specification

> PostgreSQL 16 + Prisma ORM 6. Turunan dari 02_ERD.md.
> File ini adalah sumber kebenaran untuk `prisma/schema.prisma`.

---

## 1. Konvensi

| Aspek | Aturan |
|---|---|
| Nama tabel | `snake_case`, jamak (`mess_observations`) |
| Nama kolom | `snake_case` di DB, `camelCase` di Prisma client (via `@map`) |
| Primary key | `id` — `Int @id @default(autoincrement())`; `audit_logs` pakai `BigInt` |
| Timestamp | `timestamptz` (UTC di DB, dikonversi ke `Asia/Makassar` di presentasi) |
| Enum | Enum PostgreSQL native, UPPER_SNAKE_CASE |
| Boolean | Prefiks `is_` / `has_` |
| Uang / desimal | Tidak ada di skema ini |
| Soft delete | Kolom `deleted_at timestamptz NULL` |
| Teks panjang | `Text` untuk textarea; `VarChar(n)` untuk input pendek |

**Zona waktu:** server dan database berjalan di UTC. Konversi ke WITA (UTC+8) dilakukan di frontend. `observation_date` bertipe `Date` (tanpa waktu) sehingga tidak terpengaruh pergeseran zona.

---

## 2. Skema Prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────── ENUMS ───────────────────────────

enum Role {
  PARAMEDIC
  DOCTOR
  SUPERADMIN
}

enum UserStatus {
  ACTIVE
  INACTIVE
  LOCKED
}

enum ObservationType {
  MESS
  NON_MESS
}

enum ObservationStatus {
  PENDING
  APPROVED
  REJECTED
}

enum Company {
  PT_PPA
  PT_AMM
  MITRA_KERJA
}

enum MaritalStatus {
  LAJANG
  MENIKAH
  DUDA
}

enum WorkShift {
  SIANG
  MALAM
  OFF
  OVERSHIFT
  CUTI
}

enum CleanlinessLevel {
  BERSIH_RAPI
  CUKUP
  KURANG_RAPI
}

enum Education {
  SD
  SMP
  SMA
  DIPLOMA
  SARJANA
}

enum RelationToEmployee {
  ISTRI
  IBU
  AYAH
  ANAK
  SAUDARA_KANDUNG
  LAINNYA
}

enum ScheduleShift {
  PAGI
  MALAM
}

enum PhotoCategory {
  FINDING
  MESS_CONDITION
  HOME_VISIT
}

enum AuditAction {
  LOGIN
  LOGIN_FAILED
  LOGOUT
  CREATE_USER
  UPDATE_USER
  DELETE_USER
  DEACTIVATE_USER
  ACTIVATE_USER
  RESET_PASSWORD
  CHANGE_PASSWORD
  CREATE_OBSERVATION
  APPROVE_OBSERVATION
  REJECT_OBSERVATION
  CREATE_SCHEDULE
  UPDATE_SCHEDULE
  DELETE_SCHEDULE
  CREATE_MASTER_DATA
  UPDATE_MASTER_DATA
  DELETE_MASTER_DATA
  GENERATE_REPORT
}

// ─────────────────────────── USERS ───────────────────────────

model User {
  id                   Int        @id @default(autoincrement())
  name                 String     @db.VarChar(120)
  email                String     @db.VarChar(160)
  passwordHash         String     @map("password_hash") @db.VarChar(72)
  role                 Role
  status               UserStatus @default(ACTIVE)
  failedLoginAttempts  Int        @default(0) @map("failed_login_attempts")
  lockedUntil          DateTime?  @map("locked_until") @db.Timestamptz(3)
  lastLoginAt          DateTime?  @map("last_login_at") @db.Timestamptz(3)
  passwordChangedAt    DateTime?  @map("password_changed_at") @db.Timestamptz(3)
  forcePasswordChange  Boolean    @default(true) @map("force_password_change")
  createdAt            DateTime   @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt            DateTime   @updatedAt @map("updated_at") @db.Timestamptz(3)
  deletedAt            DateTime?  @map("deleted_at") @db.Timestamptz(3)

  refreshTokens        RefreshToken[]
  messObservations     MessObservation[]    @relation("MessParamedic")
  messApprovals        MessObservation[]    @relation("MessDoctor")
  nonMessObservations  NonMessObservation[] @relation("NonMessParamedic")
  nonMessApprovals     NonMessObservation[] @relation("NonMessDoctor")
  schedules            Schedule[]           @relation("ScheduleParamedic")
  createdSchedules     Schedule[]           @relation("ScheduleCreator")

  @@index([role, status])
  @@index([email])
  @@map("users")
}

model RefreshToken {
  id        Int       @id @default(autoincrement())
  userId    Int       @map("user_id")
  tokenHash String    @unique @map("token_hash") @db.VarChar(128)
  expiresAt DateTime  @map("expires_at") @db.Timestamptz(3)
  revokedAt DateTime? @map("revoked_at") @db.Timestamptz(3)
  userAgent String?   @map("user_agent") @db.VarChar(255)
  ipAddress String?   @map("ip_address") @db.VarChar(45)
  createdAt DateTime  @default(now()) @map("created_at") @db.Timestamptz(3)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, revokedAt])
  @@index([expiresAt])
  @@map("refresh_tokens")
}

// ───────────────────────── MASTER DATA ─────────────────────────

model MessComplex {
  id        Int       @id @default(autoincrement())
  name      String    @db.VarChar(60)
  sortOrder Int       @default(0) @map("sort_order")
  isActive  Boolean   @default(true) @map("is_active")
  createdAt DateTime  @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt DateTime  @updatedAt @map("updated_at") @db.Timestamptz(3)
  deletedAt DateTime? @map("deleted_at") @db.Timestamptz(3)

  rooms        MessRoom[]
  observations MessObservation[]

  @@index([isActive, sortOrder])
  @@map("mess_complexes")
}

model MessRoom {
  id         Int       @id @default(autoincrement())
  complexId  Int       @map("complex_id")
  roomNumber String    @map("room_number") @db.VarChar(20)
  isActive   Boolean   @default(true) @map("is_active")
  createdAt  DateTime  @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt  DateTime  @updatedAt @map("updated_at") @db.Timestamptz(3)
  deletedAt  DateTime? @map("deleted_at") @db.Timestamptz(3)

  complex      MessComplex       @relation(fields: [complexId], references: [id], onDelete: Restrict)
  observations MessObservation[]

  @@index([complexId, isActive])
  @@map("mess_rooms")
}

model ObservationLocation {
  id        Int       @id @default(autoincrement())
  village   String    @db.VarChar(80)
  district  String    @db.VarChar(80)
  isActive  Boolean   @default(true) @map("is_active")
  createdAt DateTime  @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt DateTime  @updatedAt @map("updated_at") @db.Timestamptz(3)
  deletedAt DateTime? @map("deleted_at") @db.Timestamptz(3)

  observations NonMessObservation[]

  @@index([isActive, district])
  @@map("observation_locations")
}

// ──────────────────── OBSERVASI MESS ────────────────────

model MessObservation {
  id         Int    @id @default(autoincrement())
  clientUuid String @unique @map("client_uuid") @db.Uuid

  paramedicId     Int    @map("paramedic_id")
  observationDate DateTime @map("observation_date") @db.Date
  messComplexId   Int    @map("mess_complex_id")
  messRoomId      Int    @map("mess_room_id")

  messComplexNameSnapshot String @map("mess_complex_name_snapshot") @db.VarChar(60)
  messRoomNumberSnapshot  String @map("mess_room_number_snapshot") @db.VarChar(20)

  hasFinding Boolean @map("has_finding")

  // Bagian 2 — wajib di aplikasi jika hasFinding = true
  employeeName     String?  @map("employee_name") @db.VarChar(120)
  employeeNik      String?  @map("employee_nik") @db.VarChar(30)
  employeeCompany  Company? @map("employee_company")
  employeePosition String?  @map("employee_position") @db.VarChar(80)
  employeeDept     String?  @map("employee_dept") @db.VarChar(80)
  bloodPressure    String?  @map("blood_pressure") @db.VarChar(20)
  activityDesc     String?  @map("activity_desc") @db.Text
  reasonNotSleep   String?  @map("reason_not_sleep") @db.Text

  status      ObservationStatus @default(PENDING)
  doctorId    Int?              @map("doctor_id")
  doctorNotes String?           @map("doctor_notes") @db.Text
  approvedAt  DateTime?         @map("approved_at") @db.Timestamptz(3)

  submittedAt DateTime  @map("submitted_at") @db.Timestamptz(3)
  createdAt   DateTime  @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt   DateTime  @updatedAt @map("updated_at") @db.Timestamptz(3)

  paramedic   User        @relation("MessParamedic", fields: [paramedicId], references: [id], onDelete: Restrict)
  doctor      User?       @relation("MessDoctor", fields: [doctorId], references: [id], onDelete: SetNull)
  messComplex MessComplex @relation(fields: [messComplexId], references: [id], onDelete: Restrict)
  messRoom    MessRoom    @relation(fields: [messRoomId], references: [id], onDelete: Restrict)
  photos      ObservationPhoto[]

  @@index([status, createdAt])
  @@index([paramedicId, observationDate(sort: Desc)])
  @@index([observationDate, status])
  @@index([messComplexId, observationDate])
  @@map("mess_observations")
}

// ────────────────── OBSERVASI NON-MESS ──────────────────

model NonMessObservation {
  id         Int    @id @default(autoincrement())
  clientUuid String @unique @map("client_uuid") @db.Uuid

  paramedicId Int    @map("paramedic_id")
  adminEmail  String @map("admin_email") @db.VarChar(160)

  // Bagian 1a — Data diri karyawan
  employeeName   String        @map("employee_name") @db.VarChar(120)
  employeeNrp    String        @map("employee_nrp") @db.VarChar(30)
  birthDate      DateTime      @map("birth_date") @db.Date
  maritalStatus  MaritalStatus @map("marital_status")
  workingPeriod  String        @map("working_period") @db.VarChar(60)
  position       String        @db.VarChar(80)
  department     String        @db.VarChar(80)
  company        Company

  // Bagian 1b — Kondisi rumah
  lengthOfStayOutside        String @map("length_of_stay_outside") @db.VarChar(60)
  occupantsCount             Int    @map("occupants_count")
  relationshipWithOccupants  Json   @map("relationship_with_occupants")
  childrenCount              Int    @map("children_count")
  homeAddress                String @map("home_address") @db.Text

  // Bagian 1c — Aktivitas & tidur
  workShift  WorkShift @map("work_shift")
  isSleeping Boolean   @map("is_sleeping")

  // Bagian 1d — Fasilitas & lingkungan
  roomFacilities             Json             @map("room_facilities")
  hasPet                     Boolean          @default(false) @map("has_pet")
  petDetails                 String?          @map("pet_details") @db.VarChar(255)
  sideActivities             Json             @map("side_activities")
  otherSideActivity          String?          @map("other_side_activity") @db.VarChar(255)
  cleanlinessLevel           CleanlinessLevel @map("cleanliness_level")
  hasNoise                   Boolean          @default(false) @map("has_noise")
  noiseSource                String?          @map("noise_source") @db.VarChar(255)
  sleepDisturbancePotential  String?          @map("sleep_disturbance_potential") @db.Text

  // Bagian 2 — Kuesioner fatigue keluarga
  respondentName            String             @map("respondent_name") @db.VarChar(120)
  respondentAge             Int                @map("respondent_age")
  respondentEducation       Education          @map("respondent_education")
  respondentEmployeeRef     String?            @map("respondent_employee_ref") @db.VarChar(120)
  respondentCompanyPosition String?            @map("respondent_company_position") @db.VarChar(80)
  relationToEmployee        RelationToEmployee @map("relation_to_employee")
  fatigueKnowledge          String             @map("fatigue_knowledge") @db.Text
  familyPreventionRole      String             @map("family_prevention_role") @db.Text
  fatigueRiskPerspective    String             @map("fatigue_risk_perspective") @db.Text
  fatigueCauses             String             @map("fatigue_causes") @db.Text

  // Bagian 3 — Lokasi
  locationId               Int    @map("location_id")
  locationVillageSnapshot  String @map("location_village_snapshot") @db.VarChar(80)
  locationDistrictSnapshot String @map("location_district_snapshot") @db.VarChar(80)

  status      ObservationStatus @default(PENDING)
  doctorId    Int?              @map("doctor_id")
  doctorNotes String?           @map("doctor_notes") @db.Text
  approvedAt  DateTime?         @map("approved_at") @db.Timestamptz(3)

  submittedAt DateTime @map("submitted_at") @db.Timestamptz(3)
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt   DateTime @updatedAt @map("updated_at") @db.Timestamptz(3)

  paramedic User                @relation("NonMessParamedic", fields: [paramedicId], references: [id], onDelete: Restrict)
  doctor    User?               @relation("NonMessDoctor", fields: [doctorId], references: [id], onDelete: SetNull)
  location  ObservationLocation @relation(fields: [locationId], references: [id], onDelete: Restrict)
  photos    ObservationPhoto[]

  @@index([status, createdAt])
  @@index([paramedicId, createdAt(sort: Desc)])
  @@index([locationId, createdAt])
  @@index([employeeNrp])
  @@map("non_mess_observations")
}

// ───────────────────────── FOTO ─────────────────────────

model ObservationPhoto {
  id                   Int             @id @default(autoincrement())
  observationType      ObservationType @map("observation_type")
  messObservationId    Int?            @map("mess_observation_id")
  nonMessObservationId Int?            @map("non_mess_observation_id")
  category             PhotoCategory
  filePath             String          @map("file_path") @db.VarChar(255)
  thumbnailPath        String?         @map("thumbnail_path") @db.VarChar(255)
  originalFilename     String?         @map("original_filename") @db.VarChar(255)
  mimeType             String          @map("mime_type") @db.VarChar(60)
  sizeBytes            Int             @map("size_bytes")
  sortOrder            Int             @default(0) @map("sort_order")
  createdAt            DateTime        @default(now()) @map("created_at") @db.Timestamptz(3)

  messObservation    MessObservation?    @relation(fields: [messObservationId], references: [id], onDelete: Cascade)
  nonMessObservation NonMessObservation? @relation(fields: [nonMessObservationId], references: [id], onDelete: Cascade)

  @@index([messObservationId])
  @@index([nonMessObservationId])
  @@map("observation_photos")
}

// ─────────────────────── JADWAL ───────────────────────

model Schedule {
  id              Int             @id @default(autoincrement())
  paramedicId     Int             @map("paramedic_id")
  scheduleDate    DateTime        @map("schedule_date") @db.Date
  shift           ScheduleShift
  observationType ObservationType @map("observation_type")
  targetCount     Int             @default(1) @map("target_count")
  notes           String?         @db.Text
  createdById     Int             @map("created_by_id")
  createdAt       DateTime        @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt       DateTime        @updatedAt @map("updated_at") @db.Timestamptz(3)
  deletedAt       DateTime?       @map("deleted_at") @db.Timestamptz(3)

  paramedic User @relation("ScheduleParamedic", fields: [paramedicId], references: [id], onDelete: Restrict)
  createdBy User @relation("ScheduleCreator", fields: [createdById], references: [id], onDelete: Restrict)

  @@index([paramedicId, scheduleDate])
  @@index([scheduleDate, observationType])
  @@map("schedules")
}

// ───────────────────── AUDIT LOG ─────────────────────

model AuditLog {
  id               BigInt      @id @default(autoincrement())
  actorId          Int?        @map("actor_id")
  actorNameSnapshot String?    @map("actor_name_snapshot") @db.VarChar(120)
  action           AuditAction
  entityType       String?     @map("entity_type") @db.VarChar(40)
  entityId         Int?        @map("entity_id")
  before           Json?
  after            Json?
  ipAddress        String?     @map("ip_address") @db.VarChar(45)
  userAgent        String?     @map("user_agent") @db.VarChar(255)
  createdAt        DateTime    @default(now()) @map("created_at") @db.Timestamptz(3)

  @@index([entityType, entityId, createdAt(sort: Desc)])
  @@index([actorId, createdAt(sort: Desc)])
  @@index([action, createdAt(sort: Desc)])
  @@map("audit_logs")
}
```

---

## 3. Constraint Tambahan (Raw SQL Migration)

Prisma tidak mendukung sebagian constraint ini secara deklaratif. Tambahkan lewat migration manual.

```sql
-- Email unik hanya untuk pengguna yang belum dihapus
CREATE UNIQUE INDEX users_email_unique_active
  ON users (LOWER(email))
  WHERE deleted_at IS NULL;

-- Nomor kamar unik per komplek yang belum dihapus
CREATE UNIQUE INDEX mess_rooms_complex_number_unique
  ON mess_rooms (complex_id, room_number)
  WHERE deleted_at IS NULL;

-- Nama komplek unik
CREATE UNIQUE INDEX mess_complexes_name_unique
  ON mess_complexes (LOWER(name))
  WHERE deleted_at IS NULL;

-- Lokasi unik per desa+kecamatan
CREATE UNIQUE INDEX observation_locations_unique
  ON observation_locations (LOWER(village), LOWER(district))
  WHERE deleted_at IS NULL;

-- Foto harus terhubung ke tepat satu observasi
ALTER TABLE observation_photos
  ADD CONSTRAINT photo_exactly_one_parent CHECK (
    (mess_observation_id IS NOT NULL AND non_mess_observation_id IS NULL)
    OR
    (mess_observation_id IS NULL AND non_mess_observation_id IS NOT NULL)
  );

-- Kategori foto harus cocok dengan tipe observasi
ALTER TABLE observation_photos
  ADD CONSTRAINT photo_category_matches_type CHECK (
    (observation_type = 'MESS' AND category IN ('FINDING', 'MESS_CONDITION'))
    OR
    (observation_type = 'NON_MESS' AND category = 'HOME_VISIT')
  );

-- Observasi mess dengan temuan wajib punya data karyawan
ALTER TABLE mess_observations
  ADD CONSTRAINT mess_finding_requires_employee CHECK (
    has_finding = false
    OR (
      employee_name IS NOT NULL
      AND employee_nik IS NOT NULL
      AND employee_company IS NOT NULL
      AND activity_desc IS NOT NULL
    )
  );

-- Status final wajib punya dokter dan waktu approval
ALTER TABLE mess_observations
  ADD CONSTRAINT mess_final_status_requires_doctor CHECK (
    status = 'PENDING'
    OR (doctor_id IS NOT NULL AND approved_at IS NOT NULL)
  );

ALTER TABLE non_mess_observations
  ADD CONSTRAINT nonmess_final_status_requires_doctor CHECK (
    status = 'PENDING'
    OR (doctor_id IS NOT NULL AND approved_at IS NOT NULL)
  );

-- Penolakan wajib disertai catatan
ALTER TABLE mess_observations
  ADD CONSTRAINT mess_rejection_requires_notes CHECK (
    status <> 'REJECTED' OR (doctor_notes IS NOT NULL AND LENGTH(TRIM(doctor_notes)) >= 10)
  );

ALTER TABLE non_mess_observations
  ADD CONSTRAINT nonmess_rejection_requires_notes CHECK (
    status <> 'REJECTED' OR (doctor_notes IS NOT NULL AND LENGTH(TRIM(doctor_notes)) >= 10)
  );

-- Angka non-negatif
ALTER TABLE non_mess_observations
  ADD CONSTRAINT nonmess_counts_non_negative CHECK (
    occupants_count >= 0 AND children_count >= 0
    AND respondent_age BETWEEN 1 AND 120
  );

-- Satu jadwal per paramedis per tanggal per shift
CREATE UNIQUE INDEX schedules_unique_slot
  ON schedules (paramedic_id, schedule_date, shift)
  WHERE deleted_at IS NULL;

-- Audit log append-only
CREATE RULE audit_logs_no_update AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
CREATE RULE audit_logs_no_delete AS ON DELETE TO audit_logs DO INSTEAD NOTHING;
```

---

## 4. View Gabungan Observasi

```sql
CREATE OR REPLACE VIEW v_observations_summary AS
SELECT
  m.id,
  'MESS'::text                          AS type,
  m.client_uuid,
  m.paramedic_id,
  m.observation_date,
  m.mess_complex_name_snapshot || ' / ' || m.mess_room_number_snapshot AS subject_label,
  m.has_finding                         AS has_finding,
  m.status,
  m.doctor_id,
  m.approved_at,
  m.submitted_at,
  m.created_at
FROM mess_observations m

UNION ALL

SELECT
  n.id,
  'NON_MESS'::text                      AS type,
  n.client_uuid,
  n.paramedic_id,
  n.created_at::date                    AS observation_date,
  n.employee_name                       AS subject_label,
  NULL::boolean                         AS has_finding,
  n.status,
  n.doctor_id,
  n.approved_at,
  n.submitted_at,
  n.created_at
FROM non_mess_observations n;
```

Query daftar selalu menyertakan `WHERE` pada kolom terindeks di tabel dasar. Jika performa view menurun di atas ~100 ribu baris, ganti dengan materialized view yang di-refresh tiap 5 menit, atau query dua tabel terpisah lalu merge di service layer.

---

## 5. Penyimpanan Foto

| Aspek | Ketentuan |
|---|---|
| Lokasi | Volume server `/app/uploads`, di-mount dari host Dokploy |
| Struktur folder | `/uploads/{YYYY}/{MM}/{observation_type}/{observation_id}/{uuid}.webp` |
| Format simpan | WebP quality 82 (dikonversi server-side dengan Sharp) |
| Thumbnail | 320px sisi terpanjang, `{uuid}_thumb.webp` |
| Ukuran maks diterima | 5 MB per file (setelah kompresi client target ≤ 500 KB) |
| MIME diterima | `image/jpeg`, `image/png`, `image/webp`, `image/heic` |
| Maks foto per observasi | Mess: 3 · Non-Mess: 8 |
| Akses | Lewat endpoint `GET /api/v1/photos/:id` dengan guard JWT — **bukan** static file public |
| Penghapusan | File fisik dihapus asinkron saat record observasi dihapus (Fase 3) |

Alasan foto tidak disajikan sebagai static file: data ini memuat wajah karyawan dan kondisi tempat tinggal. URL yang bisa ditebak akan membocorkannya tanpa autentikasi.

---

## 6. Seed Data

Dijalankan lewat `prisma/seed.ts`. Idempoten — aman dijalankan berulang.

### 6.1 Superadmin awal

```
name:     Superadmin
email:    dari env SEED_ADMIN_EMAIL
password: dari env SEED_ADMIN_PASSWORD (bcrypt rounds 12)
role:     SUPERADMIN
status:   ACTIVE
forcePasswordChange: true
```

Seed gagal dengan pesan jelas jika env belum diisi. Jangan pernah menaruh password default di kode.

### 6.2 Komplek Mess

| name | sort_order |
|---|---|
| Mess A | 1 |
| Mess B | 2 |
| Mess C | 3 |
| Mess D | 4 |
| Mess E | 5 |
| Mess F | 6 |
| Mess GL | 7 |
| Mess Mandala | 8 |

### 6.3 Kamar Mess

Nomor `1` sampai `12` untuk setiap komplek di atas (96 baris).

### 6.4 Lokasi Observasi Non-Mess

| village | district |
|---|---|
| Kusan Hilir | Tanah Bumbu |
| Satui | Tanah Bumbu |
| Angsana | Tanah Bumbu |
| Sungai Loban | Tanah Bumbu |
| Kusan Hulu | Tanah Bumbu |

Daftar ini contoh awal — Superadmin menambah sendiri lewat SC-15.

### 6.5 Data Contoh (khusus environment `development`)

- 3 paramedis, 1 dokter (`status: ACTIVE`, `forcePasswordChange: false`)
- 20 observasi mess (12 tanpa temuan, 8 dengan temuan) tersebar 30 hari terakhir
- 8 observasi non-mess
- Campuran status: 60% APPROVED, 25% PENDING, 15% REJECTED
- 40 jadwal untuk 4 minggu ke depan

Seed data contoh **tidak boleh** berjalan saat `NODE_ENV=production`.

---

## 7. Migrasi & Backup

| Aktivitas | Ketentuan |
|---|---|
| Membuat migrasi | `pnpm prisma migrate dev --name deskripsi_singkat` |
| Deploy migrasi | `pnpm prisma migrate deploy` di container backend saat startup |
| Rollback | Tulis migrasi kompensasi baru. Jangan edit migrasi yang sudah di-deploy. |
| Backup | `pg_dump` harian jam 02:00 WITA, retensi 30 hari, disimpan di volume terpisah |
| Restore | Prosedur terdokumentasi di runbook deployment; wajib diuji setidaknya sekali sebelum rilis |
| Kolom baru | Selalu nullable atau punya default. Tidak ada `NOT NULL` tanpa default pada tabel berisi data. |

---

## 8. Retensi Data

| Data | Retensi | Catatan |
|---|---|---|
| Observasi | Permanen | Dokumen medis-administratif |
| Foto observasi | Permanen | Evaluasi ulang jika disk > 70% |
| Audit log | 24 bulan | Arsipkan ke file lalu hapus baris lama |
| Refresh token kedaluwarsa | 30 hari setelah expired | Cron harian membersihkan |
| Draft/antrean offline di client | 14 hari sejak dibuat | Dihapus otomatis dengan konfirmasi pengguna |
