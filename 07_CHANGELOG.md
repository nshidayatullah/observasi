# 07 — Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.1.0/).
Versi mengikuti [Semantic Versioning](https://semver.org/lang/id/).

---

## Cara Menulis Entri

**Kapan menulis:** setiap kali task di 06_TASK.md ditandai selesai dan menghasilkan perubahan yang terlihat oleh pengguna atau memengaruhi integrasi.

**Kategori:**

| Kategori      | Untuk                                      |
| ------------- | ------------------------------------------ |
| `Ditambahkan` | Fitur baru                                 |
| `Diubah`      | Perubahan perilaku fitur yang sudah ada    |
| `Usang`       | Fitur yang akan dihapus di versi mendatang |
| `Dihapus`     | Fitur yang dihapus                         |
| `Diperbaiki`  | Perbaikan bug                              |
| `Keamanan`    | Perbaikan celah keamanan                   |

**Aturan penulisan:**

- Tulis dari sudut pandang pengguna, bukan pengembang.
  Buruk: "Refactor ObservationService menjadi dua class."
  Baik: "Riwayat observasi kini memuat lebih cepat pada daftar di atas 500 data."
- Perubahan internal murni (refactor, upgrade dependency tanpa dampak) tidak perlu masuk changelog — cukup di riwayat commit.
- Satu baris per perubahan. Sertakan ID task di akhir: `(T-064)`.
- Perubahan yang merusak kompatibilitas ditandai `**BREAKING:**` di awal baris.
- Bagian `[Belum Dirilis]` selalu ada di atas. Saat rilis, ubah judulnya menjadi versi + tanggal, lalu buat `[Belum Dirilis]` yang baru.

**Aturan versi:**

| Perubahan                                      | Naikkan |
| ---------------------------------------------- | ------- |
| Perubahan kontrak API yang merusak client lama | MAJOR   |
| Fitur baru yang kompatibel ke belakang         | MINOR   |
| Perbaikan bug tanpa fitur baru                 | PATCH   |

Selama pra-rilis (sebelum 1.0.0), versi ditulis `0.x.y` dan perubahan merusak boleh terjadi di MINOR.

---

## [Belum Dirilis]

### Ditambahkan

- Dokumen perencanaan lengkap: PRD, user flow, ERD, spesifikasi database, kontrak API, standar koding, breakdown task, panduan UI, katalog komponen, aturan bisnis, dan decision log.
- Halaman login dengan validasi Zod, error handling akun terkunci/nonaktif, toggle visibility password. (T-050)
- Quick login 4 akun untuk pengembangan — klik sekali langsung masuk. (T-050)
- Halaman ganti password dengan indikator kekuatan password 3-segmen. (T-051)
- Auth context dengan persist localStorage — user tetap login setelah refresh. (T-052)
- Halaman profil dengan toggle dark mode dan informasi akun. (T-053, m-07)
- Beranda 3 varian: paramedis (CTA + jadwal + observasi terakhir), dokter & superadmin (dashboard KPI). (T-022)
- Dashboard KPI: 4 kartu statistik, tren bulanan (bar chart Mess vs Rumah 6 bulan), distribusi status (bar Pending/Disetujui/Ditolak), donut rasio temuan, top 5 komplek, per paramedis, status harian paramedis. (T-028, T-082)
- Halaman pilih tipe observasi: Mess dan Kunjungan Rumah. (T-023, T-061)
- Form observasi Mess 3-langkah: FormStepper + Informasi Dasar → Deskripsi Temuan → Ringkasan & Kirim. (T-024, T-060, T-063, T-064, T-066)
- Form observasi Non-Mess 3-langkah: Identitas & Kondisi → Kuesioner Keluarga → Ringkasan. (T-025, T-067-T-071)
- Validasi kondisional: field temuan wajib saat ada pelanggaran (BR-OBS-04), hewan peliharaan & kebisingan kondisional.
- Komponen PhotoUploader: ambil dari kamera/galeri, kompresi client-side, pratinjau, hapus. (T-072)
- Riwayat observasi dengan filter tab Semua/Mess/Rumah, gabungan Mess + Non-Mess. (T-026, T-074)
- Detail observasi Mess: banner status, data karyawan, aktivitas, alasan, dokumentasi foto, tombol aksi dokter. (T-026, T-075)
- Detail observasi Non-Mess: data karyawan lengkap, kondisi rumah, aktivitas tidur, kuesioner keluarga, dokumentasi foto. (T-075)
- Dialog persetujuan (approve/reject) dengan catatan medis — wajib saat menolak. (T-027, T-081)
- Antrean persetujuan dikelompokkan per paramedis lalu per hari, dengan tombol Setujui Semua. (T-027, T-080)
- Halaman jadwal: paramedis lihat jadwal sendiri, superadmin lihat roster bulanan. (T-028, T-083)
- Roster paramedis bulanan: kalender grid 7-kolom, tap tanggal lihat detail penugasan + form tambah/hapus. (T-083)
- Menu Manajemen untuk Superadmin: Master User, Master Mess (12 komplek + kamar), Master Blok (5 blok), Master Lokasi (10 kecamatan). (T-029, T-084, T-085, T-087)
- Form tambah pengguna + dialog password sementara sekali tampil. (T-085)
- Aksi pengguna: reset password, nonaktifkan/aktifkan, hapus via dropdown menu. (T-086)
- Tab Laporan di /observasi untuk Superadmin: daftar bulanan dengan preview rekap + tombol unduh PDF/Excel. (T-030, T-088)
- Design token neo-brutalism lengkap: 30+ warna, 3 font IBM Plex, 6 shadow offset keras, animasi press. (T-020, T-040)
- Mode gelap penuh: semua token warna punya varian dark, toggle di Profil, flash prevention. (§3, m-07)
- EmptyState, ErrorBoundary, Skeleton loading untuk semua daftar dan detail. (T-096, T-097, T-098)
- Status Rail 8px neo-brutalism di ObservationCard — elemen tanda tangan aplikasi. (§1.3, §5.4)
- Dexie setup: tabel drafts, syncQueue, photos di IndexedDB. (T-091)
- Hook useOnlineStatus untuk deteksi koneksi. (T-093)
- Graphify knowledge graph untuk navigasi codebase.

### Diperbaiki

- Auth state hilang saat navigasi/refresh — user kini disimpan di localStorage. (T-052)
- Error message validasi Zod enum kini Bahasa Indonesia, bukan raw English. (T-031 M-03)
- Bottom nav item aktif kini punya background solid teal + teks putih. (T-041)

---

<!--
Template entri rilis — salin saat merilis:

## [1.1.0] — 2026-09-15

### Ditambahkan
- Notifikasi in-app saat observasi disetujui atau ditolak dokter. (T-210)
- Ekspor laporan ke Excel dengan format kolom siap cetak. (T-212)

### Diubah
- Antrean persetujuan kini menampilkan lama menunggu dalam jam, bukan tanggal saja. (T-081)

### Diperbaiki
- Foto observasi tidak muncul pada perangkat iOS saat format asli HEIC. (T-123)
- Perhitungan kepatuhan jadwal salah ketika paramedis tidak punya jadwal di periode terpilih. (T-165)

### Keamanan
- Refresh token kini dirotasi setiap kali dipakai; token yang sudah dipakai ulang mencabut seluruh sesi pengguna. (T-120)
-->

---

## Riwayat Rilis

Belum ada rilis. Rilis pertama direncanakan sebagai `1.0.0` setelah T-199 selesai.

### Rencana Rilis

| Versi   | Isi                                                  | Task penutup |
| ------- | ---------------------------------------------------- | ------------ |
| `0.1.0` | Fondasi + seluruh UI dengan data mock berjalan       | T-098        |
| `0.2.0` | Backend lengkap, kontrak API terkunci                | T-134        |
| `0.3.0` | Integrasi selesai, offline sync terbukti             | T-150        |
| `0.9.0` | Kandidat rilis — semua test hijau, UAT selesai       | T-187        |
| `1.0.0` | Rilis produksi Fase 1 (MVP)                          | T-199        |
| `1.1.0` | Fase 2 — jadwal, master mess, laporan PDF, audit log | T-211        |
| `1.2.0` | Fase 3 — notifikasi, ekspor Excel, KPI lanjutan      | T-217        |
