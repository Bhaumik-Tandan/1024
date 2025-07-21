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
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import GameHeader from '../components/GameHeader';
import GameGrid from '../components/GameGrid';
import PauseModal from '../components/PauseModal';
import { useAnimationManager } from '../components/AnimationManager';
import { 
  getRandomBlockValue, 
  handleBlockLanding,
  applyGravity,
  processFullColumnDrop 
} from '../components/GameLogic';
import { 
  GameValidator, 
  GAME_CONFIG, 
  GAME_RULES 
} from '../components/GameRules';
import { 
  ROWS, 
  COLS, 
  CELL_SIZE, 
  CELL_MARGIN, 
  COLORS, 
  getCellLeft, 
  getCellTop,
  ANIMATION_CONFIG,
  getTextColor,
  getTileStyle,
  isMilestoneTile,
  getTileDecoration
} from '../components/constants';
import useGameStore from '../store/gameStore';
import { vibrateOnTouch } from '../utils/vibration';

/**
 * Main game component with enhanced architecture
 * Uses centralized game rules and improved state management
 */
const DropNumberBoard = ({ navigation, route }) => {
  // Core game state
  const [board, setBoard] = useState(() => Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
  const [score, setScore] = useState(0);
  const [nextBlock, setNextBlock] = useState(() => getRandomBlockValue());
  const [previewBlock, setPreviewBlock] = useState(() => getRandomBlockValue());
  
  // Remove debug logging
  const [gameOver, setGameOver] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  
  // Touch sensitivity control
  const [isTouchEnabled, setIsTouchEnabled] = useState(true);
  const touchTimeoutRef = useRef(null);
  
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
    mergeResult,
    mergeAnimations,
    liquidBlobs, // Add liquid blobs
    updateFallingCol,
    fastDropAnimation,
    clearFalling,
    showMergeResultAnimation,
    clearMergeAnimations,
  } = useAnimationManager();

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

  // Auto-save game state periodically
  useEffect(() => {
    if (!gameOver && !isPaused) {
      const autoSaveInterval = setInterval(() => {
        const gameState = {
          board,
          score,
          nextBlock,
          previewBlock,
          gameStats,
        };
        saveGame(gameState);
      }, 10000); // Save every 10 seconds

      return () => clearInterval(autoSaveInterval);
    }
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
   * Game loop: Spawn new tiles automatically
   * Uses timing configuration from GameRules
   */
  useEffect(() => {
    if (!falling && !gameOver && !isPaused) {
      const spawnCol = Math.floor(COLS / 2); // Center column as per rules
      
      // Check for game over condition - check if top row is full
      if (GameValidator.isGameOver(board)) {
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

  /**
   * Cleanup touch timeout on component unmount
   */
  useEffect(() => {
    return () => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };
  }, []);

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
    
    // Validate tap conditions
    if (!falling || falling.fastDrop || gameOver || isPaused) {
      return;
    }
    
    // If no column specified, use the falling tile's current column (old behavior)
    const col = targetCol !== null ? targetCol : falling.col;
    
    // Column-based targeting - find the first available empty cell in the tapped column
    let landingCol = col;
    let landingRow = -1;
    
    // Search from top to bottom for the first empty cell in the column
    for (let row = 0; row < ROWS; row++) {
      if (board[row][landingCol] === 0) {
        landingRow = row;
        break;
      }
    }
    
    // If no empty cell found, check if we can merge in the full column
    let canMergeInFull = null;
    if (landingRow === -1) {
      canMergeInFull = canMergeInFullColumn(board, landingCol, falling.value);
      if (!canMergeInFull) {
        return; // Column is full and no merge possible
      }
      // Set landing row to the bottom for the merge case
      landingRow = canMergeInFull.mergeRow;
    }
    
    // Disable touch temporarily to prevent rapid successive taps
    setIsTouchEnabled(false);
    
    // Clear any existing timeout
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }
    
    // Re-enable touch after a delay (touch debounce)
    touchTimeoutRef.current = setTimeout(() => {
      setIsTouchEnabled(true);
    }, 300); // 300ms debounce delay
    
    // Hide guide overlay permanently
    setShowGuide(false);
    
    // Capture the current nextBlock value before updating it
    const tileValueToDrop = nextBlock;
    
    // Update next block immediately when user taps
    setNextBlock(previewBlock);
    setPreviewBlock(getRandomBlockValue());
    
    // Update falling tile with target position and start animation
    const updatedFalling = {
      ...falling,
      col: landingCol, // Update the column
      toRow: landingRow,
      value: tileValueToDrop, // Use the captured value to ensure visual consistency
      fastDrop: true,
      static: false,
      inPreview: false // Remove preview mode when user taps
    };
    setFalling(updatedFalling);
    
    // Animate from current position to target cell (both horizontal and vertical movement)
    const startPosition = (ROWS - 1) * (CELL_SIZE + CELL_MARGIN); // Bottom position
    const endPosition = landingRow * (CELL_SIZE + CELL_MARGIN); // Target position
    

    
    falling.anim.setValue(startPosition);
    Animated.timing(falling.anim, {
      toValue: endPosition,
      duration: GAME_CONFIG.TIMING.FAST_DROP_DURATION,
      useNativeDriver: false,
    }).start();
    
    // Handle landing after animation completes
    const fastDropTimer = setTimeout(async () => {
      if (canMergeInFull) {
        // Special handling for full column merge
        await handleFullColumnTileLanded(landingRow, landingCol, tileValueToDrop);
      } else {
        // Normal tile landing
        handleTileLanded(landingRow, landingCol, tileValueToDrop);
      }
      clearFalling();
    }, GAME_CONFIG.TIMING.FAST_DROP_DURATION);
    
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
   * Uses the enhanced game engine with chain reactions and scoring
   */
  const handleTileLanded = (row, col, value) => {
    try {
      // Always play drop sound when a tile lands
      vibrateOnTouch().catch(err => {
        // Drop sound error
      });
      
      // Check if the newly landed tile is touching other tiles for additional vibration
      const isTouchingTiles = hasAdjacentTiles(board, row, col);
      
      // Process the tile landing through the game engine
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
        if (GameValidator.isGameOver(newBoard)) {
          setGameOver(true);
        }
      }).catch(error => {
        // Error processing tile landing
      });
    } catch (error) {
      // Error in handleTileLanded
    }
  };

  /**
   * Handle tile landing in a full column when merging is possible
   * Uses the special full column drop logic
   */
  const handleFullColumnTileLanded = async (row, col, value) => {
    try {
      // Always play drop sound when a tile lands
      vibrateOnTouch().catch(err => {
        // Drop sound error
      });
      
      // Process the full column drop through the special game engine with animation support
      const result = await processFullColumnDrop(board, value, col, showMergeResultAnimation);
      
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
        
        // Update board state
        setBoard(newBoard);
        
        // Update max tile achieved
        const currentMaxTile = Math.max(...newBoard.flat());
        if (currentMaxTile > maxTileAchieved) {
          setMaxTileAchieved(currentMaxTile);
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
        
        // Check for game over condition
        if (GameValidator.isGameOver(newBoard)) {
          setGameOver(true);
        }
      } else {
        // Full column drop failed, should not happen if canMergeInFullColumn worked correctly
        // Error handled silently
      }
    } catch (error) {
      // Error in handleFullColumnTileLanded - handled silently
    }
  };

  /**
   * Reset game to initial state
   * Uses GameHelpers for consistent initialization
   */
  const resetGame = () => {
    setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
    setScore(0);
    setGameOver(false);
    setNextBlock(getRandomBlockValue());
    setPreviewBlock(getRandomBlockValue());
    setShowGuide(true);
    clearFalling();
    clearMergeAnimations();
    
    // Reset touch sensitivity
    setIsTouchEnabled(true);
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }
    
    // Reset game statistics
    setGameStats({
      tilesPlaced: 0,
      mergesPerformed: 0,
      chainReactions: 0,
      highestTile: 0,
      startTime: Date.now(),
    });
    
    // Reset tracking variables for store sync
    setLastScore(0);
    setLastHighestBlock(0);
    
    // Clear saved game when starting fresh
    clearSavedGame();
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

  // UI rendering
  return (
    <View style={[styles.container, styles.containerDark]}>
      <GameHeader 
        score={score}
        record={highScore || 0}
        onPause={handlePause}
      />
      
      <View
        ref={boardRef}
        onLayout={e => setBoardLeft(e.nativeEvent.layout.x)}
      >
        <GameGrid
          board={board}
          falling={falling}
          mergingTiles={mergingTiles}
          mergeResult={mergeResult}
          mergeAnimations={mergeAnimations}
          liquidBlobs={liquidBlobs}
          onRowTap={handleRowTap}
          gameOver={gameOver}
          showGuide={showGuide}
          panHandlers={panResponder.panHandlers}
          isTouchEnabled={isTouchEnabled}
        />
      </View>
      
      {/* Next Block - centered and styled like tiles */}
      <View style={styles.nextBlockArea}>
        <Text style={styles.nextBlockLabel}>NEXT</Text>
        <View style={styles.nextBlockContainer}>
          <View style={[
            styles.nextBlockTile,
            getTileStyle(nextBlock),
          ]}>
            {/* Special effects for next block if it's a milestone */}
            {getTileDecoration(nextBlock)?.stars && (
              <View style={styles.starsContainer}>
                <Text style={styles.starIcon}>⭐</Text>
                <Text style={[styles.starIcon, styles.starTop]}>⭐</Text>
                <Text style={[styles.starIcon, styles.starBottom]}>⭐</Text>
              </View>
            )}
            
            <View style={styles.tileContent}>
              {getTileDecoration(nextBlock)?.type === 'crown' && (
                <Text style={styles.crownIcon}>👑</Text>
              )}
              
              <Text style={[
                styles.nextBlockValue,
                {
                  color: getTextColor(nextBlock),
                },
                isMilestoneTile(nextBlock) && styles.milestoneText,
                getTileDecoration(nextBlock)?.type === 'crown' && styles.crownedText
              ]}>
                {nextBlock >= 1000 ? `${(nextBlock / 1000).toFixed(nextBlock % 1000 === 0 ? 0 : 1)}K` : nextBlock}
              </Text>
            </View>
          </View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
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
  nextBlockArea: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#444444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  },
  nextBlockLabel: {
    color: '#cccccc',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 10,
    textAlign: 'center',
  },
  nextBlockContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBlockTile: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'transparent',
    // Add explicit styling for better visibility on iPad
    minWidth: 60,
    minHeight: 60,
    maxWidth: 100,
    maxHeight: 100,
  },
  nextBlockValue: {
    fontSize: Math.max(14, Math.min(24, CELL_SIZE / 3)),
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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

});

export default DropNumberBoard; 