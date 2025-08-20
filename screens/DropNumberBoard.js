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
import comprehensiveGameAnalytics from '../utils/comprehensiveGameAnalytics';
import BackgroundMusicManager from '../utils/backgroundMusicManager';
import { useTutorial } from '../components/useTutorial';
import { TutorialOverlay } from '../components/TutorialOverlay';



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

  // Add mounted state tracking to prevent state updates after unmount
  const [isMounted, setIsMounted] = useState(true);

  const boardRef = useRef(null);
  const [boardLeft, setBoardLeft] = useState(0);
  
  // Game state variables
  const { saveGame, loadSavedGame, updateScore, updateHighestBlock, clearSavedGame, highScore } = useGameStore();
  
  // Tutorial system
  const {
    isTutorialActive,
    currentStep,
    allowedLaneIndex,
    isGameFrozen,
    hasCompletedOnboarding,
    isInitialized,
    startTutorial,
    advanceStep,
    nextStep,
    endTutorial,
    setAllowedLane,
    resetTutorial,
    resetTutorialCompletion,
    tutorialController,
  } = useTutorial();

  // Tutorial state
  const [tutorialOverlayVisible, setTutorialOverlayVisible] = useState(true);
  const [completedSteps, setCompletedSteps] = useState(new Set()); // Track completed steps
  const [step3SetupTime, setStep3SetupTime] = useState(0); // Track when Step 3 was set up
  const [isResettingTutorial, setIsResettingTutorial] = useState(false);
  
  // Handle orientation changes and dynamic grid resizing
  useEffect(() => {
    try {
      const subscription = Dimensions.addEventListener('change', ({ window }) => {
        try {
          const newGridConfig = getCurrentGridConfig();
          
          // Only update if grid configuration actually changed
          if (newGridConfig.ROWS !== gridConfig.ROWS || newGridConfig.COLS !== gridConfig.COLS) {
            setGridConfig(newGridConfig);
            
            // Update board size, preserving existing tiles where possible
            setBoard(prevBoard => {
              try {
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
              } catch (error) {
                // Board resize error
                return Array.from({ length: newGridConfig.ROWS }, () => Array(newGridConfig.COLS).fill(0));
              }
            });
            
            // Clear any falling animations that might be out of bounds
            clearFallingRef.current();
            clearMergeAnimationsRef.current();
          }
        } catch (error) {
          // Orientation change error
        }
      });

      return () => subscription?.remove();
    } catch (error) {
      // Orientation effect setup error
    }
  }, [gridConfig]); // Removed function dependencies to prevent infinite loops

  // Tutorial board change watcher
  useEffect(() => {
    if (isTutorialActive && board && board.length > 0 && !isResettingTutorial) {
      // Check if we should advance the tutorial based on board state
      const stepSetup = tutorialController.getStepSetup(currentStep);
      
      // For step 1: if we have a "4" (merged 2+2), advance
      if (currentStep === 1 && !completedSteps.has(1)) {
        const hasMerged = board.some(row => row.some(cell => cell === 4));
                  if (hasMerged) {
            setCompletedSteps(prev => new Set([...prev, 1])); // Mark step 1 as completed
          setTimeout(() => {
            if (isTutorialActive && currentStep === 1 && !isResettingTutorial) { // Double check current step and reset flag
              nextStep(); // Advance to next step
            }
          }, 200); // Wait 200ms for merge animation
        }
      }
      
      // For step 2: if we have an "8" (combo), advance
      if (currentStep === 2 && !completedSteps.has(2)) {
        // Check for the combo: "2" + "2" = "4", then "4" + "4" = "8"
        const hasCombo = board.some(row => row.some(cell => cell === 8));
        
        if (hasCombo) {
          setCompletedSteps(prev => new Set([...prev, 2])); // Mark step 2 as completed
          setTimeout(() => {
            if (isTutorialActive && currentStep === 2 && !isResettingTutorial) { // Double check current step and reset flag
              nextStep(); // Advance to next step
            }
          }, 200); // Wait 200ms for merge animation
        }
      }
      
      // Step 3 completion is now handled in handleTileLanded when actual merges happen
    }
  }, [board, currentStep, isTutorialActive, completedSteps, isResettingTutorial]);

  // Tutorial step change handler
  useEffect(() => {
    if (isTutorialActive && currentStep >= 1 && !isResettingTutorial) {
      // Record setup time for Step 3 to prevent immediate completion
      if (currentStep === 3) {
        setStep3SetupTime(Date.now());
      }
      
      // Small delay to ensure smooth transition
      setTimeout(() => {
        if (isTutorialActive && !isResettingTutorial) { // Double check tutorial is still active and not resetting
          // Set up the board for the new step
          const stepBoard = tutorialController.getStepBoard(currentStep);
          setBoard(stepBoard);
          
          // Get step setup for shooter value
          const stepSetup = tutorialController.getStepSetup(currentStep);
          setNextBlock(stepSetup.shooterValue);
          setPreviewBlock(stepSetup.shooterValue);
          
          // Reset score for this step
          setScore(0);
          
          // Show tutorial overlay again
          setTutorialOverlayVisible(true);
          
          // Update store with TutorialController's allowed lane
          setAllowedLane(stepSetup.allowedLaneIndex);
        }
      }, 500); // Increased delay for smoother transition
    }
  }, [currentStep, isTutorialActive, isResettingTutorial]);

  // Tutorial initialization
  useEffect(() => {
    if (isTutorialActive && !isResettingTutorial) {
      // Reset completed steps for new tutorial run
      setCompletedSteps(new Set());
      
      const stepSetup = tutorialController.getStepSetup(currentStep);
      
      // Set up the board for this step
      const stepBoard = tutorialController.getStepBoard(currentStep);
      setBoard(stepBoard);
      
      // Set next block to the shooter value
      setNextBlock(stepSetup.shooterValue);
      setPreviewBlock(stepSetup.shooterValue);
      
      // Reset score for this step
      setScore(0);
      
      // Hide guide text during tutorial
      setTutorialOverlayVisible(true);
      
      // Update tutorial overlay visibility
      setTutorialOverlayVisible(true);
      
      // Update store with TutorialController's allowed lane
      setAllowedLane(stepSetup.allowedLaneIndex);
    }
  }, [isTutorialActive, currentStep, hasCompletedOnboarding, isResettingTutorial]);

  // Board safety check for tutorial
  useEffect(() => {
    if (isTutorialActive && (!board || board.length === 0)) {
      // Board is not ready, set a default empty board
      const defaultBoard = Array.from({ length: gridConfig.ROWS }, () => Array(gridConfig.COLS).fill(0));
      setBoard(defaultBoard);
    }
  }, [isTutorialActive, board, gridConfig.ROWS, gridConfig.COLS]);

  // Handle transition to unified 5x4 grid for all devices
  useEffect(() => {
    if (board && board.length > 0 && (board.length !== 5 || board[0].length !== 4)) {
      // We're transitioning to the unified 5x4 grid
      // Create new 5x4 board and preserve existing tiles
      const newBoard = Array.from({ length: 5 }, () => Array(4).fill(0));
      
      // Copy existing tiles to their current positions (left-aligned)
      for (let row = 0; row < Math.min(board.length, 5); row++) {
        for (let col = 0; col < Math.min(board[row].length, 4); col++) {
          newBoard[row][col] = board[row][col];
        }
      }
      
      // Update the board with the new 5x4 size
      setBoard(newBoard);
      
      // Update grid config to match
      setGridConfig({ ROWS: 5, COLS: 4 });
    }
  }, [board]);

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

  // Initialize background music manager for continuous playback
  // Background music will play continuously in the background regardless of game state
  useEffect(() => {
    const initBackgroundMusic = async () => {
      try {

        
        // Create and initialize background music manager
        if (!global.backgroundMusicManager) {
          global.backgroundMusicManager = new BackgroundMusicManager();

          
          await global.backgroundMusicManager.initialize();

          
          // Get settings from gameStore
          const { backgroundMusicEnabled } = useGameStore.getState();
          
          // Start playing background music if enabled - it will continue playing continuously
          if (backgroundMusicEnabled) {
            await global.backgroundMusicManager.play();
          } else {
            // Background music is disabled in settings
          }
        } else {
          // Background music manager already exists
        }
      } catch (error) {
        // Background music initialization failed
      }
    };
    
    // Add a small delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      initBackgroundMusic();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Sync background music with settings changes (volume, enable/disable)
  // Note: When enabled, music plays continuously regardless of game state
  useEffect(() => {
    const syncBackgroundMusic = async () => {
      try {
        if (global.backgroundMusicManager) {
          const { backgroundMusicEnabled, backgroundMusicVolume } = useGameStore.getState();
          
          // Update volume if changed
          await global.backgroundMusicManager.setVolume(backgroundMusicVolume);
          
          // Start/stop music based on setting - when enabled, it plays continuously
          if (backgroundMusicEnabled) {
            if (!global.backgroundMusicManager.isPlaying) {
              await global.backgroundMusicManager.play();
            }
          } else {
            if (global.backgroundMusicManager.isPlaying) {
              await global.backgroundMusicManager.pause();
            }
          }
        }
      } catch (error) {
        // Background music sync failed
      }
    };
    
    // Sync when component mounts and when settings might change
    syncBackgroundMusic();
  }, []);

  // Load saved game functionality - restore game state on mount
  useEffect(() => {
    const loadGame = async () => {
      try {
        const savedGame = loadSavedGame();
        if (savedGame && savedGame.board && savedGame.board.length > 0) {
          // Restore game state
          setBoard(savedGame.board);
          // Only restore score if it's a valid number greater than 0
          const savedScore = typeof savedGame.score === 'number' && savedGame.score > 0 ? savedGame.score : 0;
          setScore(savedScore);
          setNextBlock(savedGame.nextBlock || getRandomBlockValue());
          setPreviewBlock(savedGame.previewBlock || getRandomBlockValue());
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
          
          // Check if game was over
          if (GameValidator.isGameOver(savedGame.board)) {
            setGameOver(true);
          }
        }
      } catch (error) {
        // Failed to load saved game
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
          const gameState = {
            board,
            score,
            nextBlock,
            previewBlock,
            gameStats,
            maxTileAchieved,
            floorLevel,
            currentMinSpawn,
            timestamp: Date.now()
          };
          
          try {
            saveGame(gameState);
          } catch (error) {
            // Failed to save game on screen leave
          }
        }
      };
    }, [board, score, nextBlock, previewBlock, gameStats, maxTileAchieved, floorLevel, currentMinSpawn, isMounted, gameOver, saveGame])
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
          previewBlock,
          gameStats,
          maxTileAchieved,
          floorLevel,
          currentMinSpawn,
          timestamp: Date.now()
        };
        
        try {
          saveGame(gameState);
        } catch (error) {
          // Failed to save game on app background
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [board, score, nextBlock, previewBlock, gameStats, maxTileAchieved, floorLevel, currentMinSpawn, isMounted, gameOver, saveGame]);



  // Auto-save functionality - save game state whenever it changes
  useEffect(() => {
    if (isMounted && !gameOver) {
      const gameState = {
        board,
        score,
        nextBlock,
        previewBlock,
        gameStats,
        maxTileAchieved,
        floorLevel,
        currentMinSpawn,
        timestamp: Date.now()
      };
      
      try {
        saveGame(gameState);
        // Only update store score when game is active and score is meaningful
        // Never update store with score 0 to prevent interference
        if (score > 0 && !gameOver && isMounted) {
          updateScore(score);
        }
        // Update highest block achieved
        if (maxTileAchieved > 0) {
          updateHighestBlock(maxTileAchieved);
        }
      } catch (error) {
        // Auto-save failed
      }
    }
  }, [board, score, nextBlock, previewBlock, gameStats, maxTileAchieved, floorLevel, currentMinSpawn, isMounted, gameOver, saveGame, updateScore, updateHighestBlock]);

  // Pause modal handlers
  const handlePause = () => {
    try {
      setIsPaused(true);
      soundManager.playSoundIfEnabled('pauseResume');
      
      // Background music continues playing in background - no need to pause
      // The BackgroundMusicManager handles continuous playback automatically
      
      // Track game pause for analytics
      try {
        comprehensiveGameAnalytics.trackGamePause({
          score: score,
          highestTile: Math.max(...board.flat().filter(val => val && !isNaN(val))),
          tilesPlaced: gameStats.tilesPlaced,
          chainReactions: gameStats.chainReactions || 0,
        });
      } catch (analyticsError) {
        // Analytics error
      }
      
      // Save game state when pausing
      const gameState = {
        board,
        score,
        nextBlock,
        previewBlock,
        gameStats,
        maxTileAchieved,
        floorLevel,
        currentMinSpawn,
        timestamp: Date.now()
      };
      saveGame(gameState);
    } catch (error) {
      // Pause error
      setIsPaused(true); // Still pause even if sound fails
    }
  };

  const handleResume = () => {
    try {
      setIsPaused(false);
      soundManager.playSoundIfEnabled('pauseResume');
      
      // Background music continues playing in background - no need to resume
      // The BackgroundMusicManager handles continuous playback automatically
      
      // Track game resume for analytics
      try {
        comprehensiveGameAnalytics.trackGameResume();
      } catch (analyticsError) {
        // Analytics error
      }
    } catch (error) {
      // Resume error
      setIsPaused(false); // Still resume even if sound fails
    }
  };
  
  const handleRestart = () => {
    try {
      // Track game restart for analytics
      try {
        comprehensiveGameAnalytics.trackGameRestart();
      } catch (analyticsError) {
        // Analytics error
      }
      
      resetGame(); // Use the local reset function for comprehensive game reset
      setIsPaused(false); // Dismiss modal after restarting
    } catch (error) {
      // Restart error
      setIsPaused(false); // Still dismiss modal even if restart fails
    }
  }

  const handleHome = () => {
    try {
      // Track navigation to home for analytics
      try {
        comprehensiveGameAnalytics.trackScreenView('Home', 'Drop Number Board');
      } catch (analyticsError) {
        // Analytics error
      }
      
      // Save game state before going home
      const gameState = {
        board,
        score,
        nextBlock,
        previewBlock,
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
      // Home navigation error
      // Still dismiss modal and navigate even if save fails
      setIsPaused(false);
      navigation.navigate('Home');
    }
  };

  const handleClosePause = () => {
    try {
      setIsPaused(false);
    } catch (error) {
      // Close pause error
      // Force close if normal close fails
      setIsPaused(false);
    }
  };





  /**
   * Game loop: Spawn new tiles automatically
   * Uses timing configuration from GameRules
   */
  useEffect(() => {
    // Prevent infinite loops by checking if we're already processing
    if (falling || gameOver || isPaused) {
      return;
    }
    
    // Tutorial mode - spawn tiles normally but with guidance
    
    try {
      const spawnCol = Math.floor(COLS / 2); // Center column as per rules
      
      // Check for game over condition - check if top row is full
      if (GameValidator.isGameOver(board)) {
        setGameOver(true);
        try {
          soundManager.playSoundIfEnabled('gameOver');
          
          // Track game over for analytics
          comprehensiveGameAnalytics.trackGameEnd({
            finalScore: score,
            highestTile: Math.max(...board.flat().filter(val => val && !isNaN(val))),
            tilesPlaced: gameStats.tilesPlaced,
            chainReactions: gameStats.chainReactions || 0,
          });
        } catch (error) {
          // Game loop game over sound error
        }
        return;
      }
      
      // Track game start for analytics (only on first tile)
      if (score === 0 && gameStats.tilesPlaced === 0) {
        try {
          comprehensiveGameAnalytics.trackGameStart('normal', 'standard');
        } catch (analyticsError) {
          // Analytics error
        }
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
    } catch (error) {
      // Game loop error
      // Recover gracefully
      setGameOver(true);
      
      // Track error for analytics
      try {
        comprehensiveGameAnalytics.trackError('game_loop_failed', error.message);
      } catch (analyticsError) {
        // Analytics error tracking failed
      }
    }
    // eslint-disable-next-line
  }, [falling, gameOver, isPaused, nextBlock]); // Removed isTutorialActive dependency

  /**
   * Cleanup touch timeout and set mounted state on component unmount
   */
  useEffect(() => {
    return () => {
      setIsMounted(false);
      
      // Track game end for analytics when component unmounts
      if (score > 0 || gameStats.tilesPlaced > 0) {
        try {
          const gameDuration = Date.now() - gameStats.startTime;
          comprehensiveGameAnalytics.trackGameEnd(score, maxTileAchieved, gameDuration, 'user_navigation');
        } catch (analyticsError) {
          // Analytics error on unmount
        }
      }
      
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
    try {
      // Touch sensitivity control - prevent rapid successive taps
      if (!isTouchEnabled) {
        return;
      }
      
      // Validate tap conditions
      if (!falling || falling.fastDrop || gameOver || isPaused) {
        return;
      }
      
      // Tutorial mode - allow normal gameplay with guidance
    
    // Emergency cleanup if animations are stuck - more aggressive
    try {
      if (mergeAnimations.length > 5) {
        clearMergeAnimationsRef.current();
      }
      
      // Additional emergency cleanup for any stuck animations over 200ms old
      const now = Date.now();
      const stuckAnimations = mergeAnimations.filter(anim => 
        now - (anim.createdAt || 0) > 200
      );
      if (stuckAnimations.length > 0) {
        clearMergeAnimationsRef.current();
      }
    } catch (error) {
      // Emergency cleanup error
      // Force cleanup if normal cleanup fails
      clearMergeAnimationsRef.current();
    }
    
    // Use the pre-calculated column from enhanced grid detection
    const targetColumn = event.nativeEvent.detectedColumn ?? 0; // Default to column 0 if detection fails
    
    // Use the existing logic but with the accurately detected column
    handleRowTap(0, targetColumn); // Row doesn't matter, only column
    } catch (error) {
      // Error in handleScreenTap - recover gracefully
      setIsTouchEnabled(true);
    }
  };

  /**
   * Handle user tapping any cell in a column to drop the tile in that column
   * Always drops from bottom - tap only selects the column, not the row
   * Includes touch sensitivity controls to prevent rapid successive taps
   */
  const handleRowTap = (targetRow, targetCol = null) => {
    try {
      // Touch sensitivity control - prevent rapid successive taps
      if (!isTouchEnabled) {
        return;
      }
      
      // Validate tap conditions
      if (!falling || falling.fastDrop || gameOver || isPaused) {
        return;
      }
      
      // Tutorial mode - allow normal gameplay with guidance
    
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
        // IMPORTANT: Return early to prevent any animation or tile landing
        return; // Column is full and no merge possible
      }
      // Set landing row to the bottom for the merge case
      landingRow = canMergeInFull.mergeRow;
    }
    
    // DOUBLE CHECK: If we somehow got here with a full column and no merge, block it
    if (landingRow === -1) {
      return;
    }
    
    // Remove drop sound from tap - it will play when tile reaches landing position
    
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
    
    // Update next block immediately when user taps (ONLY after validation passes)
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
    const animation = Animated.timing(falling.anim, {
      toValue: targetRowPosition,
      duration: GAME_CONFIG.TIMING.COSMIC_DROP_DURATION,
      useNativeDriver: false,
      easing: Easing.out(Easing.quad),
    });
    
    // Store animation reference for cleanup
    if (falling.animationRef) {
      falling.animationRef.stop();
    }
    falling.animationRef = animation;
    animation.start();
    
    // Handle landing after animation completes
    const landingTimeout = setTimeout(async () => {
      if (isMounted) {
        try {
          if (canMergeInFull) {
            // Special handling for full column merge
            await handleFullColumnTileLanded(landingRow, landingCol, tileValueToDrop);
          } else {
            // Normal tile landing
            handleTileLanded(landingRow, landingCol, tileValueToDrop);
          }
        } catch (error) {
          // Landing timeout error
          setIsTouchEnabled(true);
        } finally {
          clearFallingRef.current();
        }
      }
    }, GAME_CONFIG.TIMING.COSMIC_DROP_DURATION);
    
    // Store timeout reference for cleanup
    touchTimeoutRef.current = landingTimeout;
    } catch (error) {
      // Error in handleRowTap - recover gracefully
      setIsTouchEnabled(true);
      clearFallingRef.current();
    }
  };

  /**
   * Handle tutorial lane taps during the tutorial
   */
  const handleTutorialLaneTap = async (laneIndex) => {
    if (!isTutorialActive || laneIndex !== allowedLaneIndex) {
      return;
    }
    
    // Hide tutorial overlay immediately
    setTutorialOverlayVisible(false);
    
    // Let the normal game handle the drop by calling handleRowTap
    // This ensures all normal game mechanics (animation, sound, merge logic) work
    if (falling && !falling.fastDrop && !gameOver && !isPaused) {
      // Use the normal game drop logic but target the tutorial lane
      handleRowTap(0, laneIndex);
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
      // Adjacent tiles check error
      return false; // Safe fallback
    }
  };

  /**
   * Check if a tile can merge when dropped into a full column
   * @param {Array[]} board - The game board
   * @param {number} col - Column to check
   * @param {number} value - Value of the tile to drop
   * @returns {Object|null} - { canMerge: boolean, mergeRow: number } or null
   */
  const canMergeInFullColumn = (board, col, value) => {
    try {
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
        if (pos.row >= 0 && pos.row < ROWS && 
            pos.col >= 0 && pos.col < COLS && 
            board[pos.row] && board[pos.row][pos.col] === value) {
          return { canMerge: true, mergeRow: bottomRow };
        }
      }
      
      return null;
    } catch (error) {
      // Can merge in full column error
      return null; // Safe fallback
    }
  };

  /**
   * Handle tile landing and process all game logic
   * Uses the enhanced game engine with chain reactions and scoring
   */
  const handleTileLanded = (row, col, value) => {
    try {
      // Drop sound is already played when tile is placed in GameLogic.js
      // No need to play it again here
      
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
        
        // Check for Step 3 completion when a merge actually happens
        if (isTutorialActive && currentStep === 3 && !completedSteps.has(3)) {
          // Check if we have a big merge (16) after the actual merge action
          // In Step 3: Chain merge: 2+2=4, 4+4=8, 8+8=16
          const hasNewBigMerge = totalScore > 0 && newBoard.some(row => row.some(cell => cell === 16));
          
          if (hasNewBigMerge) {
            setCompletedSteps(prev => new Set([...prev, 3])); // Mark step 3 as completed
            
            // Tutorial completed! Save completion status and end tutorial
            setTimeout(() => {
              if (isTutorialActive && currentStep === 3) {
                // Complete the tutorial properly
                completeTutorial();
              }
            }, 1000); // Wait 1 second to show the success
          }
        }
        
        // Continuous chain merge encouragement (after Step 3 is completed)
        if (isTutorialActive && completedSteps.has(3) && totalScore > 0) {
          // Check for even bigger merges to encourage continued play
          const has32 = newBoard.some(row => row.some(cell => cell === 32));
          const has64 = newBoard.some(row => row.some(cell => cell === 64));
          const has128 = newBoard.some(row => row.some(cell => cell === 128));
          const has256 = newBoard.some(row => row.some(cell => cell === 256));
          const has512 = newBoard.some(row => row.some(cell => cell === 512));
          
          if (has512) {
            // LEGENDARY! User achieved 512! This is INSANE chain merging!
          } else if (has256) {
            // PHENOMENAL! User achieved 256! The chain merging is LEGENDARY!
          } else if (has128) {
            // INCREDIBLE! User achieved 128! This is amazing chain merging!
          } else if (has64) {
            // AMAZING! User achieved 64! Keep going for more chain merges!
          } else if (has32) {
            // GREAT! User achieved 32! The chain merging is working perfectly!
          }
        }
        
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
        

        
        // Check for game over condition
        if (GameValidator.isGameOver(newBoard)) {
          setGameOver(true);
          
          // Save final game state when game ends
          const finalGameState = {
            board: newBoard,
            score: newScore,
            nextBlock,
            previewBlock,
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
          saveGame(finalGameState);
          
          try {
            soundManager.playSoundIfEnabled('gameOver');
          } catch (error) {
            // Game over sound error
          }
        }
      }).catch(error => {
        // Error processing tile landing - recover gracefully
        setIsTouchEnabled(true);
        clearFallingRef.current();
      });
    } catch (error) {
      // Error in handleTileLanded - recover gracefully
      setIsTouchEnabled(true);
      clearFallingRef.current();
    }
  };

  /**
   * Handle tile landing in a full column when merging is possible
   * Uses the special full column drop logic
   */
  const handleFullColumnTileLanded = async (row, col, value) => {
    try {
      // Drop sound is already played when tile is placed in GameLogic.js
      // No need to play it again here
      
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
        if (GameValidator.isGameOver(newBoard)) {
          setGameOver(true);
          
          // Save final game state when game ends
          const finalGameState = {
            board: newBoard,
            score: newScore,
            nextBlock,
            previewBlock,
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
          saveGame(finalGameState);
          
          try {
            soundManager.playSoundIfEnabled('gameOver');
          } catch (error) {
            // Game over sound error
          }
        }
      } else {
        // Full column drop failed, should not happen if canMergeInFullColumn worked correctly
        // Error handled silently
      }
    } catch (error) {
      // Error in handleFullColumnTileLanded - recover gracefully
      setIsTouchEnabled(true);
      clearFallingRef.current();
    }
  };

  /**
   * Reset game to initial state
   * Uses GameHelpers for consistent initialization
   */
  const resetGame = () => {
    try {
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
      clearFallingRef.current();
      clearMergeAnimationsRef.current();
    
    // Floor system reset
    setCurrentMinSpawn(2);
    setFloorLevel(1);
    setMaxTileAchieved(0);
    
          // Clear saved game when resetting
      try {
        // Clear the saved game state
        clearSavedGame();
      } catch (error) {
        // Failed to clear saved game
      }
    
    // Enable touch
    setIsTouchEnabled(true);
    } catch (error) {
      // Error in resetGame - recover gracefully
      // Try to reset to a safe state
      setBoard(Array.from({ length: gridConfig.ROWS }, () => Array(gridConfig.COLS).fill(0)));
      setScore(0);
      setGameOver(false);
      setIsTouchEnabled(true);
    }
  };

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
      // Difficulty calculation error
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
            // Board layout error
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
          showGuide={showGuide && !isTutorialActive} // Hide guide during tutorial
          panHandlers={panResponder.panHandlers}
          isTouchEnabled={isTouchEnabled}
          isTutorialCompleted={!isTutorialActive} // Show completion message when tutorial is not active
        />
      </View>
      
      <OptimizedNextBlock nextBlock={nextBlock} />

              {/* ======================================== */}
        {/* DEVELOPMENT MODE BUTTON - COMMENTED OUT */}
        {/* ======================================== */}
        {/* 
        {__DEV__ && (
          <TouchableOpacity 
            style={styles.devModeButton}
            onPress={() => {
              // Check if board is currently in preview mode (has high values)
              const hasPreviewTiles = board.some(row => row.some(cell => cell > 64));
              
              if (hasPreviewTiles) {
                // Second click: Reset board to empty
                const emptyBoard = Array.from({ length: gridConfig.ROWS }, () => Array(gridConfig.COLS).fill(0));
                setBoard(emptyBoard);
                setScore(0);
                setGameOver(false);
              } else {
                // First click: Set the game matrix to preview mode tiles
                const previewValues = [128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144, 1048576];
                const newBoard = Array.from({ length: gridConfig.ROWS }, () => Array(gridConfig.COLS).fill(0));
                
                // Fill the board with preview values
                for (let row = 0; row < gridConfig.ROWS; row++) {
                  for (let col = 0; col < gridConfig.COLS; col++) {
                    const index = row * gridConfig.COLS + col;
                    if (index < previewValues.length) {
                      newBoard[row][col] = previewValues[index];
                    }
                  }
                }
                
                setBoard(newBoard);
                setScore(0); // Reset score when setting preview mode
                setGameOver(false); // Ensure game is not over
              }
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.devModeButtonText}>
              {board.some(row => row.some(cell => cell > 64)) ? 'RESET BOARD' : 'DEV MODE'}
            </Text>
            <Text style={styles.devModeButtonSubtext}>
              {board.some(row => row.some(cell => cell > 64)) ? 'Clear all tiles' : 'Fill with preview tiles'}
            </Text>
          </TouchableOpacity>
        )}
        */}

                {/* Tutorial Reset Button - Only visible in development */}
        {/* Debug: Reset Tutorial Button (Development Only) - COMMENTED OUT */}
        {/*
        {__DEV__ && (
          <TouchableOpacity 
            style={styles.tutorialResetButton}
            onPress={() => {
              // Reset tutorial completion status and restart tutorial
              resetTutorialCompletion();
              
              // Start tutorial immediately - the board safety check will handle it
              startTutorial();
              
              // Show tutorial overlay
              setTutorialOverlayVisible(true);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.tutorialResetButtonText}>RESET TUTORIAL</Text>
            <Text style={styles.tutorialResetButtonSubtext}>Restart tutorial from Step 1</Text>
          </TouchableOpacity>
        )}
        */}

            {/* Tutorial Overlay */}
      {isTutorialActive && tutorialOverlayVisible && (
        <TutorialOverlay
          isVisible={isTutorialActive}
          currentStep={currentStep}
          allowedLaneIndex={allowedLaneIndex}
          stepText={tutorialController.getStepSetup(currentStep).stepText}
          successText={tutorialController.getStepSetup(currentStep).successText}
          showSuccessText={false} // Will be controlled by tutorial logic
          onLaneTap={(laneIndex) => {
            // Special case: Continue Playing button was pressed
            if (laneIndex === -1) {
              endTutorial(); // End the tutorial
              return;
            }
            
            if (laneIndex === allowedLaneIndex) {
              // Handle tutorial lane tap
              handleTutorialLaneTap(laneIndex);
            } else {
              // Lane not allowed for current step
            }
          }}

        />
      )}
      
      
      




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
            <TouchableOpacity 
              style={styles.restartBtn} 
              onPress={() => {
                try {
                  resetGame();
                } catch (error) {
                  // Game over restart error
                  // Force reset to safe state
                  setBoard(Array.from({ length: gridConfig.ROWS }, () => Array(gridConfig.COLS).fill(0)));
                  setScore(0);
                  setGameOver(false);
                }
              }}
            >
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
    backgroundColor: 'rgba(26, 42, 78, 0.95)',
    borderRadius: screenWidth >= 768 ? 25 : 20, // Larger border radius for iPad
    paddingVertical: screenWidth >= 768 ? 20 : 12, // Even more padding for iPad
    paddingHorizontal: screenWidth >= 768 ? 30 : 20, // Larger horizontal padding for iPad
    width: screenWidth >= 768 ? 240 : 160, // Much wider for iPad
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: screenWidth >= 768 ? 20 : 15, // Larger shadow for iPad
    elevation: 15,
    borderWidth: screenWidth >= 768 ? 2 : 1, // Thicker border for iPad
    borderColor: 'rgba(74, 144, 226, 0.6)',
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
  
  // Enhanced header styling
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 15,
    marginHorizontal: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  
  scoreSection: {
    alignItems: 'center',
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.4)',
  },
  
  recordSection: {
    alignItems: 'center',
    backgroundColor: 'rgba(156, 39, 176, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(156, 39, 176, 0.4)',
  },
  
  scoreLabel: {
    color: '#B0C4DE',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  
  scoreValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    textShadowColor: 'rgba(74, 144, 226, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  recordLabel: {
    color: '#E1BEE7',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  
  recordValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    textShadowColor: 'rgba(156, 39, 176, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
  devModeButton: {
    position: 'absolute',
    bottom: screenWidth >= 768 ? 140 : 100, // Position above the next block
    right: 20,
    backgroundColor: 'rgba(255, 107, 53, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 53, 0.6)',
    zIndex: 100,
    alignItems: 'center',
    minWidth: 120,
  },
  devModeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 2,
  },
  devModeButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  tutorialResetButton: {
    position: 'absolute',
    bottom: screenWidth >= 768 ? 200 : 160, // Position above the dev mode button
    right: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.6)',
    zIndex: 100,
    alignItems: 'center',
    minWidth: 120,
  },
  tutorialResetButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 2,
  },
  tutorialResetButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.5,
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