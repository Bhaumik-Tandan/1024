import { useState, useRef } from 'react';
import { Animated } from 'react-native';
import { ROWS, COLS, CELL_SIZE } from './constants';
import { GAME_CONFIG } from './GameRules';

export const useAnimationManager = () => {
  const [falling, setFalling] = useState(null);
  const [mergingTiles, setMergingTiles] = useState([]);
  const [mergeResult, setMergeResult] = useState(null);
  const [mergeAnimations, setMergeAnimations] = useState([]);
  const [collisionEffects, setCollisionEffects] = useState([]); // New state for collision effects
  const [energyBursts, setEnergyBursts] = useState([]); // New state for energy bursts
  const [animationCounter, setAnimationCounter] = useState(0);
  
  // Add debouncing to prevent useInsertionEffect conflicts
  const animationTimeoutRef = useRef(null);
  const isAnimatingRef = useRef(false);

  const startFallingAnimation = (col, value, toRow, isFastDrop = false) => {
    const anim = new Animated.Value(0);
    const fallingTile = { col, value, anim, toRow, fastDrop: isFastDrop };
    setFalling(fallingTile);
    
    Animated.timing(anim, {
      toValue: toRow * (CELL_SIZE + 8),
      duration: isFastDrop ? GAME_CONFIG.TIMING.FAST_DROP_DURATION : GAME_CONFIG.TIMING.SLOW_FALL_DURATION,
      useNativeDriver: false, // Required for layout animations
    }).start(({ finished }) => {
      if (finished) {
        return fallingTile;
      }
    });
    
    return fallingTile;
  };

  const updateFallingCol = (col, board) => {
    if (!falling) return;
    
    let row = ROWS - 1;
    while (row >= 0 && board[row][col] !== 0) row--;
    if (row < 0) return;
    
    const newFalling = { ...falling, col, toRow: row };
    setFalling(newFalling);
    
    Animated.timing(falling.anim, {
      toValue: row * (CELL_SIZE + 8),
      duration: 150,
      useNativeDriver: false, // Required for layout animations
    }).start();
  };

  const fastDropAnimation = (col, board) => {
    if (!falling || falling.fastDrop) return;
    
    let row = ROWS - 1;
    while (row >= 0 && board[row][col] !== 0) row--;
    if (row < 0) return;
    
    const newFalling = { ...falling, col, toRow: row, fastDrop: true };
    setFalling(newFalling);
    
    Animated.timing(falling.anim, {
      toValue: row * (CELL_SIZE + 8),
      duration: 200,
      useNativeDriver: false, // Required for layout animations
    }).start();
  };

  const clearFalling = () => {
    try {
      if (falling && falling.anim && falling.anim.stopAnimation) {
        falling.anim.stopAnimation();
      }
      setFalling(null);
    } catch (error) {
      console.warn('Error clearing falling animation:', error);
      setFalling(null);
    }
  };

  const createMergeAnimation = (row, col, value, count, direction) => {
    const mergeAnim = new Animated.Value(1);
    const scaleAnim = new Animated.Value(1);
    
    setAnimationCounter(prev => prev + 1);
    const mergingTile = {
      row,
      col,
      value,
      count,
      direction,
      anim: mergeAnim,
      scale: scaleAnim,
      id: `legacy-merge-${Date.now()}-${animationCounter}`,
    };
    
    setMergingTiles(prev => [...prev, mergingTile]);
    
    Animated.parallel([
      Animated.timing(mergeAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true, // PERFORMANCE: Use native driver for opacity
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 60,
          useNativeDriver: true, // PERFORMANCE: Use native driver for scale
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 60,
          useNativeDriver: true, // PERFORMANCE: Use native driver for scale
        }),
      ]),
    ]).start(() => {
      setMergingTiles(prev => prev.filter(tile => tile.id !== mergingTile.id));
    });
  };

  // PERFORMANCE OPTIMIZED COLLISION ANIMATION SYSTEM
  const showMergeResultAnimation = (row, col, value, mergingTilesPositions = [], isChainReaction = false, onComplete = null) => {
    // PERFORMANCE: Skip complex animations for large chain reactions to improve responsiveness
    if (isChainReaction && mergingTilesPositions.length >= GAME_CONFIG.TIMING.LARGE_CHAIN_THRESHOLD) {
      // Use ultra-simple animation for large chain reactions
      createMergeAnimation(row, col, value, mergingTilesPositions.length, 'up');
      if (onComplete) {
        // Very short delay for large chain reactions to prevent conflicts
        setTimeout(onComplete, 80); // Reduced from 150ms to 80ms
      }
      return;
    }

    // Debounce to prevent useInsertionEffect conflicts during rapid chain reactions
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    
    // Clear any existing animations first to prevent conflicts
    clearMergeAnimations();
    
    // Use setTimeout to defer state updates and prevent useInsertionEffect conflicts
    animationTimeoutRef.current = setTimeout(() => {
      // Generate unique IDs using counter
      setAnimationCounter(prev => prev + 1);
      const baseId = `elements-collision-${Date.now()}-${animationCounter}`;
      const createdAt = Date.now(); // Add timestamp for tracking
      
      // PERFORMANCE: Simplified collision animations for merging planets
      const mergingAnimations = mergingTilesPositions.slice(0, 3).map((pos, index) => { // Limit to 3 tiles max
        const scaleAnim = new Animated.Value(1);
        const opacityAnim = new Animated.Value(1);
        const glowAnim = new Animated.Value(0);
        
        return {
          id: `${baseId}-planet-${index}`,
          row: pos.row,
          col: pos.col,
          value: pos.value,
          scale: scaleAnim,
          opacity: opacityAnim,
          glow: glowAnim,
          targetRow: row,
          targetCol: col,
          createdAt, // Add timestamp
        };
      });
      
      // PERFORMANCE: Simplified result planet animation
      const resultScaleAnim = new Animated.Value(0);
      const resultOpacityAnim = new Animated.Value(0);
      const resultGlowAnim = new Animated.Value(0);
      
      const resultAnimation = {
        id: `${baseId}-result`,
        row,
        col,
        value,
        scale: resultScaleAnim,
        opacity: resultOpacityAnim,
        glow: resultGlowAnim,
        createdAt, // Add timestamp
      };
      
      // PERFORMANCE: Simplified collision effects
      const collisionEffect = {
        id: `${baseId}-collision`,
        row,
        col,
        shockwave: new Animated.Value(0),
        flash: new Animated.Value(0),
        opacity: new Animated.Value(1),
      };
      
      // Set animations with debounced state updates
      setMergeAnimations([...mergingAnimations, resultAnimation]);
      setCollisionEffects([collisionEffect]);
      
      // PERFORMANCE: Optimized animation timing for better responsiveness
      const duration = isChainReaction ? 80 : 140; // Even faster for chains (reduced from 100ms)
      const moveDuration = duration * 0.2;  // 16ms for chain, 28ms for normal
      const collisionDuration = duration * 0.15; // 12ms for chain, 21ms for normal  
      const birthDuration = duration * 0.65; // 52ms for chain, 91ms for normal
      
      // PERFORMANCE: Simplified collision sequence - no complex attraction phase for chains
      const collisionPhase = [
        // Planets rapidly shrink
        ...mergingAnimations.map(anim => 
          Animated.parallel([
            Animated.timing(anim.scale, {
              toValue: 0.1,
              duration: collisionDuration,
              useNativeDriver: true, // PERFORMANCE: Use native driver
            }),
            Animated.timing(anim.opacity, {
              toValue: 0.2,
              duration: collisionDuration,
              useNativeDriver: true, // PERFORMANCE: Use native driver
            }),
          ])
        ),
        // Simple flash effect
        Animated.sequence([
          Animated.timing(collisionEffect.flash, {
            toValue: 1,
            duration: collisionDuration * 0.4,
            useNativeDriver: true, // PERFORMANCE: Use native driver
          }),
          Animated.timing(collisionEffect.flash, {
            toValue: 0,
            duration: collisionDuration * 0.6,
            useNativeDriver: true, // PERFORMANCE: Use native driver
          }),
        ]),
        // Simple shockwave
        Animated.timing(collisionEffect.shockwave, {
          toValue: 1,
          duration: collisionDuration * 1.2,
          useNativeDriver: true, // PERFORMANCE: Use native driver
        }),
      ];
      
      // PERFORMANCE: Simplified formation - faster planet emergence
      const formationPhase = [
        Animated.parallel([
          // Simple scale up
          Animated.timing(resultScaleAnim, {
            toValue: 1,
            duration: birthDuration,
            useNativeDriver: true, // PERFORMANCE: Use native driver
          }),
          // Simple opacity fade in
          Animated.timing(resultOpacityAnim, {
            toValue: 1,
            duration: birthDuration * 0.7,
            useNativeDriver: true, // PERFORMANCE: Use native driver
          }),
          // Simple glow effect
          Animated.sequence([
            Animated.timing(resultGlowAnim, {
              toValue: 1,
              duration: birthDuration * 0.4,
              useNativeDriver: true, // PERFORMANCE: Use native driver
            }),
            Animated.timing(resultGlowAnim, {
              toValue: 0.1,
              duration: birthDuration * 0.6,
              useNativeDriver: true, // PERFORMANCE: Use native driver
            }),
          ]),
        ]),
      ];
      
      // PERFORMANCE: Faster cleanup
      const cleanupPhase = [
        Animated.timing(collisionEffect.opacity, {
          toValue: 0,
          duration: isChainReaction ? 30 : 60, // Very fast cleanup for chains (reduced from 40ms)
          useNativeDriver: true, // PERFORMANCE: Use native driver
        }),
      ];
      
      // Execute the optimized collision sequence
      Animated.sequence([
        Animated.parallel(collisionPhase),
        Animated.parallel(formationPhase),
        Animated.parallel(cleanupPhase),
      ]).start(() => {
        // Immediate cleanup for responsive timing
        setMergeAnimations(prev => prev.filter(anim => !anim.id.startsWith(baseId)));
        setCollisionEffects([]);
        setEnergyBursts([]);
        
        // Immediate callback
        if (onComplete) {
          onComplete();
        }
      });
    }, isChainReaction ? 3 : 1); // Very small delay for chain reactions (reduced from 5ms)
  };

  const clearMergeAnimations = () => {
    try {
      // Clear any pending animation timeout
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
      
      // Stop any ongoing animations before clearing
      mergeAnimations.forEach(anim => {
        if (anim.scale && anim.scale.stopAnimation) {
          anim.scale.stopAnimation();
        }
        if (anim.opacity && anim.opacity.stopAnimation) {
          anim.opacity.stopAnimation();
        }
        if (anim.glow && anim.glow.stopAnimation) {
          anim.glow.stopAnimation();
        }
      });
      
      // Clear collision effects
      collisionEffects.forEach(effect => {
        if (effect.shockwave && effect.shockwave.stopAnimation) {
          effect.shockwave.stopAnimation();
        }
        if (effect.flash && effect.flash.stopAnimation) {
          effect.flash.stopAnimation();
        }
        if (effect.opacity && effect.opacity.stopAnimation) {
          effect.opacity.stopAnimation();
        }
      });
      
      // Clear energy bursts
      energyBursts.forEach(burst => {
        if (burst.scale && burst.scale.stopAnimation) {
          burst.scale.stopAnimation();
        }
        if (burst.opacity && burst.opacity.stopAnimation) {
          burst.opacity.stopAnimation();
        }
      });
      
      setMergeAnimations([]);
      setCollisionEffects([]);
      setEnergyBursts([]);
      setAnimationCounter(0);
    } catch (error) {
      console.warn('Error clearing merge animations:', error);
      // Force clear even if there's an error
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
      setMergeAnimations([]);
      setCollisionEffects([]);
      setEnergyBursts([]);
    }
  };

  return {
    falling,
    setFalling,
    mergingTiles,
    mergeResult,
    mergeAnimations,
    collisionEffects, // Export collision effects for rendering
    energyBursts, // Export energy bursts for rendering
    startFallingAnimation,
    updateFallingCol,
    fastDropAnimation,
    clearFalling,
    createMergeAnimation,
    showMergeResultAnimation,
    clearMergeAnimations,
  };
}; 