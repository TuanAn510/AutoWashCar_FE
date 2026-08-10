import { PageSection } from '@/components/common/PageSection';
import { PageLayout } from '@/components/layout/PageLayout';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Search,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { StatCard } from '@/components/dashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { vehicleAccessRequestApi } from '@/services/vehicleAccessRequestService';
import type { VehicleAccessRequest, VehicleAccessRequestStatus } from '@/types/vehicle';

const queryKey = ['vehicle-access-requests', 'admin'];
const EMPTY_REQUESTS: VehicleAccessRequest[] = [];
const statusMeta = {
  pending: { label: 'Chờ duyệt', className: 'bg-amber-50 text-amber-700' },
  approved: { label: 'Đã duyệt', className: 'bg-emerald-50 text-emerald-700' },
  rejected: { label: 'Đã từ chối', className: 'bg-rose-50 text-rose-700' },
} satisfies Record<VehicleAccessRequestStatus, { label: string; className: string }>;

function personName(request: VehicleAccessRequest) {
  if (typeof request.requesterId !== 'object') return 'Không rõ người yêu cầu';
  return (
    request.requesterId.displayName ||
    request.requesterId.phone ||
    request.requesterId.email ||
    'Không rõ người yêu cầu'
  );
}
function formatDate(value?: string) {
  return value
    ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(
        new Date(value)
      )
    : '—';
}
function isImage(mime?: string, name?: string) {
  return mime?.startsWith('image/') || /\.(jpe?g|png|gif|webp|avif)$/i.test(name ?? '');
}

export default function VehicleAccessRequestsPage() {
  const [status, setStatus] = useState<VehicleAccessRequestStatus | 'all'>('pending');
  const [keyword, setKeyword] = useState('');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const client = useQueryClient();
  const query = useQuery({ queryKey, queryFn: () => vehicleAccessRequestApi.listAdmin() });
  const review = useMutation({
    mutationFn: ({
      request,
      action,
    }: {
      request: VehicleAccessRequest;
      action: 'approve' | 'reject';
    }) => vehicleAccessRequestApi[action](request._id, notes[request._id]?.trim() ?? ''),
    onSuccess: (_, variables) => {
      client.invalidateQueries({ queryKey });
      setNotes((current) => ({ ...current, [variables.request._id]: '' }));
      toast.success(
        variables.action === 'approve' ? 'Đã chấp thuận yêu cầu.' : 'Đã từ chối yêu cầu.'
      );
    },
    onError: () => toast.error('Không thể cập nhật yêu cầu. Vui lòng thử lại.'),
  });
  const requests = query.data ?? EMPTY_REQUESTS;
  const filtered = useMemo(() => {
    const word = keyword.trim().toLocaleLowerCase('vi');
    return requests.filter((item) => {
      const text = [item.licensePlate, item.relationship, item.note, personName(item)]
        .join(' ')
        .toLocaleLowerCase('vi');
      return (status === 'all' || item.status === status) && (!word || text.includes(word));
    });
  }, [keyword, requests, status]);
  const count = (value: VehicleAccessRequestStatus) =>
    requests.filter((item) => item.status === value).length;

  return (
    <PageLayout>
      <section>
        <h1 className="text-3xl font-bold text-slate-950 sm:text-4xl">Xác minh quyền sử dụng xe</h1>
        <p className="mt-2 text-base text-slate-500">
          Kiểm tra minh chứng và duyệt quyền sử dụng xe đã tồn tại trong hệ thống.
        </p>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Tổng yêu cầu"
          value={query.isLoading ? '--' : String(requests.length)}
          icon={ShieldCheck}
        />
        <StatCard
          title="Chờ duyệt"
          value={query.isLoading ? '--' : String(count('pending'))}
          icon={Clock3}
        />
        <StatCard
          title="Đã duyệt"
          value={query.isLoading ? '--' : String(count('approved'))}
          icon={CheckCircle2}
        />
        <StatCard
          title="Đã từ chối"
          value={query.isLoading ? '--' : String(count('rejected'))}
          icon={XCircle}
        />
      </section>
      <PageSection className="rounded-lg border border-border/80 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_190px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="h-10 border-0 bg-slate-100 pl-10 shadow-none"
              placeholder="Tìm theo biển số, người yêu cầu..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <select
            className="h-10 rounded-md border border-input bg-white px-3 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as VehicleAccessRequestStatus | 'all')}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Đã từ chối</option>
          </select>
        </div>
      </PageSection>
      <PageSection className="rounded-lg border border-border/80 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-950">Danh sách yêu cầu</h2>
          {query.isError && (
            <p className="text-sm text-destructive">Không thể tải danh sách yêu cầu.</p>
          )}
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[1180px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border text-slate-900">
                <th className="px-2 py-3">Biển số xe</th>
                <th className="px-2 py-3">Người yêu cầu</th>
                <th className="px-2 py-3">Quan hệ / ghi chú</th>
                <th className="w-[190px] px-2 py-3">Ảnh minh chứng</th>
                <th className="px-2 py-3">Ngày gửi</th>
                <th className="px-2 py-3">Trạng thái</th>
                <th className="w-[320px] px-2 py-3">Xử lý</th>
              </tr>
            </thead>
            <tbody>
              {query.isLoading && <EmptyRow text="Đang tải yêu cầu xác minh..." />}
              {!query.isLoading && !query.isError && !filtered.length && (
                <EmptyRow text="Không có yêu cầu phù hợp." />
              )}
              {filtered.map((request) => (
                <tr key={request._id} className="border-b border-border/70 align-top last:border-0">
                  <td className="px-2 py-4 font-semibold text-slate-950">{request.licensePlate}</td>
                  <td className="px-2 py-4">
                    <p className="font-medium">{personName(request)}</p>
                    {typeof request.requesterId === 'object' && (
                      <p className="mt-1 text-xs text-slate-500">
                        {request.requesterId.phone || request.requesterId.email}
                      </p>
                    )}
                  </td>
                  <td className="px-2 py-4 text-slate-600">
                    <p className="font-medium text-slate-800">{request.relationship}</p>
                    <p className="mt-1 max-w-64 text-xs">{request.note || 'Không có ghi chú'}</p>
                  </td>
                  <td className="px-2 py-4">
                    <Evidence documents={request.documents} />
                  </td>
                  <td className="whitespace-nowrap px-2 py-4 text-slate-600">
                    {formatDate(request.createdAt)}
                  </td>
                  <td className="px-2 py-4">
                    <span
                      className={cn(
                        'inline-flex whitespace-nowrap rounded-md px-3 py-1 text-xs font-semibold',
                        statusMeta[request.status].className
                      )}
                    >
                      {statusMeta[request.status].label}
                    </span>
                  </td>
                  <td className="px-2 py-4">
                    {request.status === 'pending' ? (
                      <div className="space-y-2">
                        <Input
                          className="h-9"
                          placeholder="Ghi chú duyệt (ít nhất 2 ký tự)"
                          value={notes[request._id] ?? ''}
                          onChange={(e) =>
                            setNotes((current) => ({ ...current, [request._id]: e.target.value }))
                          }
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={
                              (notes[request._id]?.trim().length ?? 0) < 2 || review.isPending
                            }
                            onClick={() => review.mutate({ request, action: 'approve' })}
                          >
                            <CheckCircle2 />
                            Chấp thuận
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={
                              (notes[request._id]?.trim().length ?? 0) < 2 || review.isPending
                            }
                            onClick={() => review.mutate({ request, action: 'reject' })}
                          >
                            <XCircle />
                            Từ chối
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500">
                        <p>{request.reviewNote || 'Không có ghi chú duyệt'}</p>
                        <p className="mt-1">{formatDate(request.reviewedAt)}</p>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageSection>
    </PageLayout>
  );
}

function Evidence({ documents }: { documents?: VehicleAccessRequest['documents'] }) {
  if (!documents?.length)
    return <span className="text-xs italic text-slate-400">Chưa có minh chứng</span>;
  return (
    <div className="flex flex-wrap gap-2">
      {documents.map((doc) =>
        isImage(doc.mimeType, doc.name) ? (
          <a
            key={doc.id}
            href={doc.url}
            target="_blank"
            rel="noreferrer"
            className="group relative block size-16 overflow-hidden rounded-md border bg-slate-100"
            title={doc.name || 'Xem ảnh'}
          >
            <img
              src={doc.url}
              alt={doc.name || 'Ảnh minh chứng xe'}
              className="size-full object-cover transition group-hover:scale-105"
              loading="lazy"
            />
            <span className="absolute inset-0 grid place-items-center bg-slate-950/0 text-white opacity-0 transition group-hover:bg-slate-950/35 group-hover:opacity-100">
              <ExternalLink className="size-4" />
            </span>
          </a>
        ) : (
          <a
            key={doc.id}
            href={doc.url}
            target="_blank"
            rel="noreferrer"
            className="flex size-16 flex-col items-center justify-center gap-1 rounded-md border bg-slate-50 text-slate-600"
          >
            <FileText className="size-5" />
            <span className="max-w-14 truncate text-[10px]">{doc.name || 'Tài liệu'}</span>
          </a>
        )
      )}
    </div>
  );
}
function EmptyRow({ text }: { text: string }) {
  return (
    <tr>
      <td colSpan={7} className="px-2 py-12 text-center text-slate-500">
        {text}
      </td>
    </tr>
  );
}
