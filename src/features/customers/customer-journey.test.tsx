// @vitest-environment jsdom
import type { PropsWithChildren, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CarFront } from 'lucide-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Button } from '@/components/ui/button';
import { AppointmentCard } from '@/features/customers/appointments/components/AppointmentCard';
import { CreateAppointmentModal } from '@/features/customers/appointments/components/CreateAppointmentModal';
import CustomerAppointmentsPage from '@/features/customers/appointments/pages/CustomerAppointmentsPage';
import { CustomerEmptyState } from '@/features/customers/components/CustomerEmptyState';
import { formatDateTime } from '@/lib/utils';
import type { AppointmentItem } from '@/types/appointment';

const defaultSlots: Array<{
  startAt: string;
  endAt: string;
  available: boolean;
  reason: string | null;
}> = [
  '08:00',
  '08:05',
  '08:10',
  '08:15',
  '08:20',
].map((time) => ({
  startAt: `2099-08-13T${time}:00`,
  endAt: `2099-08-13T${time}:00`,
  available: true,
  reason: null,
}));

let availability = { slots: defaultSlots, vehicleAvailabilityReason: null as string | null };
let pageAppointments: AppointmentItem[] = [];
const defaultActiveServices = [
  {
    _id: 'service-1',
    name: 'Rửa xe',
    description: 'Rửa xe tiêu chuẩn',
    price: 150000,
    estimatedDuration: 45,
    baseRewardPoints: 15,
    rewardMultiplier: 2,
    rewardPoints: 30,
    version: 0,
    categoryId: { _id: 'category-1', name: 'Chăm sóc xe' },
  },
];
let activeServices = defaultActiveServices;

const appointmentCardItem = (paymentStatus: AppointmentItem['paymentStatus']): AppointmentItem => ({
  _id: 'appointment-1',
  customerId: { _id: 'customer-1', displayName: 'Khách hàng', phone: '0900000000' },
  vehicleId: {
    _id: 'vehicle-1',
    brand: 'Toyota',
    model: 'Camry',
    licensePlate: '30A12345',
    year: 2024,
  },
  assignedStaffId: null,
  cancelledBy: null,
  services: [
    {
      serviceId: 'service-1',
      nameSnapshot: 'Rửa xe',
      priceSnapshot: 150000,
      estimatedDurationSnapshot: 45,
    },
  ],
  scheduledAt: '2099-08-13T09:00:00',
  status: 'pending',
  totalEstimatedDuration: 45,
  totalPrice: 150000,
  paymentMethod: 'cash',
  paymentStatus,
  createdAt: '2099-08-12T18:24:00',
});

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
        {
          _id: 'vehicle-2',
          brand: 'Honda',
          model: 'City',
          year: 2023,
          licensePlate: '51B67890',
        },
        {
          _id: 'vehicle-3',
          brand: 'Mazda',
          model: '3',
          year: 2022,
          licensePlate: '61A99999',
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
    data: activeServices,
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
            endAt: `${date}T09:30:00`,
            available: true,
            reason: null,
          },
        ],
      })
    ),
  },
}));

vi.mock('react-router', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('@/features/customers/appointments/hooks/useMyAppointments', () => ({
  useMyAppointments: () => ({
    data: { appointments: pageAppointments },
    isLoading: false,
    isError: false,
  }),
}));

vi.mock('@/features/customers/appointments/hooks/useCreateAppointment', () => ({
  useCreateAppointment: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));

vi.mock('@/features/customers/appointments/hooks/useCancelAppointment', () => ({
  useCancelAppointment: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));

vi.mock('@/features/customers/appointments/store/useCustomerAppointmentsStore', () => ({
  useCustomerAppointmentsStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      isCreateModalOpen: false,
      openCreateModal: vi.fn(),
      closeCreateModal: vi.fn(),
      detailAppointment: null,
      openDetailDialog: vi.fn(),
      closeDetailDialog: vi.fn(),
      cancelAppointment: null,
      openCancelDialog: vi.fn(),
      closeCancelDialog: vi.fn(),
    }),
}));

vi.mock('@/features/customers/appointments/components/AppointmentList', () => ({
  AppointmentList: ({ appointments }: { appointments: AppointmentItem[] }) => (
    <div data-testid="appointment-list">
      {appointments.map((appointment) => `${appointment._id},`)}
    </div>
  ),
}));

vi.mock('@/features/customers/appointments/components/AppointmentDetailDialog', () => ({
  AppointmentDetailDialog: () => null,
}));

vi.mock('@/features/customers/appointments/components/CancelAppointmentDialog', () => ({
  CancelAppointmentDialog: () => null,
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
  availability = { slots: defaultSlots, vehicleAvailabilityReason: null };
  pageAppointments = [];
  activeServices = defaultActiveServices;
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
    expect(screen.getAllByText('+30 điểm (×2)').length).toBeGreaterThan(0);
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
    const timeSelect = await screen.findByLabelText('Chọn khung giờ');
    expect((timeSelect as HTMLSelectElement).value).toBe('');
    expect(screen.getByText('Vui lòng chọn giờ hẹn.')).toBeTruthy();
    fireEvent.change(timeSelect, { target: { value: '08:05' } });
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
      <CreateAppointmentModal
        isOpen
        isSubmitting={false}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />
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

  it('removes a selected service when the live catalog deactivates it', async () => {
    const { container } = renderWithQueryClient(
      <CreateAppointmentModal
        isOpen
        isSubmitting={false}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    fireEvent.change(container.querySelector('select[name="vehicleId"]')!, {
      target: { value: 'vehicle-1' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    fireEvent.click(container.querySelector('input[type="radio"]')!);

    activeServices = [];
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));

    expect(
      await screen.findByText('Dịch vụ đã chọn vừa ngừng hoạt động. Vui lòng chọn dịch vụ khác.')
    ).toBeTruthy();
    expect(container.querySelector('input[type="radio"]')).toBeNull();
  });

  it('keeps capacity-full suggestions visible but disabled with the customer-facing label', async () => {
    availability = {
      slots: [
        ...defaultSlots,
        {
          startAt: '2099-08-13T08:25:00',
          endAt: '2099-08-13T08:55:00',
          available: false,
          reason: 'CAPACITY_FULL',
        },
      ],
      vehicleAvailabilityReason: null,
    };
    const { container } = render(
      <CreateAppointmentModal
        isOpen
        isSubmitting={false}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />
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

  it('shows different labels for past and lead-time availability reasons', async () => {
    availability = {
      slots: [
        {
          startAt: '2099-08-13T08:00:00',
          endAt: '2099-08-13T08:30:00',
          available: false,
          reason: 'PAST',
        },
        {
          startAt: '2099-08-13T08:05:00',
          endAt: '2099-08-13T08:35:00',
          available: false,
          reason: 'LEAD_TIME',
        },
      ],
      vehicleAvailabilityReason: null,
    };
    const { container } = render(
      <CreateAppointmentModal
        isOpen
        isSubmitting={false}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    fireEvent.change(container.querySelector('select[name="vehicleId"]')!, {
      target: { value: 'vehicle-1' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    fireEvent.click(container.querySelector('input[type="radio"]')!);
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));

    expect(await screen.findByRole('option', { name: '08:00 - Đã qua' })).toHaveProperty(
      'disabled',
      true
    );
    expect(screen.getByRole('option', { name: '08:05 - Cần đặt trước 30 phút' })).toHaveProperty(
      'disabled',
      true
    );
  });

  it('hides cancellation for paid pending appointments and shows the explicit creation time', () => {
    const { rerender } = render(
      <AppointmentCard
        appointment={appointmentCardItem('paid')}
        onViewDetail={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: 'Hủy lịch' })).toBeNull();
    expect(
      screen.getByText(`Đặt lúc: ${formatDateTime(appointmentCardItem('paid').createdAt!)}`)
    ).toBeTruthy();
    expect(screen.getByText('Thời gian hẹn')).toBeTruthy();
    expect(
      screen.getByText(
        formatDateTime(appointmentCardItem('paid').scheduledAt, { weekday: 'short' })
      )
    ).toBeTruthy();

    rerender(
      <AppointmentCard
        appointment={appointmentCardItem('unpaid')}
        onViewDetail={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: 'Hủy lịch' })).toBeTruthy();
  });

  it('shows a refund-required warning without claiming the refund completed', () => {
    render(
      <AppointmentCard
        appointment={{
          ...appointmentCardItem('paid'),
          status: 'cancelled',
          cancelReason: 'store_not_confirmed',
          refundRequired: true,
        }}
        onViewDetail={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(
      screen.getByText(
        'Lịch hẹn đã bị hủy do cửa hàng chưa xác nhận đúng hạn. Khoản thanh toán của bạn đang chờ được xử lý hoàn tiền.'
      )
    ).toBeTruthy();
    expect(screen.getByText('Chờ hoàn tiền')).toBeTruthy();
    expect(screen.queryByText('Đã thanh toán')).toBeNull();
    expect(screen.queryByText(/Đã hoàn tiền|Hoàn tiền thành công/)).toBeNull();
    expect(screen.queryByRole('button', { name: 'Hủy lịch' })).toBeNull();
  });

  it('hides cancellation at and inside the thirty-minute appointment deadline', () => {
    const atBoundary = {
      ...appointmentCardItem('unpaid'),
      scheduledAt: '2099-08-12T08:30:00',
    };
    const { rerender } = render(
      <AppointmentCard appointment={atBoundary} onViewDetail={vi.fn()} onCancel={vi.fn()} />
    );
    expect(screen.queryByRole('button', { name: 'Hủy lịch' })).toBeNull();

    rerender(
      <AppointmentCard
        appointment={{ ...atBoundary, scheduledAt: '2099-08-12T08:29:00' }}
        onViewDetail={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.queryByRole('button', { name: 'Hủy lịch' })).toBeNull();
  });

  it('shows the six most recently created appointments across future, today, and history, then expands and collapses', () => {
    pageAppointments = [
      {
        ...appointmentCardItem('unpaid'),
        _id: 'past-01',
        status: 'completed',
        scheduledAt: '2099-08-01T09:00:00',
        createdAt: '2099-08-12T12:31:00',
      },
      {
        ...appointmentCardItem('unpaid'),
        _id: 'future-18',
        scheduledAt: '2099-08-18T09:00:00',
        createdAt: '2099-08-12T12:02:00',
      },
      {
        ...appointmentCardItem('unpaid'),
        _id: 'past-10',
        status: 'completed',
        scheduledAt: '2099-08-10T09:00:00',
        createdAt: '2099-08-12T11:50:00',
      },
      {
        ...appointmentCardItem('unpaid'),
        _id: 'future-19',
        scheduledAt: '2099-08-19T09:00:00',
        createdAt: '2099-08-12T11:40:00',
      },
      {
        ...appointmentCardItem('unpaid'),
        _id: 'cancelled-09',
        status: 'cancelled',
        scheduledAt: '2099-08-09T09:00:00',
        createdAt: '2099-08-12T11:30:00',
      },
      {
        ...appointmentCardItem('unpaid'),
        _id: 'today',
        status: 'confirmed',
        scheduledAt: '2099-08-12T09:00:00',
        createdAt: '2099-08-12T11:20:00',
      },
      {
        ...appointmentCardItem('unpaid'),
        _id: 'completed-08',
        status: 'completed',
        scheduledAt: '2099-08-08T09:00:00',
        createdAt: '2099-08-12T11:10:00',
      },
      {
        ...appointmentCardItem('unpaid'),
        _id: 'past-07',
        status: 'pending',
        scheduledAt: '2099-08-07T09:00:00',
        createdAt: '2099-08-12T11:00:00',
      },
    ];

    render(<CustomerAppointmentsPage />);

    expect(screen.getByTestId('appointment-list').textContent).toBe(
      'past-01,future-18,past-10,future-19,cancelled-09,today,'
    );
    expect(screen.getByText('6 lịch hẹn đang hiển thị')).toBeTruthy();
    const showMore = screen.getByRole('button', { name: 'Xem thêm' });
    expect(
      screen.getByTestId('appointment-list').compareDocumentPosition(showMore) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();

    fireEvent.click(showMore);
    expect(screen.getByTestId('appointment-list').textContent).toBe(
      'past-01,future-18,past-10,future-19,cancelled-09,today,completed-08,past-07,'
    );
    expect(screen.getByText('8 lịch hẹn đang hiển thị')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Xem thêm' })).toBeNull();
    const collapse = screen.getByRole('button', { name: 'Thu gọn' });
    expect(
      screen.getByTestId('appointment-list').compareDocumentPosition(collapse) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();

    fireEvent.click(collapse);
    expect(screen.getByTestId('appointment-list').textContent).toBe(
      'past-01,future-18,past-10,future-19,cancelled-09,today,'
    );
    expect(screen.getByRole('button', { name: 'Xem thêm' })).toBeTruthy();
  });

  it('shows every appointment without expansion when fewer than six exist', () => {
    pageAppointments = [
      {
        ...appointmentCardItem('unpaid'),
        _id: 'past',
        status: 'completed',
        scheduledAt: '2099-08-10T09:00:00',
        createdAt: '2099-08-12T12:03:00',
      },
      {
        ...appointmentCardItem('unpaid'),
        _id: 'future',
        scheduledAt: '2099-08-14T09:00:00',
        createdAt: '2099-08-12T12:04:00',
      },
      {
        ...appointmentCardItem('unpaid'),
        _id: 'today',
        scheduledAt: '2099-08-12T09:00:00',
        createdAt: '2099-08-12T12:02:00',
      },
      {
        ...appointmentCardItem('unpaid'),
        _id: 'cancelled',
        status: 'cancelled',
        scheduledAt: '2099-08-11T09:00:00',
        createdAt: '2099-08-12T12:01:00',
      },
    ];

    render(<CustomerAppointmentsPage />);

    expect(screen.getByTestId('appointment-list').textContent).toBe('future,past,today,cancelled,');
    expect(screen.getByText('4 lịch hẹn đang hiển thị')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Xem thêm' })).toBeNull();
  });

  it('does not show more for six matches and keeps the true empty state clear', () => {
    pageAppointments = Array.from({ length: 6 }, (_, index) => ({
      ...appointmentCardItem('unpaid'),
      _id: `appointment-${index + 1}`,
      scheduledAt: `2099-08-${String(13 + index).padStart(2, '0')}T09:00:00`,
    }));
    const { unmount } = render(<CustomerAppointmentsPage />);
    expect(
      screen.getByTestId('appointment-list').textContent?.match(/appointment-/g) ?? []
    ).toHaveLength(6);
    expect(screen.getByText('6 lịch hẹn đang hiển thị')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Xem thêm' })).toBeNull();

    unmount();
    pageAppointments = [];
    render(<CustomerAppointmentsPage />);
    expect(screen.getByText('Bạn chưa có lịch hẹn nào')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Xem thêm' })).toBeNull();
    expect(screen.queryByText('0 lịch hẹn đang hiển thị')).toBeNull();
  });

  it('keeps explicit status filters and reveals matches beyond the first six', () => {
    pageAppointments = [
      ...Array.from({ length: 7 }, (_, index) => ({
        ...appointmentCardItem('unpaid'),
        _id: `completed-${index + 1}`,
        status: 'completed' as const,
        scheduledAt: `2099-08-${String(11 - index).padStart(2, '0')}T09:00:00`,
      })),
      { ...appointmentCardItem('unpaid'), _id: 'pending-future' },
    ];

    render(<CustomerAppointmentsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Bộ lọc' }));
    fireEvent.click(screen.getByRole('button', { name: 'Hoàn thành' }));

    const initialList = screen.getByTestId('appointment-list').textContent ?? '';
    expect(initialList).not.toContain('pending-future');
    expect(initialList).not.toContain('completed-7');
    fireEvent.click(screen.getByRole('button', { name: 'Xem thêm' }));
    expect(screen.getByTestId('appointment-list').textContent).toContain('completed-7');
  });

  it('does not show expansion when a status filter has six or fewer matches', () => {
    pageAppointments = [
      ...Array.from({ length: 6 }, (_, index) => ({
        ...appointmentCardItem('unpaid'),
        _id: `completed-${index + 1}`,
        status: 'completed' as const,
        scheduledAt: `2099-08-${String(11 - index).padStart(2, '0')}T09:00:00`,
      })),
      { ...appointmentCardItem('unpaid'), _id: 'pending-future' },
    ];

    render(<CustomerAppointmentsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Bộ lọc' }));
    fireEvent.click(screen.getByRole('button', { name: 'Hoàn thành' }));

    expect(screen.getByText('6 lịch hẹn đang hiển thị')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Xem thêm' })).toBeNull();
  });

  it('filters by search before limiting results and resets expanded mode', () => {
    pageAppointments = Array.from({ length: 7 }, (_, index) => ({
      ...appointmentCardItem('unpaid'),
      _id: `search-${index + 1}`,
      vehicleId: {
        ...appointmentCardItem('unpaid').vehicleId,
        licensePlate: index === 6 ? 'MATCH-ONLY' : `OTHER-${index + 1}`,
      },
      scheduledAt: `2099-08-${String(13 + index).padStart(2, '0')}T09:00:00`,
    }));

    render(<CustomerAppointmentsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Xem thêm' }));
    fireEvent.change(screen.getByPlaceholderText(/Tìm theo dịch vụ/), {
      target: { value: 'MATCH-ONLY' },
    });

    expect(screen.getByTestId('appointment-list').textContent).toBe('search-7,');
    expect(screen.getByText('1 lịch hẹn đang hiển thị')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Xem thêm' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Thu gọn' })).toBeNull();
  });

  it('does not render structurally impossible end-of-day options', async () => {
    availability = {
      slots: [
        {
          startAt: '2099-08-13T16:15:00',
          endAt: '2099-08-13T17:00:00',
          available: true,
          reason: null,
        },
      ],
      vehicleAvailabilityReason: null,
    };
    const { container } = render(
      <CreateAppointmentModal
        isOpen
        isSubmitting={false}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />
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
      <CreateAppointmentModal
        isOpen
        isSubmitting={false}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />
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

  it('keeps unfinished vehicles visible but disabled while terminal vehicles remain selectable', () => {
    pageAppointments = [
      { ...appointmentCardItem('unpaid'), vehicleId: { ...appointmentCardItem('unpaid').vehicleId, _id: 'vehicle-1' }, status: 'in_progress' },
      { ...appointmentCardItem('unpaid'), _id: 'appointment-2', vehicleId: { ...appointmentCardItem('unpaid').vehicleId, _id: 'vehicle-2' }, status: 'completed' },
      { ...appointmentCardItem('unpaid'), _id: 'appointment-3', vehicleId: { ...appointmentCardItem('unpaid').vehicleId, _id: 'vehicle-3' }, status: 'cancelled' },
    ];
    const { container } = render(
      <CreateAppointmentModal
        isOpen
        isSubmitting={false}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    const select = container.querySelector('select[name="vehicleId"]') as HTMLSelectElement;
    const unfinished = select.querySelector('option[value="vehicle-1"]') as HTMLOptionElement;
    const completed = select.querySelector('option[value="vehicle-2"]') as HTMLOptionElement;
    const cancelled = select.querySelector('option[value="vehicle-3"]') as HTMLOptionElement;

    expect(unfinished.disabled).toBe(true);
    expect(unfinished.textContent).toContain('30A-12345');
    expect(unfinished.textContent).toContain('Đã có lịch hẹn chưa hoàn thành');
    expect(completed.disabled).toBe(false);
    expect(cancelled.disabled).toBe(false);
  });
});
