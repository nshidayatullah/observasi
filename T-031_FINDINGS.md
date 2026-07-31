# T-031 — Hasil Uji Wireframe & Heuristic Review

> Diuji pada 2026-07-31. App berjalan di `localhost:5174` dengan MSW, viewport 375×800 px.
> Daftar ini siap dibawa ke sesi uji dengan 2 paramedis asli.

## 🚫 Blocker — harus diperbaiki sebelum uji paramedis

### B-01: Auth state hilang saat navigasi/refresh

- **Layar:** Semua
- **Gejala:** Setelah login, navigasi ke halaman lain (misal buka `/observasi` langsung) mengembalikan user ke `/login`.
- **Akar:** `AuthProvider` menyimpan user di React `useState(null)`, hanya token yang dibaca dari `localStorage`. Saat navigasi, ProtectedRoute membaca `user === null` dan redirect ke login meski token valid.
- **Perbaikan:** Simpan user ke localStorage juga, ATAU panggil `GET /auth/me` saat mount untuk rehidrasi user dari token yang tersimpan.
- **Refs:** T-052

### B-02: Form Mess tidak punya stepper 3-langkah

- **Layar:** SC-05 Form Mess
- **Wireframe:** 3 langkah (Informasi Dasar → Deskripsi Temuan → Ringkasan), dengan FormStepper progress indicator.
- **Aktual:** Satu halaman flat, semua field dalam satu form.
- **Risiko:** Wireframe dibuat berdasarkan prinsip "satu keputusan per layar" (§1.1). Form flat panjang akan sulit diisi sambil berdiri, apalagi dengan validasi kondisional yang baru muncul setelah Temuan=Ya dipilih.
- **Refs:** T-060, T-066

### B-03: Tidak ada ringkasan sebelum kirim

- **Layar:** SC-05/06 Ringkasan
- **Wireframe:** Halaman "Periksa Sebelum Kirim" dengan semua data ditampilkan per bagian, masing-masing punya tombol "Ubah".
- **Aktual:** Tombol "Kirim Observasi" langsung di bawah form.
- **Risiko:** Tanpa ringkasan, paramedis tidak bisa memverifikasi data sebelum submit. Di lapangan dengan koneksi buruk, sekali kirim tidak bisa diedit.
- **Refs:** T-066

---

## ⚠️ Major — sangat disarankan diperbaiki

### M-01: Field Petugas tidak ada di form Mess

- **Layar:** SC-05 Form Mess Bagian 1
- **Wireframe:** "Petugas Observasi *" dengan default user login.
- **Aktual:** Tidak ada field petugas. Nama paramedis tidak tercatat di payload observasi Mess (hanya `paramedicId` dari mock fixture).

### M-02: Field Jabatan & Departemen tidak ada

- **Layar:** SC-05 Form Mess Bagian 2 (Temuan=Ya)
- **Wireframe:** Jabatan + Departemen dalam 2 kolom (≥ sm).
- **Aktual:** Tidak ada di form maupun di schema Zod.
- **Dampak:** Dokter yang mereview tidak bisa melihat jabatan/departemen karyawan yang melanggar.

### M-03: Pesan error validasi tidak ramah pengguna

- **Layar:** SC-05 Form Mess
- **Contoh ditemukan:** `"Invalid enum value. Expected 'PT_PPA' | 'PT_AMM' | 'MITRA_KERJA', received ''"` — teks teknis bahasa Inggris, bukan penjelasan yang bisa dimengerti paramedis.
- **Seharusnya:** "Perusahaan wajib dipilih karena ada temuan."
- **Aturan dilanggar:** §7.1 — "Error menjelaskan penyebab dan langkah berikutnya", "tanpa istilah teknis".

### M-04: Foto tidak ada di form Mess

- **Layar:** SC-05 Bagian 2 & 3
- **Wireframe:** Maksimal 3 foto temuan (Temuan=Ya) atau foto kondisi mess (Temuan=Tidak).
- **Aktual:** Tidak ada PhotoUploader komponen.
- **Refs:** T-064, T-065

### M-05: Tidak ada "Jadwal Hari Ini" di Beranda

- **Layar:** SC-03 Beranda Paramedis
- **Wireframe:** Kartu jadwal shift + target/selesai + progress bar.
- **Aktual:** Tidak ada. Hanya CTA "Mulai Observasi" + 3 observasi terakhir.
- **Dampak:** Paramedis tidak tahu target observasi hari itu.

### M-06: Status Rail 8px tidak sesuai spec

- **Layar:** SC-07 Riwayat, SC-03 Beranda
- **Wireframe:** Batang vertikal 8px solid di kiri kartu, border kanan ink-900 — elemen tanda tangan neo-brutalism.
- **Aktual:** ObservationCard menggunakan warna background/text sebagai penanda status, bukan rail struktural.
- **Refs:** §1.3, §5.4

---

## 🔶 Minor — saran perbaikan

### m-01: Greeting pakai nama depan, bukan nama panggilan

- **Beranda:** "Selamat sore, Muhammad" — wireframe "Selamat siang, Suryani". `name.split(" ")[0]` menghasilkan "Muhammad", bukan "Suryani". Di Indonesia, nama depan sering bukan nama panggilan.

### m-02: Tidak ada toggle visibility password

- **Login:** Wireframe menampilkan ikon 👁 untuk toggle password. Tidak ada di implementasi.

### m-03: Tidak ada link "Lihat semua" di Observasi Terakhir

- **Beranda:** Wireframe menunjukkan "Lihat" link di samping heading Observasi Terakhir.

### m-04: Indikator kekuatan password belum ada

- **Ganti Password:** Wireframe SC-02 menampilkan progress bar kekuatan password. Implementasi belum ada.

### m-05: Tombol Kirim tidak sticky bottom

- **Form Mess:** Wireframe §6 rule 3: "Tombol aksi form melekat di bawah (sticky bottom)".

### m-06: EmptyState komponen ada tapi belum dipakai di semua daftar

- **Daftar yang sudah pakai EmptyState:** Beranda (observasi terakhir kosong)
- **Yang belum:** Riwayat (saat filter tidak menghasilkan data), Antrean Persetujuan

### m-07: Dark mode belum ada toggle

- **§3:** "Mode gelap mengikuti preferensi sistem, dengan toggle manual di halaman Profil."
- **Aktual:** Mode gelap ada di CSS (`:root.dark`) tapi tidak ada toggle di Profil.

### m-08: IBM Plex font dari Google Fonts, bukan self-hosted

- **§2.2:** "Dimuat lokal (self-hosted, subset latin) supaya PWA tetap bekerja offline."
- **Aktual:** Menggunakan `@import url("https://fonts.googleapis.com/...")`.
- **Refs:** T-090

---

## ✅ Yang sudah sesuai wireframe

| Layar                | Yang cocok                                                                                                                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **SC-01 Login**      | Struktur form, heading, * wajib diisi, tombol "Masuk" full-width, "Lupa password? Hubungi Superadmin", error handling akun terkunci/nonaktif                                                                       |
| **SC-03 Beranda**    | CTA "Mulai Observasi" (kartu besar, primary), heading Observasi Terakhir, observation cards dengan info lengkap, bottom nav role-aware                                                                             |
| **SC-04 Pilih Tipe** | Dua kartu besar (Mess aktif, Non-Mess disabled "Segera hadir"), back button                                                                                                                                        |
| **SC-05 Form Mess**  | "* wajib diisi" di awal form, Temuan sebagai kartu pilihan Ya/Tidak h-56 dengan subtitle, Nomor Mess muncul setelah Komplek dipilih, conditional field saat Temuan=Ya, clientUuid di-ref, validasi Zod kondisional |
| **Layout**           | Header sticky 56px, bottom nav 64px, border-[3px] ink-900, shadow offset keras, font display/body/mono                                                                                                             |

---

## Protokol uji untuk 2 paramedis

Saat paramedis tersedia, minta mereka melakukan ini tanpa dibantu:

1. **Login** — buka app, masukkan email & password, tekan Masuk
2. **Mulai observasi** — dari Beranda, tekan "Mulai Observasi"
3. **Pilih tipe** — pilih "Karyawan Mess"
4. **Isi form (Temuan=Ya)** — isi semua field termasuk data karyawan
5. **Kirim** — tekan Kirim Observasi
6. **Lihat riwayat** — buka Observasi dari bottom nav, cari yang baru dikirim
7. **Buka detail** — tap salah satu kartu observasi

**Yang dicatat:**

- Di langkah mana mereka berhenti atau bertanya?
- Field mana yang membingungkan?
- Apakah mereka bisa membaca teks di bawah sinar matahari (atau mode gelap)?
- Apakah tombol cukup besar untuk ditekan sambil berdiri?
- Berapa detik dari mulai isi form sampai kirim?

**Target keberhasilan T-031:** Kedua paramedis bisa menyelesaikan alur tanpa dibantu.
