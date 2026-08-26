import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { authService } from '@/services/authService';
import { getApiErrorMessage } from '@/api/errors';
import { queryKeys } from '@/constants/queryKeys';
import { userService } from '@/services/userService';
import { useAuthStore } from '@/store/useAuthStore';

export function useSigninMutation() {
  const queryClient = useQueryClient();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  return useMutation({
    mutationFn: ({ phone, password }: { phone: string; password: string }) =>
      authService.signin(phone, password),
    onSuccess: ({ user, accessToken }) => {
      setAccessToken(accessToken);
      queryClient.setQueryData(queryKeys.auth.me(), user);
      toast.success('Dang nhap thanh cong!');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Dang nhap that bai. Vui long thu lai.'));
    },
  });
}

export function useSignupMutation() {
  const queryClient = useQueryClient();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  return useMutation({
    mutationFn: ({
      phone,
      password,
      firstName,
      lastName,
    }: {
      phone: string;
      password: string;
      firstName: string;
      lastName: string;
    }) => authService.signup(phone, password, firstName, lastName),
    onSuccess: ({ user, accessToken }) => {
      setAccessToken(accessToken);
      queryClient.setQueryData(queryKeys.auth.me(), user);
      toast.success('Dang ky thanh cong!');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Dang ky that bai. Vui long thu lai.'));
    },
  });
}

export function useSignoutMutation() {
  const queryClient = useQueryClient();
  const clearState = useAuthStore((state) => state.clearState);

  return useMutation({
    mutationFn: authService.signout,
    onMutate: () => {
      clearState();
      queryClient.clear();
    },
    onSuccess: () => {
      toast.success('Dang xuat thanh cong!');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Dang xuat that bai. Vui long thu lai.'));
    },
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(queryKeys.auth.me(), updatedUser);
      toast.success('Cap nhat thong tin thanh cong!');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Cap nhat thong tin that bai. Vui long thu lai.'));
    },
  });
}
