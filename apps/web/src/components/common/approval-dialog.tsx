import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const notesSchema = z.object({
  notes: z.string().optional(),
});

type NotesInput = z.infer<typeof notesSchema>;

type ApprovalDialogProps = {
  open: boolean;
  mode: 'approve' | 'reject';
  subtitle: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: (notes: string) => void;
};

export function ApprovalDialog({
  open,
  mode,
  subtitle,
  loading,
  onCancel,
  onConfirm,
}: ApprovalDialogProps) {
  const { register, handleSubmit, watch } = useForm<NotesInput>({
    resolver: zodResolver(notesSchema),
  });
  const notes = watch('notes') ?? '';

  const isReject = mode === 'reject';
  const needsNotes = isReject && notes.trim().length === 0;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/60 md:items-center"
      onClick={onCancel}
    >
      {/* Backdrop handled by parent div onClick */}

      <div
        className={cn(
          'flex w-full flex-col gap-5 rounded-t-lg border-t-[3px] border-x-[3px] border-ink-900 bg-white p-6 shadow-sheet',
          'md:w-96 md:rounded-lg md:border-[3px] md:shadow-raised',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle — visible only on mobile */}
        <div className="mx-auto h-1.5 w-10 rounded-full bg-ink-300 md:hidden" />

        <div>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-title text-ink-900">
              {isReject ? 'Tolak Observasi' : 'Setujui Observasi'}
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="flex h-11 w-11 items-center justify-center"
              aria-label="Tutup"
            >
              <X className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>
          <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>
        </div>

        <form
          onSubmit={handleSubmit((values) => onConfirm(values.notes ?? ''))}
          className="flex flex-col gap-4"
        >
          <div>
            <label
              htmlFor="approval-notes"
              className="mb-1.5 block text-sm font-medium text-ink-900"
            >
              Catatan Medis
              {isReject ? <span className="text-danger-500"> *</span> : null}
            </label>
            <textarea
              id="approval-notes"
              rows={3}
              className="w-full rounded-md border-[3px] border-ink-900 bg-white p-3 text-base text-ink-900"
              placeholder={
                isReject
                  ? 'Jelaskan alasan penolakan agar paramedis bisa menindaklanjuti.'
                  : 'Opsional — tambahkan catatan untuk paramedis.'
              }
              {...register('notes')}
            />
            {isReject ? (
              <p className="mt-1 text-xs text-ink-500">
                Catatan wajib diisi saat menolak observasi.
              </p>
            ) : null}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onCancel}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant={isReject ? 'danger' : 'primary'}
              className="flex-1"
              disabled={loading || needsNotes}
            >
              {loading ? (isReject ? 'Menolak…' : 'Menyetujui…') : isReject ? 'Tolak' : 'Setujui'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
