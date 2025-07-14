import { useState } from 'react';
import { Animated } from 'react-native';
import { ROWS, COLS, CELL_SIZE } from './constants';

export const useAnimationManager = () => {
  const [falling, setFalling] = useState(null);
  const [mergingTiles, setMergingTiles] = useState([]);
  const [mergeResult, setMergeResult] = useState(null);
  const [mergeAnimations, setMergeAnimations] = useState([]);
  const [liquidBlobs, setLiquidBlobs] = useState([]); // New state for liquid animations
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
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 100,
          useNativeDriver: false,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: false,
        }),
      ]),
    ]).start(() => {
      setMergingTiles(prev => prev.filter(tile => tile.id !== mergingTile.id));
    });
  };

  // Enhanced liquid-like merging animation
  const showMergeResultAnimation = (row, col, value, mergingTilesPositions = [], isChainReaction = false) => {
    // Generate unique IDs using counter
    setAnimationCounter(prev => prev + 1);
    const baseId = `merge-${Date.now()}-${animationCounter}`;
    
    // Create animations for merging tiles
    const mergingAnimations = mergingTilesPositions.map((pos, index) => {
      const scaleAnim = new Animated.Value(1);
      const opacityAnim = new Animated.Value(1);
      const glowAnim = new Animated.Value(0);
      
      return {
        id: `${baseId}-source-${index}`,
        row: pos.row,
        col: pos.col,
        value: pos.value,
        scale: scaleAnim,
        opacity: opacityAnim,
        glow: glowAnim,
      };
    });
    
    // Create liquid blob animation
    const liquidBlobAnim = new Animated.Value(0);
    const liquidScaleAnim = new Animated.Value(0);
    const liquidOpacityAnim = new Animated.Value(0);
    const liquidMorphAnim = new Animated.Value(0);
    
    // Calculate the bounding box for the liquid blob
    const minRow = Math.min(...mergingTilesPositions.map(p => p.row));
    const maxRow = Math.max(...mergingTilesPositions.map(p => p.row));
    const minCol = Math.min(...mergingTilesPositions.map(p => p.col));
    const maxCol = Math.max(...mergingTilesPositions.map(p => p.col));
    
    const liquidBlob = {
      id: `${baseId}-liquid`,
      minRow,
      maxRow,
      minCol,
      maxCol,
      resultRow: row,
      resultCol: col,
      value: value,
      scale: liquidScaleAnim,
      opacity: liquidOpacityAnim,
      morph: liquidMorphAnim,
      progress: liquidBlobAnim,
      mergingPositions: mergingTilesPositions,
    };
    
    // Create the result tile animation
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
    };
    
    // Set all animations
    setMergeAnimations([...mergingAnimations, resultAnimation]);
    setLiquidBlobs(prev => [...prev, liquidBlob]);
    
    // FASTER animation timing with more frames
    const baseDuration = isChainReaction ? 120 : 250; // Reduced from 200/400
    const liquidDuration = isChainReaction ? 250 : 450; // Reduced from 400/700
    const resultDuration = isChainReaction ? 120 : 220; // Reduced from 200/350
    
    // Phase 1: Initial glow and subtle scale up (more frames)
    const phase1Animations = mergingAnimations.map(anim => 
      Animated.parallel([
        Animated.timing(anim.glow, {
          toValue: 0.6,
          duration: baseDuration * 0.4,
          useNativeDriver: false,
        }),
        Animated.timing(anim.scale, {
          toValue: 1.08,
          duration: baseDuration * 0.4,
          useNativeDriver: false,
        }),
      ])
    );
    
    // Phase 1.5: Full glow and scale (additional frame)
    const phase1_5Animations = mergingAnimations.map(anim => 
      Animated.parallel([
        Animated.timing(anim.glow, {
          toValue: 1,
          duration: baseDuration * 0.2,
          useNativeDriver: false,
        }),
        Animated.timing(anim.scale, {
          toValue: 1.15,
          duration: baseDuration * 0.2,
          useNativeDriver: false,
        }),
      ])
    );
    
    // Phase 2: Create liquid blob effect (more granular)
    const liquidPhase1 = Animated.parallel([
      // Show liquid blob gradually
      Animated.timing(liquidOpacityAnim, {
        toValue: 0.7,
        duration: liquidDuration * 0.2,
        useNativeDriver: false,
      }),
      // Initial scale up
      Animated.timing(liquidScaleAnim, {
        toValue: 0.6,
        duration: liquidDuration * 0.2,
        useNativeDriver: false,
      }),
    ]);
    
    const liquidPhase2 = Animated.parallel([
      // Full liquid opacity
      Animated.timing(liquidOpacityAnim, {
        toValue: 1,
        duration: liquidDuration * 0.2,
        useNativeDriver: false,
      }),
      // Full liquid scale
      Animated.timing(liquidScaleAnim, {
        toValue: 1,
        duration: liquidDuration * 0.2,
        useNativeDriver: false,
      }),
      // Start morphing
      Animated.timing(liquidMorphAnim, {
        toValue: 0.5,
        duration: liquidDuration * 0.3,
        useNativeDriver: false,
      }),
      // Start liquid progress
      Animated.timing(liquidBlobAnim, {
        toValue: 0.5,
        duration: liquidDuration * 0.3,
        useNativeDriver: false,
      }),
    ]);
    
    const liquidPhase3 = Animated.parallel([
      // Complete morphing
      Animated.timing(liquidMorphAnim, {
        toValue: 1,
        duration: liquidDuration * 0.3,
        useNativeDriver: false,
      }),
      // Complete liquid progress
      Animated.timing(liquidBlobAnim, {
        toValue: 1,
        duration: liquidDuration * 0.3,
        useNativeDriver: false,
      }),
    ]);
    
    // Phase 3: Fade out tiles as they "melt" into liquid (more gradual)
    const meltPhase1 = Animated.parallel(mergingAnimations.map(anim => 
      Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 0.7,
          duration: liquidDuration * 0.3,
          useNativeDriver: false,
        }),
        Animated.timing(anim.scale, {
          toValue: 0.9,
          duration: liquidDuration * 0.3,
          useNativeDriver: false,
        }),
      ])
    ));
    
    const meltPhase2 = Animated.parallel(mergingAnimations.map(anim => 
      Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 0,
          duration: liquidDuration * 0.3,
          useNativeDriver: false,
        }),
        Animated.timing(anim.scale, {
          toValue: 0.7,
          duration: liquidDuration * 0.3,
          useNativeDriver: false,
        }),
      ])
    ));
    
    // Phase 4: Result emerges from liquid (more dramatic)
    const resultPhase1 = Animated.parallel([
      Animated.timing(resultOpacityAnim, {
        toValue: 0.8,
        duration: resultDuration * 0.4,
        useNativeDriver: false,
      }),
      Animated.timing(resultScaleAnim, {
        toValue: 1.2,
        duration: resultDuration * 0.4,
        useNativeDriver: false,
      }),
    ]);
    
    const resultPhase2 = Animated.parallel([
      Animated.timing(resultOpacityAnim, {
        toValue: 1,
        duration: resultDuration * 0.3,
        useNativeDriver: false,
      }),
      Animated.timing(resultScaleAnim, {
        toValue: 1.4,
        duration: resultDuration * 0.3,
        useNativeDriver: false,
      }),
      Animated.timing(resultGlowAnim, {
        toValue: 1,
        duration: resultDuration * 0.4,
        useNativeDriver: false,
      }),
    ]);
    
    // Phase 5: Fade out liquid and stabilize result (more gradual)
    const stabilizePhase1 = Animated.parallel([
      Animated.timing(liquidOpacityAnim, {
        toValue: 0.5,
        duration: resultDuration * 0.4,
        useNativeDriver: false,
      }),
      Animated.timing(resultScaleAnim, {
        toValue: 1.2,
        duration: resultDuration * 0.3,
        useNativeDriver: false,
      }),
    ]);
    
    const stabilizePhase2 = Animated.parallel([
      Animated.timing(liquidOpacityAnim, {
        toValue: 0,
        duration: resultDuration * 0.4,
        useNativeDriver: false,
      }),
      Animated.timing(resultScaleAnim, {
        toValue: 1,
        duration: resultDuration * 0.3,
        useNativeDriver: false,
      }),
      Animated.timing(resultGlowAnim, {
        toValue: 0,
        duration: resultDuration * 0.6,
        useNativeDriver: false,
      }),
    ]);
    
    // Execute enhanced liquid animation sequence with more frames
    Animated.sequence([
      // Phase 1: Initial highlight
      Animated.parallel(phase1Animations),
      // Phase 1.5: Full highlight
      Animated.parallel(phase1_5Animations),
      // Phase 2: Start liquid creation
      liquidPhase1,
      // Phase 2.5: Continue liquid creation and start melting
      Animated.parallel([liquidPhase2, meltPhase1]),
      // Phase 3: Complete liquid and continue melting
      Animated.parallel([liquidPhase3, meltPhase2]),
      // Phase 4: Start result emergence
      resultPhase1,
      // Phase 4.5: Complete result emergence
      resultPhase2,
      // Phase 5: Start stabilization
      stabilizePhase1,
      // Phase 5.5: Complete stabilization
      stabilizePhase2,
    ]).start(() => {
      setTimeout(() => {
        setMergeAnimations(prev => prev.filter(anim => !anim.id.startsWith(baseId)));
        setLiquidBlobs(prev => prev.filter(blob => !blob.id.startsWith(baseId)));
      }, 50); // Reduced cleanup delay
    });
  };

  const clearMergeAnimations = () => {
    setMergeAnimations([]);
    setLiquidBlobs([]);
    setAnimationCounter(0);
  };

  return {
    falling,
    setFalling,
    mergingTiles,
    mergeResult,
    mergeAnimations,
    liquidBlobs, // Export liquid blobs for rendering
    startFallingAnimation,
    updateFallingCol,
    fastDropAnimation,
    clearFalling,
    createMergeAnimation,
    showMergeResultAnimation,
    clearMergeAnimations,
  };
}; 