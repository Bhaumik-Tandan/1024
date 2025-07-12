import { useState } from 'react';
import { Animated } from 'react-native';
import { ROWS, COLS, CELL_SIZE } from './constants';

export const useAnimationManager = () => {
  const [falling, setFalling] = useState(null);
  const [mergingTiles, setMergingTiles] = useState([]);
  const [mergeResult, setMergeResult] = useState(null);

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
    
    const mergingTile = {
      row,
      col,
      value,
      count,
      direction,
      anim: mergeAnim,
      scale: scaleAnim,
      id: Date.now() + Math.random(),
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

  const showMergeResultAnimation = (row, col, value) => {
    const resultAnim = new Animated.Value(0);
    const scaleAnim = new Animated.Value(0.5);
    
    setMergeResult({
      row,
      col,
      value,
      anim: resultAnim,
      scale: scaleAnim,
    });
    
    Animated.parallel([
      Animated.timing(resultAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
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
      setTimeout(() => {
        setMergeResult(null);
      }, 500);
    });
  };

  return {
    falling,
    mergingTiles,
    mergeResult,
    startFallingAnimation,
    updateFallingCol,
    fastDropAnimation,
    clearFalling,
    createMergeAnimation,
    showMergeResultAnimation,
  };
}; 