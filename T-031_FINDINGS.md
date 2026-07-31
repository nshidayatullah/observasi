# T-031 — Hasil Uji Wireframe & Heuristic Review

> Diuji pada 2026-07-31. App berjalan di `localhost:5174` dengan MSW, viewport 375×800 px.
> Daftar ini siap dibawa ke sesi uji dengan 2 paramedis asli.

## 🚫 Blocker — harus diperbaiki sebelum uji paramedis

### ~~B-01: Auth state hilang saat navigasi/refresh~~ ✅ Fixed (23fba8a)

- **Layar:** Semua
- **Gejala:** Setelah login, navigasi ke halaman lain (misal buka `/observasi` langsung) mengembalikan user ke `/login`.
- **Akar:** `AuthProvider` menyimpan user di React `useState(null)`, hanya token yang dibaca dari `localStorage`. Saat navigasi, ProtectedRoute membaca `user === null` dan redirect ke login meski token valid.
- **Perbaikan:** Simpan user ke localStorage juga, rehidrasi saat mount via `loadUser()`.
- **Refs:** T-052

### ~~B-02: Form Mess tidak punya stepper 3-langkah~~ ✅ Fixed

- **Layar:** SC-05 Form Mess
- **Wireframe:** 3 langkah (Informasi Dasar → Deskripsi Temuan → Ringkasan), dengan FormStepper progress indicator.
- **Aktual (sebelum):** Satu halaman flat, semua field dalam satu form.
- **Perbaikan:** FormStepper component + refactor form jadi 3 langkah dengan navigasi Lanjut/Kembali.
- **Refs:** T-060, T-066

### ~~B-03: Tidak ada ringkasan sebelum kirim~~ ✅ Fixed

- **Layar:** SC-05/06 Ringkasan
- **Wireframe:** Halaman "Periksa Sebelum Kirim" dengan semua data ditampilkan per bagian, masing-masing punya tombol "Ubah".
- **Aktual (sebelum):** Tombol "Kirim Observasi" langsung di bawah form.
- **Perbaikan:** Step 3 menampilkan ringkasan read-only dengan tombol "Ubah" per bagian, tombol "Kembali", dan "Kirim Observasi".
- **Refs:** T-066

---

## ⚠️ Major — sangat disarankan diperbaiki

### ~~M-01: Field Petugas tidak ada di form Mess~~ ✅ Fixed (8db08d2)

- **Layar:** SC-05 Form Mess Bagian 1
- **Wireframe:** "Petugas Observasi *" dengan default user login.
- **Perbaikan:** Field `officerName` ditambahkan ke schema Zod, form Step 1, dan fixture, auto-fill dari `user.name`.

### ~~M-02: Field Jabatan & Departemen tidak ada~~ ✅ Fixed (8db08d2)

- **Layar:** SC-05 Form Mess Bagian 2 (Temuan=Ya)
- **Wireframe:** Jabatan + Departemen dalam 2 kolom (≥ sm).
- **Perbaikan:** Field `position` dan `department` ditambahkan ke schema Zod (wajib saat Temuan=Ya), form Step 2 (2-kolom grid), fixture, dan MSW handler.

### ~~M-03: Pesan error validasi tidak ramah pengguna~~ ✅ Fixed

- **Layar:** SC-05 Form Mess
- **Contoh ditemukan:** `"Invalid enum value. Expected 'PT_PPA' | 'PT_AMM' | 'MITRA_KERJA', received ''"` — teks teknis bahasa Inggris.
- **Perbaikan:** `z.enum()` diberi `{ message: 'Perusahaan wajib dipilih' }`.

### M-04: Foto tidak ada di form Mess

- **Layar:** SC-05 Bagian 2 & 3
- **Wireframe:** Maksimal 3 foto temuan (Temuan=Ya) atau foto kondisi mess (Temuan=Tidak).
- **Aktual:** Tidak ada PhotoUploader komponen.
- **Refs:** T-064, T-065

### ~~M-05: Tidak ada "Jadwal Hari Ini" di Beranda~~ ✅ Fixed

- **Layar:** SC-03 Beranda Paramedis
- **Wireframe:** Kartu jadwal shift + target/selesai + progress bar.
- **Perbaikan:** Kartu jadwal mock ditambahkan: MLM badge, Shift Malam · Mess, progress bar 3/5 (60%).

### ~~M-06: Status Rail 8px tidak sesuai spec~~ ✅ Fixed

- **Layar:** SC-07 Riwayat, SC-03 Beranda
- **Wireframe:** Batang vertikal 8px solid di kiri kartu, border kanan ink-900 — elemen tanda tangan neo-brutalism.
- **Perbaikan:** Rail dipertegas: `w-2` (8px), `self-stretch` full-height, `rounded-l-sm`, `border-r-2 border-ink-900`. Badge "Ada Temuan" signal-500 + badge status dengan warna solid.

---

## 🔶 Minor — semua selesai kecuali m-08 (defer ke T-090)

### ~~m-01: Greeting pakai nama depan, bukan nama panggilan~~ ✅ Fixed

- Nama lengkap ditampilkan, bukan `split(' ')[0]`.

### ~~m-02: Tidak ada toggle visibility password~~ ✅ Fixed

- Tombol Eye/EyeOff ditambahkan di field password login.

### ~~m-03: Tidak ada link "Lihat semua"~~ ✅ Fixed

- Link "Lihat semua" ditambahkan di samping heading Observasi Terakhir.

### ~~m-04: Indikator kekuatan password belum ada~~ ✅ Fixed

- Progress bar 3-segmen (Lemah / Cukup kuat / Kuat) dengan warna danger/signal/success.

### ~~m-05: Tombol Kirim tidak sticky bottom~~ ✅ Fixed

- Tombol navigasi form Mess kini sticky bottom dengan border-top dan latar solid.

### ~~m-06: EmptyState belum dipakai di semua daftar~~ ✅ Sudah ada

- Riwayat dan Antrean Persetujuan sudah pakai EmptyState.

### ~~m-07: Dark mode belum ada toggle~~ ✅ Fixed

- Toggle switch di halaman Profil, mengikuti preferensi sistem saat pertama kali, disimpan di localStorage.

### m-08: IBM Plex font dari Google Fonts, bukan self-hosted (→ T-090)

- Defer ke T-090 (PWA — perlu self-hosted subset latin untuk offline).

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
