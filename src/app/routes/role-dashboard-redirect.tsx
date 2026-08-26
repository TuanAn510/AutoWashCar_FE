import { Navigate } from 'react-router';

import { getRoleHomePath } from '@/app/routes/role-paths';
import { useCurrentUser } from '@/features/auth/hooks/use-auth-queries';

export function RoleDashboardRedirect() {
  const role = useCurrentUser().data?.role;

  return <Navigate to={getRoleHomePath(role)} replace />;
}
