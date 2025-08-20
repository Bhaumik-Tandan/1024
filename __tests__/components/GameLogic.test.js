// Mock dependencies
jest.mock('../../components/GameRules', () => ({
  GAME_CONFIG: { BOARD: { ROWS: 5, COLS: 4 } },
  GAME_RULES: {},
  GameValidator: {
    isValidBoard: jest.fn()
  },
  ScoringSystem: {},
  GameHelpers: {
    generateRandomTile: jest.fn(() => 2)
  }
}));

jest.mock('../../utils/vibration', () => ({
  vibrateOnIntermediateMerge: jest.fn(),
  vibrateOnMerge: jest.fn(),
  vibrateOnTouch: jest.fn()
}));

jest.mock('../../utils/soundManager', () => ({
  default: {
    playSound: jest.fn(),
    playBackgroundMusic: jest.fn(),
    stopBackgroundMusic: jest.fn()
  }
}));

// Import after mocking
const { 
  getRandomBlockValue,
  applyUpwardGravity,
  applyGravity,
  findConnectedTiles,
  mergeConnectedTiles,
  isValidMove,
  calculateScore,
  checkGameOver,
  resetBoard
} = require('../../components/GameLogic');

const { GameValidator, GameHelpers } = require('../../components/GameRules');

describe('GameLogic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    GameValidator.isValidBoard.mockReturnValue(true);
  });

  describe('getRandomBlockValue', () => {
    test('should return random tile value from GameHelpers', () => {
      const result = getRandomBlockValue();
      expect(GameHelpers.generateRandomTile).toHaveBeenCalled();
      expect(result).toBe(2);
    });
  });

  describe('applyUpwardGravity', () => {
    test('should apply upward gravity to a column', () => {
      const board = [
        [0, 0, 0, 0],
        [2, 0, 0, 0],
        [4, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      
      applyUpwardGravity(board, 0);
      
      expect(board[0][0]).toBe(2);
      expect(board[1][0]).toBe(4);
      expect(board[2][0]).toBe(0);
    });

    test('should not modify board when column is out of bounds', () => {
      const board = [[0, 0], [2, 0], [4, 0], [0, 0], [0, 0]];
      const originalBoard = JSON.parse(JSON.stringify(board));
      
      applyUpwardGravity(board, 5); // Out of bounds
      
      expect(board).toEqual(originalBoard);
    });

    test('should not modify board when validation fails', () => {
      GameValidator.isValidBoard.mockReturnValue(false);
      const board = [[0, 0], [2, 0], [4, 0], [0, 0], [0, 0]];
      const originalBoard = JSON.parse(JSON.stringify(board));
      
      applyUpwardGravity(board, 0);
      
      expect(board).toEqual(originalBoard);
    });
  });

  describe('applyGravity', () => {
    test('should apply gravity to a column', () => {
      const board = [
        [2, 0, 0, 0],
        [0, 0, 0, 0],
        [4, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      
      applyGravity(board, 0);
      
      expect(board[4][0]).toBe(2);
      expect(board[3][0]).toBe(4);
      expect(board[0][0]).toBe(0);
      expect(board[2][0]).toBe(0);
    });

    test('should not modify board when column is out of bounds', () => {
      const board = [[2, 0], [0, 0], [4, 0], [0, 0], [0, 0]];
      const originalBoard = JSON.parse(JSON.stringify(board));
      
      applyGravity(board, -1); // Out of bounds
      
      expect(board).toEqual(originalBoard);
    });
  });

  describe('findConnectedTiles', () => {
    test('should find connected tiles with same value', () => {
      const board = [
        [2, 0, 0, 0],
        [2, 0, 0, 0],
        [2, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      
      const connected = findConnectedTiles(board, 0, 0);
      
      expect(connected).toContainEqual([0, 0]);
      expect(connected).toContainEqual([1, 0]);
      expect(connected).toContainEqual([2, 0]);
      expect(connected).toHaveLength(3);
    });

    test('should return empty array for empty tile', () => {
      const board = [
        [0, 0, 0, 0],
        [2, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      
      const connected = findConnectedTiles(board, 0, 0);
      
      expect(connected).toEqual([]);
    });

    test('should find tiles in all directions', () => {
      const board = [
        [0, 2, 0, 0],
        [2, 2, 2, 0],
        [0, 2, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      
      const connected = findConnectedTiles(board, 1, 1);
      
      expect(connected).toHaveLength(5); // Cross pattern
    });
  });

  describe('mergeConnectedTiles', () => {
    test('should merge connected tiles and return score', () => {
      const board = [
        [2, 0, 0, 0],
        [2, 0, 0, 0],
        [2, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      
      const result = mergeConnectedTiles(board, 0, 0);
      
      expect(result.score).toBeGreaterThan(0);
      expect(result.mergedTiles).toHaveLength(3);
      expect(board[0][0]).toBe(8); // 2 * 2 * 2
    });

    test('should handle single tile (no merge)', () => {
      const board = [
        [2, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      
      const result = mergeConnectedTiles(board, 0, 0);
      
      expect(result.score).toBe(0);
      expect(result.mergedTiles).toHaveLength(1);
    });
  });

  describe('isValidMove', () => {
    test('should validate valid moves', () => {
      const board = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      
      expect(isValidMove(board, 0, 0)).toBe(true);
      expect(isValidMove(board, 2, 1)).toBe(true);
    });

    test('should reject out of bounds moves', () => {
      const board = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      
      expect(isValidMove(board, -1, 0)).toBe(false);
      expect(isValidMove(board, 0, -1)).toBe(false);
      expect(isValidMove(board, 5, 0)).toBe(false);
      expect(isValidMove(board, 0, 4)).toBe(false);
    });

    test('should reject moves to occupied cells', () => {
      const board = [
        [2, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      
      expect(isValidMove(board, 0, 0)).toBe(false);
    });
  });

  describe('calculateScore', () => {
    test('should calculate score for tile value', () => {
      expect(calculateScore(2)).toBe(2);
      expect(calculateScore(4)).toBe(4);
      expect(calculateScore(8)).toBe(8);
    });

    test('should handle zero and negative values', () => {
      expect(calculateScore(0)).toBe(0);
      expect(calculateScore(-1)).toBe(0);
    });
  });

  describe('checkGameOver', () => {
    test('should detect game over when board is full', () => {
      const board = [
        [2, 4, 8, 16],
        [4, 8, 16, 32],
        [8, 16, 32, 64],
        [16, 32, 64, 128],
        [32, 64, 128, 256]
      ];
      
      expect(checkGameOver(board)).toBe(true);
    });

    test('should detect game over when no valid moves available', () => {
      const board = [
        [2, 4, 8, 16],
        [4, 8, 16, 32],
        [8, 16, 32, 64],
        [16, 32, 64, 128],
        [32, 64, 128, 0]
      ];
      
      expect(checkGameOver(board)).toBe(true);
    });

    test('should not detect game over when moves are available', () => {
      const board = [
        [2, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      
      expect(checkGameOver(board)).toBe(false);
    });
  });

  describe('resetBoard', () => {
    test('should create empty board with correct dimensions', () => {
      const board = resetBoard();
      
      expect(board).toHaveLength(5); // ROWS
      expect(board[0]).toHaveLength(4); // COLS
      
      // All cells should be 0
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 4; col++) {
          expect(board[row][col]).toBe(0);
        }
      }
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty board arrays', () => {
      const emptyBoard = [];
      expect(() => applyGravity(emptyBoard, 0)).not.toThrow();
      expect(() => findConnectedTiles(emptyBoard, 0, 0)).not.toThrow();
    });

    test('should handle null/undefined inputs gracefully', () => {
      expect(() => isValidMove(null, 0, 0)).not.toThrow();
      expect(() => calculateScore(undefined)).not.toThrow();
    });
  });
});
