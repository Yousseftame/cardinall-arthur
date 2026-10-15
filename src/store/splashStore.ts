import { create } from 'zustand';

interface SplashState {
  isSplashVisible: boolean;
  setSplashVisible: (visible: boolean) => void;
  /** True once home hero image has finished its intro expand */
  isHeroIntroComplete: boolean;
  setHeroIntroComplete: (complete: boolean) => void;
}

export const useSplashStore = create<SplashState>((set) => ({
  isSplashVisible: true,
  setSplashVisible: (visible) => set({ isSplashVisible: visible }),
  isHeroIntroComplete: false,
  setHeroIntroComplete: (complete) => set({ isHeroIntroComplete: complete }),
}));
