import { zodResolver } from '@hookform/resolvers/zod';
import {
  CalendarDays,
  CarFront,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Gift,
  Loader2,
  Wrench,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { getApiErrorMessage } from '@/api/errors';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useMyLoyaltyAccount,
  useMyRewardRedemptions,
} from '@/features/shared/loyalty/hooks/use-loyalty';
import type { Reward, RewardRedemption } from '@/features/shared/loyalty/types/loyalty.types';
import { useActivePromotions } from '@/features/admin/promotions/hooks/usePromotions';
import { useActiveServiceCategories } from '@/features/shared/service-categories/hooks/useActiveServiceCategories';
import { useActiveServices } from '@/features/admin/services/hooks/useServices';
import {
  calculatePromotionDiscount,
  getPromotionReferenceId,
} from '@/features/customers/appointments/utils/appointment-pricing';
import { useMyAppointments } from '@/features/customers/appointments/hooks/useMyAppointments';
import { useMyVehicles } from '@/features/customers/vehicles/hooks/useMyVehicles';
import { formatLicensePlateDisplay } from '@/features/customers/vehicles/utils/license-plate';
import { appointmentApi } from '@/services/appointmentService';
import type { Promotion } from '@/services/promotionService';
import type { BookingAvailabilitySlot, CreateAppointmentPayload } from '@/types/appointment';
import { CustomerModalShell } from '@/features/customers/components/CustomerModalShell';
import { cn, formatTime } from '@/lib/utils';
import { formatServiceRewardMultiplier } from '@/lib/service-reward-points';

const BOOKING_WINDOW_DAYS: Record<string, number> = {
  Member: 7,
  Silver: 10,
  Gold: 12,
  Platinum: 14,
};

const DEFAULT_BOOKING_WINDOW = 7;
const OPENING_HOUR = 8;
const CLOSING_HOUR = 17;
const MINIMUM_LEAD_TIME_MINUTES = 30;

const schedulingErrorMessages = new Set([
  'Booking start time must be between 08:00 and 17:00 with minute precision',
  'Booking must be scheduled at least 30 minutes in advance',
  'Booking duration must end by 17:00',
  'This vehicle already has an appointment in that time range',
  'No active staff is available for booking',
  'Booking capacity is full for this time range',
]);

const createAppointmentSchema = z
  .object({
    vehicleId: z.string().min(1, 'Vui lòng chọn xe của bạn.'),
    categoryId: z.string().min(1, 'Vui lòng chọn danh mục dịch vụ.'),
    serviceIds: z.array(z.string()).length(1, 'Vui lòng chọn đúng một gói dịch vụ.'),
    scheduledDate: z.string().min(1, 'Vui lòng chọn ngày hẹn.'),
    scheduledTime: z.string().min(1, 'Vui lòng chọn giờ hẹn.'),
    note: z.string().trim().max(1000, 'Ghi chú tối đa 1000 ký tự.').optional(),
    promotionId: z.string(),
    rewardRedemptionId: z.string(),
  })
  .superRefine((values, ctx) => {
    if (!values.scheduledDate || !values.scheduledTime) {
      return;
    }

    const scheduledAt = new Date(`${values.scheduledDate}T${values.scheduledTime}`);
    const selectedDate = new Date(`${values.scheduledDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(selectedDate.getTime()) || selectedDate < today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['scheduledDate'],
        message: 'Không thể đặt lịch vào ngày trong quá khứ.',
      });
      return;
    }

    if (Number.isNaN(scheduledAt.getTime()) || scheduledAt <= new Date()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['scheduledTime'],
        message: 'Thời gian hẹn phải ở trong tương lai.',
      });
    }
  });

type CreateAppointmentFormValues = z.infer<typeof createAppointmentSchema>;
type StepField = keyof CreateAppointmentFormValues;

const formId = 'customer-create-appointment-form';
const steps = [
  { label: 'Xe', icon: CarFront, fields: ['vehicleId'] },
  { label: 'Dịch vụ', icon: Wrench, fields: ['categoryId', 'serviceIds'] },
  { label: 'Lịch hẹn', icon: CalendarDays, fields: ['scheduledDate', 'scheduledTime', 'note'] },
  { label: 'Ưu đãi', icon: Gift, fields: [] },
  { label: 'Xem lại', icon: ClipboardCheck, fields: [] },
] satisfies Array<{
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: StepField[];
}>;

export const createDefaultValues = (): CreateAppointmentFormValues => {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const yyyy = tomorrow.getFullYear();
  const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const dd = String(tomorrow.getDate()).padStart(2, '0');

  return {
    vehicleId: '',
    categoryId: 'all',
    serviceIds: [],
    scheduledDate: `${yyyy}-${mm}-${dd}`,
    scheduledTime: '',
    note: '',
    promotionId: '',
    rewardRedemptionId: '',
  };
};

const formatCurrency = (value: number) => `${Math.round(value / 1000)}K`;

const toSlotTime = (startAt: string) => {
  const date = new Date(startAt);
  if (Number.isNaN(date.getTime())) return startAt.slice(11, 16);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

export const resolveAvailableScheduledTime = (
  scheduledTime: string,
  slots: BookingAvailabilitySlot[]
) =>
  slots.some((slot) => slot.available && toSlotTime(slot.startAt) === scheduledTime)
    ? scheduledTime
    : '';

export const serializeScheduledAt = (scheduledDate: string, scheduledTime: string) =>
  `${scheduledDate}T${scheduledTime}:00`;

const availabilityReasonLabels: Record<string, string> = {
  PAST: 'Đã qua',
  LEAD_TIME: 'Cần đặt trước 30 phút',
  OUT_OF_TIER_WINDOW: 'Ngoài hạn đặt',
  NO_STAFF: 'Chưa có staff',
  CAPACITY_FULL: 'Hết vị trí rửa',
};
const getSlotLabel = (slot: BookingAvailabilitySlot) => {
  const time = toSlotTime(slot.startAt);
  if (slot.available || !slot.reason) return time;
  return `${time} - ${availabilityReasonLabels[slot.reason] ?? 'Không khả dụng'}`;
};
const getRedemptionReward = (redemption: RewardRedemption) =>
  typeof redemption.rewardId === 'object' && redemption.rewardId ? redemption.rewardId : null;

const getRewardDiscount = (reward: Reward, subtotalPrice: number) =>
  reward.discountType === 'percentage'
    ? Math.min(subtotalPrice, Math.round((subtotalPrice * reward.discountValue) / 100))
    : Math.min(subtotalPrice, Math.round(reward.discountValue));

const getPromotionLabel = (promotion: Promotion) => {
  if (promotion.type === 'percentage')
    return `${promotion.code} - Giảm ${promotion.discountValue}%`;
  if (promotion.type === 'fixed_amount') {
    return `${promotion.code} - Giảm ${formatCurrency(Number(promotion.discountValue ?? 0))}`;
  }
  if (promotion.type === 'bonus_points')
    return `${promotion.code} - Tặng ${promotion.bonusPoints} điểm`;
  return `${promotion.code} - Miễn phí dịch vụ áp dụng`;
};

const getRewardLabel = (reward: Reward) => {
  const discountLabel =
    reward.discountType === 'percentage'
      ? `Giảm ${reward.discountValue}%`
      : `Giảm ${formatCurrency(reward.discountValue)}`;

  return `${reward.name} - ${discountLabel}`;
};

export const validateLocalScheduledTime = (
  scheduledDate: string,
  scheduledTime: string,
  primaryDurationMinutes: number
) => {
  if (!/^\d{2}:\d{2}$/.test(scheduledTime)) {
    return 'Giờ hẹn phải có độ chính xác đến phút.';
  }

  const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`);
  if (Number.isNaN(scheduledAt.getTime())) return 'Vui lòng chọn giờ hẹn hợp lệ.';

  const startMinutes = scheduledAt.getHours() * 60 + scheduledAt.getMinutes();
  if (startMinutes < OPENING_HOUR * 60 || startMinutes >= CLOSING_HOUR * 60) {
    return 'Giờ bắt đầu phải trong khoảng từ 08:00 đến trước 17:00.';
  }

  if (scheduledAt < new Date(Date.now() + MINIMUM_LEAD_TIME_MINUTES * 60 * 1000)) {
    return 'Lịch hẹn phải được đặt trước ít nhất 30 phút.';
  }

  const scheduledEndAt = new Date(scheduledAt.getTime() + primaryDurationMinutes * 60 * 1000);
  if (
    scheduledEndAt > new Date(`${scheduledDate}T${String(CLOSING_HOUR).padStart(2, '0')}:00:00`)
  ) {
    return 'Thời lượng dịch vụ phải kết thúc không muộn hơn 17:00.';
  }

  return null;
};

interface CreateAppointmentModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateAppointmentPayload) => Promise<void> | void;
}
export function CreateAppointmentModal({
  isOpen,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: CreateAppointmentModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setComplete] = useState(false);
  const [catalogNotice, setCatalogNotice] = useState<string | null>(null);
  const vehiclesQuery = useMyVehicles();
  const appointmentsQuery = useMyAppointments();

  const {
    register,
    setValue,
    setError,
    clearErrors,
    reset,
    trigger,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateAppointmentFormValues>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: createDefaultValues(),
  });

  const values = useWatch({ control }) as CreateAppointmentFormValues;
  const categoriesQuery = useActiveServiceCategories({ enabled: isOpen });
  const servicesQuery = useActiveServices({ limit: 100 }, { enabled: isOpen });
  const promotionsQuery = useActivePromotions({ enabled: isOpen });
  const redemptionsQuery = useMyRewardRedemptions();
  const loyaltyQuery = useMyLoyaltyAccount();

  const vehicles = vehiclesQuery.data?.vehicles ?? [];
  // Chỉ cho phép chọn xe ĐÃ xác minh (approve) để đặt lịch. Xe đang chờ xác
  // minh/admin chưa duyệt hoặc bị từ chối sẽ bị ẩn khỏi dropdown và không thể
  // chọn — backend cũng chặn ở BookingServiceLayer khi submit.
  const bookableVehicles = vehicles.filter(
    (vehicle) => !vehicle.verificationStatus || vehicle.verificationStatus === 'approved'
  );
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
  const unfinishedVehicleIds = useMemo(
    () =>
      new Set(
        (appointmentsQuery.data?.appointments ?? [])
          .filter((appointment) =>
            ['pending', 'confirmed', 'in_queue', 'in_progress'].includes(appointment.status)
          )
          .map((appointment) => appointment.vehicleId._id)
      ),
    [appointmentsQuery.data?.appointments]
  );
  const allServices = useMemo(() => servicesQuery.data ?? [], [servicesQuery.data]);
  const services = useMemo(
    () =>
      values.categoryId === 'all'
        ? allServices
        : allServices.filter((service) => service.categoryId?._id === values.categoryId),
    [allServices, values.categoryId]
  );
  const selectedVehicle = vehicles.find((vehicle) => vehicle._id === values.vehicleId);
  const selectedServices = useMemo(
    () => allServices.filter((service) => values.serviceIds.includes(service._id)),
    [allServices, values.serviceIds]
  );
  const selectedServiceId = values.serviceIds[0] ?? '';
  const selectedServiceVersion = selectedServices[0]?.version ?? 'unavailable';
  const subtotalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const totalDuration = selectedServices.reduce(
    (sum, service) => sum + service.estimatedDuration,
    0
  );
  const totalRewardPoints = selectedServices.reduce(
    (sum, service) => sum + (service.rewardPoints ?? 0),
    0
  );
  const eligiblePromotions = useMemo(
    () =>
      (promotionsQuery.data ?? []).filter((promotion) => {
        if (subtotalPrice < Number(promotion.minOrderAmount ?? 0)) return false;
        if (promotion.type === 'free_service' && !getPromotionReferenceId(promotion.serviceId))
          return false;
        if (promotion.targetType !== 'service') return true;
        return selectedServices.some(
          (service) => service._id === getPromotionReferenceId(promotion.serviceId)
        );
      }),
    [promotionsQuery.data, selectedServices, subtotalPrice]
  );
  const availableRedemptions = (redemptionsQuery.data ?? []).filter((redemption) => {
    const reward = getRedemptionReward(redemption);
    return (
      redemption.status === 'available' &&
      reward &&
      (!reward.expiredAt || new Date(reward.expiredAt) > new Date())
    );
  });
  const selectedPromotion = eligiblePromotions.find(
    (promotion) => promotion._id === values.promotionId
  );
  const selectedRedemption = availableRedemptions.find(
    (redemption) => redemption._id === values.rewardRedemptionId
  );
  const selectedReward = selectedRedemption ? getRedemptionReward(selectedRedemption) : null;
  const selectedBenefitValue = values.promotionId
    ? `promotion:${values.promotionId}`
    : values.rewardRedemptionId
      ? `reward:${values.rewardRedemptionId}`
      : '';
  const membershipTier =
    typeof loyaltyQuery.data?.membershipTierId === 'object'
      ? loyaltyQuery.data.membershipTierId
      : null;
  const tierName = membershipTier?.name ?? 'Member';
  const bookingWindowDays = BOOKING_WINDOW_DAYS[tierName] ?? DEFAULT_BOOKING_WINDOW;
  const maxBookingDate = new Date();
  maxBookingDate.setDate(maxBookingDate.getDate() + bookingWindowDays);
  const membershipDiscount = Math.min(
    subtotalPrice,
    Math.round((subtotalPrice * Number(membershipTier?.discountPercent ?? 0)) / 100)
  );
  const priceAfterMembership = Math.max(0, subtotalPrice - membershipDiscount);
  const promotionDiscount = selectedPromotion
    ? calculatePromotionDiscount(
        selectedPromotion,
        priceAfterMembership,
        selectedServices,
        Number(membershipTier?.discountPercent ?? 0)
      )
    : 0;
  const priceAfterPromotion = Math.max(0, priceAfterMembership - promotionDiscount);
  const rewardDiscount = selectedReward
    ? getRewardDiscount(selectedReward, priceAfterPromotion)
    : 0;
  const estimatedDiscount = membershipDiscount + promotionDiscount + rewardDiscount;
  const estimatedTotal = Math.max(0, subtotalPrice - estimatedDiscount);
  const membershipDiscountStep = 2;
  const promotionDiscountStep = 2 + (membershipDiscount > 0 ? 1 : 0);
  const rewardDiscountStep = 2 + (membershipDiscount > 0 ? 1 : 0) + (promotionDiscount > 0 ? 1 : 0);
  const estimatedTotalStep =
    2 +
    (membershipDiscount > 0 ? 1 : 0) +
    (promotionDiscount > 0 ? 1 : 0) +
    (rewardDiscount > 0 ? 1 : 0);
  const availabilityEnabled = Boolean(
    isOpen && values.scheduledDate && values.vehicleId && selectedServiceId
  );
  const availabilityQuery = useQuery({
    queryKey: [
      'booking-availability',
      values.scheduledDate,
      values.vehicleId,
      selectedServiceId,
      selectedServiceVersion,
      values.rewardRedemptionId,
    ],
    queryFn: ({ signal }) =>
      appointmentApi.getBookingAvailability(
        {
          date: values.scheduledDate,
          vehicleId: values.vehicleId,
          serviceId: selectedServiceId,
          rewardRedemptionId: values.rewardRedemptionId || undefined,
        },
        signal
      ),
    enabled: availabilityEnabled,
    staleTime: 15_000,
  });
  const availabilitySlots = useMemo(
    () => availabilityQuery.data?.slots ?? [],
    [availabilityQuery.data?.slots]
  );
  const availableSlots = useMemo(
    () => availabilitySlots.filter((slot) => slot.available),
    [availabilitySlots]
  );
  const selectedSlot = availabilitySlots.find(
    (slot) => toSlotTime(slot.startAt) === values.scheduledTime
  );
  const vehicleAvailabilityReason = availabilityQuery.data?.vehicleAvailabilityReason;
  const hasUnfinishedVehicleBooking = vehicleAvailabilityReason === 'VEHICLE_UNFINISHED_BOOKING';
  const shouldBlockSelectedSlot =
    availabilityEnabled &&
    !availabilityQuery.isLoading &&
    selectedSlot != null &&
    !selectedSlot.available;
  const shouldBlockScheduleStep =
    currentStep === 2 &&
    (availabilityQuery.isLoading ||
      availabilityQuery.isError ||
      hasUnfinishedVehicleBooking ||
      !selectedSlot?.available ||
      availableSlots.length === 0);

  useEffect(() => {
    if (!availabilityEnabled || availabilityQuery.isLoading || availabilityQuery.isError) return;
    const validTime = resolveAvailableScheduledTime(values.scheduledTime, availabilitySlots);
    if (validTime) return;

    setValue('scheduledTime', '', {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [
    availabilityEnabled,
    availabilityQuery.isError,
    availabilityQuery.isLoading,
    availabilitySlots,
    availableSlots,
    selectedSlot?.available,
    setValue,
    values.scheduledTime,
  ]);

  useEffect(() => {
    if (!isOpen || servicesQuery.isLoading || servicesQuery.isError) return;

    const selectedId = values.serviceIds[0];
    if (selectedId && !allServices.some((service) => service._id === selectedId)) {
      const updateId = window.setTimeout(() => {
        setValue('serviceIds', [], { shouldDirty: true, shouldValidate: true });
        setValue('promotionId', '', { shouldDirty: true });
        setValue('rewardRedemptionId', '', { shouldDirty: true });
        setCurrentStep((step) => Math.min(step, 1));
        setCatalogNotice('Dịch vụ đã chọn vừa ngừng hoạt động. Vui lòng chọn dịch vụ khác.');
      }, 0);
      return () => window.clearTimeout(updateId);
    }
  }, [
    allServices,
    isOpen,
    servicesQuery.isError,
    servicesQuery.isLoading,
    setValue,
    values.serviceIds,
  ]);

  useEffect(() => {
    if (!isOpen || categoriesQuery.isLoading || categoriesQuery.isError) return;
    if (
      values.categoryId !== 'all' &&
      !categories.some((category) => category._id === values.categoryId)
    ) {
      setValue('categoryId', 'all', { shouldDirty: true, shouldValidate: true });
    }
  }, [
    categories,
    categoriesQuery.isError,
    categoriesQuery.isLoading,
    isOpen,
    setValue,
    values.categoryId,
  ]);

  useEffect(() => {
    if (
      values.promotionId &&
      !promotionsQuery.isLoading &&
      !promotionsQuery.isError &&
      !eligiblePromotions.some((promotion) => promotion._id === values.promotionId)
    ) {
      setValue('promotionId', '', { shouldDirty: true });
    }
  }, [
    eligiblePromotions,
    promotionsQuery.isError,
    promotionsQuery.isLoading,
    setValue,
    values.promotionId,
  ]);

  useEffect(() => {
    if (
      values.rewardRedemptionId &&
      !redemptionsQuery.isLoading &&
      !redemptionsQuery.isError &&
      !availableRedemptions.some((redemption) => redemption._id === values.rewardRedemptionId)
    ) {
      setValue('rewardRedemptionId', '', { shouldDirty: true });
    }
  }, [
    availableRedemptions,
    redemptionsQuery.isError,
    redemptionsQuery.isLoading,
    setValue,
    values.rewardRedemptionId,
  ]);

  const resetWizard = () => {
    reset(createDefaultValues());
    setCurrentStep(0);
    setComplete(false);
    setCatalogNotice(null);
  };

  const closeModal = () => {
    resetWizard();
    onOpenChange(false);
  };

  const handleShellOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetWizard();
    }
    onOpenChange(nextOpen);
  };

  const handleSelectPrimaryService = (serviceId: string) => {
    if (values.serviceIds[0] === serviceId) return;

    setValue('serviceIds', [serviceId], { shouldDirty: true, shouldValidate: true });
    setValue('scheduledTime', '', { shouldDirty: true, shouldValidate: true });
    setValue('promotionId', '', { shouldDirty: true });
    setValue('rewardRedemptionId', '', { shouldDirty: true });
    setCatalogNotice(null);
  };

  const handleNext = async () => {
    const isStepValid = await trigger(steps[currentStep].fields, { shouldFocus: true });
    if (!isStepValid) return;

    if (currentStep === 2) {
      const scheduleError = validateLocalScheduledTime(
        values.scheduledDate,
        values.scheduledTime,
        totalDuration
      );
      if (scheduleError) {
        setError(
          'scheduledTime',
          { type: 'validate', message: scheduleError },
          { shouldFocus: true }
        );
        return;
      }
      if (hasUnfinishedVehicleBooking) {
        setError(
          'scheduledTime',
          {
            type: 'validate',
            message: 'Xe này đã có lịch hẹn chưa hoàn thành.',
          },
          { shouldFocus: true }
        );
        return;
      }
      clearErrors('scheduledTime');
    }

    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  };

  const hasFormOptionsError =
    vehiclesQuery.isError || appointmentsQuery.isError || categoriesQuery.isError || servicesQuery.isError;
  const isInitialOptionsLoading =
    vehiclesQuery.isLoading || appointmentsQuery.isLoading || categoriesQuery.isLoading || servicesQuery.isLoading;

  const submitAppointment = handleSubmit(async (formValues) => {
    try {
      await onSubmit({
        vehicleId: formValues.vehicleId,
        services: formValues.serviceIds.map((serviceId) => ({ serviceId })),
        scheduledAt: serializeScheduledAt(formValues.scheduledDate, formValues.scheduledTime),
        note: formValues.note?.trim() || undefined,
        promotionId: formValues.promotionId || undefined,
        rewardRedemptionId: formValues.rewardRedemptionId || undefined,
      });
      setComplete(true);
    } catch (error) {
      const message = getApiErrorMessage(error, 'Không thể đặt lịch. Vui lòng thử lại.');
      if (schedulingErrorMessages.has(message)) {
        setError('scheduledTime', { type: 'server', message }, { shouldFocus: true });
        setCurrentStep(2);
        return;
      }
      throw error;
    }
  });

  const footer = isComplete ? (
    <Button type="button" className="w-full sm:w-40" onClick={closeModal}>
      Hoàn tất
    </Button>
  ) : (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full sm:w-36"
        onClick={() => (currentStep === 0 ? closeModal() : setCurrentStep((step) => step - 1))}
      >
        {currentStep === 0 ? (
          'Hủy'
        ) : (
          <>
            <ChevronLeft className="size-4" />
            Quay lại
          </>
        )}
      </Button>
      {currentStep < steps.length - 1 ? (
        <Button
          type="button"
          className="w-full sm:w-40"
          disabled={isInitialOptionsLoading || hasFormOptionsError || shouldBlockScheduleStep}
          onClick={handleNext}
        >
          Tiếp tục
          <ChevronRight className="size-4" />
        </Button>
      ) : (
        <Button
          type="button"
          className="w-full sm:w-48"
          disabled={isSubmitting || hasFormOptionsError || shouldBlockSelectedSlot}
          onClick={() => void submitAppointment()}
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Check className="size-4" />
          )}
          {isSubmitting ? 'Đang đặt lịch...' : 'Xác nhận đặt lịch'}
        </Button>
      )}
    </>
  );

  return (
    <CustomerModalShell
      open={isOpen}
      onOpenChange={handleShellOpenChange}
      title={isComplete ? 'Đặt lịch thành công' : 'Đặt lịch mới'}
      description={
        isComplete
          ? 'Lịch hẹn đã được ghi nhận và đang chờ gara xác nhận.'
          : 'Hoàn thành từng bước để kiểm tra chính xác dịch vụ, ưu đãi và chi phí.'
      }
      contentClassName="max-w-[920px] sm:max-w-[920px]"
      bodyClassName="grid gap-5"
      footer={footer}
    >
      {isComplete ? (
        <section className="py-8 text-center sm:py-12" role="status">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="size-8" />
          </div>
          <h3 className="mt-5 text-2xl font-black text-[#15243a]">Lịch hẹn đã được tạo</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#64748b]">
            Bạn có thể theo dõi trạng thái và thanh toán ngay trong danh sách lịch hẹn.
          </p>
        </section>
      ) : (
        <>
          <nav aria-label="Tiến trình đặt lịch" className="pt-0.5">
            <ol className="grid grid-cols-5 gap-2">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCurrent = currentStep === index;
                const isVisited = currentStep > index;
                return (
                  <li key={step.label} className="min-w-0">
                    <button
                      type="button"
                      className={cn(
                        'flex min-h-10 w-full min-w-0 items-center justify-center gap-2 rounded-md px-2.5 py-2 text-xs font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:justify-start sm:px-3',
                        isCurrent &&
                          'bg-[#0b67c2] text-white shadow-[0_12px_26px_rgba(11,103,194,0.24)]',
                        isVisited && 'bg-emerald-50 text-emerald-700',
                        !isCurrent && !isVisited && 'bg-slate-100 text-[#64748b]',
                        index > currentStep && 'cursor-not-allowed opacity-80'
                      )}
                      aria-current={isCurrent ? 'step' : undefined}
                      disabled={index > currentStep}
                      onClick={() => index < currentStep && setCurrentStep(index)}
                    >
                      <span
                        className={cn(
                          'flex size-6 shrink-0 items-center justify-center rounded-full',
                          isCurrent && 'bg-white/15',
                          isVisited && 'bg-emerald-100',
                          !isCurrent && !isVisited && 'bg-white/70'
                        )}
                      >
                        {isVisited ? <Check className="size-3.5" /> : <Icon className="size-3.5" />}
                      </span>
                      <span className="hidden truncate sm:block">{step.label}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
          <form id={formId} className="grid gap-5" onSubmit={(event) => event.preventDefault()}>
            {hasFormOptionsError && (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                Không thể tải dữ liệu xe hoặc dịch vụ. Vui lòng thử lại sau.
              </p>
            )}

            {catalogNotice && (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                {catalogNotice}
              </p>
            )}

            <section
              className={cn(
                'rounded-xl border border-[#e5edf6] bg-slate-50 p-4 sm:p-5',
                currentStep !== 0 && currentStep !== 2 && 'hidden'
              )}
            >
              <div className="grid gap-4">
                <Field className={cn('min-w-0', currentStep !== 0 && 'hidden')}>
                  <FieldLabel>Chọn xe</FieldLabel>
                  <select
                    className="h-[46px] rounded-md border border-[#d8e2ef] bg-white px-3 text-sm font-semibold text-[#64748b] outline-none focus:border-[#0b67c2]"
                    disabled={
                      isSubmitting ||
                      vehiclesQuery.isLoading ||
                      appointmentsQuery.isLoading ||
                      !bookableVehicles.length
                    }
                    {...register('vehicleId')}
                    onChange={(event) => {
                      setValue('vehicleId', event.target.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setValue('scheduledTime', '', {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                  >
                    <option value="">Chọn xe của bạn</option>
                    {bookableVehicles.map((vehicle) => (
                      <option
                        key={vehicle._id}
                        value={vehicle._id}
                        disabled={unfinishedVehicleIds.has(vehicle._id)}
                      >
                        {vehicle.brand} {vehicle.model} -{' '}
                        {formatLicensePlateDisplay(vehicle.licensePlate)}
                        {unfinishedVehicleIds.has(vehicle._id)
                          ? ' — Đã có lịch hẹn chưa hoàn thành'
                          : ''}
                      </option>
                    ))}
                  </select>
                  <FieldError>{errors.vehicleId?.message}</FieldError>
                  {!vehiclesQuery.isLoading && vehicles.length && !bookableVehicles.length ? (
                    <p className="mt-1 text-sm text-amber-700">
                      Chưa có xe nào được xác minh xong để đặt lịch. Hãy chờ admin duyệt xe hoặc
                      liên hệ hỗ trợ.
                    </p>
                  ) : null}
                </Field>

                <div
                  className={cn('grid min-w-0 gap-4 sm:grid-cols-2', currentStep !== 2 && 'hidden')}
                >
                  <Field>
                    <FieldLabel>Ngày hẹn</FieldLabel>
                    <DatePicker
                      className="h-11 rounded-xl bg-white"
                      value={values.scheduledDate}
                      onChange={(value) => {
                        setValue('scheduledDate', value, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                        setValue('scheduledTime', '', {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                      disabled={isSubmitting}
                      disabledDates={{ before: new Date(), after: maxBookingDate }}
                      placeholder="Chọn ngày hẹn"
                    />
                    <FieldError>{errors.scheduledDate?.message}</FieldError>
                  </Field>
                  <Field>
                    <FieldLabel>Giờ hẹn</FieldLabel>
                    <select
                      aria-label="Chọn khung giờ"
                      className="h-11 w-full rounded-xl border border-[#d8e2ef] bg-white px-3 text-sm font-semibold text-[#64748b] outline-none focus:border-[#0b67c2]"
                      value={values.scheduledTime}
                      disabled={
                        isSubmitting ||
                        !availabilityEnabled ||
                        availabilityQuery.isLoading ||
                        hasUnfinishedVehicleBooking
                      }
                      onChange={(event) => {
                        setValue('scheduledTime', event.target.value, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                    >
                      <option value="">
                        {availabilityQuery.isLoading
                          ? 'Đang kiểm tra khung giờ...'
                          : 'Chọn khung giờ'}
                      </option>
                      {availabilitySlots.map((slot) => {
                        const time = toSlotTime(slot.startAt);

                        return (
                          <option key={slot.startAt} value={time} disabled={!slot.available}>
                            {getSlotLabel(slot)}
                          </option>
                        );
                      })}
                    </select>
                    {availabilityQuery.isError ? (
                      <FieldError>Không thể kiểm tra slot. Vui lòng thử lại.</FieldError>
                    ) : null}
                    {hasUnfinishedVehicleBooking ? (
                      <FieldError>Xe này đã có lịch hẹn chưa hoàn thành.</FieldError>
                    ) : null}
                    {!availabilityQuery.isError &&
                    !hasUnfinishedVehicleBooking &&
                    availabilityEnabled &&
                    !availabilityQuery.isLoading &&
                    availableSlots.length === 0 ? (
                      <FieldError>Ngày này không còn slot phù hợp.</FieldError>
                    ) : null}
                    {!availabilityQuery.isError &&
                    !hasUnfinishedVehicleBooking &&
                    shouldBlockSelectedSlot &&
                    availableSlots.length > 0 ? (
                      <FieldError>Khung giờ đã chọn không còn khả dụng.</FieldError>
                    ) : null}
                    {currentStep === 2 && !values.scheduledTime && !errors.scheduledTime ? (
                      <FieldError>Vui lòng chọn giờ hẹn.</FieldError>
                    ) : null}
                    <FieldError>{errors.scheduledTime?.message}</FieldError>
                  </Field>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Hạng {tierName}: bạn có thể đặt lịch trước tối đa {bookingWindowDays} ngày.
                </p>
              </div>
            </section>

            <section
              className={cn(
                'rounded-xl border border-[#e5edf6] bg-white p-4 sm:p-5',
                currentStep !== 1 && 'hidden'
              )}
            >
              <Field>
                <FieldLabel>Danh mục dịch vụ</FieldLabel>
                <select
                  className="h-[46px] rounded-md border border-[#d8e2ef] bg-white px-3 text-sm font-semibold text-[#64748b] outline-none focus:border-[#0b67c2]"
                  disabled={isSubmitting || categoriesQuery.isLoading || !categories.length}
                  {...register('categoryId')}
                >
                  <option value="all">Tất cả danh mục</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <FieldError>{errors.categoryId?.message}</FieldError>
              </Field>

              <Field className="mt-4">
                <FieldLabel>Chọn gói dịch vụ</FieldLabel>
                <div className="grid gap-3 sm:grid-cols-2">
                  {servicesQuery.isLoading &&
                    Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton key={index} className="h-24 rounded-2xl" />
                    ))}

                  {!servicesQuery.isLoading && !services.length && (
                    <div className="rounded-xl border border-dashed border-[#e5edf6] bg-slate-50 px-4 py-6 text-sm text-[#64748b] sm:col-span-2">
                      Hiện chưa có dịch vụ đang hoạt động.
                    </div>
                  )}

                  {services.map((service) => {
                    const isSelected = values.serviceIds.includes(service._id);

                    return (
                      <label
                        key={service._id}
                        className={`flex min-w-0 cursor-pointer flex-col gap-2 rounded-lg border p-3 transition ${
                          isSelected
                            ? 'border-[#0b67c2] bg-[#0b67c2] text-white'
                            : 'border-[#e5edf6] bg-white hover:border-[#0b67c2]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold">{service.name}</p>
                            <p
                              className={`mt-1 line-clamp-2 text-sm ${
                                isSelected ? 'text-white/70' : 'text-[#64748b]'
                              }`}
                            >
                              {service.description?.trim() || 'Dịch vụ chăm sóc xe tiêu chuẩn'}
                            </p>
                          </div>
                          <input
                            type="radio"
                            className="mt-1 size-4 accent-slate-950"
                            checked={isSelected}
                            onChange={() => handleSelectPrimaryService(service._id)}
                          />
                        </div>

                        <div
                          className={`flex flex-wrap items-center justify-between gap-2 text-sm ${
                            isSelected ? 'text-slate-100' : 'text-slate-500'
                          }`}
                        >
                          <span>{formatTime(service.estimatedDuration)}</span>
                          <span
                            className={
                              isSelected
                                ? 'font-semibold text-amber-200'
                                : 'font-semibold text-emerald-700'
                            }
                          >
                            +{service.rewardPoints ?? 0} điểm
                            {(service.rewardMultiplier ?? 1) > 1
                              ? ` (${formatServiceRewardMultiplier(service.rewardMultiplier)})`
                              : ''}
                          </span>
                          <span className="font-bold">{formatCurrency(service.price)}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
                {selectedServices.length ? (
                  <div className="mt-4 rounded-xl border border-[#e5edf6] bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-black text-[#15243a]">Gói dịch vụ đã chọn</p>
                    </div>
                    <div className="mt-3 grid gap-2">
                      {selectedServices.map((service) => (
                        <div
                          key={service._id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-[#e5edf6] bg-white px-3 py-2.5"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-[#15243a]">
                              {service.name}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-[#64748b]">
                              {service.categoryId?.name || 'Dịch vụ'} ·{' '}
                              {formatTime(service.estimatedDuration)} · +{service.rewardPoints ?? 0}{' '}
                              điểm
                              {(service.rewardMultiplier ?? 1) > 1
                                ? ` (${formatServiceRewardMultiplier(service.rewardMultiplier)})`
                                : ''}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-3">
                            <span className="text-sm font-black text-[#15243a]">
                              {formatCurrency(service.price)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                <FieldError>{errors.serviceIds?.message}</FieldError>
              </Field>
            </section>

            <section
              className={cn(
                'rounded-xl border border-[#e5edf6] bg-white p-4 sm:p-5',
                currentStep !== 3 && 'hidden'
              )}
            >
              <Field>
                <FieldLabel>Chọn ưu đãi</FieldLabel>
                <select
                  className="h-[46px] w-full rounded-md border border-[#d8e2ef] bg-white px-3 text-sm font-semibold text-[#64748b] outline-none focus:border-[#0b67c2]"
                  value={selectedBenefitValue}
                  disabled={
                    isSubmitting ||
                    !values.serviceIds.length ||
                    promotionsQuery.isLoading ||
                    redemptionsQuery.isLoading
                  }
                  onChange={(event) => {
                    const [source, id = ''] = event.target.value.split(':');
                    setValue('promotionId', source === 'promotion' ? id : '');
                    setValue('rewardRedemptionId', source === 'reward' ? id : '');
                  }}
                >
                  <option value="">Không sử dụng ưu đãi</option>
                  {eligiblePromotions.length ? (
                    <optgroup label="Mã giảm giá của hệ thống">
                      {eligiblePromotions.map((promotion) => (
                        <option key={promotion._id} value={`promotion:${promotion._id}`}>
                          Mã hệ thống · {getPromotionLabel(promotion)}
                        </option>
                      ))}
                    </optgroup>
                  ) : null}
                  {availableRedemptions.length ? (
                    <optgroup label="Phần thưởng của tôi">
                      {availableRedemptions.map((redemption) => {
                        const reward = getRedemptionReward(redemption);
                        if (!reward) return null;
                        return (
                          <option key={redemption._id} value={`reward:${redemption._id}`}>
                            Phần thưởng của tôi · {getRewardLabel(reward)}
                          </option>
                        );
                      })}
                    </optgroup>
                  ) : null}
                </select>

                <p className="text-xs text-slate-500">
                  Mỗi lịch hẹn chỉ áp dụng một mã giảm giá hệ thống hoặc một phần thưởng của bạn.
                </p>

                {promotionsQuery.isError || redemptionsQuery.isError || loyaltyQuery.isError ? (
                  <p className="text-sm text-amber-700">
                    Không thể tải đầy đủ ưu đãi. Bạn vẫn có thể đặt lịch không dùng ưu đãi.
                  </p>
                ) : null}

                {!promotionsQuery.isLoading &&
                !redemptionsQuery.isLoading &&
                !eligiblePromotions.length &&
                !availableRedemptions.length ? (
                  <p className="text-sm text-slate-500">
                    Chưa có ưu đãi phù hợp cho các dịch vụ đã chọn.
                  </p>
                ) : null}

                {selectedPromotion?.type === 'bonus_points' ? (
                  <p className="text-sm text-emerald-700">
                    Bạn sẽ nhận thêm {selectedPromotion.bonusPoints ?? 0} điểm sau khi lịch hoàn
                    thành và đã thanh toán.
                  </p>
                ) : null}
              </Field>
            </section>

            {currentStep === 4 ? (
              <section className="grid gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">Kiểm tra thông tin</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Xác nhận lại trước khi gửi yêu cầu đến gara.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ReviewItem
                    label="Xe"
                    value={
                      selectedVehicle
                        ? `${selectedVehicle.brand} ${selectedVehicle.model} · ${formatLicensePlateDisplay(selectedVehicle.licensePlate)}`
                        : 'Chưa chọn'
                    }
                  />
                  <ReviewItem
                    label="Thời gian"
                    value={`${values.scheduledDate} · ${values.scheduledTime}`}
                  />
                  <ReviewItem
                    label="Dịch vụ"
                    value={selectedServices.map((service) => service.name).join(', ')}
                  />
                  <ReviewItem label="Thời lượng dự kiến" value={formatTime(totalDuration)} />
                  <ReviewItem label="Điểm sẽ nhận" value={`+${totalRewardPoints} điểm`} />
                </div>
                {values.note?.trim() ? (
                  <ReviewItem label="Ghi chú" value={values.note.trim()} />
                ) : null}
              </section>
            ) : null}

            {values.serviceIds.length && (currentStep === 3 || currentStep === 4) ? (
              <section className="rounded-xl border border-[#e5edf6] bg-slate-50 p-4 text-sm sm:p-5">
                <div className="flex justify-between gap-4 text-[#64748b]">
                  <span>1. Tạm tính</span>
                  <span className="font-semibold">{formatCurrency(subtotalPrice)}</span>
                </div>
                {membershipDiscount > 0 ? (
                  <>
                    <div className="mt-2 flex justify-between gap-4 text-emerald-700">
                      <span>
                        {membershipDiscountStep}. Giảm giá thành viên ({membershipTier?.name})
                      </span>
                      <span>-{formatCurrency(membershipDiscount)}</span>
                    </div>
                    <div className="mt-1 flex justify-between gap-4 border-t border-dashed border-[#e5edf6] pt-1.5 text-[#15243a]">
                      <span className="text-xs font-semibold">→ Thành tiền</span>
                      <span className="font-bold">{formatCurrency(priceAfterMembership)}</span>
                    </div>
                  </>
                ) : null}
                {promotionDiscount > 0 ? (
                  <>
                    <div className="mt-2 flex justify-between gap-4 text-emerald-700">
                      <span>
                        {promotionDiscountStep}. Khuyến mãi ({selectedPromotion?.code})
                      </span>
                      <span>-{formatCurrency(promotionDiscount)}</span>
                    </div>
                    <div className="mt-1 flex justify-between gap-4 border-t border-dashed border-[#e5edf6] pt-1.5 text-[#15243a]">
                      <span className="text-xs font-semibold">→ Thành tiền</span>
                      <span className="font-bold">{formatCurrency(priceAfterPromotion)}</span>
                    </div>
                  </>
                ) : null}
                {rewardDiscount > 0 ? (
                  <div className="mt-2 flex justify-between gap-4 text-emerald-700">
                    <span>
                      {rewardDiscountStep}. Phần thưởng ({selectedReward?.name})
                    </span>
                    <span>-{formatCurrency(rewardDiscount)}</span>
                  </div>
                ) : null}
                <div className="mt-3 flex justify-between gap-4 border-t border-[#e5edf6] pt-3 font-black text-[#15243a]">
                  <span>{estimatedTotalStep}. Tổng thanh toán dự kiến</span>
                  <span className="text-base">{formatCurrency(estimatedTotal)}</span>
                </div>
                <div className="mt-2 flex justify-between gap-4 text-emerald-700">
                  <span>Điểm nhận sau khi hoàn tất</span>
                  <span className="font-bold">+{totalRewardPoints} điểm</span>
                </div>
                <p className="mt-2 text-xs text-[#64748b]">
                  Hệ thống sẽ kiểm tra điều kiện và tính tổng tiền chính thức khi tạo lịch.
                </p>
              </section>
            ) : null}

            <section
              className={cn(
                'rounded-xl border border-[#e5edf6] bg-white p-4 sm:p-5',
                currentStep !== 2 && 'hidden'
              )}
            >
              <Field>
                <FieldLabel>Ghi chú thêm</FieldLabel>
                <textarea
                  className="min-h-24 rounded-md border border-[#d8e2ef] bg-white px-3 py-2 text-sm outline-none focus:border-[#0b67c2]"
                  placeholder="Ví dụ: cần kiểm tra thêm nội thất, ưu tiên khung giờ sáng..."
                  disabled={isSubmitting}
                  {...register('note')}
                />
                <FieldError>{errors.note?.message}</FieldError>
              </Field>
            </section>
          </form>
        </>
      )}
    </CustomerModalShell>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg bg-slate-50 px-4 py-3">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#64748b]">{label}</p>
      <p className="mt-1 break-words text-sm font-black text-[#15243a]">{value}</p>
    </div>
  );
}
