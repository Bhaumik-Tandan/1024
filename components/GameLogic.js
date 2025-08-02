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
import { vibrateOnIntermediateMerge, vibrateOnMerge } from '../utils/vibration';
import { Dimensions } from 'react-native'; // Added for performance optimization

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
 * @param {number} [originColumn] - The column where the original drop occurred (for prioritizing position)
 * @returns {Object|null} - Merge result or null if no merge possible
 */
export const mergeConnectedTiles = (board, targetRow, targetCol, preferredRow, preferredCol, originColumn) => {
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

  // PRIORITY 1: For 2-tile merges, always prefer the dropped tile position if provided
  if (numberOfTiles === 2 && preferredRow !== undefined && preferredCol !== undefined) {
    bestRow = preferredRow;
    bestCol = preferredCol;
  } 
  // PRIORITY 2: If preferred position is provided and exists in connected tiles, use it
  else if (
    preferredRow !== undefined && preferredCol !== undefined &&
    connectedTiles.some(tile => tile.row === preferredRow && tile.col === preferredCol)
  ) {
    bestRow = preferredRow;
    bestCol = preferredCol;
  } 
  // PRIORITY 3: If originColumn is provided, prioritize positions within that column
  else if (originColumn !== undefined) {
    // Filter connected tiles to those in the origin column
    const originColumnTiles = connectedTiles.filter(tile => tile.col === originColumn);
    
    if (originColumnTiles.length > 0) {
      if (numberOfTiles === 3 && originColumnTiles.length >= 2) {
        // For 3-tile merges with tiles in origin column, prefer middle position within origin column
        if (originColumnTiles.length === 3) {
          // All tiles in origin column - use middle
          const sortedTiles = [...originColumnTiles].sort((a, b) => a.row - b.row);
          const middleTile = sortedTiles[1];
          bestRow = middleTile.row;
          bestCol = middleTile.col;
        } else {
          // Some tiles in origin column - use the one closest to middle
          const sortedTiles = [...originColumnTiles].sort((a, b) => a.row - b.row);
          const middleIndex = Math.floor(sortedTiles.length / 2);
          bestRow = sortedTiles[middleIndex].row;
          bestCol = sortedTiles[middleIndex].col;
        }
      } else if (numberOfTiles === 4) {
        // For 4-tile merges, prefer the lowest row within origin column
        for (const tile of originColumnTiles) {
          if (bestRow === -1 || tile.row > bestRow) {
            bestRow = tile.row;
            bestCol = tile.col;
          }
        }
      } else {
        // For other merges, use first tile in origin column
        bestRow = originColumnTiles[0].row;
        bestCol = originColumnTiles[0].col;
      }
    } else {
      // No tiles in origin column, fall back to default logic
      bestRow = connectedTiles[0].row;
      bestCol = connectedTiles[0].col;
    }
  }
  // FALLBACK: Original logic for backward compatibility
  else if (numberOfTiles === 3) {
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
  } else if (numberOfTiles === 4) {
    // For 4-tile merges, prefer the lowest row (closest to bottom)
    for (const tile of connectedTiles) {
      if (bestRow === -1 || tile.row > bestRow) {
        bestRow = tile.row;
        bestCol = tile.col;
      } else if (tile.row === bestRow && tile.col > bestCol) {
        // Prefer rightmost column for 4-tile merges
        bestCol = tile.col;
      }
    }
  } else {
    // For 5+ tile merges (theoretically impossible but handled for safety)
    // Use the first tile position as fallback
    bestRow = connectedTiles[0].row;
    bestCol = connectedTiles[0].col;
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
 * @param {number} [originColumn] - The column where the original drop occurred (for prioritizing position)
 * @param {Function} [showMergeResultAnimation] - Animation callback function
 * @returns {Object} - Chain reaction results
 */
export const processChainReactions = async (board, originColumn, showMergeResultAnimation = null) => {
  let totalScore = 0;
  let chainReactionCount = 0;
  let iterations = 0;
  
  // Performance optimization for tablets - reduced max iterations for smoother gameplay
  const isTablet = (typeof window !== 'undefined' && window.innerWidth >= 768) || 
                   (typeof Dimensions !== 'undefined' && Dimensions.get('window').width >= 768);
  const maxIterations = isTablet ? 50 : 100; // Reduced for tablets to maintain 60fps
  
  let chainReactionActive = true;
  
  while (chainReactionActive && iterations < maxIterations) {
    chainReactionActive = false;
    iterations++;
    
    // Apply upward gravity after each merge
    for (let c = 0; c < COLS; c++) {
      applyUpwardGravity(board, c);
    }
    
    // Performance optimization - batch multiple operations when possible
    if (iterations > 10 && isTablet) {
      // Add a small delay to prevent UI blocking on tablets
      await new Promise(resolve => setTimeout(resolve, 1));
    }
    
    // Check entire board for possible merges, prioritizing origin column
    const columnsToCheck = [];
    
    // If origin column is specified, check it first
    if (originColumn !== undefined) {
      columnsToCheck.push(originColumn);
      // Then check other columns
      for (let c = 0; c < COLS; c++) {
        if (c !== originColumn) {
          columnsToCheck.push(c);
        }
      }
    } else {
      // No origin column specified, check all columns in order
      for (let c = 0; c < COLS; c++) {
        columnsToCheck.push(c);
      }
    }
    
    outerLoop: for (let r = 0; r < ROWS; r++) {
      for (const c of columnsToCheck) {
        if (board[r][c] !== 0) {
          // Use the animated merge function if animation callback is provided
          let mergeResult;
          if (showMergeResultAnimation) {
            mergeResult = await checkAndMergeConnectedGroup(
              board, 
              r, 
              c, 
              showMergeResultAnimation,
              true, // This is a chain reaction - faster animation
              null, // Use default position for chain reactions
              null, // Use default position for chain reactions
              originColumn // Origin column (where the original drop occurred)
            );
          } else {
            // Fallback to non-animated merge for backward compatibility
            mergeResult = mergeConnectedTiles(board, r, c, undefined, undefined, originColumn);
          }
          
          if (mergeResult && mergeResult.merged) {
            totalScore += mergeResult.score;
            chainReactionActive = true;
            chainReactionCount++;
            break outerLoop; // Break to restart chain from this position
          }
        }
      }
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
 * @param {Function} [showMergeResultAnimation] - Animation callback function
 * @returns {Object} - Result containing updated board and score
 */
export const processTileDrop = async (board, value, column, showMergeResultAnimation = null) => {
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
    // For all merges, pass the origin column to ensure results stay in the drop column
    const connectedTiles = findConnectedTiles(newBoard, finalRow, column);
    let initialMergeResult;
    
    if (showMergeResultAnimation) {
      // Use the animated merge function
      if (connectedTiles.length === 2) {
        // 2-tile merge: prefer the dropped tile position and stay in origin column
        initialMergeResult = await checkAndMergeConnectedGroup(
          newBoard, 
          finalRow, 
          column, 
          showMergeResultAnimation,
          false, // Not a chain reaction - full animation
          finalRow, // For 2-tile merges, use dropped tile position
          column, // For 2-tile merges, use dropped tile position
          column // Origin column (where the drop occurred)
        );
      } else {
        // 3+ tile merges: use origin column logic to stay in drop column
        initialMergeResult = await checkAndMergeConnectedGroup(
          newBoard, 
          finalRow, 
          column, 
          showMergeResultAnimation,
          false, // Not a chain reaction - full animation
          null, // Use default position for 3+ tile merges
          null, // Use default position for 3+ tile merges
          column // Origin column (where the drop occurred)
        );
      }
    } else {
      // Fallback to non-animated merge for backward compatibility
      if (connectedTiles.length === 2) {
        // 2-tile merge: prefer the dropped tile position and stay in origin column
        initialMergeResult = mergeConnectedTiles(newBoard, finalRow, column, finalRow, column, column);
      } else {
        // 3+ tile merges: use origin column logic to stay in drop column
        initialMergeResult = mergeConnectedTiles(newBoard, finalRow, column, undefined, undefined, column);
      }
    }
    
    if (initialMergeResult && initialMergeResult.merged) {
      totalScore += initialMergeResult.score;
    }
  }
  
  // STEP 5: Process chain reactions with animation support
  const chainResult = await processChainReactions(newBoard, column, showMergeResultAnimation);
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
 * Process a tile drop into a full column when merging is possible
 * This handles the special case where a column is full but the dropped tile can merge
 * 
 * @param {Array[]} board - Current board state (2D array)
 * @param {number} value - Value of the tile to drop
 * @param {number} column - Column where the tile should be dropped
 * @param {Function} showMergeResultAnimation - Animation callback function
 * @returns {Object} - Result containing updated board and score
 */
export const processFullColumnDrop = async (board, value, column, showMergeResultAnimation = null) => {
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
  
  // Verify the column is actually full
  let columnFull = true;
  for (let row = 0; row < ROWS; row++) {
    if (newBoard[row][column] === 0) {
      columnFull = false;
      break;
    }
  }
  
  if (!columnFull) {
    // Column is not full, use regular drop logic
    return await processTileDrop(board, value, column, showMergeResultAnimation);
  }
  
  // Check if merging is possible at the bottom of the column
  const bottomRow = ROWS - 1;
  const bottomValue = newBoard[bottomRow][column];
  
  // Case 1: Direct merge with bottom tile
  if (bottomValue === value) {
    // Use the proper merge animation system
    if (showMergeResultAnimation) {
      // Prepare merge positions for animation
      const mergingTilePositions = [
        { row: bottomRow, col: column, value: bottomValue },
        { row: bottomRow, col: column, value: value } // Simulated dropped tile position
      ];
      
      const newValue = value * 2; // Simple 2-tile merge
      
      // Show merge animation
      showMergeResultAnimation(bottomRow, column, newValue, mergingTilePositions, false);
      
      // Wait for animation to start
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Create the merge result
    const newValue = value * 2; // Simple 2-tile merge
    newBoard[bottomRow][column] = newValue;
    
    totalScore += newValue;
    
    // Apply upward gravity to settle everything
    for (let c = 0; c < COLS; c++) {
      applyUpwardGravity(newBoard, c);
    }
    
    // Process any chain reactions with animation support
    const chainResult = await processChainReactions(newBoard, column, showMergeResultAnimation);
    totalScore += chainResult.totalScore;
    
    return {
      board: newBoard,
      score: Math.floor(totalScore),
      success: true,
      chainReactions: chainResult.chainReactionCount,
      iterations: chainResult.iterations
    };
  }
  
  // Case 2: Check for adjacent merges
  const adjacentPositions = [
    { row: bottomRow - 1, col: column }, // up from bottom
    { row: bottomRow, col: column - 1 }, // left of bottom
    { row: bottomRow, col: column + 1 }  // right of bottom
  ];
  
  for (const pos of adjacentPositions) {
    if (pos.row >= 0 && pos.row < ROWS && 
        pos.col >= 0 && pos.col < COLS && 
        newBoard[pos.row][pos.col] === value) {
      
      // Found an adjacent tile that can merge
      const newValue = value * 2;
      
      // Use the proper merge animation system for adjacent merges
      if (showMergeResultAnimation) {
        // Prepare merge positions for animation
        const mergingTilePositions = [
          { row: pos.row, col: pos.col, value: value },
          { row: bottomRow, col: column, value: value } // Simulated dropped tile position
        ];
        
        // Show merge animation
        showMergeResultAnimation(bottomRow, column, newValue, mergingTilePositions, false);
        
        // Wait for animation to start
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Create the merge by replacing the bottom tile with the new merged value
      newBoard[bottomRow][column] = newValue;
      
      // Clear the adjacent tile that merged
      newBoard[pos.row][pos.col] = 0;
      
      totalScore += newValue;
      
      // Apply upward gravity to settle everything
      for (let c = 0; c < COLS; c++) {
        applyUpwardGravity(newBoard, c);
      }
      
      // Process any chain reactions with animation support
      const chainResult = await processChainReactions(newBoard, column, showMergeResultAnimation);
      totalScore += chainResult.totalScore;
      
      return {
        board: newBoard,
        score: Math.floor(totalScore),
        success: true,
        chainReactions: chainResult.chainReactionCount,
        iterations: chainResult.iterations
      };
    }
  }
  
  // No merge possible
  return {
    board: newBoard,
    score: 0,
    success: false,
    error: 'Column is full and no merge possible'
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
export const checkAndMergeConnectedGroup = async (board, targetRow, targetCol, showMergeResultAnimation, isChainReaction = false, resultRow = null, resultCol = null, originColumn = null) => {
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
  
  // PRIORITY 1: For 2-tile merges, always prefer the dropped tile position if provided
  if (numberOfTiles === 2 && resultRow !== null && resultCol !== null) {
    bestRow = resultRow;
    bestCol = resultCol;
  } 
  // PRIORITY 2: If originColumn is provided, prioritize positions within that column
  else if (originColumn !== null) {
    // Filter connected tiles to those in the origin column
    const originColumnTiles = connectedTiles.filter(tile => tile.col === originColumn);
    
    if (originColumnTiles.length > 0) {
      if (numberOfTiles === 3 && originColumnTiles.length >= 2) {
        // For 3-tile merges with tiles in origin column, prefer middle position within origin column
        if (originColumnTiles.length === 3) {
          // All tiles in origin column - use middle
          const sortedTiles = [...originColumnTiles].sort((a, b) => a.row - b.row);
          const middleTile = sortedTiles[1];
          bestRow = middleTile.row;
          bestCol = middleTile.col;
        } else {
          // Some tiles in origin column - use the one closest to middle
          const sortedTiles = [...originColumnTiles].sort((a, b) => a.row - b.row);
          const middleIndex = Math.floor(sortedTiles.length / 2);
          bestRow = sortedTiles[middleIndex].row;
          bestCol = sortedTiles[middleIndex].col;
        }
      } else if (numberOfTiles === 4) {
        // For 4-tile merges, prefer the lowest row within origin column
        for (const tile of originColumnTiles) {
          if (bestRow === -1 || tile.row > bestRow) {
            bestRow = tile.row;
            bestCol = tile.col;
          }
        }
      } else {
        // For other merges, use first tile in origin column
        bestRow = originColumnTiles[0].row;
        bestCol = originColumnTiles[0].col;
      }
    } else {
      // No tiles in origin column, fall back to default logic
      bestRow = connectedTiles[0].row;
      bestCol = connectedTiles[0].col;
    }
  }
  // FALLBACK: Original logic for backward compatibility
  else if (numberOfTiles === 3) {
    // Special handling for 3-tile merges: result should appear in the middle tile
    // Sort tiles by row (top to bottom) to find the middle one
    const sortedTiles = [...connectedTiles].sort((a, b) => a.row - b.row);
    const middleTile = sortedTiles[1]; // Middle tile (index 1 of 3)
    bestRow = middleTile.row;
    bestCol = middleTile.col;
  } else if (numberOfTiles === 4) {
    // For 4-tile merges, prefer the lowest row (closest to bottom) among connected tiles
    for (const tile of connectedTiles) {
      if (bestRow === -1 || tile.row > bestRow) {
        bestRow = tile.row;
        bestCol = tile.col;
      } else if (tile.row === bestRow && tile.col > bestCol) {
        // Prefer rightmost column for 4-tile merges
        bestCol = tile.col;
      }
    }
  } else {
    // For 5+ tile merges (theoretically impossible but handled for safety)
    // Use the first tile position as fallback
    bestRow = connectedTiles[0].row;
    bestCol = connectedTiles[0].col;
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
    // Start animation and sound simultaneously for better synchronization
    const animationPromise = new Promise(resolve => {
      showMergeResultAnimation(finalResultRow, finalResultCol, newValue, mergingTilePositions, isChainReaction, resolve);
    });
    
    // Play sound immediately when merge animation starts for responsive feedback
    if (isChainReaction) {
      vibrateOnIntermediateMerge().catch(err => {
        // Intermediate merge sound/vibration error (silently handled)
      });
    } else {
      vibrateOnMerge().catch(err => {
        // Regular merge sound/vibration error (silently handled)
      });
    }
    
    // Wait for animation to complete
    await animationPromise;
  } else {
    // If no animation, play sound immediately
    if (isChainReaction) {
      vibrateOnIntermediateMerge().catch(err => {
        // Intermediate merge sound/vibration error (silently handled)
      });
    } else {
      // For regular merges, play regular merge sound
      vibrateOnMerge().catch(err => {
        // Regular merge sound/vibration error (silently handled)
      });
    }
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
    return { newBoard: board, totalScore: 0 };
  }

  // Check bounds
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
    return { newBoard: board, totalScore: 0 };
  }

  // Create a deep copy of the board to avoid mutations
  let newBoard = board.map(r => [...r]);
  let totalScore = 0;
  let chainReactionCount = 0;
  let hadInitialMerge = false;
  
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
    
    // First, check if this initial merge will trigger chain reactions
    let willTriggerChains = false;
    if (connectedTiles.length >= 2) {
      // Simulate the merge to see if it will create conditions for chain reactions
      const testBoard = newBoard.map(row => [...row]); // Deep copy
      
      // Temporarily perform the merge on test board
      const mergedValue = connectedTiles.reduce((sum, tile) => sum + tile.value, 0);
      connectedTiles.forEach(tile => {
        testBoard[tile.row][tile.col] = 0;
      });
      const mergeResultRow = resultRow !== null ? resultRow : connectedTiles[0].row;
      const mergeResultCol = resultCol !== null ? resultCol : connectedTiles[0].col;
      testBoard[mergeResultRow][mergeResultCol] = mergedValue;
      
      // Apply gravity and check for potential merges
      for (let c = 0; c < COLS; c++) {
        applyUpwardGravity(testBoard, c);
      }
      
      // Check if any merges are possible after this
      for (let r = 0; r < ROWS && !willTriggerChains; r++) {
        for (let c = 0; c < COLS && !willTriggerChains; c++) {
          if (testBoard[r][c] !== 0) {
            const potentialConnected = findConnectedTiles(testBoard, r, c);
            if (potentialConnected.length >= 2) {
              willTriggerChains = true;
            }
          }
        }
      }
      
    }
    
    const initialMergeResult = await checkAndMergeConnectedGroup(
      newBoard, 
      finalRow, 
      col, 
      showMergeResultAnimation,
      willTriggerChains, // Mark as chain reaction if it will trigger chains
      resultRow, // For 2-tile merges, use dropped tile position
      resultCol, // For 2-tile merges, use dropped tile position
      col       // Origin column (where the drop occurred)
    );
    totalScore += initialMergeResult.score;
    
    // Track the position of the newly created tile for chain reactions
    if (initialMergeResult.merged) {
      hadInitialMerge = true;
      currentMergePosition = { 
        row: initialMergeResult.newRow, 
        col: initialMergeResult.newCol 
      };
    }
  }
  
  // STEP 5: Chain reaction loop - continue until no more merges possible
  // Each chain reaction checks around the merged result for new adjacent tiles
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
    
    // Check for new merges around the current merge position
    if (currentMergePosition) {
      // Check all 4 adjacent positions around the merged result
      const adjacentPositions = [
        { row: currentMergePosition.row - 1, col: currentMergePosition.col }, // up
        { row: currentMergePosition.row + 1, col: currentMergePosition.col }, // down
        { row: currentMergePosition.row, col: currentMergePosition.col - 1 }, // left
        { row: currentMergePosition.row, col: currentMergePosition.col + 1 }  // right
      ];
      
      for (const pos of adjacentPositions) {
        // Check bounds
        if (pos.row >= 0 && pos.row < ROWS && pos.col >= 0 && pos.col < COLS) {
          if (newBoard[pos.row][pos.col] !== 0) {
            const testConnected = findConnectedTiles(newBoard, pos.row, pos.col);
            if (testConnected.length >= 2) {
              
              // Check if this will be the final merge in the chain
              const testBoard = newBoard.map(row => [...row]);
              // Simulate this merge
              testConnected.forEach(tile => {
                testBoard[tile.row][tile.col] = 0;
              });
              testBoard[testConnected[0].row][testConnected[0].col] = testConnected.reduce((sum, t) => sum + t.value, 0);
              
              // Apply gravity and check for more potential merges
              for (let testCol = 0; testCol < COLS; testCol++) {
                applyUpwardGravity(testBoard, testCol);
              }
              
              // Check if any more merges are possible
              let hasMoreMerges = false;
              for (let testRow = 0; testRow < ROWS && !hasMoreMerges; testRow++) {
                for (let testColCheck = 0; testColCheck < COLS && !hasMoreMerges; testColCheck++) {
                  if (testBoard[testRow][testColCheck] !== 0) {
                    const potentialConnected = findConnectedTiles(testBoard, testRow, testColCheck);
                    if (potentialConnected.length >= 2) {
                      hasMoreMerges = true;
                    }
                  }
                }
              }
              
              const mergeResult = await checkAndMergeConnectedGroup(
                newBoard, 
                pos.row, 
                pos.col, 
                showMergeResultAnimation,
                hasMoreMerges, // Only intermediate sound if MORE merges will follow
                null, // Use default position for chain reactions
                null, // Use default position for chain reactions
                col   // Origin column (where the original drop occurred)
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
        }
      }
      
      // If no merges found around the current position, clear it
      if (!chainReactionActive) {
        currentMergePosition = null;
      }
    }
    
    // If no current merge position, check entire board for any possible merges
    if (!chainReactionActive) {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (newBoard[r][c] !== 0) {
            const testConnected = findConnectedTiles(newBoard, r, c);
            if (testConnected.length >= 2) {
              
              // Check if this will be the final merge in the chain
              const testBoard = newBoard.map(row => [...row]);
              // Simulate this merge
              testConnected.forEach(tile => {
                testBoard[tile.row][tile.col] = 0;
              });
              testBoard[testConnected[0].row][testConnected[0].col] = testConnected.reduce((sum, t) => sum + t.value, 0);
              
              // Apply gravity and check for more potential merges
              for (let testCol = 0; testCol < COLS; testCol++) {
                applyUpwardGravity(testBoard, testCol);
              }
              
              // Check if any more merges are possible
              let hasMoreMerges = false;
              for (let testRow = 0; testRow < ROWS && !hasMoreMerges; testRow++) {
                for (let testColCheck = 0; testColCheck < COLS && !hasMoreMerges; testColCheck++) {
                  if (testBoard[testRow][testColCheck] !== 0) {
                    const potentialConnected = findConnectedTiles(testBoard, testRow, testColCheck);
                    if (potentialConnected.length >= 2) {
                      hasMoreMerges = true;
                    }
                  }
                }
              }
              
              const mergeResult = await checkAndMergeConnectedGroup(
                newBoard, 
                r, 
                c, 
                showMergeResultAnimation,
                hasMoreMerges, // Only intermediate sound if MORE merges will follow
                null, // Use default position for chain reactions
                null, // Use default position for chain reactions
                col   // Origin column (where the original drop occurred)
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
  
  // Note: Chain merge sounds are now handled properly:
  // - Each intermediate merge plays intermediate sound
  // - The final merge in the chain plays regular merge sound immediately
  // - No need for separate delayed final sound
  
  // STEP 8: Validate final board state
  if (!GameValidator.isValidBoard(newBoard)) {
    return { newBoard: board, totalScore: 0 };
  }
  
  return { 
    newBoard, 
    totalScore: Math.floor(totalScore),
    chainReactionCount,
    iterations 
  };
};

// Emergency animation cleanup to prevent stuck states
export const clearAllAnimations = (animationManager) => {
  if (animationManager) {
    animationManager.clearMergeAnimations();
    animationManager.clearFalling();
  }
};

// Optimized merge processing to prevent animation buildup
export const processMergeOptimized = (board, animationManager, onScoreUpdate) => {
  // Clear any existing animations first
  if (animationManager) {
    animationManager.clearMergeAnimations();
  }
  
  // Process merges with minimal delay
  const mergeResult = findAndProcessMerges(board);
  
  if (mergeResult.merged && animationManager) {
    // Use fastest animation settings
    animationManager.showMergeResultAnimation(
      mergeResult.row,
      mergeResult.col, 
      mergeResult.newValue,
      mergeResult.mergingPositions,
      mergeResult.isChainReaction
    );
  }
  
  return mergeResult;
};

