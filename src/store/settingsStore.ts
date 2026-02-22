import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  soundEnabled: boolean;
  reducedMotion: boolean;
  setSoundEnabled: (v: boolean) => void;
  setReducedMotion: (v: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      reducedMotion: false,
      setSoundEnabled: (v) => set({ soundEnabled: v }),
      setReducedMotion: (v) => set({ reducedMotion: v }),
    }),
    { name: 'taskflow-settings' }
  )
);
