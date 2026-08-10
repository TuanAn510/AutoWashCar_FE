import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Phone } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { z } from 'zod';

import { getRoleHomePath } from '@/app/routes/role-paths';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSigninMutation } from '@/features/auth/hooks/use-auth-mutations';
import {
  PASSWORD_RULE,
  PASSWORD_RULE_MESSAGE,
  PHONE_RULE,
  PHONE_RULE_MESSAGE,
} from '@/features/auth/utils/validators';

const signinSchema = z.object({
  phone: z.string().regex(PHONE_RULE, PHONE_RULE_MESSAGE),
  password: z.string().regex(PASSWORD_RULE, PASSWORD_RULE_MESSAGE),
});

type SigninFormValues = z.infer<typeof signinSchema>;

export function SigninForm() {
  const navigate = useNavigate();
  const signinMutation = useSigninMutation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema),
    defaultValues: { phone: '', password: '' },
  });

  const onSubmit = async ({ phone, password }: SigninFormValues) => {
    try {
      const { user } = await signinMutation.mutateAsync({ phone, password });
      navigate(getRoleHomePath(user.role), { replace: true });
    } catch {
      // Toast is handled in the mutation hook.
    }
  };

  const isPending = isSubmitting || signinMutation.isPending;

  return (
    <div>
      <div className="mb-8">
        <span className="text-xs font-black uppercase tracking-[0.18em] text-[#0b67c2]">
          Tài khoản AutoWash Pro
        </span>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-[#15243a] sm:text-4xl">
          Đăng nhập
        </h2>
        <p className="mt-3 leading-6 text-slate-500">
          Nhập số điện thoại và mật khẩu để tiếp tục quản lý lịch chăm sóc xe.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-2">
          <Label htmlFor="phone" className="font-bold text-slate-800">
            Số điện thoại
          </Label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="Nhập số điện thoại"
              aria-invalid={Boolean(errors.phone)}
              className="h-13 rounded-md border-slate-200 bg-slate-50 pl-12 shadow-none transition focus-visible:border-[#0b67c2] focus-visible:ring-[#0b67c2]/15"
              {...formRegister('phone')}
            />
          </div>
          {errors.phone ? (
            <p className="text-sm font-medium text-destructive">{errors.phone.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="font-bold text-slate-800">
            Mật khẩu
          </Label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Nhập mật khẩu"
              aria-invalid={Boolean(errors.password)}
              className="h-13 rounded-md border-slate-200 bg-slate-50 px-12 shadow-none transition focus-visible:border-[#0b67c2] focus-visible:ring-[#0b67c2]/15"
              {...formRegister('password')}
            />
            <button
              type="button"
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              className="absolute inset-y-0 right-0 grid w-12 place-items-center text-slate-400 transition-colors hover:text-[#0b67c2]"
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
          {errors.password ? (
            <p className="text-sm font-medium text-destructive">{errors.password.message}</p>
          ) : null}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="h-13 w-full rounded-md bg-[#0b67c2] text-base font-black text-white shadow-lg shadow-blue-700/20 hover:bg-[#0959aa]"
        >
          {isPending ? <LoaderCircle className="size-5 animate-spin" /> : null}
          {isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>

      <div className="mt-7 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
        Chưa có tài khoản?{' '}
        <Link
          to="/signup"
          className="font-black text-[#0b67c2] hover:text-[#0959aa] hover:underline"
        >
          Đăng ký ngay
        </Link>
      </div>

      <p className="mt-6 text-center text-xs leading-5 text-slate-400">
        Bằng việc đăng nhập, bạn đồng ý với điều khoản sử dụng và chính sách bảo mật của AutoWash Pro.
      </p>
    </div>
  );
}
