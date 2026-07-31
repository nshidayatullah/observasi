# 04 — API Contract

> REST API NestJS 11. Base URL: `/api/v1`
> Dikunci setelah frontend mock selesai (fase 4 dari alur kerja). Perubahan setelah ini wajib lewat entri di 11_DECISION_LOG.md.

---

## 1. Ketentuan Umum

| Aspek | Ketentuan |
|---|---|
| Format | JSON, `Content-Type: application/json` (kecuali upload: `multipart/form-data`) |
| Penamaan field | `camelCase` |
| Tanggal | ISO 8601 UTC (`2026-07-31T09:12:00.000Z`); `observationDate` format `YYYY-MM-DD` |
| Autentikasi | `Authorization: Bearer <accessToken>` di semua endpoint kecuali yang ditandai publik |
| Versi | Prefiks path `/api/v1` |
| Validasi | `class-validator` di DTO, `ValidationPipe` global dengan `whitelist: true, forbidNonWhitelisted: true` |
| Rate limit | 5 req/menit untuk `/auth/login`; 100 req/menit untuk endpoint lain per IP |
| CORS | Hanya origin frontend yang terdaftar di env `CORS_ORIGINS` |
| Maks body | 10 MB (upload foto) |

### 1.1 Format Respons Sukses

Objek tunggal:
```json
{ "data": { "id": 12, "name": "..." } }
```

Daftar berpaginasi:
```json
{
  "data": [ { "id": 12 } ],
  "meta": { "page": 1, "perPage": 25, "total": 137, "totalPages": 6 }
}
```

Aksi tanpa kembalian:
```json
{ "data": { "success": true } }
```

### 1.2 Format Respons Error

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data yang dikirim tidak valid.",
    "details": [
      { "field": "email", "message": "Format email tidak valid." },
      { "field": "employeeNik", "message": "NIK wajib diisi karena ada temuan." }
    ]
  }
}
```

`message` selalu dalam Bahasa Indonesia dan aman ditampilkan langsung ke pengguna. `details` hanya ada untuk error validasi.

### 1.3 Kode Error

| HTTP | `code` | Kapan |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Payload gagal validasi |
| 400 | `INVALID_STATE_TRANSITION` | Misal menyetujui observasi yang sudah final |
| 401 | `UNAUTHENTICATED` | Token hilang, invalid, atau kedaluwarsa |
| 401 | `INVALID_CREDENTIALS` | Email/password salah |
| 403 | `FORBIDDEN` | Role tidak punya izin |
| 403 | `ACCOUNT_INACTIVE` | Akun dinonaktifkan |
| 403 | `ACCOUNT_LOCKED` | Akun terkunci sementara |
| 403 | `PASSWORD_CHANGE_REQUIRED` | `forcePasswordChange` masih true |
| 404 | `NOT_FOUND` | Resource tidak ada atau di luar scope pengguna |
| 409 | `DUPLICATE_CLIENT_UUID` | Observasi dengan `clientUuid` sama sudah ada |
| 409 | `EMAIL_ALREADY_EXISTS` | Email sudah dipakai |
| 409 | `RESOURCE_IN_USE` | Menghapus data yang masih dirujuk |
| 413 | `PAYLOAD_TOO_LARGE` | File melebihi batas |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | Format file tidak didukung |
| 429 | `TOO_MANY_REQUESTS` | Rate limit terlampaui |
| 500 | `INTERNAL_ERROR` | Kesalahan tak terduga (detail tidak dibocorkan ke client) |

### 1.4 Parameter Query Standar

| Param | Tipe | Default | Keterangan |
|---|---|---|---|
| `page` | int | 1 | Nomor halaman |
| `perPage` | int | 25 | 10 / 25 / 50 / 100 |
| `sort` | string | per endpoint | Contoh `createdAt:desc` |
| `q` | string | — | Pencarian teks bebas |

---

## 2. Auth — `/api/v1/auth`

### POST `/auth/login` — Publik

```json
{ "email": "suryani@example.com", "password": "rahasia123" }
```

**200**
```json
{
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "expiresIn": 3600,
    "user": {
      "id": 4,
      "name": "Muhammad Suryani",
      "email": "suryani@example.com",
      "role": "PARAMEDIC",
      "forcePasswordChange": false
    }
  }
}
```

**401** `INVALID_CREDENTIALS` — pesan generik "Email atau password salah."
**403** `ACCOUNT_LOCKED` — sertakan `details: [{ field: "lockedUntil", message: "Coba lagi dalam 12 menit." }]`
**403** `ACCOUNT_INACTIVE`

Efek samping: reset `failedLoginAttempts`, set `lastLoginAt`, buat baris `refresh_tokens`, tulis audit `LOGIN`.

### POST `/auth/refresh` — Publik

```json
{ "refreshToken": "eyJhbGci..." }
```

**200** — struktur sama dengan login. Refresh token lama dicabut dan diganti baru (rotasi). Jika refresh token yang sudah dicabut dipakai lagi, **semua** sesi pengguna dicabut dan respons 401 — indikasi token dicuri.

### POST `/auth/logout`

Body: `{ "refreshToken": "..." }` · **200** `{ "data": { "success": true } }`
Mencabut satu refresh token. Audit `LOGOUT`.

### GET `/auth/me`

**200**
```json
{
  "data": {
    "id": 4, "name": "Muhammad Suryani", "email": "suryani@example.com",
    "role": "PARAMEDIC", "status": "ACTIVE",
    "forcePasswordChange": false, "lastLoginAt": "2026-07-31T01:20:00.000Z"
  }
}
```

### POST `/auth/change-password`

```json
{ "currentPassword": "lama123", "newPassword": "baru12345", "confirmPassword": "baru12345" }
```

**200** `{ "data": { "success": true } }` — semua refresh token lain dicabut, `forcePasswordChange` jadi false, `passwordChangedAt` diperbarui, audit `CHANGE_PASSWORD`.
**400** `VALIDATION_ERROR` jika password baru < 8 karakter, tidak mengandung huruf+angka, sama dengan password lama, atau konfirmasi tidak cocok.

---

## 3. Users — `/api/v1/users` — Superadmin

### GET `/users`

Query: `q`, `role`, `status`, `page`, `perPage`, `sort` (default `createdAt:desc`)

**200**
```json
{
  "data": [{
    "id": 4, "name": "Muhammad Suryani", "email": "suryani@example.com",
    "role": "PARAMEDIC", "status": "ACTIVE",
    "lastLoginAt": "2026-07-31T01:20:00.000Z",
    "observationCount": 47, "canDelete": false,
    "createdAt": "2026-05-02T03:00:00.000Z"
  }],
  "meta": { "page": 1, "perPage": 25, "total": 12, "totalPages": 1 }
}
```

`canDelete` dihitung server (false jika punya observasi atau jadwal) agar frontend tidak menebak.

### GET `/users/:id` · **200** objek user + `observationCount`, `scheduleCount`

### POST `/users`

```json
{
  "name": "Agung Priambara",
  "email": "agung@example.com",
  "role": "DOCTOR",
  "temporaryPassword": null
}
```

`temporaryPassword` opsional. Jika null, server generate 12 karakter acak.

**201**
```json
{
  "data": {
    "id": 9, "name": "Agung Priambara", "email": "agung@example.com",
    "role": "DOCTOR", "status": "ACTIVE",
    "temporaryPassword": "Kx7mQp2nRw4t",
    "emailSent": false
  }
}
```

`temporaryPassword` **hanya dikembalikan sekali di respons ini** dan hanya jika `emailSent = false`. Frontend wajib menampilkannya dalam dialog yang mengharuskan Superadmin menyalin sebelum menutup.

**409** `EMAIL_ALREADY_EXISTS`

### PATCH `/users/:id`

Body parsial: `name`, `email`, `role`, `status`.
**200** objek user terbaru.
**403** `FORBIDDEN` jika Superadmin mengubah role/status akunnya sendiri, atau jika perubahan menyisakan nol Superadmin aktif.

Efek samping: mengubah `role` atau menonaktifkan akun akan mencabut semua refresh token pengguna tersebut.

### POST `/users/:id/reset-password`

**200**
```json
{ "data": { "temporaryPassword": "Zt3vBn8kLc1q", "emailSent": false } }
```
Set `forcePasswordChange = true`, cabut semua sesi, audit `RESET_PASSWORD`.

### DELETE `/users/:id`

**200** `{ "data": { "success": true } }`
**409** `RESOURCE_IN_USE` — pesan: "Pengguna ini sudah memiliki data observasi. Nonaktifkan saja, jangan dihapus."

### GET `/users/paramedics` — Paramedis, Dokter, Superadmin

Daftar ringkas paramedis aktif untuk dropdown "Petugas Observasi".

**200** `{ "data": [{ "id": 4, "name": "Muhammad Suryani" }] }`

---

## 4. Observasi Mess — `/api/v1/observations/mess`

### POST `/observations/mess` — Paramedis

`Content-Type: application/json`

```json
{
  "clientUuid": "3f1c0e2a-5b6d-4e7f-8a90-1b2c3d4e5f60",
  "observationDate": "2026-07-31",
  "messComplexId": 1,
  "messRoomId": 7,
  "paramedicId": 4,
  "hasFinding": true,
  "submittedAt": "2026-07-31T02:15:00.000Z",
  "employeeName": "Budi Santoso",
  "employeeNik": "PPA-004512",
  "employeeCompany": "PT_PPA",
  "employeePosition": "Operator HD",
  "employeeDept": "Production",
  "bloodPressure": "130/85 mmHg",
  "activityDesc": "Bermain game di ponsel",
  "reasonNotSleep": "Belum mengantuk, baru pulang dari warung",
  "photoIds": [88, 89]
}
```

Aturan:
- `paramedicId` boleh dikirim, tapi server **mengabaikannya** dan selalu memakai id dari token. Field ini ada agar payload offline tetap lengkap untuk keperluan debugging.
- Jika `hasFinding = false`, semua field karyawan harus **tidak dikirim** atau bernilai null; mengirimnya menghasilkan `VALIDATION_ERROR`.
- `photoIds` merujuk foto yang sudah diunggah lebih dulu lewat `POST /photos` (lihat §7).
- `submittedAt` diisi client — waktu pengguna menekan Kirim, bukan waktu server menerima. Penting untuk data offline.

**201**
```json
{
  "data": {
    "id": 154,
    "clientUuid": "3f1c0e2a-...",
    "type": "MESS",
    "status": "PENDING",
    "createdAt": "2026-07-31T02:47:00.000Z"
  }
}
```

**409** `DUPLICATE_CLIENT_UUID`
```json
{
  "error": {
    "code": "DUPLICATE_CLIENT_UUID",
    "message": "Observasi ini sudah pernah terkirim.",
    "existing": { "id": 154, "type": "MESS", "status": "PENDING" }
  }
}
```
Client memperlakukan ini sebagai **sukses** dan menghapus item dari antrean.

### GET `/observations/mess/:id`

Scope: Paramedis hanya miliknya sendiri; Dokter & Superadmin semua.

**200**
```json
{
  "data": {
    "id": 154,
    "clientUuid": "3f1c0e2a-...",
    "observationDate": "2026-07-31",
    "messComplex": { "id": 1, "name": "Mess A" },
    "messRoom": { "id": 7, "roomNumber": "7" },
    "paramedic": { "id": 4, "name": "Muhammad Suryani" },
    "hasFinding": true,
    "employeeName": "Budi Santoso",
    "employeeNik": "PPA-004512",
    "employeeCompany": "PT_PPA",
    "employeePosition": "Operator HD",
    "employeeDept": "Production",
    "bloodPressure": "130/85 mmHg",
    "activityDesc": "Bermain game di ponsel",
    "reasonNotSleep": "Belum mengantuk, baru pulang dari warung",
    "photos": [
      { "id": 88, "category": "FINDING", "url": "/api/v1/photos/88",
        "thumbnailUrl": "/api/v1/photos/88?size=thumb" }
    ],
    "status": "PENDING",
    "doctor": null,
    "doctorNotes": null,
    "approvedAt": null,
    "submittedAt": "2026-07-31T02:15:00.000Z",
    "createdAt": "2026-07-31T02:47:00.000Z"
  }
}
```

**404** `NOT_FOUND` juga dikembalikan saat record ada tapi di luar scope — jangan bocorkan keberadaannya.

---

## 5. Observasi Non-Mess — `/api/v1/observations/non-mess`

### POST `/observations/non-mess` — Paramedis

```json
{
  "clientUuid": "9a8b7c6d-5e4f-4321-9876-0a1b2c3d4e5f",
  "submittedAt": "2026-07-31T06:40:00.000Z",
  "adminEmail": "suryani@example.com",

  "employeeName": "Rudi Hartono",
  "employeeNrp": "AMM-11238",
  "birthDate": "1991-04-17",
  "maritalStatus": "MENIKAH",
  "workingPeriod": "6 tahun",
  "position": "Operator DT",
  "department": "Hauling",
  "company": "PT_AMM",

  "lengthOfStayOutside": "3 tahun",
  "occupantsCount": 4,
  "relationshipWithOccupants": ["ISTRI", "ANAK"],
  "childrenCount": 2,
  "homeAddress": "Jl. Melati No. 21, RT 03, Desa Satui",

  "workShift": "MALAM",
  "isSleeping": false,

  "roomFacilities": ["AC", "VENTILASI", "KASUR_LAYAK"],
  "hasPet": true,
  "petDetails": "Ayam peliharaan di belakang rumah",
  "sideActivities": ["BERKEBUN"],
  "otherSideActivity": null,
  "cleanlinessLevel": "CUKUP",
  "hasNoise": true,
  "noiseSource": "Bengkel las tetangga, aktif siang hari",
  "sleepDisturbancePotential": "Anak bermain di ruang tengah saat siang",

  "respondentName": "Siti Aminah",
  "respondentAge": 34,
  "respondentEducation": "SMA",
  "respondentEmployeeRef": "Rudi Hartono",
  "respondentCompanyPosition": null,
  "relationToEmployee": "ISTRI",
  "fatigueKnowledge": "Kelelahan yang membuat suami sulit fokus saat kerja",
  "familyPreventionRole": "Menjaga anak tetap tenang saat suami tidur siang",
  "fatigueRiskPerspective": "Bisa menyebabkan kecelakaan di jalan tambang",
  "fatigueCauses": "Kurang tidur karena bengkel tetangga berisik",

  "locationId": 3,
  "photoIds": [90, 91, 92]
}
```

**Nilai enum yang diterima**

| Field | Nilai |
|---|---|
| `maritalStatus` | `LAJANG`, `MENIKAH`, `DUDA` |
| `company` | `PT_PPA`, `PT_AMM` (Non-Mess tidak menerima `MITRA_KERJA`) |
| `relationshipWithOccupants` | array dari `ISTRI`, `ANAK`, `ORANG_TUA`, `MERTUA`, `LAINNYA` |
| `workShift` | `SIANG`, `MALAM`, `OFF`, `OVERSHIFT`, `CUTI` |
| `roomFacilities` | array dari `AC`, `KIPAS_ANGIN`, `VENTILASI`, `KASUR_LAYAK` |
| `sideActivities` | array dari `MENJAGA_TOKO`, `BERKEBUN`, `TERNAK`, `OJEK_ONLINE`, `LAINNYA` |
| `cleanlinessLevel` | `BERSIH_RAPI`, `CUKUP`, `KURANG_RAPI` |
| `respondentEducation` | `SD`, `SMP`, `SMA`, `DIPLOMA`, `SARJANA` |
| `relationToEmployee` | `ISTRI`, `IBU`, `AYAH`, `ANAK`, `SAUDARA_KANDUNG`, `LAINNYA` |

Aturan kondisional:
- `petDetails` wajib jika `hasPet = true`
- `noiseSource` wajib jika `hasNoise = true`
- `otherSideActivity` wajib jika `sideActivities` memuat `LAINNYA`
- `childrenCount` tidak boleh melebihi `occupantsCount`

**201** — struktur sama dengan Mess, `type: "NON_MESS"`.

### GET `/observations/non-mess/:id`

Mengembalikan seluruh field di atas dalam bentuk ter-resolve (`location: { id, village, district }`, `paramedic: { id, name }`, `photos: [...]`, `doctor`, `doctorNotes`, `status`).

---

## 6. Daftar & Persetujuan Observasi — `/api/v1/observations`

### GET `/observations`

Daftar gabungan kedua tipe (dari view `v_observations_summary`).

Query:

| Param | Nilai |
|---|---|
| `type` | `MESS`, `NON_MESS`, kosong = semua |
| `status` | `PENDING`, `APPROVED`, `REJECTED` |
| `paramedicId` | int (diabaikan untuk role Paramedis — selalu dipaksa ke dirinya) |
| `dateFrom`, `dateTo` | `YYYY-MM-DD` |
| `hasFinding` | `true`/`false` (hanya berlaku untuk tipe MESS) |
| `messComplexId` | int |
| `q` | cari di `subjectLabel` |
| `page`, `perPage`, `sort` | standar; default `sort=createdAt:desc` |

**200**
```json
{
  "data": [{
    "id": 154,
    "type": "MESS",
    "observationDate": "2026-07-31",
    "subjectLabel": "Mess A / 7",
    "hasFinding": true,
    "paramedic": { "id": 4, "name": "Muhammad Suryani" },
    "status": "PENDING",
    "approvedAt": null,
    "createdAt": "2026-07-31T02:47:00.000Z",
    "detailUrl": "/api/v1/observations/mess/154"
  }],
  "meta": { "page": 1, "perPage": 25, "total": 137, "totalPages": 6 }
}
```

### GET `/observations/pending-count` — Dokter, Superadmin

**200**
```json
{ "data": { "total": 23, "mess": 15, "nonMess": 8, "oldestPendingAt": "2026-07-28T01:00:00.000Z" } }
```

Dipakai untuk badge di navigasi. Di-poll tiap 60 detik.

### PATCH `/observations/:type/:id/approval` — Dokter

`:type` = `mess` | `non-mess`

```json
{ "decision": "APPROVED", "doctorNotes": "Tekanan darah perlu dipantau ulang minggu depan." }
```

atau

```json
{ "decision": "REJECTED", "doctorNotes": "Foto tidak jelas, mohon observasi ulang di lokasi yang sama." }
```

Aturan:
- `doctorNotes` wajib minimal 10 karakter jika `decision = REJECTED`, opsional jika `APPROVED`.
- Hanya berlaku pada observasi berstatus `PENDING`.

**200**
```json
{
  "data": {
    "id": 154, "type": "MESS", "status": "APPROVED",
    "doctor": { "id": 7, "name": "dr. Agung Priambara" },
    "doctorNotes": "Tekanan darah perlu dipantau ulang minggu depan.",
    "approvedAt": "2026-07-31T04:10:00.000Z"
  }
}
```

**400** `INVALID_STATE_TRANSITION` — "Observasi ini sudah diproses sebelumnya."

---

## 7. Foto — `/api/v1/photos`

### POST `/photos` — Paramedis

`Content-Type: multipart/form-data`

| Field | Tipe | Keterangan |
|---|---|---|
| `file` | File | Wajib. JPG/PNG/WebP/HEIC, maks 5 MB |
| `category` | string | `FINDING`, `MESS_CONDITION`, `HOME_VISIT` |
| `clientUuid` | string | UUID observasi yang sedang disusun — untuk mengaitkan foto yatim |

Foto diunggah **sebelum** observasi dibuat, lalu id-nya disertakan di `photoIds`.

**201**
```json
{
  "data": {
    "id": 88,
    "category": "FINDING",
    "url": "/api/v1/photos/88",
    "thumbnailUrl": "/api/v1/photos/88?size=thumb",
    "sizeBytes": 214_882,
    "mimeType": "image/webp"
  }
}
```

**413** `PAYLOAD_TOO_LARGE` · **415** `UNSUPPORTED_MEDIA_TYPE`

Foto tanpa observasi induk lebih dari 24 jam dibersihkan oleh cron harian.

### GET `/photos/:id`

Query: `size=thumb` opsional.
Mengembalikan binary image dengan `Content-Type: image/webp` dan `Cache-Control: private, max-age=86400`.
Guard: Paramedis hanya bisa mengakses foto observasinya sendiri.

### DELETE `/photos/:id` — Paramedis

Hanya untuk foto yang belum terikat ke observasi terkirim. **409** `RESOURCE_IN_USE` jika sudah terikat.

---

## 8. Master Data

### Komplek Mess — `/api/v1/mess-complexes`

| Method | Path | Role | Keterangan |
|---|---|---|---|
| GET | `/mess-complexes` | Semua | Query `includeInactive=true` untuk Superadmin |
| POST | `/mess-complexes` | Superadmin | `{ "name": "Mess G", "sortOrder": 9 }` |
| PATCH | `/mess-complexes/:id` | Superadmin | `name`, `sortOrder`, `isActive` |
| DELETE | `/mess-complexes/:id` | Superadmin | Soft delete; 409 jika masih punya kamar aktif |

GET **200**
```json
{ "data": [{ "id": 1, "name": "Mess A", "sortOrder": 1, "isActive": true, "roomCount": 12 }] }
```

### Kamar Mess — `/api/v1/mess-rooms`

| Method | Path | Role | Keterangan |
|---|---|---|---|
| GET | `/mess-rooms?complexId=1` | Semua | Dropdown nomor mess |
| POST | `/mess-rooms` | Superadmin | `{ "complexId": 1, "roomNumber": "13" }` |
| POST | `/mess-rooms/bulk` | Superadmin | `{ "complexId": 1, "from": 1, "to": 12 }` |
| PATCH | `/mess-rooms/:id` | Superadmin | `roomNumber`, `isActive` |
| DELETE | `/mess-rooms/:id` | Superadmin | Soft delete; 409 jika dipakai observasi |

### Lokasi Observasi — `/api/v1/observation-locations`

| Method | Path | Role |
|---|---|---|
| GET | `/observation-locations` | Semua |
| POST | `/observation-locations` | Superadmin |
| PATCH | `/observation-locations/:id` | Superadmin |
| DELETE | `/observation-locations/:id` | Superadmin |

```json
{ "data": [{ "id": 3, "village": "Satui", "district": "Tanah Bumbu", "isActive": true }] }
```

---

## 9. Jadwal — `/api/v1/schedules`

### GET `/schedules`

Query: `paramedicId`, `dateFrom`, `dateTo`, `observationType`, `shift`.
Paramedis selalu dipaksa `paramedicId = dirinya`.

**200**
```json
{
  "data": [{
    "id": 42,
    "paramedic": { "id": 4, "name": "Muhammad Suryani" },
    "scheduleDate": "2026-08-03",
    "shift": "PAGI",
    "observationType": "MESS",
    "targetCount": 5,
    "completedCount": 3,
    "notes": "Fokus Mess A dan B",
    "isPast": false
  }]
}
```

`completedCount` dihitung server: jumlah observasi paramedis tersebut pada tanggal & tipe yang sama.

### POST `/schedules` — Superadmin

```json
{
  "paramedicId": 4, "scheduleDate": "2026-08-03",
  "shift": "PAGI", "observationType": "MESS",
  "targetCount": 5, "notes": "Fokus Mess A dan B"
}
```
**409** jika sudah ada jadwal untuk paramedis+tanggal+shift yang sama.

### POST `/schedules/bulk` — Superadmin

```json
{
  "paramedicId": 4,
  "dateFrom": "2026-08-03", "dateTo": "2026-08-29",
  "daysOfWeek": [1, 2, 3, 4, 5],
  "shift": "PAGI", "observationType": "MESS", "targetCount": 5
}
```
`daysOfWeek`: 0 = Minggu … 6 = Sabtu.

**201** `{ "data": { "created": 20, "skipped": 0 } }` — bentrok dilewati, tidak menggagalkan seluruh batch.

### PATCH `/schedules/:id` · DELETE `/schedules/:id` — Superadmin

DELETE melakukan soft delete. **409** jika tanggal jadwal sudah lewat dan sudah ada observasi terkait.

---

## 10. KPI — `/api/v1/kpi` — Dokter, Superadmin

### GET `/kpi/summary`

Query: `dateFrom`, `dateTo` (wajib), `paramedicId` (opsional).

**200**
```json
{
  "data": {
    "period": { "from": "2026-07-01", "to": "2026-07-31" },
    "totals": {
      "messObservations": 128,
      "nonMessObservations": 34,
      "withFinding": 41,
      "pending": 12,
      "approved": 138,
      "rejected": 12
    },
    "scheduleCompliance": {
      "targetTotal": 180,
      "completedTotal": 162,
      "percentage": 90.0
    },
    "approvalTurnaround": {
      "averageHours": 18.4,
      "medianHours": 12.0,
      "over48HoursCount": 3
    }
  }
}
```

### GET `/kpi/by-paramedic`

Query: `dateFrom`, `dateTo`, `sort` (`compliance:asc` untuk menemukan yang tertinggal lebih dulu).

**200**
```json
{
  "data": [{
    "paramedic": { "id": 4, "name": "Muhammad Suryani" },
    "messCount": 45,
    "nonMessCount": 12,
    "totalCount": 57,
    "scheduledTarget": 60,
    "compliancePercentage": 95.0,
    "findingRate": 32.5,
    "lastObservationAt": "2026-07-31T02:47:00.000Z"
  }]
}
```

### GET `/kpi/trend`

Query: `dateFrom`, `dateTo`, `groupBy` (`day` | `week` | `month`).

**200**
```json
{
  "data": [
    { "bucket": "2026-07-01", "mess": 6, "nonMess": 2, "withFinding": 3 },
    { "bucket": "2026-07-02", "mess": 5, "nonMess": 1, "withFinding": 1 }
  ]
}
```

---

## 11. Laporan — `/api/v1/reports` — Dokter, Superadmin

### POST `/reports/preview`

```json
{
  "type": "MESS",
  "dateFrom": "2026-07-01", "dateTo": "2026-07-31",
  "paramedicId": null, "status": "APPROVED", "messComplexId": null
}
```

**200** `{ "data": { "rowCount": 128, "estimatedPages": 9 } }`

### POST `/reports/generate`

Body sama + `"format": "PDF" | "XLSX"`.

**202** (async, jika `rowCount` > 200)
```json
{ "data": { "jobId": "rep_7f3a...", "status": "PROCESSING", "statusUrl": "/api/v1/reports/jobs/rep_7f3a..." } }
```

**200** (sinkron, jika kecil) — mengembalikan file langsung dengan `Content-Disposition: attachment`.

### GET `/reports/jobs/:jobId`

**200**
```json
{
  "data": {
    "jobId": "rep_7f3a...", "status": "DONE",
    "progress": 100,
    "downloadUrl": "/api/v1/reports/download/rep_7f3a...",
    "expiresAt": "2026-08-01T04:00:00.000Z"
  }
}
```
Status: `PROCESSING`, `DONE`, `FAILED`. Berkas hasil disimpan 24 jam.

### GET `/reports/download/:jobId` — stream file

---

## 12. Audit Log — `/api/v1/audit-logs` — Superadmin

### GET `/audit-logs`

Query: `actorId`, `action`, `entityType`, `entityId`, `dateFrom`, `dateTo`, `page`, `perPage`.

**200**
```json
{
  "data": [{
    "id": "10482",
    "actor": { "id": 1, "name": "Superadmin" },
    "action": "RESET_PASSWORD",
    "entityType": "user",
    "entityId": 4,
    "description": "Reset password untuk Muhammad Suryani",
    "ipAddress": "10.0.0.14",
    "createdAt": "2026-07-31T03:00:00.000Z"
  }],
  "meta": { "page": 1, "perPage": 50, "total": 3821, "totalPages": 77 }
}
```

`id` dikembalikan sebagai string karena bertipe BigInt.

---

## 13. Health — `/api/v1/health` — Publik

**200** `{ "data": { "status": "ok", "database": "ok", "storage": "ok", "uptimeSeconds": 84213, "version": "1.0.0" } }`

Dipakai Dokploy untuk health check container.

---

## 14. Ringkasan Izin Endpoint

| Endpoint | Paramedis | Dokter | Superadmin |
|---|:---:|:---:|:---:|
| `POST /auth/*` | ✅ | ✅ | ✅ |
| `GET /users`, `POST /users`, `PATCH /users/:id`, `DELETE /users/:id` | — | — | ✅ |
| `POST /users/:id/reset-password` | — | — | ✅ |
| `GET /users/paramedics` | ✅ | ✅ | ✅ |
| `POST /observations/mess`, `POST /observations/non-mess` | ✅ | — | — |
| `GET /observations` | ✅ sendiri | ✅ semua | ✅ semua |
| `GET /observations/:type/:id` | ✅ sendiri | ✅ semua | ✅ semua |
| `GET /observations/pending-count` | — | ✅ | ✅ |
| `PATCH /observations/:type/:id/approval` | — | ✅ | — |
| `POST /photos`, `DELETE /photos/:id` | ✅ | — | — |
| `GET /photos/:id` | ✅ sendiri | ✅ semua | ✅ semua |
| `GET` master data | ✅ | ✅ | ✅ |
| `POST`/`PATCH`/`DELETE` master data | — | — | ✅ |
| `GET /schedules` | ✅ sendiri | ✅ semua | ✅ semua |
| `POST`/`PATCH`/`DELETE /schedules` | — | — | ✅ |
| `GET /kpi/*` | — | ✅ | ✅ |
| `POST /reports/*` | — | ✅ | ✅ |
| `GET /audit-logs` | — | — | ✅ |

Superadmin **tidak** bisa menyetujui observasi. Persetujuan adalah tindakan medis yang hanya boleh dilakukan dokter — kekuasaan administratif tidak memberikan kewenangan klinis.
