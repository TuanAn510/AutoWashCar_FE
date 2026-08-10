import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCurrentUser } from '@/features/auth/hooks/use-auth-queries';

import PersonalInfoForm from './PersonalInfoForm';
import PrivacySettings from './PrivacySettings';
import ProfileCard from './ProfileCard';

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const user = useCurrentUser().data;

  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-5xl gap-0 overflow-hidden bg-[#f7f8fb] p-0 sm:w-[calc(100vw-2rem)]">
        <div className="max-h-[calc(100vh-1rem)] overflow-y-auto sm:max-h-[calc(100vh-2rem)]">
          <DialogHeader className="px-4 pt-5 sm:px-6 sm:pt-6">
            <DialogTitle className="text-2xl font-bold text-slate-950">
              Thông tin cá nhân
            </DialogTitle>
            <DialogDescription>Quản lý hồ sơ, tùy chọn và bảo mật tài khoản.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-4 pb-4 pt-5 sm:px-6 sm:pb-6">
            <ProfileCard user={user} />

            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid h-10 w-full grid-cols-2 rounded-lg bg-slate-100 p-1">
                <TabsTrigger value="account">Tài khoản</TabsTrigger>
                <TabsTrigger value="privacy">Bảo mật</TabsTrigger>
              </TabsList>

              <TabsContent value="account" className="mt-3">
                <PersonalInfoForm user={user} />
              </TabsContent>
              <TabsContent value="privacy" className="mt-3">
                <PrivacySettings />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
