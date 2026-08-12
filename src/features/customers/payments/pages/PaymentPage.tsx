import {
  ArrowLeft,
  Banknote,
  CalendarClock,
  CarFront,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  Loader2,
  QrCode,
  ShieldCheck,
  Wrench,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppointmentDetail } from '@/features/customers/appointments/hooks/useAppointmentDetail';
import { paymentService } from '@/services/paymentService';
import { cn, formatDateTime, formatPrice, formatTime } from '@/lib/utils';
import type { AppointmentPaymentMethod } from '@/types/appointment';

function VnPayLogo() {
  return (
    <img
      src="/images/logobanking/1.png"
      alt="VNPay"
      className="size-14 shrink-0 rounded-lg object-cover"
    />
  );
}

function MomoLogo() {
  return (
    <img
      src="/images/logobanking/2..png"
      alt="Momo"
      className="size-14 shrink-0 rounded-lg object-cover"
    />
  );
}

function CashLogo() {
  return (
    <img
      src="/images/logobanking/3.png"
      alt="Tiền mặt"
      className="size-14 shrink-0 rounded-lg object-cover"
    />
  );
}

const paymentMethods: Array<{
  id: AppointmentPaymentMethod;
  label: string;
  description: string;
  logo: React.ComponentType;
  enabled: boolean;
}> = [
  {
    id: 'vnpay',
    label: 'VNPay',
    description: 'Thanh toán qua cổng VNPay - QR code hoặc Internet Banking',
    logo: VnPayLogo,
    enabled: true,
  },
  {
    id: 'momo',
    label: 'Momo',
    description: 'Thanh toán qua ví điện tử Momo',
    logo: MomoLogo,
    enabled: true,
  },
  {
    id: 'cash',
    label: 'Tiền mặt',
    description: 'Thanh toán trực tiếp tại gara sau khi hoàn thành dịch vụ',
    logo: CashLogo,
    enabled: true,
  },
];

const QR_EXPIRY_SECONDS = 900; // 15 minutes

function formatCountdown(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function PaymentQrPopup({
  open,
  onOpenChange,
  method,
  amount,
  onConfirmPaid,
  isProcessing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  method: 'vnpay' | 'momo' | null;
  amount: number;
  onConfirmPaid: () => void;
  isProcessing: boolean;
}) {
  const [countdown, setCountdown] = useState(QR_EXPIRY_SECONDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = useCallback(() => {
    setCountdown(QR_EXPIRY_SECONDS);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (open) {
      const timeoutId = setTimeout(startCountdown, 0);
      return () => {
        clearTimeout(timeoutId);
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [open, startCountdown]);

  if (!method) return null;

  const isVnPay = method === 'vnpay';
  const brandLabel = isVnPay ? 'VNPay' : 'Momo';
  const Logo = isVnPay ? VnPayLogo : MomoLogo;

  const isExpired = countdown <= 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] gap-0 rounded-xl border border-[#e5edf6] p-0 shadow-[0_18px_44px_rgba(15,23,42,0.12)]">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#e5edf6] px-6 py-4">
          <Logo />
          <div>
            <DialogTitle className="text-lg font-black text-[#15243a]">
              Thanh toán qua {brandLabel}
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-sm text-[#64748b]">
              Quét mã QR để thanh toán
            </DialogDescription>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center px-6 py-6">
          <div className="relative rounded-xl border-2 border-dashed border-[#e5edf6] bg-slate-50 p-5">
            <QrCode className="size-44 text-[#64748b]" />
            {isExpired ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-white/90">
                <Clock3 className="size-10 text-[#64748b]" />
                <p className="mt-2 text-sm font-semibold text-[#64748b]">Mã QR đã hết hạn</p>
              </div>
            ) : null}
          </div>

          {/* Countdown */}
          <div className="mt-4 flex items-center gap-2">
            <Clock3 className={cn('size-4', isExpired ? 'text-rose-500' : 'text-[#64748b]')} />
            <span
              className={cn(
                'text-sm font-semibold',
                isExpired ? 'text-rose-500' : 'text-[#64748b]'
              )}
            >
              {isExpired ? 'Đã hết hạn' : `Còn lại: ${formatCountdown(countdown)}`}
            </span>
          </div>
        </div>

        {/* Payment info */}
        <div className="border-t border-[#e5edf6] bg-slate-50 px-6 py-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#64748b]">Số tiền thanh toán</span>
              <span className="text-lg font-black text-[#15243a]">{formatPrice(amount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#64748b]">Phương thức</span>
              <span className="text-sm font-semibold text-[#15243a]">{brandLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#64748b]">Mã giao dịch</span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-[#15243a]">Đang tạo...</span>
                <button type="button" className="text-[#0b67c2] hover:text-[#0857a3]">
                  <Copy className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 border-t border-[#e5edf6] px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="h-[42px] flex-1 rounded-md"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          {isExpired ? (
            <Button
              type="button"
              className="h-[42px] flex-1 rounded-md shadow-[0_12px_26px_rgba(11,103,194,0.24)]"
              onClick={startCountdown}
            >
              Tạo mã mới
            </Button>
          ) : (
            <Button
              type="button"
              className="h-[42px] flex-1 rounded-md shadow-[0_12px_26px_rgba(11,103,194,0.24)]"
              onClick={onConfirmPaid}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Đã thanh toán xong'
              )}
            </Button>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 border-t border-[#e5edf6] px-6 py-3">
          <ShieldCheck className="size-4 text-emerald-600" />
          <span className="text-xs text-[#64748b]">Thanh toán được bảo mật bởi {brandLabel}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CashConfirmPopup({
  open,
  onOpenChange,
  amount,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] gap-0 rounded-xl border border-[#e5edf6] p-0 shadow-[0_18px_44px_rgba(15,23,42,0.12)]">
        <div className="flex items-center gap-3 border-b border-[#e5edf6] px-6 py-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
            <Banknote className="size-6 text-emerald-700" />
          </div>
          <div>
            <DialogTitle className="text-lg font-black text-[#15243a]">
              Thanh toán tiền mặt
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-sm text-[#64748b]">
              Xác nhận sẽ thanh toán tại gara
            </DialogDescription>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#64748b]">Số tiền</span>
              <span className="text-xl font-black text-[#15243a]">{formatPrice(amount)}</span>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[#64748b]">
            Bạn chọn thanh toán bằng tiền mặt tại gara. Admin sẽ xác nhận thanh toán sau khi bạn
            hoàn tất dịch vụ.
          </p>
        </div>

        <div className="flex gap-3 border-t border-[#e5edf6] px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="h-[42px] flex-1 rounded-md"
            onClick={() => onOpenChange(false)}
          >
            Quay lại
          </Button>
          <Button
            type="button"
            className="h-[42px] flex-1 rounded-md shadow-[0_12px_26px_rgba(11,103,194,0.24)]"
            onClick={onConfirm}
          >
            <CheckCircle2 className="size-4" />
            Xác nhận
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function PaymentPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<AppointmentPaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showQrPopup, setShowQrPopup] = useState(false);
  const [showCashPopup, setShowCashPopup] = useState(false);

  const { data: appointment, isLoading, isError } = useAppointmentDetail(appointmentId ?? null);

  const paymentStatus = searchParams.get('status');

  const handlePayment = async () => {
    if (!selectedMethod || !appointmentId) {
      return;
    }

    if (selectedMethod === 'cash') {
      setShowCashPopup(true);
      return;
    }

    // VNPay / Momo: show QR popup
    setShowQrPopup(true);
  };

  const handleQrConfirmPaid = async () => {
    if (!selectedMethod || !appointmentId || selectedMethod === 'cash') {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const result = await paymentService.createPayment({
        appointmentId,
        method: selectedMethod,
      });

      window.location.href = result.paymentUrl;
    } catch (error) {
      setPaymentError(
        error instanceof Error ? error.message : 'Không thể tạo thanh toán. Vui lòng thử lại.'
      );
      setIsProcessing(false);
    }
  };

  const handleCashConfirm = () => {
    setShowCashPopup(false);
    setSelectedMethod(null);
    navigate('/customer/appointments');
  };

  if (isLoading) {
    return (
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-[#f8fafc] px-4">
        <div className="w-full max-w-[1040px] space-y-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </main>
    );
  }

  if (isError || !appointment) {
    return (
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-[#f8fafc] px-4">
        <section className="w-full max-w-[560px] rounded-xl border border-rose-200 bg-white px-6 py-12 text-center shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
          <XCircle className="mx-auto size-12 text-rose-500" />
          <h2 className="mt-4 text-xl font-black text-[#15243a]">Không tìm thấy lịch hẹn</h2>
          <p className="mt-2 text-sm text-[#64748b]">
            Lịch hẹn không tồn tại hoặc bạn không có quyền truy cập.
          </p>
        </section>
      </main>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-[#f8fafc] px-4">
        <section className="w-full max-w-[560px] rounded-xl border border-[#e5edf6] bg-white px-6 py-12 text-center shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="size-8 text-emerald-600" />
          </div>
          <h2 className="mt-5 text-2xl font-black text-[#15243a]">Thanh toán thành công</h2>
          <p className="mt-2 text-sm text-[#64748b]">
            Cảm ơn bạn đã thanh toán. Lịch hẹn của bạn đã được xác nhận thanh toán.
          </p>
          <Button
            className="mt-6 h-[42px] rounded-md shadow-[0_12px_26px_rgba(11,103,194,0.24)]"
            onClick={() => navigate('/customer/appointments')}
          >
            Quay lại lịch hẹn
          </Button>
        </section>
      </main>
    );
  }

  if (paymentStatus === 'failure') {
    return (
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-[#f8fafc] px-4">
        <section className="w-full max-w-[560px] rounded-xl border border-[#e5edf6] bg-white px-6 py-12 text-center shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-rose-50">
            <XCircle className="size-8 text-rose-600" />
          </div>
          <h2 className="mt-5 text-2xl font-black text-[#15243a]">Thanh toán thất bại</h2>
          <p className="mt-2 text-sm text-[#64748b]">
            Giao dịch không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
          </p>
          <Button
            className="mt-6 h-[42px] rounded-md shadow-[0_12px_26px_rgba(11,103,194,0.24)]"
            onClick={() => (window.location.href = `/customer/payment/${appointmentId}`)}
          >
            Thử lại
          </Button>
        </section>
      </main>
    );
  }

  const serviceNames = appointment.services.map((s) => s.nameSnapshot).join(', ');
  const discountedPrice = appointment.finalAmount ?? appointment.totalPrice;
  const originalPrice =
    appointment.subtotalPrice ?? appointment.services.reduce((sum, s) => sum + s.priceSnapshot, 0);
  const hasDiscount = originalPrice > discountedPrice;

  return (
    <main className="min-h-[calc(100vh-73px)] bg-[#f8fafc] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1040px] space-y-5">
        {/* Back button */}
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#0b67c2] transition hover:text-[#0857a3]"
          onClick={() => navigate('/customer/appointments')}
        >
          <ArrowLeft className="size-4" />
          Quay về Chi tiết lịch hẹn của bạn
        </button>

        {/* Header */}
        <section className="rounded-xl border border-[#e5edf6] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] sm:p-6">
          <div className="inline-flex items-center border-l-[4px] border-[#ff7a1a] pl-3 text-xs font-black uppercase tracking-[0.2em] text-[#0b67c2]">
            <CreditCard className="mr-2 size-4" />
            Thanh toán
          </div>
          <h1 className="mt-3 text-3xl font-black leading-[1.15] tracking-tight text-[#15243a] sm:text-4xl">
            Thanh toán lịch hẹn
          </h1>
          <p className="mt-2 text-sm text-[#64748b]">
            Chọn phương thức thanh toán cho lịch hẹn của bạn.
          </p>
        </section>

        {/* Two-column layout: Appointment details + Payment methods */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Left column: Chi tiết lịch hẹn */}
          <section className="rounded-xl border border-[#e5edf6] bg-white p-4 shadow-[0_18px_44px_rgba(15,23,42,0.08)] sm:p-5">
            <h3 className="text-sm font-black uppercase tracking-[0.12em] text-[#0b67c2]">
              Chi tiết lịch hẹn
            </h3>
            <div className="mt-4 grid gap-3">
              <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                <Wrench className="mt-0.5 size-5 shrink-0 text-[#0b67c2]" />
                <div className="min-w-0">
                  <p className="font-black text-[#15243a]">{serviceNames}</p>
                  <p className="text-sm text-[#64748b]">{appointment.services.length} dịch vụ</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                <CarFront className="mt-0.5 size-5 shrink-0 text-[#0b67c2]" />
                <div className="min-w-0">
                  <p className="font-black text-[#15243a]">
                    {appointment.vehicleId.brand} {appointment.vehicleId.model}
                  </p>
                  <p className="text-sm text-[#64748b]">{appointment.vehicleId.licensePlate}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                <CalendarClock className="mt-0.5 size-5 shrink-0 text-[#0b67c2]" />
                <div className="min-w-0">
                  <p className="font-black text-[#15243a]">
                    {formatDateTime(appointment.scheduledAt, { weekday: 'long' })}
                  </p>
                  <p className="text-sm text-[#64748b]">
                    {formatTime(appointment.totalEstimatedDuration)} dự kiến
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-[#e5edf6] bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-black text-[#15243a]">Tổng thanh toán</span>
                <div className="text-right">
                  {hasDiscount ? (
                    <span className="mr-2 text-sm text-red-500 line-through">
                      {formatPrice(originalPrice)}
                    </span>
                  ) : null}
                  <span className="text-xl font-black text-[#0b67c2]">
                    {formatPrice(discountedPrice)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Right column: Chọn phương thức thanh toán */}
          <section className="rounded-xl border border-[#e5edf6] bg-white p-4 shadow-[0_18px_44px_rgba(15,23,42,0.08)] sm:p-5">
            <h3 className="text-sm font-black uppercase tracking-[0.12em] text-[#0b67c2]">
              Chọn phương thức thanh toán
            </h3>
            <div className="mt-4 grid gap-3">
              {paymentMethods
                .filter((m) => m.enabled)
                .map((method) => {
                  const Logo = method.logo;
                  const isSelected = selectedMethod === method.id;

                  return (
                    <button
                      key={method.id}
                      type="button"
                      className={cn(
                        'flex w-full items-center gap-4 rounded-lg border p-4 text-left transition',
                        isSelected
                          ? 'border-[#0b67c2] bg-[#0b67c2]/5 shadow-[0_0_0_1px_#0b67c2]'
                          : 'border-[#e5edf6] bg-white hover:border-[#0b67c2]/30 hover:shadow-sm'
                      )}
                      onClick={() => setSelectedMethod(method.id)}
                    >
                      <Logo />
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-[#15243a]">{method.label}</p>
                        <p className="mt-1 text-sm text-[#64748b]">{method.description}</p>
                      </div>
                      {isSelected ? (
                        <CheckCircle2 className="size-5 shrink-0 text-[#0b67c2]" />
                      ) : (
                        <div className="size-5 shrink-0 rounded-full border-2 border-[#e5edf6]" />
                      )}
                    </button>
                  );
                })}
            </div>

            {paymentError ? (
              <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {paymentError}
              </div>
            ) : null}

            <Button
              className="mt-5 h-[42px] w-full rounded-md shadow-[0_12px_26px_rgba(11,103,194,0.24)]"
              disabled={!selectedMethod || isProcessing}
              onClick={handlePayment}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : selectedMethod === 'cash' ? (
                <>
                  <Banknote className="size-4" />
                  Xác nhận thanh toán tiền mặt
                </>
              ) : (
                <>
                  <CreditCard className="size-4" />
                  Thanh toán qua {selectedMethod === 'vnpay' ? 'VNPay' : 'Momo'}
                </>
              )}
            </Button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#64748b]">
              <ShieldCheck className="size-4 text-emerald-600" />
              Thanh toán được bảo mật bởi{' '}
              {selectedMethod === 'vnpay'
                ? 'VNPay'
                : selectedMethod === 'momo'
                  ? 'Momo'
                  : 'AutoWash Pro'}
            </div>
          </section>
        </div>
      </div>

      <PaymentQrPopup
        open={showQrPopup}
        onOpenChange={setShowQrPopup}
        method={selectedMethod === 'vnpay' || selectedMethod === 'momo' ? selectedMethod : null}
        amount={discountedPrice}
        onConfirmPaid={handleQrConfirmPaid}
        isProcessing={isProcessing}
      />

      <CashConfirmPopup
        open={showCashPopup}
        onOpenChange={setShowCashPopup}
        amount={discountedPrice}
        onConfirm={handleCashConfirm}
      />
    </main>
  );
}
