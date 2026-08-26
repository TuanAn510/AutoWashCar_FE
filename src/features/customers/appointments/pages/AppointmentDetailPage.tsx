import { ArrowLeft, CalendarClock, ClipboardList, MapPin, Phone, UserRound } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router';

import { toRolePath } from '@/app/routes/role-paths';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentUser } from '@/features/auth/hooks/use-auth-queries';

import { AppointmentTimeline } from '../components/appointment-timeline';
import { StatusBadge } from '../components/status-badge';
import { mockAppointments } from '../data/mock-appointments';
import { formatDate, formatPrice } from '@/lib/utils';

export default function AppointmentDetailPage() {
  const { appointmentId } = useParams();
  const role = useCurrentUser().data?.role ?? 'customer';
  const appointmentsPath = toRolePath('/appointments', role);
  const appointment = mockAppointments.find((item) => item.id === appointmentId);

  if (!appointment) {
    return <Navigate to={appointmentsPath} replace />;
  }

  return (
    <main className="min-h-[calc(100vh-73px)] min-w-0 overflow-x-hidden bg-[#f8fafc] px-4 py-6 sm:px-6 lg:px-8">
      <section className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Button asChild variant="ghost" className="mb-3 h-9 rounded-md px-0 text-slate-500">
            <Link to={appointmentsPath}>
              <ArrowLeft className="size-4" />
              Quay lại lịch hẹn
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              {appointment.code}
            </h1>
            <StatusBadge status={appointment.status} />
          </div>
          <p className="mt-2 text-sm text-slate-500">{appointment.serviceName}</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-white px-4 py-3 text-right shadow-sm">
          <p className="text-xs text-slate-500">Tạm tính</p>
          <p className="text-xl font-semibold text-slate-950">
            {formatPrice(appointment.totalPrice)}
          </p>
        </div>
      </section>

      <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card className="rounded-lg border border-border/70 shadow-sm ring-0">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-950">
              Thông tin lịch hẹn
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <DetailItem icon={UserRound} label="Khách hàng" value={appointment.customerName} />
            <DetailItem icon={Phone} label="Số điện thoại" value={appointment.customerPhone} />
            <DetailItem
              icon={ClipboardList}
              label="Xe"
              value={`${appointment.vehicle} - ${appointment.plateNumber}`}
            />
            <DetailItem
              icon={CalendarClock}
              label="Thời gian"
              value={`${formatDate(appointment.date)} lúc ${appointment.time}`}
            />
            <DetailItem
              icon={MapPin}
              label="Khu vực"
              value={`${appointment.bay} - ${appointment.duration}`}
            />
            <DetailItem icon={UserRound} label="Cố vấn" value={appointment.advisor} />
            <div className="rounded-md bg-slate-50 p-3 md:col-span-2">
              <p className="text-xs font-medium text-slate-500">Ghi chú</p>
              <p className="mt-1 text-sm text-slate-700">{appointment.notes}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border border-border/70 shadow-sm ring-0">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-950">Timeline xử lý</CardTitle>
          </CardHeader>
          <CardContent>
            <AppointmentTimeline items={appointment.timeline} />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Icon className="size-4" />
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
