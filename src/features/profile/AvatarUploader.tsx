import { Camera } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function AvatarUploader() {
  return (
    <Button
      type="button"
      size="icon-sm"
      variant="secondary"
      className="absolute -bottom-2 -right-2 rounded-full shadow-md"
      disabled
      title="Chức năng cập nhật ảnh đại diện chưa được kết nối"
    >
      <Camera className="size-4" />
    </Button>
  );
}
