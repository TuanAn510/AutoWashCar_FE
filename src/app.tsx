import { Route, Routes } from 'react-router';
import { Toaster } from 'sonner';
import { lazy, Suspense } from 'react';

import ProtectedRoute from './features/auth/components/ProtectedRoute';
import RoleBasedRoute from './features/auth/components/RoleBasedRoute';
import { AppLayout } from './app/layouts/app-layout';
import { RoleDashboardRedirect } from './app/routes/role-dashboard-redirect';
import { TooltipProvider } from './components/ui/tooltip';

const SigninPage = lazy(() => import('./features/auth/pages/SigninPage'));
const SignupPage = lazy(() => import('./features/auth/pages/SignupPage'));
const HomePage = lazy(() => import('./features/home/pages/HomePage'));
const CustomerManagementPage = lazy(
  () => import('./features/admin/customers/pages/CustomerManagementPage')
);
const PaymentsPage = lazy(() => import('./features/admin/payments/pages/PaymentsPage'));
const PromotionsPage = lazy(() => import('./features/admin/promotions/pages/PromotionsPage'));
const ReportsAnalyticsPage = lazy(
  () => import('./features/admin/reports/pages/ReportsAnalyticsPage')
);
const AdminAppointmentsPage = lazy(
  () => import('./features/admin/appointments/pages/AdminAppointmentsPage')
);
const AdminLoyaltyPage = lazy(() => import('./features/admin/loyalty/pages/AdminLoyaltyPage'));
const AdminLoyaltyCustomerDetailPage = lazy(
  () => import('./features/admin/loyalty/pages/AdminLoyaltyCustomerDetailPage')
);
const AdminMembershipTiersPage = lazy(
  () => import('./features/admin/membership-tiers/pages/AdminMembershipTiersPage')
);
const AdminRewardsPage = lazy(() => import('./features/admin/rewards/pages/AdminRewardsPage'));
const VehicleAccessRequestsPage = lazy(
  () => import('./features/admin/vehicle-access/pages/VehicleAccessRequestsPage')
);
const AppointmentDetailPage = lazy(
  () => import('./features/customers/appointments/pages/AppointmentDetailPage')
);
const CustomerAppointmentsPage = lazy(
  () => import('./features/customers/appointments/pages/CustomerAppointmentsPage')
);
const MyVehiclesPage = lazy(() => import('./features/customers/vehicles/pages/MyVehiclesPage'));
const CustomerLoyaltyPage = lazy(
  () => import('./features/customers/loyalty/pages/CustomerLoyaltyPage')
);
const PaymentPage = lazy(() => import('./features/customers/payments/pages/PaymentPage'));
const ServicesManagementPage = lazy(
  () => import('./features/admin/services/pages/ServicesManagementPage')
);
const StaffAppointmentsPage = lazy(
  () => import('./features/staff/appointments/pages/StaffAppointmentsPage')
);
const StaffServiceHistoriesPage = lazy(
  () => import('./features/staff/service-histories/pages/StaffServiceHistoriesPage')
);
const StaffLoyaltyLookupPage = lazy(
  () => import('./features/staff/loyalty/pages/StaffLoyaltyLookupPage')
);

function App() {
  return (
    <TooltipProvider>
      <Toaster richColors />
      <Suspense
        fallback={<div className="flex min-h-screen items-center justify-center">Đang tải...</div>}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<SigninPage />} />
          <Route path="/signin" element={<SigninPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<RoleDashboardRedirect />} />

              <Route element={<RoleBasedRoute allowedRoles={['customer']} />}>
                <Route path="/customer/appointments" element={<CustomerAppointmentsPage />} />
                <Route
                  path="/customer/appointments/:appointmentId"
                  element={<AppointmentDetailPage />}
                />
                <Route path="/customer/vehicles" element={<MyVehiclesPage />} />
                <Route path="/customer/loyalty" element={<CustomerLoyaltyPage />} />
                <Route path="/customer/service-histories" element={<CustomerAppointmentsPage />} />
                <Route path="/customer/payment/:appointmentId" element={<PaymentPage />} />
              </Route>

              <Route element={<RoleBasedRoute allowedRoles={['staff']} />}>
                <Route path="/staff/appointments" element={<StaffAppointmentsPage />} />
                <Route
                  path="/staff/appointments/:appointmentId"
                  element={<AppointmentDetailPage />}
                />
                <Route path="/staff/service-histories" element={<StaffServiceHistoriesPage />} />
                <Route path="/staff/loyalty" element={<StaffLoyaltyLookupPage />} />
              </Route>

              <Route element={<RoleBasedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
                <Route
                  path="/admin/appointments/:appointmentId"
                  element={<AppointmentDetailPage />}
                />
                <Route path="/admin/customers" element={<CustomerManagementPage />} />
                <Route path="/admin/services" element={<ServicesManagementPage />} />
                <Route path="/admin/payments" element={<PaymentsPage />} />
                <Route path="/admin/service-histories" element={<AdminAppointmentsPage />} />
                <Route path="/admin/loyalty" element={<AdminLoyaltyPage />} />
                <Route
                  path="/admin/loyalty/customers/:customerId"
                  element={<AdminLoyaltyCustomerDetailPage />}
                />
                <Route path="/admin/membership-programs" element={<AdminMembershipTiersPage />} />
                <Route path="/admin/rewards" element={<AdminRewardsPage />} />
                <Route
                  path="/admin/vehicle-access-requests"
                  element={<VehicleAccessRequestsPage />}
                />
                <Route path="/admin/promotions" element={<PromotionsPage />} />
                <Route path="/admin/reports" element={<ReportsAnalyticsPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </TooltipProvider>
  );
}

export default App;
