import { AuthPageShell } from '@/features/auth/components/auth-page-shell';
import { SigninForm } from '@/features/auth/components/signin-form';

const SigninPage = () => (
  <AuthPageShell
    eyebrow="Chào mừng trở lại"
    title="Quản lý hành trình chăm sóc xe trong một nơi."
    description="Theo dõi lịch hẹn, lịch sử dịch vụ và mọi thông tin quan trọng về chiếc xe của bạn cùng AutoWash Pro."
  >
    <SigninForm />
  </AuthPageShell>
);

export default SigninPage;
