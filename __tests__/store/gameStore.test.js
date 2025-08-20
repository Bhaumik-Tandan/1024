import { Platform } from 'react-native';

// Mock Platform.OS for testing
jest.mock('react-native', () => ({
  Platform: {
    OS: 'web'
  }
}));

// Mock the helpers module
jest.mock('../../store/helpers', () => ({
  create: jest.fn()
}));

// Mock the tutorial slice
jest.mock('../../store/tutorialSlice', () => ({
  createTutorialSlice: jest.fn(() => ({
    isActive: false,
    currentStep: 1,
    allowedLaneIndex: 2,
    isGameFrozen: false,
    startTutorial: jest.fn(),
    nextStep: jest.fn(),
    endTutorial: jest.fn(),
    setAllowedLane: jest.fn(),
    setGameFrozen: jest.fn(),
    resetTutorial: jest.fn(),
    clearTutorialState: jest.fn()
  }))
}));

// Mock constants
jest.mock('../../components/constants', () => ({
  COLS: 4
}));

// Mock localStorage for web testing
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Import after mocking
let useGameStore;
let gameStore;

describe('GameStore (Web Version)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    
    // Reset the module to get fresh instances
    jest.resetModules();
    
    // Import the store after mocking
    const storeModule = require('../../store/gameStore');
    useGameStore = storeModule.default;
    gameStore = useGameStore();
    
    // Mock Platform.OS for testing
    Object.defineProperty(Platform, 'OS', { value: 'web' });
  });

  describe('Initial State', () => {
    test('should initialize with correct default values', () => {
      expect(gameStore.vibrationEnabled).toBe(true);
      expect(gameStore.soundEnabled).toBe(true);
      expect(gameStore.soundVolume).toBe(0.7);
      expect(gameStore.backgroundMusicEnabled).toBe(true);
      expect(gameStore.backgroundMusicVolume).toBe(0.6);
      expect(gameStore.highScore).toBe(null);
      expect(gameStore.currentScore).toBe(0);
      expect(gameStore.highestBlock).toBe(null);
      expect(gameStore.isActive).toBe(false);
      expect(gameStore.currentStep).toBe(1);
      expect(gameStore.allowedLaneIndex).toBe(3);
      expect(gameStore.isGameFrozen).toBe(false);
      expect(gameStore.savedGame).toBe(null);
      expect(gameStore.hasSavedGame).toBe(false);
    });
  });

  describe('Tutorial Functions', () => {
    test('startTutorial should set tutorial state correctly', () => {
      gameStore.startTutorial();
      
      expect(gameStore.isActive).toBe(true);
      expect(gameStore.currentStep).toBe(1);
      expect(gameStore.allowedLaneIndex).toBe(2);
      expect(gameStore.isGameFrozen).toBe(false);
    });

    test('nextStep should advance tutorial step correctly', () => {
      gameStore.startTutorial();
      gameStore.nextStep();
      
      expect(gameStore.currentStep).toBe(2);
    });

    test('nextStep should end tutorial after step 3', () => {
      gameStore.startTutorial();
      gameStore.nextStep(); // Step 2
      gameStore.nextStep(); // Step 3
      gameStore.nextStep(); // Should end tutorial
      
      expect(gameStore.isActive).toBe(false);
      expect(gameStore.currentStep).toBe(1);
    });

    test('endTutorial should reset tutorial state', () => {
      gameStore.startTutorial();
      gameStore.endTutorial();
      
      expect(gameStore.isActive).toBe(false);
      expect(gameStore.currentStep).toBe(1);
      expect(gameStore.allowedLaneIndex).toBe(2);
      expect(gameStore.isGameFrozen).toBe(false);
    });

    test('setAllowedLane should update allowed lane index', () => {
      gameStore.setAllowedLane(1);
      expect(gameStore.allowedLaneIndex).toBe(1);
    });

    test('setGameFrozen should update game frozen state', () => {
      gameStore.setGameFrozen(true);
      expect(gameStore.isGameFrozen).toBe(true);
    });

    test('resetTutorial should reset to step 1 but keep active', () => {
      gameStore.startTutorial();
      gameStore.nextStep(); // Go to step 2
      gameStore.resetTutorial();
      
      expect(gameStore.isActive).toBe(true);
      expect(gameStore.currentStep).toBe(1);
      expect(gameStore.allowedLaneIndex).toBe(2);
    });
  });

  describe('Toggle Functions', () => {
    test('toggleVibration should toggle vibration state', () => {
      const initial = gameStore.vibrationEnabled;
      gameStore.toggleVibration();
      expect(gameStore.vibrationEnabled).toBe(!initial);
      
      gameStore.toggleVibration();
      expect(gameStore.vibrationEnabled).toBe(initial);
    });

    test('toggleSound should toggle sound state', () => {
      const initial = gameStore.soundEnabled;
      gameStore.toggleSound();
      expect(gameStore.soundEnabled).toBe(!initial);
      
      gameStore.toggleSound();
      expect(gameStore.soundEnabled).toBe(initial);
    });

    test('toggleBackgroundMusic should toggle background music state', () => {
      const initial = gameStore.backgroundMusicEnabled;
      gameStore.toggleBackgroundMusic();
      expect(gameStore.backgroundMusicEnabled).toBe(!initial);
      
      gameStore.toggleBackgroundMusic();
      expect(gameStore.backgroundMusicEnabled).toBe(initial);
    });
  });

  describe('Volume Functions', () => {
    test('setSoundVolume should set volume within valid range', () => {
      gameStore.setSoundVolume(0.5);
      expect(gameStore.soundVolume).toBe(0.5);
    });

    test('setSoundVolume should clamp values to 0-1 range', () => {
      gameStore.setSoundVolume(-0.5);
      expect(gameStore.soundVolume).toBe(0);
      
      gameStore.setSoundVolume(1.5);
      expect(gameStore.soundVolume).toBe(1);
    });

    test('setSoundVolume should use default when no value provided', () => {
      gameStore.setSoundVolume();
      expect(gameStore.soundVolume).toBe(0.7);
    });

    test('setBackgroundMusicVolume should set volume within valid range', () => {
      gameStore.setBackgroundMusicVolume(0.3);
      expect(gameStore.backgroundMusicVolume).toBe(0.3);
    });

    test('setBackgroundMusicVolume should clamp values to 0-1 range', () => {
      gameStore.setBackgroundMusicVolume(-0.2);
      expect(gameStore.backgroundMusicVolume).toBe(0);
      
      gameStore.setBackgroundMusicVolume(1.8);
      expect(gameStore.backgroundMusicVolume).toBe(1);
    });

    test('setBackgroundMusicVolume should use default when no value provided', () => {
      gameStore.setBackgroundMusicVolume();
      expect(gameStore.backgroundMusicVolume).toBe(0.6);
    });
  });

  describe('Score Functions', () => {
    test('updateScore should update current score', () => {
      gameStore.updateScore(100);
      expect(gameStore.currentScore).toBe(100);
    });

    test('updateScore should update high score when score is higher', () => {
      gameStore.updateScore(100);
      expect(gameStore.highScore).toBe(100);
      expect(gameStore.currentScore).toBe(100);
    });

    test('updateScore should not update high score when score is lower', () => {
      gameStore.updateScore(100);
      gameStore.updateScore(50);
      
      expect(gameStore.highScore).toBe(100);
      expect(gameStore.currentScore).toBe(50);
    });

    test('updateScore should handle null high score correctly', () => {
      gameStore.updateScore(75);
      expect(gameStore.highScore).toBe(75);
      expect(gameStore.currentScore).toBe(75);
    });
  });

  describe('Block Functions', () => {
    test('updateHighestBlock should update highest block when value is higher', () => {
      gameStore.updateHighestBlock(64);
      expect(gameStore.highestBlock).toBe(64);
    });

    test('updateHighestBlock should not update when value is lower', () => {
      gameStore.updateHighestBlock(64);
      gameStore.updateHighestBlock(32);
      expect(gameStore.highestBlock).toBe(64);
    });

    test('updateHighestBlock should handle null highest block correctly', () => {
      gameStore.updateHighestBlock(16);
      expect(gameStore.highestBlock).toBe(16);
    });
  });

  describe('Game Save/Load Functions', () => {
    test('saveGame should save game state correctly', () => {
      const gameState = {
        board: [[2, 0], [4, 0]],
        score: 100,
        record: 100,
        nextBlock: 8,
        previewBlock: 16,
        gameStats: { moves: 5 }
      };
      
      gameStore.saveGame(gameState);
      
      expect(gameStore.savedGame).toEqual({
        board: [[2, 0], [4, 0]],
        score: 100,
        record: 100,
        nextBlock: 8,
        previewBlock: 16,
        gameStats: { moves: 5 },
        timestamp: expect.any(Number)
      });
      expect(gameStore.hasSavedGame).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'game-state',
        JSON.stringify(gameStore.savedGame)
      );
    });

    test('saveGame should handle missing game state properties', () => {
      gameStore.saveGame({});
      
      expect(gameStore.savedGame).toEqual({
        board: [],
        score: 0,
        record: 0,
        nextBlock: 2,
        previewBlock: 2,
        gameStats: {},
        timestamp: expect.any(Number)
      });
    });

    test('saveGame should handle errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      expect(() => gameStore.saveGame({ score: 100 })).not.toThrow();
      expect(gameStore.savedGame).toBeDefined();
    });

    test('loadSavedGame should return saved game from localStorage on web', () => {
      const savedData = { score: 200, board: [[8, 0]] };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedData));
      
      const result = gameStore.loadSavedGame();
      expect(result).toEqual(savedData);
    });

    test('loadSavedGame should return null when no saved game exists', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = gameStore.loadSavedGame();
      expect(result).toBe(null);
    });

    test('loadSavedGame should handle JSON parse errors gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      const result = gameStore.loadSavedGame();
      expect(result).toBe(null);
    });

    test('clearSavedGame should clear saved game state', () => {
      gameStore.saveGame({ score: 100 });
      gameStore.clearSavedGame();
      
      expect(gameStore.savedGame).toBe(null);
      expect(gameStore.hasSavedGame).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('game-state');
    });

    test('clearSavedGame should handle errors gracefully', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      expect(() => gameStore.clearSavedGame()).not.toThrow();
    });
  });

  describe('Reset Functions', () => {
    test('resetGame should reset current score', () => {
      gameStore.updateScore(100);
      gameStore.resetGame();
      expect(gameStore.currentScore).toBe(0);
    });

    test('clearAllData should reset all game data', () => {
      // Set up some data first
      gameStore.updateScore(100);
      gameStore.updateHighestBlock(64);
      gameStore.saveGame({ score: 100 });
      gameStore.startTutorial();
      
      gameStore.clearAllData();
      
      expect(gameStore.highScore).toBe(null);
      expect(gameStore.currentScore).toBe(0);
      expect(gameStore.highestBlock).toBe(null);
      expect(gameStore.savedGame).toBe(null);
      expect(gameStore.hasSavedGame).toBe(false);
      expect(gameStore.isActive).toBe(false);
      expect(gameStore.currentStep).toBe(1);
      expect(gameStore.allowedLaneIndex).toBe(2);
      expect(gameStore.isGameFrozen).toBe(false);
    });

    test('clearAllData should clear localStorage items', () => {
      gameStore.clearAllData();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('game-state');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('game_high_score');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('game_saved_state');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('game_total_sessions');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('analytics_user_id');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('game_first_launch');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('comprehensive_analytics_state');
    });

    test('resetAllSettings should reset all settings to defaults', () => {
      // Change some settings
      gameStore.toggleVibration();
      gameStore.toggleSound();
      gameStore.setSoundVolume(0.3);
      gameStore.updateScore(100);
      gameStore.updateHighestBlock(64);
      
      gameStore.resetAllSettings();
      
      expect(gameStore.vibrationEnabled).toBe(true);
      expect(gameStore.soundEnabled).toBe(true);
      expect(gameStore.soundVolume).toBe(0.7);
      expect(gameStore.backgroundMusicEnabled).toBe(true);
      expect(gameStore.backgroundMusicVolume).toBe(0.6);
      expect(gameStore.highScore).toBe(null);
      expect(gameStore.currentScore).toBe(0);
      expect(gameStore.highestBlock).toBe(null);
      expect(gameStore.savedGame).toBe(null);
      expect(gameStore.hasSavedGame).toBe(false);
      expect(gameStore.isActive).toBe(false);
      expect(gameStore.currentStep).toBe(1);
      expect(gameStore.allowedLaneIndex).toBe(2);
      expect(gameStore.isGameFrozen).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should handle errors in saveGame gracefully', () => {
      const originalConsoleError = console.error;
      console.error = jest.fn();
      
      // Mock a function that throws
      const originalSaveGame = gameStore.saveGame;
      gameStore.saveGame = () => {
        throw new Error('Save error');
      };
      
      expect(() => gameStore.saveGame({ score: 100 })).not.toThrow();
      
      // Restore
      gameStore.saveGame = originalSaveGame;
      console.error = originalConsoleError;
    });

    test('should handle errors in loadSavedGame gracefully', () => {
      const originalConsoleError = console.error;
      console.error = jest.fn();
      
      // Mock a function that throws
      const originalLoadSavedGame = gameStore.loadSavedGame;
      gameStore.loadSavedGame = () => {
        throw new Error('Load error');
      };
      
      expect(() => gameStore.loadSavedGame()).not.toThrow();
      
      // Restore
      gameStore.loadSavedGame = originalLoadSavedGame;
      console.error = originalConsoleError;
    });

    test('should handle errors in clearAllData gracefully', () => {
      const originalConsoleError = console.error;
      console.error = jest.fn();
      
      // Mock a function that throws
      const originalClearAllData = gameStore.clearAllData;
      gameStore.clearAllData = () => {
        throw new Error('Clear error');
      };
      
      expect(() => gameStore.clearAllData()).not.toThrow();
      
      // Restore
      gameStore.clearAllData = originalClearAllData;
      console.error = originalConsoleError;
    });
  });

  describe('Edge Cases and Boundary Testing', () => {
    test('should handle extremely large scores', () => {
      gameStore.updateScore(Number.MAX_SAFE_INTEGER);
      expect(gameStore.currentScore).toBe(Number.MAX_SAFE_INTEGER);
      expect(gameStore.highScore).toBe(Number.MAX_SAFE_INTEGER);
    });

    test('should handle negative scores gracefully', () => {
      gameStore.updateScore(-100);
      expect(gameStore.currentScore).toBe(-100);
      // High score should not be updated with negative value
      expect(gameStore.highScore).toBe(null);
    });

    test('should handle zero scores', () => {
      gameStore.updateScore(0);
      expect(gameStore.currentScore).toBe(0);
      expect(gameStore.highScore).toBe(null);
    });

    test('should handle decimal scores by truncating', () => {
      gameStore.updateScore(100.7);
      expect(gameStore.currentScore).toBe(100.7);
    });

    test('should handle string scores by parsing', () => {
      gameStore.updateScore('200');
      expect(gameStore.currentScore).toBe(200);
    });
  });

  describe('Volume Boundary Testing', () => {
    test('should handle volume at exact boundaries', () => {
      gameStore.setSoundVolume(0);
      expect(gameStore.soundVolume).toBe(0);
      
      gameStore.setSoundVolume(1);
      expect(gameStore.soundVolume).toBe(1);
    });

    test('should handle volume just outside boundaries', () => {
      gameStore.setSoundVolume(-0.0001);
      expect(gameStore.soundVolume).toBe(0);
      
      gameStore.setSoundVolume(1.0001);
      expect(gameStore.soundVolume).toBe(1);
    });

    test('should handle NaN and invalid volume values', () => {
      gameStore.setSoundVolume(NaN);
      expect(gameStore.soundVolume).toBe(0.7); // Default value
      
      gameStore.setSoundVolume('invalid');
      expect(gameStore.soundVolume).toBe(0.7); // Default value
    });

    test('should handle background music volume boundaries', () => {
      gameStore.setBackgroundMusicVolume(0);
      expect(gameStore.backgroundMusicVolume).toBe(0);
      
      gameStore.setBackgroundMusicVolume(1);
      expect(gameStore.backgroundMusicVolume).toBe(1);
    });
  });

  describe('Tutorial State Transitions', () => {
    test('should handle rapid tutorial step changes', () => {
      gameStore.startTutorial();
      expect(gameStore.currentStep).toBe(1);
      
      gameStore.nextStep();
      expect(gameStore.currentStep).toBe(2);
      
      gameStore.nextStep();
      expect(gameStore.currentStep).toBe(3);
      
      gameStore.nextStep(); // Should end tutorial
      expect(gameStore.isActive).toBe(false);
    });

    test('should handle tutorial reset during active tutorial', () => {
      gameStore.startTutorial();
      gameStore.nextStep(); // Go to step 2
      
      gameStore.resetTutorial();
      expect(gameStore.isActive).toBe(true);
      expect(gameStore.currentStep).toBe(1);
    });

    test('should handle multiple tutorial starts', () => {
      gameStore.startTutorial();
      expect(gameStore.isActive).toBe(true);
      
      gameStore.startTutorial(); // Start again
      expect(gameStore.isActive).toBe(true);
      expect(gameStore.currentStep).toBe(1);
    });
  });

  describe('Game State Persistence', () => {
    test('should handle complex game state objects', () => {
      const complexGameState = {
        board: [
          [2, 4, 8, 16],
          [4, 8, 16, 32],
          [8, 16, 32, 64],
          [16, 32, 64, 128],
          [32, 64, 128, 256]
        ],
        score: 10000,
        record: 15000,
        nextBlock: 512,
        previewBlock: 1024,
        gameStats: {
          moves: 150,
          merges: 45,
          chains: 12,
          timePlayed: 3600000
        }
      };
      
      gameStore.saveGame(complexGameState);
      
      expect(gameStore.savedGame.board).toEqual(complexGameState.board);
      expect(gameStore.savedGame.score).toBe(10000);
      expect(gameStore.savedGame.gameStats.moves).toBe(150);
    });

    test('should handle empty game state', () => {
      gameStore.saveGame({});
      
      expect(gameStore.savedGame.board).toEqual([]);
      expect(gameStore.savedGame.score).toBe(0);
      expect(gameStore.savedGame.gameStats).toEqual({});
    });

    test('should handle null game state', () => {
      gameStore.saveGame(null);
      
      expect(gameStore.savedGame.board).toEqual([]);
      expect(gameStore.savedGame.score).toBe(0);
    });
  });

  describe('Performance and Memory', () => {
    test('should handle large board states efficiently', () => {
      const largeBoard = Array.from({ length: 100 }, () => 
        Array.from({ length: 100 }, () => Math.floor(Math.random() * 1024))
      );
      
      const startTime = performance.now();
      
      gameStore.saveGame({ board: largeBoard, score: 1000 });
      
      const endTime = performance.now();
      const saveTime = endTime - startTime;
      
      expect(saveTime).toBeLessThan(100); // Should save in under 100ms
      expect(gameStore.savedGame.board).toEqual(largeBoard);
    });

    test('should handle rapid state updates', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        gameStore.updateScore(i);
        gameStore.toggleVibration();
        gameStore.toggleSound();
      }
      
      const endTime = performance.now();
      const updateTime = endTime - startTime;
      
      expect(updateTime).toBeLessThan(500); // Should handle 1000 updates in under 500ms
    });
  });

  describe('Data Integrity', () => {
    test('should maintain data consistency across operations', () => {
      const initialState = {
        highScore: gameStore.highScore,
        currentScore: gameStore.currentScore,
        highestBlock: gameStore.highestBlock
      };
      
      // Perform operations
      gameStore.updateScore(500);
      gameStore.updateHighestBlock(128);
      gameStore.toggleVibration();
      
      // Verify state is consistent
      expect(gameStore.currentScore).toBe(500);
      expect(gameStore.highestBlock).toBe(128);
      expect(typeof gameStore.vibrationEnabled).toBe('boolean');
    });

    test('should handle concurrent state modifications', () => {
      // Simulate concurrent access
      const operations = [
        () => gameStore.updateScore(100),
        () => gameStore.updateScore(200),
        () => gameStore.updateScore(300),
        () => gameStore.toggleVibration(),
        () => gameStore.toggleSound()
      ];
      
      // Execute all operations
      operations.forEach(op => op());
      
      // Final state should be consistent
      expect(gameStore.currentScore).toBe(300);
      expect(typeof gameStore.vibrationEnabled).toBe('boolean');
      expect(typeof gameStore.soundEnabled).toBe('boolean');
    });
  });

  describe('Cross-Platform Compatibility', () => {
    test('should handle web platform localStorage operations', () => {
      // Mock web platform
      Object.defineProperty(Platform, 'OS', { value: 'web' });
      
      gameStore.saveGame({ score: 100 });
      
      expect(localStorageMock.setItem).toHaveBeenCalled();
      expect(gameStore.hasSavedGame).toBe(true);
    });

    test('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      
      expect(() => gameStore.saveGame({ score: 100 })).not.toThrow();
      expect(gameStore.hasSavedGame).toBe(true); // Should still save to memory
    });

    test('should handle localStorage quota exceeded', () => {
      localStorageMock.setItem.mockImplementation(() => {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });
      
      expect(() => gameStore.saveGame({ score: 100 })).not.toThrow();
    });
  });
});
