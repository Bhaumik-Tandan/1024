import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { ROWS, COLS, CELL_SIZE, CELL_MARGIN, COLORS, getCellLeft, getCellTop } from './constants';

const GameGrid = ({ 
  board, 
  falling, 
  mergingTiles, 
  mergeResult, 
  mergeAnimations,
  onColumnTap, 
  gameOver,
  nextBlock,
  showGuide,
  panHandlers
}) => {
  return (
    <View style={styles.board} {...panHandlers}>
      {/* Preview tile above the board */}
      {!falling && (
        <View
          style={[
            styles.nextBlockAbsolute,
            {
              left: getCellLeft(Math.floor(COLS / 2)),
              top: -CELL_SIZE - CELL_MARGIN,
              backgroundColor: COLORS[nextBlock] || '#fff',
              width: CELL_SIZE,
              height: CELL_SIZE,
            },
          ]}
        >
          <Text style={styles.nextBlockText}>{nextBlock}</Text>
        </View>
      )}

      {/* Render all cells */}
      {board.map((row, rowIdx) =>
        row.map((cell, colIdx) => {
          // Check if this cell is currently being animated (hide it during merge)
          const isAnimating = mergeAnimations.some(anim => 
            anim.row === rowIdx && anim.col === colIdx
          );
          
          return (
            <TouchableOpacity
              key={`${rowIdx}-${colIdx}`}
              style={[
                styles.cell,
                {
                  position: 'absolute',
                  left: getCellLeft(colIdx),
                  top: getCellTop(rowIdx),
                  backgroundColor: COLORS[cell] || COLORS[0],
                  opacity: isAnimating ? 0 : 1, // Hide tiles during animation
                },
                cell !== 0 && styles.cellFilled,
              ]}
              onPress={() => onColumnTap(colIdx)}
              disabled={gameOver || !falling || falling.fastDrop}
            >
              {cell !== 0 && !isAnimating && (
                <Text style={styles.cellText}>{cell}</Text>
              )}
            </TouchableOpacity>
          );
        })
      )}

      {/* Falling block animation */}
      {falling && (
        <Animated.View
          style={[
            styles.fallingBlock,
            {
              position: 'absolute',
              left: getCellLeft(falling.col),
              top: 0,
              backgroundColor: COLORS[falling.value] || COLORS[0],
              width: CELL_SIZE,
              height: CELL_SIZE,
              transform: [{ translateY: falling.anim }],
            },
          ]}
        >
          <Text style={styles.cellText}>{falling.value}</Text>
        </Animated.View>
      )}

      {/* Merging tiles animations */}
      {mergingTiles.map((tile) => (
        <Animated.View
          key={tile.id}
          style={[
            styles.mergingTile,
            {
              position: 'absolute',
              left: getCellLeft(tile.col),
              top: getCellTop(tile.row),
              backgroundColor: COLORS[tile.value] || COLORS[0],
              width: CELL_SIZE,
              height: CELL_SIZE,
              opacity: tile.anim,
              transform: [{ scale: tile.scale }],
            },
          ]}
        >
          <Text style={styles.cellText}>{tile.value}</Text>
        </Animated.View>
      ))}

      {/* Merge result animation */}
      {mergeResult && (
        <Animated.View
          style={[
            styles.mergeResult,
            {
              position: 'absolute',
              left: getCellLeft(mergeResult.col),
              top: getCellTop(mergeResult.row),
              backgroundColor: COLORS[mergeResult.value] || COLORS[0],
              width: CELL_SIZE,
              height: CELL_SIZE,
              opacity: mergeResult.anim,
              transform: [{ scale: mergeResult.scale }],
            },
          ]}
        >
          <Text style={styles.cellText}>{mergeResult.value}</Text>
        </Animated.View>
      )}

      {/* Enhanced merge animations with glow effect */}
      {mergeAnimations.map((anim) => (
        <Animated.View
          key={anim.id}
          style={[
            styles.mergeAnimationTile,
            {
              position: 'absolute',
              left: getCellLeft(anim.col),
              top: getCellTop(anim.row),
              width: CELL_SIZE,
              height: CELL_SIZE,
              opacity: anim.opacity,
              transform: [{ scale: anim.scale }],
            },
          ]}
        >
          {/* Glow effect */}
          <Animated.View
            style={[
              styles.glowEffect,
              {
                opacity: anim.glow,
                backgroundColor: COLORS[anim.value] || COLORS[0],
              },
            ]}
          />
          
          {/* Main tile */}
          <View
            style={[
              styles.mainTile,
              {
                backgroundColor: COLORS[anim.value] || COLORS[0],
              },
            ]}
          >
            <Text style={styles.cellText}>{anim.value}</Text>
          </View>
        </Animated.View>
      ))}

      {/* Gesture Guide Overlay */}
      {showGuide && (
        <View style={styles.guideOverlay} pointerEvents="none">
          <Text style={styles.guideText}>Tap a column to drop!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  board: {
    width: COLS * CELL_SIZE + (COLS - 1) * CELL_MARGIN,
    height: ROWS * CELL_SIZE + (ROWS - 1) * CELL_MARGIN,
    backgroundColor: '#2c2c2c',
    borderRadius: 8,
    position: 'relative',
    alignSelf: 'center',
    marginTop: 20,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  cellFilled: {
    borderColor: '#666',
  },
  cellText: {
    color: '#fff',
    fontSize: Math.max(12, CELL_SIZE / 4),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  fallingBlock: {
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#666',
  },
  mergingTile: {
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#666',
  },
  mergeResult: {
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#666',
  },
  nextBlockAbsolute: {
    position: 'absolute',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#666',
    opacity: 0.7,
  },
  nextBlockText: {
    color: '#fff',
    fontSize: Math.max(12, CELL_SIZE / 4),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  guideOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
  },
  guideText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mergeAnimationTile: {
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowEffect: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 8,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  mainTile: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#666',
    zIndex: 1,
  },
});

export default GameGrid; 