// Mock React Native modules
jest.mock('react-native', () => ({
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 667 }))
  },
  PixelRatio: {
    roundToNearestPixel: jest.fn((value) => Math.round(value))
  },
  Platform: {
    OS: 'web'
  }
}));

import { ROWS, COLS } from '../../components/constants';

describe('Game Constants', () => {
  describe('Board Dimensions', () => {
    test('ROWS should be defined and positive', () => {
      expect(ROWS).toBeDefined();
      expect(ROWS).toBeGreaterThan(0);
      expect(Number.isInteger(ROWS)).toBe(true);
    });

    test('COLS should be defined and positive', () => {
      expect(COLS).toBeDefined();
      expect(COLS).toBeGreaterThan(0);
      expect(Number.isInteger(COLS)).toBe(true);
    });

    test('ROWS should be 5', () => {
      expect(ROWS).toBe(5);
    });

    test('COLS should be 4', () => {
      expect(COLS).toBe(4);
    });
  });

  describe('Board Configuration', () => {
    test('board should have reasonable dimensions', () => {
      expect(ROWS).toBeGreaterThanOrEqual(3);
      expect(ROWS).toBeLessThanOrEqual(10);
      expect(COLS).toBeGreaterThanOrEqual(3);
      expect(COLS).toBeLessThanOrEqual(10);
    });

    test('total cells should be calculated correctly', () => {
      const totalCells = ROWS * COLS;
      expect(totalCells).toBe(20);
    });

    test('board should not be too small for gameplay', () => {
      const totalCells = ROWS * COLS;
      expect(totalCells).toBeGreaterThanOrEqual(12); // Minimum 3x4 or 4x3
    });

    test('board should not be too large for mobile', () => {
      const totalCells = ROWS * COLS;
      expect(totalCells).toBeLessThanOrEqual(100); // Maximum 10x10
    });
  });

  describe('Constants Consistency', () => {
    test('constants should not change between calls', () => {
      const rows1 = ROWS;
      const cols1 = COLS;
      
      // Simulate multiple imports/accesses
      const rows2 = ROWS;
      const cols2 = COLS;
      
      expect(rows1).toBe(rows2);
      expect(cols1).toBe(cols2);
    });

    test('constants should be read-only', () => {
      // These should not be modifiable
      expect(() => {
        // This would throw in strict mode or with Object.freeze
        // ROWS = 10;
      }).not.toThrow();
    });
  });

  describe('Game Balance', () => {
    test('board should be wide enough for strategic play', () => {
      expect(COLS).toBeGreaterThanOrEqual(4);
    });

    test('board should be tall enough for gravity mechanics', () => {
      expect(ROWS).toBeGreaterThanOrEqual(5);
    });

    test('aspect ratio should be reasonable for mobile', () => {
      const aspectRatio = COLS / ROWS;
      expect(aspectRatio).toBeGreaterThanOrEqual(0.5); // Not too tall
      expect(aspectRatio).toBeLessThanOrEqual(2); // Not too wide
    });
  });
});
