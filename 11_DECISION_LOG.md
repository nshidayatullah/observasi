# 11 — Decision Log

> Catatan keputusan arsitektur (ADR). Setiap keputusan yang sulit dibalik, memakan biaya, atau kemungkinan akan dipertanyakan enam bulan lagi dicatat di sini.
>
> Tujuannya bukan mendokumentasikan apa yang dibangun — itu tugas dokumen lain. Tujuannya mencatat **mengapa**, dan **apa yang sudah dipertimbangkan lalu ditolak**, supaya tidak ada yang mengulang diskusi yang sama tanpa informasi yang sama.

---

## Format

Setiap ADR memuat: **Konteks** (situasi yang memaksa keputusan) · **Keputusan** (apa yang dipilih) · **Alternatif** (yang ditolak dan alasannya) · **Konsekuensi** (harga yang dibayar) · **Kapan ditinjau ulang**.

**Status:** `Diusulkan` · `Diterima` · `Digantikan oleh ADR-xxx` · `Usang`

Menambah ADR baru: nomor berurutan, jangan menomori ulang, jangan menghapus ADR lama. ADR yang salah tetap disimpan dengan status `Digantikan` — riwayat kesalahan sama bergunanya dengan riwayat keberhasilan.

---

## ADR-001 — Tabel observasi dipisah, bukan satu tabel dengan kolom kondisional

**Status:** Diterima · 2026-07-31

**Konteks**
Form Observasi Mess punya 14 field. Form Non-Mess punya 36 field. Yang beririsan hanya `paramedicId`, `status`, `doctorId`, `doctorNotes`, `approvedAt`, dan timestamp. Keduanya berbagi alur persetujuan yang sama tetapi tidak berbagi isi.

**Keputusan**
Dua tabel terpisah: `mess_observations` dan `non_mess_observations`. Query gabungan dilayani lewat view `v_observations_summary`.

**Alternatif yang ditolak**

*Satu tabel `observations` dengan kolom `type` dan semua kolom nullable.* Menghasilkan tabel dengan ~50 kolom yang mayoritas NULL di setiap baris. Constraint kondisional menjadi CHECK raksasa yang sulit dibaca. Menambah field ke satu form berisiko memengaruhi yang lain. Index tidak efisien karena selektivitasnya rendah.

*Satu tabel inti + tabel detail per tipe (class table inheritance).* Setiap pembacaan butuh JOIN, setiap penulisan butuh transaksi dua tabel. Kerumitan ini terbayar jika ada lebih dari dua tipe atau banyak field bersama. Di sini tidak ada.

*EAV (entity–attribute–value).* Fleksibel, tetapi mematikan type safety Prisma, membuat validasi jadi runtime-only, dan membuat laporan agregat menyakitkan. Fleksibilitas yang tidak dibutuhkan.

**Konsekuensi**
- Riwayat, KPI, dan laporan perlu UNION atau agregasi ganda.
- Tabel `observation_photos` butuh dua FK nullable dengan CHECK constraint.
- Menambah tipe observasi ketiga berarti menambah tabel ketiga — pola ini tidak menskala melewati 3–4 tipe.

**Ditinjau ulang bila:** muncul tipe observasi ketiga, atau view gabungan menjadi hambatan performa di atas ~100 ribu baris.

---

## ADR-002 — Foto disimpan di tabel terpisah, bukan kolom URL

**Status:** Diterima · 2026-07-31

**Konteks**
PRD awal menyimpan foto sebagai kolom string (`photo_finding_url`, `photo_mess_url`, `photo_documentation_url`). Form Non-Mess sudah butuh multi-foto sejak awal.

**Keputusan**
Tabel `observation_photos` dengan kategori, thumbnail, metadata ukuran, dan urutan.

**Alternatif yang ditolak**

*Kolom string berisi JSON array URL.* Tidak bisa diindeks, tidak bisa di-JOIN, dan metadata (ukuran, MIME, urutan) harus disimpan di dalam JSON tanpa validasi struktural.

*Kolom terpisah `photo_1_url`, `photo_2_url`, `photo_3_url`.* Membatasi jumlah foto secara struktural dan membuat penghapusan foto tengah jadi canggung.

**Konsekuensi**
- Butuh alur unggah dua tahap: unggah foto → dapat ID → sertakan ID di payload observasi.
- Perlu cron pembersih foto yatim (BR-PHO-06).
- Detail observasi butuh query tambahan atau `include`.

**Ditinjau ulang bila:** tidak ada rencana peninjauan; keputusan ini rendah risiko.

---

## ADR-003 — `clientUuid` sebagai kunci idempotensi untuk sinkronisasi offline

**Status:** Diterima · 2026-07-31

**Konteks**
Paramedis bekerja di area bersinyal lemah. Skenario yang pasti terjadi: form dikirim, server memproses dan menyimpan, respons tidak sampai ke perangkat karena koneksi putus, client mengira gagal, lalu mencoba ulang. Tanpa pencegahan, satu observasi tercatat dua kali. Duplikat pada catatan medis-administratif adalah kerusakan data yang serius — ia membengkakkan angka KPI dan menciptakan antrean persetujuan palsu.

**Keputusan**
Client membuat UUID v4 saat form pertama kali dibuka dan mengirimkannya di setiap percobaan. Kolom `client_uuid` unik di database. Percobaan kedua dengan UUID sama menerima 409 beserta record yang sudah ada; client memperlakukannya sebagai berhasil.

**Alternatif yang ditolak**

*Deduplikasi berbasis kemiripan field (paramedis + tanggal + lokasi).* Ambigu. Dua sidak sah pada kamar yang sama di tanggal yang sama (shift berbeda) akan salah ditolak. Sistem tidak boleh menebak-nebak niat pengguna.

*Header `Idempotency-Key` standar dengan tabel kunci terpisah.* Pola yang baik untuk API pembayaran, tetapi menambah tabel dan masa berlaku kunci yang harus dikelola. Di sini `clientUuid` sekaligus berguna sebagai pengenal draft di sisi client — satu konsep melayani dua kebutuhan.

*Mengandalkan retry yang aman di sisi client saja.* Tidak cukup. Perangkat bisa mati, aplikasi bisa ditutup paksa, pengguna bisa menekan Kirim dua kali.

**Konsekuensi**
- Client wajib membuat dan menyimpan UUID sejak form dibuka, bukan saat pengiriman.
- 409 menjadi respons sukses secara semantik, yang berlawanan dengan intuisi dan wajib didokumentasikan jelas di 04_API_CONTRACT §4.
- Perlu test khusus (T-149) yang memverifikasi pengiriman ganda hanya menghasilkan satu record.

**Ditinjau ulang bila:** tidak direncanakan; ini fondasi kebenaran data.

---

## ADR-004 — Refresh token disimpan di tabel terpisah, dengan rotasi

**Status:** Diterima · 2026-07-31

**Konteks**
PRD awal menyimpan satu `refresh_token_hash` di tabel `users`. Artinya satu pengguna hanya bisa punya satu sesi — login di perangkat baru mematikan sesi lama. Untuk paramedis yang mungkin pakai ponsel pribadi dan ponsel dinas, ini mengganggu. Lebih buruk lagi: sesi yang mati diam-diam bisa menyebabkan draft offline hilang.

**Keputusan**
Tabel `refresh_tokens` (satu baris per sesi) dengan rotasi setiap pemakaian dan deteksi pemakaian ulang token yang sudah dicabut.

**Alternatif yang ditolak**

*Satu kolom hash di tabel users.* Membatasi satu sesi. Tidak bisa mencabut sesi tertentu.

*Refresh token stateless (JWT tanpa penyimpanan).* Tidak bisa dicabut sebelum kedaluwarsa. Tidak dapat diterima ketika Superadmin menonaktifkan pengguna — akun nonaktif harus langsung kehilangan akses (BR-USR-07).

*Menyimpan token mentah, bukan hash.* Kebocoran database langsung berarti kebocoran seluruh sesi.

**Konsekuensi**
- Butuh cron pembersih token kedaluwarsa (T-134).
- Setiap refresh melakukan penulisan database, bukan hanya verifikasi tanda tangan.
- Deteksi pemakaian ulang bisa memicu pencabutan seluruh sesi pada kasus yang sebenarnya jinak (misal dua tab me-refresh bersamaan). Dimitigasi dengan menyerialkan permintaan refresh di client (T-140).

---

## ADR-005 — Frontend dibangun lebih dulu dengan data mock, sebelum kontrak API dikunci

**Status:** Diterima · 2026-07-31

**Konteks**
Urutan konvensional adalah merancang API lalu membangun UI di atasnya. Pada proyek berbasis formulir seperti ini, bentuk data yang benar-benar dibutuhkan layar baru terlihat setelah layarnya ada. Contoh nyata: baru setelah membangun antrean persetujuan terlihat bahwa dokter butuh `oldestPendingAt` dan lama menunggu per item — kebutuhan yang tidak muncul saat merancang skema database.

**Keputusan**
Fase 3 membangun seluruh UI dengan MSW dan fixture. Fase 4 mengunci kontrak API berdasarkan apa yang ternyata dibutuhkan layar.

**Alternatif yang ditolak**

*API dulu, lalu UI.* Menghasilkan endpoint yang tidak dipakai dan field yang kurang, ditambah ronde revisi kontrak setelah UI dibangun — persis yang ingin dihindari.

*Frontend dan backend paralel dengan kontrak disepakati di awal.* Cocok bila ada dua tim. Di sini pengerjaannya berurutan, sehingga paralelisasi tidak memberi keuntungan tetapi tetap membawa biaya koordinasinya.

**Konsekuensi**
- Ada pekerjaan yang terbuang: handler MSW dibuang setelah integrasi.
- Backend baru dimulai relatif terlambat dalam kalender proyek.
- Menuntut disiplin: MSW harus jujur mensimulasikan latensi, error, dan kondisi offline — bukan hanya mengembalikan data ideal. Mock yang terlalu ramah menyembunyikan bug integrasi.

---

## ADR-006 — Foto disajikan lewat endpoint ber-guard, bukan berkas statis

**Status:** Diterima · 2026-07-31

**Konteks**
Foto memuat wajah karyawan, kondisi kamar tidur, dan interior rumah pribadi beserta keluarganya. Menyajikannya sebagai berkas statis di `/uploads/...` berarti siapa pun yang punya URL bisa membukanya tanpa login.

**Keputusan**
`GET /api/v1/photos/:id` dengan pemeriksaan JWT dan scope role. Nama berkas memakai UUID, dan direktori tidak terekspos oleh Nginx.

**Alternatif yang ditolak**

*Berkas statis dengan nama acak (security through obscurity).* URL bocor lewat riwayat browser, log proxy, dan berbagi tautan. Tidak bisa dicabut.

*Signed URL berbatas waktu.* Aman dan lebih hemat sumber daya server, tetapi memperumit caching offline PWA: URL bertanda tangan kedaluwarsa sementara service worker menyimpannya. Kandidat untuk nanti bila beban penyajian jadi masalah.

*Object storage eksternal (S3/MinIO) dengan akses privat.* Menambah satu komponen infrastruktur pada penerapan single-server. Ditunda sampai volume menuntutnya.

**Konsekuensi**
- Setiap pemuatan foto membebani backend Node, bukan Nginx.
- Perlu header cache yang tepat (`private, max-age=86400`) agar galeri tidak lambat.
- Service worker perlu menangani permintaan foto ber-autentikasi saat offline — foto observasi yang belum tersinkron dilayani dari IndexedDB, bukan jaringan.

**Ditinjau ulang bila:** penyajian foto menjadi hambatan performa, atau jumlah foto melampaui kapasitas disk server tunggal.

---

## ADR-007 — Password sementara ditampilkan sekali di layar bila SMTP belum tersedia

**Status:** Diusulkan · menunggu konfirmasi ketersediaan SMTP (T-014)

**Konteks**
PRD mengasumsikan email undangan otomatis. Ketersediaan SMTP di lingkungan perusahaan belum dipastikan saat dokumen ini ditulis. Manajemen pengguna adalah prasyarat semua alur lain — pengujian tidak bisa dimulai tanpa cara membuat akun.

**Keputusan**
Bila SMTP tidak tersedia saat MVP, `POST /users` dan `POST /users/:id/reset-password` mengembalikan password sementara **satu kali** di respons. Frontend menampilkannya dalam dialog yang menuntut Superadmin menyalinnya sebelum menutup. Password tidak pernah bisa dilihat lagi, tidak disimpan di mana pun dalam bentuk mentah, dan tidak masuk audit log.

**Alternatif yang ditolak**

*Menunda seluruh manajemen pengguna sampai SMTP siap.* Memblokir jalur kritis proyek karena ketergantungan yang di luar kendali tim.

*Password default seragam untuk semua pengguna baru.* Berbahaya, dan kebiasaannya bertahan lama setelah alasannya hilang.

*Tautan aktivasi lewat WhatsApp.* Menambah integrasi pihak ketiga dan memindahkan kredensial ke saluran yang tidak dikendalikan perusahaan.

**Konsekuensi**
- Superadmin harus menyampaikan password lewat saluran lain, dengan risiko sosial yang menyertainya.
- `forcePasswordChange` menjadi pengaman utama: password sementara hanya berlaku untuk satu kali login.
- Perlu diganti dengan email begitu SMTP tersedia (T-211). Endpoint dirancang agar `temporaryPassword` cukup dihilangkan dari respons saat `emailSent = true` — tanpa mengubah bentuk API.

---

## ADR-008 — Mode gelap wajib, bukan fitur tambahan

**Status:** Diterima · 2026-07-31

**Konteks**
Sidak mess dilakukan pada jam istirahat, artinya malam hari, di koridor gelap, di dekat orang yang sedang tidur. Layar putih terang menyilaukan paramedis dan berisiko membangunkan karyawan — yang secara langsung merusak hal yang sedang diobservasi.

**Keputusan**
Mode gelap dibangun bersamaan dengan mode terang sejak Fase 3, bukan ditambahkan belakangan. Token warna didefinisikan untuk kedua mode sejak awal. Mengikuti preferensi sistem, dengan toggle manual di Profil.

**Alternatif yang ditolak**

*Menambahkan mode gelap di Fase 3 polish.* Menambahkan tema setelah puluhan komponen ditulis berarti memburu warna hardcoded di seluruh basis kode. Jauh lebih mahal daripada mendisiplinkan token sejak awal.

*Hanya mode gelap.* Kunjungan rumah dilakukan siang hari di bawah matahari langsung, di mana mode terang lebih terbaca.

**Konsekuensi**
- Tidak boleh ada nilai warna literal di komponen mana pun. Ditegakkan lewat review (T-180).
- Setiap layar diperiksa kontrasnya di kedua mode (T-175).

---

## ADR-009 — Superadmin tidak bisa menyetujui observasi

**Status:** Diterima · 2026-07-31

**Konteks**
Superadmin memiliki hak penuh atas semua data administratif. Godaan naturalnya adalah memberi hak persetujuan juga, dengan alasan "administrator bisa melakukan segalanya" dan agar antrean tidak macet saat dokter tidak tersedia.

**Keputusan**
Persetujuan observasi hanya bisa dilakukan role Dokter. Superadmin bisa melihat semuanya, tetapi tidak bisa memutuskan.

**Alternatif yang ditolak**

*Superadmin bisa menyetujui.* Persetujuan di sini adalah penilaian medis atas temuan kesehatan dan kelayakan istirahat, bukan tindakan administratif. Kewenangan sistem tidak boleh dikonversi menjadi kewenangan klinis. Bila antrean macet karena dokter berhalangan, jawabannya adalah menambah akun dokter, bukan melemahkan pemisahan peran.

*Superadmin bisa menyetujui dengan penandaan khusus.* Menciptakan dua kelas persetujuan dalam data dan pertanyaan tentang mana yang sah dalam laporan.

**Konsekuensi**
- Sistem membutuhkan minimal satu akun Dokter aktif agar alur berjalan.
- Superadmin yang juga dokter memerlukan dua akun terpisah. Ini disengaja: tindakan yang berbeda sifatnya sebaiknya meninggalkan jejak yang berbeda.

---

## Catatan Keputusan Kecil

Keputusan yang tidak perlu ADR penuh, tetapi perlu dicatat agar tidak dipertanyakan berulang.

| Tanggal | Keputusan | Alasan singkat |
|---|---|---|
| 2026-07-31 | Enum sebagai const object, bukan `enum` TypeScript | `enum` TypeScript menghasilkan runtime code dan tidak kompatibel dengan `isolatedModules` |
| 2026-07-31 | Bahasa kode Inggris, teks pengguna Indonesia | Konsistensi dengan pustaka dan dokumentasi; mencegah penamaan campur |
| 2026-07-31 | Zona waktu server UTC, presentasi WITA | Menghindari ambiguitas penyimpanan; konversi hanya di satu lapis |
| 2026-07-31 | `observationDate` bertipe DATE tanpa waktu | Tanggal sidak adalah tanggal kalender, bukan momen; imun terhadap pergeseran zona |
| 2026-07-31 | IBM Plex sebagai keluarga tipografi | Cakupan diakritik lengkap, varian condensed untuk label panjang, varian mono untuk NIK dan tekanan darah |
| 2026-07-31 | Dexie sebagai pembungkus IndexedDB | API IndexedDB mentah verbose dan rawan salah pada penanganan transaksi |
| 2026-07-31 | Tabel jadi kartu di bawah `lg`, bukan gulir horizontal | Tabel bergulir horizontal praktis tidak terpakai di ponsel |
| 2026-07-31 | 409 pada `clientUuid` duplikat diperlakukan sebagai sukses oleh client | Konsekuensi langsung ADR-003 |
| 2026-07-31 | Tidak ada geotagging lokasi paramedis | Di luar lingkup; menimbulkan pertanyaan privasi pekerja yang belum dibahas |

---

## Keputusan yang Ditunda

| Pertanyaan | Kapan perlu diputuskan |
|---|---|
| Object storage eksternal untuk foto | Saat pemakaian disk server melewati 60% |
| Antrean job (BullMQ) untuk laporan PDF | Saat laporan rutin melampaui 500 baris atau bersamaan |
| Materialized view untuk `v_observations_summary` | Saat daftar observasi melewati p95 500 ms |
| Notifikasi push (Web Push) | Setelah notifikasi in-app terbukti kurang memadai |
| Pemisahan lingkungan staging | Sebelum rilis versi 1.1.0 |
