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
   * Get the board setup for a specific tutorial step
   */
  getStepSetup(step) {
    switch (step) {
      case 1:
        return {
          step: 1,
          boardSetup: this.getStep1Board(),
          shooterValue: 2,
          allowedLaneIndex: 2, // Center lane
          stepText: "Tap to Shoot!",
          successText: "Very Nice!\nTry another one"
        };
        
      case 2:
        return {
          step: 2,
          boardSetup: this.getStep2Board(),
          shooterValue: 2,
          allowedLaneIndex: 3, // Rightmost lane
          stepText: "Let's Make a Combo!",
          successText: "Sweet Combo!"
        };
        
      case 3:
        return {
          step: 3,
          boardSetup: this.getStep3Board(),
          shooterValue: 2,
          allowedLaneIndex: 2, // Center lane
          stepText: "Big Merge Time!",
          successText: "Amazing!"
        };
        
      default:
        throw new Error(`Invalid tutorial step: ${step}`);
    }
  }
  
  /**
   * Step 1: Simple merge - "2" + "2" = "4"
   * Layout: Center lane has a "2" at target height, shooter is "2"
   */
  getStep1Board() {
    const board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
    
    // Place a "2" in the center lane (index 2) at row 1 (second row from top)
    board[1][2] = 2;
    
    return board;
  }
  
  /**
   * Step 2: Combo setup - "2" + "2" = "4", then "4" + "4" = "8"
   * Layout: [8, 4, 2, (empty)] from left to right
   */
  getStep2Board() {
    const board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
    
    // Left lane: "8" at top
    board[0][0] = 8;
    
    // Second lane: "4" at top
    board[0][1] = 4;
    
    // Center lane: "2" at top
    board[0][2] = 2;
    
    // Right lane: empty (will be filled by the shot)
    
    return board;
  }
  
  /**
   * Step 3: Big merge - "8" + "8" = "16"
   * Layout: Place another "8" so previous "8" can merge
   */
  getStep3Board() {
    const board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
    
    // Left lane: "8" at top
    board[0][0] = 8;
    
    // Second lane: "8" at top (for merging)
    board[0][1] = 8;
    
    // Center lane: "4" at top
    board[0][2] = 4;
    
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
        return { score: 12, newBlocks: [4, 8] }; // 2 + 2 = 4, then 4 + 4 = 8
        
      case 3:
        return { score: 16, newBlocks: [16] }; // 8 + 8 = 16
        
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
