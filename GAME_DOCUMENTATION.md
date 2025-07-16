# 🎮 1024 Drop Game - Complete Documentation

## 📋 Table of Contents
1. [Game Rules](#game-rules)
2. [Code Architecture](#code-architecture)
3. [Component Structure](#component-structure)
4. [Game Configuration](#game-configuration)
5. [Developer Guide](#developer-guide)
6. [Customization](#customization)

---

## 🎯 Game Rules

### **Core Objective**
Create larger numbered tiles by merging identical tiles, aiming to reach **2048** or achieve the highest score possible.

### **🎮 How to Play**

#### **Basic Controls**
- **Drag**: Move falling tiles left/right while they're falling
- **Tap Column**: Fast-drop a tile into a specific column
- **Auto-Fall**: If no input, tiles fall automatically after 7 seconds

#### **Board Layout**
- **Grid Size**: 5 columns × 7 rows (35 total cells)
- **Spawn Position**: New tiles always appear in the center column
- **Game Over**: When the top row is completely filled

---

### **🔄 Merging Rules**

#### **Rule 1: Adjacent Pair Merging**
- **Trigger**: Two identical tiles are adjacent (up, down, left, right)
- **Formula**: `newValue = originalValue × 2`
- **Example**: `4 + 4 = 8`

#### **Rule 2: Connected Group Merging**
- **Trigger**: Multiple connected identical tiles (2 or more)
- **Formula**: `newValue = originalValue × 2^(numberOfTiles - 1)`
- **Examples**:
  - 3 tiles of 4: `4 × 2^(3-1) = 4 × 4 = 16`
  - 4 tiles of 4: `4 × 2^(4-1) = 4 × 8 = 32`
  - 5+ tiles: Theoretically possible but practically impossible due to immediate merging

#### **Rule 3: Horizontal Row Merging**
- **Trigger**: 3+ identical consecutive tiles in a horizontal row
- **Formula**: `newValue = originalValue × 2`
- **Position**: Merged tile appears at the rightmost position
- **Example**: `[4][4][4]` becomes `[0][0][8]`

#### **Rule 4: Chain Reactions**
- **Trigger**: After any merge, gravity is applied and new adjacent tiles may form
- **Process**: 
  1. Drop tile → check for merges
  2. If merge happens → place merged result → check around that new position for more merges
  3. Repeat until no more merges are possible
- **Behavior**: Each merge is separate (2+3≠5, but 2→3 as separate merges)
- **Bonus**: Chain reactions provide scoring bonuses

#### **Rule 5: Physics & Movement**
- **Gravity**: All tiles fall to the lowest available position
- **Collision**: Tiles cannot pass through occupied cells
- **Landing**: Tiles settle in the lowest empty position in their column

---

### **🏆 Scoring System**

#### **Base Scoring**
- **Points**: Equal to the value of merged tiles
- **Example**: Merging to create a 64 tile gives 64 points

#### **Bonus Multipliers**
- **Chain Reaction Bonus**: +50% for subsequent merges
- **Large Merge Bonus**: +100% for merging 4+ tiles simultaneously
- **Speed Bonus**: Faster moves may provide small bonuses

#### **Winning Conditions**
- **Primary Goal**: Create a 2048 tile
- **Secondary Goal**: Achieve the highest score possible
- **Endless Mode**: Continue playing after reaching 2048

---

## 🏗️ Code Architecture

### **Component Hierarchy**
```
DropNumberBoard (Main Container)
├── GameHeader (Score Display)
├── GameGrid (Game Board & Animations)
├── AnimationManager (Animation State)
├── GameLogic (Core Mechanics)
├── GameRules (Rules Engine)
└── constants (Visual Configuration)
```

### **File Structure**
```
components/
├── DropNumberBoard.js    // Main game component
├── GameHeader.js         // Score/stats display
├── GameGrid.js          // Board rendering & UI
├── AnimationManager.js   // Animation controls
├── GameLogic.js         // Core game mechanics
├── GameRules.js         // Centralized rules system
└── constants.js         // Visual constants & theming
```

---

## 📦 Component Structure

### **🎮 DropNumberBoard.js** - Main Game Controller
**Purpose**: Orchestrates all game components and manages overall state

**Key Features**:
- Game state management (board, score, game over)
- User input handling (tap, drag)
- Win/lose condition checking
- Game statistics tracking

**State Management**:
```javascript
// Core game state
const [board, setBoard] = useState(() => GameHelpers.createEmptyBoard());
const [score, setScore] = useState(0);
const [gameOver, setGameOver] = useState(false);
const [hasWon, setHasWon] = useState(false);

// Game statistics
const [gameStats, setGameStats] = useState({
  tilesPlaced: 0,
  mergesPerformed: 0,
  chainReactions: 0,
  highestTile: 0,
  startTime: Date.now(),
});
```

### **🎨 GameGrid.js** - Visual Game Board
**Purpose**: Renders the game board, tiles, and animations

**Key Features**:
- Cell rendering with responsive design
- Falling tile animations
- Merge effect animations
- Touch/drag input handling
- Preview tile display

### **📊 GameHeader.js** - Score Display
**Purpose**: Shows game statistics and player progress

**Displays**:
- Current score
- Best/record score
- Player rank
- Game coins/currency

### **🎬 AnimationManager.js** - Animation Controller
**Purpose**: Manages all game animations using React Native Animated API

**Animation Types**:
- Falling tile movement
- Merge effects with scaling
- Chain reaction sequences
- UI feedback animations

### **🧮 GameLogic.js** - Core Game Engine
**Purpose**: Implements all game mechanics and rules

**Key Functions**:
- `handleBlockLanding()` - Main game engine
- `mergeConnectedTiles()` - Connected group merging
- `mergeRowTilesWithAnim()` - Horizontal row merging
- `applyGravity()` - Physics simulation

### **📋 GameRules.js** - Rules Engine
**Purpose**: Centralized configuration and validation system

**Modules**:
- `GAME_CONFIG` - Timing, dimensions, scoring
- `GAME_RULES` - All merging and movement rules
- `GameValidator` - Input and state validation
- `ScoringSystem` - Score calculation
- `GameHelpers` - Utility functions

### **🎨 constants.js** - Visual Configuration
**Purpose**: UI theming, colors, and responsive design

**Features**:
- Color schemes and themes
- Responsive breakpoints
- Animation configurations
- Font scaling

---

## ⚙️ Game Configuration

### **Board Settings** (GameRules.js)
```javascript
BOARD: {
  ROWS: 7,           // Vertical cells
  COLS: 5,           // Horizontal cells
  TOTAL_CELLS: 35,   // Total grid cells
}
```

### **Timing Settings**
```javascript
TIMING: {
  SLOW_FALL_DURATION: 7000,    // Normal fall time (7s)
  FAST_DROP_DURATION: 250,     // Fast drop time (0.25s)
  MERGE_ANIMATION_DURATION: 250, // Merge animation delay
  DRAG_ANIMATION_DURATION: 200,  // Drag response time
}
```

### **Tile Generation**
```javascript
TILE_GENERATION: {
  POSSIBLE_VALUES: [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024],
  SMALL_VALUES_COUNT: 5, // Higher probability for smaller values
  SPAWN_POSITION: 'center', // Always spawn in center column
}
```

### **Scoring Configuration**
```javascript
SCORING: {
  BASE_SCORE_MULTIPLIER: 1,
  COMBO_BONUS_MULTIPLIER: 1.5,  // +50% for chain reactions
  LARGE_MERGE_BONUS: 2.0,       // +100% for 4+ tile merges
}
```

---

## 👨‍💻 Developer Guide

### **Adding New Features**

#### **1. Modify Game Rules**
```javascript
// In GameRules.js
export const GAME_RULES = {
  // Add new rule configuration
  newFeature: {
    enabled: true,
    parameters: { /* ... */ },
    formula: (value) => value * 2,
  },
};
```

#### **2. Implement Logic**
```javascript
// In GameLogic.js
export const implementNewFeature = (board, params) => {
  // Use rules from GAME_RULES.newFeature
  if (!GAME_RULES.newFeature.enabled) return;
  
  // Implementation here
};
```

#### **3. Update UI**
```javascript
// In relevant component
import { GAME_RULES } from './GameRules';

// Use configuration in component
const FeatureComponent = () => {
  const { enabled, parameters } = GAME_RULES.newFeature;
  // Component implementation
};
```

### **Testing New Features**
```javascript
// Use GameValidator for testing
import { GameValidator } from './GameRules';

// Validate board states
const isValidState = GameValidator.isValidBoard(testBoard);

// Test move validity
const canMakeMove = GameValidator.isValidMove(board, fromRow, fromCol, toRow, toCol);

// Check win/lose conditions
const hasPlayerWon = GameValidator.hasWon(board, score);
const isGameFinished = GameValidator.isGameOver(board);
```

### **Debugging Tools**
```javascript
// Enable detailed logging
console.log('Board state:', board);
console.log('Game difficulty:', GameHelpers.calculateDifficulty(board));
console.log('Empty cells:', GameHelpers.countEmptyCells(board));
```

---

## 🎨 Customization

### **Visual Theming**
```javascript
// In constants.js - Modify colors
export const COLORS = {
  2: '#eee4da',      // Light beige
  4: '#ede0c8',      // Darker beige
  8: '#8dd3f4',      // Light blue
  // Add more colors for higher values
  32768: '#custom',   // Your custom color
};

// Modify theme
export const THEME = {
  BACKGROUND_PRIMARY: '#your-color',
  TEXT_PRIMARY: '#your-text-color',
  // Customize other theme elements
};
```

### **Game Balance**
```javascript
// In GameRules.js - Adjust difficulty
export const GAME_CONFIG = {
  TIMING: {
    SLOW_FALL_DURATION: 5000,  // Make faster (5s instead of 7s)
    // Adjust other timings
  },
  
  TILE_GENERATION: {
    SMALL_VALUES_COUNT: 3,     // Only generate 2, 4, 8 (harder)
    // Or increase to 7 for easier gameplay
  },
};
```

### **Scoring Adjustments**
```javascript
export const GAME_CONFIG = {
  SCORING: {
    COMBO_BONUS_MULTIPLIER: 2.0,  // Double bonus for chains
    LARGE_MERGE_BONUS: 3.0,       // Triple bonus for big merges
  },
};
```

### **Board Size Modifications**
```javascript
// In GameRules.js
export const GAME_CONFIG = {
  BOARD: {
    ROWS: 8,    // Taller board
    COLS: 6,    // Wider board
    // Note: Also update constants.js for UI adjustments
  },
};
```

---

## 🚀 Performance Optimizations

### **React Optimizations**
- Uses `useState` with function initializers for expensive calculations
- Implements proper dependency arrays in `useEffect`
- Utilizes `useRef` for DOM references and timers
- Employs immutable state updates

### **Animation Optimizations**
- Uses `useNativeDriver: false` only when necessary
- Implements animation cleanup to prevent memory leaks
- Batches multiple animations with `Animated.parallel()`

### **Memory Management**
- Cleans up timers on component unmount
- Removes event listeners properly
- Uses efficient board copying with spread operators

---

## 🎯 Strategy Tips for Players

### **Beginner Strategies**
1. **Keep larger numbers toward edges** - Prevents blocking the center
2. **Plan ahead** - Think about where tiles will land after gravity
3. **Use fast drops strategically** - Position tiles for optimal merging
4. **Watch for chain reactions** - Set up cascading merges

### **Advanced Strategies**
1. **Corner building** - Build large numbers in corners for stability
2. **Column management** - Keep at least one column relatively empty
3. **Merge timing** - Wait for optimal moments to create large merges
4. **Chain setup** - Deliberately create setups for massive chain reactions

### **Expert Techniques**
1. **Probability management** - Understand tile generation patterns
2. **Board state analysis** - Recognize dangerous vs. safe board states
3. **Risk/reward calculation** - When to play safe vs. aggressive
4. **Endgame planning** - Strategies for when the board fills up

---

## 📈 Game Analytics & Statistics

The game now tracks comprehensive statistics:
- **Tiles Placed**: Total number of tiles dropped
- **Merges Performed**: Total successful merges
- **Chain Reactions**: Number of cascading merge sequences
- **Highest Tile**: Largest tile value achieved
- **Game Duration**: Time played in current session
- **Difficulty Level**: Dynamic difficulty based on board state

---

## 🔧 Troubleshooting

### **Common Issues**
1. **Tiles not merging**: Check that tiles are truly adjacent and identical
2. **Animation lag**: Reduce animation complexity or duration
3. **Touch not responding**: Ensure proper event handler registration
4. **Game state corruption**: Implement board validation checks

### **Debug Mode**
Enable debug logging by modifying GameRules.js:
```javascript
const DEBUG_MODE = true;

if (DEBUG_MODE) {
  console.log('Debug info:', gameState);
}
```

---

**🎉 Enjoy playing and developing the 1024 Drop Game!**

*This documentation covers the complete game system. For specific implementation details, refer to the individual component files and their inline documentation.* 