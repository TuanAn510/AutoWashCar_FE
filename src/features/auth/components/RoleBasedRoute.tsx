import { Navigate, Outlet } from 'react-router';

import { getRoleHomePath } from '@/app/routes/role-paths';
import { useCurrentUser } from '@/features/auth/hooks/use-auth-queries';
import type { User } from '@/types/user';

interface RoleBasedRouteProps {
  allowedRoles: NonNullable<User['role']>[];
}

const RoleBasedRoute = ({ allowedRoles }: RoleBasedRouteProps) => {
  const role = useCurrentUser().data?.role ?? 'customer';

  if (!allowedRoles.includes(role)) {
    return <Navigate to={getRoleHomePath(role)} replace />;
  }

  return <Outlet />;
};

export default RoleBasedRoute;
