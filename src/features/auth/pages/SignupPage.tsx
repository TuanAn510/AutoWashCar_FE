import { AuthPageShell } from '@/features/auth/components/auth-page-shell';
import { SignupForm } from '@/features/auth/components/signup-form';

const SignupPage = () => (
  <AuthPageShell
    eyebrow="Bắt đầu cùng AutoWash Pro"
    title="Chăm xe chủ động, an tâm trên mọi hành trình."
    description="Tạo tài khoản để đặt lịch thuận tiện, lưu lại lịch sử bảo dưỡng và nhận trải nghiệm chăm sóc xe liền mạch."
  >
    <SignupForm />
  </AuthPageShell>
);

export default SignupPage;
