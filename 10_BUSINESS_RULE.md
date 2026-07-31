# 10 — Business Rules

> Setiap aturan punya ID, dapat diuji, dan wajib punya minimal satu test yang menyebut ID-nya di komentar.
> Jika kode dan dokumen ini bertentangan, dokumen ini yang benar — perbaiki kodenya, atau ubah dokumen lewat entri di 11_DECISION_LOG.md.

**Format:** `BR-<DOMAIN>-<nomor>`
Domain: `AUTH`, `USR`, `PRM` (permission), `OBS` (observasi umum), `MSS` (mess), `NMS` (non-mess), `PHO` (foto), `APR` (approval), `SCH` (jadwal), `SYN` (sinkronisasi), `KPI`, `MST` (master data), `RPT` (laporan), `AUD` (audit).

---

## 1. Autentikasi & Password

| ID | Aturan |
|---|---|
| **BR-AUTH-01** | Login memakai email (case-insensitive) + password. Email dinormalisasi ke huruf kecil sebelum pencocokan. |
| **BR-AUTH-02** | Kegagalan login mengembalikan pesan identik untuk email tidak ditemukan maupun password salah: "Email atau password salah." Tidak boleh membocorkan email mana yang terdaftar. |
| **BR-AUTH-03** | Setelah 5 kegagalan login berturut-turut, akun berstatus `LOCKED` selama 15 menit. Hitungan direset ke 0 setiap login berhasil. Setelah 15 menit terlewat, login berikutnya diizinkan dan status kembali `ACTIVE`. |
| **BR-AUTH-04** | Pengguna berstatus `INACTIVE` tidak bisa login, apa pun kredensialnya. Pesan: "Akun Anda dinonaktifkan. Hubungi Superadmin." |
| **BR-AUTH-05** | Password minimal 8 karakter dan wajib memuat sedikitnya satu huruf dan satu angka. Password baru tidak boleh sama dengan password saat ini. |
| **BR-AUTH-06** | Password disimpan sebagai hash bcrypt dengan salt rounds ≥ 12. Password mentah tidak pernah ditulis ke log, respons API, atau audit log. |
| **BR-AUTH-07** | Saat `forcePasswordChange = true`, setiap endpoint selain `/auth/me`, `/auth/change-password`, dan `/auth/logout` menolak dengan 403 `PASSWORD_CHANGE_REQUIRED`. Frontend mengarahkan ke SC-02 dan memblokir navigasi ke rute lain. |
| **BR-AUTH-08** | Access token berumur 1 jam; refresh token 7 hari. |
| **BR-AUTH-09** | Refresh token dirotasi setiap kali dipakai: token lama dicabut, token baru diterbitkan. |
| **BR-AUTH-10** | Jika refresh token yang sudah dicabut dipakai kembali, **seluruh** refresh token milik pengguna itu dicabut dan permintaan ditolak. Ini indikasi token dicuri. |
| **BR-AUTH-11** | Mengganti password sendiri mencabut semua sesi lain, tetapi tidak sesi yang sedang dipakai. |
| **BR-AUTH-12** | Satu pengguna boleh punya beberapa sesi aktif dari perangkat berbeda. |

## 2. Izin Akses

| ID | Aturan |
|---|---|
| **BR-PRM-01** | Setiap endpoint memvalidasi role di backend. Penyembunyian menu di frontend adalah kenyamanan, bukan kontrol keamanan. |
| **BR-PRM-02** | Paramedis hanya bisa membaca observasi, foto, dan jadwal miliknya sendiri. Scoping diterapkan di service, bukan diandalkan dari parameter query. |
| **BR-PRM-03** | Record yang ada tetapi di luar scope pengguna dikembalikan sebagai 404, bukan 403. Membedakannya membocorkan keberadaan data. |
| **BR-PRM-04** | Hanya Dokter yang bisa menyetujui atau menolak observasi. Superadmin tidak bisa — kewenangan administratif tidak memberi kewenangan klinis. |
| **BR-PRM-05** | Hanya Paramedis yang bisa membuat observasi. Dokter dan Superadmin tidak. |
| **BR-PRM-06** | Hanya Superadmin yang bisa mengelola pengguna, master data, jadwal, dan melihat audit log. |
| **BR-PRM-07** | Dokter dan Superadmin bisa melihat semua observasi dan menghasilkan laporan. |

### Matriks Izin

| Kemampuan | Paramedis | Dokter | Superadmin |
|---|:---:|:---:|:---:|
| Login, ganti password sendiri | ✅ | ✅ | ✅ |
| Buat observasi Mess & Non-Mess | ✅ | ❌ | ❌ |
| Unggah foto | ✅ | ❌ | ❌ |
| Lihat riwayat observasi | sendiri | semua | semua |
| Lihat detail observasi | sendiri | semua | semua |
| Setujui / tolak observasi | ❌ | ✅ | ❌ |
| Lihat dashboard KPI | statistik pribadi | semua | semua |
| Lihat jadwal | sendiri | semua | semua |
| Kelola jadwal | ❌ | ❌ | ✅ |
| Kelola pengguna & role | ❌ | ❌ | ✅ |
| Kelola master data mess & lokasi | ❌ | ❌ | ✅ |
| Buat laporan & ekspor | ❌ | ✅ | ✅ |
| Lihat audit log | ❌ | ❌ | ✅ |
| Pengaturan sistem, backup | ❌ | ❌ | ✅ |

## 3. Manajemen Pengguna

| ID | Aturan |
|---|---|
| **BR-USR-01** | Email wajib unik di antara pengguna yang belum dihapus. Pembandingan case-insensitive. |
| **BR-USR-02** | Pengguna baru selalu dibuat dengan `forcePasswordChange = true` dan status `ACTIVE`. |
| **BR-USR-03** | Password sementara dikirim ke email pengguna. Bila SMTP tidak tersedia, password dikembalikan sekali pada respons pembuatan/reset dan tidak pernah bisa dilihat lagi. |
| **BR-USR-04** | Superadmin tidak bisa mengubah role, menonaktifkan, atau menghapus akunnya sendiri. |
| **BR-USR-05** | Sistem selalu menyisakan minimal satu Superadmin berstatus `ACTIVE`. Operasi yang melanggar ini ditolak. |
| **BR-USR-06** | Pengguna yang memiliki data observasi atau jadwal tidak bisa dihapus — hanya dinonaktifkan. Data observasi tetap utuh. |
| **BR-USR-07** | Menonaktifkan atau mengganti role pengguna mencabut seluruh refresh token miliknya. Sesi lama tidak boleh membawa hak akses lama. |
| **BR-USR-08** | Superadmin tidak bisa mengubah password pengguna secara langsung, hanya mereset. Password baru tidak pernah dipilih oleh orang lain. |
| **BR-USR-09** | Reset password menetapkan `forcePasswordChange = true` dan mencabut semua sesi pengguna tersebut. |
| **BR-USR-10** | Pengguna yang dihapus melalui soft delete tidak membebaskan emailnya untuk dipakai ulang. |

## 4. Observasi — Umum

| ID | Aturan |
|---|---|
| **BR-OBS-01** | `paramedicId` selalu diambil dari token, tidak pernah dari body request. Nilai di body diabaikan. |
| **BR-OBS-02** | Observasi yang sudah terkirim tidak bisa diedit oleh siapa pun. Koreksi dilakukan dengan membuat observasi baru. |
| **BR-OBS-03** | Status awal setiap observasi adalah `PENDING`. |
| **BR-OBS-04** | Transisi status yang sah hanya `PENDING → APPROVED` dan `PENDING → REJECTED`. Semua transisi lain ditolak dengan `INVALID_STATE_TRANSITION`. |
| **BR-OBS-05** | `submittedAt` diisi client (waktu pengguna menekan Kirim). `createdAt` diisi server. Untuk data offline keduanya bisa berbeda jauh; laporan memakai `submittedAt`. |
| **BR-OBS-06** | `observationDate` tidak boleh di masa depan. Tanggal lebih dari 7 hari ke belakang memicu peringatan di UI tetapi tetap diterima — sinkronisasi offline yang tertunda lama itu wajar. |
| **BR-OBS-07** | Dua observasi pada komplek, kamar, dan tanggal yang sama diperbolehkan. Ini bukan duplikat; bisa saja dua shift berbeda. UI menampilkan info bahwa ada observasi lain di lokasi dan tanggal sama. |
| **BR-OBS-08** | Nilai teks di-trim di kedua ujung sebelum disimpan. NIK dan NRP juga diubah ke huruf besar. |

## 5. Observasi Mess

| ID | Aturan |
|---|---|
| **BR-MSS-01** | Field wajib Bagian 1: `observationDate`, `messComplexId`, `messRoomId`, `hasFinding`. |
| **BR-MSS-02** | Bila `hasFinding = true`, wajib terisi: `employeeName`, `employeeNik`, `employeeCompany`, `activityDesc`, dan minimal satu foto berkategori `FINDING`. |
| **BR-MSS-03** | Bila `hasFinding = false`, semua field karyawan harus kosong. Mengirimnya menghasilkan `VALIDATION_ERROR` — bukan diabaikan diam-diam. |
| **BR-MSS-04** | Bila `hasFinding = false`, wajib ada minimal satu foto berkategori `MESS_CONDITION`. |
| **BR-MSS-05** | Nomor mess yang dipilih harus milik komplek yang dipilih. Divalidasi di server, tidak hanya di dropdown. |
| **BR-MSS-06** | Nama komplek dan nomor kamar disalin ke kolom snapshot saat penyimpanan. Perubahan master data setelahnya tidak mengubah observasi lama. |
| **BR-MSS-07** | `employeeCompany` menerima `PT_PPA`, `PT_AMM`, atau `MITRA_KERJA`. |
| **BR-MSS-08** | `bloodPressure` opsional, berupa teks bebas maksimal 20 karakter. Tidak divalidasi formatnya — paramedis kadang mencatat "tidak terukur" atau "alat rusak". |
| **BR-MSS-09** | Maksimal 3 foto per observasi mess. |

## 6. Observasi Non-Mess

| ID | Aturan |
|---|---|
| **BR-NMS-01** | Seluruh field Bagian 1 dan Bagian 2 wajib kecuali: `respondentEmployeeRef`, `respondentCompanyPosition`, `sleepDisturbancePotential`, `petDetails`, `noiseSource`, `otherSideActivity`. |
| **BR-NMS-02** | `company` hanya menerima `PT_PPA` atau `PT_AMM`. `MITRA_KERJA` tidak berlaku untuk kunjungan rumah. |
| **BR-NMS-03** | `petDetails` wajib bila `hasPet = true`, dan harus kosong bila `false`. |
| **BR-NMS-04** | `noiseSource` wajib bila `hasNoise = true`, dan harus kosong bila `false`. |
| **BR-NMS-05** | `otherSideActivity` wajib bila `sideActivities` memuat `LAINNYA`. |
| **BR-NMS-06** | `childrenCount` tidak boleh melebihi `occupantsCount`. |
| **BR-NMS-07** | `respondentAge` antara 1 dan 120. Responden di bawah 17 tahun memunculkan peringatan di UI ("Pastikan responden cukup umur untuk diwawancarai") tetapi tetap diterima. |
| **BR-NMS-08** | `birthDate` harus di masa lalu dan menghasilkan usia antara 15 dan 70 tahun. |
| **BR-NMS-09** | `roomFacilities` boleh kosong (array kosong) — rumah tanpa fasilitas adalah temuan yang bermakna, bukan kesalahan input. |
| **BR-NMS-10** | Wajib minimal satu foto berkategori `HOME_VISIT`, maksimal 8. |
| **BR-NMS-11** | Nama desa dan kecamatan disalin ke kolom snapshot saat penyimpanan. |
| **BR-NMS-12** | `adminEmail` divalidasi formatnya. Default terisi email paramedis yang login, dan bisa diubah. |

## 7. Foto

| ID | Aturan |
|---|---|
| **BR-PHO-01** | Format diterima: JPEG, PNG, WebP, HEIC. Format lain ditolak dengan 415 dan pesan yang menyebutkan format yang diterima. |
| **BR-PHO-02** | Ukuran maksimal yang diterima server 5 MB per file. Client mengompresi ke target ≤ 500 KB sebelum mengunggah. |
| **BR-PHO-03** | Server mengonversi semua foto ke WebP quality 82 dan menghasilkan thumbnail 320 px. |
| **BR-PHO-04** | Kategori foto harus sesuai tipe observasi: `FINDING` dan `MESS_CONDITION` hanya untuk MESS; `HOME_VISIT` hanya untuk NON_MESS. |
| **BR-PHO-05** | Foto disajikan lewat endpoint ber-guard, bukan sebagai berkas statis publik. Paramedis hanya bisa mengakses foto observasinya sendiri. |
| **BR-PHO-06** | Foto yang tidak terikat ke observasi mana pun selama lebih dari 24 jam dihapus oleh cron harian, beserta berkas fisiknya. |
| **BR-PHO-07** | Foto yang sudah terikat ke observasi terkirim tidak bisa dihapus. |
| **BR-PHO-08** | Metadata EXIF dihapus saat konversi, kecuali orientasi (yang diterapkan lalu dinormalisasi). Data GPS di foto tidak disimpan. |

## 8. Persetujuan

| ID | Aturan |
|---|---|
| **BR-APR-01** | Hanya observasi berstatus `PENDING` yang bisa diproses. |
| **BR-APR-02** | Menolak wajib disertai catatan medis minimal 10 karakter setelah di-trim. Menyetujui boleh tanpa catatan. |
| **BR-APR-03** | Saat keputusan disimpan, `doctorId` diisi dari token dan `approvedAt` diisi waktu server. |
| **BR-APR-04** | Keputusan bersifat final. Tidak ada pembatalan di Fase 1. |
| **BR-APR-05** | Antrean persetujuan diurutkan berdasarkan `createdAt` menaik — yang paling lama menunggu ditangani lebih dulu. |
| **BR-APR-06** | Observasi yang menunggu lebih dari 48 jam ditandai visual di antrean dan dihitung di metrik `over48HoursCount`. |
| **BR-APR-07** | Hanya observasi `APPROVED` yang masuk pelaporan resmi. `PENDING` dan `REJECTED` tetap terlihat di riwayat dan bisa difilter di laporan internal. |

## 9. Sinkronisasi Offline

| ID | Aturan |
|---|---|
| **BR-SYN-01** | Setiap observasi membawa `clientUuid` (UUID v4) yang dibuat di perangkat saat form pertama kali dibuka. Ini kunci idempotensi. |
| **BR-SYN-02** | Server menolak `clientUuid` duplikat dengan 409 dan menyertakan record yang sudah ada. Client memperlakukan 409 sebagai **berhasil** dan menghapus item dari antrean. |
| **BR-SYN-03** | Draft disimpan ke IndexedDB setiap 3 detik selama pengisian. |
| **BR-SYN-04** | Kegagalan jaringan atau 5xx memasukkan item ke antrean untuk dicoba lagi. Kegagalan 4xx selain 409 menandai item `FAILED` dan tidak diulang otomatis. |
| **BR-SYN-05** | Percobaan ulang memakai jeda berjenjang: 5s, 15s, 60s, 5m, 15m. Setelah 5 kali gagal, status jadi `NEEDS_ATTENTION` dan menunggu tindakan pengguna. |
| **BR-SYN-06** | Antrean dikirim berurutan (FIFO), satu per satu, bukan paralel. Mencegah membanjiri jaringan lemah. |
| **BR-SYN-07** | Foto diunggah lebih dulu, baru payload observasi. Bila unggahan foto gagal, seluruh item tetap di antrean. |
| **BR-SYN-08** | Draft dan item antrean berumur lebih dari 14 hari memunculkan peringatan; penghapusan hanya dilakukan setelah pengguna mengonfirmasi. |
| **BR-SYN-09** | Logout tidak menghapus antrean sinkronisasi. Item dikirim setelah pengguna yang sama login kembali di perangkat itu. |
| **BR-SYN-10** | Antrean bersifat per-pengguna di satu perangkat. Login pengguna lain tidak melihat atau mengirim antrean milik pengguna sebelumnya. |

## 10. Jadwal

| ID | Aturan |
|---|---|
| **BR-SCH-01** | Satu paramedis hanya boleh punya satu jadwal per tanggal per shift. |
| **BR-SCH-02** | Jadwal hanya bisa dibuat untuk pengguna berperan Paramedis dan berstatus `ACTIVE`. |
| **BR-SCH-03** | `targetCount` minimal 1. |
| **BR-SCH-04** | `completedCount` dihitung sebagai jumlah observasi paramedis tersebut dengan `observationDate` (Mess) atau tanggal `submittedAt` (Non-Mess) sama dengan `scheduleDate` dan tipe observasi yang sama. |
| **BR-SCH-05** | Jadwal yang tanggalnya sudah lewat dan sudah memiliki observasi terkait tidak bisa dihapus — mengubah denominator KPI historis akan memalsukan laporan. |
| **BR-SCH-06** | Pembuatan massal melewati (skip) tanggal yang sudah punya jadwal bentrok, tanpa menggagalkan seluruh batch, dan melaporkan jumlah yang dilewati. |

## 11. KPI

| ID | Aturan |
|---|---|
| **BR-KPI-01** | Kepatuhan jadwal = `SUM(completedCount) / SUM(targetCount) × 100`, dihitung pada rentang tanggal terpilih, dibulatkan satu desimal. |
| **BR-KPI-02** | Bila `SUM(targetCount) = 0`, kepatuhan ditampilkan sebagai "Tidak ada jadwal", bukan 0% dan bukan error. Membedakan "tidak dijadwalkan" dari "gagal memenuhi jadwal" itu penting. |
| **BR-KPI-03** | `completedCount` dibatasi maksimum `targetCount` untuk perhitungan kepatuhan agregat, sehingga kelebihan di satu hari tidak menutupi kekurangan di hari lain. Jumlah aktual tetap ditampilkan terpisah. |
| **BR-KPI-04** | Angka kunjungan menghitung semua observasi tanpa memandang status persetujuan. Paramedis sudah melakukan pekerjaannya terlepas dari keputusan dokter. |
| **BR-KPI-05** | Tingkat temuan = `observasi mess dengan hasFinding=true / total observasi mess × 100`. Observasi non-mess tidak masuk hitungan ini. |
| **BR-KPI-06** | Waktu tanggap persetujuan = selisih `approvedAt − createdAt`, dihitung hanya untuk observasi yang sudah final. |
| **BR-KPI-07** | Rentang tanggal KPI wajib diisi dan maksimal 12 bulan. |
| **BR-KPI-08** | Paramedis hanya melihat statistik pribadinya, tidak melihat data paramedis lain maupun peringkat. |

## 12. Master Data

| ID | Aturan |
|---|---|
| **BR-MST-01** | Nama komplek mess unik (case-insensitive) di antara yang belum dihapus. |
| **BR-MST-02** | Nomor kamar unik dalam satu komplek. |
| **BR-MST-03** | Master data memakai soft delete. Data yang dirujuk observasi tidak pernah benar-benar dihapus. |
| **BR-MST-04** | Komplek yang masih punya kamar aktif tidak bisa dinonaktifkan sebelum kamarnya ditangani. |
| **BR-MST-05** | Master data nonaktif tidak muncul di dropdown form baru, tetapi tetap tampil pada observasi lama. |
| **BR-MST-06** | Kombinasi desa + kecamatan pada lokasi observasi harus unik. |

## 13. Laporan

| ID | Aturan |
|---|---|
| **BR-RPT-01** | Rentang tanggal wajib diisi, maksimal 12 bulan per laporan. |
| **BR-RPT-02** | Laporan menghormati scope role: Paramedis tidak bisa membuat laporan sama sekali. |
| **BR-RPT-03** | Laporan lebih dari 200 baris diproses asinkron dan menghasilkan tautan unduhan. |
| **BR-RPT-04** | Berkas laporan disimpan 24 jam lalu dihapus. |
| **BR-RPT-05** | Laporan mencantumkan filter yang dipakai, waktu pembuatan, dan nama pembuatnya di header — agar dokumen cetak bisa diverifikasi asalnya. |
| **BR-RPT-06** | Laporan yang tidak menghasilkan baris apa pun tidak menghasilkan berkas. UI menampilkan pesan untuk mengubah filter. |

## 14. Audit

| ID | Aturan |
|---|---|
| **BR-AUD-01** | Aksi berikut wajib tercatat: login, login gagal, logout, buat/ubah/hapus/nonaktifkan pengguna, reset password, ganti password, buat observasi, setujui/tolak observasi, CRUD jadwal, CRUD master data, buat laporan. |
| **BR-AUD-02** | Audit ditulis dalam transaksi yang sama dengan perubahan datanya. Gagal menulis audit membatalkan operasi. |
| **BR-AUD-03** | Audit log bersifat append-only. Tidak ada endpoint untuk mengubah atau menghapusnya, dan database menegakkan ini lewat rule. |
| **BR-AUD-04** | Log menyimpan nama aktor sebagai snapshot, sehingga tetap terbaca setelah pengguna dihapus. |
| **BR-AUD-05** | Kolom `before`/`after` tidak pernah memuat hash password, token, atau password mentah. |
| **BR-AUD-06** | Audit log disimpan 24 bulan, lalu diarsipkan ke berkas dan barisnya dihapus. |

---

## 15. Aturan yang Sengaja Tidak Ditetapkan

Hal-hal yang mungkin ditanyakan tetapi belum diputuskan. **Jangan berimprovisasi** — tanyakan lebih dulu.

| Pertanyaan terbuka | Catatan |
|---|---|
| Apakah observasi bisa dibatalkan setelah disetujui? | Tidak di Fase 1. Kandidat Fase 3 (T-216). |
| Apakah paramedis bisa mengoreksi observasi yang ditolak? | Saat ini membuat observasi baru. Perlu keputusan apakah keduanya perlu ditautkan. |
| Berapa lama data karyawan yang sudah resign disimpan? | Belum ditentukan; tidak ada data kepegawaian yang di-track sistem ini. |
| Apakah dokter perlu ditugaskan ke wilayah/komplek tertentu? | Saat ini semua dokter melihat semua observasi. |
| Apakah ada eskalasi otomatis untuk approval yang menumpuk? | Belum. Hanya penanda visual di antrean. |
| Apakah temuan berulang pada karyawan yang sama perlu ditandai? | Kandidat Fase 3 (T-217), butuh keputusan tentang pencocokan identitas karyawan. |
