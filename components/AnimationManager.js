import { useState, useRef } from 'react';
import { Animated } from 'react-native';
import { ROWS, COLS, CELL_SIZE } from './constants';
import { GAME_CONFIG } from './GameRules';
import * as Haptics from 'expo-haptics';

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
    
    // ENHANCED: Smart timing system based on merge complexity
    const calculateSmartTiming = (mergeType, tileCount, isChainReaction) => {
      const baseDuration = isChainReaction ? 150 : 220; // Increased base duration for better feel
      const complexityMultiplier = Math.min(tileCount * 0.2, 1.5);
      const typeMultiplier = mergeType === 'horizontal' ? 1.2 : mergeType === 'vertical' ? 1.1 : 1.0;
      
      return {
        attraction: baseDuration * 0.35 * complexityMultiplier * typeMultiplier, // Increased attraction time
        collision: baseDuration * 0.25 * complexityMultiplier, // Increased collision time
        formation: baseDuration * 0.35 * complexityMultiplier, // Balanced formation time
        cleanup: baseDuration * 0.05 // Minimal cleanup time
      };
    };
    
    // ENHANCED: Analyze merge pattern for better direction calculation
    const analyzeMergePattern = (mergingTiles, resultPosition) => {
      if (mergingTiles.length === 0) return { type: 'unknown', direction: { horizontal: 0, vertical: 0 } };
      
      const isHorizontal = mergingTiles.every(tile => tile.row === mergingTiles[0].row);
      const isVertical = mergingTiles.every(tile => tile.col === mergingTiles[0].col);
      const isDiagonal = !isHorizontal && !isVertical;
      
      // Find the center of all merging tiles
      const avgRow = mergingTiles.reduce((sum, pos) => sum + pos.row, 0) / mergingTiles.length;
      const avgCol = mergingTiles.reduce((sum, pos) => sum + pos.col, 0) / mergingTiles.length;
      
      // Calculate direction from center to result position
      const horizontalDirection = resultPosition.row - avgRow;
      const verticalDirection = resultPosition.col - avgCol;
      
      // Normalize the direction (make it a unit vector)
      const magnitude = Math.sqrt(horizontalDirection * horizontalDirection + verticalDirection * verticalDirection);
      
      if (magnitude === 0) return { 
        type: isHorizontal ? 'horizontal' : isVertical ? 'vertical' : 'diagonal',
        direction: { horizontal: 0, vertical: 0 } 
      };
      
      return {
        type: isHorizontal ? 'horizontal' : isVertical ? 'vertical' : 'diagonal',
        direction: {
          horizontal: horizontalDirection / magnitude,
          vertical: verticalDirection / magnitude
        }
      };
    };
    
    // ENHANCED: Physics-based movement calculation
    const calculatePhysicsMovement = (startPos, endPos, mergeType, value) => {
      const distance = Math.sqrt(
        Math.pow(endPos.col - startPos.col, 2) + Math.pow(endPos.row - startPos.row, 2)
      );
      
      // Base movement distance with value-based scaling
      const baseDistance = CELL_SIZE * 0.7; // Increased from 0.6
      const valueMultiplier = Math.min(value / 1000, 2.0); // Larger planets move further
      const moveDistance = baseDistance * valueMultiplier;
      
      // Physics parameters based on merge type
      const physics = {
        horizontal: {
          bounceFactor: 0.1,
          overshoot: 0.15,
          acceleration: 0.8
        },
        vertical: {
          bounceFactor: 0.15,
          overshoot: 0.2,
          acceleration: 0.9
        },
        diagonal: {
          bounceFactor: 0.12,
          overshoot: 0.18,
          acceleration: 0.85
        }
      };
      
      const typePhysics = physics[mergeType] || physics.diagonal;
      
      return {
        distance: moveDistance,
        bounceFactor: typePhysics.bounceFactor,
        overshoot: typePhysics.overshoot,
        acceleration: typePhysics.acceleration
      };
    };
    
    // Calculate merge pattern and timing
    const mergePattern = analyzeMergePattern(mergingTilesPositions, { row, col });
    const timing = calculateSmartTiming(mergePattern.type, mergingTilesPositions.length, isChainReaction);
    
    // Create collision animations for merging planets with enhanced physics
    const mergingAnimations = mergingTilesPositions.map((pos, index) => {
      const scaleAnim = new Animated.Value(1);
      const opacityAnim = new Animated.Value(1);
      const moveXAnim = new Animated.Value(0);
      const moveYAnim = new Animated.Value(0);
      const glowAnim = new Animated.Value(0);
      const rotationAnim = new Animated.Value(0); // ENHANCED: Add rotation for planets
      
      // Calculate physics-based movement
      const physics = calculatePhysicsMovement(pos, { row, col }, mergePattern.type, pos.value);
      
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
        rotation: rotationAnim, // ENHANCED: Add rotation
        targetRow: row,
        targetCol: col,
        mergeDirection: mergePattern.direction,
        physics: physics, // ENHANCED: Add physics data
        createdAt,
      };
    });
    
    // Create result planet animation with enhanced entrance
    const resultScaleAnim = new Animated.Value(0);
    const resultOpacityAnim = new Animated.Value(0);
    const resultGlowAnim = new Animated.Value(0);
    const resultRotateAnim = new Animated.Value(0);
    const resultBounceAnim = new Animated.Value(0); // ENHANCED: Add bounce effect
    
    const resultAnimation = {
      id: `${baseId}-result`,
      row,
      col,
      value,
      scale: resultScaleAnim,
      opacity: resultOpacityAnim,
      glow: resultGlowAnim,
      rotate: resultRotateAnim,
      bounce: resultBounceAnim, // ENHANCED: Add bounce
      createdAt,
    };
    
    // Create enhanced collision effects for visual impact
    const collisionEffect = {
      id: `${baseId}-collision`,
      row,
      col,
      shockwave: new Animated.Value(0),
      sparks: new Animated.Value(0),
      flash: new Animated.Value(0),
      energyRing: new Animated.Value(0),
      opacity: new Animated.Value(1),
      // ENHANCED: Add secondary effects
      secondaryShockwave: new Animated.Value(0),
      gravitationalDistortion: new Animated.Value(0),
    };
    
    // Set animations
    setMergeAnimations([...mergingAnimations, resultAnimation]);
    setCollisionEffects([collisionEffect]);
    
    // ENHANCED: PHASE 1 - GRAVITATIONAL ATTRACTION with physics
    const attractionPhase = mergingAnimations.map(anim => {
      const { distance, acceleration } = anim.physics;
      
      // Calculate movement towards merge direction with physics
      const deltaX = anim.mergeDirection.vertical * distance;
      const deltaY = anim.mergeDirection.horizontal * distance;
      
      return Animated.parallel([
        // Move toward merge direction with easing
        Animated.timing(anim.moveX, {
          toValue: deltaX,
          duration: timing.attraction,
          useNativeDriver: false,
        }),
        Animated.timing(anim.moveY, {
          toValue: deltaY,
          duration: timing.attraction,
          useNativeDriver: false,
        }),
        // ENHANCED: Add rotation during movement (using JS driver for consistency)
        Animated.timing(anim.rotation, {
          toValue: 1,
          duration: timing.attraction,
          useNativeDriver: false,
        }),
        // Build up energy glow with value-based intensity
        Animated.timing(anim.glow, {
          toValue: Math.min(anim.value / 1000, 1.0),
          duration: timing.attraction,
          useNativeDriver: false,
        }),
        // ENHANCED: Scale up with value-based scaling
        Animated.timing(anim.scale, {
          toValue: 1.1 + (anim.value / 10000) * 0.2, // Larger planets scale more
          duration: timing.attraction,
          useNativeDriver: false,
        }),
      ]);
    });
    
    // ENHANCED: PHASE 2 - COLLISION MOMENT with improved effects
    const collisionPhase = [
      // Planets with improved shrinking and fading
      ...mergingAnimations.map(anim => 
        Animated.parallel([
          Animated.timing(anim.scale, {
            toValue: 0.3, // ENHANCED: Less aggressive shrinking
            duration: timing.collision,
            useNativeDriver: false,
          }),
          // ENHANCED: Better opacity handling
          Animated.timing(anim.opacity, {
            toValue: 0.5, // ENHANCED: Keep more visibility
            duration: timing.collision,
            useNativeDriver: false,
          }),
          // ENHANCED: Add rotation during collision (using JS driver for consistency)
          Animated.timing(anim.rotation, {
            toValue: 2, // Faster rotation during collision
            duration: timing.collision,
            useNativeDriver: false,
          }),
        ])
      ),
      // ENHANCED: Multi-layered collision effects
      Animated.parallel([
        // Primary flash
        Animated.sequence([
          Animated.timing(collisionEffect.flash, {
            toValue: 1,
            duration: timing.collision * 0.3,
            useNativeDriver: false,
          }),
          Animated.timing(collisionEffect.flash, {
            toValue: 0,
            duration: timing.collision * 0.7,
            useNativeDriver: false,
          }),
        ]),
        // ENHANCED: Secondary shockwave
        Animated.timing(collisionEffect.secondaryShockwave, {
          toValue: 1,
          duration: timing.collision * 1.2,
          useNativeDriver: false,
        }),
        // Expanding shockwave
        Animated.timing(collisionEffect.shockwave, {
          toValue: 1,
          duration: timing.collision * 1.5,
          useNativeDriver: false,
        }),
        // Energy sparks
        Animated.timing(collisionEffect.sparks, {
          toValue: 1,
          duration: timing.collision,
          useNativeDriver: false,
        }),
        // Energy ring expansion
        Animated.timing(collisionEffect.energyRing, {
          toValue: 1,
          duration: timing.collision * 1.2,
          useNativeDriver: false,
        }),
        // ENHANCED: Gravitational distortion
        Animated.timing(collisionEffect.gravitationalDistortion, {
          toValue: 1,
          duration: timing.collision * 0.8,
          useNativeDriver: false,
        }),
      ]),
    ];
    
    // ENHANCED: PHASE 3 - STELLAR FORMATION with bounce effect
    const formationPhase = [
      Animated.parallel([
        // ENHANCED: Scale up with bounce effect
        Animated.sequence([
          Animated.timing(resultScaleAnim, {
            toValue: 1.5, // ENHANCED: Larger overshoot
            duration: timing.formation * 0.4,
            useNativeDriver: false,
          }),
          Animated.timing(resultScaleAnim, {
            toValue: 0.8, // ENHANCED: More pronounced bounce
            duration: timing.formation * 0.3,
            useNativeDriver: false,
          }),
          Animated.timing(resultScaleAnim, {
            toValue: 1.0,
            duration: timing.formation * 0.3,
            useNativeDriver: false,
          }),
        ]),
        // ENHANCED: Bounce effect
        Animated.sequence([
          Animated.timing(resultBounceAnim, {
            toValue: 1,
            duration: timing.formation * 0.6,
            useNativeDriver: false,
          }),
          Animated.timing(resultBounceAnim, {
            toValue: 0,
            duration: timing.formation * 0.4,
            useNativeDriver: false,
          }),
        ]),
        // Opacity fade in
        Animated.timing(resultOpacityAnim, {
          toValue: 1,
          duration: timing.formation * 0.6,
          useNativeDriver: false,
        }),
        // ENHANCED: Glow effect with value-based intensity
        Animated.sequence([
          Animated.timing(resultGlowAnim, {
            toValue: Math.min(value / 10000, 1.0),
            duration: timing.formation * 0.4,
            useNativeDriver: false,
          }),
          Animated.timing(resultGlowAnim, {
            toValue: 0.1,
            duration: timing.formation * 0.6,
            useNativeDriver: false,
          }),
        ]),
        // Rotation effect
        Animated.timing(resultRotateAnim, {
          toValue: 1,
          duration: timing.formation,
          useNativeDriver: false,
        }),
      ]),
    ];
    
    // PHASE 4: CLEANUP - Fast fade out
    const cleanupPhase = [
      Animated.timing(collisionEffect.opacity, {
        toValue: 0,
        duration: timing.cleanup,
        useNativeDriver: false,
      }),
    ];
    
    // ENHANCED: Haptic feedback for merge animation
    const triggerMergeHaptics = async (mergeType, value, tileCount) => {
      try {
        const intensity = Math.min(value / 1000, 1.0);
        
        if (mergeType === 'chain') {
          // Chain reaction haptics
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          if (tileCount >= 4) {
            setTimeout(() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }, 50);
          }
        } else {
          // Regular merge haptics
          if (value >= 1000) {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } else {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }
      } catch (error) {
        console.warn('Haptic feedback not available:', error);
      }
    };

    // Execute the enhanced collision sequence
    Animated.sequence([
      Animated.parallel(attractionPhase),
      Animated.parallel(collisionPhase),
      Animated.parallel(formationPhase),
      Animated.parallel(cleanupPhase),
    ]).start(async () => {
      // ENHANCED: Trigger haptic feedback
      await triggerMergeHaptics(mergePattern.type, value, mergingTilesPositions.length);
      
      // Immediate cleanup
      setMergeAnimations(prev => prev.filter(anim => !anim.id.startsWith(baseId)));
      setCollisionEffects([]);
      setEnergyBursts([]);
      
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
        // ENHANCED: Stop rotation animations
        if (anim.rotation && anim.rotation.stopAnimation) {
          anim.rotation.stopAnimation();
        }
        if (anim.moveX && anim.moveX.stopAnimation) {
          anim.moveX.stopAnimation();
        }
        if (anim.moveY && anim.moveY.stopAnimation) {
          anim.moveY.stopAnimation();
        }
        // ENHANCED: Stop result animations
        if (anim.bounce && anim.bounce.stopAnimation) {
          anim.bounce.stopAnimation();
        }
        if (anim.rotate && anim.rotate.stopAnimation) {
          anim.rotate.stopAnimation();
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
        // ENHANCED: Stop new collision effects
        if (effect.secondaryShockwave && effect.secondaryShockwave.stopAnimation) {
          effect.secondaryShockwave.stopAnimation();
        }
        if (effect.gravitationalDistortion && effect.gravitationalDistortion.stopAnimation) {
          effect.gravitationalDistortion.stopAnimation();
        }
        if (effect.sparks && effect.sparks.stopAnimation) {
          effect.sparks.stopAnimation();
        }
        if (effect.energyRing && effect.energyRing.stopAnimation) {
          effect.energyRing.stopAnimation();
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