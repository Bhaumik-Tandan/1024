import { 
  getBoardConfig, 
  GAME_CONFIG, 
  GAME_RULES 
} from '../../components/GameRules';

describe('GameRules', () => {
  describe('getBoardConfig', () => {
    test('should return correct board dimensions', () => {
      const config = getBoardConfig();
      
      expect(config).toEqual({
        ROWS: 5,
        COLS: 4
      });
    });

    test('should return consistent dimensions', () => {
      const config1 = getBoardConfig();
      const config2 = getBoardConfig();
      
      expect(config1).toEqual(config2);
      expect(config1.ROWS).toBe(5);
      expect(config1.COLS).toBe(4);
    });
  });

  describe('GAME_CONFIG', () => {
    test('should have correct board configuration', () => {
      expect(GAME_CONFIG.BOARD.ROWS).toBe(5);
      expect(GAME_CONFIG.BOARD.COLS).toBe(4);
      expect(GAME_CONFIG.BOARD.TOTAL_CELLS).toBe(20);
    });

    test('should have valid timing settings', () => {
      expect(GAME_CONFIG.TIMING.SLOW_FALL_DURATION).toBe(7000);
      expect(GAME_CONFIG.TIMING.FAST_DROP_DURATION).toBe(600);
      expect(GAME_CONFIG.TIMING.COSMIC_DROP_DURATION).toBe(400);
      expect(GAME_CONFIG.TIMING.MERGE_ANIMATION_DURATION).toBe(120);
      expect(GAME_CONFIG.TIMING.DRAG_ANIMATION_DURATION).toBe(100);
      expect(GAME_CONFIG.TIMING.ORBITAL_ATTRACTION_DURATION).toBe(100);
      expect(GAME_CONFIG.TIMING.CHAIN_MERGE_DELAY).toBe(50);
      expect(GAME_CONFIG.TIMING.LARGE_CHAIN_THRESHOLD).toBe(3);
    });

    test('should have valid tile generation settings', () => {
      expect(GAME_CONFIG.TILE_GENERATION.POSSIBLE_VALUES).toEqual([
        2, 4, 8, 16, 32, 64, 128, 256, 512, 1024
      ]);
      expect(GAME_CONFIG.TILE_GENERATION.SMALL_VALUES_COUNT).toBe(5);
      expect(GAME_CONFIG.TILE_GENERATION.SPAWN_POSITION).toBe('center');
    });

    test('should have valid scoring multipliers', () => {
      expect(GAME_CONFIG.SCORING.BASE_SCORE_MULTIPLIER).toBe(1);
      expect(GAME_CONFIG.SCORING.COMBO_BONUS_MULTIPLIER).toBe(1.5);
      expect(GAME_CONFIG.SCORING.LARGE_MERGE_BONUS).toBe(2.0);
    });

    test('should have positive timing values', () => {
      Object.values(GAME_CONFIG.TIMING).forEach(value => {
        expect(value).toBeGreaterThan(0);
      });
    });

    test('should have valid tile values', () => {
      GAME_CONFIG.TILE_GENERATION.POSSIBLE_VALUES.forEach(value => {
        expect(value).toBeGreaterThan(0);
        expect(Number.isInteger(value)).toBe(true);
        expect(value % 2).toBe(0); // All values should be even
      });
    });
  });

  describe('GAME_RULES', () => {
    test('should have movement rules defined', () => {
      expect(GAME_RULES.movement).toBeDefined();
      expect(GAME_RULES.movement.gravity).toBe(true);
      expect(GAME_RULES.movement.horizontalDrag).toBe(true);
      expect(GAME_RULES.movement.fastDrop).toBe(true);
      expect(GAME_RULES.movement.collision).toBe(true);
    });

    test('should have adjacent merging rules defined', () => {
      expect(GAME_RULES.adjacentMerging).toBeDefined();
      expect(GAME_RULES.adjacentMerging.enabled).toBe(true);
      expect(GAME_RULES.adjacentMerging.directions).toEqual(['up', 'down', 'left', 'right']);
      expect(typeof GAME_RULES.adjacentMerging.formula).toBe('function');
      expect(typeof GAME_RULES.adjacentMerging.scoreFormula).toBe('function');
    });

    test('should have connected merging rules defined', () => {
      expect(GAME_RULES.connectedMerging).toBeDefined();
      expect(GAME_RULES.connectedMerging.enabled).toBe(true);
      expect(typeof GAME_RULES.connectedMerging.formula).toBe('function');
      expect(typeof GAME_RULES.connectedMerging.scoreFormula).toBe('function');
    });

    test('should have chain reaction rules defined', () => {
      expect(GAME_RULES.chainReactions).toBeDefined();
      expect(GAME_RULES.chainReactions.enabled).toBe(true);
      expect(GAME_RULES.chainReactions.maxChains).toBeGreaterThan(0);
      expect(typeof GAME_RULES.chainReactions.delay).toBe('number');
    });

    test('should have scoring rules defined', () => {
      expect(GAME_RULES.scoring).toBeDefined();
      expect(typeof GAME_RULES.scoring.baseScore).toBe('function');
      expect(typeof GAME_RULES.scoring.comboBonus).toBe('function');
      expect(typeof GAME_RULES.scoring.mergeBonus).toBe('function');
    });

    test('should have win condition rules defined', () => {
      expect(GAME_RULES.winCondition).toBeDefined();
      expect(GAME_RULES.winCondition.targetValue).toBeGreaterThan(0);
      expect(typeof GAME_RULES.winCondition.checkWin).toBe('function');
    });

    test('should have game over rules defined', () => {
      expect(GAME_RULES.gameOver).toBeDefined();
      expect(typeof GAME_RULES.gameOver.checkGameOver).toBe('function');
      expect(typeof GAME_RULES.gameOver.conditions).toBe('object');
    });
  });

  describe('Rule Functions', () => {
    test('adjacent merging formula should double values', () => {
      const formula = GAME_RULES.adjacentMerging.formula;
      expect(formula(2)).toBe(4);
      expect(formula(4)).toBe(8);
      expect(formula(8)).toBe(16);
    });

    test('adjacent merging score formula should return new value', () => {
      const scoreFormula = GAME_RULES.adjacentMerging.scoreFormula;
      expect(scoreFormula(4)).toBe(4);
      expect(scoreFormula(8)).toBe(8);
      expect(scoreFormula(16)).toBe(16);
    });

    test('connected merging formula should use exponential scaling', () => {
      const formula = GAME_RULES.connectedMerging.formula;
      expect(formula(4, 3)).toBe(16); // 4 * 2^(3-1) = 4 * 4 = 16
      expect(formula(4, 4)).toBe(32); // 4 * 2^(4-1) = 4 * 8 = 32
    });

    test('chain reaction delay should be positive', () => {
      expect(GAME_RULES.chainReactions.delay).toBeGreaterThan(0);
    });

    test('max chains should be reasonable', () => {
      expect(GAME_RULES.chainReactions.maxChains).toBeGreaterThan(0);
      expect(GAME_RULES.chainReactions.maxChains).toBeLessThan(100);
    });
  });

  describe('Configuration Validation', () => {
    test('board dimensions should be positive integers', () => {
      expect(GAME_CONFIG.BOARD.ROWS).toBeGreaterThan(0);
      expect(GAME_CONFIG.BOARD.COLS).toBeGreaterThan(0);
      expect(Number.isInteger(GAME_CONFIG.BOARD.ROWS)).toBe(true);
      expect(Number.isInteger(GAME_CONFIG.BOARD.COLS)).toBe(true);
    });

    test('total cells should equal rows * cols', () => {
      expect(GAME_CONFIG.BOARD.TOTAL_CELLS).toBe(
        GAME_CONFIG.BOARD.ROWS * GAME_CONFIG.BOARD.COLS
      );
    });

    test('timing values should be reasonable', () => {
      expect(GAME_CONFIG.TIMING.SLOW_FALL_DURATION).toBeLessThan(30000); // Max 30 seconds
      expect(GAME_CONFIG.TIMING.FAST_DROP_DURATION).toBeLessThan(2000); // Max 2 seconds
      expect(GAME_CONFIG.TIMING.COSMIC_DROP_DURATION).toBeLessThan(1000); // Max 1 second
    });

    test('scoring multipliers should be positive', () => {
      expect(GAME_CONFIG.SCORING.BASE_SCORE_MULTIPLIER).toBeGreaterThan(0);
      expect(GAME_CONFIG.SCORING.COMBO_BONUS_MULTIPLIER).toBeGreaterThan(0);
      expect(GAME_CONFIG.SCORING.LARGE_MERGE_BONUS).toBeGreaterThan(0);
    });

    test('tile values should be in ascending order', () => {
      const values = GAME_CONFIG.TILE_GENERATION.POSSIBLE_VALUES;
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThan(values[i - 1]);
      }
    });
  });

  describe('Edge Cases', () => {
    test('should handle minimum board size', () => {
      expect(GAME_CONFIG.BOARD.ROWS).toBeGreaterThanOrEqual(3);
      expect(GAME_CONFIG.BOARD.COLS).toBeGreaterThanOrEqual(3);
    });

    test('should handle maximum reasonable board size', () => {
      expect(GAME_CONFIG.BOARD.ROWS).toBeLessThanOrEqual(10);
      expect(GAME_CONFIG.BOARD.COLS).toBeLessThanOrEqual(10);
    });

    test('should have reasonable tile value range', () => {
      const values = GAME_CONFIG.TILE_GENERATION.POSSIBLE_VALUES;
      expect(Math.min(...values)).toBeGreaterThan(0);
      expect(Math.max(...values)).toBeLessThan(10000);
    });
  });
});
