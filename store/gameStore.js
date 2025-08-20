import { create } from './helpers';
import { Platform } from 'react-native';
import { createTutorialSlice } from './tutorialSlice';
import { COLS } from '../components/constants';

// For web, use a simple store without persistence to avoid issues
const createGameStore = () => {
  const storeData = {
    // Game settings with explicit defaults
    vibrationEnabled: true,
    soundEnabled: true,
    soundVolume: 0.7,
    backgroundMusicEnabled: true,
    backgroundMusicVolume: 0.6,
    
    // Game state - don't show 0 as default
    highScore: null,
    currentScore: 0,
    highestBlock: null,
    
    // Tutorial state
    isActive: false,
    currentStep: 1,
    allowedLaneIndex: 3, // Center lane by default for 5x7 grid
    isGameFrozen: false,
    
    // Tutorial actions
    startTutorial: function() {
      // Tutorial Store: startTutorial called
      storeData.isActive = true;
      storeData.currentStep = 1;
      storeData.allowedLaneIndex = 2;
      storeData.isGameFrozen = false; // Keep game running normally
    },
    
    nextStep: function() {
      if (storeData.currentStep < 3) {
        const newStep = storeData.currentStep + 1;
        
        storeData.currentStep = newStep;
        
        // Don't override allowedLaneIndex here - let TutorialController set it
        // The TutorialController will call setAllowedLane with the correct value
      } else {
        storeData.endTutorial();
      }
    },
    
    endTutorial: function() {
      storeData.isActive = false;
      storeData.currentStep = 1;
      storeData.allowedLaneIndex = 2;
      storeData.isGameFrozen = false;
    },
    
    setAllowedLane: function(laneIndex) {
      storeData.allowedLaneIndex = laneIndex;
    },
    
    setGameFrozen: function(frozen) {
      storeData.isGameFrozen = frozen;
    },
    
    resetTutorial: function() {
      storeData.isActive = true; // Keep tutorial active but reset to step 1
      storeData.currentStep = 1;
      storeData.allowedLaneIndex = 2;
      storeData.isGameFrozen = false;
    },
    

    
    // Saved game state
    savedGame: null,
    hasSavedGame: false,
    
    // Actions with safe property access
    toggleVibration: () => storeData.vibrationEnabled = !storeData.vibrationEnabled,
    toggleSound: () => storeData.soundEnabled = !storeData.soundEnabled,
    setSoundVolume: (volume) => storeData.soundVolume = Math.max(0, Math.min(1, volume || 0.7)),
    toggleBackgroundMusic: () => storeData.backgroundMusicEnabled = !storeData.backgroundMusicEnabled,
    setBackgroundMusicVolume: (volume) => storeData.backgroundMusicVolume = Math.max(0, Math.min(1, volume || 0.6)),
    

    
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
    saveGame: (gameState, options = {}) => {
      try {
        // CRITICAL: Check if data was cleared or tutorial is active
        if (options.isDataCleared || options.isTutorialActive) {
          console.log('🚫 Store saveGame blocked - data cleared or tutorial active');
          return; // Don't save if data was cleared or tutorial is active
        }
        
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
            // Silent fail for localStorage issues
          }
        }
      } catch (error) {
        // Silent fail for save issues
      }
    },
    
    // Load saved game
    loadSavedGame: () => {
      try {
        if (Platform.OS === 'web') {
          try {
            const saved = localStorage.getItem('game-state');
            if (saved) {
              const parsed = JSON.parse(saved);

              return parsed;
            }
            return null;
          } catch (e) {
            return null;
          }
        }

        return storeData.savedGame || null;
      } catch (error) {
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
            // Silent fail
          }
        }
      } catch (error) {
        // Silent fail
      }
    },
    
    resetGame: () => storeData.currentScore = 0,
    
    clearAllData: () => {
      try {
        // Clear tutorial completion status synchronously
        const { resetTutorialCompletion } = require('../lib/storage/tutorial');
        resetTutorialCompletion();
        
        // Clear localStorage for web
        if (Platform.OS === 'web') {
          try {
            localStorage.removeItem('game-state');
            localStorage.removeItem('game_high_score');
            localStorage.removeItem('game_saved_state');
            localStorage.removeItem('game_total_sessions');
            localStorage.removeItem('analytics_user_id');
            localStorage.removeItem('game_first_launch');
            localStorage.removeItem('comprehensive_analytics_state');
          } catch (e) {
            // Silent fail
          }
        }
      } catch (error) {
        // Failed to clear storage data
      }
      
      // Reset all game data
      storeData.highScore = null;
      storeData.currentScore = 0;
      storeData.highestBlock = null;
      storeData.savedGame = null;
      storeData.hasSavedGame = false;
      
      // Reset tutorial state
      storeData.isActive = false;
      storeData.currentStep = 1;
      storeData.allowedLaneIndex = 2;
      storeData.isGameFrozen = false;
    },
    
    resetAllSettings: () => {
      storeData.vibrationEnabled = true;
      storeData.soundEnabled = true;
      storeData.soundVolume = 0.7;
      storeData.backgroundMusicEnabled = true;
      storeData.backgroundMusicVolume = 0.6;
      storeData.highScore = null;
      storeData.currentScore = 0;
      storeData.highestBlock = null;
      storeData.savedGame = null;
      storeData.hasSavedGame = false;
      
      // Reset tutorial state
      storeData.isActive = false;
      storeData.currentStep = 1;
      storeData.allowedLaneIndex = 2;
      storeData.isGameFrozen = false;
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
  try {
    const { persist, createJSONStorage } = require('zustand/middleware');
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    
    useGameStore = create(
      persist(
        (set, get) => ({
        // Game settings with explicit defaults
        vibrationEnabled: true,
        soundEnabled: true,
        soundVolume: 0.7,
        backgroundMusicEnabled: true,
        backgroundMusicVolume: 0.6,
        
        // Game state
        highScore: null,
        currentScore: 0,
        highestBlock: null,
        isDataCleared: false,
        
        // Tutorial state
        ...createTutorialSlice(set, get),
        

        
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
        toggleBackgroundMusic: () => set((state) => ({ 
          backgroundMusicEnabled: !(state.backgroundMusicEnabled ?? true) 
        })),
        setBackgroundMusicVolume: (volume) => set({ 
          backgroundMusicVolume: Math.max(0, Math.min(1, volume || 0.6)) 
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
        
        saveGame: (gameState, options = {}) => {
          try {
            // CRITICAL: Check if data was cleared or tutorial is active
            if (options.isDataCleared || options.isTutorialActive) {
              console.log('🚫 Web store saveGame blocked - data cleared or tutorial active');
              return; // Don't save if data was cleared or tutorial is active
            }
            
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
            // Failed to save game silently
          }
        },
        
        loadSavedGame: () => {
          try {
            const { savedGame } = get();
            return savedGame || null;
          } catch (error) {
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
            // Failed to clear saved game silently
          }
        },
        

        
        resetGame: () => set({ currentScore: 0 }),

        clearAllData: async () => {
          try {
            // Clear tutorial completion status
            const { resetTutorialCompletion } = await import('../lib/storage/tutorial');
            await resetTutorialCompletion();
            
            // Clear Zustand persistence storage - this is the key issue!
            const AsyncStorage = await import('@react-native-async-storage/async-storage');
            await AsyncStorage.default.multiRemove([
              'game-settings', // Clear the Zustand persistence key
              'game_high_score',
              'game_saved_state',
              'game_total_sessions',
              'analytics_user_id',
              'analytics_first_launch',
              'comprehensive_analytics_state'
            ]);
          } catch (error) {
            // Failed to clear storage data
          }
          
          set({
            // Reset all game data
            highScore: null,
            currentScore: 0,
            highestBlock: null,
            savedGame: null,
            hasSavedGame: false,
            
            // Reset tutorial state
            isActive: false,
            currentStep: 1,
            allowedLaneIndex: 2,
            isGameFrozen: false,
            
            // Flag to prevent auto-save after data clearing
            isDataCleared: true,
          });
        },

        resetOnboarding: async () => {
          try {
            // Import the tutorial storage functions
            const { resetTutorialCompletion } = await import('../lib/storage/tutorial');
            await resetTutorialCompletion();
          } catch (error) {
            // Failed to reset tutorial completion status
          }
          
          // Reset tutorial state to allow tutorial to run again
          storeData.isActive = false;
          storeData.currentStep = 1;
          storeData.allowedLaneIndex = 2;
          storeData.isGameFrozen = false;
        },
        
        resetAllSettings: () => set({
          vibrationEnabled: true,
          soundEnabled: true,
          soundVolume: 0.7,
          backgroundMusicEnabled: true,
          backgroundMusicVolume: 0.6,
          highScore: null,
          currentScore: 0,
          highestBlock: 0,
          savedGame: null,
          hasSavedGame: false,
          
          // Reset tutorial state
          isActive: false,
          currentStep: 1,
          allowedLaneIndex: 2,
          isGameFrozen: false,
        }),

        clearAllData: () => {
          try {
            // Clear tutorial completion status synchronously
            const { resetTutorialCompletion } = require('../lib/storage/tutorial');
            resetTutorialCompletion();
            
            // Clear Zustand persistence storage - this is the key issue!
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            AsyncStorage.multiRemove([
              'game-settings', // Clear the Zustand persistence key
              'game_high_score',
              'game_saved_state',
              'game_total_sessions',
              'analytics_user_id',
              'analytics_first_launch',
              'comprehensive_analytics_state'
            ]);
          } catch (error) {
            // Failed to clear storage data
          }
          
          set({
            // Reset all game data
            highScore: null,
            currentScore: 0,
            highestBlock: null, // Reset to null like 40 commits back
            savedGame: null,
            hasSavedGame: false,
            
            // Reset tutorial state
            isActive: false,
            currentStep: 1,
            allowedLaneIndex: 2,
            isGameFrozen: false,
          });
        },

        resetOnboarding: async () => {
          try {
            // Import the tutorial storage functions
            const { resetTutorialCompletion } = await import('../lib/storage/tutorial');
            await resetTutorialCompletion();
          } catch (error) {
            // Failed to reset tutorial completion status
          }
          
          set({
            // Reset tutorial state to allow tutorial to run again
            isActive: false,
            currentStep: 1,
            allowedLaneIndex: 2,
            isGameFrozen: false,
          });
        },
      }),
      {
        name: 'game-settings',
        storage: createJSONStorage(() => AsyncStorage),
      }
    )
  );

  } catch (error) {
    // Fallback to web store if native store fails
    const gameStore = createGameStore();
    useGameStore = () => gameStore;
  }
}

export default useGameStore; 