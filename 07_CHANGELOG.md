# 07 — Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.1.0/).
Versi mengikuti [Semantic Versioning](https://semver.org/lang/id/).

---

## Cara Menulis Entri

**Kapan menulis:** setiap kali task di 06_TASK.md ditandai selesai dan menghasilkan perubahan yang terlihat oleh pengguna atau memengaruhi integrasi.

**Kategori:**

| Kategori | Untuk |
|---|---|
| `Ditambahkan` | Fitur baru |
| `Diubah` | Perubahan perilaku fitur yang sudah ada |
| `Usang` | Fitur yang akan dihapus di versi mendatang |
| `Dihapus` | Fitur yang dihapus |
| `Diperbaiki` | Perbaikan bug |
| `Keamanan` | Perbaikan celah keamanan |

**Aturan penulisan:**

- Tulis dari sudut pandang pengguna, bukan pengembang.
  Buruk: "Refactor ObservationService menjadi dua class."
  Baik: "Riwayat observasi kini memuat lebih cepat pada daftar di atas 500 data."
- Perubahan internal murni (refactor, upgrade dependency tanpa dampak) tidak perlu masuk changelog — cukup di riwayat commit.
- Satu baris per perubahan. Sertakan ID task di akhir: `(T-064)`.
- Perubahan yang merusak kompatibilitas ditandai `**BREAKING:**` di awal baris.
- Bagian `[Belum Dirilis]` selalu ada di atas. Saat rilis, ubah judulnya menjadi versi + tanggal, lalu buat `[Belum Dirilis]` yang baru.

**Aturan versi:**

| Perubahan | Naikkan |
|---|---|
| Perubahan kontrak API yang merusak client lama | MAJOR |
| Fitur baru yang kompatibel ke belakang | MINOR |
| Perbaikan bug tanpa fitur baru | PATCH |

Selama pra-rilis (sebelum 1.0.0), versi ditulis `0.x.y` dan perubahan merusak boleh terjadi di MINOR.

---

## [Belum Dirilis]

### Ditambahkan
- Dokumen perencanaan lengkap: PRD, user flow, ERD, spesifikasi database, kontrak API, standar koding, breakdown task, panduan UI, katalog komponen, aturan bisnis, dan decision log.

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

| Versi | Isi | Task penutup |
|---|---|---|
| `0.1.0` | Fondasi + seluruh UI dengan data mock berjalan | T-098 |
| `0.2.0` | Backend lengkap, kontrak API terkunci | T-134 |
| `0.3.0` | Integrasi selesai, offline sync terbukti | T-150 |
| `0.9.0` | Kandidat rilis — semua test hijau, UAT selesai | T-187 |
| `1.0.0` | Rilis produksi Fase 1 (MVP) | T-199 |
| `1.1.0` | Fase 2 — jadwal, master mess, laporan PDF, audit log | T-211 |
| `1.2.0` | Fase 3 — notifikasi, ekspor Excel, KPI lanjutan | T-217 |
