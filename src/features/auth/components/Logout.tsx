import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { useSignoutMutation } from '@/features/auth/hooks/use-auth-mutations';

const Logout = () => {
  const navigate = useNavigate();
  const signoutMutation = useSignoutMutation();

  const handleLogout = async () => {
    try {
      await signoutMutation.mutateAsync();
      navigate('/signin');
    } catch {
      // Toast is handled in the mutation hook.
    }
  };

  return (
    <Button onClick={handleLogout} disabled={signoutMutation.isPending}>
      Logout
    </Button>
  );
};

export default Logout;
