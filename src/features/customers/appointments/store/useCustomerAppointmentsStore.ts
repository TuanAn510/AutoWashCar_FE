import { create } from 'zustand';

import type { AppointmentItem } from '@/types/appointment';

interface CustomerAppointmentsState {
  isCreateModalOpen: boolean;
  detailAppointment: AppointmentItem | null;
  cancelAppointment: AppointmentItem | null;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openDetailDialog: (appointment: AppointmentItem) => void;
  closeDetailDialog: () => void;
  openCancelDialog: (appointment: AppointmentItem) => void;
  closeCancelDialog: () => void;
}

export const useCustomerAppointmentsStore = create<CustomerAppointmentsState>((set) => ({
  isCreateModalOpen: false,
  detailAppointment: null,
  cancelAppointment: null,
  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),
  openDetailDialog: (appointment) => set({ detailAppointment: appointment }),
  closeDetailDialog: () => set({ detailAppointment: null }),
  openCancelDialog: (appointment) => set({ cancelAppointment: appointment }),
  closeCancelDialog: () => set({ cancelAppointment: null }),
}));
