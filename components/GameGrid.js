import React from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Text } from 'react-native';
import ElementTile from './ElementTile';
import PlanetTile from './PlanetTile';
import { 
  CELL_SIZE, 
  CELL_MARGIN, 
  getCellLeft, 
  getCellTop,
  THEME,
  ROWS,
  COLS
} from './constants';

// Optimized GameGrid with memo to prevent unnecessary re-renders
const GameGrid = React.memo(({ 
  board, 
  falling, 
  mergingTiles, 
  mergeResult, 
  enhancedMergeAnimations,
  onRowTap, 
  gameOver,
  showGuide,
  collisionAnimations
}) => {
  const isTouchEnabled = true; // Default value since it's not passed as prop
  const isDisabled = gameOver || !isTouchEnabled; // Simplified - no falling tile interference
  
  return (
    <View style={[styles.board, styles.boardDark]}>
      {/* Game grid container with proper bounds */}
      <View style={styles.gridContainer}>
        {/* Render grid as rows and columns using flexbox */}
        {board.map((row, rowIdx) => (
          <View 
            key={`row-${rowIdx}`} 
            style={styles.gridRow}
          >
            {row.map((cell, colIdx) => {
              // Check if this cell is currently being animated to prevent interaction
              const isAnimating = enhancedMergeAnimations.some(anim => 
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
                    style={styles.cellTouchable}
                    onPress={() => {
                      onRowTap && onRowTap(rowIdx, colIdx); // Pass row and column as expected
                    }}
                    disabled={cellDisabled}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.cell, cellStyle]}>
                      {cell >= 2 ? ( // All values 2+ are planets now
                        <PlanetTile 
                          value={cell} 
                          size={CELL_SIZE * 0.9} // Slightly smaller to prevent overlap
                          isOrbiting={false}
                        />
                      ) : cell > 0 ? (
                        <ElementTile 
                          value={cell} 
                          size={CELL_SIZE * 0.9} // Slightly smaller to prevent overlap
                        />
                      ) : null}
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ))}
        
        {/* Falling tile - positioned absolutely within grid bounds - MASTER BRANCH STYLE */}
        {falling && !falling.inPreview && (
          <Animated.View 
            style={[
              styles.fallingTile,
              {
                position: 'absolute',
                left: getCellLeft(falling.col), // Use the actual column of the falling tile
                top: getCellTop(ROWS - 1), // Always start from BOTTOM row (last row) like master branch
                width: CELL_SIZE,
                height: CELL_SIZE,
                transform: [{ translateY: falling.anim }], // Animate from bottom to target
                zIndex: 25, // Higher z-index to ensure visibility during drop
                
                // Apply proper tile styling like master branch
                backgroundColor: THEME.DARK.BACKGROUND_CELL, // Visible background
                borderRadius: 8,
                borderWidth: 2,
                borderColor: 'rgba(255, 215, 0, 0.6)', // Golden border for visibility
                justifyContent: 'center',
                alignItems: 'center',
                
                // Add shadow for depth
                shadowColor: '#FFD700',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 4,
                elevation: 8, // Android shadow
              }
            ]}
          >
            {/* Background glow effect for better visibility */}
            <View style={{
              position: 'absolute',
              width: '120%',
              height: '120%',
              borderRadius: 10,
              backgroundColor: 'rgba(255, 215, 0, 0.2)',
              zIndex: -1,
            }} />
            
            {/* Planet content */}
            {falling.value >= 2 ? ( // All values 2+ are planets now
              <PlanetTile 
                value={falling.value} 
                size={CELL_SIZE * 0.8} // Slightly smaller to fit within styled border
                isOrbiting={true}
                orbitSpeed={4} // Faster orbit during drop for visibility
              />
            ) : (
              <ElementTile 
                value={falling.value} 
                size={CELL_SIZE * 0.8} // Slightly smaller to fit within styled border
              />
            )}
            
            {/* Additional visibility indicator - pulsing edge */}
            <Animated.View style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#FFFFFF',
              opacity: 0.8,
            }} />
          </Animated.View>
        )}
      </View>

      {/* Dropping tile animation */}
      {/* This section is removed as per the edit hint */}

      {/* Collision animations */}
        {/* Enhanced Planetary Collision Animations with Intermediate States */}
        {collisionAnimations && collisionAnimations.map((collision) => (
          <View key={collision.id} style={{ position: 'absolute', zIndex: 50 }}>
            
            {/* Phase 1: Gravitational attraction effects on merging planets */}
            {collision.attractionAnimations && collision.attractionAnimations.map((attraction) => (
              <Animated.View
                key={attraction.id}
              style={{
                position: 'absolute',
                  left: getCellLeft(attraction.col),
                  top: getCellTop(attraction.row),
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  zIndex: 20,
                  transform: [{ scale: attraction.scale }],
                  opacity: attraction.opacity,
                }}
              >
                {/* Merge glow effect */}
                <Animated.View style={{
                  position: 'absolute',
                  width: '130%',
                  height: '130%',
                  left: '-15%',
                  top: '-15%',
                  borderRadius: CELL_SIZE * 0.65,
                  backgroundColor: 'rgba(255, 215, 0, 0.3)',
                  opacity: attraction.mergeGlow || 0,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 215, 0, 0.6)',
                }} />
                
                {/* Surface ripple effects */}
                <Animated.View style={{
                  position: 'absolute',
                  width: '110%',
                  height: '110%',
                  left: '-5%',
                  top: '-5%',
                  borderRadius: CELL_SIZE * 0.55,
                  borderWidth: 2,
                  borderColor: '#FFD700',
                  opacity: attraction.surfaceRipple || 0,
                }} />
                
                {/* Original planet with pre-merge effects */}
                <PlanetTile
                  value={attraction.value}
                  size={CELL_SIZE * 0.9}
                  isOrbiting={true}
                  orbitSpeed={5} // Fast orbit due to gravitational stress
                />
              </Animated.View>
            ))}

            {/* Phase 2: Collision shockwave */}
            {collision.shockwave && (
              <Animated.View
                style={{
                  position: 'absolute',
                  left: getCellLeft(collision.col) - (CELL_SIZE * 1.5),
                  top: getCellTop(collision.row) - (CELL_SIZE * 1.5),
                  width: CELL_SIZE * 4,
                  height: CELL_SIZE * 4,
                  zIndex: 30,
                  transform: [{ scale: collision.shockwave.scale }],
                  opacity: collision.shockwave.opacity,
                  borderRadius: CELL_SIZE * 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderWidth: 3,
                  borderColor: 'rgba(255, 215, 0, 0.6)',
                }}
              />
            )}

            {/* Phase 3: Intermediate merge states - show progression */}
            {collision.intermediateAnimations && collision.intermediateAnimations.map((intermediate, index) => (
              <Animated.View
                key={intermediate.id}
                style={{
                  position: 'absolute',
                  left: getCellLeft(intermediate.col),
                  top: getCellTop(intermediate.row),
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  zIndex: 25 + index, // Increase z-index for each step
                  transform: [{ scale: intermediate.scale }],
                  opacity: intermediate.opacity,
                }}
              >
                {/* Step glow effect */}
                <Animated.View style={{
                  position: 'absolute',
                  width: '150%',
                  height: '150%',
                  left: '-25%',
                  top: '-25%',
                  borderRadius: CELL_SIZE * 0.75,
                  backgroundColor: `rgba(${100 + index * 30}, ${200 + index * 20}, 255, 0.3)`, // Progressive color
                  opacity: intermediate.stepGlow || 0,
                  borderWidth: 2,
                  borderColor: `rgba(${150 + index * 30}, ${220 + index * 20}, 255, 0.8)`,
                }} />
                
                {/* Progress indicator text */}
                <View style={{
                  position: 'absolute',
                  top: -20,
                  left: 0,
                  right: 0,
                  alignItems: 'center',
                }}>
                  <Text style={{
                    color: '#FFD700',
                    fontSize: 12,
                    fontWeight: 'bold',
                    textShadowColor: 'rgba(0,0,0,0.8)',
                    textShadowOffset: { width: 1, height: 1 },
                    textShadowRadius: 2,
                  }}>
                    Step {index + 1}
                  </Text>
                </View>
                
                {/* Intermediate planet */}
                <PlanetTile 
                  value={intermediate.value}
                  size={CELL_SIZE * 0.9}
                  isOrbiting={true}
                  orbitSpeed={3} // Moderate orbit for intermediate states
                />
              </Animated.View>
            ))}

            {/* Phase 4: Final planet formation */}
            {collision.finalResult && (
        <Animated.View
          style={{
            position: 'absolute',
                  left: getCellLeft(collision.finalResult.col),
                  top: getCellTop(collision.finalResult.row),
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  zIndex: 35,
                  transform: [{ scale: collision.finalResult.scale }],
                  opacity: collision.finalResult.opacity,
                }}
              >
                {/* Final explosion effect */}
                <Animated.View style={{
                  position: 'absolute',
                  width: '200%',
                  height: '200%',
                  left: '-50%',
                  top: '-50%',
                  borderRadius: CELL_SIZE,
                  backgroundColor: 'rgba(255, 100, 100, 0.4)',
                  opacity: collision.finalResult.finalExplosion || 0,
                  borderWidth: 3,
                  borderColor: 'rgba(255, 150, 0, 0.8)',
                }} />
                
                {/* Core glow effect */}
                <Animated.View style={{
                  position: 'absolute',
                  width: '140%',
                  height: '140%',
                  left: '-20%',
                  top: '-20%',
                  borderRadius: CELL_SIZE * 0.7,
                  backgroundColor: 'rgba(255, 215, 0, 0.4)',
                  opacity: collision.finalResult.coreGlow || 0,
                }} />
                
                {/* Atmospheric expansion */}
                <Animated.View style={{
                  position: 'absolute',
                  width: '120%',
                  height: '120%',
                  left: '-10%',
                  top: '-10%',
                  borderRadius: CELL_SIZE * 0.6,
                  borderWidth: 2,
                  borderColor: 'rgba(135, 206, 235, 0.6)',
                  opacity: collision.finalResult.atmosphereExpand || 0,
                }} />
                
                {/* Final result planet */}
            <PlanetTile 
                  value={collision.finalResult.value}
                  size={CELL_SIZE * 0.9}
              isOrbiting={true}
                  orbitSpeed={2} // Calm orbit for newly formed planet
            />
        </Animated.View>
      )}
            
          </View>
        ))}

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
          {tile.value >= 2 ? ( // All values 2+ are planets now
            <PlanetTile 
              value={tile.value} 
              isOrbiting={true}
              orbitSpeed={2} // Fast orbit for merging
            />
          ) : (
            <ElementTile 
              value={tile.value} 
              isActive={true}
              pulseSpeed={2} // Fast pulse for merging
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
          {mergeResult.value >= 64 ? ( // All values 64+ are planets now
            <PlanetTile 
              value={mergeResult.value} 
              isOrbiting={true}
              orbitSpeed={3} // Very fast orbit for new planet creation
            />
          ) : (
            <ElementTile 
              value={mergeResult.value} 
              isActive={true}
              pulseSpeed={3} // Very fast pulse for new creation
            />
          )}
        </Animated.View>
      )}

      {/* Enhanced merge animations */}
      {enhancedMergeAnimations.map((anim) => (
        <Animated.View
          key={anim.id}
          style={[
            styles.enhancedMerge,
            {
            position: 'absolute',
            left: getCellLeft(anim.col),
            top: getCellTop(anim.row),
              width: CELL_SIZE,
              height: CELL_SIZE,
            transform: [
                { scale: anim.scaleAnim || 1 },
                { rotate: anim.rotateAnim ? `${anim.rotateAnim._value || 0}deg` : '0deg' }
            ],
              opacity: anim.opacityAnim || 1,
            }
          ]}
        >
          {anim.value >= 64 ? ( // All values 64+ are planets now
            <PlanetTile 
              value={anim.value} 
              size={CELL_SIZE}
              isOrbiting={false}
            />
          ) : (
            <ElementTile 
              value={anim.value} 
              size={CELL_SIZE}
            />
          )}
        </Animated.View>
      ))}

      {/* Guide overlay - simplified to prevent overlap issues */}
      {showGuide && (
        <View style={styles.guideOverlay}>
          <Text style={styles.guideText}>
            🌌 Tap to forge planets{'\n'}
            🪐 Identical worlds merge into larger celestial bodies!
          </Text>
        </View>
      )}
    </View>
  );
});

// Add display name for debugging
GameGrid.displayName = 'GameGrid';

const styles = StyleSheet.create({
  board: {
    position: 'relative',
    backgroundColor: 'transparent', // Remove solid background - let space show through
    borderRadius: 20, // Softer, more organic feel
    padding: 8, // Increased padding for floating feel
    margin: 8, // More margin for space-like separation
  },
  boardDark: {
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
  fallingTile: {
    // Master branch style for falling tiles
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    // Remove pointerEvents: 'none' to ensure full visibility
  },
  mergeTile: {
    position: 'absolute',
    zIndex: 15,
    borderRadius: 8,
  },
  mergeResult: {
    position: 'absolute',
    zIndex: 20,
    borderRadius: 8,
  },
  guideOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 5, 20, 0.85)', // Deep space overlay
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    borderRadius: 20, // Match the space theme
    pointerEvents: 'none', // Allow touches to pass through to the grid below
  },
  guideText: {
    color: '#E6E6FA', // Light cosmic color (lavender)
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(138, 43, 226, 0.8)', // Purple cosmic glow
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12, // Strong glow effect
  },
  enhancedMerge: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GameGrid; 