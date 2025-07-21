import { create } from './helpers';
import { Platform } from 'react-native';

// For web, use a simple store without persistence to avoid issues
const createGameStore = () => {
  const storeData = {
    // Game settings with explicit defaults
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
    
    // Actions with safe property access
    toggleVibration: () => storeData.vibrationEnabled = !storeData.vibrationEnabled,
    toggleSound: () => storeData.soundEnabled = !storeData.soundEnabled,
    setSoundVolume: (volume) => storeData.soundVolume = Math.max(0, Math.min(1, volume || 0.7)),
    
    updateScore: (score) => {
      const currentHighScore = storeData.highScore || 0;
      if (score > currentHighScore) {
        storeData.highScore = score;
        storeData.currentScore = score;
      } else {
        storeData.currentScore = score;
      }
    },
    
    updateHighestBlock: (blockValue) => {
      const currentHighest = storeData.highestBlock || 0;
      if (blockValue > currentHighest) {
        storeData.highestBlock = blockValue;
      }
    },
    
    // Save game state (simplified for web)
    saveGame: (gameState) => {
      try {
        const savedGameData = {
          board: gameState.board || [],
          score: gameState.score || 0,
          record: gameState.record || 0,
          nextBlock: gameState.nextBlock || 2,
          previewBlock: gameState.previewBlock || 2,
          gameStats: gameState.gameStats || {},
          timestamp: Date.now(),
        };
        storeData.savedGame = savedGameData;
        storeData.hasSavedGame = true;
        
        // On web, try to save to localStorage
        if (Platform.OS === 'web') {
          try {
            localStorage.setItem('game-state', JSON.stringify(savedGameData));
          } catch (e) {
            console.warn('Failed to save to localStorage:', e);
          }
        }
      } catch (error) {
        console.warn('Failed to save game:', error);
      }
    },
    
    // Load saved game
    loadSavedGame: () => {
      try {
        if (Platform.OS === 'web') {
          try {
            const saved = localStorage.getItem('game-state');
            return saved ? JSON.parse(saved) : null;
          } catch (e) {
            console.warn('Failed to load from localStorage:', e);
            return null;
          }
        }
        return storeData.savedGame || null;
      } catch (error) {
        console.warn('Failed to load saved game:', error);
        return null;
      }
    },
    
    // Clear saved game
    clearSavedGame: () => {
      try {
        storeData.savedGame = null;
        storeData.hasSavedGame = false;
        
        if (Platform.OS === 'web') {
          try {
            localStorage.removeItem('game-state');
          } catch (e) {
            console.warn('Failed to clear localStorage:', e);
          }
        }
      } catch (error) {
        console.warn('Failed to clear saved game:', error);
      }
    },
    
    resetGame: () => storeData.currentScore = 0,
    
    resetAllSettings: () => {
      storeData.vibrationEnabled = true;
      storeData.soundEnabled = true;
      storeData.soundVolume = 0.7;
      storeData.highScore = null;
      storeData.currentScore = 0;
      storeData.highestBlock = null;
      storeData.savedGame = null;
      storeData.hasSavedGame = false;
    },
  };
  
  return storeData;
};

// For web, use simple object; for native, use zustand with persist
let useGameStore;

if (Platform.OS === 'web') {
  // Simple store for web
  const gameStore = createGameStore();
  useGameStore = () => gameStore;
} else {
  // Full zustand store with persist for native
  const { persist, createJSONStorage } = require('zustand/middleware');
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  
  useGameStore = create(
    persist(
      (set, get) => ({
        // Game settings with explicit defaults
        vibrationEnabled: true,
        soundEnabled: true,
        soundVolume: 0.7,
        
        // Game state
        highScore: null,
        currentScore: 0,
        highestBlock: null,
        
        // Saved game state
        savedGame: null,
        hasSavedGame: false,
        
        // Actions
        toggleVibration: () => set((state) => ({ 
          vibrationEnabled: !(state.vibrationEnabled ?? true) 
        })),
        toggleSound: () => set((state) => ({ 
          soundEnabled: !(state.soundEnabled ?? true) 
        })),
        setSoundVolume: (volume) => set({ 
          soundVolume: Math.max(0, Math.min(1, volume || 0.7)) 
        }),
        
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
        
        saveGame: (gameState) => {
          try {
            const savedGameData = {
              board: gameState.board || [],
              score: gameState.score || 0,
              record: gameState.record || 0,
              nextBlock: gameState.nextBlock || 2,
              previewBlock: gameState.previewBlock || 2,
              gameStats: gameState.gameStats || {},
              timestamp: Date.now(),
            };
            set({ 
              savedGame: savedGameData,
              hasSavedGame: true 
            });
          } catch (error) {
            console.warn('Failed to save game:', error);
          }
        },
        
        loadSavedGame: () => {
          try {
            const { savedGame } = get();
            return savedGame || null;
          } catch (error) {
            console.warn('Failed to load saved game:', error);
            return null;
          }
        },
        
        clearSavedGame: () => {
          try {
            set({ 
              savedGame: null,
              hasSavedGame: false 
            });
          } catch (error) {
            console.warn('Failed to clear saved game:', error);
          }
        },
        
        resetGame: () => set({ currentScore: 0 }),
        
        resetAllSettings: () => set({
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
}

export default useGameStore; 