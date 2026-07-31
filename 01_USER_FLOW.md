# 01 — User Flow

> Turunan dari 00_PRD.md. Menjadi masukan untuk 08_UI_GUIDE.md (wireframe) dan 09_COMPONENT.md.

---

## 1. Peta Layar (Screen Map)

Setiap layar punya ID `SC-xx` yang direferensikan di 06_TASK.md dan 08_UI_GUIDE.md.

| ID | Rute | Layar | Akses |
|---|---|---|---|
| SC-01 | `/login` | Login | Publik |
| SC-02 | `/ganti-password-wajib` | Ganti Password Wajib | Semua (force flag) |
| SC-03 | `/` | Beranda (dialihkan per role) | Semua |
| SC-04 | `/observasi/pilih-tipe` | Pintu Masuk Observasi | Paramedis |
| SC-05 | `/observasi/mess/baru` | Form Observasi Mess | Paramedis |
| SC-06 | `/observasi/non-mess/baru` | Form Observasi Non-Mess | Paramedis |
| SC-07 | `/observasi` | Riwayat Observasi | Semua |
| SC-08 | `/observasi/:type/:id` | Detail Observasi | Semua (scoped) |
| SC-09 | `/persetujuan` | Antrean Persetujuan | Dokter |
| SC-10 | `/kpi` | Dashboard KPI | Dokter, Superadmin |
| SC-11 | `/jadwal` | Jadwal Observasi | Semua (mode berbeda) |
| SC-12 | `/pengguna` | Daftar Pengguna | Superadmin |
| SC-13 | `/pengguna/baru` | Tambah Pengguna | Superadmin |
| SC-14 | `/pengguna/:id/edit` | Edit Pengguna | Superadmin |
| SC-15 | `/master/mess` | Master Data Mess | Superadmin |
| SC-16 | `/laporan` | Pembuat Laporan | Dokter, Superadmin |
| SC-17 | `/profil` | Profil & Ganti Password | Semua |
| SC-18 | `/antrean-sinkron` | Antrean Sinkronisasi Offline | Paramedis |
| SC-19 | `/pengaturan` | Pengaturan Sistem | Superadmin |
| SC-00 | `*` | 403 / 404 | Semua |

### Beranda per role (SC-03)

| Role | Diarahkan ke | Isi |
|---|---|---|
| Paramedis | Beranda Paramedis | Tombol besar "Mulai Observasi", jadwal hari ini, badge antrean sinkron, 5 observasi terakhir |
| Dokter | Antrean Persetujuan (SC-09) | Jumlah menunggu, observasi tertua, ringkasan KPI |
| Superadmin | Dashboard KPI (SC-10) | KPI semua paramedis, jumlah pengguna aktif, jumlah observasi bulan berjalan |

---

## 2. Navigasi Global

Bottom navigation (mobile) / sidebar (desktop ≥ `lg`), item ditentukan role:

```
PARAMEDIS   [ Beranda ] [ Observasi ] [ Jadwal ]  [ Profil ]
DOKTER      [ Persetujuan ] [ Observasi ] [ KPI ] [ Laporan ] [ Profil ]
SUPERADMIN  [ KPI ] [ Pengguna ] [ Observasi ] [ Jadwal ] [ Master ] [ Laporan ] [ Profil ]
```

Maksimum 5 item di bottom nav; sisanya masuk menu "Lainnya".

---

## 3. Flow Autentikasi

```mermaid
flowchart TD
    A[Buka aplikasi] --> B{Ada access token valid?}
    B -->|Ya| C{force_password_change?}
    B -->|Tidak| D{Ada refresh token valid?}
    D -->|Ya| REF[Refresh token] --> C
    D -->|Tidak| L[SC-01 Login]

    L --> V{Kredensial benar?}
    V -->|Tidak| FAIL[Tambah failed_login_attempts]
    FAIL --> LOCK{Percobaan >= 5?}
    LOCK -->|Ya| LOCKED[Status LOCKED 15 menit<br/>Tampilkan sisa waktu]
    LOCK -->|Tidak| L
    LOCKED --> L

    V -->|Ya| ST{Status akun?}
    ST -->|INACTIVE| MSG1[Tolak: akun dinonaktifkan<br/>Hubungi Superadmin]
    ST -->|LOCKED & belum lewat| MSG2[Tolak: akun terkunci sementara]
    ST -->|ACTIVE| C

    C -->|Ya| CP[SC-02 Ganti Password Wajib]
    CP --> OK[Simpan, set force=false] --> H
    C -->|Tidak| H[SC-03 Beranda per role]
```

**Aturan tambahan**

- Login gagal selalu menampilkan pesan generik "Email atau password salah" — tidak membedakan email tidak ada vs password salah.
- Saat akun terkunci, pesan menyebutkan sisa menit agar pengguna tidak mengulang percobaan.
- SC-02 tidak bisa dilewati: seluruh rute lain redirect kembali ke SC-02 selama `force_password_change = true`.

---

## 4. Flow Observasi (Paramedis)

```mermaid
flowchart TD
    H[Beranda Paramedis] --> P[SC-04 Pilih Tipe Observasi]
    P -->|Karyawan Mess| M1[SC-05 Mess — Bagian 1<br/>Informasi Dasar]
    P -->|Karyawan Non-Mess| N1[SC-06 Non-Mess — Bagian 1<br/>Identitas & Kondisi Rumah]

    M1 --> MQ{Temuan?}
    MQ -->|Ya| M2[Bagian 2<br/>Deskripsi Temuan + Foto Temuan]
    MQ -->|Tidak| M3[Bagian 3<br/>Foto Kondisi Mess Tertib]
    M2 --> MR[Ringkasan & Kirim]
    M3 --> MR

    N1 --> N2[Bagian 2<br/>Kuesioner Fatigue Keluarga]
    N2 --> N3[Bagian 3<br/>Petugas, Lokasi, Foto]
    N3 --> NR[Ringkasan & Kirim]

    MR --> S{Ada koneksi?}
    NR --> S
    S -->|Ya| POST[POST ke API<br/>status = PENDING]
    S -->|Tidak| Q[Simpan ke IndexedDB<br/>status lokal = QUEUED]
    Q --> W[Tunggu online] --> POST
    POST --> DONE[Konfirmasi terkirim<br/>Masuk antrean dokter]
```

### Aturan navigasi form

- Form ditampilkan sebagai **stepper multi-langkah**, bukan satu halaman panjang. Satu bagian = satu layar.
- Tombol "Lanjut" hanya aktif jika field wajib di bagian tersebut valid.
- Tombol "Kembali" mempertahankan isian (state disimpan di form context + autosave draft ke IndexedDB setiap 3 detik).
- Perubahan Temuan Ya→Tidak setelah Bagian 2 terisi: tampilkan konfirmasi bahwa data Bagian 2 akan dihapus.
- Layar "Ringkasan & Kirim" menampilkan seluruh isian read-only dengan tombol edit per bagian.
- Setelah terkirim, draft di IndexedDB dihapus.

### Autosave & pemulihan draft

Jika paramedis menutup aplikasi di tengah pengisian, saat membuka SC-04 lagi muncul kartu:
"Ada observasi belum selesai — Mess A / 12, dimulai 14:32. [Lanjutkan] [Buang]"

---

## 5. Flow Offline & Sinkronisasi

```mermaid
flowchart TD
    F[Form dikirim] --> ON{navigator.onLine?}
    ON -->|Ya| TRY[POST /observations/...]
    ON -->|Tidak| ENQ

    TRY --> R{Respons}
    R -->|201 Created| CLEAR[Hapus dari antrean<br/>Invalidate cache riwayat]
    R -->|409 Duplicate client_uuid| CLEAR
    R -->|4xx selain 409| ERRP[Tandai FAILED — permanen<br/>Tampilkan alasan, minta perbaikan manual]
    R -->|5xx / network error| ENQ[Masuk antrean IndexedDB<br/>status QUEUED]

    ENQ --> LIS[Listener: window online +<br/>retry berkala 60 detik]
    LIS --> BO{Percobaan ke-n}
    BO -->|n <= 5| TRY
    BO -->|n > 5| STALL[Status NEEDS_ATTENTION<br/>Tampilkan di SC-18]
```

**Aturan sinkronisasi**

- Setiap submission membawa `client_uuid` (UUID v4 dibuat di client). Server menolak duplikat dengan 409 dan mengembalikan record yang sudah ada — bukan error bagi pengguna.
- Foto disimpan di IndexedDB sebagai Blob hasil kompresi, diunggah bersama payload saat sinkronisasi.
- Badge di header menampilkan jumlah item antrean. Ketuk badge → SC-18.
- SC-18 menampilkan daftar antrean dengan status, waktu dibuat, jumlah percobaan, dan tombol "Coba kirim lagi" / "Hapus".
- Urutan pengiriman: FIFO berdasarkan waktu pembuatan.

---

## 6. Flow Persetujuan (Dokter)

```mermaid
flowchart TD
    D[SC-09 Antrean Persetujuan] --> F[Filter: tipe, tanggal, paramedis]
    F --> L[Daftar observasi status PENDING<br/>urut terlama di atas]
    L --> DT[SC-08 Detail Observasi]
    DT --> RV[Tinjau isian + foto + tekanan darah]
    RV --> AC{Keputusan}
    AC -->|Setujui| AP[Isi catatan medis opsional]
    AC -->|Tolak| RJ[Isi catatan medis WAJIB]
    AP --> SUB[PATCH status = APPROVED<br/>set doctor_id, approved_at]
    RJ --> SUB2[PATCH status = REJECTED<br/>set doctor_id, approved_at]
    SUB --> KPI[Masuk perhitungan KPI]
    SUB2 --> NOTE[Muncul di riwayat paramedis<br/>dengan label perlu tindak lanjut]
```

**Aturan**

- Observasi berstatus APPROVED atau REJECTED **tidak bisa diubah lagi** oleh dokter mana pun. Perubahan hanya lewat pembatalan oleh Superadmin (Fase 3).
- Catatan medis wajib diisi saat menolak, minimal 10 karakter.
- Dokter tidak bisa menyetujui observasi yang ia buat sendiri (tidak relevan karena dokter tidak bisa membuat observasi, tapi guard tetap dipasang).

---

## 7. Flow Manajemen Pengguna (Superadmin)

```mermaid
flowchart TD
    SA[SC-12 Daftar Pengguna] --> ADD[SC-13 Tambah Pengguna]
    ADD --> GEN[Sistem buat password sementara<br/>force_password_change = true]
    GEN --> MAIL[Kirim email undangan<br/>atau tampilkan sekali di layar]
    MAIL --> FIRST[Pengguna login pertama kali]
    FIRST --> FORCE[SC-02 Wajib Ganti Password]
    FORCE --> ACTIVE[Akun siap dipakai]

    SA --> EDIT[SC-14 Edit Pengguna<br/>nama, email, role, status]
    SA --> RESET[Reset Password]
    RESET --> GEN2[Password sementara baru<br/>force_password_change = true]
    GEN2 --> FORCE

    SA --> DEACT[Nonaktifkan]
    DEACT --> BLOCK[status = INACTIVE<br/>tidak bisa login<br/>data observasi tetap ada]
    BLOCK --> REACT[Aktifkan kembali] --> ACTIVE

    SA --> DEL[Hapus Pengguna]
    DEL --> CHK{Punya data observasi/jadwal?}
    CHK -->|Tidak| GONE[Hard delete + audit log]
    CHK -->|Ya| BLOCKD[Tolak: sarankan nonaktifkan]
```

**Aturan**

- Superadmin tidak bisa menonaktifkan, menghapus, atau menurunkan role akunnya sendiri.
- Sistem selalu menyisakan minimal satu Superadmin berstatus ACTIVE.
- Mengganti role pengguna yang sedang login memaksa refresh token dicabut — sesi lama tidak boleh membawa hak akses lama.

---

## 8. Flow Jadwal & KPI

```mermaid
flowchart TD
    S[SC-11 Jadwal] --> RO{Role}
    RO -->|Paramedis| MY[Kalender jadwal sendiri<br/>tanggal, shift, tipe observasi]
    RO -->|Dokter| ALL[Lihat semua jadwal, read-only]
    RO -->|Superadmin| CRUD[Tambah / ubah / hapus jadwal<br/>bulk assign per minggu]

    CRUD --> LINK[Jadwal jadi denominator KPI]
    MY --> LINK
    LINK --> K[SC-10 Dashboard KPI]
    K --> CARD[Kartu: total observasi mess,<br/>total non-mess, kepatuhan jadwal %,<br/>rata-rata waktu approval]
    K --> TBL[Tabel per paramedis<br/>terjadwal / terlaksana / % / status]
```

Definisi kepatuhan jadwal ada di 10_BUSINESS_RULE.md (BR-KPI-01).

---

## 9. Flow Laporan

```mermaid
flowchart TD
    R[SC-16 Pembuat Laporan] --> FIL[Pilih filter:<br/>rentang tanggal, tipe observasi,<br/>paramedis, status, komplek mess]
    FIL --> PRE[Pratinjau jumlah baris hasil]
    PRE --> Z{Jumlah = 0?}
    Z -->|Ya| EMPTY[Tampilkan: tidak ada data<br/>pada filter ini. Ubah rentang tanggal.]
    Z -->|Tidak| GEN{Format}
    GEN -->|PDF| PDF[Server render HTML → Puppeteer<br/>proses async, tampilkan progres]
    GEN -->|Excel| XLS[Server stream file .xlsx]
    PDF --> DL[Unduh berkas]
    XLS --> DL
```

- Rentang tanggal maksimum satu laporan: 12 bulan.
- Laporan PDF di atas 200 baris diproses sebagai job async; pengguna menerima link unduhan saat selesai.

---

## 10. State Machine Observasi

```
              ┌──────────┐
   dibuat ───▶│  DRAFT   │  (lokal saja, belum pernah dikirim)
              └────┬─────┘
                   │ kirim
                   ▼
              ┌──────────┐   gagal kirim   ┌──────────┐
              │ QUEUED   │◀───────────────▶│  FAILED  │ (lokal)
              └────┬─────┘                 └──────────┘
                   │ berhasil POST
                   ▼
              ┌──────────┐
              │ PENDING  │  (tersimpan di server, menunggu dokter)
              └────┬─────┘
          ┌────────┴────────┐
          ▼                 ▼
    ┌───────────┐     ┌───────────┐
    │ APPROVED  │     │ REJECTED  │   (final, tidak bisa diubah)
    └───────────┘     └───────────┘
```

`DRAFT`, `QUEUED`, `FAILED` hanya ada di client (IndexedDB). Server hanya mengenal `PENDING`, `APPROVED`, `REJECTED`.

---

## 11. Penanganan Kondisi Khusus

| Kondisi | Perilaku |
|---|---|
| Token kedaluwarsa saat mengisi form | Simpan draft, tampilkan dialog login ulang, kembalikan ke form setelah berhasil |
| Foto gagal dikompres (format tidak didukung) | Tolak file, tampilkan format yang diterima: JPG, PNG, WebP, HEIC |
| Paramedis dinonaktifkan saat sedang login | Request berikutnya menerima 401, sesi dihentikan, draft tetap tersimpan lokal |
| Komplek/nomor mess dihapus Superadmin padahal terpakai di observasi lama | Master data pakai soft delete — observasi lama tetap menampilkan nama historis |
| Dua paramedis mengobservasi mess yang sama di hari sama | Diizinkan. Bukan duplikat — tampilkan info di detail bahwa ada observasi lain di lokasi & tanggal sama |
| Perangkat kehabisan storage IndexedDB | Tampilkan peringatan sebelum menyimpan draft baru, sarankan sinkronisasi dulu |
