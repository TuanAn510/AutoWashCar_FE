import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CustomerModalShell } from '@/features/customers/components/CustomerModalShell';

export function VehicleVerificationDialog({
  plate,
  open,
  pending,
  onOpenChange,
  onSubmit,
}: {
  plate: string;
  open: boolean;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: { relationship: string; note: string; documents: File[] }) => Promise<void>;
}) {
  const [relationship, setRelationship] = useState('');
  const [note, setNote] = useState('');
  const [documents, setDocuments] = useState<File[]>([]);
  const formId = 'vehicle-verification-form';
  return (
    <CustomerModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="Yêu cầu xác minh quyền sử dụng xe"
      description="Xe này đã tồn tại trong hệ thống. Nếu bạn là chủ sở hữu hoặc người dùng được ủy quyền, vui lòng gửi yêu cầu xác minh."
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button type="submit" form={formId} disabled={pending || relationship.trim().length < 2}>
            Gửi yêu cầu
          </Button>
        </>
      }
    >
      <form
        id={formId}
        className="grid gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          await onSubmit({ relationship, note, documents });
        }}
      >
        <div>
          <label className="text-sm font-medium">Biển số</label>
          <Input value={plate} disabled />
        </div>
        <div>
          <label className="text-sm font-medium">Mối quan hệ / lý do</label>
          <Input
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            maxLength={100}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Ghi chú</label>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} />
        </div>
        <div>
          <label className="text-sm font-medium">
            Tài liệu hỗ trợ (JPG, PNG, PDF; tối đa 5 tệp, 10 MB/tệp)
          </label>
          <Input
            type="file"
            multiple
            accept="image/jpeg,image/png,application/pdf"
            onChange={(e) => setDocuments(Array.from(e.target.files ?? []).slice(0, 5))}
          />
        </div>
      </form>
    </CustomerModalShell>
  );
}
