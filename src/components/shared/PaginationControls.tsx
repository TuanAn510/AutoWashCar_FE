import { Button } from '@/components/ui/button';
import type { PaginationMeta } from '@/types/api';

interface PaginationControlsProps {
  pagination?: PaginationMeta;
  itemCount?: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({
  pagination,
  itemCount = 0,
  onPageChange,
}: PaginationControlsProps) {
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? itemCount;
  const total = pagination?.total ?? itemCount;
  const totalPages = Math.max(1, pagination?.totalPages ?? Math.ceil(total / Math.max(limit, 1)));

  if (totalPages <= 1) {
    return null;
  }

  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Hiển thị {start}-{end} / {total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Trước
        </Button>
        <span className="min-w-20 text-center text-sm font-medium text-slate-700">
          {page} / {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Sau
        </Button>
      </div>
    </div>
  );
}
