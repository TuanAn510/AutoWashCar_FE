import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Phone, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSignupMutation } from '@/features/auth/hooks/use-auth-mutations';
import {
  PASSWORD_RULE,
  PASSWORD_RULE_MESSAGE,
  PHONE_RULE,
  PHONE_RULE_MESSAGE,
} from '@/features/auth/utils/validators';

const signupSchema = z
  .object({
    firstName: z.string().trim().min(2, 'Tên phải có ít nhất 2 ký tự'),
    lastName: z.string().trim().min(2, 'Họ phải có ít nhất 2 ký tự'),
    phone: z.string().regex(PHONE_RULE, PHONE_RULE_MESSAGE),
    password: z.string().regex(PASSWORD_RULE, PASSWORD_RULE_MESSAGE),
    confirmPassword: z.string().min(1, 'Vui lòng nhập lại mật khẩu'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const navigate = useNavigate();
  const signupMutation = useSignupMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { firstName: '', lastName: '', phone: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async ({ phone, password, firstName, lastName }: SignupFormValues) => {
    try {
      await signupMutation.mutateAsync({ phone, password, firstName, lastName });
      navigate('/signin');
    } catch {
      // Toast is handled in the mutation hook.
    }
  };

  const isPending = isSubmitting || signupMutation.isPending;

  return (
    <div>
      <div className="mb-7">
        <span className="text-xs font-black uppercase tracking-[0.18em] text-[#0b67c2]">
          Thành viên mới
        </span>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-[#15243a] sm:text-4xl">
          Tạo tài khoản
        </h2>
        <p className="mt-3 leading-6 text-slate-500">
          Chỉ mất một phút để bắt đầu trải nghiệm chăm sóc xe thuận tiện hơn.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="lastName"
            label="Họ"
            placeholder="Nguyễn"
            error={errors.lastName?.message}
            registration={formRegister('lastName')}
          />
          <TextField
            id="firstName"
            label="Tên"
            placeholder="Minh Anh"
            error={errors.firstName?.message}
            registration={formRegister('firstName')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-phone" className="font-bold text-slate-800">
            Số điện thoại
          </Label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
            <Input
              id="signup-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="Nhập số điện thoại"
              aria-invalid={Boolean(errors.phone)}
              className="h-12 rounded-md border-slate-200 bg-slate-50 pl-12 shadow-none focus-visible:border-[#0b67c2] focus-visible:ring-[#0b67c2]/15"
              {...formRegister('phone')}
            />
          </div>
          {errors.phone ? (
            <p className="text-sm font-medium text-destructive">{errors.phone.message}</p>
          ) : null}
        </div>

        <PasswordField
          id="signup-password"
          label="Mật khẩu"
          placeholder="Tối thiểu 8 ký tự"
          autoComplete="new-password"
          show={showPassword}
          error={errors.password?.message}
          registration={formRegister('password')}
          onToggle={() => setShowPassword((value) => !value)}
        />

        <PasswordField
          id="confirmPassword"
          label="Xác nhận mật khẩu"
          placeholder="Nhập lại mật khẩu"
          autoComplete="new-password"
          show={showConfirmPassword}
          error={errors.confirmPassword?.message}
          registration={formRegister('confirmPassword')}
          onToggle={() => setShowConfirmPassword((value) => !value)}
        />

        <Button
          type="submit"
          disabled={isPending}
          className="h-12 w-full rounded-md bg-[#0b67c2] text-base font-black text-white shadow-lg shadow-blue-700/20 hover:bg-[#0959aa]"
        >
          {isPending ? <LoaderCircle className="size-5 animate-spin" /> : null}
          {isPending ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
        </Button>
      </form>

      <div className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
        Đã có tài khoản?{' '}
        <Link
          to="/signin"
          className="font-black text-[#0b67c2] hover:text-[#0959aa] hover:underline"
        >
          Đăng nhập
        </Link>
      </div>

      <p className="mt-5 text-center text-xs leading-5 text-slate-400">
        Khi tạo tài khoản, bạn đồng ý với điều khoản sử dụng và chính sách bảo mật của AutoWash Pro.
      </p>
    </div>
  );
}

function TextField({
  id,
  label,
  placeholder,
  error,
  registration,
}: {
  id: string;
  label: string;
  placeholder: string;
  error?: string;
  registration: ReturnType<ReturnType<typeof useForm<SignupFormValues>>['register']>;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="font-bold text-slate-800">
        {label}
      </Label>
      <div className="relative">
        <UserRound className="pointer-events-none absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-slate-400" />
        <Input
          id={id}
          autoComplete={id}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          className="h-12 rounded-md border-slate-200 bg-slate-50 pl-11 shadow-none focus-visible:border-[#0b67c2] focus-visible:ring-[#0b67c2]/15"
          {...registration}
        />
      </div>
      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
    </div>
  );
}

function PasswordField({
  id,
  label,
  placeholder,
  autoComplete,
  show,
  error,
  registration,
  onToggle,
}: {
  id: string;
  label: string;
  placeholder: string;
  autoComplete: string;
  show: boolean;
  error?: string;
  registration: ReturnType<ReturnType<typeof useForm<SignupFormValues>>['register']>;
  onToggle: () => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="font-bold text-slate-800">
        {label}
      </Label>
      <div className="relative">
        <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          className="h-12 rounded-md border-slate-200 bg-slate-50 px-12 shadow-none focus-visible:border-[#0b67c2] focus-visible:ring-[#0b67c2]/15"
          {...registration}
        />
        <button
          type="button"
          aria-label={show ? `Ẩn ${label.toLowerCase()}` : `Hiện ${label.toLowerCase()}`}
          className="absolute inset-y-0 right-0 grid w-12 place-items-center text-slate-400 transition-colors hover:text-[#0b67c2]"
          onClick={onToggle}
        >
          {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      </div>
      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
    </div>
  );
}
