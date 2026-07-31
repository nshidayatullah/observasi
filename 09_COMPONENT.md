# 09 — Component Catalog

> Katalog komponen frontend. Sebelum membuat komponen baru, cek daftar ini. Duplikasi komponen adalah sumber inkonsistensi terbesar di proyek seperti ini.

---

## 1. Tiga Lapis Komponen

| Lapis | Lokasi | Boleh diedit? | Isi |
|---|---|---|---|
| **Primitif** | `components/ui/` | Tidak | shadcn/ui apa adanya. Perubahan gaya lewat token Tailwind, bukan mengedit file. |
| **Bersama** | `components/common/` | Ya | Komponen domain yang dipakai lebih dari satu halaman. Dokumen ini fokus di sini. |
| **Lokal** | `pages/<layar>/components/` | Ya | Hanya dipakai oleh satu halaman. Tidak perlu masuk katalog. |

**Aturan promosi:** komponen lokal dipindah ke `common/` saat dipakai halaman ketiga — bukan kedua. Dipakai dua kali sering kali kebetulan; tiga kali menandakan pola nyata.

---

## 2. Primitif shadcn/ui yang Dipasang

`button` · `input` · `label` · `textarea` · `select` · `radio-group` · `checkbox` · `switch` · `form` · `dialog` · `sheet` · `drawer` · `alert-dialog` · `popover` · `calendar` · `table` · `card` · `badge` · `separator` · `skeleton` · `sonner` (toast) · `tabs` · `accordion` · `avatar` · `dropdown-menu` · `tooltip` · `progress` · `scroll-area`

Tidak dipasang tanpa kebutuhan nyata. Setiap primitif menambah ukuran bundle.

---

## 3. Komponen Bersama

### 3.1 Layout

#### `AppShell`

Kerangka aplikasi. Menentukan navigasi berdasarkan role.

```ts
type AppShellProps = {
  children: React.ReactNode;
};
```

Isi: `AppHeader` lengket di atas, konten, `BottomNav` (< lg) atau `Sidebar` (≥ lg). Membaca role dari auth context. Tidak menerima props navigasi — konfigurasi menu ada di `lib/navigation.ts`.

#### `AppHeader`

```ts
type AppHeaderProps = {
  title: string;
  showBack?: boolean;          // default: false
  onBack?: () => void;         // default: navigate(-1)
  actions?: React.ReactNode;   // tombol ikon di kanan
};
```

Selalu menampilkan `SyncQueueBadge` untuk role Paramedis, tanpa perlu diminta.

#### `BottomNav` / `Sidebar`

Item dari `lib/navigation.ts`, difilter berdasarkan role. Maksimum 5 item di `BottomNav`; sisanya masuk item "Lainnya" yang membuka sheet.

#### `PageContainer`

```ts
type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
};
```

Padding halaman konsisten (16 px mobile, 24 px ≥ md), lebar maksimum 1200 px, padding bawah 96 px agar konten tidak tertutup bottom nav. **Semua halaman wajib memakainya** — jangan atur padding manual per halaman.

---

### 3.2 Form

#### `FormStepper`

Indikator langkah untuk form multi-bagian.

```ts
type FormStepperProps = {
  steps: { id: string; label: string }[];
  currentIndex: number;
  onStepClick?: (index: number) => void;  // hanya untuk langkah yang sudah dilewati
};
```

Menampilkan batang segmen (lihat 08_UI_GUIDE §8) plus label langkah saat ini. Langkah yang belum dijangkau tidak bisa diklik.

#### `FormStepActions`

Tombol navigasi lengket di bawah form.

```ts
type FormStepActionsProps = {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;        // default: "Lanjut"
  backLabel?: string;        // default: "Kembali"
  isSubmitting?: boolean;
  isNextDisabled?: boolean;
};
```

Saat `isSubmitting`, tombol nonaktif dan labelnya berganti ("Menyimpan…").

#### `FormField`

Pembungkus field: label, tanda wajib, kontrol, teks bantuan, pesan error. Terhubung ke React Hook Form.

```ts
type FormFieldProps = {
  name: string;
  label: string;
  required?: boolean;
  description?: string;      // teks bantuan di bawah label
  children: React.ReactNode;
};
```

Menjamin `htmlFor` dan `aria-describedby` benar. **Tidak boleh ada input tanpa pembungkus ini.**

#### `ChoiceCard` / `ChoiceCardGroup`

Radio berbentuk kartu, bukan lingkaran kecil. Dipakai untuk "Temuan", "Perusahaan", "Apakah sedang tidur".

```ts
type ChoiceCardGroupProps<T extends string> = {
  name: string;
  value: T | undefined;
  onChange: (value: T) => void;
  options: { value: T; label: string; description?: string; icon?: LucideIcon }[];
  columns?: 1 | 2;           // default: 2
};
```

Tinggi minimum 56 px per kartu. Terpilih ditandai border 2 px + latar tint, bukan hanya titik.

#### `CheckboxGroup`

Multi-pilih untuk `roomFacilities`, `sideActivities`, `relationshipWithOccupants`.

```ts
type CheckboxGroupProps<T extends string> = {
  value: T[];
  onChange: (value: T[]) => void;
  options: { value: T; label: string }[];
  columns?: 1 | 2;
  otherField?: {             // untuk opsi "Lainnya" yang butuh input teks
    triggerValue: T;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
  };
};
```

#### `ConditionalField`

Menampilkan field hanya ketika kondisi terpenuhi, dan **mengosongkan nilainya** saat disembunyikan agar tidak terkirim ke server.

```ts
type ConditionalFieldProps = {
  when: boolean;
  name: string;              // untuk reset otomatis
  children: React.ReactNode;
};
```

Dipakai untuk: `petDetails` (saat `hasPet`), `noiseSource` (saat `hasNoise`), seluruh Bagian 2 form Mess (saat `hasFinding`).

#### `DatePickerField`

Wrapper Calendar + Popover dengan format Indonesia ("31 Juli 2026"). Di mobile membuka sebagai drawer. Default tanggal observasi = hari ini. Tidak menerima tanggal masa depan untuk `observationDate`.

#### `DependentSelect`

Dropdown yang isinya bergantung pada dropdown lain — Komplek Mess → Nomor Mess.

```ts
type DependentSelectProps = {
  parentValue: number | undefined;
  value: number | undefined;
  onChange: (v: number) => void;
  fetchOptions: (parentId: number) => Promise<Option[]>;
  placeholder: string;
  emptyMessage: string;      // "Pilih komplek mess dulu"
};
```

Mengosongkan pilihannya sendiri saat `parentValue` berubah.

---

### 3.3 Foto

#### `PhotoUploader`

Komponen paling kompleks di aplikasi. Mengurus pengambilan, kompresi, pratinjau, penghapusan, dan penyimpanan offline.

```ts
type PhotoUploaderProps = {
  category: PhotoCategory;
  clientUuid: string;
  value: LocalPhoto[];
  onChange: (photos: LocalPhoto[]) => void;
  maxCount: number;          // Mess: 3, Non-Mess: 8
  required?: boolean;
};

type LocalPhoto = {
  localId: string;
  blob: Blob;                // hasil kompresi
  previewUrl: string;        // object URL
  serverId?: number;         // terisi setelah berhasil diunggah
  status: 'LOCAL' | 'UPLOADING' | 'UPLOADED' | 'FAILED';
};
```

Perilaku:
- `<input type="file" accept="image/*" capture="environment">` untuk membuka kamera langsung.
- Kompresi dengan `browser-image-compression`: `maxSizeMB: 0.5`, `maxWidthOrHeight: 1600`, `useWebWorker: true`.
- Menampilkan progres kompresi untuk file besar.
- Blob disimpan di IndexedDB agar bertahan saat aplikasi ditutup.
- Menolak file yang bukan gambar dengan pesan yang menyebut format yang diterima.
- Saat sudah mencapai `maxCount`, tombol tambah disembunyikan dan diganti keterangan.

#### `PhotoGallery`

Menampilkan foto pada layar detail, read-only.

```ts
type PhotoGalleryProps = {
  photos: { id: number; url: string; thumbnailUrl: string }[];
};
```

Grid thumbnail; ketuk membuka lightbox dengan geser antar foto dan tombol tutup. Memuat gambar penuh hanya saat lightbox dibuka.

---

### 3.4 Observasi

#### `ObservationCard`

Kartu di daftar riwayat dan antrean persetujuan. Membawa Status Rail.

```ts
type ObservationCardProps = {
  observation: ObservationSummary;
  onClick: () => void;
  showParamedic?: boolean;   // true untuk dokter & superadmin
  showAging?: boolean;       // true di antrean persetujuan
};
```

Warna rail ditentukan fungsi murni `getStatusRailVariant(observation)` di `lib/observation-status.ts` — satu tempat, dipakai kartu, badge, dan banner detail.

#### `StatusBadge`

```ts
type StatusBadgeProps = {
  status: ObservationStatus | 'QUEUED' | 'FAILED';
  size?: 'sm' | 'md';
};
```

Selalu menampilkan ikon + teks. Tidak pernah warna saja.

#### `FindingBadge`

```ts
type FindingBadgeProps = { hasFinding: boolean };
```

"Ada Temuan" (amber, ikon segitiga) atau "Tertib" (teal, ikon centang).

#### `ObservationSummaryList`

Daftar pasangan label–nilai untuk layar Ringkasan dan Detail.

```ts
type ObservationSummaryListProps = {
  title: string;
  items: { label: string; value: React.ReactNode; mono?: boolean }[];
  onEdit?: () => void;       // tampilkan tautan "Ubah" jika ada
};
```

`mono: true` untuk NIK, NRP, tekanan darah, timestamp.

#### `ApprovalSheet`

Bottom sheet (mobile) / dialog (≥ md) untuk keputusan dokter.

```ts
type ApprovalSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  observation: ObservationSummary;
  decision: 'APPROVED' | 'REJECTED';
  onConfirm: (notes: string) => Promise<void>;
};
```

Saat `decision === 'REJECTED'`: catatan wajib, minimal 10 karakter, tombol varian `danger`, teks bantuan menjelaskan bahwa catatan akan dibaca paramedis.

---

### 3.5 Data & Kondisi

#### `EmptyState`

```ts
type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
};
```

Copy diambil dari 08_UI_GUIDE §7.3. Setiap daftar wajib punya kondisi kosong dengan teks spesifik konteksnya — tidak ada "Tidak ada data" generik.

#### `ErrorState`

```ts
type ErrorStateProps = {
  title?: string;            // default: "Data gagal dimuat"
  description?: string;
  onRetry?: () => void;
};
```

#### `LoadingSkeleton`

```ts
type LoadingSkeletonProps = {
  variant: 'list' | 'detail' | 'table' | 'card';
  count?: number;
};
```

Bentuknya menyerupai konten yang akan muncul. Bukan spinner di tengah layar — spinner membuat perpindahan terasa lebih lama.

#### `DataTable`

Tabel responsif: tabel asli di `≥ lg`, daftar kartu di bawahnya.

```ts
type DataTableProps<T> = {
  data: T[];
  columns: {
    key: string;
    header: string;
    cell: (row: T) => React.ReactNode;
    mobileLabel?: string;
    hideOnMobile?: boolean;
  }[];
  renderMobileCard?: (row: T) => React.ReactNode;  // kendali penuh jika perlu
  isLoading?: boolean;
  emptyState?: React.ReactNode;
};
```

Tidak pernah menghasilkan tabel yang bisa digulir horizontal di ponsel.

#### `Pagination`

```ts
type PaginationProps = {
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
};
```

Di mobile: hanya tombol Sebelumnya/Berikutnya + teks "1–10 dari 12". Di desktop: nomor halaman + pemilih jumlah per halaman (10/25/50).

#### `FilterBar`

```ts
type FilterBarProps = {
  children: React.ReactNode;   // chip filter
  activeCount: number;
  onReset: () => void;
};
```

Menampilkan jumlah filter aktif dan tombol "Bersihkan". Di mobile filter dibuka sebagai sheet, bukan berjejer memenuhi layar.

---

### 3.6 Offline

#### `OnlineStatusBanner`

Muncul di bawah header saat offline. Ungu (`offline-500`), teks: "Tidak ada koneksi. Anda tetap bisa mengisi form." Menghilang otomatis saat online dengan animasi singkat.

#### `SyncQueueBadge`

```ts
type SyncQueueBadgeProps = { count: number };
```

Ikon awan-tercoret + jumlah. Disembunyikan saat `count === 0`. Ketuk → SC-18.

#### `SyncQueueItem`

```ts
type SyncQueueItemProps = {
  item: QueuedObservation;
  onRetry: () => void;
  onDelete: () => void;
  onFix: () => void;         // buka kembali form untuk item FAILED
};
```

Menampilkan status berbeda untuk `QUEUED`, `SYNCING`, `FAILED`, `NEEDS_ATTENTION`, masing-masing dengan aksi yang relevan saja.

#### `DraftResumeCard`

Kartu "Observasi belum selesai" di SC-04.

```ts
type DraftResumeCardProps = {
  draft: { type: ObservationType; label: string; startedAt: string };
  onResume: () => void;
  onDiscard: () => void;
};
```

`onDiscard` memunculkan konfirmasi — draft yang hilang tidak bisa dikembalikan.

---

### 3.7 KPI

#### `MetricCard`

```ts
type MetricCardProps = {
  label: string;
  value: string | number;
  sublabel?: string;
  trend?: { direction: 'up' | 'down'; value: string };
  variant?: 'default' | 'signal' | 'success' | 'danger';
  isLoading?: boolean;
};
```

Angka memakai `font-mono` agar sejajar antar kartu.

#### `ComplianceBar`

```ts
type ComplianceBarProps = {
  completed: number;
  target: number;
  showWarningBelow?: number;   // default: 85
};
```

Menampilkan batang + persentase + ikon peringatan bila di bawah ambang. Menangani `target === 0` dengan menampilkan "Tidak ada jadwal" alih-alih membagi nol.

---

## 4. Hook Bersama

| Hook | Kembalian | Fungsi |
|---|---|---|
| `useAuth()` | `{ user, login, logout, isAuthenticated }` | Akses status autentikasi |
| `useOnlineStatus()` | `boolean` | Status koneksi. **Satu-satunya** tempat `navigator.onLine` dibaca |
| `useSyncQueue()` | `{ items, count, retryAll, retryOne, remove }` | Antrean sinkronisasi |
| `useObservationDraft(type)` | `{ draft, save, clear }` | Autosave draft ke IndexedDB |
| `usePermission()` | `{ can(action) }` | Cek izin berdasarkan role — cerminan 10_BUSINESS_RULE §2 |
| `useDebouncedValue(v, ms)` | `T` | Debounce input pencarian |
| `useMediaQuery(query)` | `boolean` | Deteksi breakpoint untuk perbedaan sheet vs dialog |

---

## 5. Aturan Menulis Komponen

1. **Presentasi tidak mengambil data.** Komponen di `common/` menerima data lewat props. Fetching terjadi di halaman atau hook fitur.
2. **Tanpa logika izin di dalam komponen visual.** Halaman yang memutuskan apa yang ditampilkan; komponen hanya menggambar.
3. **Props boolean bernama positif.** `isDisabled`, bukan `notEnabled`.
4. **Callback diawali `on`, handler internal diawali `handle`.**
5. **Tanpa `React.FC`.** Deklarasikan fungsi biasa dengan tipe props eksplisit.
6. **Tidak menerima `className` kecuali komponen layout.** Komponen domain yang bisa di-override gayanya akan cepat menyimpang dari sistem desain.
7. **Setiap komponen interaktif diuji** untuk keadaan: normal, nonaktif, memuat, dan error.
8. **Semua teks berasal dari props atau `labels.ts`.** Tidak ada string Bahasa Indonesia yang di-hardcode di dalam komponen bersama.

---

## 6. Peta Komponen per Layar

| Layar | Komponen utama |
|---|---|
| SC-01 Login | `FormField`, `Input`, `Button` |
| SC-02 Ganti Password | `FormField`, `PasswordStrength` (lokal) |
| SC-03 Beranda Paramedis | `MetricCard`, `ComplianceBar`, `ObservationCard`, `SyncQueueBadge` |
| SC-04 Pilih Tipe | `ChoiceCard`, `DraftResumeCard` |
| SC-05 Form Mess | `FormStepper`, `FormField`, `DatePickerField`, `DependentSelect`, `ChoiceCardGroup`, `ConditionalField`, `PhotoUploader`, `ObservationSummaryList`, `FormStepActions` |
| SC-06 Form Non-Mess | Semua di atas + `CheckboxGroup`, `Accordion` |
| SC-07 Riwayat | `FilterBar`, `ObservationCard`, `EmptyState`, `LoadingSkeleton` |
| SC-08 Detail | `StatusBadge`, `FindingBadge`, `ObservationSummaryList`, `PhotoGallery`, `ApprovalSheet` |
| SC-09 Persetujuan | `MetricCard`, `ObservationCard` (dengan aging), `ApprovalSheet` |
| SC-10 KPI | `MetricCard`, `ComplianceBar`, `DataTable` |
| SC-11 Jadwal | `DataTable`, `DatePickerField`, `ComplianceBar` |
| SC-12–14 Pengguna | `DataTable`, `FilterBar`, `Pagination`, `FormField`, `AlertDialog` |
| SC-15 Master Mess | `Accordion`, `Badge`, `AlertDialog` |
| SC-16 Laporan | `FormField`, `DatePickerField`, `MetricCard`, `Progress` |
| SC-17 Profil | `FormField`, `Switch` (mode gelap) |
| SC-18 Antrean Sinkron | `OnlineStatusBanner`, `SyncQueueItem`, `EmptyState` |
