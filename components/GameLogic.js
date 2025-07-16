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
 * Find all connected tiles with same value using flood fill algorithm
 * 
 * @param {Array[]} board - The game board (2D array)
 * @param {number} targetRow - Starting row position
 * @param {number} targetCol - Starting column position
 * @returns {Array} - Array of connected tile positions
 */
export const findConnectedTiles = (board, targetRow, targetCol) => {
  const targetValue = board[targetRow][targetCol];
  if (targetValue === 0) return [];

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
  
  return connectedTiles;
};

/**
 * Merge connected tiles and return the result
 * 
 * @param {Array[]} board - The game board (2D array)
 * @param {number} targetRow - Starting row position
 * @param {number} targetCol - Starting column position
 * @param {number} [preferredRow] - Preferred row for merge result (e.g., dropped tile)
 * @param {number} [preferredCol] - Preferred col for merge result (e.g., dropped tile)
 * @returns {Object|null} - Merge result or null if no merge possible
 */
export const mergeConnectedTiles = (board, targetRow, targetCol, preferredRow, preferredCol) => {
  const connectedTiles = findConnectedTiles(board, targetRow, targetCol);
  
  // If we found less than 2 connected tiles, no merge is possible
  if (connectedTiles.length < 2) {
    return null;
  }
  
  // Calculate new value using exponential rule: originalValue * 2^(numberOfTiles - 1)
  const numberOfTiles = connectedTiles.length;
  const targetValue = board[targetRow][targetCol];
  const newValue = targetValue * Math.pow(2, numberOfTiles - 1);
  
  // Find the best position for the merge result
  let bestRow = -1;
  let bestCol = -1;

  // For 2-tile merges, always prefer the dropped tile position if provided
  if (numberOfTiles === 2 && preferredRow !== undefined && preferredCol !== undefined) {
    bestRow = preferredRow;
    bestCol = preferredCol;
  } else if (
    preferredRow !== undefined && preferredCol !== undefined &&
    connectedTiles.some(tile => tile.row === preferredRow && tile.col === preferredCol)
  ) {
    bestRow = preferredRow;
    bestCol = preferredCol;
  } else if (numberOfTiles === 3) {
    // Special handling for 3-tile merges: result should appear in the middle tile
    // First check if tiles are in the same row (horizontal merge)
    const sameRow = connectedTiles.every(tile => tile.row === connectedTiles[0].row);
    const sameCol = connectedTiles.every(tile => tile.col === connectedTiles[0].col);
    
    if (sameRow) {
      // Horizontal merge: sort by column and pick middle
      const sortedTiles = [...connectedTiles].sort((a, b) => a.col - b.col);
      const middleTile = sortedTiles[1]; // Middle tile (index 1 of 3)
      bestRow = middleTile.row;
      bestCol = middleTile.col;
    } else if (sameCol) {
      // Vertical merge: sort by row and pick middle
      const sortedTiles = [...connectedTiles].sort((a, b) => a.row - b.row);
      const middleTile = sortedTiles[1]; // Middle tile (index 1 of 3)
      bestRow = middleTile.row;
      bestCol = middleTile.col;
    } else {
      // Complex merge: find the center position
      const avgRow = Math.round(connectedTiles.reduce((sum, tile) => sum + tile.row, 0) / numberOfTiles);
      const avgCol = Math.round(connectedTiles.reduce((sum, tile) => sum + tile.col, 0) / numberOfTiles);
      
      // Find the tile closest to the center
      let closestTile = connectedTiles[0];
      let minDistance = Math.abs(avgRow - closestTile.row) + Math.abs(avgCol - closestTile.col);
      
      for (const tile of connectedTiles) {
        const distance = Math.abs(avgRow - tile.row) + Math.abs(avgCol - tile.col);
        if (distance < minDistance) {
          minDistance = distance;
          closestTile = tile;
        }
      }
      
      bestRow = closestTile.row;
      bestCol = closestTile.col;
    }
  } else {
    // For other cases (4, 5+ tiles), prefer the lowest row (closest to bottom)
    // But don't prefer rightmost column for 2-tile merges
    for (const tile of connectedTiles) {
      if (bestRow === -1 || tile.row > bestRow) {
        bestRow = tile.row;
        bestCol = tile.col;
      } else if (tile.row === bestRow && numberOfTiles > 2 && tile.col > bestCol) {
        // Only prefer rightmost column for 3+ tile merges, not 2-tile merges
        bestCol = tile.col;
      }
    }
  }
  
  // Clear all connected tiles from board
  connectedTiles.forEach(tile => {
    board[tile.row][tile.col] = 0;
  });
  
  // Place merged tile at the best position
  // For 2-tile merges with preferred position, place exactly there
  // For other merges, apply gravity logic
  let finalRow, finalCol;
  
  if (numberOfTiles === 2 && preferredRow !== undefined && preferredCol !== undefined) {
    // For 2-tile merges, place exactly at the preferred position
    console.log(`2-tile merge: Placing at (${bestRow}, ${bestCol})`);
    board[bestRow][bestCol] = newValue;
    finalRow = bestRow;
    finalCol = bestCol;
  } else {
    // For other merges, apply gravity logic - find next empty cell above if occupied
    let placeRow = bestRow;
    while (placeRow > 0 && board[placeRow][bestCol] !== 0) {
      placeRow--;
    }
    if (board[placeRow][bestCol] === 0) {
      board[placeRow][bestCol] = newValue;
      finalRow = placeRow;
    } else {
      // If no empty cell found, put it back at bestRow (should not happen in normal gameplay)
      board[bestRow][bestCol] = newValue;
      finalRow = bestRow;
    }
    finalCol = bestCol;
  }
  
  return { 
    score: newValue, 
    merged: true, 
    newRow: finalRow, 
    newCol: finalCol,
    newValue: newValue,
    tilesMerged: numberOfTiles
  };
};

/**
 * Process chain reactions after a merge
 * 
 * @param {Array[]} board - The game board (2D array)
 * @returns {Object} - Chain reaction results
 */
export const processChainReactions = (board) => {
  let totalScore = 0;
  let chainReactionCount = 0;
  let iterations = 0;
  const maxIterations = 100; // Prevent infinite loops
  
  let chainReactionActive = true;
  
  while (chainReactionActive && iterations < maxIterations) {
    chainReactionActive = false;
    iterations++;
    
    // Apply upward gravity after each merge
    for (let c = 0; c < COLS; c++) {
      applyUpwardGravity(board, c);
    }
    
    // Check entire board for possible merges
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (board[r][c] !== 0) {
          const mergeResult = mergeConnectedTiles(board, r, c);
          
          if (mergeResult && mergeResult.merged) {
            totalScore += mergeResult.score;
            chainReactionActive = true;
            chainReactionCount++;
            break; // Break to restart chain from this position
          }
        }
      }
      if (chainReactionActive) break; // Break out of outer loop too
    }
  }
  
  return { 
    totalScore, 
    chainReactionCount, 
    iterations 
  };
};

/**
 * Main function to process a tile drop - matches the test cases in example.js
 * 
 * @param {Array[]} board - Current board state (2D array)
 * @param {number} value - Value of the tile to drop
 * @param {number} column - Column where the tile should be dropped
 * @returns {Object} - Result containing updated board and score
 */
export const processTileDrop = (board, value, column) => {
  // Validate inputs
  if (!board || !Array.isArray(board) || board.length === 0) {
    throw new Error('Invalid board: must be a non-empty 2D array');
  }
  
  if (column < 0 || column >= COLS) {
    throw new Error(`Invalid column: must be between 0 and ${COLS - 1}`);
  }
  
  if (value <= 0) {
    throw new Error('Invalid value: must be greater than 0');
  }
  
  // Create a deep copy of the board to avoid mutations
  let newBoard = board.map(row => [...row]);
  let totalScore = 0;
  
  // Find the landing position (topmost empty cell in the column)
  let landingRow = -1;
  for (let row = 0; row < ROWS; row++) {
    if (newBoard[row][column] === 0) {
      landingRow = row;
      break;
    }
  }
  
  // If no empty cell found, the column is full
  if (landingRow === -1) {
    return {
      board: newBoard,
      score: 0,
      success: false,
      error: 'Column is full'
    };
  }
  
  // STEP 1: Place the landing tile
  newBoard[landingRow][column] = value;
  
  // STEP 2: Apply physics - upward gravity affects all columns
  for (let c = 0; c < COLS; c++) {
    applyUpwardGravity(newBoard, c);
  }
  
  // STEP 3: Find where the tile settled after upward gravity
  let finalRow = -1;
  for (let r = 0; r < ROWS; r++) {
    if (newBoard[r][column] !== 0) {
      finalRow = r;
      break;
    }
  }
  
  // STEP 4: Initial merge check for the landed tile
  if (finalRow !== -1) {
    // For 3-tile merges, don't use preferred position to allow middle placement
    // For 2-tile merges, prefer the dropped tile position
    // For other merges (4+ tiles), prefer the dropped tile position
    const connectedTiles = findConnectedTiles(newBoard, finalRow, column);
    let initialMergeResult;
    
    if (connectedTiles.length === 3) {
      // 3-tile merge: let the middle position logic handle placement
      initialMergeResult = mergeConnectedTiles(newBoard, finalRow, column);
    } else {
      // 2-tile and other merges: prefer the dropped tile position
      initialMergeResult = mergeConnectedTiles(newBoard, finalRow, column, finalRow, column);
    }
    
    if (initialMergeResult && initialMergeResult.merged) {
      totalScore += initialMergeResult.score;
    }
  }
  
  // STEP 5: Process chain reactions
  const chainResult = processChainReactions(newBoard);
  totalScore += chainResult.totalScore;
  
  return {
    board: newBoard,
    score: Math.floor(totalScore),
    success: true,
    chainReactions: chainResult.chainReactionCount,
    iterations: chainResult.iterations
  };
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
  const connectedTiles = findConnectedTiles(board, targetRow, targetCol);
  
  // If we found less than 2 connected tiles, no merge is possible
  if (connectedTiles.length < 2) {
    return { score: 0, merged: false };
  }
  
  // Calculate new value using exponential rule: originalValue * 2^(numberOfTiles - 1)
  const numberOfTiles = connectedTiles.length;
  const newValue = targetValue * Math.pow(2, numberOfTiles - 1);
  const scoreGained = newValue;
  
  // Find the best position for the merge result
  let bestRow = -1;
  let bestCol = -1;
  
  // For 2-tile merges, always prefer the dropped tile position if provided
  if (numberOfTiles === 2 && resultRow !== null && resultCol !== null) {
    console.log(`2-tile merge (async): Using result position (${resultRow}, ${resultCol})`);
    bestRow = resultRow;
    bestCol = resultCol;
  } else if (numberOfTiles === 3) {
    // Special handling for 3-tile merges: result should appear in the middle tile
    // Sort tiles by row (top to bottom) to find the middle one
    const sortedTiles = [...connectedTiles].sort((a, b) => a.row - b.row);
    const middleTile = sortedTiles[1]; // Middle tile (index 1 of 3)
    bestRow = middleTile.row;
    bestCol = middleTile.col;
  } else {
    // For other cases (4, 5+ tiles), prefer the lowest row (closest to bottom) among connected tiles
    // But don't prefer rightmost column for 2-tile merges
    for (const tile of connectedTiles) {
      if (bestRow === -1 || tile.row > bestRow) {
        bestRow = tile.row;
        bestCol = tile.col;
      } else if (tile.row === bestRow && numberOfTiles > 2 && tile.col > bestCol) {
        // Only prefer rightmost column for 3+ tile merges, not 2-tile merges
        bestCol = tile.col;
      }
    }
  }
  
  // Determine where to place the result
  // If resultRow/resultCol are explicitly provided, use them
  // Otherwise, use the calculated best position
  const finalResultRow = resultRow !== null ? resultRow : bestRow;
  const finalResultCol = resultCol !== null ? resultCol : bestCol;
  
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
    const animationDelay = isChainReaction ? 200 : 500; // Faster animation delay with more frames
    await new Promise(resolve => {
      setTimeout(resolve, animationDelay);
    });
  }
  
  // Place merged tile at RESULT position
  console.log(`2-tile merge (async): Placing at (${finalResultRow}, ${finalResultCol})`);
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
  
  // STEP 4: Initial merge check for the landed tile (merge at the settled position)
  let currentMergePosition = null;
  if (finalRow !== -1) {
    // For 2-tile merges, prefer the dropped tile position
    // For 3+ tile merges, let the natural position logic handle it
    const connectedTiles = findConnectedTiles(newBoard, finalRow, col);
    const resultRow = connectedTiles.length === 2 ? finalRow : null;
    const resultCol = connectedTiles.length === 2 ? col : null;
    
    const initialMergeResult = await checkAndMergeConnectedGroup(
      newBoard, 
      finalRow, 
      col, 
      showMergeResultAnimation,
      false, // Not a chain reaction - full animation
      resultRow, // For 2-tile merges, use dropped tile position
      resultCol  // For 2-tile merges, use dropped tile position
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
    
    // Update current merge position after gravity (find where the tile actually settled)
    if (currentMergePosition) {
      let settledRow = currentMergePosition.row;
      // Find where the tile actually settled after gravity
      for (let r = 0; r < ROWS; r++) {
        if (newBoard[r][currentMergePosition.col] !== 0) {
          settledRow = r;
          break;
        }
      }
      currentMergePosition.row = settledRow;
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

