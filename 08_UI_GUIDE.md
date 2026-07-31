# 08 — UI Guide & Wireframe

> Arahan visual, design token, aturan penulisan antarmuka, dan wireframe low-fidelity untuk setiap layar.
> Dikerjakan di Fase 2, sebelum satu baris kode UI ditulis.

---

## 1. Arahan Desain

### 1.1 Konteks pemakaian menentukan bentuknya

Aplikasi ini dipakai berdiri di koridor mess pukul 22.00, satu tangan memegang ponsel dan senter, atau di teras rumah karyawan tengah hari dengan matahari langsung menerpa layar. Bukan di meja kantor. Tiga konsekuensi:

1. **Kontras tinggi, bukan halus.** Tidak ada teks abu muda di atas putih. Rasio kontras minimum 4.5:1, target 7:1 untuk teks utama.
2. **Target besar, jarak longgar.** Minimum 44×44 px, jarak antar tombol minimal 8 px agar tidak salah tekan.
3. **Satu keputusan per layar.** Form dipecah menjadi langkah, bukan satu halaman gulir panjang.

### 1.2 Kosakata visual — Neo-Brutalism

Diambil dari dunia kerjanya sendiri: pertambangan dan keselamatan kerja — tapi diterjemahkan literal, bukan halus. Papan peringatan K3, stiker safety, plat nomor alat berat, formulir cap basah. Antarmuka **mengaku sebagai antarmuka**: border tebal hitam solid di semua elemen, bayangan offset keras (bukan blur lembut), warna flat bersaturasi tinggi, radius nyaris nol, tanpa gradasi, tanpa transparansi dekoratif. Bukan estetika aplikasi kesehatan konsumen yang lembut — ini alat kerja lapangan yang tegas dan tidak ambigu.

Prinsip brutalism yang dipegang:

1. **Struktur terlihat, bukan disembunyikan.** Border 2–3 px hitam (`ink-900`) di setiap kartu, input, dan tombol — bukan garis tipis 1 px yang hilang di bawah matahari.
2. **Bayangan sebagai objek, bukan efek.** `shadow` di sini berarti duplikat solid offset 4–6 px ke kanan-bawah, bukan blur transparan. Ia menegaskan lapisan (elemen ini bisa ditekan), bukan mendekorasi.
3. **Interaksi = perpindahan fisik.** Saat ditekan, elemen "turun" mengejar bayangannya (`translate` + bayangan mengecil). Umpan balik harus terasa mekanis, bukan halus.
4. **Warna dipakai penuh atau tidak sama sekali.** Tidak ada tint 5–10% sebagai latar dekoratif. Badge dan status rail berupa warna solid dengan teks kontras tinggi.

### 1.3 Elemen tanda tangan — *Status Rail*

Setiap kartu observasi punya batang vertikal setebal **8 px**, border kanan solid `ink-900`, di sisi kiri kartu yang mengkodekan status sekaligus temuan:

```
┃ amber tebal   → ada temuan, menunggu persetujuan
┃ teal          → tanpa temuan, menunggu persetujuan
┃ hijau         → disetujui
┃ merah         → ditolak, perlu tindak lanjut
┃ abu bergaris diagonal → masih di antrean sinkronisasi (belum sampai server)
```

Dokter yang menggulir antrean 40 item di ponsel bisa membaca keadaannya tanpa membaca satu kata pun. Warna dipakai berani di seluruh antarmuka (bukan hanya di rail) — itu ciri brutalism — tapi hierarki tetap dijaga lewat aturan pemakaian di §2.1.

---

## 2. Design Token

### 2.1 Warna

Warna neo-brutalism: flat, jenuh, tanpa gradasi. Setiap warna solid dipasangkan dengan border `ink-900` dan teks kontras tinggi (hitam di atas terang, putih di atas gelap) — tidak pernah teks abu di atas warna solid.

```css
@theme {
  /* Netral — dasar antarmuka. ink-900 juga dipakai sebagai warna BORDER universal. */
  --color-ink-900: #0B0F14;   /* teks utama, border universal, header gelap */
  --color-ink-700: #263441;   /* teks sekunder kuat */
  --color-ink-500: #55677A;   /* teks muted, label */
  --color-ink-300: #A8B5C2;   /* ikon nonaktif */
  --color-ink-200: #D3DBE3;   /* pemisah ringan (bukan border kartu) */
  --color-ink-100: #EDF1F5;   /* latar sekunder, baris tabel selang-seling */
  --color-ink-50:  #F4F1E9;   /* latar halaman — krem kertas, bukan putih steril */
  --color-white:   #FFFFFF;

  /* Primer — teal terang jenuh. Berani, bukan tenang. */
  --color-primary-900: #073C42;
  --color-primary-700: #0F5C63;  /* varian tekan (pressed) */
  --color-primary-500: #17B4B0;  /* tombol utama, link, badge solid */
  --color-primary-100: #DCEFF0;  /* dipakai HANYA sebagai isi badge kecil, bukan latar section */

  /* Sinyal — amber hi-vis, warna paling jenuh di palet. Hanya untuk TEMUAN dan peringatan. */
  --color-signal-700: #B45F12;
  --color-signal-500: #FF9E1B;
  --color-signal-100: #FDF0DF;

  /* Semantik */
  --color-success-700: #1F5D3D;
  --color-success-500: #38C172;
  --color-success-100: #E1F2E8;

  --color-danger-700:  #93261D;
  --color-danger-500:  #FF4B3E;
  --color-danger-100:  #FBE6E4;

  --color-offline-500: #8B5CF6;  /* status antrean sinkronisasi */
  --color-offline-100: #EEEAF7;
}
```

**Aturan pemakaian warna**

| Warna | Boleh dipakai untuk | Tidak boleh |
|---|---|---|
| `primary` | Tombol utama (isi solid), tautan, tab aktif, status rail "tanpa temuan" | Tint sebagai latar besar |
| `signal` (amber) | Badge "Ada Temuan" (isi solid), status rail temuan, peringatan | Tombol biasa, aksen dekoratif |
| `danger` | Status ditolak, tombol hapus, pesan error | Peringatan ringan |
| `success` | Status disetujui, konfirmasi berhasil | Tombol utama |
| `offline` (ungu) | Badge antrean sinkron, banner offline | Apa pun selain status koneksi |

Amber tidak pernah dipakai sebagai warna dekoratif. Jika muncul di layar, artinya ada sesuatu yang perlu diperhatikan. Setiap badge/status memakai warna **solid penuh** dengan border `ink-900` 2 px — tidak ada varian tint-lembut seperti pada palet lama.

### 2.2 Tipografi

| Peran | Typeface | Alasan |
|---|---|---|
| Judul & label antarmuka | **IBM Plex Sans Condensed** (600) | Lebih sempit ~12% dari sans biasa — label form panjang Bahasa Indonesia ("Hasil Pemeriksaan Tekanan Darah") muat dalam satu baris di layar 360 px |
| Isi & input | **IBM Plex Sans** (400/500) | Terbaca di ukuran kecil, cakupan diakritik lengkap |
| Data & angka | **IBM Plex Mono** (400/500) | NIK, NRP, tekanan darah, timestamp, dan ID — lebar digit sama sehingga mudah dipindai dan dibandingkan antar baris tabel |

Ketiganya satu superfamili sehingga tinggi-x dan proporsinya konsisten. Dimuat lokal (self-hosted, subset latin) supaya PWA tetap bekerja offline.

```css
@theme {
  --font-display: "IBM Plex Sans Condensed", system-ui, sans-serif;
  --font-body:    "IBM Plex Sans", system-ui, sans-serif;
  --font-mono:    "IBM Plex Mono", ui-monospace, monospace;
}
```

**Skala tipe**

| Token | Ukuran / line-height | Bobot | Pemakaian |
|---|---|---|---|
| `text-display` | 28 / 34 px | 600 condensed | Judul halaman |
| `text-title` | 20 / 28 px | 600 condensed | Judul kartu, judul bagian form |
| `text-subtitle` | 17 / 24 px | 500 | Sub-judul, nama pada kartu |
| `text-body` | 16 / 24 px | 400 | Teks isi, nilai input. **Tidak pernah di bawah 16 px pada input** — iOS akan auto-zoom |
| `text-label` | 14 / 20 px | 500 condensed | Label form, header tabel |
| `text-caption` | 13 / 18 px | 400 | Teks bantuan, metadata |
| `text-data` | 15 / 22 px | 500 mono | NIK, tekanan darah, tanggal-waktu |

### 2.3 Spacing

Basis 4 px. Yang dipakai: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`.

| Konteks | Nilai |
|---|---|
| Padding horizontal halaman (mobile) | 16 px |
| Padding horizontal halaman (≥ md) | 24 px |
| Jarak antar field form | 20 px |
| Jarak antar grup field | 32 px |
| Padding dalam kartu | 16 px |
| Jarak antar kartu di daftar | 12 px |
| Jarak minimum antar tombol | 8 px |

### 2.4 Radius, Border, Shadow — Neo-Brutalism

Radius nyaris nol: bentuk harus terbaca sebagai persegi, bukan pil. Border tebal solid hitam di **setiap** elemen berbatas (kartu, input, tombol, badge, dialog) — ini pengganti bayangan lembut sebagai pemisah visual, dan jauh lebih terbaca di layar redup/terik daripada border 1 px lama.

```css
--radius-sm: 2px;    /* badge, chip */
--radius-md: 4px;    /* input, tombol */
--radius-lg: 6px;    /* kartu, dialog */
--radius-full: 999px; /* dikecualikan: avatar bulat, indikator titik status saja */

--border-width: 2px;         /* default kartu, badge, chip */
--border-width-strong: 3px;  /* tombol, input, elemen interaktif utama */

/* Bayangan offset keras — bukan blur. Warna tetap solid ink-900, tanpa alpha lembut. */
--shadow-sm: 3px 3px 0 0 var(--color-ink-900);   /* chip, badge, kartu kecil */
--shadow-card: 4px 4px 0 0 var(--color-ink-900);  /* kartu, input saat fokus */
--shadow-raised: 6px 6px 0 0 var(--color-ink-900); /* tombol, elemen mengambang */
--shadow-sheet:  0 -6px 0 0 var(--color-ink-900);  /* bottom sheet, dialog */

/* Interaksi tekan: elemen berpindah ke arah bayangan, bayangan mengecil/hilang */
--press-translate: 3px, 3px;
--shadow-pressed: 0 0 0 0 var(--color-ink-900);
```

Setiap kartu, tombol, dan input punya border `ink-900` + bayangan offset keras secara default. Tidak ada bayangan blur (`rgba` bertransparansi) di mana pun dalam sistem ini — pemisahan lapisan datang murni dari border + offset. Saat elemen ditekan/aktif, ia bergeser mengikuti `--press-translate` dan bayangan mengecil ke `--shadow-pressed`, memberi kesan mekanis "tombol fisik ditekan".

### 2.5 Breakpoint

| Nama | Lebar | Perilaku |
|---|---|---|
| default | < 640 px | Satu kolom, bottom nav, tabel jadi kartu |
| `sm` | ≥ 640 px | Dua kolom untuk field pendek |
| `md` | ≥ 768 px | Dialog jadi modal (bukan sheet penuh) |
| `lg` | ≥ 1024 px | Sidebar kiri menggantikan bottom nav, tabel jadi tabel asli |
| `xl` | ≥ 1280 px | Lebar konten maksimum 1200 px, terpusat |

---

## 3. Mode Gelap

Wajib, bukan opsional. Sidak dilakukan pada jam istirahat — malam hari, koridor mess gelap. Layar putih menyilaukan dan mengganggu karyawan yang sedang tidur.

```css
.dark {
  --color-ink-50:  #0E151D;   /* latar halaman */
  --color-ink-100: #161E28;   /* permukaan kartu */
  --color-ink-200: #24303C;   /* pemisah ringan */
  --color-ink-900: #F2F6F9;   /* teks utama DAN warna border universal di mode gelap */
  --color-ink-500: #93A3B3;
  --color-primary-500: #2FA0A8;
  --color-signal-500:  #F0A050;
}
```

Border dan bayangan offset tetap dipakai penuh di mode gelap, hanya warnanya berbalik ke `ink-900` versi terang (`#F2F6F9`) alih-alih hitam — brutalism tidak melunak jadi flat-minimal saat gelap, ia tetap tegas dengan kontras terbalik.

Mode gelap mengikuti preferensi sistem, dengan toggle manual di halaman Profil. Preferensi disimpan di localStorage.

---

## 4. Ikon

Lucide React, ukuran 20 px (inline) dan 24 px (navigasi & tombol ikon), `stroke-width: 1.75`.

| Konsep | Ikon |
|---|---|
| Observasi mess | `building-2` |
| Observasi non-mess / home visit | `home` |
| Temuan | `alert-triangle` |
| Disetujui | `check-circle-2` |
| Ditolak | `x-circle` |
| Menunggu | `clock` |
| Antrean sinkronisasi | `cloud-off` |
| Jadwal | `calendar-days` |
| KPI | `bar-chart-3` |
| Pengguna | `users` |
| Laporan | `file-text` |
| Foto | `camera` |

Ikon tidak pernah berdiri sendiri sebagai satu-satunya penanda makna. Selalu ada teks pendamping atau `aria-label`.

---

## 5. Komponen Kunci

### 5.1 Tombol

Semua varian memakai border `ink-900` 3 px dan `shadow-raised` (offset keras) secara default. Saat ditekan: tombol bergeser `translate(3px, 3px)` dan bayangan hilang (`shadow-pressed`) — meniru tombol fisik ditekan ke bawah.

| Varian | Bentuk | Pakai untuk |
|---|---|---|
| `primary` | Isi `primary-500` solid, border ink-900, teks ink-900 | Aksi utama, satu per layar |
| `secondary` | Isi putih/`ink-50`, border ink-900, teks ink-900 | Aksi pendamping |
| `ghost` | Tanpa border, tanpa bayangan | Aksi tersier, ikon di header — satu-satunya varian "datar" yang diizinkan |
| `danger` | Isi `danger-500` solid, border ink-900, teks ink-900 | Hapus, tolak |

Tinggi: 44 px (mobile), 40 px (≥ lg). Tombol utama pada form observasi memakai lebar penuh. Radius `--radius-md`, teks `text-label` 600 weight — tombol brutalism tidak berbisik.

### 5.2 Input

- Tinggi 48 px, `font-size: 16px`, border **3 px** `ink-900` (bukan abu tipis) di semua state, radius `--radius-md`.
- Default: tanpa bayangan, latar putih flat.
- Fokus: bayangan muncul (`shadow-card`, offset 4px) + latar tetap putih. Perpindahan dari "rata" ke "terangkat" adalah sinyal fokusnya, bukan ring blur.
- Error: latar `danger-100`, border tetap `ink-900` 3 px, ikon peringatan solid di dalam field, pesan di bawah field.
- Field wajib ditandai `*` merah di label, dengan keterangan "* wajib diisi" di awal form — bukan menandai field opsional.

### 5.3 Radio & Checkbox

Bukan lingkaran kecil. Gunakan **kartu pilihan** setinggi 56 px, border `ink-900` 3 px di semua state. Kartu terpilih mendapat isi warna solid + bayangan offset; kartu tidak terpilih tetap putih tanpa bayangan (rata dengan latar). Radio "Temuan: Ya / Tidak" adalah keputusan terpenting di form Mess — dan diambil sambil berdiri.

```
┌─────────────────────┐  ┌─────────────────────┐
│  ◉  Ya              │  │  ○  Tidak           │
│     Ada pelanggaran │  │     Semua tertib    │
└─────────────────────┘  └─────────────────────┘
  isi signal-500, border      putih, border ink-900
  ink-900 3px + shadow-sm     3px, tanpa bayangan
```

### 5.4 Status Rail (elemen tanda tangan)

Batang **8 px** di sisi kiri kartu, tinggi penuh, border kanan `ink-900` 2 px memisahkannya tegas dari isi kartu. Kartu itu sendiri memakai border `ink-900` 2 px + `shadow-card` penuh — rail bukan lagi aksen tipis, ia bagian struktural kartu.

```
┏━┳──────────────────────────────────┓
┃█┃ Mess A / 7        30 Jul, 22:14  ┃
┃█┃ Budi Santoso · PT. PPA           ┃
┃█┃ [Ada Temuan]  Menunggu dokter    ┃
┗━┻──────────────────────────────────┛
  ↑ rail 8px solid, border kanan ink-900 2px
    kartu: border ink-900 2px + shadow-card
```

---

## 6. Aturan Layout Mobile

1. **Header lengket** setinggi 56 px: judul halaman, tombol kembali, badge antrean sinkron.
2. **Bottom nav** setinggi 64 px + safe-area inset. Maksimum 5 item.
3. **Tombol aksi form melekat di bawah** (`sticky bottom`) dengan latar solid dan border atas — tidak perlu menggulir ke bawah untuk mengirim.
4. **Tabel menjadi daftar kartu** di bawah `lg`. Jangan pernah menyajikan tabel yang bisa digulir horizontal di ponsel.
5. **Dialog menjadi bottom sheet** di bawah `md`.
6. **Padding bawah konten** minimal 96 px agar tidak tertutup bottom nav.

---

## 7. Penulisan Antarmuka

Kata di layar adalah material desain, bukan hiasan. Bahasa Indonesia, kalimat biasa, tanpa istilah teknis.

### 7.1 Prinsip

| Prinsip | Contoh |
|---|---|
| Tombol menyebut apa yang terjadi | "Kirim Observasi", bukan "Submit" |
| Nama aksi konsisten di seluruh alur | Tombol "Setujui" → toast "Observasi disetujui" |
| Error menjelaskan penyebab dan langkah berikutnya | "NIK wajib diisi karena Anda memilih ada temuan." |
| Error tidak meminta maaf dan tidak samar | Bukan "Maaf, terjadi kesalahan" |
| Layar kosong adalah ajakan bertindak | "Belum ada observasi hari ini. Mulai dari tombol di bawah." |
| Satu elemen satu tugas | Label melabeli, contoh mencontohkan — tidak dirangkap |

### 7.2 Label Enum → Bahasa Indonesia

Semua terpusat di `packages/shared/src/labels.ts`.

| Enum | Label |
|---|---|
| `PARAMEDIC` / `DOCTOR` / `SUPERADMIN` | Paramedis / Dokter / Superadmin |
| `ACTIVE` / `INACTIVE` / `LOCKED` | Aktif / Nonaktif / Terkunci |
| `PENDING` / `APPROVED` / `REJECTED` | Menunggu Persetujuan / Disetujui / Ditolak |
| `MESS` / `NON_MESS` | Karyawan Mess / Kunjungan Rumah |
| `PT_PPA` / `PT_AMM` / `MITRA_KERJA` | PT. PPA / PT. AMM / Mitra Kerja |
| `LAJANG` / `MENIKAH` / `DUDA` | Lajang / Menikah / Duda |
| `SIANG` / `MALAM` / `OFF` / `OVERSHIFT` / `CUTI` | Siang / Malam / Off / Overshift / Cuti |
| `BERSIH_RAPI` / `CUKUP` / `KURANG_RAPI` | Bersih & Rapi / Cukup / Kurang Rapi |
| `AC` / `KIPAS_ANGIN` / `VENTILASI` / `KASUR_LAYAK` | AC / Kipas Angin / Ventilasi / Kasur Layak |
| `PAGI` / `SORE` / `MALAM` | Pagi / Sore / Malam |

### 7.3 Pesan Standar

| Situasi | Teks |
|---|---|
| Berhasil kirim (online) | "Observasi terkirim. Menunggu persetujuan dokter." |
| Berhasil simpan (offline) | "Tersimpan di perangkat. Akan terkirim otomatis saat ada sinyal." |
| Sedang offline | "Tidak ada koneksi. Anda tetap bisa mengisi form." |
| Antrean tersinkron | "3 observasi berhasil terkirim." |
| Gagal login | "Email atau password salah." |
| Akun terkunci | "Akun terkunci. Coba lagi dalam 12 menit." |
| Akun nonaktif | "Akun Anda dinonaktifkan. Hubungi Superadmin." |
| Tidak punya akses | "Anda tidak punya akses ke halaman ini." |
| Daftar kosong (riwayat) | "Belum ada observasi. Mulai observasi pertama dari beranda." |
| Daftar kosong (antrean dokter) | "Tidak ada observasi menunggu persetujuan." |
| Daftar kosong (hasil filter) | "Tidak ada data pada filter ini. Coba ubah rentang tanggal." |
| Konfirmasi hapus | "Hapus pengguna ini? Tindakan ini tidak bisa dibatalkan." |
| Hapus ditolak | "Pengguna ini sudah punya data observasi. Nonaktifkan saja." |

---

## 8. Wireframe Low-Fidelity

Notasi: `[ ]` tombol · `( )` radio · `[✓]` checkbox · `▼` dropdown · `___` input · `▭` area foto · `┃` status rail

### SC-01 Login

```
┌──────────────────────────────┐
│                              │
│        ◈ (logo)              │
│   Observasi Istirahat        │  text-display
│   Karyawan                   │
│                              │
│   Email                      │  text-label
│   ┌────────────────────────┐ │
│   │ ______________________ │ │  h-48
│   └────────────────────────┘ │
│                              │
│   Password              👁    │
│   ┌────────────────────────┐ │
│   │ ______________________ │ │
│   └────────────────────────┘ │
│                              │
│   ⚠ Email atau password salah│  danger, jika ada
│                              │
│   [      Masuk           ]   │  primary, w-full
│                              │
│   Lupa password? Hubungi     │  text-caption
│   Superadmin.                │
└──────────────────────────────┘
```

### SC-02 Ganti Password Wajib

```
┌──────────────────────────────┐
│ Ganti Password               │
│ Demi keamanan, ganti         │  text-caption
│ password sebelum melanjutkan.│
│                              │
│ Password Saat Ini *          │
│ [______________________]     │
│                              │
│ Password Baru *              │
│ [______________________]     │
│ ▬▬▬▬▬▬▬░░░  Cukup kuat       │  indikator
│ Minimal 8 karakter,          │
│ mengandung huruf dan angka.  │
│                              │
│ Ulangi Password Baru *       │
│ [______________________]     │
│                              │
│ [   Simpan dan Lanjutkan  ]  │
└──────────────────────────────┘
```

### SC-03 Beranda Paramedis

```
┌──────────────────────────────┐
│ Selamat malam, Suryani   ☁3 │  header + badge antrean
├──────────────────────────────┤
│ ┌──────────────────────────┐ │
│ │  ⊕                       │ │
│ │  Mulai Observasi         │ │  kartu besar, h-96
│ │                          │ │  primary
│ └──────────────────────────┘ │
│                              │
│ Jadwal Hari Ini              │  text-title
│ ┌──────────────────────────┐ │
│ │ Shift Malam · Mess       │ │
│ │ Target 5 · Selesai 3     │ │
│ │ ▬▬▬▬▬▬░░░░  60%          │ │
│ └──────────────────────────┘ │
│                              │
│ Observasi Terakhir      Lihat│
│ ┃┌────────────────────────┐  │
│ ┃│ Mess A / 7   22:14     │  │  rail amber
│ ┃│ Budi Santoso           │  │
│ ┃│ [Ada Temuan] Menunggu  │  │
│ ┃└────────────────────────┘  │
│ ┃┌────────────────────────┐  │
│ ┃│ Mess A / 6   22:02     │  │  rail teal
│ ┃│ [Tertib] Menunggu      │  │
│ ┃└────────────────────────┘  │
├──────────────────────────────┤
│  🏠     📋      📅      👤   │  bottom nav
│ Beranda Observasi Jadwal Profil│
└──────────────────────────────┘
```

### SC-04 Pilih Tipe Observasi

```
┌──────────────────────────────┐
│ ←  Pilih Tipe Observasi      │
├──────────────────────────────┤
│ ┌──────────────────────────┐ │
│ │  🏢                      │ │
│ │  Karyawan Mess           │ │  h-120
│ │  Sidak jam istirahat di  │ │
│ │  mess perusahaan       → │ │
│ └──────────────────────────┘ │
│                              │
│ ┌──────────────────────────┐ │
│ │  🏠                      │ │
│ │  Kunjungan Rumah         │ │
│ │  Karyawan yang tinggal   │ │
│ │  di luar mess          → │ │
│ └──────────────────────────┘ │
│                              │
│ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ │
│   ⏱ Observasi belum selesai  │  jika ada draft
│   Mess A / 7 · mulai 22:03   │
│   [Lanjutkan]  [Buang]       │
│ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │
└──────────────────────────────┘
```

### SC-05 Form Mess — Bagian 1

```
┌──────────────────────────────┐
│ ←  Observasi Mess            │
│ ▬▬▬▬▬▬▬▬  ░░░░░░  ░░░░░░     │  stepper 1/3
│ Informasi Dasar              │
├──────────────────────────────┤
│ * wajib diisi                │
│                              │
│ Tanggal Observasi *          │
│ [ 31 Juli 2026          📅 ] │  default hari ini
│                              │
│ Komplek Mess *               │
│ [ Mess A                  ▼] │
│                              │
│ Nomor Mess *                 │
│ [ 7                       ▼] │  terisi setelah komplek
│                              │
│ Petugas Observasi *          │
│ [ Muhammad Suryani        ▼] │  default = user login
│                              │
│ Temuan *                     │
│ Apakah ada karyawan yang     │  text-caption
│ belum tidur?                 │
│ ┌────────────┐┌────────────┐ │
│ │ ◉ Ya       ││ ○ Tidak    │ │  kartu pilihan h-56
│ │ Ada        ││ Semua      │ │
│ │ pelanggaran││ tertib     │ │
│ └────────────┘└────────────┘ │
├──────────────────────────────┤
│ [        Lanjut          ]   │  sticky bottom
└──────────────────────────────┘
```

### SC-05 Form Mess — Bagian 2 (Temuan = Ya)

```
┌──────────────────────────────┐
│ ←  Observasi Mess            │
│ ▬▬▬▬▬▬▬▬ ▬▬▬▬▬▬▬▬ ░░░░░░     │  stepper 2/3
│ Deskripsi Temuan             │
├──────────────────────────────┤
│ Nama Karyawan *              │
│ [______________________]     │
│                              │
│ NIK *                        │
│ [______________________]     │  font-mono
│                              │
│ Perusahaan *                 │
│ [ PT. PPA                 ▼] │
│                              │
│ Jabatan *      Departemen *  │  2 kolom di sm:
│ [__________]   [__________]  │
│                              │
│ Tekanan Darah                │
│ [ 120/80 mmHg           ]    │  font-mono
│                              │
│ Aktivitas yang Dilakukan *   │
│ ┌────────────────────────┐   │
│ │                        │   │  textarea 3 baris
│ └────────────────────────┘   │
│                              │
│ Alasan Belum Tidur *         │
│ ┌────────────────────────┐   │
│ └────────────────────────┘   │
│                              │
│ Foto Temuan *                │
│ ┌────────┐ ┌────────┐        │
│ │  ▭  ✕  │ │   📷   │        │  pratinjau + tambah
│ │        │ │ Tambah │        │
│ └────────┘ └────────┘        │
│ Maksimal 3 foto              │
├──────────────────────────────┤
│ [ Kembali ]  [   Lanjut   ]  │
└──────────────────────────────┘
```

### SC-05 Form Mess — Bagian 3 (Temuan = Tidak)

```
┌──────────────────────────────┐
│ ▬▬▬▬▬▬▬▬ ▬▬▬▬▬▬▬▬ ▬▬▬▬▬▬     │
│ Dokumentasi Mess             │
├──────────────────────────────┤
│ Foto kondisi mess yang       │
│ tertib dan tenang.           │
│                              │
│ ┌──────────────────────────┐ │
│ │                          │ │
│ │        📷                │ │  area tap besar
│ │   Ambil Foto             │ │  h-160
│ │                          │ │
│ └──────────────────────────┘ │
│                              │
│ ┌────────┐ ┌────────┐        │
│ │  ▭  ✕  │ │  ▭  ✕  │        │
│ └────────┘ └────────┘        │
├──────────────────────────────┤
│ [ Kembali ]  [   Lanjut   ]  │
└──────────────────────────────┘
```

### SC-05/06 Ringkasan & Kirim

```
┌──────────────────────────────┐
│ ←  Periksa Sebelum Kirim     │
├──────────────────────────────┤
│ Informasi Dasar        Ubah  │
│ ┌──────────────────────────┐ │
│ │ Tanggal    31 Juli 2026  │ │
│ │ Lokasi     Mess A / 7    │ │
│ │ Petugas    M. Suryani    │ │
│ │ Temuan     Ya            │ │
│ └──────────────────────────┘ │
│                              │
│ Deskripsi Temuan       Ubah  │
│ ┌──────────────────────────┐ │
│ │ Karyawan   Budi Santoso  │ │
│ │ NIK        PPA-004512    │ │
│ │ Perusahaan PT. PPA       │ │
│ │ T. Darah   130/85 mmHg   │ │
│ │ Aktivitas  Bermain game  │ │
│ │ Alasan     Belum ngantuk │ │
│ │ Foto       ▭ ▭           │ │
│ └──────────────────────────┘ │
│                              │
│ ⓘ Tidak ada koneksi. Data    │  jika offline
│   akan terkirim otomatis     │
│   saat sinyal kembali.       │
├──────────────────────────────┤
│ [   Kirim Observasi      ]   │
└──────────────────────────────┘
```

### SC-06 Form Non-Mess — Bagian 1

Tiga puluh lebih field. Dipecah menjadi grup ber-accordion dalam satu langkah, bukan satu gulungan datar.

```
┌──────────────────────────────┐
│ ←  Kunjungan Rumah           │
│ ▬▬▬▬▬▬▬▬ ░░░░░░ ░░░░░░        │  1/3
│ Identitas & Kondisi Rumah    │
├──────────────────────────────┤
│ ▼ Data Diri Karyawan    (8)  │  accordion terbuka
│   Nama Karyawan *            │
│   [____________________]     │
│   NRP *                      │
│   [____________________]     │
│   Tanggal Lahir *            │
│   [ 17 April 1991      📅]   │
│   Status Pernikahan *        │
│   [ Menikah             ▼]   │
│   Masa Kerja *               │
│   [ 6 tahun            ]     │
│   Jabatan *   Departemen *   │
│   [________]  [_________]    │
│   Perusahaan *               │
│   ( ) PT. PPA  (◉) PT. AMM   │
│                              │
│ ▶ Kondisi Rumah         (5)  │  tertutup
│ ▶ Aktivitas & Tidur     (2)  │
│ ▶ Fasilitas & Lingkungan (7) │
├──────────────────────────────┤
│ [        Lanjut          ]   │
└──────────────────────────────┘
```

Grup "Fasilitas & Lingkungan" saat terbuka:

```
│ ▼ Fasilitas & Lingkungan     │
│   Fasilitas Kamar *          │
│   [✓] AC      [ ] Kipas Angin│
│   [✓] Ventilasi [✓] Kasur    │
│                              │
│   Hewan Peliharaan *         │
│   (◉) Ada    ( ) Tidak Ada   │
│   Sebutkan *                 │  muncul jika Ada
│   [ Ayam di belakang rumah ] │
│                              │
│   Kegiatan Lain di Luar Kerja│
│   [ ] Menjaga Toko           │
│   [✓] Berkebun               │
│   [ ] Ternak  [ ] Ojek Online│
│   [ ] Lainnya                │
│                              │
│   Kebersihan & Kerapihan *   │
│   [ Cukup                 ▼] │
│                              │
│   Ada Kebisingan? *          │
│   (◉) Ya     ( ) Tidak       │
│   Sumber Kebisingan *        │
│   [ Bengkel las tetangga   ] │
│                              │
│   Potensi Gangguan Tidur     │
│   ┌──────────────────────┐   │
│   └──────────────────────┘   │
```

### SC-06 Form Non-Mess — Bagian 2 (Kuesioner Keluarga)

```
┌──────────────────────────────┐
│ ▬▬▬▬▬▬▬▬ ▬▬▬▬▬▬▬▬ ░░░░░░      │  2/3
│ Kuesioner Fatigue Keluarga   │
├──────────────────────────────┤
│ ⓘ Wawancarai anggota keluarga│
│   yang tinggal serumah.      │
│                              │
│ ▼ Data Responden             │
│   Nama Responden *           │
│   [____________________]     │
│   Umur *      Pendidikan *   │
│   [ 34  ]     [ SMA      ▼]  │
│   Hubungan dengan Karyawan * │
│   [ Istri                 ▼] │
│   Keluarga dari (A.N)        │
│   [ Rudi Hartono        ]    │
│   Jabatan di Perusahaan      │
│   [ (kosongkan jika tidak) ] │
│                              │
│ ▼ Pemahaman Fatigue          │
│   Apa yang Anda ketahui      │
│   tentang fatigue? *         │
│   ┌──────────────────────┐   │
│   └──────────────────────┘   │
│   Bagaimana peran keluarga   │
│   mencegah fatigue? *        │
│   ┌──────────────────────┐   │
│   └──────────────────────┘   │
│   Menurut Anda apa risiko    │
│   kelelahan saat bekerja? *  │
│   ┌──────────────────────┐   │
│   └──────────────────────┘   │
│   Apa yang biasanya membuat  │
│   karyawan lelah? *          │
│   ┌──────────────────────┐   │
│   └──────────────────────┘   │
├──────────────────────────────┤
│ [ Kembali ]  [   Lanjut   ]  │
└──────────────────────────────┘
```

### SC-06 Form Non-Mess — Bagian 3

```
┌──────────────────────────────┐
│ ▬▬▬▬▬▬▬▬ ▬▬▬▬▬▬▬▬ ▬▬▬▬▬▬      │  3/3
│ Dokumentasi                  │
├──────────────────────────────┤
│ Petugas Pelaksana *          │
│ [ Muhammad Suryani        ▼] │
│                              │
│ Lokasi Observasi *           │
│ [ Satui, Tanah Bumbu      ▼] │
│                              │
│ Email Admin *                │
│ [ suryani@example.com    ]   │
│                              │
│ Dokumentasi Foto *           │
│ ┌────────────────────────┐   │
│ │        📷              │   │
│ │   Ambil / Pilih Foto   │   │
│ └────────────────────────┘   │
│ ┌────┐┌────┐┌────┐           │
│ │▭ ✕ ││▭ ✕ ││▭ ✕ │           │
│ └────┘└────┘└────┘           │
│ 3 dari maksimal 8 foto       │
├──────────────────────────────┤
│ [ Kembali ]  [   Lanjut   ]  │
└──────────────────────────────┘
```

### SC-07 Riwayat Observasi

```
┌──────────────────────────────┐
│ Observasi              🔍 ⚙  │
├──────────────────────────────┤
│ [Semua][Mess][Rumah]         │  segmented
│ [Menunggu ▼][Juli 2026 ▼]    │  filter chip
├──────────────────────────────┤
│ 31 JULI 2026                 │  pemisah tanggal
│ ┃┌────────────────────────┐  │
│ ┃│ Mess A / 7      22:14  │  │
│ ┃│ Budi Santoso · PT. PPA │  │
│ ┃│ ⚠ Ada Temuan  ⏱ Menunggu│ │
│ ┃└────────────────────────┘  │
│ ┃┌────────────────────────┐  │
│ ┃│ Mess A / 6      22:02  │  │
│ ┃│ ✓ Tertib     ⏱ Menunggu│  │
│ ┃└────────────────────────┘  │
│ 30 JULI 2026                 │
│ ┃┌────────────────────────┐  │
│ ┃│ Rudi Hartono    14:30  │  │
│ ┃│ Kunjungan Rumah · Satui│  │
│ ┃│ ✓ Disetujui            │  │
│ ┃└────────────────────────┘  │
│         ↓ memuat...          │
└──────────────────────────────┘
```

### SC-08 Detail Observasi

```
┌──────────────────────────────┐
│ ←  Observasi Mess       ⋮    │
├──────────────────────────────┤
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ ⚠  ADA TEMUAN            ┃ │  banner amber
│ ┃    Menunggu persetujuan  ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                              │
│ Informasi Dasar              │
│ Tanggal     31 Juli 2026     │
│ Lokasi      Mess A / 7       │
│ Petugas     M. Suryani       │
│ Dikirim     22:14 WITA       │
│                              │
│ Data Karyawan                │
│ Nama        Budi Santoso     │
│ NIK         PPA-004512       │  mono
│ Perusahaan  PT. PPA          │
│ Jabatan     Operator HD      │
│ Departemen  Production       │
│ T. Darah    130/85 mmHg      │  mono
│                              │
│ Aktivitas                    │
│ Bermain game di ponsel       │
│                              │
│ Alasan Belum Tidur           │
│ Belum mengantuk, baru pulang │
│ dari warung                  │
│                              │
│ Dokumentasi                  │
│ ┌────┐┌────┐                 │
│ │ ▭  ││ ▭  │  ketuk perbesar │
│ └────┘└────┘                 │
├──────────────────────────────┤
│ [  Tolak  ]  [   Setujui  ]  │  hanya untuk dokter
└──────────────────────────────┘
```

### SC-09 Antrean Persetujuan (Dokter)

```
┌──────────────────────────────┐
│ Persetujuan            🔍 ⚙  │
├──────────────────────────────┤
│ ┌──────────┐┌──────────┐     │
│ │   23     ││  4 hari  │     │  kartu ringkas
│ │ Menunggu ││ Terlama  │     │
│ └──────────┘└──────────┘     │
│                              │
│ [Semua][Mess][Rumah]         │
├──────────────────────────────┤
│ ┃┌────────────────────────┐  │
│ ┃│ Mess C / 3   🔴 4 hari │  │  aging merah
│ ┃│ M. Suryani             │  │
│ ┃│ ⚠ Ada Temuan           │  │
│ ┃│ Ahmad Fauzi · PT. AMM  │  │
│ ┃└────────────────────────┘  │
│ ┃┌────────────────────────┐  │
│ ┃│ Mess A / 7   🟡 2 hari │  │
│ ┃│ M. Suryani             │  │
│ ┃│ ✓ Tertib               │  │
│ ┃└────────────────────────┘  │
└──────────────────────────────┘
```

Dialog persetujuan (bottom sheet di mobile):

```
┌──────────────────────────────┐
│ ═══                          │  handle
│ Setujui Observasi            │
│ Mess A / 7 · Budi Santoso    │
│                              │
│ Catatan Medis (opsional)     │
│ ┌──────────────────────────┐ │
│ │ Tekanan darah perlu      │ │
│ │ dipantau ulang.          │ │
│ └──────────────────────────┘ │
│                              │
│ [ Batal ]   [   Setujui   ]  │
└──────────────────────────────┘
```

Saat menolak, label berubah menjadi "Catatan Medis *" dengan keterangan "Jelaskan alasan penolakan agar paramedis bisa menindaklanjuti." dan tombol `danger`.

### SC-10 Dashboard KPI

```
┌──────────────────────────────┐
│ Dashboard KPI          📅 ⬇  │
├──────────────────────────────┤
│ [ 1 – 31 Juli 2026        ▼] │
│                              │
│ ┌─────────┐┌─────────┐       │
│ │  128    ││   34    │       │
│ │  Mess   ││  Rumah  │       │
│ └─────────┘└─────────┘       │
│ ┌─────────┐┌─────────┐       │
│ │  41     ││  90%    │       │
│ │ Temuan  ││ Patuh   │       │
│ └─────────┘└─────────┘       │
│                              │
│ Persetujuan                  │
│ Rata-rata 18 jam · 3 lewat   │
│ dari 48 jam                  │
│                              │
│ Per Paramedis                │
│ ┌──────────────────────────┐ │
│ │ M. Suryani               │ │
│ │ Mess 45 · Rumah 12       │ │
│ │ ▬▬▬▬▬▬▬▬▬░  95%          │ │
│ ├──────────────────────────┤ │
│ │ A. Priambara             │ │
│ │ Mess 38 · Rumah 9        │ │
│ │ ▬▬▬▬▬▬░░░░  72%   ⚠      │ │  di bawah target
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

### SC-12 Daftar Pengguna (Superadmin)

Mobile — kartu:

```
┌──────────────────────────────┐
│ Pengguna              🔍  ＋ │
├──────────────────────────────┤
│ [ Cari nama atau email     ] │
│ [Semua Role ▼][Semua Status▼]│
├──────────────────────────────┤
│ ┌──────────────────────────┐ │
│ │ Muhammad Suryani      ⋮  │ │
│ │ suryani@example.com      │ │
│ │ [Paramedis] [Aktif]      │ │
│ │ Login terakhir 2 jam lalu│ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ dr. Agung Priambara   ⋮  │ │
│ │ agung@example.com        │ │
│ │ [Dokter] [Aktif]         │ │
│ └──────────────────────────┘ │
│                              │
│ Menampilkan 1–10 dari 12     │
│ [ ‹ ]  1  2  [ › ]           │
└──────────────────────────────┘
```

Menu `⋮`: Edit · Reset Password · Nonaktifkan · Hapus (nonaktif jika `canDelete = false`, dengan tooltip alasannya).

Desktop ≥ `lg` — tabel: Nama · Email · Role · Status · Login Terakhir · Aksi.

### SC-13 Tambah Pengguna + Dialog Password

```
┌──────────────────────────────┐    ┌──────────────────────────────┐
│ ←  Tambah Pengguna           │    │ ✓ Pengguna Dibuat            │
├──────────────────────────────┤    │                              │
│ Nama Lengkap *               │    │ Simpan password sementara    │
│ [______________________]     │    │ ini. Password tidak akan     │
│                              │    │ ditampilkan lagi.            │
│ Email *                      │ →  │                              │
│ [______________________]     │    │ ┌──────────────────────────┐ │
│ Dipakai untuk login.         │    │ │ Kx7mQp2nRw4t        📋   │ │  mono
│                              │    │ └──────────────────────────┘ │
│ Role *                       │    │                              │
│ [ Paramedis             ▼]   │    │ Pengguna wajib mengganti     │
│                              │    │ password saat login pertama. │
│ Password Sementara           │    │                              │
│ (◉) Buat otomatis            │    │ [ Salin & Tutup ]            │
│ ( ) Isi manual               │    └──────────────────────────────┘
├──────────────────────────────┤
│ [   Simpan Pengguna      ]   │
└──────────────────────────────┘
```

### SC-15 Master Data Mess

```
┌──────────────────────────────┐
│ ←  Master Data Mess       ＋ │
├──────────────────────────────┤
│ ┌──────────────────────────┐ │
│ │ ▼ Mess A        12 kamar │ │
│ │   [1][2][3][4][5][6]     │ │  chip nomor
│ │   [7][8][9][10][11][12]  │ │
│ │   [ ＋ Tambah Kamar    ] │ │
│ │                     ✎ 🗑 │ │
│ ├──────────────────────────┤ │
│ │ ▶ Mess B        12 kamar │ │
│ │ ▶ Mess C        12 kamar │ │
│ │ ▶ Mess GL       12 kamar │ │
│ │ ▶ Mess Mandala  12 kamar │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

### SC-16 Pembuat Laporan

```
┌──────────────────────────────┐
│ ←  Buat Laporan              │
├──────────────────────────────┤
│ Rentang Tanggal *            │
│ [ 1 Jul ] – [ 31 Jul 2026 ]  │
│ Maksimal 12 bulan.           │
│                              │
│ Tipe Observasi               │
│ [Semua][Mess][Rumah]         │
│                              │
│ Paramedis                    │
│ [ Semua Paramedis         ▼] │
│                              │
│ Status                       │
│ [ Disetujui               ▼] │
│                              │
│ ┌──────────────────────────┐ │
│ │ 128 data · ± 9 halaman   │ │
│ └──────────────────────────┘ │
│                              │
│ [ Unduh PDF ] [ Unduh Excel ]│
│                              │
│ ▬▬▬▬▬▬▬░░░ Menyiapkan 68%    │  saat async
└──────────────────────────────┘
```

### SC-18 Antrean Sinkronisasi

```
┌──────────────────────────────┐
│ ←  Antrean Sinkronisasi      │
├──────────────────────────────┤
│ ⚠ Tidak ada koneksi.         │  banner offline
│   3 observasi menunggu.      │
│                              │
│ ┃┌────────────────────────┐  │  rail ungu
│ ┃│ Mess A / 7             │  │
│ ┃│ Dibuat 22:14 · 2 foto  │  │
│ ┃│ ☁ Menunggu koneksi     │  │
│ ┃└────────────────────────┘  │
│ ┃┌────────────────────────┐  │
│ ┃│ Mess A / 6             │  │
│ ┃│ Dibuat 22:02 · 1 foto  │  │
│ ┃│ ⟳ Percobaan 3 dari 5   │  │
│ ┃└────────────────────────┘  │
│ ┃┌────────────────────────┐  │  rail merah
│ ┃│ Rudi Hartono           │  │
│ ┃│ ✕ Gagal — data tidak   │  │
│ ┃│   lengkap              │  │
│ ┃│ [ Perbaiki ] [ Hapus ] │  │
│ ┃└────────────────────────┘  │
│                              │
│ [   Coba Kirim Semua     ]   │
└──────────────────────────────┘
```

---

## 9. Batas Kualitas

Setiap layar wajib memenuhi ini sebelum PR-nya disetujui:

- [ ] Terbaca dan berfungsi di lebar 360 px tanpa gulir horizontal
- [ ] Semua elemen interaktif ≥ 44×44 px
- [ ] Fokus keyboard terlihat jelas pada setiap kontrol
- [ ] Setiap input punya `<label>` yang terhubung
- [ ] Punya kondisi loading, kosong, dan error — bukan hanya kondisi ideal
- [ ] Warna bukan satu-satunya pembawa makna (selalu ada teks atau ikon pendamping)
- [ ] Kontras teks ≥ 4.5:1 pada mode terang dan gelap
- [ ] `prefers-reduced-motion` dihormati (nonaktifkan animasi translate saat ditekan, ganti dengan perubahan warna instan)
- [ ] Copy sesuai §7 — tanpa istilah teknis, tanpa permintaan maaf
- [ ] Border `ink-900` solid + bayangan offset keras terpasang pada kartu/tombol/input — tidak ada bayangan blur/`rgba` tersisa dari palet lama
