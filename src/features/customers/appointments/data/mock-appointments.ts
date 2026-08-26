export type AppointmentStatus =
  | 'scheduled'
  | 'checked-in'
  | 'in-progress'
  | 'completed'
  | 'cancelled';

export interface AppointmentTimelineItem {
  id: string;
  title: string;
  time: string;
  description: string;
  done: boolean;
}

export interface Appointment {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string;
  vehicle: string;
  plateNumber: string;
  serviceName: string;
  advisor: string;
  date: string;
  time: string;
  duration: string;
  bay: string;
  status: AppointmentStatus;
  totalPrice: number;
  notes: string;
  timeline: AppointmentTimelineItem[];
}

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  scheduled: 'Đã đặt lịch',
  'checked-in': 'Đã tiếp nhận',
  'in-progress': 'Đang thực hiện',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
};

export const mockAppointments: Appointment[] = [
  {
    id: 'apt-001',
    code: 'SC-260603-01',
    customerName: 'Nguyễn Minh Anh',
    customerPhone: '0901234567',
    vehicle: 'Mercedes-Benz C 300 AMG',
    plateNumber: '51H-248.19',
    serviceName: 'Rửa xe detailing + phủ ceramic bảo dưỡng',
    advisor: 'Hoàng Nam',
    date: '2026-06-03',
    time: '09:30',
    duration: '2 giờ 30 phút',
    bay: 'Bay 02',
    status: 'in-progress',
    totalPrice: 1850000,
    notes: 'Kiểm tra kỹ phần mâm xe và kính lái trước khi bàn giao.',
    timeline: [
      {
        id: 'tl-1',
        title: 'Đặt lịch',
        time: '08:05',
        description: 'Khách xác nhận lịch qua hotline.',
        done: true,
      },
      {
        id: 'tl-2',
        title: 'Tiếp nhận xe',
        time: '09:22',
        description: 'Cố vấn kiểm tra ngoại thất và chụp ảnh hiện trạng.',
        done: true,
      },
      {
        id: 'tl-3',
        title: 'Đang chăm sóc',
        time: '10:10',
        description: 'Kỹ thuật viên đang xử lý khoang nội thất.',
        done: true,
      },
      {
        id: 'tl-4',
        title: 'Kiểm tra chất lượng',
        time: '11:45',
        description: 'Chờ QC kiểm tra trước bàn giao.',
        done: false,
      },
    ],
  },
  {
    id: 'apt-002',
    code: 'SC-260603-02',
    customerName: 'Trần Quốc Bảo',
    customerPhone: '0918877665',
    vehicle: 'Tesla Model Y',
    plateNumber: '30K-556.72',
    serviceName: 'Vệ sinh nội thất và khử mùi ozone',
    advisor: 'Minh Phúc',
    date: '2026-06-03',
    time: '13:00',
    duration: '1 giờ 45 phút',
    bay: 'Bay 04',
    status: 'checked-in',
    totalPrice: 950000,
    notes: 'Không dùng hóa chất có mùi mạnh.',
    timeline: [
      {
        id: 'tl-1',
        title: 'Đặt lịch',
        time: '10:30',
        description: 'Khách đặt lịch trên ứng dụng.',
        done: true,
      },
      {
        id: 'tl-2',
        title: 'Tiếp nhận xe',
        time: '12:55',
        description: 'Xe đã vào khu chờ dịch vụ.',
        done: true,
      },
      {
        id: 'tl-3',
        title: 'Đang chăm sóc',
        time: '13:20',
        description: 'Chờ phân công kỹ thuật viên.',
        done: false,
      },
    ],
  },
  {
    id: 'apt-003',
    code: 'SC-260604-01',
    customerName: 'Lê Hoàng Linh',
    customerPhone: '0987654321',
    vehicle: 'Porsche Macan',
    plateNumber: '59A-902.11',
    serviceName: 'Đánh bóng sơn một bước',
    advisor: 'Thanh Vy',
    date: '2026-06-04',
    time: '08:00',
    duration: '3 giờ',
    bay: 'Bay 01',
    status: 'scheduled',
    totalPrice: 2200000,
    notes: 'Khách cần nhận xe trước 12:00.',
    timeline: [
      {
        id: 'tl-1',
        title: 'Đặt lịch',
        time: '16:12',
        description: 'Lịch đã được xác nhận.',
        done: true,
      },
      {
        id: 'tl-2',
        title: 'Nhắc lịch',
        time: '07:00',
        description: 'Hệ thống sẽ gửi nhắc lịch trước giờ hẹn.',
        done: false,
      },
    ],
  },
];
