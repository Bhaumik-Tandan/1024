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

import GameHeader from '../components/GameHeader';
import GameGrid from '../components/GameGrid';
import PauseModal from '../components/PauseModal';
import { useAnimationManager } from '../components/AnimationManager';
import { 
  getRandomBlockValue, 
  handleBlockLanding,
  applyGravity 
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
  getTextColor
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
  const [record, setRecord] = useState(0);
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

  const boardRef = useRef(null);
  const [boardLeft, setBoardLeft] = useState(0);
  
  // Zustand store
  const { updateScore, updateHighestBlock, darkMode, saveGame, loadSavedGame, clearSavedGame } = useGameStore();
  
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

  // Update Zustand store when score changes
  useEffect(() => {
    if (score !== lastScore) {
      updateScore(score);
      setLastScore(score);
    }
  }, [score, lastScore, updateScore]);

  // Update Zustand store when highest block changes
  useEffect(() => {
    if (gameStats.highestTile !== lastHighestBlock) {
      updateHighestBlock(gameStats.highestTile);
      setLastHighestBlock(gameStats.highestTile);
    }
  }, [gameStats.highestTile, lastHighestBlock, updateHighestBlock]);

  // Load saved game if resuming
  useEffect(() => {
    if (route.params?.resume) {
      const savedGame = loadSavedGame();
      if (savedGame) {
        setBoard(savedGame.board);
        setScore(savedGame.score);
        setRecord(savedGame.record);
        setNextBlock(savedGame.nextBlock);
        setPreviewBlock(savedGame.previewBlock);
        setGameStats(savedGame.gameStats);
        setGameOver(false);
        setHasWon(false);
        clearFalling();
        clearMergeAnimations();
      }
    }
  }, [route.params?.resume, loadSavedGame, clearFalling, clearMergeAnimations]);

  // Auto-save game state periodically
  useEffect(() => {
    if (!gameOver && !hasWon && !isPaused) {
      const autoSaveInterval = setInterval(() => {
        const gameState = {
          board,
          score,
          record,
          nextBlock,
          previewBlock,
          gameStats,
        };
        saveGame(gameState);
      }, 10000); // Save every 10 seconds

      return () => clearInterval(autoSaveInterval);
    }
  }, [board, score, record, nextBlock, previewBlock, gameStats, gameOver, hasWon, isPaused, saveGame]);

  // Pause modal handlers
  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };
  
  const handleRestart=()=>{
    setBoard(() => Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
    clearSavedGame();
  }

  const handleHome = () => {
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
      
      setFalling(fallingTile);
      // Don't automatically show guide for every new tile
      // setShowGuide(true); // Removed this line
    }
    // eslint-disable-next-line
  }, [falling, gameOver, board]);

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
    if (!falling || falling.fastDrop || gameOver || hasWon || isPaused) {
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
    
    // If no empty cell found in the column, return (column is full)
    if (landingRow === -1) {
      return; // Column is full, can't place tile
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
    
    // Update next block immediately when user taps
    setNextBlock(previewBlock);
    setPreviewBlock(getRandomBlockValue());
    
    // Update falling tile with target position and start animation
    const updatedFalling = {
      ...falling,
      col: landingCol, // Update the column
      toRow: landingRow,
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
    const fastDropTimer = setTimeout(() => {
      handleTileLanded(landingRow, landingCol, falling.value);
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
   * Handle tile landing and process all game logic
   * Uses the enhanced game engine with chain reactions and scoring
   */
  const handleTileLanded = (row, col, value) => {
    try {
      // Check if the newly landed tile is touching other tiles
      const isTouchingTiles = hasAdjacentTiles(board, row, col);
      
      // Play touch sound if the new block touches existing tiles
      if (isTouchingTiles) {
        vibrateOnTouch().catch(err => {
          // Touch sound/vibration error
        });
      }
      
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
        
        // Update game statistics
        setGameStats(prevStats => {
          const newHighestTile = Math.max(prevStats.highestTile, ...newBoard.flat());
          
          return {
            ...prevStats,
            tilesPlaced: prevStats.tilesPlaced + 1,
            mergesPerformed: prevStats.mergesPerformed + (totalScore > 0 ? 1 : 0),
            chainReactions: prevStats.chainReactions + chainReactionCount,
            highestTile: newHighestTile,
          };
        });
        
        // Update score and record
        if (totalScore > 0) {
          setScore(currentScore => {
            const newScore = currentScore + totalScore;
            if (newScore > record) {
              setRecord(newScore);
            }
            return newScore;
          });
        }

        // Update board state
        setBoard(newBoard);
        
        // No win condition - infinite game continues!
        
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
    <View style={[styles.container, darkMode ? styles.containerDark : styles.containerLight]}>
      <GameHeader 
        score={score}
        record={record}
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
          darkMode={darkMode}
        />
      </View>
      
      {/* Next Block - centered and styled like tiles */}
      <View style={styles.nextBlockContainer}>
        <View style={[
          styles.nextBlockTile,
          {
            backgroundColor: COLORS[nextBlock] || COLORS[0],
          }
        ]}>
          <Text style={[
            styles.nextBlockValue,
            {
              color: getTextColor(nextBlock),
            }
          ]}>{nextBlock}</Text>
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
    backgroundColor: '#ffffff',
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
    marginTop: 40,
    paddingVertical: 25,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#555',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  },
  nextBlockContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
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
  },
  nextBlockValue: {
    fontSize: Math.max(14, CELL_SIZE / 3),
    fontWeight: 'bold',
    textAlign: 'center',
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
  
  // Win screen styles
  winText: {
    color: '#ffd700',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  winSubtext: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
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