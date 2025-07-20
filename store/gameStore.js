import { create } from './helpers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

const useGameStore = create(
  persist(
    (set, get) => ({
      // Game settings
      darkMode: true,
      vibrationEnabled: true,
      soundEnabled: true,
      soundVolume: 0.7,
      
      // Game state - don't show 0 as default
      highScore: null,
      currentScore: 0,
      highestBlock: null,
      
      // Saved game state
      savedGame: null,
      hasSavedGame: false,
      
      // Actions
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      toggleVibration: () => set((state) => ({ vibrationEnabled: !state.vibrationEnabled })),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      setSoundVolume: (volume) => set({ soundVolume: Math.max(0, Math.min(1, volume)) }),
      
      updateScore: (score) => {
        const state = get();
        const currentHighScore = state.highScore || 0;
        if (score > currentHighScore) {
          set({ highScore: score, currentScore: score });
        } else {
          set({ currentScore: score });
        }
      },
      
      updateHighestBlock: (blockValue) => {
        const state = get();
        const currentHighest = state.highestBlock || 0;
        if (blockValue > currentHighest) {
          set({ highestBlock: blockValue });
        }
      },
      
      // Save game state
      saveGame: (gameState) => {
        const savedGameData = {
          board: gameState.board,
          score: gameState.score,
          record: gameState.record,
          nextBlock: gameState.nextBlock,
          previewBlock: gameState.previewBlock,
          gameStats: gameState.gameStats,
          timestamp: Date.now(),
        };
        set({ 
          savedGame: savedGameData,
          hasSavedGame: true 
        });
      },
      
      // Load saved game
      loadSavedGame: () => {
        const { savedGame } = get();
        return savedGame;
      },
      
      // Clear saved game
      clearSavedGame: () => {
        set({ 
          savedGame: null,
          hasSavedGame: false 
        });
      },
      
      resetGame: () => set({ currentScore: 0 }),
      
      resetAllSettings: () => set({
        darkMode: true,
        vibrationEnabled: true,
        soundEnabled: true,
        soundVolume: 0.7,
        highScore: null,
        currentScore: 0,
        highestBlock: null,
        savedGame: null,
        hasSavedGame: false,
      }),
    }),
    {
      name: 'game-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useGameStore; 