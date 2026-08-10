import { create } from 'zustand';

interface ServiceCategoryFormState {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useServiceCategoryFormStore = create<ServiceCategoryFormState>((set) => ({
  isModalOpen: false,
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
}));
