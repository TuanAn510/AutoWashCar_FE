import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CustomerModalShell } from '@/features/customers/components/CustomerModalShell';
import { EvidenceUpload } from '@/features/customers/vehicles/components/evidence-upload';

export type VehicleVerificationSubmitValue = {
  relationship: string;
  note: string;
  /** Minh chứng biển số/quyền sử dụng. */
  documents: File[];
  /** Minh chứng hãng/dòng xe — chỉ dùng khi combined (biển + hãng/dòng). */
  brandModelDocuments?: File[];
};

type VehicleVerificationDialogProps = {
  plate: string;
  open: boolean;
  pending: boolean;
  title?: string;
  description?: string;
  initialRelationship?: string;
  initialNote?: string;
  initialBrand?: string;
  initialModel?: string;
  reviewNote?: string;
  /** True khi khách chọn "Khác" (custom) ở hãng và/hoặc dòng → yêu cầu này phải
   *  xác minh CẢ hãng/dòng lẫn biển số, và minh chứng được tách làm 2 nhóm. */
  needsBrandModelVerification?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: VehicleVerificationSubmitValue) => Promise<void>;
};

export function VehicleVerificationDialog(props: VehicleVerificationDialogProps) {
  const formKey = [
    props.open,
    props.plate,
    props.initialRelationship,
    props.initialNote,
    props.needsBrandModelVerification,
  ].join('|');

  return <VehicleVerificationDialogContent key={formKey} {...props} />;
}

function VehicleVerificationDialogContent({
  plate,
  open,
  pending,
  title = 'Yêu cầu xác minh quyền sử dụng xe',
  description = 'Xe này đã tồn tại trong hệ thống. Nếu bạn là chủ sở hữu hoặc người dùng được ủy quyền, vui lòng gửi yêu cầu xác minh.',
  initialRelationship = '',
  initialNote = '',
  initialBrand,
  initialModel,
  reviewNote,
  needsBrandModelVerification = false,
  onOpenChange,
  onSubmit,
}: VehicleVerificationDialogProps) {
  const [relationship, setRelationship] = useState(initialRelationship);
  const [note, setNote] = useState(initialNote);
  const [documents, setDocuments] = useState<File[]>([]);
  const [brandModelDocuments, setBrandModelDocuments] = useState<File[]>([]);
  const formId = 'vehicle-verification-form';

  const submitDisabled =
    pending ||
    relationship.trim().length < 2 ||
    documents.length === 0 ||
    (needsBrandModelVerification && brandModelDocuments.length === 0);

  const modelName = [initialBrand, initialModel].filter(Boolean).join(' · ');

  return (
    <CustomerModalShell
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button type="submit" form={formId} disabled={submitDisabled}>
            Gửi yêu cầu
          </Button>
        </>
      }
    >
      <form
        id={formId}
        className="grid gap-5"
        onSubmit={async (e) => {
          e.preventDefault();
          await onSubmit({
            relationship,
            note,
            documents,
            brandModelDocuments: needsBrandModelVerification ? brandModelDocuments : undefined,
          });
        }}
      >
        {/* Phản hồi từ admin — hiện trên đầu */}
        {reviewNote ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
            <p className="font-semibold">Phản hồi từ admin:</p>
            <p className="mt-0.5">{reviewNote}</p>
          </div>
        ) : null}

        {/* Hành động cần xác minh — hiển thị dạng các thẻ gọn thay vì khối dài */}
        {needsBrandModelVerification ? (
          <div className="grid gap-3">
            {/* Thẻ 1: hãng/dòng */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-bold text-amber-900">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-black text-white">
                      1
                    </span>
                    Xác minh hãng / dòng xe
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-amber-900">{modelName || '—'}</p>
                  <p className="mt-0.5 text-xs leading-5 text-amber-700">
                    Cần minh chứng tên hãng/dòng này (giấy đăng ký xe, hóa đơn, cataloge).
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold',
                    brandModelDocuments.length
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  )}
                >
                  {brandModelDocuments.length ? 'Xong' : 'Thiếu tài liệu'}
                </span>
              </div>
              <div className="mt-3">
                <EvidenceUpload
                  files={brandModelDocuments}
                  onFilesChange={setBrandModelDocuments}
                />
              </div>
            </div>

            {/* Thẻ 2: biển số */}
            <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-bold text-sky-900">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sky-500 text-xs font-black text-white">
                      2
                    </span>
                    Xác minh biển số
                  </p>
                  <p className="mt-1.5 font-mono text-sm font-bold uppercase tracking-wider text-slate-800">
                    {plate}
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-sky-700">
                    Cần minh chứng quyền sử dụng biển số này (giấy đăng ký, giấy ủy quyền).
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold',
                    documents.length ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'
                  )}
                >
                  {documents.length ? 'Xong' : 'Thiếu tài liệu'}
                </span>
              </div>
              <div className="mt-3">
                <EvidenceUpload files={documents} onFilesChange={setDocuments} />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-sky-900">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sky-500 text-xs font-black text-white">
                  1
                </span>
                Xác minh biển số
              </p>
              <p className="mt-1.5 font-mono text-sm font-bold uppercase tracking-wider text-slate-800">
                {plate}
              </p>
              <div className="mt-3">
                <EvidenceUpload files={documents} onFilesChange={setDocuments} />
              </div>
            </div>
          </>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Mối quan hệ / lý do <span className="text-rose-500">*</span>
            </label>
            <Input
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              maxLength={100}
              placeholder="VD: chủ xe, anh em, được ủy quyền..."
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Ghi chú</label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={1000}
              placeholder="Thông tin thêm (nếu có)"
            />
          </div>
        </div>
      </form>
    </CustomerModalShell>
  );
}
