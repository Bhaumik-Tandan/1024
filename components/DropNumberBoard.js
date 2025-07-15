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

import GameHeader from './GameHeader';
import GameGrid from './GameGrid';
import { useAnimationManager } from './AnimationManager';
import { 
  getRandomBlockValue, 
  handleBlockLanding,
  applyGravity 
} from './GameLogic';
import { 
  GameValidator, 
  GameHelpers, 
  GAME_CONFIG, 
  GAME_RULES 
} from './GameRules';
import { 
  ROWS, 
  COLS, 
  CELL_SIZE, 
  CELL_MARGIN, 
  COLORS, 
  getCellLeft, 
  getCellTop,
  ANIMATION_CONFIG 
} from './constants';

/**
 * Main game component using modern React patterns and centralized rules
 */
const DropNumberBoard = () => {
  // Core game state
  const [board, setBoard] = useState(() => GameHelpers.createEmptyBoard());
  const [score, setScore] = useState(0);
  const [record, setRecord] = useState(0);
  const [nextBlock, setNextBlock] = useState(() => getRandomBlockValue());
  const [gameOver, setGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  
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



  /**
   * Game loop: Spawn new tiles automatically
   * Uses timing configuration from GameRules
   */
  useEffect(() => {
    if (!falling && !gameOver && !hasWon) {
      const spawnCol = Math.floor(COLS / 2); // Center column as per rules
      
      // Check for game over condition - check if top row is full
      if (GameValidator.isGameOver(board)) {
        setGameOver(true);
        return;
      }
      
      // Create static falling tile that stays at the bottom
      const fallingTile = {
        col: spawnCol,
        value: nextBlock,
        anim: new Animated.Value(0), // Start at bottom position
        toRow: 0, // Will be updated when user taps a row
        fastDrop: false,
        static: true, // Add static flag to indicate it's not moving
        startRow: ROWS - 1 // Starting from bottom row
      };
      
      setFalling(fallingTile);
      // Don't automatically show guide for every new tile
      // setShowGuide(true); // Removed this line
    }
    // eslint-disable-next-line
  }, [falling, gameOver, hasWon, board]);

  /**
   * Handle user tapping a cell to drop the tile from bottom to that cell
   * Implements bottom-to-top dropping mechanism with direct cell targeting
   */
  const handleRowTap = (targetRow, targetCol = null) => {
    console.log('User tapped row:', targetRow, 'col:', targetCol);
    
    // Validate tap conditions
    if (!falling || falling.fastDrop || gameOver || hasWon) {
      return;
    }
    
    // If no column specified, use the falling tile's current column (old behavior)
    const col = targetCol !== null ? targetCol : falling.col;
    console.log('Tile column:', col);
    
    // Direct cell targeting - go to the exact cell the user tapped
    let landingRow = targetRow;
    let landingCol = col;
    
    // Check if the target cell is available
    if (board[landingRow][landingCol] !== 0) {
      console.log('Target cell', landingRow, landingCol, 'is occupied');
      return; // Can't place tile at occupied position
    }
    
    console.log('Final landing position:', landingRow, landingCol);
    
    // Hide guide overlay permanently
    setShowGuide(false);
    
    // Update falling tile with target position and start animation
    const updatedFalling = {
      ...falling,
      col: landingCol, // Update the column
      toRow: landingRow,
      fastDrop: true,
      static: false
    };
    setFalling(updatedFalling);
    
    // Animate from current position to target cell (both horizontal and vertical movement)
    const startPosition = (ROWS - 1) * (CELL_SIZE + CELL_MARGIN); // Bottom position
    const endPosition = landingRow * (CELL_SIZE + CELL_MARGIN); // Target position
    
    console.log('Animating from position:', startPosition, 'to position:', endPosition);
    
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
   * Handle tile landing and process all game logic
   * Uses the enhanced game engine with chain reactions and scoring
   */
  const handleTileLanded = async (row, col, value) => {
    try {
      // Process the tile landing through the game engine
      const result = await handleBlockLanding(
        board, 
        row, 
        col, 
        value, 
        showMergeResultAnimation
      );
      
      const { 
        newBoard, 
        totalScore, 
        chainReactionCount = 0, 
        iterations = 0 
      } = result;
      
      // Update game statistics
      setGameStats(prevStats => ({
        ...prevStats,
        tilesPlaced: prevStats.tilesPlaced + 1,
        mergesPerformed: prevStats.mergesPerformed + (totalScore > 0 ? 1 : 0),
        chainReactions: prevStats.chainReactions + chainReactionCount,
        highestTile: Math.max(prevStats.highestTile, ...newBoard.flat()),
      }));
      
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
      setNextBlock(getRandomBlockValue());
      
      // Check for winning condition
      if (!hasWon && GameValidator.hasWon(newBoard, score + totalScore)) {
        setHasWon(true);
        // Could show win animation or modal here
      }
      
      // Check for game over condition
      if (GameValidator.isGameOver(newBoard)) {
        setGameOver(true);
      }
      
    } catch (error) {
      console.error('Error handling tile landing:', error);
      // Fallback: ensure game doesn't break
      setNextBlock(getRandomBlockValue());
    }
  };

  /**
   * Reset game to initial state
   * Uses GameHelpers for consistent initialization
   */
  const resetGame = () => {
    setBoard(GameHelpers.createEmptyBoard());
    setScore(0);
    setGameOver(false);
    setHasWon(false);
    setNextBlock(getRandomBlockValue());
    setShowGuide(true);
    clearFalling();
    clearMergeAnimations();
    
    // Reset game statistics
    setGameStats({
      tilesPlaced: 0,
      mergesPerformed: 0,
      chainReactions: 0,
      highestTile: 0,
      startTime: Date.now(),
    });
  };

  /**
   * Get current game difficulty based on board state
   */
  const getCurrentDifficulty = () => {
    return GameHelpers.calculateDifficulty(board);
  };

  // UI rendering
  return (
    <View style={styles.container}>
      <GameHeader 
        score={score}
        record={record}
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
          nextBlock={nextBlock}
          showGuide={showGuide}
          panHandlers={panResponder.panHandlers}
        />
      </View>
      
      {/* Win Overlay */}
      {hasWon && !gameOver && (
        <View style={styles.overlay}>
          <Text style={styles.winText}>🎉 You Win! 🎉</Text>
          <Text style={styles.winSubtext}>
            You reached the {GAME_RULES.winning.tileTarget} tile!
          </Text>
          <Text style={styles.statsText}>
            Score: {score} | Highest Tile: {gameStats.highestTile}
          </Text>
          <TouchableOpacity style={styles.continueBtn} onPress={() => setHasWon(false)}>
            <Text style={styles.continueText}>Continue Playing</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.restartBtn} onPress={resetGame}>
            <Text style={styles.restartText}>New Game</Text>
          </TouchableOpacity>
        </View>
      )}

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2d2d2d',
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