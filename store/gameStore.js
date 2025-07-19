import { create } from './helpers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

const useGameStore = create(
  persist(
    (set, get) => ({
      // Game settings
      animationsEnabled: true,
      darkMode: true,
      
      // Game state - don't show 0 as default
      highScore: null,
      currentScore: 0,
      highestBlock: null,
      
      // Actions
      toggleAnimations: () => set((state) => ({ animationsEnabled: !state.animationsEnabled })),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      
      updateScore: (score) => {
        const currentHighScore = get().highScore || 0;
        if (score > currentHighScore) {
          set({ highScore: score, currentScore: score });
        } else {
          set({ currentScore: score });
        }
      },
      
      updateHighestBlock: (blockValue) => {
        const currentHighest = get().highestBlock || 0;
        if (blockValue > currentHighest) {
          set({ highestBlock: blockValue });
        }
      },
      
      resetGame: () => set({ currentScore: 0 }),
      
      resetAllSettings: () => set({
        animationsEnabled: true,
        darkMode: true,
        highScore: null,
        currentScore: 0,
        highestBlock: null,
      }),
    }),
    {
      name: 'game-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useGameStore; 