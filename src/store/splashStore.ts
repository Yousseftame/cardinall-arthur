import { create } from 'zustand';

interface SplashState {
  isSplashVisible: boolean;
  setSplashVisible: (visible: boolean) => void;
}

export const useSplashStore = create<SplashState>((set) => ({
  isSplashVisible: true,
  setSplashVisible: (visible) => set({ isSplashVisible: visible }),
}));
