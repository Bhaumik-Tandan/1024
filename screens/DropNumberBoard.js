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
  Platform,
  Easing, // Add Easing import
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import soundManager from '../utils/soundManager';

import GameHeader from '../components/GameHeader';
import GameGrid from '../components/GameGrid';
import PauseModal from '../components/PauseModal';
import { EnhancedSpaceBackground } from '../components/EnhancedSpaceBackground';
import PlanetTile from '../components/PlanetTile';
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
  GAME_RULES,
  getBoardConfig 
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
  PLANET_TYPES,
  screenWidth, // Import screenWidth for iPad detection
  getCurrentGridConfig
} from '../components/constants';
import useGameStore from '../store/gameStore';
import { vibrateOnTouch } from '../utils/vibration';

// PERFORMANCE: Determine device capability and adjust background intensity
const getDevicePerformanceLevel = () => {
  const { width, height } = Dimensions.get('window');
  const pixelDensity = width * height;
  
  // Check if device is likely to be lower performance
  if (pixelDensity < 400000) { // Very small screens
    return 'low';
  } else if (pixelDensity < 800000 || width < 768) { // Medium screens or phones
    return 'medium';
  } else { // Large screens/tablets
    return 'high';
  }
};

// PERFORMANCE: Memoized background component
const OptimizedBackground = React.memo(({ showMovingStars }) => {
  const intensity = getDevicePerformanceLevel();
  return (
    <EnhancedSpaceBackground 
      showMovingStars={showMovingStars}
      intensity={intensity}
    />
  );
});

// PERFORMANCE: Memoized header component
const OptimizedHeader = React.memo(({ score, record, onPause }) => (
  <GameHeader 
    score={score}
    record={record || 0}
    onPause={onPause}
  />
));

// PERFORMANCE: Memoized next block component
const OptimizedNextBlock = React.memo(({ nextBlock }) => (
  <View style={styles.nextBlockArea}>
    <Text style={styles.nextBlockLabel}>Next</Text>
    <View style={styles.nextBlockContainer}>
      <PlanetTile 
        value={nextBlock}
        size={screenWidth >= 768 ? CELL_SIZE * 1.1 : CELL_SIZE * 0.9}
        isOrbiting={true}
        orbitSpeed={0.5}
      />
    </View>
  </View>
));

/**
 * Main game component with enhanced architecture
 * Uses centralized game rules and improved state management
 */
const DropNumberBoard = ({ navigation, route }) => {
  // Get initial grid configuration more safely
  const initialGridConfig = getCurrentGridConfig();
  const [gridConfig, setGridConfig] = useState(initialGridConfig);
  
  // Core game state - use dynamic grid size
  const [board, setBoard] = useState(() => 
    Array.from({ length: initialGridConfig.ROWS }, () => Array(initialGridConfig.COLS).fill(0))
  );
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
  
  // Handle orientation changes and dynamic grid resizing
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      const newGridConfig = getCurrentGridConfig();
      
      // Only update if grid configuration actually changed
      if (newGridConfig.ROWS !== gridConfig.ROWS || newGridConfig.COLS !== gridConfig.COLS) {
        setGridConfig(newGridConfig);
        
        // Update board size, preserving existing tiles where possible
        setBoard(prevBoard => {
          const newBoard = Array.from({ length: newGridConfig.ROWS }, () => 
            Array(newGridConfig.COLS).fill(0)
          );
          
          // Copy existing tiles to new board (top-left aligned)
          for (let row = 0; row < Math.min(prevBoard.length, newGridConfig.ROWS); row++) {
            for (let col = 0; col < Math.min(prevBoard[row].length, newGridConfig.COLS); col++) {
              newBoard[row][col] = prevBoard[row][col];
            }
          }
          
          return newBoard;
        });
        
        // Clear any falling animations that might be out of bounds
        clearFalling();
        clearMergeAnimations();
      }
    });

    return () => subscription?.remove();
  }, [gridConfig, clearFalling, clearMergeAnimations]);

  // Use the animation manager
  const {
    falling,
    setFalling, // Add back setFalling since it's used in the code
    mergingTiles,
    mergeResult,
    mergeAnimations,
    collisionEffects, // Add collision effects
    energyBursts, // Add energy bursts
    startFallingAnimation,
    updateFallingCol,
    fastDropAnimation,
    clearFalling,
    createMergeAnimation,
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

  // PERFORMANCE: Increased auto-save interval for better performance
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
      }, 15000); // Save every 15 seconds instead of 10 for better performance

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
        soundManager.playSoundIfEnabled('gameOver');
        return;
      }
      
      // Create static falling tile that starts from bottom (original gravity)
      const fallingTile = {
        col: spawnCol,
        value: nextBlock,
        anim: new Animated.Value(0), // Start at bottom row position
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
   * Handle user tapping anywhere on screen - uses measured column detection
   * Always drops from bottom - tap X position determines the column
   */
  const handleScreenTap = (event) => {
    // Touch sensitivity control - prevent rapid successive taps
    if (!isTouchEnabled) {
      return;
    }
    
    // Validate tap conditions
    if (!falling || falling.fastDrop || gameOver || isPaused) {
      return;
    }
    
    // Emergency cleanup if animations are stuck - more aggressive
    if (mergeAnimations.length > 5) {
      clearMergeAnimations();
    }
    
    // Additional emergency cleanup for any stuck animations over 200ms old
    const now = Date.now();
    const stuckAnimations = mergeAnimations.filter(anim => 
      now - (anim.createdAt || 0) > 200
    );
    if (stuckAnimations.length > 0) {
      clearMergeAnimations();
    }
    
    // Use the pre-calculated column from enhanced grid detection
    const targetColumn = event.nativeEvent.detectedColumn ?? 0; // Default to column 0 if detection fails
    
    // Use the existing logic but with the accurately detected column
    handleRowTap(0, targetColumn); // Row doesn't matter, only column
  };

  /**
   * Handle user tapping any cell in a column to drop the tile in that column
   * Always drops from bottom - tap only selects the column, not the row
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
    
    // Use the column from the tap - ignore the row (always drop from bottom)
    const col = targetCol !== null ? targetCol : falling.col;
    
    // Column-based targeting - find the first available empty cell in the column (from top)
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
    
    // Play drop sound immediately when user taps
    vibrateOnTouch().catch(err => {
      // Drop sound error
    });
    
    // Disable touch temporarily to prevent rapid successive taps
    setIsTouchEnabled(false);
    
    // Clear any existing timeout
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }
    
    // PERFORMANCE: Increased debounce delay for better touch handling
    touchTimeoutRef.current = setTimeout(() => {
      setIsTouchEnabled(true);
    }, 400); // 400ms debounce delay instead of 300ms
    
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
    
    // Animate from BELOW THE GRID to target position (ball rises from below)
    const startPosition = (ROWS) * (CELL_SIZE + CELL_MARGIN); // Start from below the grid
    const targetRowPosition = (landingRow + 1) * (CELL_SIZE + CELL_MARGIN); // Target position (ball top touches tile bottom)
    
    // Start the animation from below the grid
    falling.anim.setValue(startPosition);
    Animated.timing(falling.anim, {
      toValue: targetRowPosition,
      duration: GAME_CONFIG.TIMING.COSMIC_DROP_DURATION,
      useNativeDriver: false,
      easing: Easing.out(Easing.quad),
    }).start();
    
    // Handle landing after animation completes
    setTimeout(async () => {
      if (canMergeInFull) {
        // Special handling for full column merge
        await handleFullColumnTileLanded(landingRow, landingCol, tileValueToDrop);
      } else {
        // Normal tile landing
        handleTileLanded(landingRow, landingCol, tileValueToDrop);
      }
      clearFalling();
    }, GAME_CONFIG.TIMING.COSMIC_DROP_DURATION);
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
      // Note: Drop sound is now played immediately when user taps, not when tile lands
      
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
          soundManager.playSoundIfEnabled('gameOver');
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
      // Note: Drop sound is now played immediately when user taps, not when tile lands
      
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
          soundManager.playSoundIfEnabled('gameOver');
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
    setBoard(Array.from({ length: gridConfig.ROWS }, () => Array(gridConfig.COLS).fill(0)));
    setScore(0);
    setGameOver(false);
    setNextBlock(getRandomBlockValue());
    setPreviewBlock(getRandomBlockValue());
    setGameStats({
      tilesPlaced: 0,
      mergesPerformed: 0,
      chainReactions: 0,
      highestTile: 0,
      startTime: Date.now(),
    });
    
    // Clear all animations
    clearFalling();
    clearMergeAnimations();
    
    // Floor system reset
    setCurrentMinSpawn(2);
    setFloorLevel(1);
    setMaxTileAchieved(0);
    
    // Clear saved game
    clearSavedGame();
    
    // Enable touch
    setIsTouchEnabled(true);
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
      <OptimizedBackground showMovingStars={true} />
      
      <OptimizedHeader 
        score={score}
        record={highScore}
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
          collisionEffects={collisionEffects} // Pass collision effects
          energyBursts={energyBursts} // Pass energy bursts
          onRowTap={handleRowTap}
          onScreenTap={handleScreenTap}
          gameOver={gameOver}
          showGuide={false}
          panHandlers={panResponder.panHandlers}
          isTouchEnabled={isTouchEnabled}
        />
      </View>
      
      <OptimizedNextBlock nextBlock={nextBlock} />

      {/* Game Over Overlay */}
      {gameOver && (
        <View style={styles.overlay}>
          <View style={styles.gameOverContainer}>
            {/* Animated Game Over Title */}
            <View style={styles.gameOverHeader}>
              <Text style={styles.gameOverText}>MISSION ENDED</Text>
              <View style={styles.gameOverUnderline} />
            </View>
            
            {/* Score Section */}
            <View style={styles.scoreSection}>
              <Text style={styles.finalScoreLabel}>FINAL SCORE</Text>
              <Text style={styles.finalScoreText}>{score.toLocaleString()}</Text>
              {score > highScore && (
                <Text style={styles.newRecordText}>NEW RECORD!</Text>
              )}
            </View>
            
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{gameStats.tilesPlaced}</Text>
                <Text style={styles.statLabel}>Tiles Placed</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{gameStats.chainReactions}</Text>
                <Text style={styles.statLabel}>Chain Reactions</Text>
              </View>
            </View>
            
            {/* Action Button */}
            <TouchableOpacity style={styles.restartBtn} onPress={resetGame}>
              <Text style={styles.restartText}>PLAY AGAIN</Text>
            </TouchableOpacity>
          </View>
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
    // Ensure full height usage on iPad
    minHeight: '100%',
    ...(screenWidth >= 768 && {
      height: '100%',
    }),
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
    position: 'absolute',
    bottom: screenWidth >= 768 ? 80 : 40, // More bottom spacing for iPad since grid is smaller
    left: '50%',
    transform: [{ translateX: screenWidth >= 768 ? -120 : -80 }], // Larger transform for iPad
    alignItems: 'center',
    backgroundColor: 'rgba(26, 42, 78, 0.9)',
    borderRadius: screenWidth >= 768 ? 25 : 20, // Larger border radius for iPad
    paddingVertical: screenWidth >= 768 ? 20 : 12, // Even more padding for iPad
    paddingHorizontal: screenWidth >= 768 ? 30 : 20, // Larger horizontal padding for iPad
    width: screenWidth >= 768 ? 240 : 160, // Much wider for iPad
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: screenWidth >= 768 ? 20 : 15, // Larger shadow for iPad
    elevation: 12,
    borderWidth: screenWidth >= 768 ? 2 : 1, // Thicker border for iPad
    borderColor: 'rgba(74, 144, 226, 0.4)',
    zIndex: 100,
  },
  nextBlockLabel: {
    color: '#B0C4DE',
    fontSize: screenWidth >= 768 ? 18 : 14, // Larger font for iPad
    fontWeight: '600',
    marginBottom: screenWidth >= 768 ? 12 : 8, // Larger margin for iPad
    letterSpacing: 1,
    textAlign: 'center',
    textShadowColor: 'rgba(74, 144, 226, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  nextBlockContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(5, 10, 20, 0.8)',
    borderRadius: screenWidth >= 768 ? 20 : 15, // Larger border radius for iPad
    padding: screenWidth >= 768 ? 15 : 8, // Larger padding for iPad
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: screenWidth >= 768 ? 8 : 6, // Larger shadow for iPad
    elevation: 6,
    borderWidth: screenWidth >= 768 ? 2 : 1, // Thicker border for iPad
    borderColor: 'rgba(74, 144, 226, 0.2)',
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
  gameOverContainer: {
    backgroundColor: 'rgba(30, 30, 40, 0.98)',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    width: '90%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  gameOverHeader: {
    alignItems: 'center',
    marginBottom: 25,
  },
  gameOverText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 1,
  },
  gameOverUnderline: {
    width: '50%',
    height: 2,
    backgroundColor: '#666',
    borderRadius: 1,
    marginTop: 8,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  finalScoreLabel: {
    color: '#999',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  finalScoreText: {
    color: '#ffd700',
    fontSize: 42,
    fontWeight: '700',
  },
  newRecordText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#ffd700',
    fontSize: 24,
    fontWeight: '600',
  },
  statLabel: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#555',
  },
  
  // Button styles
  restartBtn: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    marginVertical: 5,
    minWidth: 180,
  },
  restartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
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