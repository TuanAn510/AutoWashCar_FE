import { Clock, DollarSign, Plus, TrendingUp, Wrench } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: string;
  bookings: number;
  revenue: number;
}

const stats = [
  { label: 'Tổng dịch vụ', value: '48', icon: Wrench, iconClassName: 'bg-blue-50 text-blue-600' },
  {
    label: 'Giá trung bình',
    value: '135.000 đ',
    icon: DollarSign,
    iconClassName: 'bg-emerald-50 text-emerald-600',
  },
  {
    label: 'Thời lượng trung bình',
    value: '78 phút',
    icon: Clock,
    iconClassName: 'bg-violet-50 text-violet-600',
  },
  { label: 'Tổng doanh thu', value: '162 triệu', change: '+12.5%' },
];

const services: ServiceItem[] = [
  {
    id: 'SRV-001',
    name: 'Thay nhớt động cơ',
    category: 'Bảo dưỡng',
    price: 750000,
    duration: '45 phút',
    bookings: 342,
    revenue: 25650000,
  },
  {
    id: 'SRV-002',
    name: 'Bảo dưỡng phanh',
    category: 'Sửa chữa',
    price: 2500000,
    duration: '90 phút',
    bookings: 189,
    revenue: 47250000,
  },
  {
    id: 'SRV-003',
    name: 'Đảo lốp',
    category: 'Bảo dưỡng',
    price: 450000,
    duration: '30 phút',
    bookings: 256,
    revenue: 11520000,
  },
  {
    id: 'SRV-004',
    name: 'Chẩn đoán động cơ',
    category: 'Chẩn đoán',
    price: 1500000,
    duration: '120 phút',
    bookings: 145,
    revenue: 21750000,
  },
  {
    id: 'SRV-005',
    name: 'Chăm sóc xe toàn diện',
    category: 'Detailing',
    price: 1800000,
    duration: '180 phút',
    bookings: 198,
    revenue: 35640000,
  },
  {
    id: 'SRV-006',
    name: 'Cân chỉnh thước lái',
    category: 'Bảo dưỡng',
    price: 1200000,
    duration: '75 phút',
    bookings: 167,
    revenue: 20040000,
  },
];

const categories = [
  { name: 'Bảo dưỡng', revenue: 57210000, services: 3 },
  { name: 'Sửa chữa', revenue: 47250000, services: 1 },
  { name: 'Chẩn đoán', revenue: 21750000, services: 1 },
  { name: 'Detailing', revenue: 35640000, services: 1 },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value) + ' đ';
}

export default function ServicesManagementPage() {
  return (
    <main className="min-h-[calc(100vh-81px)] bg-[#f8fafc] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1540px] space-y-7">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
              Quản lý dịch vụ
            </h1>
            <p className="mt-2 text-base text-slate-500">
              Quản lý danh mục dịch vụ, thời lượng và bảng giá
            </p>
          </div>
          <Button className="h-11 rounded-md bg-slate-950 px-5 text-base font-semibold text-white hover:bg-slate-800">
            <Plus className="size-5" />
            Thêm danh mục
          </Button>
          <Button className="h-11 rounded-md bg-slate-950 px-5 text-base font-semibold text-white hover:bg-slate-800">
            <Plus className="size-5" />
            Thêm dịch vụ
          </Button>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div key={stat.label} className="rounded-lg border border-border/80 bg-white p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    <p className="mt-4 text-4xl font-bold leading-none tracking-normal text-slate-950">
                      {stat.value}
                    </p>
                    {stat.change && (
                      <div className="mt-3 flex items-center gap-1 text-sm font-medium text-emerald-600">
                        <TrendingUp className="size-4" />
                        {stat.change}
                      </div>
                    )}
                  </div>
                  {Icon && (
                    <div
                      className={cn(
                        'flex size-14 items-center justify-center rounded-lg',
                        stat.iconClassName
                      )}
                    >
                      <Icon className="size-7" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-lg border border-border/80 bg-white p-6">
            <h2 className="text-xl font-semibold tracking-normal text-slate-950">
              Dịch vụ phổ biến
            </h2>
            <div className="mt-8 space-y-5">
              {services.slice(0, 5).map((service, index) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 p-4"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-blue-100 text-lg font-bold text-blue-600">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">{service.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{service.bookings} lượt đặt</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{formatCurrency(service.price)}</p>
                    <p className="mt-1 text-sm text-slate-500">{service.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border/80 bg-white p-6">
            <h2 className="text-xl font-semibold tracking-normal text-slate-950">Nhóm dịch vụ</h2>
            <div className="mt-8 space-y-5">
              {categories.map((category) => (
                <div
                  key={category.name}
                  className="flex items-start justify-between gap-4 rounded-lg bg-slate-50 p-5"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{category.name}</p>
                    <p className="mt-4 text-sm text-slate-500">
                      Doanh thu: {formatCurrency(category.revenue)}
                    </p>
                  </div>
                  <span className="rounded-md bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                    {category.services} dịch vụ
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border/80 bg-white p-6">
          <h2 className="text-xl font-semibold tracking-normal text-slate-950">Danh mục dịch vụ</h2>
          <div className="mt-7 overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border text-slate-900">
                  <th className="px-2 py-4 font-semibold">ID</th>
                  <th className="px-2 py-4 font-semibold">Tên dịch vụ</th>
                  <th className="px-2 py-4 font-semibold">Nhóm</th>
                  <th className="px-2 py-4 font-semibold">Giá</th>
                  <th className="px-2 py-4 font-semibold">Thời lượng</th>
                  <th className="px-2 py-4 font-semibold">Lượt đặt</th>
                  <th className="px-2 py-4 font-semibold">Doanh thu</th>
                  <th className="px-2 py-4 font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id} className="border-b border-border/70 last:border-0">
                    <td className="px-2 py-4 font-semibold text-slate-900">{service.id}</td>
                    <td className="px-2 py-4 font-semibold text-slate-900">{service.name}</td>
                    <td className="px-2 py-4">
                      <span className="rounded-md border border-border bg-white px-3 py-1 text-xs font-semibold text-slate-900">
                        {service.category}
                      </span>
                    </td>
                    <td className="px-2 py-4 font-semibold text-slate-900">
                      {formatCurrency(service.price)}
                    </td>
                    <td className="px-2 py-4 text-slate-900">{service.duration}</td>
                    <td className="px-2 py-4 text-slate-900">{service.bookings}</td>
                    <td className="px-2 py-4 font-semibold text-emerald-600">
                      {formatCurrency(service.revenue)}
                    </td>
                    <td className="px-2 py-4">
                      <Button variant="ghost" className="h-9 px-2 font-semibold text-slate-900">
                        Sửa
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
