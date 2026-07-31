# 00 — Product Requirements Document

> **Produk:** Dashboard Observasi Istirahat Karyawan
> **Kode proyek:** `observasi-istirahat` > **Versi dokumen:** 1.0
> **Status:** Baseline — dikunci untuk Fase 1 (MVP)
> **Dokumen turunan:** 01_USER_FLOW, 02_ERD, 03_DATABASE_SPEC, 04_API_CONTRACT, 10_BUSINESS_RULE

---

## 1. Ringkasan Masalah

Pencatatan observasi istirahat karyawan saat ini dilakukan manual di kertas dan Excel. Akibatnya:

| Masalah                                            | Dampak                                                    |
| -------------------------------------------------- | --------------------------------------------------------- |
| Form kertas diisi di lapangan lalu disalin ulang   | Salah ketik, data hilang, entri ganda                     |
| Rekap laporan manual per bulan                     | Butuh 2–3 hari kerja untuk satu periode                   |
| Tidak ada jejak persetujuan dokter                 | Temuan medis tidak tervalidasi secara formal              |
| Tidak ada ukuran kedisiplinan paramedis            | Manajemen tidak tahu jadwal kunjungan tercapai atau tidak |
| Sinyal seluler lemah di area mess & rumah karyawan | Aplikasi online-only akan gagal dipakai di lapangan       |

## 2. Tujuan Produk

Menyediakan sistem pencatatan observasi digital **mobile-first, offline-capable** yang:

1. Bisa diisi paramedis langsung di lokasi dari ponsel, tanpa instalasi (PWA).
2. Tetap berfungsi saat sinyal hilang dan menyinkronkan data saat koneksi pulih.
3. Memberi dokter alur persetujuan formal atas setiap temuan.
4. Memberi Superadmin kontrol penuh atas pengguna, master data mess, dan jadwal.
5. Menghasilkan laporan PDF/Excel otomatis berdasarkan rentang tanggal dan tipe observasi.

## 3. Ukuran Keberhasilan

| Metrik                                                      | Baseline                         | Target 3 bulan setelah rilis            |
| ----------------------------------------------------------- | -------------------------------- | --------------------------------------- |
| Waktu pengisian satu form observasi mess                    | ~10 menit (kertas + salin ulang) | < 3 menit                               |
| Waktu menghasilkan laporan bulanan                          | 2–3 hari kerja                   | < 5 menit                               |
| Observasi yang disetujui dokter dalam ≤ 48 jam              | Tidak terukur                    | ≥ 90%                                   |
| Kepatuhan jadwal paramedis (visit aktual / visit terjadwal) | Tidak terukur                    | ≥ 85%                                   |
| Form yang gagal terkirim karena sinyal                      | Tidak terukur                    | 0% (semua tersimpan lokal & tersinkron) |

## 4. Persona Pengguna

### 4.1 Paramedis — "Suryani"

Petugas lapangan. Bergerak dari mess ke mess atau ke rumah karyawan, sering sambil berdiri, satu tangan memegang ponsel, sinyal 1 bar. Butuh form yang cepat, tombol besar, dan jaminan data tidak hilang.

### 4.2 Dokter — "dr. Haamim Sajdah S"

Meninjau hasil observasi dari kantor atau ponsel. Butuh antrean persetujuan yang jelas, bisa melihat foto bukti dan hasil tekanan darah, lalu setujui/tolak dengan catatan medis.

### 4.3 Superadmin — "Hidayatullah"

Mengelola akun, master data mess, jadwal, dan laporan. Butuh tabel yang bisa dicari & difilter, serta ekspor.

## 5. Ruang Lingkup

### 5.1 Dalam Lingkup (Fase 1 — MVP)

- Autentikasi: login, logout, refresh token, wajib ganti password saat pertama login.
- Manajemen pengguna & role (CRUD, aktif/nonaktif, reset password) — Superadmin.
- Form Observasi Mess (3 bagian, bercabang berdasarkan Temuan).
- Form Observasi Non-Mess / Home Visit (3 bagian, termasuk kuesioner fatigue keluarga).
- Upload & kompresi foto dari kamera/galeri ponsel.
- Riwayat observasi + detail (scoped per role).
- Approval dokter (setujui / tolak + catatan medis).
- Dashboard KPI sederhana (jumlah kunjungan, kepatuhan jadwal).
- PWA + pengisian form offline dengan sinkronisasi otomatis.

### 5.2 Fase 2 — Enhancement

- Jadwal observasi (CRUD Superadmin, view paramedis & dokter).
- Master data mess (blok/komplek & nomor kamar).
- Generator laporan PDF via Puppeteer.
- Audit log lengkap.

### 5.3 Fase 3 — Polish

- Notifikasi approval (in-app / email).
- Ekspor Excel.
- Dashboard KPI lanjutan (tren, grafik).
- Backup & restore.
- Idle timeout auto-logout 30 menit.

### 5.4 Di Luar Lingkup (Non-Goals)

Ditulis eksplisit agar tidak dikerjakan tanpa keputusan baru:

- Aplikasi native Android/iOS (cukup PWA).
- Geotagging / validasi lokasi GPS paramedis.
- Chat atau komentar dua arah antara dokter dan paramedis (hanya catatan satu arah).
- Tanda tangan digital berbasis sertifikat.
- Multi-bahasa. Aplikasi hanya Bahasa Indonesia.

## 6. Kebutuhan Fungsional

Kode `FR-xx` dipakai sebagai referensi di 06_TASK.md dan 10_BUSINESS_RULE.md.

| ID    | Kebutuhan                                                                | Role               | Fase |
| ----- | ------------------------------------------------------------------------ | ------------------ | ---- |
| FR-01 | Pengguna login dengan email + password                                   | Semua              | 1    |
| FR-02 | Pengguna wajib ganti password saat pertama login atau setelah reset      | Semua              | 1    |
| FR-03 | Akun terkunci 15 menit setelah 5 kali gagal login                        | Sistem             | 1    |
| FR-04 | Pengguna bisa mengubah password sendiri dari halaman profil              | Semua              | 1    |
| FR-05 | Superadmin CRUD pengguna & menetapkan role                               | Superadmin         | 1    |
| FR-06 | Superadmin menonaktifkan pengguna tanpa menghapus data                   | Superadmin         | 1    |
| FR-07 | Superadmin mereset password pengguna                                     | Superadmin         | 1    |
| FR-08 | Paramedis memilih tipe observasi sebelum mengisi form                    | Paramedis          | 1    |
| FR-09 | Paramedis mengisi form observasi Mess (Bagian 1 → 2 atau 3)              | Paramedis          | 1    |
| FR-10 | Paramedis mengisi form observasi Non-Mess (Bagian 1 → 2 → 3)             | Paramedis          | 1    |
| FR-11 | Paramedis mengunggah foto dari kamera/galeri, dikompres di client        | Paramedis          | 1    |
| FR-12 | Form bisa diisi offline dan tersinkron otomatis saat online              | Paramedis          | 1    |
| FR-13 | Paramedis melihat riwayat & detail observasinya sendiri                  | Paramedis          | 1    |
| FR-14 | Dokter melihat semua observasi dan antrean menunggu persetujuan          | Dokter             | 1    |
| FR-15 | Dokter menyetujui atau menolak observasi disertai catatan medis          | Dokter             | 1    |
| FR-16 | Dashboard KPI menampilkan jumlah kunjungan mess & non-mess per paramedis | Dokter, Superadmin | 1    |
| FR-17 | Superadmin CRUD jadwal observasi paramedis                               | Superadmin         | 2    |
| FR-18 | Paramedis melihat jadwalnya sendiri                                      | Paramedis          | 2    |
| FR-19 | Superadmin CRUD master data komplek mess & nomor kamar                   | Superadmin         | 2    |
| FR-20 | Dokter & Superadmin men-generate laporan PDF berdasarkan filter          | Dokter, Superadmin | 2    |
| FR-21 | Sistem mencatat audit trail untuk aksi penting                           | Sistem             | 2    |
| FR-22 | KPI menghitung persentase kepatuhan jadwal                               | Dokter, Superadmin | 2    |
| FR-23 | Ekspor Excel hasil observasi terfilter                                   | Dokter, Superadmin | 3    |
| FR-24 | Notifikasi in-app saat observasi disetujui/ditolak                       | Paramedis          | 3    |
| FR-25 | Auto-logout setelah 30 menit idle                                        | Semua              | 3    |

## 7. Kebutuhan Non-Fungsional

| ID     | Kategori      | Target                                                                     |
| ------ | ------------- | -------------------------------------------------------------------------- |
| NFR-01 | Performa      | Bundle awal < 200 KB gzipped; LCP < 2.5s di jaringan 3G                    |
| NFR-02 | Performa      | Respons API p95 < 500 ms untuk endpoint list                               |
| NFR-03 | Offline       | Form observasi lengkap bisa diisi & disimpan tanpa koneksi                 |
| NFR-04 | Foto          | Kompresi client-side, target ≤ 500 KB per foto, maks 5 MB sebelum kompresi |
| NFR-05 | Touch target  | Minimum 44×44 px untuk semua elemen interaktif                             |
| NFR-06 | Keamanan      | Password bcrypt salt rounds ≥ 12; access token 1 jam; refresh token 7 hari |
| NFR-07 | Keamanan      | Semua endpoint kecuali auth wajib JWT + guard role                         |
| NFR-08 | Ketersediaan  | Single-server Dokploy; backup DB harian                                    |
| NFR-09 | Browser       | Chrome/Edge Android ≥ 2 versi terakhir, Safari iOS ≥ 16                    |
| NFR-10 | Aksesibilitas | Fokus keyboard terlihat, label form eksplisit, kontras teks ≥ 4.5:1        |

## 8. Asumsi & Ketergantungan

- Setiap paramedis memiliki ponsel Android dengan browser modern dan kamera.
- Perusahaan menyediakan satu server untuk Dokploy (frontend, backend, PostgreSQL).
- Tersedia SMTP untuk pengiriman email undangan & reset password. **Jika belum tersedia saat MVP**, password sementara ditampilkan sekali di layar Superadmin (lihat ADR-007 di 11_DECISION_LOG.md).
- Data karyawan (nama, NIK/NRP) diinput manual oleh paramedis — tidak ada integrasi HRIS.
- Foto disimpan sebagai file di volume server, bukan object storage eksternal (MVP).

## 9. Risiko

| Risiko                                           | Dampak | Mitigasi                                                        |
| ------------------------------------------------ | ------ | --------------------------------------------------------------- |
| Sinkronisasi offline menghasilkan data duplikat  | Sedang | `client_uuid` sebagai idempotency key (ADR-003)                 |
| Foto besar memenuhi disk server                  | Tinggi | Kompresi client + batas ukuran + kuota disk monitoring          |
| Paramedis lupa sinkronisasi lalu ganti perangkat | Sedang | Badge jumlah antrean sinkron di header + banner peringatan      |
| Dokter menumpuk antrean approval                 | Sedang | Urutkan antrean by `created_at` asc + hitung aging di dashboard |
| Nama karyawan diketik tidak konsisten            | Rendah | Normalisasi trim + uppercase NIK; pencarian fuzzy di laporan    |

## 10. Tech Stack (dikunci)

### Frontend

React 19 · Vite 6 · TypeScript 5 · Tailwind CSS v4 · shadcn/ui · React Hook Form 7 · Zod 3 · TanStack Query 5 · React Router 7 · vite-plugin-pwa · browser-image-compression · Dexie (IndexedDB wrapper untuk antrean offline)

### Backend

NestJS 11 · Prisma ORM 6 · PostgreSQL 16+ · JWT + Refresh Token · Puppeteer (laporan PDF) · Multer + Sharp (upload & thumbnail foto)

### Deployment

Dokploy (self-hosted) · Nginx reverse proxy · HTTPS termination

### Arsitektur

```
┌────────────────────────── DOKPLOY SERVER ──────────────────────────┐
│                                                                     │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐       │
│   │   Frontend   │     │   Backend    │     │  PostgreSQL  │       │
│   │  React SPA   │────▶│    NestJS    │────▶│      16      │       │
│   │  Vite + PWA  │     │  REST /api   │     │              │       │
│   │   port 80    │     │  port 3000   │     │  port 5432   │       │
│   └──────┬───────┘     └──────┬───────┘     └──────────────┘       │
│          │                    │                                     │
│          └──── Nginx Reverse Proxy (HTTPS) ────┘                    │
│                                     │                               │
│                            ┌────────▼────────┐                      │
│                            │  Volume /uploads │                     │
│                            └─────────────────┘                      │
└─────────────────────────────────────────────────────────────────────┘

PONSEL PARAMEDIS
   └─▶ PWA shell (cache) ─▶ IndexedDB queue ─▶ sync worker ─▶ REST API
```

## 11. Glosarium

| Istilah                   | Arti                                                                                    |
| ------------------------- | --------------------------------------------------------------------------------------- |
| **Observasi**             | Satu kali kunjungan & pencatatan kondisi istirahat karyawan                             |
| **Mess**                  | Perumahan/asrama milik perusahaan tempat karyawan tinggal                               |
| **Komplek Mess**          | Blok mess (Mess A, B, C, D, E, F, GL, Mandala)                                          |
| **Non-Mess / Home Visit** | Kunjungan ke rumah pribadi karyawan yang tidak tinggal di mess                          |
| **Temuan**                | Kondisi pelanggaran — karyawan ditemukan belum tidur pada jam istirahat                 |
| **Fatigue**               | Kelelahan yang menurunkan kewaspadaan operator dan meningkatkan risiko kecelakaan kerja |
| **NIK**                   | Nomor Induk Karyawan (dipakai di form Mess)                                             |
| **NRP**                   | Nomor Registrasi Pokok (dipakai di form Non-Mess)                                       |
| **Approval**              | Validasi dokter atas hasil observasi                                                    |
| **Sidak**                 | Inspeksi mendadak tanpa pemberitahuan sebelumnya                                        |
| **KPI Paramedis**         | Ukuran kedisiplinan kunjungan: jumlah observasi & kepatuhan jadwal                      |

## 12. Alur Kerja Pengembangan

Urutan ini wajib diikuti. Jangan lompat fase — setiap fase punya artefak keluaran yang menjadi masukan fase berikutnya.

```
1. Requirement          → 00_PRD, 10_BUSINESS_RULE
        ↓
2. Wireframe            → 08_UI_GUIDE (low-fi per layar), 01_USER_FLOW
        ↓
3. Frontend + Mock Data → 09_COMPONENT, halaman React dengan MSW/mock
        ↓
4. API Contract         → 04_API_CONTRACT (dikunci setelah FE mock jalan)
        ↓
5. Backend              → 02_ERD, 03_DATABASE_SPEC, modul NestJS
        ↓
6. Integration          → ganti mock dengan API asli, sinkronisasi offline
        ↓
7. Testing              → unit, integration, E2E, uji offline di perangkat nyata
        ↓
8. Review               → code review, UAT bersama paramedis & dokter
        ↓
9. Release              → deploy Dokploy, update 07_CHANGELOG
```

Alasan frontend didahulukan sebelum API contract: bentuk data yang benar-benar dibutuhkan layar baru terlihat setelah UI dibangun. Kontrak API yang ditulis lebih dulu cenderung menghasilkan endpoint yang tidak dipakai atau field yang kurang.
