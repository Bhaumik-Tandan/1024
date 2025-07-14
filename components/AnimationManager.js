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
      duration: isFastDrop ? 250 : 7000,
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
      duration: 200,
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
      duration: 250,
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
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
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
    
    // Adjust animation timing for liquid effect - faster with more frames
    const baseDuration = isChainReaction ? 200 : 400;
    const liquidDuration = isChainReaction ? 400 : 700;
    const resultDuration = isChainReaction ? 200 : 350;
    
    // Phase 1: Glow and scale up the merging tiles
    const phase1Animations = mergingAnimations.map(anim => 
      Animated.parallel([
        Animated.timing(anim.glow, {
          toValue: 1,
          duration: baseDuration * 0.6,
          useNativeDriver: false,
        }),
        Animated.timing(anim.scale, {
          toValue: 1.15,
          duration: baseDuration * 0.6,
          useNativeDriver: false,
        }),
      ])
    );
    
    // Phase 2: Create liquid blob effect
    const liquidPhase = Animated.parallel([
      // Show liquid blob
      Animated.timing(liquidOpacityAnim, {
        toValue: 1,
        duration: liquidDuration * 0.3,
        useNativeDriver: false,
      }),
      // Scale up liquid blob
      Animated.timing(liquidScaleAnim, {
        toValue: 1,
        duration: liquidDuration * 0.4,
        useNativeDriver: false,
      }),
      // Morph liquid blob
      Animated.timing(liquidMorphAnim, {
        toValue: 1,
        duration: liquidDuration,
        useNativeDriver: false,
      }),
      // Animate liquid progress
      Animated.timing(liquidBlobAnim, {
        toValue: 1,
        duration: liquidDuration,
        useNativeDriver: false,
      }),
    ]);
    
    // Phase 3: Fade out tiles as they "melt" into liquid
    const meltPhase = Animated.parallel(mergingAnimations.map(anim => 
      Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 0,
          duration: liquidDuration * 0.6,
          useNativeDriver: false,
        }),
        Animated.timing(anim.scale, {
          toValue: 0.7,
          duration: liquidDuration * 0.6,
          useNativeDriver: false,
        }),
      ])
    ));
    
    // Phase 4: Result emerges from liquid
    const resultPhase = Animated.parallel([
      Animated.timing(resultOpacityAnim, {
        toValue: 1,
        duration: resultDuration,
        useNativeDriver: false,
      }),
      Animated.timing(resultScaleAnim, {
        toValue: 1.4,
        duration: resultDuration * 0.7,
        useNativeDriver: false,
      }),
      Animated.timing(resultGlowAnim, {
        toValue: 1,
        duration: resultDuration * 0.8,
        useNativeDriver: false,
      }),
    ]);
    
    // Phase 5: Fade out liquid and stabilize result
    const stabilizePhase = Animated.parallel([
      Animated.timing(liquidOpacityAnim, {
        toValue: 0,
        duration: resultDuration * 0.8,
        useNativeDriver: false,
      }),
      Animated.timing(resultScaleAnim, {
        toValue: 1,
        duration: resultDuration * 0.6,
        useNativeDriver: false,
      }),
      Animated.timing(resultGlowAnim, {
        toValue: 0,
        duration: resultDuration,
        useNativeDriver: false,
      }),
    ]);
    
    // Execute liquid animation sequence
    Animated.sequence([
      // Phase 1: Highlight tiles
      Animated.parallel(phase1Animations),
      // Phase 2 & 3: Create liquid and melt tiles (simultaneous)
      Animated.parallel([liquidPhase, meltPhase]),
      // Phase 4: Show result
      resultPhase,
      // Phase 5: Stabilize
      stabilizePhase,
    ]).start(() => {
      setTimeout(() => {
        setMergeAnimations(prev => prev.filter(anim => !anim.id.startsWith(baseId)));
        setLiquidBlobs(prev => prev.filter(blob => !blob.id.startsWith(baseId)));
      }, 100);
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