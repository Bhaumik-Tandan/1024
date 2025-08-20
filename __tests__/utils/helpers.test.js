import { formatNumber, formatPlanetValue } from '../../utils/helpers';

describe('Helpers', () => {
  describe('formatNumber', () => {
    test('should format numbers below 8192 as regular numbers', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(1)).toBe('1');
      expect(formatNumber(100)).toBe('100');
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(8191)).toBe('8,191');
    });

    test('should format numbers 8192 and above with k notation', () => {
      expect(formatNumber(8192)).toBe('8k');
      expect(formatNumber(10000)).toBe('10k');
      expect(formatNumber(15000)).toBe('15k');
      expect(formatNumber(100000)).toBe('100k');
      expect(formatNumber(999999)).toBe('999k');
    });

    test('should handle string inputs by parsing them', () => {
      expect(formatNumber('0')).toBe('0');
      expect(formatNumber('100')).toBe('100');
      expect(formatNumber('8192')).toBe('8k');
      expect(formatNumber('10000')).toBe('10k');
    });

    test('should handle edge cases', () => {
      expect(formatNumber(8192)).toBe('8k');
      expect(formatNumber(8193)).toBe('8k');
      expect(formatNumber(9999)).toBe('9,999');
    });

    test('should handle large numbers correctly', () => {
      expect(formatNumber(1000000)).toBe('1000k');
      expect(formatNumber(9999999)).toBe('9999k');
    });
  });

  describe('formatPlanetValue', () => {
    test('should return infinity symbol for infinity values', () => {
      expect(formatPlanetValue('∞')).toBe('∞');
      expect(formatPlanetValue(Infinity)).toBe('∞');
    });

    test('should return infinity symbol for invalid numbers', () => {
      expect(formatPlanetValue('invalid')).toBe('∞');
      expect(formatPlanetValue('abc')).toBe('∞');
      expect(formatPlanetValue('')).toBe('∞');
    });

    test('should return string representation of valid numbers', () => {
      expect(formatPlanetValue('0')).toBe('0');
      expect(formatPlanetValue('1')).toBe('1');
      expect(formatPlanetValue('100')).toBe('100');
      expect(formatPlanetValue('1000')).toBe('1000');
      expect(formatPlanetValue('8192')).toBe('8192');
    });

    test('should handle numeric inputs', () => {
      expect(formatPlanetValue(0)).toBe('0');
      expect(formatPlanetValue(1)).toBe('1');
      expect(formatPlanetValue(100)).toBe('100');
      expect(formatPlanetValue(1000)).toBe('1000');
    });

    test('should handle edge cases', () => {
      expect(formatPlanetValue(null)).toBe('∞');
      expect(formatPlanetValue(undefined)).toBe('∞');
      expect(formatPlanetValue(NaN)).toBe('∞');
    });

    test('should handle zero and negative numbers', () => {
      expect(formatPlanetValue('0')).toBe('0');
      expect(formatPlanetValue('-1')).toBe('-1');
      expect(formatPlanetValue('-100')).toBe('-100');
    });

    test('should handle decimal numbers', () => {
      expect(formatPlanetValue('3.14')).toBe('3');
      expect(formatPlanetValue('10.5')).toBe('10');
      expect(formatPlanetValue('0.1')).toBe('0');
    });
  });

  describe('Input Validation', () => {
    test('formatNumber should handle various input types', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber('0')).toBe('0');
      expect(formatNumber(100)).toBe('100');
      expect(formatNumber('100')).toBe('100');
    });

    test('formatPlanetValue should handle various input types', () => {
      expect(formatPlanetValue(0)).toBe('0');
      expect(formatPlanetValue('0')).toBe('0');
      expect(formatPlanetValue(100)).toBe('100');
      expect(formatPlanetValue('100')).toBe('100');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('formatNumber should handle very large numbers', () => {
      expect(formatNumber(999999999)).toBe('999999k');
      expect(formatNumber(1000000000)).toBe('1000000k');
    });

    test('formatPlanetValue should handle very large numbers', () => {
      expect(formatPlanetValue('999999999')).toBe('999999999');
      expect(formatPlanetValue('1000000000')).toBe('1000000000');
    });

    test('formatNumber should handle parseInt edge cases', () => {
      // parseInt behavior with various inputs
      expect(formatNumber('12.34')).toBe('12');
      expect(formatNumber('12abc')).toBe('12');
      expect(formatNumber('abc12')).toBe('NaN');
    });

    test('formatPlanetValue should handle parseInt edge cases', () => {
      expect(formatPlanetValue('12.34')).toBe('12');
      expect(formatPlanetValue('12abc')).toBe('12');
      expect(formatPlanetValue('abc12')).toBe('∞');
    });
  });

  describe('Performance Considerations', () => {
    test('should handle repeated calls efficiently', () => {
      const start = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        formatNumber(i);
        formatPlanetValue(i.toString());
      }
      
      const end = performance.now();
      const duration = end - start;
      
      // Should complete in reasonable time (less than 100ms)
      expect(duration).toBeLessThan(100);
    });
  });
});
