import { Platform } from 'react-native';

// Mock Platform.OS for testing
jest.mock('react-native', () => ({
  Platform: {
    OS: 'web'
  }
}));

// Mock the helpers module
jest.mock('../store/helpers', () => ({
  create: jest.fn()
}));

// Mock the tutorial slice
jest.mock('../store/tutorialSlice', () => ({
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
jest.mock('../components/constants', () => ({
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
    const storeModule = require('../store/gameStore');
    useGameStore = storeModule.default;
    gameStore = useGameStore();
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
  });
});
