# Akun Demo

Semua akun memakai password: **`Password123`**

| #   | Nama                | Email                 | Role       | Status                      |
| --- | ------------------- | --------------------- | ---------- | --------------------------- |
| 1   | Muhammad Suryani    | `suryani@example.com` | Paramedis  | Aktif                       |
| 2   | dr. Haamim Sajdah S | `haamim@example.com`  | Dokter     | Aktif                       |
| 3   | Hidayatullah        | `admin@example.com`   | Superadmin | Aktif                       |
| 4   | Agung Priambara     | `agung@example.com`   | Paramedis  | Aktif, wajib ganti password |
| 5   | Rina Andriani       | `rina@example.com`    | Paramedis  | Aktif                       |
| 6   | dr. Fitri Nurlaila  | `fitri@example.com`   | Dokter     | Aktif                       |
| 7   | Bambang Hermawan    | `bambang@example.com` | Paramedis  | Nonaktif (tidak bisa login) |

## Peran

| Role           | Bisa akses                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------ |
| **Paramedis**  | Beranda, Mulai Observasi (Mess + Kunjungan Rumah), Riwayat, Detail, Jadwal, Profil               |
| **Dokter**     | Beranda, Antrean Persetujuan (approve/reject), Riwayat, Detail (dengan tombol aksi), KPI, Profil |
| **Superadmin** | Beranda, Daftar Pengguna (tambah), Riwayat, KPI, Profil                                          |

## Cara menjalankan

```bash
pnpm --filter web dev
```

Buka `http://localhost:5173`
