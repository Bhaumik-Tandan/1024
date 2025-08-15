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
  AppState,
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
import { vibrateOnTouch } from '../utils/vibration';
import useGameStore from '../store/gameStore';



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
  // Use the imported constants directly - they're already 6x4
  
  // Game state management
  const [board, setBoard] = useState(() => Array.from({ length: 5 }, () => Array(4).fill(0)));
  const [falling, setFalling] = useState(null);
  const [nextBlock, setNextBlock] = useState(() => {
    try {
      return getRandomBlockValue();
    } catch (error) {
      console.warn('Error getting next block value:', error);
      return 2; // Fallback to safe default
    }
  });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  
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

  // Add mounted state tracking to prevent state updates after unmount
  const [isMounted, setIsMounted] = useState(true);

  // Force game loop to run when component mounts
  useEffect(() => {
    // Force board to be 5x4
    const newBoard = Array.from({ length: 5 }, () => Array(4).fill(0));
    setBoard(newBoard);
    
    // Force a small delay and then check if we need to spawn a tile
    const timer = setTimeout(() => {
      // This will trigger the game loop effect
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Validate board dimensions - ensure it's always 5x4
  useEffect(() => {
    if (board && (board.length !== 5 || board[0]?.length !== 4)) {
      console.warn('Board has wrong dimensions, fixing:', { rows: board.length, cols: board[0]?.length, expectedRows: 5, expectedCols: 4 });
      setBoard(Array.from({ length: 5 }, () => Array(4).fill(0)));
    }
  }, [board]);
  
  // Fallback: Ensure there's always a falling tile if game is active
  useEffect(() => {
    if (!gameOver && !isPaused && !falling && board && board.length > 0) {
      // Wait a bit to see if game loop spawns a tile
      const timer = setTimeout(() => {
        if (isMounted && !gameOver && !isPaused && !falling) {
          console.log('Fallback: Game loop failed to spawn tile, forcing spawn');
          spawnNewTile();
        }
      }, 1000); // Reduced from 2000ms for faster response
      
      return () => clearTimeout(timer);
    }
  }, [gameOver, isPaused, falling, board, isMounted]);
  


  const boardRef = useRef(null);
  const [boardLeft, setBoardLeft] = useState(0);
  
  // Game state variables
  const { saveGame, loadSavedGame, updateScore, updateHighestBlock, highScore } = useGameStore();
  
  // Handle orientation changes and dynamic grid resizing
  useEffect(() => {
    try {
      const subscription = Dimensions.addEventListener('change', ({ window }) => {
        try {
          // Always use 5x4 grid regardless of orientation - no need to change
        } catch (error) {
          console.warn('Error handling orientation change:', error);
        }
      });
      
      return () => subscription?.remove();
    } catch (error) {
      console.warn('Error setting up orientation change listener:', error);
    }
  }, []); // Empty dependency array since we don't change grid size

  // Use the animation manager
  const {
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

  // Store function references in refs to avoid dependency issues
  const clearFallingRef = useRef(clearFalling);
  const clearMergeAnimationsRef = useRef(clearMergeAnimations);
  
  // Update refs when functions change - with safeguards to prevent infinite loops
  useEffect(() => {
    if (clearFalling && typeof clearFalling === 'function') {
      clearFallingRef.current = clearFalling;
    }
    if (clearMergeAnimations && typeof clearMergeAnimations === 'function') {
      clearMergeAnimationsRef.current = clearMergeAnimations;
    }
  }, [clearFalling, clearMergeAnimations]);

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

  // Track score and highest block for local state updates
  const [lastScore, setLastScore] = useState(0);
  const [lastHighestBlock, setLastHighestBlock] = useState(0);

  // Load saved game functionality - restore game state on mount
  useEffect(() => {
    const loadGame = async () => {
      try {
        const savedGame = loadSavedGame();
        
        if (savedGame && savedGame.board && Array.isArray(savedGame.board)) {
          // Validate saved board dimensions
          if (savedGame.board.length === 5 && savedGame.board[0]?.length === 4) {
            setBoard(savedGame.board);
            setScore(savedGame.score || 0);
            setNextBlock(savedGame.nextBlock || getRandomBlockValue());
            setGameStats(savedGame.gameStats || {
              tilesPlaced: 0,
              mergesPerformed: 0,
              chainReactions: 0,
              highestTile: 0,
              startTime: Date.now(),
            });
            setMaxTileAchieved(savedGame.maxTileAchieved || 0);
            setFloorLevel(savedGame.floorLevel || 1);
            setCurrentMinSpawn(savedGame.currentMinSpawn || 2);
          } else {
            console.warn('Saved game has wrong dimensions, starting fresh');
            // Clear corrupted saved game
            try {
              const { clearSavedGame } = useGameStore();
              if (clearSavedGame && typeof clearSavedGame === 'function') {
                clearSavedGame();
              }
            } catch (error) {
              console.warn('Failed to clear corrupted saved game:', error);
            }
          }
        }
      } catch (error) {
        console.warn('Failed to load saved game:', error);
      }
    };
    
    loadGame();
  }, [loadSavedGame]);

  // Save game when user leaves the screen
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        // Save game state when leaving the screen
        if (isMounted && !gameOver) {
          // Save game state
          const gameState = {
            board: board,
            score: score,
            nextBlock: nextBlock,
            gameStats: {
              tilesPlaced: gameStats.tilesPlaced,
              chainReactions: gameStats.chainReactions,
              maxTileAchieved: gameStats.maxTileAchieved,
              lastResume: Date.now(),
            },
            maxTileAchieved: maxTileAchieved,
            floorLevel: floorLevel,
            currentMinSpawn: currentMinSpawn,
          };
          
          try {
            saveGame(gameState);
          } catch (error) {
            console.warn('Failed to save game on screen leave:', error);
          }
        }
      };
    }, [board, score, nextBlock, gameStats, maxTileAchieved, floorLevel, currentMinSpawn, isMounted, gameOver, saveGame])
  );

  // Save game when app goes to background
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'background' && isMounted && !gameOver) {
        // Save game state when app goes to background
        const gameState = {
          board,
          score,
          nextBlock,
          gameStats,
          maxTileAchieved,
          floorLevel,
          currentMinSpawn,
          timestamp: Date.now()
        };
        
        try {
          saveGame(gameState);
        } catch (error) {
          console.warn('Failed to save game on app background:', error);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [board, score, nextBlock, gameStats, maxTileAchieved, floorLevel, currentMinSpawn, isMounted, gameOver, saveGame]);



  // Auto-save functionality - save game state whenever it changes
  useEffect(() => {
    if (isMounted && !gameOver) {
      const gameState = {
        board,
        score,
        nextBlock,
        gameStats,
        maxTileAchieved,
        floorLevel,
        currentMinSpawn,
        timestamp: Date.now()
      };
      
      try {
        saveGame(gameState);
        // Update high score if current score is higher
        if (score > 0) {
          updateScore(score);
        }
        // Update highest block achieved
        if (maxTileAchieved > 0) {
          updateHighestBlock(maxTileAchieved);
        }
      } catch (error) {
        console.warn('Auto-save failed:', error);
      }
    }
  }, [board, score, nextBlock, gameStats, maxTileAchieved, floorLevel, currentMinSpawn, isMounted, gameOver, saveGame, updateScore, updateHighestBlock]);

  // Pause modal handlers
  const handlePause = () => {
    try {
      setIsPaused(true);
      soundManager.playSoundIfEnabled('pauseResume');
      
      // Save game state when pausing
      const gameState = {
        board,
        score,
        nextBlock,
        gameStats,
        maxTileAchieved,
        floorLevel,
        currentMinSpawn,
        timestamp: Date.now()
      };
      saveGame(gameState);
    } catch (error) {
      console.warn('Pause error:', error);
      setIsPaused(true); // Still pause even if sound fails
    }
  };

  const handleResume = () => {
    try {
      setIsPaused(false);
      soundManager.playSoundIfEnabled('pauseResume');
      
      // Ensure background music is in sync with game state
      const { backgroundMusicEnabled } = useGameStore.getState();
      if (backgroundMusicEnabled && global.backgroundMusicManager) {
        try {
          global.backgroundMusicManager.play();
        } catch (musicError) {
          console.warn('Failed to resume background music:', musicError);
        }
      }
      
      // Force a small delay to ensure state updates properly
      setTimeout(() => {
        // Force a re-render by updating a timestamp
        setGameStats(prev => ({
          ...prev,
          lastResume: Date.now()
        }));
      }, 100);
    } catch (error) {
      console.warn('Resume error:', error);
      setIsPaused(false); // Still resume even if sound fails
    }
  };
  
  const handleRestart = () => {
    try {
      resetGame(); // Use the local reset function for comprehensive game reset
      setIsPaused(false); // Dismiss modal after restarting
    } catch (error) {
      console.warn('Restart error:', error);
      setIsPaused(false); // Still dismiss modal even if restart fails
    }
  }

  const handleHome = () => {
    try {
      // Save game state before going home
      const gameState = {
        board,
        score,
        nextBlock,
        gameStats,
        maxTileAchieved,
        floorLevel,
        currentMinSpawn,
        timestamp: Date.now()
      };
      saveGame(gameState);
      
      // Dismiss modal first, then navigate
      setIsPaused(false);
      navigation.navigate('Home');
    } catch (error) {
      console.warn('Home navigation error:', error);
      // Still dismiss modal and navigate even if save fails
      setIsPaused(false);
      navigation.navigate('Home');
    }
  };

  const handleClosePause = () => {
    try {
      setIsPaused(false);
    } catch (error) {
      console.warn('Close pause error:', error);
      // Force close if normal close fails
      setIsPaused(false);
    }
  };



  /**
   * Game loop: Spawn initial tile and wait for user input
   * Tiles are spawned when the game starts and when user drops tiles
   */
  useEffect(() => {
    console.log('=== GAME LOOP TRIGGERED ===');
    console.log('Game loop state:', { 
      falling: !!falling, 
      gameOver, 
      isPaused, 
      isMounted,
      score,
      tilesPlaced: gameStats.tilesPlaced
    });
    
    // Only spawn initial tile if no falling tile exists and game is ready
    if (falling || gameOver || isPaused) {
      console.log('Game loop blocked:', { 
        falling: !!falling, 
        gameOver, 
        isPaused 
      });
      return;
    }
    
    console.log('✅ Game loop proceeding to spawn tile...');
    
    try {
      // Validate board state before spawning
      if (!board || !Array.isArray(board) || board.length === 0) {
        console.warn('❌ Invalid board state in game loop');
        return;
      }
      
      console.log('✅ Board state validated in game loop');
      
      // Only spawn the very first tile when game starts (score = 0, tilesPlaced = 0)
      if (score === 0 && gameStats.tilesPlaced === 0) {
        console.log('🎯 Game loop spawning first tile only');
        spawnNewTile();
        
        // Show guide for the very first tile
        setShowGuide(true);
        console.log('✅ Guide overlay shown for first tile');
      } else {
        console.log('🎯 Game loop: Not spawning tile - waiting for user action');
      }
      
    } catch (error) {
      console.warn('❌ Error in game loop:', error);
      // Clear any invalid state
      if (clearFallingRef.current && typeof clearFallingRef.current === 'function') {
        try {
          clearFallingRef.current();
        } catch (cleanupError) {
          console.warn('Error clearing falling state during error recovery:', cleanupError);
        }
      }
    }
  }, [falling, gameOver, isPaused, isMounted, score, gameStats.tilesPlaced]); // Remove board?.length dependency to prevent auto-spawning

  /**
   * Cleanup touch timeout and set mounted state on component unmount
   */
  useEffect(() => {
    return () => {
      setIsMounted(false);
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }

      // Clear any falling animations
      if (falling && falling.animationRef) {
        falling.animationRef.stop();
      }
      // Clear merge animations
      clearMergeAnimationsRef.current();
    };
  }, []); // Empty dependency array - only run on unmount





  /**
   * Handle user tapping anywhere on screen - uses measured column detection
   * Always drops from bottom - tap X position determines the column
   */
  const handleScreenTap = (event) => {
    console.log('=== SCREEN TAP DETECTED ===');
    console.log('Screen tap event:', event.nativeEvent);
    
    try {
      // Touch sensitivity control - prevent rapid successive taps
      if (!isTouchEnabled) {
        console.log('Screen tap blocked: Touch disabled');
        return;
      }
      
      // Validate tap conditions
      if (!falling || falling.fastDrop || gameOver || isPaused) {
        console.log('Screen tap blocked: Invalid conditions', { 
          hasFalling: !!falling, 
          fastDrop: falling?.fastDrop, 
          gameOver, 
          isPaused 
        });
        return;
      }
      
      console.log('Screen tap validated, processing...');
    

    
    // Use the pre-calculated column from enhanced grid detection
    const targetColumn = event.nativeEvent.detectedColumn ?? 0; // Default to column 0 if detection fails
    console.log('Detected column from screen tap:', targetColumn);
    
    // Use the existing logic but with the accurately detected column
    handleRowTap(0, targetColumn); // Row doesn't matter, only column
    } catch (error) {
      // Error in handleScreenTap - recover gracefully
      console.warn('HandleScreenTap error:', error);
      setIsTouchEnabled(true);
    }
  };

  /**
   * Handle user tapping any cell in a column to drop the tile in that column
   * Always drops from bottom - tap only selects the column, not the row
   * Includes touch sensitivity controls to prevent rapid successive taps
   */
  const handleRowTap = (targetRow, targetCol = null) => {
    console.log('=== TAP DETECTED ===');
    console.log('Tap details:', { targetRow, targetCol, falling: !!falling, gameOver, isPaused });
    
    try {
      // Touch sensitivity control - prevent rapid successive taps
      if (!isTouchEnabled) {
        console.log('Tap blocked: Touch disabled');
        return;
      }
      
      // Validate tap conditions
      if (!falling || falling.fastDrop || gameOver || isPaused) {
        console.log('Tap blocked: Invalid conditions', { 
          hasFalling: !!falling, 
          fastDrop: falling?.fastDrop, 
          gameOver, 
          isPaused 
        });
        return;
      }
      
      console.log('Tap validated, processing...');
      

      
      // Use the column from the tap - ignore the row (always drop from bottom)
      const col = targetCol !== null ? targetCol : falling.col;
      console.log('Target column:', col, 'Falling column:', falling.col);
      
      // Validate column bounds
      if (col < 0 || col >= COLS) {
        console.warn('Invalid column index in handleRowTap:', col);
        return;
      }
      
      console.log('=== SEARCHING FOR EMPTY ROW ===');
      console.log('Board dimensions:', { ROWS, COLS, boardRows: board.length, boardCols: board[0]?.length });
      console.log('Board state for column', col, ':', board.map((row, idx) => ({ row: idx, value: row[col] })));
      
      // Column-based targeting - find the first available empty cell in the column (from top)
      let landingCol = col;
      let landingRow = -1;
      
      // Search from top to bottom for the first empty cell in the column
      for (let row = 0; row < ROWS; row++) {
        const cellValue = board[row]?.[landingCol];
        console.log(`Checking row ${row}: value = ${cellValue} (empty: ${cellValue === 0})`);
        if (board[row] && board[row][landingCol] === 0) {
          landingRow = row;
          console.log(`✅ Found empty row: ${row}`);
          break;
        }
      }
      
      console.log('Landing row found:', landingRow);
      
      // If no empty cell found, check if we can merge in the full column
      let canMergeInFull = null;
      if (landingRow === -1) {
        console.log('No empty row found, checking for full column merge...');
        try {
          canMergeInFull = canMergeInFullColumn(board, landingCol, falling.value);
          console.log('Full column merge result:', canMergeInFull);
        } catch (error) {
          console.warn('Error checking full column merge:', error);
          canMergeInFull = null;
        }
        
        if (!canMergeInFull) {
          console.log('❌ Column is full and no merge possible - BLOCKING DROP');
          // IMPORTANT: Return early to prevent any animation or tile landing
          return; // Column is full and no merge possible
        }
        // Set landing row to the bottom for the merge case
        landingRow = canMergeInFull.mergeRow;
        console.log('Merge landing row set to:', landingRow);
      }
      
      // DOUBLE CHECK: If we somehow got here with a full column and no merge, block it
      if (landingRow === -1) {
        console.log('❌ Landing row still -1 after merge check - BLOCKING DROP');
        return;
      }
      
      console.log('Final landing position:', { row: landingRow, col: landingCol });
      
      // Validate landing position
      if (landingRow < 0 || landingRow >= ROWS || landingCol < 0 || landingCol >= COLS) {
        console.warn('Invalid landing position:', { landingRow, landingCol, ROWS, COLS });
        return;
      }
      
      console.log('✅ Landing position validated, proceeding with drop...');
      
      // Remove drop sound from tap - it will play when tile reaches landing position
      
      // Disable touch temporarily to prevent rapid successive taps
      setIsTouchEnabled(false);
      
      // Clear any existing timeout
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
      
      // PERFORMANCE: Reduced debounce delay for more responsive touch handling
      touchTimeoutRef.current = setTimeout(() => {
        setIsTouchEnabled(true);
      }, 200); // Reduced from 400ms for faster response
      
      // Hide guide overlay permanently
      setShowGuide(false);
      
      // Capture the current nextBlock value before updating it
      const tileValueToDrop = nextBlock;
      console.log('Dropping tile with value:', tileValueToDrop);
      
      // Update next block immediately when user taps (ONLY after validation passes)
      setNextBlock(getRandomBlockValue());
      
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
      console.log('✅ Falling tile updated for drop:', { col: landingCol, row: landingRow, value: tileValueToDrop });
      
      // Animate from current position to target position
      const currentPosition = falling.anim._value || 0; // Get current animation value
      const targetRowPosition = landingRow * (CELL_SIZE + CELL_MARGIN); // Target position
      console.log('Animation details:', { currentPosition, targetRowPosition, landingRow, CELL_SIZE, CELL_MARGIN });
      
      // Start the animation from current position to target
      if (falling.anim && typeof falling.anim.setValue === 'function') {
        console.log('✅ Starting drop animation...');
        // Don't change the current position, just animate to target
        const animation = Animated.timing(falling.anim, {
          toValue: targetRowPosition,
          duration: GAME_CONFIG.TIMING.COSMIC_DROP_DURATION,
          useNativeDriver: false,
          easing: Easing.out(Easing.quad),
        });
        
        // Store animation reference for cleanup
        if (falling.animationRef && typeof falling.animationRef.stop === 'function') {
          falling.animationRef.stop();
        }
        falling.animationRef = animation;
        animation.start();
        console.log('✅ Drop animation started successfully');
        
        // Handle landing after animation completes
        const landingTimeout = setTimeout(async () => {
          console.log('=== TILE LANDING COMPLETE ===');
          if (isMounted) {
            try {
              if (canMergeInFull) {
                console.log('Handling full column merge landing...');
                // Special handling for full column merge
                await handleFullColumnTileLanded(landingRow, landingCol, tileValueToDrop);
              } else {
                console.log('Handling normal tile landing...');
                // Normal tile landing
                handleTileLanded(landingRow, landingCol, tileValueToDrop);
              }
            } catch (error) {
              console.warn('Landing timeout error:', error);
              setIsTouchEnabled(true);
            } finally {
              // Safe cleanup of falling state
              if (clearFallingRef.current && typeof clearFallingRef.current === 'function') {
                try {
                  clearFallingRef.current();
                } catch (cleanupError) {
                  console.warn('Error clearing falling state:', cleanupError);
                }
              }
            }
          }
        }, GAME_CONFIG.TIMING.COSMIC_DROP_DURATION);
        
        // Store timeout reference for cleanup
        touchTimeoutRef.current = landingTimeout;
      } else {
        console.warn('❌ Failed to start drop animation - falling.anim invalid');
      }
    } catch (error) {
      // Error in handleRowTap - recover gracefully
      console.warn('HandleRowTap error:', error);
      setIsTouchEnabled(true);
      // Safe cleanup of falling state
      if (clearFallingRef.current && typeof clearFallingRef.current === 'function') {
        try {
          clearFallingRef.current();
        } catch (cleanupError) {
          console.warn('Error clearing falling state during error recovery:', cleanupError);
        }
      }
    }
  };

  /**
   * Spawn a new falling tile after a tile has been dropped
   */
  const spawnNewTile = () => {
    console.log('=== SPAWN NEW TILE CALLED ===');
    console.log('Current state:', { 
      falling: !!falling, 
      gameOver, 
      isPaused, 
      boardRows: board?.length, 
      boardCols: board?.[0]?.length 
    });
    
    try {
      // Don't spawn if there's already a falling tile
      if (falling) {
        console.log('❌ spawnNewTile blocked: falling tile already exists');
        return;
      }
      
      // Validate board state
      if (!board || !Array.isArray(board) || board.length === 0) {
        console.warn('❌ Invalid board state in spawnNewTile');
        return;
      }
      
      console.log('✅ Board state validated');
      
      // Find any available column instead of just the center column
      let spawnCol = -1;
      let spawnRow = -1;
      
      console.log('=== SEARCHING FOR ANY AVAILABLE SPAWN POSITION ===');
      
      // Check each column from left to right to find any available spawn position
      for (let col = 0; col < COLS; col++) {
        console.log(`Checking spawn column ${col}:`);
        
        // Find the first available row in this column (from top)
        for (let row = 0; row < ROWS; row++) {
          const cellValue = board[row]?.[col];
          console.log(`  Row ${row}: value = ${cellValue} (empty: ${cellValue === 0})`);
          if (board[row] && board[row][col] === 0) {
            spawnCol = col;
            spawnRow = row;
            console.log(`✅ Found spawn position: column ${col}, row ${row}`);
            break;
          }
        }
        
        if (spawnCol !== -1) {
          break; // Found a spawn position
        }
      }
      
      // If no spawn position found, don't spawn
      if (spawnCol === -1 || spawnRow === -1) {
        console.log('❌ No spawn position found anywhere on the board');
        console.log('Full board state:', board);
        
        // FALLBACK: If the board is completely full, this means the game should be over
        // Check if this is a game over condition
        const isBoardFull = board.every(row => row.every(cell => cell !== 0));
        if (isBoardFull) {
          console.log('🚨 Board is completely full - this should trigger game over');
          // Don't set game over here, let the game logic handle it
        }
        return;
      }
      
      console.log('✅ Spawn position found:', { col: spawnCol, row: spawnRow });
      
      // Validate spawn position
      if (spawnCol < 0 || spawnCol >= COLS || spawnRow < 0 || spawnRow >= ROWS) {
        console.warn('❌ Invalid spawn position in spawnNewTile:', { spawnCol, spawnRow });
        return;
      }
      
      // Use the nextBlock value for the falling tile, not a random value
      const blockValue = nextBlock;
      console.log('Creating preview tile with value:', blockValue);
      
      // Create falling tile with animation - start from below the grid (bottom) in preview mode
      const anim = new Animated.Value((ROWS) * (CELL_SIZE + CELL_MARGIN)); // Start from below the grid
      const fallingTile = {
        col: spawnCol,
        value: blockValue,
        anim,
        toRow: spawnRow,
        fastDrop: false,
        static: false,
        inPreview: true, // Set to true so tile stays floating until user taps
        startRow: ROWS // Start from below the grid (bottom)
      };
      
              setFalling(fallingTile);
      console.log('✅ Preview tile set successfully:', { ...fallingTile, anim: 'Animated.Value' });
      
      // DON'T start falling animation - tile should stay floating in preview mode
      // User will control when and where it drops via tap
      
    } catch (error) {
      console.warn('❌ Error in spawnNewTile:', error);
    }
  };

  /**
   * Check if a tile at the given position has adjacent tiles
   * @param {Array[]} board - The game board
   * @param {number} row - Row position
   * @param {number} col - Column position
   * @returns {boolean} - True if there are adjacent tiles
   */
  const hasAdjacentTiles = (board, row, col) => {
    try {
      const adjacentPositions = [
        { row: row - 1, col }, // up
        { row: row + 1, col }, // down
        { row, col: col - 1 }, // left
        { row, col: col + 1 }  // right
      ];
      
      return adjacentPositions.some(pos => {
        return pos.row >= 0 && pos.row < ROWS && 
               pos.col >= 0 && pos.col < COLS && 
               board[pos.row] && board[pos.row][pos.col] !== 0;
      });
    } catch (error) {
      console.warn('Adjacent tiles check error:', error);
      return false; // Safe fallback
    }
  };

  /**
   * Check if a tile can merge in a full column by checking adjacent positions
   * @param {Array[]} board - The game board
   * @param {number} col - Column to check
   * @param {number} value - Value of the tile to drop
   * @returns {Object|null} - { canMerge: boolean, mergeRow: number } or null
   */
  const canMergeInFullColumn = (board, col, value) => {
    try {
      // Validate input parameters
      if (!board || !Array.isArray(board) || board.length === 0) {
        console.warn('Invalid board in canMergeInFullColumn');
        return null;
      }
      
      if (col < 0 || col >= COLS || !value) {
        console.warn('Invalid parameters in canMergeInFullColumn:', { col, value });
        return null;
      }
      
      // Check if the bottom tile in the column matches the dropping tile
      const bottomRow = ROWS - 1;
      if (board[bottomRow] && board[bottomRow][col] === value) {
        return { canMerge: true, mergeRow: bottomRow };
      }
      
      // Check if any TRULY adjacent tiles to the bottom can merge (no same-column merges)
      const adjacentPositions = [
        { row: bottomRow - 1, col: col - 1 }, // diagonal left
        { row: bottomRow - 1, col: col + 1 }, // diagonal right
        { row: bottomRow, col: col - 1 },     // left of bottom
        { row: bottomRow, col: col + 1 }      // right of bottom
      ];
      
      for (const pos of adjacentPositions) {
        try {
          if (pos.row >= 0 && pos.row < ROWS && 
              pos.col >= 0 && pos.col < COLS && 
              board[pos.row] && board[pos.row][pos.col] === value) {
            return { canMerge: true, mergeRow: bottomRow };
          }
        } catch (posError) {
          console.warn('Error checking adjacent position:', posError, pos);
          continue;
        }
      }
      
      return null;
    } catch (error) {
      console.warn('Can merge in full column error:', error);
      return null; // Safe fallback
    }
  };

  /**
   * Handle tile landing and process all game logic
   * Uses the enhanced game engine with chain reactions and scoring
   */
  const handleTileLanded = (row, col, value) => {
    try {
      // Validate input parameters
      if (row < 0 || row >= ROWS || col < 0 || col >= COLS || !value) {
        console.warn('Invalid parameters in handleTileLanded:', { row, col, value });
        return;
      }
      
      // Validate board state
      if (!board || !Array.isArray(board) || board.length === 0) {
        console.warn('Invalid board state in handleTileLanded');
        return;
      }
      
      // Drop sound is already played when tile is placed in GameLogic.js
      // No need to play it again here
      
      // Check if the newly landed tile is touching other tiles for additional vibration
      let isTouchingTiles = false;
      try {
        isTouchingTiles = hasAdjacentTiles(board, row, col);
      } catch (error) {
        console.warn('Error checking adjacent tiles:', error);
        isTouchingTiles = false;
      }
      
      // Process the tile landing through the game engine
      handleBlockLanding(
        board, 
        row, 
        col, 
        value, 
        showMergeResultAnimation
      ).then(result => {
        try {
          if (!result || typeof result !== 'object') {
            console.warn('Invalid result from handleBlockLanding:', result);
            return;
          }
          
          const { 
            newBoard, 
            totalScore, 
            chainReactionCount = 0, 
            iterations = 0 
          } = result;
          
          // Validate new board
          if (!newBoard || !Array.isArray(newBoard) || newBoard.length === 0) {
            console.warn('Invalid new board from handleBlockLanding');
            return;
          }
          
          // Calculate new values first
          const newHighestTile = Math.max(gameStats.highestTile, ...newBoard.flat().filter(val => val && !isNaN(val)));
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
          
          // Update local state after all state updates - only if component is mounted
          setTimeout(() => {
            if (isMounted) {
              if (newHighestTile > lastHighestBlock) {
                setLastHighestBlock(newHighestTile);
              }
              
              if (totalScore > 0) {
                setLastScore(newScore);
              }
            }
          }, 0);

          // Update board state
          setBoard(newBoard);
          
          // Clear falling state before spawning new tile
          console.log('Clearing falling state before spawning new tile');
          setFalling(null);
          
          // Spawn new tile after a short delay
          setTimeout(() => {
            if (isMounted && !gameOver && !isPaused) {
              spawnNewTile();
            }
          }, 100); // Reduced from 500ms for faster response
          
          // Check for game over condition
          try {
            if (GameValidator.isGameOver(newBoard)) {
              setGameOver(true);
              
              // Save final game state when game ends
              const finalGameState = {
                board: newBoard,
                score: newScore,
                nextBlock,
                gameStats: {
                  ...gameStats,
                  tilesPlaced: gameStats.tilesPlaced + 1,
                  mergesPerformed: gameStats.mergesPerformed + (totalScore > 0 ? 1 : 0),
                  chainReactions: gameStats.chainReactions + chainReactionCount,
                  highestTile: newHighestTile,
                },
                maxTileAchieved,
                floorLevel,
                currentMinSpawn,
                timestamp: Date.now()
              };
              
              try {
                saveGame(finalGameState);
              } catch (saveError) {
                console.warn('Error saving final game state:', saveError);
              }
              
              try {
                soundManager.playSoundIfEnabled('gameOver');
              } catch (error) {
                console.warn('Game over sound error:', error);
              }
            }
          } catch (gameOverError) {
            console.warn('Error checking game over condition:', gameOverError);
          }
        } catch (resultError) {
          console.warn('Error processing handleBlockLanding result:', resultError);
        }
      }).catch(error => {
        // Error processing tile landing - recover gracefully
        console.warn('Tile landing error:', error);
        setIsTouchEnabled(true);
        // Safe cleanup of falling state
        if (clearFallingRef.current && typeof clearFallingRef.current === 'function') {
          try {
            clearFallingRef.current();
          } catch (cleanupError) {
            console.warn('Error clearing falling state during error recovery:', cleanupError);
          }
        }
      });
    } catch (error) {
      // Error in handleTileLanded - recover gracefully
      console.warn('HandleTileLanded error:', error);
      setIsTouchEnabled(true);
      // Safe cleanup of falling state
      if (clearFallingRef.current && typeof clearFallingRef.current === 'function') {
        try {
          clearFallingRef.current();
        } catch (cleanupError) {
          console.warn('Error clearing falling state during error recovery:', cleanupError);
        }
      }
    }
  };

  /**
   * Handle tile landing in a full column when merging is possible
   * Uses the special full column drop logic
   */
  const handleFullColumnTileLanded = async (row, col, value) => {
    try {
      // Validate input parameters
      if (row < 0 || row >= ROWS || col < 0 || col >= COLS || !value) {
        console.warn('Invalid parameters in handleFullColumnTileLanded:', { row, col, value });
        return;
      }
      
      // Validate board state
      if (!board || !Array.isArray(board) || board.length === 0) {
        console.warn('Invalid board state in handleFullColumnTileLanded');
        return;
      }
      
      // Drop sound is already played when tile is placed in GameLogic.js
      // No need to play it again here
      
      // Process the full column drop through the special game engine with animation support
      let result;
      try {
        result = await processFullColumnDrop(board, value, col, showMergeResultAnimation);
      } catch (processError) {
        console.warn('Error in processFullColumnDrop:', processError);
        return;
      }
      
      if (result && result.success) {
        try {
          const { 
            board: newBoard, 
            score: totalScore, 
            chainReactions: chainReactionCount = 0, 
            iterations = 0 
          } = result;
          
          // Validate new board
          if (!newBoard || !Array.isArray(newBoard) || newBoard.length === 0) {
            console.warn('Invalid new board from processFullColumnDrop');
            return;
          }
          
          // Calculate new values first
          const newHighestTile = Math.max(gameStats.highestTile, ...newBoard.flat().filter(val => val && !isNaN(val)));
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
          
          // Spawn new tile after successful landing
          setTimeout(() => {
            if (isMounted && !gameOver && !isPaused) {
              spawnNewTile();
            }
          }, 100); // Reduced from 200ms for faster response
          
          // Update max tile achieved
          try {
            const currentMaxTile = Math.max(...newBoard.flat().filter(val => val && !isNaN(val)));
            if (currentMaxTile > maxTileAchieved) {
              setMaxTileAchieved(currentMaxTile);
            }
          } catch (maxTileError) {
            console.warn('Error calculating max tile:', maxTileError);
          }
          
          // Update score
          if (totalScore > 0) {
            setScore(newScore);
          }
          
          // Update local state after all state updates - only if component is mounted
          setTimeout(() => {
            if (isMounted) {
              if (newHighestTile > lastHighestBlock) {
                setLastHighestBlock(newHighestTile);
              }
              
              if (totalScore > 0) {
                setLastScore(newScore);
              }
            }
          }, 0);
          
          // Check for game over condition
          try {
            if (GameValidator.isGameOver(newBoard)) {
              setGameOver(true);
              
              // Save final game state when game ends
              const finalGameState = {
                board: newBoard,
                score: newScore,
                nextBlock,
                gameStats: {
                  ...gameStats,
                  tilesPlaced: gameStats.tilesPlaced + 1,
                  mergesPerformed: gameStats.mergesPerformed + (totalScore > 0 ? 1 : 0),
                  chainReactions: gameStats.chainReactions + chainReactionCount,
                  highestTile: newHighestTile,
                },
                maxTileAchieved,
                floorLevel,
                currentMinSpawn,
                timestamp: Date.now()
              };
              
              try {
                saveGame(finalGameState);
              } catch (saveError) {
                console.warn('Error saving final game state:', saveError);
              }
              
              try {
                soundManager.playSoundIfEnabled('gameOver');
              } catch (error) {
                console.warn('Game over sound error:', error);
              }
            }
          } catch (gameOverError) {
            console.warn('Error checking game over condition:', gameOverError);
          }
        } catch (resultError) {
          console.warn('Error processing processFullColumnDrop result:', resultError);
        }
      } else {
        // Full column drop failed, should not happen if canMergeInFullColumn worked correctly
        console.warn('Full column drop failed:', result);
        // Error handled silently
      }
    } catch (error) {
      // Error in handleFullColumnTileLanded - recover gracefully
      console.warn('FullColumnTileLanded error:', error);
      setIsTouchEnabled(true);
      // Safe cleanup of falling state
      if (clearFallingRef.current && typeof clearFallingRef.current === 'function') {
        try {
          clearFallingRef.current();
        } catch (cleanupError) {
          console.warn('Error clearing falling state during error recovery:', cleanupError);
        }
      }
    }
  };

  /**
   * Reset game to initial state
   * Uses GameHelpers for consistent initialization
   */
  const resetGame = () => {
    try {
      // Always use 6x4 grid
      const safeRows = 6;
      const safeCols = 4;
      
      setBoard(Array.from({ length: safeRows }, () => Array(safeCols).fill(0)));
      setScore(0);
      setGameOver(false);
      
      try {
        setNextBlock(getRandomBlockValue());
      } catch (error) {
        console.warn('Error getting random block value in reset:', error);
        setNextBlock(2);
      }
      
      setGameStats({
        tilesPlaced: 0,
        mergesPerformed: 0,
        chainReactions: 0,
        highestTile: 0,
        startTime: Date.now(),
      });
    
      // Clear all animations safely
      if (clearFallingRef.current && typeof clearFallingRef.current === 'function') {
        try {
          clearFallingRef.current();
        } catch (error) {
          console.warn('Error clearing falling animations in reset:', error);
        }
      }
      
      if (clearMergeAnimationsRef.current && typeof clearMergeAnimationsRef.current === 'function') {
        try {
          clearMergeAnimationsRef.current();
        } catch (error) {
          console.warn('Error clearing merge animations in reset:', error);
        }
      }
    
      // Floor system reset
      setCurrentMinSpawn(2);
      setFloorLevel(1);
      setMaxTileAchieved(0);
    
      // Clear saved game when resetting
      try {
        // Clear the saved game state
        const { clearSavedGame } = useGameStore();
        if (clearSavedGame && typeof clearSavedGame === 'function') {
          clearSavedGame();
        }
      } catch (error) {
        console.warn('Failed to clear saved game:', error);
      }
    
      // Enable touch
      setIsTouchEnabled(true);
      
      // Show guide for new game
      setShowGuide(true);
    } catch (error) {
      // Error in resetGame - recover gracefully
      console.warn('ResetGame error:', error);
      // Try to reset to a safe state
      try {
        setBoard(Array.from({ length: 5 }, () => Array(4).fill(0)));
        setScore(0);
        setGameOver(false);
        setIsTouchEnabled(true);
      } catch (fallbackError) {
        console.error('Critical error in resetGame fallback:', fallbackError);
        // Last resort - force component re-render
        setGameOver(true);
      }
    }
  };

  /**
   * Force reset stuck falling tiles - emergency recovery function
   */

  

  


  /**
   * Get current game difficulty based on board state
   */
  const getCurrentDifficulty = () => {
    try {
      const emptyCells = board.flat().filter(cell => cell === 0).length;
      const totalCells = ROWS * COLS;
      const fillPercentage = 1 - (emptyCells / totalCells);
      
      if (fillPercentage < 0.3) return 'easy';
      if (fillPercentage < 0.6) return 'medium';
      if (fillPercentage < 0.8) return 'hard';
      return 'extreme';
    } catch (error) {
      console.warn('Difficulty calculation error:', error);
      return 'easy'; // Safe fallback
    }
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
        onLayout={e => {
          try {
            setBoardLeft(e.nativeEvent.layout.x);
          } catch (error) {
            console.warn('Board layout error:', error);
          }
        }}
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
          showGuide={showGuide}
          panHandlers={panResponder.panHandlers}
          isTouchEnabled={isTouchEnabled}
        />
      </View>
      
      <OptimizedNextBlock nextBlock={nextBlock} />
      

      
      {/* Game Over Overlay */}
      {gameOver && (
        <View style={styles.overlay}>
          <View style={styles.gameOverContainer}>
            {/* Cosmic Background Pattern */}
            <View style={styles.cosmicBackground}>
              <Text style={styles.cosmicStar}>✦</Text>
              <Text style={styles.cosmicStar}>✦</Text>
              <Text style={styles.cosmicStar}>✦</Text>
            </View>
            
            {/* Enhanced Space-themed Title with Graffiti */}
            <View style={styles.gameOverTitleContainer}>
              <Text style={styles.gameOverTitle}>MISSION ENDED</Text>
              <View style={styles.gameOverTitleUnderline} />
              {/* Graffiti Elements */}
              <View style={styles.graffitiContainer}>
                <Text style={[styles.graffitiText, styles.graffitiStar1]}>✧</Text>
                <Text style={[styles.graffitiText, styles.graffitiStar2]}>★</Text>
                <Text style={[styles.graffitiText, styles.graffitiLightning]}>⚡</Text>
                <Text style={[styles.graffitiText, styles.graffitiPlanet]}>🌍</Text>
                <Text style={[styles.graffitiText, styles.graffitiRocket]}>🚀</Text>
              </View>
            </View>
            
            {/* Enhanced Score Section */}
            <View style={styles.gameOverScoreSection}>
              <Text style={styles.gameOverFinalScoreLabel}>FINAL SCORE</Text>
              <Text style={styles.gameOverFinalScoreText}>
                {typeof score === 'number' ? score.toLocaleString() : '0'}
              </Text>
              {typeof score === 'number' && typeof highScore === 'number' && score > highScore && (
                <View style={styles.newRecordContainer}>
                  <Text style={styles.newRecordText}>NEW RECORD!</Text>
                  <View style={styles.newRecordGlow} />
                </View>
              )}
            </View>
            
            {/* Enhanced Stats Grid */}
            <View style={styles.gameOverStatsGrid}>
              {/* Left Graffiti */}
              <View style={styles.leftGraffiti}>
                <Text style={styles.sideGraffitiText}>✨</Text>
                <Text style={styles.sideGraffitiText}>🌟</Text>
              </View>
              
              <View style={styles.gameOverStatItem}>
                <View style={styles.gameOverStatIconContainer}>
                  <Text style={styles.gameOverStatIcon}>🎯</Text>
                </View>
                <Text style={styles.gameOverStatValue}>
                  {typeof gameStats?.tilesPlaced === 'number' ? gameStats.tilesPlaced : 0}
                </Text>
                <Text style={styles.gameOverStatLabel}>Tiles Placed</Text>
              </View>
              <View style={styles.gameOverStatDivider} />
              <View style={styles.gameOverStatItem}>
                <View style={styles.gameOverStatIconContainer}>
                  <Text style={styles.gameOverStatIcon}>💥</Text>
                </View>
                <Text style={styles.gameOverStatValue}>
                  {typeof gameStats?.chainReactions === 'number' ? gameStats.chainReactions : 0}
                </Text>
                <Text style={styles.gameOverStatLabel}>Chain Reactions</Text>
              </View>
              
              {/* Right Graffiti */}
              <View style={styles.rightGraffiti}>
                <Text style={styles.sideGraffitiText}>🚀</Text>
                <Text style={styles.sideGraffitiText}>⚡</Text>
              </View>
            </View>
            
            {/* Enhanced Action Button */}
            <View style={styles.buttonAreaContainer}>
              {/* Button Graffiti */}
              <View style={styles.buttonGraffitiLeft}>
                <Text style={styles.buttonGraffitiText}>🔥</Text>
                <Text style={styles.buttonGraffitiText}>💫</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.gameOverRestartBtn} 
                onPress={() => {
                  try {
                    resetGame();
                  } catch (error) {
                    console.warn('Game over restart error:', error);
                    // Force reset to safe state
                    try {
                      setBoard(Array.from({ length: 5 }, () => Array(4).fill(0)));
                      setScore(0);
                      setGameOver(false);
                    } catch (fallbackError) {
                      console.error('Critical error in game over restart fallback:', fallbackError);
                    }
                  }
                }}
              >
                <View style={styles.gameOverButtonGlow} />
                <Text style={styles.gameOverRestartText}>PLAY AGAIN</Text>
              </TouchableOpacity>
              
              {/* Button Graffiti */}
              <View style={styles.buttonGraffitiRight}>
                <Text style={styles.buttonGraffitiText}>⭐</Text>
                <Text style={styles.buttonGraffitiText}>🎮</Text>
              </View>
            </View>
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
    bottom: screenWidth >= 768 ? 80 : 40, // Reverted back to original spacing
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
  
  // Game over screen styles - Matching Pause Modal Design System
  gameOverContainer: {
    backgroundColor: 'rgba(16, 20, 36, 0.98)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: 'rgba(74, 144, 226, 0.6)',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 20,
    position: 'relative',
    overflow: 'hidden',
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
  


  // Enhanced Game Over Styles - Matching Pause Modal Design System
  gameOverTitleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  gameOverTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: '#4A90E2',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  gameOverTitleUnderline: {
    width: '60%',
    height: 2,
    backgroundColor: '#4A90E2',
    borderRadius: 1,
    marginTop: 8,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 5,
  },
  graffitiContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    gap: 12,
  },
  graffitiText: {
    fontSize: 24,
    color: '#FFD700',
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
    transform: [{ rotate: '15deg' }],
  },
  graffitiStar1: {
    transform: [{ rotate: '-20deg' }],
    color: '#FF6B6B',
    textShadowColor: '#FF6B6B',
  },
  graffitiStar2: {
    transform: [{ rotate: '25deg' }],
    color: '#4ECDC4',
    textShadowColor: '#4ECDC4',
  },
  graffitiLightning: {
    transform: [{ rotate: '10deg' }],
    color: '#FFE66D',
    textShadowColor: '#FFE66D',
  },
  graffitiPlanet: {
    transform: [{ rotate: '-15deg' }],
    color: '#95E1D3',
    textShadowColor: '#95E1D3',
  },
  graffitiRocket: {
    transform: [{ rotate: '30deg' }],
    color: '#F38181',
    textShadowColor: '#F38181',
  },
  gameOverScoreSection: {
    alignItems: 'center',
    marginBottom: 35,
  },
  gameOverFinalScoreLabel: {
    color: '#B0C4DE',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 1,
    textShadowColor: 'rgba(176, 196, 222, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  gameOverFinalScoreText: {
    color: '#FFD700',
    fontSize: 48,
    fontWeight: '800',
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    letterSpacing: 2,
  },
  newRecordContainer: {
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.6)',
  },
  newRecordText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
    textShadowColor: 'rgba(76, 175, 80, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  newRecordGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderRadius: 22,
    zIndex: -1,
  },
  gameOverStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginBottom: 40,
    gap: 32,
  },
  gameOverStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  gameOverStatIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#1a365d',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(74, 144, 226, 0.6)',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  gameOverStatIcon: {
    fontSize: 28,
    color: '#FFD700',
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  gameOverStatValue: {
    color: '#FFD700',
    fontSize: 28,
    fontWeight: '700',
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
    marginBottom: 4,
  },
  gameOverStatLabel: {
    color: '#B0C4DE',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
    textShadowColor: 'rgba(176, 196, 222, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },
  gameOverStatDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#555',
  },
  
  // Side Graffiti Styles
  leftGraffiti: {
    position: 'absolute',
    left: -30,
    top: '50%',
    transform: [{ translateY: -20 }],
    alignItems: 'center',
    gap: 8,
  },
  rightGraffiti: {
    position: 'absolute',
    right: -30,
    top: '50%',
    transform: [{ translateY: -20 }],
    alignItems: 'center',
    gap: 8,
  },
  sideGraffitiText: {
    fontSize: 20,
    color: '#FFD700',
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
    transform: [{ rotate: '15deg' }],
  },
  
  buttonAreaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
  },
  buttonGraffitiLeft: {
    position: 'absolute',
    left: -30,
    alignItems: 'center',
    gap: 8,
  },
  buttonGraffitiRight: {
    position: 'absolute',
    right: -30,
    alignItems: 'center',
    gap: 8,
  },
  buttonGraffitiText: {
    fontSize: 18,
    color: '#FFD700',
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
    transform: [{ rotate: '20deg' }],
  },
  cosmicBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    opacity: 0.1,
    zIndex: -1,
  },
  cosmicStar: {
    fontSize: 16,
    color: '#4A90E2',
    textShadowColor: '#4A90E2',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  gameOverRestartBtn: {
    backgroundColor: 'rgba(74, 144, 226, 0.3)',
    borderWidth: 3,
    borderColor: 'rgba(74, 144, 226, 0.8)',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginVertical: 10,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
  },
  gameOverButtonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 12,
  },
  gameOverRestartText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(74, 144, 226, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },

});

export default DropNumberBoard; 