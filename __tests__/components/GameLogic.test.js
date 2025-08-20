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

    test('should handle extremely large board dimensions', () => {
      const largeBoard = Array.from({ length: 1000 }, () => 
        Array.from({ length: 1000 }, () => 0)
      );
      
      expect(() => findConnectedTiles(largeBoard, 500, 500)).not.toThrow();
    });

    test('should handle board with all same values', () => {
      const uniformBoard = Array.from({ length: 5 }, () => 
        Array.from({ length: 4 }, () => 2)
      );
      
      const connected = findConnectedTiles(uniformBoard, 0, 0);
      expect(connected).toHaveLength(20); // All 20 cells should be connected
    });

    test('should handle board with alternating values', () => {
      const alternatingBoard = Array.from({ length: 5 }, (_, row) => 
        Array.from({ length: 4 }, (_, col) => (row + col) % 2 === 0 ? 2 : 4)
      );
      
      const connected = findConnectedTiles(alternatingBoard, 0, 0);
      expect(connected).toHaveLength(10); // Should find 10 connected 2s
    });
  });

  describe('Performance Testing', () => {
    test('should handle large board operations efficiently', () => {
      const largeBoard = Array.from({ length: 100 }, () => 
        Array.from({ length: 100 }, () => Math.floor(Math.random() * 1024))
      );
      
      const startTime = performance.now();
      
      // Test multiple operations
      for (let i = 0; i < 10; i++) {
        applyGravity(largeBoard, i % 100);
        findConnectedTiles(largeBoard, 50, 50);
      }
      
      const endTime = performance.now();
      const operationTime = endTime - startTime;
      
      expect(operationTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    test('should handle rapid gravity applications', () => {
      const board = Array.from({ length: 5 }, () => 
        Array.from({ length: 4 }, () => Math.floor(Math.random() * 1024))
      );
      
      const startTime = performance.now();
      
      // Apply gravity to all columns rapidly
      for (let i = 0; i < 1000; i++) {
        applyGravity(board, i % 4);
      }
      
      const endTime = performance.now();
      const operationTime = endTime - startTime;
      
      expect(operationTime).toBeLessThan(500); // Should handle 1000 operations in under 500ms
    });
  });

  describe('Algorithm Correctness', () => {
    test('should correctly identify L-shaped connections', () => {
      const lShapedBoard = [
        [2, 0, 0, 0],
        [2, 0, 0, 0],
        [2, 2, 2, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      
      const connected = findConnectedTiles(lShapedBoard, 0, 0);
      expect(connected).toHaveLength(5); // L-shape has 5 connected tiles
    });

    test('should correctly identify T-shaped connections', () => {
      const tShapedBoard = [
        [0, 2, 0, 0],
        [2, 2, 2, 0],
        [0, 2, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      
      const connected = findConnectedTiles(tShapedBoard, 1, 1);
      expect(connected).toHaveLength(5); // T-shape has 5 connected tiles
    });

    test('should correctly identify cross-shaped connections', () => {
      const crossShapedBoard = [
        [0, 2, 0, 0],
        [2, 2, 2, 0],
        [0, 2, 0, 0],
        [0, 2, 0, 0],
        [0, 0, 0, 0]
      ];
      
      const connected = findConnectedTiles(crossShapedBoard, 1, 1);
      expect(connected).toHaveLength(6); // Cross has 6 connected tiles
    });
  });

  describe('Gravity Mechanics', () => {
    test('should handle gravity with mixed tile values', () => {
      const mixedBoard = [
        [2, 0, 0, 0],
        [4, 0, 0, 0],
        [8, 0, 0, 0],
        [16, 0, 0, 0],
        [32, 0, 0, 0]
      ];
      
      applyGravity(mixedBoard, 0);
      
      expect(mixedBoard[4][0]).toBe(2);
      expect(mixedBoard[3][0]).toBe(4);
      expect(mixedBoard[2][0]).toBe(8);
      expect(mixedBoard[1][0]).toBe(16);
      expect(mixedBoard[0][0]).toBe(32);
    });

    test('should handle upward gravity with mixed tile values', () => {
      const mixedBoard = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [32, 0, 0, 0],
        [16, 0, 0, 0],
        [8, 0, 0, 0]
      ];
      
      applyUpwardGravity(mixedBoard, 0);
      
      expect(mixedBoard[0][0]).toBe(32);
      expect(mixedBoard[1][0]).toBe(16);
      expect(mixedBoard[2][0]).toBe(8);
      expect(mixedBoard[3][0]).toBe(0);
      expect(mixedBoard[4][0]).toBe(0);
    });

    test('should handle gravity with no empty spaces', () => {
      const fullBoard = [
        [2, 4, 8, 16],
        [4, 8, 16, 32],
        [8, 16, 32, 64],
        [16, 32, 64, 128],
        [32, 64, 128, 256]
      ];
      
      const originalBoard = JSON.parse(JSON.stringify(fullBoard));
      
      applyGravity(fullBoard, 0);
      
      // Board should remain unchanged
      expect(fullBoard).toEqual(originalBoard);
    });
  });

  describe('Merging Logic', () => {
    test('should handle merging with different tile values', () => {
      const board = [
        [2, 4, 0, 0],
        [2, 4, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      
      // Test merging 2s
      const result1 = mergeConnectedTiles(board, 0, 0);
      expect(result1.mergedTiles).toHaveLength(2);
      expect(board[0][0]).toBe(4);
      
      // Test merging 4s
      const result2 = mergeConnectedTiles(board, 0, 1);
      expect(result2.mergedTiles).toHaveLength(2);
      expect(board[0][1]).toBe(8);
    });

    test('should handle chain merging scenarios', () => {
      const board = [
        [2, 2, 2, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      
      const result = mergeConnectedTiles(board, 0, 0);
      
      // Should merge all three 2s into one 8
      expect(result.mergedTiles).toHaveLength(3);
      expect(board[0][0]).toBe(8);
      expect(board[0][1]).toBe(0);
      expect(board[0][2]).toBe(0);
    });

    test('should handle merging at board edges', () => {
      const board = [
        [2, 0, 0, 2],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      
      // Test merging at left edge
      const result1 = mergeConnectedTiles(board, 0, 0);
      expect(result1.mergedTiles).toHaveLength(1); // Only one tile at position
      
      // Test merging at right edge
      const result2 = mergeConnectedTiles(board, 0, 3);
      expect(result2.mergedTiles).toHaveLength(1); // Only one tile at position
    });
  });

  describe('Move Validation', () => {
    test('should validate moves at all board positions', () => {
      const board = Array.from({ length: 5 }, () => 
        Array.from({ length: 4 }, () => 0)
      );
      
      // Test all valid positions
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 4; col++) {
          expect(isValidMove(board, row, col)).toBe(true);
        }
      }
    });

    test('should reject moves to occupied cells', () => {
      const board = [
        [2, 0, 0, 0],
        [0, 4, 0, 0],
        [0, 0, 8, 0],
        [0, 0, 0, 16],
        [0, 0, 0, 0]
      ];
      
      expect(isValidMove(board, 0, 0)).toBe(false); // Occupied by 2
      expect(isValidMove(board, 1, 1)).toBe(false); // Occupied by 4
      expect(isValidMove(board, 2, 2)).toBe(false); // Occupied by 8
      expect(isValidMove(board, 3, 3)).toBe(false); // Occupied by 16
      
      expect(isValidMove(board, 0, 1)).toBe(true);  // Empty
      expect(isValidMove(board, 4, 0)).toBe(true);  // Empty
    });

    test('should handle boundary conditions correctly', () => {
      const board = Array.from({ length: 5 }, () => 
        Array.from({ length: 4 }, () => 0)
      );
      
      // Test exact boundaries
      expect(isValidMove(board, 0, 0)).toBe(true);   // Top-left
      expect(isValidMove(board, 0, 3)).toBe(true);   // Top-right
      expect(isValidMove(board, 4, 0)).toBe(true);   // Bottom-left
      expect(isValidMove(board, 4, 3)).toBe(true);   // Bottom-right
      
      // Test just outside boundaries
      expect(isValidMove(board, -1, 0)).toBe(false); // Above top
      expect(isValidMove(board, 5, 0)).toBe(false);  // Below bottom
      expect(isValidMove(board, 0, -1)).toBe(false); // Left of left
      expect(isValidMove(board, 0, 4)).toBe(false);  // Right of right
    });
  });

  describe('Score Calculation', () => {
    test('should calculate scores for all tile values', () => {
      const tileValues = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];
      
      tileValues.forEach(value => {
        expect(calculateScore(value)).toBe(value);
      });
    });

    test('should handle edge case scores', () => {
      expect(calculateScore(0)).toBe(0);
      expect(calculateScore(-1)).toBe(0);
      expect(calculateScore(Number.MAX_SAFE_INTEGER)).toBe(Number.MAX_SAFE_INTEGER);
    });

    test('should handle decimal scores', () => {
      expect(calculateScore(2.5)).toBe(2.5);
      expect(calculateScore(10.7)).toBe(10.7);
    });
  });

  describe('Game Over Detection', () => {
    test('should detect game over with no valid moves', () => {
      const board = [
        [2, 4, 8, 16],
        [4, 8, 16, 32],
        [8, 16, 32, 64],
        [16, 32, 64, 128],
        [32, 64, 128, 256]
      ];
      
      expect(checkGameOver(board)).toBe(true);
    });

    test('should detect game over with isolated tiles', () => {
      const board = [
        [2, 4, 8, 16],
        [4, 8, 16, 32],
        [8, 16, 32, 64],
        [16, 32, 64, 128],
        [32, 64, 128, 0]
      ];
      
      // No possible merges
      expect(checkGameOver(board)).toBe(true);
    });

    test('should not detect game over when merges are possible', () => {
      const board = [
        [2, 2, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      
      expect(checkGameOver(board)).toBe(false); // Can merge the 2s
    });

    test('should not detect game over with empty spaces', () => {
      const board = [
        [2, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      
      expect(checkGameOver(board)).toBe(false); // Plenty of empty space
    });
  });

  describe('Board Management', () => {
    test('should create board with correct dimensions', () => {
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

    test('should create independent board instances', () => {
      const board1 = resetBoard();
      const board2 = resetBoard();
      
      // Modify one board
      board1[0][0] = 2;
      
      // Other board should remain unchanged
      expect(board2[0][0]).toBe(0);
      expect(board1[0][0]).toBe(2);
    });

    test('should handle board modifications correctly', () => {
      const board = resetBoard();
      
      // Place some tiles
      board[0][0] = 2;
      board[1][1] = 4;
      board[2][2] = 8;
      
      // Verify placements
      expect(board[0][0]).toBe(2);
      expect(board[1][1]).toBe(4);
      expect(board[2][2]).toBe(8);
      
      // Verify other cells remain 0
      expect(board[0][1]).toBe(0);
      expect(board[1][0]).toBe(0);
    });
  });
});
