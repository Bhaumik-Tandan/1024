import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { 
  ROWS, 
  COLS, 
  CELL_SIZE, 
  CELL_MARGIN, 
  COLORS, 
  getCellLeft, 
  getCellTop,
  ANIMATION_CONFIG,
  getTileStyle,
  isMilestoneTile,
  getTileDecoration,
  TILE_GRADIENTS
} from './constants';

const GameGrid = ({ 
  board, 
  falling, 
  mergingTiles, 
  mergeResult, 
  mergeAnimations,
  liquidBlobs, // Add liquid blobs prop
  onRowTap, 
  gameOver,
  showGuide,
  panHandlers,
  isTouchEnabled = true
}) => {
  const isDisabled = gameOver || !falling || (falling?.fastDrop && !falling?.static) || !isTouchEnabled;
  
  return (
    <View style={[styles.board, styles.boardDark]} {...panHandlers}>

      {/* Cell-based touch areas - tap any cell to place tile there */}
      {board.map((row, rowIdx) =>
        row.map((cell, colIdx) => (
          <TouchableOpacity
            key={`cell-${rowIdx}-${colIdx}`}
            style={[
              styles.cellTouchArea,
              {
                left: getCellLeft(colIdx),
                top: getCellTop(rowIdx),
                width: CELL_SIZE,
                height: CELL_SIZE,
              },
            ]}
            onPress={() => {
              onRowTap(rowIdx, colIdx);
            }}
            disabled={isDisabled}
            activeOpacity={0.7}
            delayPressIn={50}
            delayPressOut={50}
          />
        ))
      )}

      {/* Render all cells (visual only, no touch) */}
      {board.map((row, rowIdx) =>
        row.map((cell, colIdx) => {
          // Check if this cell is currently being animated (hide it during merge)
          const isAnimating = mergeAnimations.some(anim => 
            anim.row === rowIdx && anim.col === colIdx
          );
          
          const tileStyle = getTileStyle(cell);
          const decoration = getTileDecoration(cell);
          const isMilestone = isMilestoneTile(cell);
          
          return (
            <View
              key={`${rowIdx}-${colIdx}`}
              style={[
                styles.cell,
                {
                  position: 'absolute',
                  left: getCellLeft(colIdx),
                  top: getCellTop(rowIdx),
                  opacity: isAnimating ? 0 : 1, // Hide tiles during animation
                },
                tileStyle,
                cell !== 0 && styles.cellFilled,
                isMilestone && styles.milestoneTile,
              ]}
            >
              {/* Stars background for special tiles */}
              {decoration?.stars && (
                <View style={styles.starsContainer}>
                  <Text style={styles.starIcon}>⭐</Text>
                  <Text style={[styles.starIcon, styles.starTop]}>⭐</Text>
                  <Text style={[styles.starIcon, styles.starBottom]}>⭐</Text>
                </View>
              )}
              
              {cell !== 0 && !isAnimating && (
                <View style={styles.tileContent}>
                  {/* Crown icon for 1M milestone tiles only */}
                  {decoration?.type === 'crown' && (
                    <Text style={styles.crownIcon}>👑</Text>
                  )}
                  
                  {/* Glow effect for 1K+ tiles */}
                  {decoration?.type === 'glow' && (
                    <View style={[styles.glowRing, { borderColor: tileStyle.borderColor || '#4FC3F7' }]} />
                  )}
                  
                  <Text style={[
                    styles.cellText,
                    isMilestone && styles.milestoneText,
                    decoration?.type === 'crown' && styles.crownedText,
                    decoration?.type === 'glow' && styles.glowText
                  ]}>
                    {cell >= 1000 ? `${(cell / 1000).toFixed(cell % 1000 === 0 ? 0 : 1)}K` : cell}
                  </Text>
                </View>
              )}
            </View>
          );
        })
      )}

      {/* Falling block animation - only show when not in preview mode */}
      {falling && !falling.inPreview && (
        <Animated.View
          style={[
            styles.fallingBlock,
            {
              position: 'absolute',
              left: getCellLeft(falling.col), // Use the actual column of the falling tile
              top: falling.static ? getCellTop(ROWS - 1) : getCellTop(0), // Use proper cell positioning
              width: CELL_SIZE,
              height: CELL_SIZE,
              transform: falling.static ? [] : [{ translateY: falling.anim }],
            },
            getTileStyle(falling.value),
          ]}
        >
          {/* Special effects for falling milestone tiles */}
          {getTileDecoration(falling.value)?.stars && (
            <View style={styles.starsContainer}>
              <Text style={styles.starIcon}>⭐</Text>
              <Text style={[styles.starIcon, styles.starTop]}>⭐</Text>
              <Text style={[styles.starIcon, styles.starBottom]}>⭐</Text>
            </View>
          )}
          
          <View style={styles.tileContent}>
            {getTileDecoration(falling.value)?.type === 'crown' && (
              <Text style={styles.crownIcon}>👑</Text>
            )}
            
            {getTileDecoration(falling.value)?.type === 'glow' && (
              <View style={[styles.glowRing, { borderColor: getTileStyle(falling.value).borderColor || '#4FC3F7' }]} />
            )}
            
            <Text style={[
              styles.cellText,
              isMilestoneTile(falling.value) && styles.milestoneText,
              getTileDecoration(falling.value)?.type === 'crown' && styles.crownedText,
              getTileDecoration(falling.value)?.type === 'glow' && styles.glowText
            ]}>
              {falling.value >= 1000 ? `${(falling.value / 1000).toFixed(falling.value % 1000 === 0 ? 0 : 1)}K` : falling.value}
            </Text>
          </View>
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
              width: CELL_SIZE,
              height: CELL_SIZE,
              opacity: tile.anim,
              transform: [{ scale: tile.scale }],
            },
            getTileStyle(tile.value),
          ]}
        >
          {getTileDecoration(tile.value)?.stars && (
            <View style={styles.starsContainer}>
              <Text style={styles.starIcon}>⭐</Text>
              <Text style={[styles.starIcon, styles.starTop]}>⭐</Text>
              <Text style={[styles.starIcon, styles.starBottom]}>⭐</Text>
            </View>
          )}
          
          <View style={styles.tileContent}>
            {getTileDecoration(tile.value)?.type === 'crown' && (
              <Text style={styles.crownIcon}>👑</Text>
            )}
            
            <Text style={[
              styles.cellText,
              isMilestoneTile(tile.value) && styles.milestoneText,
              getTileDecoration(tile.value)?.type === 'crown' && styles.crownedText
            ]}>
              {tile.value >= 1000 ? `${(tile.value / 1000).toFixed(tile.value % 1000 === 0 ? 0 : 1)}K` : tile.value}
            </Text>
          </View>
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
              width: CELL_SIZE,
              height: CELL_SIZE,
              opacity: mergeResult.anim,
              transform: [{ scale: mergeResult.scale }],
            },
            getTileStyle(mergeResult.value),
          ]}
        >
          {getTileDecoration(mergeResult.value)?.stars && (
            <View style={styles.starsContainer}>
              <Text style={styles.starIcon}>⭐</Text>
              <Text style={[styles.starIcon, styles.starTop]}>⭐</Text>
              <Text style={[styles.starIcon, styles.starBottom]}>⭐</Text>
            </View>
          )}
          
          <View style={styles.tileContent}>
            {getTileDecoration(mergeResult.value)?.type === 'crown' && (
              <Text style={styles.crownIcon}>👑</Text>
            )}
            
            <Text style={[
              styles.cellText,
              isMilestoneTile(mergeResult.value) && styles.milestoneText,
              getTileDecoration(mergeResult.value)?.type === 'crown' && styles.crownedText
            ]}>
              {mergeResult.value >= 1000 ? `${(mergeResult.value / 1000).toFixed(mergeResult.value % 1000 === 0 ? 0 : 1)}K` : mergeResult.value}
            </Text>
          </View>
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
          {/* Enhanced glow effect with gradient colors */}
          <Animated.View
            style={[
              styles.glowEffect,
              {
                opacity: anim.glow,
                backgroundColor: TILE_GRADIENTS[anim.value] ? TILE_GRADIENTS[anim.value][1] : (COLORS[anim.value] || COLORS[0]),
              },
            ]}
          />
          
          {/* Main tile */}
          <View
            style={[
              styles.mainTile,
              getTileStyle(anim.value),
            ]}
          >
            {getTileDecoration(anim.value)?.stars && (
              <View style={styles.starsContainer}>
                <Text style={styles.starIcon}>⭐</Text>
                <Text style={[styles.starIcon, styles.starTop]}>⭐</Text>
                <Text style={[styles.starIcon, styles.starBottom]}>⭐</Text>
              </View>
            )}
            
            <View style={styles.tileContent}>
              {getTileDecoration(anim.value)?.type === 'crown' && (
                <Text style={styles.crownIcon}>👑</Text>
              )}
              
              <Text style={[
                styles.cellText,
                isMilestoneTile(anim.value) && styles.milestoneText,
                getTileDecoration(anim.value)?.type === 'crown' && styles.crownedText
              ]}>
                {anim.value >= 1000 ? `${(anim.value / 1000).toFixed(anim.value % 1000 === 0 ? 0 : 1)}K` : anim.value}
              </Text>
            </View>
          </View>
        </Animated.View>
      ))}

      {/* Liquid blob animations */}
      {liquidBlobs && liquidBlobs.map((blob) => {
        // Calculate the dimensions for the liquid blob
        const blobWidth = (blob.maxCol - blob.minCol + 1) * CELL_SIZE + (blob.maxCol - blob.minCol) * CELL_MARGIN;
        const blobHeight = (blob.maxRow - blob.minRow + 1) * CELL_SIZE + (blob.maxRow - blob.minRow) * CELL_MARGIN;
        const blobLeft = getCellLeft(blob.minCol);
        const blobTop = getCellTop(blob.minRow);
        
        return (
          <Animated.View
            key={blob.id}
            style={[
              styles.liquidBlob,
              {
                position: 'absolute',
                left: blobLeft,
                top: blobTop,
                width: blobWidth,
                height: blobHeight,
                opacity: blob.opacity,
                transform: [{ scale: blob.scale }],
              },
            ]}
          >
            {/* Main liquid blob with enhanced morphing */}
            <Animated.View
              style={[
                styles.liquidShape,
                {
                  backgroundColor: COLORS[blob.value] || COLORS[0],
                  opacity: blob.opacity.interpolate({
                    inputRange: [0, 0.3, 0.7, 1],
                    outputRange: [0, 0.6, 0.9, 0.8],
                  }),
                  transform: [
                    { scaleX: blob.morph.interpolate({
                      inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
                      outputRange: [1, 1.1, 1.4, 1.2, 1.1, 1],
                    })},
                    { scaleY: blob.morph.interpolate({
                      inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
                      outputRange: [1, 0.9, 0.7, 0.8, 0.9, 1],
                    })},
                    { rotateZ: blob.morph.interpolate({
                      inputRange: [0, 0.3, 0.7, 1],
                      outputRange: ['0deg', '2deg', '-1deg', '0deg'],
                    })},
                  ],
                },
              ]}
            />
            
            {/* Secondary liquid wave */}
            <Animated.View
              style={[
                styles.liquidWave,
                {
                  backgroundColor: COLORS[blob.value] || COLORS[0],
                  opacity: blob.morph.interpolate({
                    inputRange: [0, 0.3, 0.6, 1],
                    outputRange: [0, 0.4, 0.6, 0],
                  }),
                  transform: [
                    { scale: blob.morph.interpolate({
                      inputRange: [0, 0.3, 0.6, 1],
                      outputRange: [0.8, 1.2, 1.5, 1.8],
                    })},
                  ],
                },
              ]}
            />
            
            {/* Enhanced liquid droplets/particles with more frames */}
            {blob.mergingPositions.map((pos, index) => {
              const dropletLeft = getCellLeft(pos.col) - blobLeft;
              const dropletTop = getCellTop(pos.row) - blobTop;
              const resultLeft = getCellLeft(blob.resultCol) - blobLeft;
              const resultTop = getCellTop(blob.resultRow) - blobTop;
              
              // Create curved path for more natural flow
              const midX = (dropletLeft + resultLeft) / 2 + Math.sin(index) * 20;
              const midY = (dropletTop + resultTop) / 2 - 30; // Arc upward
              
              return (
                <Animated.View
                  key={`droplet-${index}`}
                  style={[
                    styles.liquidDroplet,
                    {
                      position: 'absolute',
                      left: blob.progress.interpolate({
                        inputRange: [0, 0.3, 0.7, 1],
                        outputRange: [dropletLeft, midX, midX, resultLeft],
                      }),
                      top: blob.progress.interpolate({
                        inputRange: [0, 0.3, 0.7, 1],
                        outputRange: [dropletTop, midY, midY, resultTop],
                      }),
                      width: CELL_SIZE * blob.progress.interpolate({
                        inputRange: [0, 0.2, 0.5, 0.8, 1],
                        outputRange: [0.3, 0.4, 0.35, 0.25, 0.15],
                      }),
                      height: CELL_SIZE * blob.progress.interpolate({
                        inputRange: [0, 0.2, 0.5, 0.8, 1],
                        outputRange: [0.3, 0.4, 0.35, 0.25, 0.15],
                      }),
                      backgroundColor: COLORS[pos.value] || COLORS[0],
                      opacity: blob.progress.interpolate({
                        inputRange: [0, 0.1, 0.3, 0.7, 0.9, 1],
                        outputRange: [1, 0.9, 0.8, 0.6, 0.3, 0],
                      }),
                      transform: [
                        { scale: blob.progress.interpolate({
                          inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
                          outputRange: [1, 1.3, 1.1, 1.2, 0.8, 0.4],
                        })},
                        { rotateZ: blob.progress.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: ['0deg', `${index * 45}deg`, `${index * 90}deg`],
                        })},
                      ],
                    },
                  ]}
                />
              );
            })}
            
            {/* Enhanced liquid splash effect with multiple waves */}
            <Animated.View
              style={[
                styles.liquidSplash,
                {
                  position: 'absolute',
                  left: getCellLeft(blob.resultCol) - blobLeft - CELL_SIZE * 0.3,
                  top: getCellTop(blob.resultRow) - blobTop - CELL_SIZE * 0.3,
                  width: CELL_SIZE * 1.6,
                  height: CELL_SIZE * 1.6,
                  backgroundColor: COLORS[blob.value] || COLORS[0],
                  opacity: blob.progress.interpolate({
                    inputRange: [0, 0.5, 0.7, 0.9, 1],
                    outputRange: [0, 0, 0.5, 0.2, 0],
                  }),
                  transform: [
                    { scale: blob.progress.interpolate({
                      inputRange: [0, 0.5, 0.7, 0.9, 1],
                      outputRange: [0, 0, 1.2, 1.8, 2.2],
                    })},
                  ],
                },
              ]}
            />
            
            {/* Secondary splash ring */}
            <Animated.View
              style={[
                styles.liquidSplash,
                {
                  position: 'absolute',
                  left: getCellLeft(blob.resultCol) - blobLeft - CELL_SIZE * 0.1,
                  top: getCellTop(blob.resultRow) - blobTop - CELL_SIZE * 0.1,
                  width: CELL_SIZE * 1.2,
                  height: CELL_SIZE * 1.2,
                  backgroundColor: COLORS[blob.value] || COLORS[0],
                  opacity: blob.progress.interpolate({
                    inputRange: [0, 0.6, 0.8, 1],
                    outputRange: [0, 0, 0.3, 0],
                  }),
                  transform: [
                    { scale: blob.progress.interpolate({
                      inputRange: [0, 0.6, 0.8, 1],
                      outputRange: [0, 0, 1, 1.5],
                    })},
                  ],
                },
              ]}
            />
          </Animated.View>
        );
      })}

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
    borderRadius: 8,
    position: 'relative',
    alignSelf: 'center',
    marginTop: 25,
    marginBottom: 10,
    // Ensure proper centering on tablets
    maxWidth: 600,
  },
  boardDark: {
    backgroundColor: '#2a2a2a',
    borderWidth: 2,
    borderColor: '#444444',
  },
  boardLight: {
    backgroundColor: '#e9ecef',
    borderWidth: 2,
    borderColor: '#dee2e6',
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'transparent',
  },
  cellFilled: {
    borderColor: 'transparent',
  },
  cellText: {
    color: '#fff',
    fontSize: Math.max(14, CELL_SIZE / 3),
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  fallingBlock: {
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'transparent',
  },
  mergingTile: {
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'transparent',
  },
  mergeResult: {
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'transparent',
  },
  milestoneTile: {
    borderColor: 'transparent',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  starsContainer: {
    position: 'absolute',
    top: -CELL_SIZE * 0.2,
    left: -CELL_SIZE * 0.2,
    right: -CELL_SIZE * 0.2,
    bottom: -CELL_SIZE * 0.2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
  starIcon: {
    fontSize: CELL_SIZE * 0.4,
    color: '#ffd700', // Gold color for stars
  },
  starTop: {
    position: 'absolute',
    top: -CELL_SIZE * 0.1,
  },
  starBottom: {
    position: 'absolute',
    bottom: -CELL_SIZE * 0.1,
  },
  crownIcon: {
    fontSize: CELL_SIZE * 0.6,
    position: 'absolute',
    top: -CELL_SIZE * 0.1,
    left: CELL_SIZE * 0.4,
    zIndex: 1,
  },
  milestoneText: {
    color: '#ffd700', // Gold color for milestone text
  },
  crownedText: {
    color: '#ffd700', // Gold color for crowned text
  },
  glowRing: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4FC3F7',
    backgroundColor: 'transparent',
    shadowColor: '#4FC3F7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
  },
  glowText: {
    color: '#ffffff',
    fontWeight: '900',
    textShadowColor: 'rgba(79, 195, 247, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
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
  mainTile: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'transparent',
    zIndex: 1,
  },
  cellTouchArea: {
    position: 'absolute',
    borderRadius: 4,
    backgroundColor: 'transparent', // Make it invisible
    zIndex: 10, // Above cells but below animations
  },
  // Liquid blob animation styles
  liquidBlob: {
    zIndex: 15, // Above regular tiles, below result
    justifyContent: 'center',
    alignItems: 'center',
  },
  liquidShape: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  liquidWave: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  liquidDroplet: {
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  liquidSplash: {
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
  },
  
  // Guide overlay styles
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
    fontSize: Math.max(16, CELL_SIZE / 2.5),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Animation styles
  mergeAnimationTile: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowEffect: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 12,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 15,
  },
});

export default GameGrid; 