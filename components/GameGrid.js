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
  TILE_GRADIENTS,
  getPlanetType,
  THEME
} from './constants';
import PlanetTile from './PlanetTile';

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
    <View style={[styles.board, styles.boardDeepSpace]} {...panHandlers}>
      {/* Game grid container with proper bounds */}
      <View style={styles.gridContainer}>
        {/* Render grid as rows and columns using flexbox */}
        {board.map((row, rowIdx) => (
          <View 
            key={`row-${rowIdx}`} 
            style={[styles.gridRow, rowIdx === ROWS - 1 && styles.lastRow]}
          >
            {row.map((cell, colIdx) => {
              // Check if this cell is currently being animated to prevent interaction
              const isAnimating = mergeAnimations.some(anim => 
                anim.row === rowIdx && anim.col === colIdx
              );
              
              const cellStyle = {
                opacity: isDisabled || isAnimating ? 0.6 : 1,
              };
              
              const cellDisabled = isDisabled || isAnimating;
              
              return (
                <View 
                  key={`cell-${rowIdx}-${colIdx}`} 
                  style={styles.cellContainer}
                >
                  <TouchableOpacity
                    style={[styles.cellTouchable, cellStyle]}
                    onPress={() => {
                      onRowTap(rowIdx, colIdx);
                    }}
                    disabled={cellDisabled}
                    activeOpacity={0.7}
                    delayPressIn={50}
                    delayPressOut={50}
                  >
                    <View style={styles.cell}>
                      <PlanetTile 
                        value={cell}
                        size={CELL_SIZE}
                        isOrbiting={cell > 0}
                        orbitSpeed={1}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
                     </View>
         ))}
      </View>

      {/* Falling block animation using PlanetTile - only show when not in preview mode */}
      {falling && !falling.inPreview && (
        <Animated.View
          style={{
            position: 'absolute',
            left: falling.col * (CELL_SIZE + 16) + 20, // Adjust for flexbox spacing
            top: falling.static ? (ROWS - 1) * (CELL_SIZE + 16) + 20 : 20,
            transform: falling.static ? [] : [{ translateY: falling.anim }],
            zIndex: 1000,
          }}
        >
          <PlanetTile 
            value={falling.value}
            size={CELL_SIZE}
            isOrbiting={true}
            orbitSpeed={2} // Faster rotation for falling tiles
          />
        </Animated.View>
      )}

      {/* Merging tiles animations using PlanetTile */}
      {mergingTiles.map((tile) => (
        <Animated.View
          key={tile.id}
          style={{
            position: 'absolute',
            left: tile.col * (CELL_SIZE + 16) + 20, // Adjust for flexbox spacing
            top: tile.row * (CELL_SIZE + 16) + 20,
            opacity: tile.anim,
            transform: [{ scale: tile.scale }],
            zIndex: 1000,
          }}
        >
          <PlanetTile 
            value={tile.value}
            size={CELL_SIZE}
            isOrbiting={true}
            orbitSpeed={3} // Even faster rotation for merging animation
          />
        </Animated.View>
      ))}

      {/* Merge result animation using PlanetTile */}
      {mergeResult && (
        <Animated.View
          style={{
            position: 'absolute',
            left: mergeResult.col * (CELL_SIZE + 16) + 20, // Adjust for flexbox spacing
            top: mergeResult.row * (CELL_SIZE + 16) + 20,
            opacity: mergeResult.anim,
            transform: [{ scale: mergeResult.scale }],
            zIndex: 1000,
          }}
        >
          <PlanetTile 
            value={mergeResult.value}
            size={CELL_SIZE}
            isOrbiting={true}
            orbitSpeed={1.5} // Moderate rotation for merge result
          />
        </Animated.View>
      )}

      {/* Enhanced merge animations using PlanetTile with cosmic glow */}
      {mergeAnimations.map((anim) => (
        <Animated.View
          key={anim.id}
          style={{
            position: 'absolute',
            left: anim.col * (CELL_SIZE + 16) + 20, // Adjust for flexbox spacing
            top: anim.row * (CELL_SIZE + 16) + 20,
            opacity: anim.opacity,
            transform: [{ scale: anim.scale }],
            zIndex: 1000,
          }}
        >
          {/* Enhanced cosmic glow effect */}
          <Animated.View
            style={{
              position: 'absolute',
              width: CELL_SIZE + 20,
              height: CELL_SIZE + 20,
              left: -10,
              top: -10,
              borderRadius: (CELL_SIZE + 20) / 2,
              opacity: anim.glow,
              backgroundColor: getPlanetType(anim.value).accent || '#00BFFF',
              shadowColor: getPlanetType(anim.value).accent || '#00BFFF',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 15,
              elevation: 20,
            }}
          />
          
          <PlanetTile 
            value={anim.value}
            size={CELL_SIZE}
            isOrbiting={true}
            orbitSpeed={4} // Very fast rotation for dramatic merge effect
          />
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
    position: 'relative',
    backgroundColor: 'transparent', // Remove solid background - let space show through
    borderRadius: 20, // Softer, more organic feel
    padding: 8, // Increased padding for floating feel
    margin: 8, // More margin for space-like separation
    alignSelf: 'center',
    marginTop: 25,
    marginBottom: 10,
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
  boardDeepSpace: {
    backgroundColor: 'rgba(26, 26, 46, 0.3)', // Very subtle space background
  },
  gridContainer: {
    position: 'relative',
    flexDirection: 'column',
    overflow: 'hidden',
    alignSelf: 'center',
    // Remove any rigid structure
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 8, // Increased spacing for floating feel
  },
  lastRow: {
    marginBottom: 0,
  },
  cellContainer: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2, // Small margin for floating effect
  },
  cellTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    borderRadius: 12, // More rounded for organic feel
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    // Remove all backgrounds and borders for true space feel
    backgroundColor: 'transparent',
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