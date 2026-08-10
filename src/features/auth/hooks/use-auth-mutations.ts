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
      toast.success('Đăng nhập thành công!');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Đăng nhập thất bại. Vui lòng thử lại.'));
    },
  });
}

export function useSignupMutation() {
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
    onSuccess: () => {
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Đăng ký thất bại. Vui lòng thử lại.'));
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
      toast.success('Đăng xuất thành công!');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Đăng xuất thất bại. Vui lòng thử lại.'));
    },
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(queryKeys.auth.me(), updatedUser);
      toast.success('Cập nhật thông tin thành công!');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Cập nhật thông tin thất bại. Vui lòng thử lại.'));
    },
  });
}
