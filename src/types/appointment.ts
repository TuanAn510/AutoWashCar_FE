export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'in_queue'
  | 'in_progress'
  | 'completed'
  | 'cancelled';
export type AppointmentPaymentMethod = 'cash' | 'vnpay' | 'momo';
export type AppointmentPaymentStatus = 'unpaid' | 'paid' | 'cancelled' | 'pending';

export interface AppointmentCustomer {
  _id: string;
  displayName: string;
  phone: string;
  avatarUrl?: string;
}

export interface AppointmentVehicle {
  _id: string;
  brand: string;
  model: string;
  licensePlate: string;
  year: number;
  carType?: string;
}

export interface AppointmentAssignedStaff {
  _id: string;
  displayName: string;
  phone: string;
  avatarUrl?: string;
}

export interface AppointmentCancelledBy {
  _id: string;
  displayName: string;
  phone: string;
  role: 'admin' | 'staff' | 'customer';
}

export interface AppointmentServiceSnapshot {
  serviceId: string;
  nameSnapshot: string;
  priceSnapshot: number;
  estimatedDurationSnapshot: number;
  rewardMultiplierSnapshot?: number;
  rewardPointsSnapshot?: number;
}

export interface AppointmentPromotionDiscountSnapshot {
  title?: string;
  code?: string;
  type?: 'percentage' | 'fixed_amount' | 'bonus_points' | 'free_service';
  discountValue?: number | null;
  bonusPoints?: number | null;
  discountAmount?: number;
}

export interface AppointmentMembershipTier {
  _id: string;
  name: string;
  discountPercent: number;
}

export interface AppointmentMembershipTierDiscountSnapshot {
  name?: string;
  discountPercent?: number;
  discountAmount?: number;
}

export interface AppointmentRewardRedemption {
  _id: string;
  rewardId?:
    | string
    | {
        _id: string;
        name: string;
        discountType: 'percentage' | 'fixed_amount';
        discountValue: number;
      };
  status: 'available' | 'used' | 'expired' | 'cancelled';
}

export interface AppointmentRewardDiscountSnapshot {
  name?: string;
  discountType?: 'percentage' | 'fixed_amount';
  discountValue?: number | null;
  pointsUsed?: number | null;
  discountAmount?: number;
}

export interface AppointmentPromotionRef {
  _id: string;
  title: string;
  code: string;
  type: 'percentage' | 'fixed_amount' | 'bonus_points' | 'free_service';
  discountValue?: number | null;
  bonusPoints?: number | null;
}

export interface AppointmentItem {
  _id: string;
  customerId: AppointmentCustomer;
  vehicleId: AppointmentVehicle;
  assignedStaffId: AppointmentAssignedStaff | null;
  assignedStaffIds?: AppointmentAssignedStaff[];
  cancelledBy: AppointmentCancelledBy | null;
  services: AppointmentServiceSnapshot[];
  scheduledAt: string;
  note?: string;
  status: AppointmentStatus;
  totalEstimatedDuration: number;
  subtotalPrice?: number;
  discountAmount?: number;
  totalPrice: number;
  finalAmount?: number;
  promotionBonusPoints?: number;
  membershipTierId?: string | AppointmentMembershipTier | null;
  membershipTierDiscountSnapshot?: AppointmentMembershipTierDiscountSnapshot | null;
  promotionId?: string | AppointmentPromotionRef | null;
  promotionDiscountSnapshot?: AppointmentPromotionDiscountSnapshot | null;
  rewardRedemptionId?: string | AppointmentRewardRedemption | null;
  rewardDiscountSnapshot?: AppointmentRewardDiscountSnapshot | null;
  paymentMethod: AppointmentPaymentMethod;
  paymentStatus: AppointmentPaymentStatus;
  cancelReason?: string | null;
  refundRequired?: boolean;
  cancelledAt?: string | null;
  checkInAt?: string | null;
  serviceStartedAt?: string | null;
  completedAt?: string | null;
  checkInImageUrl?: string | null;
  completionImageUrl?: string | null;
  statusHistory?: AppointmentStatusHistoryItem[];
  paidAt?: string | null;
  pointsEarned?: number;
  isPointsAwarded?: boolean;
  pointsAwardedAt?: string | null;
  carTypeSnapshot?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppointmentStatusHistoryItem {
  id: number;
  oldStatus?: AppointmentStatus | null;
  newStatus: AppointmentStatus;
  actorId?: string | null;
  actorName?: string | null;
  actorRole?: 'admin' | 'staff' | 'customer' | null;
  changedAt: string;
  evidenceImageUrl?: string | null;
  note?: string | null;
}

export interface PriorityQueueItem {
  bookingId: number;
  scheduledAt: string;
  customerName: string;
  licensePlate: string;
  tierName: string;
  priorityLevel: number;
  status: 'in_queue' | 'in_progress';
  finalAmount: number;
  checkInAt: string | null;
  waitingMinutes: number | null;
  serviceDurationMinutes: number;
  position: number | null;
}

export interface CreateAppointmentPayload {
  vehicleId: string;
  services: Array<{ serviceId: string }>;
  scheduledAt: string;
  note?: string;
  promotionId?: string;
  rewardRedemptionId?: string;
}

export interface BookingAvailabilitySlot {
  startAt: string;
  endAt: string;
  available: boolean;
  reason: string | null;
}

export interface BookingAvailability {
  date: string;
  bookingWindowDays: number | null;
  slots: BookingAvailabilitySlot[];
  vehicleAvailabilityReason?: string | null;
}

export interface BookingAvailabilityParams {
  date: string;
  vehicleId?: string;
  serviceId?: string;
  rewardRedemptionId?: string;
}

export interface BookingCandidateAvailability {
  startAt: string;
  endAt: string;
  available: boolean;
  reason: string | null;
  nearestAvailableStartAt: string | null;
}

export interface BookingCandidateAvailabilityParams {
  scheduledAt: string;
  vehicleId: string;
  serviceId: string;
  rewardRedemptionId?: string;
}
export interface CancelAppointmentPayload {
  appointmentId: string;
  cancelReason?: string;
}

export interface AdminAppointmentFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: AppointmentStatus;
  staffId?: string;
  customerId?: string;
  paymentStatus?: AppointmentPaymentStatus;
  hasPayment?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'scheduledAt' | 'createdAt' | 'totalPrice' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface AppointmentStatusSummary {
  total: number;
  pending: number;
  confirmed: number;
  inQueue: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

export interface UpdateAppointmentStatusPayload {
  status: AppointmentStatus;
  evidenceImage?: File | null;
}

export interface UpdateAppointmentPaymentStatusPayload {
  paymentStatus: 'paid';
  paymentMethod: AppointmentPaymentMethod;
}

export interface AssignStaffPayload {
  staffId?: string;
  staffIds?: string[];
}

export interface RescheduleAppointmentPayload {
  scheduledAt: string;
}

export interface CancelAppointmentByAdminPayload {
  cancelReason?: string;
}

export interface AppointmentListResult {
  appointments: AppointmentItem[];
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  total?: number;
}

export interface CreatePaymentPayload {
  appointmentId: string;
  method: AppointmentPaymentMethod;
}

export interface PaymentResult {
  paymentUrl: string;
  paymentId: string;
  method: AppointmentPaymentMethod;
  amount: number;
  expiresAt: string;
  qrCodeUrl?: string;
}

export interface PaymentCallbackParams {
  appointmentId: string;
  paymentId: string;
  vnp_ResponseCode?: string;
  vnp_TransactionStatus?: string;
  resultCode?: string;
  message?: string;
  [key: string]: string | undefined;
}
