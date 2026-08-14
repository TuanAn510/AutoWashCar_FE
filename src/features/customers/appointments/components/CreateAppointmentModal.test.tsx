// @vitest-environment jsdom
import type { PropsWithChildren, ReactNode } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateAppointmentModal } from './CreateAppointmentModal';

const slots = [
  '08:00',
  '08:15',
  '08:30',
  '08:45',
  '09:00',
].map((time) => ({ startAt: `2099-08-13T${time}:00`, available: true, reason: null }));

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQuery: () => ({ data: { slots }, isLoading: false, isError: false }),
  };
});

vi.mock('@/features/customers/components/CustomerModalShell', () => ({
  CustomerModalShell: ({ children, footer }: PropsWithChildren<{ footer?: ReactNode }>) => (
    <div>
      {children}
      <footer>{footer}</footer>
    </div>
  ),
}));

vi.mock('@/components/ui/date-picker', () => ({
  DatePicker: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <input aria-label="Ngày hẹn" type="date" value={value} onChange={(event) => onChange(event.target.value)} />
  ),
}));

vi.mock('@/features/customers/vehicles/hooks/useMyVehicles', () => ({
  useMyVehicles: () => ({
    data: {
      vehicles: [
        { _id: 'vehicle-1', brand: 'Toyota', model: 'Vios', licensePlate: '30A-12345' },
      ],
    },
    isLoading: false,
    isError: false,
  }),
}));

vi.mock('@/features/shared/service-categories/hooks/useActiveServiceCategories', () => ({
  useActiveServiceCategories: () => ({ data: [], isLoading: false, isError: false }),
}));

vi.mock('@/features/admin/services/hooks/useServices', () => ({
  useActiveServices: () => ({
    data: [
      {
        _id: 'service-1',
        name: 'Premium Wash',
        price: 100000,
        estimatedDuration: 45,
        categoryId: { _id: 'category-1', name: 'Wash' },
      },
    ],
    isLoading: false,
    isError: false,
  }),
}));

vi.mock('@/features/admin/promotions/hooks/usePromotions', () => ({
  useActivePromotions: () => ({ data: [], isLoading: false, isError: false }),
}));

vi.mock('@/features/shared/loyalty/hooks/use-loyalty', () => ({
  useMyLoyaltyAccount: () => ({ data: null, isLoading: false, isError: false }),
  useMyRewardRedemptions: () => ({ data: [], isLoading: false, isError: false }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

beforeEach(() => {
  vi.spyOn(Date, 'now').mockReturnValue(new Date('2099-08-12T08:00:00').getTime());
});

const renderAtSchedulingStep = async (onSubmit = vi.fn()) => {
  const result = render(
    <CreateAppointmentModal isOpen isSubmitting={false} onOpenChange={vi.fn()} onSubmit={onSubmit} />
  );

  fireEvent.change(result.container.querySelector('select[name="vehicleId"]')!, {
    target: { value: 'vehicle-1' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
  await waitFor(() => expect(screen.getByRole('radio')).toBeTruthy());
  fireEvent.click(screen.getByRole('radio'));
  fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
  await waitFor(() => expect(result.container.querySelector('input[type="time"]')).toBeTruthy());

  return result;
};

const expectSchedulingStep = async (container: HTMLElement) => {
  await waitFor(() => {
    expect(container.querySelectorAll('nav button')[2]?.getAttribute('aria-current')).toBe('step');
  });
};

describe('CreateAppointmentModal time selection', () => {
  it('offers 15-minute suggestions and preserves arbitrary-minute local submission', async () => {
    const onSubmit = vi.fn();
    const { container } = await renderAtSchedulingStep(onSubmit);
    await waitFor(() => expect(screen.getByLabelText('Chọn nhanh khung giờ')).toBeTruthy());

    const quickSuggestions = screen.getByLabelText('Chọn nhanh khung giờ');
    expect(Array.from((quickSuggestions as HTMLSelectElement).options).map((option) => option.value))
      .toContain('08:15');
    fireEvent.change(quickSuggestions, { target: { value: '08:15' } });

    const timeInput = container.querySelector('input[type="time"]') as HTMLInputElement;
    expect(timeInput.value).toBe('08:15');
    fireEvent.change(timeInput, { target: { value: '09:17' } });
    expect(timeInput.value).toBe('09:17');

    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    await waitFor(() => expect(screen.getByText('Chọn ưu đãi')).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Xác nhận đặt lịch' })).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận đặt lịch' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        services: [{ serviceId: 'service-1' }],
        scheduledAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T09:17:00$/),
      })
    );
    expect(onSubmit.mock.calls[0][0].scheduledAt).not.toContain('Z');
  });

  it.each([
    ['18:45', 'Giờ bắt đầu phải trong khoảng từ 08:00 đến trước 17:00.'],
    ['16:16', 'Thời lượng dịch vụ phải kết thúc không muộn hơn 17:00.'],
  ])('keeps invalid manual time %s on the scheduling step', async (time, errorMessage) => {
    const { container } = await renderAtSchedulingStep();
    fireEvent.change(container.querySelector('input[type="time"]')!, { target: { value: time } });
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));

    expect(await screen.findByText(errorMessage)).toBeTruthy();
    await expectSchedulingStep(container);
  });

  it('allows a 45-minute package at 16:15 and arbitrary minute 09:17', async () => {
    const { container } = await renderAtSchedulingStep();
    const timeInput = container.querySelector('input[type="time"]')!;

    fireEvent.change(timeInput, { target: { value: '16:15' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    await waitFor(() => expect(container.querySelectorAll('nav button')[3]?.getAttribute('aria-current')).toBe('step'));

    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    await expectSchedulingStep(container);
    fireEvent.change(timeInput, { target: { value: '09:17' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    await waitFor(() => expect(container.querySelectorAll('nav button')[3]?.getAttribute('aria-current')).toBe('step'));
  });

  it('blocks a booking time less than 30 minutes in advance', async () => {
    const { container } = await renderAtSchedulingStep();
    fireEvent.change(container.querySelector('input[type="date"]')!, { target: { value: '2099-08-12' } });
    fireEvent.change(container.querySelector('input[type="time"]')!, { target: { value: '08:29' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));

    expect(await screen.findByText('Lịch hẹn phải được đặt trước ít nhất 30 phút.')).toBeTruthy();
    await expectSchedulingStep(container);
  });

  it('returns scheduling rejections from final submission to the scheduling step without clearing form data', async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValue(new Error('Booking duration must end by 17:00'));
    const { container } = await renderAtSchedulingStep(onSubmit);
    const timeInput = container.querySelector('input[type="time"]') as HTMLInputElement;

    fireEvent.change(timeInput, { target: { value: '16:15' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    await waitFor(() => expect(container.querySelectorAll('nav button')[3]?.getAttribute('aria-current')).toBe('step'));
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Xác nhận đặt lịch' })).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận đặt lịch' }));

    expect(await screen.findByText('Booking duration must end by 17:00')).toBeTruthy();
    await expectSchedulingStep(container);
    expect(timeInput.value).toBe('16:15');
    expect((container.querySelector('select[name="vehicleId"]') as HTMLSelectElement).value).toBe(
      'vehicle-1'
    );
  });
});
