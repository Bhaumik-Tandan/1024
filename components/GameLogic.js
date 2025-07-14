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
 * Apply upward gravity to a specific column
 * Makes all tiles fall up as far as possible following reversed physics rules
 * 
 * @param {Array[]} board - The game board (2D array)
 * @param {number} col - Column index to apply gravity to
 */
export const applyUpwardGravity = (board, col) => {
  // Validate input
  if (!GameValidator.isValidBoard(board) || col < 0 || col >= COLS) {
    console.warn('Invalid board or column for upward gravity application');
    return;
  }

  // Start from second row and work downward
  for (let row = 1; row < ROWS; row++) {
    const tileValue = board[row][col];
    
    if (tileValue !== 0) {
      let fallRow = row;
      
      // Find the highest empty position
      while (fallRow > 0 && board[fallRow - 1][col] === 0) {
        board[fallRow - 1][col] = tileValue;
        board[fallRow][col] = 0;
        fallRow--;
      }
    }
  }
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
export const checkAndMergeAdjacentTowards = async (board, targetRow, targetCol, showMergeResultAnimation, isChainReaction = false) => {
  // Validate inputs
  if (!GameValidator.isValidBoard(board)) {
    return { score: 0, merged: false };
  }

  // Check bounds
  if (targetRow < 0 || targetRow >= ROWS || targetCol < 0 || targetCol >= COLS) {
    return { score: 0, merged: false };
  }

  const targetValue = board[targetRow][targetCol];
  if (targetValue === 0) return { score: 0, merged: false };

  // Check all 4 adjacent directions
  const directions = [
    [-1, 0], // up
    [1, 0],  // down
    [0, -1], // left
    [0, 1]   // right
  ];

  for (let [dr, dc] of directions) {
    const neighborRow = targetRow + dr;
    const neighborCol = targetCol + dc;
    
    // Check bounds
    if (neighborRow < 0 || neighborRow >= ROWS || neighborCol < 0 || neighborCol >= COLS) {
      continue;
    }
    
    const neighborValue = board[neighborRow][neighborCol];
    
    // If adjacent tile has same value, merge them TOWARDS the target
    if (neighborValue === targetValue && neighborValue > 0) {
      const newValue = targetValue + neighborValue; // Sum the values
      const scoreGained = newValue;
      
      // Prepare positions for animation - target tile "pulls" neighbor towards it
      const mergingTilePositions = [
        { row: targetRow, col: targetCol, value: targetValue },
        { row: neighborRow, col: neighborCol, value: neighborValue }
      ];
      
      // Clear both tiles from board immediately (animation will show them)
      board[targetRow][targetCol] = 0;
      board[neighborRow][neighborCol] = 0;
      
      // Show merge animation with result appearing at TARGET position
      if (showMergeResultAnimation) {
        showMergeResultAnimation(targetRow, targetCol, newValue, mergingTilePositions, isChainReaction);
        const animationDelay = isChainReaction ? 400 : 1200; // Much faster for chain reactions
        await new Promise(resolve => {
          setTimeout(resolve, animationDelay);
        });
      }
      
      // Place merged tile at TARGET position (where the merge was triggered)
      board[targetRow][targetCol] = newValue;
      
      return { 
        score: scoreGained, 
        merged: true, 
        newRow: targetRow, 
        newCol: targetCol,
        newValue: newValue 
      };
    }
  }
  
  return { score: 0, merged: false };
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
  
  // STEP 2: Apply physics - upward gravity affects all columns
  for (let c = 0; c < COLS; c++) {
    applyUpwardGravity(newBoard, c);
  }
  
  // STEP 3: Find where the tile settled after upward gravity
  // Since we applied upward gravity, find the topmost non-empty cell in the column
  let finalRow = -1;
  for (let r = 0; r < ROWS; r++) {
    if (newBoard[r][col] !== 0) {
      finalRow = r;
      break;
    }
  }
  
  // STEP 4: Initial merge check for the landed tile (merge towards the landed position)
  let currentMergePosition = null;
  if (finalRow !== -1) {
    const initialMergeResult = await checkAndMergeAdjacentTowards(
      newBoard, 
      finalRow, 
      col, 
      showMergeResultAnimation,
      false // Not a chain reaction - full animation
    );
    totalScore += initialMergeResult.score;
    
    // Track the position of the newly created tile for chain reactions
    if (initialMergeResult.merged) {
      currentMergePosition = { 
        row: initialMergeResult.newRow, 
        col: initialMergeResult.newCol 
      };
    }
  }
  
  // STEP 5: Chain reaction loop - continue until no more merges possible
  // Each chain reaction merges TOWARDS the position of the newest tile
  let chainReactionActive = true;
  let iterations = 0;
  
  while (chainReactionActive && iterations < GAME_RULES.chainReactions.maxIterations) {
    chainReactionActive = false;
    iterations++;
    
    // Apply upward gravity after each merge
    for (let c = 0; c < COLS; c++) {
      applyUpwardGravity(newBoard, c);
    }
    
    // If we have a current merge position, check for chain reactions from there first
    if (currentMergePosition) {
      const chainMergeResult = await checkAndMergeAdjacentTowards(
        newBoard, 
        currentMergePosition.row, 
        currentMergePosition.col, 
        showMergeResultAnimation,
        true // This is a chain reaction - faster animation
      );
      
      if (chainMergeResult.merged) {
        const bonusScore = iterations > 1 ? 
          ScoringSystem.calculateMergeScore(chainMergeResult.score, 2, true) : 
          chainMergeResult.score;
        totalScore += bonusScore;
        chainReactionActive = true;
        chainReactionCount++;
        
        // Update the current merge position for next iteration
        currentMergePosition = { 
          row: chainMergeResult.newRow, 
          col: chainMergeResult.newCol 
        };
        continue; // Continue the chain from this position
      } else {
        // No more merges from current position, clear it
        currentMergePosition = null;
      }
    }
    
    // If no current merge position or no merge from it, check entire board
    if (!chainReactionActive) {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (newBoard[r][c] !== 0) {
            const mergeResult = await checkAndMergeAdjacentTowards(
              newBoard, 
              r, 
              c, 
              showMergeResultAnimation,
              true // This is a chain reaction - faster animation
            );
            
            if (mergeResult.merged) {
              const bonusScore = iterations > 1 ? 
                ScoringSystem.calculateMergeScore(mergeResult.score, 2, true) : 
                mergeResult.score;
              totalScore += bonusScore;
              chainReactionActive = true;
              chainReactionCount++;
              
              // Set this as the new merge position for chain reactions
              currentMergePosition = { 
                row: mergeResult.newRow, 
                col: mergeResult.newCol 
              };
              break; // Break to restart chain from this position
            }
          }
        }
        if (chainReactionActive) break; // Break out of outer loop too
      }
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

