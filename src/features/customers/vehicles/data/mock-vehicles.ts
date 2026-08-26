export type VehicleStatus = 'active' | 'servicing' | 'inactive';

export interface Vehicle {
  id: string;
  ownerName: string;
  ownerPhone: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  vin?: string;
  mileage: number;
  status: VehicleStatus;
  lastServiceDate: string;
  nextServiceDate: string;
  notes?: string;
}

export const vehicleStatusLabels: Record<VehicleStatus, string> = {
  active: 'Đang hoạt động',
  servicing: 'Đang chăm sóc',
  inactive: 'Tạm ngưng',
};

export const mockVehicles: Vehicle[] = [
  {
    id: 'veh-001',
    ownerName: 'Nguyễn Minh Anh',
    ownerPhone: '0901234567',
    plateNumber: '51H-248.19',
    brand: 'Mercedes-Benz',
    model: 'C 300 AMG',
    year: 2023,
    color: 'Trắng ngọc trai',
    vin: 'W1KWF8DB6NR123456',
    mileage: 18600,
    status: 'active',
    lastServiceDate: '2026-05-18',
    nextServiceDate: '2026-08-18',
    notes: 'Khách ưu tiên phủ ceramic gói Premium.',
  },
  {
    id: 'veh-002',
    ownerName: 'Trần Quốc Bảo',
    ownerPhone: '0918877665',
    plateNumber: '30K-556.72',
    brand: 'Tesla',
    model: 'Model Y',
    year: 2024,
    color: 'Đen',
    vin: '5YJYGDEE7PF654321',
    mileage: 9200,
    status: 'servicing',
    lastServiceDate: '2026-06-02',
    nextServiceDate: '2026-09-02',
    notes: 'Đang xử lý vệ sinh nội thất và khử mùi ozone.',
  },
  {
    id: 'veh-003',
    ownerName: 'Lê Hoàng Linh',
    ownerPhone: '0987654321',
    plateNumber: '59A-902.11',
    brand: 'Porsche',
    model: 'Macan',
    year: 2022,
    color: 'Xám bạc',
    mileage: 31120,
    status: 'active',
    lastServiceDate: '2026-04-10',
    nextServiceDate: '2026-07-10',
  },
];
