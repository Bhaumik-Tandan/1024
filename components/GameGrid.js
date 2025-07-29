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
  isElement
} from './constants';
import PlanetTile from './PlanetTile';
import ElementTile from './ElementTile';

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

      {/* Render all cells using appropriate tile component */}
      {board.map((row, rowIdx) =>
        row.map((cell, colIdx) => {
          // Check if this cell is currently being animated (hide it during merge)
          const isAnimating = mergeAnimations.some(anim => 
            anim.row === rowIdx && anim.col === colIdx
          );
          
          return (
            <View
              key={`${rowIdx}-${colIdx}`}
              style={{
                position: 'absolute',
                left: getCellLeft(colIdx),
                top: getCellTop(rowIdx),
                opacity: isAnimating ? 0 : 1, // Hide tiles during animation
              }}
            >
              {/* Use ElementTile for values ≤ 32, PlanetTile for values > 32 */}
              {isElement(cell) ? (
                <ElementTile 
                  value={cell} 
                  isActive={cell > 0 && !isAnimating}
                  pulseSpeed={1.2}
                />
              ) : (
                <PlanetTile 
                  value={cell} 
                  isOrbiting={cell > 0 && !isAnimating}
                  orbitSpeed={1.2}
                />
              )}
            </View>
          );
        })
      )}

      {/* Falling tile animation - only show when not in preview mode */}
      {falling && !falling.inPreview && (
        <Animated.View
          style={{
            position: 'absolute',
            left: getCellLeft(falling.col), // Use the actual column of the falling tile
            top: falling.static ? getCellTop(ROWS - 1) : getCellTop(0), // Use proper cell positioning
            transform: falling.static ? [] : [{ translateY: falling.anim }],
          }}
        >
          {/* Use appropriate tile type for falling tile */}
          {isElement(falling.value) ? (
            <ElementTile 
              value={falling.value} 
              isActive={true}
              pulseSpeed={1.5} // Faster pulse for falling element
            />
          ) : (
            <PlanetTile 
              value={falling.value} 
              isOrbiting={true}
              orbitSpeed={1.5} // Faster orbit for falling planet
            />
          )}
        </Animated.View>
      )}

      {/* Merging tile animations */}
      {mergingTiles.map((tile, index) => (
        <Animated.View
          key={tile.id || `merging-${index}`}
          style={{
            position: 'absolute',
            left: getCellLeft(tile.col),
            top: getCellTop(tile.row),
            opacity: tile.anim,
            transform: [{ scale: tile.scale }],
          }}
        >
          {/* Use appropriate tile type for merging tile */}
          {isElement(tile.value) ? (
            <ElementTile 
              value={tile.value} 
              isActive={true}
              pulseSpeed={2} // Fast pulse for merging
            />
          ) : (
            <PlanetTile 
              value={tile.value} 
              isOrbiting={true}
              orbitSpeed={2} // Fast orbit for merging
            />
          )}
        </Animated.View>
      ))}

      {/* Merge result animation */}
      {mergeResult && (
        <Animated.View
          style={{
            position: 'absolute',
            left: getCellLeft(mergeResult.col),
            top: getCellTop(mergeResult.row),
            opacity: mergeResult.opacity,
            transform: [
              { scale: mergeResult.scale },
              { rotate: mergeResult.rotation }
            ],
          }}
        >
          {/* Use appropriate tile type for merge result */}
          {isElement(mergeResult.value) ? (
            <ElementTile 
              value={mergeResult.value} 
              isActive={true}
              pulseSpeed={3} // Very fast pulse for new creation
            />
          ) : (
            <PlanetTile 
              value={mergeResult.value} 
              isOrbiting={true}
              orbitSpeed={3} // Very fast orbit for new planet creation
            />
          )}
        </Animated.View>
      )}

      {/* Enhanced merge animations */}
      {mergeAnimations.map((anim) => (
        <Animated.View
          key={anim.id}
          style={{
            position: 'absolute',
            left: getCellLeft(anim.col),
            top: getCellTop(anim.row),
            opacity: anim.opacity,
            transform: [
              { scale: anim.scale },
              { rotate: anim.rotation || '0deg' }
            ],
          }}
        >
          {/* Use appropriate tile type for animation */}
          {isElement(anim.value) ? (
            <ElementTile 
              value={anim.value} 
              isActive={true}
              pulseSpeed={2.5}
            />
          ) : (
            <PlanetTile 
              value={anim.value} 
              isOrbiting={true}
              orbitSpeed={2.5}
            />
          )}
        </Animated.View>
      ))}

      {/* Liquid blob animations for element-to-planet transitions */}
      {liquidBlobs && liquidBlobs.map((blob) => (
        <Animated.View
          key={blob.id}
          style={{
            position: 'absolute',
            left: getCellLeft(blob.minCol) - 5,
            top: getCellTop(blob.minRow) - 5,
            width: (blob.maxCol - blob.minCol + 1) * (CELL_SIZE + CELL_MARGIN) + 10,
            height: (blob.maxRow - blob.minRow + 1) * (CELL_SIZE + CELL_MARGIN) + 10,
            opacity: blob.opacity,
            transform: [
              { scale: blob.scale },
              { rotate: blob.morph?.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }) || '0deg' }
            ],
          }}
        >
          <View style={{
            flex: 1,
            backgroundColor: blob.minCol <= 5 ? '#FFD700' : '#4169E1', // Golden for element merge, blue for planet merge
            borderRadius: 20,
            borderWidth: 3,
            borderColor: blob.minCol <= 5 ? '#FF8C00' : '#6495ED',
            shadowColor: blob.minCol <= 5 ? '#FFD700' : '#4169E1',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 15,
            elevation: 15,
          }} />
        </Animated.View>
      ))}

      {/* Game guide overlay */}
      {showGuide && !gameOver && (
        <View style={styles.guideOverlay}>
          <Text style={styles.guideText}>
            {falling && isElement(falling.value) ? 
              `Tap to place ${falling.value} element` : 
              `Tap to place planet`
            }
          </Text>
          <Text style={styles.guideSubtext}>
            Combine elements to create planets!
          </Text>
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
  guideSubtext: {
    color: '#ccc',
    fontSize: Math.max(12, CELL_SIZE / 3.5),
    textAlign: 'center',
    marginTop: 5,
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