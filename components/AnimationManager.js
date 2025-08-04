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

    // Clear any existing animations first to prevent conflicts
    clearMergeAnimations();
    
    // Generate unique IDs using counter
    setAnimationCounter(prev => prev + 1);
    const baseId = `elements-collision-${Date.now()}-${animationCounter}`;
    const createdAt = Date.now(); // Add timestamp for tracking
    
    // Create collision animations for merging planets with movement toward center
    const mergingAnimations = mergingTilesPositions.map((pos, index) => {
      const scaleAnim = new Animated.Value(1);
      const opacityAnim = new Animated.Value(1);
      const moveXAnim = new Animated.Value(0);
      const moveYAnim = new Animated.Value(0);
      const glowAnim = new Animated.Value(0);
      
      return {
        id: `${baseId}-planet-${index}`,
        row: pos.row,
        col: pos.col,
        value: pos.value,
        scale: scaleAnim,
        opacity: opacityAnim,
        moveX: moveXAnim,
        moveY: moveYAnim,
        glow: glowAnim,
        targetRow: row,
        targetCol: col,
        createdAt, // Add timestamp
      };
    });
    
    // Create result planet animation with spectacular entrance
    const resultScaleAnim = new Animated.Value(0);
    const resultOpacityAnim = new Animated.Value(0);
    const resultGlowAnim = new Animated.Value(0);
    const resultRotateAnim = new Animated.Value(0);
    
    const resultAnimation = {
      id: `${baseId}-result`,
      row,
      col,
      value,
      scale: resultScaleAnim,
      opacity: resultOpacityAnim,
      glow: resultGlowAnim,
      rotate: resultRotateAnim,
      createdAt, // Add timestamp
    };
    
    // Create collision effects for visual impact
    const collisionEffect = {
      id: `${baseId}-collision`,
      row,
      col,
      shockwave: new Animated.Value(0),
      sparks: new Animated.Value(0),
      flash: new Animated.Value(0),
      energyRing: new Animated.Value(0),
      opacity: new Animated.Value(1),
    };
    
    // Set animations
    setMergeAnimations([...mergingAnimations, resultAnimation]);
    setCollisionEffects([collisionEffect]);
    
    // Animation timing - Restored to old system's responsive timing
    // Use the original 120ms timing for chain reactions like the old createMergeAnimation
    const duration = isChainReaction ? 120 : 180; // Back to original 120ms for chains!
    const moveDuration = duration * 0.25;  // 30ms for chain, 45ms for normal - much faster
    const collisionDuration = duration * 0.15; // 18ms for chain, 27ms for normal  
    const birthDuration = duration * 0.6; // 72ms for chain, 108ms for normal
    
    // PHASE 1: GRAVITATIONAL ATTRACTION - Planets move toward collision center
    const attractionPhase = mergingAnimations.map(anim => {
      // Calculate movement toward collision center
      const deltaX = (anim.targetCol - anim.col) * (CELL_SIZE * 0.4);
      const deltaY = (anim.targetRow - anim.row) * (CELL_SIZE * 0.4);
      
      return Animated.parallel([
        // Move toward center
        Animated.timing(anim.moveX, {
          toValue: deltaX,
          duration: moveDuration,
          useNativeDriver: false,
        }),
        Animated.timing(anim.moveY, {
          toValue: deltaY,
          duration: moveDuration,
          useNativeDriver: false,
        }),
        // Build up energy glow
        Animated.timing(anim.glow, {
          toValue: 1,
          duration: moveDuration,
          useNativeDriver: false,
        }),
        // Slight scale up from gravitational forces
        Animated.timing(anim.scale, {
          toValue: 1.15,
          duration: moveDuration,
          useNativeDriver: false,
        }),
      ]);
    });
    
    // PHASE 2: COLLISION MOMENT - Dramatic impact with effects
    const collisionPhase = [
      // Planets rapidly shrink (but don't fade out completely to avoid brightness drops)
      ...mergingAnimations.map(anim => 
        Animated.parallel([
          Animated.timing(anim.scale, {
            toValue: 0.2,
            duration: collisionDuration,
            useNativeDriver: false,
          }),
          // Reduced opacity fade instead of complete disappearance
          Animated.timing(anim.opacity, {
            toValue: 0.3, // Keep some visibility to prevent brightness drops
            duration: collisionDuration,
            useNativeDriver: false,
          }),
        ])
      ),
      // Collision visual effects
      Animated.parallel([
        // Bright flash at moment of impact
        Animated.sequence([
          Animated.timing(collisionEffect.flash, {
            toValue: 1,
            duration: collisionDuration * 0.3,
            useNativeDriver: false,
          }),
          Animated.timing(collisionEffect.flash, {
            toValue: 0,
            duration: collisionDuration * 0.7,
            useNativeDriver: false,
          }),
        ]),
        // Expanding shockwave
        Animated.timing(collisionEffect.shockwave, {
          toValue: 1,
          duration: collisionDuration * 1.5,
          useNativeDriver: false,
        }),
        // Energy sparks bursting outward
        Animated.timing(collisionEffect.sparks, {
          toValue: 1,
          duration: collisionDuration,
          useNativeDriver: false,
        }),
        // Energy ring expansion
        Animated.timing(collisionEffect.energyRing, {
          toValue: 1,
          duration: collisionDuration * 1.2,
          useNativeDriver: false,
        }),
      ]),
    ];
    
    // PHASE 3: STELLAR FORMATION - New planet emerges dramatically
    const formationPhase = [
      // Result planet dramatic entrance
      Animated.parallel([
        // Scale up with overshoot and settle
        Animated.sequence([
          Animated.timing(resultScaleAnim, {
            toValue: 1.4,
            duration: birthDuration * 0.4,
            useNativeDriver: false,
          }),
          Animated.timing(resultScaleAnim, {
            toValue: 0.9,
            duration: birthDuration * 0.3,
            useNativeDriver: false,
          }),
          Animated.timing(resultScaleAnim, {
            toValue: 1,
            duration: birthDuration * 0.3,
            useNativeDriver: false,
          }),
        ]),
        // Opacity fade in
        Animated.timing(resultOpacityAnim, {
          toValue: 1,
          duration: birthDuration * 0.6,
          useNativeDriver: false,
        }),
        // Glow effect
        Animated.sequence([
          Animated.timing(resultGlowAnim, {
            toValue: 1,
            duration: birthDuration * 0.4,
            useNativeDriver: false,
          }),
          Animated.timing(resultGlowAnim, {
            toValue: 0.1,
            duration: birthDuration * 0.6,
            useNativeDriver: false,
          }),
        ]),
        // Rotation effect
        Animated.timing(resultRotateAnim, {
          toValue: 1,
          duration: birthDuration,
          useNativeDriver: false,
        }),
      ]),
    ];
    
    // PHASE 4: CLEANUP - Fast fade out like the old system
    const cleanupPhase = [
      Animated.timing(collisionEffect.opacity, {
        toValue: 0,
        duration: isChainReaction ? 60 : 120, // Much faster cleanup for chains
        useNativeDriver: false,
      }),
    ];
    
    // Execute the enhanced collision sequence
    Animated.sequence([
      Animated.parallel(attractionPhase),
      Animated.parallel(collisionPhase),
      Animated.parallel(formationPhase),
      Animated.parallel(cleanupPhase),
    ]).start(() => {
      // Immediate cleanup like the old createMergeAnimation system
      // No extra delays for responsive chain merge timing
      setMergeAnimations(prev => prev.filter(anim => !anim.id.startsWith(baseId)));
      setCollisionEffects([]);
      setEnergyBursts([]);
      
      // Immediate callback like the old system
      if (onComplete) {
        onComplete();
      }
    });
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