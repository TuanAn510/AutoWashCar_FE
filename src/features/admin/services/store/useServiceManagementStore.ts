import { create } from 'zustand';

interface ServiceManagementState {
  isCreateDialogOpen: boolean;
  openCreateDialog: () => void;
  closeCreateDialog: () => void;
}

export const useServiceManagementStore = create<ServiceManagementState>((set) => ({
  isCreateDialogOpen: false,
  openCreateDialog: () => set({ isCreateDialogOpen: true }),
  closeCreateDialog: () => set({ isCreateDialogOpen: false }),
}));
