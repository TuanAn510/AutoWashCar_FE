import { FileText, UploadCloud, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const ACCEPT = 'image/jpeg,image/png,application/pdf';
const MAX_FILES = 5;
export const FILE_HINT = 'JPG, PNG, PDF — tối đa 5 tệp, 10 MB/tệp';

function takeFiles(fileList: FileList | null): File[] {
  return Array.from(fileList ?? []).slice(0, MAX_FILES);
}

/** Vùng kéo-thả tài liệu gọn, hiển thị số file đã chọn và danh sách tên. */
export function EvidenceUpload({
  files,
  onFilesChange,
  hint = FILE_HINT,
}: {
  files: File[];
  onFilesChange: (files: File[]) => void;
  hint?: string;
}) {
  const inputId = `evidence-${Math.random().toString(36).slice(2, 8)}`;
  const removeFile = (index: number) =>
    onFilesChange(files.filter((_, fileIndex) => fileIndex !== index));

  return (
    <div>
      <label
        htmlFor={inputId}
        className={cn(
          'flex w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-5 text-center transition',
          files.length
            ? 'border-emerald-200 bg-emerald-50/60'
            : 'border-slate-200 bg-slate-50 hover:border-sky-300 hover:bg-sky-50/50'
        )}
      >
        <UploadCloud className={cn('size-5', files.length ? 'text-emerald-500' : 'text-slate-400')} />
        <span className="text-sm font-semibold text-slate-700">
          {files.length ? `Đã chọn ${files.length} tài liệu` : 'Bấm để chọn tài liệu'}
        </span>
        <span className="text-xs text-slate-400">{hint}</span>
        <input
          id={inputId}
          type="file"
          multiple
          accept={ACCEPT}
          className="sr-only"
          onChange={(e) => {
            onFilesChange(takeFiles(e.target.files));
            e.target.value = '';
          }}
        />
      </label>
      {files.length ? (
        <ul className="mt-2 grid gap-1.5">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-3 py-1.5 text-sm"
            >
              <FileText className="size-4 shrink-0 text-slate-400" />
              <span className="min-w-0 flex-1 truncate text-slate-700">{file.name}</span>
              <button
                type="button"
                aria-label={`Xóa ${file.name}`}
                className="text-slate-400 transition hover:text-rose-500"
                onClick={() => removeFile(index)}
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1.5 text-xs text-amber-600">Bắt buộc — chọn ít nhất 1 tài liệu</p>
      )}
    </div>
  );
}