import { useRef, useState, useCallback } from 'react';
import imageCompression from 'browser-image-compression';
import { Camera, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MAX_PHOTO_SIZE_BYTES } from '@observasi/shared';

export type PhotoEntry = {
  id: string;
  file: File;
  previewUrl: string;
};

type PhotoUploaderProps = {
  max: number;
  value: PhotoEntry[];
  onChange: (photos: PhotoEntry[]) => void;
};

const COMPRESS_OPTIONS = {
  maxSizeMB: MAX_PHOTO_SIZE_BYTES / (1024 * 1024),
  maxWidthOrHeight: 1200,
  useWebWorker: true,
};

export function PhotoUploader({ max, value, onChange }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [compressing, setCompressing] = useState(false);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      setCompressing(true);
      const remaining = max - value.length;
      const toProcess = Array.from(files).slice(0, remaining);

      try {
        const compressed = await Promise.all(
          toProcess.map(async (file) => {
            const compressedFile = await imageCompression(file, COMPRESS_OPTIONS);
            return {
              id: crypto.randomUUID(),
              file: compressedFile,
              previewUrl: URL.createObjectURL(compressedFile),
            };
          }),
        );
        onChange([...value, ...compressed]);
      } finally {
        setCompressing(false);
        // Reset input agar bisa memilih file yang sama lagi
        if (inputRef.current) inputRef.current.value = '';
      }
    },
    [value, max, onChange],
  );

  const remove = useCallback(
    (id: string) => {
      const photo = value.find((p) => p.id === id);
      if (photo) URL.revokeObjectURL(photo.previewUrl);
      onChange(value.filter((p) => p.id !== id));
    },
    [value, onChange],
  );

  const canAdd = value.length < max;

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {/* Pratinjau foto */}
        {value.map((photo) => (
          <div
            key={photo.id}
            className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border-2 border-ink-900"
          >
            <img
              src={photo.previewUrl}
              alt="Pratinjau foto"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => remove(photo.id)}
              className="absolute right-0.5 top-0.5 flex h-6 w-6 items-center justify-center rounded-sm border-2 border-ink-900 bg-danger-500 text-ink-900"
              aria-label="Hapus foto"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.5} />
            </button>
          </div>
        ))}

        {/* Slot tambah */}
        {canAdd ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={compressing}
            className={cn(
              'flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-md border-[3px] border-dashed border-ink-300 text-ink-500 transition-colors',
              'hover:border-primary-500 hover:text-primary-700',
              compressing && 'animate-pulse',
            )}
          >
            <Camera className="h-7 w-7" strokeWidth={1.5} />
            <span className="text-xs font-medium">{compressing ? '...' : 'Tambah'}</span>
          </button>
        ) : null}
      </div>

      <p className="mt-2 text-xs text-ink-500">
        Maksimal {max} foto. {value.length > 0 ? `Terpilih ${value.length} dari ${max}.` : ''}
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple={max - value.length > 1}
        onChange={handleFileChange}
        className="hidden"
        aria-label="Pilih foto"
      />
    </div>
  );
}
