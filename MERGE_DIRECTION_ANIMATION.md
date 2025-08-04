# Merge Direction Animation Enhancement

## Overview
The merge animation system has been enhanced to make planets move towards the direction where the merge result will appear, creating a more natural and intuitive visual effect.

## How It Works

### Direction Calculation
The system calculates the merge direction by:
1. Finding the center of all merging tiles
2. Calculating the direction from the center to the result position
3. Normalizing the direction vector for consistent movement

### Animation Behavior

#### Horizontal Merges
- **Right merge**: Planets move towards the right where the result appears
- **Left merge**: Planets move towards the left where the result appears
- **Center merge**: Planets move towards the center position

#### Vertical Merges  
- **Downward merge**: Planets move downwards towards the result
- **Upward merge**: Planets move upwards towards the result

#### Diagonal Merges
- Planets move diagonally towards the result position
- Movement follows the calculated direction vector

### Technical Implementation

#### Key Changes
1. **Direction Calculation**: Added `calculateMergeDirection()` function in `AnimationManager.js`
2. **Movement Logic**: Modified attraction phase to use merge direction instead of center movement
3. **Distance**: Increased movement distance to `CELL_SIZE * 0.6` for better visual effect

#### Code Location
- **File**: `components/AnimationManager.js`
- **Function**: `showMergeResultAnimation()`
- **Lines**: 136-160 (direction calculation), 200-220 (movement logic)

### Visual Effect
- Planets now "gravitate" towards the merge result position
- Creates a more natural merging animation that follows the game's merge logic
- Maintains the existing collision effects and result formation animations
- Works with both regular merges and chain reactions

### Compatibility
- Fully backward compatible with existing merge logic
- No changes required to game rules or merge detection
- Works with all merge types (2-tile, 3-tile, 4-tile, etc.)
- Maintains performance optimizations

## Example Scenarios

### Scenario 1: Horizontal 3-tile Merge
```
Before: [4][4][4] 
After:  [0][0][8]
```
- All three planets move towards the rightmost position
- Direction: `{ horizontal: 0, vertical: 1 }`

### Scenario 2: Vertical 3-tile Merge  
```
Before: [4]
        [4] 
        [4]
After:  [0]
        [0]
        [8]
```
- All three planets move downwards towards the bottom position
- Direction: `{ horizontal: 1, vertical: 0 }`

### Scenario 3: Diagonal 2-tile Merge
```
Before: [4][0]
        [0][4]
After:  [0][0] 
        [0][8]
```
- Both planets move diagonally towards the result position
- Direction: `{ horizontal: 0.707, vertical: 0.707 }` 