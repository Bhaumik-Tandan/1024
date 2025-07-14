import { useState } from 'react';
import { Animated } from 'react-native';
import { ROWS, COLS, CELL_SIZE } from './constants';

export const useAnimationManager = () => {
  const [falling, setFalling] = useState(null);
  const [mergingTiles, setMergingTiles] = useState([]);
  const [mergeResult, setMergeResult] = useState(null);
  const [mergeAnimations, setMergeAnimations] = useState([]);
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
    
    // Adjust animation timing based on chain reaction - made slower for better visibility
    const baseDuration = isChainReaction ? 300 : 600; // Slower for better visibility
    
    // Phase 1: Glow and scale up the merging tiles
    const phase1Animations = mergingAnimations.map(anim => 
      Animated.parallel([
        Animated.timing(anim.glow, {
          toValue: 1,
          duration: baseDuration,
          useNativeDriver: false,
        }),
        Animated.timing(anim.scale, {
          toValue: 1.2, // Slightly more scale for better visibility
          duration: baseDuration,
          useNativeDriver: false,
        }),
      ])
    );
    
    // Phase 2: Fade out merging tiles and show result
    const fadeOutDuration = baseDuration * 0.8; // Slightly faster fade out
    const resultDuration = isChainReaction ? 400 : 800; // Much slower for better visibility
    
    const phase2Animations = [
      // First fade out old tiles
      Animated.parallel(mergingAnimations.map(anim => 
        Animated.parallel([
          Animated.timing(anim.opacity, {
            toValue: 0,
            duration: fadeOutDuration,
            useNativeDriver: false,
          }),
          Animated.timing(anim.scale, {
            toValue: 0.8,
            duration: fadeOutDuration,
            useNativeDriver: false,
          }),
        ])
      )),
      // Then show result tile after a brief delay
      Animated.parallel([
        Animated.timing(resultAnimation.opacity, {
          toValue: 1,
          duration: resultDuration,
          useNativeDriver: false,
        }),
        Animated.timing(resultAnimation.scale, {
          toValue: 1.3,
          duration: resultDuration,
          useNativeDriver: false,
        }),
        Animated.timing(resultAnimation.glow, {
          toValue: 1,
          duration: resultDuration,
          useNativeDriver: false,
        }),
      ])
    ];
    
    // Phase 3: Stabilize result tile
    const stabilizeDuration = isChainReaction ? 200 : 400;
    const glowFadeDuration = isChainReaction ? 300 : 600;
    
    const phase3Animation = Animated.parallel([
      Animated.timing(resultAnimation.scale, {
        toValue: 1,
        duration: stabilizeDuration,
        useNativeDriver: false,
      }),
      Animated.timing(resultAnimation.glow, {
        toValue: 0,
        duration: glowFadeDuration,
        useNativeDriver: false,
      }),
    ]);
    
    // Execute animation sequence
    Animated.sequence([
      Animated.parallel(phase1Animations),
      Animated.sequence(phase2Animations), // Sequential fade out then show
      phase3Animation,
    ]).start(() => {
      setTimeout(() => {
        setMergeAnimations(prev => prev.filter(anim => !anim.id.startsWith(baseId)));
      }, 100);
    });
  };

  const clearMergeAnimations = () => {
    setMergeAnimations([]);
    setAnimationCounter(0); // Reset counter when clearing animations
  };

  return {
    falling,
    setFalling,
    mergingTiles,
    mergeResult,
    mergeAnimations,
    startFallingAnimation,
    updateFallingCol,
    fastDropAnimation,
    clearFalling,
    createMergeAnimation,
    showMergeResultAnimation,
    clearMergeAnimations,
  };
}; 