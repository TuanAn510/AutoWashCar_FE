import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router';

import { useCurrentUser } from '@/features/auth/hooks/use-auth-queries';
import { useAuthStore } from '@/store/useAuthStore';

const ProtectedRoute = () => {
  const clearState = useAuthStore((state) => state.clearState);
  const currentUserQuery = useCurrentUser();

  useEffect(() => {
    if (currentUserQuery.isError) clearState();
  }, [clearState, currentUserQuery.isError]);

  if (currentUserQuery.isPending) {
    return <div className="flex h-screen items-center justify-center">Đang tải...</div>;
  }

  if (!currentUserQuery.data) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
