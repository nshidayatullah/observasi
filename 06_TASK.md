# 06 — Task Breakdown

> Urutan pengerjaan mengikuti alur: **Requirement → Wireframe → Frontend (UI + Mock) → API Contract → Backend → Integration → Testing → Review → Release**
>
> Aturan untuk Claude Code:
>
> 1. Kerjakan task berurutan berdasarkan ID. Jangan lompat fase.
> 2. Sebelum mulai satu task, baca dokumen yang tercantum di kolom **Acuan**.
> 3. Satu task = satu commit (atau satu PR untuk task besar).
> 4. Tandai `[x]` setelah **Definition of Done** terpenuhi, lalu catat di 07_CHANGELOG.md.
> 5. Jika menemukan kebutuhan yang tidak tercakup dokumen, **berhenti dan tanyakan** — jangan berimprovisasi pada aturan bisnis.

**Legenda status:** `[ ]` belum · `[~]` sedang dikerjakan · `[x]` selesai · `[!]` terblokir

---

## FASE 0 — Setup (prasyarat semua fase)

| ID    | Task                                                                                                                                                    | Acuan        | Status |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------ |
| T-001 | Inisialisasi monorepo pnpm workspaces (`apps/web`, `apps/api`, `packages/shared`)                                                                       | 05 §1        | `[x]`  |
| T-002 | Setup `apps/web`: Vite 6 + React 19 + TypeScript strict + Tailwind v4                                                                                   | 05 §2, §4.4  | `[x]`  |
| T-003 | Setup shadcn/ui, install komponen dasar (button, input, label, select, radio-group, checkbox, textarea, dialog, sheet, table, card, badge, toast, form) | 09 §2        | `[ ]`  |
| T-004 | Setup `apps/api`: NestJS 11 + Prisma 6 + PostgreSQL via docker-compose                                                                                  | 05 §1.2      | `[x]`  |
| T-005 | Setup `packages/shared`: enum, konstanta, skema Zod kosong siap diisi                                                                                   | 05 §1, 03 §2 | `[x]`  |
| T-006 | Konfigurasi ESLint, Prettier, Husky, lint-staged, commitlint                                                                                            | 05 §9        | `[x]`  |
| T-007 | Setup CI GitHub Actions: lint, typecheck, test, build                                                                                                   | 05 §9        | `[x]`  |
| T-008 | Buat `.env.example` untuk web dan api; validasi env dengan Zod di backend                                                                               | 05 §11, §5.5 | `[x]`  |

**DoD Fase 0:** `pnpm dev` menjalankan web di :5173 dan api di :3000; `pnpm lint && pnpm typecheck` lolos; commit dengan format salah ditolak.

---

## FASE 1 — Requirement

| ID    | Task                                                                                        | Acuan        | Status |
| ----- | ------------------------------------------------------------------------------------------- | ------------ | ------ |
| T-010 | Review 00_PRD bersama stakeholder (paramedis, dokter, manajemen); konfirmasi lingkup Fase 1 | 00 §5        | `[ ]`  |
| T-011 | Kunci semua enum & daftar nilai pilihan di `packages/shared/src/constants.ts`               | 03 §2, 04 §5 | `[x]`  |
| T-012 | Tulis label Bahasa Indonesia untuk setiap nilai enum di `packages/shared/src/labels.ts`     | 08 §7        | `[x]`  |
| T-013 | Verifikasi 10_BUSINESS_RULE lengkap — setiap aturan punya ID dan dapat diuji                | 10           | `[ ]`  |
| T-014 | Konfirmasi ketersediaan SMTP. Jika tidak ada, kunci ADR-007 (password ditampilkan sekali)   | 11 ADR-007   | `[ ]`  |

**DoD Fase 1:** Tidak ada pertanyaan terbuka tentang aturan bisnis. Semua enum terdefinisi di satu tempat.

---

## FASE 2 — Wireframe

Wireframe dibuat sebagai low-fidelity di 08_UI_GUIDE.md, lalu diverifikasi ke paramedis sebelum kode UI ditulis.

| ID    | Task                                                             | Acuan    | Status |
| ----- | ---------------------------------------------------------------- | -------- | ------ |
| T-020 | Tetapkan design token: warna, tipografi, spacing, radius, shadow | 08 §2–§4 | `[x]`  |
| T-021 | Wireframe SC-01 Login, SC-02 Ganti Password Wajib                | 08 §8    | `[x]`  |
| T-022 | Wireframe SC-03 Beranda (3 varian role)                          | 08 §8    | `[x]`  |
| T-023 | Wireframe SC-04 Pilih Tipe Observasi                             | 08 §8    | `[x]`  |
| T-024 | Wireframe SC-05 Form Mess — 3 langkah + ringkasan                | 08 §8    | `[x]`  |
| T-025 | Wireframe SC-06 Form Non-Mess — 3 langkah + ringkasan            | 08 §8    | `[x]`  |
| T-026 | Wireframe SC-07 Riwayat, SC-08 Detail Observasi                  | 08 §8    | `[x]`  |
| T-027 | Wireframe SC-09 Antrean Persetujuan + dialog approve/reject      | 08 §8    | `[x]`  |
| T-028 | Wireframe SC-10 KPI, SC-11 Jadwal                                | 08 §8    | `[x]`  |
| T-029 | Wireframe SC-12–14 Manajemen Pengguna, SC-15 Master Mess         | 08 §8    | `[x]`  |
| T-030 | Wireframe SC-16 Laporan, SC-17 Profil, SC-18 Antrean Sinkron     | 08 §8    | `[x]`  |
| T-031 | Uji wireframe form ke 2 paramedis; catat temuan dan revisi       | —        | `[~]`  |

**DoD Fase 2:** Semua layar di 01_USER_FLOW §1 punya wireframe. Paramedis bisa menjelaskan alur pengisian form tanpa dibantu.

---

## FASE 3 — Frontend + Mock Data

Bangun seluruh UI dengan data palsu. Belum ada backend.

### 3.1 Fondasi

| ID    | Task                                                                                 | Acuan          | Status |
| ----- | ------------------------------------------------------------------------------------ | -------------- | ------ |
| T-040 | Konfigurasi Tailwind v4 dengan token dari T-020                                      | 08 §2          | `[x]`  |
| T-041 | Buat `AppShell`: header, bottom nav (mobile), sidebar (desktop), sesuai role         | 09 §3.1        | `[~]`  |
| T-042 | Setup React Router 7: definisi route SC-01–SC-19, lazy loading per halaman           | 01 §1, 05 §1.1 | `[x]`  |
| T-043 | Buat `ProtectedRoute` dengan pengecekan role dan `forcePasswordChange`               | 01 §3          | `[x]`  |
| T-044 | Setup TanStack Query + `queryClient` + struktur query key per fitur                  | 05 §4.2        | `[x]`  |
| T-045 | Setup MSW dengan handler untuk seluruh endpoint di 04_API_CONTRACT                   | 04             | `[~]`  |
| T-046 | Buat fixture data mock: 3 paramedis, 1 dokter, 30 observasi campuran, 8 komplek mess | 03 §6.5        | `[~]`  |
| T-047 | Buat `lib/format.ts`: format tanggal WITA, enum → label, ukuran file                 | 05 §4, 08 §7   | `[x]`  |

### 3.2 Autentikasi

| ID    | Task                                                                              | Acuan         | Status |
| ----- | --------------------------------------------------------------------------------- | ------------- | ------ |
| T-050 | Halaman SC-01 Login + skema Zod + penanganan error terkunci/nonaktif              | 01 §3, 04 §2  | `[x]`  |
| T-051 | Halaman SC-02 Ganti Password Wajib + indikator kekuatan password                  | 10 BR-AUTH-05 | `[~]`  |
| T-052 | Store auth (context + localStorage untuk token), auto-refresh sebelum kedaluwarsa | 04 §2         | `[~]`  |
| T-053 | Halaman SC-17 Profil + ganti password mandiri                                     | 04 §2         | `[~]`  |

### 3.3 Observasi (inti produk)

| ID    | Task                                                                                     | Acuan              | Status |
| ----- | ---------------------------------------------------------------------------------------- | ------------------ | ------ |
| T-060 | Komponen `FormStepper` — indikator langkah, navigasi maju/mundur                         | 09 §3.2            | `[x]`  |
| T-061 | Halaman SC-04 Pilih Tipe Observasi — dua kartu besar, touch-friendly                     | 08 §8              | `[~]`  |
| T-062 | Skema Zod form Mess di `packages/shared` termasuk validasi kondisional `hasFinding`      | 10 BR-OBS-04       | `[x]`  |
| T-063 | SC-05 Mess Bagian 1: tanggal, komplek, nomor mess, petugas, radio Temuan                 | 00 §5.1 (sumber)   | `[x]`  |
| T-064 | SC-05 Mess Bagian 2 (Temuan = Ya): data karyawan, tekanan darah, aktivitas, alasan, foto | 04 §4              | `[x]`  |
| T-065 | SC-05 Mess Bagian 3 (Temuan = Tidak): foto kondisi mess                                  | 04 §4              | `[~]`  |
| T-066 | SC-05 Ringkasan & Kirim, dengan tombol edit per bagian                                   | 01 §4              | `[x]`  |
| T-067 | Skema Zod form Non-Mess termasuk aturan kondisional pet/noise/lainnya                    | 04 §5              | `[x]`  |
| T-068 | SC-06 Non-Mess Bagian 1: identitas karyawan + kondisi rumah + lingkungan (22 field)      | 04 §5              | `[ ]`  |
| T-069 | SC-06 Non-Mess Bagian 2: kuesioner fatigue keluarga (10 field)                           | 04 §5              | `[ ]`  |
| T-070 | SC-06 Non-Mess Bagian 3: petugas, lokasi, multi-foto                                     | 04 §5              | `[ ]`  |
| T-071 | SC-06 Ringkasan & Kirim                                                                  | 01 §4              | `[ ]`  |
| T-072 | Komponen `PhotoUploader`: ambil dari kamera/galeri, kompresi client, pratinjau, hapus    | 09 §3.3, 00 NFR-04 | `[x]`  |
| T-073 | Autosave draft ke IndexedDB tiap 3 detik + kartu "Lanjutkan observasi"                   | 01 §4              | `[ ]`  |
| T-074 | Halaman SC-07 Riwayat Observasi: filter, pencarian, infinite scroll di mobile            | 04 §6              | `[~]`  |
| T-075 | Halaman SC-08 Detail Observasi: tampilan read-only + galeri foto + status                | 04 §4, §5          | `[~]`  |

### 3.4 Dokter & Superadmin

| ID    | Task                                                                              | Acuan        | Status |
| ----- | --------------------------------------------------------------------------------- | ------------ | ------ |
| T-080 | Halaman SC-09 Antrean Persetujuan: urut terlama, badge aging, filter              | 01 §6        | `[~]`  |
| T-081 | Dialog Setujui / Tolak dengan catatan medis (wajib saat menolak)                  | 10 BR-APR-02 | `[x]`  |
| T-082 | Halaman SC-10 Dashboard KPI: kartu ringkasan + tabel per paramedis                | 04 §10       | `[x]`  |
| T-083 | Halaman SC-11 Jadwal: kalender paramedis, tabel CRUD Superadmin                   | 04 §9        | `[ ]`  |
| T-084 | Halaman SC-12 Daftar Pengguna: tabel, pencarian, filter, pagination               | 04 §3        | `[~]`  |
| T-085 | Halaman SC-13/14 Tambah & Edit Pengguna + dialog password sementara sekali tampil | 04 §3        | `[ ]`  |
| T-086 | Aksi reset password, nonaktifkan, hapus + dialog konfirmasi                       | 01 §7        | `[ ]`  |
| T-087 | Halaman SC-15 Master Data Mess: CRUD komplek & kamar, bulk tambah kamar           | 04 §8        | `[ ]`  |
| T-088 | Halaman SC-16 Pembuat Laporan: filter, pratinjau jumlah baris, tombol ekspor      | 01 §9        | `[ ]`  |

### 3.5 Offline & PWA

| ID    | Task                                                                                             | Acuan   | Status |
| ----- | ------------------------------------------------------------------------------------------------ | ------- | ------ |
| T-090 | Setup `vite-plugin-pwa`: manifest, ikon, strategi cache SWR untuk aset & Network-First untuk API | 00 §10  | `[~]`  |
| T-091 | Setup Dexie: tabel `drafts`, `syncQueue`, `photos`                                               | 01 §5   | `[ ]`  |
| T-092 | Layer `offline-sync`: enqueue, retry berjenjang, penanganan 409 sebagai sukses                   | 01 §5   | `[ ]`  |
| T-093 | Hook `useOnlineStatus` + banner status koneksi di header                                         | 05 §4.5 | `[ ]`  |
| T-094 | Badge jumlah antrean di header + halaman SC-18 Antrean Sinkronisasi                              | 01 §5   | `[ ]`  |
| T-095 | Simpan Blob foto hasil kompresi di IndexedDB, unggah saat sinkronisasi                           | 03 §5   | `[ ]`  |

### 3.6 Kondisi Kosong & Error

| ID    | Task                                                                      | Acuan          | Status |
| ----- | ------------------------------------------------------------------------- | -------------- | ------ |
| T-096 | Komponen `EmptyState` untuk semua daftar dengan copy spesifik per konteks | 09 §3.5, 08 §7 | `[x]`  |
| T-097 | `ErrorBoundary` + halaman 403 & 404                                       | 01 §1          | `[~]`  |
| T-098 | Skeleton loading untuk daftar dan detail                                  | 09 §3.6        | `[ ]`  |

**DoD Fase 3:** Seluruh alur di 01_USER_FLOW bisa dijalankan end-to-end dengan MSW aktif. Form bisa diisi offline (matikan network di devtools) dan masuk antrean. Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95.

---

## FASE 4 — API Contract

| ID    | Task                                                                             | Acuan | Status |
| ----- | -------------------------------------------------------------------------------- | ----- | ------ |
| T-100 | Bandingkan handler MSW dengan 04_API_CONTRACT; catat setiap perbedaan            | 04    | `[ ]`  |
| T-101 | Revisi 04_API_CONTRACT berdasarkan kebutuhan nyata yang muncul di Fase 3         | 04    | `[ ]`  |
| T-102 | Tulis skema request/response bersama di `packages/shared` sebagai sumber tunggal | 05 §2 | `[ ]`  |
| T-103 | Kunci kontrak. Perubahan setelah ini wajib entri di 11_DECISION_LOG              | 11    | `[ ]`  |
| T-104 | Buat koleksi Bruno/Insomnia berisi seluruh endpoint untuk uji manual             | 04    | `[ ]`  |

**DoD Fase 4:** 04_API_CONTRACT sesuai 1:1 dengan handler MSW. Tidak ada endpoint di kontrak yang tidak dipakai frontend.

---

## FASE 5 — Backend

### 5.1 Fondasi

| ID    | Task                                                                                | Acuan          | Status |
| ----- | ----------------------------------------------------------------------------------- | -------------- | ------ |
| T-110 | Tulis `schema.prisma` lengkap sesuai 03 §2; jalankan migrasi awal                   | 03 §2          | `[ ]`  |
| T-111 | Tambah constraint SQL manual (unique partial, CHECK, rule audit append-only)        | 03 §3          | `[ ]`  |
| T-112 | Buat view `v_observations_summary`                                                  | 03 §4          | `[ ]`  |
| T-113 | Tulis `prisma/seed.ts` idempoten: superadmin, komplek, kamar, lokasi                | 03 §6          | `[ ]`  |
| T-114 | Tulis seed data contoh khusus development                                           | 03 §6.5        | `[ ]`  |
| T-115 | `PrismaService` + `PrismaModule` + graceful shutdown                                | 05 §1.2        | `[ ]`  |
| T-116 | Interceptor respons standar (`{ data, meta }`) + filter exception (`{ error }`)     | 04 §1.1–1.2    | `[ ]`  |
| T-117 | Guard `JwtAuthGuard` + `RolesGuard` + decorator `@Roles`, `@Public`, `@CurrentUser` | 05 §5.1        | `[ ]`  |
| T-118 | Rate limiting (`@nestjs/throttler`): 5/menit untuk login, 100/menit lainnya         | 04 §1          | `[ ]`  |
| T-119 | Modul audit + interceptor pencatatan otomatis                                       | 03 §2, 05 §5.4 | `[ ]`  |

### 5.2 Modul Domain

| ID    | Task                                                                                   | Acuan               | Status |
| ----- | -------------------------------------------------------------------------------------- | ------------------- | ------ |
| T-120 | Modul Auth: login, refresh dengan rotasi, logout, me, change-password                  | 04 §2               | `[ ]`  |
| T-121 | Logika penguncian akun: 5 gagal → LOCKED 15 menit, auto-unlock                         | 10 BR-AUTH-03       | `[ ]`  |
| T-122 | Modul Users: CRUD, reset password, guard "jangan sampai nol superadmin"                | 04 §3, 10 BR-USR-*  | `[ ]`  |
| T-123 | Modul Photos: upload multipart, konversi WebP + thumbnail (Sharp), penyajian ber-guard | 03 §5, 04 §7        | `[ ]`  |
| T-124 | Modul Observations/Mess: POST dengan idempotency `clientUuid`, GET detail ber-scope    | 04 §4               | `[ ]`  |
| T-125 | Modul Observations/Non-Mess: POST + GET detail                                         | 04 §5               | `[ ]`  |
| T-126 | Service daftar observasi gabungan dari view, dengan scope role                         | 04 §6               | `[ ]`  |
| T-127 | Endpoint approval + validasi transisi status + `pending-count`                         | 04 §6, 10 BR-APR-*  | `[ ]`  |
| T-128 | Modul Master Data: komplek, kamar (termasuk bulk), lokasi observasi                    | 04 §8               | `[ ]`  |
| T-129 | Modul Schedules: CRUD + bulk + perhitungan `completedCount`                            | 04 §9               | `[ ]`  |
| T-130 | Modul KPI: summary, by-paramedic, trend                                                | 04 §10, 10 BR-KPI-* | `[ ]`  |
| T-131 | Modul Reports: preview, generate PDF (Puppeteer), job async, unduhan kedaluwarsa       | 04 §11              | `[ ]`  |
| T-132 | Endpoint audit logs untuk Superadmin                                                   | 04 §12              | `[ ]`  |
| T-133 | Endpoint health check                                                                  | 04 §13              | `[ ]`  |
| T-134 | Cron: bersihkan foto yatim > 24 jam, refresh token kedaluwarsa > 30 hari               | 03 §8               | `[ ]`  |

**DoD Fase 5:** Seluruh endpoint di 04_API_CONTRACT merespons sesuai kontrak dan lolos uji lewat koleksi Bruno. Guard role terverifikasi untuk setiap endpoint.

---

## FASE 6 — Integration

| ID    | Task                                                                                                                           | Acuan        | Status |
| ----- | ------------------------------------------------------------------------------------------------------------------------------ | ------------ | ------ |
| T-140 | Buat `api-client` nyata dengan interceptor: lampirkan token, refresh otomatis pada 401, antre request saat refresh berlangsung | 05 §1.1      | `[ ]`  |
| T-141 | Ganti MSW dengan API asli untuk modul Auth; verifikasi alur force-change-password                                              | 01 §3        | `[ ]`  |
| T-142 | Integrasi modul Users & Master Data                                                                                            | 04 §3, §8    | `[ ]`  |
| T-143 | Integrasi upload foto: kompresi client → POST /photos → `photoIds` di payload observasi                                        | 04 §7        | `[ ]`  |
| T-144 | Integrasi submit observasi Mess & Non-Mess, termasuk penanganan 409 duplikat                                                   | 04 §4–§5     | `[ ]`  |
| T-145 | Integrasi daftar & detail observasi, verifikasi scoping role di UI                                                             | 04 §6        | `[ ]`  |
| T-146 | Integrasi approval + invalidasi cache `pending-count`                                                                          | 04 §6        | `[ ]`  |
| T-147 | Integrasi jadwal, KPI, laporan                                                                                                 | 04 §9–§11    | `[ ]`  |
| T-148 | Uji sinkronisasi offline melawan backend nyata: matikan jaringan, isi 3 form, nyalakan                                         | 01 §5        | `[ ]`  |
| T-149 | Uji idempotency: kirim payload sama dua kali, pastikan hanya satu record                                                       | 10 BR-SYN-01 | `[ ]`  |
| T-150 | Hapus seluruh kode mock dari bundle produksi (MSW hanya di mode dev)                                                           | 05 §1.1      | `[ ]`  |

**DoD Fase 6:** Aplikasi berjalan penuh tanpa MSW. Alur offline terbukti tidak menghasilkan duplikat.

---

## FASE 7 — Testing

| ID    | Task                                                                                    | Acuan        | Status |
| ----- | --------------------------------------------------------------------------------------- | ------------ | ------ |
| T-160 | Unit test skema Zod bersama: kasus valid, kasus wajib kondisional, batas panjang        | 05 §7        | `[ ]`  |
| T-161 | Unit test service Auth: kredensial salah, akun terkunci, akun nonaktif, rotasi refresh  | 10 BR-AUTH-* | `[ ]`  |
| T-162 | Unit test service Users: guard superadmin terakhir, larangan hapus jika punya observasi | 10 BR-USR-*  | `[ ]`  |
| T-163 | Unit test service Observations: idempotency, validasi kondisional, scoping              | 10 BR-OBS-*  | `[ ]`  |
| T-164 | Unit test approval: transisi status valid & tidak valid, catatan wajib saat tolak       | 10 BR-APR-*  | `[ ]`  |
| T-165 | Unit test KPI: perhitungan kepatuhan, penanganan pembagi nol, batas rentang tanggal     | 10 BR-KPI-*  | `[ ]`  |
| T-166 | Integration test seluruh endpoint dengan test container PostgreSQL                      | 05 §7        | `[ ]`  |
| T-167 | Integration test matriks izin: setiap endpoint × setiap role                            | 04 §14       | `[ ]`  |
| T-168 | Component test form Mess: percabangan Temuan Ya/Tidak, validasi, reset Bagian 2         | 01 §4        | `[ ]`  |
| T-169 | Component test form Non-Mess: field kondisional pet/noise/lainnya                       | 04 §5        | `[ ]`  |
| T-170 | E2E Playwright: login → isi observasi mess → kirim → dokter setujui → tampil di KPI     | 01           | `[ ]`  |
| T-171 | E2E Playwright: alur offline dengan `context.setOffline(true)`                          | 01 §5        | `[ ]`  |
| T-172 | E2E Playwright: manajemen pengguna lengkap (tambah, reset, nonaktifkan, hapus ditolak)  | 01 §7        | `[ ]`  |
| T-173 | Uji manual di perangkat Android nyata dengan jaringan lemah (throttle 3G)               | 00 NFR-01    | `[ ]`  |
| T-174 | Uji instalasi PWA di Android dan iOS Safari                                             | 00 NFR-09    | `[ ]`  |
| T-175 | Audit aksesibilitas: navigasi keyboard, kontras, label form, screen reader              | 00 NFR-10    | `[ ]`  |
| T-176 | Uji beban ringan: 50 pengguna bersamaan, verifikasi p95 < 500ms                         | 00 NFR-02    | `[ ]`  |

**DoD Fase 7:** Semua test hijau di CI. Setiap aturan di 10_BUSINESS_RULE punya minimal satu test yang merujuknya.

---

## FASE 8 — Review

| ID    | Task                                                                                         | Acuan         | Status |
| ----- | -------------------------------------------------------------------------------------------- | ------------- | ------ |
| T-180 | Code review menyeluruh terhadap 05_CODING_STANDARD                                           | 05            | `[ ]`  |
| T-181 | Review keamanan: cek scoping tiap endpoint, tidak ada rahasia di repo, header keamanan Nginx | 05 §5.3, §8.4 | `[ ]`  |
| T-182 | Review kinerja bundle: analisis ukuran, pastikan < 200 KB gzipped awal                       | 00 NFR-01     | `[ ]`  |
| T-183 | UAT bersama 3 paramedis di lapangan — observasi nyata, catat hambatan                        | —             | `[ ]`  |
| T-184 | UAT bersama dokter — alur persetujuan pada data nyata                                        | —             | `[ ]`  |
| T-185 | UAT bersama Superadmin — manajemen pengguna, jadwal, laporan                                 | —             | `[ ]`  |
| T-186 | Perbaiki temuan UAT prioritas tinggi; catat sisanya sebagai backlog Fase 2                   | —             | `[ ]`  |
| T-187 | Verifikasi copy Bahasa Indonesia di seluruh layar: konsisten, tanpa istilah teknis           | 08 §7         | `[ ]`  |

**DoD Fase 8:** Tidak ada temuan blocker. Ketiga role menyatakan aplikasi layak dipakai.

---

## FASE 9 — Release

| ID    | Task                                                                                     | Acuan  | Status |
| ----- | ---------------------------------------------------------------------------------------- | ------ | ------ |
| T-190 | Buat `Dockerfile` produksi untuk web dan api (multi-stage)                               | 00 §10 | `[ ]`  |
| T-191 | Konfigurasi Dokploy: tiga service, volume upload, variabel lingkungan                    | 00 §10 | `[ ]`  |
| T-192 | Konfigurasi Nginx: reverse proxy, HTTPS, gzip/brotli, header keamanan, batas ukuran body | 00 §10 | `[ ]`  |
| T-193 | Jalankan `prisma migrate deploy` + seed superadmin di lingkungan produksi                | 03 §7  | `[ ]`  |
| T-194 | Setup backup otomatis PostgreSQL harian + uji restore sekali                             | 03 §7  | `[ ]`  |
| T-195 | Setup monitoring dasar: health check Dokploy, alert saat container mati, monitor disk    | 00 §10 | `[ ]`  |
| T-196 | Tulis runbook: cara deploy, rollback, restore, reset password superadmin                 | —      | `[ ]`  |
| T-197 | Buat panduan singkat pengguna (1 halaman per role, dengan tangkapan layar)               | —      | `[ ]`  |
| T-198 | Pelatihan paramedis & dokter                                                             | —      | `[ ]`  |
| T-199 | Rilis v1.0.0: tag git, update 07_CHANGELOG, umumkan ke pengguna                          | 07     | `[ ]`  |
| T-200 | Pemantauan pasca-rilis 2 minggu: kumpulkan error, keluhan, dan metrik pemakaian          | 00 §3  | `[ ]`  |

**DoD Fase 9:** Aplikasi berjalan di produksi, backup terverifikasi, pengguna terlatih, versi 1.0.0 tercatat di changelog.

---

## Backlog Fase 2 & 3

Tidak dikerjakan sebelum Fase 1 rilis dan stabil.

| ID    | Task                                                            | Fase |
| ----- | --------------------------------------------------------------- | ---- |
| T-210 | Notifikasi in-app saat observasi disetujui/ditolak              | 3    |
| T-211 | Integrasi SMTP untuk email undangan & reset password            | 2    |
| T-212 | Ekspor Excel dengan formatting                                  | 3    |
| T-213 | Dashboard KPI lanjutan: grafik tren, perbandingan antar periode | 3    |
| T-214 | Idle timeout auto-logout 30 menit                               | 3    |
| T-215 | Backup & restore lewat antarmuka Superadmin                     | 3    |
| T-216 | Pembatalan approval oleh Superadmin dengan alasan               | 3    |
| T-217 | Pencarian karyawan berdasarkan NIK/NRP lintas observasi         | 3    |

---

## Ketergantungan Antar Task

```
T-001..T-008 (setup)
      ↓
T-010..T-014 (requirement)
      ↓
T-020..T-031 (wireframe)
      ↓
T-040..T-047 (fondasi FE) ──┬─→ T-050..T-053 (auth FE)
                             ├─→ T-060..T-075 (observasi FE)  ← task terbesar
                             ├─→ T-080..T-088 (dokter & admin FE)
                             └─→ T-090..T-098 (offline & PWA)
      ↓
T-100..T-104 (kunci kontrak API)
      ↓
T-110..T-119 (fondasi BE) ──→ T-120..T-134 (modul BE)
      ↓
T-140..T-150 (integrasi)
      ↓
T-160..T-176 (testing)
      ↓
T-180..T-187 (review)
      ↓
T-190..T-200 (release)
```

Jalur kritis: **T-060 → T-075** (form observasi). Ini inti produk dan paling banyak aturan kondisionalnya. Alokasikan waktu paling besar di sini dan jangan diburu-buru.
