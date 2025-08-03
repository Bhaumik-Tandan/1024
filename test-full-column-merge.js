#!/usr/bin/env node

/**
 * Test Full Column Merge Logic
 * Verifies that immediate merges work when dropping on matching bottom tiles
 */

console.log('🧪 Testing Full Column Merge Logic\n');

// Mock the game constants
const ROWS = 6;
const COLS = 4;

// Mock the canMergeInFullColumn function
function canMergeInFullColumn(board, col, value) {
  console.log('🔍 canMergeInFullColumn called:', { col, value, bottomTile: board[ROWS - 1][col] });
  
  // Check if the bottom tile in the column matches the dropping tile
  const bottomRow = ROWS - 1;
  if (board[bottomRow][col] === value) {
    console.log('✅ Direct merge possible with bottom tile');
    return { canMerge: true, mergeRow: bottomRow };
  }
  
  // Check if any adjacent tiles to the bottom can merge
  const adjacentPositions = [
    { row: bottomRow - 1, col }, // up from bottom
    { row: bottomRow, col: col - 1 }, // left of bottom
    { row: bottomRow, col: col + 1 }  // right of bottom
  ];
  
  for (const pos of adjacentPositions) {
    if (pos.row >= 0 && pos.row < ROWS && 
        pos.col >= 0 && pos.col < COLS && 
        board[pos.row][pos.col] === value) {
      console.log('✅ Adjacent merge possible at:', pos);
      return { canMerge: true, mergeRow: bottomRow };
    }
  }
  
  console.log('❌ No merge possible in full column');
  return null;
}

// Test scenarios
const testScenarios = [
  {
    name: 'Direct Bottom Merge',
    description: 'Dropping 2 on a column with 2 at bottom',
    board: [
      [4, 0, 0, 0],
      [2, 0, 0, 0],
      [8, 0, 0, 0],
      [16, 0, 0, 0],
      [32, 0, 0, 0],
      [2, 0, 0, 0]  // Bottom tile is 2
    ],
    dropValue: 2,
    column: 0,
    expected: { canMerge: true, mergeRow: 5 }
  },
  {
    name: 'No Merge Possible',
    description: 'Dropping 2 on a column with 4 at bottom',
    board: [
      [4, 0, 0, 0],
      [2, 0, 0, 0],
      [8, 0, 0, 0],
      [16, 0, 0, 0],
      [32, 0, 0, 0],
      [4, 0, 0, 0]  // Bottom tile is 4
    ],
    dropValue: 2,
    column: 0,
    expected: null
  },
  {
    name: 'Adjacent Merge',
    description: 'Dropping 2 with adjacent 2 tile',
    board: [
      [4, 0, 0, 0],
      [2, 0, 0, 0],
      [8, 0, 0, 0],
      [16, 0, 0, 0],
      [32, 0, 0, 0],
      [8, 2, 0, 0]  // Bottom row has 8, adjacent 2
    ],
    dropValue: 2,
    column: 0,
    expected: { canMerge: true, mergeRow: 5 }
  }
];

console.log('📋 Running Test Scenarios:');
console.log('==========================\n');

testScenarios.forEach((scenario, index) => {
  console.log(`${index + 1}. ${scenario.name}`);
  console.log(`   Description: ${scenario.description}`);
  console.log(`   Drop Value: ${scenario.dropValue}`);
  console.log(`   Column: ${scenario.column}`);
  console.log(`   Expected: ${JSON.stringify(scenario.expected)}`);
  
  const result = canMergeInFullColumn(scenario.board, scenario.column, scenario.dropValue);
  
  if (JSON.stringify(result) === JSON.stringify(scenario.expected)) {
    console.log('   ✅ PASSED');
  } else {
    console.log('   ❌ FAILED');
    console.log(`   Got: ${JSON.stringify(result)}`);
  }
  console.log('');
});

console.log('🎯 Key Points to Check:');
console.log('=======================\n');

console.log('1. **Column Full Detection**:');
console.log('   - Check if landingRow === -1 triggers full column logic');
console.log('   - Verify canMergeInFullColumn is called');

console.log('\n2. **Bottom Tile Matching**:');
console.log('   - Verify board[ROWS-1][column] === value comparison');
console.log('   - Check that immediate merge logic is executed');

console.log('\n3. **Handler Selection**:');
console.log('   - Confirm handleFullColumnTileLanded is called');
console.log('   - Verify processFullColumnDrop is executed');

console.log('\n4. **Debug Output**:');
console.log('   - Look for "🎯 processFullColumnDrop called" messages');
console.log('   - Check for "✅ Direct merge with bottom tile" messages');
console.log('   - Verify "✅ Immediate merge completed" appears');

console.log('\n🔍 To Debug the Issue:');
console.log('======================\n');

console.log('1. Run the game and try dropping a tile on a matching bottom tile');
console.log('2. Check console logs for the debug messages above');
console.log('3. Look for any error messages or unexpected behavior');
console.log('4. Verify that the column is actually full when you try to drop');

console.log('\n💡 Common Issues:');
console.log('=================\n');

console.log('1. **Column not actually full**: Check if there are empty spaces');
console.log('2. **Value mismatch**: Verify the dropping tile value matches bottom tile');
console.log('3. **Handler not called**: Check if canMergeInFull is properly set');
console.log('4. **Animation timing**: Verify the landing handler is called after animation');

console.log('\n🎵 Test Complete - Check the game console for debug output!'); 