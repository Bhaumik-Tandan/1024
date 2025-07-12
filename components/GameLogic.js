/**
 * ===========================
 * GAME LOGIC ENGINE
 * ===========================
 * 
 * Core game mechanics and logic functions
 * Uses centralized rules from GameRules.js for consistency
 */

import { ROWS, COLS } from './constants';
import { GAME_CONFIG, GAME_RULES, GameValidator, ScoringSystem, GameHelpers } from './GameRules';

/**
 * Generate a random tile value based on game rules
 * Prefers smaller values for better gameplay balance
 */
export const getRandomBlockValue = () => {
  return GameHelpers.generateRandomTile();
};

/**
 * Apply gravity to a specific column
 * Makes all tiles fall down as far as possible following physics rules
 * 
 * @param {Array[]} board - The game board (2D array)
 * @param {number} col - Column index to apply gravity to
 */
export const applyGravity = (board, col) => {
  // Validate input
  if (!GameValidator.isValidBoard(board) || col < 0 || col >= COLS) {
    console.warn('Invalid board or column for gravity application');
    return;
  }

  // Start from second-to-last row and work upward
  for (let row = ROWS - 2; row >= 0; row--) {
    const tileValue = board[row][col];
    
    if (tileValue !== 0) {
      let fallRow = row;
      
      // Find the lowest empty position
      while (fallRow < ROWS - 1 && board[fallRow + 1][col] === 0) {
        board[fallRow + 1][col] = tileValue;
        board[fallRow][col] = 0;
        fallRow++;
      }
    }
  }
};



/**
 * SIMPLE ADJACENT MERGING: Check and merge adjacent pairs
 * Following classic 2048-style rules: adjacent identical tiles merge by summing
 * 
 * @param {Array[]} board - The game board (2D array)
 * @param {number} row - Starting row position
 * @param {number} col - Starting column position
 * @param {Function} showMergeResultAnimation - Animation callback function
 * @returns {number} - Score gained from the merge (0 if no merge)
 */
export const checkAndMergeAdjacent = async (board, row, col, showMergeResultAnimation) => {
  // Validate inputs
  if (!GameValidator.isValidBoard(board)) {
    return 0;
  }

  // Check bounds
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
    return 0;
  }

  const currentValue = board[row][col];
  if (currentValue === 0) return 0;

  // Check all 4 adjacent directions
  const directions = [
    [-1, 0], // up
    [1, 0],  // down
    [0, -1], // left
    [0, 1]   // right
  ];

  for (let [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;
    
    // Check bounds
    if (newRow < 0 || newRow >= ROWS || newCol < 0 || newCol >= COLS) {
      continue;
    }
    
    const neighborValue = board[newRow][newCol];
    
    // If adjacent tile has same value, merge them
    if (neighborValue === currentValue && neighborValue > 0) {
      const newValue = currentValue + neighborValue; // Sum the values
      const scoreGained = newValue;
      
      // Clear both tiles
      board[row][col] = 0;
      board[newRow][newCol] = 0;
      
      // Place new merged tile at the first position
      board[row][col] = newValue;
      
      // Show merge animation
      if (showMergeResultAnimation) {
        showMergeResultAnimation(row, col, newValue);
        await new Promise(resolve => {
          setTimeout(resolve, GAME_CONFIG.TIMING.MERGE_ANIMATION_DURATION);
        });
      }
      
      return scoreGained;
    }
  }
  
  return 0; // No merge occurred
};

/**
 * MAIN GAME ENGINE: Handle complete block landing and chain reactions
 * This is the core function that processes a tile landing and all subsequent merges
 * Implements RULE 5: Chain Reactions
 * 
 * @param {Array[]} board - The current game board state
 * @param {number} row - Landing row position
 * @param {number} col - Landing column position  
 * @param {number} value - Value of the landing tile
 * @param {Function} showMergeResultAnimation - Animation callback function
 * @returns {Object} - { newBoard: updated board, totalScore: points gained }
 */
export const handleBlockLanding = async (board, row, col, value, showMergeResultAnimation) => {
  // Input validation
  if (!GameValidator.isValidBoard(board)) {
    console.error('Invalid board state provided to handleBlockLanding');
    return { newBoard: board, totalScore: 0 };
  }

  // Check bounds
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
    console.warn('Invalid landing position for tile');
    return { newBoard: board, totalScore: 0 };
  }

  // Create a deep copy of the board to avoid mutations
  let newBoard = board.map(r => [...r]);
  let totalScore = 0;
  let chainReactionCount = 0;
  
  // STEP 1: Place the landing tile
  newBoard[row][col] = value;
  
  // STEP 2: Apply physics - gravity affects all columns
  for (let c = 0; c < COLS; c++) {
    applyGravity(newBoard, c);
  }
  
  // STEP 3: Find where the tile settled after gravity
  // Since we applied gravity, find the bottommost non-empty cell in the column
  let finalRow = -1;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (newBoard[r][col] !== 0) {
      finalRow = r;
      break;
    }
  }
  
  // STEP 4: Initial merge check for the landed tile
  if (finalRow !== -1) {
    const initialMergeScore = await checkAndMergeAdjacent(
      newBoard, 
      finalRow, 
      col, 
      showMergeResultAnimation
    );
    totalScore += initialMergeScore;
  }
  
  // STEP 5: Chain reaction loop - continue until no more merges possible
  let chainReactionActive = true;
  let iterations = 0;
  
  while (chainReactionActive && iterations < GAME_RULES.chainReactions.maxIterations) {
    chainReactionActive = false;
    iterations++;
    
    // Apply gravity after each merge
    for (let c = 0; c < COLS; c++) {
      applyGravity(newBoard, c);
    }
    
    // Check for adjacent tile merges across the entire board
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (newBoard[r][c] !== 0) {
          const mergeScore = await checkAndMergeAdjacent(
            newBoard, 
            r, 
            c, 
            showMergeResultAnimation
          );
          
          if (mergeScore > 0) {
            // Apply chain reaction bonus for subsequent merges
            const bonusScore = iterations > 1 ? 
              ScoringSystem.calculateMergeScore(mergeScore, 2, true) : 
              mergeScore;
            totalScore += bonusScore;
            chainReactionActive = true;
            chainReactionCount++;
            
            // Break out of loops to restart the check from the beginning
            // This ensures we don't miss merges that could be created by this merge
            break;
          }
        }
      }
      if (chainReactionActive) break; // Break out of outer loop too
    }
  }
  
  // STEP 6: Apply final bonuses
  if (chainReactionCount > 1) {
    const chainBonus = ScoringSystem.calculateBonus({
      type: 'chainReaction',
      value: chainReactionCount
    });
    totalScore += chainBonus;
  }
  
  // STEP 7: Validate final board state
  if (!GameValidator.isValidBoard(newBoard)) {
    console.error('Invalid board state after processing');
    return { newBoard: board, totalScore: 0 };
  }
  
  return { 
    newBoard, 
    totalScore: Math.floor(totalScore),
    chainReactionCount,
    iterations 
  };
};

