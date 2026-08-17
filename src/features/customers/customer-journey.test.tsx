// @vitest-environment jsdom
import type { PropsWithChildren, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CarFront } from 'lucide-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Button } from '@/components/ui/button';
import { CreateAppointmentModal } from '@/features/customers/appointments/components/CreateAppointmentModal';
import { CustomerEmptyState } from '@/features/customers/components/CustomerEmptyState';

const slots = ['08:00', '08:15', '08:30', '08:45', '09:00'].map((time) => ({
  startAt: `2099-08-13T${time}:00`,
  available: true,
  reason: null,
}));

let candidateAvailability = {
  startAt: '2099-08-13T09:17:00',
  endAt: '2099-08-13T10:02:00',
  available: true,
  reason: null as string | null,
  nearestAvailableStartAt: null as string | null,
};
let candidateAvailabilityLoading = false;

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQuery: (options: { queryKey: unknown[] }) => {
      if (options.queryKey[0] === 'booking-availability-check') {
        return {
          data: candidateAvailability,
          isLoading: candidateAvailabilityLoading,
          isError: false,
        };
      }
      return { data: { slots }, isLoading: false, isError: false };
    },
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

vi.mock('@/services/appointmentService', () => ({
  appointmentApi: {
    getBookingAvailability: vi.fn(({ date }: { date: string }) =>
      Promise.resolve({
        date,
        bookingWindowDays: 7,
        slots: [
          {
            startAt: `${date}T09:00:00`,
            available: true,
            reason: null,
          },
        ],
      })
    ),
  },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderWithQueryClient(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

beforeEach(() => {
  vi.spyOn(Date, 'now').mockReturnValue(new Date('2099-08-12T08:00:00').getTime());
  candidateAvailability = {
    startAt: '2099-08-13T09:17:00',
    endAt: '2099-08-13T10:02:00',
    available: true,
    reason: null,
    nearestAvailableStartAt: null,
  };
  candidateAvailabilityLoading = false;
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
    const { container } = renderWithQueryClient(
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

  it('keeps manual 09:17, shows an available precheck, and retains quick suggestions', async () => {
    const { container } = render(
      <CreateAppointmentModal isOpen isSubmitting={false} onOpenChange={vi.fn()} onSubmit={vi.fn()} />
    );

    fireEvent.change(container.querySelector('select[name="vehicleId"]')!, {
      target: { value: 'vehicle-1' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    fireEvent.click(container.querySelector('input[type="radio"]')!);
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));

    const timeInput = await waitFor(() => container.querySelector('input[type="time"]') as HTMLInputElement);
    fireEvent.change(timeInput, { target: { value: '09:17' } });

    expect(timeInput.value).toBe('09:17');
    expect(await screen.findByText('Khung giờ này còn chỗ.')).toBeTruthy();
    expect(screen.getByLabelText('Chọn nhanh khung giờ')).toBeTruthy();
  });

  it.each([
    [true, false, null, 'Đang kiểm tra khung giờ...'],
    [false, false, 'VEHICLE_OVERLAP', 'Xe của bạn đã có lịch trong khoảng thời gian này.'],
    [false, false, 'CAPACITY_FULL', 'Khung giờ này hiện đã đủ vị trí rửa.'],
  ])('blocks Continue for manual candidate precheck state', async (loading, available, reason, message) => {
    candidateAvailabilityLoading = loading;
    candidateAvailability = { ...candidateAvailability, available, reason };
    const { container } = render(
      <CreateAppointmentModal isOpen isSubmitting={false} onOpenChange={vi.fn()} onSubmit={vi.fn()} />
    );

    fireEvent.change(container.querySelector('select[name="vehicleId"]')!, {
      target: { value: 'vehicle-1' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    fireEvent.click(container.querySelector('input[type="radio"]')!);
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    fireEvent.change(await waitFor(() => container.querySelector('input[type="time"]')!), {
      target: { value: '09:17' },
    });

    expect(await screen.findByText(message)).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Tiếp tục' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('keeps the manual time and applies an arbitrary nearest available time without snapping', async () => {
    candidateAvailability = {
      ...candidateAvailability,
      available: false,
      reason: 'VEHICLE_OVERLAP',
      nearestAvailableStartAt: '2099-08-13T09:23:00',
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

    const timeInput = await waitFor(() => container.querySelector('input[type="time"]') as HTMLInputElement);
    fireEvent.change(timeInput, { target: { value: '09:17' } });

    expect(await screen.findByText('Khung giờ gần nhất có thể đặt: 09:23')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Chọn 09:23' }));
    expect(timeInput.value).toBe('09:23');
  });
});
