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
 * CONNECTED GROUP MERGING: Find all connected tiles with same value and merge them
 * Uses flood fill algorithm to find connected components
 * Implements exponential merging rule: newValue = originalValue * 2^(numberOfTiles - 1)
 * 
 * @param {Array[]} board - The game board (2D array)
 * @param {number} targetRow - Starting row position
 * @param {number} targetCol - Starting column position
 * @param {Function} showMergeResultAnimation - Animation callback function
 * @param {boolean} isChainReaction - Whether this is part of a chain reaction
 * @param {number} resultRow - Where to place the merged result (defaults to latest position)
 * @param {number} resultCol - Where to place the merged result (defaults to latest position)
 * @returns {Object} - { score: number, merged: boolean, newRow: number, newCol: number, newValue: number }
 */
export const checkAndMergeConnectedGroup = async (board, targetRow, targetCol, showMergeResultAnimation, isChainReaction = false, resultRow = null, resultCol = null) => {
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

  // Find all connected tiles with the same value using flood fill
  const visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  const connectedTiles = [];
  
  const floodFill = (row, col) => {
    // Check bounds
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;
    
    // Check if already visited or different value
    if (visited[row][col] || board[row][col] !== targetValue) return;
    
    // Mark as visited and add to connected tiles
    visited[row][col] = true;
    connectedTiles.push({ row, col, value: targetValue });
    
    // Recursively check all 4 adjacent directions
    floodFill(row - 1, col); // up
    floodFill(row + 1, col); // down
    floodFill(row, col - 1); // left
    floodFill(row, col + 1); // right
  };
  
  // Start flood fill from the target position
  floodFill(targetRow, targetCol);
  
  // If we found less than 2 connected tiles, no merge is possible
  if (connectedTiles.length < 2) {
    return { score: 0, merged: false };
  }
  
  // Calculate new value using exponential rule: originalValue * 2^(numberOfTiles - 1)
  const numberOfTiles = connectedTiles.length;
  const newValue = targetValue * Math.pow(2, numberOfTiles - 1);
  const scoreGained = newValue;
  
  // Find the latest position (highest row number, then rightmost column)
  // This represents the most recently dropped/merged tile position
  let latestRow = -1;
  let latestCol = -1;
  
  for (const tile of connectedTiles) {
    if (tile.row > latestRow || (tile.row === latestRow && tile.col > latestCol)) {
      latestRow = tile.row;
      latestCol = tile.col;
    }
  }
  
  // Determine where to place the result
  // If resultRow/resultCol are explicitly provided, use them
  // Otherwise, use the latest position (most recently dropped/merged tile)
  const finalResultRow = resultRow !== null ? resultRow : latestRow;
  const finalResultCol = resultCol !== null ? resultCol : latestCol;
  
  // Prepare positions for animation
  const mergingTilePositions = connectedTiles.map(tile => ({
    row: tile.row,
    col: tile.col,
    value: tile.value
  }));
  
  // Clear all connected tiles from board immediately (animation will show them)
  connectedTiles.forEach(tile => {
    board[tile.row][tile.col] = 0;
  });
  
  // Show merge animation with result appearing at RESULT position
  if (showMergeResultAnimation) {
    showMergeResultAnimation(finalResultRow, finalResultCol, newValue, mergingTilePositions, isChainReaction);
    const animationDelay = isChainReaction ? 350 : 900; // Faster animation delay with more frames
    await new Promise(resolve => {
      setTimeout(resolve, animationDelay);
    });
  }
  
  // Place merged tile at RESULT position
  board[finalResultRow][finalResultCol] = newValue;
  
  return { 
    score: scoreGained, 
    merged: true, 
    newRow: finalResultRow, 
    newCol: finalResultCol,
    newValue: newValue 
  };
};

// Update the function name export for backward compatibility
export const checkAndMergeAdjacentTowards = checkAndMergeConnectedGroup;

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
    const initialMergeResult = await checkAndMergeConnectedGroup(
      newBoard, 
      finalRow, 
      col, 
      showMergeResultAnimation,
      false, // Not a chain reaction - full animation
      row, // Result should appear at original landing position
      col  // Result should appear at original landing position
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
      const chainMergeResult = await checkAndMergeConnectedGroup(
        newBoard, 
        currentMergePosition.row, 
        currentMergePosition.col, 
        showMergeResultAnimation,
        true, // This is a chain reaction - faster animation
        null, // Use default position for chain reactions
        null  // Use default position for chain reactions
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
            const mergeResult = await checkAndMergeConnectedGroup(
              newBoard, 
              r, 
              c, 
              showMergeResultAnimation,
              true, // This is a chain reaction - faster animation
              null, // Use default position for chain reactions
              null  // Use default position for chain reactions
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

