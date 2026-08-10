import { Ellipsis, Eye, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ServiceHistoryItem } from '@/types/serviceHistory';

export function AdminServiceHistoryActionsMenu({
  serviceHistory,
  onViewDetail,
  onUpdate,
  onDelete,
}: {
  serviceHistory: ServiceHistoryItem;
  onViewDetail: (serviceHistory: ServiceHistoryItem) => void;
  onUpdate: (serviceHistory: ServiceHistoryItem) => void;
  onDelete: (serviceHistory: ServiceHistoryItem) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="rounded-xl">
          <Ellipsis className="size-4" />
          <span className="sr-only">Mở menu thao tác</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuItem onClick={() => onViewDetail(serviceHistory)}>
          <Eye className="size-4" />
          Xem chi tiết
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onUpdate(serviceHistory)}>
          <Pencil className="size-4" />
          Cập nhật
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={() => onDelete(serviceHistory)}>
          <Trash2 className="size-4" />
          Xóa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
