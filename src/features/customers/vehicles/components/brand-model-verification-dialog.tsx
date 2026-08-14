import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CustomerModalShell } from '@/features/customers/components/CustomerModalShell';
import { EvidenceUpload } from '@/features/customers/vehicles/components/evidence-upload';

export function BrandModelVerificationDialog({
  vehicleName,
  plate,
  reviewNote,
  open,
  pending,
  onOpenChange,
  onSubmit,
}: {
  vehicleName: string;
  plate: string;
  reviewNote?: string;
  open: boolean;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: { note: string; documents: File[] }) => Promise<void>;
}) {
  const [note, setNote] = useState('');
  const [documents, setDocuments] = useState<File[]>([]);
  const formId = 'brand-model-verification-form';

  return (
    <CustomerModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="Bổ sung minh chứng hãng / dòng xe"
      description="Yêu cầu xác minh hãng/dòng xe trước đó chưa được chấp nhận. Vui lòng bổ sung tài liệu chứng minh để gửi lại admin xác nhận."
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            type="submit"
            form={formId}
            disabled={pending || documents.length === 0}
          >
            Gửi lại yêu cầu
          </Button>
        </>
      }
    >
      <form
        id={formId}
        className="grid gap-5"
        onSubmit={async (e) => {
          e.preventDefault();
          await onSubmit({ note, documents });
        }}
      >
        {/* Phản hồi từ admin — hiện trên đầu */}
        {reviewNote ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
            <p className="font-semibold">Phản hồi từ admin:</p>
            <p className="mt-0.5">{reviewNote}</p>
          </div>
        ) : null}

        {/* Thẻ xác minh hãng/dòng */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-bold text-amber-900">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-black text-white">
                  1
                </span>
                Xác minh hãng / dòng xe
              </p>
              <p className="mt-1.5 text-sm font-semibold text-amber-900">
                {vehicleName || '—'}
              </p>
              <p className="mt-0.5 text-xs leading-5 text-amber-700">
                Cần minh chứng tên hãng/dòng này (giấy đăng ký xe, hóa đơn, cataloge).
              </p>
            </div>
            <span
              className={
                documents.length
                  ? 'shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700'
                  : 'shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700'
              }
            >
              {documents.length ? 'Xong' : 'Thiếu tài liệu'}
            </span>
          </div>
          <div className="mt-3">
            <EvidenceUpload files={documents} onFilesChange={setDocuments} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Xe</label>
            <Input value={vehicleName || plate} disabled />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Biển số</label>
            <Input value={plate} disabled />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Ghi chú</label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Cung cấp thêm thông tin về tên hãng/dòng xe mới."
            maxLength={1000}
          />
        </div>
      </form>
    </CustomerModalShell>
  );
}