/**
 * ===========================
 * MAIN GAME COMPONENT
 * ===========================
 * 
 * The primary game container that orchestrates all game mechanics
 * Now uses centralized rules and improved architecture
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  Platform
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import GameHeader from '../components/GameHeader';
import GameGrid from '../components/GameGrid';
import PauseModal from '../components/PauseModal';
import { useAnimationManager } from '../components/AnimationManager';
import { 
  ROWS, 
  COLS, 
  CELL_SIZE, 
  CELL_MARGIN, 
  getCellLeft, 
  getCellTop,
  THEME,
  FONT_SIZES,
  MILESTONE_TILES,
  isPlanet,
  getStartingPlanetValues
} from '../components/constants';
import useGameStore from '../store/gameStore';
import { vibrateOnTouch } from '../utils/vibration';
import soundManager from '../utils/soundManager';
import SpaceBackground from '../components/SpaceBackground';
import SpaceFacts from '../components/SpaceFacts';
import PlanetTile from '../components/PlanetTile';
import ElementTile from '../components/ElementTile';

// Simple random tile generation function to avoid dependency issues
const getRandomBlockValue = () => {
  return Math.random() < 0.7 ? 2 : 4;
};

// EXACT MASTER BRANCH IMPLEMENTATIONS - DO NOT MODIFY FUNCTIONALITY

// Simple game over check function (simplified, no GameValidator dependency)
const isGameOver = (board) => {
  // With upward gravity, check if BOTTOM row is completely filled (no empty cells)
  const bottomRow = ROWS - 1;
  return board[bottomRow].every(cell => cell !== 0);
};

// Find connected tiles using flood fill - EXACT MASTER BRANCH IMPLEMENTATION
const findConnectedTiles = (board, targetRow, targetCol) => {
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

// Upward gravity function - EXACT MASTER BRANCH IMPLEMENTATION
const applyUpwardGravity = (board, col) => {
  // Validate input
  if (col < 0 || col >= COLS) {
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

// Simple vibration fallback (no dependency)
const vibrateOnIntermediateMerge = async () => {
  // Simple fallback - no actual vibration
  return Promise.resolve();
};

// checkAndMergeConnectedGroup - EXACT MASTER BRANCH IMPLEMENTATION
const checkAndMergeConnectedGroup = async (board, targetRow, targetCol, showMergeResultAnimation, isChainReaction = false, resultRow = null, resultCol = null, originColumn = null) => {
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
  
  // Play appropriate merge sound
  if (isChainReaction) {
    // For chain reaction merges, play intermediate merge sound
    vibrateOnIntermediateMerge().catch(err => {
      // Intermediate merge sound/vibration error
    });
  }
  // Note: For initial merges (isChainReaction = false), sound will be handled by the main game engine
  
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
  board[finalResultRow][finalResultCol] = newValue;
  
  return { 
    score: scoreGained, 
    merged: true, 
    newRow: finalResultRow, 
    newCol: finalResultCol,
    newValue: newValue 
  };
};

// handleBlockLanding - EXACT MASTER BRANCH IMPLEMENTATION  
const handleBlockLanding = async (board, row, col, value, showMergeResultAnimation) => {
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
    
    const initialMergeResult = await checkAndMergeConnectedGroup(
      newBoard, 
      finalRow, 
      col, 
      showMergeResultAnimation,
      false, // Not a chain reaction - full animation
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
  const maxIterations = 10; // Fallback limit
  
  while (chainReactionActive && iterations < maxIterations) {
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
            const chainMergeResult = await checkAndMergeConnectedGroup(
              newBoard, 
              pos.row, 
              pos.col, 
              showMergeResultAnimation,
              true, // This is a chain reaction - faster animation
              null, // Use default position for chain reactions
              null, // Use default position for chain reactions
              col   // Origin column (where the original drop occurred)
            );
            
            if (chainMergeResult.merged) {
              const bonusScore = iterations > 1 ? chainMergeResult.score * 2 : chainMergeResult.score; // Simplified bonus
              totalScore += bonusScore;
              chainReactionActive = true;
              chainReactionCount++;
              
              // Update the current merge position for next iteration
              currentMergePosition = { 
                row: chainMergeResult.newRow, 
                col: chainMergeResult.newCol 
              };
              break; // Found a merge, continue the chain
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
            const mergeResult = await checkAndMergeConnectedGroup(
              newBoard, 
              r, 
              c, 
              showMergeResultAnimation,
              true, // This is a chain reaction - faster animation
              null, // Use default position for chain reactions
              null, // Use default position for chain reactions
              col   // Origin column (where the original drop occurred)
            );
            
            if (mergeResult.merged) {
              const bonusScore = iterations > 1 ? mergeResult.score * 2 : mergeResult.score; // Simplified bonus
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
  
  return { 
    newBoard, 
    totalScore: Math.floor(totalScore),
    chainReactionCount,
    iterations 
  };
};

/**
 * Main game component with enhanced architecture
 * Uses centralized game rules and improved state management
 */
const DropNumberBoard = ({ navigation, route }) => {
  // Core game state
  const [board, setBoard] = useState(() => Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
  const [score, setScore] = useState(0);
  const [nextBlock, setNextBlock] = useState(() => {
    const value = Math.random() < 0.7 ? 2 : 4;
    return value;
  });
  const [previewBlock, setPreviewBlock] = useState(() => {
    const value = Math.random() < 0.7 ? 2 : 4;
    return value;
  });
  
  // Remove debug logging
  const [gameOver, setGameOver] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  
  // Touch sensitivity control
  const [isTouchEnabled, setIsTouchEnabled] = useState(true);
  const touchTimeoutRef = useRef(null);
  
  // Space facts state
  const [showSpaceFact, setShowSpaceFact] = useState(false);
  const [currentFactValue, setCurrentFactValue] = useState(0);
  const factTimeoutRef = useRef(null);
  
  // Game statistics
  const [gameStats, setGameStats] = useState({
    tilesPlaced: 0,
    mergesPerformed: 0,
    chainReactions: 0,
    highestTile: 0,
    startTime: Date.now(),
  });

  // Floor system states
  const [currentMinSpawn, setCurrentMinSpawn] = useState(2);
  const [floorLevel, setFloorLevel] = useState(1);
  const [maxTileAchieved, setMaxTileAchieved] = useState(0);

  const boardRef = useRef(null);
  const [boardLeft, setBoardLeft] = useState(0);
  
  // Zustand store
  const { updateScore, updateHighestBlock, saveGame, loadSavedGame, clearSavedGame, highScore } = useGameStore();
  
  // Use the animation manager
  const {
    falling,
    setFalling,
    mergingTiles,
    setMergingTiles, // Add missing setter
    mergeResult,
    setMergeResult, // Add missing setter
    mergeAnimations,
    setMergeAnimations, // Add missing setter
    updateFallingCol,
    fastDropAnimation,
    clearFalling,
    clearMergeAnimations,
  } = useAnimationManager();

  // Animation states - remove custom dropping tile, use master branch falling system
  const [collisionAnimations, setCollisionAnimations] = useState([]);

  /**
   * Game loop: Spawn new tiles automatically
   * Re-enabled to match master branch behavior
   */
  useEffect(() => {
    if (!falling && !gameOver && !isPaused) {
      const spawnCol = Math.floor(COLS / 2); // Center column as per rules
      
      // Check for game over condition - check if top row is full
      if (isGameOver(board)) {
        setGameOver(true);
        return;
      }
      
      // Create static falling tile that stays in preview (not on board)
      const fallingTile = {
        col: spawnCol,
        value: nextBlock,
        anim: new Animated.Value(0), // Start at bottom position
        toRow: 0, // Will be updated when user taps a row
        fastDrop: false,
        static: true, // Add static flag to indicate it's not moving
        startRow: ROWS - 1, // Starting from bottom row
        inPreview: true // Flag to indicate it's in preview mode
      };
      
      // Falling tile created with nextBlock value
      setFalling(fallingTile);
      // Don't automatically show guide for every new tile
      // setShowGuide(true); // Removed this line
    }
    // eslint-disable-next-line
  }, [falling, gameOver, board, nextBlock]); // Added nextBlock to dependencies

  // PanResponder for drag-to-move (disabled for row-based tapping)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false, // Disable drag functionality
      onMoveShouldSetPanResponder: () => false,
      onPanResponderGrant: () => {},
      onPanResponderMove: () => {},
      onPanResponderRelease: () => {},
      onPanResponderTerminate: () => {},
    })
  ).current;

  // Track score and highest block for Zustand updates
  const [lastScore, setLastScore] = useState(0);
  const [lastHighestBlock, setLastHighestBlock] = useState(0);

  // Load saved game if resuming
  useEffect(() => {
    if (route.params?.resume) {
      const savedGame = loadSavedGame();
      if (savedGame) {
        // Loading saved game state
        
        // Clear falling state first
        clearFalling();
        clearMergeAnimations();
        
        // Set all values immediately
        setBoard(savedGame.board);
        setScore(savedGame.score);
        setGameOver(false);
        setGameStats(savedGame.gameStats);
        setNextBlock(savedGame.nextBlock);
        setPreviewBlock(savedGame.previewBlock);
        
        // Update tracking variables for store sync
        setLastScore(savedGame.score);
        setLastHighestBlock(savedGame.gameStats?.highestTile || 0);
        
        // Update store after loading - defer to avoid render cycle issues
        setTimeout(() => {
          updateScore(savedGame.score);
          if (savedGame.gameStats?.highestTile) {
            updateHighestBlock(savedGame.gameStats.highestTile);
          }
        }, 0);
        
        // Force the falling tile to be null so game loop recreates it
        setFalling(null);
      }
    }
  }, [route.params?.resume, loadSavedGame]);

  // Optimized auto-save with less frequent updates
  useEffect(() => {
    if (gameOver || isPaused) return;
    
    const autoSaveInterval = setInterval(() => {
      const gameState = {
        board,
        score,
        nextBlock,
        previewBlock,
        gameStats,
        timestamp: Date.now(),
      };
      saveGame(gameState);
    }, 10000); // Save every 10 seconds instead of 5 to reduce processing overhead
    
    return () => clearInterval(autoSaveInterval);
  }, [board, score, nextBlock, previewBlock, gameStats, gameOver, isPaused, saveGame]);

  // Save game state when screen loses focus
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        // Save game state when leaving the screen
        if (!gameOver) {
          const currentGameState = {
            board,
            score,
            nextBlock,
            previewBlock,
            gameStats,
          };
          saveGame(currentGameState);
        }
      };
    }, [board, score, nextBlock, previewBlock, gameStats, gameOver, saveGame])
  );

  // Pause modal handlers
  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };
  
  const handleRestart = () => {
    resetGame(); // Use the full reset function instead of partial reset
  }

  const handleHome = () => {
    // Save current game state before going to main menu
    const currentGameState = {
      board,
      score,
      nextBlock,
      previewBlock,
      gameStats,
    };
    saveGame(currentGameState);
    
    setIsPaused(false);
    navigation.navigate('Home');
  };

  const handleClosePause = () => {
    setIsPaused(false);
  };

  /**
   * Cleanup timeouts on component unmount
   */
  useEffect(() => {
    return () => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
      if (factTimeoutRef.current) {
        clearTimeout(factTimeoutRef.current);
      }
    };
  }, []);
  
  /**
   * Show space fact for educational value
   */
  const showFactForValue = (value) => {
    // Only show facts for milestone values or first time achievements
    const milestoneValues = [4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096];
    
    if (milestoneValues.includes(value) && value > maxTileAchieved) {
      setCurrentFactValue(value);
      setShowSpaceFact(true);
      
      // Auto-hide fact after 8 seconds
      if (factTimeoutRef.current) {
        clearTimeout(factTimeoutRef.current);
      }
      factTimeoutRef.current = setTimeout(() => {
        setShowSpaceFact(false);
      }, 8000);
    }
  };
  
  const hideSpaceFact = () => {
    setShowSpaceFact(false);
    if (factTimeoutRef.current) {
      clearTimeout(factTimeoutRef.current);
    }
  };

  /**
   * Handle user tapping a cell to drop the tile in that column
   * Implements column-based dropping mechanism - finds first available cell in column
   * Includes touch sensitivity controls to prevent rapid successive taps
   */
  const handleRowTap = (targetRow, targetCol = null) => {
    // Touch sensitivity control - prevent rapid successive taps
    if (!isTouchEnabled) {
      return;
    }
    
    // Validate tap conditions - REQUIRES falling tile like master branch
    if (!falling || falling.fastDrop || gameOver || isPaused) {
      return;
    }
    
    // If no column specified, use the falling tile's current column (old behavior)
    const col = targetCol !== null ? targetCol : falling.col;
    
    // With UPWARD gravity, place tiles at the BOTTOM and let gravity move them up
    // Find the lowest empty position in the column (bottom-most empty cell)
    let landingCol = col;
    let landingRow = -1;
    
    // Search from BOTTOM to TOP for the first empty cell (upward gravity)
    for (let row = ROWS - 1; row >= 0; row--) {
      if (board[row][landingCol] === 0) {
        landingRow = row;
        break;
      }
    }
    
    // If no empty cell found, return (column is full)
    if (landingRow === -1) {
      return;
    }
    
    // Hide guide overlay permanently
    setShowGuide(false);
    
    // Capture the current nextBlock value before updating it
    const tileValueToDrop = falling.value;
    
    // Update next block immediately when user taps
    setNextBlock(previewBlock);
    // Generate new preview block
    const newPreviewBlock = getRandomBlockValue();
    setPreviewBlock(newPreviewBlock);
    
    // Update falling tile with target position and start animation
    const updatedFalling = {
      ...falling,
      col: landingCol,
      toRow: landingRow,
      value: tileValueToDrop,
      fastDrop: true,
      static: false,
      inPreview: false
    };
    setFalling(updatedFalling);
    
    // Animation from bottom to the target position - start immediately
    const startPosition = (ROWS - 1) * (CELL_SIZE + CELL_MARGIN); // Start from BOTTOM
    const endPosition = landingRow * (CELL_SIZE + CELL_MARGIN); // Target position
    
    falling.anim.setValue(startPosition);
    Animated.timing(falling.anim, {
      toValue: endPosition,
      duration: 150, // Fast drop animation for immediate response (reduced from 400ms)
      useNativeDriver: true, // Enable native driver for better performance
    }).start();
    
    // Keep touch enabled during animation for better responsiveness
    // Only disable for a minimal time to prevent double-taps
    setIsTouchEnabled(false);
    
    // Clear any existing timeout
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }
    
    // Re-enable touch immediately after next tick to prevent double-tap only
    touchTimeoutRef.current = setTimeout(() => {
      setIsTouchEnabled(true);
    }, 50); // Minimal delay just to prevent accidental double-taps
    
    // Handle landing after animation completes
    const fastDropTimer = setTimeout(() => {
      handleTileLanded(landingRow, landingCol, tileValueToDrop);
      clearFalling();
    }, 150); // Match the reduced animation duration
    
    return () => clearTimeout(fastDropTimer);
  };

  /**
   * Check if a tile at the given position has adjacent tiles
   * @param {Array[]} board - The game board
   * @param {number} row - Row position
   * @param {number} col - Column position
   * @returns {boolean} - True if there are adjacent tiles
   */
  const hasAdjacentTiles = (board, row, col) => {
    const adjacentPositions = [
      { row: row - 1, col }, // up
      { row: row + 1, col }, // down
      { row, col: col - 1 }, // left
      { row, col: col + 1 }  // right
    ];
    
    return adjacentPositions.some(pos => {
      return pos.row >= 0 && pos.row < ROWS && 
             pos.col >= 0 && pos.col < COLS && 
             board[pos.row][pos.col] !== 0;
    });
  };

  /**
   * Check if a tile can merge when dropped into a full column
   * @param {Array[]} board - The game board
   * @param {number} col - Column to check
   * @param {number} value - Value of the tile to drop
   * @returns {Object|null} - { canMerge: boolean, mergeRow: number } or null
   */
  const canMergeInFullColumn = (board, col, value) => {
    // Check if the bottom tile in the column matches the dropping tile
    const bottomRow = ROWS - 1;
    if (board[bottomRow][col] === value) {
      return { canMerge: true, mergeRow: bottomRow };
    }
    
    // Check if any adjacent tiles to the bottom can merge
    const adjacentPositions = [
      { row: bottomRow - 1, col }, // up from bottom
      { row: bottomRow, col: col - 1 }, // left of bottom
      { row: bottomRow, col: col + 1 }  // right of bottom
    ];
    
    for (const pos of adjacentPositions) {
      if (pos.row >= 0 && pos.row < ROWS && 
          pos.col >= 0 && pos.col < COLS && 
          board[pos.row][pos.col] === value) {
        return { canMerge: true, mergeRow: bottomRow };
      }
    }
    
    return null;
  };

  /**
   * Handle tile landing and process all game logic
   * Uses the enhanced game engine with chain reactions and scoring - MASTER BRANCH STYLE
   * Optimized for better responsiveness
   */
  const handleTileLanded = (row, col, value) => {
    try {
      // Play drop sound when tile lands (no vibration on drop) - don't await
      soundManager.playDropSound().catch(() => {
        // Silent fail for sound
      });
      
      // Process the tile landing through the game engine
      // Use requestAnimationFrame to defer heavy processing off main thread
      requestAnimationFrame(() => {
        handleBlockLanding(
          board, 
          row, 
          col, 
          value, 
          showMergeResultAnimation
        ).then(result => {
          const { 
            newBoard, 
            totalScore, 
            chainReactionCount = 0, 
            iterations = 0 
          } = result;
          
          // Batch all state updates together to reduce render cycles
          const newHighestTile = Math.max(gameStats.highestTile, ...newBoard.flat());
          const newScore = totalScore > 0 ? score + totalScore : score;
          
          // Batch state updates to reduce render cycles
          setBoard(newBoard);
          
          // Update score if points were gained
          if (totalScore > 0) {
            setScore(newScore);
            
            // Update game stats with new values
            setGameStats(prevStats => ({
              ...prevStats,
              tilesPlaced: prevStats.tilesPlaced + 1,
              mergesPerformed: prevStats.mergesPerformed + 1,
              chainReactions: prevStats.chainReactions + chainReactionCount,
              highestTile: newHighestTile,
            }));
            
            // Play merge sound and vibrate only on successful combinations (async)
            soundManager.playMergeSound().catch(() => {});
            vibrateOnTouch().catch(() => {});
          } else {
            // Update stats without merge
            setGameStats(prevStats => ({
              ...prevStats,
              tilesPlaced: prevStats.tilesPlaced + 1,
              chainReactions: prevStats.chainReactions + chainReactionCount,
              highestTile: newHighestTile,
            }));
          }
          
          // Check for game over condition
          if (isGameOver(newBoard)) {
            setGameOver(true);
          }
          
          // Defer store updates to next tick to avoid blocking render
          setTimeout(() => {
            if (newHighestTile > gameStats.highestTile) {
              updateHighestBlock(newHighestTile);
            }
            if (totalScore > 0) {
              updateScore(newScore);
            }
          }, 0);
          
        }).catch(error => {
          // Error in handleBlockLanding - silent fail to maintain game flow
        });
      });
    } catch (error) {
      // Error in handleTileLanded - silent fail to maintain game flow
    }
  };

  /**
   * Handle tile landing in a full column when merging is possible
   * Uses the special full column drop logic
   */
  const handleFullColumnTileLanded = async (row, col, value) => {
    try {
      // Play drop sound when tile lands (no vibration on drop)
      soundManager.playDropSound();
      
      // For now, use regular handleTileLanded since processFullColumnDrop may not exist
      // TODO: Implement full column drop logic if needed
      await handleTileLanded(row, col, value);
      
      /* COMMENTED OUT - processFullColumnDrop may not exist
      // Process the full column drop through the special game engine with animation support
      const result = await processFullColumnDrop(board, value, col, // showMergeResultAnimation // Removed this line
      );
      
      if (result.success) {
        const { 
          board: newBoard, 
          score: totalScore, 
          chainReactions: chainReactionCount = 0, 
          iterations = 0 
        } = result;
        
        // Calculate new values first
        const newHighestTile = Math.max(gameStats.highestTile, ...newBoard.flat());
        const newScore = totalScore > 0 ? score + totalScore : score;
        
        // Update game statistics
        setGameStats(prevStats => ({
          ...prevStats,
          tilesPlaced: prevStats.tilesPlaced + 1,
          mergesPerformed: prevStats.mergesPerformed + (totalScore > 0 ? 1 : 0),
          chainReactions: prevStats.chainReactions + chainReactionCount,
          highestTile: newHighestTile,
        }));
        
        // Show space fact for new milestone achievement
        if (newHighestTile > maxTileAchieved) {
          showFactForValue(newHighestTile);
          setMaxTileAchieved(newHighestTile);
        }
        
        // Update score
        if (totalScore > 0) {
          setScore(newScore);
        }
        
        // Update store after all state updates - defer to avoid render cycle issues
        setTimeout(() => {
          if (newHighestTile > lastHighestBlock) {
            updateHighestBlock(newHighestTile);
            setLastHighestBlock(newHighestTile);
          }
          
          if (totalScore > 0) {
            updateScore(newScore);
            setLastScore(newScore);
          }
        }, 0);

        // Update board state
        setBoard(newBoard);
        
        // Check for game over condition
        if (isGameOver(newBoard)) {
          setGameOver(true);
        }
      }
      */
    } catch (error) {
      // Error in handleFullColumnTileLanded
    }
  };

  // Reset game state
  const resetGame = () => {
    const newGrid = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    setBoard(newGrid);
    setGameOver(false);
    setScore(0);
    setFalling(null); // No falling tiles in 2048-style game
    setMergingTiles([]);
    setMergeAnimations([]);
    
    // Generate new preview blocks
    const newNextBlock = getRandomBlockValue();
    const newPreviewBlock = getRandomBlockValue();
    
    // Play Mars sound if Mars is generated
    if (newNextBlock === 4) {
      // soundManager.playMarsSound(); // Removed this line
    }
    if (newPreviewBlock === 4) {
      // soundManager.playMarsSound(); // Removed this line
    }
    
    setNextBlock(newNextBlock);
    setPreviewBlock(newPreviewBlock);
  };

  /**
   * Get current game difficulty based on board state
   */
  const getCurrentDifficulty = () => {
    const emptyCells = board.flat().filter(cell => cell === 0).length;
    const totalCells = ROWS * COLS;
    const fillPercentage = 1 - (emptyCells / totalCells);
    
    if (fillPercentage < 0.3) return 'easy';
    if (fillPercentage < 0.6) return 'medium';
    if (fillPercentage < 0.8) return 'hard';
    return 'extreme';
  };

  const showMergeResultAnimation = (resultRow, resultCol, newValue, mergingTilePositions, isChainReaction = false) => {
    
    // Create collision animation for the merge with planetary physics
    const collisionId = `collision-${Date.now()}-${resultRow}-${resultCol}`;
    
    // Calculate intermediate states for multi-tile merges
    const intermediateStates = [];
    if (mergingTilePositions.length > 2) {
      // For multi-tile merges, show progression: 2->4->8->16 etc.
      const startValue = mergingTilePositions[0].value;
      let currentValue = startValue;
      
      // Calculate progression steps
      while (currentValue < newValue) {
        currentValue *= 2;
        if (currentValue <= newValue) {
          intermediateStates.push({
            value: currentValue,
            duration: isChainReaction ? 200 : 400,
          });
        }
      }
      if (intermediateStates.length > 0) {
      }
    }
    
    // Phase 1: Pre-collision gravitational attraction with intermediate steps
    const attractionAnimations = mergingTilePositions.map((pos, index) => ({
      id: `attraction-${collisionId}-${index}`,
      row: pos.row,
      col: pos.col,
      value: pos.value,
      scale: new Animated.Value(1),
      opacity: new Animated.Value(1),
      gravityPull: new Animated.Value(0), // Gravitational deformation
      surfaceRipple: new Animated.Value(0), // Surface tension effects
      mergeGlow: new Animated.Value(0), // Glow as tiles prepare to merge
    }));
    
    // Phase 2: Intermediate merge states (show progression)
    const intermediateAnimations = intermediateStates.map((state, index) => ({
      id: `intermediate-${collisionId}-${index}`,
      row: resultRow,
      col: resultCol,
      value: state.value,
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
      duration: state.duration,
      stepGlow: new Animated.Value(0),
    }));
    
    // Phase 3: Final collision and result
    const finalResult = {
      id: `final-${collisionId}`,
      row: resultRow,
      col: resultCol,
      value: newValue,
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
      coreGlow: new Animated.Value(0),
      atmosphereExpand: new Animated.Value(0),
      finalExplosion: new Animated.Value(0),
    };

    // Add all animations to collision state
    const animationData = {
      id: collisionId,
      row: resultRow,
      col: resultCol,
      attractionAnimations,
      intermediateAnimations,
      finalResult,
      mergingPositions: mergingTilePositions,
      
      // Simple shockwave for visual impact
      shockwave: {
        scale: new Animated.Value(0),
        opacity: new Animated.Value(1),
      }
    };

    setCollisionAnimations(prev => [...prev, animationData]);

    // Execute step-by-step merge animation sequence
    const baseDuration = isChainReaction ? 300 : 600;
    
    // Step 1: Gravitational attraction (tiles glow and slightly grow)
    const attractionSequence = Animated.parallel(
      attractionAnimations.map((anim) => 
        Animated.parallel([
          Animated.timing(anim.scale, {
            toValue: 1.2, // Slight expansion
            duration: baseDuration * 0.3,
            useNativeDriver: false,
          }),
          Animated.timing(anim.mergeGlow, {
            toValue: 1,
            duration: baseDuration * 0.3,
            useNativeDriver: false,
          }),
          Animated.timing(anim.surfaceRipple, {
            toValue: 1,
            duration: baseDuration * 0.3,
            useNativeDriver: false,
          })
        ])
      )
    );

    // Step 2: Collision shockwave
    const shockwaveSequence = Animated.sequence([
      Animated.timing(animationData.shockwave.scale, {
        toValue: 2.5,
        duration: baseDuration * 0.4,
        useNativeDriver: false,
      }),
      Animated.timing(animationData.shockwave.opacity, {
        toValue: 0,
        duration: baseDuration * 0.2,
        useNativeDriver: false,
      })
    ]);

    // Step 3: Hide original tiles
    const hideOriginals = Animated.parallel(
      attractionAnimations.map((anim) => 
        Animated.timing(anim.opacity, {
          toValue: 0,
          duration: baseDuration * 0.2,
          useNativeDriver: false,
        })
      )
    );

    // Step 4: Show intermediate states in sequence
    const intermediateSequences = intermediateAnimations.map((anim, index) => 
      Animated.sequence([
        // Show intermediate result
        Animated.parallel([
          Animated.timing(anim.scale, {
            toValue: 1.3,
            duration: anim.duration * 0.4,
            useNativeDriver: false,
          }),
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: anim.duration * 0.3,
            useNativeDriver: false,
          }),
          Animated.timing(anim.stepGlow, {
            toValue: 1,
            duration: anim.duration * 0.3,
            useNativeDriver: false,
          })
        ]),
        // Hold briefly
        Animated.delay(anim.duration * 0.3),
        // Hide for next step
        Animated.parallel([
          Animated.timing(anim.scale, {
            toValue: 0.8,
            duration: anim.duration * 0.3,
            useNativeDriver: false,
          }),
          Animated.timing(anim.opacity, {
            toValue: 0,
            duration: anim.duration * 0.3,
            useNativeDriver: false,
          })
        ])
      ])
    );

    // Step 5: Final result emergence
    const finalSequence = Animated.sequence([
      // Explosive appearance
      Animated.parallel([
        Animated.timing(finalResult.scale, {
          toValue: 1.5,
          duration: baseDuration * 0.4,
          useNativeDriver: false,
        }),
        Animated.timing(finalResult.opacity, {
          toValue: 1,
          duration: baseDuration * 0.3,
          useNativeDriver: false,
        }),
        Animated.timing(finalResult.finalExplosion, {
          toValue: 1,
          duration: baseDuration * 0.4,
          useNativeDriver: false,
        })
      ]),
      // Settle to normal size
      Animated.parallel([
        Animated.timing(finalResult.scale, {
          toValue: 1,
          duration: baseDuration * 0.3,
          useNativeDriver: false,
        }),
        Animated.timing(finalResult.coreGlow, {
          toValue: 1,
          duration: baseDuration * 0.2,
          useNativeDriver: false,
        }),
        Animated.timing(finalResult.atmosphereExpand, {
          toValue: 1,
          duration: baseDuration * 0.2,
          useNativeDriver: false,
        })
      ]),
      // Final stabilization
      Animated.timing(finalResult.finalExplosion, {
        toValue: 0,
        duration: baseDuration * 0.2,
        useNativeDriver: false,
      })
    ]);

    // Execute full sequence
    Animated.sequence([
      attractionSequence,
      Animated.parallel([shockwaveSequence, hideOriginals]),
      Animated.sequence(intermediateSequences), // Show each intermediate step
      finalSequence
    ]).start(() => {
      // Remove animation after completion
      setCollisionAnimations(prev => prev.filter(anim => anim.id !== collisionId));
    });
  };


  // UI rendering
  return (
    <View style={[styles.container, styles.containerDark]}>
      {/* Deep Space Background */}
      <SpaceBackground />
      
      <GameHeader 
        score={score}
        record={highScore || 0}
        onPause={handlePause}
      />
      
      {/* Premium Game Board Container */}
      <View style={styles.gameBoardContainer}>
        <View
          ref={boardRef}
          onLayout={e => setBoardLeft(e.nativeEvent.layout.x)}
          style={styles.gameBoard}
        >
          <GameGrid
            board={board}
            falling={falling}
            mergingTiles={mergingTiles}
            mergeResult={mergeResult}
            enhancedMergeAnimations={mergeAnimations || []}
            onRowTap={handleRowTap}
            gameOver={gameOver}
            showGuide={showGuide}
            collisionAnimations={collisionAnimations}
          />
        </View>
      </View>
      
      {/* Next Block Preview - Centered at Bottom with Drop Space */}
      <View style={styles.nextBlockArea}>
        <Text style={styles.nextBlockLabel}>
          Next
        </Text>
        <View style={styles.nextBlockContainer}>
          {nextBlock >= 64 ? ( // All values 64+ are planets now
            <PlanetTile 
              value={nextBlock} 
              isOrbiting={true}
              orbitSpeed={0.5}
            />
          ) : (
            <PlanetTile 
              value={nextBlock} 
              isOrbiting={true}
              orbitSpeed={0.5}
            />
          )}
        </View>
      </View>
    
      
      


      {/* Game Over Overlay */}
      {gameOver && (
        <View style={styles.overlay}>
          <Text style={styles.gameOverText}>Game Over!</Text>
          <Text style={styles.finalScoreText}>
            Final Score: {score}
          </Text>
          <Text style={styles.statsText}>
            Tiles Placed: {gameStats.tilesPlaced} | 
            Chain Reactions: {gameStats.chainReactions}
          </Text>
          <Text style={styles.difficultyText}>
            Difficulty: {getCurrentDifficulty()}
          </Text>
          <TouchableOpacity style={styles.restartBtn} onPress={resetGame}>
            <Text style={styles.restartText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Pause Modal */}
      <PauseModal
        visible={isPaused}
        onResume={handleResume}
        onHome={handleHome}
        onClose={handleClosePause}
        onRestart={handleRestart}
      />
      
      {/* Interactive Space Facts */}
      <SpaceFacts 
        currentValue={currentFactValue}
        isVisible={showSpaceFact}
        onClose={hideSpaceFact}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerDark: {
    backgroundColor: 'rgba(5, 5, 15, 0.95)', // Deep space background
  },
  containerLight: {
    backgroundColor: '#f8f9fa',
  },
  separator: {
    height: 2,
    backgroundColor: '#444',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 1,
  },
  gameBoardContainer: {
    marginHorizontal: 12,
    marginTop: 0,
    marginBottom: 20, // Reduced to make more room for preview
    borderRadius: 25,
    backgroundColor: 'rgba(10, 10, 26, 0.8)', // More transparent for space feel
    padding: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 0, // Remove border for cleaner space feel
  },
  
  gameBoard: {
    borderRadius: 25,
    marginBottom: 20, // Much less margin to create space
    backgroundColor: 'transparent', // Transparent for space feel
    padding: 6,
    // Remove shadows and borders for floating space feel
  },
  
  gameGridWrapper: {
    backgroundColor: 'transparent', // Remove background for space feel
    borderRadius: 25,
    padding: 4, // Minimal padding
    margin: 2, // Minimal margin
    // Remove all shadows and borders for floating space feel
  },
  
  nextBlockArea: {
    position: 'absolute',
    bottom: 40, // More space from bottom
    left: '50%',
    transform: [{ translateX: -80 }],
    alignItems: 'center',
    backgroundColor: 'rgba(15, 15, 35, 0.9)', // Darker space background
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 25,
    width: 160,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 }, // Glow effect instead of shadow
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.5)', // Cosmic glow border
    zIndex: 100,
  },
  
  nextBlockLabel: {
    color: '#B0C4DE', // Lighter cosmic color
    fontSize: FONT_SIZES.SMALL * 0.8,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 1.5,
    textAlign: 'center',
    textShadowColor: 'rgba(74, 144, 226, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8, // Glow effect
  },
  
  nextBlockContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(5, 10, 20, 0.8)', // Very dark space background
    borderRadius: 18,
    padding: 10, // Reduced from 15
    transform: [{ scale: 1.0 }], // Reduced from 1.2 to prevent overlap
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 }, // Reduced from 6
    shadowOpacity: 0.3, // Reduced from 0.4
    shadowRadius: 8, // Reduced from 12
    elevation: 8, // Reduced from 10
    borderWidth: 1.5, // Reduced from 2
    borderColor: 'rgba(74, 144, 226, 0.25)', // Reduced from 0.3
  },
  
  // Enhanced tile styles
  starsContainer: {
    position: 'absolute',
    top: -CELL_SIZE * 0.15,
    left: -CELL_SIZE * 0.15,
    right: -CELL_SIZE * 0.15,
    bottom: -CELL_SIZE * 0.15,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
  starIcon: {
    fontSize: Math.max(12, Math.min(20, CELL_SIZE * 0.3)),
    color: '#ffd700', // Gold color for stars
  },
  starTop: {
    position: 'absolute',
    top: -Math.max(6, CELL_SIZE * 0.08),
  },
  starBottom: {
    position: 'absolute',
    bottom: -Math.max(6, CELL_SIZE * 0.08),
  },
  crownIcon: {
    fontSize: Math.max(16, Math.min(24, CELL_SIZE * 0.5)),
    position: 'absolute',
    top: -Math.max(8, CELL_SIZE * 0.08),
    left: Math.max(12, CELL_SIZE * 0.35),
    zIndex: 1,
  },
  milestoneText: {
    color: '#ffd700', // Gold color for milestone text
    fontWeight: 'bold',
  },
  crownedText: {
    color: '#ffd700', // Gold color for crowned text
    fontWeight: 'bold',
  },
  tileContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  debugText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 10,
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
    padding: 20,
  },
  

  
  // Game over screen styles
  gameOverText: {
    color: '#ff6b6b',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  finalScoreText: {
    color: '#ffd700',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  
  // Stats and info styles
  statsText: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  difficultyText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  
  // Button styles
  restartBtn: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginVertical: 5,
    minWidth: 150,
  },
  restartText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  continueBtn: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginVertical: 5,
    minWidth: 150,
  },
  continueText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  boardContainer: {
    flex: 1,
    justifyContent: 'center', // Better centering
    alignItems: 'center',
    paddingHorizontal: 15, // Reduced padding for better spacing
    paddingTop: 5, // Minimal top padding
    paddingBottom: 85, // Reduced to prevent overlap with preview
  },

});

export default DropNumberBoard; 