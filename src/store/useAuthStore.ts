import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  setAccessToken: (accessToken: string | null) => void;
  clearState: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  setAccessToken: (accessToken) => set({ accessToken }),
  clearState: () => set({ accessToken: null }),
}));
