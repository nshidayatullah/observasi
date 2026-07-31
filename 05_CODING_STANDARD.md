# 05 — Coding Standard

> Berlaku untuk seluruh repo. Claude Code wajib membaca file ini sebelum menulis kode apa pun.

---

## 1. Struktur Repository

Monorepo dengan pnpm workspaces.

```
observasi-istirahat/
├── docs/                        # 00–11, dokumen ini
├── apps/
│   ├── web/                     # React + Vite (frontend)
│   └── api/                     # NestJS (backend)
├── packages/
│   └── shared/                  # Zod schema, tipe, enum, konstanta bersama
├── .github/workflows/
├── docker-compose.yml
├── pnpm-workspace.yaml
└── README.md
```

`packages/shared` adalah satu-satunya tempat enum dan skema validasi didefinisikan. Frontend dan backend meng-import dari sana. Tidak boleh ada enum yang diketik ulang di dua tempat.

### 1.1 Frontend — `apps/web/src`

```
src/
├── main.tsx
├── App.tsx
├── routes/                      # definisi route + guard
│   ├── index.tsx
│   └── protected-route.tsx
├── pages/                       # satu folder per layar (SC-xx)
│   ├── login/
│   │   ├── login-page.tsx
│   │   └── use-login.ts
│   └── observasi-mess/
│       ├── observasi-mess-page.tsx
│       ├── components/          # komponen khusus halaman ini
│       └── use-observasi-mess-form.ts
├── components/
│   ├── ui/                      # shadcn/ui — jangan diedit manual
│   ├── layout/                  # AppShell, BottomNav, Sidebar, Header
│   └── common/                  # komponen lintas halaman (lihat 09_COMPONENT.md)
├── features/                    # logika domain non-UI
│   ├── auth/
│   ├── observations/
│   ├── offline-sync/
│   └── users/
├── lib/
│   ├── api-client.ts            # wrapper fetch + interceptor token
│   ├── query-client.ts
│   ├── db.ts                    # Dexie / IndexedDB
│   ├── image.ts                 # kompresi foto
│   ├── format.ts                # format tanggal, angka, enum → label
│   └── utils.ts                 # cn() dan helper kecil
├── hooks/                       # hook lintas fitur
├── types/
└── mocks/                       # MSW handler + fixture (fase 3)
```

### 1.2 Backend — `apps/api/src`

```
src/
├── main.ts
├── app.module.ts
├── common/
│   ├── decorators/              # @CurrentUser, @Roles, @Public
│   ├── guards/                  # JwtAuthGuard, RolesGuard
│   ├── interceptors/            # ResponseInterceptor, AuditInterceptor
│   ├── filters/                 # HttpExceptionFilter
│   ├── pipes/
│   └── dto/                     # PaginationQueryDto, dsb.
├── config/                      # konfigurasi terketik + validasi env
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
└── modules/
    ├── auth/
    │   ├── auth.module.ts
    │   ├── auth.controller.ts
    │   ├── auth.service.ts
    │   ├── dto/
    │   └── strategies/
    ├── users/
    ├── observations/
    │   ├── mess/
    │   ├── non-mess/
    │   └── shared/              # ObservationQueryService, approval
    ├── photos/
    ├── master-data/
    ├── schedules/
    ├── kpi/
    ├── reports/
    └── audit/
```

Satu modul = satu domain. Controller tipis (parsing + delegasi), service memuat logika bisnis, repository access hanya lewat `PrismaService`.

---

## 2. TypeScript

- `strict: true`. Tidak ada `any` — pakai `unknown` lalu persempit.
- `noUncheckedIndexedAccess: true`.
- Hindari type assertion (`as`). Jika terpaksa, sertakan komentar alasannya.
- Tipe turunan dari Zod: `type LoginInput = z.infer<typeof loginSchema>`. Jangan tulis interface terpisah yang bisa menyimpang.
- Enum: gunakan const object + union type, bukan `enum` TypeScript.

```ts
export const OBSERVATION_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type ObservationStatus = typeof OBSERVATION_STATUS[keyof typeof OBSERVATION_STATUS];
```

- Fungsi publik wajib punya return type eksplisit.
- Tidak ada default export kecuali komponen halaman React yang di-lazy load.

---

## 3. Penamaan

| Hal | Konvensi | Contoh |
|---|---|---|
| File komponen React | `kebab-case.tsx` | `observation-card.tsx` |
| Komponen React | `PascalCase` | `ObservationCard` |
| Hook | `use-kebab-case.ts` → `useCamelCase` | `use-mess-form.ts` → `useMessForm` |
| Fungsi & variabel | `camelCase` | `submitObservation` |
| Konstanta modul | `UPPER_SNAKE_CASE` | `MAX_PHOTO_SIZE_BYTES` |
| Tipe & interface | `PascalCase`, tanpa prefiks `I` | `MessObservation` |
| File NestJS | `nama.tipe.ts` | `users.service.ts`, `create-user.dto.ts` |
| Tabel & kolom DB | `snake_case` | `mess_observations` |
| Route API | `kebab-case` | `/observations/non-mess` |
| Kelas CSS kustom | Hindari — pakai utility Tailwind | — |

**Bahasa penamaan:** kode dalam Bahasa Inggris, teks yang dilihat pengguna dalam Bahasa Indonesia. Jangan mencampur (`const dataKaryawan` salah; `const employeeData` benar).

---

## 4. Aturan Frontend

### 4.1 Komponen

- Fungsi komponen saja. Tidak ada class component.
- Satu file = satu komponen yang diekspor. Sub-komponen kecil boleh serumah jika hanya dipakai di file itu.
- Komponen di atas ~150 baris harus dipecah.
- Props di-destructure di parameter, dengan tipe eksplisit:

```tsx
type ObservationCardProps = {
  observation: ObservationSummary;
  onOpen: (id: number, type: ObservationType) => void;
};

export function ObservationCard({ observation, onOpen }: ObservationCardProps) { ... }
```

- Jangan taruh logika fetching di komponen presentasi. Pisahkan ke hook di `features/`.

### 4.2 Data Fetching

- Semua request lewat TanStack Query. Tidak ada `useEffect` + `fetch` manual.
- Query key terstruktur array: `['observations', 'list', filters]`, `['observations', 'detail', type, id]`.
- Kumpulkan query key di satu tempat per fitur:

```ts
export const observationKeys = {
  all: ['observations'] as const,
  list: (filters: ObservationFilters) => [...observationKeys.all, 'list', filters] as const,
  detail: (type: ObservationType, id: number) => [...observationKeys.all, 'detail', type, id] as const,
};
```

- Mutation wajib meng-invalidate key yang terpengaruh.
- `staleTime` default 30 detik; data master (komplek mess, lokasi) 1 jam.

### 4.3 Form

- React Hook Form + `zodResolver`. Tidak ada state form manual.
- Skema Zod berasal dari `packages/shared` — sama persis dengan yang dipakai backend.
- Setiap input wajib punya `<Label htmlFor>` yang terhubung. Placeholder bukan pengganti label.
- Pesan error muncul di bawah field, bukan hanya toast.
- Tombol submit dinonaktifkan saat `isSubmitting` dan menampilkan teks proses ("Menyimpan…").

### 4.4 Styling

- Tailwind utility langsung di JSX. Tidak ada file CSS per komponen.
- Mobile-first: tulis kelas untuk mobile dulu, baru `sm:`, `md:`, `lg:`.
- Gunakan `cn()` untuk menggabungkan kelas kondisional.
- Nilai warna, spacing, radius hanya dari token yang didefinisikan di 08_UI_GUIDE.md. Tidak ada hex hardcoded di komponen.
- Touch target minimum `min-h-11 min-w-11` (44px).

### 4.5 Offline

- Semua operasi tulis observasi melewati layer `features/offline-sync`, bukan langsung ke `api-client`.
- Layer ini menentukan: kirim langsung atau masukkan antrean.
- Komponen tidak boleh membaca `navigator.onLine` sendiri — gunakan hook `useOnlineStatus()`.

---

## 5. Aturan Backend

### 5.1 Controller

- Tanpa logika bisnis. Maksimal: ambil param, panggil service, kembalikan hasil.
- Selalu pakai DTO dengan `class-validator`. Tidak ada `@Body() body: any`.
- Role guard deklaratif:

```ts
@Roles(Role.SUPERADMIN)
@Delete(':id')
remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: AuthUser) {
  return this.usersService.remove(id, actor);
}
```

### 5.2 Service

- Melempar `HttpException` turunan domain (`ResourceInUseException`, `InvalidStateTransitionException`) yang ditangkap `HttpExceptionFilter` global dan diubah ke format error standar.
- Operasi yang menyentuh lebih dari satu tabel dibungkus `prisma.$transaction`.
- Tidak ada raw SQL kecuali untuk view gabungan dan agregasi KPI. Raw SQL wajib pakai parameter binding (`Prisma.sql`), tidak pernah interpolasi string.

### 5.3 Scoping Data

Setiap query daftar dan detail wajib menerapkan scope role di **service**, bukan mengandalkan frontend:

```ts
const where: Prisma.MessObservationWhereInput = {
  ...filters,
  ...(actor.role === Role.PARAMEDIC ? { paramedicId: actor.id } : {}),
};
```

Record di luar scope dikembalikan sebagai 404, bukan 403.

### 5.4 Audit

Aksi yang tercantum di enum `AuditAction` wajib menulis log dalam transaksi yang sama dengan perubahan datanya. Kegagalan menulis audit membatalkan operasi.

### 5.5 Konfigurasi

- Semua env divalidasi saat startup dengan Zod. Aplikasi gagal boot jika env wajib hilang — jangan pakai fallback diam-diam.
- Tidak ada `process.env` di luar `config/`.

---

## 6. Penanganan Error & Pesan

Pesan error yang dilihat pengguna mengikuti aturan di 08_UI_GUIDE.md: menjelaskan apa yang terjadi dan langkah berikutnya, tanpa meminta maaf, tanpa jargon teknis.

| Buruk | Baik |
|---|---|
| "Terjadi kesalahan" | "Observasi gagal terkirim. Data tersimpan di perangkat dan akan dikirim otomatis saat ada sinyal." |
| "Error 403" | "Anda tidak punya akses ke halaman ini." |
| "Invalid input" | "NIK wajib diisi karena Anda memilih ada temuan." |
| "Maaf, sistem sedang bermasalah" | "Server tidak merespons. Coba lagi dalam beberapa saat." |

Log teknis lengkap masuk ke server log; yang dikirim ke client hanya pesan yang bisa ditindaklanjuti.

---

## 7. Testing

| Jenis | Alat | Cakupan wajib |
|---|---|---|
| Unit backend | Jest | Semua service — terutama logika kondisional form, transisi status, perhitungan KPI |
| Integration backend | Jest + Supertest + PostgreSQL test container | Semua endpoint di 04_API_CONTRACT.md, termasuk guard role |
| Unit frontend | Vitest + Testing Library | Skema Zod, fungsi format, hook offline-sync |
| Komponen | Vitest + Testing Library | Form Mess & Non-Mess, komponen di 09_COMPONENT.md |
| E2E | Playwright | Alur di 01_USER_FLOW.md bagian 3–7 |
| Offline | Playwright dengan `context.setOffline(true)` | Isi form offline → online → tersinkron tanpa duplikat |

Target cakupan: 80% di `apps/api/src/modules/**/*.service.ts` dan `packages/shared`. Angka cakupan bukan tujuan — kasus yang wajib ditulis: setiap aturan di 10_BUSINESS_RULE.md punya minimal satu test.

Query test: `data-testid` hanya sebagai pilihan terakhir. Prioritas: role, label, teks.

---

## 8. Git

### 8.1 Branch

```
main                        # selalu deployable
develop                     # integrasi
feat/T-021-form-mess        # fitur, prefiks dengan ID task
fix/T-045-sync-duplicate    # perbaikan
chore/upgrade-prisma
```

### 8.2 Commit — Conventional Commits

```
feat(observations): tambah form observasi mess bagian 2
fix(sync): cegah duplikat saat retry setelah 409
refactor(kpi): pisahkan agregasi mess dan non-mess
docs(api): perbarui kontrak endpoint approval
test(auth): tambah kasus akun terkunci
chore(deps): naikkan prisma ke 6.3.0
```

Tipe: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `style`.
Subjek Bahasa Indonesia, huruf kecil, tanpa titik, maksimal 72 karakter.
Body menjelaskan **mengapa**, bukan apa (diff sudah menunjukkan apa).
Sertakan `Refs: T-021` di footer.

### 8.3 Pull Request

Judul PR = ID task + ringkasan. Deskripsi wajib memuat:

- Task yang diselesaikan (`T-xxx`)
- Ringkasan perubahan
- Cara menguji manual
- Tangkapan layar untuk perubahan UI (mobile + desktop)
- Checklist: lint lolos, test lolos, dokumen terkait diperbarui

PR tidak boleh melebihi ~400 baris perubahan efektif. Lebih dari itu, pecah.

### 8.4 Yang Tidak Boleh Masuk Repo

`.env`, dump database, file foto uji, `node_modules`, artefak build, kredensial dalam bentuk apa pun. Jika kredensial pernah ter-commit, rotasi kredensialnya — menghapus commit saja tidak cukup.

---

## 9. Lint & Format

| Alat | Konfigurasi |
|---|---|
| ESLint | `@typescript-eslint` strict, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y` |
| Prettier | `printWidth: 100`, `singleQuote: true`, `semi: true`, `trailingComma: "all"` |
| Husky + lint-staged | Pre-commit: ESLint + Prettier pada file yang diubah |
| commitlint | Memaksa format Conventional Commits |
| CI | Jalankan `lint`, `typecheck`, `test`, `build` pada setiap PR |

Aturan ESLint yang dinaikkan ke `error`:
`no-console` (kecuali `console.error`), `no-floating-promises`, `no-explicit-any`, `exhaustive-deps`, `jsx-a11y/label-has-associated-control`.

---

## 10. Komentar & Dokumentasi Kode

- Komentar menjelaskan **mengapa**, bukan apa.
- Setiap fungsi yang mengimplementasikan aturan bisnis menyertakan referensi ID:

```ts
// BR-OBS-04: temuan wajib disertai data karyawan lengkap.
// Divalidasi juga di DB constraint mess_finding_requires_employee sebagai jaring pengaman.
```

- Jangan menulis JSDoc yang hanya mengulang nama parameter.
- `TODO` wajib menyertakan pemilik dan ID task: `// TODO(T-058): ganti dengan job queue saat volume > 500/hari`.

---

## 11. Environment Variables

| Nama | Tempat | Contoh | Wajib |
|---|---|---|---|
| `DATABASE_URL` | api | `postgresql://user:pass@db:5432/observasi` | ✅ |
| `JWT_ACCESS_SECRET` | api | string acak ≥ 32 karakter | ✅ |
| `JWT_REFRESH_SECRET` | api | string acak ≥ 32 karakter, berbeda dari access | ✅ |
| `JWT_ACCESS_TTL` | api | `1h` | ✅ |
| `JWT_REFRESH_TTL` | api | `7d` | ✅ |
| `UPLOAD_DIR` | api | `/app/uploads` | ✅ |
| `MAX_UPLOAD_BYTES` | api | `5242880` | ✅ |
| `CORS_ORIGINS` | api | `https://observasi.example.com` | ✅ |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | api | — | ❌ (Fase 2) |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | api | — | ✅ saat seed |
| `VITE_API_BASE_URL` | web | `https://observasi.example.com/api/v1` | ✅ |
| `VITE_APP_VERSION` | web | dari tag git | ✅ |

`.env.example` wajib diperbarui setiap ada variabel baru.
