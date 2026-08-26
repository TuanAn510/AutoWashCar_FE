import api from '@/api/client';
import type { ApiEnvelope } from '@/types/api';

export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
  startMonth?: string;
  endMonth?: string;
}

export interface MonthRangeParams {
  startMonth: string;
  endMonth: string;
}

export interface RevenueReportParams extends DateRangeParams {
  period?: ReportPeriod;
}

export interface RankedReportParams extends DateRangeParams {
  limit?: number;
}

export interface DashboardOverview {
  totalCustomers: number;
  totalVehicles: number;
  totalAppointments: number;
  totalCompletedAppointments: number;
  totalServicesCompleted: number;
  totalActivePromotions: number;
  totalLoyaltyMembers: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  revenue: {
    total: number;
    source: string;
  };
}

export interface RevenueReportItem {
  year?: number;
  month?: number;
  period: string;
  revenue: number;
  completedServicesCount: number;
}

export interface RevenueReport {
  period: ReportPeriod;
  source: string;
  data: RevenueReportItem[];
}

export interface AppointmentReport {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  pendingAppointments: number;
  completionRate: number;
  cancellationRate: number;
  groupedByMonth: Array<{
    year: number;
    month: number;
    period: string;
    total: number;
  }>;
}

export interface CustomerReport {
  totalCustomers: number;
  newCustomersInRange: number;
  newCustomersThisMonth: number;
  activeCustomers: number;
  returningCustomers: number;
  assumptions?: Record<string, string>;
}

export interface ServiceReportItem {
  serviceId: string;
  serviceName: string;
  usageCount: number;
  revenue: number;
}

export interface ServiceReport {
  limit: number;
  mostBookedServices: ServiceReportItem[];
  leastBookedServices: ServiceReportItem[];
}

export interface LoyaltyReport {
  totalLoyaltyMembers: number;
  pointsIssued: number;
  pointsRedeemed: number;
  pointsExpired: number;
  membershipTierDistribution: Array<{
    tier: string;
    total: number;
  }>;
}

export interface PromotionReport {
  totalPromotions: number;
  activePromotions: number;
  expiredPromotions: number;
  promotionUsageCount: number;
  distributionByType: Array<{
    type: string;
    total: number;
  }>;
}

export interface VehicleReport {
  totalVehicles: number;
  vehiclesByBrand: Array<{
    brand: string;
    total: number;
  }>;
  mostCommonVehicleBrands: Array<{
    brand: string;
    total: number;
  }>;
}

export interface StaffPerformanceReport {
  staff: Array<{
    staffId: string;
    staffName: string;
    assignedBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    activeBookings: number;
    completionRate: number;
    attributedRevenue: number;
    averageServiceMinutes: number;
  }>;
}

export interface ServiceTimeReport {
  measuredWaitingBookings: number;
  measuredServiceBookings: number;
  averageWaitingMinutes: number;
  averageServiceMinutes: number;
  onTimeBookings: number;
  onTimeRate: number;
  groupedByMonth: Array<{
    year: number;
    month: number;
    period: string;
    bookings: number;
    averageWaitingMinutes: number;
    averageServiceMinutes: number;
  }>;
}

export interface PromotionEffectivenessReport {
  bookingsWithPromotion: number;
  bookingsWithoutPromotion: number;
  totalDiscount: number;
  promotionRevenue: number;
  revenueWithoutPromotion: number;
  averageOrderWithPromotion: number;
  averageOrderWithoutPromotion: number;
  promotions: Array<{
    promotionId: string;
    code: string;
    title: string;
    usageCount: number;
    uniqueCustomers: number;
    totalDiscount: number;
    revenue: number;
    averageOrderValue: number;
  }>;
}

export interface CustomerRetentionReport {
  customersWithCompletedBookings: number;
  oneTimeCustomers: number;
  returningCustomers: number;
  loyalCustomers: number;
  atRiskCustomers: number;
  inactiveCustomers: number;
  retentionRate: number;
  segments: Array<{ segment: string; customers: number }>;
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    completedBookings: number;
    totalSpent: number;
    lastCompletedAt: string | null;
  }>;
}

export interface ProjectReport {
  architecture: string;
  features: string[];
  databaseConstraints: string[];
  hostingInfo: string;
  links: Record<string, string>;
  [key: string]: unknown;
}

export interface ReportsStatistics {
  revenue: RevenueReport;
  appointments: AppointmentReport;
  customers: CustomerReport;
  services: ServiceReport;
  loyalty: LoyaltyReport;
  promotions: PromotionReport;
  vehicles: VehicleReport;
  staffPerformance: StaffPerformanceReport;
  serviceTimes: ServiceTimeReport;
  promotionEffectiveness: PromotionEffectivenessReport;
  customerRetention: CustomerRetentionReport;
}

const getData = async <T>(url: string, params?: object, signal?: AbortSignal) => {
  const response = await api.get<ApiEnvelope<T>>(url, { params, signal });
  return response.data.data;
};

export const reportApi = {
  getOverview: (signal?: AbortSignal) =>
    getData<DashboardOverview>('/dashboard/overview', undefined, signal),
  getRevenue: (params?: RevenueReportParams, signal?: AbortSignal) =>
    getData<RevenueReport>('/reports/revenue', params, signal),
  getAppointments: (params?: DateRangeParams, signal?: AbortSignal) =>
    getData<AppointmentReport>('/reports/appointments', params, signal),
  getCustomers: (params?: DateRangeParams, signal?: AbortSignal) =>
    getData<CustomerReport>('/reports/customers', params, signal),
  getServices: (params?: RankedReportParams, signal?: AbortSignal) =>
    getData<ServiceReport>('/reports/services', params, signal),
  getLoyalty: (params?: DateRangeParams, signal?: AbortSignal) =>
    getData<LoyaltyReport>('/reports/loyalty', params, signal),
  getPromotions: (params?: DateRangeParams, signal?: AbortSignal) =>
    getData<PromotionReport>('/reports/promotions', params, signal),
  getVehicles: (params?: DateRangeParams, signal?: AbortSignal) =>
    getData<VehicleReport>('/reports/vehicles', params, signal),
  getStaffPerformance: (params?: DateRangeParams, signal?: AbortSignal) =>
    getData<StaffPerformanceReport>('/reports/staff-performance', params, signal),
  getServiceTimes: (params?: DateRangeParams, signal?: AbortSignal) =>
    getData<ServiceTimeReport>('/reports/service-times', params, signal),
  getPromotionEffectiveness: (params?: DateRangeParams, signal?: AbortSignal) =>
    getData<PromotionEffectivenessReport>('/reports/promotion-effectiveness', params, signal),
  getCustomerRetention: (params?: DateRangeParams, signal?: AbortSignal) =>
    getData<CustomerRetentionReport>('/reports/customer-retention', params, signal),
  exportBookingsCsv: async (params?: DateRangeParams, signal?: AbortSignal) => {
    const response = await api.get<Blob>('/admin/reports/export/bookings.csv', {
      params,
      signal,
      responseType: 'blob',
    });
    return response.data;
  },

  exportAnalytics: async (
    format: 'xlsx' | 'pdf',
    params?: DateRangeParams,
    signal?: AbortSignal
  ) => {
    const response = await api.get<Blob>(`/admin/reports/export/analytics.${format}`, {
      params,
      signal,
      responseType: 'blob',
    });
    return response.data;
  },

  getProjectReport: (signal?: AbortSignal) =>
    getData<ProjectReport>('/project-report', undefined, signal),

  async getStatistics(
    params?: RevenueReportParams & RankedReportParams,
    signal?: AbortSignal
  ): Promise<ReportsStatistics> {
    const dateParams: DateRangeParams = {
      startDate: params?.startDate,
      endDate: params?.endDate,
      startMonth: params?.startMonth,
      endMonth: params?.endMonth,
    };

    const [
      revenue,
      appointments,
      customers,
      services,
      loyalty,
      promotions,
      vehicles,
      staffPerformance,
      serviceTimes,
      promotionEffectiveness,
      customerRetention,
    ] =
      await Promise.all([
        reportApi.getRevenue(
          {
            ...dateParams,
            period: params?.period ?? 'monthly',
          },
          signal
        ),
        reportApi.getAppointments(dateParams, signal),
        reportApi.getCustomers(dateParams, signal),
        reportApi.getServices(
          {
            ...dateParams,
            limit: params?.limit ?? 5,
          },
          signal
        ),
        reportApi.getLoyalty(dateParams, signal),
        reportApi.getPromotions(dateParams, signal),
        reportApi.getVehicles(dateParams, signal),
        reportApi.getStaffPerformance(dateParams, signal),
        reportApi.getServiceTimes(dateParams, signal),
        reportApi.getPromotionEffectiveness(dateParams, signal),
        reportApi.getCustomerRetention(dateParams, signal),
      ]);

    return {
      revenue,
      appointments,
      customers,
      services,
      loyalty,
      promotions,
      vehicles,
      staffPerformance,
      serviceTimes,
      promotionEffectiveness,
      customerRetention,
    };
  },
};
