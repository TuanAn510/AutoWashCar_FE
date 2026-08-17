// @vitest-environment jsdom
import type { PropsWithChildren, ReactNode } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CarFront } from 'lucide-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Button } from '@/components/ui/button';
import { CreateAppointmentModal } from '@/features/customers/appointments/components/CreateAppointmentModal';
import { CustomerEmptyState } from '@/features/customers/components/CustomerEmptyState';

const defaultSlots: Array<{ startAt: string; available: boolean; reason: string | null }> = ['08:00', '08:05', '08:10', '08:15', '08:20'].map((time) => ({
  startAt: `2099-08-13T${time}:00`,
  available: true,
  reason: null,
}));

let availability = { slots: defaultSlots, vehicleAvailabilityReason: null as string | null };

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQuery: () => ({ data: availability, isLoading: false, isError: false }),
  };
});

vi.mock('@/features/customers/components/CustomerModalShell', () => ({
  CustomerModalShell: ({
    title,
    children,
    footer,
    headerAside,
  }: PropsWithChildren<{
    title: ReactNode;
    footer?: ReactNode;
    headerAside?: ReactNode;
  }>) => (
    <div>
      <h1>{title}</h1>
      {headerAside}
      <main>{children}</main>
      <footer>{footer}</footer>
    </div>
  ),
}));

vi.mock('@/features/customers/vehicles/hooks/useMyVehicles', () => ({
  useMyVehicles: () => ({
    data: {
      vehicles: [
        {
          _id: 'vehicle-1',
          brand: 'Toyota',
          model: 'Camry',
          year: 2024,
          licensePlate: '30A12345',
        },
      ],
    },
    isLoading: false,
    isError: false,
  }),
}));

vi.mock('@/features/shared/service-categories/hooks/useActiveServiceCategories', () => ({
  useActiveServiceCategories: () => ({
    data: [{ _id: 'category-1', name: 'Chăm sóc xe' }],
    isLoading: false,
    isError: false,
  }),
}));

vi.mock('@/features/admin/services/hooks/useServices', () => ({
  useActiveServices: () => ({
    data: [
      {
        _id: 'service-1',
        name: 'Rửa xe',
        description: 'Rửa xe tiêu chuẩn',
        price: 150000,
        estimatedDuration: 45,
        categoryId: { _id: 'category-1', name: 'Chăm sóc xe' },
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
  useMyLoyaltyAccount: () => ({
    data: { membershipTierId: null },
    isLoading: false,
    isError: false,
  }),
  useMyRewardRedemptions: () => ({
    data: [],
    isLoading: false,
    isError: false,
  }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

beforeEach(() => {
  vi.spyOn(Date, 'now').mockReturnValue(new Date('2099-08-12T08:00:00').getTime());
  availability = { slots: defaultSlots, vehicleAvailabilityReason: null };
});

describe('customer journey UI', () => {
  it('renders the shared empty state and invokes its primary action', () => {
    const onCreate = vi.fn();

    render(
      <CustomerEmptyState
        icon={<CarFront />}
        title="Bạn chưa có xe nào"
        description="Thêm xe để đặt lịch."
        primaryAction={<Button onClick={onCreate}>Thêm xe</Button>}
      />
    );

    expect(screen.getByText('Bạn chưa có xe nào')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Thêm xe' }));
    expect(onCreate).toHaveBeenCalledOnce();
  });

  it('validates each booking step, preserves values, submits, and shows success', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { container } = render(
      <CreateAppointmentModal
        isOpen
        isSubmitting={false}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    const expectCurrentStep = async (step: number) => {
      await waitFor(() => {
        const stepButtons = container.querySelectorAll(
          'nav[aria-label="Tiến trình đặt lịch"] button'
        );
        expect(stepButtons[step - 1]?.getAttribute('aria-current')).toBe('step');
      });
    };

    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    expect(await screen.findByText('Vui lòng chọn xe của bạn.')).toBeTruthy();

    const vehicleSelect = container.querySelector('select[name="vehicleId"]') as HTMLSelectElement;
    fireEvent.change(vehicleSelect, { target: { value: 'vehicle-1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    await expectCurrentStep(2);

    expect(screen.getByText('Chọn gói dịch vụ')).toBeTruthy();
    const primaryServiceRadio = container.querySelector('input[type="radio"]') as HTMLInputElement;
    fireEvent.click(primaryServiceRadio);
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    await expectCurrentStep(3);

    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    await expectCurrentStep(2);
    expect(vehicleSelect.value).toBe('vehicle-1');
    expect(primaryServiceRadio.checked).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    await expectCurrentStep(3);
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    await expectCurrentStep(4);
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    await expectCurrentStep(5);

    expect(screen.getByText('Kiểm tra thông tin')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận đặt lịch' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          vehicleId: 'vehicle-1',
          services: [{ serviceId: 'service-1' }],
        })
      );
    });
    expect(await screen.findByText('Lịch hẹn đã được tạo')).toBeTruthy();
  });

  it('uses a dropdown-only five-minute appointment-time selector', async () => {
    const { container } = render(
      <CreateAppointmentModal isOpen isSubmitting={false} onOpenChange={vi.fn()} onSubmit={vi.fn()} />
    );

    fireEvent.change(container.querySelector('select[name="vehicleId"]')!, {
      target: { value: 'vehicle-1' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    fireEvent.click(container.querySelector('input[type="radio"]')!);
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));

    expect(container.querySelector('input[type="time"]')).toBeNull();
    const select = await screen.findByLabelText('Chọn khung giờ');
    expect(screen.getByText('08:05')).toBeTruthy();
    fireEvent.change(select, { target: { value: '08:05' } });
    expect((select as HTMLSelectElement).value).toBe('08:05');
  });

  it('keeps capacity-full suggestions visible but disabled with the customer-facing label', async () => {
    availability = {
      slots: [
        ...defaultSlots,
        { startAt: '2099-08-13T08:25:00', available: false, reason: 'CAPACITY_FULL' },
      ],
      vehicleAvailabilityReason: null,
    };
    const { container } = render(
      <CreateAppointmentModal isOpen isSubmitting={false} onOpenChange={vi.fn()} onSubmit={vi.fn()} />
    );

    fireEvent.change(container.querySelector('select[name="vehicleId"]')!, {
      target: { value: 'vehicle-1' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    fireEvent.click(container.querySelector('input[type="radio"]')!);
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));

    const option = await screen.findByRole('option', { name: '08:25 - Hết vị trí rửa' });
    expect((option as HTMLOptionElement).disabled).toBe(true);
  });

  it('does not render structurally impossible end-of-day options', async () => {
    availability = {
      slots: [{ startAt: '2099-08-13T16:15:00', available: true, reason: null }],
      vehicleAvailabilityReason: null,
    };
    const { container } = render(
      <CreateAppointmentModal isOpen isSubmitting={false} onOpenChange={vi.fn()} onSubmit={vi.fn()} />
    );

    fireEvent.change(container.querySelector('select[name="vehicleId"]')!, {
      target: { value: 'vehicle-1' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    fireEvent.click(container.querySelector('input[type="radio"]')!);
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));

    expect(await screen.findByRole('option', { name: '16:15' })).toBeTruthy();
    expect(screen.queryByRole('option', { name: '16:20' })).toBeNull();
    expect(screen.queryByText(/Khung giờ gần nhất có thể đặt/)).toBeNull();
  });

  it('shows one unfinished-vehicle message and disables time selection', async () => {
    availability = { slots: [], vehicleAvailabilityReason: 'VEHICLE_UNFINISHED_BOOKING' };
    const { container } = render(
      <CreateAppointmentModal isOpen isSubmitting={false} onOpenChange={vi.fn()} onSubmit={vi.fn()} />
    );

    fireEvent.change(container.querySelector('select[name="vehicleId"]')!, {
      target: { value: 'vehicle-1' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    fireEvent.click(container.querySelector('input[type="radio"]')!);
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));

    expect(await screen.findByText('Xe này đã có lịch hẹn chưa hoàn thành.')).toBeTruthy();
    expect((screen.getByLabelText('Chọn khung giờ') as HTMLSelectElement).disabled).toBe(true);
  });
});
