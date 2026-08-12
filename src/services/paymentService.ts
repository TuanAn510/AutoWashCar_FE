import api from '@/api/client';
import type { ApiEnvelope } from '@/types/api';
import type {
  CreatePaymentPayload,
  PaymentResult,
} from '@/types/appointment';

export const paymentService = {
  async createPayment(payload: CreatePaymentPayload) {
    const response = await api.post<ApiEnvelope<PaymentResult>>(
      `/appointments/${payload.appointmentId}/payment`,
      { method: payload.method }
    );

    return response.data.data;
  },
};