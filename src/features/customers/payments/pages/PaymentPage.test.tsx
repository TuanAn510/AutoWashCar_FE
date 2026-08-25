// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';

import { queryKeys } from '@/constants/queryKeys';
import PaymentPage from '@/features/customers/payments/pages/PaymentPage';

vi.mock('@/features/customers/appointments/hooks/useAppointmentDetail', () => ({
  useAppointmentDetail: () => ({ data: undefined, isLoading: false, isError: false }),
}));

afterEach(cleanup);

describe('VNPay result retry UX', () => {
  it('shows a retryable message, refreshes caches, and navigates without page reload', async () => {
    const client = new QueryClient();
    const invalidate = vi.spyOn(client, 'invalidateQueries');

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/customer/payment/result/99?status=failure']}>
          <Routes>
            <Route path="/customer/payment/result/:appointmentId" element={<PaymentPage />} />
            <Route path="/customer/payment/:appointmentId" element={<p>Retry payment form</p>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Chưa thanh toán')).toBeTruthy();
    expect(screen.queryByText('Thanh toán chưa hoàn tất')).toBeNull();
    expect(screen.queryByText('Đã hủy thanh toán')).toBeNull();
    expect(screen.queryByText('Thanh toán thành công')).toBeNull();
    await waitFor(() => {
      expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.appointments.all });
      expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.payments.all });
    });

    fireEvent.click(screen.getByRole('button', { name: 'Thanh toán' }));
    expect(await screen.findByText('Retry payment form')).toBeTruthy();
  });
});
