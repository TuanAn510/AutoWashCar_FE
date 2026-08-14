import { PageSection } from '@/components/common/PageSection';
import { PageLayout } from '@/components/layout/PageLayout';
import { useMemo, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
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
import { resolveImageUrl } from '@/lib/image-url';
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
function suggestedVehicleText(request: VehicleAccessRequest) {
  return [request.suggestedBrandName, request.suggestedModelName].filter(Boolean).join(' · ');
}

export default function VehicleAccessRequestsPage() {
  // Cho phép lọc sẵn theo biển số khi chuyển từ "Quản lý xe" sang (nút Xác minh).
  const [searchParams] = useSearchParams();
  const initialKeyword = searchParams.get('keyword') ?? '';
  const [status, setStatus] = useState<VehicleAccessRequestStatus | 'all'>(
    initialKeyword ? 'all' : 'pending'
  );
  const [requestType, setRequestType] = useState<
    'brand_model_verification' | 'access_request' | 'combined'
  >('brand_model_verification');
  const [keyword, setKeyword] = useState(initialKeyword);
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
        variables.action === 'approve'
          ? 'Đã chấp thuận hãng/dòng xe đề xuất.'
          : 'Đã từ chối hãng/dòng xe đề xuất.'
      );
    },
    onError: () => toast.error('Không thể cập nhật yêu cầu. Vui lòng thử lại.'),
  });
  const requests = query.data ?? EMPTY_REQUESTS;
  const isCombined = (item: VehicleAccessRequest) =>
    (item.requestType ?? 'access_request') === 'access_request' &&
    Boolean(item.suggestedBrandName || item.suggestedModelName);
  const matchesType = (item: VehicleAccessRequest) => {
    if (requestType === 'brand_model_verification')
      return (item.requestType ?? 'access_request') === 'brand_model_verification';
    if (requestType === 'combined') return isCombined(item);
    return (item.requestType ?? 'access_request') === 'access_request' && !isCombined(item);
  };
  const filtered = useMemo(() => {
    const word = keyword.trim().toLocaleLowerCase('vi');
    return requests.filter((item) => {
      const text = [
        item.licensePlate,
        item.relationship,
        item.note,
        personName(item),
        item.suggestedBrandName,
        item.suggestedModelName,
      ]
        .join(' ')
        .toLocaleLowerCase('vi');
      return matchesType(item)
        && (status === 'all' || item.status === status)
        && (!word || text.includes(word));
    });
  }, [keyword, requestType, requests, status]);

  // Khi chuyển từ "Quản lý xe" (có ?keyword=biển số): tự chọn đúng tab chứa
  // request của xe đó (ưu tiên request đang chờ) thay vì mặc định tab hãng/dòng.
  useEffect(() => {
    if (!initialKeyword) return;
    const word = initialKeyword.toLocaleLowerCase('vi');
    const priority = { pending: 0, rejected: 1, approved: 2 } as const;
    const matched =
      requests
        .filter((item) => item.licensePlate.toLocaleLowerCase('vi').includes(word))
        .sort(
          (a, b) =>
            (priority[a.status] ?? 3) - (priority[b.status] ?? 3)
        );
    const target = matched[0];
    if (!target) return;
    if ((target.requestType ?? 'access_request') === 'brand_model_verification') {
      setRequestType('brand_model_verification');
    } else if (isCombined(target)) {
      setRequestType('combined');
    } else {
      setRequestType('access_request');
    }
    // Chỉ chạy khi dữ liệu tải về; không cần phụ thuộc keyword (lọc theo request).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests]);

  const count = (value: VehicleAccessRequestStatus) =>
    requests.filter((item) => item.status === value).length;
  const notePlaceholder =
    requestType === 'brand_model_verification'
      ? 'Ghi chú xác minh hãng/dòng xe (ít nhất 2 ký tự)'
      : requestType === 'combined'
        ? 'Ghi chú xác minh biển số lẫn hãng/dòng (ít nhất 2 ký tự)'
        : 'Ghi chú xác minh biển số/quyền sử dụng (ít nhất 2 ký tự)';

  return (
    <PageLayout>
      <section>
        <h1 className="text-3xl font-bold text-slate-950 sm:text-4xl">Xác minh xe</h1>
        <p className="mt-2 text-base text-slate-500">
          Tách riêng yêu cầu xác minh hãng/dòng xe và xác minh biển số/quyền sử dụng.
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
        <div className="grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            className={cn(
              'rounded-xl border px-4 py-3 text-left text-sm font-semibold transition',
              requestType === 'brand_model_verification'
                ? 'border-sky-200 bg-sky-50 text-sky-800'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            )}
            onClick={() => setRequestType('brand_model_verification')}
          >
            Xác minh hãng/dòng xe
            <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">
              {requests.filter((item) => item.requestType === 'brand_model_verification').length}
            </span>
          </button>
          <button
            type="button"
            className={cn(
              'rounded-xl border px-4 py-3 text-left text-sm font-semibold transition',
              requestType === 'access_request'
                ? 'border-sky-200 bg-sky-50 text-sky-800'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            )}
            onClick={() => setRequestType('access_request')}
          >
            Xác minh biển số/quyền sử dụng
            <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">
              {
                requests.filter(
                  (item) =>
                    (item.requestType ?? 'access_request') === 'access_request' &&
                    !item.suggestedBrandName &&
                    !item.suggestedModelName
                ).length
              }
            </span>
          </button>
          <button
            type="button"
            className={cn(
              'rounded-xl border px-4 py-3 text-left text-sm font-semibold transition',
              requestType === 'combined'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            )}
            onClick={() => setRequestType('combined')}
          >
            Xác minh biển + hãng/dòng xe
            <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">
              {
                requests.filter(
                  (item) =>
                    (item.requestType ?? 'access_request') === 'access_request' &&
                    Boolean(item.suggestedBrandName || item.suggestedModelName)
                ).length
              }
            </span>
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_190px]">
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
                  <td className="px-2 py-4">
                    <p className="font-semibold text-slate-950">{request.licensePlate}</p>
                    {suggestedVehicleText(request) ? (
                      <p className="mt-1 max-w-56 text-xs text-slate-500">
                        Hãng/Dòng đề xuất: {suggestedVehicleText(request)}
                      </p>
                    ) : null}
                  </td>
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
                          placeholder={notePlaceholder}
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

  const brandModelDocs = documents.filter((d) => d.documentType === 'BRAND_MODEL');
  const plateDocs = documents.filter(
    (d) => d.documentType === 'PLATE' || d.documentType == null
  );
  // Hiện 2 nhóm tách biệt (hãng/dòng + biển số) nếu cả hai đều có tài liệu;
  // ngược lại hiện 1 nhóm không nhãn như trước để khỏi rối.
  const groups: { label?: string; docs: (typeof documents)[number][] }[] = [];
  if (brandModelDocs.length && plateDocs.length) {
    if (brandModelDocs.length) groups.push({ label: 'Hãng/Dòng', docs: brandModelDocs });
    if (plateDocs.length) groups.push({ label: 'Biển số', docs: plateDocs });
    return (
      <div className="space-y-2">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {group.label}
            </p>
            <DocThumbnails documents={group.docs} />
          </div>
        ))}
      </div>
    );
  }
  return <DocThumbnails documents={brandModelDocs.length ? brandModelDocs : plateDocs} />;
}

function DocThumbnails({ documents }: { documents: VehicleAccessRequest['documents'] }) {
  if (!documents?.length)
    return <span className="text-xs italic text-slate-400">Chưa có minh chứng</span>;
  return (
    <div className="flex flex-wrap gap-2">
      {documents.map((doc) =>
        isImage(doc.mimeType, doc.name) ? (
          <a
            key={doc.id}
            href={resolveImageUrl(doc.url)}
            target="_blank"
            rel="noreferrer"
            className="group relative block size-16 overflow-hidden rounded-md border bg-slate-100"
            title={doc.name || 'Xem ảnh'}
          >
            <img
              src={resolveImageUrl(doc.url)}
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
            href={resolveImageUrl(doc.url)}
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
