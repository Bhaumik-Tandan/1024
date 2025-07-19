/**
 * ===========================
 * 1024 DROP GAME RULES
 * ===========================
 * 
 * Complete rule set for the 1024 Drop Game
 * This file contains all game mechanics, scoring rules, and validation logic
 */

export const GAME_CONFIG = {
  // Board dimensions
  BOARD: {
    ROWS: 8,
    COLS: 5,
    TOTAL_CELLS: 40,
  },
  
  // Timing settings
  TIMING: {
    SLOW_FALL_DURATION: 7000,    // 7 seconds for normal fall (now unused)
    FAST_DROP_DURATION: 150,     // 0.15 seconds for fast drop (increased speed)
    MERGE_ANIMATION_DURATION: 120, // Animation delay between merges (faster)
    DRAG_ANIMATION_DURATION: 150,  // Time to animate drag movements (faster)
  },
  
  // Tile generation
  TILE_GENERATION: {
    POSSIBLE_VALUES: [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024],
    SMALL_VALUES_COUNT: 5, // Only use first 5 values (2,4,8,16,32) for higher probability
    SPAWN_POSITION: 'center', // Always spawn in center column initially
  },
  
  // Scoring multipliers
  SCORING: {
    BASE_SCORE_MULTIPLIER: 1,
    COMBO_BONUS_MULTIPLIER: 1.5, // Bonus for chain reactions
    LARGE_MERGE_BONUS: 2.0,      // Bonus for merging 4+ tiles
  },
};

/**
 * ===========================
 * CORE GAME RULES
 * ===========================
 */

export const GAME_RULES = {
  
  /**
   * RULE 1: TILE MOVEMENT
   * - Tiles fall from top to bottom due to gravity
   * - Player can drag falling tiles left/right
   * - Player can tap columns to fast-drop tiles
   * - Tiles cannot move through occupied cells
   */
  movement: {
    gravity: true,
    horizontalDrag: true,
    fastDrop: true,
    collision: true,
  },
  
  /**
   * RULE 2: TILE MERGING - ADJACENT PAIRS
   * - Two identical adjacent tiles merge into one tile with double value
   * - Adjacent means: up, down, left, right (not diagonal)
   * - Formula: newValue = originalValue * 2
   * - Example: 4 + 4 = 8
   */
  adjacentMerging: {
    enabled: true,
    directions: ['up', 'down', 'left', 'right'],
    formula: (value) => value * 2,
    scoreFormula: (newValue) => newValue,
  },
  
  /**
   * RULE 3: TILE MERGING - CONNECTED GROUPS
   * - Multiple connected identical tiles merge using exponential scaling
   * - Formula: newValue = originalValue * 2^(numberOfTiles - 1)
   * - Examples:
   *   - 3 tiles of 4: 4 * 2^(3-1) = 4 * 4 = 16
   *   - 4 tiles of 4: 4 * 2^(4-1) = 4 * 8 = 32
   *   - 5+ tiles: Theoretically possible but practically impossible due to immediate merging
   */
  connectedMerging: {
    enabled: true,
    minimumTiles: 2,
    maximumTiles: Infinity,
    formula: (value, count) => value * Math.pow(2, count - 1),
    scoreFormula: (newValue) => newValue,
  },
  
  /**
   * RULE 4: ROW MERGING - HORIZONTAL LINES
   * - 3 or more identical tiles in a horizontal row merge
   * - Merged tile appears at the rightmost position
   * - Formula: newValue = originalValue * 2
   * - Example: [4][4][4] becomes [0][0][8]
   */
  rowMerging: {
    enabled: true,
    minimumInRow: 3,
    formula: (value) => value * 2,
    targetPosition: 'rightmost',
    scoreFormula: (newValue) => newValue,
  },
  
  /**
   * RULE 5: CHAIN REACTIONS
   * - After any merge, gravity is applied
   * - New adjacent tiles may form around the merged result
   * - Each merge is processed separately (2+3≠5, but 2→3 as separate merges)
   * - Process repeats until no more merges are possible
   * - Scoring bonus applies for chain reactions
   */
  chainReactions: {
    enabled: true,
    maxIterations: 100, // Prevent infinite loops
    scoringBonus: GAME_CONFIG.SCORING.COMBO_BONUS_MULTIPLIER,
  },
  
  /**
   * RULE 6: GAME OVER CONDITIONS
   * - Game ends when bottom row is completely filled
   * - No moves possible when all columns are full to the bottom
   */
  gameOver: {
    condition: 'bottomRowFull',
    checkRow: GAME_CONFIG.BOARD.ROWS - 1, // Bottom row index (row 7 for 8-row board)
    allowPartialFill: false,
  },
  
  /**
   * RULE 7: WINNING CONDITIONS
   * - Reach target score (optional)
   * - Create target tile value (optional)
   * - Survive for target time (optional)
   */
  winning: {
    scoreTarget: null,     // No score target by default
    tileTarget: null,      // No tile target - infinite game!
    timeTarget: null,      // No time target by default
  },
};

/**
 * ===========================
 * VALIDATION FUNCTIONS
 * ===========================
 */

export const GameValidator = {
  
  /**
   * Check if a move is valid
   */
  isValidMove(board, fromRow, fromCol, toRow, toCol) {
    // Bounds check
    if (toRow < 0 || toRow >= GAME_CONFIG.BOARD.ROWS || 
        toCol < 0 || toCol >= GAME_CONFIG.BOARD.COLS) {
      return false;
    }
    
    // Target cell must be empty
    return board[toRow][toCol] === 0;
  },
  
  /**
   * Check if tiles can merge
   */
  canMerge(value1, value2) {
    return value1 > 0 && value1 === value2;
  },
  
  /**
   * Check if game is over
   */
  isGameOver(board) {
    // Check if top row is full
    return board[GAME_RULES.gameOver.checkRow].every(cell => cell !== 0);
  },
  
  /**
   * Check if player has won
   */
  hasWon(board, score) {
    // Check for target tile
    if (GAME_RULES.winning.tileTarget) {
      for (let row of board) {
        for (let cell of row) {
          if (cell >= GAME_RULES.winning.tileTarget) {
            return true;
          }
        }
      }
    }
    
    // Check for target score
    if (GAME_RULES.winning.scoreTarget && score >= GAME_RULES.winning.scoreTarget) {
      return true;
    }
    
    return false;
  },
  
  /**
   * Validate board state
   */
  isValidBoard(board) {
    // Check dimensions
    if (!board || board.length !== GAME_CONFIG.BOARD.ROWS) {
      return false;
    }
    
    for (let row of board) {
      if (!row || row.length !== GAME_CONFIG.BOARD.COLS) {
        return false;
      }
      
      // Check for valid tile values
      for (let cell of row) {
        if (cell < 0 || (cell > 0 && !GAME_CONFIG.TILE_GENERATION.POSSIBLE_VALUES.includes(cell) && 
            !this.isPowerOfTwo(cell))) {
          return false;
        }
      }
    }
    
    return true;
  },
  
  /**
   * Helper: Check if number is power of 2
   */
  isPowerOfTwo(n) {
    return n > 0 && (n & (n - 1)) === 0;
  },
};

/**
 * ===========================
 * SCORING SYSTEM
 * ===========================
 */

export const ScoringSystem = {
  
  /**
   * Calculate score for a merge
   */
  calculateMergeScore(newValue, tilesCount = 2, isChainReaction = false) {
    let baseScore = newValue;
    
    // Apply combo bonus for chain reactions
    if (isChainReaction) {
      baseScore *= GAME_RULES.chainReactions.scoringBonus;
    }
    
    // Apply large merge bonus for 4+ tiles
    if (tilesCount >= 4) {
      baseScore *= GAME_CONFIG.SCORING.LARGE_MERGE_BONUS;
    }
    
    return Math.floor(baseScore);
  },
  
  /**
   * Calculate bonus for special achievements
   */
  calculateBonus(achievement) {
    const bonuses = {
      firstMerge: 10,
      bigMerge: (tileValue) => tileValue * 0.5,
      chainReaction: (chainLength) => chainLength * 25,
      perfectDrop: 50,
      speedBonus: (timeLeft) => Math.floor(timeLeft / 100),
    };
    
    return bonuses[achievement.type] ? 
           (typeof bonuses[achievement.type] === 'function' ? 
            bonuses[achievement.type](achievement.value) : 
            bonuses[achievement.type]) : 0;
  },
};

/**
 * ===========================
 * GAME PHYSICS
 * ===========================
 */

export const GamePhysics = {
  
  /**
   * Calculate falling speed based on game state
   */
  calculateFallSpeed(gameState) {
    return gameState.fastDrop ? 
           GAME_CONFIG.TIMING.FAST_DROP_DURATION : 
           GAME_CONFIG.TIMING.SLOW_FALL_DURATION;
  },
  
  /**
   * Calculate merge animation timing
   */
  calculateMergeDelay(mergeCount) {
    return GAME_CONFIG.TIMING.MERGE_ANIMATION_DURATION * mergeCount;
  },
  
  /**
   * Determine if collision occurs
   */
  checkCollision(board, row, col) {
    return !GameValidator.isValidMove(board, -1, -1, row, col);
  },
};

/**
 * ===========================
 * GAME STATE HELPERS
 * ===========================
 */

export const GameHelpers = {
  
  /**
   * Create empty board
   */
  createEmptyBoard() {
    return Array.from({ length: GAME_CONFIG.BOARD.ROWS }, () => 
           Array(GAME_CONFIG.BOARD.COLS).fill(0));
  },
  
  /**
   * Generate random tile value
   */
  generateRandomTile() {
    const values = GAME_CONFIG.TILE_GENERATION.POSSIBLE_VALUES;
    const maxIndex = GAME_CONFIG.TILE_GENERATION.SMALL_VALUES_COUNT;
    return values[Math.floor(Math.random() * Math.min(maxIndex, values.length))];
  },
  
  /**
   * Find landing position for a tile with upward gravity
   * (for bottom-to-top dropping)
   */
  findUpwardLandingPosition(board, col) {
    for (let row = 0; row < GAME_CONFIG.BOARD.ROWS; row++) {
      if (board[row][col] === 0) {
        return row;
      }
    }
    return -1; // Column is full
  },

  /**
   * Find landing position for a tile
   */
  findLandingPosition(board, col) {
    for (let row = GAME_CONFIG.BOARD.ROWS - 1; row >= 0; row--) {
      if (board[row][col] === 0) {
        return row;
      }
    }
    return -1; // Column is full
  },
  
  /**
   * Count empty cells
   */
  countEmptyCells(board) {
    let count = 0;
    for (let row of board) {
      for (let cell of row) {
        if (cell === 0) count++;
      }
    }
    return count;
  },
  
  /**
   * Get game difficulty based on board state
   */
  calculateDifficulty(board) {
    const emptyCells = this.countEmptyCells(board);
    const totalCells = GAME_CONFIG.BOARD.TOTAL_CELLS;
    const fillPercentage = 1 - (emptyCells / totalCells);
    
    if (fillPercentage < 0.3) return 'easy';
    if (fillPercentage < 0.6) return 'medium';
    if (fillPercentage < 0.8) return 'hard';
    return 'extreme';
  },
};

/**
 * ===========================
 * EXPORT ALL RULES
 * ===========================
 */

export default {
  GAME_CONFIG,
  GAME_RULES,
  GameValidator,
  ScoringSystem,
  GamePhysics,
  GameHelpers,
};

/**
 * ===========================
 * GAME RULES SUMMARY
 * ===========================
 * 
 * 🎮 HOW TO PLAY:
 * 1. Tiles fall from the top of a 5x7 grid
 * 2. Drag falling tiles left/right or tap columns to drop
 * 3. Identical adjacent tiles merge automatically
 * 4. Create larger numbers by strategic merging
 * 5. Game ends when the top row fills up
 * 
 * 🔄 MERGING RULES:
 * 1. Adjacent pairs: 4 + 4 = 8
 * 2. Connected groups: [4][4][4] = 16 (exponential scaling)
 * 3. Horizontal rows: 3+ in a row merge to double value
 * 4. Chain reactions continue until no more merges
 * 
 * 🏆 SCORING:
 * - Points = value of merged tiles
 * - Chain reaction bonus: +50%
 * - Large merge bonus (4+ tiles): +100%
 * - Target: Reach 2048 tile or highest score
 * 
 * ⚡ CONTROLS:
 * - Drag: Move falling tile horizontally
 * - Tap column: Fast drop tile
 * - Auto-fall: 7 seconds if no input
 * 
 * 🎯 STRATEGY TIPS:
 * - Plan merges to create chain reactions
 * - Keep larger numbers towards edges
 * - Don't let the center columns fill up
 * - Use fast drops strategically for better positioning
 */ 