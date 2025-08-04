import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
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
  THEME,
  screenWidth
} from './constants';
import PlanetTile from './PlanetTile';

// Get responsive spacing based on device - calculate once to avoid re-renders
const isTablet = screenWidth >= 768;
const responsiveSpacing = {
  boardPadding: isTablet ? 12 : 4,
  boardMargin: isTablet ? 8 : 4,
  gridRowMargin: isTablet ? 8 : 4,
  cellMargin: isTablet ? 3 : 1,
};

// Runtime measured positions for accurate column detection
let measuredColumnPositions = [];

// Measure actual column positions at runtime
const measureColumnPositions = (layout, rowRef) => {
  if (rowRef && rowRef.current) {
    const positions = [];
    for (let col = 0; col < COLS; col++) {
      // Calculate center X position for each column
      const cellWidth = layout.width / COLS;
      const centerX = col * cellWidth + cellWidth / 2;
      positions.push({
        col,
        centerX,
        leftBound: col * cellWidth,
        rightBound: (col + 1) * cellWidth
      });
    }
    measuredColumnPositions = positions;
  }
};

// Get column from X coordinate using measured positions
const getColumnFromMeasuredX = (x) => {
  if (measuredColumnPositions.length === 0) {
    // Fallback to simple calculation if not measured yet
    const columnWidth = CELL_SIZE + CELL_MARGIN;
    return Math.min(Math.floor(x / columnWidth), COLS - 1);
  }
  
  // Use measured positions for accurate detection
  for (const pos of measuredColumnPositions) {
    if (x >= pos.leftBound && x <= pos.rightBound) {
      return pos.col;
    }
  }
  
  // Find closest column if outside bounds
  let closestCol = 0;
  let minDistance = Math.abs(x - measuredColumnPositions[0].centerX);
  
  for (let i = 1; i < measuredColumnPositions.length; i++) {
    const distance = Math.abs(x - measuredColumnPositions[i].centerX);
    if (distance < minDistance) {
      minDistance = distance;
      closestCol = i;
    }
  }
  
  return closestCol;
};

// Get exact position for falling tiles using measured positions
const getExactCellPosition = (col) => {
  if (measuredColumnPositions.length > 0 && measuredColumnPositions[col]) {
    return measuredColumnPositions[col].centerX - CELL_SIZE / 2;
  }
  // Fallback to calculated position
  return col * (CELL_SIZE + CELL_MARGIN);
};

// PERFORMANCE: Memoized cell component to prevent unnecessary re-renders
const GameCell = React.memo(({ 
  cell, 
  rowIdx, 
  colIdx, 
  isAnimating, 
  isDisabled, 
  onPress 
}) => {
  const cellStyle = {
    ...styles.cellContainer,
    opacity: isAnimating ? 0.7 : 1, // Dim animated cells
    ...(isDisabled && styles.cellDisabled),
  };
  
  return (
    <View 
      style={[styles.cellContainer]}
    >
      <TouchableOpacity
        style={[styles.cellTouchable, cellStyle]}
        onPress={onPress}
        disabled={isDisabled || isAnimating}
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
});

// PERFORMANCE: Memoized row component to prevent unnecessary re-renders  
const GameRow = React.memo(({ 
  row, 
  rowIdx, 
  mergeAnimations,
  isDisabled,
  onRowTap 
}) => {
  return (
    <View 
      style={[styles.gridRow, rowIdx === ROWS - 1 && styles.lastRow]}
    >
      {row.map((cell, colIdx) => {
        // Check if this cell is currently being animated to prevent interaction
        const isAnimating = mergeAnimations.some(anim => 
          anim.row === rowIdx && anim.col === colIdx
        );
        
        return (
          <GameCell
            key={`cell-${rowIdx}-${colIdx}`}
            cell={cell}
            rowIdx={rowIdx}
            colIdx={colIdx}
            isAnimating={isAnimating}
            isDisabled={isDisabled}
            onPress={() => onRowTap(rowIdx, colIdx)}
          />
        );
      })}
    </View>
  );
});

// PERFORMANCE: Main GameGrid component with React.memo
const GameGrid = React.memo(({ 
  board, 
  falling, 
  mergingTiles, 
  mergeResult, 
  mergeAnimations,
  collisionEffects, // Add collision effects prop
  energyBursts, // Add energy bursts prop
  onRowTap, 
  onScreenTap, 
  gameOver,
  showGuide,
  panHandlers,
  isTouchEnabled = true
}) => {
  const gridRef = useRef(null);
  const isDisabled = gameOver || !falling || (falling?.fastDrop && !falling?.static) || !isTouchEnabled;
  
  // Enhanced screen tap handler with accurate coordinates
  const handleGridTap = (event) => {
    if (gridRef.current) {
      // Get touch position relative to grid container
      const { locationX } = event.nativeEvent;
      
      // Detect column using measured positions
      const detectedColumn = getColumnFromMeasuredX(locationX);
      
      // Call the parent's screen tap handler with accurate column
      if (onScreenTap) {
        onScreenTap({ 
          nativeEvent: { 
            locationX,
            detectedColumn // Pass detected column directly
          } 
        });
      }
    }
  };
  
  return (
    <View style={[styles.board, styles.boardDeepSpace]} {...panHandlers}>
      {/* Game grid container with precise measurement and tap detection */}
      <View 
        ref={gridRef}
        style={styles.gridContainer}
        onLayout={(event) => {
          measureColumnPositions(event.nativeEvent.layout, gridRef);
        }}
        onStartShouldSetResponder={() => true}
        onResponderGrant={handleGridTap}
      >
        {/* Render grid as rows and columns using flexbox */}
        {board.map((row, rowIdx) => (
          <GameRow
            key={`row-${rowIdx}`}
            row={row}
            rowIdx={rowIdx}
            mergeAnimations={mergeAnimations}
            isDisabled={isDisabled}
            onRowTap={onRowTap}
          />
        ))}
      </View>

      {/* Falling astronomical body - FIXED positioning for perfect alignment */}
      {falling && !falling.inPreview && falling.anim && falling.col !== undefined && (
        <Animated.View
          style={{
            position: 'absolute',
            left: getCellLeft(falling.col), // Left edge of the cell
            top: getCellTop(-1), // Start above the grid
            width: CELL_SIZE,
            height: CELL_SIZE,
            justifyContent: 'center',
            alignItems: 'center',
            transform: [
              {
                translateY: falling.anim,
              },
            ],
            zIndex: 1000,
          }}
        >
          <PlanetTile 
            value={falling.value}
            size={CELL_SIZE}
            isOrbiting={true}
            orbitSpeed={2} // Faster rotation while falling
          />
        </Animated.View>
      )}

      {/* Render merge animations - Elements-style collision system */}
      {mergeAnimations.map((anim) => (
        <Animated.View
          key={anim.id}
          style={{
            position: 'absolute',
            left: getCellLeft(anim.col || 0),
            top: getCellTop(anim.row || 0),
            width: CELL_SIZE,
            height: CELL_SIZE,
            transform: [
              { 
                translateX: anim.moveX || 0 
              },
              { 
                translateY: anim.moveY || 0 
              },
              { 
                scale: anim.scale || 1
              },
              // ENHANCED: No rotation - planets sink into each other
              // Rotation removed for cleaner sinking animation
              // ENHANCED: Handle bounce effect for result planets
              ...(anim.bounce ? [{ 
                translateY: anim.bounce.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -CELL_SIZE * 0.1]
                })
              }] : [])
            ],
            zIndex: 2000,
          }}
        >
          <PlanetTile 
            value={anim.value}
            size={CELL_SIZE}
            isOrbiting={false}
            isMerging={true}
          />
        </Animated.View>
      ))}

      {/* ELEMENTS-STYLE COLLISION EFFECTS */}
      {collisionEffects && collisionEffects.map((effect) => (
        <View key={effect.id} style={{ position: 'absolute', left: getCellLeft(effect.col || 0), top: getCellTop(effect.row || 0), zIndex: 3000 }}>
          {/* Bright impact flash */}
          <Animated.View
            style={{
              position: 'absolute',
              left: -CELL_SIZE * 0.5,
              top: -CELL_SIZE * 0.5,
              width: CELL_SIZE * 2,
              height: CELL_SIZE * 2,
              borderRadius: CELL_SIZE,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              opacity: Animated.multiply(effect.opacity, effect.flash || 0),
              transform: [{ scale: Animated.add(1, Animated.multiply(effect.flash || 0, 0.5)) }],
            }}
          />
          
          {/* ENHANCED: Primary expanding shockwave */}
          <Animated.View
            style={{
              position: 'absolute',
              left: -CELL_SIZE * 1.5,
              top: -CELL_SIZE * 1.5,
              width: CELL_SIZE * 4,
              height: CELL_SIZE * 4,
              borderRadius: CELL_SIZE * 2,
              borderWidth: 3,
              borderColor: '#FF6B35',
              opacity: Animated.multiply(effect.opacity, Animated.subtract(1, effect.shockwave || 0)),
              transform: [{ scale: Animated.add(0.3, Animated.multiply(effect.shockwave || 0, 2)) }],
            }}
          />
          
          {/* ENHANCED: Secondary shockwave */}
          <Animated.View
            style={{
              position: 'absolute',
              left: -CELL_SIZE * 2,
              top: -CELL_SIZE * 2,
              width: CELL_SIZE * 5,
              height: CELL_SIZE * 5,
              borderRadius: CELL_SIZE * 2.5,
              borderWidth: 2,
              borderColor: '#FF8C42',
              opacity: Animated.multiply(effect.opacity, Animated.subtract(1, effect.secondaryShockwave || 0)),
              transform: [{ scale: Animated.add(0.2, Animated.multiply(effect.secondaryShockwave || 0, 2.5)) }],
            }}
          />
          
          {/* ENHANCED: Gravitational distortion effect */}
          <Animated.View
            style={{
              position: 'absolute',
              left: -CELL_SIZE * 0.5,
              top: -CELL_SIZE * 0.5,
              width: CELL_SIZE * 2,
              height: CELL_SIZE * 2,
              borderRadius: CELL_SIZE,
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              opacity: Animated.multiply(effect.opacity, effect.gravitationalDistortion || 0),
              transform: [
                { 
                  scale: Animated.add(1, Animated.multiply(effect.gravitationalDistortion || 0, 0.3))
                },
                {
                  rotate: Animated.multiply(effect.gravitationalDistortion || 0, 180).interpolate({
                    inputRange: [0, 180],
                    outputRange: ['0deg', '180deg']
                  })
                }
              ],
            }}
          />
          
          {/* Energy ring explosion */}
          <Animated.View
            style={{
              position: 'absolute',
              left: -CELL_SIZE,
              top: -CELL_SIZE,
              width: CELL_SIZE * 3,
              height: CELL_SIZE * 3,
              borderRadius: CELL_SIZE * 1.5,
              borderWidth: 2,
              borderColor: '#FFD700',
              opacity: Animated.multiply(effect.opacity, Animated.subtract(1, effect.energyRing || 0)),
              transform: [{ scale: Animated.add(0.2, Animated.multiply(effect.energyRing || 0, 2.5)) }],
            }}
          />
          
          {/* Collision sparks */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => (
            <Animated.View
              key={index}
              style={{
                position: 'absolute',
                left: -2,
                top: -2,
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: '#FFD700',
                opacity: Animated.multiply(effect.opacity, Animated.subtract(1, effect.sparks || 0)),
                transform: [
                  { 
                    translateX: Animated.multiply(effect.sparks || 0, Math.cos(angle * Math.PI / 180) * CELL_SIZE * 1.5)
                  },
                  { 
                    translateY: Animated.multiply(effect.sparks || 0, Math.sin(angle * Math.PI / 180) * CELL_SIZE * 1.5)
                  },
                  { scale: Animated.subtract(1, Animated.multiply(effect.sparks || 0, 0.5)) }
                ],
              }}
            />
          ))}
        </View>
      ))}

      {/* Render energy bursts - Stellar explosions */}
      {energyBursts.map((burst) => (
        <Animated.View
          key={burst.id}
          style={{
            position: 'absolute',
            left: getCellLeft(burst.col || 0),
            top: getCellTop(burst.row || 0),
            width: CELL_SIZE * 2,
            height: CELL_SIZE * 2,
            transform: [
              { 
                scale: burst.scale || 1
              },
              { 
                rotate: typeof burst.rotate === 'string' ? burst.rotate : `${burst.rotate || 0}deg`
              }
            ],
            zIndex: 4000,
          }}
        >
          <View style={[styles.energyBurst, { backgroundColor: burst.color }]} />
        </Animated.View>
      ))}

      {/* Render merge result - Cosmic fusion */}
      {mergeResult && mergeResult.scale && mergeResult.col !== undefined && (
        <Animated.View
          style={{
            position: 'absolute',
            left: getCellLeft(mergeResult.col),
            top: getCellTop(mergeResult.row || 0),
            width: CELL_SIZE,
            height: CELL_SIZE,
            transform: [
              { 
                scale: mergeResult.scale 
              }
            ],
            zIndex: 5000,
          }}
        >
          <PlanetTile 
            value={mergeResult.value}
            size={CELL_SIZE}
            isOrbiting={false}
            isMerging={false}
            isNewlyMerged={true}
          />
        </Animated.View>
      )}

      {/* Guide overlay for new players */}
      {showGuide && (
        <View style={styles.guideOverlay}>
          <Text style={styles.guideText}>Tap to drop tiles</Text>
        </View>
      )}
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  return (
    prevProps.board === nextProps.board &&
    prevProps.falling === nextProps.falling &&
    prevProps.mergeAnimations === nextProps.mergeAnimations &&
    prevProps.collisionEffects === nextProps.collisionEffects &&
    prevProps.energyBursts === nextProps.energyBursts &&
    prevProps.mergeResult === nextProps.mergeResult &&
    prevProps.gameOver === nextProps.gameOver &&
    prevProps.showGuide === nextProps.showGuide &&
    prevProps.isTouchEnabled === nextProps.isTouchEnabled
  );
});

const styles = StyleSheet.create({
  board: {
    position: 'relative',
    backgroundColor: 'transparent', // Completely transparent background
    borderRadius: 0, // No border radius
    padding: responsiveSpacing.boardPadding, // Responsive padding for iPad
    margin: responsiveSpacing.boardMargin, // Responsive margin for iPad
    alignSelf: 'center',
    marginTop: isTablet ? 20 : 15, // Larger top margin for iPad
    marginBottom: isTablet ? 15 : 5, // Larger bottom margin for iPad
  },
  boardDark: {
    backgroundColor: 'transparent', // Remove dark background
    borderWidth: 0, // Remove all borders
    borderColor: 'transparent',
  },
  boardLight: {
    backgroundColor: 'transparent', // Remove light background
    borderWidth: 0, // Remove all borders
    borderColor: 'transparent',
    shadowColor: 'transparent', // Remove shadows
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  boardDeepSpace: {
    backgroundColor: 'transparent', // Completely transparent for space
  },
  gridContainer: {
    position: 'relative',
    flexDirection: 'column',
    overflow: 'hidden',
    alignSelf: 'center',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 0, // Remove row spacing to eliminate grid appearance
  },
  lastRow: {
    marginBottom: 0,
  },
  cellContainer: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0, // Remove margin to eliminate grid appearance
  },
  cellTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    borderRadius: 0, // Remove border radius
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0, // Remove border radius
    backgroundColor: 'transparent', // Completely transparent
    borderWidth: 0, // Remove all borders
    borderColor: 'transparent',
  },
  cellFilled: {
    borderColor: 'transparent',
    borderWidth: 0, // Remove borders
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
    borderRadius: 0, // Remove border radius
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0, // Remove borders
    borderColor: 'transparent',
  },
  mergingTile: {
    borderRadius: 0, // Remove border radius
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0, // Remove borders
    borderColor: 'transparent',
  },
  mergeResult: {
    borderRadius: 0, // Remove border radius
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0, // Remove borders
    borderColor: 'transparent',
  },
  milestoneTile: {
    borderColor: 'transparent',
    borderWidth: 0, // Remove all borders
    borderRadius: 0, // Remove border radius
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
    borderRadius: 0, // Remove border radius
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0, // Remove borders
    borderColor: 'transparent',
    zIndex: 1,
  },
  cellTouchArea: {
    position: 'absolute',
    borderRadius: 0, // Remove border radius
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  // Liquid blob animation styles
  liquidBlob: {
    zIndex: 15,
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
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
  cellDisabled: {
    opacity: 0.6,
  },
  collisionEffect: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: CELL_SIZE / 2,
    opacity: 0.8,
  },
  energyBurst: {
    width: CELL_SIZE * 2,
    height: CELL_SIZE * 2,
    borderRadius: CELL_SIZE,
    opacity: 0.7,
  },
});

export default GameGrid; 