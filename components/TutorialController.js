import { ROWS, COLS } from './constants';

export class TutorialController {
  constructor() {
    if (TutorialController.instance) {
      return TutorialController.instance;
    }
    TutorialController.instance = this;
  }
  
  static getInstance() {
    if (!TutorialController.instance) {
      TutorialController.instance = new TutorialController();
    }
    return TutorialController.instance;
  }
  
  /**
   * Get the center lane index based on current grid configuration
   */
  getCenterLane() {
    return Math.floor(COLS / 2); // Dynamic center lane calculation
  }
  
  /**
   * Get the board setup for a specific tutorial step
   */
  getStepSetup(step) {
    const centerLane = this.getCenterLane();
    
    switch (step) {
      case 1:
        return {
          step: 1,
          boardSetup: this.getStep1Board(),
          shooterValue: 2,
          allowedLaneIndex: centerLane, // Dynamic center lane
          stepText: "Tap to Shoot!",
          successText: "Very Nice!\nTry another one"
        };
        
      case 2:
        return {
          step: 2,
          boardSetup: this.getStep2Board(),
          shooterValue: 2,
          allowedLaneIndex: centerLane, // Dynamic center lane
          stepText: "Drop here!",
          successText: "Very Nice!\nTry another one"
        };
        
      case 3:
        return {
          step: 3,
          boardSetup: this.getStep3Board(),
          shooterValue: 2,
          allowedLaneIndex: centerLane, // Dynamic center lane
          stepText: "Drop here!",
          successText: "Amazing!"
        };
        
      default:
        throw new Error(`Invalid tutorial step: ${step}`);
    }
  }
  
  /**
   * Get the board setup for a specific tutorial step
   */
  getStepBoard(step) {
    switch (step) {
      case 1:
        return this.getStep1Board();
      case 2:
        return this.getStep2Board();
      case 3:
        return this.getStep3Board();
      default:
        return this.getStep1Board();
    }
  }

  /**
   * Step 1: Simple merge - "2" + "2" = "4"
   * Layout: Center lane has a "2" at topmost row, shooter is "2"
   */
  getStep1Board() {
    const board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
    
    // Place a "2" in the center lane (index 2) at row 0 (topmost row)
    board[0][2] = 2;
    
    return board;
  }
  
  /**
   * Step 2: Combo setup - "2" + "2" = "4", then "4" + "4" = "8"
   * Layout: Center lane has "4" on top, "2" below (stacked tiles)
   */
  getStep2Board() {
    const board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
    
    // Center lane only: "4" on top, "2" below
    board[0][2] = 4; // Top tile (row 0)
    board[1][2] = 2; // Bottom tile (row 1)
    
    return board;
  }
  
  /**
   * Step 3: Chain Merge - "2" + "2" = "4", then "4" + "4" = "8", then "8" + "8" = "16"
   * Layout: Lane 0: "8", Lane 1: "4" on "8", Lane 2: "2", Lane 3: empty
   */
  getStep3Board() {
    const board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
    
    // Lane 0: "8" at top
    board[0][0] = 8;
    
    // Lane 1: "4" on top of "8" (stacked)
    board[0][1] = 4; // Top tile
    board[1][1] = 8; // Bottom tile
    
    // Lane 2: "2" at top (center lane - where user drops)
    board[0][2] = 2;
    
    // Lane 3: Empty (rightmost lane)
    
    return board;
  }
  
  /**
   * Check if a move is valid for the current tutorial step
   */
  isValidMove(step, laneIndex) {
    const stepSetup = this.getStepSetup(step);
    return laneIndex === stepSetup.allowedLaneIndex;
  }
  
  /**
   * Get the expected result after a successful tutorial move
   */
  getExpectedResult(step) {
    switch (step) {
      case 1:
        return { score: 4, newBlocks: [4] }; // 2 + 2 = 4
        
      case 2:
        return { score: 12, newBlocks: [4, 8] }; // 2 + 2 = 4, then 4 + 4 = 8 (chain merge)
        
      case 3:
        return { score: 16, newBlocks: [16] }; // Chain merge: 2+2=4, 4+4=8, 8+8=16
        
      default:
        return { score: 0, newBlocks: [] };
    }
  }
  
  /**
   * Validate that the game state matches the expected tutorial state
   */
  validateGameState(step, currentBoard, currentScore) {
    const expected = this.getExpectedResult(step);
    
    // Check if score matches expected
    if (currentScore < expected.score) {
      return false;
    }
    
    // Check if expected blocks are present on the board
    const boardValues = currentBoard.flat().filter(val => val > 0);
    const hasExpectedBlocks = expected.newBlocks.every(expectedVal => 
      boardValues.includes(expectedVal)
    );
    
    return hasExpectedBlocks;
  }
}
