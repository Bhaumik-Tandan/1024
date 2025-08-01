import { useState } from 'react';
import { Animated } from 'react-native';
import { ROWS, COLS, CELL_SIZE } from './constants';

export const useAnimationManager = () => {
  const [falling, setFalling] = useState(null);
  const [mergingTiles, setMergingTiles] = useState([]);
  const [mergeResult, setMergeResult] = useState(null);
  const [mergeAnimations, setMergeAnimations] = useState([]);
  const [collisionEffects, setCollisionEffects] = useState([]); // New state for collision effects
  const [energyBursts, setEnergyBursts] = useState([]); // New state for energy bursts
  const [animationCounter, setAnimationCounter] = useState(0);

  const startFallingAnimation = (col, value, toRow, isFastDrop = false) => {
    const anim = new Animated.Value(0);
    const fallingTile = { col, value, anim, toRow, fastDrop: isFastDrop };
    setFalling(fallingTile);
    
    Animated.timing(anim, {
      toValue: toRow * (CELL_SIZE + 8),
      duration: isFastDrop ? 200 : 7000,
      useNativeDriver: false,
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
      useNativeDriver: false,
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
      useNativeDriver: false,
    }).start();
  };

  const clearFalling = () => {
    setFalling(null);
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
          useNativeDriver: false,
        }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 60,
          useNativeDriver: false,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 60,
          useNativeDriver: false,
        }),
      ]),
    ]).start(() => {
      setMergingTiles(prev => prev.filter(tile => tile.id !== mergingTile.id));
    });
  };

  // ENHANCED ELEMENTS-STYLE COLLISION ANIMATION SYSTEM
  const showMergeResultAnimation = (row, col, value, mergingTilesPositions = [], isChainReaction = false) => {
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
    
    // Animation timing - ULTRA FAST for instant responsiveness  
    const duration = isChainReaction ? 120 : 180;
    const moveDuration = duration * 0.3;
    const collisionDuration = duration * 0.15;
    const birthDuration = duration * 0.55;
    
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
      // Planets rapidly disappear
      ...mergingAnimations.map(anim => 
        Animated.parallel([
          Animated.timing(anim.scale, {
            toValue: 0.2,
            duration: collisionDuration,
            useNativeDriver: false,
          }),
          Animated.timing(anim.opacity, {
            toValue: 0,
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
        // Rotation during formation
        Animated.timing(resultRotateAnim, {
          toValue: 360,
          duration: birthDuration,
          useNativeDriver: false,
        }),
        // Formation glow effect
        Animated.sequence([
          Animated.timing(resultGlowAnim, {
            toValue: 1,
            duration: birthDuration * 0.5,
            useNativeDriver: false,
          }),
          Animated.timing(resultGlowAnim, {
            toValue: 0.2,
            duration: birthDuration * 0.5,
            useNativeDriver: false,
          }),
        ]),
      ]),
    ];
    
    // PHASE 4: CLEANUP - Fade out effects
    const cleanupPhase = [
      Animated.timing(collisionEffect.opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ];
    
    // Execute the complete elements-style collision sequence
    Animated.sequence([
      Animated.parallel(attractionPhase),
      Animated.parallel(collisionPhase),
      Animated.parallel(formationPhase),
      Animated.parallel(cleanupPhase),
    ]).start(() => {
      // Cleanup animations - immediate cleanup for responsiveness
      setTimeout(() => {
        setMergeAnimations(prev => prev.filter(anim => !anim.id.startsWith(baseId)));
        setCollisionEffects([]);
        setEnergyBursts([]);
      }, 50);
    });
  };

  const clearMergeAnimations = () => {
    setMergeAnimations([]);
    setCollisionEffects([]);
    setEnergyBursts([]);
    setAnimationCounter(0);
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